/**
 * Rewards Page - Virtual Reward Redemption System
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Gift, 
  Star, 
  Clock, 
  Trophy, 
  Coins,
  Filter,
  History,
  Zap,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParticleBackground } from '@/components/ParticleBackground';
import { RewardRedemptionAnimation } from '@/components/RewardRedemptionAnimation';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { useRewards } from '@/hooks/useRewards';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Reward, REWARD_CATEGORIES, REWARD_RARITIES, COINS_TO_POINTS_RATE } from '@/types/rewards';
import { formatCompactNumber, formatBrazilianDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { setCoins, addEnergy, addExperience } = useGameActions();
  const { toast } = useToast();
  const { addTransaction } = useTransactionHistory();
  
  const {
    getRedemptionPoints,
    getAvailableRewards,
    canRedeemReward,
    redeemReward,
    getActiveRewards,
    redemptionHistory,
    getRewardsByCategory
  } = useRewards();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showRedemptionAnimation, setShowRedemptionAnimation] = useState(false);
  const [lastRedeemedReward, setLastRedeemedReward] = useState(null);

  // Computed values
  const redemptionPoints = getRedemptionPoints(state.coins);
  const availableRewards = getAvailableRewards(state.level);
  const activeRewards = getActiveRewards();

  // Filter rewards
  const filteredRewards = useMemo(() => {
    let filtered = availableRewards;

    if (selectedCategory !== 'all') {
      const category = REWARD_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        filtered = getRewardsByCategory(category.name, state.level);
      }
    }

    if (selectedRarity !== 'all') {
      filtered = filtered.filter(reward => reward.rarity === selectedRarity);
    }

    return filtered.sort((a, b) => a.cost - b.cost);
  }, [availableRewards, selectedCategory, selectedRarity, getRewardsByCategory, state.level]);

  // Handle reward redemption
  const handleRedeemReward = (reward: Reward) => {
    const result = redeemReward(reward, state.coins, state.level, (newCoins) => {
      setCoins(newCoins);
    });

    if (result.success && result.redeemedReward) {
      // Add transaction to history
      addTransaction({
        type: 'gasto',
        amount: reward.cost * COINS_TO_POINTS_RATE,
        description: `Resgate: ${reward.name}`,
        source: 'purchase',
        category: 'Resgates'
      });

      // Apply reward immediately if applicable
      if (reward.type === 'coins') {
        addTransaction({
          type: 'ganho',
          amount: Number(reward.value),
          description: `Bônus resgatado: ${reward.name}`,
          source: 'purchase',
          category: 'Recompensas'
        });
      } else if (reward.type === 'energy') {
        addEnergy(Number(reward.value));
      }

      // Show animation
      setLastRedeemedReward(result.redeemedReward);
      setShowRedemptionAnimation(true);

      toast({
        title: "Resgate Realizado!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro no Resgate",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  // Get reward icon
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'theme': return '🎨';
      case 'skin': return '🎰';
      case 'multiplier': return '⚡';
      case 'xp_bonus': return '🌟';
      case 'coins': return '💰';
      case 'energy': return '🔋';
      default: return '🎁';
    }
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen p-4 relative z-10">
        
        {/* Header */}
        <motion.header 
          className="flex items-center gap-4 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Resgatar Prêmios
            </h1>
            <p className="text-gray-400">Troque seus pontos por recompensas virtuais</p>
          </div>
        </motion.header>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Pontos Disponíveis</p>
              <p className="text-2xl font-bold text-white">{redemptionPoints}</p>
              <p className="text-xs text-yellow-500/80">
                {formatCompactNumber(state.coins)} moedas = {redemptionPoints} pontos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Prêmios Ativos</p>
              <p className="text-2xl font-bold text-white">{activeRewards.length}</p>
              <p className="text-xs text-blue-500/80">Em uso no momento</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nível Atual</p>
              <p className="text-2xl font-bold text-white">{state.level}</p>
              <p className="text-xs text-purple-500/80">Desbloqueia novos prêmios</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="catalog" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="catalog">Catálogo</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            {/* Catalog Tab */}
            <TabsContent value="catalog" className="space-y-6">
              {/* Conversion Info */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400">Taxa de Conversão:</span>
                      <span className="text-white font-medium">
                        {formatCompactNumber(COINS_TO_POINTS_RATE)} moedas = 1 ponto
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ⚠️ Prêmios virtuais sem valor real
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Filtros:</span>
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px] bg-background/50">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas Categorias</SelectItem>
                        {REWARD_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                      <SelectTrigger className="w-[140px] bg-background/50">
                        <SelectValue placeholder="Raridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="common">Comum</SelectItem>
                        <SelectItem value="rare">Raro</SelectItem>
                        <SelectItem value="epic">Épico</SelectItem>
                        <SelectItem value="legendary">Lendário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward) => {
                  const canRedeem = canRedeemReward(reward, state.coins, state.level);
                  const rarity = REWARD_RARITIES[reward.rarity];
                  
                  return (
                    <Card 
                      key={reward.id} 
                      className={`bg-card/50 backdrop-blur-sm border-2 transition-all hover:scale-105 ${rarity.border} ${rarity.bg}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="text-3xl">{getRewardIcon(reward.type)}</div>
                          <div className="text-right">
                            <Badge className={`${rarity.color} bg-current/10 border-current`}>
                              {reward.rarity}
                            </Badge>
                            {reward.requiredLevel > state.level && (
                              <Badge variant="outline" className="text-xs mt-1 block">
                                Nível {reward.requiredLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className={`text-lg ${rarity.color}`}>
                          {reward.name}
                        </CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Reward Details */}
                          <div className="text-sm text-gray-400 space-y-1">
                            {reward.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Duração: {reward.duration}h</span>
                              </div>
                            )}
                            {reward.type === 'multiplier' && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>Multiplicador: {reward.value}x</span>
                              </div>
                            )}
                            {reward.type === 'coins' && (
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                <span>{formatCompactNumber(Number(reward.value))} moedas</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-white">
                              {reward.cost} pontos
                            </div>
                            <Button
                              size="sm"
                              disabled={!canRedeem}
                              onClick={() => handleRedeemReward(reward)}
                              className={canRedeem ? 
                                "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" : 
                                "opacity-50 cursor-not-allowed"
                              }
                            >
                              {canRedeem ? 'Resgatar' : 
                               reward.requiredLevel > state.level ? 'Nível baixo' : 'Pontos insuficientes'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Active Rewards Tab */}
            <TabsContent value="active" className="space-y-4">
              {activeRewards.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum prêmio ativo no momento</p>
                    <p className="text-sm text-gray-500 mt-2">Resgates aparecem aqui quando ativos</p>
                  </CardContent>
                </Card>
              ) : (
                activeRewards.map((redeemedReward) => (
                  <Card key={redeemedReward.id} className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getRewardIcon(redeemedReward.reward.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{redeemedReward.reward.name}</h3>
                            <p className="text-sm text-gray-400">{redeemedReward.reward.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              Resgatado em: {formatBrazilianDateTime(redeemedReward.redeemedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-green-500 border-green-500/50">
                            Ativo
                          </Badge>
                          {redeemedReward.expiresAt && (
                            <p className="text-xs text-orange-400 mt-1">
                              Expira: {redeemedReward.expiresAt.toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              {redemptionHistory.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum resgate realizado ainda</p>
                  </CardContent>
                </Card>
              ) : (
                redemptionHistory.slice(0, 50).map((entry) => (
                  <Card key={entry.id} className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{entry.rewardName}</h3>
                          <p className="text-sm text-gray-400">
                            {formatBrazilianDateTime(entry.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{entry.cost} pontos</p>
                          <Badge 
                            variant="outline" 
                            className={entry.status === 'completed' ? 
                              'text-green-500 border-green-500/50' : 
                              'text-red-500 border-red-500/50'
                            }
                          >
                            {entry.status === 'completed' ? 'Concluído' : 'Falhou'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Redemption Animation */}
        <RewardRedemptionAnimation
          redeemedReward={lastRedeemedReward}
          isOpen={showRedemptionAnimation}
          onClose={() => {
            setShowRedemptionAnimation(false);
            setLastRedeemedReward(null);
          }}
        />

      </div>
    </ParticleBackground>
  );
};

export default RewardsPage;