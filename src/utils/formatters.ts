// Brazilian formatting utilities

// Brazilian number formatting
export const formatBrazilianNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

// Brazilian currency formatting (virtual)
export const formatBrazilianCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })} (virtual)`;
};

// Compact number formatting for large values
export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return formatBrazilianNumber(value);
};

// Brazilian date formatting
export const formatBrazilianDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Brazilian time formatting
export const formatBrazilianTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

// Brazilian datetime formatting
export const formatBrazilianDateTime = (date: Date): string => {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

// Get current Brasília time
export const getBrasiliaTime = (): Date => {
  const now = new Date();
  // Convert to Brasília timezone
  const brasiliaOffset = -3; // UTC-3
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (brasiliaOffset * 3600000));
};

// Check if it's midnight in Brasília (for daily reset)
export const isMidnightBrasilia = (): boolean => {
  const brasiliaTime = getBrasiliaTime();
  return brasiliaTime.getHours() === 0 && brasiliaTime.getMinutes() === 0;
};

// Get time until next midnight in Brasília
export const timeUntilMidnightBrasilia = (): { hours: number; minutes: number; seconds: number } => {
  const now = getBrasiliaTime();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};

// Brazilian phone number formatting
export const formatBrazilianPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Percentage formatting
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`.replace('.', ',');
};