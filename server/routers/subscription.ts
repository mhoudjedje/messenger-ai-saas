import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getSubscriptionByUserId,
  createOrUpdateSubscription,
} from '../db';
import Stripe from 'stripe';
import { STRIPE_PRODUCTS } from '../stripe-products';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const subscriptionRouter = router({
  // Obtenir l'abonnement actuel de l'utilisateur
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscriptionByUserId(ctx.user!.id);
  }),

  // Créer une session de checkout Stripe
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planType: z.enum(['pro', 'enterprise']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      const user = ctx.user!;
      const plan = STRIPE_PRODUCTS[input.planType.toUpperCase() as keyof typeof STRIPE_PRODUCTS];

      if (!plan) {
        throw new Error('Invalid plan type');
      }

      try {
        // Créer une session de checkout
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: user.email || undefined,
          client_reference_id: user.id.toString(),
          metadata: {
            user_id: user.id.toString(),
            customer_email: user.email || '',
            customer_name: user.name || '',
          },
          line_items: [
            {
              price: plan.priceId,
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin || 'http://localhost:3000'}/dashboard?checkout=success`,
          cancel_url: `${ctx.req.headers.origin || 'http://localhost:3000'}/dashboard?checkout=canceled`,
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('[Subscription] Error creating checkout session:', error);
        throw error;
      }
    }),

  // Obtenir le portail de gestion des abonnements
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const subscription = await getSubscriptionByUserId(ctx.user!.id);

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No active subscription found');
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${ctx.req.headers.origin || 'http://localhost:3000'}/dashboard`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('[Subscription] Error creating portal session:', error);
      throw error;
    }
  }),

  // Annuler l'abonnement
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const subscription = await getSubscriptionByUserId(ctx.user!.id);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      await createOrUpdateSubscription({
        userId: ctx.user!.id,
        stripeCustomerId: subscription.stripeCustomerId,
        status: 'canceled',
        canceledAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('[Subscription] Error canceling subscription:', error);
      throw error;
    }
  }),
});
