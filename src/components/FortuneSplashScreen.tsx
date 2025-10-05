import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FortuneSplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-black via-pgbet-dark to-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-fortune-gold rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  opacity: 0
                }}
                animate={{
                  y: -50,
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center space-y-8">
            {/* Tiger emoji with glow effect */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 10,
                duration: 1 
              }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]"
              >
                🐅
              </motion.div>
              
              {/* Glow rings */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="w-48 h-48 border-4 border-fortune-gold rounded-full" />
              </motion.div>
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-2"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-fortune-gold via-fortune-ember to-fortune-gold bg-clip-text text-transparent animate-gradient-x">
                Fortune Tiger
              </h1>
              <p className="text-gray-400 text-lg">Zodiac Slots Premium</p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-fortune-gold rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>

            {/* Legal disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-gray-500 text-sm"
            >
              Jogo recreativo • +18 anos • Apenas diversão
            </motion.p>
          </div>

          {/* Bottom decorative gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-fortune-gold/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
