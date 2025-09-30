import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Zap, Trophy, Clock } from 'lucide-react';
import goldCoin from '@/assets/gold-coin.jpg';

interface GameStatsProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  maxExperience: number;
  dailySpins: number;
  maxDailySpins: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  coins,
  energy,
  maxEnergy,
  level,
  experience,
  maxExperience,
  dailySpins,
  maxDailySpins
}) => {
  const energyPercentage = (energy / maxEnergy) * 100;
  const experiencePercentage = (experience / maxExperience) * 100;
  const dailySpinsPercentage = (dailySpins / maxDailySpins) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {/* Coins */}
      <Card className="p-4 bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full bg-cover bg-center animate-bounce-coin"
              style={{ backgroundImage: `url(${goldCoin})` }}
            />
            <span className="text-sm font-medium text-fortune-gold">Moedas</span>
          </div>
          <Coins className="w-5 h-5 text-fortune-gold" />
        </div>
        <div className="text-2xl font-bold text-primary">{coins.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground mt-1">Saldo atual</div>
      </Card>

      {/* Energy */}
      <Card className="p-4 bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className={`w-5 h-5 ${energy > 0 ? 'text-secondary animate-glow-pulse' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium text-secondary">Energia</span>
          </div>
          <Badge variant={energy > 0 ? "default" : "secondary"} className="text-xs">
            {energy}/{maxEnergy}
          </Badge>
        </div>
        <Progress value={energyPercentage} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground">
          {energy > 0 ? 'Pronto para girar!' : 'Recarregando...'}
        </div>
      </Card>

      {/* Level & Experience */}
      <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Nível {level}</span>
          </div>
          <Badge variant="outline" className="text-xs border-primary/50">
            XP
          </Badge>
        </div>
        <Progress value={experiencePercentage} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground">
          {experience}/{maxExperience} XP
        </div>
      </Card>

      {/* Daily Spins */}
      <Card className="p-4 bg-gradient-to-br from-accent/20 to-fortune-ember/20 border-accent/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-accent">Giros Hoje</span>
          </div>
          <Badge variant={dailySpins < maxDailySpins ? "default" : "secondary"} className="text-xs">
            {dailySpins}/{maxDailySpins}
          </Badge>
        </div>
        <Progress value={dailySpinsPercentage} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground">
          {maxDailySpins - dailySpins} restantes
        </div>
      </Card>
    </div>
  );
};