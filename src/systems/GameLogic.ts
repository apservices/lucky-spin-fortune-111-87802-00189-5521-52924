/**
 * Core Game Logic System
 * Contains all business logic for game mechanics
 */

import { gameEvents, GameEventType } from './EventSystem';
import { useLocalization } from '@/hooks/useLocalization';
import { configSystem } from './ConfigSystem';

// Symbol definitions
export interface GameSymbol {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseValue: number;
  multipliers: number[];
  winSound?: string;
}

export const GAME_SYMBOLS: Record<string, GameSymbol> = {
  // Common symbols (60% chance)
  envelope: {
    id: 'envelope',
    name: 'Envelope',
    emoji: '✉️',
    rarity: 'common',
    baseValue: 5,
    multipliers: [1, 2, 3, 5],
    winSound: 'coin_small'
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    rarity: 'common',
    baseValue: 8,
    multipliers: [1, 2, 4, 6],
    winSound: 'coin_small'
  },
  frog: {
    id: 'frog',
    name: 'Frog',
    emoji: '🐸',
    rarity: 'common',
    baseValue: 10,
    multipliers: [1, 3, 5, 8],
    winSound: 'coin_medium'
  },
  
  // Rare symbols (25% chance)
  fox: {
    id: 'fox',
    name: 'Fox',
    emoji: '🦊',
    rarity: 'rare',
    baseValue: 15,
    multipliers: [2, 5, 8, 12],
    winSound: 'coin_medium'
  },
  scroll: {
    id: 'scroll',
    name: 'Scroll',
    emoji: '📜',
    rarity: 'rare',
    baseValue: 20,
    multipliers: [2, 6, 10, 15],
    winSound: 'coin_large'
  },
  
  // Epic symbols (12% chance)
  tiger: {
    id: 'tiger',
    name: 'Tiger',
    emoji: '🐯',
    rarity: 'epic',
    baseValue: 50,
    multipliers: [3, 8, 15, 25],
    winSound: 'win_big'
  },
  
  // Legendary symbols (3% chance)
  dragon: {
    id: 'dragon',
    name: 'Golden Dragon',
    emoji: '🐲',
    rarity: 'legendary',
    baseValue: 100,
    multipliers: [5, 15, 30, 50],
    winSound: 'jackpot'
  }
};

// Game configuration
export interface GameConfig {
  gridSize: { rows: number; cols: number };
  minWinLength: number;
  maxWinLength: number;
  baseSpinCost: number;
  energyCost: number;
  baseXPReward: number;
  jackpotThreshold: number;
  bigWinThreshold: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: { rows: 3, cols: 5 },
  minWinLength: 3,
  maxWinLength: 5,
  baseSpinCost: 0, // Free to play
  energyCost: 1,
  baseXPReward: 10,
  jackpotThreshold: 5000,
  bigWinThreshold: 1000
};

// Spin result types
export interface SpinResult {
  symbols: string[][];
  winLines: WinLine[];
  totalWin: number;
  multiplier: number;
  isJackpot: boolean;
  isBigWin: boolean;
  experienceGained: number;
}

export interface WinLine {
  symbols: string[];
  positions: Array<{ row: number; col: number }>;
  payout: number;
  multiplier: number;
}

/**
 * Core Game Logic Class
 */
export class GameLogic {
  private config: GameConfig;
  private rng: () => number;

  constructor(config: GameConfig = DEFAULT_GAME_CONFIG) {
    this.config = config;
    this.rng = Math.random; // Can be replaced with seeded RNG for testing
  }

  /**
   * Generate symbol weights based on configuration
   */
   private getSymbolWeights(): Array<{ symbol: GameSymbol; weight: number }> {
    // Use default probabilities if config is not loaded
    const defaultProbabilities: Record<string, number> = {
      'tiger': 0.02,
      'fox': 0.08,
      'frog': 0.12,
      'envelope': 0.18,
      'orange': 0.25,
      'scroll': 0.15
    };
    
    let probabilities = defaultProbabilities;
    try {
      if (configSystem.isConfigLoaded()) {
        probabilities = configSystem.getSymbolProbabilities();
      }
    } catch (error) {
      console.warn('Failed to get symbol probabilities from config, using defaults');
    }
    
    return Object.values(GAME_SYMBOLS).map(symbol => ({
      symbol,
      weight: probabilities[symbol.id] || 0.01 // Fallback weight
    }));
  }

