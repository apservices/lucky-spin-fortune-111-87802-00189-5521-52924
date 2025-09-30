import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Coins, Calendar, CheckCircle, Gift, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface DailyReward {
  day: number;
  coins: number;
  energy: number;
  bonus?: string;
  claimed: boolean;
  available: boolean;
}

interface DailyRewardsProps {
  currentDay: number;
  onClaimReward: (day: number, coins: number, energy: number) => void;
}

export const DailyRewards: React.FC<DailyRewardsProps> = ({ 
  currentDay, 
  onClaimReward 
}) => {
  const [open, setOpen] = useState(false);

  const dailyRewards: DailyReward[] = [
    { day: 1, coins: 100, energy: 2, claimed: currentDay > 1, available: currentDay === 1 },
    { day: 2, coins: 150, energy: 3, claimed: currentDay > 2, available: currentDay === 2 },
    { day: 3, coins: 200, energy: 3, bonus: "Sorte +10%", claimed: currentDay > 3, available: currentDay === 3 },
    { day: 4, coins: 300, energy: 4, claimed: currentDay > 4, available: currentDay === 4 },
    { day: 5, coins: 500, energy: 5, bonus: "Energia Extra", claimed: currentDay > 5, available: currentDay === 5 },
    { day: 6, coins: 750, energy: 6, claimed: currentDay > 6, available: currentDay === 6 },
    { day: 7, coins: 1000, energy: 10, bonus: "Mega Bônus!", claimed: currentDay > 7, available: currentDay === 7 },
  ];

  const handleClaimReward = (reward: DailyReward) => {
    if (!reward.available || reward.claimed) return;
    
    onClaimReward(reward.day, reward.coins, reward.energy);
    toast.success(
      `🎁 Recompensa do Dia ${reward.day} coletada! +${reward.coins} moedas, +${reward.energy} energia`,
      {
        duration: 3000,
        style: {
          background: 'hsl(var(--fortune-gold))',
          color: 'hsl(var(--fortune-dark))',
        }
      }
    );
    setOpen(false);
  };

  const getRewardIcon = (day: number) => {
    if (day === 7) return <Crown className="w-6 h-6 text-primary" />;
    if (day >= 5) return <Star className="w-5 h-5 text-secondary" />;
    return <Gift className="w-4 h-4 text-fortune-gold" />;
  };

  const getCardStyle = (reward: DailyReward) => {
    if (reward.claimed) return "bg-muted/30 border-muted opacity-60";
    if (reward.available) return "bg-gradient-to-br from-primary/20 to-secondary/20 border-primary animate-glow-pulse";
    return "bg-card/50 border-border";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Recompensas Diárias
          {currentDay <= 7 && (
            <Badge variant="secondary" className="ml-2 animate-bounce-coin">
              Dia {currentDay}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl bg-gradient-gold bg-clip-text text-transparent">
            🎁 Recompensas Diárias de Login
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Faça login todos os dias para receber recompensas incríveis!
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {dailyRewards.map((reward) => (
            <Card key={reward.day} className={`p-4 relative ${getCardStyle(reward)}`}>
              {reward.claimed && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  {getRewardIcon(reward.day)}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">Dia {reward.day}</h3>
                  {reward.day === 7 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Grande Prêmio!
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-4 h-4 text-fortune-gold" />
                    <span className="text-sm font-medium">{reward.coins} moedas</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium">{reward.energy} energia</span>
                  </div>
                  
                  {reward.bonus && (
                    <Badge variant="outline" className="text-xs bg-accent/10">
                      {reward.bonus}
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => handleClaimReward(reward)}
                  disabled={!reward.available || reward.claimed}
                  className={`w-full ${
                    reward.available && !reward.claimed 
                      ? 'bg-gradient-gold hover:scale-105 animate-glow-pulse' 
                      : ''
                  }`}
                  variant={reward.claimed ? "secondary" : "default"}
                >
                  {reward.claimed ? 'Coletado' : reward.available ? 'Coletar' : 'Bloqueado'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground p-4 border-t">
          <p>As recompensas resetam a cada ciclo de 7 dias. Não perca!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};