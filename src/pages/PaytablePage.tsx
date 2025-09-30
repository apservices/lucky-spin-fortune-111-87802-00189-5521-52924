/**
 * Paytable Page
 * Transparent display of game probabilities and payouts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Trophy, 
  Percent, 
  Info, 
  Star,
  BarChart3,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GameConfig {
  rtp: {
    base: number;
    byLevel: Record<string, number>;
  };
  symbolProbabilities: Record<string, number>;
  multipliers: Record<string, number[]>;
}

const PaytablePage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [userLevel] = useState(7); // This would come from game state

  useEffect(() => {
    loadGameConfig();
  }, []);

  const loadGameConfig = async () => {
    try {
      const response = await fetch('/config/gameParameters.json');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load game config:', error);
      // Fallback config
      setConfig({
        rtp: {
          base: 0.90,
          byLevel: {
            "1-5": 0.88,
            "6-10": 0.90,
            "11-15": 0.92,
            "16+": 0.94
          }
        },
        symbolProbabilities: {
          tiger: 0.02,
          fox: 0.08,
          frog: 0.12,
          envelope: 0.18,
          orange: 0.25,
          scroll: 0.15
        },
        multipliers: {
          tiger: [50, 100, 500],
          fox: [20, 40, 80],
          frog: [15, 30, 60],
          envelope: [12, 24, 48],
          orange: [8, 16, 32],
          scroll: [25, 50, 100]
        }
      });
    }
  };

  const getCurrentRTP = () => {
    if (!config) return 0.90;
    
    const levelRanges = Object.keys(config.rtp.byLevel);
    for (const range of levelRanges) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (userLevel >= min && userLevel <= max) {
          return config.rtp.byLevel[range];
        }
      } else if (range.includes('+')) {
        const min = Number(range.replace('+', ''));
        if (userLevel >= min) {
          return config.rtp.byLevel[range];
        }
      }
    }
    
    return config.rtp.base;
  };

  const symbols = [
    { 
      id: 'tiger', 
      name: 'Tigre Dourado', 
      rarity: 'Lendário',
      description: 'O símbolo mais raro e valioso'
    },
    { 
      id: 'fox', 
      name: 'Raposa da Sorte', 
      rarity: 'Raro',
      description: 'Traz boa sorte e multiplicadores médios'
    },
    { 
      id: 'frog', 
      name: 'Sapo da Prosperidade', 
      rarity: 'Raro',
      description: 'Símbolo da prosperidade e abundância'
    },
    { 
      id: 'envelope', 
      name: 'Envelope Vermelho', 
      rarity: 'Comum',
      description: 'Presente tradicional chinês'
    },
    { 
      id: 'orange', 
      name: 'Laranja da Fortuna', 
      rarity: 'Comum',
      description: 'Fruta da sorte e prosperidade'
    },
    { 
      id: 'scroll', 
      name: 'Pergaminho Místico', 
      rarity: 'Raro',
      description: 'Contém sabedoria ancestral'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Lendário': return 'bg-fortune-gold text-black';
      case 'Raro': return 'bg-purple-500 text-white';
      case 'Comum': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const currentRTP = getCurrentRTP();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Tabela de Pagamentos</h1>
              <p className="text-muted-foreground">Probabilidades e multiplicadores transparentes</p>
            </div>
          </div>
        </motion.div>

        {/* RTP Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 bg-primary/5 border-primary">
            <div className="flex items-start space-x-4">
              <Percent className="w-8 h-8 text-primary mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary mb-2">
                  RTP (Return to Player) Virtual
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  O RTP é a porcentagem teórica de moedas virtuais retornadas aos jogadores 
                  ao longo do tempo. Este é um valor estatístico calculado sobre milhões de jogadas.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {(currentRTP * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Seu RTP Atual</div>
                    <div className="text-xs text-muted-foreground">Nível {userLevel}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-secondary">
                      {((1 - currentRTP) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa da Casa</div>
                    <div className="text-xs text-muted-foreground">Virtual</div>
                  </div>
                  
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-fortune-gold">
                      {config?.rtp.byLevel["16+"] ? (config.rtp.byLevel["16+"] * 100).toFixed(1) : '94.0'}%
                    </div>
                    <div className="text-xs text-muted-foreground">RTP Máximo</div>
                    <div className="text-xs text-muted-foreground">Nível 16+</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Symbols and Probabilities */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Símbolos e Probabilidades
            </h2>
            
            <div className="space-y-4">
              {symbols.map((symbol, index) => {
                const probability = config?.symbolProbabilities[symbol.id] || 0;
                const multipliers = config?.multipliers[symbol.id] || [0, 0, 0];
                
                return (
                  <motion.div
                    key={symbol.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold">{symbol.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{symbol.name}</h3>
                            <p className="text-sm text-muted-foreground">{symbol.description}</p>
                          </div>
                        </div>
                        <Badge className={getRarityColor(symbol.rarity)}>
                          {symbol.rarity}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Probabilidade</div>
                          <div className="font-bold text-primary">
                            {(probability * 100).toFixed(1)}%
                          </div>
                          <Progress value={probability * 100} className="h-1 mt-1" />
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">3 Símbolos</div>
                          <div className="font-bold text-green-600">
                            {multipliers[0]}x
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">4 Símbolos</div>
                          <div className="font-bold text-blue-600">
                            {multipliers[1]}x
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">5 Símbolos</div>
                          <div className="font-bold text-fortune-gold">
                            {multipliers[2]}x
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* RTP by Level */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Progressão de RTP por Nível
            </h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              O RTP aumenta conforme você progride no jogo, incentivando a evolução e recompensando a dedicação.
            </p>
            
            <div className="space-y-3">
              {config && Object.entries(config.rtp.byLevel).map(([range, rtp], index) => (
                <div key={range} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-20 text-center">
                    <Badge variant={
                      (range === "1-5" && userLevel <= 5) ||
                      (range === "6-10" && userLevel >= 6 && userLevel <= 10) ||
                      (range === "11-15" && userLevel >= 11 && userLevel <= 15) ||
                      (range === "16+" && userLevel >= 16) ? "default" : "outline"
                    }>
                      Nível {range}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <Progress value={rtp * 100} className="h-2" />
                  </div>
                  <div className="w-16 text-right font-medium">
                    {(rtp * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Mathematical Explanation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Como Funcionam os Cálculos
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Exemplo de Cálculo</h3>
                <p className="text-blue-700 mb-2">
                  Se você apostar 100 moedas virtuais com RTP de 90%:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-blue-700">
                  <li>Teoricamente, ao longo de muitas jogadas, você receberia de volta 90 moedas</li>
                  <li>Os 10 moedas restantes representam a "taxa da casa virtual"</li>
                  <li>Em jogadas individuais, você pode ganhar muito mais ou muito menos</li>
                  <li>O RTP só se aplica estatisticamente ao longo do tempo</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Algoritmo de Sorte</h3>
                <p className="text-purple-700">
                  O jogo usa um gerador de números pseudoaleatórios (PRNG) para determinar 
                  os resultados. Cada giro é independente e não é influenciado por resultados 
                  anteriores. O algoritmo garante que, ao longo do tempo, as probabilidades 
                  matemáticas sejam respeitadas.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Important Disclaimers */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  Avisos Importantes
                </h2>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p>
                    • <strong>Jogo Recreativo:</strong> Todas as moedas são virtuais e não possuem valor real
                  </p>
                  <p>
                    • <strong>Resultados Baseados na Sorte:</strong> Não há estratégias garantidas para vencer
                  </p>
                  <p>
                    • <strong>RTP é Teórico:</strong> Aplicável apenas estatisticamente ao longo de muitas jogadas
                  </p>
                  <p>
                    • <strong>Cada Giro é Independente:</strong> Resultados anteriores não influenciam futuros
                  </p>
                  <p>
                    • <strong>Entretenimento Apenas:</strong> Jogue sempre com moderação e responsabilidade
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PaytablePage;