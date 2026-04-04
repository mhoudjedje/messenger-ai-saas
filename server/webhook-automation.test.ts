import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import { createContext } from './_core/context';
import * as db from './db';
import * as messenger from './messenger';
import * as openai from './openai-helper';

// Mock the database and external services
vi.mock('./db');
vi.mock('./messenger');
vi.mock('./openai-helper');

describe('Messenger Webhook - AI Response Automation', () => {
  const mockPageId = 'page-123';
  const mockUserId = 1;
  const mockPsid = 'user-456';
  const mockConversationId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Automation Pipeline', () => {
    it('should receive message, generate AI response, and send back', async () => {
      // Setup mocks
      const mockPage = {
        id: 1,
        userId: mockUserId,
        pageId: mockPageId,
        pageAccessToken: 'token-123',
        pageName: 'Test Page',
      };

      const mockConversation = {
        id: mockConversationId,
        userId: mockUserId,
        pageId: mockPageId,
        psid: mockPsid,
      };

      const mockAgentConfig = {
        id: 1,
        pageId: mockPageId,
        personality: 'You are a helpful customer service agent',
        responseLanguage: 'en' as const,
        systemPrompt: 'Be concise and helpful',
      };

      // Mock database calls
      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(db.isUserSubscriptionActive).mockResolvedValue(true);
      vi.mocked(db.hasExceededMessageLimit).mockResolvedValue(false);
      vi.mocked(db.getOrCreateConversation).mockResolvedValue(mockConversation as any);
      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.createMessage).mockResolvedValue({ id: 1 } as any);
      vi.mocked(db.incrementMessageCount).mockResolvedValue(undefined);

      // Mock messenger functions
      vi.mocked(messenger.extractMessageContent).mockReturnValue({
        text: 'Hello, how can you help me?',
        type: 'text',
      });
      vi.mocked(messenger.detectLanguage).mockReturnValue('en');
      vi.mocked(messenger.sendTypingIndicator).mockResolvedValue(undefined);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        message_id: 'msg-789',
      } as any);

      // Mock OpenAI response
      vi.mocked(openai.generatePersonalizedResponse).mockResolvedValue(
        'Thank you for reaching out! I am here to help you with any questions you may have.'
      );
      vi.mocked(openai.cleanAIResponse).mockReturnValue(
        'Thank you for reaching out! I am here to help you with any questions you may have.'
      );
      vi.mocked(openai.formatForMessenger).mockReturnValue([
        'Thank you for reaching out! I am here to help you with any questions you may have.',
      ]);

      // Create webhook event
      const webhookEvent = {
        object: 'page',
        entry: [
          {
            id: mockPageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: mockPsid },
                recipient: { id: mockPageId },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-456',
                  text: 'Hello, how can you help me?',
                },
              },
            ],
          },
        ],
      };

      // Call webhook procedure
      const caller = appRouter.createCaller(await createContext({} as any));
      const result = await caller.messenger.webhook(webhookEvent as any);

      // Verify the result
      expect(result).toEqual({ success: true });

      // Verify database calls
      expect(db.getMessengerPageByPageId).toHaveBeenCalledWith(mockPageId);
      expect(db.isUserSubscriptionActive).toHaveBeenCalledWith(mockUserId);
      expect(db.hasExceededMessageLimit).toHaveBeenCalledWith(mockUserId);
      expect(db.getOrCreateConversation).toHaveBeenCalledWith(mockUserId, mockPageId, mockPsid);

      // Verify message extraction
      expect(messenger.extractMessageContent).toHaveBeenCalled();
      expect(messenger.detectLanguage).toHaveBeenCalledWith('Hello, how can you help me?');

      // Verify typing indicator
      expect(messenger.sendTypingIndicator).toHaveBeenCalledWith(mockPageId, mockPsid, 'token-123');

      // Verify AI response generation
      expect(openai.generatePersonalizedResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Hello, how can you help me?',
          language: 'en',
          agentPersonality: 'You are a helpful customer service agent',
          customSystemPrompt: 'Be concise and helpful',
        })
      );

      // Verify response formatting
      expect(openai.cleanAIResponse).toHaveBeenCalled();
      expect(openai.formatForMessenger).toHaveBeenCalled();

      // Verify response sending
      expect(messenger.sendMessengerMessage).toHaveBeenCalledWith(
        mockPageId,
        mockPsid,
        { text: expect.any(String) },
        'token-123'
      );

      // Verify conversation history storage
      expect(db.createMessage).toHaveBeenCalledTimes(2); // User message + Agent response
      expect(db.incrementMessageCount).toHaveBeenCalledWith(mockUserId);
    });

    it('should skip processing if subscription is inactive', async () => {
      const mockPage = {
        id: 1,
        userId: mockUserId,
        pageId: mockPageId,
        pageAccessToken: 'token-123',
      };

      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(db.isUserSubscriptionActive).mockResolvedValue(false);

      const webhookEvent = {
        object: 'page',
        entry: [
          {
            id: mockPageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: mockPsid },
                recipient: { id: mockPageId },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-456',
                  text: 'Hello',
                },
              },
            ],
          },
        ],
      };

      const caller = appRouter.createCaller(await createContext({} as any));
      const result = await caller.messenger.webhook(webhookEvent as any);

      expect(result).toEqual({ success: true });
      expect(messenger.sendMessengerMessage).not.toHaveBeenCalled();
      expect(openai.generatePersonalizedResponse).not.toHaveBeenCalled();
    });

    it('should handle message limit exceeded', async () => {
      const mockPage = {
        id: 1,
        userId: mockUserId,
        pageId: mockPageId,
        pageAccessToken: 'token-123',
      };

      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(db.isUserSubscriptionActive).mockResolvedValue(true);
      vi.mocked(db.hasExceededMessageLimit).mockResolvedValue(true);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        message_id: 'msg-789',
      } as any);

      const webhookEvent = {
        object: 'page',
        entry: [
          {
            id: mockPageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: mockPsid },
                recipient: { id: mockPageId },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-456',
                  text: 'Hello',
                },
              },
            ],
          },
        ],
      };

      const caller = appRouter.createCaller(await createContext({} as any));
      const result = await caller.messenger.webhook(webhookEvent as any);

      expect(result).toEqual({ success: true });
      // Should send limit exceeded message
      expect(messenger.sendMessengerMessage).toHaveBeenCalledWith(
        mockPageId,
        mockPsid,
        expect.objectContaining({
          text: expect.stringContaining('limite'),
        }),
        'token-123'
      );
      // Should NOT call OpenAI
      expect(openai.generatePersonalizedResponse).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockPage = {
        id: 1,
        userId: mockUserId,
        pageId: mockPageId,
        pageAccessToken: 'token-123',
      };

      const mockConversation = {
        id: mockConversationId,
        userId: mockUserId,
        pageId: mockPageId,
        psid: mockPsid,
      };

      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(db.isUserSubscriptionActive).mockResolvedValue(true);
      vi.mocked(db.hasExceededMessageLimit).mockResolvedValue(false);
      vi.mocked(db.getOrCreateConversation).mockResolvedValue(mockConversation as any);
      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(null);
      vi.mocked(messenger.extractMessageContent).mockReturnValue({
        text: 'Hello',
        type: 'text',
      });
      vi.mocked(messenger.detectLanguage).mockReturnValue('en');
      vi.mocked(messenger.sendTypingIndicator).mockResolvedValue(undefined);

      // OpenAI throws error
      vi.mocked(openai.generatePersonalizedResponse).mockRejectedValue(
        new Error('OpenAI API error')
      );
      vi.mocked(db.createMessage).mockResolvedValue({ id: 1 } as any);

      const webhookEvent = {
        object: 'page',
        entry: [
          {
            id: mockPageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: mockPsid },
                recipient: { id: mockPageId },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-456',
                  text: 'Hello',
                },
              },
            ],
          },
        ],
      };

      const caller = appRouter.createCaller(await createContext({} as any));
      const result = await caller.messenger.webhook(webhookEvent as any);

      // Should still return success (webhook should not fail)
      expect(result).toEqual({ success: true });
      // Should save error message to database
      expect(db.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          senderType: 'agent',
          content: expect.stringContaining('erreur'),
        })
      );
    });

    it('should support multilingual responses', async () => {
      const mockPage = {
        id: 1,
        userId: mockUserId,
        pageId: mockPageId,
        pageAccessToken: 'token-123',
      };

      const mockConversation = {
        id: mockConversationId,
        userId: mockUserId,
        pageId: mockPageId,
        psid: mockPsid,
      };

      const mockAgentConfig = {
        id: 1,
        pageId: mockPageId,
        personality: 'You are a helpful assistant',
        responseLanguage: 'ar' as const, // Arabic
      };

      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(db.isUserSubscriptionActive).mockResolvedValue(true);
      vi.mocked(db.hasExceededMessageLimit).mockResolvedValue(false);
      vi.mocked(db.getOrCreateConversation).mockResolvedValue(mockConversation as any);
      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.createMessage).mockResolvedValue({ id: 1 } as any);
      vi.mocked(db.incrementMessageCount).mockResolvedValue(undefined);

      vi.mocked(messenger.extractMessageContent).mockReturnValue({
        text: 'مرحبا',
        type: 'text',
      });
      vi.mocked(messenger.detectLanguage).mockReturnValue('ar');
      vi.mocked(messenger.sendTypingIndicator).mockResolvedValue(undefined);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        message_id: 'msg-789',
      } as any);

      vi.mocked(openai.generatePersonalizedResponse).mockResolvedValue('مرحبا بك');
      vi.mocked(openai.cleanAIResponse).mockReturnValue('مرحبا بك');
      vi.mocked(openai.formatForMessenger).mockReturnValue(['مرحبا بك']);

      const webhookEvent = {
        object: 'page',
        entry: [
          {
            id: mockPageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: mockPsid },
                recipient: { id: mockPageId },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-456',
                  text: 'مرحبا',
                },
              },
            ],
          },
        ],
      };

      const caller = appRouter.createCaller(await createContext({} as any));
      const result = await caller.messenger.webhook(webhookEvent as any);

      expect(result).toEqual({ success: true });
      // Verify Arabic response language was used
      expect(openai.generatePersonalizedResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'ar',
        })
      );
    });
  });
});
