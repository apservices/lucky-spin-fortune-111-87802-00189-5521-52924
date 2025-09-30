import { useState, useEffect, useCallback } from 'react';
import { Achievement, AchievementProgress, ACHIEVEMENTS } from '@/types/achievements';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'zodiac_fortune_achievements';

export const useAchievements = (gameState: any) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const { toast } = useToast();

  // Load achievements from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedProgress = JSON.parse(stored);
      setProgress(storedProgress);
      updateAchievementsWithProgress(storedProgress);
    }
  }, []);

  // Update achievements with current progress
  const updateAchievementsWithProgress = (progressData: AchievementProgress[]) => {
    setAchievements(prev => prev.map(achievement => {
      const prog = progressData.find(p => p.achievementId === achievement.id);
      if (prog) {
        return {
          ...achievement,
          requirements: {
            ...achievement.requirements,
            current: prog.progress
          },
          status: prog.completed ? 'completed' : prog.progress > 0 ? 'in_progress' : 'locked',
          unlockedAt: prog.completedAt ? new Date(prog.completedAt) : undefined
        };
      }
      return achievement;
    }));
  };

  // Check and update achievements based on game state
  const checkAchievements = useCallback(() => {
    const newProgress = [...progress];
    let hasNewUnlock = false;

    achievements.forEach(achievement => {
      if (achievement.status === 'completed') return;

      let currentValue = 0;
      switch (achievement.requirements.type) {
        case 'spins':
          currentValue = gameState.totalSpins || 0;
          break;
        case 'wins':
          currentValue = gameState.totalWins || 0;
          break;
        case 'coins_earned':
          currentValue = gameState.totalCoinsEarned || 0;
          break;
        case 'level':
          currentValue = gameState.level || 1;
          break;
        case 'streak':
          currentValue = gameState.dailyStreak || 0;
          break;
      }

      const existingProgress = newProgress.find(p => p.achievementId === achievement.id);
      const isCompleted = currentValue >= achievement.requirements.target;

      if (existingProgress) {
        if (existingProgress.progress !== currentValue) {
          existingProgress.progress = currentValue;
          if (isCompleted && !existingProgress.completed) {
            existingProgress.completed = true;
            existingProgress.completedAt = new Date();
            hasNewUnlock = true;
            showAchievementUnlock(achievement);
          }
        }
      } else {
        const newProg: AchievementProgress = {
          achievementId: achievement.id,
          progress: currentValue,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined
        };
        newProgress.push(newProg);
        if (isCompleted) {
          hasNewUnlock = true;
          showAchievementUnlock(achievement);
        }
      }
    });

    if (hasNewUnlock) {
      setProgress(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      updateAchievementsWithProgress(newProgress);
    }
  }, [gameState, achievements, progress]);

  // Show achievement unlock notification
  const showAchievementUnlock = (achievement: Achievement) => {
    const badgeText = achievement.rewards.badge ? ` • Badge: ${achievement.rewards.badge}` : '';
    toast({
      title: `🎉 Conquista Desbloqueada! ${achievement.icon}`,
      description: `${achievement.title}: +${achievement.rewards.xp} XP, +${achievement.rewards.coins} moedas${badgeText}`,
      duration: 5000,
    });
  };

  // Get achievements by category
  const getByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  // Get completion stats
  const getStats = () => {
    const completed = achievements.filter(a => a.status === 'completed').length;
    const total = achievements.length;
    const percentage = (completed / total) * 100;
    
    return {
      completed,
      total,
      percentage: Math.round(percentage),
      inProgress: achievements.filter(a => a.status === 'in_progress').length
    };
  };

  // Auto-check achievements when game state changes
  useEffect(() => {
    checkAchievements();
  }, [gameState.totalSpins, gameState.totalWins, gameState.totalCoinsEarned, gameState.level, gameState.dailyStreak]);

  return {
    achievements,
    progress,
    checkAchievements,
    getByCategory,
    getStats
  };
};
