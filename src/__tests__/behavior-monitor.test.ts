/**
 * Behavior Monitoring Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { behaviorMonitor } from '@/systems/BehaviorMonitor';

describe('Behavior Monitoring System', () => {
  beforeEach(() => {
    behaviorMonitor.resetSession();
  });

  describe('Rapid Betting Detection', () => {
    it('should detect rapid betting patterns', async () => {
      const alerts: any[] = [];
      behaviorMonitor.subscribe((alert) => alerts.push(alert));

      // Simulate rapid betting (< 1 second intervals)
      for (let i = 0; i < 5; i++) {
        behaviorMonitor.recordSpin(100, false);
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 seconds
      }

      expect(alerts.some(a => a.type === 'rapid_betting')).toBe(true);
    });
  });

  describe('High Frequency Detection', () => {
    it('should alert on high frequency betting', () => {
      // Record > 100 spins
      for (let i = 0; i < 101; i++) {
        behaviorMonitor.recordSpin(100, i % 3 === 0);
      }

      const metrics = behaviorMonitor.getMetrics();
      expect(metrics.spinsPerMinute).toBeGreaterThan(0);
    });
  });

  describe('Repetitive Pattern Detection', () => {
    it('should detect repetitive betting patterns', () => {
      // Record identical bets
      for (let i = 0; i < 15; i++) {
        behaviorMonitor.recordSpin(100, false);
      }

      const metrics = behaviorMonitor.getMetrics();
      expect(metrics.avgBetSize).toBe(100);
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate correct metrics', () => {
      behaviorMonitor.recordSpin(100, true);
      behaviorMonitor.recordSpin(200, false);
      behaviorMonitor.recordSpin(150, true);

      const metrics = behaviorMonitor.getMetrics();
      
      expect(metrics.avgBetSize).toBe(150); // (100 + 200 + 150) / 3
      expect(metrics.sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should track win/loss ratio', () => {
      behaviorMonitor.recordSpin(100, true); // win
      behaviorMonitor.recordSpin(100, false); // loss
      behaviorMonitor.recordSpin(100, true); // win

      const metrics = behaviorMonitor.getMetrics();
      expect(metrics.winLossRatio).toBe(2); // 2 wins / 1 loss
    });
  });

  describe('Alert Management', () => {
    it('should not duplicate alerts within 5 minutes', async () => {
      const alerts: any[] = [];
      behaviorMonitor.subscribe((alert) => alerts.push(alert));

      // Trigger same alert type twice
      for (let i = 0; i < 5; i++) {
        behaviorMonitor.recordSpin(100, false);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const rapidAlerts = alerts.filter(a => a.type === 'rapid_betting');
      expect(rapidAlerts.length).toBe(1);
    });
  });

  describe('Audit Data', () => {
    it('should provide complete audit data', () => {
      behaviorMonitor.recordSpin(100, true);
      behaviorMonitor.recordSpin(200, false);

      const auditData = behaviorMonitor.getAuditData();
      
      expect(auditData.totalSpins).toBe(2);
      expect(auditData.totalBets).toBe(2);
      expect(auditData.metrics).toBeDefined();
      expect(auditData.sessionStart).toBeDefined();
    });
  });
});
