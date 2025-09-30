// Transaction types for virtual coin store

export interface Transaction {
  id: string;
  type: 'ganho' | 'gasto' | 'bonus' | 'conquista';
  amount: number;
  description: string;
  source: 'daily_bonus' | 'mission' | 'achievement' | 'spin_win' | 'referral' | 'purchase' | 'expense';
  timestamp: Date;
  category: string;
}

export interface TransactionFilter {
  type?: 'ganho' | 'gasto' | 'bonus' | 'conquista' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  source?: string;
  search?: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  tier: 'bronze' | 'prata' | 'ouro' | 'diamante';
  description: string;
  bonus?: {
    extraCoins: number;
    description: string;
  };
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'bronze',
    name: 'Pacote Bronze',
    coins: 1000,
    tier: 'bronze',
    description: 'Ideal para começar sua jornada'
  },
  {
    id: 'prata',
    name: 'Pacote Prata',
    coins: 5000,
    tier: 'prata',
    description: 'Para jogadores experientes',
    bonus: {
      extraCoins: 500,
      description: '+500 moedas bônus'
    }
  },
  {
    id: 'ouro',
    name: 'Pacote Ouro',
    coins: 15000,
    tier: 'ouro',
    description: 'O favorito dos campeões',
    bonus: {
      extraCoins: 2000,
      description: '+2.000 moedas bônus'
    }
  },
  {
    id: 'diamante',
    name: 'Pacote Diamante',
    coins: 50000,
    tier: 'diamante',
    description: 'Para os verdadeiros conquistadores',
    bonus: {
      extraCoins: 10000,
      description: '+10.000 moedas bônus'
    }
  }
];