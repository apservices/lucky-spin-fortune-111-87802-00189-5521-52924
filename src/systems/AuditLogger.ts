/**
 * Comprehensive Audit Logging System
 * Tracks all game events for compliance and analysis
 */

import { createClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  userId: string; // Anonymized hash
  action: string;
  data: Record<string, any>;
  sessionId: string;
  deviceInfo?: {
    userAgent: string;
    screen: string;
    language: string;
  };
}

export interface SpinLogData {
  bet: number;
  result: string[];
  win: number;
  balanceBefore: number;
  balanceAfter: number;
  rtp: number;
  sessionTime: number;
  symbols: { [key: string]: number };
}

export interface SessionMetrics {
  userId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalSpins: number;
  totalBet: number;
  totalWin: number;
  netResult: number;
  avgBet: number;
  maxWin: number;
  featuresUsed: string[];
}

class AuditLoggerSystem {
  private supabase: any;
  private sessionId: string;
  private userId: string;
  private sessionMetrics: SessionMetrics;
  private logQueue: AuditLogEntry[] = [];
  private isOnline: boolean = navigator.onLine;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.generateUserId();
    this.initializeSupabase();
    this.initializeSession();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  private initializeSupabase() {
    try {
      // This would use actual Supabase credentials in production
      // For now, we'll simulate the connection
      this.supabase = {
        from: (table: string) => ({
          insert: (data: any) => Promise.resolve({ data, error: null })
        })
      };
    } catch (error) {
      console.warn('Failed to initialize audit logging:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserId(): string {
    // Create anonymous but consistent user ID
    let userId = localStorage.getItem('audit_user_id');
    if (!userId) {
      userId = `user_${this.hashString(navigator.userAgent + Date.now().toString())}`;
      localStorage.setItem('audit_user_id', userId);
    }
    return userId;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private initializeSession() {
    this.sessionMetrics = {
      userId: this.userId,
      sessionId: this.sessionId,
      startTime: Date.now(),
      totalSpins: 0,
      totalBet: 0,
      totalWin: 0,
      netResult: 0,
      avgBet: 0,
      maxWin: 0,
      featuresUsed: []
    };

    this.log('session_start', {
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    });
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushLogs();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    window.addEventListener('beforeunload', () => {
      this.endSession();
      this.flushLogsSync();
    });
  }

  private startPeriodicFlush() {
    setInterval(() => {
      if (this.isOnline && this.logQueue.length > 0) {
        this.flushLogs();
      }
    }, 30000); // Flush every 30 seconds
  }

  private async flushLogs() {
    if (this.logQueue.length === 0) return;

    try {
      const logsToSend = [...this.logQueue];
      this.logQueue = [];

      // In production, this would actually send to Supabase
      console.log('Flushing audit logs:', logsToSend.length, 'entries');
      
      // Simulate API call
      await this.supabase?.from('audit_logs').insert(logsToSend);
      
      // Also store locally as backup
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs_backup') || '[]');
      existingLogs.push(...logsToSend);
      
      // Keep only last 1000 entries locally
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('audit_logs_backup', JSON.stringify(existingLogs));
      
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-queue failed logs
      this.logQueue = [...this.logQueue, ...this.logQueue];
    }
  }

  private flushLogsSync() {
    // Synchronous version for beforeunload
    if (this.logQueue.length === 0) return;

    try {
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs_backup') || '[]');
      existingLogs.push(...this.logQueue);
      localStorage.setItem('audit_logs_backup', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to save logs before unload:', error);
    }
  }

  // Public logging methods
  public log(action: string, data: Record<string, any>) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action,
      data,
      sessionId: this.sessionId,
      deviceInfo: action === 'session_start' ? this.getDeviceInfo() : undefined
    };

    this.logQueue.push(entry);

    // Auto-flush if queue is getting large
    if (this.logQueue.length >= 50) {
      this.flushLogs();
    }
  }

  public logSpin(spinData: SpinLogData) {
    // Update session metrics
    this.sessionMetrics.totalSpins++;
    this.sessionMetrics.totalBet += spinData.bet;
    this.sessionMetrics.totalWin += spinData.win;
    this.sessionMetrics.netResult = this.sessionMetrics.totalWin - this.sessionMetrics.totalBet;
    this.sessionMetrics.avgBet = this.sessionMetrics.totalBet / this.sessionMetrics.totalSpins;
    this.sessionMetrics.maxWin = Math.max(this.sessionMetrics.maxWin, spinData.win);

    this.log('spin', spinData);
  }

  public logBalanceChange(type: 'add' | 'spend' | 'win', amount: number, reason: string) {
    this.log('balance_change', {
      type,
      amount,
      reason,
      timestamp: Date.now()
    });
  }

  public logFeatureUsed(feature: string, data?: Record<string, any>) {
    if (!this.sessionMetrics.featuresUsed.includes(feature)) {
      this.sessionMetrics.featuresUsed.push(feature);
    }

    this.log('feature_used', {
      feature,
      ...data,
      timestamp: Date.now()
    });
  }

  public logSettingsChange(setting: string, oldValue: any, newValue: any) {
    this.log('settings_change', {
      setting,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
  }

  public logAlert(alertType: string, message: string, action?: string) {
    this.log('alert', {
      alertType,
      message,
      action,
      timestamp: Date.now()
    });
  }

  public logPageView(page: string) {
    this.log('page_view', {
      page,
      timestamp: Date.now(),
      referrer: document.referrer
    });
  }

  public endSession() {
    this.sessionMetrics.endTime = Date.now();
    
    this.log('session_end', {
      ...this.sessionMetrics,
      duration: this.sessionMetrics.endTime - this.sessionMetrics.startTime
    });
  }

  // Analytics methods
  public getSessionMetrics(): SessionMetrics {
    return { ...this.sessionMetrics };
  }

  public async getRecentLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    // In production, this would query Supabase
    const backupLogs = JSON.parse(localStorage.getItem('audit_logs_backup') || '[]');
    return backupLogs.slice(-limit);
  }

  public async analyzeRTP(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    targetRTP: number;
    actualRTP: number;
    variance: number;
    compliant: boolean;
  }> {
    const logs = await this.getRecentLogs(1000);
    const spinLogs = logs.filter(log => log.action === 'spin');
    
    if (spinLogs.length === 0) {
      return { targetRTP: 0.9, actualRTP: 0, variance: 0, compliant: true };
    }

    const totalBet = spinLogs.reduce((sum, log) => sum + (log.data.bet || 0), 0);
    const totalWin = spinLogs.reduce((sum, log) => sum + (log.data.win || 0), 0);
    const actualRTP = totalBet > 0 ? totalWin / totalBet : 0;
    const targetRTP = 0.9; // From config
    const variance = Math.abs(actualRTP - targetRTP);
    const compliant = variance <= 0.03; // 3% tolerance

    return {
      targetRTP,
      actualRTP,
      variance,
      compliant
    };
  }

  public async generateComplianceReport(): Promise<{
    period: string;
    totalSpins: number;
    rtpAnalysis: any;
    alertsSummary: any;
    recommendations: string[];
  }> {
    const rtpAnalysis = await this.analyzeRTP();
    const logs = await this.getRecentLogs(1000);
    const alertLogs = logs.filter(log => log.action === 'alert');

    return {
      period: '24h',
      totalSpins: logs.filter(log => log.action === 'spin').length,
      rtpAnalysis,
      alertsSummary: {
        total: alertLogs.length,
        byType: alertLogs.reduce((acc, log) => {
          const type = log.data.alertType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      recommendations: [
        rtpAnalysis.compliant ? 'RTP dentro da margem aceitável' : 'RTP fora da margem - verificar algoritmo',
        alertLogs.length > 10 ? 'Alto número de alertas - revisar configurações' : 'Alertas em nível normal'
      ]
    };
  }
}

export const auditLogger = new AuditLoggerSystem();
