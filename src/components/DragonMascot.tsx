import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart, Star, Zap } from 'lucide-react';

interface DragonMascotProps {
  isSpinning: boolean;
  lastWin: number;
  energy: number;
  mood: 'happy' | 'excited' | 'sleepy' | 'celebrating';
}

export const DragonMascot: React.FC<DragonMascotProps> = ({
  isSpinning,
  lastWin,
  energy,
  mood
}) => {
  const [currentMood, setCurrentMood] = useState<'happy' | 'excited' | 'sleepy' | 'celebrating'>(mood);
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrentMood(mood);
    
    // Trigger animation when mood changes
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    // Set message based on mood
    switch (mood) {
      case 'celebrating':
        setMessage('🎉 Parabéns! Que sorte incrível!');
        break;
      case 'excited':
        setMessage('⚡ Vamos girar! Sinto que vem prêmio!');
        break;
      case 'sleepy':
        setMessage('😴 Que tal regenerar energia?');
        break;
      default:
        setMessage('🐉 Olá! Pronto para a sorte?');
    }
  }, [mood]);

  const getMascotEmoji = () => {
    switch (currentMood) {
      case 'celebrating':
        return '🐲✨';
      case 'excited':
        return '🐉⚡';
      case 'sleepy':
        return '🐲💤';
      default:
        return '🐉💫';
    }
  };

  const getMoodColor = () => {
    switch (currentMood) {
      case 'celebrating':
        return 'from-fortune-gold/30 to-fortune-ember/30 border-fortune-gold/50';
      case 'excited':
        return 'from-primary/30 to-secondary/30 border-primary/50';
      case 'sleepy':
        return 'from-muted/30 to-muted/20 border-muted/50';
      default:
        return 'from-primary/20 to-accent/20 border-primary/30';
    }
  };

  const getAnimationClass = () => {
    if (isSpinning) return 'animate-bounce';
    if (isAnimating) return 'animate-pulse';
    if (currentMood === 'celebrating') return 'animate-glow-pulse';
    return '';
  };

  return (
    <Card className={`p-4 bg-gradient-to-br ${getMoodColor()} backdrop-blur-sm transition-all duration-500 ${getAnimationClass()}`}>
      <div className="flex items-center space-x-4">
        {/* Dragon Avatar */}
        <div className="relative">
          <div className={`text-4xl transition-transform duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {getMascotEmoji()}
          </div>
          
          {/* Mood particles */}
          {currentMood === 'celebrating' && (
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-4 h-4 text-fortune-gold animate-spin" />
            </div>
          )}
          {currentMood === 'excited' && (
            <div className="absolute -top-2 -right-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
            </div>
          )}
          {currentMood === 'happy' && (
            <div className="absolute -top-2 -right-2">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Message Bubble */}
        <div className="flex-1">
          <div className="bg-card/80 rounded-lg p-3 border border-border/50 relative">
            <p className="text-sm font-medium text-foreground">{message}</p>
            
            {/* Speech bubble tail */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
              <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-card/80"></div>
            </div>
          </div>
          
          {/* Mood indicator */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-fortune-gold" />
              <span className="text-xs text-muted-foreground capitalize">{currentMood}</span>
            </div>
            
            {lastWin > 0 && (
              <div className="text-xs text-fortune-gold font-medium">
                Última vitória: +{lastWin}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Energy status */}
      <div className="mt-3 flex items-center space-x-2">
        <Zap className={`w-4 h-4 ${energy > 0 ? 'text-secondary' : 'text-muted-foreground'}`} />
        <div className="flex-1 bg-muted/50 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
            style={{ width: `${(energy / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{energy}/10</span>
      </div>
    </Card>
  );
};