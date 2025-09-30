import React, { useEffect, useState } from 'react';
import { CalendarReward } from '@/types/calendar';

interface CalendarRewardAnimationProps {
  reward: CalendarReward;
  isVisible: boolean;
  onComplete: () => void;
}

export const CalendarRewardAnimation: React.FC<CalendarRewardAnimationProps> = ({
  reward,
  isVisible,
  onComplete
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  
  useEffect(() => {
    if (isVisible) {
      // Generate particles for animation
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 300 - 150,
        y: Math.random() * 200 - 100,
        delay: i * 100
      }));
      setParticles(newParticles);
      
      // Auto-complete after animation duration
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-pgbet-gold via-pgbet-amber to-pgbet-gold';
      case 'epic':
        return 'from-pgbet-purple via-pgbet-crimson to-pgbet-purple';
      case 'rare':
        return 'from-pgbet-emerald via-pgbet-jade to-pgbet-emerald';
      default:
        return 'from-primary via-primary-glow to-primary';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'drop-shadow-[0_0_20px_hsl(45_100%_50%)] drop-shadow-[0_0_40px_hsl(45_100%_50%)]';
      case 'epic':
        return 'drop-shadow-[0_0_15px_hsl(270_75%_55%)]';
      case 'rare':
        return 'drop-shadow-[0_0_10px_hsl(142_86%_45%)]';
      default:
        return 'drop-shadow-[0_0_5px_hsl(var(--primary))]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/80 animate-fade-in" />
      
      {/* Main reward display */}
      <div className="relative animate-scale-in">
        {/* Central reward icon */}
        <div className={`
          text-8xl mb-4 text-center animate-sprite-win transform-gpu
          ${getRarityGlow(reward.rarity)}
        `}>
          {reward.icon}
        </div>
        
        {/* Reward details */}
        <div className={`
          bg-gradient-to-br ${getRarityGradient(reward.rarity)} 
          p-6 rounded-2xl border-2 border-primary/30 text-center
          animate-pgbet-glow backdrop-blur-sm
        `}>
          <div className="text-2xl font-bold text-primary-foreground mb-2">
            🎁 Recompensa Coletada!
          </div>
          <div className="text-lg text-primary-foreground/90 mb-3">
            {reward.description}
          </div>
          {reward.bonus && (
            <div className="text-sm text-primary-foreground/80 bg-primary/20 px-3 py-1 rounded-full">
              ✨ {reward.bonus}
            </div>
          )}
        </div>
        
        {/* Animated particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-sprite-particle pointer-events-none"
            style={{
              left: `50%`,
              top: `50%`,
              transform: `translate(-50%, -50%)`,
              '--particle-angle': `${Math.random() * 360}deg`,
              '--particle-distance': `${60 + Math.random() * 40}px`,
              animationDelay: `${particle.delay}ms`
            } as React.CSSProperties}
          >
            {Math.random() > 0.5 ? '✨' : reward.type === 'coins' ? '🪙' : '💎'}
          </div>
        ))}
        
        {/* Outer glow ring */}
        <div className={`
          absolute inset-0 rounded-full border-4 border-primary/30
          animate-sprite-ring transform-gpu pointer-events-none
          ${reward.rarity === 'legendary' ? 'border-pgbet-gold' : ''}
        `} />
      </div>
      
      {/* Floating coins for coin rewards */}
      {reward.type === 'coins' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-pgbet-coin-float"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 200}ms`
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}
      
      {/* Special effects for legendary rewards */}
      {reward.rarity === 'legendary' && (
        <>
          {/* Golden sparkles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-xl animate-pgbet-sparkle pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 150}ms`
              }}
            >
              ⭐
            </div>
          ))}
          
          {/* Radial burst effect */}
          <div className="absolute inset-0 bg-gradient-radial from-pgbet-gold/20 to-transparent animate-fade-in pointer-events-none" />
        </>
      )}
    </div>
  );
};