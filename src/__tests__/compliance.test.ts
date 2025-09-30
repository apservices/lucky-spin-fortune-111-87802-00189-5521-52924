/**
 * Compliance testing for game parameters and responsible gaming
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { configSystem } from '@/systems/ConfigSystem';

describe('Game Compliance Tests', () => {
  beforeAll(async () => {
    await configSystem.ensureLoaded();
  });

  describe('Probability Configuration', () => {
    it('should have symbol probabilities that sum to 1.0', () => {
      const probabilities = configSystem.getSymbolProbabilities();
      const sum = Object.values(probabilities).reduce((acc, prob) => acc + prob, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    });

    it('should have valid RTP within acceptable range', () => {
      const rtp = configSystem.getRTP(1);
      expect(rtp).toBeGreaterThanOrEqual(0.85);
      expect(rtp).toBeLessThanOrEqual(0.95);
    });
  });

  describe('Betting Limits', () => {
    it('should enforce minimum bet limits', () => {
      const limits = configSystem.getBettingLimits();
      expect(limits.minBet).toBeGreaterThan(0);
    });

    it('should have reasonable daily limits', () => {
      const limits = configSystem.getBettingLimits();
      expect(limits.dailyLimit).toBeGreaterThan(0);
      expect(limits.dailyLimit).toBeLessThan(100000);
    });
  });

  describe('Responsible Gaming', () => {
    it('should have mandatory break intervals', () => {
      const settings = configSystem.getResponsibleGamingSettings();
      expect(settings.alertIntervals.length).toBeGreaterThan(0);
      expect(settings.maxContinuousMinutes).toBeGreaterThan(0);
    });
  });
});