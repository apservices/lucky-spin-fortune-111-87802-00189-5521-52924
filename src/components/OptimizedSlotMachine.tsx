import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Coins, Star } from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { toast } from 'sonner';

interface OptimizedSlotMachineProps {
  coins: number;
  energy: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
}

const SYMBOLS = ['🐯', '🦊', '🐸', '🍊', '📜', '✉️'];
const REEL_COUNT = 3;
const SYMBOL_COUNT = 5;

export const OptimizedSlotMachine: React.FC<OptimizedSlotMachineProps> = ({
  coins,
  energy,
  onCoinsChange,
  onEnergyChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isOptimized,
    metrics,
    addAnimation,
    createParticle,
    releaseParticle,
    loadAsset,
    getDeviceCapabilities
  } = usePerformanceOptimization({
    maxParticles: 30,
    enableAdaptiveQuality: true
  });

  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  
  const reelRefs = useRef<HTMLDivElement[]>([]);
  const particlesRef = useRef<any[]>([]);
  const capabilities = getDeviceCapabilities();

  // Initialize reels
  useEffect(() => {
    const initialReels = Array.from({ length: REEL_COUNT }, () =>
      Array.from({ length: SYMBOL_COUNT }, () => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      )
    );
    setReels(initialReels);
  }, []);

  const handleSpin = async () => {
    if (energy < 1) {
      toast.error('⚡ Energia insuficiente!');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinningLines([]);
    onEnergyChange(energy - 1);

    // Generate final results
    const finalReels = Array.from({ length: REEL_COUNT }, () =>
      Array.from({ length: SYMBOL_COUNT }, () => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      )
    );

    // Simulate spinning animation
    setTimeout(() => {
      setReels(finalReels);
      
      // Calculate win
      const centerRow = finalReels.map(reel => reel[2]);
      let winAmount = 0;
      
      if (centerRow[0] === centerRow[1] && centerRow[1] === centerRow[2]) {
        winAmount = 100;
        setWinningLines([0, 1, 2]);
      } else if (centerRow[0] === centerRow[1] || centerRow[1] === centerRow[2]) {
        winAmount = 20;
      }

      if (winAmount > 0) {
        setLastWin(winAmount);
        onCoinsChange(coins + winAmount);
        toast.success(`🎉 Vitória! +${winAmount} moedas!`);
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div ref={containerRef}>
      <Card className="p-6 bg-gradient-to-br from-pgbet-dark to-black border-2 border-pgbet-gold">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-pgbet-gradient-gold bg-clip-text text-transparent">
              🎰 Zodiac Fortune Slots (Optimized)
            </h3>
            {metrics.fps < 45 && (
              <Badge variant="outline" className="mt-2 text-xs bg-pgbet-amber/20 text-pgbet-amber">
                Performance Mode: {metrics.fps.toFixed(0)} FPS
              </Badge>
            )}
          </div>

          <div className="bg-gradient-to-b from-pgbet-red/20 to-pgbet-crimson/20 p-4 rounded-xl border border-pgbet-gold/30">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {reels.map((reel, reelIndex) => (
                <div 
                  key={reelIndex}
                  ref={el => { if (el) reelRefs.current[reelIndex] = el; }}
                  className={`bg-gradient-reels border-2 border-pgbet-gold rounded-lg p-4 ${
                    isSpinning ? 'animate-pgbet-reel-spin' : ''
                  }`}
                >
                  <div className="space-y-2">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className="text-3xl text-center"
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <Button
                onClick={handleSpin}
                disabled={isSpinning || energy < 1 || !isOptimized}
                className="w-full h-14 text-lg bg-pgbet-gradient-gold hover:scale-105 text-black font-bold"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isSpinning ? 'GIRANDO...' : energy < 1 ? 'SEM ENERGIA' : 'GIRAR'}
              </Button>

              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-pgbet-gold" />
                  <span>{coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>{energy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-pgbet-emerald" />
                  <span>{metrics.fps.toFixed(0)} FPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};