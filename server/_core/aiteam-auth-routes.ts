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
} from './aiteam-auth';
import { ENV } from './env';
import { getSessionCookieOptions } from './cookies';
import { COOKIE_NAME } from '../../shared/const';
import { sessionStore } from './session-store';
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
          subscriptionStatus: 'pro', // TEMPORARY: Set to 'pro' for testing
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


      // Créer une session serveur
      const userName = existingUser.length > 0 ? (existingUser[0].name || email) : (name || email);
      const sessionId = nanoid(32);
      sessionStore.createSession(sessionId, userId, email, userName, SESSION_EXPIRY_MS);

      // Définir le cookie de session
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionId, {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
      });

      console.log(`[Auth] User ${userId} authenticated via email OTP, session: ${sessionId}`);










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
          subscriptionStatus: 'pro', // TEMPORARY: Set to 'pro' for testing
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

      // Créer une session serveur
      const userName = existingUser.length > 0 ? (existingUser[0].name || googleUser.email) : (googleUser.name || googleUser.email);
      const sessionId = nanoid(32);
      sessionStore.createSession(sessionId, userId, googleUser.email, userName, SESSION_EXPIRY_MS);

      // Définir le cookie de session
      const cookieOptions = getSessionCookieOptions(req);
      console.log('[Auth] Setting session cookie with options:', {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
        protocol: req.protocol,
        host: req.get('host'),
        xForwardedProto: req.headers['x-forwarded-proto'],
      });
      res.cookie(COOKIE_NAME, sessionId, {
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

  // ============ TEST BYPASS ============

  /**
   * GET /api/auth/test-bypass
   * Route de bypass pour les tests - crée/récupère un utilisateur de test et redirige vers le dashboard
   * TEMPORARY: À supprimer en production
   */
  app.get('/api/auth/test-bypass', async (req: Request, res: Response) => {
    try {
      const testEmail = 'test@example.com';
      const testName = 'Test User';

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Chercher l'utilisateur de test
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, testEmail))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        userId = existingUser[0].id!;
        console.log(`[Auth] Test user already exists: ${userId}`);
      } else {
        // Créer l'utilisateur de test
        await db.insert(users).values({
          email: testEmail,
          name: testName,
          provider: 'email', // Use 'email' as provider for test user
          isVerified: true,
          lastSignedIn: new Date(),
          subscriptionStatus: 'pro', // Accès complet pour les tests
        });

        // Récupérer l'utilisateur créé
        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.email, testEmail))
          .limit(1);

        if (newUser.length === 0) {
          return res.status(500).json({ error: 'Failed to create test user' });
        }

        userId = newUser[0].id!;
        console.log(`[Auth] Test user created: ${userId}`);
      }

      // Créer une session serveur
      const sessionId = nanoid(32);
      sessionStore.createSession(sessionId, userId, testEmail, testName, SESSION_EXPIRY_MS);

      // Définir le cookie de session avec les options appropriées
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionId, {
        ...cookieOptions,
        maxAge: SESSION_EXPIRY_MS,
      });

      console.log(`[Auth] Test bypass: User ${userId} authenticated, session: ${sessionId}, redirecting to /dashboard`);










      console.log(`[Auth] Test bypass: User ${userId} authenticated, redirecting to /dashboard`);
      res.redirect('/dashboard?test_mode=true');
    } catch (error) {
      console.error('[Auth] Error in test bypass:', error);
      res.status(500).json({ error: 'Failed to create test session' });
    }
  });

  // ============ DEBUG ============

  /**
   * GET /api/debug/cookies
   * Endpoint de debug pour vérifier les cookies reçus
   */
  app.get('/api/debug/cookies', (req: Request, res: Response) => {
    res.json({
      headers: {
        cookie: req.headers.cookie || 'NO COOKIE HEADER',
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'NOT SET',
        'x-forwarded-for': req.headers['x-forwarded-for'] || 'NOT SET',
      },
      protocol: req.protocol,
      hostname: req.hostname,
      url: req.url,
    });
  });

  /**
   * GET /api/debug/auth-test
   * Endpoint de debug pour tester l'authentification directement
   */
  app.get('/api/debug/auth-test', async (req: Request, res: Response) => {
    try {
      const cookieModule = await import('cookie');
      const parseCookieHeader = cookieModule.parse;
      const authModule = await import('./aiteam-auth');
      const constModule = await import('../../shared/const');
      const dbModule = await import('../db');
      const { verifySessionToken } = authModule;
      const { COOKIE_NAME } = constModule;
      const { getUserById } = dbModule;

      const cookieHeader = req.headers.cookie;
      console.log('[Debug] Cookie header:', cookieHeader ? 'present' : 'missing');

      if (!cookieHeader) {
        return res.json({ error: 'No cookie header' });
      }

      const cookies = parseCookieHeader(cookieHeader);
      console.log('[Debug] Parsed cookies:', Object.keys(cookies));
      const sessionToken = cookies[COOKIE_NAME];
      console.log('[Debug] Session token found:', !!sessionToken);

      if (!sessionToken) {
        return res.json({ error: 'No session token' });
      }

      const payload = await verifySessionToken(sessionToken);
      console.log('[Debug] Payload:', payload);

      if (!payload || !payload.userId) {
        return res.json({ error: 'Invalid payload', payload });
      }

      const user = await getUserById(payload.userId);
      console.log('[Debug] User:', user);

      res.json({
        success: true,
        userId: payload.userId,
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
      });
    } catch (error) {
      console.error('[Debug] Error:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * GET /api/debug/jwt-verify?token=xxx
   * Endpoint pour tester la vérification JWT directement
   */
  app.get('/api/debug/jwt-verify', async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.json({ error: 'No token provided' });
      }

      const authModule = await import('./aiteam-auth');
      const { verifySessionToken } = authModule;

      const payload = await verifySessionToken(token);
      res.json({ payload });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}
