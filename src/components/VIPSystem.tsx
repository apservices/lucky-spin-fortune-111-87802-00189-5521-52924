import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Star, Gem, Gift, Zap, Coins, Shield, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface VIPTier {
  level: number;
  name: string;
  color: string;
  pointsRequired: number;
  benefits: string[];
  dailyBonus: {
    coins: number;
    energy: number;
  };
  multipliers: {
    xp: number;
    coins: number;
  };
  icon: React.ReactNode;
}

interface VIPSystemProps {
  totalCoinsEarned: number;
  totalSpins: number;
  level: number;
  onClaimDailyVIP: (coins: number, energy: number) => void;
}

export const VIPSystem: React.FC<VIPSystemProps> = ({
  totalCoinsEarned,
  totalSpins,
  level,
  onClaimDailyVIP
}) => {
  const [vipPoints, setVipPoints] = useState(0);
  const [currentVIPTier, setCurrentVIPTier] = useState(0);
  const [lastDailyVIPClaim, setLastDailyVIPClaim] = useState<string>('');

  const vipTiers: VIPTier[] = [
    {
      level: 0,
      name: 'Novato',
      color: 'text-gray-400',
      pointsRequired: 0,
      benefits: ['Acesso básico aos jogos'],
      dailyBonus: { coins: 500, energy: 1 },
      multipliers: { xp: 1, coins: 1 },
      icon: <Star className="w-6 h-6" />
    },
    {
      level: 1,
      name: 'Bronze',
      color: 'text-amber-600',
      pointsRequired: 1000,
      benefits: ['Bônus diário melhorado', '+5% XP'],
      dailyBonus: { coins: 1000, energy: 2 },
      multipliers: { xp: 1.05, coins: 1 },
      icon: <Shield className="w-6 h-6" />
    },
    {
      level: 2,
      name: 'Prata',
      color: 'text-gray-300',
      pointsRequired: 5000,
      benefits: ['Bônus diário melhorado', '+10% XP', '+5% Moedas'],
      dailyBonus: { coins: 2500, energy: 3 },
      multipliers: { xp: 1.1, coins: 1.05 },
      icon: <Gem className="w-6 h-6" />
    },
    {
      level: 3,
      name: 'Ouro',
      color: 'text-yellow-400',
      pointsRequired: 15000,
      benefits: ['Bônus diário melhorado', '+15% XP', '+10% Moedas', 'Missões exclusivas'],
      dailyBonus: { coins: 5000, energy: 4 },
      multipliers: { xp: 1.15, coins: 1.1 },
      icon: <Crown className="w-6 h-6" />
    },
    {
      level: 4,
      name: 'Platina',
      color: 'text-blue-300',
      pointsRequired: 35000,
      benefits: ['Bônus diário melhorado', '+20% XP', '+15% Moedas', 'Suporte prioritário'],
      dailyBonus: { coins: 10000, energy: 5 },
      multipliers: { xp: 1.2, coins: 1.15 },
      icon: <Trophy className="w-6 h-6" />
    },
    {
      level: 5,
      name: 'Diamante',
      color: 'text-cyan-300',
      pointsRequired: 75000,
      benefits: ['Bônus diário premium', '+30% XP', '+25% Moedas', 'Eventos exclusivos'],
      dailyBonus: { coins: 20000, energy: 7 },
      multipliers: { xp: 1.3, coins: 1.25 },
      icon: <Gem className="w-6 h-6 text-cyan-300" />
    },
    {
      level: 6,
      name: 'Lendário',
      color: 'text-purple-400',
      pointsRequired: 150000,
      benefits: ['Bônus diário lendário', '+50% XP', '+40% Moedas', 'Acesso antecipado'],
      dailyBonus: { coins: 50000, energy: 10 },
      multipliers: { xp: 1.5, coins: 1.4 },
      icon: <Crown className="w-6 h-6 text-purple-400" />
    }
  ];

  useEffect(() => {
    // Calculate VIP points based on activity
    const points = Math.floor(totalCoinsEarned / 100) + (totalSpins * 10) + (level * 100);
    setVipPoints(points);

    // Determine current VIP tier
    let tier = 0;
    for (let i = vipTiers.length - 1; i >= 0; i--) {
      if (points >= vipTiers[i].pointsRequired) {
        tier = i;
        break;
      }
    }
    setCurrentVIPTier(tier);
  }, [totalCoinsEarned, totalSpins, level]);

  const canClaimDailyVIP = () => {
    const today = new Date().toDateString();
    return lastDailyVIPClaim !== today;
  };

  const claimDailyVIP = () => {
    if (!canClaimDailyVIP()) {
      toast.error('Você já reivindicou seu bônus VIP hoje!');
      return;
    }

    const currentTier = vipTiers[currentVIPTier];
    onClaimDailyVIP(currentTier.dailyBonus.coins, currentTier.dailyBonus.energy);
    setLastDailyVIPClaim(new Date().toDateString());

    toast.success(
      `👑 Bônus VIP ${currentTier.name} reivindicado! +${currentTier.dailyBonus.coins.toLocaleString()} moedas +${currentTier.dailyBonus.energy} energia`,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          color: '#8B4513',
        }
      }
    );
  };

  const getProgressToNextTier = () => {
    if (currentVIPTier >= vipTiers.length - 1) {
      return { current: vipPoints, required: vipTiers[currentVIPTier].pointsRequired, percentage: 100 };
    }

    const nextTier = vipTiers[currentVIPTier + 1];
    const currentTierPoints = vipTiers[currentVIPTier].pointsRequired;
    const pointsInCurrentTier = vipPoints - currentTierPoints;
    const pointsNeededForNext = nextTier.pointsRequired - currentTierPoints;
    const percentage = Math.min((pointsInCurrentTier / pointsNeededForNext) * 100, 100);

    return {
      current: pointsInCurrentTier,
      required: pointsNeededForNext,
      percentage
    };
  };

  const progress = getProgressToNextTier();
  const currentTier = vipTiers[currentVIPTier];
  const nextTier = currentVIPTier < vipTiers.length - 1 ? vipTiers[currentVIPTier + 1] : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Sistema VIP
        </h2>
        <p className="text-lg text-muted-foreground">Seja recompensado pela sua fidelidade!</p>
      </div>

      {/* Current VIP Status */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-fortune-gold">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`${currentTier.color}`}>
              {currentTier.icon}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${currentTier.color}`}>
                VIP {currentTier.name}
              </h3>
              <p className="text-muted-foreground">
                {vipPoints.toLocaleString()} Pontos VIP
              </p>
            </div>
          </div>
          
          {canClaimDailyVIP() && (
            <Button
              onClick={claimDailyVIP}
              className="bg-gradient-gold hover:scale-105 text-fortune-dark animate-pulse"
            >
              <Gift className="w-4 h-4 mr-2" />
              Bônus Diário VIP
            </Button>
          )}
        </div>

        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para {nextTier.name}</span>
              <span>{progress.current.toLocaleString()}/{progress.required.toLocaleString()}</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {(progress.required - progress.current).toLocaleString()} pontos para o próximo nível
            </p>
          </div>
        )}
      </Card>

      {/* Current Benefits */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-primary">Benefícios Atuais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-secondary">Bônus Diário</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-fortune-gold">
                <Coins className="w-4 h-4" />
                <span>{currentTier.dailyBonus.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-primary">
                <Zap className="w-4 h-4" />
                <span>{currentTier.dailyBonus.energy}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-secondary">Multiplicadores</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-blue-400">
                XP: +{((currentTier.multipliers.xp - 1) * 100).toFixed(0)}%
              </div>
              <div className="text-green-400">
                Moedas: +{((currentTier.multipliers.coins - 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-secondary mb-2">Benefícios Especiais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentTier.benefits.map((benefit, index) => (
              <Badge key={index} variant="outline" className="justify-start">
                ✓ {benefit}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* All VIP Tiers */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 text-primary">Todos os Níveis VIP</h3>
        <div className="space-y-4">
          {vipTiers.map((tier, index) => (
            <div 
              key={tier.level}
              className={`p-4 rounded-lg border transition-all ${
                index === currentVIPTier 
                  ? 'bg-primary/20 border-primary shadow-lg' 
                  : index < currentVIPTier
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-muted/50 border-muted opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={tier.color}>
                    {tier.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${tier.color}`}>
                      VIP {tier.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {tier.pointsRequired.toLocaleString()} pontos VIP
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-fortune-gold">
                      <Coins className="w-4 h-4" />
                      <span>{tier.dailyBonus.coins.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-primary">
                      <Zap className="w-4 h-4" />
                      <span>{tier.dailyBonus.energy}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    XP: +{((tier.multipliers.xp - 1) * 100).toFixed(0)}% | 
                    Moedas: +{((tier.multipliers.coins - 1) * 100).toFixed(0)}%
                  </div>
                </div>

                {index === currentVIPTier && (
                  <Badge className="bg-primary text-primary-foreground">
                    ATUAL
                  </Badge>
                )}
                {index < currentVIPTier && (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    DESBLOQUEADO
                  </Badge>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-1">
                {tier.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="text-xs text-muted-foreground">
                    • {benefit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* How to Earn VIP Points */}
      <Card className="p-6 mt-6 bg-card/50">
        <h3 className="text-lg font-bold mb-3 text-primary">Como Ganhar Pontos VIP</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-fortune-gold" />
            <span>1 ponto por 100 moedas ganhas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>10 pontos por giro</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-secondary" />
            <span>100 pontos por nível</span>
          </div>
        </div>
      </Card>
    </div>
  );
};