import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles, Coins, Gift, Zap } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: '🐅 Bem-vindo ao Fortune Tiger!',
    description: 'Gire a roda zodiacal e ganhe moedas virtuais. Jogo recreativo +18 apenas para diversão!',
    icon: Sparkles,
    gradient: 'from-fortune-gold to-fortune-ember'
  },
  {
    id: 2,
    title: '💰 Ganhe Moedas Grátis',
    description: 'Receba 100 moedas de boas-vindas! Colete bônus diários e complete missões para ganhar mais.',
    icon: Coins,
    gradient: 'from-fortune-ember to-fortune-crimson'
  },
  {
    id: 3,
    title: '🎁 Bônus e Recompensas',
    description: 'Abra baús especiais, participe de eventos e desbloqueie conquistas para multiplicar seus ganhos!',
    icon: Gift,
    gradient: 'from-fortune-crimson to-pgbet-purple'
  },
  {
    id: 4,
    title: '⚡ Girar Agora!',
    description: 'Toque no botão dourado para começar. Boa sorte e divirta-se com responsabilidade!',
    icon: Zap,
    gradient: 'from-pgbet-purple to-fortune-gold'
  }
];

export const TutorialOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={currentStep}
          initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-md w-full"
        >
          <Card className="relative overflow-hidden border-2 border-fortune-gold/30 bg-gradient-to-br from-black/80 to-pgbet-dark/80 backdrop-blur-xl">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Icon with animation */}
              <motion.div
                className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <Icon className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-center text-gray-300 text-lg leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-fortune-gold' 
                        : index < currentStep
                        ? 'w-2 bg-fortune-gold/50'
                        : 'w-2 bg-gray-600'
                    }`}
                    animate={index === currentStep ? {
                      scale: [1, 1.2, 1]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {currentStep < steps.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 border-gray-600 hover:bg-white/10"
                  >
                    Pular
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className={`flex-1 bg-gradient-to-r ${step.gradient} hover:opacity-90 text-black font-bold shadow-lg shadow-fortune-gold/30`}
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Próximo <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Começar! <Sparkles className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-fortune-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-fortune-ember/10 rounded-full blur-3xl" />
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
