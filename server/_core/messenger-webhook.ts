import { Express, Request, Response } from 'express';
import { validateMessengerSignature, MessengerEvent } from '../messenger';
import { appRouter } from '../routers';
import { createContext } from './context';

/**
 * Enregistre les routes du webhook Messenger
 */
export function registerMessengerWebhookRoutes(app: Express) {
  // GET /api/webhook - Vérification du webhook par Meta
  app.get('/api/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.META_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Webhook] Verified webhook');
        res.status(200).send(challenge);
      } else {
        console.warn('[Webhook] Verification failed: invalid token');
        res.sendStatus(403);
      }
    } else {
      console.warn('[Webhook] Verification failed: missing parameters');
      res.sendStatus(400);
    }
  });

  // POST /api/webhook - Réception des événements Messenger
  app.post('/api/webhook', async (req: Request, res: Response) => {
    const body = req.body;
    const signature = req.headers['x-hub-signature-256'] as string;

    // Verifier la signature si elle est fournie (pour la production)
    if (signature) {
      const appSecret = process.env.META_APP_SECRET;
      if (!appSecret) {
        console.error('[Webhook] META_APP_SECRET not configured');
        res.sendStatus(500);
        return;
      }

      const rawBody = JSON.stringify(body);
      const isValid = validateMessengerSignature(rawBody, signature, appSecret);

      if (!isValid) {
        console.warn('[Webhook] Invalid signature');
        res.sendStatus(401);
        return;
      }
    } else {
      // En developpement, accepter les requetes sans signature
      console.log('[Webhook] No signature provided - accepting for development');
    }

    // Retourner 200 OK immédiatement
    res.status(200).send('EVENT_RECEIVED');

    // Traiter l'événement de manière asynchrone
    try {
      const event = body as MessengerEvent;

      // Creer un contexte public pour appeler le webhook
      const ctx = await createContext({
        req: req as any,
        res: res as any,
        info: { ip: req.ip, userAgent: req.get('user-agent') },
      } as any);

      // Appeler la procédure webhook
      const caller = appRouter.createCaller(ctx);
      await caller.messenger.webhook(event);
    } catch (error) {
      console.error('[Webhook] Error processing event:', error);
    }
  });
}
