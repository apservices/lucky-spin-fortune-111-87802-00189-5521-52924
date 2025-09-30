/**
 * Real-time Analytics Dashboard
 * Admin interface for viewing game analytics
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsMetrics, useAnalytics } from '@/systems/AnalyticsSystem';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Monitor,
  Users,
  Gamepad2,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const metrics = useAnalyticsMetrics();
  const { exportData } = useAnalytics();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Sample data for charts (in real implementation, this would come from analytics backend)
  const sessionData = [
    { time: '00:00', sessions: 45, avgDuration: 180 },
    { time: '04:00', sessions: 23, avgDuration: 220 },
    { time: '08:00', sessions: 78, avgDuration: 165 },
    { time: '12:00', sessions: 134, avgDuration: 195 },
    { time: '16:00', sessions: 189, avgDuration: 210 },
    { time: '20:00', sessions: 156, avgDuration: 245 }
  ];

  const performanceData = [
    { time: '00:00', fps: 58, memory: 45, loadTime: 1200 },
    { time: '04:00', fps: 59, memory: 48, loadTime: 1100 },
    { time: '08:00', fps: 55, memory: 52, loadTime: 1350 },
    { time: '12:00', fps: 52, memory: 58, loadTime: 1450 },
    { time: '16:00', fps: 48, memory: 65, loadTime: 1600 },
    { time: '20:00', fps: 56, memory: 51, loadTime: 1250 }
  ];

  const gameTypeData = [
    { name: 'Fortune Tiger', value: 45, color: '#ffd700' },
    { name: 'Wheel Fortune', value: 25, color: '#ff6b35' },
    { name: 'Wild Slots', value: 20, color: '#f7931e' },
    { name: 'Carnival Slots', value: 10, color: '#ff1744' }
  ];

  const retentionData = [
    { day: 'D1', retained: 78, total: 100 },
    { day: 'D7', retained: 45, total: 100 },
    { day: 'D30', retained: 23, total: 100 }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check for critical alerts
  const criticalAlerts = [];
  if (metrics.performance.avgFPS < 30) {
    criticalAlerts.push({ type: 'performance', message: 'FPS médio abaixo de 30', severity: 'high' });
  }
  if (metrics.performance.errors.length > 0) {
    criticalAlerts.push({ type: 'error', message: `${metrics.performance.errors.length} erros JavaScript`, severity: 'medium' });
  }
  if (metrics.performance.memoryUsage.current > metrics.performance.memoryUsage.initial * 2) {
    criticalAlerts.push({ type: 'memory', message: 'Uso de memória alto', severity: 'medium' });
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Zodiac Fortune - Métricas em Tempo Real</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && alertsEnabled && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Alertas Críticos</h3>
            </div>
            <Button
              onClick={() => setAlertsEnabled(false)}
              variant="ghost"
              size="sm"
            >
              Dispensar
            </Button>
          </div>
          <div className="space-y-2">
            {criticalAlerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.severity === 'high' ? 'ALTO' : 'MÉDIO'}
                </Badge>
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Sessões Ativas</p>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-green-500">+12% vs ontem</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Gamepad2 className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Spins</p>
              <p className="text-2xl font-bold">{metrics.gameplay.totalSpins.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-green-500">+8% vs ontem</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Monitor className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">FPS Médio</p>
              <p className="text-2xl font-bold">{Math.round(metrics.performance.avgFPS)}</p>
              <p className={`text-xs ${metrics.performance.avgFPS >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.performance.avgFPS >= 50 ? 'Excelente' : 'Precisa atenção'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-fortune-gold" />
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Vitória</p>
              <p className="text-2xl font-bold">
                {((metrics.gameplay.totalWins / Math.max(metrics.gameplay.totalSpins, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Balanceado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="gameplay" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        {/* Gameplay Analytics */}
        <TabsContent value="gameplay" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sessões por Horário</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição por Jogo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gameTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }: any) => `${name} ${value}%`}
                  >
                    {gameTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-3">Estatísticas de Jogo</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Spins</span>
                  <span className="font-medium">{metrics.gameplay.totalSpins.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Vitórias</span>
                  <span className="font-medium">{metrics.gameplay.totalWins.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maior Vitória</span>
                  <span className="font-medium text-fortune-gold">
                    {metrics.gameplay.maxWin.toLocaleString('pt-BR')} moedas
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de Vitória</span>
                  <span className="font-medium">
                    {((metrics.gameplay.totalWins / Math.max(metrics.gameplay.totalSpins, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Features Utilizadas</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Modo Turbo</span>
                    <span className="text-sm font-medium">{metrics.gameplay.featuresUsed.turbo}</span>
                  </div>
                  <Progress value={(metrics.gameplay.featuresUsed.turbo / metrics.gameplay.totalSpins) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Auto Spin</span>
                    <span className="text-sm font-medium">{metrics.gameplay.featuresUsed.autoSpin}</span>
                  </div>
                  <Progress value={(metrics.gameplay.featuresUsed.autoSpin / metrics.gameplay.totalSpins) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Aposta Máxima</span>
                    <span className="text-sm font-medium">{metrics.gameplay.featuresUsed.maxBet}</span>
                  </div>
                  <Progress value={(metrics.gameplay.featuresUsed.maxBet / metrics.gameplay.totalSpins) * 100} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Métricas de Sessão</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duração Média</span>
                  <span className="font-medium">12m 34s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Spins por Sessão</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de Bounce</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessões Recorrentes</span>
                  <span className="font-medium">67%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Métricas de Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fps"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="FPS"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="memory"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  name="Memória (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">FPS</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Médio</span>
                  <span className="font-bold">{Math.round(metrics.performance.avgFPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mínimo</span>
                  <span>{Math.round(metrics.performance.minFPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Máximo</span>
                  <span>{Math.round(metrics.performance.maxFPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Drops</span>
                  <span className="text-red-500">{metrics.performance.frameDrops}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-secondary" />
                <h4 className="font-semibold">Carregamento</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Inicial</span>
                  <span>{Math.round(metrics.performance.loadTimes.initial)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Assets</span>
                  <span>{metrics.performance.loadTimes.assets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Jogo</span>
                  <span>{metrics.performance.loadTimes.gameStart}ms</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Monitor className="w-5 h-5 text-accent" />
                <h4 className="font-semibold">Memória</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Inicial</span>
                  <span>{Math.round(metrics.performance.memoryUsage.initial / 1024 / 1024)}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Atual</span>
                  <span>{Math.round(metrics.performance.memoryUsage.current / 1024 / 1024)}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pico</span>
                  <span>{Math.round(metrics.performance.memoryUsage.peak / 1024 / 1024)}MB</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold">Erros</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">JavaScript</span>
                  <span className="text-destructive">{metrics.performance.errors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Crashes</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Últimas 24h</span>
                  <span>{metrics.performance.errors.filter(e => Date.now() - e.timestamp < 86400000).length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Device Information */}
          <Card className="p-6">
            <h4 className="font-semibold mb-3">Informações do Dispositivo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Resolução:</span>
                <span className="ml-2">{metrics.performance.deviceInfo.screenResolution}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pixel Ratio:</span>
                <span className="ml-2">{metrics.performance.deviceInfo.devicePixelRatio}x</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">CPU Cores:</span>
                <span className="ml-2">{metrics.performance.deviceInfo.hardwareConcurrency}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">User Agent:</span>
                <span className="ml-2 text-xs">{metrics.performance.deviceInfo.userAgent.substring(0, 50)}...</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Engagement Analytics */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Retenção de Usuários</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="retained" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progressão de Níveis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Nível Atual</span>
                  <Badge variant="secondary">{metrics.engagement.level}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{metrics.engagement.experienceGained} XP</span>
                  </div>
                  <Progress value={(metrics.engagement.experienceGained / 1000) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{metrics.engagement.achievementsUnlocked.length}</p>
                    <p className="text-sm text-muted-foreground">Conquistas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{metrics.engagement.themesUsed.length}</p>
                    <p className="text-sm text-muted-foreground">Temas Usados</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-3">Engajamento Social</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Indicações</span>
                  <span className="font-medium">{metrics.engagement.referralCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Streak Máximo</span>
                  <span className="font-medium">{metrics.engagement.dailyStreakMax} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessões Total</span>
                  <span className="font-medium">{metrics.engagement.sessionCount}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Temas Desbloqueados</h4>
              <div className="space-y-2">
                {metrics.engagement.themesUsed.length > 0 ? (
                  metrics.engagement.themesUsed.map((theme, index) => (
                    <Badge key={index} variant="outline">{theme}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum tema personalizado usado</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Conquistas</h4>
              <div className="space-y-2">
                {metrics.engagement.achievementsUnlocked.length > 0 ? (
                  metrics.engagement.achievementsUnlocked.map((achievement, index) => (
                    <Badge key={index} variant="secondary">{achievement}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma conquista desbloqueada ainda</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">8</p>
                <p className="text-sm text-muted-foreground">Jogadores Online</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">47</p>
                <p className="text-sm text-muted-foreground">Spins/min</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">12.4s</p>
                <p className="text-sm text-muted-foreground">Tempo Médio/Spin</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-fortune-gold">3</p>
                <p className="text-sm text-muted-foreground">Vitórias Grandes</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Atividade em Tempo Real</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">Jogador{Math.floor(Math.random() * 1000)}</p>
                      <p className="text-xs text-muted-foreground">
                        {i % 3 === 0 ? 'Grande vitória' : i % 2 === 0 ? 'Novo nível' : 'Spin ganho'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-fortune-gold">
                      +{Math.floor(Math.random() * 5000)} moedas
                    </p>
                    <p className="text-xs text-muted-foreground">agora</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};