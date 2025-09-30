// Brazilian familiar coin denominations and betting values
export const BRAZILIAN_DENOMINATIONS = {
  // Virtual coin values (common Brazilian amounts)
  coins: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  
  // Betting amounts that feel familiar to Brazilians
  bets: [
    { value: 1, display: 'R$ 1 (virtual)' },
    { value: 5, display: 'R$ 5 (virtual)' },
    { value: 10, display: 'R$ 10 (virtual)' },
    { value: 25, display: 'R$ 25 (virtual)' },
    { value: 50, display: 'R$ 50 (virtual)' },
    { value: 100, display: 'R$ 100 (virtual)' }
  ],
  
  // Jackpot amounts that resonate with Brazilian players
  jackpots: [
    { level: 'mini', min: 1000, max: 5000, name: 'Mini Fortuna' },
    { level: 'menor', min: 5000, max: 25000, name: 'Menor Prêmio' },
    { level: 'maior', min: 25000, max: 100000, name: 'Maior Prêmio' },
    { level: 'mega', min: 100000, max: 500000, name: 'Mega Fortuna' },
    { level: 'super', min: 500000, max: 1000000, name: 'Super Jackpot' }
  ],
  
  // Brazilian lottery-inspired prize tiers
  prizes: {
    // Mega-Sena inspired tiers
    megaSena: [
      { matches: 4, multiplier: 10, name: 'Quadra' },
      { matches: 5, multiplier: 50, name: 'Quina' },
      { matches: 6, multiplier: 1000, name: 'Sena' }
    ],
    
    // Lotofácil inspired tiers
    lotoFacil: [
      { matches: 11, multiplier: 5, name: '11 Pontos' },
      { matches: 12, multiplier: 10, name: '12 Pontos' },
      { matches: 13, multiplier: 25, name: '13 Pontos' },
      { matches: 14, multiplier: 100, name: '14 Pontos' },
      { matches: 15, multiplier: 500, name: '15 Pontos' }
    ]
  }
};

// Helper functions for Brazilian-style payouts
export const calculateBrazilianPayout = (baseBet: number, multiplier: number): number => {
  const payout = baseBet * multiplier;
  
  // Round to familiar Brazilian amounts
  if (payout < 100) {
    return Math.round(payout / 5) * 5; // Round to nearest 5
  } else if (payout < 1000) {
    return Math.round(payout / 10) * 10; // Round to nearest 10
  } else if (payout < 10000) {
    return Math.round(payout / 25) * 25; // Round to nearest 25
  } else {
    return Math.round(payout / 100) * 100; // Round to nearest 100
  }
};

export const getRandomBrazilianJackpot = (level: 'mini' | 'menor' | 'maior' | 'mega' | 'super' = 'mini'): number => {
  const jackpot = BRAZILIAN_DENOMINATIONS.jackpots.find(j => j.level === level);
  if (!jackpot) return 1000;
  
  return Math.floor(Math.random() * (jackpot.max - jackpot.min + 1)) + jackpot.min;
};

// Brazilian-style bonus calculations
export const calculateBrazilianBonus = (baseAmount: number, bonusType: 'weekend' | 'holiday' | 'carnival' | 'copa'): number => {
  const bonusMultipliers = {
    weekend: 1.25,     // 25% weekend bonus
    holiday: 1.5,      // 50% holiday bonus  
    carnival: 2.0,     // 100% carnival bonus
    copa: 3.0          // 300% World Cup bonus
  };
  
  return calculateBrazilianPayout(baseAmount, bonusMultipliers[bonusType]);
};