/**
 * Premium Slot Machine Game - 5x3 Zodiac Slots
 * Mecânica padronizada estilo Fortune Tiger
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  Info, 
  History, 
  Zap, 
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Minus
} from 'lucide-react';

// Fallback seguro para confetti
let confetti: any;
try {
  confetti = require('canvas-confetti');
} catch (e) {
  confetti = (options?: any) => console.log('Confetti not available');
}

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

interface HistoryItem {
  timestamp: number;
  bet: number;
  win: number;
  symbols: string[][];
}

export const PremiumSlotMachineGame: React.FC = () => {
  const { state } = useGameState();
  const { setCoins } = useGameActions();
  
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Inicializar rolos com símbolos aleatórios
  useEffect(() => {
    const initialReels: string[][] = [];
    for (let i = 0; i < REELS; i++) {
      initialReels.push(generateReel());
    }
    setReels(initialReels);
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

  // Gerar um rolo completo
  const generateReel = useCallback((): string[] => {
    return Array(ROWS).fill(null).map(() => getWeightedRandomSymbol());
  }, [getWeightedRandomSymbol]);

  // Verificar vitórias nas linhas
  const checkWins = useCallback((symbols: string[][]): number => {
    let totalWin = 0;

    // Verificar linha do meio (principal)
    const middleLine: string[] = [];
    for (let col = 0; col < REELS; col++) {
      middleLine.push(symbols[col][1]);
    }
    
    // Contar símbolos consecutivos da esquerda
    let count = 1;
    const firstSymbol = middleLine[0];
    for (let i = 1; i < middleLine.length; i++) {
      if (middleLine[i] === firstSymbol) {
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

        totalWin += payout;

        // Jackpot: 5x Leão
        if (firstSymbol === 'leo' && count === 5) {
          totalWin += 10000;
        }
      }
    }

    return totalWin;
  }, []);

  // Som de giro
  const playSound = useCallback((type: 'spin' | 'win' | 'jackpot') => {
    if (!soundEnabled) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'spin') {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'win') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.15;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'jackpot') {
      oscillator.frequency.value = 1200;
      gainNode.gain.value = 0.2;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [soundEnabled]);

  // Executar giro (padronizado como nos outros componentes)
  const executeSpin = useCallback(() => {
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
    setShowWinAnimation(false);
    setLastWin(0);

    // Deduzir aposta
    setCoins(state.coins - BET_AMOUNT);

    // Som de giro
    playSound('spin');

    // Duração do giro
    const spinDuration = turboMode ? 1000 : 2000;
    const intervalDuration = turboMode ? 50 : 100;

    // Animar rolos girando
    const spinInterval = setInterval(() => {
      const tempReels: string[][] = [];
      for (let i = 0; i < REELS; i++) {
        tempReels.push(generateReel());
      }
      setReels(tempReels);
    }, intervalDuration);

    // Parar após duração
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Gerar resultado final
      const finalReels: string[][] = [];
      for (let i = 0; i < REELS; i++) {
        finalReels.push(generateReel());
      }
      setReels(finalReels);
      
      // Verificar vitórias
      const totalWin = checkWins(finalReels);
      
      if (totalWin > 0) {
        setLastWin(totalWin);
        setShowWinAnimation(true);
        setCoins(state.coins - BET_AMOUNT + totalWin);
        
        // Sons de vitória
        if (totalWin >= 10000) {
          playSound('jackpot');
        } else {
          playSound('win');
        }

        // Confetti para grandes vitórias
        if (totalWin >= 200) {
          try {
            confetti({
              particleCount: totalWin >= 1000 ? 200 : 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            console.log('Confetti error:', e);
          }
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

        // Resetar animação após tempo
        setTimeout(() => setShowWinAnimation(false), turboMode ? 1500 : 3000);
      } else {
        toast({
          title: "😔 Não foi dessa vez",
          description: "Tente novamente!",
        });
      }

      // Adicionar ao histórico
      setHistory(prev => [{
        timestamp: Date.now(),
        bet: BET_AMOUNT,
        win: totalWin,
        symbols: finalReels
      }, ...prev].slice(0, 10));

      setIsSpinning(false);

      // Auto-spin
      if (autoSpinCount > 0) {
        setAutoSpinCount(prev => prev - 1);
        setTimeout(() => executeSpin(), turboMode ? 500 : 1000);
      }
    }, spinDuration);
  }, [state.coins, isSpinning, turboMode, autoSpinCount, checkWins, generateReel, setCoins, playSound]);

  // Auto-spin automático
  useEffect(() => {
    if (autoSpinCount > 0 && !isSpinning && state.coins >= BET_AMOUNT) {
      const timeout = setTimeout(() => {
        executeSpin();
      }, turboMode ? 500 : 1000);
      return () => clearTimeout(timeout);
    }
  }, [autoSpinCount, isSpinning, state.coins, turboMode, executeSpin]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden">
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-fortune-gold/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
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

      {/* Header fixo */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-fortune-gold/20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent">
            🐅 Fortune Tiger
          </h1>
          <Badge variant="destructive" className="text-xs">+18</Badge>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-lg border border-fortune-gold/30">
            <span className="text-fortune-gold text-sm md:text-base">💰</span>
            <span className="text-white font-bold text-sm md:text-lg">{state.coins.toLocaleString()}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-fortune-gold hover:bg-fortune-gold/10"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="text-fortune-gold hover:bg-fortune-gold/10"
          >
            <History size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPaytable(true)}
            className="text-fortune-gold hover:bg-fortune-gold/10"
          >
            <Info size={20} />
          </Button>
        </div>
      </div>

      {/* Área principal do slot */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] p-4 pt-8">
        <motion.div
          className="relative p-4 md:p-8 rounded-3xl bg-gradient-to-br from-purple-900/80 to-black/80 backdrop-blur-md border-4 border-fortune-gold/50 shadow-[0_0_50px_rgba(251,191,36,0.3)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* LEDs pulsantes */}
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-3xl overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-fortune-gold rounded-full"
                style={{
                  left: i < 20 ? `${(i / 20) * 100}%` : 'auto',
                  right: i >= 20 ? `${((i - 20) / 20) * 100}%` : 'auto',
                  top: i % 2 === 0 ? '-4px' : 'auto',
                  bottom: i % 2 === 1 ? '-4px' : 'auto'
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
              />
            ))}
          </div>

          {/* Grid de rolos 5x3 */}
          <div className="flex gap-2 md:gap-3">
            {reels.map((reel, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-2">
                {reel.map((symbolId, rowIdx) => {
                  const symbol = ZODIAC_SYMBOLS.find(s => s.id === symbolId);
                  return (
                    <motion.div
                      key={`${colIdx}-${rowIdx}`}
                      className={`
                        relative w-16 h-16 md:w-20 md:h-20 
                        rounded-xl border-2 
                        ${showWinAnimation && rowIdx === 1 ? 'border-fortune-gold' : 'border-fortune-gold/30'}
                        bg-gradient-to-br from-black/80 to-purple-900/50
                        flex items-center justify-center text-3xl md:text-4xl
                        ${symbol?.rarity === 'epic' ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}
                      `}
                      animate={isSpinning ? {
                        y: [-200, 0],
                        filter: ['blur(8px)', 'blur(0px)']
                      } : showWinAnimation && rowIdx === 1 ? {
                        scale: [1, 1.15, 1],
                        rotate: [0, 3, -3, 0]
                      } : {}}
                      transition={{
                        duration: isSpinning ? 0.3 : 0.5,
                        delay: colIdx * 0.05,
                        repeat: showWinAnimation && rowIdx === 1 ? 2 : 0
                      }}
                    >
                      <span className={isSpinning ? 'blur-sm' : ''}>{symbol?.emoji}</span>
                      {symbol?.rarity === 'epic' && !isSpinning && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-fortune-gold/20 to-transparent"
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Último ganho flutuante */}
          {lastWin > 0 && showWinAnimation && (
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

      {/* Controles inferiores fixos */}
      <div className="relative z-10 fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-fortune-gold/20 p-4 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Info de jogo */}
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">APOSTA</div>
              <div className="text-lg font-bold text-white">{BET_AMOUNT}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">ÚLTIMO</div>
              <div className="text-lg font-bold text-fortune-gold">{lastWin}</div>
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTurboMode(!turboMode)}
              className={`${turboMode ? 'bg-fortune-gold text-black border-fortune-gold' : 'text-fortune-gold border-fortune-gold/50'} hover:bg-fortune-gold/10`}
            >
              <Zap size={16} className="mr-1" />
              Turbo
            </Button>

            <Button
              onClick={executeSpin}
              disabled={isSpinning || state.coins < BET_AMOUNT || autoSpinCount > 0}
              size="lg"
              className="relative px-6 md:px-8 py-5 md:py-6 text-lg md:text-xl font-bold bg-gradient-to-r from-fortune-gold to-fortune-ember hover:from-fortune-ember hover:to-fortune-gold shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-50 text-black"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <PlayCircle size={24} />
                {isSpinning ? 'GIRANDO...' : autoSpinCount > 0 ? `AUTO ${autoSpinCount}` : 'GIRAR'}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSpinCount(autoSpinCount > 0 ? 0 : 10)}
              disabled={isSpinning}
              className="text-fortune-gold border-fortune-gold/50 hover:bg-fortune-gold/10"
            >
              {autoSpinCount > 0 ? <Pause size={16} /> : 'Auto'}
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
              <h2 className="text-2xl font-bold text-fortune-gold mb-4">💰 Tabela de Pagamentos</h2>
              <div className="space-y-3">
                {ZODIAC_SYMBOLS.map(symbol => (
                  <div key={symbol.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg hover:bg-black/60 transition-colors">
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
                <div className="bg-gradient-to-r from-fortune-gold to-fortune-ember p-4 rounded-lg text-center mt-4">
                  <div className="text-2xl font-bold text-black">🎰 JACKPOT 🎰</div>
                  <div className="text-black font-bold mt-1">5x ♌ Leão = 10.000 fichas extras!</div>
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
              <h2 className="text-2xl font-bold text-fortune-gold mb-4">📊 Histórico de Giros</h2>
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum giro ainda. Comece a jogar!</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div key={idx} className="bg-black/40 p-3 rounded-lg hover:bg-black/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                          </div>
                          <div className="text-white mt-1">
                            Aposta: <span className="font-bold">{item.bet}</span> fichas
                          </div>
                        </div>
                        <div className={`text-right ${item.win > 0 ? 'text-fortune-gold' : 'text-gray-500'}`}>
                          <div className="text-lg font-bold">
                            {item.win > 0 ? `+${item.win}` : '0'}
                          </div>
                          <div className="text-xs">
                            {item.win > 0 ? `${(item.win / item.bet).toFixed(1)}x` : 'Sem ganho'}
                          </div>
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
