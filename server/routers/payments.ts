/**
 * Payment tRPC Router
 * Handles payment checkout and subscription management
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { payments, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const paymentsRouter = router({
  /**
   * Get current user's subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const userData = user[0];

    return {
      status: userData.subscriptionStatus,
      plan: userData.subscriptionPlan,
      expiresAt: userData.subscriptionExpiresAt,
      provider: userData.paymentProvider,
    };
  }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, ctx.user.id));

    return userPayments.map(p => ({
      id: p.id,
      provider: p.provider,
      amount: parseFloat(p.amount as any),
      currency: p.currency,
      status: p.status,
      planType: p.planType,
      planDuration: p.planDuration,
      createdAt: p.createdAt,
    }));
  }),

  /**
   * Create Chargily checkout session
   */
  createChargilyCheckout: protectedProcedure
    .input(
      z.object({
        planType: z.enum(['pro', 'enterprise']),
        planDuration: z.enum(['monthly', 'yearly']),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // The actual checkout creation is handled by the Express route
      // This procedure just validates the request and returns the origin
      return {
        origin: input.origin,
        planType: input.planType,
        planDuration: input.planDuration,
      };
    }),

  /**
   * Create Stripe checkout session
   */
  createStripeCheckout: protectedProcedure
    .input(
      z.object({
        planType: z.enum(['pro', 'enterprise']),
        planDuration: z.enum(['monthly', 'yearly']),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // The actual checkout creation is handled by the Express route
      // This procedure just validates the request and returns the origin
      return {
        origin: input.origin,
        planType: input.planType,
        planDuration: input.planDuration,
      };
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Update user subscription status to free
    await db
      .update(users)
      .set({
        subscriptionStatus: 'free',
        subscriptionPlan: null,
        subscriptionExpiresAt: null,
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (user.length === 0) {
      return false;
    }

    const userData = user[0];
    const now = new Date();

    // Check if subscription is active and not expired
    if (
      userData.subscriptionStatus !== 'free' &&
      userData.subscriptionExpiresAt &&
      userData.subscriptionExpiresAt > now
    ) {
      return true;
    }

    return false;
  }),
});
