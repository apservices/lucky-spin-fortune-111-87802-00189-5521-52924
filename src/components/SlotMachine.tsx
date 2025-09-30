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
  RotateCcw, 
  Bell,
  Gift,
  Users,
  Trophy,
  Calendar,
  Link,
  Volume2,
  VolumeX,
  Menu
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

interface SlotMachineProps {
  coins: number;
  energy: number;
  level: number;
  experience: number;
  maxExperience: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onExperienceChange: (newExperience: number) => void;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
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
  const [autoPlay, setAutoPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboMode, setTurboMode] = useState(false);
  
  const [reels, setReels] = useState<string[][]>([
    ['🍊', '🧧', '📜'],
    ['🧧', '🍊', '🐸'],
    ['📜', '🐸', '🍊']
  ]);
  
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [jackpotEffect, setJackpotEffect] = useState(false);
  const [winLine, setWinLine] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([]);
  
  const slotRef = useRef<HTMLDivElement>(null);

  // VIP and gamification state
  const vipLevel = Math.floor(level / 5) + 1;
  const vipProgress = ((level % 5) / 5) * 100;
  const dailyMissions = 3; // Mock data
  const completedMissions = 1; // Mock data

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

  const createSparkles = () => {
    const newSparkles = [];
    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }
    setSparkles(newSparkles);
    
