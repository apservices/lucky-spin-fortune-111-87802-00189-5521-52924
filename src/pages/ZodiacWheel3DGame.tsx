/**
 * Zodiac Wheel 3D Game - Main Wheel Spinning Experience
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scene3DWrapper } from '@/components/3D/Scene3DWrapper';
import { ZodiacWheel3D } from '@/components/3D/ZodiacWheel3D';
import { PostProcessing } from '@/components/3D/PostProcessing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameState } from '@/systems/GameStateSystem';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const zodiacNames = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião'];
const multipliers = [1, 2, 5, 10, 20, 50, 75, 100];

const ZodiacWheel3DGame: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameState();
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetSector, setTargetSector] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const handleSpin = () => {
    if (state.energy < 20) {
      toast.error('Energia insuficiente!', {
        description: 'Você precisa de 20⚡ para girar a roda'
      });
      return;
    }

    if (isSpinning) return;

    // Deduct energy
    dispatch({ type: 'USE_ENERGY', payload: 20 });

    // Random sector (weighted towards lower multipliers)
    const rand = Math.random();
    let sector = 0;
    if (rand < 0.3) sector = 0; // x1 (30%)
    else if (rand < 0.5) sector = 1; // x2 (20%)
    else if (rand < 0.65) sector = 2; // x5 (15%)
    else if (rand < 0.78) sector = 3; // x10 (13%)
    else if (rand < 0.88) sector = 4; // x20 (10%)
    else if (rand < 0.95) sector = 5; // x50 (7%)
    else if (rand < 0.99) sector = 6; // x75 (4%)
    else sector = 7; // x100 (1%)

    setTargetSector(sector);
    setIsSpinning(true);
  };

  const handleSpinComplete = (sector: number) => {
    setIsSpinning(false);
    const multiplier = multipliers[sector];
    const baseWin = 10;
    const totalWin = baseWin * multiplier;
    
    setLastWin(totalWin);
    dispatch({ type: 'ADD_COINS', payload: totalWin });

    toast.success(`${zodiacNames[sector]} - x${multiplier}!`, {
      description: `Você ganhou ${totalWin} moedas! 🎉`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pgbet-dark via-black to-pgbet-dark">
      {/* Header */}
      <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/game')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-fortune-gold">🎡 Roda Zodiacal 3D</h1>
          <div className="flex gap-2">
            <span className="text-yellow-400">💰 {state.coins}</span>
            <span className="text-blue-400">⚡ {state.energy}</span>
          </div>
        </div>
      </header>

      {/* 3D Scene */}
      <div className="h-[55vh] relative">
        <Scene3DWrapper cameraPosition={[0, 0, 6]}>
          <ZodiacWheel3D
            isSpinning={isSpinning}
            targetSector={targetSector}
            onSpinComplete={handleSpinComplete}
          />
          <PostProcessing intensity="high" />
        </Scene3DWrapper>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-black/40 backdrop-blur-sm border-primary/30 text-center">
          <p className="text-gray-300 mb-2">
            Gire a roda zodiacal e ganhe até x100!
          </p>
          <p className="text-sm text-gray-500">Custo: 20⚡ por giro</p>
        </Card>

        {/* Last Win Display */}
        {lastWin !== null && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-center"
          >
            <Card className="p-6 bg-gradient-to-r from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-fortune-gold animate-pulse" />
              <p className="text-3xl font-bold text-fortune-gold">
                +{lastWin} 💰
              </p>
              <p className="text-sm text-gray-300 mt-1">Última vitória</p>
            </Card>
          </motion.div>
        )}

        {/* Spin Button */}
        <Button
          className="w-full h-14 text-lg bg-gradient-to-r from-fortune-gold to-fortune-ember hover:scale-105 transition-transform"
          onClick={handleSpin}
          disabled={isSpinning || state.energy < 20}
        >
          {isSpinning ? 'Girando...' : 'Girar Roda (20⚡)'}
        </Button>

        {/* Paytable */}
        <Card className="p-4 bg-black/40 backdrop-blur-sm border-primary/30">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Tabela de Prêmios</h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {zodiacNames.map((name, i) => (
              <div key={i} className="text-center p-2 bg-black/30 rounded">
                <div className="text-lg mb-1">{['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏'][i]}</div>
                <div className="text-fortune-gold font-bold">x{multipliers[i]}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/game')}
        >
          Voltar ao Lobby
        </Button>
      </div>
    </div>
  );
};

export default ZodiacWheel3DGame;
