/**
 * Currency System - Gerencia moedas gratuitas e premium
 * Free coins: ganhas jogando
 * Premium coins: podem ser compradas
 */

import { gameEvents, GameEventType } from './EventSystem';

export interface CurrencyState {
  freeCoins: number;
  premiumCoins: number;
}

export interface CurrencyTransaction {
  type: 'earn' | 'spend' | 'purchase' | 'convert';
  currency: 'free' | 'premium';
  amount: number;
  source: string;
  timestamp: Date;
}

class CurrencySystem {
  private state: CurrencyState;
  private history: CurrencyTransaction[] = [];
  private readonly STORAGE_KEY = 'zodiac-currency-state';
  private readonly HISTORY_KEY = 'zodiac-currency-history';
  private readonly MAX_HISTORY = 100;

  constructor() {
    this.state = this.loadState();
    this.history = this.loadHistory();
  }

  /**
   * Carrega estado do localStorage
   */
  private loadState(): CurrencyState {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load currency state:', e);
    }
    return { freeCoins: 1000, premiumCoins: 0 };
  }

  /**
   * Salva estado no localStorage
   */
  private saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save currency state:', e);
    }
  }

  /**
   * Carrega histórico do localStorage
   */
  private loadHistory(): CurrencyTransaction[] {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
      }
    } catch (e) {
      console.warn('Failed to load currency history:', e);
    }
    return [];
  }

  /**
   * Salva histórico no localStorage
   */
  private saveHistory() {
    try {
      const toSave = this.history.slice(-this.MAX_HISTORY);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save currency history:', e);
    }
  }

  /**
   * Adiciona transação ao histórico
   */
  private addTransaction(transaction: Omit<CurrencyTransaction, 'timestamp'>) {
    const fullTransaction: CurrencyTransaction = {
      ...transaction,
      timestamp: new Date()
    };
    this.history.push(fullTransaction);
    this.saveHistory();
    
    gameEvents.emit(GameEventType.CURRENCY_TRANSACTION, fullTransaction);
  }

  /**
   * Adiciona moedas gratuitas
   */
  addFreeCoins(amount: number, source: string) {
    if (amount <= 0) return;
    
    this.state.freeCoins += amount;
    this.saveState();
    this.addTransaction({
      type: 'earn',
      currency: 'free',
      amount,
      source
    });

    gameEvents.emit(GameEventType.COINS_EARNED, { amount, type: 'free', source });
  }

  /**
   * Adiciona moedas premium
   */
  addPremiumCoins(amount: number, source: string) {
    if (amount <= 0) return;
    
    this.state.premiumCoins += amount;
    this.saveState();
    this.addTransaction({
      type: source === 'purchase' ? 'purchase' : 'earn',
      currency: 'premium',
      amount,
      source
    });

    gameEvents.emit(GameEventType.COINS_EARNED, { amount, type: 'premium', source });
  }

  /**
   * Gasta moedas (primeiro premium, depois free)
   */
  spendCoins(amount: number, source: string): boolean {
    if (!this.hasEnoughCoins(amount)) {
      return false;
    }

    let remaining = amount;

    // Gasta premium primeiro (mais valiosas)
    if (this.state.premiumCoins > 0) {
      const premiumSpent = Math.min(this.state.premiumCoins, remaining);
      this.state.premiumCoins -= premiumSpent;
      remaining -= premiumSpent;

      this.addTransaction({
        type: 'spend',
        currency: 'premium',
        amount: premiumSpent,
        source
      });
    }

    // Depois gasta free
    if (remaining > 0) {
      this.state.freeCoins -= remaining;
      this.addTransaction({
        type: 'spend',
        currency: 'free',
        amount: remaining,
        source
      });
    }

    this.saveState();
    gameEvents.emit(GameEventType.COINS_SPENT, { amount, reason: source });
    return true;
  }

  /**
   * Verifica se tem moedas suficientes
   */
  hasEnoughCoins(amount: number): boolean {
    return this.getTotalCoins() >= amount;
  }

  /**
   * Retorna total de moedas
   */
  getTotalCoins(): number {
    return this.state.freeCoins + this.state.premiumCoins;
  }

  /**
   * Retorna estado atual
   */
  getState(): CurrencyState {
    return { ...this.state };
  }

  /**
   * Retorna histórico de transações
   */
  getHistory(limit?: number): CurrencyTransaction[] {
    const history = [...this.history].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Retorna histórico filtrado
   */
  getFilteredHistory(filters: {
    type?: CurrencyTransaction['type'];
    currency?: 'free' | 'premium';
    dateFrom?: Date;
    dateTo?: Date;
  }): CurrencyTransaction[] {
    let filtered = this.getHistory();

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.currency) {
      filtered = filtered.filter(t => t.currency === filters.currency);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => t.timestamp <= filters.dateTo!);
    }

    return filtered;
  }

  /**
   * Reseta o sistema (útil para testes)
   */
  reset() {
    this.state = { freeCoins: 1000, premiumCoins: 0 };
    this.history = [];
    this.saveState();
    this.saveHistory();
  }
}

export const currencySystem = new CurrencySystem();
