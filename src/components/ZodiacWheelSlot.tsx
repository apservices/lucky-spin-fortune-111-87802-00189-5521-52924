import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppShare } from './WhatsAppShare';

interface ZodiacWheelSlotProps {
  coins: number;
  energy: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
}

const ZODIAC_SYMBOLS = [
  { emoji: '🐯', name: 'Tigre', multiplier: 100 },
  { emoji: '🐲', name: 'Dragão', multiplier: 50 },
  { emoji: '🦊', name: 'Raposa', multiplier: 25 },
  { emoji: '🐸', name: 'Sapo', multiplier: 20 },
  { emoji: '🍊', name: 'Laranja', multiplier: 15 },
  { emoji: '📜', name: 'Pergaminho', multiplier: 10 },
  { emoji: '✉️', name: 'Envelope', multiplier: 5 },
  { emoji: '⭐', name: 'Estrela', multiplier: 3 }
];

export const ZodiacWheelSlot: React.FC<ZodiacWheelSlotProps> = ({
  coins,
  energy,
  onCoinsChange,
  onEnergyChange
}) => {
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  const handleSpin = () => {
    if (energy < 1) {
      toast.error('⚡ Energia insuficiente!', {
        description: 'Colete bônus diários para continuar jogando!'
      });
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setShowWinAnimation(false);
    onEnergyChange(energy - 1);

    // Simulate spinning for 2 seconds
    const spinDuration = 2000;
    const intervalDuration = 100;
    let elapsed = 0;

    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * ZODIAC_SYMBOLS.length),
        Math.floor(Math.random() * ZODIAC_SYMBOLS.length),
        Math.floor(Math.random() * ZODIAC_SYMBOLS.length)
      ]);
      elapsed += intervalDuration;

      if (elapsed >= spinDuration) {
        clearInterval(spinInterval);
        
        // Determine final result
        const finalReels = [
          Math.floor(Math.random() * ZODIAC_SYMBOLS.length),
          Math.floor(Math.random() * ZODIAC_SYMBOLS.length),
          Math.floor(Math.random() * ZODIAC_SYMBOLS.length)
        ];
        
        setReels(finalReels);
        setIsSpinning(false);
        
        // Calculate win
        let winAmount = 0;
        const allSame = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
        const twoSame = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2];
        
        if (allSame) {
          winAmount = ZODIAC_SYMBOLS[finalReels[0]].multiplier;
          setShowWinAnimation(true);
          toast.success(`🎉 JACKPOT! ${ZODIAC_SYMBOLS[finalReels[0]].name}!`, {
            description: `Você ganhou ${winAmount} moedas! 🪙`
          });
        } else if (twoSame) {
          winAmount = Math.floor(ZODIAC_SYMBOLS[finalReels[0]].multiplier / 4);
          toast.success(`✨ Vitória Dupla!`, {
            description: `Você ganhou ${winAmount} moedas!`
          });
        }
        
        if (winAmount > 0) {
          setLastWin(winAmount);
          onCoinsChange(coins + winAmount);
        } else {
          toast.info('😔 Não foi dessa vez...', {
            description: 'Tente novamente!'
          });
        }
      }
    }, intervalDuration);
  };

  return (
    <Card className="relative overflow-hidden border-2 border-fortune-gold/30 bg-gradient-to-br from-black via-pgbet-dark to-black">
      {/* Decorative background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-fortune-gold/5 to-transparent" />
      
      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h3 
            className="text-3xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🐅 Roda Zodiacal Premium
          </motion.h3>
          <p className="text-gray-400">Gire e ganhe até 100x!</p>
        </div>

        {/* Reels Display */}
        <div className="relative">
          <motion.div 
            className="grid grid-cols-3 gap-4 bg-gradient-to-br from-pgbet-dark/50 to-black/50 p-6 rounded-2xl border-2 border-fortune-gold/20"
            animate={isSpinning ? {
              boxShadow: [
                '0 0 20px rgba(255, 215, 0, 0.3)',
                '0 0 40px rgba(255, 215, 0, 0.6)',
                '0 0 20px rgba(255, 215, 0, 0.3)'
              ]
            } : {}}
            transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
          >
            {reels.map((symbolIndex, reelIndex) => {
              const symbol = ZODIAC_SYMBOLS[symbolIndex];
              return (
                <motion.div
                  key={reelIndex}
                  className="relative"
                  animate={isSpinning ? {
                    y: [0, -10, 0],
                    rotateX: [0, 360, 720]
                  } : showWinAnimation ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: isSpinning ? 0.2 : 1,
                    delay: reelIndex * 0.1,
                    repeat: isSpinning ? Infinity : showWinAnimation ? 3 : 0
                  }}
                >
                  <div className={`relative aspect-square bg-gradient-to-br from-fortune-gold/10 to-fortune-ember/10 rounded-xl flex items-center justify-center border-2 ${
                    showWinAnimation ? 'border-fortune-gold' : 'border-fortune-gold/20'
                  }`}>
                    <span className="text-6xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                      {symbol.emoji}
                    </span>
                    
                    {showWinAnimation && (
                      <motion.div
                        className="absolute inset-0 bg-fortune-gold/20 rounded-xl"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      />
                    )}
                  </div>
                  
                  <div className="text-center mt-2">
                    <Badge variant="outline" className="text-xs bg-black/50 border-fortune-gold/30">
                      {symbol.multiplier}x
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Win animation overlay */}
          <AnimatePresence>
            {showWinAnimation && lastWin > 0 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
              >
                <div className="text-6xl font-bold text-fortune-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
                  +{lastWin} 🪙
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || energy < 1}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold hover:opacity-90 text-black shadow-lg shadow-fortune-gold/30 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-200%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6" />
              {isSpinning ? 'GIRANDO...' : energy < 1 ? 'SEM ENERGIA' : 'GIRAR AGORA'}
              <Sparkles className="w-6 h-6" />
            </span>
          </Button>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-black/50 border-fortune-gold/30">
                🪙 {coins.toLocaleString()}
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-blue-500/30">
                ⚡ {energy}
              </Badge>
            </div>
            
            {lastWin > 0 && (
              <Badge className="bg-fortune-gold/20 text-fortune-gold border-fortune-gold/50">
                Última vitória: {lastWin} 🪙
              </Badge>
            )}
          </div>

          {/* Share button */}
          {lastWin >= 50 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <WhatsAppShare winAmount={lastWin} gameType="Fortune Tiger" />
            </motion.div>
          )}
        </div>

        {/* Paytable hint */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            💡 Dica: Três símbolos iguais = Multiplicador completo!
          </p>
        </div>
      </div>
    </Card>
  );
};
