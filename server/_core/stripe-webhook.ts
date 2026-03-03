import { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import {
  getSubscriptionByStripeCustomerId,
  createOrUpdateSubscription,
  getDb,
} from '../db';
import { getPlanFromPriceId, getMessagesLimitForPlan } from '../stripe-products';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Enregistre les routes des webhooks Stripe
 */
export function registerStripeWebhookRoutes(app: Express) {
  if (!stripe) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not configured, webhooks disabled');
    return;
  }

  // POST /api/stripe/webhook - Réception des événements Stripe
  app.post('/api/stripe/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.warn('[Stripe Webhook] Missing signature or webhook secret');
      res.sendStatus(401);
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe!.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('[Stripe Webhook] Signature verification failed:', error);
      res.sendStatus(401);
      return;
    }

    // Détecter les événements de test
    if (event.id.startsWith('evt_test_')) {
      console.log('[Stripe Webhook] Test event detected, returning verification response');
      return res.json({ verified: true });
    }

    // Retourner 200 OK immédiatement
    res.status(200).send('EVENT_RECEIVED');

    // Traiter l'événement de manière asynchrone
    try {
      await handleStripeEvent(event);
    } catch (error) {
      console.error('[Stripe Webhook] Error processing event:', error);
    }
  });
}

/**
 * Traite les événements Stripe
 */
async function handleStripeEvent(event: Stripe.Event) {
  console.log(`[Stripe Webhook] Processing event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}

/**
 * Traite checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe Webhook] Checkout session completed:', session.id);

  const customerId = session.customer as string;
  const userId = session.metadata?.user_id;

  if (!customerId || !userId) {
    console.error('[Stripe Webhook] Missing customer ID or user ID in session metadata');
    return;
  }

  // Obtenir ou créer l'abonnement
  const subscription = await getSubscriptionByStripeCustomerId(customerId);

  if (!subscription) {
    // Créer un nouvel abonnement
    await createOrUpdateSubscription({
      userId: parseInt(userId),
      stripeCustomerId: customerId,
      planType: 'pro',
      status: 'active',
    });
  }
}

/**
 * Traite customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription created:', subscription.id);

  const customerId = subscription.customer as string;
  const priceId = (subscription.items.data[0]?.price.id) as string;
  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    console.warn('[Stripe Webhook] Unknown price ID:', priceId);
    return;
  }

  const existingSubscription = await getSubscriptionByStripeCustomerId(customerId);

  if (existingSubscription) {
    // Mettre à jour l'abonnement existant
    await createOrUpdateSubscription({
      userId: existingSubscription.userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planType: plan as any,
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : undefined,
      trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : undefined,
      messagesLimit: getMessagesLimitForPlan(plan),
    });
  }
}

/**
 * Traite customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;
  const priceId = (subscription.items.data[0]?.price.id) as string;
  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    console.warn('[Stripe Webhook] Unknown price ID:', priceId);
    return;
  }

  const existingSubscription = await getSubscriptionByStripeCustomerId(customerId);

  if (existingSubscription) {
    await createOrUpdateSubscription({
      userId: existingSubscription.userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planType: plan as any,
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : undefined,
      trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : undefined,
      messagesLimit: getMessagesLimitForPlan(plan),
    });
  }
}

/**
 * Traite customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;
  const existingSubscription = await getSubscriptionByStripeCustomerId(customerId);

  if (existingSubscription) {
    await createOrUpdateSubscription({
      userId: existingSubscription.userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: 'canceled',
      canceledAt: new Date(),
    });
  }
}

/**
 * Traite invoice.paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice paid:', invoice.id);

  const customerId = invoice.customer as string;
  const subscription = await getSubscriptionByStripeCustomerId(customerId);

  if (subscription) {
    // Réinitialiser le compteur de messages au début de la nouvelle période
    await createOrUpdateSubscription({
      userId: subscription.userId,
      stripeCustomerId: customerId,
      messagesUsed: 0,
    });
  }
}

/**
 * Traite invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;
  const subscription = await getSubscriptionByStripeCustomerId(customerId);

  if (subscription) {
    await createOrUpdateSubscription({
      userId: subscription.userId,
      stripeCustomerId: customerId,
      status: 'past_due',
    });
  }
}
