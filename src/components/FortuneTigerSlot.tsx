import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Plus, 
  Minus, 
  Play, 
  Share2, 
  Settings,
  RotateCcw,
  Crown
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
  { id: 'frog', name: '🐸 Fortune Frog', emoji: '🐸', rarity: 'common', multiplier: 2, probability: 40 },
  { id: 'fox', name: '🦊 Lucky Fox', emoji: '🦊', rarity: 'rare', multiplier: 5, probability: 35 },
  { id: 'tiger', name: '🐯 Fortune Tiger', emoji: '🐯', rarity: 'legendary', multiplier: 15, probability: 25 },
];

// Chinese symbols for decoration
const chineseSymbols = ['🪙', '🧧', '🎆', '🏮', '🎇', '💰'];

interface FortuneTigerSlotProps {
  coins: number;
  energy: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
}

export const FortuneTigerSlot: React.FC<FortuneTigerSlotProps> = ({ 
  coins, 
  energy, 
  onCoinsChange, 
  onEnergyChange 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['🐸', '🦊', '🐯'],
    ['🦊', '🐸', '🐯'],
    ['🐯', '🐸', '🦊']
  ]);
  
  // Game state
  const [currentBet, setCurrentBet] = useState(0.50);
  const [lastWin, setLastWin] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [jackpotEffect, setJackpotEffect] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  
  // Effects
  const [coinRain, setCoinRain] = useState(false);
  const [dragonFire, setDragonFire] = useState(false);
  
  const slotRef = useRef<HTMLDivElement>(null);

  const referralCode = 'TIGER' + Math.random().toString(36).substr(2, 4).toUpperCase();

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

  const playWinAnimation = (symbol: string, winAmount: number) => {
    const symbolData = symbols.find(s => s.emoji === symbol);
    if (!symbolData) return;

    setWinAnimation(symbolData.id);
    setLastWin(winAmount);
    setTotalWin(prev => prev + winAmount);

    if (symbolData.id === 'tiger') {
      setJackpotEffect(true);
      setCoinRain(true);
      setDragonFire(true);
      
      // Screen shake effect
      if (slotRef.current) {
        slotRef.current.style.animation = 'shake 0.5s ease-in-out';
      }
    }

    // Reset animations after delay
    setTimeout(() => {
      setWinAnimation(null);
      setJackpotEffect(false);
      setCoinRain(false);
      setDragonFire(false);
      if (slotRef.current) {
        slotRef.current.style.animation = '';
      }
    }, turboMode ? 2000 : 4000);
  };

  const spinReels = () => {
    if (isSpinning || energy < 1) {
      if (energy < 1) {
        toast.error('⚡ Sem energia! Aguarde para girar novamente.');
      }
      return;
    }

    setIsSpinning(true);
    onEnergyChange(energy - 1);

    // Clear previous effects
    setLastWin(0);

    // Simulate spinning animation
    const spinDuration = turboMode ? 1000 : 2500;
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
        const winAmount = currentBet * winResult.multiplier;
        onCoinsChange(coins + winAmount);
        playWinAnimation(winResult.symbol, winAmount);
        
        // Different toast messages for different wins
        if (winResult.symbol === '🐯') {
          toast.success(
            `🐯 GANHO GRANDE! R$${winAmount.toFixed(2)}!`,
            {
              duration: 4000,
              style: {
                background: 'linear-gradient(45deg, hsl(45 100% 50%), hsl(25 100% 55%))',
                color: 'hsl(0 0% 4%)',
                fontWeight: 'bold',
                fontSize: '16px'
              }
            }
          );
        } else if (winResult.symbol === '🦊') {
          toast.success(
            `🦊 GANHO! R$${winAmount.toFixed(2)}`,
            {
              duration: 3000,
              style: {
                background: 'hsl(var(--fortune-red))',
                color: 'white',
              }
            }
          );
        } else {
          toast.success(
            `🐸 GANHO! R$${winAmount.toFixed(2)}`,
            {
              duration: 3000,
              style: {
                background: 'hsl(var(--fortune-ember))',
                color: 'white',
              }
            }
          );
        }
      } else {
        // Chance for bonus symbols even on losing spins
        const bonusChance = Math.random();
        if (bonusChance < 0.1) { // 10% chance
          const bonusAmount = currentBet * 0.5;
          onCoinsChange(coins + bonusAmount);
          toast.info(`🍀 Bônus da Sorte! R$${bonusAmount.toFixed(2)}`);
        }
      }
      
      setIsSpinning(false);
    }, spinDuration);
  };

  const adjustBet = (change: number) => {
    const newBet = Math.max(0.10, Math.min(10.00, currentBet + change));
    setCurrentBet(newBet);
  };

  const YinYangSpinButton = () => (
    <button
      onClick={spinReels}
      disabled={isSpinning || energy < 1}
      className={`
        relative w-24 h-24 rounded-full border-4 transition-all duration-300 transform
        ${isSpinning 
          ? 'animate-yin-yang-spin border-fortune-ember scale-95' 
          : energy > 0 
            ? 'hover:scale-110 border-fortune-gold shadow-glow-gold hover:shadow-glow-red' 
            : 'opacity-50 cursor-not-allowed border-muted'
        }
      `}
      style={{
        background: isSpinning 
          ? 'conic-gradient(from 0deg, hsl(45 100% 50%), hsl(0 80% 45%), hsl(45 100% 50%))' 
          : 'linear-gradient(45deg, hsl(45 100% 50%) 50%, hsl(0 80% 45%) 50%)'
      }}
    >
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-fortune-dark/80 to-transparent flex items-center justify-center">
        {isSpinning ? (
          <div className="w-3 h-3 bg-fortune-gold rounded-full animate-pulse" />
        ) : (
          <div className="text-fortune-gold font-bold text-sm">SPIN</div>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {chineseSymbols[Math.floor(Math.random() * chineseSymbols.length)]}
          </div>
        ))}
      </div>

      {/* Coin rain effect */}
      {coinRain && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-coin-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '3s'
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-r from-fortune-dark via-card to-fortune-dark border-b-2 border-fortune-gold">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center border-2 border-fortune-ember">
            <Crown className="w-6 h-6 text-fortune-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fortune-gold">Lucky Fortune Animal</h1>
            <p className="text-xs text-fortune-ember">Fortune Tiger Edition</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReferral(!showReferral)}
            className="bg-fortune-red/20 border-fortune-red text-fortune-gold hover:bg-fortune-red/30"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Indique & Ganhe
          </Button>
          <Button variant="ghost" size="sm" className="text-fortune-gold">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Referral popup */}
      {showReferral && (
        <div className="absolute top-20 right-4 z-50">
          <Card className="p-4 bg-fortune-dark border-2 border-fortune-gold shadow-glow-gold">
            <div className="space-y-3">
              <h3 className="font-bold text-fortune-gold">Seu Código de Indicação</h3>
              <div className="flex items-center space-x-2">
                <code className="bg-fortune-gold text-fortune-dark px-3 py-1 rounded font-mono">
                  {referralCode}
                </code>
                <Button size="sm" variant="outline" className="border-fortune-ember">
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe e ganhe R$5 por cada amigo!
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col h-screen">
        {/* Top section with reels */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            ref={slotRef}
            className={`relative ${jackpotEffect ? 'animate-pulse' : ''}`}
          >
            {/* Dragon fire effect */}
            {dragonFire && (
              <div className="absolute -inset-8 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fortune-ember/30 to-transparent animate-dragon-fire rounded-3xl"></div>
              </div>
            )}

            {/* Jackpot announcement */}
            {jackpotEffect && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
                <div className="text-4xl font-bold text-fortune-gold animate-bounce text-center">
                  <div>🐯 JACKPOT! 🐯</div>
                  <div className="text-2xl text-fortune-ember">GANHO R${lastWin.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Slot Reels Container */}
            <div className="bg-gradient-reels p-6 rounded-3xl border-4 border-fortune-gold shadow-fortune relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-2 left-2 text-2xl animate-pulse">🏮</div>
              <div className="absolute top-2 right-2 text-2xl animate-pulse">🏮</div>
              <div className="absolute bottom-2 left-2 text-2xl animate-pulse">🎆</div>
              <div className="absolute bottom-2 right-2 text-2xl animate-pulse">🎆</div>
              
              {/* Win line indicator */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-fortune-gold/20 rounded-full transform -translate-y-1/2"></div>
              
              {/* Reels */}
              <div className="grid grid-cols-3 gap-4 relative z-10">
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="space-y-3">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className={`
                          w-20 h-20 flex items-center justify-center text-5xl rounded-xl border-3 transition-all duration-300
                          ${isSpinning 
                            ? 'animate-reel-spin bg-gradient-to-br from-fortune-gold/20 to-fortune-red/20 border-fortune-ember' 
                            : 'bg-gradient-to-br from-card/80 to-fortune-dark/60 border-fortune-bronze hover:border-fortune-gold'
                          }
                          ${winAnimation && symbolIndex === 1 
                            ? 'bg-gradient-gold border-fortune-gold animate-glow-pulse scale-110 shadow-glow-gold' 
                            : ''
                          }
                        `}
                      >
                        <span className={`
                          drop-shadow-lg transition-all duration-300
                          ${winAnimation && symbolIndex === 1 ? 'animate-bounce text-6xl' : ''}
                          ${isSpinning ? 'blur-sm' : ''}
                        `}>
                          {symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom control panel */}
        <div className="bg-gradient-to-r from-fortune-dark via-card to-fortune-dark border-t-2 border-fortune-gold p-4">
          {/* Wallet info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">🧧 Saldo</div>
                <div className="text-lg font-bold text-fortune-gold">R${coins.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">💰 Aposta</div>
                <div className="text-lg font-bold text-fortune-ember">R${currentBet.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">🏆 Ganho</div>
                <div className="text-lg font-bold text-fortune-red">R${lastWin.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground">⚡ Energia</div>
              <div className="text-lg font-bold text-primary">{energy}/10</div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center space-x-4">
            {/* Bet controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBet(-0.10)}
                className="bg-fortune-red/20 border-fortune-red text-fortune-gold hover:bg-fortune-red/30"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBet(0.10)}
                className="bg-fortune-red/20 border-fortune-red text-fortune-gold hover:bg-fortune-red/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Turbo mode */}
            <Button
              variant={turboMode ? "default" : "outline"}
              size="sm"
              onClick={() => setTurboMode(!turboMode)}
              className={turboMode 
                ? "bg-fortune-ember text-fortune-dark" 
                : "bg-fortune-ember/20 border-fortune-ember text-fortune-gold hover:bg-fortune-ember/30"
              }
            >
              <Zap className="w-4 h-4" />
            </Button>

            {/* Main spin button */}
            <YinYangSpinButton />

            {/* Auto spin */}
            <Button
              variant={autoSpin ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpin(!autoSpin)}
              className={autoSpin 
                ? "bg-fortune-red text-white" 
                : "bg-fortune-red/20 border-fortune-red text-fortune-gold hover:bg-fortune-red/30"
              }
            >
              <Play className="w-4 h-4" />
            </Button>

            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              className="bg-muted/20 border-muted text-muted-foreground hover:bg-muted/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Win announcement overlay */}
      {winAnimation && lastWin > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="text-center space-y-4 animate-scale-in">
            <div className="text-8xl animate-bounce">
              {winAnimation === 'tiger' && '🐯'}
              {winAnimation === 'fox' && '🦊'}
              {winAnimation === 'frog' && '🐸'}
            </div>
            <div className="bg-gradient-gold text-fortune-dark px-8 py-4 rounded-2xl border-4 border-fortune-ember animate-glow-pulse">
              <div className="text-3xl font-bold">GANHO!</div>
              <div className="text-4xl font-bold">R${lastWin.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};