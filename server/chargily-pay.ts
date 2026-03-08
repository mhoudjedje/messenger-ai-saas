/**
 * Chargily Pay Integration
 * Payment gateway for Algeria (Edahabia/CIB)
 * https://chargily.com
 */

import axios from 'axios';

const CHARGILY_API_URL = 'https://api.chargily.com/test'; // Test mode
const CHARGILY_PUBLIC_KEY = process.env.CHARGILY_PUBLIC_KEY || '';
const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || '';

export interface ChargilyCheckoutRequest {
  amount: number; // Amount in cents (e.g., 50000 for 500 DZD)
  currency: string; // DZD for Algeria
  description: string;
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  successUrl: string;
  failureUrl: string;
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface ChargilyCheckoutResponse {
  id: string;
  checkoutUrl: string;
  status: string;
}

export interface ChargilyWebhookPayload {
  id: string;
  type: string; // 'invoice.paid', 'invoice.failed', etc.
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    client_email: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Create a Chargily checkout session
 */
export async function createChargilyCheckout(
  request: ChargilyCheckoutRequest
): Promise<ChargilyCheckoutResponse> {
  try {
    const response = await axios.post(
      `${CHARGILY_API_URL}/checkouts`,
      {
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        client_email: request.clientEmail,
        client_name: request.clientName,
        client_phone: request.clientPhone,
        success_url: request.successUrl,
        failure_url: request.failureUrl,
        webhook_url: request.webhookUrl,
        metadata: request.metadata,
      },
      {
        headers: {
          'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      checkoutUrl: response.data.checkout_url,
      status: response.data.status,
    };
  } catch (error) {
    console.error('[Chargily] Error creating checkout:', error);
    throw new Error('Failed to create Chargily checkout');
  }
}

/**
 * Verify Chargily webhook signature
 */
export function verifyChargilyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    // Chargily uses HMAC-SHA256 for signature verification
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', CHARGILY_SECRET_KEY)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('[Chargily] Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Get checkout details from Chargily
 */
export async function getChargilyCheckout(checkoutId: string) {
  try {
    const response = await axios.get(
      `${CHARGILY_API_URL}/checkouts/${checkoutId}`,
      {
        headers: {
          'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      clientEmail: response.data.client_email,
      metadata: response.data.metadata,
    };
  } catch (error) {
    console.error('[Chargily] Error getting checkout:', error);
    throw new Error('Failed to get Chargily checkout');
  }
}

/**
 * Calculate amount in cents for Chargily
 * Chargily expects amounts in cents (e.g., 50000 for 500 DZD)
 */
export function calculateChargilyAmount(amountInDZD: number): number {
  return Math.round(amountInDZD * 100);
}

/**
 * Plan pricing in DZD
 */
export const CHARGILY_PLANS = {
  pro_monthly: {
    name: 'Pro - Monthly',
    amount: 2999, // 2999 DZD per month
    currency: 'DZD',
    duration: 'monthly',
  },
  pro_yearly: {
    name: 'Pro - Yearly',
    amount: 29999, // 29999 DZD per year
    currency: 'DZD',
    duration: 'yearly',
  },
  enterprise_monthly: {
    name: 'Enterprise - Monthly',
    amount: 9999, // 9999 DZD per month
    currency: 'DZD',
    duration: 'monthly',
  },
  enterprise_yearly: {
    name: 'Enterprise - Yearly',
    amount: 99999, // 99999 DZD per year
    currency: 'DZD',
    duration: 'yearly',
  },
};
