/**
 * Recreational Gaming Reminder
 * Periodic reminder that the game is for entertainment only
 */

import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface RecreationalGamingReminderProps {
  triggerCount?: number; // Number of actions before showing reminder
}

export const RecreationalGamingReminder: React.FC<RecreationalGamingReminderProps> = ({ 
  triggerCount = 50 
}) => {
  const [actionCount, setActionCount] = useState(0);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const handleAction = () => {
      setActionCount(prev => {
        const newCount = prev + 1;
        if (newCount >= triggerCount) {
          setShowReminder(true);
          return 0; // Reset counter
        }
        return newCount;
      });
    };

    // Listen for game actions (spins, bets, etc.)
    window.addEventListener('game-action', handleAction);
    
    return () => {
      window.removeEventListener('game-action', handleAction);
    };
  }, [triggerCount]);

  const handleAcknowledge = () => {
    setShowReminder(false);
    setActionCount(0);
  };

  return (
    <AlertDialog open={showReminder} onOpenChange={setShowReminder}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <AlertDialogTitle>Lembrete Importante</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="font-semibold">Este é um jogo recreativo 🎮</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>As moedas são virtuais e não têm valor real</li>
              <li>Não é possível ganhar dinheiro real</li>
              <li>Destinado apenas para entretenimento</li>
              <li>Recomendamos pausas regulares</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Para sua segurança: Jogue com moderação. Se sentir desconforto, faça uma pausa.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            Entendi, continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Helper function to trigger reminder
export const triggerGameAction = () => {
  window.dispatchEvent(new Event('game-action'));
};
