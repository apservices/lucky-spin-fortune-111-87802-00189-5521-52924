/**
 * Achievements Page - Player Achievements and Progress
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Star, Award, Crown, Lock, Check } from 'lucide-react';
import { useGameState } from '@/systems/GameStateSystem';
import { useAchievements } from '@/hooks/useAchievements';
import { ParticleBackground } from '@/components/ParticleBackground';

const RARITY_COLORS = {
  common: 'from-gray-600 to-gray-700',
  rare: 'from-blue-600 to-blue-700',
  epic: 'from-purple-600 to-purple-700',
  legendary: 'from-yellow-600 to-orange-600'
};

const CATEGORY_INFO: any = {
  iniciante: { icon: Star, label: 'Iniciante', color: 'text-green-400' },
  jogador: { icon: Trophy, label: 'Jogador', color: 'text-blue-400' },
  veterano: { icon: Award, label: 'Veterano', color: 'text-purple-400' },
  lendario: { icon: Crown, label: 'Lendário', color: 'text-yellow-400' }
};

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { achievements, getByCategory, getStats } = useAchievements(state);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const stats = getStats();

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : getByCategory(selectedCategory);

  const getProgressPercentage = (achievement: any) => {
    if (achievement.status === 'completed') return 100;
    if (!achievement.requirements.current) return 0;
    return Math.min((achievement.requirements.current / achievement.requirements.target) * 100, 100);
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex flex-col">
        <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')} className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🏆 Conquistas
            </h1>
            <div className="w-20"></div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6 bg-gradient-to-br from-black/40 to-purple-900/40 backdrop-blur-md border-primary/30">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div>
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold text-white">{stats.completed}</div>
                  <div className="text-xs text-gray-400">Completas</div>
                </div>
                <div>
                  <Star className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
                  <div className="text-xs text-gray-400">Em Progresso</div>
                </div>
                <div>
                  <Award className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold text-white">{stats.percentage}%</div>
                  <div className="text-xs text-gray-400">Conclusão</div>
                </div>
              </div>
            </Card>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5 bg-black/40">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="iniciante">Iniciante</TabsTrigger>
                <TabsTrigger value="jogador">Jogador</TabsTrigger>
                <TabsTrigger value="veterano">Veterano</TabsTrigger>
                <TabsTrigger value="lendario">Lendário</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                <div className="grid gap-4">
                  {filteredAchievements.map((achievement: any) => {
                    const progress = getProgressPercentage(achievement);
                    return (
                      <Card key={achievement.id} className={`p-4 ${
                        achievement.status === 'completed' ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50' : 'bg-black/40 backdrop-blur-md border-primary/30'
                      }`}>
                        <div className="flex gap-3">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white">{achievement.title}</h3>
                            <p className="text-sm text-gray-400">{achievement.description}</p>
                            {achievement.status !== 'completed' && (
                              <Progress value={progress} className="h-2 mt-2" />
                            )}
                            <div className="mt-2 text-xs text-yellow-400">
                              +{achievement.rewards.xp} XP • +{achievement.rewards.coins} moedas
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ParticleBackground>
  );
};

export default AchievementsPage;