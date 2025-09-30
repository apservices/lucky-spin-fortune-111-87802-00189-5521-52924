/**
 * Fullscreen Slot Machine - Optimized for Mobile
 * Layout: HUD (15%) + Game Area (60%) + Controls (25%)
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpriteComponent, SYMBOL_SPRITES, SpriteSymbol } from '@/components/SpriteSystem';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { gameEvents, GameEventType } from '@/systems/EventSystem';
import { PremiumParticleCanvas, PremiumParticleCanvasRef } from '@/components/PremiumParticleCanvas';
import { PlayCircle, Zap, RotateCcw, Plus, Minus, Settings } from 'lucide-react';
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

export const FullscreenSlotMachine: React.FC = () => {
  const { state } = useGameState();
  const { completeSpin, spendCoins, addCoins } = useGameActions();
  const particleCanvasRef = useRef<PremiumParticleCanvasRef>(null);
  const slotMachineRef = useRef<HTMLDivElement>(null);

  // Game state
  const [reels, setReels] = useState<SlotReel[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turboMode, setTurboMode] = useState(false);

  // Initialize reels - 3x3 grid
  useEffect(() => {
    const initialReels: SlotReel[] = Array(3).fill(null).map(() => ({
      symbols: Array(3).fill(null).map(() => getWeightedRandomSymbol()),
      isSpinning: false,
      spinOffset: 0
    }));
    setReels(initialReels);
  }, []);

  // Weighted random symbol selection
  const getWeightedRandomSymbol = useCallback((): SpriteSymbol => {
    const weights = {
      legendary: 0.05,
      rare: 0.25,
      common: 0.70
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
    
    return SYMBOL_SPRITES[0];
  }, []);

  // Check for winning combinations (3x3 grid)
  const checkWinningLines = useCallback((reelSymbols: SpriteSymbol[][]): WinLine[] => {
    const wins: WinLine[] = [];
    
    // Horizontal lines (3 rows)
    for (let row = 0; row < 3; row++) {
      const lineSymbols = reelSymbols.map(reel => reel[row]);
      const win = checkLineWin(lineSymbols, row);
      if (win) wins.push(win);
    }
    
    // Vertical lines (3 columns)
    for (let col = 0; col < 3; col++) {
      const lineSymbols = reelSymbols[col];
      const win = checkLineWin(lineSymbols, col + 3);
      if (win) wins.push(win);
    }
    
    // Diagonals
    const diagonal1 = [reelSymbols[0][0], reelSymbols[1][1], reelSymbols[2][2]];
    const diagonal2 = [reelSymbols[0][2], reelSymbols[1][1], reelSymbols[2][0]];
    
    const diag1Win = checkLineWin(diagonal1, 6);
    const diag2Win = checkLineWin(diagonal2, 7);
    
    if (diag1Win) wins.push(diag1Win);
    if (diag2Win) wins.push(diag2Win);
    
    return wins;
  }, []);

  // Check individual line for wins
  const checkLineWin = useCallback((symbols: SpriteSymbol[], lineIndex: number): WinLine | null => {
    if (symbols.length < 3) return null;
    
    const firstSymbol = symbols[0];
    const allMatch = symbols.every(symbol => symbol.id === firstSymbol.id);
    
    if (allMatch) {
      return {
        symbols,
        positions: Array.from({ length: 3 }, (_, i) => lineIndex * 3 + i),
        multiplier: firstSymbol.multiplier,
        payout: betAmount * firstSymbol.multiplier
      };
    }
    
    return null;
  }, [betAmount]);

  // Main spin function
  const handleSpin = useCallback(async () => {
    if (isSpinning || state.coins < betAmount || state.energy < 1) return;
    
    setIsSpinning(true);
    setWinLines([]);
    setLastWin(0);
    
    // Deduct bet and energy
    spendCoins(betAmount);
    
    // Emit spin event
    gameEvents.emit(GameEventType.SPIN_START, { 
      gameId: 'fortune-tiger',
      betAmount, 
      timestamp: Date.now() 
    });
    
    // Generate new symbols
    const newReels = reels.map(reel => ({
      ...reel,
      isSpinning: true,
      symbols: Array(3).fill(null).map(() => getWeightedRandomSymbol())
    }));
    
    setReels(newReels);
    
    // Spin duration
    const spinDuration = turboMode ? 800 : 1500;
    
    // Stop reels with staggered timing
    const reelStopPromises = newReels.map((_, index) => 
      new Promise<void>(resolve => {
        setTimeout(() => {
          setReels(prev => prev.map((reel, i) => 
            i === index ? { ...reel, isSpinning: false } : reel
          ));
          resolve();
        }, spinDuration + (index * (turboMode ? 50 : 150)));
      })
    );
    
    await Promise.all(reelStopPromises);
    
    // Check for wins
    const wins = checkWinningLines(newReels.map(reel => reel.symbols));
    
    if (wins.length > 0) {
      const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);
      setWinLines(wins);
      setLastWin(totalWin);
      
      addCoins(totalWin);
      
      // Trigger particle effects
      if (slotMachineRef.current && particleCanvasRef.current) {
        const rect = slotMachineRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        if (totalWin > betAmount * 15) {
          particleCanvasRef.current.emitJackpotEffect(centerX, centerY, 3);
        } else if (totalWin > betAmount * 5) {
          particleCanvasRef.current.emitWinEffect(centerX, centerY, 2);
        } else {
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
      
      const xpGained = Math.floor(totalWin / 10);
      completeSpin(totalWin, xpGained);
    }
    
    setIsSpinning(false);
  }, [
    isSpinning, state.coins, state.energy, betAmount, reels, turboMode, 
    spendCoins, addCoins, getWeightedRandomSymbol, 
    checkWinningLines, completeSpin
  ]);

  // Auto-spin functionality
  useEffect(() => {
    if (autoSpin && !isSpinning && state.coins >= betAmount && state.energy > 0) {
      const timer = setTimeout(handleSpin, turboMode ? 300 : 800);
      return () => clearTimeout(timer);
    }
  }, [autoSpin, isSpinning, state.coins, betAmount, state.energy, handleSpin, turboMode]);

  // Bet adjustment functions
  const adjustBet = useCallback((change: number) => {
    setBetAmount(prev => {
      const newAmount = prev + change;
      return Math.max(1, Math.min(state.coins, newAmount));
    });
  }, [state.coins]);

  // Memoized reel rendering for performance - Enhanced for 30% larger symbols
  const reelElements = useMemo(() => 
    reels.map((reel, reelIndex) => (
      <div key={reelIndex} className="flex flex-col gap-2">
        {reel.symbols.map((symbol, symbolIndex) => {
          const position = reelIndex * 3 + symbolIndex;
          const isWinningSymbol = winLines.some(win => 
            win.positions.includes(position)
          );
          
          return (
            <div
              key={`${reelIndex}-${symbolIndex}`}
              className={cn(
                "relative transition-all duration-300 flex items-center justify-center aspect-square bg-gradient-to-br from-black/20 to-purple-900/20 rounded-xl border border-primary/20 backdrop-blur-sm",
                reel.isSpinning && "animate-pulse scale-110",
                isWinningSymbol && "animate-bounce ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50"
              )}
              style={{
                transform: `scale(${isWinningSymbol ? 1.1 : 1})` // 10% scale boost for wins
              }}
            >
              <SpriteComponent
                symbol={symbol}
                isWinning={isWinningSymbol}
                isSpinning={reel.isSpinning}
                isJackpot={lastWin > betAmount * 15}
                size="lg"
                className="drop-shadow-2xl transform scale-130" // 30% larger as requested
                winMultiplier={isWinningSymbol ? 1.4 : 1}
              />
              
              {/* Symbol frame glow effect */}
              {isWinningSymbol && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/30 to-orange-600/30 animate-pulse pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    )), [reels, winLines, lastWin, betAmount, isSpinning]);

  return (
    <div className="h-screen w-full bg-premium-gold animate-premium-background overflow-hidden relative flex flex-col" ref={slotMachineRef}>
      {/* Premium Particle System */}
      <PremiumParticleCanvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
      
      {/* HUD - Top 12% */}
      <header className="h-[12vh] w-full bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm border-b border-primary/20 relative z-30">
        <div className="h-full flex items-center justify-between px-4 py-2">
          {/* Left Stats */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-2 bg-black/60 border-yellow-500/50">
              <span className="text-yellow-400">💰</span>
              <span className="ml-2 text-white font-bold">{state.coins.toLocaleString()}</span>
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-2 bg-black/60 border-blue-500/50">
              <span className="text-blue-400">⚡</span>
              <span className="ml-2 text-white font-bold">{state.energy}</span>
            </Badge>
          </div>

          {/* Center Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              🐅 Zodiac Fortune
            </h1>
            {lastWin > 0 && (
              <div className="text-xl font-bold text-green-400 animate-pulse">
                +{lastWin.toLocaleString()}
              </div>
            )}
          </div>

          {/* Right Stats */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-2 bg-black/60 border-purple-500/50">
              <span className="text-purple-400">🎯</span>
              <span className="ml-2 text-white font-bold">Nv.{state.level}</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Game Area - Center 50% */}
      <main className="h-[50vh] w-full flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-lg aspect-square bg-gradient-to-br from-black/50 to-purple-900/50 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 shadow-2xl">
          {/* Win Lines Indicator */}
          {winLines.length > 0 && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-40">
              <Badge className="text-xl px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce shadow-lg">
                🎉 {winLines.length} linha{winLines.length > 1 ? 's' : ''}!
              </Badge>
            </div>
          )}

          {/* 3x3 Slot Grid - Larger symbols */}
          <div className="grid grid-cols-3 gap-4 h-full w-full">
            {reelElements}
          </div>
        </div>
      </main>

      {/* Controls - Bottom 38% - More Prominent */}
      <footer className="h-[38vh] w-full bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm border-t border-primary/30 relative z-30">
        <div className="h-full flex flex-col justify-center px-6 py-4 gap-6">
          
          {/* Bet Controls - Larger and more visible */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustBet(-5)}
              disabled={isSpinning || betAmount <= 1}
              className="h-16 w-16 rounded-full bg-black/60 border-red-500/50 hover:bg-red-500/30 text-red-400 font-bold text-xl"
            >
              <Minus className="w-8 h-8" />
            </Button>
            
            <div className="text-center bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-primary/30">
              <div className="text-lg text-gray-300 mb-1">Aposta</div>
              <Badge variant="secondary" className="text-3xl px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                {betAmount}
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => adjustBet(5)}
              disabled={isSpinning}
              className="h-16 w-16 rounded-full bg-black/60 border-green-500/50 hover:bg-green-500/30 text-green-400 font-bold text-xl"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>

          {/* Action Buttons - Much larger and more prominent */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={turboMode ? "default" : "outline"}
              onClick={() => setTurboMode(!turboMode)}
              disabled={isSpinning}
              className="h-16 px-6 bg-black/60 border-orange-500/50 hover:bg-orange-500/30 text-orange-400 font-bold"
            >
              <Zap className="w-6 h-6 mr-2" />
              <span className="text-lg">TURBO</span>
            </Button>
            
            {/* MAIN SPIN BUTTON - Extra Large and Prominent */}
            <Button
              onClick={handleSpin}
              disabled={isSpinning || state.coins < betAmount || state.energy < 1}
              className="h-20 px-12 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold text-2xl shadow-lg transform active:scale-95 transition-all duration-150 border-2 border-yellow-300"
            >
              <PlayCircle className="w-8 h-8 mr-3" />
              {isSpinning ? 'GIRANDO...' : 'SPIN'}
            </Button>
            
            <Button
              variant={autoSpin ? "default" : "outline"}
              onClick={() => setAutoSpin(!autoSpin)}
              disabled={isSpinning}
              className="h-16 px-6 bg-black/60 border-blue-500/50 hover:bg-blue-500/30 text-blue-400 font-bold"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              <span className="text-lg">AUTO</span>
            </Button>
          </div>

          {/* Game Status Bar */}
          <div className="text-center text-white/80">
            <div className="text-lg">
              {state.energy < 1 && <span className="text-red-400">⚡ Energia insuficiente</span>}
              {state.coins < betAmount && <span className="text-red-400">💰 Moedas insuficientes</span>}
              {state.energy >= 1 && state.coins >= betAmount && !isSpinning && <span className="text-green-400">✓ Pronto para jogar</span>}
              {isSpinning && <span className="text-yellow-400 animate-pulse">🎰 Girando...</span>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};