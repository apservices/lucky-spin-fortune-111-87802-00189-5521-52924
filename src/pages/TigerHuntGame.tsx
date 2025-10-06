/**
 * Tiger Hunt Mini-Game - 3D Interactive Game
 * Click to reveal hidden prizes
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scene3DWrapper } from '@/components/3D/Scene3DWrapper';
import { Tiger3DModel } from '@/components/3D/Tiger3DModel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameState } from '@/systems/GameStateSystem';
import { toast } from 'sonner';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const prizes = [
  { value: 10, label: '10 Moedas', rarity: 'common' },
  { value: 25, label: '25 Moedas', rarity: 'common' },
  { value: 50, label: '50 Moedas', rarity: 'uncommon' },
  { value: 100, label: 'x2 Multiplicador', rarity: 'rare' },
  { value: 250, label: '250 Moedas', rarity: 'rare' },
  { value: 500, label: 'x5 Multiplicador', rarity: 'epic' },
  { value: 1000, label: 'JACKPOT!', rarity: 'legendary' },
  { value: 0, label: 'Tente Novamente', rarity: 'common' }
];

const TigerHuntGame: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameState();
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<Array<typeof prizes[0] | null>>(Array(8).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [totalWin, setTotalWin] = useState(0);

  const handleReveal = (index: number) => {
    if (selectedPositions.includes(index) || gameOver || state.energy < 10) return;

    // Cost energy
    dispatch({ type: 'USE_ENERGY', payload: 10 });

    // Reveal random prize
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    const newRevealed = [...revealedPrizes];
    newRevealed[index] = prize;
    setRevealedPrizes(newRevealed);
    setSelectedPositions([...selectedPositions, index]);

    // Add winnings
    if (prize.value > 0) {
      dispatch({ type: 'ADD_COINS', payload: prize.value });
      setTotalWin(totalWin + prize.value);
      toast.success(`🐅 ${prize.label}!`, {
        description: `+${prize.value} moedas`
      });
    } else {
      toast.error('Sem sorte desta vez!');
    }

    // End game after 3 reveals
    if (selectedPositions.length >= 2) {
      setGameOver(true);
      toast.info('Jogo finalizado!', {
        description: `Total ganho: ${totalWin + prize.value} moedas`
      });
    }
  };

  const resetGame = () => {
    setSelectedPositions([]);
    setRevealedPrizes(Array(8).fill(null));
    setGameOver(false);
    setTotalWin(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pgbet-dark via-black to-pgbet-dark">
      {/* Header */}
      <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/game')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-fortune-gold">🐅 Caça ao Tigre 3D</h1>
          <div className="flex gap-2">
            <span className="text-yellow-400">💰 {state.coins}</span>
            <span className="text-blue-400">⚡ {state.energy}</span>
          </div>
        </div>
      </header>

      {/* 3D Scene */}
      <div className="h-[40vh] relative">
        <Scene3DWrapper cameraPosition={[0, 2, 8]}>
          <Tiger3DModel
            state={gameOver ? (totalWin > 100 ? 'win' : 'idle') : 'idle'}
            scale={1.5}
            position={[0, 0, 0]}
          />
        </Scene3DWrapper>
      </div>

      {/* Game Grid */}
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-black/40 backdrop-blur-sm border-primary/30 text-center">
          <p className="text-gray-300">
            Clique em 3 posições para revelar prêmios escondidos!
          </p>
          <p className="text-sm text-gray-500 mt-2">Custo: 10⚡ por revelação</p>
        </Card>

        {/* Prize Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`aspect-square p-2 cursor-pointer transition-all ${
                  selectedPositions.includes(i)
                    ? 'bg-gradient-to-br from-fortune-gold to-fortune-ember border-fortune-gold'
                    : 'bg-black/60 backdrop-blur-sm border-primary/30 hover:border-primary/60'
                } ${gameOver && !selectedPositions.includes(i) ? 'opacity-50' : ''}`}
                onClick={() => handleReveal(i)}
              >
                {revealedPrizes[i] ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Trophy className={`w-8 h-8 mb-1 ${
                      revealedPrizes[i]!.rarity === 'legendary' ? 'text-fortune-gold animate-pulse' :
                      revealedPrizes[i]!.rarity === 'epic' ? 'text-purple-400' :
                      revealedPrizes[i]!.rarity === 'rare' ? 'text-blue-400' :
                      'text-gray-400'
                    }`} />
                    <p className="text-xs text-center font-bold">{revealedPrizes[i]!.label}</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-4xl opacity-30">🐅</span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {gameOver && (
            <Button
              className="flex-1 bg-gradient-to-r from-fortune-gold to-fortune-ember"
              onClick={resetGame}
            >
              Jogar Novamente (30⚡)
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/game')}
          >
            Voltar ao Lobby
          </Button>
        </div>

        {/* Total Winnings */}
        {totalWin > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Card className="p-4 bg-gradient-to-r from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold">
              <p className="text-2xl font-bold text-fortune-gold">
                Total Ganho: {totalWin} 💰
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TigerHuntGame;
