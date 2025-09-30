import React, { useState, useEffect, useMemo } from 'react';
import { SpriteSymbol } from './SpriteSystem';

export type AnimationState = 'idle' | 'spinning' | 'win' | 'jackpot';

interface AdvancedSpriteAnimationProps {
  symbol: SpriteSymbol;
  state: AnimationState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spriteUrl: string;
  isLoaded: boolean;
  winMultiplier?: number;
}

export const AdvancedSpriteAnimation: React.FC<AdvancedSpriteAnimationProps> = ({
  symbol,
  state,
  size = 'md',
  className = '',
  spriteUrl,
  isLoaded,
  winMultiplier = 1
}) => {
  const [particleCount, setParticleCount] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Generate particles for win states
  useEffect(() => {
    if (state === 'win' || state === 'jackpot') {
      setParticleCount(state === 'jackpot' ? 12 : 8);
      setGlowIntensity(state === 'jackpot' ? 3 : 2);
      
      const timer = setTimeout(() => {
        setParticleCount(0);
        setGlowIntensity(0);
      }, state === 'jackpot' ? 3000 : 2000);
      
      return () => clearTimeout(timer);
    } else {
      setParticleCount(0);
      setGlowIntensity(0);
    }
  }, [state]);

  // Animation classes based on state
  const animationClasses = useMemo(() => {
    const base = 'transition-all duration-300 transform-gpu backface-hidden';
    
    switch (state) {
      case 'idle':
        return `${base} animate-sprite-idle`;
      case 'spinning':
        return `${base} animate-sprite-spin`;
      case 'win':
        return `${base} animate-sprite-win`;
      case 'jackpot':
        return `${base} animate-sprite-jackpot`;
      default:
        return base;
    }
  }, [state]);

  // Dynamic glow styles
  const glowStyles = useMemo(() => {
    if (glowIntensity === 0) return {};
    
    const intensity = glowIntensity * winMultiplier;
    return {
      filter: `brightness(${1 + intensity * 0.3}) saturate(${1 + intensity * 0.2})`,
      '--glow-color': symbol.rarity === 'legendary' ? 'hsl(45 100% 50%)' : 
                      symbol.rarity === 'epic' ? 'hsl(0 85% 50%)' : 
                      'hsl(142 86% 45%)',
      '--glow-intensity': intensity.toString(),
    } as React.CSSProperties;
  }, [glowIntensity, winMultiplier, symbol.rarity]);

  if (!isLoaded) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative overflow-hidden`}>
        <div className={`w-full h-full bg-gradient-to-br ${symbol.color} animate-pulse rounded-lg flex items-center justify-center`}>
          <div className="text-white text-xs font-bold text-center px-1">
            {symbol.name.split(' ')[0]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden`}>
      {/* Main sprite with advanced animations */}
      <div 
        className={`w-full h-full relative ${animationClasses}`}
        style={glowStyles}
      >
        <img
          src={spriteUrl}
          alt={symbol.name}
          className="w-full h-full object-cover rounded-lg"
          draggable={false}
        />
        
        {/* Dynamic glow overlay */}
        {glowIntensity > 0 && (
          <div 
            className="absolute inset-0 rounded-lg animate-sprite-glow pointer-events-none"
            style={{
              background: `radial-gradient(circle, var(--glow-color, hsl(45 100% 50%)) 0%, transparent 70%)`,
              opacity: 0.4 + (glowIntensity * 0.2),
              mixBlendMode: 'overlay'
            }}
          />
        )}
        
        {/* Win ring effect */}
        {(state === 'win' || state === 'jackpot') && (
          <div className="absolute -inset-2 rounded-lg animate-sprite-ring pointer-events-none">
            <div 
              className="w-full h-full rounded-lg border-2 animate-pulse"
              style={{
                borderColor: `var(--glow-color, hsl(45 100% 50%))`,
                boxShadow: `0 0 ${glowIntensity * 10}px var(--glow-color, hsl(45 100% 50%))`
              }}
            />
          </div>
        )}
      </div>
      
      {/* Floating particles for win states */}
      {particleCount > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: particleCount }, (_, i) => (
            <div
              key={i}
              className="absolute animate-sprite-particle"
              style={{
                '--particle-delay': `${i * 100}ms`,
                '--particle-angle': `${(360 / particleCount) * i}deg`,
                '--particle-distance': state === 'jackpot' ? '60px' : '40px',
                left: '50%',
                top: '50%',
                animationDelay: `var(--particle-delay)`,
              } as React.CSSProperties}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: `var(--glow-color, hsl(45 100% 50%))`,
                  boxShadow: `0 0 6px var(--glow-color, hsl(45 100% 50%))`
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Spinning trail effect */}
      {state === 'spinning' && (
        <>
          <div className="absolute inset-0 animate-sprite-blur-trail pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="absolute inset-0 animate-sprite-motion-lines pointer-events-none">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
                style={{
                  top: `${25 + i * 25}%`,
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};