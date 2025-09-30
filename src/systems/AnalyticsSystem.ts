/**
 * Comprehensive Analytics System
 * LGPD compliant analytics with performance tracking
 */

import { gameEvents, GameEventType } from './EventSystem';

// Analytics Event Types
export interface AnalyticsEvent {
  category: 'gameplay' | 'performance' | 'engagement' | 'error';
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

// Gameplay Metrics
export interface GameplayMetrics {
  sessionDuration: number;
  totalSpins: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  avgBetAmount: number;
  maxWin: number;
  featuresUsed: {
    turbo: number;
    autoSpin: number;
    maxBet: number;
  };
  gameTypes: Record<string, number>;
}

// Performance Metrics
export interface PerformanceMetrics {
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  frameDrops: number;
  loadTimes: {
    initial: number;
    assets: number[];
    gameStart: number;
  };
  memoryUsage: {
    initial: number;
    peak: number;
    current: number;
  };
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    devicePixelRatio: number;
    hardwareConcurrency: number;
  };
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }>;
}

// Engagement Metrics
export interface EngagementMetrics {
  level: number;
  experienceGained: number;
  achievementsUnlocked: string[];
  themesUsed: string[];
  dailyStreakMax: number;
  referralCount: number;
  sessionCount: number;
  firstSession: number;
  lastSession: number;
  retention: {
    d1: boolean;
    d7: boolean;
    d30: boolean;
  };
}

// LGPD Consent Management
export interface ConsentPreferences {
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

/**
 * Main Analytics System Class
 */
export class AnalyticsSystem {
  private sessionId: string;
  private userId?: string;
  private consentGiven: ConsentPreferences | null = null;
  private gameplayMetrics: GameplayMetrics;
  private performanceMetrics: PerformanceMetrics;
  private engagementMetrics: EngagementMetrics;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushInterval: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private fpsMonitor: number | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMetrics();
    this.setupEventListeners();
    this.loadConsentPreferences();
    this.startPerformanceMonitoring();
    this.setupErrorTracking();
  }

  /**
   * Initialize metrics with default values
   */
  private initializeMetrics(): void {
    this.gameplayMetrics = {
      sessionDuration: 0,
      totalSpins: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      avgBetAmount: 0,
      maxWin: 0,
      featuresUsed: {
        turbo: 0,
        autoSpin: 0,
        maxBet: 0
      },
      gameTypes: {}
    };

    this.performanceMetrics = {
      avgFPS: 0,
      minFPS: 60,
      maxFPS: 0,
      frameDrops: 0,
      loadTimes: {
        initial: performance.now(),
        assets: [],
        gameStart: 0
      },
      memoryUsage: {
        initial: this.getMemoryUsage(),
        peak: 0,
        current: 0
      },
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency || 1
      },
      errors: []
    };

