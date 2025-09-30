/**
 * Game Navigation Bar - In-game navigation controls
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameNavigationBarProps {
  onBack: () => void;
  onHome: () => void;
  onPause: () => void;
  onSettings?: () => void;
  className?: string;
}

export const GameNavigationBar: React.FC<GameNavigationBarProps> = ({
  onBack,
  onHome,
  onPause,
  onSettings,
  className
}) => {
  const navButtons = [
    {
      icon: ArrowLeft,
      action: onBack,
      label: 'Voltar',
      position: 'left'
    },
    {
      icon: Home,
      action: onHome,
      label: 'Lobby',
      position: 'right'
    },
    {
      icon: Pause,
      action: onPause,
      label: 'Pausar',
      position: 'right'
    }
  ];

  if (onSettings) {
    navButtons.push({
      icon: Settings,
      action: onSettings,
      label: 'Config',
      position: 'right'
    });
  }

  return (
    <motion.nav
      className={cn(
        "absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm",
        className
      )}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      
      {/* Left Side - Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-sm text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Center - Game Title (Optional) */}
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <p className="text-white/80 text-sm font-medium">🐅 Fortune Tiger</p>
      </motion.div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHome}
          className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-sm text-white"
        >
          <Home className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPause}
          className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-sm text-white"
        >
          <Pause className="w-4 h-4" />
        </Button>

        {onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-sm text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Gesture Indicators */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <p>ESC para pausar • ⌘+← para voltar</p>
      </motion.div>

    </motion.nav>
  );
};