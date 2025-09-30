import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  Monitor, 
  Volume2, 
  Gamepad2, 
  Accessibility,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Zap,
  Battery,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { useGameSettings } from '@/hooks/useGameSettings';
import { toast } from 'sonner';

interface GameSettingsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({
  isOpen,
  onOpenChange
}) => {
  const {
    settings,
    isLoading,
    updateVisualSettings,
    updateAudioSettings,
    updateGameplaySettings,
    updateAccessibilitySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    getPerformanceProfile
  } = useGameSettings();

  const [previewMode, setPreviewMode] = useState(false);
  const performanceProfile = getPerformanceProfile();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSettings(file);
    }
  };

  const qualityLabels = {
    low: 'Baixa',
    medium: 'Média', 
    high: 'Alta',
    ultra: 'Ultra'
  };

  const spinSpeedLabels = {
    slow: 'Lenta',
    normal: 'Normal',
    fast: 'Rápida'
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'low': return 'text-pgbet-amber';
      case 'medium': return 'text-pgbet-emerald';
      case 'high': return 'text-pgbet-purple';
      case 'ultra': return 'text-pgbet-gold';
      default: return 'text-muted-foreground';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 75) return 'text-pgbet-emerald';
    if (score >= 50) return 'text-pgbet-amber';
    return 'text-pgbet-red';
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Settings className="w-6 h-6 text-primary" />
            <span>Configurações do Jogo</span>
            <Badge variant="outline" className={getPerformanceColor(performanceProfile.score)}>
              Performance: {performanceProfile.score}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant={previewMode ? "default" : "outline"}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button onClick={exportSettings} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          
          <Button 
            onClick={resetToDefaults} 
            variant="outline" 
            size="sm"
            className="text-pgbet-red hover:bg-pgbet-red/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>

        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visual" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Visual</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Áudio</span>
            </TabsTrigger>
            <TabsTrigger value="gameplay" className="flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Gameplay</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center space-x-2">
              <Accessibility className="w-4 h-4" />
              <span>Acessibilidade</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual Settings */}
          <TabsContent value="visual" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Qualidade Gráfica</label>
                    <Badge className={getQualityColor(settings.visual.graphicsQuality)}>
                      {qualityLabels[settings.visual.graphicsQuality]}
                    </Badge>
                  </div>
                  <Select 
                    value={settings.visual.graphicsQuality}
                    onValueChange={(value: any) => updateVisualSettings({ graphicsQuality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa - Melhor performance</SelectItem>
                      <SelectItem value="medium">Média - Balanceado</SelectItem>
                      <SelectItem value="high">Alta - Melhor qualidade</SelectItem>
                      <SelectItem value="ultra">Ultra - Máxima qualidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Taxa de Quadros (FPS)</label>
                    <Badge variant="outline">{settings.visual.frameRate} FPS</Badge>
                  </div>
                  <Select 
                    value={settings.visual.frameRate.toString()}
                    onValueChange={(value) => updateVisualSettings({ frameRate: parseInt(value) as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 FPS - Economia de energia</SelectItem>
                      <SelectItem value="45">45 FPS - Balanceado</SelectItem>
                      <SelectItem value="60">60 FPS - Fluido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-pgbet-gold" />
                      <label className="text-sm font-medium">Efeitos de Partículas</label>
                    </div>
                    <Switch
                      checked={settings.visual.particleEffects}
                      onCheckedChange={(checked) => updateVisualSettings({ particleEffects: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlayCircle className="w-4 h-4 text-pgbet-purple" />
                      <label className="text-sm font-medium">Animações de Fundo</label>
                    </div>
                    <Switch
                      checked={settings.visual.backgroundAnimations}
                      onCheckedChange={(checked) => updateVisualSettings({ backgroundAnimations: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-pgbet-emerald" />
                      <label className="text-sm font-medium">Modo Economia de Bateria</label>
                    </div>
                    <Switch
                      checked={settings.visual.batterySavingMode}
                      onCheckedChange={(checked) => updateVisualSettings({ batterySavingMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-pgbet-amber" />
                      <label className="text-sm font-medium">Redução de Movimento</label>
                    </div>
                    <Switch
                      checked={settings.visual.reducedMotion}
                      onCheckedChange={(checked) => updateVisualSettings({ reducedMotion: checked })}
                    />
                  </div>
                </div>

                {/* Performance Preview */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Impacto na Performance:</span>
                    <Badge className={getPerformanceColor(performanceProfile.score)}>
                      {performanceProfile.recommendation === 'high' ? 'Ótimo' :
                       performanceProfile.recommendation === 'medium' ? 'Bom' : 'Básico'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Controles de Volume</h3>
                  <Button
                    onClick={() => updateAudioSettings({ isMuted: !settings.audio.isMuted })}
                    variant={settings.audio.isMuted ? "destructive" : "outline"}
                    size="sm"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {settings.audio.isMuted ? 'Ativar Som' : 'Mute'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Volume Master</label>
                      <Badge variant="outline">{settings.audio.masterVolume}%</Badge>
                    </div>
                    <Slider
                      value={[settings.audio.masterVolume]}
                      onValueChange={([value]) => updateAudioSettings({ masterVolume: value })}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={settings.audio.isMuted}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Volume de Efeitos</label>
                      <Badge variant="outline">{settings.audio.effectsVolume}%</Badge>
                    </div>
                    <Slider
                      value={[settings.audio.effectsVolume]}
                      onValueChange={([value]) => updateAudioSettings({ effectsVolume: value })}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={settings.audio.isMuted}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Volume de Música</label>
                      <Badge variant="outline">{settings.audio.musicVolume}%</Badge>
                    </div>
                    <Slider
                      value={[settings.audio.musicVolume]}
                      onValueChange={([value]) => updateAudioSettings({ musicVolume: value })}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={settings.audio.isMuted}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <label className="text-sm font-medium">Áudio Espacial</label>
                  <Switch
                    checked={settings.audio.spatialAudio}
                    onCheckedChange={(checked) => updateAudioSettings({ spatialAudio: checked })}
                    disabled={settings.audio.isMuted}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Gameplay Settings */}
          <TabsContent value="gameplay" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Velocidade de Spin</label>
                    <Badge variant="outline">
                      {spinSpeedLabels[settings.gameplay.spinSpeed]}
                    </Badge>
                  </div>
                  <Select 
                    value={settings.gameplay.spinSpeed}
                    onValueChange={(value: any) => updateGameplaySettings({ spinSpeed: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Lenta - Mais suspense</SelectItem>
                      <SelectItem value="normal">Normal - Balanceado</SelectItem>
                      <SelectItem value="fast">Rápida - Mais ação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Auto-Spin Count</label>
                    <Badge variant="outline">
                      {settings.gameplay.autoSpinCount === -1 ? '∞' : settings.gameplay.autoSpinCount}
                    </Badge>
                  </div>
                  <Select 
                    value={settings.gameplay.autoSpinCount.toString()}
                    onValueChange={(value) => updateGameplaySettings({ autoSpinCount: parseInt(value) as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 spins</SelectItem>
                      <SelectItem value="25">25 spins</SelectItem>
                      <SelectItem value="50">50 spins</SelectItem>
                      <SelectItem value="100">100 spins</SelectItem>
                      <SelectItem value="-1">Infinito (∞)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Modo Turbo</label>
                    <Switch
                      checked={settings.gameplay.turboMode}
                      onCheckedChange={(checked) => updateGameplaySettings({ turboMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Spin Rápido</label>
                    <Switch
                      checked={settings.gameplay.quickSpin}
                      onCheckedChange={(checked) => updateGameplaySettings({ quickSpin: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Confirmação de Apostas Altas</label>
                    <Switch
                      checked={settings.gameplay.highBetConfirmation}
                      onCheckedChange={(checked) => updateGameplaySettings({ highBetConfirmation: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Animações de Vitória</label>
                    <Switch
                      checked={settings.gameplay.showWinAnimations}
                      onCheckedChange={(checked) => updateGameplaySettings({ showWinAnimations: checked })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Modo Alto Contraste</label>
                    <Switch
                      checked={settings.accessibility.highContrastMode}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ highContrastMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Redução de Movimento</label>
                    <Switch
                      checked={settings.accessibility.reducedMotion}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ reducedMotion: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Fonte Aumentada</label>
                    <Switch
                      checked={settings.accessibility.increasedFontSize}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ increasedFontSize: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Feedback Háptico</label>
                    <Switch
                      checked={settings.accessibility.hapticFeedback}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ hapticFeedback: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Cores Amigáveis</label>
                    <Switch
                      checked={settings.accessibility.colorBlindFriendly}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ colorBlindFriendly: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Navegação por Teclado</label>
                    <Switch
                      checked={settings.accessibility.keyboardNavigation}
                      onCheckedChange={(checked) => updateAccessibilitySettings({ keyboardNavigation: checked })}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dica de Acessibilidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Estas configurações melhoram a experiência para jogadores com necessidades especiais.
                    Ative conforme necessário para uma melhor usabilidade.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Summary */}
        {previewMode && (
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-2">Preview das Configurações</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="font-medium">Qualidade:</span>
                <span className={`ml-1 ${getQualityColor(settings.visual.graphicsQuality)}`}>
                  {qualityLabels[settings.visual.graphicsQuality]}
                </span>
              </div>
              <div>
                <span className="font-medium">Volume:</span>
                <span className="ml-1">{settings.audio.masterVolume}%</span>
              </div>
              <div>
                <span className="font-medium">Spin:</span>
                <span className="ml-1">{spinSpeedLabels[settings.gameplay.spinSpeed]}</span>
              </div>
              <div>
                <span className="font-medium">Performance:</span>
                <span className={`ml-1 ${getPerformanceColor(performanceProfile.score)}`}>
                  {performanceProfile.score}%
                </span>
              </div>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};