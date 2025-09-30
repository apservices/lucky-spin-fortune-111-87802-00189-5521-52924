import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Crown, Gem, Trophy, Gift, Zap, Coins, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'charms' | 'trophies' | 'cards' | 'artifacts';
  owned: boolean;
  icon: React.ReactNode;
  unlockCondition: string;
  bonus?: {
    type: 'coins' | 'xp' | 'luck' | 'energy';
    value: number;
  };
}

interface Collection {
  id: string;
  name: string;
  description: string;
  items: string[];
  completed: boolean;
  reward: {
    coins: number;
    xp: number;
    permanentBonus?: string;
  };
}

interface CollectiblesSystemProps {
  totalSpins: number;
  level: number;
  totalCoinsEarned: number;
  onCollectionComplete: (coins: number, xp: number) => void;
}

export const CollectiblesSystem: React.FC<CollectiblesSystemProps> = ({
  totalSpins,
  level,
  totalCoinsEarned,
  onCollectionComplete
}) => {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    // Initialize collectibles
    const initialCollectibles: Collectible[] = [
      // Charms
      {
        id: 'lucky-coin',
        name: 'Moeda da Sorte',
        description: 'Uma moeda antiga que traz fortuna',
        rarity: 'common',
        category: 'charms',
        owned: totalSpins >= 10,
        icon: <Coins className="w-6 h-6" />,
        unlockCondition: 'Faça 10 giros',
        bonus: { type: 'luck', value: 5 }
      },
      {
        id: 'dragon-scale',
        name: 'Escama de Dragão',
        description: 'Escama dourada de um dragão da sorte',
        rarity: 'rare',
        category: 'charms',
        owned: totalCoinsEarned >= 50000,
        icon: <Shield className="w-6 h-6" />,
        unlockCondition: 'Ganhe 50.000 moedas no total',
        bonus: { type: 'coins', value: 10 }
      },
      {
        id: 'phoenix-feather',
        name: 'Pena de Fênix',
        description: 'Pena mágica que renasce a energia',
        rarity: 'epic',
        category: 'charms',
        owned: level >= 15,
        icon: <Zap className="w-6 h-6" />,
        unlockCondition: 'Alcance o nível 15',
        bonus: { type: 'energy', value: 20 }
      },
      {
        id: 'celestial-gem',
        name: 'Gema Celestial',
        description: 'Gema rara dos céus que multiplica XP',
        rarity: 'legendary',
        category: 'charms',
        owned: totalSpins >= 1000,
        icon: <Gem className="w-6 h-6" />,
        unlockCondition: 'Faça 1.000 giros',
        bonus: { type: 'xp', value: 25 }
      },
      // Trophies
      {
        id: 'first-win',
        name: 'Primeira Vitória',
        description: 'Seu primeiro grande ganho',
        rarity: 'common',
        category: 'trophies',
        owned: totalCoinsEarned > 0,
        icon: <Trophy className="w-6 h-6" />,
        unlockCondition: 'Ganhe moedas pela primeira vez'
      },
      {
        id: 'spin-master',
        name: 'Mestre dos Giros',
        description: 'Reconhecimento por dedicação',
        rarity: 'rare',
        category: 'trophies',
        owned: totalSpins >= 100,
        icon: <Star className="w-6 h-6" />,
        unlockCondition: 'Faça 100 giros'
      },
      {
        id: 'fortune-king',
        name: 'Rei da Fortuna',
        description: 'Coroa para os mais afortunados',
        rarity: 'epic',
        category: 'trophies',
        owned: totalCoinsEarned >= 100000,
        icon: <Crown className="w-6 h-6" />,
        unlockCondition: 'Ganhe 100.000 moedas no total'
      },
      // Cards
      {
        id: 'tiger-card',
        name: 'Carta do Tigre',
        description: 'Carta especial do Fortune Tiger',
        rarity: 'rare',
        category: 'cards',
        owned: totalSpins >= 50,
        icon: <div className="text-2xl">🐯</div>,
        unlockCondition: 'Faça 50 giros'
      },
      {
        id: 'dragon-card',
        name: 'Carta do Dragão',
        description: 'Carta mística do dragão dourado',
        rarity: 'epic',
        category: 'cards',
        owned: level >= 10,
        icon: <div className="text-2xl">🐲</div>,
        unlockCondition: 'Alcance o nível 10'
      },
      // Artifacts
      {
        id: 'golden-wheel',
        name: 'Roda Dourada',
        description: 'Artefato ancestral dos jogos',
        rarity: 'legendary',
        category: 'artifacts',
        owned: totalSpins >= 500 && level >= 20,
        icon: <div className="text-2xl">⚡</div>,
        unlockCondition: 'Faça 500 giros e alcance nível 20'
      }
    ];

    // Initialize collections
    const initialCollections: Collection[] = [
      {
        id: 'starter-collection',
        name: 'Coleção Iniciante',
        description: 'Seus primeiros tesouros',
        items: ['lucky-coin', 'first-win', 'tiger-card'],
        completed: false,
        reward: { coins: 5000, xp: 500, permanentBonus: '+5% de sorte em todos os jogos' }
      },
      {
        id: 'master-collection',
        name: 'Coleção Mestre',
        description: 'Para os verdadeiros mestres',
        items: ['dragon-scale', 'spin-master', 'dragon-card'],
        completed: false,
        reward: { coins: 25000, xp: 2000, permanentBonus: '+10% de moedas em vitórias' }
      },
      {
        id: 'legendary-collection',
        name: 'Coleção Lendária',
        description: 'O conjunto mais raro',
        items: ['celestial-gem', 'fortune-king', 'golden-wheel'],
        completed: false,
        reward: { coins: 100000, xp: 5000, permanentBonus: '+20% XP permanente' }
      }
    ];

    setCollectibles(initialCollectibles);
    
    // Check collection completion
    const updatedCollections = initialCollections.map(collection => {
      const allItemsOwned = collection.items.every(itemId => 
        initialCollectibles.find(c => c.id === itemId)?.owned
      );
      return { ...collection, completed: allItemsOwned };
    });
    
    setCollections(updatedCollections);
  }, [totalSpins, level, totalCoinsEarned]);

  const claimCollectionReward = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection && collection.completed) {
      onCollectionComplete(collection.reward.coins, collection.reward.xp);
      
      toast.success(
        `🏆 Coleção Completa! +${collection.reward.coins.toLocaleString()} moedas +${collection.reward.xp} XP`,
        {
          duration: 4000,
          style: {
            background: 'hsl(var(--fortune-gold))',
            color: 'hsl(var(--fortune-dark))',
          }
        }
      );

      if (collection.reward.permanentBonus) {
        toast.success(
          `🎁 Bônus Permanente Desbloqueado: ${collection.reward.permanentBonus}`,
          { duration: 5000 }
        );
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 border-gray-500/50';
      case 'rare': return 'bg-blue-500/20 border-blue-500/50';
      case 'epic': return 'bg-purple-500/20 border-purple-500/50';
      case 'legendary': return 'bg-yellow-500/20 border-yellow-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getCollectiblesByCategory = (category: string) => 
    collectibles.filter(c => c.category === category);

  const renderCollectibleCard = (collectible: Collectible) => (
    <Card key={collectible.id} className={`p-4 transition-all hover:scale-105 ${
      collectible.owned 
        ? `${getRarityBg(collectible.rarity)} shadow-lg` 
        : 'bg-card/50 border-muted opacity-60'
    }`}>
      <div className="text-center space-y-3">
        <div className={`${getRarityColor(collectible.rarity)} mx-auto`}>
          {collectible.icon}
        </div>
        
        <div>
          <h4 className={`font-bold ${getRarityColor(collectible.rarity)}`}>
            {collectible.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {collectible.description}
          </p>
        </div>

        <Badge 
          variant={collectible.owned ? "default" : "outline"}
          className={`text-xs ${collectible.owned ? getRarityColor(collectible.rarity) : ''}`}
        >
          {collectible.rarity.toUpperCase()}
        </Badge>

        {collectible.bonus && collectible.owned && (
          <div className="text-xs text-green-400">
            +{collectible.bonus.value}% {collectible.bonus.type}
          </div>
        )}

        {!collectible.owned && (
          <div className="text-xs text-muted-foreground">
            {collectible.unlockCondition}
          </div>
        )}
      </div>
    </Card>
  );

  const renderCollectionCard = (collection: Collection) => {
    const ownedItems = collection.items.filter(itemId => 
      collectibles.find(c => c.id === itemId)?.owned
    ).length;

    return (
      <Card key={collection.id} className="p-6 bg-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary">{collection.name}</h3>
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            </div>
            {collection.completed && (
              <Button
                onClick={() => claimCollectionReward(collection.id)}
                className="bg-gradient-gold hover:scale-105 text-fortune-dark"
              >
                Reivindicar
              </Button>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso da Coleção</span>
              <span>{ownedItems}/{collection.items.length}</span>
            </div>
            <Progress value={(ownedItems / collection.items.length) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {collection.items.map(itemId => {
              const item = collectibles.find(c => c.id === itemId);
              return item ? (
                <div key={itemId} className={`p-2 rounded-lg border text-center ${
                  item.owned ? getRarityBg(item.rarity) : 'bg-muted/50 border-muted'
                }`}>
                  <div className={`text-sm ${item.owned ? getRarityColor(item.rarity) : 'text-muted-foreground'}`}>
                    {item.icon}
                  </div>
                </div>
              ) : null;
            })}
          </div>

          <div className="text-sm">
            <div className="flex items-center space-x-4 text-fortune-gold">
              <span>Recompensa:</span>
              <div className="flex items-center space-x-1">
                <Coins className="w-4 h-4" />
                <span>{collection.reward.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{collection.reward.xp} XP</span>
              </div>
            </div>
            {collection.reward.permanentBonus && (
              <div className="text-xs text-green-400 mt-1">
                Bônus: {collection.reward.permanentBonus}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Galeria de Colecionáveis
        </h2>
        <p className="text-lg text-muted-foreground">Colecione itens raros e ganhe bônus permanentes!</p>
      </div>

      <Tabs defaultValue="charms" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="charms">Amuletos</TabsTrigger>
          <TabsTrigger value="trophies">Troféus</TabsTrigger>
          <TabsTrigger value="cards">Cartas</TabsTrigger>
          <TabsTrigger value="artifacts">Artefatos</TabsTrigger>
          <TabsTrigger value="collections">Coleções</TabsTrigger>
        </TabsList>

        <TabsContent value="charms">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getCollectiblesByCategory('charms').map(renderCollectibleCard)}
          </div>
        </TabsContent>

        <TabsContent value="trophies">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getCollectiblesByCategory('trophies').map(renderCollectibleCard)}
          </div>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getCollectiblesByCategory('cards').map(renderCollectibleCard)}
          </div>
        </TabsContent>

        <TabsContent value="artifacts">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getCollectiblesByCategory('artifacts').map(renderCollectibleCard)}
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <div className="space-y-4">
            {collections.map(renderCollectionCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};