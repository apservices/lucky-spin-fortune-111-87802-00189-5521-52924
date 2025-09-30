/**
 * Daily Rewards Page - Calendar Rewards System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyRewards } from '@/components/DailyRewards';
import { CalendarRewardSystem } from '@/components/CalendarRewardSystem';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';

const DailyRewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { addCoins, addEnergy, addExperience } = useGameActions();

  const handleClaimReward = (day: number, coins: number, energy: number) => {
    addCoins(coins);
    addEnergy(energy);
    addExperience(25); // Bonus XP for daily rewards
  };

  const handleCoinsChange = (coins: number) => {
    addCoins(coins);
  };

  const handleXPChange = (xp: number) => {
    addExperience(xp);
  };

  const handleThemeChange = (theme: string) => {
    // TODO: Implement theme system integration
    console.log('Theme change:', theme);
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen p-4 relative z-10">
        
        {/* Header */}
        <motion.header 
          className="flex items-center gap-4 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">📅 Recompensas Diárias</h1>
            <p className="text-gray-400">Colete suas recompensas diárias</p>
          </div>
        </motion.header>

        {/* Daily Rewards Systems */}
        <motion.div
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Simple Daily Rewards */}
          <DailyRewards
            currentDay={state.dailyStreak || 1}
            onClaimReward={handleClaimReward}
          />

          {/* Calendar Reward System */}
          <CalendarRewardSystem
            onCoinsChange={handleCoinsChange}
            onXPChange={handleXPChange}
            onThemeChange={handleThemeChange}
          />
        </motion.div>

      </div>
    </ParticleBackground>
  );
};

export default DailyRewardsPage;