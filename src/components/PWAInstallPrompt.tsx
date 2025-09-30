import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone ||
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if already installed or dismissed recently
    const dismissed = localStorage.getItem('pwa_prompt_dismissed_until');
    const installed = localStorage.getItem('pwa_installed');
    
    if (installed || standalone) {
      return;
    }

    if (dismissed && Date.now() < parseInt(dismissed)) {
      return;
    }

    // Android PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_installed', '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS prompt (after 30 seconds if not dismissed recently)
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        setShowIosGuide(true);
      }, 30000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa_installed', '1');
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = (duration: number = 7 * 24 * 60 * 60 * 1000) => { // 7 days default
    setShowBanner(false);
    setShowIosGuide(false);
    localStorage.setItem('pwa_prompt_dismissed_until', (Date.now() + duration).toString());
  };

  if (isStandalone || localStorage.getItem('pwa_installed')) {
    return null;
  }

  return (
    <>
      {/* Android Install Banner */}
      <AnimatePresence>
        {showBanner && deferredPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <Card className="p-4 bg-primary/10 border-primary/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Instale o app no seu celular
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Acesso rápido e melhor experiência
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Instalar
                  </Button>
                  <Button
                    onClick={() => dismissPrompt()}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Guide */}
      <Dialog open={showIosGuide} onOpenChange={() => setShowIosGuide(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>Instalar no iPhone</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para uma melhor experiência, adicione este app à sua tela inicial:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Toque no botão <Share className="w-4 h-4 inline mx-1" /> 
                    <strong>Compartilhar</strong> na parte inferior da tela
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Selecione <Plus className="w-4 h-4 inline mx-1" />
                    <strong>"Adicionar à Tela de Início"</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Toque em <strong>"Adicionar"</strong> no canto superior direito
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Button
                onClick={() => dismissPrompt(30 * 24 * 60 * 60 * 1000)} // 30 days
                variant="outline"
                className="flex-1"
              >
                Lembrar depois
              </Button>
              <Button
                onClick={() => dismissPrompt()}
                className="flex-1"
              >
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};