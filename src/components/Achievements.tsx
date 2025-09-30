import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Gem, Zap, Gift, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed?: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsProps {
  totalSpins: number;
  level: number;
  totalCoins: number;
  dailyStreak: number;
  referrals: number;
  onClaimReward: (reward: number) => void;
}

export const Achievements: React.FC<AchievementsProps> = ({
  totalSpins,
  level,
  totalCoins,
  dailyStreak,
  referrals,
  onClaimReward
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-spin',
      title: 'Primeiro Giro',
      description: 'Gire a roleta pela primeira vez',
      icon: <Zap className="w-6 h-6" />,
      requirement: 1,
      current: totalSpins,
      reward: 100,
      completed: false,
      rarity: 'common'
    },
    {
      id: 'spin-master',
      title: 'Mestre dos Giros',
      description: 'Complete 100 giros',
      icon: <Target className="w-6 h-6" />,
      requirement: 100,
      current: totalSpins,
      reward: 1000,
      completed: false,
      rarity: 'rare'
    },
    {
      id: 'level-10',
      title: 'Veterano',
      description: 'Alcance o nível 10',
      icon: <Star className="w-6 h-6" />,
      requirement: 10,
      current: level,
      reward: 2000,
      completed: false,
      rarity: 'epic'
    },
    {
      id: 'coin-collector',
      title: 'Colecionador',
      description: 'Acumule 50.000 moedas',
      icon: <Gem className="w-6 h-6" />,
      requirement: 50000,
      current: totalCoins,
      reward: 5000,
      completed: false,
      rarity: 'legendary'
    },
    {
      id: 'daily-warrior',
      title: 'Guerreiro Diário',
      description: 'Entre 7 dias seguidos',
      icon: <Crown className="w-6 h-6" />,
      requirement: 7,
      current: dailyStreak,
      reward: 1500,
      completed: false,
      rarity: 'epic'
    },
    {
      id: 'referral-king',
      title: 'Rei das Indicações',
      description: 'Indique 10 amigos',
      icon: <Users className="w-6 h-6" />,
      requirement: 10,
      current: referrals,
      reward: 3000,
      completed: false,
      rarity: 'legendary'
    }
  ]);

  useEffect(() => {
    setAchievements(prev => prev.map(achievement => ({
      ...achievement,
      current: achievement.id === 'first-spin' || achievement.id === 'spin-master' ? totalSpins :
               achievement.id === 'level-10' ? level :
               achievement.id === 'coin-collector' ? totalCoins :
               achievement.id === 'daily-warrior' ? dailyStreak :
               achievement.id === 'referral-king' ? referrals : achievement.current,
      completed: achievement.id === 'first-spin' || achievement.id === 'spin-master' ? totalSpins >= achievement.requirement :
                 achievement.id === 'level-10' ? level >= achievement.requirement :
                 achievement.id === 'coin-collector' ? totalCoins >= achievement.requirement :
                 achievement.id === 'daily-warrior' ? dailyStreak >= achievement.requirement :
                 achievement.id === 'referral-king' ? referrals >= achievement.requirement : achievement.completed
    })));
  }, [totalSpins, level, totalCoins, dailyStreak, referrals]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-300';
      case 'rare': return 'text-blue-500 border-blue-300';
      case 'epic': return 'text-purple-500 border-purple-300';
      case 'legendary': return 'text-fortune-gold border-fortune-gold';
      default: return 'text-gray-500 border-gray-300';
    }
  };

  const claimReward = (achievement: Achievement) => {
    onClaimReward(achievement.reward);
    setAchievements(prev => prev.map(a => 
      a.id === achievement.id ? { ...a, claimed: true } : a
    ));
    toast.success(
      `🏆 Conquista desbloqueada! +${achievement.reward} moedas!`,
      {
        duration: 3000,
        style: {
          background: 'hsl(var(--fortune-gold))',
          color: 'hsl(var(--fortune-dark))',
        }
      }
    );
  };

  const completedAchievements = achievements.filter(a => a.completed && !a.claimed);
  const uncompletedAchievements = achievements.filter(a => !a.completed);

  return (
    <div className="space-y-6">
      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Conquistas Completas
          </h3>
          <div className="grid gap-3">
            {completedAchievements.map((achievement) => (
              <Card key={achievement.id} className={`p-4 border-2 ${getRarityColor(achievement.rarity)} bg-gradient-to-r from-fortune-gold/10 to-transparent animate-glow-pulse`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-fortune-gold">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge className="mt-1" variant="outline">
                        +{achievement.reward} moedas
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => claimReward(achievement)}
                    className="bg-gradient-gold hover:scale-105"
                    size="sm"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Coletar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uncompleted Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Conquistas em Progresso
        </h3>
        <div className="grid gap-3">
          {uncompletedAchievements.map((achievement) => {
            const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);
            
            return (
              <Card key={achievement.id} className={`p-4 border ${getRarityColor(achievement.rarity)} bg-card/50`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge className="text-xs" variant="outline">
                      {achievement.rarity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {achievement.current}/{achievement.requirement}
                      </span>
                      <span className="text-primary font-medium">
                        +{achievement.reward} moedas
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};