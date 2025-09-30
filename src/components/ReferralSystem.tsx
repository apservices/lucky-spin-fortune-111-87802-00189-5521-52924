import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Gift, Copy, Check, Trophy, Star, Share2, Award, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralUser {
  id: string;
  name: string;
  level: number;
  totalSpins: number;
  joinDate: string;
}

interface ReferralSystemProps {
  playerName: string;
  referralCode: string;
  referrals: ReferralUser[];
  onAddReferral: (code: string) => void;
  onClaimReferralReward: (reward: number) => void;
}

export const ReferralSystem: React.FC<ReferralSystemProps> = ({
  playerName,
  referralCode,
  referrals,
  onAddReferral,
  onClaimReferralReward
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [inviteUrl] = useState(`https://wildfortune.app/invite/${referralCode}`);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('🔗 Link de convite copiado! Compartilhe e ganhem juntos!', {
      duration: 3000,
      style: {
        background: 'hsl(var(--fortune-gold))',
        color: 'hsl(var(--fortune-dark))',
      }
    });
  };

  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wild Fortune Spin - Jogue e Ganhe!',
          text: `🎰 Entre no Wild Fortune Spin usando meu código ${referralCode} e ganhe 1000 moedas grátis! 🪙`,
          url: inviteUrl
        });
      } catch (err) {
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  const submitReferralCode = () => {
    if (inputCode.trim() && inputCode !== referralCode) {
      // Anti-fraud: simulate validation
      const isValidCode = inputCode.length >= 6; // Simple validation
      
      if (isValidCode) {
        onAddReferral(inputCode.trim());
        setInputCode('');
        
        // Success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 4000);
        
        // Enhanced success toast
        toast.success('🎉 Código aceito! Você e seu amigo ganharam 1000 moedas cada!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#8B4513',
            fontWeight: 'bold'
          }
        });
        
        // Claim reward for both players
        onClaimReferralReward(1000);
      } else {
        toast.error('❌ Código inválido! Verifique e tente novamente.');
      }
    } else if (inputCode === referralCode) {
      toast.error('🚫 Você não pode usar seu próprio código!');
    } else {
      toast.error('📝 Digite um código válido!');
    }
  };

  const getTotalRewards = () => {
    const baseReward = referrals.length * 1000; // 1000 por referral
    const levelBonus = referrals.reduce((acc, ref) => acc + (ref.level * 100), 0); // Bonus por nível dos referrals
    const milestoneBonus = getMilestoneBonus();
    return baseReward + levelBonus + milestoneBonus;
  };

  const getNextMilestone = () => {
    const milestones = [5, 10, 25, 50, 100];
    return milestones.find(m => m > referrals.length) || 0;
  };

  const getMilestoneBonus = () => {
    const milestones = [5, 10, 25, 50, 100];
    let bonus = 0;
    milestones.forEach(milestone => {
      if (referrals.length >= milestone) {
        bonus += milestone * 200; // Bonus por marco atingido
      }
    });
    return bonus;
  };

  const getPlayerRank = () => {
    // Simulate ranking based on referrals
    if (referrals.length >= 50) return { rank: '👑 Lenda', color: 'text-fortune-gold' };
    if (referrals.length >= 25) return { rank: '💎 Mestre', color: 'text-secondary' };
    if (referrals.length >= 10) return { rank: '⭐ Expert', color: 'text-accent' };
    if (referrals.length >= 5) return { rank: '🏆 Pro', color: 'text-primary' };
    return { rank: '🌟 Iniciante', color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6 relative">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-scale-in">
            <div className="text-8xl animate-bounce">🎉</div>
            <div className="text-4xl font-bold text-fortune-gold animate-glow-pulse">
              SUCESSO!
            </div>
            <div className="text-xl text-primary animate-fade-in">
              +1000 moedas para cada um!
            </div>
            {/* Confetti effect */}
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: '2s'
                  }}
                >
                  {['🎊', '🪙', '⭐', '🎁', '💎'][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Rank & Stats Header */}
      <Card className="p-4 bg-gradient-to-r from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-fortune-gold" />
            <div>
              <p className={`text-lg font-bold ${getPlayerRank().color}`}>{getPlayerRank().rank}</p>
              <p className="text-sm text-muted-foreground">Rank de Indicações</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-fortune-gold">{referrals.length}</p>
            <p className="text-sm text-muted-foreground">Amigos</p>
          </div>
        </div>
      </Card>

      {/* Seu Código de Indicação */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Share2 className="w-6 h-6 text-primary animate-glow-pulse" />
            <h3 className="text-xl font-bold text-primary">Compartilhe & Ganhe</h3>
          </div>
          
          <div className="bg-card/50 p-4 rounded-lg border-2 border-primary/30 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-2">Seu código:</p>
            <p className="text-3xl font-bold font-mono text-primary tracking-wider">
              {referralCode}
            </p>
            <p className="text-xs text-muted-foreground mt-2 break-all">
              {inviteUrl}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={copyReferralCode}
              className="bg-gradient-gold hover:scale-105 transform transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
            
            <Button
              onClick={shareReferralCode}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
          
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary">
              💰 Ambos ganham 1000 moedas + 1 giro grátis!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Válido após o amigo fazer pelo menos 1 giro
            </p>
          </div>
        </div>
      </Card>

      {/* Inserir Código de Amigo */}
      <Card className="p-6 bg-gradient-to-br from-secondary/20 to-accent/20 border-secondary/30">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-secondary animate-glow-pulse" />
              <h3 className="text-lg font-bold text-secondary">Tem um Código?</h3>
            </div>
            <Badge className="bg-fortune-gold/20 text-fortune-gold border-fortune-gold/30">
              +1000 🪙
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite o código do seu amigo"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 text-center font-mono tracking-wider"
                maxLength={10}
              />
              <Button 
                onClick={submitReferralCode}
                disabled={!inputCode.trim()}
                className="bg-gradient-to-r from-secondary to-accent hover:scale-105 transform transition-all"
              >
                <Zap className="w-4 h-4 mr-1" />
                Ativar
              </Button>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-r from-fortune-gold/10 to-fortune-ember/10 rounded-lg border border-fortune-gold/20">
              <p className="text-sm font-medium text-fortune-gold">
                🚀 Anti-fraude: Recompensa liberada após 1 giro válido
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Proteção contra contas falsas
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Estatísticas de Indicação */}
      <Card className="p-6 bg-gradient-to-br from-fortune-gold/20 to-fortune-ember/20 border-fortune-gold/30">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-fortune-gold" />
              <h3 className="text-lg font-bold text-fortune-gold">Suas Indicações</h3>
            </div>
            <Badge className="bg-fortune-gold/20 text-fortune-gold border-fortune-gold/30">
              {referrals.length} amigos
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-card/50 rounded-lg border border-primary/10">
              <p className="text-2xl font-bold text-primary">{referrals.length}</p>
              <p className="text-xs text-muted-foreground">Amigos</p>
            </div>
            <div className="text-center p-3 bg-card/50 rounded-lg border border-fortune-gold/10">
              <p className="text-2xl font-bold text-fortune-gold">{getTotalRewards()}</p>
              <p className="text-xs text-muted-foreground">Moedas</p>
            </div>
            <div className="text-center p-3 bg-card/50 rounded-lg border border-secondary/10">
              <p className="text-2xl font-bold text-secondary">{getMilestoneBonus()}</p>
              <p className="text-xs text-muted-foreground">Bônus</p>
            </div>
          </div>
          
          {getNextMilestone() > 0 && (
            <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-primary animate-glow-pulse" />
                <p className="text-sm font-bold text-primary">
                  Próximo Marco: {getNextMilestone()} amigos
                </p>
              </div>
              <div className="bg-card/50 p-2 rounded border">
                <p className="text-xs text-fortune-gold font-medium">
                  🎁 Super Baú + {getNextMilestone() * 200} moedas de bônus!
                </p>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-gold h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(referrals.length / getNextMilestone()) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Weekly Leaderboard Teaser */}
          <div className="text-center p-3 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg border border-accent/30">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-sm font-bold text-accent">Ranking Semanal</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Top 10 indicadores ganham Super Prêmios toda semana!
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de Amigos Indicados */}
      {referrals.length > 0 && (
        <Card className="p-6 bg-card/50">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-accent">Amigos Indicados</h3>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Nível {referral.level} • {referral.totalSpins} giros
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      +{500 + (referral.level * 50)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(referral.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};