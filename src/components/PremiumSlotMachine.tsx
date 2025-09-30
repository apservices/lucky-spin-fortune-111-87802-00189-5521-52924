/**
 * Premium Slot Machine with Apple-Style Design and 3D Effects
 * Enhanced with vibrant colors, advanced animations, and optimized layout
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  Zap, 
  Crown, 
  Star, 
  Plus, 
  Minus, 
  Play, 
  Settings,
  Volume2,
  VolumeX,
  Trophy,
  Gift,
  Calendar,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Premium3DSymbol, Symbol3DData } from './Premium3DSymbol';
import { ParallaxCoinsBackground } from './ParallaxCoinsBackground';
import { useThemes } from '@/hooks/useThemes';

const premium3DSymbols: Symbol3DData[] = [
  { id: 'orange', name: 'Laranja da Fortuna', emoji: '🍊', rarity: 'common', multiplier: 1, color: 'hsl(25, 100%, 65%)' },
  { id: 'envelope', name: 'Envelope Vermelho', emoji: '🧧', rarity: 'common', multiplier: 2, color: 'hsl(0, 95%, 72%)' },
  { id: 'scroll', name: 'Pergaminho Ancestral', emoji: '📜', rarity: 'rare', multiplier: 3, color: 'hsl(45, 100%, 78%)' },
  { id: 'frog', name: 'Sapo da Prosperidade', emoji: '🐸', rarity: 'rare', multiplier: 5, color: 'hsl(140, 90%, 60%)' },
  { id: 'fox', name: 'Raposa Mística', emoji: '🦊', rarity: 'legendary', multiplier: 8, color: 'hsl(320, 100%, 75%)' },
  { id: 'tiger', name: 'Tigre Dourado', emoji: '🐯', rarity: 'legendary', multiplier: 15, color: 'hsl(45, 100%, 80%)' },
];

interface PremiumSlotMachineProps {
  coins: number;
  energy: number;
  level: number;
  experience: number;
  maxExperience: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onExperienceChange: (newExperience: number) => void;
}

export const PremiumSlotMachine: React.FC<PremiumSlotMachineProps> = ({ 
  coins, 
  energy, 
  level,
  experience,
  maxExperience,
  onCoinsChange, 
  onEnergyChange,
  onExperienceChange
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [lastWin, setLastWin] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  
  const [reels, setReels] = useState<Symbol3DData[][]>([
    [premium3DSymbols[0], premium3DSymbols[1], premium3DSymbols[2]],
    [premium3DSymbols[1], premium3DSymbols[0], premium3DSymbols[3]],
    [premium3DSymbols[2], premium3DSymbols[3], premium3DSymbols[0]]
  ]);
  
  const [symbolStates, setSymbolStates] = useState<('idle' | 'spinning' | 'win' | 'jackpot')[][]>([
    ['idle', 'idle', 'idle'],
    ['idle', 'idle', 'idle'],
    ['idle', 'idle', 'idle']
  ]);
  
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [jackpotEffect, setJackpotEffect] = useState(false);
  const [winLine, setWinLine] = useState<boolean>(false);
  
  const slotRef = useRef<HTMLDivElement>(null);
  const { currentTheme, getThemeEffectsIntensity } = useThemes(level);
  
  // VIP calculations
  const vipLevel = Math.floor(level / 5) + 1;
  const vipProgress = ((level % 5) / 5) * 100;
  
  const getRandomSymbol = (): Symbol3DData => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    const probabilities = [35, 30, 20, 10, 4, 1]; // Orange, Envelope, Scroll, Frog, Fox, Tiger
    
    for (let i = 0; i < premium3DSymbols.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return premium3DSymbols[i];
      }
    }
    return premium3DSymbols[0];
  };

  const generateReel = (): Symbol3DData[] => {
    return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
  };

  const checkWin = (newReels: Symbol3DData[][]): { isWin: boolean; symbol: Symbol3DData; multiplier: number } => {
    // Check middle line (main winning line)
    const middleLine = [newReels[0][1], newReels[1][1], newReels[2][1]];
    
    if (middleLine[0].id === middleLine[1].id && middleLine[1].id === middleLine[2].id) {
      return { 
        isWin: true, 
        symbol: middleLine[0],
        multiplier: middleLine[0].multiplier
      };
    }
    
    return { isWin: false, symbol: premium3DSymbols[0], multiplier: 0 };
  };

  const playWinAnimation = (symbol: Symbol3DData, multiplier: number) => {
    setWinLine(true);
    setWinAnimation(symbol.id);

    // Set winning symbols to win state
    const newStates = symbolStates.map((reel, reelIndex) => 
      reel.map((state, symbolIndex) => 
        symbolIndex === 1 ? (multiplier >= 10 ? 'jackpot' : 'win') : 'idle'
      )
    );
    setSymbolStates(newStates);

    if (multiplier >= 10) {
      setJackpotEffect(true);
      // Enhanced screen effects for jackpot
      if (slotRef.current) {
        slotRef.current.style.animation = 'premium-shake 0.8s ease-in-out';
      }
    }

    // Reset animations
    setTimeout(() => {
      setWinAnimation(null);
      setWinLine(false);
      setJackpotEffect(false);
      setSymbolStates(prev => prev.map(reel => reel.map(() => 'idle')));
      if (slotRef.current) {
        slotRef.current.style.animation = '';
      }
    }, multiplier >= 10 ? 4000 : 3000);
  };

  const spinReels = () => {
    if (isSpinning || energy < 1 || coins < betAmount) {
      if (energy < 1) {
        toast.error('⚡ Energia insuficiente!', {
          style: { 
            background: 'hsl(var(--destructive))', 
            color: 'hsl(var(--destructive-foreground))' 
          }
        });
      } else if (coins < betAmount) {
        toast.error('💰 Moedas insuficientes!', {
          style: { 
            background: 'hsl(var(--destructive))', 
            color: 'hsl(var(--destructive-foreground))' 
          }
        });
      }
      return;
    }

    setIsSpinning(true);
    setWinLine(false);
    setJackpotEffect(false);
    
    // Set all symbols to spinning state
    setSymbolStates(prev => prev.map(reel => reel.map(() => 'spinning')));
    
    onEnergyChange(energy - 1);
    onCoinsChange(coins - betAmount);

    // Enhanced spinning animation with staggered stops
    const spinDuration = 2500;
    const intervals: NodeJS.Timeout[] = [];
    
    // Spin each reel with different timing
    [0, 1, 2].forEach(reelIndex => {
      const interval = setInterval(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[reelIndex] = generateReel();
          return newReels;
        });
      }, 100);
      intervals.push(interval);
      
      // Stop each reel at different times for dramatic effect
      setTimeout(() => {
        clearInterval(interval);
        setSymbolStates(prev => {
          const newStates = [...prev];
          newStates[reelIndex] = newStates[reelIndex].map(() => 'idle');
          return newStates;
        });
      }, spinDuration + (reelIndex * 300));
    });

    // Final result calculation
    setTimeout(() => {
      intervals.forEach(clearInterval);
      
      const finalReels = [generateReel(), generateReel(), generateReel()];
      setReels(finalReels);
      setSymbolStates(prev => prev.map(reel => reel.map(() => 'idle')));
      
      const winResult = checkWin(finalReels);
      
      if (winResult.isWin) {
        const baseWin = betAmount * winResult.multiplier;
        const themeBonus = getThemeEffectsIntensity(currentTheme);
        const winAmount = Math.floor(baseWin * themeBonus);
        
        onCoinsChange(coins + winAmount);
        onExperienceChange(experience + (15 * winResult.multiplier));
        setLastWin(winAmount);
        playWinAnimation(winResult.symbol, winResult.multiplier);
        
        // Enhanced win notifications
        if (winResult.multiplier >= 15) {
          toast.success(
            `🐯 MEGA JACKPOT! +${winAmount} moedas! 🎰`,
            {
              duration: 6000,
              style: {
                background: 'var(--gradient-gold)',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold',
                fontSize: '20px',
                border: '2px solid hsl(var(--primary))'
              }
            }
          );
        } else if (winResult.multiplier >= 8) {
          toast.success(
            `🦊 SUPER PRÊMIO! +${winAmount} moedas!`,
            {
              duration: 5000,
              style: {
                background: 'hsl(320, 100%, 75%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }
            }
          );
        } else if (winResult.multiplier >= 5) {
          toast.success(
            `🐸 GRANDE PRÊMIO! +${winAmount} moedas!`,
            {
              duration: 4000,
              style: {
                background: 'hsl(140, 90%, 60%)',
                color: 'white',
                fontWeight: 'bold'
              }
            }
          );
        } else {
          toast.success(`✨ Vitória! +${winAmount} moedas!`);
        }
      } else {
        setLastWin(0);
        onExperienceChange(experience + 3);
      }
      
      setIsSpinning(false);
    }, spinDuration + 900);
  };

  const adjustBet = (change: number) => {
    const newBet = Math.max(1, Math.min(coins / 2, betAmount + change));
    setBetAmount(newBet);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Parallax Background */}
      <ParallaxCoinsBackground enabled={!isSpinning} />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Premium Apple-Style Header - 15% of viewport */}
        <motion.div 
          className="h-[15vh] min-h-[120px] bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl border-b border-border/50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="h-full flex items-center justify-between px-6 max-w-sm mx-auto">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <motion.button 
                className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 text-primary" />
              </motion.button>
              
              <motion.button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {soundEnabled ? 
                  <Volume2 className="w-5 h-5 text-primary" /> : 
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                }
              </motion.button>
            </div>

            {/* Center Stats */}
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 backdrop-blur-sm">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">VIP {vipLevel}</span>
              </div>
              
              <div className="w-24">
                <Progress 
                  value={(experience / maxExperience) * 100} 
                  className="h-1.5 bg-muted/30"
                />
              </div>
            </div>

            {/* Right Indicators */}
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
              <Gift className="w-5 h-5 text-red-500 animate-bounce" />
            </div>
          </div>
        </motion.div>

        {/* Main Game Area - 60% of viewport */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4 min-h-[60vh]">
          {/* Game Title */}
          <motion.div 
            className="text-center space-y-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              ZODIAC FORTUNE
            </h1>
            <p className="text-lg text-primary/80">🐯 Premium 3D Edition 🐸</p>
          </motion.div>

          {/* Premium 3D Slot Machine */}
          <motion.div 
            ref={slotRef}
            className="relative"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Jackpot Effect Overlay */}
            <AnimatePresence>
              {jackpotEffect && (
                <motion.div 
                  className="absolute inset-0 pointer-events-none z-30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-3xl animate-pulse"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12">
                    <motion.div 
                      className="text-4xl font-bold text-primary text-center"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        y: [0, -10, 0]
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      💰 MEGA JACKPOT! 💰
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Glass Container */}
            <Card className="p-8 bg-card/90 backdrop-blur-xl border-2 border-primary/20 shadow-2xl rounded-3xl relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary/40 rounded-tl-xl"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary/40 rounded-tr-xl"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary/40 rounded-bl-xl"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/40 rounded-br-xl"></div>
              
              {/* Machine Header */}
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 p-4 rounded-2xl border border-primary/30 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-primary tracking-wide">FORTUNE REELS</h3>
                  <div className="flex items-center justify-center space-x-3 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
              </div>
              
              {/* 3D Reels Container */}
              <div className="bg-background/50 p-6 rounded-2xl border border-border/30 backdrop-blur-sm relative">
                <div className="grid grid-cols-3 gap-6">
                  {reels.map((reel, reelIndex) => (
                    <div key={reelIndex} className="flex flex-col space-y-3">
                      {reel.map((symbol, symbolIndex) => (
                        <Premium3DSymbol
                          key={`${reelIndex}-${symbolIndex}-${symbol.id}`}
                          symbol={symbol}
                          state={symbolStates[reelIndex][symbolIndex]}
                          size="lg"
                          intensity={getThemeEffectsIntensity(currentTheme)}
                          winMultiplier={symbolIndex === 1 ? (winLine ? 2 : 1) : 1}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Win Line Indicator */}
                <AnimatePresence>
                  {winLine && (
                    <motion.div 
                      className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary rounded-full z-20 transform -translate-y-1/2"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      style={{
                        boxShadow: `0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))`
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Control Panel - 25% of viewport */}
        <motion.div 
          className="h-[25vh] min-h-[200px] bg-card/95 backdrop-blur-xl border-t border-border/50 p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <div className="max-w-sm mx-auto h-full flex flex-col justify-between space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">CARTEIRA</div>
                <div className="text-lg font-bold text-primary flex items-center justify-center">
                  <Coins className="w-4 h-4 mr-1" />
                  R$ {coins.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">APOSTA</div>
                <div className="text-lg font-bold text-secondary">
                  R$ {betAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">VITÓRIA</div>
                <div className="text-lg font-bold text-accent">
                  R$ {lastWin.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Bet Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => adjustBet(-0.50)}
                  disabled={betAmount <= 1}
                  size="sm"
                  variant="outline"
                  className="w-12 h-12 p-0 rounded-xl border-2"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => adjustBet(0.50)}
                  disabled={betAmount >= coins / 2}
                  size="sm"
                  variant="outline"
                  className="w-12 h-12 p-0 rounded-xl border-2"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Main Spin Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={spinReels}
                  disabled={isSpinning || energy < 1 || coins < betAmount}
                  className="h-16 px-8 text-lg font-bold bg-gradient-to-r from-primary via-primary-glow to-primary hover:from-primary-glow hover:to-primary rounded-2xl border-2 border-primary/30 shadow-lg relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {isSpinning ? (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2"
                      >
                        <Zap className="w-5 h-5 animate-spin" />
                        <span>GIRANDO...</span>
                      </motion.div>
                    ) : energy < 1 ? (
                      <motion.div
                        key="no-energy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2"
                      >
                        <Zap className="w-5 h-5" />
                        <span>SEM ENERGIA</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>GIRAR</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Energy Display */}
              <div className="flex flex-col items-center space-y-1">
                <div className="text-xs text-muted-foreground">ENERGIA</div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold">{energy}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};