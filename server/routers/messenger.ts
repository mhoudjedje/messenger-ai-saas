import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import {
  getMessengerPagesByUserId,
  getMessengerPageByPageId,
  createMessengerPage,
  getAgentConfigByPageId,
  createOrUpdateAgentConfig,
  getOrCreateConversation,
  createMessage,
  getConversationsByUserId,
  getMessagesByConversationId,
  isUserSubscriptionActive,
  hasExceededMessageLimit,
  incrementMessageCount,
} from '../db';
import { TRPCError } from '@trpc/server';
import {
  sendMessengerMessage,
  sendTypingIndicator,
  extractMessageContent,
  detectLanguage,
  MessengerEvent,
} from '../messenger';
import {
  generatePersonalizedResponse,
  cleanAIResponse,
  formatForMessenger,
  Language,
} from '../openai-helper';
import {
  validateFacebookToken,
  getAccessiblePages,
} from '../facebook-token-helper';

export const messengerRouter = router({
  // Obtenir les pages Messenger connectées de l'utilisateur
  getPages: protectedProcedure.query(async ({ ctx }) => {
    return await getMessengerPagesByUserId(ctx.user.id);
  }),

  // Connecter une nouvelle page Messenger
  connectPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        pageName: z.string().optional(),
        pageAccessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createMessengerPage({
        userId: ctx.user.id,
        pageId: input.pageId,
        pageName: input.pageName,
        pageAccessToken: input.pageAccessToken,
      });

      return { success: true };
    }),

  // Connecter une page via token manuel
  connectPageWithToken: protectedProcedure
    .input(
      z.object({
        pageAccessToken: z.string().min(1, 'Token is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(`[connectPageWithToken] Starting for user ${ctx.user.id}`);
      
      // Valider le token
      const validation = await validateFacebookToken(input.pageAccessToken);
      console.log(`[connectPageWithToken] Token validation result:`, validation);
      
      if (!validation.isValid) {
        console.error(`[connectPageWithToken] Invalid token: ${validation.error}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validation.error || 'Invalid token',
        });
      }

      if (!validation.pageInfo) {
        console.error(`[connectPageWithToken] No page info returned`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not retrieve page information',
        });
      }

      console.log(`[connectPageWithToken] Page info:`, validation.pageInfo);

      // Vérifier si la page est déjà connectée
      const existing = await getMessengerPageByPageId(validation.pageInfo.id);
      if (existing) {
        console.error(`[connectPageWithToken] Page already connected`);
        throw new Error('This page is already connected to another account');
      }

      // Créer la page
      console.log(`[connectPageWithToken] Creating page in database...`);
      try {
        await createMessengerPage({
          userId: ctx.user.id,
          pageId: validation.pageInfo.id,
          pageName: validation.pageInfo.name,
          pageAccessToken: input.pageAccessToken,
        });
        console.log(`[connectPageWithToken] Page created, verifying...`);
        
        // Verify immediately that the page was inserted
        const verifyInsert = await getMessengerPageByPageId(validation.pageInfo.id);
        if (!verifyInsert) {
          console.error(`[connectPageWithToken] CRITICAL: Page insert verification failed! Page not found after insert.`);
          throw new Error('Page was not saved to database. Please try again.');
        }
        
        console.log(`[connectPageWithToken] Page verified in database:`, verifyInsert.pageId);
        
        // Create default agent config for the page
        console.log(`[connectPageWithToken] Creating default agent config...`);
        await createOrUpdateAgentConfig({
          userId: ctx.user.id,
          pageId: validation.pageInfo.id,
          agentName: `AI Agent - ${validation.pageInfo.name}`,
          personality: 'You are a helpful and friendly AI assistant. Respond politely and concisely.',
          responseLanguage: 'ar',
          maxTokens: 500,
        });
        console.log(`[connectPageWithToken] Default agent config created successfully`);
      } catch (error) {
        console.error(`[connectPageWithToken] Error creating page:`, error);
        throw error;
      }

      return {
        success: true,
        pageInfo: validation.pageInfo,
      };
    }),

  // Récupérer les pages accessibles avec un token
  getAccessiblePagesWithToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().min(1, 'Token is required'),
      })
    )
    .query(async ({ input }) => {
      const pages = await getAccessiblePages(input.accessToken);
      return pages;
    }),

  // Obtenir les conversations de l'utilisateur
  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getConversationsByUserId(ctx.user.id, input.limit, input.offset);
    }),

  // Obtenir les messages d'une conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Vérifier que la conversation appartient à l'utilisateur
      const messages = await getMessagesByConversationId(input.conversationId, input.limit);
      
      // Vérifier l'accès
      if (messages.length > 0 && messages[0].userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      return messages;
    }),

  // Webhook pour recevoir les messages Messenger (public)
  webhook: publicProcedure
    .input(
      z.object({
        object: z.string(),
        entry: z.array(
          z.object({
            id: z.string(),
            time: z.number(),
            messaging: z.array(
              z.object({
                sender: z.object({ id: z.string() }),
                recipient: z.object({ id: z.string() }),
                timestamp: z.number(),
                message: z.object({
                  mid: z.string(),
                  text: z.string().optional(),
                  attachments: z.array(z.any()).optional(),
                }).optional(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const event = input as MessengerEvent;
      console.log('[Webhook Procedure] Starting webhook processing');
      console.log('[Webhook Procedure] Event entries:', event.entry.length);

      for (const entry of event.entry) {
        const pageId = entry.id;
        console.log('[Webhook Procedure] Processing entry for page:', pageId);

        // Obtenir la page Messenger
        const page = await getMessengerPageByPageId(pageId);
        if (!page) {
          console.warn(`[Webhook Procedure] Page not found: ${pageId}`);
          continue;
        }
        console.log('[Webhook Procedure] Page found:', page.pageName);

        // Traiter chaque message
        for (const messagingEvent of entry.messaging) {
          if (!messagingEvent.message) continue;

          const psid = messagingEvent.sender.id;

          try {
            // Vérifier le statut d'abonnement
            const isActive = await isUserSubscriptionActive(page.userId);
            if (!isActive) {
              console.warn(`[Webhook] User subscription not active: ${page.userId}`);
              continue;
            }

            // Vérifier le limite de messages
            const exceeded = await hasExceededMessageLimit(page.userId);
            if (exceeded) {
              await sendMessengerMessage(
                pageId,
                psid,
                { text: 'Vous avez atteint votre limite de messages mensuels. Veuillez upgrader votre abonnement.' },
                page.pageAccessToken || ''
              );
              continue;
            }

            // Extraire le contenu du message
            const messageContent = extractMessageContent(messagingEvent);
            if (!messageContent) continue;

            // Détecter la langue
            const language = detectLanguage(messageContent.text) as Language;

            // Créer ou obtenir la conversation
            const conversation = await getOrCreateConversation(page.userId, pageId, psid);

            // Sauvegarder le message utilisateur
            await createMessage({
              conversationId: conversation.id,
              userId: page.userId,
              pageId,
              psid,
              messageId: messagingEvent.message.mid,
              senderType: 'user',
              content: messageContent.text,
              contentType: messageContent.type,
              mediaUrl: messageContent.attachmentUrl,
              language,
            });

            // Afficher l'indicateur de typing
            await sendTypingIndicator(pageId, psid, page.pageAccessToken || '');

            // Obtenir la configuration de l'agent
            const agentConfig = await getAgentConfigByPageId(pageId);

            // Générer la réponse IA
            const startTime = Date.now();
            const aiResponse = await generatePersonalizedResponse({
              userMessage: messageContent.text,
              language: (agentConfig?.responseLanguage as Language) || language,
              agentPersonality: agentConfig?.personality || undefined,
              customSystemPrompt: agentConfig?.systemPrompt || undefined,
              maxTokens: agentConfig?.maxTokens || undefined,
            });
            const responseTime = Date.now() - startTime;

            // Nettoyer et formater la réponse
            const cleanedResponse = cleanAIResponse(aiResponse);
            const formattedMessages = formatForMessenger(cleanedResponse);

            // Envoyer la réponse
            for (const msg of formattedMessages) {
              const sendResult = await sendMessengerMessage(
                pageId,
                psid,
                { text: msg },
                page.pageAccessToken
              );

              // Sauvegarder la réponse
              await createMessage({
                conversationId: conversation.id,
                userId: page.userId,
                pageId,
                psid,
                messageId: sendResult.message_id,
                senderType: 'agent',
                content: msg,
                contentType: 'text',
                language: agentConfig?.responseLanguage as Language || language,
                responseTime: responseTime / formattedMessages.length,
              });
            }

            // Incrémenter le compteur de messages
            await incrementMessageCount(page.userId);
          } catch (error) {
            console.error(`[Webhook] Error processing message from ${psid}:`, error);

            // Sauvegarder le message d'erreur
            try {
              const conversation = await getOrCreateConversation(page.userId, pageId, psid);
              await createMessage({
                conversationId: conversation.id,
                userId: page.userId,
                pageId,
                psid,
                messageId: `error-${Date.now()}`,
                senderType: 'agent',
                content: 'Une erreur s\'est produite. Veuillez réessayer.',
                contentType: 'text',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
              });
            } catch (dbError) {
              console.error('[Webhook] Failed to save error message:', dbError);
            }
          }
        }
      }

      return { success: true };
    }),
});
