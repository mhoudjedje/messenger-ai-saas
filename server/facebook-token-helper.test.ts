import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateFacebookToken, getAccessiblePages } from './facebook-token-helper';

// Mock fetch globally
global.fetch = vi.fn();

describe('Facebook Token Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFacebookToken', () => {
    it('should validate a valid page access token', async () => {
      const mockToken = 'valid_page_token_123';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '123456789',
          name: 'Test Page',
          picture: { data: { url: 'https://example.com/pic.jpg' } },
          category: 'Business',
        }),
      });

      const result = await validateFacebookToken(mockToken);

      expect(result.isValid).toBe(true);
      expect(result.pageInfo?.id).toBe('123456789');
      expect(result.pageInfo?.name).toBe('Test Page');
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token with 400 error', async () => {
      const mockToken = 'invalid_token';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'Invalid access token' },
        }),
      });

      const result = await validateFacebookToken(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should reject expired token with 401 error', async () => {
      const mockToken = 'expired_token';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Token expired' },
        }),
      });

      const result = await validateFacebookToken(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should handle network errors gracefully', async () => {
      const mockToken = 'any_token';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await validateFacebookToken(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should reject token without id or name', async () => {
      const mockToken = 'token_without_id';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing id and name
          picture: { data: { url: 'https://example.com/pic.jpg' } },
        }),
      });

      const result = await validateFacebookToken(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not appear to be a valid page access token');
    });
  });

  describe('getAccessiblePages', () => {
    it('should retrieve list of accessible pages', async () => {
      const mockToken = 'user_access_token';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'page1',
              name: 'Page 1',
              picture: { data: { url: 'https://example.com/pic1.jpg' } },
              category: 'Business',
            },
            {
              id: 'page2',
              name: 'Page 2',
              picture: { data: { url: 'https://example.com/pic2.jpg' } },
              category: 'Community',
            },
          ],
        }),
      });

      const pages = await getAccessiblePages(mockToken);

      expect(pages).toHaveLength(2);
      expect(pages[0].id).toBe('page1');
      expect(pages[0].name).toBe('Page 1');
      expect(pages[1].id).toBe('page2');
      expect(pages[1].name).toBe('Page 2');
    });

    it('should return empty array on API error', async () => {
      const mockToken = 'invalid_token';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const pages = await getAccessiblePages(mockToken);

      expect(pages).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      const mockToken = 'any_token';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const pages = await getAccessiblePages(mockToken);

      expect(pages).toEqual([]);
    });

    it('should handle empty data response', async () => {
      const mockToken = 'token_with_no_pages';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
        }),
      });

      const pages = await getAccessiblePages(mockToken);

      expect(pages).toEqual([]);
    });
  });
});
