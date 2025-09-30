/**
 * Responsible Gaming Warnings Component
 * Displays warnings and alerts for responsible gaming
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Info, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { responsibleGaming, GameAlert } from '@/systems/ResponsibleGamingSystem';

export const ResponsibleGamingWarnings: React.FC = () => {
  const [alerts, setAlerts] = useState<GameAlert[]>([]);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const unsubscribe = responsibleGaming.subscribe(setAlerts);
    return unsubscribe;
  }, []);

  const handleDismissAlert = (alertId: string) => {
    responsibleGaming.dismissAlert(alertId);
  };

  const handleTakeMandatoryBreak = () => {
    responsibleGaming.takeMandatoryBreak();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'mandatory':
        return <Shield className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'mandatory':
        return {
          card: 'border-destructive bg-destructive/5',
          icon: 'text-destructive',
          button: 'bg-destructive hover:bg-destructive/90'
        };
      case 'warning':
        return {
          card: 'border-yellow-500 bg-yellow-500/5',
          icon: 'text-yellow-600',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'info':
        return {
          card: 'border-primary bg-primary/5',
          icon: 'text-primary',
          button: 'bg-primary hover:bg-primary/90'
        };
      default:
        return {
          card: 'border-border',
          icon: 'text-muted-foreground',
          button: 'bg-secondary hover:bg-secondary/90'
        };
    }
  };

  return (
    <>
      {/* Alert Overlays */}
      <AnimatePresence>
        {alerts.map((alert) => {
          const colors = getAlertColors(alert.type);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
              <Card className={`p-4 shadow-lg ${colors.card}`}>
                <div className="flex items-start space-x-3">
                  <div className={colors.icon}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {alert.type === 'mandatory' && (
                        <Button
                          onClick={handleTakeMandatoryBreak}
                          size="sm"
                          className={colors.button}
                        >
                          Fazer Pausa (15min)
                        </Button>
                      )}
                      
                      {alert.canDismiss && (
                        <Button
                          onClick={() => handleDismissAlert(alert.id)}
                          variant="outline"
                          size="sm"
                        >
                          Entendi
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {alert.canDismiss && (
                    <Button
                      onClick={() => handleDismissAlert(alert.id)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {alert.duration > 0 && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: alert.duration / 1000, ease: 'linear' }}
                    className={`h-1 ${colors.button} mt-3 rounded-full`}
                    onAnimationComplete={() => {
                      if (alert.canDismiss) {
                        handleDismissAlert(alert.id);
                      }
                    }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Persistent Footer Disclaimer */}
      <AnimatePresence>
        {showFooter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t"
          >
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="font-medium">Jogo recreativo +18</span>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      onClick={() => {
                        // Navigate to responsible gaming page
                        window.location.href = '/responsible-gaming';
                      }}
                    >
                      Jogo Responsável
                    </Button>
                  </div>
                
                <Button
                  onClick={() => setShowFooter(false)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};