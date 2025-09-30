// Achievement system types

export type AchievementCategory = 'iniciante' | 'jogador' | 'veterano' | 'lendario';
export type AchievementStatus = 'locked' | 'in_progress' | 'completed';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewards: {
    xp: number;
    coins: number;
    badge?: string;
    title?: string;
  };
  requirements: {
    type: 'spins' | 'wins' | 'coins_earned' | 'level' | 'streak' | 'games_played';
    target: number;
    current?: number;
  };
  status: AchievementStatus;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Iniciante
  {
    id: 'first_spin',
    title: 'Primeiro Giro',
    description: 'Complete seu primeiro giro',
    category: 'iniciante',
    icon: '🎰',
    rarity: 'common',
    rewards: { xp: 50, coins: 100 },
    requirements: { type: 'spins', target: 1, current: 0 },
    status: 'locked'
  },
  {
    id: 'beginner_spinner',
    title: 'Aprendiz',
    description: 'Complete 10 giros',
    category: 'iniciante',
    icon: '🎯',
    rarity: 'common',
    rewards: { xp: 100, coins: 250 },
    requirements: { type: 'spins', target: 10, current: 0 },
    status: 'locked'
  },
  {
    id: 'first_win',
    title: 'Primeira Vitória',
    description: 'Ganhe sua primeira rodada',
    category: 'iniciante',
    icon: '🏆',
    rarity: 'common',
    rewards: { xp: 75, coins: 200, badge: 'Vencedor Iniciante' },
    requirements: { type: 'wins', target: 1, current: 0 },
    status: 'locked'
  },
  
  // Jogador
  {
    id: 'spin_master',
    title: 'Mestre dos Giros',
    description: 'Complete 100 giros',
    category: 'jogador',
    icon: '⚡',
    rarity: 'rare',
    rewards: { xp: 500, coins: 1000, badge: 'Mestre' },
    requirements: { type: 'spins', target: 100, current: 0 },
    status: 'locked'
  },
  {
    id: 'coin_collector',
    title: 'Colecionador de Moedas',
    description: 'Acumule 10.000 moedas',
    category: 'jogador',
    icon: '💰',
    rarity: 'rare',
    rewards: { xp: 300, coins: 500 },
    requirements: { type: 'coins_earned', target: 10000, current: 0 },
    status: 'locked'
  },
  {
    id: 'level_10',
    title: 'Escalador',
    description: 'Alcance o nível 10',
    category: 'jogador',
    icon: '📈',
    rarity: 'rare',
    rewards: { xp: 400, coins: 750, title: 'Escalador' },
    requirements: { type: 'level', target: 10, current: 0 },
    status: 'locked'
  },
  {
    id: 'streak_7',
    title: 'Semana de Sorte',
    description: 'Mantenha uma sequência de 7 dias',
    category: 'jogador',
    icon: '🔥',
    rarity: 'rare',
    rewards: { xp: 600, coins: 1500 },
    requirements: { type: 'streak', target: 7, current: 0 },
    status: 'locked'
  },

  // Veterano
  {
    id: 'spin_legend',
    title: 'Lenda dos Giros',
    description: 'Complete 500 giros',
    category: 'veterano',
    icon: '👑',
    rarity: 'epic',
    rewards: { xp: 1000, coins: 3000, badge: 'Veterano' },
    requirements: { type: 'spins', target: 500, current: 0 },
    status: 'locked'
  },
  {
    id: 'mega_winner',
    title: 'Mega Vencedor',
    description: 'Vença 100 rodadas',
    category: 'veterano',
    icon: '💎',
    rarity: 'epic',
    rewards: { xp: 800, coins: 2500, title: 'Mega Vencedor' },
    requirements: { type: 'wins', target: 100, current: 0 },
    status: 'locked'
  },
  {
    id: 'coin_tycoon',
    title: 'Magnata das Moedas',
    description: 'Acumule 100.000 moedas',
    category: 'veterano',
    icon: '🏰',
    rarity: 'epic',
    rewards: { xp: 1500, coins: 5000 },
    requirements: { type: 'coins_earned', target: 100000, current: 0 },
    status: 'locked'
  },
  {
    id: 'level_25',
    title: 'Mestre Supremo',
    description: 'Alcance o nível 25',
    category: 'veterano',
    icon: '⭐',
    rarity: 'epic',
    rewards: { xp: 2000, coins: 7500, title: 'Mestre Supremo' },
    requirements: { type: 'level', target: 25, current: 0 },
    status: 'locked'
  },

  // Lendário
  {
    id: 'spin_immortal',
    title: 'Imortal dos Giros',
    description: 'Complete 1000 giros',
    category: 'lendario',
    icon: '🌟',
    rarity: 'legendary',
    rewards: { xp: 5000, coins: 15000, badge: 'Lendário', title: 'Imortal' },
    requirements: { type: 'spins', target: 1000, current: 0 },
    status: 'locked'
  },
  {
    id: 'fortune_king',
    title: 'Rei da Fortuna',
    description: 'Acumule 1.000.000 de moedas',
    category: 'lendario',
    icon: '👑',
    rarity: 'legendary',
    rewards: { xp: 10000, coins: 50000, title: 'Rei da Fortuna' },
    requirements: { type: 'coins_earned', target: 1000000, current: 0 },
    status: 'locked'
  },
  {
    id: 'streak_30',
    title: 'Mês Perfeito',
    description: 'Mantenha uma sequência de 30 dias',
    category: 'lendario',
    icon: '🔥',
    rarity: 'legendary',
    rewards: { xp: 15000, coins: 100000, badge: 'Consistência Lendária' },
    requirements: { type: 'streak', target: 30, current: 0 },
    status: 'locked'
  },
  {
    id: 'level_50',
    title: 'Divindade do Jogo',
    description: 'Alcance o nível 50',
    category: 'lendario',
    icon: '🌠',
    rarity: 'legendary',
    rewards: { xp: 20000, coins: 200000, title: 'Divindade', badge: 'Ascensão' },
    requirements: { type: 'level', target: 50, current: 0 },
    status: 'locked'
  }
];

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}
