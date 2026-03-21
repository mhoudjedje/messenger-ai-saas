import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getAgentConfigByPageId,
  createOrUpdateAgentConfig,
  getUserPreferences,
  createOrUpdateUserPreferences,
} from '../db';
import { generatePersonalizedResponse, Language } from '../openai-helper';

export const agentRouter = router({
  // Obtenir la configuration de l'agent pour une page
  getConfig: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ input }) => {
      return await getAgentConfigByPageId(input.pageId);
    }),

  // Sauvegarder ou mettre à jour la configuration de l'agent
  saveConfig: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        agentName: z.string().optional(),
        personality: z.string().optional(),
        systemPrompt: z.string().optional(),
        responseLanguage: z.enum(['ar', 'fr', 'en']).optional(),
        maxTokens: z.number().min(100).max(2000).optional(),
        temperature: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createOrUpdateAgentConfig({
        userId: ctx.user!.id,
        pageId: input.pageId,
        agentName: input.agentName,
        personality: input.personality,
        systemPrompt: input.systemPrompt,
        responseLanguage: input.responseLanguage,
        maxTokens: input.maxTokens,
        temperature: input.temperature ? String(input.temperature) : undefined,
      });

      return { success: true };
    }),

  // Obtenir les préférences utilisateur
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPreferences(ctx.user!.id);
  }),

  // Sauvegarder les préférences utilisateur
  savePreferences: protectedProcedure
    .input(
      z.object({
        preferredLanguage: z.enum(['ar', 'fr', 'en']).optional(),
        timezone: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        notificationEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createOrUpdateUserPreferences({
        userId: ctx.user!.id,
        preferredLanguage: input.preferredLanguage || 'ar',
        timezone: input.timezone || 'Africa/Algiers',
        emailNotifications: input.emailNotifications,
        notificationEmail: input.notificationEmail,
      });

      return { success: true };
    }),

  // Test agent message response
  testMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        systemPrompt: z.string().optional(),
        personality: z.string().optional(),
        language: z.enum(['ar', 'fr', 'en']).optional(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await generatePersonalizedResponse({
          userMessage: input.message,
          language: (input.language as Language) || 'ar',
          agentPersonality: input.personality,
          customSystemPrompt: input.systemPrompt,
          maxTokens: input.maxTokens || 500,
          temperature: input.temperature || 0.7,
        });

        return {
          success: true,
          response: response,
        };
      } catch (error) {
        console.error('[Agent Test] Error:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to generate response'
        );
      }
    }),
});
