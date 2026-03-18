import { Express, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { getDb } from '../db';
import { users, otpVerifications } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  generateOTPCode,
  sendOTPEmail,
  hashPassword,
  verifyPassword,
  generateGoogleOAuthUrl,
  exchangeGoogleCodeForToken,
  getGoogleUserInfo,
  generateSessionToken,
} from './aiteam-auth';
import { ENV } from './env';
import { getSessionCookieOptions } from './cookies';
import { COOKIE_NAME } from '../../shared/const';
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Enregistre les routes d'authentification Aiteam
 */
export function registerAiteamAuthRoutes(app: Express) {
  // ============ EMAIL OTP ============

  /**
   * POST /api/auth/email/send-otp
   * Envoyer un code OTP par email
   */
  app.post('/api/auth/email/send-otp', async (req: Request, res: Response) => {
    try {
      const { email, language = 'ar' } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const code = generateOTPCode();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Supprimer les anciens codes OTP
      await db.delete(otpVerifications).where(
        eq(otpVerifications.phoneOrEmail, email)
      );

      // Créer un nouveau code OTP
      await db.insert(otpVerifications).values({
        phoneOrEmail: email,
        code,
        type: 'email',
        expiresAt,
        attempts: 0,
      });

      // Envoyer l'email
      const sent = await sendOTPEmail(email, code, language as 'ar' | 'fr' | 'en');

      if (!sent) {
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }

      console.log(`[Auth] OTP sent to ${email}`);
      res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
      console.error('[Auth] Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  /**
   * POST /api/auth/email/verify-otp
   * Vérifier un code OTP et créer/connecter l'utilisateur
   */
  app.post('/api/auth/email/verify-otp', async (req: Request, res: Response) => {
    try {
      const { email, code, name } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required' });
      }

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Vérifier le code OTP
      const otpRecord = await db
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.phoneOrEmail, email))
        .limit(1);

      if (otpRecord.length === 0) {
        return res.status(400).json({ error: 'OTP not found or expired' });
      }

      const otp = otpRecord[0];

      // Vérifier l'expiration
      if (new Date() > otp.expiresAt) {
        await db.delete(otpVerifications).where(eq(otpVerifications.id, otp.id));
        return res.status(400).json({ error: 'OTP expired' });
      }

      // Vérifier le nombre de tentatives
      if (otp.attempts >= 3) {
        await db.delete(otpVerifications).where(eq(otpVerifications.id, otp.id));
        return res.status(400).json({ error: 'Too many attempts' });
      }

      // Vérifier le code
      if (otp.code !== code) {
        await db
          .update(otpVerifications)
          .set({ attempts: otp.attempts + 1 })
          .where(eq(otpVerifications.id, otp.id));
        return res.status(400).json({ error: 'Invalid OTP code' });
      }

      // Supprimer le code OTP
      await db.delete(otpVerifications).where(eq(otpVerifications.id, otp.id));

      // Créer ou récupérer l'utilisateur
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        userId = existingUser[0].id!;
        // Mettre à jour lastSignedIn
        await db
          .update(users)
          .set({ lastSignedIn: new Date(), isVerified: true })
          .where(eq(users.id, userId));
      } else {
        // Créer un nouvel utilisateur
        await db.insert(users).values({
          email,
          name: name || null,
          provider: 'email',
          isVerified: true,
          lastSignedIn: new Date(),
        });
        // Query the user back to get the ID
        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (newUser.length === 0) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        userId = newUser[0].id!;
      }

      // Créer un token de session
      const userName = existingUser.length > 0 ? (existingUser[0].name || email) : (name || email);
      const sessionToken = await generateSessionToken(userId, SESSION_EXPIRY_MS, userName);

      // Définir le cookie de session
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
      });

      console.log(`[Auth] User ${userId} authenticated via email OTP`);
      res.json({ success: true, userId, message: 'Authenticated' });
    } catch (error) {
      console.error('[Auth] Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });

  // ============ GOOGLE OAUTH ============

  /**
   * GET /api/auth/google/login
   * Initier le flux Google OAuth
   */
  app.get('/api/auth/google/login', (req: Request, res: Response) => {
    try {
      const state = nanoid();
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

      // Stocker le state dans un cookie
      res.cookie('google_oauth_state', state, {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      const loginUrl = generateGoogleOAuthUrl(redirectUri, state);
      console.log('[Auth] Redirecting to Google login');
      res.redirect(loginUrl);
    } catch (error) {
      console.error('[Auth] Error initiating Google OAuth:', error);
      res.status(500).json({ error: 'Failed to initiate Google login' });
    }
  });

  /**
   * GET /api/auth/google/callback
   * Traiter le callback Google OAuth
   */
  app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error, error_description } = req.query;

      // Vérifier les erreurs OAuth
      if (error) {
        console.warn(`[Auth] Error from Google: ${error} - ${error_description}`);
        return res.redirect(`/?oauth_error=${error}`);
      }

      // Vérifier le state
      const storedState = req.cookies.google_oauth_state;
      if (state !== storedState) {
        console.warn('[Auth] State mismatch - possible CSRF attack');
        return res.status(403).json({ error: 'Invalid state parameter' });
      }

      if (!code) {
        console.warn('[Auth] No authorization code received');
        return res.status(400).json({ error: 'No authorization code' });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

      // Échanger le code pour un token
      const tokenData = await exchangeGoogleCodeForToken(code as string, redirectUri);

      // Récupérer les informations utilisateur
      const googleUser = await getGoogleUserInfo(tokenData.access_token);
      console.log(`[Auth] Google user authenticated: ${googleUser.id} (${googleUser.email})`);

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Créer ou récupérer l'utilisateur
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        userId = existingUser[0].id!;
        // Mettre à jour lastSignedIn
        await db
          .update(users)
          .set({ lastSignedIn: new Date(), isVerified: true })
          .where(eq(users.id, userId));
      } else {
        // Créer un nouvel utilisateur
        await db.insert(users).values({
          email: googleUser.email,
          name: googleUser.name || null,
          provider: 'google',
          isVerified: true,
          lastSignedIn: new Date(),
        });
        // Query the user back to get the ID
        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.email, googleUser.email))
          .limit(1);
        if (newUser.length === 0) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        userId = newUser[0].id!;
      }

      // Créer un token de session
      const userName = existingUser.length > 0 ? (existingUser[0].name || googleUser.email) : (googleUser.name || googleUser.email);
      const sessionToken = await generateSessionToken(userId, SESSION_EXPIRY_MS, userName);

      // Définir le cookie de session
      const cookieOptions = getSessionCookieOptions(req);
      console.log('[Auth] Setting session cookie with options:', {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
        protocol: req.protocol,
        host: req.get('host'),
        xForwardedProto: req.headers['x-forwarded-proto'],
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
      });

      console.log(`[Auth] User ${userId} authenticated via Google`);
      console.log('[Auth] Redirecting to /dashboard?auth_success=true');
      res.redirect('/dashboard?auth_success=true');
    } catch (error) {
      console.error('[Auth] Error in Google callback:', error);
      res.redirect('/?oauth_error=callback_error');
    }
  });

  // ============ LOGOUT ============

  /**
   * POST /api/auth/logout
   * Déconnecter l'utilisateur
   */
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    console.log('[Auth] User logged out');
    res.json({ success: true, message: 'Logged out' });
  });
}
