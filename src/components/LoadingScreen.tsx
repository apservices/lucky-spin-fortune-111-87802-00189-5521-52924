/**
 * Loading Screen Premium - Tela de carregamento inicial
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simular carregamento com progresso realista
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        // Progressão mais rápida no início, mais lenta no final
        const increment = prev < 50 ? 15 : prev < 80 ? 8 : 4;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-radial from-purple-900/30 via-black to-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Partículas de fundo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-fortune-gold/40 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50
                }}
                animate={{
                  y: -50,
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* Conteúdo central */}
          <div className="relative z-10 text-center space-y-8 px-4">
            {/* Logo/Ícone */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                damping: 12,
                duration: 1
              }}
              className="text-8xl md:text-9xl filter drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]"
            >
              🐅
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-3"
            >
              <h1 
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent"
                style={{
                  fontFamily: 'serif',
                  textShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
                }}
              >
                Zodiac Fortune Slots
              </h1>
              <p className="text-fortune-gold/80 text-lg md:text-xl font-medium">
                Jogo Recreativo +18
              </p>
            </motion.div>

            {/* Barra de progresso */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-md mx-auto space-y-2"
            >
              <div className="relative h-3 bg-black/60 rounded-full overflow-hidden border border-fortune-gold/30">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Efeito de brilho */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "linear" 
                    }}
                  />
                </motion.div>
              </div>
              <div className="text-center text-fortune-gold/60 text-sm font-medium">
                {progress}%
              </div>
            </motion.div>

            {/* Indicador de carregamento */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-fortune-gold rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Gradiente decorativo inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-fortune-gold/10 via-fortune-ember/5 to-transparent pointer-events-none" />
          
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-gray-500 text-xs md:text-sm">
              Jogo recreativo sem apostas reais • Apenas para maiores de 18 anos
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
