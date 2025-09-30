import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Heart, Crown, Star } from 'lucide-react';

type MascotMood = 'idle' | 'excited' | 'celebrating' | 'sleeping' | 'magical';
type MascotType = 'tiger' | 'fox' | 'frog' | 'dragon';

interface MascotSystemProps {
  currentSymbol?: string;
  isSpinning: boolean;
  lastWin: number;
  energy: number;
  mood: MascotMood;
  level: number;
}

interface MascotConfig {
  emoji: string;
  name: string;
  specialMove: string;
  color: string;
  unlockLevel: number;
}

const mascots: Record<MascotType, MascotConfig> = {
  tiger: {
    emoji: '🐯',
    name: 'Tigre Dourado',
    specialMove: 'Rugido da Fortuna',
    color: 'from-orange-500 to-yellow-500',
    unlockLevel: 1,
  },
  fox: {
    emoji: '🦊',
    name: 'Raposa da Sorte',
    specialMove: 'Dança Mística',
    color: 'from-red-500 to-pink-500',
    unlockLevel: 5,
  },
  frog: {
    emoji: '🐸',
    name: 'Sapo da Prosperidade',
    specialMove: 'Salto Cósmico',
    color: 'from-green-500 to-emerald-500',
    unlockLevel: 10,
  },
  dragon: {
    emoji: '🐲',
    name: 'Dragão Imperial',
    specialMove: 'Sopro do Infinito',
    color: 'from-purple-500 to-blue-500',
    unlockLevel: 20,
  },
};

export const MascotSystem: React.FC<MascotSystemProps> = ({
  currentSymbol,
  isSpinning,
  lastWin,
  energy,
  mood,
  level,
}) => {
  const [currentMascot, setCurrentMascot] = useState<MascotType>('tiger');
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('');
  const [showSpecialMove, setShowSpecialMove] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; type: string }>>([]);

  // Determine active mascot based on level and current symbol
  useEffect(() => {
    let newMascot: MascotType = 'tiger';
    
    // Symbol-based mascot switching
    if (currentSymbol === '🐯') newMascot = 'tiger';
    else if (currentSymbol === '🦊') newMascot = 'fox';
    else if (currentSymbol === '🐸') newMascot = 'frog';
    else if (currentSymbol === '🐲') newMascot = 'dragon';
    else {
      // Level-based default mascot
      if (level >= 20) newMascot = 'dragon';
      else if (level >= 10) newMascot = 'frog';
      else if (level >= 5) newMascot = 'fox';
      else newMascot = 'tiger';
    }

    if (newMascot !== currentMascot && level >= mascots[newMascot].unlockLevel) {
      setCurrentMascot(newMascot);
    }
  }, [currentSymbol, level, currentMascot]);

  // Handle mood changes and animations
  useEffect(() => {
    setIsAnimating(true);
    
    switch (mood) {
      case 'celebrating':
        setMessage(getRandomCelebrationMessage());
        setShowSpecialMove(true);
        triggerParticles('celebration');
        break;
      case 'excited':
        setMessage(getRandomExcitedMessage());
        triggerParticles('excited');
        break;
      case 'magical':
        setMessage(getRandomMagicalMessage());
        setShowSpecialMove(true);
        triggerParticles('magical');
        break;
      case 'sleeping':
        setMessage('Zzz...');
        break;
      default:
        setMessage(getRandomIdleMessage());
        break;
    }

    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (showSpecialMove) {
        setTimeout(() => setShowSpecialMove(false), 1000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [mood]);

  const triggerParticles = (type: string) => {
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      type,
    }));
    setParticles(newParticles);
    
    setTimeout(() => setParticles([]), 2000);
  };

  const getRandomCelebrationMessage = (): string => {
    const messages = [
      '🎉 Fantástico!',
      '✨ Incrível!',
      '🏆 Jackpot!',
      '🎊 Maravilhoso!',
      '💫 Lendário!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomExcitedMessage = (): string => {
    const messages = [
      '😊 Boa sorte!',
      '🍀 Vamos lá!',
      '⚡ Energia!',
      '🌟 Brilhe!',
      '🔥 Pegue fogo!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomMagicalMessage = (): string => {
    const messages = [
      '🔮 Magia pura!',
      '✨ Místico!',
      '🌙 Encantado!',
      '⭐ Celestial!',
      '💎 Precioso!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomIdleMessage = (): string => {
    const messages = [
      '😌 Relaxando...',
      '🎯 Focado!',
      '💭 Pensando...',
      '🧘 Meditando...',
      '👁️ Observando...',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getMascotAnimationClass = (): string => {
    let baseClass = 'transition-all duration-500';
    
    if (isSpinning) {
      baseClass += ' animate-pulse scale-110';
    } else if (isAnimating) {
      switch (mood) {
        case 'celebrating':
          baseClass += ' animate-bounce scale-125';
          break;
        case 'excited':
          baseClass += ' animate-pulse scale-110';
          break;
        case 'magical':
          baseClass += ' animate-spin scale-115';
          break;
        default:
          baseClass += ' scale-105';
      }
    }
    
    return baseClass;
  };

  const getParticleIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <Sparkles className="text-yellow-400 animate-ping" size={16} />;
      case 'excited':
        return <Zap className="text-blue-400 animate-pulse" size={14} />;
      case 'magical':
        return <Star className="text-purple-400 animate-spin" size={15} />;
      default:
        return <Heart className="text-pink-400 animate-bounce" size={12} />;
    }
  };

  const mascotConfig = mascots[currentMascot];

  return (
    <div className="relative">
      <Card className={`
        relative overflow-hidden p-4 
        bg-gradient-to-br ${mascotConfig.color} 
        border-2 border-yellow-400/30 
        shadow-lg shadow-yellow-500/20
        ${getMascotAnimationClass()}
      `}>
        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 10}%`,
              animationDelay: `${Math.random() * 500}ms`,
            }}
          >
            {getParticleIcon(particle.type)}
          </div>
        ))}

        {/* Mascot Avatar */}
        <div className="text-center space-y-2">
          <div className="text-6xl filter drop-shadow-lg">
            {mascotConfig.emoji}
          </div>
          
          {/* Mascot Name */}
          <div className="text-white font-bold text-sm bg-black/20 rounded-full px-2 py-1">
            {mascotConfig.name}
          </div>
          
          {/* Special Move Indicator */}
          {showSpecialMove && (
            <div className="animate-pulse text-yellow-300 font-bold text-xs bg-yellow-900/50 rounded-lg px-3 py-1 border border-yellow-400/50">
              <Crown className="inline mr-1" size={12} />
              {mascotConfig.specialMove}
            </div>
          )}
          
          {/* Message Bubble */}
          {message && (
            <div className="bg-white/90 text-gray-800 rounded-lg px-3 py-2 text-xs font-medium relative">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45"></div>
              {message}
            </div>
          )}
          
          {/* Energy Bar */}
          <div className="bg-black/20 rounded-full p-1">
            <div 
              className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
            />
            <div className="text-white text-xs mt-1">
              Energia: {energy}%
            </div>
          </div>
          
          {/* Last Win Display */}
          {lastWin > 0 && (
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-lg px-2 py-1 text-yellow-100 text-xs font-bold animate-pulse">
              +{lastWin} 🪙
            </div>
          )}
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-purple-400">
          {level}
        </div>
      </Card>
    </div>
  );
};