/**
 * Post Processing Effects - Bloom and Vignette
 * Conditional rendering for high-end devices only
 */

import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface PostProcessingProps {
  intensity?: 'low' | 'medium' | 'high';
}

export const PostProcessing: React.FC<PostProcessingProps> = ({
  intensity = 'medium'
}) => {
  const { metrics } = usePerformanceOptimization();

  // Only enable on high-end devices
  if (metrics.fps < 50) {
    return null;
  }

  const bloomIntensity = {
    low: 0.5,
    medium: 1.0,
    high: 1.5
  }[intensity];

  return (
    <EffectComposer>
      {/* Bloom for golden glow */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        height={300}
        blendFunction={BlendFunction.ADD}
      />

      {/* Vignette for cinematic focus */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
};
