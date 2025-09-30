/**
 * Achievements Page - Player Achievements and Progress
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievements } from '@/components/Achievements';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { addCoins } = useGameActions();

  const handleClaimReward = (reward: number) => {
    addCoins(reward);
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
            <h1 className="text-2xl font-bold text-white">🏆 Conquistas</h1>
            <p className="text-gray-400">Desbloqueie conquistas e ganhe recompensas</p>
          </div>
        </motion.header>

        {/* Achievements System */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Achievements
            totalSpins={state.totalSpins || 0}
            level={state.level}
            totalCoins={state.totalCoinsEarned || 0}
            dailyStreak={state.dailyStreak || 0}
            referrals={0} // TODO: Add referrals to game state
            onClaimReward={handleClaimReward}
          />
        </motion.div>

      </div>
    </ParticleBackground>
  );
};

export default AchievementsPage;