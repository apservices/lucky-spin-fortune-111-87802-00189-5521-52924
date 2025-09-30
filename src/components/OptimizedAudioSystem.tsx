import React, { useCallback, useRef, useState } from 'react';

class OptimizedAudio {
  private enabled = true;
  private volume = 0.3;
  
  // Simple audio context for basic sounds
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      // Silent fail for audio errors
    }
  };

  playSpinStart = () => {
    this.createTone(440, 0.1, 'square');
  };

  playSpinWhoosh = () => {
    // Quick frequency sweep for whoosh effect
    if (!this.audioContext || !this.enabled) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      // Silent fail
    }
  };

  playSpinStop = () => {
    this.createTone(220, 0.15, 'square');
  };

  playWinSound = (multiplier: number) => {
    const frequency = 523 + (multiplier * 50); // C note + multiplier
    this.createTone(frequency, 0.3);
    
    // Add harmony for bigger wins
    if (multiplier > 5) {
      setTimeout(() => this.createTone(frequency * 1.25, 0.2), 100);
    }
  };

  playJackpotSound = () => {
    // Simple jackpot fanfare
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => this.createTone(freq, 0.4), i * 150);
    });
  };

  playCoinSound = () => {
    this.createTone(800, 0.1, 'triangle');
  };

  setVolume = (volume: number) => {
    this.volume = Math.max(0, Math.min(1, volume));
  };

  setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  };

  // Empty methods for compatibility
  playSymbolSound = () => {};
  startBackgroundMusic = async () => {};
  stopBackgroundMusic = () => {};
  intensifyBackgroundMusic = () => {};
}

export const optimizedAudio = new OptimizedAudio();

interface OptimizedAudioSystemProps {
  soundEnabled?: boolean;
}

export const OptimizedAudioSystem: React.FC<OptimizedAudioSystemProps> = ({ 
  soundEnabled = true 
}) => {
  const [volume, setVolume] = useState(0.3);
  const [enabled, setEnabled] = useState(soundEnabled);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    optimizedAudio.setVolume(newVolume);
  }, []);

  const toggleEnabled = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    optimizedAudio.setEnabled(newEnabled);
  }, [enabled]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={toggleEnabled}
          className={`w-6 h-6 rounded ${enabled ? 'bg-green-500' : 'bg-gray-500'} text-white flex items-center justify-center`}
        >
          {enabled ? '🔊' : '🔇'}
        </button>
        {enabled && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};