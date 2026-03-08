import axios from 'axios';

/**
 * Constantes Meta OAuth
 */
export const META_OAUTH_CONFIG = {
  clientId: process.env.META_APP_ID || '',
  clientSecret: process.env.META_APP_SECRET || '',
  redirectUri: process.env.META_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/facebook/callback',
  scope: 'pages_manage_metadata,pages_read_user_content,pages_manage_messaging,pages_show_list',
  apiVersion: 'v18.0',
  graphApiUrl: 'https://graph.facebook.com',
};

/**
 * Interface pour les données de page Facebook
 */
export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  tasks: string[];
}

/**
 * Interface pour les données d'utilisateur OAuth
 */
export interface OAuthUserData {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

/**
 * Génère l'URL de connexion OAuth Meta
 * @param state - State CSRF token
 * @param origin - Optional origin URL for dynamic redirect URI
 */
export function generateOAuthLoginUrl(state: string, origin?: string): string {
  // Use dynamic origin if provided, otherwise fall back to config
  const redirectUri = origin 
    ? `${origin}/api/oauth/facebook/callback`
    : META_OAUTH_CONFIG.redirectUri;

  const params = new URLSearchParams({
    client_id: META_OAUTH_CONFIG.clientId,
    redirect_uri: redirectUri,
    scope: META_OAUTH_CONFIG.scope,
    state,
    response_type: 'code',
    auth_type: 'rerequest',
  });

  return `https://www.facebook.com/${META_OAUTH_CONFIG.apiVersion}/dialog/oauth?${params.toString()}`;
}

/**
 * Échange le code OAuth pour un token d'accès utilisateur
 * @param code - Authorization code from OAuth callback
 * @param origin - Optional origin URL for dynamic redirect URI (must match the one used in login URL)
 */
export async function exchangeCodeForToken(code: string, origin?: string): Promise<{
  access_token: string;
  token_type: string;
}> {
  // Use dynamic origin if provided, otherwise fall back to config
  const redirectUri = origin 
    ? `${origin}/api/oauth/facebook/callback`
    : META_OAUTH_CONFIG.redirectUri;

  try {
    const response = await axios.post(
      `${META_OAUTH_CONFIG.graphApiUrl}/${META_OAUTH_CONFIG.apiVersion}/oauth/access_token`,
      {
        client_id: META_OAUTH_CONFIG.clientId,
        client_secret: META_OAUTH_CONFIG.clientSecret,
        redirect_uri: redirectUri,
        code,
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Meta OAuth] Error exchanging code for token:', error);
    throw new Error('Failed to exchange OAuth code for token');
  }
}

/**
 * Récupère les informations de l'utilisateur OAuth
 */
export async function getUserInfo(accessToken: string): Promise<OAuthUserData> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/me`,
      {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Meta OAuth] Error fetching user info:', error);
    throw new Error('Failed to fetch user info');
  }
}

/**
 * Récupère la liste des pages Facebook de l'utilisateur
 */
export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/me/accounts`,
      {
        params: {
          fields: 'id,name,access_token,tasks',
          access_token: accessToken,
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('[Meta OAuth] Error fetching user pages:', error);
    throw new Error('Failed to fetch user pages');
  }
}

/**
 * Vérifie si un token d'accès est valide
 */
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/debug_token`,
      {
        params: {
          input_token: accessToken,
          access_token: `${META_OAUTH_CONFIG.clientId}|${META_OAUTH_CONFIG.clientSecret}`,
        },
      }
    );

    const data = response.data.data;
    return data && data.is_valid && !data.is_expired;
  } catch (error) {
    console.error('[Meta OAuth] Error validating token:', error);
    return false;
  }
}

/**
 * Renouvelle un token d'accès de page (les tokens de page ne s'expirent pas, mais on peut vérifier)
 */
export async function refreshPageAccessToken(pageId: string, userAccessToken: string): Promise<string> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/${pageId}`,
      {
        params: {
          fields: 'access_token',
          access_token: userAccessToken,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('[Meta OAuth] Error refreshing page token:', error);
    throw new Error('Failed to refresh page access token');
  }
}

/**
 * Récupère les informations d'une page Facebook
 */
export async function getPageInfo(pageId: string, pageAccessToken: string): Promise<{
  id: string;
  name: string;
  category: string;
  picture?: string;
}> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/${pageId}`,
      {
        params: {
          fields: 'id,name,category,picture',
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Meta OAuth] Error fetching page info:', error);
    throw new Error('Failed to fetch page info');
  }
}

/**
 * Teste la connexion à une page Messenger
 */
export async function testPageConnection(pageId: string, pageAccessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${META_OAUTH_CONFIG.graphApiUrl}/${pageId}/conversations`,
      {
        params: {
          limit: 1,
          access_token: pageAccessToken,
        },
      }
    );

    return true;
  } catch (error) {
    console.error('[Meta OAuth] Error testing page connection:', error);
    return false;
  }
}
