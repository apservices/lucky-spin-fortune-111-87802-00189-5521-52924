/**
 * Game Transition Manager - Smooth transitions between game states
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Home, ArrowLeft, Settings, Pause } from 'lucide-react';
import { performanceOptimizer } from '@/utils/performance/PerformanceOptimizer';

interface TransitionState {
  isTransitioning: boolean;
  from: string;
  to: string;
  progress: number;
}

interface GameTransitionManagerProps {
  children: React.ReactNode;
}

export const GameTransitionManager: React.FC<GameTransitionManagerProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    from: '',
    to: location.pathname,
    progress: 0
  });

  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Handle route changes with smooth transitions
    const handleRouteChange = async (newPath: string) => {
      if (newPath === '/game' || newPath === '/gameplay') {
        setTransitionState({
          isTransitioning: true,
          from: location.pathname,
          to: newPath,
          progress: 0
        });

        setShowSplash(true);
        
        // Preload game assets during transition
        await performanceOptimizer.preloadCriticalAssets();
        
        // Simulate loading progress
        for (let i = 0; i <= 100; i += 10) {
          setTransitionState(prev => ({ ...prev, progress: i }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        setShowSplash(false);
        setTransitionState(prev => ({ ...prev, isTransitioning: false }));
      }
    };

    if (location.pathname !== transitionState.to) {
      handleRouteChange(location.pathname);
    }
  }, [location.pathname, transitionState.to]);

  const pageVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      y: 20 
    },
    in: { 
      opacity: 1, 
      scale: 1,
      y: 0 
    },
    out: { 
      opacity: 0, 
      scale: 1.05,
      y: -20 
    }
  };

  const gameVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9 
    },
    in: { 
      opacity: 1, 
      scale: 1 
    },
    out: { 
      opacity: 0, 
      scale: 1.1 
    }
  };

  const getTransitionConfig = (pathname: string) => {
    if (pathname === '/game' || pathname === '/gameplay') {
      return {
        variants: gameVariants,
        transition: { duration: 0.6, ease: "easeInOut" }
      };
    }
    
    return {
      variants: pageVariants,
      transition: { duration: 0.3, ease: "easeOut" }
    };
  };

  const config = getTransitionConfig(location.pathname);

  // Game splash screen for loading
  const GameSplashScreen = () => (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-black via-primary/20 to-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 bg-background/90 backdrop-blur-sm border-primary/30">
        <div className="text-center space-y-6">
          <motion.div
            className="text-6xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            🐯
          </motion.div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-primary">Zodiac Fortune</h2>
            <p className="text-muted-foreground">Preparando o jogo...</p>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${transitionState.progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {transitionState.progress}% carregado
          </p>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!showSplash && (
          <motion.div
            key={location.pathname}
            initial={config.variants.initial}
            animate={config.variants.in}
            exit={config.variants.out}
            transition={config.transition}
            className="w-full min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSplash && <GameSplashScreen />}
      </AnimatePresence>
    </>
  );
};