import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Crown, Star, Users, Coins, Zap, Target } from 'lucide-react';

interface LeaderboardPlayer {
  id: string;
  name: string;
  level: number;
  totalCoins: number;
  totalSpins: number;
  referrals: number;
  weeklySpins: number;
  position: number;
  isCurrentPlayer?: boolean;
}

interface LeaderboardProps {
  currentPlayer: {
    name: string;
    level: number;
    totalCoins: number;
    totalSpins: number;
    referrals: number;
    weeklySpins: number;
  };
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentPlayer }) => {
  // Mock data - in a real app this would come from a backend
  const [allTimeLeaders] = useState<LeaderboardPlayer[]>([
    { id: '1', name: 'DragonMaster', level: 25, totalCoins: 150000, totalSpins: 2500, referrals: 45, weeklySpins: 120, position: 1 },
    { id: '2', name: 'LuckySpinner', level: 22, totalCoins: 135000, totalSpins: 2200, referrals: 38, weeklySpins: 95, position: 2 },
    { id: '3', name: 'GoldHunter', level: 20, totalCoins: 120000, totalSpins: 2000, referrals: 35, weeklySpins: 88, position: 3 },
    { id: '4', name: 'FortuneKing', level: 18, totalCoins: 98000, totalSpins: 1800, referrals: 29, weeklySpins: 75, position: 4 },
    { id: '5', name: 'SpinLegend', level: 16, totalCoins: 85000, totalSpins: 1600, referrals: 25, weeklySpins: 65, position: 5 },
    { id: 'current', name: currentPlayer.name, level: currentPlayer.level, totalCoins: currentPlayer.totalCoins, totalSpins: currentPlayer.totalSpins, referrals: currentPlayer.referrals, weeklySpins: currentPlayer.weeklySpins, position: 12, isCurrentPlayer: true },
  ]);

  const [weeklyLeaders] = useState<LeaderboardPlayer[]>([
    { id: '1', name: 'WeekWarrior', level: 15, totalCoins: 45000, totalSpins: 800, referrals: 15, weeklySpins: 150, position: 1 },
    { id: '2', name: 'SpeedSpinner', level: 12, totalCoins: 38000, totalSpins: 650, referrals: 12, weeklySpins: 135, position: 2 },
    { id: '3', name: 'QuickLuck', level: 14, totalCoins: 42000, totalSpins: 720, referrals: 18, weeklySpins: 125, position: 3 },
    { id: 'current', name: currentPlayer.name, level: currentPlayer.level, totalCoins: currentPlayer.totalCoins, totalSpins: currentPlayer.totalSpins, referrals: currentPlayer.referrals, weeklySpins: currentPlayer.weeklySpins, position: 8, isCurrentPlayer: true },
  ]);

  const [referralLeaders] = useState<LeaderboardPlayer[]>([
    { id: '1', name: 'ReferralKing', level: 20, totalCoins: 95000, totalSpins: 1500, referrals: 78, weeklySpins: 85, position: 1 },
    { id: '2', name: 'FriendMaster', level: 18, totalCoins: 82000, totalSpins: 1300, referrals: 65, weeklySpins: 70, position: 2 },
    { id: '3', name: 'SocialSpin', level: 16, totalCoins: 75000, totalSpins: 1200, referrals: 58, weeklySpins: 60, position: 3 },
    { id: 'current', name: currentPlayer.name, level: currentPlayer.level, totalCoins: currentPlayer.totalCoins, totalSpins: currentPlayer.totalSpins, referrals: currentPlayer.referrals, weeklySpins: currentPlayer.weeklySpins, position: 15, isCurrentPlayer: true },
  ]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-fortune-gold" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{position}</div>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/50';
      case 2:
        return 'bg-gradient-to-r from-gray-200/20 to-gray-300/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-200/20 to-amber-300/20 border-amber-600/50';
      default:
        return 'bg-card/50 border-border/50';
    }
  };

  const renderLeaderboard = (leaders: LeaderboardPlayer[], metric: 'coins' | 'spins' | 'referrals') => {
    const getMetricValue = (player: LeaderboardPlayer) => {
      switch (metric) {
        case 'coins':
          return player.totalCoins.toLocaleString();
        case 'spins':
          return metric === 'spins' ? player.weeklySpins : player.totalSpins;
        case 'referrals':
          return player.referrals;
        default:
          return player.totalCoins.toLocaleString();
      }
    };

    const getMetricIcon = () => {
      switch (metric) {
        case 'coins':
          return <Coins className="w-4 h-4" />;
        case 'spins':
          return <Zap className="w-4 h-4" />;
        case 'referrals':
          return <Users className="w-4 h-4" />;
        default:
          return <Coins className="w-4 h-4" />;
      }
    };

    return (
      <div className="space-y-3">
        {leaders.slice(0, 10).map((player) => (
          <Card 
            key={player.id} 
            className={`p-4 border-2 ${getPositionBg(player.position)} ${
              player.isCurrentPlayer ? 'ring-2 ring-primary animate-glow-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getPositionIcon(player.position)}
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-bold ${player.isCurrentPlayer ? 'text-primary' : 'text-foreground'}`}>
                      {player.name} {player.isCurrentPlayer && '(Você)'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        Nível {player.level}
                      </Badge>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getMetricIcon()}
                        <span>{getMetricValue(player)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">#{player.position}</p>
                {player.position <= 3 && (
                  <Badge className="text-xs bg-gradient-gold">
                    🏆 TOP 3
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Trophy className="w-8 h-8 text-fortune-gold" />
            <h2 className="text-2xl font-bold text-primary">Ranking Global</h2>
          </div>
          
          <p className="text-muted-foreground">
            Compete com jogadores do mundo todo e conquiste o topo!
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <p className="text-lg font-bold text-primary">#{allTimeLeaders.find(p => p.isCurrentPlayer)?.position}</p>
              <p className="text-xs text-muted-foreground">Posição Geral</p>
            </div>
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <p className="text-lg font-bold text-secondary">#{weeklyLeaders.find(p => p.isCurrentPlayer)?.position}</p>
              <p className="text-xs text-muted-foreground">Esta Semana</p>
            </div>
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <p className="text-lg font-bold text-accent">#{referralLeaders.find(p => p.isCurrentPlayer)?.position}</p>
              <p className="text-xs text-muted-foreground">Indicações</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all-time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-time" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Semanal</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Indicações</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-time" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">Ranking por Moedas Totais</h3>
            <Badge variant="outline">
              <Coins className="w-3 h-3 mr-1" />
              Moedas
            </Badge>
          </div>
          {renderLeaderboard(allTimeLeaders, 'coins')}
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-secondary">Ranking Semanal de Giros</h3>
            <Badge variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              Giros
            </Badge>
          </div>
          {renderLeaderboard(weeklyLeaders, 'spins')}
        </TabsContent>
        
        <TabsContent value="referrals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-accent">Ranking de Indicações</h3>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Indicações
            </Badge>
          </div>
          {renderLeaderboard(referralLeaders, 'referrals')}
        </TabsContent>
      </Tabs>
    </div>
  );
};