/**
 * Premium Slot Machine Game - 5x3 Zodiac Slots
 * Mecânica completa com animações fluidas
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  Settings, 
  Info, 
  History, 
  Zap, 
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Fallback para confetti se não carregar
const safeConfetti = (options?: confetti.Options) => {
  try {
    confetti(options);
  } catch (e) {
    console.log('Confetti not available');
  }
};

// Símbolos do zodíaco com pesos e valores
const ZODIAC_SYMBOLS = [
  { id: 'aries', name: 'Áries', emoji: '♈', weight: 15, value: 20, rarity: 'common' },
  { id: 'taurus', name: 'Touro', emoji: '♉', weight: 15, value: 20, rarity: 'common' },
  { id: 'gemini', name: 'Gêmeos', emoji: '♊', weight: 12, value: 30, rarity: 'common' },
  { id: 'cancer', name: 'Câncer', emoji: '♋', weight: 12, value: 30, rarity: 'common' },
  { id: 'leo', name: 'Leão', emoji: '♌', weight: 1, value: 200, rarity: 'epic' },
  { id: 'virgo', name: 'Virgem', emoji: '♍', weight: 10, value: 40, rarity: 'rare' },
  { id: 'libra', name: 'Libra', emoji: '♎', weight: 10, value: 40, rarity: 'rare' },
  { id: 'scorpio', name: 'Escorpião', emoji: '♏', weight: 5, value: 500, rarity: 'epic' },
  { id: 'sagittarius', name: 'Sagitário', emoji: '♐', weight: 8, value: 50, rarity: 'rare' },
  { id: 'capricorn', name: 'Capricórnio', emoji: '♑', weight: 8, value: 50, rarity: 'rare' },
  { id: 'aquarius', name: 'Aquário', emoji: '♒', weight: 7, value: 60, rarity: 'rare' },
  { id: 'pisces', name: 'Peixes', emoji: '♓', weight: 7, value: 60, rarity: 'rare' }
];

const BET_AMOUNT = 10;
const REELS = 5;
const ROWS = 3;
const PAYLINES = 20;

interface SpinResult {
  symbols: string[][];
  winLines: WinLine[];
  totalWin: number;
}

interface WinLine {
  line: number;
  symbols: string[];
  count: number;
  payout: number;
}

interface HistoryItem {
  timestamp: number;
  bet: number;
  win: number;
  symbols: string[][];
}

export const PremiumSlotMachineGame: React.FC = () => {
  const { state } = useGameState();
  const { setCoins, setEnergy } = useGameActions();
  
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [autoSpin, setAutoSpin] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Inicializar rolos
  useEffect(() => {
    setReels(Array(REELS).fill(null).map(() => generateReel()));
  }, []);

  // Obter símbolo aleatório com base nos pesos
  const getWeightedRandomSymbol = useCallback(() => {
    const totalWeight = ZODIAC_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of ZODIAC_SYMBOLS) {
      random -= symbol.weight;
      if (random <= 0) return symbol.id;
    }
    
    return ZODIAC_SYMBOLS[0].id;
  }, []);

  // Gerar um rolo
  const generateReel = useCallback(() => {
    return Array(ROWS).fill(null).map(() => getWeightedRandomSymbol());
  }, [getWeightedRandomSymbol]);

  // Verificar vitórias
  const checkWins = useCallback((symbols: string[][]): { winLines: WinLine[]; totalWin: number } => {
    const wins: WinLine[] = [];
    let totalWin = 0;

    // Verificar linhas horizontais
    for (let row = 0; row < ROWS; row++) {
      const line: string[] = [];
      for (let col = 0; col < REELS; col++) {
        line.push(symbols[col][row]);
      }
      
      // Contar símbolos consecutivos
      let count = 1;
      const firstSymbol = line[0];
      for (let i = 1; i < line.length; i++) {
        if (line[i] === firstSymbol) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        const symbolData = ZODIAC_SYMBOLS.find(s => s.id === firstSymbol);
        if (symbolData) {
          let payout = symbolData.value;
          if (count === 4) payout *= 2;
          if (count === 5) payout *= 10;

          wins.push({
            line: row,
            symbols: line.slice(0, count),
            count,
            payout
          });

          totalWin += payout;
        }
      }
    }

    // Jackpot: 5x Leão
    const leoLine = wins.find(w => w.symbols[0] === 'leo' && w.count === 5);
    if (leoLine) {
      totalWin += 10000;
      leoLine.payout += 10000;
    }

    return { winLines: wins, totalWin };
  }, []);

  // Executar giro
  const executeSpin = useCallback(async () => {
    if (state.coins < BET_AMOUNT || isSpinning) {
      if (state.coins < BET_AMOUNT) {
        toast({
          title: "Fichas insuficientes",
          description: `Você precisa de ${BET_AMOUNT} fichas para girar`,
          variant: "destructive"
        });
      }
      return;
    }

    setIsSpinning(true);
    setWinLines([]);
    setLastWin(0);

    // Deduzir aposta
    setCoins(state.coins - BET_AMOUNT);

    // Som de giro
    if (soundEnabled) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 200;
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Gerar novos rolos
    const newReels = Array(REELS).fill(null).map(() => generateReel());
    
    // Animação de giro
    const spinDuration = turboMode ? 1000 : 2500;
    
    // Animar cada rolo com delay
    for (let i = 0; i < REELS; i++) {
      setTimeout(() => {
        setReels(prev => {
          const updated = [...prev];
          updated[i] = newReels[i];
          return updated;
        });
      }, i * (spinDuration / REELS));
    }

    // Verificar vitórias após animação
    setTimeout(() => {
      const { winLines: wins, totalWin } = checkWins(newReels);
      
      setWinLines(wins);
      setLastWin(totalWin);
      
      if (totalWin > 0) {
        setCoins(state.coins - BET_AMOUNT + totalWin);
        
        // Efeitos de vitória
        if (soundEnabled) {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          oscillator.frequency.value = 800;
          oscillator.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
        }

        // Confetti para grandes vitórias
        if (totalWin >= 200) {
          safeConfetti({
            particleCount: totalWin >= 1000 ? 200 : 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        // Toast de vitória
        const multiplier = totalWin / BET_AMOUNT;
        let message = `Ganhou ${totalWin} fichas!`;
        if (multiplier >= 100) message = `🎉 JACKPOT! ${totalWin} fichas!`;
        else if (multiplier >= 10) message = `🔥 MEGA WIN! ${totalWin} fichas!`;
        else if (multiplier >= 5) message = `⭐ BIG WIN! ${totalWin} fichas!`;

        toast({
          title: message,
          description: `Multiplicador: ${multiplier.toFixed(1)}x`,
        });

        // Sparkles
        const newSparkles = Array(10).fill(null).map((_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
        setSparkles(newSparkles);
        setTimeout(() => setSparkles([]), 2000);
      }

      // Adicionar ao histórico
      setHistory(prev => [{
        timestamp: Date.now(),
        bet: BET_AMOUNT,
        win: totalWin,
        symbols: newReels
      }, ...prev].slice(0, 10));

      setIsSpinning(false);

      // Auto-spin
      if (autoSpin > 0) {
        setAutoSpin(prev => prev - 1);
        setTimeout(() => executeSpin(), turboMode ? 500 : 1000);
      }
    }, spinDuration);
  }, [state.coins, isSpinning, turboMode, soundEnabled, autoSpin, checkWins, generateReel, setCoins]);

  // Reel component
  const Reel = useMemo(() => ({ symbols, isSpinning: spinning }: { symbols: string[]; isSpinning: boolean }) => (
    <div className="flex flex-col gap-2">
      {symbols.map((symbolId, idx) => {
        const symbol = ZODIAC_SYMBOLS.find(s => s.id === symbolId);
        return (
          <motion.div
            key={idx}
            className={`
              relative w-20 h-20 md:w-24 md:h-24 
              rounded-xl border-2 border-fortune-gold/50
              bg-gradient-to-br from-black/80 to-purple-900/50
              flex items-center justify-center text-4xl md:text-5xl
              ${symbol?.rarity === 'epic' ? 'shadow-[0_0_20px_rgba(251,191,36,0.6)]' : ''}
              ${symbol?.rarity === 'rare' ? 'shadow-[0_0_15px_rgba(147,51,234,0.4)]' : ''}
            `}
            animate={spinning ? {
              y: [-300, 0],
              filter: ['blur(8px)', 'blur(0px)']
            } : {}}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            <span className={spinning ? 'blur-sm' : ''}>{symbol?.emoji}</span>
            {symbol?.rarity === 'epic' && !spinning && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-fortune-gold/20 to-transparent"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  ), []);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-fortune-gold/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Sparkles de vitória */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            className="absolute w-4 h-4 bg-fortune-gold rounded-full pointer-events-none"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-fortune-gold/20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent">
            Fortune Tiger
          </h1>
          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">+18</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-lg border border-fortune-gold/30">
            <span className="text-fortune-gold text-sm md:text-base">💰</span>
            <span className="text-white font-bold text-sm md:text-lg">{state.coins}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-fortune-gold"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="text-fortune-gold"
          >
            <History size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPaytable(true)}
            className="text-fortune-gold"
          >
            <Info size={20} />
          </Button>
        </div>
      </div>

      {/* Área principal do slot */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] p-4">
        {/* Moldura do slot */}
        <motion.div
          className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-900/80 to-black/80 backdrop-blur-md border-4 border-fortune-gold/50 shadow-[0_0_50px_rgba(251,191,36,0.3)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* LEDs pulsantes */}
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-3xl overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-fortune-gold rounded-full"
                style={{
                  left: `${(i / 20) * 100}%`,
                  top: i % 2 === 0 ? '-4px' : 'auto',
                  bottom: i % 2 === 1 ? '-4px' : 'auto'
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>

          {/* Grid de rolos */}
          <div className="flex gap-2 md:gap-4">
            {reels.map((reel, idx) => (
              <Reel key={idx} symbols={reel} isSpinning={isSpinning} />
            ))}
          </div>

          {/* Linhas de vitória */}
          {winLines.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {winLines.map((win, idx) => (
                <motion.div
                  key={idx}
                  className="absolute left-0 right-0 h-1 bg-fortune-gold"
                  style={{ top: `${(win.line + 0.5) * 33.33}%` }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 1, 0], scaleX: 1 }}
                  transition={{ duration: 0.5, repeat: 3 }}
                />
              ))}
            </div>
          )}

          {/* Último ganho */}
          {lastWin > 0 && (
            <motion.div
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fortune-gold to-fortune-ember px-6 py-3 rounded-full text-white font-bold text-xl md:text-2xl shadow-[0_0_30px_rgba(251,191,36,0.8)]"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              +{lastWin} 💰
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Controles */}
      <div className="relative z-10 fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-fortune-gold/20 p-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Info de aposta */}
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">APOSTA</div>
              <div className="text-lg font-bold text-white">{BET_AMOUNT}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">LINHAS</div>
              <div className="text-lg font-bold text-white">{PAYLINES}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">ÚLTIMO GANHO</div>
              <div className="text-lg font-bold text-fortune-gold">{lastWin}</div>
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTurboMode(!turboMode)}
              className={`${turboMode ? 'bg-fortune-gold text-black' : 'text-fortune-gold'} border-fortune-gold`}
            >
              <Zap size={16} className="mr-1" />
              Turbo
            </Button>

            <Button
              onClick={executeSpin}
              disabled={isSpinning || state.coins < BET_AMOUNT || autoSpin > 0}
              className="relative px-8 py-6 text-xl font-bold bg-gradient-to-r from-fortune-gold to-fortune-ember hover:from-fortune-ember hover:to-fortune-gold shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-50"
            >
              <PlayCircle className="mr-2" size={24} />
              {isSpinning ? 'GIRANDO...' : autoSpin > 0 ? `AUTO ${autoSpin}` : 'GIRAR'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSpin(autoSpin > 0 ? 0 : 10)}
              disabled={isSpinning}
              className="text-fortune-gold border-fortune-gold"
            >
              {autoSpin > 0 ? <Pause size={16} /> : 'Auto 10'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Paytable */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaytable(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-black rounded-2xl border-2 border-fortune-gold/50 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-fortune-gold mb-4">Tabela de Pagamentos</h2>
              <div className="space-y-3">
                {ZODIAC_SYMBOLS.map(symbol => (
                  <div key={symbol.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{symbol.emoji}</span>
                      <span className="text-white font-medium">{symbol.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-fortune-gold font-bold">3x: {symbol.value}</div>
                      <div className="text-gray-400 text-sm">4x: {symbol.value * 2} | 5x: {symbol.value * 10}</div>
                    </div>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-fortune-gold to-fortune-ember p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-black">🎰 JACKPOT 🎰</div>
                  <div className="text-black font-bold">5x ♌ Leão = 10.000 fichas!</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Histórico */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-black rounded-2xl border-2 border-fortune-gold/50 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-fortune-gold mb-4">Histórico de Giros</h2>
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum giro ainda</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div key={idx} className="bg-black/40 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-white">
                          Aposta: {item.bet} | Ganho: <span className={item.win > 0 ? 'text-fortune-gold font-bold' : 'text-gray-500'}>{item.win}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
