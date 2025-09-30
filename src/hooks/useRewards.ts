// Rewards and redemption system hook

import { useState, useEffect, useCallback } from 'react';
import { Reward, RedeemedReward, RedemptionHistory, SAMPLE_REWARDS, COINS_TO_POINTS_RATE } from '@/types/rewards';

const REDEEMED_REWARDS_KEY = 'zodiac_fortune_redeemed_rewards';
const REDEMPTION_HISTORY_KEY = 'zodiac_fortune_redemption_history';

export const useRewards = () => {
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedRedeemed = localStorage.getItem(REDEEMED_REWARDS_KEY);
      const storedHistory = localStorage.getItem(REDEMPTION_HISTORY_KEY);

      if (storedRedeemed) {
        const parsed = JSON.parse(storedRedeemed);
        // Convert date strings back to Date objects
        const withDates = parsed.map((reward: any) => ({
          ...reward,
          redeemedAt: new Date(reward.redeemedAt),
          expiresAt: reward.expiresAt ? new Date(reward.expiresAt) : undefined
        }));
        setRedeemedRewards(withDates);
      }

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        const withDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setRedemptionHistory(withDates);
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage
  const saveRewards = useCallback((rewards: RedeemedReward[]) => {
    try {
      localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(rewards));
      setRedeemedRewards(rewards);
    } catch (error) {
      console.error('Error saving redeemed rewards:', error);
    }
  }, []);

  const saveHistory = useCallback((history: RedemptionHistory[]) => {
    try {
      localStorage.setItem(REDEMPTION_HISTORY_KEY, JSON.stringify(history));
      setRedemptionHistory(history);
    } catch (error) {
      console.error('Error saving redemption history:', error);
    }
  }, []);

  // Convert coins to redemption points
  const getRedemptionPoints = useCallback((coins: number): number => {
    return Math.floor(coins / COINS_TO_POINTS_RATE);
  }, []);

  // Get available rewards (filtered by level and not expired)
  const getAvailableRewards = useCallback((playerLevel: number): Reward[] => {
    return SAMPLE_REWARDS.filter(reward => {
      // Check level requirement
      if (reward.requiredLevel > playerLevel) return false;
      
      // Check if limited reward is still available
      if (reward.isLimited && reward.expiresAt) {
        return new Date() < reward.expiresAt;
      }
      
      return true;
    });
  }, []);

  // Check if reward can be redeemed
  const canRedeemReward = useCallback((reward: Reward, playerCoins: number, playerLevel: number): boolean => {
    const points = getRedemptionPoints(playerCoins);
    return points >= reward.cost && playerLevel >= reward.requiredLevel;
  }, [getRedemptionPoints]);

  // Redeem a reward
  const redeemReward = useCallback((
    reward: Reward, 
    playerCoins: number, 
    playerLevel: number,
    onCoinsChange: (newCoins: number) => void
  ): { success: boolean; message: string; redeemedReward?: RedeemedReward } => {
    
    if (!canRedeemReward(reward, playerCoins, playerLevel)) {
      return { 
        success: false, 
        message: 'Pontos ou nível insuficientes para resgatar este prêmio' 
      };
    }

    // Calculate coins to deduct
    const coinsToDeduct = reward.cost * COINS_TO_POINTS_RATE;
    const newCoins = playerCoins - coinsToDeduct;

    // Create redeemed reward
    const redeemedReward: RedeemedReward = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      rewardId: reward.id,
      reward,
      redeemedAt: new Date(),
      expiresAt: reward.duration ? new Date(Date.now() + reward.duration * 60 * 60 * 1000) : undefined,
      isActive: true,
      isUsed: false
    };

    // Create history entry
    const historyEntry: RedemptionHistory = {
      id: redeemedReward.id,
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      timestamp: new Date(),
      status: 'completed'
    };

    // Update data
    const updatedRedeemed = [redeemedReward, ...redeemedRewards];
    const updatedHistory = [historyEntry, ...redemptionHistory].slice(0, 100); // Keep last 100 entries

    saveRewards(updatedRedeemed);
    saveHistory(updatedHistory);
    onCoinsChange(newCoins);

    return { 
      success: true, 
      message: `${reward.name} resgatado com sucesso!`,
      redeemedReward
    };
  }, [canRedeemReward, redeemedRewards, redemptionHistory, saveRewards, saveHistory]);

  // Get active rewards (not expired)
  const getActiveRewards = useCallback((): RedeemedReward[] => {
    const now = new Date();
    return redeemedRewards.filter(reward => {
      if (!reward.isActive) return false;
      if (reward.expiresAt && now > reward.expiresAt) {
        // Mark as expired
        reward.isActive = false;
        return false;
      }
      return true;
    });
  }, [redeemedRewards]);

  // Get active multipliers
  const getActiveMultipliers = useCallback((): RedeemedReward[] => {
    return getActiveRewards().filter(reward => 
      reward.reward.type === 'multiplier' && reward.isActive
    );
  }, [getActiveRewards]);

  // Get active XP bonuses
  const getActiveXPBonuses = useCallback((): RedeemedReward[] => {
    return getActiveRewards().filter(reward => 
      reward.reward.type === 'xp_bonus' && reward.isActive
    );
  }, [getActiveRewards]);

  // Use a reward (mark as used)
  const useReward = useCallback((rewardId: string) => {
    const updatedRewards = redeemedRewards.map(reward => 
      reward.id === rewardId 
        ? { ...reward, isUsed: true, isActive: false }
        : reward
    );
    saveRewards(updatedRewards);
  }, [redeemedRewards, saveRewards]);

  // Get rewards by category
  const getRewardsByCategory = useCallback((category: string, playerLevel: number): Reward[] => {
    return getAvailableRewards(playerLevel).filter(reward => reward.category === category);
  }, [getAvailableRewards]);

  // Check for expired rewards and clean up
  const cleanupExpiredRewards = useCallback(() => {
    const now = new Date();
    const activeRewards = redeemedRewards.map(reward => {
      if (reward.expiresAt && now > reward.expiresAt && reward.isActive) {
        return { ...reward, isActive: false };
      }
      return reward;
    });
    
    if (JSON.stringify(activeRewards) !== JSON.stringify(redeemedRewards)) {
      saveRewards(activeRewards);
    }
  }, [redeemedRewards, saveRewards]);

  // Auto cleanup expired rewards
  useEffect(() => {
    if (!isLoading) {
      cleanupExpiredRewards();
      
      // Set up interval to check for expired rewards every minute
      const interval = setInterval(cleanupExpiredRewards, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoading, cleanupExpiredRewards]);

  return {
    redeemedRewards,
    redemptionHistory,
    isLoading,
    getRedemptionPoints,
    getAvailableRewards,
    canRedeemReward,
    redeemReward,
    getActiveRewards,
    getActiveMultipliers,
    getActiveXPBonuses,
    useReward,
    getRewardsByCategory,
    availableRewards: SAMPLE_REWARDS
  };
};