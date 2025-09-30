import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Coins, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ZodiacFortuneSlotProps {
  coins: number;
  energy: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
}

type Symbol = {
  emoji: string;
  name: string;
  multiplier: number;
  rarity: 'common' | 'rare' | 'legendary';
  color: string;
};

const symbols: Symbol[] = [
  { emoji: '🐯', name: 'Tigre Dourado', multiplier: 15, rarity: 'legendary', color: 'text-yellow-400' },
  { emoji: '🦊', name: 'Raposa da Sorte', multiplier: 8, rarity: 'rare', color: 'text-orange-400' },
  { emoji: '🐸', name: 'Sapo da Prosperidade', multiplier: 6, rarity: 'rare', color: 'text-green-400' },
  { emoji: '🍊', name: 'Laranja da Fortuna', multiplier: 4, rarity: 'common', color: 'text-orange-300' },
  { emoji: '🧧', name: 'Envelope Vermelho', multiplier: 5, rarity: 'common', color: 'text-red-400' },
  { emoji: '📜', name: 'Pergaminho Místico', multiplier: 7, rarity: 'rare', color: 'text-amber-300' },
];

export const ZodiacFortuneSlot: React.FC<ZodiacFortuneSlotProps> = ({
  coins,
  energy,
  onCoinsChange,
  onEnergyChange
}) => {
  const [reels, setReels] = useState<Symbol[][]>([
    [symbols[0], symbols[1], symbols[2]],
    [symbols[3], symbols[4], symbols[5]],
    [symbols[1], symbols[2], symbols[0]]
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [bet, setBet] = useState(50);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turboMode, setTurboMode] = useState(false);

  // Floating coins animation
  const [floatingCoins, setFloatingCoins] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    // Generate floating coins background
    const generateFloatingCoins = () => {
      const coins = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setFloatingCoins(coins);
    };
    
    generateFloatingCoins();
    // Disable floating coins interval to improve performance
    // const interval = setInterval(generateFloatingCoins, 10000);
    // return () => clearInterval(interval);
  }, []);

  const getRandomSymbol = (): Symbol => {
    const weights = {
      common: 0.6,
      rare: 0.3,
      legendary: 0.1
    };
    
    const random = Math.random();
    let rarity: 'common' | 'rare' | 'legendary';
    
    if (random < weights.legendary) {
      rarity = 'legendary';
    } else if (random < weights.legendary + weights.rare) {
      rarity = 'rare';
    } else {
      rarity = 'common';
    }
    
    const filteredSymbols = symbols.filter(s => s.rarity === rarity);
    return filteredSymbols[Math.floor(Math.random() * filteredSymbols.length)];
  };

  const checkWin = (newReels: Symbol[][]) => {
    // Check middle row (line win)
    const middleRow = [newReels[0][1], newReels[1][1], newReels[2][1]];
    
    if (middleRow[0].name === middleRow[1].name && middleRow[1].name === middleRow[2].name) {
      const symbol = middleRow[0];
      const winAmount = bet * symbol.multiplier;
      return { win: true, amount: winAmount, symbol, line: 'middle' };
    }
    
    // Check other winning patterns (optional bonus)
    const topRow = [newReels[0][0], newReels[1][0], newReels[2][0]];
    const bottomRow = [newReels[0][2], newReels[1][2], newReels[2][2]];
    
    if (topRow[0].name === topRow[1].name && topRow[1].name === topRow[2].name) {
      const symbol = topRow[0];
      const winAmount = Math.floor(bet * symbol.multiplier * 0.5);
      return { win: true, amount: winAmount, symbol, line: 'top' };
    }
    
    if (bottomRow[0].name === bottomRow[1].name && bottomRow[1].name === bottomRow[2].name) {
      const symbol = bottomRow[0];
      const winAmount = Math.floor(bet * symbol.multiplier * 0.5);
      return { win: true, amount: winAmount, symbol, line: 'bottom' };
    }
    
    return { win: false, amount: 0, symbol: null, line: null };
  };

  const spin = async () => {
    if (energy < 1) {
      toast.error('⚡ Energia insuficiente! Aguarde ou assista um anúncio.');
      return;
    }
    
    if (coins < bet) {
      toast.error('💰 Moedas insuficientes para esta aposta!');
      return;
    }

    setIsSpinning(true);
    setShowWin(false);
    
    // Consume energy and bet
    onEnergyChange(energy - 1);
    onCoinsChange(coins - bet);

    // Animate reels spinning
    const spinDuration = turboMode ? 1000 : 2000;
    
    setTimeout(() => {
      const newReels = [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      ];
      
      setReels(newReels);
      
      const result = checkWin(newReels);
      
      if (result.win) {
        setLastWin(result.amount);
        setShowWin(true);
        onCoinsChange(coins - bet + result.amount);
        
        // Victory toast with special styling
        toast.success(
          `🎰 VITÓRIA! ${result.symbol?.emoji} ${result.symbol?.name} - Linha ${result.line?.toUpperCase()}! +${result.amount} moedas!`,
          {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(0 85% 50%))',
              color: 'hsl(0 0% 0%)',
              border: '2px solid hsl(45 100% 70%)',
              fontWeight: 'bold',
            }
          }
        );
        
        // Hide win animation after delay
        setTimeout(() => setShowWin(false), 3000);
      }
      
      setIsSpinning(false);
    }, spinDuration);
  };

  const adjustBet = (increment: boolean) => {
    if (increment && bet < 500) {
      setBet(prev => Math.min(prev + 25, 500));
    } else if (!increment && bet > 25) {
      setBet(prev => Math.max(prev - 25, 25));
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Floating Coins Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingCoins.map(coin => (
          <div
            key={coin.id}
            className="absolute text-2xl opacity-20 animate-pgbet-coin-float"
            style={{
              left: `${coin.x}%`,
              top: `${coin.y}%`,
              animationDelay: `${coin.id * 0.5}s`
            }}
          >
            🪙
          </div>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-pgbet-dark via-black to-pgbet-dark border-2 border-pgbet-gold shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-pgbet-gradient-gold bg-clip-text text-transparent mb-2">
            🐯 Zodiac Fortune Slots 🐯
          </h2>
          <Badge className="bg-pgbet-red text-white animate-pulse">
            Edição Tigre da Fortuna
          </Badge>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-pgbet-gold/10 rounded-lg border border-pgbet-gold/30">
            <Coins className="w-6 h-6 text-pgbet-gold mx-auto mb-1" />
            <div className="text-xl font-bold text-pgbet-gold">{coins}</div>
            <div className="text-xs text-gray-400">Moedas</div>
          </div>
          
          <div className="text-center p-3 bg-pgbet-red/10 rounded-lg border border-pgbet-red/30">
            <Zap className="w-6 h-6 text-pgbet-red mx-auto mb-1" />
            <div className="text-xl font-bold text-pgbet-red">{energy}</div>
            <div className="text-xs text-gray-400">Energia</div>
          </div>
          
          <div className="text-center p-3 bg-pgbet-emerald/10 rounded-lg border border-pgbet-emerald/30">
            <Crown className="w-6 h-6 text-pgbet-emerald mx-auto mb-1" />
            <div className="text-xl font-bold text-pgbet-emerald">{bet}</div>
            <div className="text-xs text-gray-400">Aposta</div>
          </div>
        </div>

        {/* Slot Machine - 3x3 Grid */}
        <div className="relative mb-6">
          {showWin && (
            <div className="absolute inset-0 bg-pgbet-gradient-gold opacity-20 animate-pgbet-win-pulse rounded-lg z-10"></div>
          )}
          
          <div className="grid grid-cols-3 gap-3 p-6 bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-xl border-4 border-pgbet-gold shadow-2xl relative">
            {/* 3D Perspective Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pgbet-gold/5 via-transparent to-pgbet-red/5 rounded-lg"></div>
            
            {reels.map((column, colIndex) => (
              <div key={colIndex} className="space-y-3 relative">
                {column.map((symbol, rowIndex) => (
                  <div
                    key={`${colIndex}-${rowIndex}`}
                    className={`
                      h-24 flex items-center justify-center text-5xl relative
                      bg-gradient-to-br from-gray-800 via-gray-900 to-black
                      border-3 border-gradient-to-r from-pgbet-gold/50 to-pgbet-red/50
                      rounded-xl shadow-lg transform-gpu
                      ${isSpinning ? 'animate-[spin_0.1s_ease-in-out_infinite] scale-110 blur-sm' : 'hover:scale-105 transition-all duration-300'}
                      ${showWin && rowIndex === 1 ? 'ring-4 ring-pgbet-gold animate-pulse scale-110 shadow-2xl shadow-pgbet-gold/50' : ''}
                      before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-xl before:pointer-events-none
                      after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/30 after:to-transparent after:rounded-xl after:pointer-events-none
                    `}
                    style={{
                      transform: isSpinning ? `perspective(1000px) rotateX(${Math.sin(Date.now() * 0.01 + colIndex) * 10}deg) rotateY(${Math.cos(Date.now() * 0.01 + rowIndex) * 5}deg)` : 'perspective(1000px) rotateX(2deg)',
                      boxShadow: showWin && rowIndex === 1 ? '0 0 40px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <span 
                      className={`${symbol.color} relative z-10 drop-shadow-lg transform transition-all duration-300 ${
                        showWin && rowIndex === 1 ? 'animate-bounce scale-125' : ''
                      }`}
                      style={{
                        filter: 'drop-shadow(0 0 10px currentColor)',
                        textShadow: '0 0 20px currentColor, 0 0 40px currentColor'
                      }}
                    >
                      {symbol.emoji}
                    </span>
                    
                    {/* Mystical glow effect */}
                    <div className={`absolute inset-0 bg-gradient-radial from-current/20 to-transparent rounded-xl ${
                      showWin && rowIndex === 1 ? 'animate-ping' : ''
                    }`}></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Win Line Indicator */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-pgbet-gold/50 transform -translate-y-1/2 rounded-full pointer-events-none"></div>
        </div>

        {/* Win Display */}
        {showWin && lastWin > 0 && (
          <div className="text-center mb-4 p-4 bg-pgbet-gradient-gold rounded-lg animate-pgbet-win-pulse">
            <div className="text-black font-bold text-2xl">
              🎉 VITÓRIA! +{lastWin} 🎉
            </div>
          </div>
        )}

        {/* Controls - More prominent positioning */}
        <div className="space-y-6">
          {/* Bet Controls - Larger and more visible */}
          <div className="flex items-center justify-center space-x-6 bg-black/60 rounded-2xl p-4 border border-pgbet-gold/30">
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustBet(false)}
              disabled={bet <= 25}
              className="h-12 w-12 rounded-full border-pgbet-gold text-pgbet-gold hover:bg-pgbet-gold/20 text-xl font-bold"
            >
              -
            </Button>
            <div className="text-center bg-pgbet-gold/10 rounded-xl px-6 py-3 border border-pgbet-gold/30">
              <div className="text-sm text-pgbet-gold/80 mb-1">APOSTA</div>
              <div className="text-pgbet-gold font-bold text-2xl">{bet}</div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustBet(true)}
              disabled={bet >= 500}
              className="h-12 w-12 rounded-full border-pgbet-gold text-pgbet-gold hover:bg-pgbet-gold/20 text-xl font-bold"
            >
              +
            </Button>
          </div>

          {/* Action Buttons - Much larger and more prominent */}
          <div className="grid grid-cols-1 gap-4">
            {/* Main SPIN button - Extra large */}
            <Button
              onClick={spin}
              disabled={isSpinning || energy < 1 || coins < bet}
              className="h-20 bg-pgbet-gradient-gold text-black font-bold text-2xl hover:scale-105 transform transition-all duration-200 disabled:opacity-50 shadow-lg border-2 border-yellow-300"
            >
              {isSpinning ? '🎰 GIRANDO...' : '🎰 GIRAR AGORA'}
            </Button>
            
            {/* Secondary controls */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setTurboMode(!turboMode)}
                className={`h-14 border-2 font-bold text-lg ${
                  turboMode 
                    ? 'border-pgbet-red bg-pgbet-red/20 text-pgbet-red' 
                    : 'border-pgbet-purple text-pgbet-purple hover:bg-pgbet-purple/10'
                }`}
              >
                {turboMode ? '⚡ TURBO ON' : '⚡ MODO TURBO'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setAutoSpin(!autoSpin)}
                className={`h-14 border-2 font-bold text-lg ${
                  autoSpin 
                    ? 'border-pgbet-emerald bg-pgbet-emerald/20 text-pgbet-emerald' 
                    : 'border-gray-500 text-gray-300 hover:bg-gray-500/10'
                }`}
              >
                {autoSpin ? '🔄 AUTO ON' : '🔄 AUTO SPIN'}
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center p-3 bg-black/40 rounded-lg border border-primary/20">
            {energy < 1 && <div className="text-red-400 font-bold">⚡ Energia insuficiente</div>}
            {coins < bet && <div className="text-red-400 font-bold">💰 Moedas insuficientes</div>}
            {energy >= 1 && coins >= bet && !isSpinning && <div className="text-green-400 font-bold">✓ Pronto para jogar</div>}
            {isSpinning && <div className="text-yellow-400 font-bold animate-pulse">🎰 Girando...</div>}
          </div>
        </div>

        {/* Paytable Info */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="text-center text-pgbet-gold font-bold mb-2">💰 Tabela de Pagamentos</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {symbols.map(symbol => (
              <div key={symbol.name} className="flex items-center justify-between">
                <span className={`${symbol.color} mr-2`}>{symbol.emoji}</span>
                <span className="text-gray-300">{symbol.multiplier}x</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};