import { Express, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { parse as parseCookieHeader } from 'cookie';
import {
  generateOAuthLoginUrl,
  exchangeCodeForToken,
  getUserInfo,
  getUserPages,
  getPageInfo,
  META_OAUTH_CONFIG,
} from '../meta-oauth';
import { getDb } from '../db';
import { messengerPages } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { sessionStore } from './session-store';
import { COOKIE_NAME } from '../../shared/const';

/**
 * Enregistre les routes OAuth Meta
 * 
 * IMPORTANT: The redirect_uri MUST always use META_OAUTH_REDIRECT_URI env var
 * because Facebook validates it against the configured domain in App Console.
 * Dynamic origin detection fails behind proxies (returns localhost:3000).
 */
export function registerOAuthRoutes(app: Express) {
  // Trust proxy headers (important for production behind reverse proxy)
  app.set('trust proxy', true);

  // GET /api/oauth/facebook - Initie le flux OAuth
  app.get('/api/oauth/facebook', (req: Request, res: Response) => {
    try {
      // Générer un state aléatoire pour la sécurité CSRF
      const state = nanoid();

      // ALWAYS use the configured redirect URI from env (not dynamic origin)
      // This ensures it matches exactly what's in Meta App Console
      const redirectUri = META_OAUTH_CONFIG.redirectUri;

      console.log(`[OAuth] Initiating OAuth flow`);
      console.log(`[OAuth] Using redirect_uri: ${redirectUri}`);

      // Stocker le state dans un cookie
      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      // Générer l'URL de connexion OAuth - pass undefined for origin so it uses config redirectUri
      const loginUrl = generateOAuthLoginUrl(state);

      console.log(`[OAuth] Redirecting to Facebook login`);
      
      res.redirect(loginUrl);
    } catch (error) {
      console.error('[OAuth] Error initiating OAuth flow:', error);
      res.status(500).json({ error: 'Failed to initiate OAuth flow' });
    }
  });

  // GET /api/oauth/facebook/callback - Traite le callback OAuth
  app.get('/api/oauth/facebook/callback', async (req: Request, res: Response) => {
    console.log('[OAuth] CALLBACK ROUTE TRIGGERED - URL:', req.originalUrl);
    console.log('[OAuth] Query params:', req.query);
    try {
      console.log('[OAuth] Callback received');
      const { code, state, error, error_description } = req.query;

      // Vérifier les erreurs OAuth
      if (error) {
        console.warn(`[OAuth] Error from Facebook: ${error} - ${error_description}`);
        return res.redirect(`/oauth-callback?oauth_error=${error}`);
      }

      // Vérifier le state pour la sécurité
      const storedState = req.cookies?.oauth_state;
      if (!storedState) {
        console.warn('[OAuth] No stored state cookie found');
        return res.redirect('/oauth-callback?oauth_error=no_state');
      }
      if (state !== storedState) {
        console.warn('[OAuth] State mismatch - possible CSRF attack');
        return res.redirect('/oauth-callback?oauth_error=state_mismatch');
      }

      if (!code) {
        console.warn('[OAuth] No authorization code received');
        return res.redirect('/oauth-callback?oauth_error=no_code');
      }

      console.log('[OAuth] Exchanging code for access token');

      // Échanger le code pour un token d'accès (uses config redirectUri, no origin needed)
      const tokenData = await exchangeCodeForToken(code as string);
      const userAccessToken = tokenData.access_token;

      // Récupérer les informations de l'utilisateur
      const userInfo = await getUserInfo(userAccessToken);
      console.log(`[OAuth] User authenticated: ${userInfo.id} (${userInfo.name})`);

      // Récupérer les pages Facebook de l'utilisateur
      const pages = await getUserPages(userAccessToken);
      console.log(`[OAuth] Found ${pages.length} pages for user ${userInfo.id}`);

      // Récupérer l'utilisateur actuel depuis la session
      let userId: number | null = null;
      
      // Extract user ID from session cookie
      const cookieHeader = req.headers.cookie;
      console.log('[OAuth] Cookie header:', cookieHeader ? 'present' : 'missing');
      
      if (cookieHeader) {
        const cookies = parseCookieHeader(cookieHeader);
        console.log('[OAuth] Parsed cookies:', Object.keys(cookies));
        
        const sessionId = cookies[COOKIE_NAME];
        console.log('[OAuth] Session ID from cookie:', sessionId ? 'found' : 'not found');
        
        if (sessionId) {
          const sessionData = sessionStore.getSession(sessionId);
          console.log('[OAuth] Session data:', sessionData ? `found (userId: ${sessionData.userId})` : 'not found');
          
          if (sessionData) {
            userId = sessionData.userId;
          }
        }
      }
      
      console.log('[OAuth] Final userId:', userId || 'null');
      
      if (!userId) {
        console.warn('[OAuth] No authenticated user in session');
        return res.redirect('/oauth-callback?oauth_error=not_authenticated');
      }

      // Stocker les pages dans la base de données
      const db = await getDb();
      if (!db) {
        console.error('[OAuth] Database not available');
        return res.redirect('/oauth-callback?oauth_error=db_error');
      }

      let connectedPagesCount = 0;

      for (const page of pages) {
        try {
          // Récupérer les informations complètes de la page
          const pageInfo = await getPageInfo(page.id, page.access_token);

          // Vérifier si la page existe déjà
          const existingPage = await db
            .select()
            .from(messengerPages)
            .where(eq(messengerPages.pageId, page.id))
            .limit(1);

          if (existingPage.length > 0) {
            // Mettre à jour la page existante
            await db
              .update(messengerPages)
              .set({
                pageAccessToken: page.access_token,
                pageName: page.name,
                isActive: true,
              })
              .where(eq(messengerPages.pageId, page.id));

            console.log(`[OAuth] Updated existing page: ${page.name} (${page.id})`);
          } else {
            // Créer une nouvelle page
            await db.insert(messengerPages).values({
              userId,
              pageId: page.id,
              pageName: page.name,
              pageAccessToken: page.access_token,
              isActive: true,
            });

            console.log(`[OAuth] Connected new page: ${page.name} (${page.id})`);
          }

          connectedPagesCount++;
        } catch (pageError) {
          console.error(`[OAuth] Error connecting page ${page.id}:`, pageError);
        }
      }

      // Nettoyer les cookies OAuth
      res.clearCookie('oauth_state');

      console.log(`[OAuth] Successfully connected ${connectedPagesCount} pages for user ${userId}`);

      // Rediriger vers le dashboard avec un message de succès
      res.redirect(`/oauth-callback?oauth_success=true&pages=${connectedPagesCount}`);
    } catch (error) {
      console.error('[OAuth] Error in callback:', error);
      res.redirect(`/oauth-callback?oauth_error=callback_error`);
    }
  });

  // GET /api/oauth/disconnect - Déconnecte une page
  app.get('/api/oauth/disconnect/:pageId', async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Extract user ID from session cookie
      let userId: number | null = null;
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const cookies = parseCookieHeader(cookieHeader);
        const sessionId = cookies[COOKIE_NAME];
        if (sessionId) {
          const sessionData = sessionStore.getSession(sessionId);
          if (sessionData) {
            userId = sessionData.userId;
          }
        }
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Vérifier que la page appartient à l'utilisateur
      const page = await db
        .select()
        .from(messengerPages)
        .where(eq(messengerPages.pageId, pageId))
        .limit(1);

      if (page.length === 0 || page[0].userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Marquer la page comme déconnectée
      await db
        .update(messengerPages)
        .set({
          isActive: false,
        })
        .where(eq(messengerPages.pageId, pageId));

      console.log(`[OAuth] Disconnected page ${pageId} for user ${userId}`);

      res.json({ success: true, message: 'Page disconnected successfully' });
    } catch (error) {
      console.error('[OAuth] Error disconnecting page:', error);
      res.status(500).json({ error: 'Failed to disconnect page' });
    }
  });
}
