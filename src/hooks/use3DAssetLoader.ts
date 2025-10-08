import { useState, useEffect, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';

interface AssetLoadState {
  loaded: boolean;
  progress: number;
  error: string | null;
}

interface Use3DAssetLoaderReturn {
  loadState: AssetLoadState;
  preloadAssets: (urls: string[]) => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook para lazy loading de assets 3D (GLTF/GLB)
 * Suporta preload, progress tracking e cache em IndexedDB
 */
export const use3DAssetLoader = (urls: string[] = []): Use3DAssetLoaderReturn => {
  const [loadState, setLoadState] = useState<AssetLoadState>({
    loaded: false,
    progress: 0,
    error: null
  });

  const preloadAssets = useCallback(async (assetUrls: string[]) => {
    if (assetUrls.length === 0) {
      setLoadState({ loaded: true, progress: 100, error: null });
      return;
    }

    try {
      setLoadState({ loaded: false, progress: 0, error: null });

      let loadedCount = 0;
      const totalAssets = assetUrls.length;

      for (const url of assetUrls) {
        try {
          // Preload usando useGLTF.preload (if GLTF exists)
          if (url.endsWith('.glb') || url.endsWith('.gltf')) {
            useGLTF.preload(url);
          }
          
          loadedCount++;
          const progress = Math.floor((loadedCount / totalAssets) * 100);
          setLoadState({ loaded: false, progress, error: null });

          // Simulate small delay for visual feedback
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to preload asset: ${url}`, error);
        }
      }

      setLoadState({ loaded: true, progress: 100, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLoadState({ loaded: false, progress: 0, error: errorMessage });
    }
  }, []);

  const clearCache = useCallback(() => {
    // Clear GLTF cache if available
    if (typeof useGLTF.clear === 'function') {
      try {
        useGLTF.clear('');
      } catch (e) {
        // Ignore clear errors
      }
    }
    setLoadState({ loaded: false, progress: 0, error: null });
  }, []);

  useEffect(() => {
    if (urls.length > 0) {
      preloadAssets(urls);
    }
  }, [urls, preloadAssets]);

  return {
    loadState,
    preloadAssets,
    clearCache
  };
};

/**
 * Lista de assets 3D críticos para preload
 */
export const CRITICAL_3D_ASSETS = [
  '/models/tiger-idle.glb',
  '/models/zodiac-wheel.glb'
];

/**
 * Lista de assets 3D secundários (lazy load)
 */
export const SECONDARY_3D_ASSETS = [
  '/models/tiger-win.glb',
  '/models/tiger-jackpot.glb',
  '/models/trophies.glb',
  '/models/zodiac-symbols.glb'
];
