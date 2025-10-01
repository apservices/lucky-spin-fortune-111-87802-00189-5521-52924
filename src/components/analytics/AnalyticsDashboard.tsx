/**
 * Analytics Dashboard - Real-time monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';
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
    a.download = `logs_${Date.now()}.json`;
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
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">RTP Base</p>
            <p className="text-2xl font-bold text-primary">
              {(configSystem.getStatus().rtpBase * 100).toFixed(1)}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Spins/Min</p>
            <p className="text-2xl font-bold">{metrics?.spinsPerMinute.toFixed(1) || '0'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Alertas</p>
            <p className="text-2xl font-bold text-red-500">{alerts.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Sessão</p>
            <p className="text-2xl font-bold">{metrics?.sessionDuration.toFixed(0) || '0'}min</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alertas Recentes</h3>
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum alerta</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="p-3 bg-muted rounded flex items-center justify-between">
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
