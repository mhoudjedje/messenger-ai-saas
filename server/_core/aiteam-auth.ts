import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { ENV } from './env';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Aiteam Authentication Helpers
 * Support for: Email OTP, Phone OTP (Meta Cloud API), Google OAuth
 */

// ============ OTP EMAIL ============

export interface OTPEmailConfig {
  phoneOrEmail: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Générer un code OTP aléatoire (6 chiffres)
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoyer un code OTP par email
 */
export async function sendOTPEmail(email: string, code: string, language: 'ar' | 'fr' | 'en' = 'ar'): Promise<boolean> {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      // Development mode: log OTP to console instead of sending email
      console.log(`\n[OTP] Development Mode - OTP Code for ${email}:`);
      console.log(`[OTP] Code: ${code}`);
      console.log(`[OTP] Language: ${language}\n`);
      return true;
    }

    // Production mode: send via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const subject = language === 'ar' ? 'رمز التحقق' : language === 'fr' ? 'Code de vérification' : 'Verification Code';
    const body = language === 'ar' 
      ? `رمز التحقق الخاص بك: ${code}` 
      : language === 'fr' 
      ? `Votre code de vérification: ${code}` 
      : `Your verification code: ${code}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html: `<p>${body}</p><p style="color: #999; font-size: 12px;">This code expires in 10 minutes.</p>`,
    });

    console.log(`[OTP] Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('[OTP] Failed to send email:', error);
    return false;
  }
}

// ============ PASSWORD HASHING ============

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ SESSION TOKEN (JWT) ============

/**
 * Générer un token de session JWT (compatible avec Manus SDK)
 */
export async function generateSessionToken(userId: number, expiresInMs: number = 1000 * 60 * 60 * 24 * 30, name: string = 'User'): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret || 'dev-secret');
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  // Ensure name is non-empty (required by SDK verification)
  const userName = name && name.trim().length > 0 ? name : 'User';

  return new SignJWT({
    userId,
    openId: `aiteam_${userId}`,
    appId: ENV.appId || 'aiteam',
    name: userName,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Vérifier un token de session JWT (compatible avec Manus SDK)
 */
export async function verifySessionToken(token: string): Promise<{ userId: number; iat: number; exp: number } | null> {
  try {
    const secretKey = new TextEncoder().encode(ENV.cookieSecret || 'dev-secret');
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    console.log('[Session] JWT payload:', JSON.stringify(payload, null, 2));

    const userId = payload.userId as number;
    const iat = payload.iat as number;
    const exp = payload.exp as number;

    console.log('[Session] Extracted fields - userId:', userId, 'iat:', iat, 'exp:', exp);

    if (!userId || !iat || !exp) {
      console.warn('[Session] JWT payload missing required fields', { userId, iat, exp });
      return null;
    }

    // Vérifier l'expiration
    if (exp < Math.floor(Date.now() / 1000)) {
      console.warn('[Session] JWT token expired');
      return null;
    }

    console.log('[Session] JWT token verified successfully for userId:', userId);
    return { userId, iat, exp };
  } catch (error) {
    console.error('[Session] Failed to verify JWT token:', error);
    return null;
  }
}

// ============ GOOGLE OAUTH ============

/**
 * Exchange Google authorization code for access token
 */
export async function exchangeGoogleCodeForToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
}> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: ENV.googleOAuthClientId,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google token exchange failed: ${response.status} - ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('[Google OAuth] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
}> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Google user info: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('[Google OAuth] Failed to get user info:', error);
    throw error;
  }
}


/**
 * Verify a password against its hash (alias for comparePassword)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return comparePassword(password, hash);
}

/**
 * Generate Google OAuth URL for authorization
 */
export function generateGoogleOAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: ENV.googleOAuthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });

  if (state) {
    params.append('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
