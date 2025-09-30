/**
 * Modular Slot Machine Component
 * Separated from main game hub for better organization
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { useGameLogic } from '@/systems/GameLogic';
import { PlayCircle } from 'lucide-react';

interface SlotMachineProps {
  gameId: string;
  onWin?: (amount: number) => void;
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ gameId, onWin }) => {
  const { state } = useGameState();
  const { completeSpin } = useGameActions();
  const gameLogic = useGameLogic();
  
  const handleSpin = () => {
    if (state.energy < 1) return;
    
    const result = gameLogic.spin(state.level, gameId);
    completeSpin(result.totalWin, result.experienceGained);
    onWin?.(result.totalWin);
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">Fortune Tiger Slot</h3>
        <Button 
          onClick={handleSpin}
          disabled={state.energy < 1}
          className="w-full"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Girar ({state.energy} energia)
        </Button>
      </div>
    </Card>
  );
};