/**
 * Premium 3D Slot Machine Component
 * Features advanced 3D sprites, smooth animations, and optimized performance
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpriteComponent, SYMBOL_SPRITES, SpriteSymbol } from '@/components/SpriteSystem';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { gameEvents, GameEventType } from '@/systems/EventSystem';
import { PremiumParticleCanvas, PremiumParticleCanvasRef } from '@/components/PremiumParticleCanvas';
import { PlayCircle, Settings, Zap, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotReel {
  symbols: SpriteSymbol[];
  isSpinning: boolean;
  spinOffset: number;
}

interface WinLine {
  symbols: SpriteSymbol[];
  positions: number[];
  multiplier: number;
  payout: number;
}

export const Premium3DSlotMachine: React.FC = () => {
  const { state } = useGameState();
  const { completeSpin, spendCoins, addCoins } = useGameActions();
  const particleCanvasRef = useRef<PremiumParticleCanvasRef>(null);
  
  // Game state
  const [reels, setReels] = useState<SlotReel[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [slotMachineRef, setSlotMachineRef] = useState<HTMLDivElement | null>(null);

  // Initialize reels
  useEffect(() => {
    const initialReels: SlotReel[] = Array(5).fill(null).map(() => ({
      symbols: Array(3).fill(null).map(() => getWeightedRandomSymbol()),
      isSpinning: false,
      spinOffset: 0
    }));
    setReels(initialReels);
  }, []);

  // Weighted random symbol selection
  const getWeightedRandomSymbol = useCallback((): SpriteSymbol => {
    const weights = {
      legendary: 0.05, // 5% chance
      rare: 0.25,      // 25% chance  
      common: 0.70     // 70% chance
    };
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      cumulativeWeight += weight;
      if (random <= cumulativeWeight) {
        const symbolsOfRarity = SYMBOL_SPRITES.filter(s => s.rarity === rarity);
        return symbolsOfRarity[Math.floor(Math.random() * symbolsOfRarity.length)];
      }
    }
    
    return SYMBOL_SPRITES[0]; // Fallback
  }, []);

  // Check for winning combinations
  const checkWinningLines = useCallback((reelSymbols: SpriteSymbol[][]): WinLine[] => {
    const wins: WinLine[] = [];
    
    // Check horizontal lines (3 rows)
    for (let row = 0; row < 3; row++) {
      const lineSymbols = reelSymbols.map(reel => reel[row]);
      const win = checkLineWin(lineSymbols, row);
      if (win) wins.push(win);
    }
    
    // Check diagonals
    const diagonal1 = [
      reelSymbols[0][0], reelSymbols[1][1], reelSymbols[2][2], 
      reelSymbols[3][1], reelSymbols[4][0]
    ];
    const diagonal2 = [
      reelSymbols[0][2], reelSymbols[1][1], reelSymbols[2][0], 
      reelSymbols[3][1], reelSymbols[4][2]
    ];
    
    const diag1Win = checkLineWin(diagonal1, -1);
    const diag2Win = checkLineWin(diagonal2, -2);
    
    if (diag1Win) wins.push(diag1Win);
    if (diag2Win) wins.push(diag2Win);
    
    return wins;
  }, []);

  // Check individual line for wins
  const checkLineWin = useCallback((symbols: SpriteSymbol[], lineIndex: number): WinLine | null => {
    if (symbols.length < 3) return null;
    
    let matchCount = 1;
    const firstSymbol = symbols[0];
    
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i].id === firstSymbol.id) {
        matchCount++;
      } else {
        break;
      }
    }
    
    if (matchCount >= 3) {
      const baseMultiplier = firstSymbol.multiplier;
      const consecutiveBonus = matchCount > 3 ? (matchCount - 3) * 0.5 : 0;
      const totalMultiplier = baseMultiplier * (1 + consecutiveBonus);
      
      return {
        symbols: symbols.slice(0, matchCount),
        positions: Array.from({ length: matchCount }, (_, i) => lineIndex * 5 + i),
        multiplier: totalMultiplier,
        payout: betAmount * totalMultiplier
      };
    }
    
    return null;
  }, [betAmount]);

  // Main spin function
  const handleSpin = useCallback(async () => {
    if (isSpinning || state.coins < betAmount) return;
    
    setIsSpinning(true);
    setWinLines([]);
    setLastWin(0);
    
    // Deduct bet
    spendCoins(betAmount);
    
    // Emit spin event
    gameEvents.emit(GameEventType.SPIN_START, { 
      gameId: 'fortune-tiger',
      betAmount, 
      timestamp: Date.now() 
    });
    
    // Generate new symbols for each reel
    const newReels = reels.map(reel => ({
      ...reel,
      isSpinning: true,
      symbols: Array(3).fill(null).map(() => getWeightedRandomSymbol())
    }));
    
    setReels(newReels);
    
    // Spin duration (shorter for turbo mode)
    const spinDuration = turboMode ? 1000 : 2000;
    
    // Stop reels with staggered timing
    const reelStopPromises = newReels.map((_, index) => 
      new Promise<void>(resolve => {
        setTimeout(() => {
          setReels(prev => prev.map((reel, i) => 
            i === index ? { ...reel, isSpinning: false } : reel
          ));
          resolve();
        }, spinDuration + (index * (turboMode ? 100 : 200)));
      })
    );
    
    await Promise.all(reelStopPromises);
    
    // Check for wins
    const reelSymbols = newReels.map(reel => reel.symbols);
    const wins = checkWinningLines(reelSymbols);
    
    if (wins.length > 0) {
      const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);
      setWinLines(wins);
      setLastWin(totalWin);
      
      // Add winnings
      addCoins(totalWin);
      
      // Trigger premium particle effects
      if (slotMachineRef && particleCanvasRef.current) {
        const rect = slotMachineRef.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        if (totalWin > betAmount * 20) {
          // Jackpot effect
          particleCanvasRef.current.emitJackpotEffect(centerX, centerY, 3);
        } else if (totalWin > betAmount * 5) {
          // Big win effect
          particleCanvasRef.current.emitWinEffect(centerX, centerY, 2);
        } else {
          // Regular win effect
          particleCanvasRef.current.emitCoinBurst(centerX, centerY, 1);
        }
      }
      
      // Emit win event
      gameEvents.emit(GameEventType.WIN, { 
        amount: totalWin, 
        multiplier: wins[0]?.multiplier || 1,
        symbols: wins[0]?.symbols.map(s => s.id) || [],
        gameId: 'fortune-tiger'
      });
      
      // Complete spin with XP
      const xpGained = Math.floor(totalWin / 10);
      completeSpin(totalWin, xpGained);
    }
    
    setIsSpinning(false);
  }, [
    isSpinning, state.coins, betAmount, reels, turboMode, 
    spendCoins, addCoins, getWeightedRandomSymbol, 
    checkWinningLines, completeSpin, slotMachineRef
  ]);

  // Auto-spin functionality
  useEffect(() => {
    if (autoSpin && !isSpinning && state.coins >= betAmount) {
      const timer = setTimeout(handleSpin, turboMode ? 500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [autoSpin, isSpinning, state.coins, betAmount, handleSpin, turboMode]);

  // Memoized reel rendering
  const reelElements = useMemo(() => 
    reels.map((reel, reelIndex) => (
      <div key={reelIndex} className="flex flex-col space-y-2">
        {reel.symbols.map((symbol, symbolIndex) => {
          const position = reelIndex * 3 + symbolIndex;
          const isWinningSymbol = winLines.some(win => 
            win.positions.includes(position)
          );
          
          return (
            <div
              key={`${reelIndex}-${symbolIndex}`}
              className={cn(
                "relative transition-all duration-300",
                reel.isSpinning && "animate-spin"
              )}
            >
              <SpriteComponent
                symbol={symbol}
                isWinning={isWinningSymbol}
                isSpinning={reel.isSpinning}
                isJackpot={lastWin > betAmount * 20}
                size="lg"
                className="drop-shadow-lg"
                winMultiplier={isWinningSymbol ? 1.2 : 1}
              />
            </div>
          );
        })}
      </div>
    )), [reels, winLines, lastWin, betAmount, isSpinning]);

  return (
    <div className="relative" ref={setSlotMachineRef}>
      {/* Premium Particle System */}
      <PremiumParticleCanvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
      
      <Card className="p-6 bg-gradient-to-br from-background to-secondary/10 border-2 border-primary/20 relative z-10">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🐅 Zodiac Fortune 3D
        </h2>
        <p className="text-muted-foreground mt-1">Premium 3D Slot Experience</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            💰 {state.coins.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            ⚡ {state.energy}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            🎯 Nível {state.level}
          </Badge>
        </div>
        
        {lastWin > 0 && (
          <Badge className="text-xl px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
            🎉 +{lastWin.toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Slot Reels */}
      <div className="bg-gradient-to-br from-black/20 to-primary/10 p-6 rounded-xl border-2 border-primary/30 mb-6">
        <div className="grid grid-cols-5 gap-4 justify-items-center">
          {reelElements}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Aposta:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(prev => Math.max(1, prev - 1))}
              disabled={isSpinning}
            >
              -
            </Button>
            <Badge variant="secondary" className="px-3 py-1 text-lg">
              {betAmount}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(prev => Math.min(state.coins, prev + 1))}
              disabled={isSpinning}
            >
              +
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={turboMode ? "default" : "outline"}
              size="sm"
              onClick={() => setTurboMode(!turboMode)}
              disabled={isSpinning}
            >
              <Zap className="w-4 h-4 mr-1" />
              Turbo
            </Button>
            <Button
              variant={autoSpin ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpin(!autoSpin)}
              disabled={isSpinning}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Auto
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSpin}
          disabled={isSpinning || state.coins < betAmount}
          className="w-full py-4 text-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
        >
          <PlayCircle className="w-6 h-6 mr-2" />
          {isSpinning ? 'Girando...' : `Girar (${betAmount} moedas)`}
        </Button>
      </div>
    </Card>
    </div>
  );
};