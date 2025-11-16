/**
 * Respin System - Mecânica de respin com multiplicador
 * Após um giro, há chance de ativar respin com símbolo sticky
 */

import { gameEvents, GameEventType } from './EventSystem';

export interface RespinConfig {
  activationChance: number; // 0-1 probability
  maxRespins: number;
  fullGridMultiplier: number; // Multiplicador ao preencher a grade
  minSymbolsForActivation: number;
}

export interface RespinResult {
  activated: boolean;
  stickySymbol: string | null;
  respinsCount: number;
  symbols: string[][];
  totalMultiplier: number;
  isFullGrid: boolean;
}

const DEFAULT_RESPIN_CONFIG: RespinConfig = {
  activationChance: 0.15, // 15% chance
  maxRespins: 5,
  fullGridMultiplier: 10,
  minSymbolsForActivation: 3
};

export class RespinSystem {
  private config: RespinConfig;

  constructor(config: Partial<RespinConfig> = {}) {
    this.config = { ...DEFAULT_RESPIN_CONFIG, ...config };
  }

  /**
   * Verifica se deve ativar respin baseado nos símbolos atuais
   */
  shouldActivateRespin(symbols: string[][]): { activate: boolean; stickySymbol: string | null } {
    // Chance aleatória de ativar
    if (Math.random() > this.config.activationChance) {
      return { activate: false, stickySymbol: null };
    }

    // Encontra o símbolo mais comum na grade
    const symbolCounts = new Map<string, number>();
    symbols.flat().forEach(symbol => {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    });

    // Ordena por frequência
    const sortedSymbols = Array.from(symbolCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    if (sortedSymbols.length === 0 || sortedSymbols[0][1] < this.config.minSymbolsForActivation) {
      return { activate: false, stickySymbol: null };
    }

    const stickySymbol = sortedSymbols[0][0];
    
    gameEvents.emit(GameEventType.RESPIN_ACTIVATED, { stickySymbol, count: sortedSymbols[0][1] });
    
    return { activate: true, stickySymbol };
  }

  /**
   * Executa a mecânica de respin
   */
  executeRespin(
    initialSymbols: string[][],
    stickySymbol: string,
    generateSymbol: () => string
  ): RespinResult {
    let currentSymbols = JSON.parse(JSON.stringify(initialSymbols)) as string[][];
    let respinsCount = 0;
    let continueRespin = true;

    // Marca posições sticky (onde o símbolo especial está)
    const stickyPositions = new Set<string>();
    currentSymbols.forEach((row, r) => {
      row.forEach((symbol, c) => {
        if (symbol === stickySymbol) {
          stickyPositions.add(`${r}-${c}`);
        }
      });
    });

    // Executa respins até não aparecer mais o símbolo sticky ou atingir max
    while (continueRespin && respinsCount < this.config.maxRespins) {
      let foundNewSticky = false;

      // Gera novos símbolos apenas nas posições não-sticky
      for (let r = 0; r < currentSymbols.length; r++) {
        for (let c = 0; c < currentSymbols[r].length; c++) {
          const key = `${r}-${c}`;
          if (!stickyPositions.has(key)) {
            const newSymbol = generateSymbol();
            currentSymbols[r][c] = newSymbol;
            
            // Se gerou o símbolo sticky, marca a posição
            if (newSymbol === stickySymbol) {
              stickyPositions.add(key);
              foundNewSticky = true;
            }
          }
        }
      }

      respinsCount++;

      // Para de girar se não encontrou novos símbolos sticky
      if (!foundNewSticky) {
        continueRespin = false;
      }

      gameEvents.emit(GameEventType.RESPIN_EXECUTED, { 
        respinNumber: respinsCount,
        stickyCount: stickyPositions.size 
      });
    }

    // Verifica se preencheu a grade inteira
    const isFullGrid = stickyPositions.size === currentSymbols.length * currentSymbols[0].length;
    const totalMultiplier = isFullGrid ? this.config.fullGridMultiplier : Math.max(1, respinsCount);

    if (isFullGrid) {
      gameEvents.emit(GameEventType.RESPIN_FULL_GRID, { 
        stickySymbol, 
        multiplier: totalMultiplier 
      });
    }

    return {
      activated: true,
      stickySymbol,
      respinsCount,
      symbols: currentSymbols,
      totalMultiplier,
      isFullGrid
    };
  }

  /**
   * Calcula as posições sticky para animação
   */
  getStickyPositions(symbols: string[][], stickySymbol: string): Array<{row: number; col: number}> {
    const positions: Array<{row: number; col: number}> = [];
    symbols.forEach((row, r) => {
      row.forEach((symbol, c) => {
        if (symbol === stickySymbol) {
          positions.push({ row: r, col: c });
        }
      });
    });
    return positions;
  }

  updateConfig(config: Partial<RespinConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RespinConfig {
    return { ...this.config };
  }
}

export const respinSystem = new RespinSystem();
