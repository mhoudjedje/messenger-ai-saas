import {
  getOrCreateConversation,
  createMessage,
  getAgentConfigByPageId,
  getSubscriptionByUserId,
  getMessengerPageByPageId,
} from './db';
import { generateAIResponse, type Language } from './openai-helper';
import { sendMessengerMessage, detectLanguage } from './messenger';

/**
 * Moteur d'automatisation principal
 * Traite les messages Messenger et génère des réponses automatiques
 */

export interface MessengerWebhookPayload {
  sender: {
    id: string; // PSID (Page-scoped User ID)
  };
  recipient: {
    id: string; // Page ID
  };
  timestamp: number;
  message: {
    mid: string; // Message ID
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url?: string;
      };
    }>;
  };
}

/**
 * Traite un message Messenger entrant
 */
export async function processIncomingMessage(payload: MessengerWebhookPayload): Promise<void> {
  const { sender, recipient, message, timestamp } = payload;
  const psid = sender.id;
  const pageId = recipient.id;
  const messageText = message.text || '';
  const messageId = message.mid;

  console.log(`[Automation] Processing message from ${psid} on page ${pageId}`);

  try {
    // 1. Obtenir la configuration de l'agent
    const agentConfig = await getAgentConfigByPageId(pageId);
    if (!agentConfig) {
      console.warn(`[Automation] No agent config found for page ${pageId}`);
      return;
    }

    // 2. Vérifier que l'agent est activé
    if (!agentConfig.isEnabled) {
      console.log(`[Automation] Agent is disabled for page ${pageId}`);
      return;
    }

    // 3. Vérifier l'abonnement de l'utilisateur
    const subscription = await getSubscriptionByUserId(agentConfig.userId);
      if (!subscription || subscription.status !== 'active') {
      console.warn(`[Automation] Subscription not active for user ${agentConfig.userId}`);
      // Envoyer un message informant l'utilisateur que l'abonnement est expiré
      const page = await getMessengerPageByPageId(pageId);
      if (page) {
        await sendMessengerMessage(pageId, psid, { text: 'Votre abonnement a expiré. Veuillez renouveler votre abonnement pour continuer.' }, page.pageAccessToken);
      }
      return;
    }

    // 4. Vérifier la limite de messages
    if (subscription.messagesUsed >= subscription.messagesLimit) {
      console.warn(`[Automation] Message limit reached for user ${agentConfig.userId}`);
      const page = await getMessengerPageByPageId(pageId);
      if (page) {
        await sendMessengerMessage(pageId, psid, { text: 'Vous avez atteint votre limite de messages. Veuillez upgrade votre plan.' }, page.pageAccessToken);
      }
      return;
    }

    // 5. Détecter la langue du message
    const detectedLanguage = await detectLanguage(messageText);
    console.log(`[Automation] Detected language: ${detectedLanguage}`);

    // 6. Obtenir ou créer la conversation
    const conversation = await getOrCreateConversation(agentConfig.userId, pageId, psid);

    // 7. Stocker le message entrant
    const startTime = Date.now();
    await createMessage({
      conversationId: conversation.id,
      userId: agentConfig.userId,
      pageId,
      psid,
      messageId,
      senderType: 'user',
      content: messageText,
      contentType: 'text',
      language: detectedLanguage,
    });

    // 8. Générer la réponse IA
    console.log(`[Automation] Generating AI response...`);
    const aiResponseData = await generateAIResponse({
      userMessage: messageText,
      language: detectedLanguage as Language,
      conversationHistory: [], // TODO: Charger l'historique complet
      systemPrompt: agentConfig.systemPrompt || undefined,
      maxTokens: agentConfig.maxTokens,
      temperature: parseFloat(String(agentConfig.temperature)),
    });

    const aiResponse = aiResponseData.response;
    const responseTime = Date.now() - startTime;
    console.log(`[Automation] AI response generated in ${responseTime}ms`);

    // 9. Stocker la réponse IA
    await createMessage({
      conversationId: conversation.id,
      userId: agentConfig.userId,
      pageId,
      psid,
      messageId: `${messageId}-response`,
      senderType: 'agent',
      content: aiResponse,
      contentType: 'text',
      language: agentConfig.responseLanguage,
      responseTime,
    });

    // 10. Envoyer la réponse via Messenger
    console.log(`[Automation] Sending response to Messenger...`);
    const page = await getMessengerPageByPageId(pageId);
    if (page) {
      await sendMessengerMessage(pageId, psid, { text: aiResponse }, page.pageAccessToken);
    }

    // 11. Mettre à jour les statistiques de la conversation
    // TODO: Implémenter updateConversationStats

    // 12. Mettre à jour le compteur de messages utilisé
    if (subscription) {
      const newMessagesUsed = (subscription.messagesUsed || 0) + 1;
      // TODO: Mettre à jour dans la base de données
      console.log(`[Automation] Messages used: ${newMessagesUsed}/${subscription.messagesLimit}`);
    }

    console.log(`[Automation] Message processed successfully`);
  } catch (error) {
    console.error(`[Automation] Error processing message:`, error);

    try {
      // Envoyer un message d'erreur à l'utilisateur
      const page = await getMessengerPageByPageId(pageId);
      if (page) {
        await sendMessengerMessage(pageId, psid, { text: 'Une erreur est survenue lors du traitement de votre message. Veuillez réessayer.' }, page.pageAccessToken);
      }
    } catch (sendError) {
      console.error(`[Automation] Error sending error message:`, sendError);
    }
    }
  }

/**
 * Traite les événements de lecture de message
 */
export async function processMessageRead(payload: {
  sender: { id: string };
  recipient: { id: string };
  read_by: number;
  watermark: number;
}): Promise<void> {
  console.log(`[Automation] Message read event from ${payload.sender.id}`);
  // TODO: Implémenter la logique de lecture
}

/**
 * Traite les événements de typing
 */
export async function processTypingEvent(payload: {
  sender: { id: string };
  recipient: { id: string };
  typing_on: boolean;
}): Promise<void> {
  console.log(`[Automation] Typing event from ${payload.sender.id}`);
  // TODO: Implémenter la logique de typing
}
