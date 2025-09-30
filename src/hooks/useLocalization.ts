import { useCallback } from 'react';
import { 
  brazilianTexts, 
  getRandomExpression, 
  getRandomGreeting, 
  formatMessage 
} from '@/utils/localization';
import {
  formatBrazilianNumber,
  formatBrazilianCurrency,
  formatCompactNumber,
  formatBrazilianDate,
  formatBrazilianTime,
  formatBrazilianDateTime,
  getBrasiliaTime,
  formatPercentage
} from '@/utils/formatters';

export const useLocalization = () => {
  const t = useCallback((path: string): string => {
    const keys = path.split('.');
    let value: any = brazilianTexts;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return typeof value === 'string' ? value : path;
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return formatBrazilianCurrency(amount);
  }, []);

  const formatNumber = useCallback((value: number): string => {
    return formatBrazilianNumber(value);
  }, []);

  const formatCompact = useCallback((value: number): string => {
    return formatCompactNumber(value);
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return formatBrazilianDate(date);
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return formatBrazilianTime(date);
  }, []);

  const formatDateTime = useCallback((date: Date): string => {
    return formatBrazilianDateTime(date);
  }, []);

  const formatPercent = useCallback((value: number): string => {
    return formatPercentage(value);
  }, []);

  const getExpression = useCallback((category: keyof typeof brazilianTexts.expressions): string => {
    return getRandomExpression(category);
  }, []);

  const getGreeting = useCallback((): string => {
    return getRandomGreeting();
  }, []);

  const getMessage = useCallback((messageKey: string, params: Record<string, any> = {}): string => {
    const message = t(`messages.${messageKey}`);
    return formatMessage(message, params);
  }, [t]);

  const getCurrentTime = useCallback((): Date => {
    return getBrasiliaTime();
  }, []);

  const getWelcomeMessage = useCallback((playerName?: string): string => {
    const greeting = getGreeting();
    return playerName ? `${greeting} ${playerName}!` : greeting;
  }, []);

  // Cultural symbols and emojis
  const symbols = {
    brazilian: {
      flag: '🇧🇷',
      carnival: '🎭',
      football: '⚽',
      acai: '🫐',
      brigadeiro: '🍫',
      coxinha: '🥟',
      caipirinha: '🍹',
      christ: '🗿',
      copacabana: '🏖️',
      samba: '💃'
    },
    currency: {
      coins: '🪙',
      money: '💰',
      gem: '💎',
      treasure: '💸'
    },
    luck: {
      horseshoe: '🍀',
      star: '⭐',
      sparkles: '✨',
      fire: '🔥',
      lightning: '⚡'
    }
  };

  return {
    t,
    formatCurrency,
    formatNumber,
    formatCompact,
    formatDate,
    formatTime,
    formatDateTime,
    formatPercent,
    getExpression,
    getGreeting,
    getMessage,
    getCurrentTime,
    getWelcomeMessage,
    symbols,
    texts: brazilianTexts
  };
};