  /**
   * Select a random symbol based on weighted probabilities
   */
  private selectRandomSymbol(): GameSymbol {
    const weights = this.getSymbolWeights();
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    
    let random = this.rng() * totalWeight;
    
    for (const { symbol, weight } of weights) {
      random -= weight;
      if (random <= 0) {
        return symbol;
      }
    }
    
    // Fallback to first symbol
    return weights[0].symbol;
  }

  /**
   * Generate a random grid of symbols
   */
  private generateSymbolGrid(): string[][] {
    const { rows, cols } = this.config.gridSize;
    const grid: string[][] = [];
    
    for (let row = 0; row < rows; row++) {
      grid[row] = [];
      for (let col = 0; col < cols; col++) {
        const symbol = this.selectRandomSymbol();
        grid[row][col] = symbol.id;
      }
    }
    
    return grid;
  }

  /**
   * Check for winning lines in the grid
   */
  private findWinLines(grid: string[][]): WinLine[] {
    const winLines: WinLine[] = [];
    const { rows, cols } = this.config.gridSize;
    
    // Check horizontal lines
    for (let row = 0; row < rows; row++) {
      for (let startCol = 0; startCol <= cols - this.config.minWinLength; startCol++) {
        const firstSymbol = grid[row][startCol];
        let length = 1;
        
        // Count consecutive matching symbols
        for (let col = startCol + 1; col < cols && grid[row][col] === firstSymbol; col++) {
          length++;
        }
        
        // Check if it's a winning line
        if (length >= this.config.minWinLength) {
          const positions = Array.from({ length }, (_, i) => ({
            row,
            col: startCol + i
          }));
          
          const symbol = GAME_SYMBOLS[firstSymbol];
          const multiplier = symbol.multipliers[Math.min(length - this.config.minWinLength, symbol.multipliers.length - 1)];
          const payout = symbol.baseValue * multiplier;
          
          winLines.push({
            symbols: Array(length).fill(firstSymbol),
            positions,
            payout,
            multiplier
          });
        }
      }
    }
    
    // Check vertical lines
    for (let col = 0; col < cols; col++) {
      for (let startRow = 0; startRow <= rows - this.config.minWinLength; startRow++) {
        const firstSymbol = grid[startRow][col];
        let length = 1;
        
        // Count consecutive matching symbols
        for (let row = startRow + 1; row < rows && grid[row][col] === firstSymbol; row++) {
          length++;
        }
        
        // Check if it's a winning line
        if (length >= this.config.minWinLength) {
          const positions = Array.from({ length }, (_, i) => ({
            row: startRow + i,
            col
          }));
          
          const symbol = GAME_SYMBOLS[firstSymbol];
          const multiplier = symbol.multipliers[Math.min(length - this.config.minWinLength, symbol.multipliers.length - 1)];
          const payout = symbol.baseValue * multiplier;
          
          winLines.push({
            symbols: Array(length).fill(firstSymbol),
            positions,
            payout,
            multiplier
          });
        }
      }
    }
    
    // Check diagonal lines (left to right)
    for (let startRow = 0; startRow <= rows - this.config.minWinLength; startRow++) {
      for (let startCol = 0; startCol <= cols - this.config.minWinLength; startCol++) {
        const firstSymbol = grid[startRow][startCol];
        let length = 1;
        
        // Count consecutive matching symbols
        for (let i = 1; 
             startRow + i < rows && startCol + i < cols && 
             grid[startRow + i][startCol + i] === firstSymbol; 
             i++) {
          length++;
        }
        
        // Check if it's a winning line
        if (length >= this.config.minWinLength) {
          const positions = Array.from({ length }, (_, i) => ({
            row: startRow + i,
            col: startCol + i
          }));
          
          const symbol = GAME_SYMBOLS[firstSymbol];
          const multiplier = symbol.multipliers[Math.min(length - this.config.minWinLength, symbol.multipliers.length - 1)];
          const payout = symbol.baseValue * multiplier;
          
          winLines.push({
            symbols: Array(length).fill(firstSymbol),
            positions,
            payout,
            multiplier
          });
        }
      }
    }
    
    return winLines;
  }

  /**
   * Calculate bonus multipliers based on various factors
   */
  private calculateBonusMultiplier(winLines: WinLine[], playerLevel: number): number {
    let multiplier = 1;
    
    // Level-based multiplier (small bonus)
    multiplier += (playerLevel - 1) * 0.01;
    
    // Multiple win lines bonus
    if (winLines.length > 1) {
      multiplier += (winLines.length - 1) * 0.1;
    }
    
    // Lucky number bonus (small chance)
    if (this.rng() < 0.05) { // 5% chance
      multiplier += 0.5;
    }
    
    // Legendary symbol bonus
    const hasLegendary = winLines.some(line => 
      line.symbols.some(symbolId => GAME_SYMBOLS[symbolId]?.rarity === 'legendary')
    );
    if (hasLegendary) {
      multiplier += 1.0;
    }
    
    return Math.max(1, Math.min(multiplier, 5)); // Cap at 5x
  }

