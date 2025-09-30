/**
 * Enhanced Audio System with Event Integration
 * Centralized audio management with game event integration
 */

import { gameEvents, GameEventType, useGameEvent } from './EventSystem';

// Audio file definitions
export interface AudioFile {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
  category: 'sfx' | 'music' | 'voice';
}

export const AUDIO_FILES: AudioFile[] = [
  // Sound effects
  { id: 'spin', src: '/audio/spin.mp3', volume: 0.7, category: 'sfx' },
  { id: 'win_small', src: '/audio/win_small.mp3', volume: 0.8, category: 'sfx' },
  { id: 'win_medium', src: '/audio/win_medium.mp3', volume: 0.8, category: 'sfx' },
  { id: 'win_big', src: '/audio/win_big.mp3', volume: 0.9, category: 'sfx' },
  { id: 'jackpot', src: '/audio/jackpot.mp3', volume: 1.0, category: 'sfx' },
  { id: 'coin_small', src: '/audio/coin_small.mp3', volume: 0.6, category: 'sfx' },
  { id: 'coin_medium', src: '/audio/coin_medium.mp3', volume: 0.7, category: 'sfx' },
  { id: 'coin_large', src: '/audio/coin_large.mp3', volume: 0.8, category: 'sfx' },
  { id: 'button_click', src: '/audio/button_click.mp3', volume: 0.5, category: 'sfx' },
  { id: 'error', src: '/audio/error.mp3', volume: 0.6, category: 'sfx' },
  { id: 'level_up', src: '/audio/level_up.mp3', volume: 0.8, category: 'sfx' },
  
  // Background music
  { id: 'bg_main', src: '/audio/bg_main.mp3', volume: 0.3, loop: true, category: 'music' },
  { id: 'bg_fortune', src: '/audio/bg_fortune.mp3', volume: 0.4, loop: true, category: 'music' },
  
  // Voice lines (Brazilian Portuguese)
  { id: 'voice_welcome', src: '/audio/voice_welcome.mp3', volume: 0.8, category: 'voice' },
  { id: 'voice_big_win', src: '/audio/voice_big_win.mp3', volume: 0.9, category: 'voice' },
  { id: 'voice_jackpot', src: '/audio/voice_jackpot.mp3', volume: 1.0, category: 'voice' }
];

/**
 * Enhanced Audio System Class
 */
export class EnhancedAudioSystem {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeAudio: Map<string, AudioBufferSourceNode> = new Map();
  private masterVolume = 0.7;
  private categoryVolumes = { sfx: 1.0, music: 1.0, voice: 1.0 };
  private enabled = true;
  private initialized = false;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize the audio system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if needed (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Load all audio files
      await this.loadAudioFiles();
      
      this.initialized = true;
      console.log('🎵 Audio system initialized');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }

  /**
   * Load all audio files
   */
  private async loadAudioFiles(): Promise<void> {
    const loadPromises = AUDIO_FILES.map(async (audioFile) => {
      try {
        const response = await fetch(audioFile.src);
        const arrayBuffer = await response.arrayBuffer();
        
        if (this.audioContext) {
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.audioBuffers.set(audioFile.id, audioBuffer);
        }
      } catch (error) {
        console.warn(`Failed to load audio file ${audioFile.id}:`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log(`🎵 Loaded ${this.audioBuffers.size} audio files`);
  }

  /**
   * Setup game event listeners
   */
  private setupEventListeners(): void {
    // Game events
    gameEvents.on(GameEventType.SPIN_START, () => this.playSound('spin'));
    gameEvents.on(GameEventType.WIN, (data) => {
      if (data.amount >= 100) {
        this.playSound('win_medium');
      } else {
        this.playSound('win_small');
      }
    });
    gameEvents.on(GameEventType.BIG_WIN, () => {
      this.playSound('win_big');
      this.playSound('voice_big_win');
    });
    gameEvents.on(GameEventType.JACKPOT, () => {
      this.playSound('jackpot');
      this.playSound('voice_jackpot');
    });
    gameEvents.on(GameEventType.LEVEL_UP, () => this.playSound('level_up'));
    gameEvents.on(GameEventType.ERROR_OCCURRED, () => this.playSound('error'));

    // Direct audio events
    gameEvents.on(GameEventType.SOUND_PLAY, (data) => {
      this.playSound(data.soundId, data.volume, data.loop);
    });
    gameEvents.on(GameEventType.SOUND_STOP, (data) => {
      this.stopSound(data.soundId);
    });
  }

  /**
   * Play a sound by ID
   */
  async playSound(soundId: string, volume?: number, loop?: boolean): Promise<void> {
    if (!this.enabled || !this.audioContext || !this.initialized) {
      return;
    }

    // Initialize if not done yet
    if (!this.initialized) {
      await this.initialize();
    }

    const audioBuffer = this.audioBuffers.get(soundId);
    const audioFile = AUDIO_FILES.find(f => f.id === soundId);
    
    if (!audioBuffer || !audioFile) {
      console.warn(`Audio file not found: ${soundId}`);
      return;
    }

    try {
      // Stop existing instance if playing
      this.stopSound(soundId);

      // Create source node
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume
      const finalVolume = (volume ?? audioFile.volume ?? 1.0) * 
                         this.categoryVolumes[audioFile.category] * 
                         this.masterVolume;
      gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);

      // Set loop
      source.loop = loop ?? audioFile.loop ?? false;

      // Store reference
      this.activeAudio.set(soundId, source);

      // Clean up when finished
      source.onended = () => {
        this.activeAudio.delete(soundId);
      };

      // Start playing
      source.start();
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
    }
  }

  /**
   * Stop a sound by ID
   */
  stopSound(soundId: string): void {
    const source = this.activeAudio.get(soundId);
    if (source) {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
      this.activeAudio.delete(soundId);
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    this.activeAudio.forEach((source, soundId) => {
      this.stopSound(soundId);
    });
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    gameEvents.emit(GameEventType.VOLUME_CHANGED, {
      oldVolume: this.masterVolume,
      newVolume: volume
    });
  }

  /**
   * Set category volume
   */
  setCategoryVolume(category: 'sfx' | 'music' | 'voice', volume: number): void {
    this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  /**
   * Get current volumes
   */
  getVolumes() {
    return {
      master: this.masterVolume,
      categories: { ...this.categoryVolumes }
    };
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if audio system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const audioSystem = new EnhancedAudioSystem();

// React hooks
import { useEffect, useCallback } from 'react';

/**
 * Hook for using the audio system
 */
export const useAudioSystem = () => {
  useEffect(() => {
    // Initialize on first use
    audioSystem.initialize();
  }, []);

  const playSound = useCallback((soundId: string, volume?: number, loop?: boolean) => {
    audioSystem.playSound(soundId, volume, loop);
  }, []);

  const stopSound = useCallback((soundId: string) => {
    audioSystem.stopSound(soundId);
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioSystem.setMasterVolume(volume);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    audioSystem.setEnabled(enabled);
  }, []);

  return {
    playSound,
    stopSound,
    setVolume,
    setEnabled,
    isEnabled: audioSystem.isEnabled(),
    isInitialized: audioSystem.isInitialized(),
    volumes: audioSystem.getVolumes()
  };
};

/**
 * Hook for playing sounds on specific events
 */
export const useEventAudio = (eventType: GameEventType, soundId: string) => {
  useGameEvent(eventType, () => {
    audioSystem.playSound(soundId);
  });
};