import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/hooks/useLocalization';
import { BrazilianSymbols, RandomBrazilianSymbol, BrazilianThemeOverlay, BrazilianColorStripe } from './BrazilianCulturalSymbols';
import { WheelGame } from './WheelGame';
import { SlotMachine } from './SlotMachine';
import { FortuneTigerSlot } from './FortuneTigerSlot';
import { PremiumZodiacSlot } from './PremiumZodiacSlot';
import { MissionsSystem } from './MissionsSystem';
import { CollectiblesSystem } from './CollectiblesSystem';
import { VIPSystem } from './VIPSystem';
import { GameStats } from './GameStats';
import { CalendarRewardSystem } from './CalendarRewardSystem';
import { GameSettingsPanel } from './GameSettingsPanel';
import { Leaderboard } from './Leaderboard';
import { ReferralSystem } from './ReferralSystem';
import { VictorySharing } from './VictorySharing';
import { CommunityEvents } from './CommunityEvents';
import { SpriteSystem } from './SpriteSystem';
import { DragonMascot } from './DragonMascot';
import { OptimizedParticleSystem } from './OptimizedParticleSystem';
import { optimizedAudio } from './OptimizedAudioSystem';
import { MinimalAudioControl } from './MinimalAudioControl';
import { HapticProvider, useGameHaptics } from './HapticSystem';
import { 
  Crown, Star, Zap, Coins, Gift, Target, Gem, 
  Trophy, Calendar, Users, PlayCircle, Gamepad2, Volume2, Settings 
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedGameHubProps {
  coins: number;
  energy: number;
  level: number;
  experience: number;
  maxExperience: number;
  maxEnergy: number;
  totalSpins: number;
  totalCoinsEarned: number;
  dailyStreak: number;
  lastWin: number;
  onCoinsChange: (newCoins: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onExperienceChange: (newXP: number) => void;
  onLevelUp: () => void;
  onCalendarCoins?: (coins: number) => void;
  onCalendarXP?: (xp: number) => void;
  onThemeChange?: (themeId: string | null) => void;
  onMultiplierChange?: (multiplier: number) => void;
}

export const EnhancedGameHub: React.FC<EnhancedGameHubProps> = ({
  coins,
  energy,
  level,
  experience,
  maxExperience,
  maxEnergy,
  totalSpins,
  totalCoinsEarned,
  dailyStreak,
  lastWin,
  onCoinsChange,
  onEnergyChange,
  onExperienceChange,
  onLevelUp,
  onCalendarCoins,
  onCalendarXP,
  onThemeChange,
  onMultiplierChange
}) => {
  const { t, formatCurrency, formatNumber, getExpression, symbols } = useLocalization();
  const [activeTab, setActiveTab] = useState('games');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeGame, setActiveGame] = useState<string>('fortune-tiger');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [victoryToShare, setVictoryToShare] = useState<{
    amount: number;
    multiplier: number;
    symbols: string[];
    playerName: string;
    level: number;
    timestamp: Date;
  } | null>(null);
  const [referrals, setReferrals] = useState<Array<{
    id: string;
    name: string;
    level: number;
    totalSpins: number;
    joinDate: string;
  }>>([]); // Mock referral data
  
  // Haptic feedback for level ups
  const gameHaptics = useGameHaptics();

  // Audio initialization (optimized)
  useEffect(() => {
    // No complex audio initialization needed for optimized system
    optimizedAudio.setEnabled(true);
  }, []);

  // Available games with Brazilian cultural themes
  const games = [
    {
      id: 'fortune-tiger',
      name: t('games.fortuneTiger'),
      description: 'O clássico caça-níquel com sabor brasileiro',
      minLevel: 1,
      icon: <div className="text-2xl">🐯</div>,
      isNew: false,
      featured: true
    },
    {
      id: 'wheel-fortune',
      name: t('games.wheelFortune'),
      description: 'Gire a roda e ganhe prêmios incríveis',
      minLevel: 1,
      icon: <div className="text-2xl">🎡</div>,
      isNew: false,
      featured: false
    },
    {
      id: 'wild-slots',
      name: t('games.wildSlots'),
      description: 'Slots com animais selvagens da sorte',
      minLevel: 1,
      icon: <div className="text-2xl">🦊</div>,
      isNew: false,
      featured: false
    },
    {
      id: 'carnival-slots',
      name: t('games.carnivalSlots'),
      description: 'Viva o carnaval brasileiro com grandes prêmios!',
      minLevel: 3,
      icon: <div className="text-2xl">{symbols.brazilian.carnival}</div>,
      isNew: true,
      featured: true,
      brazilian: true
    },
    {
      id: 'football-fortune',
      name: t('games.footballFortune'),
      description: 'Jogue com a paixão nacional e ganhe como um campeão!',
      minLevel: 5,
      icon: <div className="text-2xl">{symbols.brazilian.football}</div>,
      isNew: true,
      featured: true,
      brazilian: true
    },
    {
      id: 'acai-berry',
      name: t('games.acaiBerry'),
      description: 'O sabor roxo da sorte direto da Amazônia!',
      minLevel: 8,
      icon: <BrazilianSymbols.Acai />,
      isNew: true,
      featured: false,
      brazilian: true
    },
    {
      id: 'brigadeiro-gold',
      name: t('games.brigadeiro'),
      description: 'Docinhos que valem ouro no mundo dos slots!',
      minLevel: 12,
      icon: <BrazilianSymbols.Brigadeiro />,
      isNew: false,
      featured: false,
      brazilian: true
    }
  ];

  // Check for achievements and notifications
  useEffect(() => {
    const newNotifications: string[] = [];

    // Level milestones with haptic feedback and Brazilian expressions
    if (level === 3) {
      newNotifications.push(`${symbols.brazilian.carnival} Nível 3! Slots do Carnaval desbloqueados! ${getExpression('celebration')}`);
      gameHaptics.levelUpHaptic(3);
    }
    if (level === 5) {
      newNotifications.push(`${symbols.brazilian.football} Nível 5! Fortuna do Futebol liberada! ${getExpression('bigWin')}`);
      gameHaptics.levelUpHaptic(5);
    }
    if (level === 8) {
      newNotifications.push(`${symbols.brazilian.acai} Nível 8! Açaí da Sorte disponível! ${getExpression('luck')}`);
      gameHaptics.levelUpHaptic(8);
    }
    if (level === 12) {
      newNotifications.push(`🍫 Nível 12! Doce Fortuna desbloqueado! ${getExpression('celebration')}`);
      gameHaptics.levelUpHaptic(12);
    }

    // Coin milestones with Brazilian currency
    if (totalCoinsEarned >= 100000 && totalCoinsEarned < 100500) {
      newNotifications.push(`${symbols.currency.money} ${formatNumber(100000)} moedas ganhas! ${getExpression('bigWin')}`);
      gameHaptics.success();
    }

    // Spin milestones
    if (totalSpins >= 100 && totalSpins < 105) {
      newNotifications.push(`🎰 ${formatNumber(100)} giros completados! ${getExpression('celebration')}`);
      gameHaptics.success();
    }

    setNotifications(newNotifications);
  }, [level, totalCoinsEarned, totalSpins, gameHaptics]);

  const handleMissionReward = (coins: number, xp: number) => {
    onCoinsChange(coins + coins);
    onExperienceChange(experience + xp);
    
    if (experience + xp >= maxExperience) {
      onLevelUp();
    }
  };

  const handleCollectionReward = (coins: number, xp: number) => {
    onCoinsChange(coins + coins);
    onExperienceChange(experience + xp);
    
    if (experience + xp >= maxExperience) {
      onLevelUp();
    }
  };

  const handleVIPBonus = (coins: number, energy: number) => {
    onCoinsChange(coins + coins);
    onEnergyChange(Math.min(energy + energy, maxEnergy));
  };

  const handleSlotWin = (amount: number, multiplier: number = 1) => {
    onCoinsChange(coins + amount);
    
    // Auto-trigger victory sharing for big wins
    if (amount >= 5000) { // Big win threshold for sharing
      setVictoryToShare({
        amount,
        multiplier,
        symbols: ['🐉', '🏆', '💎'], // Default symbols
        playerName: 'Jogador', // In real app, get from user context
        level,
        timestamp: new Date()
      });
    }
    
    if (amount >= 1000) { // Big win threshold
      const message = amount >= 10000 ? 'celebration' : 'bigWin';
      toast.success(getExpression(message), {
        description: `Você ganhou ${formatCurrency(amount)} moedas!`,
        duration: 4000,
        style: {
          background: 'linear-gradient(45deg, hsl(var(--fortune-gold)), hsl(var(--fortune-ember)))',
          color: 'hsl(var(--fortune-dark))',
          border: '1px solid hsl(var(--fortune-gold))',
        }
      });
    }
  };

  const handleAddReferral = (code: string) => {
    const newReferral = {
      id: `ref_${Date.now()}`,
      name: `Amigo${referrals.length + 1}`,
      level: Math.floor(Math.random() * 10) + 1,
      totalSpins: Math.floor(Math.random() * 1000),
      joinDate: new Date().toISOString()
    };
    setReferrals([...referrals, newReferral]);
    toast.success('🎉 Novo amigo adicionado!');
  };

  const handleClaimReferralReward = (reward: number) => {
    onCoinsChange(coins + reward);
    toast.success(`🎁 Recompensa de indicação recebida: ${formatCurrency(reward)} moedas!`);
  };

  const handleJoinTournament = (tournamentId: string, entryFee: number) => {
    if (coins >= entryFee) {
      onCoinsChange(coins - entryFee);
      toast.success(`🏆 Você entrou no torneio! Taxa de entrada: ${formatCurrency(entryFee)}`);
    } else {
      toast.error('Moedas insuficientes para entrar no torneio!');
    }
  };

  const handleClaimGoalReward = (goalId: string, reward: number) => {
    onCoinsChange(coins + reward);
    toast.success(`🎯 Meta comunitária completa! Você ganhou ${formatCurrency(reward)} moedas!`);
  };

  const canPlayGame = (gameMinLevel: number) => level >= gameMinLevel;

  const handlePlayGame = (gameId: string) => {
    console.log('🕹️ Tentando carregar jogo:', gameId);
    
    if (energy < 1) {
      console.log('❌ Energia insuficiente');
      gameHaptics.error();
      toast.error('⚡ Energia insuficiente!');
      return;
    }
    
    console.log('✅ Carregando jogo:', gameId);
    gameHaptics.buttonClick();
    setActiveGame(gameId);
    gameHaptics.success();
    toast.success(`🎮 ${games.find(g => g.id === gameId)?.name} carregado!`);
  };

  const renderGameCard = (game: any) => (
    <Card key={game.id} className={`p-6 transition-all hover:scale-105 cursor-pointer relative overflow-hidden ${
      game.featured 
        ? 'bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 border-2 border-fortune-gold shadow-glow-gold' 
        : 'bg-card/80 border border-primary/30'
    } ${game.brazilian ? 'border-green-500/30' : ''} ${!canPlayGame(game.minLevel) ? 'opacity-50' : ''}`}>
      {game.brazilian && <BrazilianColorStripe className="absolute top-0 left-0 w-full opacity-20" />}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {game.icon}
              {game.brazilian && <span className="ml-1 text-xs">{symbols.brazilian.flag}</span>}
            </div>
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${game.featured ? 'text-fortune-gold' : 'text-primary'}`}>
                {game.name}
                {game.brazilian && <RandomBrazilianSymbol />}
              </h3>
              <p className="text-sm text-muted-foreground">{game.description}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {game.isNew && (
              <Badge className="bg-fortune-red text-white animate-pulse">NOVO</Badge>
            )}
            {game.featured && (
              <Badge className="bg-fortune-gold text-fortune-dark">DESTAQUE</Badge>
            )}
            {game.brazilian && (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">BR</Badge>
            )}
            <div className="text-xs text-muted-foreground">
              {t('ui.level')} {game.minLevel}+
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-primary" />
              <span>1 energia</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-secondary" />
              <span>+10 XP</span>
            </div>
          </div>

          <Button
            disabled={!canPlayGame(game.minLevel) || energy < 1}
            onClick={() => {
              console.log('🎯 Clique no botão do jogo:', game.id);
              handlePlayGame(game.id);
            }}
            className={`${game.featured 
              ? 'bg-gradient-gold hover:scale-105 text-fortune-dark' 
              : ''
            } ${game.brazilian ? 'border border-green-500/30 hover:border-green-500/50' : ''}`}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {!canPlayGame(game.minLevel) ? 'Bloqueado' : t('ui.play')}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <HapticProvider>
      <div className="min-h-screen bg-gradient-background p-4">
        {/* Settings Button */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <MinimalAudioControl />
          <Button
            onClick={() => setSettingsOpen(true)}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border border-primary/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('ui.settings')}
          </Button>
        </div>
      {/* Header with Stats */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-fortune-gold/20 to-fortune-ember/20 border border-fortune-gold">
            <div className="flex items-center space-x-3">
              <Coins className="w-8 h-8 text-fortune-gold" />
              <div>
                <div className="text-2xl font-bold text-fortune-gold">
                  {formatNumber(coins)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {symbols.currency.coins} {t('currency.coins')}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">
                  {energy}/{maxEnergy}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {symbols.luck.lightning} {t('ui.energy')}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {level}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {symbols.luck.star} {t('ui.level')}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold text-accent">
                  {formatNumber(totalSpins)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  🎰 {t('ui.totalSpins')}
                </div>
              </div>
            </div>
          </Card>
        </div>


        {/* Experience Bar */}
        <BrazilianThemeOverlay>
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                {symbols.luck.star} {t('ui.experience')}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatNumber(experience)}/{formatNumber(maxExperience)} XP
              </span>
            </div>
            <Progress value={(experience / maxExperience) * 100} className="h-3" />
          </Card>
        </BrazilianThemeOverlay>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2 mb-6">
            {notifications.map((notification, index) => (
              <Card key={index} className="p-3 bg-fortune-gold/20 border border-fortune-gold animate-pulse">
                <div className="text-center text-fortune-dark font-medium">
                  {notification}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6">
            <TabsTrigger value="games" className="flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.games')}</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.missions')}</span>
            </TabsTrigger>
            <TabsTrigger value="collectibles" className="flex items-center space-x-2">
              <Gem className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.collectibles')}</span>
            </TabsTrigger>
            <TabsTrigger value="vip" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.vip')}</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.rewards')}</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ui.stats')}</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Indicações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            {/* Featured Games */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">🌟 Jogos em Destaque</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {games.filter(game => game.featured).map(renderGameCard)}
              </div>
            </div>

            {/* All Games */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">🎮 Todos os Jogos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map(renderGameCard)}
              </div>
            </div>

      {/* Simplified Game Area */}
      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-br from-pgbet-dark via-black to-pgbet-dark border-2 border-pgbet-gold">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-pgbet-gold">
              🎮 {games.find(g => g.id === activeGame)?.name || 'Zodiac Fortune Slots'}
            </h3>
            <p className="text-sm text-gray-400">
              {games.find(g => g.id === activeGame)?.description || 'Gire e ganhe fortunas!'}
            </p>
          </div>
                
                {activeGame === 'fortune-tiger' && (
                  <PremiumZodiacSlot
                    coins={coins}
                    energy={energy}
                    level={level}
                    experience={experience}
                    onCoinsChange={onCoinsChange}
                    onEnergyChange={onEnergyChange}
                    onExperienceChange={onExperienceChange}
                  />
                )}
                
                {activeGame === 'wheel-fortune' && (
                  <WheelGame
                    coins={coins}
                    energy={energy}
                    onCoinsChange={onCoinsChange}
                    onEnergyChange={onEnergyChange}
                  />
                )}
                
                {activeGame === 'wild-slots' && (
                  <FortuneTigerSlot
                    coins={coins}
                    energy={energy}
                    onCoinsChange={onCoinsChange}
                    onEnergyChange={onEnergyChange}
                  />
                )}
                
                {(activeGame === 'dragon-treasure' || activeGame === 'phoenix-fire' || activeGame === 'golden-palace') && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-2xl font-bold text-pgbet-gold mb-2">Em Breve!</h3>
                    <p className="text-gray-400">Este jogo incrível está sendo desenvolvido...</p>
                    <Button 
                      onClick={() => setActiveGame('fortune-tiger')}
                      className="mt-4 bg-pgbet-gradient-gold text-black"
                    >
                      Voltar para Fortune Tiger
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="missions">
            <MissionsSystem
              totalSpins={totalSpins}
              totalCoinsEarned={totalCoinsEarned}
              dailyStreak={dailyStreak}
              level={level}
              onClaimReward={handleMissionReward}
            />
          </TabsContent>

          <TabsContent value="collectibles">
            <CollectiblesSystem
              totalSpins={totalSpins}
              level={level}
              totalCoinsEarned={totalCoinsEarned}
              onCollectionComplete={handleCollectionReward}
            />
          </TabsContent>

          <TabsContent value="vip">
            <VIPSystem
              totalCoinsEarned={totalCoinsEarned}
              totalSpins={totalSpins}
              level={level}
              onClaimDailyVIP={handleVIPBonus}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <CalendarRewardSystem
              onCoinsChange={onCalendarCoins}
              onXPChange={onCalendarXP}
              onThemeChange={onThemeChange}
              onMultiplierChange={onMultiplierChange}
            />
          </TabsContent>

          <TabsContent value="stats">
            <GameStats
              coins={coins}
              energy={energy}
              maxEnergy={maxEnergy}
              level={level}
              experience={experience}
              maxExperience={maxExperience}
              dailySpins={totalSpins % 50} // Reset daily
              maxDailySpins={50}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard
              currentPlayer={{
                name: "Jogador",
                level,
                totalCoins: coins,
                totalSpins,
                referrals: referrals.length,
                weeklySpins: totalSpins % 100 // Mock weekly spins
              }}
            />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityEvents
              playerLevel={level}
              playerCoins={coins}
              onJoinTournament={handleJoinTournament}
              onClaimGoalReward={handleClaimGoalReward}
            />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <ReferralSystem
              playerName="Jogador" // In a real app, get from user context
              referralCode="LUCKY123" // Generate unique code
              referrals={referrals}
              onAddReferral={handleAddReferral}
              onClaimReferralReward={handleClaimReferralReward}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Simple Mascot - reduced complexity */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="w-16 h-16 bg-gradient-to-br from-pgbet-gold to-pgbet-red rounded-full flex items-center justify-center text-2xl animate-bounce">
          🐯
        </div>
        </div>

        {/* Settings Panel */}
        <GameSettingsPanel
          isOpen={settingsOpen}
          onOpenChange={setSettingsOpen}
        />

        {/* Victory Sharing Modal */}
        <VictorySharing
          victory={victoryToShare}
          onClose={() => setVictoryToShare(null)}
        />
      </div>
    </HapticProvider>
  );
};