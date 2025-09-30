/**
 * Responsible Gaming Page
 * Central hub for responsible gaming information and controls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Brain,
  Phone,
  ExternalLink,
  Settings,
  BarChart3,
  PauseCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { responsibleGaming, ResponsibleGamingState } from '@/systems/ResponsibleGamingSystem';

const ResponsibleGaming: React.FC = () => {
  const navigate = useNavigate();
  const [rgState, setRgState] = useState<ResponsibleGamingState | null>(null);

  useEffect(() => {
    const state = responsibleGaming.getState();
    setRgState(state);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSessionStatus = () => {
    if (!rgState) return { color: 'green', message: 'Carregando...' };
    
    if (rgState.continuousPlayTime >= 120) {
      return { color: 'red', message: 'Tempo limite atingido' };
    } else if (rgState.continuousPlayTime >= 90) {
      return { color: 'orange', message: 'Considere uma pausa' };
    } else if (rgState.continuousPlayTime >= 60) {
      return { color: 'yellow', message: 'Tempo moderado' };
    } else {
      return { color: 'green', message: 'Tempo saudável' };
    }
  };

  const helpResources = [
    {
      title: 'Centro de Valorização da Vida (CVV)',
      description: 'Apoio emocional e prevenção do suicídio',
      phone: '188',
      website: 'https://www.cvv.org.br',
      available: '24h'
    },
    {
      title: 'CAPS - Centro de Atenção Psicossocial',
      description: 'Atendimento público para saúde mental',
      phone: '136',
      website: 'https://www.gov.br/saude',
      available: 'Horário comercial'
    },
    {
      title: 'Narcóticos Anônimos',
      description: 'Grupo de apoio para dependências',
      phone: '(11) 3229-2377',
      website: 'https://www.na.org.br',
      available: 'Reuniões regulares'
    }
  ];

  const status = getSessionStatus();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Jogo Responsável</h1>
              <p className="text-muted-foreground">Sua saúde e bem-estar em primeiro lugar</p>
            </div>
          </div>
        </motion.div>

        {/* Current Session Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Status da Sessão Atual
            </h2>
            
            {rgState && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tempo de jogo contínuo:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {formatTime(rgState.continuousPlayTime)}
                    </span>
                    <Badge 
                      variant={status.color === 'red' ? 'destructive' : 'outline'}
                      className={
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        status.color === 'green' ? 'bg-green-100 text-green-800' : ''
                      }
                    >
                      {status.message}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso até próximo alerta</span>
                    <span>{Math.min(rgState.continuousPlayTime, 120)}/120 min</span>
                  </div>
                  <Progress 
                    value={(rgState.continuousPlayTime / 120) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{rgState.dailySpinCount}</p>
                    <p className="text-xs text-muted-foreground">Spins hoje</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {formatTime(rgState.totalSessionTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">Tempo total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-fortune-gold">
                      {rgState.dailyCoinsSpent.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Moedas gastas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{rgState.warningLevel}</p>
                    <p className="text-xs text-muted-foreground">Alertas hoje</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Button
            onClick={() => responsibleGaming.takeMandatoryBreak()}
            variant="outline"
            className="h-16 flex-col space-y-1"
          >
            <PauseCircle className="w-6 h-6" />
            <span className="text-sm">Fazer Pausa (15min)</span>
          </Button>
          
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            className="h-16 flex-col space-y-1"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm">Configurar Limites</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/analytics')}
            variant="outline"
            className="h-16 flex-col space-y-1"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm">Ver Estatísticas</span>
          </Button>
        </motion.div>

        {/* Education Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Entenda o Jogo Recreativo
            </h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">O que são moedas virtuais?</h3>
                <p className="text-blue-700">
                  As moedas virtuais no Zodiac Fortune são apenas números no jogo, sem qualquer 
                  valor no mundo real. Elas não podem ser trocadas por dinheiro, produtos ou 
                  serviços. São como pontos em um videogame.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Por que é diferente de apostas reais?</h3>
                <p className="text-green-700">
                  Em apostas reais você pode perder seu próprio dinheiro. Aqui, você nunca 
                  perde nada real - apenas moedas virtuais que são repostas gratuitamente 
                  todos os dias através de bônus.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Mesmo assim, por que controlar o tempo?</h3>
                <p className="text-purple-700">
                  Qualquer atividade em excesso pode se tornar prejudicial. Jogos, mesmo 
                  recreativos, podem interferir no trabalho, estudos, relacionamentos e sono 
                  se usados sem moderação.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Sinais de Alerta
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground mb-3">
                Fique atento aos seguintes sinais que podem indicar uso excessivo:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Pensar no jogo constantemente</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Negligenciar responsabilidades</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Jogar para fugir de problemas</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Irritabilidade ao ser interrompido</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Perder a noção do tempo jogando</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Preferir jogar a socializar</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Help Resources */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Precisa de Ajuda?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Se você ou alguém que conhece está tendo dificuldades para controlar o uso 
              de jogos ou está enfrentando problemas emocionais, procure ajuda profissional:
            </p>
            
            <div className="space-y-4">
              {helpResources.map((resource, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <Badge variant="outline">{resource.available}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-medium">{resource.phone}</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => window.open(resource.website, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Acessar site
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-destructive mb-1">Emergência</h4>
                  <p className="text-destructive/80">
                    Se você está em crise ou pensando em se machucar, ligue imediatamente 
                    para o <strong>CVV - 188</strong> (gratuito e confidencial) ou procure 
                    o hospital mais próximo.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ResponsibleGaming;