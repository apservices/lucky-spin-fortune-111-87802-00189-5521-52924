import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Crown, Sparkles, Flame, Leaf, Zap } from 'lucide-react';
import { ThemeUnlockAnimation } from './ThemeUnlockAnimation';
import { PhoenixThemeEffects } from './theme-effects/PhoenixThemeEffects';
import { PandaThemeEffects } from './theme-effects/PandaThemeEffects';
import { DragonThemeEffects } from './theme-effects/DragonThemeEffects';

export type GameTheme = 'classic' | 'phoenix' | 'panda' | 'dragon' | 'jade' | 'celestial';

interface ThemeConfig {
  id: GameTheme;
  name: string;
  description: string;
  unlockLevel: number;
  preview: string;
  bgClass: string;
  accentColor: string;
  symbolSet: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const themes: ThemeConfig[] = [
  {
    id: 'classic',
    name: 'Clássico Dourado',
    description: 'O tema tradicional com símbolos da sorte oriental',
    unlockLevel: 1,
    preview: '🐯🦊🐸',
    bgClass: 'bg-gradient-to-br from-pgbet-gold via-pgbet-amber to-pgbet-bronze',
    accentColor: 'hsl(var(--pgbet-gold))',
    symbolSet: ['tiger-idle', 'fox-idle', 'frog-idle', 'envelope-idle', 'orange-idle', 'scroll-idle'],
    rarity: 'common',
  },
  {
    id: 'phoenix',
    name: 'Fênix Imperial',
    description: 'Renascimento em chamas douradas - Vermelho fogo, dourado intenso, laranja',
    unlockLevel: 5,
    preview: '🔥🕊️🌟',
    bgClass: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
    accentColor: '#FF4500',
    symbolSet: ['tiger-win', 'fox-win', 'frog-win', 'envelope-win', 'orange-win', 'scroll-win'],
    rarity: 'rare',
  },
  {
    id: 'panda',
    name: 'Panda Zen',
    description: 'Harmonia serena - Verde bambu, branco pérola, dourado suave',
    unlockLevel: 10,
    preview: '🐼🎋🌸',
    bgClass: 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400',
    accentColor: '#10B981',
    symbolSet: ['tiger-idle', 'fox-idle', 'frog-idle', 'envelope-idle', 'orange-idle', 'scroll-idle'],
    rarity: 'epic',
  },
  {
    id: 'dragon',
    name: 'Dragão Celestial',
    description: 'Poder místico - Azul imperial, prata, roxo místico',
    unlockLevel: 15,
    preview: '🐲⚡🌊',
    bgClass: 'bg-gradient-to-br from-blue-700 via-purple-600 to-indigo-600',
    accentColor: '#3B82F6',
    symbolSet: ['tiger-win', 'fox-win', 'frog-win', 'envelope-win', 'orange-win', 'scroll-win'],
    rarity: 'epic',
  },
  {
    id: 'jade',
    name: 'Jade Místico',
    description: 'Tesouros milenares do Oriente',
    unlockLevel: 20,
    preview: '💚🏯🌺',
    bgClass: 'bg-gradient-to-br from-emerald-700 via-green-600 to-jade-500',
    accentColor: '#059669',
    symbolSet: ['tiger-idle', 'fox-idle', 'frog-idle', 'envelope-idle', 'orange-idle', 'scroll-idle'],
    rarity: 'legendary',
  },
  {
    id: 'celestial',
    name: 'Celestial Supremo',
    description: 'Poderes cósmicos do universo infinito',
    unlockLevel: 30,
    preview: '🌌✨🪐',
    bgClass: 'bg-gradient-to-br from-purple-800 via-violet-700 to-fuchsia-600',
    accentColor: '#8B5CF6',
    symbolSet: ['tiger-win', 'fox-win', 'frog-win', 'envelope-win', 'orange-win', 'scroll-win'],
    rarity: 'legendary',
  },
];

interface ThemeSystemProps {
  currentTheme: GameTheme;
  playerLevel: number;
  onThemeChange: (theme: GameTheme) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSystem: React.FC<ThemeSystemProps> = ({
  currentTheme,
  playerLevel,
  onThemeChange,
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>(currentTheme);
  const [previewMode, setPreviewMode] = useState(false);
  const [unlockingTheme, setUnlockingTheme] = useState<ThemeConfig | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'rare': return <Star className="text-blue-400" size={16} />;
      case 'epic': return <Crown className="text-purple-400" size={16} />;
      case 'legendary': return <Sparkles className="text-yellow-400" size={16} />;
      default: return null;
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const isThemeUnlocked = (theme: ThemeConfig): boolean => {
    return playerLevel >= theme.unlockLevel;
  };

  const handleThemeSelect = (themeId: GameTheme) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    if (isThemeUnlocked(theme)) {
      setSelectedTheme(themeId);
      onThemeChange(themeId);
    } else {
      // Show theme preview/unlock requirements
      setPreviewMode(true);
      setSelectedTheme(themeId);
    }
  };

  const handleThemeUnlock = (theme: ThemeConfig) => {
    setUnlockingTheme(theme);
    setShowUnlockAnimation(true);
  };

  const handleUnlockComplete = () => {
    setShowUnlockAnimation(false);
    setUnlockingTheme(null);
    if (unlockingTheme) {
      onThemeChange(unlockingTheme.id);
      setSelectedTheme(unlockingTheme.id);
    }
  };

  const getThemeIcon = (themeId: GameTheme) => {
    switch (themeId) {
      case 'phoenix': return <Flame className="w-4 h-4" />;
      case 'panda': return <Leaf className="w-4 h-4" />;
      case 'dragon': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getUnlockProgress = (requiredLevel: number): number => {
    return Math.min(100, (playerLevel / requiredLevel) * 100);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Theme Effects Preview */}
      <AnimatePresence>
        {previewMode && selectedTheme && (
          <>
            {selectedTheme === 'phoenix' && (
              <PhoenixThemeEffects intensity={0.5} isActive={true} />
            )}
            {selectedTheme === 'panda' && (
              <PandaThemeEffects intensity={0.5} isActive={true} />
            )}
            {selectedTheme === 'dragon' && (
              <DragonThemeEffects intensity={0.5} isActive={true} />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Unlock Animation */}
      {unlockingTheme && (
        <ThemeUnlockAnimation
          theme={unlockingTheme}
          isVisible={showUnlockAnimation}
          onComplete={handleUnlockComplete}
        />
      )}

      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-primary/30"
          >
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-white flex items-center gap-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Crown className="text-primary" />
                Temas Visuais
              </motion.h2>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                ✕
              </Button>
            </div>

            {/* Current Theme Info */}
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl flex items-center gap-1">
                  {themes.find(t => t.id === currentTheme)?.preview}
                  {getThemeIcon(currentTheme)}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    Tema Atual: {themes.find(t => t.id === currentTheme)?.name}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {themes.find(t => t.id === currentTheme)?.description}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Theme Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {themes.map((theme, index) => {
                const isUnlocked = isThemeUnlocked(theme);
                const isSelected = selectedTheme === theme.id;
                const progress = getUnlockProgress(theme.unlockLevel);

                return (
                  <motion.div
                    key={theme.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                    className={`
                      relative overflow-hidden cursor-pointer transition-all duration-300
                      ${isSelected ? 'ring-2 ring-primary scale-105' : ''}
                      ${isUnlocked ? 'hover:scale-105 hover:shadow-xl' : 'opacity-60'}
                      ${getRarityColor(theme.rarity)}
                    `}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    {/* Background Preview */}
                    <div className={`h-24 ${theme.bgClass} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      
                      {/* Theme Effects Preview */}
                      <div className="absolute inset-0 opacity-30">
                        {theme.id === 'phoenix' && (
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-orange-500/50 to-transparent" />
                        )}
                        {theme.id === 'panda' && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,139,34,0.3)_0%,transparent_50%)]" />
                        )}
                        {theme.id === 'dragon' && (
                          <div className="absolute top-0 right-0 w-16 h-4 bg-gradient-to-l from-blue-400/50 to-transparent skew-x-12" />
                        )}
                      </div>
                      
                      {/* Lock Overlay */}
                      {!isUnlocked && (
                        <motion.div 
                          className="absolute inset-0 bg-black/60 flex items-center justify-center"
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                        >
                          <Lock className="text-white" size={24} />
                        </motion.div>
                      )}
                      
                      {/* Rarity Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {getRarityIcon(theme.rarity)}
                      </div>
                      
                      {/* Selected Indicator */}
                      {isSelected && (
                        <motion.div 
                          className="absolute top-2 left-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Star size={16} fill="currentColor" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Theme Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800">{theme.name}</h3>
                          {getThemeIcon(theme.id)}
                        </div>
                        <Badge variant={theme.rarity === 'legendary' ? 'default' : 'secondary'}>
                          Nv. {theme.unlockLevel}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {theme.description}
                      </p>
                      
                      {/* Theme Preview */}
                      <div className="text-2xl flex items-center gap-1">
                        <span>{theme.preview}</span>
                      </div>
                      
                      {/* Action Button */}
                      {isUnlocked ? (
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleThemeSelect(theme.id);
                          }}
                        >
                          {isSelected ? 'Ativo' : 'Selecionar'}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">
                            Progresso: Nível {playerLevel}/{theme.unlockLevel}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                          {progress >= 100 && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleThemeUnlock(theme);
                              }}
                            >
                              Desbloquear!
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
                );
              })}
            </motion.div>

            {/* Theme Benefits Info */}
            <motion.div 
              className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="text-primary" size={16} />
                Benefícios dos Temas
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <Flame className="inline w-3 h-3 mr-1" /> Efeitos visuais únicos e imersivos</li>
                <li>• <Star className="inline w-3 h-3 mr-1" /> Símbolos com animações exclusivas</li>
                <li>• <Crown className="inline w-3 h-3 mr-1" /> Backgrounds temáticos dinâmicos</li>
                <li>• <Sparkles className="inline w-3 h-3 mr-1" /> Conquistas especiais por tema</li>
              </ul>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </>
  );
};

// Export the themes configuration for use in other components
export { themes };
export type { ThemeConfig };