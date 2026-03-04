import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { messengerPages } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { generateOAuthLoginUrl } from '../meta-oauth';
import { nanoid } from 'nanoid';

export const oauthRouter = router({
  // Obtenir l'URL de connexion OAuth
  getLoginUrl: protectedProcedure.query(async ({ ctx }) => {
    try {
      const state = nanoid();
      const loginUrl = generateOAuthLoginUrl(state);

      return {
        success: true,
        url: loginUrl,
        state,
      };
    } catch (error) {
      console.error('[OAuth tRPC] Error generating login URL:', error);
      throw new Error('Failed to generate OAuth login URL');
    }
  }),

  // Lister les pages Messenger connectées
  getConnectedPages: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const pages = await db
        .select()
        .from(messengerPages)
        .where(eq(messengerPages.userId, ctx.user.id));

      return {
        success: true,
        pages: pages.map(page => ({
          id: page.id,
          pageId: page.pageId,
          pageName: page.pageName,
          isActive: page.isActive,
          connectedAt: page.connectedAt,
          updatedAt: page.updatedAt,
        })),
      };
    } catch (error) {
      console.error('[OAuth tRPC] Error fetching connected pages:', error);
      throw new Error('Failed to fetch connected pages');
    }
  }),

  // Obtenir les détails d'une page
  getPageDetails: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        const page = await db
          .select()
          .from(messengerPages)
          .where(
            and(
              eq(messengerPages.pageId, input.pageId),
              eq(messengerPages.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (page.length === 0) {
          throw new Error('Page not found');
        }

        return {
          success: true,
          page: {
            id: page[0].id,
            pageId: page[0].pageId,
            pageName: page[0].pageName,
            isActive: page[0].isActive,
            connectedAt: page[0].connectedAt,
            updatedAt: page[0].updatedAt,
          },
        };
      } catch (error) {
        console.error('[OAuth tRPC] Error fetching page details:', error);
        throw new Error('Failed to fetch page details');
      }
    }),

  // Déconnecter une page
  disconnectPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Vérifier que la page appartient à l'utilisateur
        const page = await db
          .select()
          .from(messengerPages)
          .where(
            and(
              eq(messengerPages.pageId, input.pageId),
              eq(messengerPages.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (page.length === 0) {
          throw new Error('Page not found or unauthorized');
        }

        // Marquer la page comme inactive
        await db
          .update(messengerPages)
          .set({ isActive: false })
          .where(eq(messengerPages.pageId, input.pageId));

        console.log(`[OAuth tRPC] Disconnected page ${input.pageId} for user ${ctx.user.id}`);

        return {
          success: true,
          message: 'Page disconnected successfully',
        };
      } catch (error) {
        console.error('[OAuth tRPC] Error disconnecting page:', error);
        throw new Error('Failed to disconnect page');
      }
    }),

  // Réactiver une page
  reconnectPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Vérifier que la page appartient à l'utilisateur
        const page = await db
          .select()
          .from(messengerPages)
          .where(
            and(
              eq(messengerPages.pageId, input.pageId),
              eq(messengerPages.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (page.length === 0) {
          throw new Error('Page not found or unauthorized');
        }

        // Marquer la page comme active
        await db
          .update(messengerPages)
          .set({ isActive: true })
          .where(eq(messengerPages.pageId, input.pageId));

        console.log(`[OAuth tRPC] Reconnected page ${input.pageId} for user ${ctx.user.id}`);

        return {
          success: true,
          message: 'Page reconnected successfully',
        };
      } catch (error) {
        console.error('[OAuth tRPC] Error reconnecting page:', error);
        throw new Error('Failed to reconnect page');
      }
    }),

  // Obtenir le statut du flux OAuth
  getOAuthStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const pages = await db
        .select()
        .from(messengerPages)
        .where(eq(messengerPages.userId, ctx.user.id));

      const activePages = pages.filter(p => p.isActive).length;
      const totalPages = pages.length;

      return {
        success: true,
        hasConnectedPages: totalPages > 0,
        activePages,
        totalPages,
        pages: pages.map(p => ({
          pageId: p.pageId,
          pageName: p.pageName,
          isActive: p.isActive,
        })),
      };
    } catch (error) {
      console.error('[OAuth tRPC] Error getting OAuth status:', error);
      throw new Error('Failed to get OAuth status');
    }
  }),
});
