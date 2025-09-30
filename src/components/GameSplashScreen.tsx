/**
 * Game Splash Screen - Loading screen with theme and progress
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Star, Crown } from 'lucide-react';

export const GameSplashScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Inicializando...');

  const loadingSteps = [
    { progress: 20, text: 'Carregando sprites 3D...' },
    { progress: 40, text: 'Inicializando sistema de partículas...' },
    { progress: 60, text: 'Preparando efeitos sonoros...' },
    { progress: 80, text: 'Conectando ao sistema de fortuna...' },
    { progress: 100, text: 'Pronto para jogar!' }
  ];

  useEffect(() => {
    let currentStepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStepIndex < loadingSteps.length) {
        const step = loadingSteps[currentStepIndex];
        setLoadingProgress(step.progress);
        setCurrentStep(step.text);
        currentStepIndex++;
      } else {
        clearInterval(progressInterval);
      }
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 max-w-md w-full">
        
        {/* Logo Animation */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
        >
          <div className="text-6xl mb-4">🐅</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Zodiac Fortune
          </h1>
          <p className="text-lg text-gray-300 mt-2">Slots Premium</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 relative"
          >
            <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
            <Gamepad2 className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Progress Text */}
          <motion.p
            className="text-gray-300 text-sm"
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep}
          </motion.p>

          {/* Progress Percentage */}
          <motion.p
            className="text-yellow-400 font-bold text-lg mt-2"
            animate={{ scale: loadingProgress === 100 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {loadingProgress}%
          </motion.p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          className="grid grid-cols-3 gap-4 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-black" />
            </div>
            <p className="text-xs text-gray-400">Sprites 3D</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-400">Efeitos Premium</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-400">Experiência VIP</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <p>Carregando sua experiência premium...</p>
        </motion.div>

      </div>

      {/* Animated Border Glow */}
      <motion.div
        className="absolute inset-0 border border-yellow-400/20 rounded-lg"
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 215, 0, 0.1)',
            '0 0 40px rgba(255, 215, 0, 0.2)',
            '0 0 20px rgba(255, 215, 0, 0.1)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

    </div>
  );
};