  /**
   * Perform a spin and return the result
   */
  public spin(playerLevel: number = 1, gameId: string = 'default'): SpinResult {
    // Emit spin start event
    gameEvents.emit(GameEventType.SPIN_START, {
      gameId,
      betAmount: this.config.baseSpinCost,
      timestamp: Date.now()
    });
    
    // Generate symbol grid
    const symbols = this.generateSymbolGrid();
    
    // Find winning lines
    const winLines = this.findWinLines(symbols);
    
    // Calculate total win
    const baseWin = winLines.reduce((total, line) => total + line.payout, 0);
    
    // Apply bonus multipliers
    const bonusMultiplier = this.calculateBonusMultiplier(winLines, playerLevel);
    const totalWin = Math.floor(baseWin * bonusMultiplier);
    
    // Determine win type
    const isJackpot = totalWin >= this.config.jackpotThreshold;
    const isBigWin = totalWin >= this.config.bigWinThreshold;
    
    // Calculate experience gained
    const baseXP = this.config.baseXPReward;
    const xpMultiplier = 1 + (winLines.length * 0.1) + (isBigWin ? 0.5 : 0) + (isJackpot ? 1.0 : 0);
    const experienceGained = Math.floor(baseXP * xpMultiplier);
    
    const result: SpinResult = {
      symbols,
      winLines,
      totalWin,
      multiplier: bonusMultiplier,
      isJackpot,
      isBigWin,
      experienceGained
    };
    
    // Emit appropriate events
    gameEvents.emit(GameEventType.SPIN_COMPLETE, {
      gameId,
      result,
      timestamp: Date.now()
    });
    
    if (totalWin > 0) {
      if (isJackpot) {
        gameEvents.emit(GameEventType.JACKPOT, {
          amount: totalWin,
          symbols: winLines.map(line => line.symbols[0]),
          gameId
        });
      } else if (isBigWin) {
        gameEvents.emit(GameEventType.BIG_WIN, {
          amount: totalWin,
          multiplier: bonusMultiplier,
          symbols: winLines.map(line => line.symbols[0]),
          gameId
        });
      } else {
        gameEvents.emit(GameEventType.WIN, {
          amount: totalWin,
          multiplier: bonusMultiplier,
          symbols: winLines.map(line => line.symbols[0]),
          gameId
        });
      }
    }
    
    return result;
  }

  /**
   * Calculate RTP (Return to Player) percentage
   * Optimized to avoid blocking the UI
   */
  public calculateRTP(sampleSize: number = 1000, playerLevel: number = 1): number {
    // Quick theoretical RTP calculation based on symbol probabilities
    const weights = this.getSymbolWeights();
    let expectedValue = 0;
    
    // Calculate expected value based on symbol probabilities and multipliers
    weights.forEach(({ symbol, weight }) => {
      const avgMultiplier = symbol.multipliers.reduce((a, b) => a + b, 0) / symbol.multipliers.length;
      expectedValue += weight * avgMultiplier;
    });
    
    // Apply level-based RTP adjustment
    const levelMultiplier = Math.min(1 + (playerLevel - 1) * 0.01, 1.2); // Max 20% bonus
    return Math.min(expectedValue * levelMultiplier * 100, 95); // Cap at 95%
  }

  /**
   * Get symbol information
   */
  public getSymbolInfo(symbolId: string): GameSymbol | undefined {
    return GAME_SYMBOLS[symbolId];
  }

  /**
   * Get all symbols by rarity
   */
  public getSymbolsByRarity(rarity: GameSymbol['rarity']): GameSymbol[] {
    return Object.values(GAME_SYMBOLS).filter(symbol => symbol.rarity === rarity);
  }

  /**
   * Update game configuration
   */
  public updateConfig(newConfig: Partial<GameConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): GameConfig {
    return { ...this.config };
  }
}

// Default game logic instance
export const gameLogic = new GameLogic();

// React hook for using game logic
import { useMemo } from 'react';

export const useGameLogic = (config?: Partial<GameConfig>) => {
  return useMemo(() => {
    if (config) {
      const customLogic = new GameLogic({ ...DEFAULT_GAME_CONFIG, ...config });
      return customLogic;
    }
    return gameLogic;
  }, [config]);
};