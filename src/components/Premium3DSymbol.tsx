/**
 * Premium 3D Symbol Component with High-Quality Rendering
 * Apple-style aesthetic with vibrant colors and advanced animations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Symbol3DData {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  multiplier: number;
  color: string;
}

interface Premium3DSymbolProps {
  symbol: Symbol3DData;
  state: 'idle' | 'spinning' | 'win' | 'jackpot';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: number;
  className?: string;
  winMultiplier?: number;
}

export const Premium3DSymbol: React.FC<Premium3DSymbolProps> = ({
  symbol,
  state,
  size = 'md',
  intensity = 1,
  className = '',
  winMultiplier = 1
}) => {
  const [particleCount, setParticleCount] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const sizeConfig = {
    sm: { container: 'w-16 h-16', symbol: 'text-4xl', glow: 'w-20 h-20' },
    md: { container: 'w-24 h-24', symbol: 'text-6xl', glow: 'w-28 h-28' },
    lg: { container: 'w-32 h-32', symbol: 'text-8xl', glow: 'w-36 h-36' },
    xl: { container: 'w-40 h-40', symbol: 'text-9xl', glow: 'w-44 h-44' }
  };

  const config = sizeConfig[size];

  // Enhanced color mapping with more vibrant HSL colors
  const colorMap = {
    orange: 'hsl(25, 100%, 65%)',
    envelope: 'hsl(0, 95%, 72%)',
    scroll: 'hsl(45, 100%, 78%)',
    frog: 'hsl(140, 90%, 60%)',
    fox: 'hsl(320, 100%, 75%)',
    tiger: 'hsl(45, 100%, 80%)'
  };

  const symbolColor = colorMap[symbol.id as keyof typeof colorMap] || 'hsl(45, 100%, 75%)';

  // Advanced particle and glow effects
  useEffect(() => {
    if (state === 'win' || state === 'jackpot') {
      const particles = state === 'jackpot' ? 20 : 12;
      const glow = state === 'jackpot' ? 5 : 3;
      
      setParticleCount(particles);
      setGlowIntensity(glow * intensity * winMultiplier);
      
      const duration = state === 'jackpot' ? 4000 : 2500;
      const timer = setTimeout(() => {
        setParticleCount(0);
        setGlowIntensity(0);
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setParticleCount(0);
      setGlowIntensity(0);
    }
  }, [state, intensity, winMultiplier]);

  // Advanced animation variants
  const containerVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      filter: 'brightness(1) contrast(1) saturate(1)',
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] // Apple's easing
      }
    },
    spinning: {
      scale: [1, 1.1, 1],
      rotateY: [0, 180, 360],
      rotateX: [0, 15, -15, 0],
      filter: 'brightness(1.3) contrast(1.2) saturate(1.4)',
      transition: {
        duration: 0.15,
        repeat: Infinity,
        ease: "linear"
      }
    },
    win: {
      scale: [1, 1.3, 1.1, 1.2, 1],
      rotateZ: [0, 10, -10, 5, 0],
      filter: `brightness(1.8) contrast(1.4) saturate(2) drop-shadow(0 0 20px ${symbolColor})`,
      transition: {
        duration: 0.6,
        repeat: 3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    jackpot: {
      scale: [1, 1.5, 1.2, 1.4, 1.1, 1.3, 1],
      rotateZ: [0, 15, -15, 10, -10, 5, 0],
      rotateY: [0, 360],
      filter: `brightness(2.5) contrast(1.6) saturate(3) drop-shadow(0 0 40px ${symbolColor}) drop-shadow(0 0 80px ${symbolColor})`,
      transition: {
        duration: 1.2,
        repeat: 3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const symbolVariants = {
    idle: { scale: 1 },
    spinning: { 
      scale: [1, 0.8, 1.2, 1],
      transition: { duration: 0.15, repeat: Infinity }
    },
    win: { 
      scale: [1, 1.4, 1.1, 1.3, 1],
      transition: { duration: 0.6, repeat: 3 }
    },
    jackpot: { 
      scale: [1, 1.6, 1.2, 1.5, 1.1, 1.4, 1],
      transition: { duration: 1.2, repeat: 3 }
    }
  };

  // Dynamic glow styles
  const glowStyles = useMemo(() => {
    if (glowIntensity === 0) return {};
    
    return {
      '--glow-color': symbolColor,
      '--glow-intensity': glowIntensity.toString(),
      filter: `brightness(${1 + glowIntensity * 0.2}) saturate(${1 + glowIntensity * 0.3})`,
      boxShadow: `
        0 0 ${glowIntensity * 8}px ${symbolColor},
        0 0 ${glowIntensity * 16}px ${symbolColor},
        0 0 ${glowIntensity * 24}px ${symbolColor}
      `
    } as React.CSSProperties;
  }, [glowIntensity, symbolColor]);

  return (
    <div className={`relative ${config.container} ${className}`}>
      {/* Main 3D Symbol Container */}
      <motion.div
        className="relative w-full h-full"
        variants={containerVariants}
        animate={state}
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Premium Glass Background */}
        <div 
          className="absolute inset-0 rounded-2xl backdrop-blur-sm border-2"
          style={{
            background: `linear-gradient(135deg, 
              ${symbolColor}15 0%, 
              ${symbolColor}25 25%, 
              ${symbolColor}10 50%, 
              ${symbolColor}20 75%, 
              ${symbolColor}15 100%)`,
            borderColor: `${symbolColor}50`,
            ...glowStyles
          }}
        />
        
        {/* 3D Symbol */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${config.symbol} font-bold`}
          variants={symbolVariants}
          style={{
            color: symbolColor,
            textShadow: `
              2px 2px 4px rgba(0,0,0,0.8),
              0 0 20px ${symbolColor},
              0 0 40px ${symbolColor}
            `,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
          }}
        >
          {symbol.emoji}
        </motion.div>

        {/* Enhanced Glow Rings */}
        <AnimatePresence>
          {glowIntensity > 0 && (
            <>
              <motion.div
                className={`absolute ${config.glow} -inset-2 rounded-full opacity-60`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 1, 1.1, 1],
                  opacity: [0, 0.8, 0.6, 0.7, 0.5],
                  rotate: 360
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: `conic-gradient(from 0deg, 
                    ${symbolColor}80 0deg, 
                    ${symbolColor}40 90deg, 
                    ${symbolColor}80 180deg, 
                    ${symbolColor}40 270deg, 
                    ${symbolColor}80 360deg)`,
                  filter: 'blur(8px)'
                }}
              />
              
              <motion.div
                className={`absolute ${config.glow} -inset-1 rounded-full opacity-40`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ 
                  scale: [1.2, 0.9, 1.1, 0.95, 1],
                  opacity: [0, 0.6, 0.4, 0.5, 0.3],
                  rotate: -360
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: `radial-gradient(circle, ${symbolColor}60 0%, transparent 70%)`,
                  filter: 'blur(4px)'
                }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Premium Particle System */}
      <AnimatePresence>
        {particleCount > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {Array.from({ length: particleCount }, (_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  x: `${50 + (Math.cos((360 / particleCount) * i * Math.PI / 180) * 120)}%`,
                  y: `${50 + (Math.sin((360 / particleCount) * i * Math.PI / 180) * 120)}%`,
                  scale: [0, 1.5, 0.8, 1.2, 0],
                  opacity: [0, 1, 0.8, 0.6, 0],
                  rotate: 720
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: state === 'jackpot' ? 3 : 2,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{
                  background: `radial-gradient(circle, ${symbolColor} 0%, ${symbolColor}80 50%, transparent 100%)`,
                  boxShadow: `0 0 10px ${symbolColor}, 0 0 20px ${symbolColor}`
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Rarity Indicator */}
      {symbol.rarity === 'legendary' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-black animate-pulse">
          ★
        </div>
      )}
      {symbol.rarity === 'rare' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white animate-pulse">
          ◆
        </div>
      )}
    </div>
  );
};