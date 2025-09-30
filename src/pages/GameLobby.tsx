/**
 * Game Lobby - Main Menu and Navigation Hub
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';
import { 
  PlayCircle, 
  Settings, 
  Trophy, 
  Calendar, 
  Users, 
  Gift,
  Star,
  Crown,
  Gamepad2,
  TrendingUp,
  Coins
} from 'lucide-react';

const GameLobby: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    
    // Simulate loading delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Navigate to game with transition
    navigate('/game');
  };

  const menuItems = [
    {
      title: 'Jogar Agora',
      subtitle: 'Fortune Tiger Slots',
      icon: PlayCircle,
      action: handleStartGame,
      primary: true,
      disabled: isLoading
    },
    {
      title: 'Loja de Moedas',
      subtitle: 'Adquirir moedas virtuais',
      icon: Coins,
      action: () => navigate('/coin-store'),
      badge: 'Virtual'
    },
    {
      title: 'Resgatar Prêmios',
      subtitle: 'Trocar por recompensas',
      icon: Gift,
      action: () => navigate('/rewards'),
      badge: 'Novo!'
    },
    {
      title: 'Conquistas',
      subtitle: 'Ver progresso',
      icon: Trophy,
      action: () => navigate('/achievements'),
      badge: '3 novas'
    },
    {
      title: 'Recompensas Diárias',
      subtitle: 'Colete bônus',
      icon: Calendar,
      action: () => navigate('/daily-rewards'),
      badge: state.energy < 10 ? 'Disponível' : null
    },
    {
      title: 'Indicações',
      subtitle: 'Convide amigos',
      icon: Users,
      action: () => navigate('/referrals'),
      badge: '500 coins'
    },
    {
      title: 'Loja VIP',
      subtitle: 'Itens especiais',
      icon: Crown,
      action: () => navigate('/vip')
    },
    {
      title: 'Configurações',
      subtitle: 'Som, gráficos',
      icon: Settings,
      action: () => navigate('/settings')
    }
  ];

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex flex-col relative z-10">
        
        {/* Header with Player Stats */}
        <motion.header 
          className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                🐅 Zodiac Fortune
              </h1>
              <p className="text-sm text-gray-400">Lobby Principal</p>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-black/50 border-yellow-500/50">
                <span className="text-yellow-400">💰</span>
                <span className="ml-1 text-white font-bold">{state.coins.toLocaleString()}</span>
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-blue-500/50">
                <span className="text-blue-400">⚡</span>
                <span className="ml-1 text-white font-bold">{state.energy}</span>
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-purple-500/50">
                <span className="text-purple-400">🎯</span>
                <span className="ml-1 text-white font-bold">Nv.{state.level}</span>
              </Badge>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 p-4 flex flex-col justify-center">
          <motion.div 
            className="max-w-md mx-auto w-full space-y-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            
            {/* Quick Stats */}
            <Card className="p-4 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-400">{state.totalSpins || 0}</div>
                  <div className="text-xs text-gray-400">Giros Hoje</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">{(state.totalCoinsEarned || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Ganho</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{state.dailyStreak || 0}</div>
                  <div className="text-xs text-gray-400">Sequência</div>
                </div>
              </div>
            </Card>

            {/* Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card 
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-98 ${
                      item.primary 
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500/50' 
                        : 'bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !item.disabled && item.action()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          item.primary ? 'bg-black/20' : 'bg-primary/20'
                        }`}>
                          <item.icon className={`w-5 h-5 ${
                            item.primary ? 'text-black' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <div className={`font-medium ${
                            item.primary ? 'text-black' : 'text-white'
                          }`}>
                            {item.title}
                            {isLoading && item.primary && (
                              <span className="ml-2 text-sm opacity-70">Carregando...</span>
                            )}
                          </div>
                          <div className={`text-sm opacity-70 ${
                            item.primary ? 'text-black/70' : 'text-gray-400'
                          }`}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Footer Info */}
            <motion.div 
              className="text-center text-xs text-gray-500 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <p>Jogo recreativo • Para entretenimento • +18 anos</p>
              <p className="mt-1">Versão 1.0.0 • Última sessão: {new Date().toLocaleDateString()}</p>
            </motion.div>

          </motion.div>
        </main>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 bg-gradient-to-br from-black/60 to-purple-900/60 backdrop-blur-md border-primary/30 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Gamepad2 className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">Iniciando Jogo...</h3>
              <p className="text-gray-400">Preparando sua experiência de sorte</p>
            </Card>
          </motion.div>
        )}

      </div>
    </ParticleBackground>
  );
};

export default GameLobby;