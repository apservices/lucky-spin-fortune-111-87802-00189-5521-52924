/**
 * Performance Monitor Component
 * Real-time performance tracking widget
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalyticsMetrics } from '@/systems/AnalyticsSystem';
import { Monitor, Zap, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDetails = false, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(showDetails);
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = useAnalyticsMetrics();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const getFPSStatus = (fps: number) => {
    if (fps >= 55) return { color: 'bg-green-500', text: 'Excelente' };
    if (fps >= 45) return { color: 'bg-yellow-500', text: 'Bom' };
    if (fps >= 30) return { color: 'bg-orange-500', text: 'Regular' };
    return { color: 'bg-red-500', text: 'Crítico' };
  };

  const getMemoryStatus = () => {
    const usage = metrics.performance.memoryUsage;
    const percentIncrease = usage.current / usage.initial;
    
    if (percentIncrease < 1.5) return { color: 'bg-green-500', text: 'Normal' };
    if (percentIncrease < 2) return { color: 'bg-yellow-500', text: 'Moderado' };
    if (percentIncrease < 3) return { color: 'bg-orange-500', text: 'Alto' };
    return { color: 'bg-red-500', text: 'Crítico' };
  };

  if (!isVisible && !showDetails) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="sm"
        variant="outline"
        className={`fixed ${getPositionClasses()} z-40 bg-background/80 backdrop-blur-sm`}
      >
        <Monitor className="w-4 h-4 mr-2" />
        Monitor
      </Button>
    );
  }

  const fpsStatus = getFPSStatus(metrics.performance.avgFPS);
  const memoryStatus = getMemoryStatus();
  const hasErrors = metrics.performance.errors.length > 0;

  return (
    <Card className={`${showDetails ? '' : `fixed ${getPositionClasses()} z-40`} 
                     ${isExpanded ? 'w-80' : 'w-auto'} 
                     bg-background/95 backdrop-blur-sm border border-primary/20`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <div className="flex items-center space-x-1">
            {!showDetails && (
              <>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={() => setIsVisible(false)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  ×
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Compact View */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-sm font-mono">
              {Math.round(metrics.performance.avgFPS)} FPS
            </span>
            <div className={`w-2 h-2 rounded-full ${fpsStatus.color}`} />
          </div>

          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${memoryStatus.color}`} />
            <span className="text-xs text-muted-foreground">
              {Math.round(metrics.performance.memoryUsage.current / 1024 / 1024)}MB
            </span>
          </div>

          {hasErrors && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive">
                {metrics.performance.errors.length}
              </span>
            </div>
          )}
        </div>

        {/* Expanded View */}
        {(isExpanded || showDetails) && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">FPS</span>
                <Badge variant="outline" className="text-xs">
                  {fpsStatus.text}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Atual:</span>
                  <span className="font-mono">{Math.round(metrics.performance.avgFPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span className="font-mono">{Math.round(metrics.performance.minFPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span className="font-mono">{Math.round(metrics.performance.maxFPS)}</span>
                </div>
                {metrics.performance.frameDrops > 0 && (
                  <div className="flex justify-between text-orange-500">
                    <span>Drops:</span>
                    <span className="font-mono">{metrics.performance.frameDrops}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Memória</span>
                <Badge variant="outline" className="text-xs">
                  {memoryStatus.text}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Atual:</span>
                  <span className="font-mono">
                    {Math.round(metrics.performance.memoryUsage.current / 1024 / 1024)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inicial:</span>
                  <span className="font-mono">
                    {Math.round(metrics.performance.memoryUsage.initial / 1024 / 1024)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pico:</span>
                  <span className="font-mono">
                    {Math.round(metrics.performance.memoryUsage.peak / 1024 / 1024)}MB
                  </span>
                </div>
              </div>
            </div>

            {hasErrors && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Erros</span>
                  <Badge variant="destructive" className="text-xs">
                    {metrics.performance.errors.length}
                  </Badge>
                </div>
                <div className="text-xs text-destructive space-y-1 max-h-20 overflow-y-auto">
                  {metrics.performance.errors.slice(-3).map((error, index) => (
                    <div key={index} className="truncate">
                      {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-muted-foreground">Dispositivo</span>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Resolução:</span>
                  <span>{metrics.performance.deviceInfo.screenResolution}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pixel Ratio:</span>
                  <span>{metrics.performance.deviceInfo.devicePixelRatio}x</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Cores:</span>
                  <span>{metrics.performance.deviceInfo.hardwareConcurrency}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};