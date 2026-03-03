import crypto from 'crypto';
import axios from 'axios';

const MESSENGER_API_VERSION = 'v25.0';
const MESSENGER_GRAPH_API = 'https://graph.facebook.com';

/**
 * Valide la signature SHA256 d'un webhook Messenger
 */
export function validateMessengerSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', appSecret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}

/**
 * Interface pour les événements Messenger
 */
export interface MessengerEvent {
  object: string;
  entry: Array<{
    id: string; // PAGE_ID
    time: number;
    messaging: Array<{
      sender: { id: string }; // PSID
      recipient: { id: string }; // PAGE_ID
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: string;
          payload: {
            url?: string;
            coordinates?: { lat: number; long: number };
          };
        }>;
      };
      delivery?: {
        mids: string[];
        watermark: number;
      };
      read?: {
        watermark: number;
      };
      postback?: {
        title: string;
        payload: string;
      };
    }>;
  }>;
}

/**
 * Envoie un message via l'API Messenger
 */
export async function sendMessengerMessage(
  pageId: string,
  psid: string,
  message: {
    text?: string;
    attachment?: {
      type: 'image' | 'video' | 'file' | 'audio';
      payload: {
        url: string;
      };
    };
  },
  pageAccessToken: string
): Promise<{ recipient_id: string; message_id: string }> {
  try {
    const response = await axios.post(
      `${MESSENGER_GRAPH_API}/${MESSENGER_API_VERSION}/${pageId}/messages`,
      {
        recipient: { id: psid },
        messaging_type: 'RESPONSE',
        message,
      },
      {
        params: {
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Messenger] Failed to send message:', error);
    throw error;
  }
}

/**
 * Affiche l'indicateur de typing
 */
export async function sendTypingIndicator(
  pageId: string,
  psid: string,
  pageAccessToken: string
): Promise<void> {
  try {
    await axios.post(
      `${MESSENGER_GRAPH_API}/${MESSENGER_API_VERSION}/${pageId}/messages`,
      {
        recipient: { id: psid },
        sender_action: 'typing_on',
      },
      {
        params: {
          access_token: pageAccessToken,
        },
      }
    );
  } catch (error) {
    console.error('[Messenger] Failed to send typing indicator:', error);
    // Non-critical, don't throw
  }
}

/**
 * Obtient les informations du profil utilisateur
 */
export async function getUserProfile(
  psid: string,
  pageAccessToken: string
): Promise<{ first_name: string; last_name: string; profile_pic: string }> {
  try {
    const response = await axios.get(
      `${MESSENGER_GRAPH_API}/${MESSENGER_API_VERSION}/${psid}`,
      {
        params: {
          fields: 'first_name,last_name,profile_pic',
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Messenger] Failed to get user profile:', error);
    throw error;
  }
}

/**
 * Détecte la langue du message
 */
export function detectLanguage(text: string): string {
  // Simple language detection based on character ranges
  // Arabic: U+0600 to U+06FF
  const arabicRegex = /[\u0600-\u06FF]/g;
  const arabicMatches = text.match(arabicRegex);
  
  if (arabicMatches && arabicMatches.length / text.length > 0.3) {
    return 'ar';
  }
  
  // French: Common French words
  const frenchWords = ['le', 'la', 'de', 'et', 'un', 'une', 'les', 'des', 'qui', 'que', 'est', 'sont'];
  const words = text.toLowerCase().split(/\s+/);
  const frenchCount = words.filter(w => frenchWords.includes(w)).length;
  
  if (frenchCount / words.length > 0.2) {
    return 'fr';
  }
  
  // Default to English
  return 'en';
}

/**
 * Extrait le contenu textuel du message
 */
export function extractMessageContent(messagingEvent: MessengerEvent['entry'][0]['messaging'][0]): {
  text: string;
  type: 'text' | 'attachment' | 'postback';
  attachmentType?: string;
  attachmentUrl?: string;
} | null {
  if (messagingEvent.message?.text) {
    return {
      text: messagingEvent.message.text,
      type: 'text',
    };
  }

  if (messagingEvent.message?.attachments) {
    const attachment = messagingEvent.message.attachments[0];
    return {
      text: `[${attachment.type.toUpperCase()}]`,
      type: 'attachment',
      attachmentType: attachment.type,
      attachmentUrl: attachment.payload.url,
    };
  }

  if (messagingEvent.postback?.payload) {
    return {
      text: messagingEvent.postback.title || messagingEvent.postback.payload,
      type: 'postback',
    };
  }

  return null;
}
