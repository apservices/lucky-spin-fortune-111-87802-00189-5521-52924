/**
 * Tutorial Interativo para Novos Jogadores
 * Explica mecânicas básicas do jogo
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, Sparkles } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlight?: string; // ID do elemento a destacar
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface InteractiveTutorialProps {
  steps?: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

const DEFAULT_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎰 Bem-vindo ao Zodiac Fortune!',
    description: 'Vamos te ensinar como jogar e ganhar prêmios incríveis com os símbolos do zodíaco chinês!',
    position: 'center'
  },
  {
    id: 'symbols',
    title: '🐉 Símbolos do Zodíaco',
    description: 'Combine 3 ou mais símbolos iguais em uma linha para ganhar! Dragão e Fênix são os mais raros e valiosos.',
    position: 'center'
  },
  {
    id: 'bet',
    title: '💰 Ajuste sua Aposta',
    description: 'Use os botões + e - para aumentar ou diminuir sua aposta. Apostas maiores podem trazer prêmios maiores!',
    highlight: 'bet-controls',
    position: 'bottom'
  },
  {
    id: 'spin',
    title: '🎯 Girar os Rolos',
    description: 'Clique no grande botão GIRAR para começar! Cada giro custa a quantidade de moedas da sua aposta.',
    highlight: 'spin-button',
    position: 'top'
  },
  {
    id: 'respin',
    title: '✨ Respin Mágico',
    description: 'Às vezes você terá sorte e ativará o Respin! Símbolos especiais ficam fixos enquanto os outros giram de novo.',
    position: 'center'
  },
  {
    id: 'currencies',
    title: '🪙 Duas Moedas',
    description: 'Você tem Moedas Gratuitas (ganha jogando) e Moedas Premium (mais valiosas). Use as duas para jogar!',
    position: 'top'
  }
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Marca tutorial como visto no localStorage
    const tutorialSeen = localStorage.getItem('zodiac-tutorial-seen');
    if (tutorialSeen === 'true') {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('zodiac-tutorial-seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('zodiac-tutorial-seen', 'true');
    setIsVisible(false);
    onSkip?.();
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Tutorial Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg"
        >
          <Card className="bg-gradient-to-b from-background to-background/95 border-2 border-primary/30 shadow-2xl overflow-hidden">
            {/* Header com gradiente */}
            <div className="relative h-2 bg-gradient-to-r from-primary via-secondary to-primary">
              <motion.div
                className="absolute top-0 left-0 h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Skip Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 hover:bg-destructive/20"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                {currentStepData.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-muted-foreground leading-relaxed text-lg"
              >
                {currentStepData.description}
              </motion.p>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {currentStep === steps.length - 1 ? (
                    'Começar a Jogar!'
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip Text */}
              <p className="text-center text-sm text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </p>
            </div>
          </Card>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
