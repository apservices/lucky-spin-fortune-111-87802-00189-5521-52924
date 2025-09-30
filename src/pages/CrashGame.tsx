import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Zap, TrendingUp, Rocket } from 'lucide-react';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';

const CrashGame: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { setCoins, setEnergy } = useGameActions();
  
  const [bet, setBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'betting' | 'flying' | 'crashed'>('betting');
  const [cashOutAt, setCashOutAt] = useState<number | null>(null);
  const [result, setResult] = useState<string>('');
  const [crashPoint, setCrashPoint] = useState(1.00);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate crash point (weighted random)
  const generateCrashPoint = (): number => {
    const random = Math.random();
    
    // 50% chance: 1.00 - 2.00x
    if (random < 0.5) return 1.00 + Math.random();
    
    // 30% chance: 2.00 - 5.00x
    if (random < 0.8) return 2.00 + Math.random() * 3;
    
    // 15% chance: 5.00 - 10.00x
    if (random < 0.95) return 5.00 + Math.random() * 5;
    
    // 5% chance: 10.00 - 50.00x
    return 10.00 + Math.random() * 40;
  };

  const startGame = () => {
    if (state.coins < bet) {
      toast.error('Moedas insuficientes!');
      return;
    }

    if (state.energy < 1) {
      toast.error('Energia insuficiente!');
      return;
    }

    setCoins(state.coins - bet);
    setEnergy(state.energy - 1);

    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    setMultiplier(1.00);
    setGameState('flying');
    setCashOutAt(null);
    setResult('');

    // Start multiplier increase
    let current = 1.00;
    intervalRef.current = setInterval(() => {
      current += 0.01;
      setMultiplier(parseFloat(current.toFixed(2)));

      if (current >= newCrashPoint) {
        crash();
      }
    }, 50);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;

    const winnings = Math.floor(bet * multiplier);
    setCoins(state.coins + winnings);
    setCashOutAt(multiplier);
    setGameState('crashed');
    setResult(`Resgate em ${multiplier.toFixed(2)}x!`);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    toast.success(`🚀 Resgate! +${winnings} moedas (${multiplier.toFixed(2)}x)`);
  };

  const crash = () => {
    setGameState('crashed');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (cashOutAt) {
      const winnings = Math.floor(bet * cashOutAt);
      setResult(`Você venceu ${winnings} moedas!`);
    } else {
      setResult(`Crash em ${crashPoint.toFixed(2)}x!`);
      toast.error(`💥 Crash! Você perdeu ${bet} moedas`);
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setMultiplier(1.00);
    setCashOutAt(null);
    setResult('');
    setCrashPoint(1.00);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lobby')}
              className="text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🚀 Rocket Crash
            </h1>

            <div className="flex gap-2">
              <Badge variant="outline" className="bg-black/50 border-yellow-500/50">
                <Coins className="w-3 h-3 mr-1 text-yellow-400" />
                <span className="text-white">{state.coins}</span>
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-blue-500/50">
                <Zap className="w-3 h-3 mr-1 text-blue-400" />
                <span className="text-white">{state.energy}</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full space-y-8">
            
            {/* Multiplier Display */}
            <Card className={`p-12 text-center ${
              gameState === 'flying' 
                ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/50' 
                : gameState === 'crashed' && !cashOutAt
                  ? 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border-red-500/50'
                  : 'bg-black/40 border-primary/30'
            } backdrop-blur-md transition-all duration-300`}>
              
              <motion.div
                animate={{ 
                  scale: gameState === 'flying' ? [1, 1.1, 1] : 1,
                  rotate: gameState === 'crashed' && !cashOutAt ? [0, -10, 10, -10, 0] : 0
                }}
                transition={{ 
                  duration: gameState === 'flying' ? 0.5 : 0.3, 
                  repeat: gameState === 'flying' ? Infinity : 0 
                }}
              >
                {gameState === 'betting' ? (
                  <Rocket className="w-24 h-24 mx-auto mb-4 text-primary" />
                ) : gameState === 'crashed' && !cashOutAt ? (
                  <div className="text-8xl mb-4">💥</div>
                ) : (
                  <TrendingUp className="w-24 h-24 mx-auto mb-4 text-green-400" />
                )}
              </motion.div>

              <div className={`text-6xl font-bold mb-4 ${
                gameState === 'flying' ? 'text-green-400' : 
                gameState === 'crashed' && !cashOutAt ? 'text-red-400' : 
                'text-white'
              }`}>
                {multiplier.toFixed(2)}x
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl text-white"
                >
                  {result}
                </motion.div>
              )}

              {gameState === 'flying' && (
                <div className="text-sm text-white/70 mt-2">
                  Potencial: {Math.floor(bet * multiplier)} moedas
                </div>
              )}
            </Card>

            {/* Controls */}
            <Card className="p-6 bg-black/40 backdrop-blur-md border-primary/30">
              {gameState === 'betting' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Aposta</label>
                    <div className="flex gap-2">
                      {[50, 100, 250, 500, 1000].map(amount => (
                        <Button
                          key={amount}
                          variant={bet === amount ? "default" : "outline"}
                          onClick={() => setBet(amount)}
                          className="flex-1"
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                    disabled={state.coins < bet || state.energy < 1}
                  >
                    🚀 Iniciar Voo
                  </Button>
                </div>
              )}

              {gameState === 'flying' && (
                <Button
                  onClick={cashOut}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6 animate-pulse"
                >
                  💰 Resgatar {Math.floor(bet * multiplier)} moedas
                </Button>
              )}

              {gameState === 'crashed' && (
                <Button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-6"
                >
                  Jogar Novamente
                </Button>
              )}
            </Card>

            {/* Info */}
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-400">
                <p>Resgate antes do crash para ganhar!</p>
                <p className="mt-1">Use moedas virtuais • Sem valor real</p>
              </div>
              
              {gameState === 'betting' && (
                <Card className="p-3 bg-black/20 backdrop-blur-sm border-primary/20">
                  <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                    <div>
                      <div className="text-green-400 font-bold">50%</div>
                      <div>1-2x</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-bold">30%</div>
                      <div>2-5x</div>
                    </div>
                    <div>
                      <div className="text-red-400 font-bold">20%</div>
                      <div>5x+</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

          </div>
        </main>
      </div>
    </ParticleBackground>
  );
};

export default CrashGame;
