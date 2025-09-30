import React, { useState, useCallback } from 'react';
import { optimizedAudio } from './OptimizedAudioSystem';

export const MinimalAudioControl: React.FC = () => {
  const [volume, setVolume] = useState(0.3);
  const [enabled, setEnabled] = useState(true);
  const [showSlider, setShowSlider] = useState(false);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    optimizedAudio.setVolume(newVolume);
  }, []);

  const toggleEnabled = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    optimizedAudio.setEnabled(newEnabled);
    if (!newEnabled) setShowSlider(false);
  }, [enabled]);

  const handleClick = useCallback(() => {
    if (enabled) {
      setShowSlider(!showSlider);
    } else {
      toggleEnabled();
    }
  }, [enabled, showSlider, toggleEnabled]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2">
        {/* Minimal audio indicator - just a small line/dash */}
        <button
          onClick={handleClick}
          className={`w-6 h-1 rounded-full transition-all duration-200 ${
            enabled ? 'bg-pgbet-gold hover:bg-pgbet-gold/80' : 'bg-gray-500'
          } ${showSlider ? 'scale-y-[3]' : ''}`}
          title={enabled ? (showSlider ? 'Ocultar controle' : 'Mostrar controle') : 'Ativar som'}
        />
        
        {/* Volume slider - only appears when clicked */}
        {enabled && showSlider && (
          <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg animate-fade-in">
            <input
              type="range"
              min="0"
              max="1" 
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pgbet-gold"
            />
          </div>
        )}
      </div>
    </div>
  );
};