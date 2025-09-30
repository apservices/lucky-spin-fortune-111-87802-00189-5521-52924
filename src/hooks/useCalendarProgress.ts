import { useState, useEffect, useCallback } from 'react';
import { CalendarProgress, CalendarDay, CalendarReward } from '@/types/calendar';

const STORAGE_KEY = 'calendar_progress';
const DAYS_IN_MONTH = 35;

const createReward = (day: number): CalendarReward => {
  // Days 1-6: Increasing coins
  if (day <= 6) {
    return {
      type: 'coins',
      coins: day * 100,
      xp: day * 5,
      description: `${day * 100} moedas + ${day * 5} XP`,
      icon: '🪙',
      rarity: 'common'
    };
  }
  
  // Day 7: Weekly bonus
  if (day === 7) {
    return {
      type: 'special',
      coins: 1000,
      xp: 50,
      bonus: 'Weekly Bonus',
      description: '1000 moedas + 50 XP + Bônus Semanal',
      icon: '🎁',
      rarity: 'rare'
    };
  }
  
  // Day 14: Temporary theme
  if (day === 14) {
    return {
      type: 'theme',
      coins: 500,
      xp: 25,
      bonus: 'Tema Temporário 24h',
      description: '500 moedas + Tema Zodiacal por 24h',
      icon: '🎨',
      rarity: 'epic'
    };
  }
  
  // Day 21: 2x multiplier
  if (day === 21) {
    return {
      type: 'multiplier',
      coins: 750,
      xp: 35,
      bonus: 'Multiplicador 2x por 1 hora',
      description: '750 moedas + Multiplicador 2x (1h)',
      icon: '⚡',
      rarity: 'epic'
    };
  }
  
  // Day 30: Exclusive skin
  if (day === 30) {
    return {
      type: 'skin',
      coins: 2000,
      xp: 100,
      bonus: 'Skin Exclusiva Permanente',
      description: '2000 moedas + Skin Dragon Dourado',
      icon: '👑',
      rarity: 'legendary'
    };
  }
  
  // Other days: Regular rewards
  const baseCoins = Math.floor(day / 7) * 100 + 50;
  return {
    type: 'coins',
    coins: baseCoins,
    xp: Math.floor(day / 5) * 5 + 10,
    description: `${baseCoins} moedas + ${Math.floor(day / 5) * 5 + 10} XP`,
    icon: '💰',
    rarity: day % 7 === 0 ? 'rare' : 'common'
  };
};

const getInitialProgress = (): CalendarProgress => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  return {
    currentDay: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0,
    lastClaimDate: null,
    monthlyResetDate: nextMonth.toISOString(),
    claimedDays: [],
    unlockedSkins: []
  };
};

export const useCalendarProgress = () => {
  const [progress, setProgress] = useState<CalendarProgress>(getInitialProgress);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        
        // Check if we need to reset for new month
        const resetDate = new Date(parsed.monthlyResetDate);
        const now = new Date();
        
        if (now >= resetDate) {
          // Reset for new month
          const newProgress = getInitialProgress();
          setProgress(newProgress);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
        } else {
          setProgress(parsed);
        }
      } catch (error) {
        console.error('Failed to parse calendar progress:', error);
        setProgress(getInitialProgress());
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Generate calendar days
  useEffect(() => {
    const now = new Date();
    const today = now.getDate();
    const days: CalendarDay[] = [];

    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), day);
      const isClaimed = progress.claimedDays.includes(day);
      
      let status: 'past' | 'current' | 'future';
      if (day < today) status = 'past';
      else if (day === today) status = 'current';
      else status = 'future';

      // Available if it's current day and not claimed, or if it's past and not claimed
      const available = (day === today && !isClaimed) || (day < today && !isClaimed);

      days.push({
        day,
        date: dayDate,
        status,
        claimed: isClaimed,
        available,
        reward: createReward(day)
      });
    }

    setCalendarDays(days);
  }, [progress]);

  const claimReward = useCallback((day: number) => {
    const now = new Date();
    const today = now.getDate();
    
    // Can only claim today's reward or missed past rewards
    if (day > today) return false;
    
    // Check if already claimed
    if (progress.claimedDays.includes(day)) return false;

    const dayData = calendarDays.find(d => d.day === day);
    if (!dayData) return false;

    setProgress(prev => {
      const newClaimedDays = [...prev.claimedDays, day].sort((a, b) => a - b);
      const isConsecutive = day === today && (prev.lastClaimDate === null || 
        new Date(prev.lastClaimDate).getDate() === today - 1);
      
      const newStreak = isConsecutive ? prev.currentStreak + 1 : day === today ? 1 : prev.currentStreak;
      
      let newState = {
        ...prev,
        claimedDays: newClaimedDays,
        totalDaysLogged: prev.totalDaysLogged + 1,
        lastClaimDate: now.toISOString(),
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak)
      };

      // Handle special rewards
      if (dayData.reward.type === 'theme') {
        const expires = new Date(now);
        expires.setHours(expires.getHours() + 24);
        newState.temporaryTheme = {
          themeId: 'zodiac_gold',
          expiresAt: expires.toISOString()
        };
      }

      if (dayData.reward.type === 'multiplier') {
        const expires = new Date(now);
        expires.setHours(expires.getHours() + 1);
        newState.multiplierBonus = {
          multiplier: 2,
          expiresAt: expires.toISOString()
        };
      }

      if (dayData.reward.type === 'skin') {
        newState.unlockedSkins = [...prev.unlockedSkins, 'dragon_gold'];
      }

      return newState;
    });

    return true;
  }, [calendarDays, progress]);

  const resetProgress = useCallback(() => {
    const newProgress = getInitialProgress();
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  const getActiveMultiplier = useCallback(() => {
    if (!progress.multiplierBonus) return 1;
    
    const now = new Date();
    const expires = new Date(progress.multiplierBonus.expiresAt);
    
    if (now >= expires) {
      // Clean up expired multiplier
      setProgress(prev => ({ ...prev, multiplierBonus: undefined }));
      return 1;
    }
    
    return progress.multiplierBonus.multiplier;
  }, [progress.multiplierBonus]);

  const getActiveTheme = useCallback(() => {
    if (!progress.temporaryTheme) return null;
    
    const now = new Date();
    const expires = new Date(progress.temporaryTheme.expiresAt);
    
    if (now >= expires) {
      // Clean up expired theme
      setProgress(prev => ({ ...prev, temporaryTheme: undefined }));
      return null;
    }
    
    return progress.temporaryTheme.themeId;
  }, [progress.temporaryTheme]);

  return {
    progress,
    calendarDays,
    claimReward,
    resetProgress,
    getActiveMultiplier,
    getActiveTheme
  };
};
