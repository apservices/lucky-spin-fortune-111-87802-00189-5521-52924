import React, { useState } from 'react';
import { usePerformance3D } from '@/hooks/usePerformance3D';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const PerformanceDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics, fpsHistory, qualitySettings, forceQuality } = usePerformance3D();

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const avgFPS = fpsHistory.length > 0 
    ? Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length)
    : 0;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] bg-black/80 hover:bg-black/90"
        size="sm"
      >
        {isVisible ? '🔍 Fechar' : '🔍 Debug'}
      </Button>

      {isVisible && (
        <Card className="fixed top-4 right-4 z-[9999] p-4 bg-black/90 text-white backdrop-blur-sm border-primary/50 w-72">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">Performance 3D</h3>
              <Badge variant="outline">{metrics.qualityLevel.toUpperCase()}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FPS Atual:</span>
                <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
              </div>
              
              <div className="flex justify-between">
                <span>FPS Médio:</span>
                <span className={getFPSColor(avgFPS)}>{avgFPS}</span>
              </div>

              <div className="flex justify-between">
                <span>Frame Time:</span>
                <span>{metrics.frameTime.toFixed(2)}ms</span>
              </div>

              <div className="flex justify-between">
                <span>Max Partículas:</span>
                <span>{qualitySettings.maxParticles}</span>
              </div>

              <div className="flex justify-between">
                <span>Pixel Ratio:</span>
                <span>{qualitySettings.pixelRatio.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Antialiasing:</span>
                <span>{qualitySettings.antialias ? '✓' : '✗'}</span>
              </div>

              <div className="flex justify-between">
                <span>Post-Processing:</span>
                <span>{qualitySettings.postProcessing ? '✓' : '✗'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-primary/30">
              <p className="text-xs text-muted-foreground">Forçar Qualidade:</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => forceQuality('low')}
                  className="flex-1"
                >
                  LOW
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => forceQuality('medium')}
                  className="flex-1"
                >
                  MED
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => forceQuality('high')}
                  className="flex-1"
                >
                  HIGH
                </Button>
              </div>
            </div>

            {/* FPS Graph */}
            <div className="pt-2 border-t border-primary/30">
              <p className="text-xs text-muted-foreground mb-2">FPS History:</p>
              <div className="h-12 flex items-end gap-0.5">
                {fpsHistory.slice(-30).map((fps, i) => {
                  const height = Math.min((fps / 60) * 100, 100);
                  const color = fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${color} opacity-70`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};