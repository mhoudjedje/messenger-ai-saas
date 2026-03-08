/**
 * Chargily Pay Routes
 * Handles payment checkout and webhooks for Algeria
 */

import { Express, Request, Response } from 'express';
import {
  createChargilyCheckout,
  verifyChargilyWebhookSignature,
  calculateChargilyAmount,
  CHARGILY_PLANS,
  ChargilyCheckoutRequest,
} from './chargily-pay';
import { getDb } from './db';
import { payments, users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Register Chargily payment routes
 */
export function registerChargilyRoutes(app: Express) {
  // POST /api/payments/chargily/checkout - Create a checkout session
  app.post('/api/payments/chargily/checkout', async (req: Request, res: Response) => {
    try {
      const { planType, planDuration, origin } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Validate plan
      const planKey = `${planType}_${planDuration}` as keyof typeof CHARGILY_PLANS;
      const plan = CHARGILY_PLANS[planKey];

      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      // Get user info
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database error' });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = user[0];

      // Create Chargily checkout
      const checkoutRequest: ChargilyCheckoutRequest = {
        amount: calculateChargilyAmount(plan.amount),
        currency: plan.currency,
        description: `${plan.name} - Aiteam Premium Subscription`,
        clientEmail: userData.email || '',
        clientName: userData.name || 'Customer',
        clientPhone: userData.phone || '',
        successUrl: `${origin}/dashboard?payment=success&provider=chargily`,
        failureUrl: `${origin}/dashboard?payment=failed&provider=chargily`,
        webhookUrl: `${origin}/api/payments/chargily/webhook`,
        metadata: {
          userId,
          planType,
          planDuration,
          provider: 'chargily',
        },
      };

      const checkout = await createChargilyCheckout(checkoutRequest);

      console.log(`[Chargily] Checkout created for user ${userId}: ${checkout.id}`);

      res.json({
        checkoutId: checkout.id,
        checkoutUrl: checkout.checkoutUrl,
      });
    } catch (error) {
      console.error('[Chargily] Error creating checkout:', error);
      res.status(500).json({ error: 'Failed to create checkout' });
    }
  });

  // POST /api/payments/chargily/webhook - Handle Chargily webhooks
  app.post('/api/payments/chargily/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-chargily-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!verifyChargilyWebhookSignature(payload, signature)) {
        console.warn('[Chargily] Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const event = req.body;

      console.log(`[Chargily] Webhook received: ${event.type}`);

      // Handle payment success
      if (event.type === 'invoice.paid' || event.type === 'checkout.completed') {
        const { id, amount, currency, metadata } = event.data;
        const { userId, planType, planDuration } = metadata;

        if (!userId) {
          console.warn('[Chargily] Webhook missing userId in metadata');
          return res.status(400).json({ error: 'Missing userId' });
        }

        const db = await getDb();
        if (!db) {
          console.error('[Chargily] Database not available');
          return res.status(500).json({ error: 'Database error' });
        }

        // Calculate subscription expiration date
        const now = new Date();
        let expiresAt = new Date(now);
        if (planDuration === 'monthly') {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (planDuration === 'yearly') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // Update user subscription status
        await db
          .update(users)
          .set({
            subscriptionStatus: planType as 'pro' | 'enterprise',
            subscriptionPlan: planDuration as 'monthly' | 'yearly',
            subscriptionExpiresAt: expiresAt,
            paymentProvider: 'chargily',
            paymentCustomerId: id,
          })
          .where(eq(users.id, userId));

        // Record payment
        await db.insert(payments).values({
          userId,
          provider: 'chargily',
          providerPaymentId: id,
          amount: (amount / 100).toString() as any, // Convert from cents
          currency: currency || 'DZD',
          status: 'completed',
          planType: planType as 'pro' | 'enterprise',
          planDuration: planDuration as 'monthly' | 'yearly',
          metadata: event.data,
        });

        console.log(`[Chargily] Payment completed for user ${userId}: ${id}`);
        console.log(`[Chargily] Subscription activated: ${planType} (${planDuration})`);
      }

      // Handle payment failure
      if (event.type === 'invoice.failed' || event.type === 'checkout.failed') {
        const { id, metadata } = event.data;
        const { userId } = metadata;

        if (!userId) {
          console.warn('[Chargily] Webhook missing userId in metadata');
          return res.status(400).json({ error: 'Missing userId' });
        }

        const db = await getDb();
        if (!db) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Record failed payment
        await db.insert(payments).values({
          userId,
          provider: 'chargily',
          providerPaymentId: id,
          amount: (event.data.amount / 100).toString() as any,
          currency: event.data.currency || 'DZD',
          status: 'failed',
          planType: metadata.planType as 'pro' | 'enterprise',
          planDuration: metadata.planDuration as 'monthly' | 'yearly',
          metadata: event.data,
        });

        console.log(`[Chargily] Payment failed for user ${userId}: ${id}`);
      }

      // Always return 200 to acknowledge webhook receipt
      res.json({ received: true });
    } catch (error) {
      console.error('[Chargily] Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });
}
