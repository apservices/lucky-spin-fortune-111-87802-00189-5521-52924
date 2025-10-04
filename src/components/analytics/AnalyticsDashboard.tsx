/**
 * Analytics Dashboard - Real-time monitoring with advanced metrics
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, TrendingUp, Download, RefreshCw, Clock, Users, Zap } from 'lucide-react';
import { behaviorMonitor } from '@/systems/BehaviorMonitor';
import { auditLogger } from '@/systems/AuditLogger';
import { configSystem } from '@/systems/ConfigSystem';

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      setMetrics(behaviorMonitor.getMetrics());
      setAlerts(behaviorMonitor.getRecentAlerts());
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    const logs = await auditLogger.getRecentLogs(1000);
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = async () => {
    const logs = await auditLogger.getRecentLogs(1000);
    const csv = [
      ['Timestamp', 'Type', 'Severity', 'Message'],
      ...logs.map((log: any) => [
        new Date(log.timestamp).toISOString(),
        log.type,
        log.severity || 'info',
        log.message || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">RTP Base</p>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">
                  {(configSystem.getStatus().rtpBase * 100).toFixed(1)}%
                </p>
                <Progress value={configSystem.getStatus().rtpBase * 100} className="mt-2" />
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Spins/Min</p>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold">{metrics?.spinsPerMinute.toFixed(1) || '0'}</p>
                <Progress value={(metrics?.spinsPerMinute || 0) * 5} className="mt-2" />
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Alertas</p>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-500">{alerts.length}</p>
                <Progress value={Math.min(alerts.length * 10, 100)} className="mt-2" />
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Sessão</p>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{metrics?.sessionDuration.toFixed(0) || '0'}min</p>
                <Progress value={Math.min((metrics?.sessionDuration || 0) / 2, 100)} className="mt-2" />
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Métricas de Jogo
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Vitória</span>
                    <span className="font-semibold">{((metrics?.winLossRatio || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Aposta Média</span>
                    <span className="font-semibold">R$ {(metrics?.avgBetSize || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Padrão Repetitivo</span>
                    <Badge variant={metrics?.repetitivePattern ? 'destructive' : 'secondary'}>
                      {metrics?.repetitivePattern ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Apostas Rápidas</span>
                    <Badge variant={metrics?.rapidBetting ? 'destructive' : 'secondary'}>
                      {metrics?.rapidBetting ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alertas Ativos
                </h3>
                {alerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum alerta ativo</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((alert, i) => (
                      <div key={i} className="p-3 bg-muted rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="destructive" className="text-xs">{alert.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Análise de Comportamento</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Frequência de Apostas</span>
                    <span className="text-sm font-semibold">{metrics?.spinsPerMinute.toFixed(1)} spins/min</span>
                  </div>
                  <Progress value={Math.min((metrics?.spinsPerMinute || 0) * 10, 100)} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Duração da Sessão</span>
                    <span className="text-sm font-semibold">{metrics?.sessionDuration.toFixed(0)} minutos</span>
                  </div>
                  <Progress value={Math.min((metrics?.sessionDuration || 0) / 2, 100)} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Risco de Jogo Compulsivo</span>
                    <Badge variant={(alerts.length > 3) ? 'destructive' : 'secondary'}>
                      {alerts.length > 3 ? 'Alto' : alerts.length > 1 ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(alerts.length * 20, 100)} className="bg-green-200" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico de Alertas</h3>
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum alerta registrado</p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div key={i} className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{alert.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status de Conformidade</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">RTP Configurado</p>
                    <p className="text-sm text-muted-foreground">Deve estar entre 85% e 95%</p>
                  </div>
                  <Badge variant="secondary">
                    {(configSystem.getStatus().rtpBase * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Sistema de Alertas</p>
                    <p className="text-sm text-muted-foreground">Detecção de padrões suspeitos</p>
                  </div>
                  <Badge variant="secondary">✓ Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Logs de Auditoria</p>
                    <p className="text-sm text-muted-foreground">LGPD-compliant com anonimização</p>
                  </div>
                  <Badge variant="secondary">✓ Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-semibold">Verificação de Idade</p>
                    <p className="text-sm text-muted-foreground">Restrição +18 anos</p>
                  </div>
                  <Badge variant="secondary">✓ Implementado</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Relatórios de Compliance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Exporte relatórios detalhados para auditoria e conformidade legal
              </p>
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