    this.engagementMetrics = {
      level: 1,
      experienceGained: 0,
      achievementsUnlocked: [],
      themesUsed: [],
      dailyStreakMax: 0,
      referralCount: 0,
      sessionCount: 1,
      firstSession: Date.now(),
      lastSession: Date.now(),
      retention: {
        d1: false,
        d7: false,
        d30: false
      }
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Setup game event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    // Gameplay events
    gameEvents.on(GameEventType.SPIN_START, (data) => {
      this.gameplayMetrics.totalSpins++;
      this.trackEvent({
        category: 'gameplay',
        action: 'spin_start',
        label: data.gameId,
        value: data.betAmount,
        customParameters: { gameId: data.gameId }
      });
    });

    gameEvents.on(GameEventType.WIN, (data) => {
      this.gameplayMetrics.totalWins++;
      this.gameplayMetrics.maxWin = Math.max(this.gameplayMetrics.maxWin, data.amount);
      this.trackEvent({
        category: 'gameplay',
        action: 'win',
        label: data.gameId,
        value: data.amount,
        customParameters: {
          multiplier: data.multiplier,
          symbols: data.symbols
        }
      });
    });

    gameEvents.on(GameEventType.BIG_WIN, (data) => {
      this.trackEvent({
        category: 'gameplay',
        action: 'big_win',
        label: data.gameId,
        value: data.amount,
        customParameters: {
          multiplier: data.multiplier,
          symbols: data.symbols
        }
      });
    });

    gameEvents.on(GameEventType.JACKPOT, (data) => {
      this.trackEvent({
        category: 'gameplay',
        action: 'jackpot',
        label: data.gameId,
        value: data.amount,
        customParameters: { symbols: data.symbols }
      });
    });

    gameEvents.on(GameEventType.LEVEL_UP, (data) => {
      this.engagementMetrics.level = data.newLevel;
      this.trackEvent({
        category: 'engagement',
        action: 'level_up',
        value: data.newLevel,
        customParameters: {
          oldLevel: data.oldLevel,
          bonus: data.bonus
        }
      });
    });

    // UI events
    gameEvents.on(GameEventType.THEME_CHANGED, (data) => {
      if (data.newTheme && !this.engagementMetrics.themesUsed.includes(data.newTheme)) {
        this.engagementMetrics.themesUsed.push(data.newTheme);
      }
      this.trackEvent({
        category: 'engagement',
        action: 'theme_change',
        label: data.newTheme || 'default'
      });
    });

    // Error tracking
    gameEvents.on(GameEventType.ERROR_OCCURRED, (data) => {
      this.performanceMetrics.errors.push({
        message: data.error.message,
        stack: data.error.stack,
        timestamp: Date.now()
      });
      this.trackEvent({
        category: 'error',
        action: 'javascript_error',
        label: data.context,
        customParameters: {
          message: data.error.message,
          stack: data.error.stack?.substring(0, 500) // Limit stack trace size
        }
      });
    });
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // FPS monitoring
    let fpsValues: number[] = [];
    let lastTime = performance.now();
    
    const measureFPS = (currentTime: number) => {
      const delta = currentTime - lastTime;
      const fps = 1000 / delta;
      
      fpsValues.push(fps);
      
      if (fpsValues.length >= 60) { // Calculate every 60 frames
        const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
        this.performanceMetrics.avgFPS = avgFPS;
        this.performanceMetrics.minFPS = Math.min(this.performanceMetrics.minFPS, Math.min(...fpsValues));
        this.performanceMetrics.maxFPS = Math.max(this.performanceMetrics.maxFPS, Math.max(...fpsValues));
        
        // Count frame drops (FPS below 30)
        const frameDrops = fpsValues.filter(f => f < 30).length;
        this.performanceMetrics.frameDrops += frameDrops;
        
        fpsValues = [];
        
        // Track performance issues
        if (avgFPS < 30) {
          this.trackEvent({
            category: 'performance',
            action: 'low_fps',
            value: Math.round(avgFPS),
            customParameters: {
              minFPS: Math.min(...fpsValues),
              frameDrops
            }
          });
        }
      }
      
      lastTime = currentTime;
      this.fpsMonitor = requestAnimationFrame(measureFPS);
    };
    
    this.fpsMonitor = requestAnimationFrame(measureFPS);

    // Memory monitoring
    setInterval(() => {
      const currentMemory = this.getMemoryUsage();
      this.performanceMetrics.memoryUsage.current = currentMemory;
      this.performanceMetrics.memoryUsage.peak = Math.max(
        this.performanceMetrics.memoryUsage.peak,
        currentMemory
      );
    }, 5000);

    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.performanceMetrics.loadTimes.initial = navEntry.loadEventEnd - navEntry.fetchStart;
            
            this.trackEvent({
              category: 'performance',
              action: 'page_load',
              value: Math.round(this.performanceMetrics.loadTimes.initial),
              customParameters: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint: navEntry.loadEventStart - navEntry.fetchStart
              }
            });
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  /**
   * Setup global error tracking
   */
  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      gameEvents.emit(GameEventType.ERROR_OCCURRED, {
        error: event.error || new Error(event.message),
        context: 'global_error'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      gameEvents.emit(GameEventType.ERROR_OCCURRED, {
        error: new Error(`Unhandled Promise Rejection: ${event.reason}`),
        context: 'promise_rejection'
      });
    });
  }

  /**
   * Load consent preferences from localStorage
   */
  private loadConsentPreferences(): void {
    const stored = localStorage.getItem('analytics_consent');
    if (stored) {
      try {
        this.consentGiven = JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to load consent preferences:', error);
      }
    }
  }

  /**
   * Update consent preferences
   */
  public updateConsent(preferences: Omit<ConsentPreferences, 'timestamp' | 'version'>): void {
    this.consentGiven = {
      ...preferences,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    localStorage.setItem('analytics_consent', JSON.stringify(this.consentGiven));
    
    // Start/stop tracking based on consent
    if (preferences.analytics) {
      this.startEventFlush();
    } else {
      this.stopEventFlush();
      this.eventBuffer = []; // Clear buffer
    }
  }

  /**
   * Check if tracking is allowed
   */
  private canTrack(category: AnalyticsEvent['category']): boolean {
    if (!this.consentGiven) return false;
    
    switch (category) {
      case 'gameplay':
      case 'engagement':
        return this.consentGiven.analytics;
      case 'performance':
        return this.consentGiven.performance;
      case 'error':
        return true; // Always allow error tracking for app stability
      default:
        return false;
    }
  }

  /**
   * Track an analytics event
   */
  private trackEvent(eventData: Omit<AnalyticsEvent, 'timestamp' | 'sessionId' | 'userId'>): void {
    if (!this.canTrack(eventData.category)) return;
    
    const event: AnalyticsEvent = {
      ...eventData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };
    
    this.eventBuffer.push(event);
    
    // Flush immediately for critical events
    if (eventData.action === 'javascript_error' || eventData.action === 'jackpot') {
      this.flushEvents();
    }
  }

  /**
   * Start automatic event flushing
   */
  private startEventFlush(): void {
    if (this.flushInterval) return;
    
    this.flushInterval = window.setInterval(() => {
      this.flushEvents();
    }, 10000); // Flush every 10 seconds
  }

  /**
   * Stop automatic event flushing
   */
  private stopEventFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Flush events to external analytics service
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;
    
    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];
    
    try {
      // Send to Google Analytics 4
      if (typeof (window as any).gtag !== 'undefined') {
        eventsToFlush.forEach(event => {
          (window as any).gtag('event', event.action, {
            event_category: event.category,
            event_label: event.label,
            value: event.value,
            session_id: event.sessionId,
            user_id: event.userId,
            custom_parameters: event.customParameters
          });
        });
      }
      
      // Send to custom analytics endpoint (if available)
      if (process.env.VITE_ANALYTICS_ENDPOINT) {
        await fetch(process.env.VITE_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: eventsToFlush,
            metrics: this.getMetricsSummary()
          })
        });
      }
      
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Put events back in buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Get current metrics summary
   */
  public getMetricsSummary() {
    return {
      gameplay: this.gameplayMetrics,
      performance: this.performanceMetrics,
      engagement: this.engagementMetrics,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
  }

  /**
   * Export analytics data for dashboard
   */
  public exportData() {
    return {
      ...this.getMetricsSummary(),
      events: this.eventBuffer,
      consent: this.consentGiven
    };
  }

  /**
   * Manually track custom event
   */
  public track(eventData: Omit<AnalyticsEvent, 'timestamp' | 'sessionId' | 'userId'>): void {
    this.trackEvent(eventData);
  }

  /**
   * Set user ID for tracking
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopEventFlush();
    
    if (this.fpsMonitor) {
      cancelAnimationFrame(this.fpsMonitor);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Final flush
    this.flushEvents();
  }
}

// Singleton instance
export const analyticsSystem = new AnalyticsSystem();

// React hooks
import { useEffect, useState } from 'react';

export const useAnalytics = () => {
  return {
    track: analyticsSystem.track.bind(analyticsSystem),
    setUserId: analyticsSystem.setUserId.bind(analyticsSystem),
    updateConsent: analyticsSystem.updateConsent.bind(analyticsSystem),
    getMetrics: analyticsSystem.getMetricsSummary.bind(analyticsSystem),
    exportData: analyticsSystem.exportData.bind(analyticsSystem)
  };
};

export const useAnalyticsMetrics = () => {
  const [metrics, setMetrics] = useState(analyticsSystem.getMetricsSummary());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(analyticsSystem.getMetricsSummary());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};