interface AssetCacheItem {
  url: string;
  asset: HTMLImageElement | HTMLAudioElement;
  lastUsed: number;
  priority: 'critical' | 'normal' | 'low';
  size: number;
  ttl: number; // Time to live in milliseconds
  expires: number; // Expiration timestamp
}

interface AssetLoadOptions {
  priority?: 'critical' | 'normal' | 'low';
  preload?: boolean;
  webpFallback?: boolean;
  ttl?: number; // Time to live in milliseconds (default 1 hour)
}

class AssetManager {
  private cache = new Map<string, AssetCacheItem>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement | HTMLAudioElement>>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private preloadQueue: Array<{ url: string; options: AssetLoadOptions }> = [];
  private isProcessingQueue = false;

  constructor() {
    // Clean up cache periodically
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Every minute
    
    // Preload critical assets immediately
    this.preloadCriticalAssets();
  }

  private preloadCriticalAssets() {
    const criticalAssets = [
      '/src/assets/sprites/envelope-idle.webp',
      '/src/assets/sprites/fox-idle.webp',
      '/src/assets/sprites/frog-idle.webp',
      '/src/assets/sprites/orange-idle.webp',
      '/src/assets/sprites/scroll-idle.webp',
      '/src/assets/sprites/tiger-idle.webp'
    ];

    criticalAssets.forEach(url => {
      this.loadAsset(url, { priority: 'critical', preload: true, webpFallback: true });
    });
  }

  private supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        resolve(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private getWebPUrl(url: string): string {
    // Convert common image formats to WebP
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  private getFallbackUrl(url: string): string {
    // Convert WebP back to original format
    if (url.includes('.webp')) {
      return url.replace('.webp', '.png'); // Default fallback to PNG
    }
    return url;
  }

  private async loadImage(url: string, options: AssetLoadOptions): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const size = this.estimateImageSize(img);
        this.addToCache(url, img, options.priority || 'normal', size);
        resolve(img);
      };
      
      img.onerror = async () => {
        // Try WebP fallback if enabled
        if (options.webpFallback && url.includes('.webp')) {
          try {
            const fallbackUrl = this.getFallbackUrl(url);
            const fallbackImg = await this.loadImage(fallbackUrl, { ...options, webpFallback: false });
            resolve(fallbackImg);
          } catch {
            reject(new Error(`Failed to load image: ${url}`));
          }
        } else {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };

      // Set crossorigin for better caching
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  private async loadAudio(url: string, options: AssetLoadOptions): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => {
        const size = this.estimateAudioSize(audio);
        this.addToCache(url, audio, options.priority || 'normal', size);
        resolve(audio);
      };
      
      audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${url}`));
      };

      audio.preload = 'metadata';
      audio.src = url;
    });
  }

  private estimateImageSize(img: HTMLImageElement): number {
    // Rough estimation: width * height * 4 bytes per pixel (RGBA)
    return img.width * img.height * 4;
  }

  private estimateAudioSize(audio: HTMLAudioElement): number {
    // Rough estimation based on duration and common bitrates
    const duration = audio.duration || 10; // Default 10 seconds if unknown
    const estimatedBitrate = 128000; // 128 kbps
    return (duration * estimatedBitrate) / 8; // Convert to bytes
  }

  private addToCache(url: string, asset: HTMLImageElement | HTMLAudioElement, priority: 'critical' | 'normal' | 'low', size: number, ttl: number = 3600000) {
    // Remove existing item if it exists
    if (this.cache.has(url)) {
      const existing = this.cache.get(url)!;
      this.currentCacheSize -= existing.size;
    }

    const now = Date.now();
    // Add new item
    this.cache.set(url, {
      url,
      asset,
      lastUsed: now,
      priority,
      size,
      ttl,
      expires: now + ttl
    });

    this.currentCacheSize += size;

    // Clean up if over limit
    if (this.currentCacheSize > this.maxCacheSize) {
      this.cleanupCache();
    }
  }

  private cleanupCache() {
    if (this.currentCacheSize <= this.maxCacheSize * 0.8) return;

    const items = Array.from(this.cache.entries());
    
    // Sort by priority and last used time
    items.sort((a, b) => {
      const priorityWeight = { critical: 3, normal: 2, low: 1 };
      const aPriority = priorityWeight[a[1].priority];
      const bPriority = priorityWeight[b[1].priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return b[1].lastUsed - a[1].lastUsed; // More recently used first
    });

    // Remove low priority and old items
    const targetSize = this.maxCacheSize * 0.6;
    
    while (this.currentCacheSize > targetSize && items.length > 0) {
      const [url, item] = items.pop()!;
      if (item.priority !== 'critical') {
        this.cache.delete(url);
        this.currentCacheSize -= item.size;
      }
    }
  }

  private async processPreloadQueue() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.preloadQueue.length > 0) {
      const { url, options } = this.preloadQueue.shift()!;
      
      if (!this.cache.has(url)) {
        try {
          await this.loadAsset(url, options);
        } catch (error) {
          console.warn(`Failed to preload asset: ${url}`, error);
        }
      }
      
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.isProcessingQueue = false;
  }

  public async loadAsset(url: string, options: AssetLoadOptions = {}): Promise<HTMLImageElement | HTMLAudioElement> {
    // Check cache first
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      cached.lastUsed = Date.now();
      return cached.asset;
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Determine if we should try WebP
    let finalUrl = url;
    if (options.webpFallback && await this.supportsWebP() && !url.includes('.webp')) {
      finalUrl = this.getWebPUrl(url);
    }

    // Start loading
    const loadingPromise = this.isImageUrl(finalUrl) 
      ? this.loadImage(finalUrl, options)
      : this.loadAudio(finalUrl, options);

    this.loadingPromises.set(url, loadingPromise);

    try {
      const asset = await loadingPromise;
      this.loadingPromises.delete(url);
      return asset;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }

  public preloadAsset(url: string, options: AssetLoadOptions = {}) {
    if (!this.cache.has(url)) {
      this.preloadQueue.push({ url, options });
      
      // Start processing queue if not already processing
      if (!this.isProcessingQueue) {
        this.processPreloadQueue();
      }
    }
  }

  public preloadAssets(urls: string[], options: AssetLoadOptions = {}) {
    urls.forEach(url => this.preloadAsset(url, options));
  }

  public getAsset(url: string): HTMLImageElement | HTMLAudioElement | null {
    const cached = this.cache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.asset;
    }
    return null;
  }

  public clearCache() {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  public getCacheStats() {
    return {
      totalItems: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      utilizationPercent: (this.currentCacheSize / this.maxCacheSize) * 100,
      itemsByPriority: {
        critical: Array.from(this.cache.values()).filter(item => item.priority === 'critical').length,
        normal: Array.from(this.cache.values()).filter(item => item.priority === 'normal').length,
        low: Array.from(this.cache.values()).filter(item => item.priority === 'low').length
      }
    };
  }
}

export const assetManager = new AssetManager();
export type { AssetLoadOptions };