import { invokeLLM } from './_core/llm';

export type Language = 'ar' | 'fr' | 'en';

/**
 * Prompts système multilingues pour l'agent IA
 */
const SYSTEM_PROMPTS: Record<Language, string> = {
  ar: `أنت مساعد ذكي ومفيد. تتحدث باللغة العربية الجزائرية (الدارجة) بشكل طبيعي وودود.
- كن مختصراً وواضحاً في ردودك
- استخدم اللغة العربية الجزائرية المحكية
- كن محترماً وودياً
- إذا لم تعرف الإجابة، قل "ما نعرفش" بدل أن تخترع إجابة`,
  
  fr: `Vous êtes un assistant intelligent et utile. Vous parlez en français de manière naturelle et amicale.
- Soyez concis et clair dans vos réponses
- Utilisez un ton professionnel mais accessible
- Soyez respectueux et courtois
- Si vous ne connaissez pas la réponse, dites-le plutôt que d'inventer`,
  
  en: `You are a helpful and intelligent assistant. You speak in English in a natural and friendly manner.
- Be concise and clear in your responses
- Use a professional but accessible tone
- Be respectful and courteous
- If you don't know the answer, say so rather than making something up`,
};

/**
 * Interface pour les paramètres de génération de réponse
 */
export interface GenerateResponseParams {
  userMessage: string;
  language: Language;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Génère une réponse IA multilingue
 */
export async function generateAIResponse(params: GenerateResponseParams): Promise<{
  response: string;
  tokensUsed: number;
  language: Language;
}> {
  const {
    userMessage,
    language,
    conversationHistory = [],
    systemPrompt,
    maxTokens = 500,
    temperature = 0.7,
  } = params;

  try {
    // Construire l'historique des messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt || SYSTEM_PROMPTS[language],
      },
    ];

    // Ajouter l'historique de conversation
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Appeler l'API OpenAI
    const response = await invokeLLM({
      messages: messages as any,
    });

    const content = response.choices?.[0]?.message?.content;
    const responseText = typeof content === 'string' ? content : '';
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      response: responseText,
      tokensUsed,
      language,
    };
  } catch (error) {
    console.error('[OpenAI] Failed to generate response:', error);
    throw error;
  }
}

/**
 * Génère une réponse avec contexte personnalisé
 */
export async function generatePersonalizedResponse(params: {
  userMessage: string;
  language: Language;
  agentPersonality?: string;
  customSystemPrompt?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const {
    userMessage,
    language,
    agentPersonality,
    customSystemPrompt,
    conversationHistory,
    maxTokens,
    temperature,
  } = params;

  let systemPrompt = customSystemPrompt || SYSTEM_PROMPTS[language];

  // Ajouter la personnalité de l'agent si fournie
  if (agentPersonality) {
    systemPrompt += `\n\nCaractéristiques de l'agent:\n${agentPersonality}`;
  }

  const result = await generateAIResponse({
    userMessage,
    language,
    conversationHistory,
    systemPrompt,
    maxTokens,
    temperature,
  });

  return result.response;
}

/**
 * Valide et nettoie la réponse IA
 */
export function cleanAIResponse(response: string, maxLength = 2000): string {
  // Supprimer les espaces inutiles
  let cleaned = response.trim();

  // Limiter la longueur
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim() + '...';
  }

  // Supprimer les caractères de contrôle
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned;
}

/**
 * Détecte si la réponse contient du contenu inapproprié (simple check)
 */
export function hasInappropriateContent(response: string): boolean {
  // Cette fonction est un placeholder - en production, utiliser une API de modération
  const inappropriatePatterns = [
    /violence|harm|kill|hurt/i,
    /hate|racist|discrimination/i,
    /illegal|crime|criminal/i,
  ];

  return inappropriatePatterns.some(pattern => pattern.test(response));
}

/**
 * Formatte la réponse pour Messenger (limite de 2000 caractères)
 */
export function formatForMessenger(response: string): string[] {
  const maxLength = 2000;
  const messages: string[] = [];

  if (response.length <= maxLength) {
    return [response];
  }

  // Diviser en messages plus petits
  let currentMessage = '';
  const sentences = response.split(/([.!?])/);

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] + (sentences[i + 1] || '');

    if ((currentMessage + sentence).length > maxLength) {
      if (currentMessage) {
        messages.push(currentMessage.trim());
      }
      currentMessage = sentence;
    } else {
      currentMessage += sentence;
    }
  }

  if (currentMessage) {
    messages.push(currentMessage.trim());
  }

  return messages;
}
