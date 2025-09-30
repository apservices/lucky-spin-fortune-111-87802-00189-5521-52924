/**
 * Game Transition Component - Smooth page transitions with animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface GameTransitionProps {
  children: React.ReactNode;
}

export const GameTransition: React.FC<GameTransitionProps> = ({ children }) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

  // Different transitions for different routes
  const getTransitionConfig = (pathname: string) => {
    switch (pathname) {
      case '/game':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          transition: { duration: 0.5, ease: "easeInOut" }
        };
      case '/':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
          transition: { duration: 0.3, ease: "easeOut" }
        };
      default:
        return {
          initial: pageVariants.initial,
          animate: pageVariants.in,
          exit: pageVariants.out,
          transition: pageTransition
        };
    }
  };

  const transitionConfig = getTransitionConfig(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={transitionConfig.initial}
        animate={transitionConfig.animate}
        exit={transitionConfig.exit}
        transition={transitionConfig.transition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};