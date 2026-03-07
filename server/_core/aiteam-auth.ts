import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { ENV } from './env';

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
    // Configuration email (à adapter selon votre service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const subject = language === 'ar' 
      ? 'رمز التحقق من Aiteam' 
      : language === 'fr'
      ? 'Code de vérification Aiteam'
      : 'Aiteam Verification Code';

    const htmlContent = getOTPEmailTemplate(code, language);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@aiteam.app',
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`[OTP] Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[OTP] Failed to send email:', error);
    return false;
  }
}

/**
 * Template HTML pour l'email OTP
 */
function getOTPEmailTemplate(code: string, language: 'ar' | 'fr' | 'en'): string {
  const templates = {
    ar: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 400px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">رمز التحقق من Aiteam</h2>
          <p style="color: #666; margin-bottom: 20px;">مرحبا بك في Aiteam! استخدم الرمز أدناه للتحقق من حسابك:</p>
          <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0;">${code}</p>
          </div>
          <p style="color: #999; font-size: 12px;">ينتهي صلاحية هذا الرمز خلال 10 دقائق.</p>
        </div>
      </div>
    `,
    fr: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 400px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Code de vérification Aiteam</h2>
          <p style="color: #666; margin-bottom: 20px;">Bienvenue sur Aiteam! Utilisez le code ci-dessous pour vérifier votre compte:</p>
          <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0;">${code}</p>
          </div>
          <p style="color: #999; font-size: 12px;">Ce code expire dans 10 minutes.</p>
        </div>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 400px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Aiteam Verification Code</h2>
          <p style="color: #666; margin-bottom: 20px;">Welcome to Aiteam! Use the code below to verify your account:</p>
          <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0;">${code}</p>
          </div>
          <p style="color: #999; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `,
  };
  return templates[language];
}

// ============ PASSWORD HASHING ============

/**
 * Hasher un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Vérifier un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ GOOGLE OAUTH ============

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

/**
 * Générer l'URL de connexion Google OAuth
 */
export function generateGoogleOAuthUrl(redirectUri: string, state: string): string {
  const clientId = ENV.googleOAuthClientId;
  const scope = 'openid profile email';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Échanger un code Google OAuth pour un token
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
      throw new Error(`Google OAuth token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Google OAuth] Token exchange failed:', error);
    throw error;
  }
}

/**
 * Récupérer les informations utilisateur Google
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
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Google OAuth] Failed to fetch user info:', error);
    throw error;
  }
}

// ============ SESSION TOKENS ============

/**
 * Générer un token de session JWT simple
 */
export function generateSessionToken(userId: number, expiresInMs: number = 1000 * 60 * 60 * 24 * 30): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + expiresInMs) / 1000),
  };

  // Signature simple (à remplacer par JWT proper en production)
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'dev-secret')
    .update(JSON.stringify(payload))
    .digest('hex');

  return Buffer.from(JSON.stringify(payload)).toString('base64') + '.' + signature;
}

/**
 * Vérifier un token de session
 */
export function verifySessionToken(token: string): { userId: number; iat: number; exp: number } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    // Vérifier la signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'dev-secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    // Vérifier l'expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[Session] Failed to verify token:', error);
    return null;
  }
}
