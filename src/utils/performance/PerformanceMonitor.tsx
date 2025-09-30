import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Zap, 
  HardDrive, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { deviceCapabilities } from './DeviceCapabilities';
import { assetManager } from './AssetManager';
import { poolManager } from './ObjectPool';
import { animationController } from './AnimationController';

interface PerformanceAlert {
  type: 'fps' | 'memory' | 'cache' | 'pools';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
}

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  onToggle
}) => {
  const [stats, setStats] = useState({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    deviceTier: 'medium' as 'low' | 'medium' | 'high',
    cacheStats: { totalItems: 0, totalSize: 0, utilizationPercent: 0 },
    poolStats: {},
    animationStats: { activeAnimations: 0, skippedFrames: 0 }
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const capabilities = deviceCapabilities.getCapabilities();
      const cacheStats = assetManager.getCacheStats();
      const poolStats = poolManager.getStats();
      const animationStats = animationController.getStats();
      
      const newStats = {
        fps: animationStats.currentFPS,
        frameTime: animationStats.frameTime,
        memoryUsage: animationStats.memoryUsage,
        deviceTier: capabilities.tier,
        cacheStats,
        poolStats,
        animationStats
      };
      
      setStats(newStats);
      checkForAlerts(newStats);
    };

    const interval = setInterval(updateStats, 1000);
    updateStats();

    return () => clearInterval(interval);
  }, [isVisible]);

  const checkForAlerts = (currentStats: typeof stats) => {
    const newAlerts: PerformanceAlert[] = [];
    const now = Date.now();

    if (currentStats.fps < 30) {
      newAlerts.push({
        type: 'fps',
        severity: 'high',
        message: `FPS crítico: ${currentStats.fps.toFixed(1)}fps`,
        timestamp: now
      });
    }

    if (currentStats.memoryUsage > 200) {
      newAlerts.push({
        type: 'memory',
        severity: 'high',
        message: `Uso de memória alto: ${currentStats.memoryUsage.toFixed(1)}MB`,
        timestamp: now
      });
    }

    setAlerts(newAlerts);
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      console.log('Running optimization...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        <Monitor className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 w-96">
      <Card className="p-4 bg-background/95 backdrop-blur-sm border border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Performance Monitor</h3>
            </div>
            <Button onClick={onToggle} variant="ghost" size="sm">×</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">FPS</span>
              </div>
              <div className="text-2xl font-bold text-pgbet-emerald">
                {stats.fps.toFixed(1)}
              </div>
              <Progress value={(stats.fps / 60) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm">Memória</span>
              </div>
              <div className="text-2xl font-bold text-pgbet-emerald">
                {stats.memoryUsage.toFixed(1)}MB
              </div>
              <Progress value={(stats.memoryUsage / 200) * 100} className="h-2" />
            </div>
          </div>

          <Button
            onClick={runOptimization}
            disabled={isOptimizing}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isOptimizing ? 'Otimizando...' : 'Otimizar Performance'}
          </Button>

          <div className="flex items-center justify-center space-x-2 text-xs">
            <TrendingUp className="w-3 h-3 text-pgbet-emerald" />
            <span>Performance Boa</span>
          </div>
        </div>
      </Card>
    </div>
  );
};