/**
 * LGPD Consent Banner Component
 * Cookie and analytics consent management
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { useAnalytics } from '@/systems/AnalyticsSystem';
import { Shield, Settings, Eye, Target, TrendingUp } from 'lucide-react';

interface ConsentPreferences {
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
}

export const ConsentBanner: React.FC = () => {
  const { updateConsent } = useAnalytics();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    performance: true, // Essential for game functionality
    marketing: false
  });

  useEffect(() => {
    // Check if consent has been given
    const existingConsent = localStorage.getItem('analytics_consent');
    if (!existingConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = {
      analytics: true,
      performance: true,
      marketing: true
    };
    
    setPreferences(allConsent);
    updateConsent(allConsent);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    updateConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      analytics: false,
      performance: true,
      marketing: false
    };
    
    setPreferences(essentialOnly);
    updateConsent(essentialOnly);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="mx-auto max-w-4xl p-6 bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">🍪 Política de Cookies e Privacidade</h3>
                <p className="text-sm text-muted-foreground">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência de jogo, 
                  analisar performance e personalizar conteúdo. Em conformidade com a <strong>LGPD</strong>, 
                  você pode escolher quais dados compartilhar conosco.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Button
                onClick={handleAcceptAll}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Aceitar Todos
              </Button>
              
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Personalizar
              </Button>
              
              <Button
                onClick={handleRejectOptional}
                variant="ghost"
                className="text-muted-foreground"
              >
                Apenas Essenciais
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-primary hover:underline">Termos de Uso</a> e{' '}
              <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
              Seus dados são processados em conformidade com a LGPD.
            </p>
          </div>
        </Card>
      </div>

      {/* Detailed Preferences Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Configurações de Privacidade
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferências de cookies e dados. Você pode alterar essas configurações 
              a qualquer momento nas configurações do jogo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Analytics Consent */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start space-x-3 flex-1">
                <TrendingUp className="w-5 h-5 text-secondary mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Cookies de Analytics</h4>
                    <Badge variant="secondary">Opcional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Nos ajudam a entender como você joga e otimizar sua experiência. 
                    Coletamos métricas como tempo de sessão, jogos favoritos e progressão.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Dados coletados:</strong> Sessões de jogo, estatísticas de vitórias, 
                    preferências de jogos, tempo de uso
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            {/* Performance Consent */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start space-x-3 flex-1">
                <Eye className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Cookies de Performance</h4>
                    <Badge variant="default">Essencial</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Essenciais para o funcionamento do jogo. Monitoram performance, 
                    detectam erros e garantem que os jogos funcionem corretamente.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Dados coletados:</strong> FPS, tempo de carregamento, 
                    erros técnicos, informações do dispositivo
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.performance}
                disabled={true} // Always required
              />
            </div>

            {/* Marketing Consent */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start space-x-3 flex-1">
                <Target className="w-5 h-5 text-accent mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Cookies de Marketing</h4>
                    <Badge variant="outline">Opcional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permitem personalizar ofertas e promoções baseadas em seus interesses. 
                    Usados para melhorar nossas campanhas e sugerir conteúdo relevante.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Dados coletados:</strong> Preferências de jogos, 
                    histórico de compras, engajamento com promoções
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Seus Direitos LGPD
            </h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Acesso:</strong> Consulte seus dados a qualquer momento</p>
              <p>• <strong>Correção:</strong> Atualize informações incorretas</p>
              <p>• <strong>Exclusão:</strong> Solicite remoção de seus dados</p>
              <p>• <strong>Portabilidade:</strong> Exporte seus dados em formato legível</p>
              <p>• <strong>Revogação:</strong> Retire seu consentimento quando desejar</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRejectOptional}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Apenas Essenciais
            </Button>
            <Button
              onClick={handleAcceptSelected}
              className="w-full sm:w-auto"
            >
              Salvar Preferências
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto bg-primary"
            >
              Aceitar Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Privacy Settings Component for game settings panel
 */
export const PrivacySettings: React.FC = () => {
  const { updateConsent } = useAnalytics();
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    performance: true,
    marketing: false
  });

  useEffect(() => {
    // Load current preferences
    const stored = localStorage.getItem('analytics_consent');
    if (stored) {
      try {
        const consent = JSON.parse(stored);
        setPreferences({
          analytics: consent.analytics,
          performance: consent.performance,
          marketing: consent.marketing
        });
      } catch (error) {
        console.warn('Failed to load consent preferences:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (key: keyof ConsentPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updateConsent(newPreferences);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Configurações de Privacidade</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Analytics de Gameplay</h4>
            <p className="text-sm text-muted-foreground">
              Coleta dados sobre como você joga para melhorar a experiência
            </p>
          </div>
          <Switch
            checked={preferences.analytics}
            onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Monitoramento de Performance</h4>
            <p className="text-sm text-muted-foreground">
              Necessário para detectar problemas técnicos e otimizar o jogo
            </p>
          </div>
          <Switch
            checked={preferences.performance}
            disabled={true}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Personalização de Conteúdo</h4>
            <p className="text-sm text-muted-foreground">
              Permite ofertas personalizadas baseadas em suas preferências
            </p>
          </div>
          <Switch
            checked={preferences.marketing}
            onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Seus dados são processados em conformidade com a LGPD. 
          Para mais informações, consulte nossa{' '}
          <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
        </p>
      </div>
    </Card>
  );
};