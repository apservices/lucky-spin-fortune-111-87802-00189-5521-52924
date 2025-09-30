import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameTheme } from './ThemeSystem';

interface ThemeUnlockAnimationProps {
  theme: {
    id: GameTheme;
    name: string;
    description: string;
    preview: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  isVisible: boolean;
  onComplete: () => void;
}

export const ThemeUnlockAnimation: React.FC<ThemeUnlockAnimationProps> = ({
  theme,
  isVisible,
  onComplete
}) => {
  const [stage, setStage] = useState<'chest' | 'reveal' | 'celebration'>('chest');

  useEffect(() => {
    if (!isVisible) {
      setStage('chest');
      return;
    }

    const timer1 = setTimeout(() => setStage('reveal'), 1000);
    const timer2 = setTimeout(() => setStage('celebration'), 2000);
    const timer3 = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return { primary: '#3B82F6', secondary: '#93C5FD' };
      case 'epic': return { primary: '#8B5CF6', secondary: '#C4B5FD' };
      case 'legendary': return { primary: '#F59E0B', secondary: '#FDE68A' };
      default: return { primary: '#6B7280', secondary: '#D1D5DB' };
    }
  };

  const colors = getRarityColor(theme.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(circle at 50% 50%, ${colors.primary}20 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${colors.primary}40 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${colors.primary}20 0%, transparent 70%)`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Stage 1: Treasure Chest */}
          <AnimatePresence mode="wait">
            {stage === 'chest' && (
              <motion.div
                key="chest"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.div
                  className="text-8xl"
                  animate={{ 
                    rotateY: [0, 15, -15, 0],
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  📦
                </motion.div>
                
                {/* Sparkles around chest */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 45}deg) translateY(-60px)`
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Stage 2: Theme Reveal */}
            {stage === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  className="p-8 text-center max-w-md mx-auto"
                  style={{ 
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.primary,
                    borderWidth: '2px'
                  }}
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-6xl mb-4">{theme.preview}</div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                      <Crown style={{ color: colors.primary }} />
                      Tema Desbloqueado!
                    </h2>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: colors.primary }}
                    >
                      {theme.name}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {theme.description}
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            )}

            {/* Stage 3: Celebration */}
            {stage === 'celebration' && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🎉
                </motion.div>
                
                <motion.h2
                  className="text-3xl font-bold text-white mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Parabéns!
                </motion.h2>
                
                <motion.p
                  className="text-gray-300 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Você pode usar seu novo tema agora!
                </motion.p>
                
                <Button
                  onClick={onComplete}
                  style={{ backgroundColor: colors.primary }}
                  className="text-white hover:opacity-90"
                >
                  Continuar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating celebration particles */}
          {stage === 'celebration' && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [0, -100],
                    x: [(Math.random() - 0.5) * 50]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                >
                  {i % 3 === 0 ? (
                    <Sparkles style={{ color: colors.primary }} size={16} />
                  ) : i % 3 === 1 ? (
                    <Star style={{ color: colors.secondary }} size={12} />
                  ) : (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};