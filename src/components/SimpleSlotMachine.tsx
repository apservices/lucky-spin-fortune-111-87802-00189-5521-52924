/**
 * Simple Slot Machine - Fixed version without HSL color issues
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Zap, 
  Crown, 
  Star, 
  Plus, 
  Minus, 
  Play, 
  Volume2,
  VolumeX,
  Trophy,
  Gift,
  Calendar,
  Menu,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  multiplier: number;
  probability: number;
}

const symbols: SlotSymbol[] = [
  { id: 'orange', name: 'Laranja da Fortuna', emoji: '🍊', rarity: 'common', multiplier: 1, probability: 35 },
  { id: 'envelope', name: 'Envelope Vermelho', emoji: '🧧', rarity: 'common', multiplier: 2, probability: 30 },
  { id: 'scroll', name: 'Pergaminho Ancestral', emoji: '📜', rarity: 'rare', multiplier: 3, probability: 20 },
  { id: 'frog', name: 'Sapo da Prosperidade', emoji: '🐸', rarity: 'rare', multiplier: 5, probability: 10 },
  { id: 'fox', name: 'Raposa Mística', emoji: '🦊', rarity: 'legendary', multiplier: 8, probability: 4 },
  { id: 'tiger', name: 'Tigre Dourado', emoji: '🐯', rarity: 'legendary', multiplier: 15, probability: 1 },
];

interface SimpleSlotMachineProps {
  coins: number;
  energy: number;
  level: number;
  experience: number;
  maxExperience: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onExperienceChange: (newExperience: number) => void;
}

export const SimpleSlotMachine: React.FC<SimpleSlotMachineProps> = ({ 
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
  
  const [reels, setReels] = useState<string[][]>([
    ['🍊', '🧧', '📜'],
    ['🧧', '🍊', '🐸'],
    ['📜', '🐸', '🍊']
  ]);
  
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [jackpotEffect, setJackpotEffect] = useState(false);
  const [winLine, setWinLine] = useState<boolean>(false);
  
  const slotRef = useRef<HTMLDivElement>(null);

  // VIP and gamification state
  const vipLevel = Math.floor(level / 5) + 1;

  const getRandomSymbol = (): string => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const symbol of symbols) {
      cumulative += symbol.probability;
      if (random <= cumulative) {
        return symbol.emoji;
      }
    }
    return symbols[0].emoji;
  };

  const generateReel = (): string[] => {
    return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
  };

  const checkWin = (newReels: string[][]): { isWin: boolean; symbol: string; winType: string; multiplier: number } => {
    // Check middle line (main winning line)
    const middleLine = [newReels[0][1], newReels[1][1], newReels[2][1]];
    
    if (middleLine[0] === middleLine[1] && middleLine[1] === middleLine[2]) {
      const symbol = middleLine[0];
      const symbolData = symbols.find(s => s.emoji === symbol);
      return { 
        isWin: true, 
        symbol, 
        winType: symbolData?.name || 'Unknown',
        multiplier: symbolData?.multiplier || 1
      };
    }
    
    return { isWin: false, symbol: '', winType: '', multiplier: 0 };
  };

  const playWinAnimation = (symbol: string, multiplier: number) => {
    const symbolData = symbols.find(s => s.emoji === symbol);
    if (!symbolData) return;

    setWinLine(true);
    setWinAnimation(symbolData.id);

    if (symbolData.id === 'tiger' || multiplier >= 10) {
      setJackpotEffect(true);
    }

    // Reset animations after delay
    setTimeout(() => {
      setWinAnimation(null);
      setWinLine(false);
      setJackpotEffect(false);
    }, 3000);
  };

  const spinReels = () => {
    if (isSpinning || energy < 1 || coins < betAmount) {
      if (energy < 1) {
        toast.error('⚡ Sem energia! Aguarde para girar novamente.');
      } else if (coins < betAmount) {
        toast.error('💰 Moedas insuficientes para esta aposta!');
      }
      return;
    }

    setIsSpinning(true);
    onEnergyChange(energy - 1);
    onCoinsChange(coins - betAmount);

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setReels([generateReel(), generateReel(), generateReel()]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Final result
      const finalReels = [generateReel(), generateReel(), generateReel()];
      setReels(finalReels);
      
      const winResult = checkWin(finalReels);
      
      if (winResult.isWin) {
        const winAmount = betAmount * winResult.multiplier;
        const totalWin = coins + winAmount;
        
        onCoinsChange(totalWin);
        onExperienceChange(experience + (10 * winResult.multiplier));
        setLastWin(winAmount);
        playWinAnimation(winResult.symbol, winResult.multiplier);
        
        // Different toast messages for different wins
        if (winResult.multiplier >= 15) {
          toast.success(`🐯 MEGA JACKPOT! +${winAmount} moedas! 🎰`);
        } else if (winResult.multiplier >= 8) {
          toast.success(`🦊 SUPER PRÊMIO! +${winAmount} moedas!`);
        } else if (winResult.multiplier >= 5) {
          toast.success(`🐸 GRANDE PRÊMIO! +${winAmount} moedas!`);
        } else {
          toast.success(`✨ Você ganhou +${winAmount} moedas!`);
        }
      } else {
        setLastWin(0);
        onExperienceChange(experience + 2); // Small XP for playing
      }
      
      setIsSpinning(false);
    }, spinDuration);
  };

  const adjustBet = (change: number) => {
    const newBet = Math.max(1, Math.min(coins, betAmount + change));
    setBetAmount(newBet);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-card text-foreground">
      {/* Top HUD - VIP Status & Navigation */}
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Menu className="w-6 h-6 text-primary" />
            <Trophy className="w-5 h-5 text-primary" />
            <Calendar className="w-5 h-5 text-secondary" />
            <Gift className="w-5 h-5 text-accent" />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-muted px-3 py-1 rounded-full">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">VIP {vipLevel}</span>
            </div>
            
            <div className="relative">
              <Bell className="w-6 h-6 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Nível {level}</span>
            <span>{experience}/{maxExperience} XP</span>
          </div>
          <Progress 
            value={(experience / maxExperience) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        {/* Game Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            ZODIAC FORTUNE
          </h1>
          <p className="text-xl text-primary">🐯 Tiger • Fox • Frog Edition 🐸</p>
        </div>

        {/* Slot Machine Container */}
        <div 
          ref={slotRef}
          className={`relative ${jackpotEffect ? 'animate-pulse' : ''}`}
        >
          {/* Jackpot Effect Overlay */}
          {jackpotEffect && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl animate-ping"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div className="text-5xl font-bold text-primary animate-bounce text-center">
                  💰 MEGA JACKPOT! 💰
                </div>
              </div>
            </div>
          )}

          {/* Ornate Slot Frame */}
          <Card className="p-6 bg-card border-2 border-primary shadow-2xl rounded-3xl relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
            
            {/* Machine Header */}
            <div className="text-center mb-6">
              <div className="bg-primary/20 p-4 rounded-xl border border-primary/30">
                <h3 className="text-3xl font-bold text-primary tracking-wider">FORTUNE REELS</h3>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Reels Container */}
            <div className="bg-muted/20 p-8 rounded-2xl border border-border relative">
              <div className="grid grid-cols-3 gap-4">
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="flex flex-col space-y-2">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className={`
                          w-28 h-28 flex items-center justify-center text-6xl rounded-2xl border-4 transition-all duration-300 shadow-lg
                          ${isSpinning 
                            ? 'animate-spin bg-primary/40 border-primary' 
                            : 'bg-card border-border hover:shadow-xl hover:border-primary/70'
                          }
                          ${winLine && symbolIndex === 1 
                            ? 'bg-primary/20 border-primary animate-pulse scale-110' 
                            : ''
                          }
                          ${winAnimation && symbolIndex === 1 ? 'animate-bounce' : ''}
                        `}
                      >
                        <span className={`
                          drop-shadow-2xl transition-all duration-300 filter
                          ${winAnimation && symbolIndex === 1 ? 'animate-pulse text-7xl brightness-150' : ''}
                          ${isSpinning ? 'blur-sm' : ''}
                        `}>
                          {symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Win Line Indicator */}
              {winLine && (
                <div className="absolute top-1/2 left-4 right-4 h-3 bg-primary rounded-full z-20 transform -translate-y-1/2 shadow-lg border-2 border-secondary animate-pulse">
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom HUD Panel */}
        <Card className="w-full max-w-md bg-card border-2 border-primary rounded-2xl shadow-2xl">
          <div className="p-6 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">CARTEIRA</div>
                <div className="text-xl font-bold text-primary flex items-center justify-center">
                  <Coins className="w-5 h-5 mr-1" />
                  R$ {coins.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">APOSTA</div>
                <div className="text-xl font-bold text-secondary">
                  R$ {betAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">ÚLTIMA VITÓRIA</div>
                <div className="text-xl font-bold text-accent">
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
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => adjustBet(0.50)}
                  disabled={betAmount >= coins}
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Main Spin Button */}
              <Button
                onClick={spinReels}
                disabled={isSpinning || energy < 1 || coins < betAmount}
                className="h-14 px-8 text-lg font-bold rounded-2xl"
              >
                <Play className="w-5 h-5 mr-2" />
                {isSpinning ? 'GIRANDO...' : energy < 1 ? 'SEM ENERGIA' : 'GIRAR'}
              </Button>

              {/* Energy Display */}
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">{energy}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Win Animation Overlay */}
      {winAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            {winAnimation === 'tiger' && (
              <div className="animate-bounce">
                <div className="text-9xl animate-pulse">🐯</div>
                <div className="text-3xl font-bold text-primary">
                  RUGIDO IMPERIAL!
                </div>
              </div>
            )}
            {winAnimation === 'fox' && (
              <div className="animate-bounce">
                <div className="text-9xl animate-spin">🦊</div>
                <div className="text-3xl font-bold text-secondary">
                  MAGIA DA RAPOSA!
                </div>
              </div>
            )}
            {winAnimation === 'frog' && (
              <div className="animate-bounce">
                <div className="text-9xl">🐸</div>
                <div className="text-3xl font-bold text-accent">
                  SORTE SALTITANTE!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};