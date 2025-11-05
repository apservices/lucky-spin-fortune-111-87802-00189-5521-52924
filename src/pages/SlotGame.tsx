/**
 * Slot Game Page - Página principal do jogo de slots
 */

import React, { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PremiumSlotMachineGame } from '@/components/PremiumSlotMachineGame';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from '@/hooks/use-toast';

const SlotGame: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useGameState();
  const { setCoins } = useGameActions();

  useEffect(() => {
    // Verificar se é primeira vez e dar fichas iniciais
    const hasPlayed = localStorage.getItem('zodiac-slots-played');
    if (!hasPlayed) {
      localStorage.setItem('zodiac-slots-played', 'true');
      if (state.coins < 100) {
        setCoins(1000);
        toast({
          title: "🎉 Bem-vindo ao Fortune Tiger!",
          description: "Você ganhou 1000 fichas grátis para começar!",
        });
      }
    }
  }, [state.coins, setCoins]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <PremiumSlotMachineGame />;
};

export default SlotGame;
