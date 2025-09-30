// Rewards and redemption system types

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'skin' | 'multiplier' | 'xp_bonus' | 'coins' | 'energy';
  cost: number; // In redemption points
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requiredLevel: number;
  isLimited?: boolean;
  expiresAt?: Date;
  duration?: number; // For temporary rewards (in hours)
  value: number | string; // Multiplier value, coin amount, or theme ID
  preview?: string; // Image or preview URL
  category: string;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  reward: Reward;
  redeemedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  isUsed: boolean;
}

export interface RedemptionHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  timestamp: Date;
  status: 'completed' | 'failed' | 'expired';
}

// Conversion rate: 10,000 coins = 1 redemption point
export const COINS_TO_POINTS_RATE = 10000;

export const REWARD_CATEGORIES = [
  { id: 'themes', name: 'Temas Cosméticos', icon: '🎨' },
  { id: 'skins', name: 'Skins de Máquina', icon: '🎰' },
  { id: 'multipliers', name: 'Multiplicadores', icon: '⚡' },
  { id: 'xp', name: 'Bônus de XP', icon: '🌟' },
  { id: 'coins', name: 'Moedas Bônus', icon: '💰' },
  { id: 'energy', name: 'Energia Extra', icon: '🔋' }
];

export const REWARD_RARITIES = {
  common: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/50' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
  legendary: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' }
};

export const SAMPLE_REWARDS: Reward[] = [
  // Temas Cosméticos
  {
    id: 'theme_phoenix',
    name: 'Tema Fênix',
    description: 'Desperte o poder da ave lendária',
    type: 'theme',
    cost: 5,
    rarity: 'epic',
    requiredLevel: 10,
    value: 'phoenix',
    category: 'Temas Cosméticos'
  },
  {
    id: 'theme_panda',
    name: 'Tema Panda',
    description: 'Sorte e prosperidade oriental',
    type: 'theme',
    cost: 3,
    rarity: 'rare',
    requiredLevel: 5,
    value: 'panda',
    category: 'Temas Cosméticos'
  },
  {
    id: 'theme_dragon',
    name: 'Tema Dragão',
    description: 'Poder supremo dos dragões',
    type: 'theme',
    cost: 10,
    rarity: 'legendary',
    requiredLevel: 20,
    value: 'dragon',
    category: 'Temas Cosméticos'
  },

  // Skins de Máquina
  {
    id: 'skin_golden',
    name: 'Máquina Dourada',
    description: 'Brilho dourado de luxo',
    type: 'skin',
    cost: 4,
    rarity: 'epic',
    requiredLevel: 8,
    value: 'golden',
    category: 'Skins de Máquina'
  },
  {
    id: 'skin_crystal',
    name: 'Máquina de Cristal',
    description: 'Elegância cristalina',
    type: 'skin',
    cost: 2,
    rarity: 'rare',
    requiredLevel: 3,
    value: 'crystal',
    category: 'Skins de Máquina'
  },

  // Multiplicadores Temporários
  {
    id: 'mult_2x_24h',
    name: 'Multiplicador 2x',
    description: 'Dobra seus ganhos por 24 horas',
    type: 'multiplier',
    cost: 2,
    rarity: 'common',
    requiredLevel: 1,
    duration: 24,
    value: 2,
    category: 'Multiplicadores'
  },
  {
    id: 'mult_5x_12h',
    name: 'Multiplicador 5x',
    description: 'Multiplica seus ganhos por 5 durante 12 horas',
    type: 'multiplier',
    cost: 6,
    rarity: 'epic',
    requiredLevel: 15,
    duration: 12,
    value: 5,
    category: 'Multiplicadores'
  },
  {
    id: 'mult_10x_6h',
    name: 'Multiplicador 10x',
    description: 'Multiplica seus ganhos por 10 durante 6 horas',
    type: 'multiplier',
    cost: 15,
    rarity: 'legendary',
    requiredLevel: 25,
    duration: 6,
    value: 10,
    category: 'Multiplicadores'
  },

  // Bônus de XP
  {
    id: 'xp_double_24h',
    name: 'XP Duplo',
    description: 'Dobra o XP ganho por 24 horas',
    type: 'xp_bonus',
    cost: 3,
    rarity: 'rare',
    requiredLevel: 5,
    duration: 24,
    value: 2,
    category: 'Bônus de XP'
  },
  {
    id: 'xp_triple_12h',
    name: 'XP Triplo',
    description: 'Triplica o XP ganho por 12 horas',
    type: 'xp_bonus',
    cost: 8,
    rarity: 'epic',
    requiredLevel: 12,
    duration: 12,
    value: 3,
    category: 'Bônus de XP'
  },

  // Moedas Bônus
  {
    id: 'coins_50k',
    name: '50.000 Moedas',
    description: 'Pacote de moedas virtuais',
    type: 'coins',
    cost: 1,
    rarity: 'common',
    requiredLevel: 1,
    value: 50000,
    category: 'Moedas Bônus'
  },
  {
    id: 'coins_200k',
    name: '200.000 Moedas',
    description: 'Grande pacote de moedas virtuais',
    type: 'coins',
    cost: 3,
    rarity: 'rare',
    requiredLevel: 8,
    value: 200000,
    category: 'Moedas Bônus'
  },
  {
    id: 'coins_1m',
    name: '1.000.000 Moedas',
    description: 'Mega pacote de moedas virtuais',
    type: 'coins',
    cost: 12,
    rarity: 'legendary',
    requiredLevel: 20,
    value: 1000000,
    category: 'Moedas Bônus'
  },

  // Energia Extra
  {
    id: 'energy_50',
    name: '50 Energia',
    description: 'Recarga instantânea de energia',
    type: 'energy',
    cost: 1,
    rarity: 'common',
    requiredLevel: 1,
    value: 50,
    category: 'Energia Extra'
  },
  {
    id: 'energy_200',
    name: '200 Energia',
    description: 'Grande recarga de energia',
    type: 'energy',
    cost: 2,
    rarity: 'rare',
    requiredLevel: 5,
    value: 200,
    category: 'Energia Extra'
  }
];