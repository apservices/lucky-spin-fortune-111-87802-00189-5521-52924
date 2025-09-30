export interface CalendarDay {
  day: number;
  date: Date;
  status: 'past' | 'current' | 'future';
  claimed: boolean;
  available: boolean;
  reward: CalendarReward;
}

export interface CalendarReward {
  type: 'coins' | 'special' | 'theme' | 'multiplier' | 'skin';
  coins: number;
  xp?: number;
  bonus?: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CalendarProgress {
  currentDay: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  lastClaimDate: string | null;
  monthlyResetDate: string;
  claimedDays: number[];
  temporaryTheme?: {
    themeId: string;
    expiresAt: string;
  };
  multiplierBonus?: {
    multiplier: number;
    expiresAt: string;
  };
  unlockedSkins: string[];
}

export interface CalendarNotificationConfig {
  enabled: boolean;
  reminderTime: string; // HH:mm format
  lastNotificationDate: string | null;
}