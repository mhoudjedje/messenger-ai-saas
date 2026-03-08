import { Express, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import {
  generateOAuthLoginUrl,
  exchangeCodeForToken,
  getUserInfo,
  getUserPages,
  getPageInfo,
} from '../meta-oauth';
import { getDb } from '../db';
import { messengerPages } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Helper to get the correct origin from a request
 * Handles proxy scenarios where req.protocol might be 'http' even behind HTTPS
 */
function getOriginFromRequest(req: Request): string {
  // Trust X-Forwarded-Proto header from reverse proxies
  const protocol = req.headers['x-forwarded-proto'] as string || req.protocol;
  const host = req.headers['x-forwarded-host'] as string || req.get('host') || 'localhost:3000';
  
  // In production, always use HTTPS
  const finalProtocol = host.includes('localhost') ? protocol : 'https';
  
  return `${finalProtocol}://${host}`;
}

/**
 * Enregistre les routes OAuth Meta
 */
export function registerOAuthRoutes(app: Express) {
  // Trust proxy headers (important for production behind reverse proxy)
  app.set('trust proxy', true);

  // GET /api/oauth/facebook - Initie le flux OAuth
  app.get('/api/oauth/facebook', (req: Request, res: Response) => {
    try {
      // Générer un state aléatoire pour la sécurité CSRF
      const state = nanoid();

      // Determine the origin dynamically from the request
      const origin = getOriginFromRequest(req);

      console.log(`[OAuth] Initiating OAuth flow (origin: ${origin})`);

      // Stocker le state et l'origin dans des cookies
      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: !origin.includes('localhost'),
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      res.cookie('oauth_origin', origin, {
        httpOnly: true,
        secure: !origin.includes('localhost'),
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      // Générer l'URL de connexion OAuth avec l'origin dynamique
      const loginUrl = generateOAuthLoginUrl(state, origin);

      console.log(`[OAuth] Redirecting to Facebook login URL`);
      console.log(`[OAuth] Redirect URI will be: ${origin}/api/oauth/facebook/callback`);
      
      res.redirect(loginUrl);
    } catch (error) {
      console.error('[OAuth] Error initiating OAuth flow:', error);
      res.status(500).json({ error: 'Failed to initiate OAuth flow' });
    }
  });

  // GET /api/oauth/facebook/callback - Traite le callback OAuth
  app.get('/api/oauth/facebook/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error, error_description } = req.query;

      // Vérifier les erreurs OAuth
      if (error) {
        console.warn(`[OAuth] Error from Facebook: ${error} - ${error_description}`);
        return res.redirect(`/dashboard?oauth_error=${error}`);
      }

      // Vérifier le state pour la sécurité
      const storedState = req.cookies?.oauth_state;
      if (!storedState) {
        console.warn('[OAuth] No stored state cookie found');
        return res.redirect('/dashboard?oauth_error=no_state');
      }
      if (state !== storedState) {
        console.warn('[OAuth] State mismatch - possible CSRF attack');
        return res.redirect('/dashboard?oauth_error=state_mismatch');
      }

      if (!code) {
        console.warn('[OAuth] No authorization code received');
        return res.redirect('/dashboard?oauth_error=no_code');
      }

      console.log('[OAuth] Exchanging code for access token');

      // Récupérer l'origin stocké dans le cookie
      const storedOrigin = req.cookies?.oauth_origin;
      console.log(`[OAuth] Using stored origin: ${storedOrigin}`);

      // Échanger le code pour un token d'accès (avec l'origin dynamique)
      const tokenData = await exchangeCodeForToken(code as string, storedOrigin);
      const userAccessToken = tokenData.access_token;

      // Récupérer les informations de l'utilisateur
      const userInfo = await getUserInfo(userAccessToken);
      console.log(`[OAuth] User authenticated: ${userInfo.id} (${userInfo.name})`);

      // Récupérer les pages Facebook de l'utilisateur
      const pages = await getUserPages(userAccessToken);
      console.log(`[OAuth] Found ${pages.length} pages for user ${userInfo.id}`);

      // Récupérer l'utilisateur actuel depuis la session
      const userId = (req as any).user?.id;
      if (!userId) {
        console.warn('[OAuth] No authenticated user in session');
        return res.redirect('/dashboard?oauth_error=not_authenticated');
      }

      // Stocker les pages dans la base de données
      const db = await getDb();
      if (!db) {
        console.error('[OAuth] Database not available');
        return res.redirect('/dashboard?oauth_error=db_error');
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
      res.clearCookie('oauth_origin');

      console.log(`[OAuth] Successfully connected ${connectedPagesCount} pages for user ${userId}`);

      // Rediriger vers le dashboard avec un message de succès
      res.redirect(`/dashboard?oauth_success=true&pages=${connectedPagesCount}`);
    } catch (error) {
      console.error('[OAuth] Error in callback:', error);
      res.redirect(`/dashboard?oauth_error=callback_error`);
    }
  });

  // GET /api/oauth/disconnect - Déconnecte une page
  app.get('/api/oauth/disconnect/:pageId', async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database error' });
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
