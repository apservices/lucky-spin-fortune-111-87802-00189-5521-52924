import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, Star, Gift, Crown, Gem } from 'lucide-react';
import { toast } from 'sonner';
import dragonWheel from '@/assets/dragon-wheel.jpg';
import goldCoin from '@/assets/gold-coin.jpg';

interface Prize {
  id: number;
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  probability: number;
}

const prizes: Prize[] = [
  { id: 1, label: '50 Moedas', value: 50, color: 'fortune-gold', icon: <Coins className="w-4 h-4" />, probability: 20 },
  { id: 2, label: '100 Moedas', value: 100, color: 'primary', icon: <Star className="w-4 h-4" />, probability: 18 },
  { id: 3, label: '200 Moedas', value: 200, color: 'fortune-ember', icon: <Gift className="w-4 h-4" />, probability: 15 },
  { id: 4, label: '500 Moedas', value: 500, color: 'secondary', icon: <Crown className="w-4 h-4" />, probability: 12 },
  { id: 5, label: '25 Moedas', value: 25, color: 'fortune-gold', icon: <Coins className="w-4 h-4" />, probability: 22 },
  { id: 6, label: '1000 Moedas', value: 1000, color: 'primary', icon: <Gem className="w-4 h-4" />, probability: 3 },
  { id: 7, label: '75 Moedas', value: 75, color: 'fortune-ember', icon: <Star className="w-4 h-4" />, probability: 18 },
  { id: 8, label: '300 Moedas', value: 300, color: 'secondary', icon: <Gift className="w-4 h-4" />, probability: 8 },
  { id: 9, label: '150 Moedas', value: 150, color: 'accent', icon: <Zap className="w-4 h-4" />, probability: 12 },
  { id: 10, label: '2000 Moedas', value: 2000, color: 'fortune-gold', icon: <Crown className="w-4 h-4" />, probability: 2 },
  { id: 11, label: '80 Moedas', value: 80, color: 'primary', icon: <Star className="w-4 h-4" />, probability: 15 },
  { id: 12, label: '400 Moedas', value: 400, color: 'fortune-ember', icon: <Gem className="w-4 h-4" />, probability: 5 },
];

interface WheelGameProps {
  coins: number;
  energy: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
}

export const WheelGame: React.FC<WheelGameProps> = ({ 
  coins, 
  energy, 
  onCoinsChange, 
  onEnergyChange 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const getRandomPrize = (): Prize => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const prize of prizes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }
    return prizes[0];
  };

  const spinWheel = () => {
    if (isSpinning || energy < 1) {
      if (energy < 1) {
        toast.error('Sem energia! Aguarde para girar novamente.');
      }
      return;
    }

    setIsSpinning(true);
    onEnergyChange(energy - 1);

    const selectedPrize = getRandomPrize();
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const degreePerPrize = 360 / prizes.length;
    const baseDegree = prizeIndex * degreePerPrize;
    const randomOffset = Math.random() * degreePerPrize;
    const finalRotation = 1440 + (360 - baseDegree - randomOffset); // 4 full spins + target

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onCoinsChange(coins + selectedPrize.value);
      toast.success(
        `🎉 Parabéns! Você ganhou ${selectedPrize.value} moedas!`,
        {
          duration: 3000,
          style: {
            background: 'hsl(var(--fortune-gold))',
            color: 'hsl(var(--fortune-dark))',
          }
        }
      );
    }, 3000);
  };

  const generateWheelSegments = () => {
    const degreePerPrize = 360 / prizes.length;
    
    return prizes.map((prize, index) => {
      const startAngle = index * degreePerPrize;
      const endAngle = (index + 1) * degreePerPrize;
      
      return (
        <div
          key={prize.id}
          className={`absolute inset-0 flex items-center justify-center`}
          style={{
            transform: `rotate(${startAngle + degreePerPrize / 2}deg)`,
            transformOrigin: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <div className={`text-${prize.color} animate-glow-pulse`}>
              {prize.icon}
            </div>
            <span className="text-xs font-bold text-primary-foreground">
              {prize.value}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-6">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          <div
            ref={wheelRef}
            className={`relative w-full h-full rounded-full border-8 border-primary shadow-fortune overflow-hidden transition-transform duration-[3000ms] ease-out ${
              isSpinning ? 'animate-glow-pulse' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                ${prizes.map((_, index) => {
                  const startPercent = (index / prizes.length) * 100;
                  const endPercent = ((index + 1) / prizes.length) * 100;
                  const colors = ['hsl(var(--fortune-gold))', 'hsl(var(--secondary))', 'hsl(var(--fortune-ember))', 'hsl(var(--primary))'];
                  return `${colors[index % colors.length]} ${startPercent}%, ${colors[index % colors.length]} ${endPercent}%`;
                }).join(', ')}
              )`
            }}
          >
            {/* Dragon Background */}
            <div 
              className="absolute inset-4 rounded-full opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${dragonWheel})` }}
            />
            
            {/* Prize Segments */}
            {generateWheelSegments()}
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning || energy < 1}
        className={`w-32 h-32 rounded-full text-xl font-bold shadow-fortune transform transition-all duration-200 ${
          isSpinning 
            ? 'scale-95 opacity-75' 
            : energy > 0 
              ? 'hover:scale-105 animate-glow-pulse bg-gradient-gold' 
              : 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isSpinning ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground"></div>
            <span className="text-sm mt-2">Girando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Zap className="w-8 h-8 mb-1" />
            <span>GIRAR</span>
          </div>
        )}
      </Button>

      {/* Prize Legend */}
      <Card className="w-full max-w-md p-4 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-center mb-3 text-primary">Prêmios Disponíveis</h3>
        <div className="grid grid-cols-2 gap-2">
          {prizes.map((prize) => (
            <Badge
              key={prize.id}
              variant="outline"
              className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-transparent to-primary/10"
            >
              {prize.icon}
              <span className="text-xs">{prize.label}</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};