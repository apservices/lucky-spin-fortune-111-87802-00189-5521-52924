/**
 * Game Play Page - Dedicated Fullscreen Game Experience
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyGameComponent } from '@/components/OptimizedGameLazyLoader';
import { SpriteSystem } from '@/components/SpriteSystem';
import { GamePauseMenu } from '@/components/GamePauseMenu';
import { GameSplashScreen } from '@/components/GameSplashScreen';
import { GameNavigationBar } from '@/components/GameNavigationBar';
import { useGameState } from '@/systems/GameStateSystem';
import { useGamePersistence } from '@/hooks/useGamePersistence';
import { gameEvents, GameEventType } from '@/systems/EventSystem';

const GamePlay: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { saveGameState } = useGamePersistence(); // Add persistence
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Initialize game loading
  useEffect(() => {
    const initializeGame = () => {
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        // Emit game start event
        gameEvents.emit(GameEventType.SPIN_START, {
          gameId: 'fortune-tiger-fullscreen',
          betAmount: 0,
          timestamp: Date.now()
        });
        
        setIsLoading(false);
      });
    };

    initializeGame();

    // Prevent accidental scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      // Restore scroll on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Handle pause menu
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  // Handle exit with confirmation
  const handleExitRequest = () => {
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = () => {
    // Save game state using the hook
    saveGameState();
    
    // Navigate back with transition
    navigate('/', { replace: true });
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isPaused) {
            handleResume();
          } else {
            handlePause();
          }
          break;
        case 'Backspace':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleExitRequest();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveGameState(true); // Mark as auto-save
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [saveGameState]);

  if (isLoading) {
    return <GameSplashScreen />;
  }

  return (
    <SpriteSystem>
      <div className="relative w-screen h-screen overflow-hidden bg-black">
        
        {/* Navigation Bar */}
        <GameNavigationBar
          onBack={handleExitRequest}
          onPause={handlePause}
          onHome={() => navigate('/')}
        />
        
        {/* Main Game Area */}
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <LazyGameComponent component="simple" />
        </motion.div>

        {/* Pause Menu Overlay */}
        <AnimatePresence>
          {isPaused && (
            <GamePauseMenu
              onResume={handleResume}
              onExit={handleExitRequest}
              onSettings={() => {/* Navigate to settings */}}
            />
          )}
        </AnimatePresence>

        {/* Exit Confirmation Dialog */}
        <AnimatePresence>
          {showExitConfirmation && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-black/90 to-purple-900/90 backdrop-blur-md rounded-2xl border border-primary/30 p-6 max-w-sm w-full text-center"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Sair do Jogo?</h3>
                <p className="text-gray-300 mb-6">
                  Seu progresso será salvo automaticamente. Tem certeza que deseja voltar ao lobby?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelExit}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-600/50 hover:bg-gray-600/70 text-white font-medium transition-colors duration-200"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={handleConfirmExit}
                    className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all duration-200"
                  >
                    Sair
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </SpriteSystem>
  );
};

export default GamePlay;