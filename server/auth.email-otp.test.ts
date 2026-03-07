import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateOTPCode, hashPassword, verifyPassword, generateSessionToken, verifySessionToken } from './_core/aiteam-auth';

describe('Aiteam Email OTP Authentication', () => {
  describe('generateOTPCode', () => {
    it('should generate a 6-digit code', () => {
      const code = generateOTPCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate different codes on each call', () => {
      const code1 = generateOTPCode();
      const code2 = generateOTPCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'test-password-123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
      const password = 'test-password-123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'test-password-123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrong-password', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Session Tokens', () => {
    it('should generate a session token', () => {
      const userId = 123;
      const token = generateSessionToken(userId, 3600000);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify a valid session token', () => {
      const userId = 123;
      const token = generateSessionToken(userId, 3600000);
      const payload = verifySessionToken(token);
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(userId);
    });

    it('should reject an invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const payload = verifySessionToken(invalidToken);
      expect(payload).toBeNull();
    });

    it('should reject an expired token', () => {
      const userId = 123;
      // Create a token that expires immediately
      const token = generateSessionToken(userId, -1000);
      const payload = verifySessionToken(token);
      expect(payload).toBeNull();
    });
  });
});
