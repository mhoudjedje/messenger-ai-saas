import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processIncomingMessage, type MessengerWebhookPayload } from './automation-engine';
import * as db from './db';
import * as messenger from './messenger';
import * as openaiHelper from './openai-helper';

// Mock les modules
vi.mock('./db');
vi.mock('./messenger');
vi.mock('./openai-helper');

describe('Automation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processIncomingMessage', () => {
    const mockPayload: MessengerWebhookPayload = {
      sender: { id: '123456789' },
      recipient: { id: 'page_123' },
      timestamp: Date.now(),
      message: {
        mid: 'msg_123',
        text: 'Bonjour, comment ça va?',
      },
    };

    it('should process a message successfully', async () => {
      // Mock les fonctions de base de données
      const mockAgentConfig = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        isEnabled: true,
        systemPrompt: 'Tu es un assistant utile',
        responseLanguage: 'fr',
        maxTokens: 150,
        temperature: 0.7,
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        status: 'active',
        messagesUsed: 10,
        messagesLimit: 1000,
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        psid: '123456789',
      };

      const mockPage = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        pageAccessToken: 'token_123',
      };

      // Mock les appels aux fonctions
      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.getOrCreateConversation).mockResolvedValue(mockConversation as any);
      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(messenger.detectLanguage).mockResolvedValue('fr');
      vi.mocked(openaiHelper.generateAIResponse).mockResolvedValue({
        response: 'Bonjour! Je vais bien, merci de demander.',
        tokensUsed: 25,
        language: 'fr',
      });
      vi.mocked(db.createMessage).mockResolvedValue(undefined);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        recipient_id: '123456789',
        message_id: 'msg_456',
      });

      // Exécuter la fonction
      await processIncomingMessage(mockPayload);

      // Vérifier que les fonctions ont été appelées
      expect(db.getAgentConfigByPageId).toHaveBeenCalledWith('page_123');
      expect(db.getSubscriptionByUserId).toHaveBeenCalledWith(1);
      expect(messenger.detectLanguage).toHaveBeenCalledWith('Bonjour, comment ça va?');
      expect(db.getOrCreateConversation).toHaveBeenCalledWith(1, 'page_123', '123456789');
      expect(db.createMessage).toHaveBeenCalledTimes(2); // Message entrant + réponse
      expect(messenger.sendMessengerMessage).toHaveBeenCalledWith(
        'page_123',
        '123456789',
        { text: 'Bonjour! Je vais bien, merci de demander.' },
        'token_123'
      );
    });

    it('should not process if agent is disabled', async () => {
      const mockAgentConfig = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        isEnabled: false, // Agent désactivé
      };

      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);

      await processIncomingMessage(mockPayload);

      // Vérifier que les autres fonctions n'ont pas été appelées
      expect(db.getSubscriptionByUserId).not.toHaveBeenCalled();
      expect(messenger.sendMessengerMessage).not.toHaveBeenCalled();
    });

    it('should not process if subscription is inactive', async () => {
      const mockAgentConfig = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        isEnabled: true,
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        status: 'inactive', // Abonnement inactif
        messagesUsed: 10,
        messagesLimit: 1000,
      };

      const mockPage = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        pageAccessToken: 'token_123',
      };

      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        recipient_id: '123456789',
        message_id: 'msg_456',
      });

      await processIncomingMessage(mockPayload);

      // Vérifier que le message d'erreur a été envoyé
      expect(messenger.sendMessengerMessage).toHaveBeenCalledWith(
        'page_123',
        '123456789',
        { text: 'Votre abonnement a expiré. Veuillez renouveler votre abonnement pour continuer.' },
        'token_123'
      );
      // Vérifier que la réponse IA n'a pas été générée
      expect(openaiHelper.generateAIResponse).not.toHaveBeenCalled();
    });

    it('should not process if message limit is reached', async () => {
      const mockAgentConfig = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        isEnabled: true,
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        status: 'active',
        messagesUsed: 1000, // Limite atteinte
        messagesLimit: 1000,
      };

      const mockPage = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        pageAccessToken: 'token_123',
      };

      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        recipient_id: '123456789',
        message_id: 'msg_456',
      });

      await processIncomingMessage(mockPayload);

      // Vérifier que le message d'erreur a été envoyé
      expect(messenger.sendMessengerMessage).toHaveBeenCalledWith(
        'page_123',
        '123456789',
        { text: 'Vous avez atteint votre limite de messages. Veuillez upgrade votre plan.' },
        'token_123'
      );
    });

    it('should detect language correctly', async () => {
      const mockAgentConfig = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        isEnabled: true,
        systemPrompt: 'Tu es un assistant utile',
        responseLanguage: 'ar',
        maxTokens: 150,
        temperature: 0.7,
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        status: 'active',
        messagesUsed: 10,
        messagesLimit: 1000,
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        psid: '123456789',
      };

      const mockPage = {
        id: 1,
        userId: 1,
        pageId: 'page_123',
        pageAccessToken: 'token_123',
      };

      const arabicPayload: MessengerWebhookPayload = {
        ...mockPayload,
        message: {
          mid: 'msg_123',
          text: 'السلام عليكم ورحمة الله',
        },
      };

      vi.mocked(db.getAgentConfigByPageId).mockResolvedValue(mockAgentConfig as any);
      vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.getOrCreateConversation).mockResolvedValue(mockConversation as any);
      vi.mocked(db.getMessengerPageByPageId).mockResolvedValue(mockPage as any);
      vi.mocked(messenger.detectLanguage).mockResolvedValue('ar'); // Détecte l'Arabe
      vi.mocked(openaiHelper.generateAIResponse).mockResolvedValue({
        response: 'وعليكم السلام ورحمة الله وبركاته',
        tokensUsed: 20,
        language: 'ar',
      });
      vi.mocked(db.createMessage).mockResolvedValue(undefined);
      vi.mocked(messenger.sendMessengerMessage).mockResolvedValue({
        recipient_id: '123456789',
        message_id: 'msg_456',
      });

      await processIncomingMessage(arabicPayload);

      // Vérifier que la langue Arabe a été détectée
      expect(messenger.detectLanguage).toHaveBeenCalledWith('السلام عليكم ورحمة الله');
      expect(openaiHelper.generateAIResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'ar',
        })
      );
    });
  });
});
