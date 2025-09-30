/**
 * Reward Redemption Animation Component
 * Displays treasure chest opening with coin shower effects
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RedeemedReward } from '@/types/rewards';
import { formatCompactNumber } from '@/utils/formatters';
import { X, Gift, Sparkles, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RewardRedemptionAnimationProps {
  redeemedReward: RedeemedReward | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RewardRedemptionAnimation: React.FC<RewardRedemptionAnimationProps> = ({
  redeemedReward,
  isOpen,
  onClose
}) => {
  const [animationStep, setAnimationStep] = useState<'chest' | 'opening' | 'reward' | 'coins'>('chest');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && redeemedReward) {
      // Animation sequence
      const sequence = async () => {
        setAnimationStep('chest');
        
        // Wait for chest animation
        setTimeout(() => setAnimationStep('opening'), 500);
        
        // Show reward
        setTimeout(() => setAnimationStep('reward'), 1500);
        
        // Show coin shower
        setTimeout(() => {
          setAnimationStep('coins');
          setShowConfetti(true);
        }, 2500);
        
        // Hide confetti
        setTimeout(() => setShowConfetti(false), 4000);
      };
      
      sequence();
    }
  }, [isOpen, redeemedReward]);

  if (!isOpen || !redeemedReward) return null;

  const reward = redeemedReward.reward;
  const rarityStyles = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-yellow-600'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative max-w-md w-full"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-purple-900 border-primary/50 overflow-hidden">
            <CardContent className="p-8 text-center relative">
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Chest Animation */}
              <AnimatePresence mode="wait">
                {animationStep === 'chest' && (
                  <motion.div
                    key="chest"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="mb-6"
                  >
                    <motion.div
                      animate={{ 
                        rotateY: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-8xl"
                    >
                      📦
                    </motion.div>
                    <p className="text-white mt-4">Abrindo baú do tesouro...</p>
                  </motion.div>
                )}

                {animationStep === 'opening' && (
                  <motion.div
                    key="opening"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="mb-6"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1.1],
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 1,
                        ease: "easeOut"
                      }}
                      className="text-8xl"
                    >
                      📤
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-center mt-4"
                    >
                      <Sparkles className="w-8 h-8 text-yellow-500 animate-spin" />
                    </motion.div>
                  </motion.div>
                )}

                {(animationStep === 'reward' || animationStep === 'coins') && (
                  <motion.div
                    key="reward"
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="mb-6"
                  >
                    {/* Reward Icon */}
                    <motion.div
                      animate={{ 
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                      }}
                      className={`text-6xl mb-4 p-4 rounded-full bg-gradient-to-r ${rarityStyles[reward.rarity]} mx-auto w-fit`}
                    >
                      {reward.type === 'theme' && '🎨'}
                      {reward.type === 'skin' && '🎰'}
                      {reward.type === 'multiplier' && '⚡'}
                      {reward.type === 'xp_bonus' && '🌟'}
                      {reward.type === 'coins' && '💰'}
                      {reward.type === 'energy' && '🔋'}
                    </motion.div>

                    {/* Reward Info */}
                    <div className="space-y-2">
                      <Badge 
                        className={`${reward.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-500' :
                          reward.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500' :
                          reward.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-gray-500/20 text-gray-500'}`}
                      >
                        {reward.rarity.toUpperCase()}
                      </Badge>
                      
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-white"
                      >
                        {reward.name}
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-300"
                      >
                        {reward.description}
                      </motion.p>

                      {/* Reward Details */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-sm text-gray-400 space-y-1"
                      >
                        {reward.duration && (
                          <p>⏰ Duração: {reward.duration} horas</p>
                        )}
                        {reward.type === 'multiplier' && (
                          <p>📈 Multiplicador: {reward.value}x</p>
                        )}
                        {reward.type === 'coins' && (
                          <p>💰 Valor: {formatCompactNumber(Number(reward.value))} moedas</p>
                        )}
                        {reward.type === 'energy' && (
                          <p>🔋 Energia: +{reward.value}</p>
                        )}
                        {redeemedReward.expiresAt && (
                          <p>⚠️ Expira em: {redeemedReward.expiresAt.toLocaleString('pt-BR')}</p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <p className="text-green-400 font-semibold mb-4">
                  🎉 Prêmio resgatado com sucesso!
                </p>
                
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
              </motion.div>

            </CardContent>
          </Card>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -100, 
                    x: Math.random() * 400 - 200, 
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{ 
                    y: window.innerHeight + 100, 
                    opacity: 0,
                    rotate: 360,
                    scale: 0
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 1,
                    ease: "easeOut"
                  }}
                  className="absolute"
                >
                  <Coins className="w-6 h-6 text-yellow-500" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Light Effects */}
          {animationStep === 'reward' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 2 }}
              exit={{ opacity: 0, scale: 3 }}
              className="absolute inset-0 bg-gradient-radial from-yellow-500/20 to-transparent rounded-lg pointer-events-none"
            />
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};