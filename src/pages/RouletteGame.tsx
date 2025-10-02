import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, TrendingUp, AlertCircle, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Bet {
  type: 'number' | 'color' | 'dozen' | 'column' | 'even-odd' | 'high-low';
  value: number | string;
  amount: number;
  payout: number;
}

const RouletteGame: React.FC = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('gameCoins');
    return saved ? parseInt(saved) : 100000;
  });
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('gameEnergy');
    return saved ? parseInt(saved) : 50;
  });
  
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [selectedChipValue, setSelectedChipValue] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Roulette numbers and colors (European Roulette - single zero)
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' },
    { number: 15, color: 'black' },
    { number: 19, color: 'red' },
    { number: 4, color: 'black' },
    { number: 21, color: 'red' },
    { number: 2, color: 'black' },
    { number: 25, color: 'red' },
    { number: 17, color: 'black' },
    { number: 34, color: 'red' },
    { number: 6, color: 'black' },
    { number: 27, color: 'red' },
    { number: 13, color: 'black' },
    { number: 36, color: 'red' },
    { number: 11, color: 'black' },
    { number: 30, color: 'red' },
    { number: 8, color: 'black' },
    { number: 23, color: 'red' },
    { number: 10, color: 'black' },
    { number: 5, color: 'red' },
    { number: 24, color: 'black' },
    { number: 16, color: 'red' },
    { number: 33, color: 'black' },
    { number: 1, color: 'red' },
    { number: 20, color: 'black' },
    { number: 14, color: 'red' },
    { number: 31, color: 'black' },
    { number: 9, color: 'red' },
    { number: 22, color: 'black' },
    { number: 18, color: 'red' },
    { number: 29, color: 'black' },
    { number: 7, color: 'red' },
    { number: 28, color: 'black' },
    { number: 12, color: 'red' },
    { number: 35, color: 'black' },
    { number: 3, color: 'red' },
    { number: 26, color: 'black' }
  ];

  useEffect(() => {
    localStorage.setItem('gameCoins', coins.toString());
    localStorage.setItem('gameEnergy', energy.toString());
  }, [coins, energy]);

  const getTotalBetAmount = () => {
    return currentBets.reduce((total, bet) => total + bet.amount, 0);
  };

  const placeBet = (betType: Bet['type'], value: number | string, payout: number) => {
    if (coins < selectedChipValue) {
      toast.error('🪙 Moedas insuficientes!');
      return;
    }

    const existingBetIndex = currentBets.findIndex(
      (bet) => bet.type === betType && bet.value === value
    );

    if (existingBetIndex !== -1) {
      const updatedBets = [...currentBets];
      updatedBets[existingBetIndex].amount += selectedChipValue;
      setCurrentBets(updatedBets);
    } else {
      setCurrentBets([
        ...currentBets,
        { type: betType, value, amount: selectedChipValue, payout }
      ]);
    }

    setCoins(coins - selectedChipValue);
    toast.success(`💰 Aposta de ${selectedChipValue} moedas realizada!`);
  };

  const clearBets = () => {
    const totalBets = getTotalBetAmount();
    setCoins(coins + totalBets);
    setCurrentBets([]);
    toast.info('🔄 Apostas limpas!');
  };

  const spinRoulette = () => {
    if (isSpinning) return;
    if (currentBets.length === 0) {
      toast.error('⚠️ Faça ao menos uma aposta antes de girar!');
      return;
    }
    if (energy < 1) {
      toast.error('⚡ Sem energia! Aguarde para jogar novamente.');
      return;
    }

    setIsSpinning(true);
    setEnergy(energy - 1);

    // Select winning number randomly
    const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
    const winner = rouletteNumbers[randomIndex];

    // Calculate rotation
    const degreePerNumber = 360 / rouletteNumbers.length;
    const targetRotation = 1440 + (randomIndex * degreePerNumber); // 4 full spins
    setRotation(targetRotation);

    setTimeout(() => {
      setWinningNumber(winner.number);
      calculateWinnings(winner);
      setIsSpinning(false);
    }, 4000);
  };

  const calculateWinnings = (winner: { number: number; color: string }) => {
    let totalWinnings = 0;
    const winningBets: string[] = [];

    currentBets.forEach((bet) => {
      let isWin = false;

      switch (bet.type) {
        case 'number':
          isWin = bet.value === winner.number;
          break;
        case 'color':
          isWin = bet.value === winner.color;
          break;
        case 'even-odd':
          if (winner.number === 0) break;
          isWin = bet.value === 'even' 
            ? winner.number % 2 === 0 
            : winner.number % 2 !== 0;
          break;
        case 'high-low':
          if (winner.number === 0) break;
          isWin = bet.value === 'high' 
            ? winner.number >= 19 
            : winner.number <= 18;
          break;
        case 'dozen':
          if (winner.number === 0) break;
          const dozen = Math.ceil(winner.number / 12);
          isWin = bet.value === dozen;
          break;
        case 'column':
          if (winner.number === 0) break;
          isWin = winner.number % 3 === (bet.value as number);
          break;
      }

      if (isWin) {
        const winAmount = bet.amount * bet.payout;
        totalWinnings += winAmount;
        winningBets.push(`${bet.type}: ${bet.value}`);
      }
    });

    if (totalWinnings > 0) {
      setCoins(coins + totalWinnings);
      toast.success(
        `🎉 VITÓRIA! Número ${winner.number} (${winner.color}). Você ganhou ${totalWinnings} moedas!`,
        {
          duration: 5000,
          style: {
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#1a1a1a',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      );
    } else {
      toast.error(
        `😔 Número ${winner.number} (${winner.color}). Tente novamente!`,
        { duration: 3000 }
      );
    }

    setCurrentBets([]);
  };

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    const numData = rouletteNumbers.find((n) => n.number === num);
    return numData?.color === 'red' ? 'bg-fortune-red' : 'bg-gray-900';
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate('/lobby')}
            variant="outline"
            className="border-primary/30"
          >
            ← Voltar ao Lobby
          </Button>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-fortune-gold/20 text-fortune-gold border-fortune-gold/30 px-4 py-2">
              <Coins className="w-4 h-4 mr-2" />
              {coins.toLocaleString()}
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              {energy}
            </Badge>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            🎰 Roleta Brasileira 🎰
          </h1>
          <p className="text-muted-foreground">Experimente a sorte na roleta premium!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Roulette Wheel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roulette Wheel */}
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border-primary/30 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6">
              {/* Winning Number Display */}
              {winningNumber !== null && (
                <div className="animate-scale-in">
                  <Badge 
                    className={`${getNumberColor(winningNumber)} text-white px-8 py-4 text-3xl font-bold animate-glow-pulse`}
                  >
                    {winningNumber}
                  </Badge>
                </div>
              )}

              {/* Wheel */}
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
                  <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-fortune-gold drop-shadow-2xl"></div>
                </div>

                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className={`relative w-full h-full rounded-full border-8 border-fortune-gold shadow-glow-gold transition-transform duration-[4000ms] ease-out ${
                    isSpinning ? 'animate-glow-pulse' : ''
                  }`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(
                      ${rouletteNumbers.map((num, index) => {
                        const startPercent = (index / rouletteNumbers.length) * 100;
                        const endPercent = ((index + 1) / rouletteNumbers.length) * 100;
                        const color = num.number === 0 
                          ? '#059669' 
                          : num.color === 'red' 
                            ? 'hsl(var(--fortune-red))' 
                            : '#1a1a1a';
                        return `${color} ${startPercent}%, ${color} ${endPercent}%`;
                      }).join(', ')}
                    )`
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-fortune-gold/30"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-fortune-gold/20 to-transparent"></div>
                </div>
              </div>

              {/* Spin Button */}
              <Button
                onClick={spinRoulette}
                disabled={isSpinning || energy < 1 || currentBets.length === 0}
                className={`w-40 h-40 rounded-full text-2xl font-bold shadow-fortune ${
                  isSpinning
                    ? 'scale-95 opacity-75'
                    : 'hover:scale-105 animate-glow-pulse bg-gradient-gold'
                }`}
              >
                {isSpinning ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-foreground mb-2"></div>
                    <span className="text-sm">Girando...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Crown className="w-12 h-12 mb-2" />
                    <span>GIRAR</span>
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Betting Grid */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Mesa de Apostas
            </h3>

            {/* Numbers Grid */}
            <div className="grid grid-cols-12 gap-1 mb-4">
              <button
                onClick={() => placeBet('number', 0, 35)}
                className="col-span-12 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-all hover:scale-105"
              >
                0
              </button>
              {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => placeBet('number', num, 35)}
                  className={`${getNumberColor(num)} hover:brightness-125 text-white font-bold py-3 rounded transition-all hover:scale-105`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Outside Bets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => placeBet('color', 'red', 2)}
                className="bg-fortune-red hover:brightness-110 text-white font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                Vermelho (2x)
              </button>
              <button
                onClick={() => placeBet('color', 'black', 2)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                Preto (2x)
              </button>
              <button
                onClick={() => placeBet('even-odd', 'even', 2)}
                className="bg-primary hover:brightness-110 text-primary-foreground font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                Par (2x)
              </button>
              <button
                onClick={() => placeBet('even-odd', 'odd', 2)}
                className="bg-secondary hover:brightness-110 text-secondary-foreground font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                Ímpar (2x)
              </button>
              <button
                onClick={() => placeBet('high-low', 'low', 2)}
                className="bg-accent hover:brightness-110 text-accent-foreground font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                1-18 (2x)
              </button>
              <button
                onClick={() => placeBet('high-low', 'high', 2)}
                className="bg-accent hover:brightness-110 text-accent-foreground font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                19-36 (2x)
              </button>
              <button
                onClick={() => placeBet('dozen', 1, 3)}
                className="bg-fortune-ember hover:brightness-110 text-white font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                1ª Dúzia (3x)
              </button>
              <button
                onClick={() => placeBet('dozen', 2, 3)}
                className="bg-fortune-ember hover:brightness-110 text-white font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                2ª Dúzia (3x)
              </button>
              <button
                onClick={() => placeBet('dozen', 3, 3)}
                className="bg-fortune-ember hover:brightness-110 text-white font-bold py-3 px-4 rounded transition-all hover:scale-105"
              >
                3ª Dúzia (3x)
              </button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Betting Info */}
        <div className="space-y-6">
          {/* Chip Selector */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/50 border-primary/30 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              Valor da Ficha
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 100, 250, 500, 1000].map((value) => (
                <button
                  key={value}
                  onClick={() => setSelectedChipValue(value)}
                  className={`py-3 px-2 rounded font-bold transition-all ${
                    selectedChipValue === value
                      ? 'bg-gradient-gold text-primary-foreground scale-105 shadow-glow-gold'
                      : 'bg-card hover:bg-muted border border-primary/20'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </Card>

          {/* Current Bets */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Apostas Atuais
              </h3>
              {currentBets.length > 0 && (
                <Button
                  onClick={clearBets}
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Limpar
                </Button>
              )}
            </div>

            {currentBets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma aposta realizada</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentBets.map((bet, index) => (
                  <div
                    key={index}
                    className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-primary capitalize">
                        {bet.type}: {bet.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pagamento: {bet.payout}x
                      </p>
                    </div>
                    <Badge className="bg-fortune-gold/20 text-fortune-gold border-fortune-gold/30">
                      {bet.amount} 🪙
                    </Badge>
                  </div>
                ))}
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-primary">Total:</span>
                    <Badge className="bg-fortune-gold/30 text-fortune-gold border-fortune-gold/50 px-3 py-1">
                      {getTotalBetAmount()} 🪙
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Rules */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="text-lg font-bold text-secondary mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Regras
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong className="text-primary">Número direto:</strong> 35x</p>
              <p>• <strong className="text-secondary">Cor, Par/Ímpar:</strong> 2x</p>
              <p>• <strong className="text-accent">Dúzias:</strong> 3x</p>
              <p>• <strong className="text-fortune-gold">0 verde:</strong> apenas número direto</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;
