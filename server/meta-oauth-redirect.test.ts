import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Meta OAuth Redirect URI', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should use META_OAUTH_REDIRECT_URI env var when set', async () => {
    // Set the env var
    process.env.META_OAUTH_REDIRECT_URI = 'https://messengerai-crj7dbqp.manus.space/api/oauth/facebook/callback';
    process.env.META_APP_ID = '1245131857121147';
    process.env.META_APP_SECRET = 'test_secret';

    // Re-import to pick up env changes
    const { META_OAUTH_CONFIG, generateOAuthLoginUrl } = await import('./meta-oauth');

    expect(META_OAUTH_CONFIG.redirectUri).toBe('https://messengerai-crj7dbqp.manus.space/api/oauth/facebook/callback');
    
    const url = generateOAuthLoginUrl('test_state');
    expect(url).toContain('redirect_uri=https%3A%2F%2Fmessengerai-crj7dbqp.manus.space%2Fapi%2Foauth%2Ffacebook%2Fcallback');
    expect(url).not.toContain('localhost');
  });

  it('should include correct scopes in OAuth URL', async () => {
    process.env.META_OAUTH_REDIRECT_URI = 'https://messengerai-crj7dbqp.manus.space/api/oauth/facebook/callback';
    process.env.META_APP_ID = '1245131857121147';

    const { generateOAuthLoginUrl } = await import('./meta-oauth');
    const url = generateOAuthLoginUrl('test_state');

    expect(url).toContain('pages_messaging');
    expect(url).toContain('pages_show_list');
    expect(url).toContain('pages_manage_metadata');
    expect(url).not.toContain('pages_manage_messaging'); // This was the invalid scope
  });

  it('should use production redirect_uri (not localhost) when META_OAUTH_REDIRECT_URI is set', async () => {
    process.env.META_OAUTH_REDIRECT_URI = 'https://messengerai-crj7dbqp.manus.space/api/oauth/facebook/callback';
    process.env.META_APP_ID = '1245131857121147';

    const { generateOAuthLoginUrl } = await import('./meta-oauth');
    const url = generateOAuthLoginUrl('test_state');

    // The URL should use the production domain, not localhost
    expect(url).toContain('messengerai-crj7dbqp.manus.space');
    expect(url).not.toContain('localhost:3000');
  });

  it('should fall back to localhost when META_OAUTH_REDIRECT_URI is not set', async () => {
    delete process.env.META_OAUTH_REDIRECT_URI;
    process.env.META_APP_ID = '1245131857121147';

    const { META_OAUTH_CONFIG } = await import('./meta-oauth');
    expect(META_OAUTH_CONFIG.redirectUri).toBe('http://localhost:3000/api/oauth/facebook/callback');
  });
});
