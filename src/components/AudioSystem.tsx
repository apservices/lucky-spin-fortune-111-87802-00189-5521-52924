import { useEffect, useRef } from 'react';

interface AudioSystemProps {
  soundEnabled: boolean;
}

export class GameAudioEngine {
  private context: AudioContext | null = null;
  private soundEnabled = true;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio();
    }
  }

  private async initializeAudio() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  // Simulate PGSoft-like sound effects using Web Audio API
  playSpinSound() {
    if (!this.soundEnabled || !this.context) return;
    
    // Create mechanical spin sound
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.3);
  }

  playWinSound(multiplier: number = 1) {
    if (!this.soundEnabled || !this.context) return;
    
    // Create celebratory win sound
    const oscillator = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    // Base frequency increases with multiplier
    const baseFreq = 400 + (multiplier * 50);
    oscillator.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.context.currentTime + 0.2);
    
    oscillator2.frequency.setValueAtTime(baseFreq * 1.5, this.context.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(baseFreq * 3, this.context.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
    
    oscillator.start();
    oscillator2.start();
    oscillator.stop(this.context.currentTime + 0.4);
    oscillator2.stop(this.context.currentTime + 0.4);
  }

  playCoinSound() {
    if (!this.soundEnabled || !this.context) return;
    
    // Metallic coin sound
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    oscillator.frequency.setValueAtTime(800, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.2);
  }

  playMascotSound(symbol: string) {
    if (!this.soundEnabled || !this.context) return;
    
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    // Different sounds for different mascots
    let frequency = 300;
    let duration = 0.3;
    
    switch (symbol) {
      case '🐯': // Tiger roar
        frequency = 150;
        duration = 0.5;
        break;
      case '🦊': // Fox dance
        frequency = 400;
        duration = 0.4;
        break;
      case '🐸': // Frog jump
        frequency = 250;
        duration = 0.3;
        break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.context.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.12, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  playJackpotSound() {
    if (!this.soundEnabled || !this.context) return;
    
    // Epic jackpot fanfare
    const duration = 1.5;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);
        
        const frequency = 440 * Math.pow(2, i / 4); // Musical scale
        oscillator.frequency.setValueAtTime(frequency, this.context!.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.context!.currentTime + 0.3);
      }, i * 100);
    }
  }
}

export const gameAudio = new GameAudioEngine();

export const AudioSystem: React.FC<AudioSystemProps> = ({ soundEnabled }) => {
  useEffect(() => {
    gameAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  return null;
};