/**
 * Behavior Monitoring System
 * Tracks user patterns and detects anomalies for responsible gaming
 */

export interface BehaviorMetrics {
  spinsPerMinute: number;
  avgBetSize: number;
  sessionDuration: number;
  winLossRatio: number;
  repetitivePattern: boolean;
  rapidBetting: boolean;
  lastUpdate: number;
}

export interface BehaviorAlert {
  type: 'rapid_betting' | 'high_frequency' | 'bot_like' | 'excessive_session';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  metrics: Partial<BehaviorMetrics>;
}

class BehaviorMonitoringSystem {
  private spinHistory: number[] = [];
  private betHistory: { amount: number; timestamp: number; won: boolean }[] = [];
  private sessionStart: number = Date.now();
  private alerts: BehaviorAlert[] = [];
  private listeners: ((alert: BehaviorAlert) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Check behavior patterns every 30 seconds
    setInterval(() => {
      this.analyzePatterns();
    }, 30000);
  }

  /**
   * Record a spin action
   */
  public recordSpin(betAmount: number, won: boolean, winAmount: number = 0) {
    const now = Date.now();
    this.spinHistory.push(now);
    this.betHistory.push({ amount: betAmount, timestamp: now, won });

    // Keep only last hour of history
    const oneHourAgo = now - 3600000;
    this.spinHistory = this.spinHistory.filter(t => t > oneHourAgo);
    this.betHistory = this.betHistory.filter(b => b.timestamp > oneHourAgo);

    // Check for immediate red flags
    this.checkRapidBetting();
  }

  /**
   * Check for rapid betting patterns (< 1 second between spins)
   */
  private checkRapidBetting() {
    if (this.spinHistory.length < 2) return;

    const recent = this.spinHistory.slice(-5);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Alert if average interval is less than 1 second
    if (avgInterval < 1000) {
      this.addAlert({
        type: 'rapid_betting',
        severity: 'high',
        message: 'Padrão de apostas muito rápido detectado. Considere fazer pausas.',
        timestamp: Date.now(),
        metrics: { spinsPerMinute: 60000 / avgInterval }
      });
    }
  }

  /**
   * Analyze behavior patterns for anomalies
   */
  private analyzePatterns() {
    const now = Date.now();
    const last30Min = now - 1800000;

    // Recent activity
    const recentSpins = this.spinHistory.filter(t => t > last30Min);
    const recentBets = this.betHistory.filter(b => b.timestamp > last30Min);

    // Check frequency (>100 spins in 30 minutes)
    if (recentSpins.length > 100) {
      this.addAlert({
        type: 'high_frequency',
        severity: 'medium',
        message: `${recentSpins.length} giros nos últimos 30 minutos. Recomendamos uma pausa.`,
        timestamp: now,
        metrics: { spinsPerMinute: recentSpins.length / 30 }
      });
    }

    // Check for bot-like repetitive patterns
    if (this.detectRepetitivePattern(recentBets)) {
      this.addAlert({
        type: 'bot_like',
        severity: 'high',
        message: 'Padrão de apostas repetitivo detectado.',
        timestamp: now,
        metrics: { repetitivePattern: true }
      });
    }

    // Check session duration (>3 hours)
    const sessionDuration = (now - this.sessionStart) / 60000; // minutes
    if (sessionDuration > 180) {
      this.addAlert({
        type: 'excessive_session',
        severity: 'high',
        message: `Sessão ativa há ${Math.floor(sessionDuration / 60)} horas. Faça uma pausa!`,
        timestamp: now,
        metrics: { sessionDuration }
      });
    }
  }

  /**
   * Detect repetitive betting patterns
   */
  private detectRepetitivePattern(bets: typeof this.betHistory): boolean {
    if (bets.length < 10) return false;

    const amounts = bets.map(b => b.amount);
    const last10 = amounts.slice(-10);

    // Check if all bets are identical
    const allSame = last10.every(amount => amount === last10[0]);
    
    if (allSame) return true;

    // Check for simple alternating patterns
    const pattern1 = last10.filter((_, i) => i % 2 === 0).every(a => a === last10[0]);
    const pattern2 = last10.filter((_, i) => i % 2 === 1).every(a => a === last10[1]);
    
    return pattern1 && pattern2 && last10[0] !== last10[1];
  }

  /**
   * Get current behavior metrics
   */
  public getMetrics(): BehaviorMetrics {
    const now = Date.now();
    const last30Min = now - 1800000;
    
    const recentSpins = this.spinHistory.filter(t => t > last30Min);
    const recentBets = this.betHistory.filter(b => b.timestamp > last30Min);

    const totalBet = recentBets.reduce((sum, b) => sum + b.amount, 0);
    const wins = recentBets.filter(b => b.won).length;
    const losses = recentBets.length - wins;

    return {
      spinsPerMinute: recentSpins.length / 30,
      avgBetSize: recentBets.length > 0 ? totalBet / recentBets.length : 0,
      sessionDuration: (now - this.sessionStart) / 60000,
      winLossRatio: losses > 0 ? wins / losses : wins,
      repetitivePattern: this.detectRepetitivePattern(recentBets),
      rapidBetting: recentSpins.length > 0 && this.calculateAvgInterval() < 2000,
      lastUpdate: now
    };
  }

  private calculateAvgInterval(): number {
    if (this.spinHistory.length < 2) return 0;
    
    const recent = this.spinHistory.slice(-10);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  /**
   * Add a behavior alert
   */
  private addAlert(alert: BehaviorAlert) {
    // Don't duplicate alerts within 5 minutes
    const fiveMinAgo = Date.now() - 300000;
    const existingAlert = this.alerts.find(
      a => a.type === alert.type && a.timestamp > fiveMinAgo
    );

    if (existingAlert) return;

    this.alerts.push(alert);
    this.listeners.forEach(listener => listener(alert));

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  /**
   * Subscribe to behavior alerts
   */
  public subscribe(listener: (alert: BehaviorAlert) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get all alerts
   */
  public getAlerts(): BehaviorAlert[] {
    return [...this.alerts];
  }

  /**
   * Get recent alerts (last hour)
   */
  public getRecentAlerts(): BehaviorAlert[] {
    const oneHourAgo = Date.now() - 3600000;
    return this.alerts.filter(a => a.timestamp > oneHourAgo);
  }

  /**
   * Reset session
   */
  public resetSession() {
    this.spinHistory = [];
    this.betHistory = [];
    this.sessionStart = Date.now();
    this.alerts = [];
  }

  /**
   * Get audit data for logging
   */
  public getAuditData() {
    return {
      sessionStart: this.sessionStart,
      totalSpins: this.spinHistory.length,
      totalBets: this.betHistory.length,
      metrics: this.getMetrics(),
      recentAlerts: this.getRecentAlerts()
    };
  }
}

export const behaviorMonitor = new BehaviorMonitoringSystem();
