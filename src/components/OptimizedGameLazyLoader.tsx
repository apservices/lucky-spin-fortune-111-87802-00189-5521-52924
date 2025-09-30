/**
 * Optimized Game Component Lazy Loader
 * Loads game components on demand with performance optimization
 */

import React, { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { performanceOptimizer } from '@/utils/performance/PerformanceOptimizer';

// Lazy load heavy game components
const FullscreenSlotMachine = lazy(async () => {
  // Preload critical assets before loading component
  await performanceOptimizer.preloadCriticalAssets();
  const module = await import('@/components/FullscreenSlotMachine');
  return { default: module.FullscreenSlotMachine };
});

const PremiumZodiacSlot = lazy(async () => {
  const module = await import('@/components/PremiumZodiacSlot');
  return { default: module.PremiumZodiacSlot };
});

const ZodiacFortuneSlot = lazy(async () => {
  const module = await import('@/components/ZodiacFortuneSlot');
  return { default: module.ZodiacFortuneSlot };
});

const ParticleBackground = lazy(async () => {
  const module = await import('@/components/ParticleBackground');
  return { default: module.ParticleBackground };
});

const FloatingCoinsBackground = lazy(async () => {
  const module = await import('@/components/FloatingCoinsBackground');
  return { default: module.FloatingCoinsBackground };
});

const SimpleSlotMachine = lazy(async () => {
  const module = await import('@/components/SimpleSlotMachine');
  return { default: module.SimpleSlotMachine };
});

// Lightweight loading skeleton
const GameLoadingSkeleton: React.FC = () => (
  <div className="w-full h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center">
    <Card className="p-8 w-full max-w-md mx-4">
      <div className="space-y-6 text-center">
        <Skeleton className="h-12 w-32 mx-auto" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="text-sm text-muted-foreground">
          Carregando jogo...
        </div>
      </div>
    </Card>
  </div>
);

interface LazyGameComponentProps {
  component: 'fullscreen' | 'premium' | 'zodiac' | 'particles' | 'coins' | 'simple';
  fallback?: React.ComponentType;
  [key: string]: any;
}

export const LazyGameComponent: React.FC<LazyGameComponentProps> = ({ 
  component, 
  fallback: CustomFallback,
  ...props 
}) => {
  const Fallback = CustomFallback || GameLoadingSkeleton;

  const getComponent = () => {
    switch (component) {
      case 'fullscreen':
        return <FullscreenSlotMachine {...props} />;
      case 'premium':
        const premiumProps = {
          coins: 1000,
          energy: 100,
          level: 1,
          experience: 0,
          onCoinsChange: () => {},
          onEnergyChange: () => {},
          onExperienceChange: () => {},
          onLevelUp: () => {},
          ...props
        };
        return <PremiumZodiacSlot {...premiumProps} />;
      case 'zodiac':
        const zodiacProps = {
          coins: 1000,
          energy: 100,
          onCoinsChange: () => {},
          onEnergyChange: () => {},
          ...props
        };
        return <ZodiacFortuneSlot {...zodiacProps} />;
      case 'particles':
        return <ParticleBackground {...props} />;
      case 'coins':
        return <FloatingCoinsBackground {...props} />;
      case 'simple':
        const simpleProps = {
          coins: 1000,
          energy: 10,
          level: 1,
          experience: 0,
          maxExperience: 100,
          onCoinsChange: () => {},
          onEnergyChange: () => {},
          onExperienceChange: () => {},
          ...props
        };
        return <SimpleSlotMachine {...simpleProps} />;
      default:
        return <div>Unknown component</div>;
    }
  };

  return (
    <Suspense fallback={<Fallback />}>
      {getComponent()}
    </Suspense>
  );
};