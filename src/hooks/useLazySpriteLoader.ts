import { useState, useEffect, useCallback } from 'react';

interface SpriteState {
  loaded: boolean;
  error: boolean;
  url?: string;
}

interface SpriteCache {
  [key: string]: SpriteState;
}

interface UseLazySpriteLoaderReturn {
  loadedSprites: SpriteCache;
  loadSprite: (key: string, url: string) => Promise<void>;
  preloadSprites: (sprites: { key: string; url: string }[]) => Promise<void>;
  isLoading: boolean;
}

export const useLazySpriteLoader = (): UseLazySpriteLoaderReturn => {
  const [loadedSprites, setLoadedSprites] = useState<SpriteCache>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadSprite = useCallback(async (key: string, url: string): Promise<void> => {
    if (loadedSprites[key]?.loaded) return;

    setLoadedSprites(prev => ({
      ...prev,
      [key]: { loaded: false, error: false }
    }));

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedSprites(prev => ({
          ...prev,
          [key]: { loaded: true, error: false, url }
        }));
        resolve();
      };

      img.onerror = () => {
        setLoadedSprites(prev => ({
          ...prev,
          [key]: { loaded: false, error: true }
        }));
        reject(new Error(`Failed to load sprite: ${key}`));
      };

      img.src = url;
    });
  }, [loadedSprites]);

  const preloadSprites = useCallback(async (sprites: { key: string; url: string }[]): Promise<void> => {
    setIsLoading(true);
    
    try {
      const promises = sprites.map(sprite => loadSprite(sprite.key, sprite.url));
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some sprites failed to preload:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadSprite]);

  return {
    loadedSprites,
    loadSprite,
    preloadSprites,
    isLoading
  };
};