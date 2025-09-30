import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Clock, Star, Zap, Crown, Gem, Calendar, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  endTime: Date;
  progress: number;
  maxProgress: number;
  rewards: { coins: number; energy: number; special?: string };
  active: boolean;
  type: 'daily' | 'weekly' | 'special';
}

interface Chest {
  id: string;
  name: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  rewards: { minCoins: number; maxCoins: number; bonusChance: number };
  unlockTime?: Date;
}

interface EventsAndChestsProps {
  coins: number;
  totalSpins: number;
  dailySpins: number;
  onSpendCoins: (amount: number) => void;
  onGainCoins: (amount: number) => void;
  onGainEnergy: (amount: number) => void;
}

export const EventsAndChests: React.FC<EventsAndChestsProps> = ({
  coins,
  totalSpins,
  dailySpins,
  onSpendCoins,
  onGainCoins,
  onGainEnergy
}) => {
  const [events, setEvents] = useState<GameEvent[]>([
    {
      id: 'daily-challenge',
      title: 'Desafio Diário',
      description: 'Complete 10 giros hoje',
      icon: <Calendar className="w-5 h-5" />,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: dailySpins,
      maxProgress: 10,
      rewards: { coins: 1000, energy: 3 },
      active: true,
      type: 'daily'
    },
    {
      id: 'spin-master',
      title: 'Mestre dos Giros',
      description: 'Alcance 500 giros totais',
      icon: <Trophy className="w-5 h-5" />,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: totalSpins,
      maxProgress: 500,
      rewards: { coins: 5000, energy: 10, special: 'Roleta Dourada' },
      active: true,
      type: 'weekly'
    },
    {
      id: 'weekend-bonanza',
      title: 'Bonanza de Fim de Semana',
      description: 'Prêmios dobrados até domingo!',
      icon: <Star className="w-5 h-5" />,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      progress: 1,
      maxProgress: 1,
      rewards: { coins: 0, energy: 0, special: 'Prêmios x2' },
      active: true,
      type: 'special'
    }
  ]);

  const [chests, setChests] = useState<Chest[]>([
    {
      id: 'common-chest',
      name: 'Baú Comum',
      icon: <Gift className="w-6 h-6" />,
      rarity: 'common',
      cost: 1000,
      rewards: { minCoins: 500, maxCoins: 1500, bonusChance: 10 }
    },
    {
      id: 'rare-chest',
      name: 'Baú Raro',
      icon: <Gem className="w-6 h-6" />,
      rarity: 'rare',
      cost: 2500,
      rewards: { minCoins: 1500, maxCoins: 4000, bonusChance: 25 }
    },
    {
      id: 'epic-chest',
      name: 'Baú Épico',
      icon: <Crown className="w-6 h-6" />,
      rarity: 'epic',
      cost: 5000,
      rewards: { minCoins: 3000, maxCoins: 8000, bonusChance: 40 }
    },
    {
      id: 'legendary-chest',
      name: 'Baú Lendário',
      icon: <Trophy className="w-6 h-6" />,
      rarity: 'legendary',
      cost: 10000,
      rewards: { minCoins: 8000, maxCoins: 20000, bonusChance: 60 },
      unlockTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-300 bg-gray-50';
      case 'rare': return 'text-blue-500 border-blue-300 bg-blue-50';
      case 'epic': return 'text-purple-500 border-purple-300 bg-purple-50';
      case 'legendary': return 'text-fortune-gold border-fortune-gold bg-fortune-gold/10';
      default: return 'text-gray-500 border-gray-300 bg-gray-50';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-primary border-primary bg-primary/10';
      case 'weekly': return 'text-secondary border-secondary bg-secondary/10';
      case 'special': return 'text-fortune-gold border-fortune-gold bg-fortune-gold/10';
      default: return 'text-primary border-primary bg-primary/10';
    }
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const claimEventReward = (event: GameEvent) => {
    if (event.progress >= event.maxProgress) {
      onGainCoins(event.rewards.coins);
      onGainEnergy(event.rewards.energy);
      
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, active: false } : e
      ));

      toast.success(
        `🎉 Evento completo! +${event.rewards.coins} moedas +${event.rewards.energy} energia`,
        {
          duration: 3000,
          style: {
            background: 'hsl(var(--fortune-gold))',
            color: 'hsl(var(--fortune-dark))',
          }
        }
      );
    }
  };

  const openChest = (chest: Chest) => {
    if (coins < chest.cost) {
      toast.error('Moedas insuficientes!');
      return;
    }

    if (chest.unlockTime && new Date() < chest.unlockTime) {
      toast.error('Baú ainda não disponível!');
      return;
    }

    onSpendCoins(chest.cost);
    
    // Calculate rewards
    const baseReward = Math.floor(
      Math.random() * (chest.rewards.maxCoins - chest.rewards.minCoins + 1)
    ) + chest.rewards.minCoins;
    
    const hasBonus = Math.random() * 100 < chest.rewards.bonusChance;
    const finalReward = hasBonus ? baseReward * 2 : baseReward;
    
    onGainCoins(finalReward);

    toast.success(
      `🎁 ${chest.name} aberto! +${finalReward} moedas ${hasBonus ? '(BÔNUS!)' : ''}`,
      {
        duration: 3000,
        style: {
          background: hasBonus ? 'hsl(var(--fortune-gold))' : 'hsl(var(--primary))',
          color: hasBonus ? 'hsl(var(--fortune-dark))' : 'hsl(var(--primary-foreground))',
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Eventos Ativos */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Eventos Ativos
        </h3>
        
        <div className="grid gap-4">
          {events.filter(e => e.active).map((event) => {
            const progress = Math.min((event.progress / event.maxProgress) * 100, 100);
            const isComplete = event.progress >= event.maxProgress;
            
            return (
              <Card key={event.id} className={`p-4 border-2 ${getEventTypeColor(event.type)}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${getEventTypeColor(event.type).split(' ')[0]}`}>
                        {event.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(event.endTime)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {event.type === 'daily' ? 'Diário' : 
                         event.type === 'weekly' ? 'Semanal' : 'Especial'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progresso: {event.progress}/{event.maxProgress}
                      </span>
                      <span className="text-primary font-medium">
                        {event.rewards.coins > 0 && `+${event.rewards.coins} moedas`}
                        {event.rewards.energy > 0 && ` +${event.rewards.energy} energia`}
                        {event.rewards.special && ` ${event.rewards.special}`}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {isComplete && (
                    <Button
                      onClick={() => claimEventReward(event)}
                      className="w-full bg-gradient-gold hover:scale-105"
                      size="sm"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Coletar Recompensa
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Baús Especiais */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center">
          <Gift className="w-5 h-5 mr-2" />
          Baús Especiais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chests.map((chest) => {
            const isAffordable = coins >= chest.cost;
            const isUnlocked = !chest.unlockTime || new Date() >= chest.unlockTime;
            
            return (
              <Card key={chest.id} className={`p-4 border-2 ${getRarityColor(chest.rarity)}`}>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full ${getRarityColor(chest.rarity)}`}>
                      {chest.icon}
                    </div>
                    <h4 className="font-bold text-primary mt-2">{chest.name}</h4>
                    <Badge className="mt-1" variant="outline">
                      {chest.rarity}
                    </Badge>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {chest.rewards.minCoins} - {chest.rewards.maxCoins} moedas
                    </p>
                    <p className="text-xs text-primary">
                      {chest.rewards.bonusChance}% chance de dobrar prêmio
                    </p>
                  </div>
                  
                  {!isUnlocked && chest.unlockTime && (
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Disponível em {formatTimeRemaining(chest.unlockTime)}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => openChest(chest)}
                    disabled={!isAffordable || !isUnlocked}
                    className={`w-full ${chest.rarity === 'legendary' ? 'bg-gradient-gold' : ''}`}
                    variant={isAffordable && isUnlocked ? 'default' : 'outline'}
                  >
                    {isAffordable && isUnlocked ? (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Abrir ({chest.cost} moedas)
                      </>
                    ) : !isUnlocked ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Bloqueado
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        {chest.cost} moedas
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};