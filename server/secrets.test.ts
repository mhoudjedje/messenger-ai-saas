import { describe, it, expect } from 'vitest';

/**
 * Test pour valider que les secrets sont correctement configurés
 */
describe('Secrets Configuration', () => {
  it('should have OPENAI_API_KEY configured', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^sk-/);
  });

  it('should have META_APP_SECRET configured', () => {
    const secret = process.env.META_APP_SECRET;
    expect(secret).toBeDefined();
    expect(secret?.length).toBeGreaterThan(0);
  });

  it('should have META_VERIFY_TOKEN configured', () => {
    const token = process.env.META_VERIFY_TOKEN;
    expect(token).toBeDefined();
    expect(token?.length).toBeGreaterThan(0);
  });

  it('should have DATABASE_URL configured', () => {
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toBeDefined();
    expect(dbUrl).toMatch(/^mysql:\/\//);
  });
});
