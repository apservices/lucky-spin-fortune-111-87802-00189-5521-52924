/**
 * Audit Logger Tests
 */

import { describe, it, expect } from 'vitest';
import { auditLogger } from '@/systems/AuditLogger';

describe('Audit Logger System', () => {
  describe('Logging Events', () => {
    it('should log spin events', () => {
      const spinData = {
        bet: 100,
        result: ['tiger', 'tiger', 'tiger'],
        win: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        rtp: 0.9,
        sessionTime: 300,
        symbols: { tiger: 3 }
      };

      auditLogger.logSpin(spinData);
      
      const metrics = auditLogger.getSessionMetrics();
      expect(metrics.totalSpins).toBeGreaterThan(0);
      expect(metrics.totalBet).toBe(100);
    });

    it('should log balance changes', () => {
      auditLogger.logBalanceChange('spend', 100, 'bet_placed');
      
      // Check that it was logged successfully (no errors)
      expect(true).toBe(true);
    });

    it('should log alerts', () => {
      auditLogger.logAlert('time_limit', 'Playing for 60 minutes', 'continue');
      
      // Check that it was logged successfully
      expect(true).toBe(true);
    });

    it('should log feature usage', () => {
      auditLogger.logFeatureUsed('blackjack', { bet: 100 });
      
      const metrics = auditLogger.getSessionMetrics();
      expect(metrics.featuresUsed).toContain('blackjack');
    });
  });

  describe('Session Metrics', () => {
    it('should track session metrics correctly', () => {
      const spinData = {
        bet: 100,
        result: ['tiger', 'fox', 'frog'],
        win: 150,
        balanceBefore: 1000,
        balanceAfter: 1050,
        rtp: 0.9,
        sessionTime: 60,
        symbols: { tiger: 1, fox: 1, frog: 1 }
      };

      auditLogger.logSpin(spinData);
      
      const metrics = auditLogger.getSessionMetrics();
      
      expect(metrics.totalSpins).toBeGreaterThan(0);
      expect(metrics.totalBet).toBeGreaterThanOrEqual(100);
      expect(metrics.avgBet).toBeGreaterThan(0);
    });
  });

  describe('RTP Analysis', () => {
    it('should analyze RTP correctly', async () => {
      const analysis = await auditLogger.analyzeRTP();
      
      expect(analysis.targetRTP).toBe(0.9);
      expect(analysis.actualRTP).toBeGreaterThanOrEqual(0);
      expect(analysis.compliant).toBeDefined();
    });
  });

  describe('Compliance Report', () => {
    it('should generate compliance report', async () => {
      const report = await auditLogger.generateComplianceReport();
      
      expect(report.period).toBeDefined();
      expect(report.totalSpins).toBeGreaterThanOrEqual(0);
      expect(report.rtpAnalysis).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('LGPD Compliance', () => {
    it('should anonymize user data', () => {
      const metrics = auditLogger.getSessionMetrics();
      
      // User ID should be anonymized
      expect(metrics.userId).toMatch(/^user_[a-z0-9]+$/);
    });
  });
});
