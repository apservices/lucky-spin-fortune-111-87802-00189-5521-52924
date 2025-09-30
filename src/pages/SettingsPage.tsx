/**
 * Settings Page - Game Settings and Configuration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameSettingsPanel } from '@/components/GameSettingsPanel';
import { ThemeSystem, GameTheme } from '@/components/ThemeSystem';
import { Card } from '@/components/ui/card';
import { useGameState } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const [showThemeSystem, setShowThemeSystem] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>('classic');

  const handleThemeChange = (theme: GameTheme) => {
    setCurrentTheme(theme);
    // TODO: Implement theme persistence in game state
    console.log('Theme changed to:', theme);
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen p-4 relative z-10">
        
        {/* Header */}
        <motion.header 
          className="flex items-center gap-4 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">⚙️ Configurações</h1>
            <p className="text-gray-400">Personalize sua experiência de jogo</p>
          </div>
        </motion.header>

        {/* Settings Content */}
        <motion.div
          className="space-y-6 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          
          {/* Game Settings Panel */}
          <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
            <GameSettingsPanel
              isOpen={true}
              onOpenChange={() => {}} // Always open on settings page
            />
          </Card>

          {/* Theme System */}
          <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                   🎨 Temas
                   <span className="text-sm text-gray-400">(Sistema Completo)</span>
                 </h3>
                <p className="text-gray-400">Personalize a aparência do jogo</p>
              </div>
              <Button
                onClick={() => setShowThemeSystem(!showThemeSystem)}
                variant="outline"
                className="border-primary/30 text-white hover:bg-primary/10"
              >
                {showThemeSystem ? 'Fechar' : 'Abrir Temas'}
              </Button>
            </div>

              {showThemeSystem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ThemeSystem
                    currentTheme={currentTheme}
                    playerLevel={state.level}
                    onThemeChange={handleThemeChange}
                    isOpen={showThemeSystem}
                    onClose={() => setShowThemeSystem(false)}
                  />
                </motion.div>
              )}
            </div>
          </Card>

          {/* Game Statistics */}
          <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Nível</div>
                <div className="text-white font-medium">{state.level}</div>
              </div>
              <div>
                <div className="text-gray-400">Moedas</div>
                <div className="text-white font-medium">{state.coins.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">Giros Totais</div>
                <div className="text-white font-medium">{state.totalSpins || 0}</div>
              </div>
              <div>
                <div className="text-gray-400">Sequência Diária</div>
                <div className="text-white font-medium">{state.dailyStreak || 0}</div>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
            <h3 className="text-lg font-semibold text-white mb-4">ℹ️ Sobre</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Zodiac Fortune Slots</strong> - Versão 1.0.0</p>
              <p>Jogo recreativo para entretenimento</p>
              <p>Sem apostas com dinheiro real</p>
              <p>+18 anos</p>
            </div>
          </Card>

        </motion.div>

      </div>
    </ParticleBackground>
  );
};

export default SettingsPage;