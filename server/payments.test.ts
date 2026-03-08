import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paymentsRouter } from './routers/payments';
import { getDb } from './db';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

describe('Payments Router', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    subscriptionStatus: 'free',
    subscriptionPlan: null,
    subscriptionExpiresAt: null,
    paymentProvider: null,
  };

  const mockContext = {
    user: mockUser,
    req: {},
    res: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubscription', () => {
    it('should return user subscription status', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockUser]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.getSubscription();

      expect(result).toEqual({
        status: 'free',
        plan: null,
        expiresAt: null,
        provider: null,
      });
    });

    it('should throw error if user not found', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);

      await expect(caller.getSubscription()).rejects.toThrow('User not found');
    });
  });

  describe('hasActiveSubscription', () => {
    it('should return false for free users', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockUser]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.hasActiveSubscription();

      expect(result).toBe(false);
    });

    it('should return true for users with active subscription', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      const activeUser = {
        ...mockUser,
        subscriptionStatus: 'pro',
        subscriptionPlan: 'monthly',
        subscriptionExpiresAt: futureDate,
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([activeUser]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.hasActiveSubscription();

      expect(result).toBe(true);
    });

    it('should return false for expired subscriptions', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const expiredUser = {
        ...mockUser,
        subscriptionStatus: 'pro',
        subscriptionPlan: 'monthly',
        subscriptionExpiresAt: pastDate,
      };

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([expiredUser]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.hasActiveSubscription();

      expect(result).toBe(false);
    });
  });

  describe('createChargilyCheckout', () => {
    it('should validate and return checkout parameters', async () => {
      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.createChargilyCheckout({
        planType: 'pro',
        planDuration: 'monthly',
        origin: 'https://example.com',
      });

      expect(result).toEqual({
        origin: 'https://example.com',
        planType: 'pro',
        planDuration: 'monthly',
      });
    });

    it('should reject invalid plan type', async () => {
      const caller = paymentsRouter.createCaller(mockContext as any);

      await expect(
        caller.createChargilyCheckout({
          planType: 'invalid' as any,
          planDuration: 'monthly',
          origin: 'https://example.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel user subscription', async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({ success: true }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = paymentsRouter.createCaller(mockContext as any);
      const result = await caller.cancelSubscription();

      expect(result).toEqual({ success: true });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
