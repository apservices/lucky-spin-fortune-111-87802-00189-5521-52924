/**
 * Game Pause Menu - In-game pause overlay with options
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '@/systems/GameStateSystem';
import { 
  Play, 
  Home, 
  Settings, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  LogOut
} from 'lucide-react';

interface GamePauseMenuProps {
  onResume: () => void;
  onExit: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
}

export const GamePauseMenu: React.FC<GamePauseMenuProps> = ({
  onResume,
  onExit,
  onSettings,
  onHelp
}) => {
  const { state } = useGameState();

  const menuItems = [
    {
      icon: Play,
      label: 'Continuar Jogando',
      action: onResume,
      primary: true
    },
    {
      icon: Settings,
      label: 'Configurações',
      action: onSettings,
      disabled: !onSettings
    },
    {
      icon: HelpCircle,
      label: 'Ajuda & Regras',
      action: onHelp,
      disabled: !onHelp
    },
    {
      icon: LogOut,
      label: 'Sair do Jogo',
      action: onExit,
      destructive: true
    }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-black/90 to-purple-900/90 backdrop-blur-md border-primary/30">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Jogo Pausado</h2>
            <p className="text-gray-400 text-sm">Seu progresso está seguro</p>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-black/30 rounded-lg border border-white/10">
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center bg-black/50 border-yellow-500/50">
                <span className="text-yellow-400">💰</span>
                <span className="ml-1 text-white text-xs">{state.coins.toLocaleString()}</span>
              </Badge>
              <p className="text-xs text-gray-400 mt-1">Coins</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center bg-black/50 border-blue-500/50">
                <span className="text-blue-400">⚡</span>
                <span className="ml-1 text-white text-xs">{state.energy}</span>
              </Badge>
              <p className="text-xs text-gray-400 mt-1">Energia</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center bg-black/50 border-purple-500/50">
                <span className="text-purple-400">🎯</span>
                <span className="ml-1 text-white text-xs">{state.level}</span>
              </Badge>
              <p className="text-xs text-gray-400 mt-1">Nível</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
              >
                <Button
                  onClick={item.action}
                  disabled={item.disabled}
                  className={`w-full justify-start h-12 text-left ${
                    item.primary 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                      : item.destructive
                        ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 text-red-400 border border-red-500/30'
                        : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  variant="ghost"
                >
                  <item.icon className={`w-5 h-5 mr-3 ${
                    item.primary ? 'text-white' : 
                    item.destructive ? 'text-red-400' : 'text-gray-300'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Pressione ESC para retomar
            </p>
          </div>

        </Card>
      </motion.div>
    </motion.div>
  );
};