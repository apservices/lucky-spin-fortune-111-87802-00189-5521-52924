import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, Music, Gamepad2 } from 'lucide-react';

// Audio buffer cache for fast loading
class AudioCache {
  private cache = new Map<string, AudioBuffer>();
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async loadAudio(url: string): Promise<AudioBuffer | null> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    if (!this.audioContext) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.cache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load audio: ${url}`, error);
      return null;
    }
  }

  getContext() {
    return this.audioContext;
  }
}

// Premium audio engine with layered sound design
export class PremiumAudioEngine {
  private context: AudioContext | null = null;
  private cache = new AudioCache();
  private masterGain: GainNode | null = null;
  private backgroundMusicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private symbolGain: GainNode | null = null;
  private winGain: GainNode | null = null;
  
  // Volume controls (0-1)
  private volumes = {
    master: 0.7,
    background: 0.3,
    sfx: 0.8,
    symbols: 0.6,
    wins: 0.9
  };

  private muted = {
    master: false,
    background: false,
    sfx: false,
    symbols: false,
    wins: false
  };

  private backgroundMusic: AudioBufferSourceNode | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (typeof window === 'undefined') return;

    this.context = this.cache.getContext();
    if (!this.context) return;

    // Create gain nodes for layered audio control
    this.masterGain = this.context.createGain();
    this.backgroundMusicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.symbolGain = this.context.createGain();
    this.winGain = this.context.createGain();

    // Connect gain hierarchy
    this.backgroundMusicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.symbolGain.connect(this.masterGain);
    this.winGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.updateAllVolumes();
    this.isInitialized = true;
  }

  private updateAllVolumes() {
    if (!this.isInitialized) return;

    const masterVol = this.muted.master ? 0 : this.volumes.master;
    const bgVol = this.muted.background ? 0 : this.volumes.background;
    const sfxVol = this.muted.sfx ? 0 : this.volumes.sfx;
    const symbolVol = this.muted.symbols ? 0 : this.volumes.symbols;
    const winVol = this.muted.wins ? 0 : this.volumes.wins;

    this.masterGain!.gain.setValueAtTime(masterVol, this.context!.currentTime);
    this.backgroundMusicGain!.gain.setValueAtTime(bgVol, this.context!.currentTime);
    this.sfxGain!.gain.setValueAtTime(sfxVol, this.context!.currentTime);
    this.symbolGain!.gain.setValueAtTime(symbolVol, this.context!.currentTime);
    this.winGain!.gain.setValueAtTime(winVol, this.context!.currentTime);
  }

  // Volume and mute controls
  setVolume(category: keyof typeof this.volumes, volume: number) {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  toggleMute(category: keyof typeof this.muted) {
    this.muted[category] = !this.muted[category];
    this.updateAllVolumes();
  }

  getVolume(category: keyof typeof this.volumes) {
    return this.volumes[category];
  }

  isMuted(category: keyof typeof this.muted) {
    return this.muted[category];
  }

  // Spin sounds with variations
  async playSpinStart() {
    if (!this.isInitialized) await this.initialize();
    if (!this.context) return;

    // Mechanical click with subtle variation
    const variation = Math.random() * 0.2 - 0.1; // ±10% frequency variation
    
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain!);

    oscillator.frequency.setValueAtTime(800 + variation * 80, this.context.currentTime);
    filter.frequency.setValueAtTime(1200, this.context.currentTime);
    filter.Q.setValueAtTime(5, this.context.currentTime);

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.1);
  }

  async playSpinWhoosh() {
    if (!this.context) return;

    // Whoosh sound during spin
    const noiseBuffer = this.createWhiteNoise(0.3);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gainNode = this.context.createGain();

    source.buffer = noiseBuffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain!);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, this.context.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

    source.start();
    source.stop(this.context.currentTime + 0.3);
  }

  async playSpinStop() {
    if (!this.context) return;

    // Final click with mechanical resonance
    const oscillator1 = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.sfxGain!);

    oscillator1.frequency.setValueAtTime(600, this.context.currentTime);
    oscillator2.frequency.setValueAtTime(900, this.context.currentTime);

    gainNode.gain.setValueAtTime(0.12, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);

    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.context.currentTime + 0.15);
    oscillator2.stop(this.context.currentTime + 0.15);
  }

  // Victory sounds with intensity scaling
  async playWinFanfare(multiplier: number = 1) {
    if (!this.context) return;

    const intensity = Math.min(multiplier / 10, 3); // Cap at 3x intensity
    const baseFreq = 523.25; // C5 note
    const chord = [0, 4, 7, 12]; // Major chord intervals

    chord.forEach((interval, index) => {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.winGain!);

        const freq = baseFreq * Math.pow(2, interval / 12);
        oscillator.frequency.setValueAtTime(freq, this.context!.currentTime);

        const volume = (0.08 + intensity * 0.02) / chord.length;
        gainNode.gain.setValueAtTime(volume, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.6);

        oscillator.start();
        oscillator.stop(this.context!.currentTime + 0.6);
      }, index * 50);
    });
  }

  async playCoinsCascade(intensity: number = 1) {
    if (!this.context) return;

    const coinCount = Math.floor(5 + intensity * 3);
    
    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.winGain!);

        const freq = 800 + Math.random() * 400;
        oscillator.frequency.setValueAtTime(freq, this.context!.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, this.context!.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.06, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.2);

        oscillator.start();
        oscillator.stop(this.context!.currentTime + 0.2);
      }, i * (50 + Math.random() * 30));
    }
  }

  // Symbol-specific sounds
  async playSymbolSound(symbolId: string) {
    if (!this.context) return;

    switch (symbolId) {
      case 'tiger':
        await this.playTigerRoar();
        break;
      case 'fox':
        await this.playFoxMystic();
        break;
      case 'frog':
        await this.playFrogCoins();
        break;
      case 'envelope':
        await this.playEnvelopeOpen();
        break;
      case 'orange':
        await this.playOrangeCrystal();
        break;
      case 'scroll':
        await this.playScrollUnfurl();
        break;
    }
  }

  private async playTigerRoar() {
    // Deep, powerful roar
    const oscillator = this.context!.createOscillator();
    const gainNode = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.symbolGain!);

    oscillator.frequency.setValueAtTime(120, this.context!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.context!.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.context!.currentTime);

    gainNode.gain.setValueAtTime(0.15, this.context!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(this.context!.currentTime + 0.5);
  }

  private async playFoxMystic() {
    // Elegant, mystical chime
    const frequencies = [659.25, 830.61, 1046.50]; // E5, G#5, C6
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.symbolGain!);

        oscillator.frequency.setValueAtTime(freq, this.context!.currentTime);
        gainNode.gain.setValueAtTime(0.08, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.4);

        oscillator.start();
        oscillator.stop(this.context!.currentTime + 0.4);
      }, index * 80);
    });
  }

  private async playFrogCoins() {
    // Tinkling coins sound
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.symbolGain!);

        const freq = 1200 + Math.random() * 400;
        oscillator.frequency.setValueAtTime(freq, this.context!.currentTime);

        gainNode.gain.setValueAtTime(0.06, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.15);

        oscillator.start();
        oscillator.stop(this.context!.currentTime + 0.15);
      }, i * 40);
    }
  }

  private async playEnvelopeOpen() {
    // Paper rustling sound
    const noiseBuffer = this.createWhiteNoise(0.2);
    const source = this.context!.createBufferSource();
    const filter = this.context!.createBiquadFilter();
    const gainNode = this.context!.createGain();

    source.buffer = noiseBuffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.symbolGain!);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, this.context!.currentTime);

    gainNode.gain.setValueAtTime(0.05, this.context!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.2);

    source.start();
    source.stop(this.context!.currentTime + 0.2);
  }

  private async playOrangeCrystal() {
    // Crystal-like chime
    const oscillator = this.context!.createOscillator();
    const gainNode = this.context!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.symbolGain!);

    oscillator.frequency.setValueAtTime(2000, this.context!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1500, this.context!.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.08, this.context!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(this.context!.currentTime + 0.3);
  }

  private async playScrollUnfurl() {
    // Ancient paper unrolling
    const noiseBuffer = this.createWhiteNoise(0.4);
    const source = this.context!.createBufferSource();
    const filter = this.context!.createBiquadFilter();
    const gainNode = this.context!.createGain();

    source.buffer = noiseBuffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.symbolGain!);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, this.context!.currentTime);
    filter.Q.setValueAtTime(2, this.context!.currentTime);

    gainNode.gain.setValueAtTime(0.03, this.context!.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, this.context!.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.4);

    source.start();
    source.stop(this.context!.currentTime + 0.4);
  }

  // Background music management
  async startBackgroundMusic() {
    if (!this.context || this.backgroundMusic) return;

    // Create ambient loop (synthetic for now)
    const oscillator1 = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.backgroundMusicGain!);

    oscillator1.frequency.setValueAtTime(110, this.context.currentTime); // A2
    oscillator2.frequency.setValueAtTime(220, this.context.currentTime); // A3

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, this.context.currentTime + 2);

    oscillator1.start();
    oscillator2.start();

    // Store reference as any to avoid type issues
    this.backgroundMusic = oscillator1 as any;
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic && this.context) {
      try {
        (this.backgroundMusic as any).stop();
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
      this.backgroundMusic = null;
    }
  }

  intensifyBackgroundMusic() {
    if (!this.backgroundMusicGain || !this.context) return;
    
    const targetVolume = Math.min(this.volumes.background * 1.5, 1);
    this.backgroundMusicGain.gain.cancelScheduledValues(this.context.currentTime);
    this.backgroundMusicGain.gain.linearRampToValueAtTime(targetVolume, this.context.currentTime + 0.5);
    
    setTimeout(() => {
      if (this.backgroundMusicGain && this.context) {
        this.backgroundMusicGain.gain.linearRampToValueAtTime(this.volumes.background, this.context.currentTime + 1);
      }
    }, 3000);
  }

  // Utility methods
  private createWhiteNoise(duration: number): AudioBuffer {
    const sampleRate = this.context!.sampleRate;
    const buffer = this.context!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
}

// Audio control panel component
interface AudioControlPanelProps {
  audioEngine: PremiumAudioEngine;
  className?: string;
}

export const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  audioEngine,
  className = ''
}) => {
  const [volumes, setVolumes] = useState({
    master: audioEngine.getVolume('master'),
    background: audioEngine.getVolume('background'),
    sfx: audioEngine.getVolume('sfx'),
    symbols: audioEngine.getVolume('symbols'),
    wins: audioEngine.getVolume('wins')
  });

  const [muted, setMuted] = useState({
    master: audioEngine.isMuted('master'),
    background: audioEngine.isMuted('background'),
    sfx: audioEngine.isMuted('sfx'),
    symbols: audioEngine.isMuted('symbols'),
    wins: audioEngine.isMuted('wins')
  });

  const handleVolumeChange = (category: keyof typeof volumes, value: number[]) => {
    const newVolume = value[0];
    audioEngine.setVolume(category, newVolume);
    setVolumes(prev => ({ ...prev, [category]: newVolume }));
  };

  const handleMuteToggle = (category: keyof typeof muted) => {
    audioEngine.toggleMute(category);
    setMuted(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const VolumeControl = ({ 
    label, 
    category, 
    icon: Icon 
  }: { 
    label: string; 
    category: keyof typeof volumes; 
    icon: React.ComponentType<any>; 
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
      <Icon className="w-5 h-5 text-pgbet-gold" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMuteToggle(category)}
            className="w-8 h-8 p-0"
          >
            {muted[category] ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-pgbet-gold" />
            )}
          </Button>
        </div>
        <Slider
          value={[muted[category] ? 0 : volumes[category]]}
          onValueChange={(value) => handleVolumeChange(category, value)}
          max={1}
          step={0.05}
          className="flex-1"
          disabled={muted[category]}
        />
      </div>
    </div>
  );

  return (
    <Card className={`p-4 space-y-4 bg-gradient-to-br from-card via-card/90 to-card/80 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-pgbet-gold" />
        <h3 className="font-semibold">Controles de Áudio</h3>
      </div>
      
      <div className="space-y-3">
        <VolumeControl label="Volume Geral" category="master" icon={Volume2} />
        <VolumeControl label="Música de Fundo" category="background" icon={Music} />
        <VolumeControl label="Efeitos de Jogo" category="sfx" icon={Gamepad2} />
        <VolumeControl label="Sons de Símbolos" category="symbols" icon={Volume2} />
        <VolumeControl label="Sons de Vitória" category="wins" icon={Volume2} />
      </div>
    </Card>
  );
};

// Singleton instance
export const premiumAudio = new PremiumAudioEngine();

export const PremiumAudioSystem: React.FC = () => {
  return null; // This component handles initialization
};