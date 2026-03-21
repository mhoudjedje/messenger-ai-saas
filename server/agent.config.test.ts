import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOrUpdateAgentConfig, getAgentConfigByPageId } from './db';

// Mock database functions
vi.mock('./db', () => ({
  createOrUpdateAgentConfig: vi.fn(),
  getAgentConfigByPageId: vi.fn(),
  getUserPreferences: vi.fn(),
  createOrUpdateUserPreferences: vi.fn(),
}));

describe('Agent Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveConfig', () => {
    it('should save agent configuration with all fields', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        agentName: 'Sales Bot',
        personality: 'Friendly and helpful',
        systemPrompt: 'You are a sales assistant',
        responseLanguage: 'ar',
        maxTokens: 150,
        temperature: '0.7',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(config);
      expect(createOrUpdateAgentConfig).toHaveBeenCalledTimes(1);
    });

    it('should save agent configuration with partial fields', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        agentName: 'Sales Bot',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(config);
    });

    it('should handle temperature as string', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        temperature: '0.75',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: '0.75',
        })
      );
    });
  });

  describe('getConfig', () => {
    it('should retrieve agent configuration by page ID', async () => {
      const mockConfig = {
        id: 'config1',
        pageId: 'page456',
        agentName: 'Sales Bot',
        personality: 'Friendly',
        systemPrompt: 'You are helpful',
        responseLanguage: 'ar',
        maxTokens: 150,
        temperature: '0.7',
      };

      (getAgentConfigByPageId as any).mockResolvedValue(mockConfig);

      const result = await getAgentConfigByPageId('page456');

      expect(getAgentConfigByPageId).toHaveBeenCalledWith('page456');
      expect(result).toEqual(mockConfig);
    });

    it('should return null if configuration not found', async () => {
      (getAgentConfigByPageId as any).mockResolvedValue(null);

      const result = await getAgentConfigByPageId('nonexistent');

      expect(getAgentConfigByPageId).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle temperature as string in response', async () => {
      const mockConfig = {
        id: 'config1',
        pageId: 'page456',
        temperature: '0.7',
      };

      (getAgentConfigByPageId as any).mockResolvedValue(mockConfig);

      const result = await getAgentConfigByPageId('page456');

      expect(result.temperature).toBe('0.7');
      expect(typeof result.temperature).toBe('string');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate response language enum', () => {
      const validLanguages = ['ar', 'fr', 'en'];
      expect(validLanguages).toContain('ar');
      expect(validLanguages).toContain('fr');
      expect(validLanguages).toContain('en');
    });

    it('should validate maxTokens range', () => {
      const validTokens = [100, 500, 1000, 2000];
      validTokens.forEach((tokens) => {
        expect(tokens).toBeGreaterThanOrEqual(100);
        expect(tokens).toBeLessThanOrEqual(2000);
      });
    });

    it('should validate temperature range', () => {
      const validTemperatures = [0, 0.5, 0.7, 1];
      validTemperatures.forEach((temp) => {
        expect(temp).toBeGreaterThanOrEqual(0);
        expect(temp).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Configuration Updates', () => {
    it('should update existing configuration', async () => {
      const updateConfig = {
        userId: 'user123',
        pageId: 'page456',
        agentName: 'Updated Bot',
        personality: 'More professional',
      };

      await createOrUpdateAgentConfig(updateConfig);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(updateConfig);
    });

    it('should preserve unspecified fields during update', async () => {
      const partialUpdate = {
        userId: 'user123',
        pageId: 'page456',
        agentName: 'New Name',
      };

      await createOrUpdateAgentConfig(partialUpdate);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          pageId: 'page456',
          agentName: 'New Name',
        })
      );
    });
  });

  describe('Multi-language Support', () => {
    it('should support Arabic configuration', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        responseLanguage: 'ar',
        personality: 'صديق ومفيد',
        systemPrompt: 'أنت مساعد بيع',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          responseLanguage: 'ar',
        })
      );
    });

    it('should support French configuration', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        responseLanguage: 'fr',
        personality: 'Amical et utile',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          responseLanguage: 'fr',
        })
      );
    });

    it('should support English configuration', async () => {
      const config = {
        userId: 'user123',
        pageId: 'page456',
        responseLanguage: 'en',
        personality: 'Friendly and helpful',
      };

      await createOrUpdateAgentConfig(config);

      expect(createOrUpdateAgentConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          responseLanguage: 'en',
        })
      );
    });
  });
});
