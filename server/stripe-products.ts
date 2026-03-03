/**
 * Configuration des produits et plans Stripe
 * Ces IDs doivent être créés dans le Stripe Dashboard
 */

export const STRIPE_PRODUCTS = {
  FREE: {
    name: 'Free Plan',
    description: 'Plan gratuit avec 1000 messages/mois',
    messagesLimit: 1000,
    priceId: process.env.STRIPE_PRICE_FREE || 'price_free',
  },
  PRO: {
    name: 'Pro Plan',
    description: 'Plan professionnel avec 10,000 messages/mois',
    messagesLimit: 10000,
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    monthlyPrice: 2999, // $29.99 in cents
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    description: 'Plan entreprise avec messages illimités',
    messagesLimit: 999999,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    monthlyPrice: 9999, // $99.99 in cents
  },
};

export type PlanType = keyof typeof STRIPE_PRODUCTS;

export function getPlanFromPriceId(priceId: string): PlanType | null {
  for (const [plan, config] of Object.entries(STRIPE_PRODUCTS)) {
    if (config.priceId === priceId) {
      return plan as PlanType;
    }
  }
  return null;
}

export function getMessagesLimitForPlan(plan: PlanType): number {
  return STRIPE_PRODUCTS[plan].messagesLimit;
}
