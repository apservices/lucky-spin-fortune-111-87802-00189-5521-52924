/**
 * Optimized Navigation Component
 * Smooth transitions and performance-optimized navigation
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Play, 
  Settings, 
  Award, 
  Target, 
  Gift,
  ArrowLeft,
  Pause,
  Menu
} from 'lucide-react';
import { throttle } from '@/utils/performance/ThrottleManager';

interface OptimizedNavigationProps {
  variant?: 'lobby' | 'game' | 'menu';
  onPause?: () => void;
  onHome?: () => void;
  onBack?: () => void;
}

export const OptimizedNavigation: React.FC<OptimizedNavigationProps> = ({
  variant = 'lobby',
  onPause,
  onHome,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Throttled navigation to prevent rapid clicking
  const throttledNavigate = throttle((path: string) => {
    navigate(path);
  }, 300, 'navigation');

  const currentPath = location.pathname;

  const navigationItems = [
    { path: '/', icon: Home, label: 'Lobby', key: 'home' },
    { path: '/game', icon: Play, label: 'Jogar', key: 'game' },
    { path: '/achievements', icon: Award, label: 'Conquistas', key: 'achievements' },
    { path: '/missions', icon: Target, label: 'Missões', key: 'missions' },
    { path: '/daily-rewards', icon: Gift, label: 'Bônus', key: 'rewards' },
    { path: '/settings', icon: Settings, label: 'Config', key: 'settings' }
  ];

  if (variant === 'game') {
    return (
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-primary/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPause}
              className="text-white hover:bg-white/20"
            >
              <Pause className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onHome}
              className="text-white hover:bg-white/20"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'menu') {
    return (
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-around p-2">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.key}
                onClick={() => throttledNavigate(item.path)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ transform: 'translateX(-50%)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  // Default lobby navigation
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-primary">Zodiac Fortune</h1>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => throttledNavigate('/settings')}
            className="hover:bg-primary/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => throttledNavigate('/achievements')}
            className="hover:bg-primary/10"
          >
            <Award className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};