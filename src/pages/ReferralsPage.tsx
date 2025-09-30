/**
 * Referrals Page - Referral System and Rewards
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReferralSystem } from '@/components/ReferralSystem';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';

const ReferralsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { addCoins } = useGameActions();

  const handleClaimReferralReward = (reward: number) => {
    addCoins(reward);
  };

  // Generate a simple referral code based on player level and coins
  const generateReferralCode = () => {
    return `TIGER${state.level}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
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
            <h1 className="text-2xl font-bold text-white">👥 Indicações</h1>
            <p className="text-gray-400">Convide amigos e ganhe recompensas</p>
          </div>
        </motion.header>

        {/* Referral System */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ReferralSystem
            playerName={`Jogador${state.level}`}
            referralCode={generateReferralCode()}
            referrals={[]} // TODO: Add referrals tracking to game state
            onAddReferral={(code: string) => {}} // TODO: Implement referral system
            onClaimReferralReward={handleClaimReferralReward}
          />
        </motion.div>

      </div>
    </ParticleBackground>
  );
};

export default ReferralsPage;