/**
 * Settings Page - Game Settings and Configuration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameSettingsPanel } from '@/components/GameSettingsPanel';
import { ThemeSystem, GameTheme } from '@/components/ThemeSystem';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '@/systems/GameStateSystem';
import { ParticleBackground } from '@/components/ParticleBackground';
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const [showThemeSystem, setShowThemeSystem] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>('classic');
  
  // 3D Settings
  const [enable3D, setEnable3D] = useState(
    localStorage.getItem('enable3D') !== 'false'
  );
  const [particleQuality, setParticleQuality] = useState<'low' | 'medium' | 'high'>(
    (localStorage.getItem('particleQuality') as 'low' | 'medium' | 'high') || 'medium'
  );
  const [enablePostProcessing, setEnablePostProcessing] = useState(
    localStorage.getItem('enablePostProcessing') !== 'false'
  );

  const handleThemeChange = (theme: GameTheme) => {
    setCurrentTheme(theme);
    console.log('Theme changed to:', theme);
  };

  const handle3DToggle = (enabled: boolean) => {
    setEnable3D(enabled);
    localStorage.setItem('enable3D', String(enabled));
    toast.success(enabled ? 'Gráficos 3D ativados!' : 'Gráficos 3D desativados');
  };

  const handleParticleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    setParticleQuality(quality);
    localStorage.setItem('particleQuality', quality);
    toast.success(`Qualidade de partículas: ${quality === 'low' ? 'Baixa' : quality === 'medium' ? 'Média' : 'Alta'}`);
  };

  const handlePostProcessingToggle = (enabled: boolean) => {
    setEnablePostProcessing(enabled);
    localStorage.setItem('enablePostProcessing', String(enabled));
    toast.success(enabled ? 'Post-processing ativado' : 'Post-processing desativado');
  };

  const resetSettings = () => {
    localStorage.removeItem('enable3D');
    localStorage.removeItem('particleQuality');
    localStorage.removeItem('enablePostProcessing');
    setEnable3D(true);
    setParticleQuality('medium');
    setEnablePostProcessing(true);
    toast.success('Configurações 3D resetadas!');
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

          {/* 3D Graphics Settings */}
          <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-fortune-gold" />
                  Gráficos 3D
                </h3>
                <p className="text-sm text-gray-400">Configure os efeitos visuais 3D premium</p>
              </div>

              {/* Enable 3D Graphics */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-3d" className="text-base">Ativar Gráficos 3D</Label>
                  <p className="text-sm text-muted-foreground">
                    Tigre 3D, roda zodiacal volumétrica e efeitos avançados
                  </p>
                </div>
                <Switch
                  id="enable-3d"
                  checked={enable3D}
                  onCheckedChange={handle3DToggle}
                />
              </div>

              {/* Particle Quality */}
              <div className="space-y-2">
                <Label className="text-base">Qualidade de Partículas</Label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((quality) => (
                    <Button
                      key={quality}
                      variant={particleQuality === quality ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleParticleQualityChange(quality as 'low' | 'medium' | 'high')}
                      className="flex-1"
                    >
                      {quality === 'low' ? '⚡ Baixa' : quality === 'medium' ? '⭐ Média' : '💎 Alta'}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {particleQuality === 'low' && 'Melhor performance, menos partículas'}
                  {particleQuality === 'medium' && 'Balanço entre qualidade e performance'}
                  {particleQuality === 'high' && 'Máxima qualidade visual'}
                </p>
              </div>

              {/* Post-Processing */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="post-processing" className="text-base">Post-Processing</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloom, glow e efeitos avançados (requer dispositivo potente)
                  </p>
                </div>
                <Switch
                  id="post-processing"
                  checked={enablePostProcessing}
                  onCheckedChange={handlePostProcessingToggle}
                />
              </div>

              {/* FPS Info */}
              <div className="p-3 bg-black/20 rounded-lg border border-fortune-gold/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Performance Atual</span>
                  <Badge variant="outline" className="bg-pgbet-emerald/20 text-pgbet-emerald border-pgbet-emerald">
                    60 FPS
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Desempenho excelente! Todos os efeitos 3D disponíveis.
                </p>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full border-primary/30"
              >
                Resetar para Padrão
              </Button>
            </div>
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