    setTimeout(() => setSparkles([]), 3000);
  };

  const playWinAnimation = (symbol: string, multiplier: number) => {
    const symbolData = symbols.find(s => s.emoji === symbol);
    if (!symbolData) return;

    setWinLine(true);
    setWinAnimation(symbolData.id);
    createSparkles();

    if (symbolData.id === 'tiger' || multiplier >= 10) {
      setJackpotEffect(true);
      // Screen shake effect
      if (slotRef.current) {
        slotRef.current.style.animation = 'shake 0.5s ease-in-out';
      }
    }

    // Reset animations after delay
    setTimeout(() => {
      setWinAnimation(null);
      setWinLine(false);
      setJackpotEffect(false);
      if (slotRef.current) {
        slotRef.current.style.animation = '';
      }
    }, turboMode ? 1500 : 3000);
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
    const spinDuration = turboMode ? 1000 : 2000;
    const spinInterval = setInterval(() => {
      setReels([generateReel(), generateReel(), generateReel()]);
    }, turboMode ? 50 : 100);

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
          toast.success(
            `🐯 MEGA JACKPOT! +${winAmount} moedas! 🎰`,
            {
              duration: 5000,
              style: {
                background: 'var(--pgbet-gradient-gold)',
                color: 'hsl(var(--pgbet-dark))',
                fontWeight: 'bold',
                fontSize: '18px'
              }
            }
          );
        } else if (winResult.multiplier >= 8) {
          toast.success(
            `🦊 SUPER PRÊMIO! +${winAmount} moedas!`,
            {
              duration: 4000,
              style: {
                background: 'var(--pgbet-gradient-emerald)',
                color: 'white',
                fontWeight: 'bold'
              }
            }
          );
        } else if (winResult.multiplier >= 5) {
          toast.success(
            `🐸 GRANDE PRÊMIO! +${winAmount} moedas!`,
            {
              duration: 3000,
              style: {
                background: 'var(--pgbet-gradient-red)',
                color: 'white'
              }
            }
          );
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pgbet-dark to-black text-white">
      {/* Top HUD - VIP Status & Navigation */}
      <div className="bg-pgbet-gradient-machine p-4 border-b-4 border-primary">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Menu className="w-6 h-6 text-primary" />
            <Trophy className="w-5 h-5 text-primary" />
            <Calendar className="w-5 h-5 text-secondary" />
            <Gift className="w-5 h-5 text-accent" />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-black/30 px-3 py-1 rounded-full">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">VIP {vipLevel}</span>
            </div>
            
            <div className="relative">
              <Bell className="w-6 h-6 text-primary animate-pgbet-coin-float" />
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
            className="h-2 bg-black/30"
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        {/* Game Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-pgbet-gradient-gold bg-clip-text text-transparent animate-pgbet-glow">
            PGBET FORTUNE
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
              <div className="absolute inset-0 bg-pgbet-gradient-gold opacity-30 animate-ping rounded-2xl"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div className="text-5xl font-bold text-primary animate-bounce text-center">
                  💰 MEGA JACKPOT! 💰
                </div>
              </div>
            </div>
          )}

          {/* Sparkles Effect */}
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute text-2xl animate-pgbet-sparkle pointer-events-none"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
              }}
            >
              ✨
            </div>
          ))}

          {/* Ornate Slot Frame */}
          <Card className="p-6 bg-pgbet-gradient-machine border-8 border-primary shadow-2xl rounded-3xl relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
            
            {/* Machine Header */}
            <div className="text-center mb-6">
              <div className="bg-pgbet-gradient-gold p-4 rounded-xl border-4 border-destructive shadow-inner">
                <h3 className="text-3xl font-bold text-background tracking-wider">FORTUNE REELS</h3>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="w-3 h-3 rounded-full bg-hsl(0_85%_50%) animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-hsl(142_86%_45%) animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-hsl(45_100%_50%) animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Reels Container */}
            <div className="bg-black/80 p-8 rounded-2xl border-4 border-hsl(45_100%_50%)/50 shadow-inner relative">
              <div className="grid grid-cols-3 gap-4">
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="flex flex-col space-y-2">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className={`
                          w-28 h-28 flex items-center justify-center text-6xl rounded-2xl border-4 transition-all duration-300 shadow-lg
                          ${isSpinning 
                            ? 'animate-pgbet-reel-spin bg-gradient-to-br from-hsl(45_100%_50%)/40 to-hsl(0_85%_50%)/40 border-hsl(45_100%_50%) shadow-hsl(45_100%_50%)/50' 
                            : 'bg-gradient-to-br from-hsl(240_15%_8%) to-hsl(0_0%_4%) border-hsl(45_100%_50%)/30 hover:shadow-xl hover:border-hsl(45_100%_50%)/70'
                          }
                          ${winLine && symbolIndex === 1 
                            ? 'bg-pgbet-gradient-gold border-hsl(45_100%_50%) animate-pgbet-win-pulse scale-110 shadow-hsl(45_100%_50%)/80' 
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
                <div className="absolute top-1/2 left-4 right-4 h-3 bg-pgbet-gradient-gold rounded-full animate-pgbet-glow z-20 transform -translate-y-1/2 shadow-lg border-2 border-hsl(0_85%_50%)">
                  <div className="absolute inset-0 bg-pgbet-gradient-gold rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom HUD Panel - PGbet Style */}
        <Card className="w-full max-w-md bg-pgbet-gradient-machine border-4 border-hsl(45_100%_50%) rounded-2xl shadow-2xl">
          <div className="p-6 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-hsl(45_100%_50%)/80 font-medium">CARTEIRA</div>
                <div className="text-xl font-bold text-hsl(45_100%_50%) flex items-center justify-center">
                  <Coins className="w-5 h-5 mr-1 animate-pgbet-coin-float" />
                  R$ {coins.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-hsl(142_86%_45%)/80 font-medium">APOSTA</div>
                <div className="text-xl font-bold text-hsl(142_86%_45%)">
                  R$ {betAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-hsl(0_85%_50%)/80 font-medium">ÚLTIMA VITÓRIA</div>
                <div className="text-xl font-bold text-hsl(0_85%_50%)">
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
                  className="w-10 h-10 p-0 bg-hsl(0_85%_50%) border-hsl(0_85%_50%) hover:bg-hsl(0_85%_40%) text-white"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => adjustBet(0.50)}
                  disabled={betAmount >= coins}
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-hsl(142_86%_45%) border-hsl(142_86%_45%) hover:bg-hsl(142_86%_35%) text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Main Spin Button - Yin Yang Style */}
              <Button
                onClick={spinReels}
                disabled={isSpinning || energy < 1 || coins < betAmount}
                className={`w-24 h-24 rounded-full text-2xl font-bold shadow-2xl transform transition-all duration-200 border-4 relative overflow-hidden ${
                  isSpinning 
                    ? 'scale-95 opacity-75 border-hsl(142_86%_45%)' 
                    : energy > 0 && coins >= betAmount
                      ? 'hover:scale-105 animate-pgbet-glow bg-pgbet-gradient-gold border-hsl(0_85%_50%) hover:shadow-hsl(45_100%_50%)/50' 
                      : 'opacity-50 cursor-not-allowed border-hsl(240_15%_8%)'
                }`}
              >
                {isSpinning ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-hsl(240_15%_8%)">
                    <Zap className="w-8 h-8" />
                    <span className="text-xs">GIRAR</span>
                  </div>
                )}
                
                {/* Yin-Yang Background Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-hsl(45_100%_50%) via-white to-hsl(0_85%_50%) opacity-20 animate-spin"></div>
              </Button>

              {/* Feature Controls */}
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setTurboMode(!turboMode)}
                  size="sm"
                  variant={turboMode ? "default" : "outline"}
                  className="w-12 h-6 text-xs bg-hsl(270_75%_55%) border-hsl(270_75%_55%) hover:bg-hsl(270_75%_45%)"
                >
                  ⚡
                </Button>
                
                <Button
                  onClick={() => setAutoPlay(!autoPlay)}
                  size="sm"
                  variant={autoPlay ? "default" : "outline"}
                  className="w-12 h-6 text-xs bg-hsl(142_86%_45%) border-hsl(142_86%_45%) hover:bg-hsl(142_86%_35%)"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Energy Indicator */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-hsl(45_100%_50%)" />
                <span>Energia: {energy}/10</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-hsl(45_100%_50%)"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <Button
            size="sm"
            className="rounded-full w-14 h-14 bg-hsl(142_86%_45%) hover:bg-hsl(142_86%_35%) shadow-lg animate-pgbet-coin-float"
          >
            <Link className="w-6 h-6" />
          </Button>
        </div>

        {/* Mascot Celebration Animation */}
        {winAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              {winAnimation === 'tiger' && (
                <div className="animate-bounce">
                  <div className="text-9xl animate-pulse">🐯</div>
                  <div className="text-3xl font-bold text-hsl(45_100%_50%) animate-pgbet-glow">
                    RUGIDO IMPERIAL!
                  </div>
                </div>
              )}
              {winAnimation === 'fox' && (
                <div className="animate-bounce">
                  <div className="text-9xl animate-spin">🦊</div>
                  <div className="text-3xl font-bold text-hsl(142_86%_45%) animate-pgbet-glow">
                    MAGIA DA RAPOSA!
                  </div>
                </div>
              )}
              {winAnimation === 'frog' && (
                <div className="animate-bounce">
                  <div className="text-9xl">🐸</div>
                  <div className="text-3xl font-bold text-hsl(0_85%_50%) animate-pgbet-glow">
                    SORTE SALTITANTE!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Symbol Paytable */}
      <Card className="mx-4 mb-4 bg-black/80 backdrop-blur-sm border-2 border-hsl(45_100%_50%)/30">
        <div className="p-4">
          <h3 className="text-lg font-bold text-center mb-3 text-hsl(45_100%_50%)">💫 TABELA DE PRÊMIOS 💫</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {symbols.map((symbol) => (
              <div
                key={symbol.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  symbol.rarity === 'legendary' 
                    ? 'bg-hsl(45_100%_50%)/20 border-hsl(45_100%_50%)' 
                    : symbol.rarity === 'rare'
                      ? 'bg-hsl(142_86%_45%)/20 border-hsl(142_86%_45%)'
                      : 'bg-hsl(0_85%_50%)/20 border-hsl(0_85%_50%)'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{symbol.emoji}</span>
                  <span className="text-xs">{symbol.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{symbol.multiplier}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};