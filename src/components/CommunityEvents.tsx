import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Gift, 
  Clock, 
  Star, 
  Zap,
  Crown,
  Medal,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  prizes: Array<{
    position: number;
    reward: number;
    badge?: string;
  }>;
  currentLeader: {
    name: string;
    score: number;
  };
  playerPosition?: number;
  playerScore?: number;
  isActive: boolean;
  entryFee?: number;
}

interface CommunityGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  endDate: Date;
  type: 'spins' | 'coins' | 'wins';
  isCompleted: boolean;
}

interface CommunityEventsProps {
  playerLevel: number;
  playerCoins: number;
  onJoinTournament: (tournamentId: string, entryFee: number) => void;
  onClaimGoalReward: (goalId: string, reward: number) => void;
}

export const CommunityEvents: React.FC<CommunityEventsProps> = ({
  playerLevel,
  playerCoins,
  onJoinTournament,
  onClaimGoalReward
}) => {
  const { formatCurrency, formatNumber, getCurrentTime, getExpression, symbols } = useLocalization();
  const [selectedTab, setSelectedTab] = useState('tournaments');

  // Mock data - em produção viria do backend
  const [tournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Torneio do Dragão Dourado',
      description: 'Competição semanal para ver quem consegue a maior vitória única!',
      type: 'weekly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      participants: 1247,
      maxParticipants: 2000,
      prizes: [
        { position: 1, reward: 50000, badge: '🏆 Campeão Dragão' },
        { position: 2, reward: 25000, badge: '🥈 Vice-Campeão' },
        { position: 3, reward: 15000, badge: '🥉 3º Lugar' },
        { position: 10, reward: 5000 }
      ],
      currentLeader: { name: 'DragonMaster', score: 89500 },
      playerPosition: 45,
      playerScore: 12350,
      isActive: true,
      entryFee: 1000
    },
    {
      id: '2',
      name: 'Maratona de Spins',
      description: 'Quem conseguir mais giros válidos em 3 dias ganha!',
      type: 'special',
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-01-08'),
      participants: 892,
      maxParticipants: 1500,
      prizes: [
        { position: 1, reward: 30000, badge: '⚡ Velocista' },
        { position: 2, reward: 15000 },
        { position: 3, reward: 10000 },
        { position: 25, reward: 2000 }
      ],
      currentLeader: { name: 'SpeedSpinner', score: 2845 },
      playerPosition: 12,
      playerScore: 1243,
      isActive: true,
      entryFee: 500
    },
    {
      id: '3',
      name: 'Copa das Lendas',
      description: 'Torneio mensal exclusivo para jogadores nível 15+',
      type: 'monthly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      participants: 234,
      maxParticipants: 500,
      prizes: [
        { position: 1, reward: 100000, badge: '👑 Lenda Suprema' },
        { position: 2, reward: 50000, badge: '💎 Lenda Dourada' },
        { position: 3, reward: 25000, badge: '⭐ Lenda Ascendente' }
      ],
      currentLeader: { name: 'LegendKing', score: 156780 },
      isActive: true,
      entryFee: 2500
    }
  ]);

  const [communityGoals] = useState<CommunityGoal[]>([
    {
      id: '1',
      title: 'Meta Global de Spins',
      description: 'A comunidade deve realizar 1 milhão de spins esta semana!',
      target: 1000000,
      current: 756432,
      reward: 5000,
      endDate: new Date('2024-01-07'),
      type: 'spins',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Fortuna Coletiva',
      description: 'Vamos juntos acumular 100 milhões de moedas!',
      target: 100000000,
      current: 87654321,
      reward: 10000,
      endDate: new Date('2024-01-15'),
      type: 'coins',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Recordes de Vitória',
      description: 'Meta: 50.000 vitórias com multiplicador 10x ou mais!',
      target: 50000,
      current: 42150,
      reward: 7500,
      endDate: new Date('2024-01-10'),
      type: 'wins',
      isCompleted: false
    }
  ]);

  const getTimeRemaining = (endDate: Date) => {
    const now = getCurrentTime();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h restantes`;
    }
    return `${hours}h restantes`;
  };

  const canJoinTournament = (tournament: Tournament) => {
    return tournament.isActive && 
           tournament.participants < tournament.maxParticipants &&
           playerCoins >= (tournament.entryFee || 0) &&
           (tournament.type !== 'monthly' || playerLevel >= 15);
  };

  const getTournamentIcon = (type: Tournament['type']) => {
    switch (type) {
      case 'weekly': return <Calendar className="w-4 h-4" />;
      case 'monthly': return <Crown className="w-4 h-4" />;
      case 'special': return <Sparkles className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getGoalIcon = (type: CommunityGoal['type']) => {
    switch (type) {
      case 'spins': return <Zap className="w-4 h-4" />;
      case 'coins': return <Star className="w-4 h-4" />;
      case 'wins': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-8 h-8 text-fortune-gold" />
            <h2 className="text-2xl font-bold text-primary">Eventos da Comunidade</h2>
          </div>
          
          <p className="text-muted-foreground">
            Participe de torneios épicos e metas coletivas para ganhar prêmios incríveis!
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <p className="text-lg font-bold text-primary">{tournaments.filter(t => t.isActive).length}</p>
              <p className="text-xs text-muted-foreground">Torneios Ativos</p>
            </div>
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <p className="text-lg font-bold text-secondary">{communityGoals.filter(g => !g.isCompleted).length}</p>
              <p className="text-xs text-muted-foreground">Metas Ativas</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tournaments" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Torneios</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Metas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-4">
          {tournaments.map((tournament) => (
            <Card 
              key={tournament.id} 
              className={`p-6 ${tournament.isActive 
                ? 'bg-gradient-to-br from-fortune-gold/10 to-fortune-ember/10 border-fortune-gold/30' 
                : 'bg-card/50 border-border/50 opacity-60'}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getTournamentIcon(tournament.type)}
                      <h3 className="text-lg font-bold text-primary">{tournament.name}</h3>
                      <Badge 
                        variant={tournament.isActive ? "default" : "secondary"}
                        className={tournament.isActive ? "bg-fortune-gold/20 text-fortune-gold" : ""}
                      >
                        {tournament.isActive ? 'Ativo' : 'Finalizado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tournament.description}</p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeRemaining(tournament.endDate)}
                    </p>
                    {tournament.entryFee && (
                      <Badge variant="outline" className="text-xs">
                        Taxa: {formatCurrency(tournament.entryFee)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Participantes:</span>
                      <span className="font-medium">{formatNumber(tournament.participants)}/{formatNumber(tournament.maxParticipants)}</span>
                    </div>
                    <Progress 
                      value={(tournament.participants / tournament.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Líder:</span>
                      <span className="font-medium">{tournament.currentLeader.name}</span>
                    </div>
                    <div className="text-xs text-fortune-gold font-bold">
                      {formatCurrency(tournament.currentLeader.score)}
                    </div>
                  </div>
                </div>

                {tournament.playerPosition && (
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">Sua Posição: #{tournament.playerPosition}</p>
                        <p className="text-xs text-muted-foreground">Pontuação: {formatCurrency(tournament.playerScore || 0)}</p>
                      </div>
                      <Medal className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-secondary">Prêmios:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tournament.prizes.slice(0, 4).map((prize) => (
                      <div key={prize.position} className="text-xs bg-card/50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">#{prize.position}</span>
                          <span className="text-fortune-gold font-bold">{formatCurrency(prize.reward)}</span>
                        </div>
                        {prize.badge && (
                          <div className="text-xs text-muted-foreground mt-1">{prize.badge}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {tournament.isActive && (
                  <div className="flex space-x-2">
                    {canJoinTournament(tournament) ? (
                      <Button
                        onClick={() => onJoinTournament(tournament.id, tournament.entryFee || 0)}
                        className="flex-1 bg-gradient-gold hover:scale-105 transform transition-all"
                        disabled={tournament.playerPosition !== undefined}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {tournament.playerPosition ? 'Participando' : 'Entrar no Torneio'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="flex-1 opacity-60"
                      >
                        {playerCoins < (tournament.entryFee || 0) ? 'Moedas Insuficientes' : 
                         playerLevel < 15 && tournament.type === 'monthly' ? 'Nível Baixo' :
                         'Torneio Lotado'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {communityGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className={`p-6 ${goal.isCompleted 
                ? 'bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/50' 
                : 'bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30'}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getGoalIcon(goal.type)}
                      <h3 className="text-lg font-bold text-primary">{goal.title}</h3>
                      <Badge 
                        variant={goal.isCompleted ? "default" : "secondary"}
                        className={goal.isCompleted ? "bg-fortune-gold/20 text-fortune-gold" : ""}
                      >
                        {goal.isCompleted ? 'Completa' : 'Em Progresso'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeRemaining(goal.endDate)}
                    </p>
                    <Badge className="bg-fortune-gold/20 text-fortune-gold">
                      <Gift className="w-3 h-3 mr-1" />
                      {formatCurrency(goal.reward)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso:</span>
                    <span className="font-medium">{formatNumber(goal.current)}/{formatNumber(goal.target)}</span>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="h-3"
                  />
                  <div className="text-xs text-center text-secondary font-medium">
                    {Math.round((goal.current / goal.target) * 100)}% completo
                  </div>
                </div>

                {goal.isCompleted && (
                  <Button
                    onClick={() => onClaimGoalReward(goal.id, goal.reward)}
                    className="w-full bg-gradient-gold hover:scale-105 transform transition-all"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Resgatar Recompensa: {formatCurrency(goal.reward)}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};