/**
 * Centralized Configuration System
 * Loads and validates game parameters from config/gameParameters.json
 */

interface GameParametersConfig {
  rtp: {
    base: number;
    byLevel: Record<string, number>;
  };
  symbolProbabilities: Record<string, number>;
  multipliers: Record<string, number[]>;
  bettingLimits: {
    minBet: number;
    maxBetMultiplier: number;
    dailyLimit: number;
    cooldownSeconds: number;
    maxSessionMinutes: number;
  };
  responsibleGaming: {
    alertIntervals: number[];
    maxContinuousMinutes: number;
    dailyLimitWarning: number;
    maxSpinsPer30Min: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class ConfigurationSystem {
  private config: GameParametersConfig | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from JSON file
   */
  private async loadConfig(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.doLoadConfig();
    return this.loadPromise;
  }

  private async doLoadConfig(): Promise<void> {
    try {
      const response = await fetch('/config/gameParameters.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      const config = await response.json();
      const validation = this.validateConfig(config);
      
      if (!validation.isValid) {
        console.error('Configuration validation failed:', validation.errors);
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:', validation.warnings);
      }

      this.config = config;
      this.isLoaded = true;
      
      console.log('✅ Game configuration loaded and validated successfully');
      console.log('📊 RTP Base:', config.rtp.base);
      console.log('🎰 Symbol probabilities sum:', this.getSymbolProbabilitiesSum());
      console.log('⚠️ Betting limits:', config.bettingLimits);
      
    } catch (error) {
      console.error('Failed to load game configuration:', error);
      // Use fallback configuration
      this.config = this.getFallbackConfig();
      this.isLoaded = true;
      console.warn('⚠️ Using fallback configuration');
    }
  }

  /**
   * Validate configuration parameters
   */
  private validateConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate RTP
    if (!config.rtp || typeof config.rtp.base !== 'number') {
      errors.push('Invalid RTP base configuration');
    } else if (config.rtp.base < 0.85 || config.rtp.base > 0.95) {
      warnings.push(`RTP base ${config.rtp.base} is outside recommended range (0.85-0.95)`);
    }

    // Validate symbol probabilities
    if (!config.symbolProbabilities) {
      errors.push('Missing symbol probabilities configuration');
    } else {
      const symbolProbs = config.symbolProbabilities as Record<string, any>;
      const probSum = Object.values(symbolProbs)
        .reduce((sum: number, prob: any) => {
          const numProb = typeof prob === 'number' ? prob : 0;
          return sum + numProb;
        }, 0);
      
      const tolerance = 0.001;
      if (Math.abs(probSum - 1.0) > tolerance) {
        errors.push(`Symbol probabilities sum to ${probSum.toFixed(4)}, must equal 1.0 (±${tolerance})`);
      }

      // Check individual probabilities
      Object.entries(config.symbolProbabilities).forEach(([symbol, prob]) => {
        const probability = Number(prob);
        if (typeof prob !== 'number' || probability < 0 || probability > 1) {
          errors.push(`Invalid probability for symbol ${symbol}: ${prob}`);
        }
      });
    }

    // Validate multipliers
    if (!config.multipliers) {
      errors.push('Missing multipliers configuration');
    } else {
      Object.entries(config.multipliers).forEach(([symbol, multipliers]: [string, any]) => {
        if (!Array.isArray(multipliers) || multipliers.length === 0) {
          errors.push(`Invalid multipliers for symbol ${symbol}`);
        } else {
          multipliers.forEach((mult, index) => {
            if (typeof mult !== 'number' || mult <= 0) {
              errors.push(`Invalid multiplier at index ${index} for symbol ${symbol}: ${mult}`);
            }
          });
        }
      });
    }

    // Validate betting limits
    if (!config.bettingLimits) {
      errors.push('Missing betting limits configuration');
    } else {
      const limits = config.bettingLimits;
      if (typeof limits.minBet !== 'number' || limits.minBet <= 0) {
        errors.push(`Invalid minBet: ${limits.minBet}`);
      }
      if (typeof limits.maxBetMultiplier !== 'number' || limits.maxBetMultiplier <= 0 || limits.maxBetMultiplier > 1) {
        errors.push(`Invalid maxBetMultiplier: ${limits.maxBetMultiplier}`);
      }
      if (typeof limits.dailyLimit !== 'number' || limits.dailyLimit <= 0) {
        errors.push(`Invalid dailyLimit: ${limits.dailyLimit}`);
      }
    }

    // Validate responsible gaming
    if (!config.responsibleGaming) {
      errors.push('Missing responsible gaming configuration');
    } else {
      const rg = config.responsibleGaming;
      if (!Array.isArray(rg.alertIntervals) || rg.alertIntervals.length === 0) {
        errors.push('Invalid alertIntervals configuration');
      }
      if (typeof rg.maxContinuousMinutes !== 'number' || rg.maxContinuousMinutes <= 0) {
        errors.push(`Invalid maxContinuousMinutes: ${rg.maxContinuousMinutes}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get fallback configuration for emergency use
   */
  private getFallbackConfig(): GameParametersConfig {
    return {
      rtp: {
        base: 0.90,
        byLevel: {
          "1-5": 0.88,
          "6-10": 0.90,
          "11-15": 0.92,
          "16+": 0.94
        }
      },
      symbolProbabilities: {
        tiger: 0.02,
        fox: 0.08,
        frog: 0.12,
        envelope: 0.18,
        orange: 0.25,
        scroll: 0.15
      },
      multipliers: {
        tiger: [50, 100, 500],
        fox: [20, 40, 80],
        frog: [15, 30, 60],
        envelope: [12, 24, 48],
        orange: [8, 16, 32],
        scroll: [25, 50, 100]
      },
      bettingLimits: {
        minBet: 25,
        maxBetMultiplier: 0.10,
        dailyLimit: 50000,
        cooldownSeconds: 3,
        maxSessionMinutes: 120
      },
      responsibleGaming: {
        alertIntervals: [30, 60, 90],
        maxContinuousMinutes: 120,
        dailyLimitWarning: 0.80,
        maxSpinsPer30Min: 100
      }
    };
  }

  /**
   * Ensure config is loaded before access
   */
  public async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
  }

  /**
   * Get RTP for specific player level
   */
  public getRTP(playerLevel: number = 1): number {
    if (!this.config) return 0.90;

    // Check level-based RTP
    for (const [levelRange, rtp] of Object.entries(this.config.rtp.byLevel)) {
      if (levelRange.includes('-')) {
        const [min, max] = levelRange.split('-').map(Number);
        if (playerLevel >= min && playerLevel <= max) {
          return rtp;
        }
      } else if (levelRange.endsWith('+')) {
        const min = parseInt(levelRange.replace('+', ''));
        if (playerLevel >= min) {
          return rtp;
        }
      }
    }

    return this.config.rtp.base;
  }

  /**
   * Get symbol probability
   */
  public getSymbolProbability(symbolId: string): number {
    if (!this.config) return 0;
    return this.config.symbolProbabilities[symbolId] || 0;
  }

  /**
   * Get all symbol probabilities
   */
  public getSymbolProbabilities(): Record<string, number> {
    if (!this.config) return {};
    return { ...this.config.symbolProbabilities };
  }

  /**
   * Get multipliers for symbol
   */
  public getSymbolMultipliers(symbolId: string): number[] {
    if (!this.config) return [1];
    return this.config.multipliers[symbolId] || [1];
  }

  /**
   * Get betting limits
   */
  public getBettingLimits() {
    if (!this.config) return this.getFallbackConfig().bettingLimits;
    return { ...this.config.bettingLimits };
  }

  /**
   * Get responsible gaming settings
   */
  public getResponsibleGamingSettings() {
    if (!this.config) return this.getFallbackConfig().responsibleGaming;
    return { ...this.config.responsibleGaming };
  }

  /**
   * Get full configuration (read-only)
   */
  public getConfig(): Readonly<GameParametersConfig> | null {
    return this.config ? { ...this.config } : null;
  }

  /**
   * Check if configuration is loaded
   */
  public isConfigLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Utility: Get sum of symbol probabilities (for validation)
   */
  private getSymbolProbabilitiesSum(): number {
    if (!this.config) return 0;
    return Object.values(this.config.symbolProbabilities)
      .reduce((sum, prob) => sum + prob, 0);
  }

  /**
   * Get configuration status
   */
  public getStatus() {
    return {
      isLoaded: this.isLoaded,
      hasConfig: this.config !== null,
      symbolProbabilitiesSum: this.getSymbolProbabilitiesSum(),
      rtpBase: this.config?.rtp.base || 0
    };
  }
}

// Export singleton instance
export const configSystem = new ConfigurationSystem();
export type { GameParametersConfig, ValidationResult };