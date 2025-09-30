import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Gift, Star, Crown, Zap, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  target: number;
  current: number;
  reward: {
    coins: number;
    xp: number;
    items?: string[];
  };
  icon: React.ReactNode;
  completed: boolean;
  claimed: boolean;
}

interface MissionsSystemProps {
  totalSpins: number;
  totalCoinsEarned: number;
  dailyStreak: number;
  level: number;
  onClaimReward: (coins: number, xp: number) => void;
}

export const MissionsSystem: React.FC<MissionsSystemProps> = ({
  totalSpins,
  totalCoinsEarned,
  dailyStreak,
  level,
  onClaimReward
}) => {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    // Initialize missions
    const initialMissions: Mission[] = [
      // Daily Missions
      {
        id: 'daily-spins',
        title: 'Girador Diário',
        description: 'Faça 10 giros hoje',
        type: 'daily',
        target: 10,
        current: Math.min(totalSpins % 50, 10), // Reset daily
        reward: { coins: 1000, xp: 100 },
        icon: <Zap className="w-4 h-4" />,
        completed: false,
        claimed: false
      },
      {
        id: 'daily-coins',
        title: 'Caçador de Moedas',
        description: 'Ganhe 5.000 moedas hoje',
        type: 'daily',
        target: 5000,
        current: Math.min(totalCoinsEarned % 10000, 5000),
        reward: { coins: 2000, xp: 150 },
        icon: <Coins className="w-4 h-4" />,
        completed: false,
        claimed: false
      },
      {
        id: 'daily-streak',
        title: 'Sequência de Sorte',
        description: 'Mantenha uma sequência de 3 dias',
        type: 'daily',
        target: 3,
        current: dailyStreak,
        reward: { coins: 3000, xp: 200, items: ['lucky-charm'] },
        icon: <Star className="w-4 h-4" />,
        completed: false,
        claimed: false
      },
      // Weekly Missions
      {
        id: 'weekly-master',
        title: 'Mestre dos Slots',
        description: 'Faça 100 giros esta semana',
        type: 'weekly',
        target: 100,
        current: totalSpins % 200,
        reward: { coins: 10000, xp: 500 },
        icon: <Crown className="w-4 h-4" />,
        completed: false,
        claimed: false
      },
      {
        id: 'weekly-fortune',
        title: 'Fortuna Semanal',
        description: 'Ganhe 50.000 moedas esta semana',
        type: 'weekly',
        target: 50000,
        current: totalCoinsEarned % 100000,
        reward: { coins: 20000, xp: 750, items: ['golden-ticket'] },
        icon: <Gift className="w-4 h-4" />,
        completed: false,
        claimed: false
      },
      // Achievement Missions
      {
        id: 'achievement-level',
        title: 'Escalando o Sucesso',
        description: 'Alcance o nível 10',
        type: 'achievement',
        target: 10,
        current: level,
        reward: { coins: 50000, xp: 1000, items: ['vip-pass'] },
        icon: <Target className="w-4 h-4" />,
        completed: false,
        claimed: false
      }
    ];

    // Update completion status
    const updatedMissions = initialMissions.map(mission => ({
      ...mission,
      completed: mission.current >= mission.target,
      current: Math.min(mission.current, mission.target)
    }));

    setMissions(updatedMissions);
  }, [totalSpins, totalCoinsEarned, dailyStreak, level]);

  const claimMission = (missionId: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId && mission.completed && !mission.claimed) {
        onClaimReward(mission.reward.coins, mission.reward.xp);
        
        toast.success(
          `🎯 Missão Concluída! +${mission.reward.coins} moedas +${mission.reward.xp} XP`,
          {
            duration: 3000,
            style: {
              background: 'hsl(var(--fortune-gold))',
              color: 'hsl(var(--fortune-dark))',
            }
          }
        );

        if (mission.reward.items) {
          toast.success(
            `🎁 Item especial desbloqueado: ${mission.reward.items.join(', ')}`,
            { duration: 4000 }
          );
        }

        return { ...mission, claimed: true };
      }
      return mission;
    }));
  };

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const achievementMissions = missions.filter(m => m.type === 'achievement');

  const renderMissionCard = (mission: Mission) => (
    <Card key={mission.id} className="p-4 bg-card/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-primary">{mission.icon}</div>
          <div>
            <h4 className="font-bold text-primary">{mission.title}</h4>
            <p className="text-sm text-muted-foreground">{mission.description}</p>
          </div>
        </div>
        <Badge 
          variant={mission.completed ? (mission.claimed ? "secondary" : "default") : "outline"}
          className={mission.completed && !mission.claimed ? "animate-pulse" : ""}
        >
          {mission.claimed ? "Reivindicado" : mission.completed ? "Completo" : "Em Progresso"}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span>{mission.current}/{mission.target}</span>
          </div>
          <Progress 
            value={(mission.current / mission.target) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-fortune-gold">
              <Coins className="w-4 h-4" />
              <span>{mission.reward.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-primary">
              <Star className="w-4 h-4" />
              <span>{mission.reward.xp} XP</span>
            </div>
            {mission.reward.items && (
              <div className="flex items-center space-x-1 text-secondary">
                <Gift className="w-4 h-4" />
                <span>{mission.reward.items.length} item(s)</span>
              </div>
            )}
          </div>
          
          {mission.completed && !mission.claimed && (
            <Button
              onClick={() => claimMission(mission.id)}
              className="bg-gradient-gold hover:scale-105 text-fortune-dark"
              size="sm"
            >
              Reivindicar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Centro de Missões
        </h2>
        <p className="text-lg text-muted-foreground">Complete missões e ganhe recompensas incríveis!</p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="daily" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Diárias</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Semanais</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Conquistas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4">
            {dailyMissions.map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4">
            {weeklyMissions.map(renderMissionCard)}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievementMissions.map(renderMissionCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};