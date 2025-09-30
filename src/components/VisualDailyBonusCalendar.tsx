import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Crown, 
  Star, 
  Gift, 
  CheckCircle, 
  Lock,
  Flame,
  Bell,
  BellOff,
  Trophy
} from 'lucide-react';
import { CalendarDay, CalendarProgress } from '@/types/calendar';
import { CalendarRewardAnimation } from './CalendarRewardAnimation';
import { useNotificationSystem } from './NotificationSystem';
import { toast } from 'sonner';

interface VisualDailyBonusCalendarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  calendarDays: CalendarDay[];
  progress: CalendarProgress;
  onClaimReward: (day: number) => boolean;
  onRewardClaimed?: (coins: number, xp: number) => void;
}

export const VisualDailyBonusCalendar: React.FC<VisualDailyBonusCalendarProps> = ({
  isOpen,
  onOpenChange,
  calendarDays,
  progress,
  onClaimReward,
  onRewardClaimed
}) => {
  const [animatingReward, setAnimatingReward] = useState<CalendarDay | null>(null);
  const { config: notificationConfig, enableNotifications, disableNotifications, testNotification, permission } = useNotificationSystem();

  const handleClaimReward = (day: CalendarDay) => {
    if (!day.available || day.claimed) return;
    
    const success = onClaimReward(day.day);
    if (success) {
      setAnimatingReward(day);
      
      // Call the parent callback with reward details
      onRewardClaimed?.(day.reward.coins, day.reward.xp || 0);
      
      // Show success toast after animation
      setTimeout(() => {
        toast.success(
          `🎁 Dia ${day.day} coletado! +${day.reward.coins} moedas${day.reward.xp ? ` +${day.reward.xp} XP` : ''}`,
          {
            duration: 3000,
            style: {
              background: 'hsl(var(--pgbet-gold))',
              color: 'hsl(var(--pgbet-dark))',
            }
          }
        );
      }, 1000);
    }
  };

  const getRewardIcon = (reward: any) => {
    switch (reward.type) {
      case 'skin':
        return <Crown className="w-6 h-6 text-pgbet-gold" />;
      case 'multiplier':
        return <Star className="w-6 h-6 text-pgbet-purple" />;
      case 'theme':
        return <Gift className="w-6 h-6 text-pgbet-emerald" />;
      case 'special':
        return <Trophy className="w-6 h-6 text-pgbet-crimson" />;
      default:
        return <Gift className="w-4 h-4 text-pgbet-amber" />;
    }
  };

  const getCardStyle = (day: CalendarDay) => {
    if (day.claimed) {
      return "bg-muted/30 border-muted opacity-60 transform scale-95";
    }
    if (day.available && day.status === 'current') {
      return `bg-gradient-to-br from-pgbet-gold/20 to-pgbet-amber/20 border-pgbet-gold 
              animate-pgbet-glow hover:scale-105 transition-all duration-300`;
    }
    if (day.status === 'past' && !day.claimed) {
      return "bg-gradient-to-br from-pgbet-red/10 to-pgbet-crimson/10 border-pgbet-red/50 hover:scale-102";
    }
    return "bg-card/50 border-border/30 opacity-75";
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-pgbet-gold text-pgbet-dark';
      case 'epic': return 'bg-pgbet-purple text-white';
      case 'rare': return 'bg-pgbet-emerald text-white';
      default: return 'bg-pgbet-amber text-pgbet-dark';
    }
  };

  const getDaysInWeek = (weekIndex: number) => {
    const startDay = weekIndex * 7 + 1;
    return calendarDays.slice(startDay - 1, startDay + 6);
  };

  const currentDay = new Date().getDate();
  const availableReward = calendarDays.find(d => d.day === currentDay && d.available);
  const streakProgress = (progress.currentStreak / 7) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl bg-gradient-to-r from-pgbet-gold to-pgbet-amber bg-clip-text text-transparent">
              🗓️ Calendário de Recompensas Diárias
            </DialogTitle>
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Faça login todos os dias para receber recompensas incríveis!
              </p>
              
              {/* Progress Stats */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-pgbet-red" />
                  <span>Sequência: {progress.currentStreak} dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-pgbet-gold" />
                  <span>Recorde: {progress.longestStreak} dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pgbet-emerald" />
                  <span>Total: {progress.totalDaysLogged} dias</span>
                </div>
              </div>

              {/* Streak Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progresso da Sequência Semanal</span>
                  <span>{progress.currentStreak}/7</span>
                </div>
                <Progress value={streakProgress} className="h-2 bg-muted" />
              </div>
            </div>
          </DialogHeader>

          {/* Notification Controls */}
          <div className="bg-card/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationConfig.enabled ? (
                  <Bell className="w-5 h-5 text-pgbet-emerald" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">
                    {notificationConfig.enabled ? 'Notificações Ativadas' : 'Notificações Desativadas'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {notificationConfig.enabled 
                      ? `Lembretes diários às ${notificationConfig.reminderTime}`
                      : 'Ative para receber lembretes de login'
                    }
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {notificationConfig.enabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disableNotifications}
                  >
                    Desativar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enableNotifications('10:00')}
                    disabled={permission === 'denied'}
                  >
                    Ativar Lembretes
                  </Button>
                )}
                {notificationConfig.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testNotification}
                  >
                    Testar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, weekIndex) => {
              const weekDays = getDaysInWeek(weekIndex);
              
              return (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <Card 
                      key={day.day} 
                      className={`p-3 relative transition-all duration-300 cursor-pointer ${getCardStyle(day)}`}
                      onClick={() => handleClaimReward(day)}
                    >
                      {/* Status indicators */}
                      {day.claimed && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-5 h-5 text-pgbet-emerald bg-background rounded-full" />
                        </div>
                      )}
                      
                      {day.status === 'future' && (
                        <div className="absolute -top-1 -right-1">
                          <Lock className="w-4 h-4 text-muted-foreground bg-background rounded-full p-0.5" />
                        </div>
                      )}

                      {day.status === 'current' && !day.claimed && (
                        <div className="absolute -top-1 -right-1 animate-pgbet-glow">
                          <Clock className="w-5 h-5 text-pgbet-gold bg-background rounded-full p-0.5" />
                        </div>
                      )}

                      <div className="text-center space-y-2">
                        {/* Day number */}
                        <div className="font-bold text-lg">
                          {day.day}
                        </div>

                        {/* Reward icon */}
                        <div className="flex justify-center">
                          {getRewardIcon(day.reward)}
                        </div>

                        {/* Reward info */}
                        <div className="space-y-1">
                          <div className="text-xs font-medium">
                            {day.reward.coins} 🪙
                          </div>
                          {day.reward.xp && (
                            <div className="text-xs text-muted-foreground">
                              +{day.reward.xp} XP
                            </div>
                          )}
                        </div>

                        {/* Rarity badge */}
                        {day.reward.rarity !== 'common' && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1 py-0 ${getRarityBadgeColor(day.reward.rarity)}`}
                          >
                            {day.reward.rarity.toUpperCase()}
                          </Badge>
                        )}

                        {/* Action button */}
                        <Button
                          size="sm"
                          variant={day.claimed ? "secondary" : day.available ? "default" : "outline"}
                          disabled={!day.available || day.claimed}
                          className={`w-full h-8 text-xs ${
                            day.available && !day.claimed && day.status === 'current'
                              ? 'bg-gradient-to-r from-pgbet-gold to-pgbet-amber hover:scale-105 animate-pgbet-glow' 
                              : ''
                          }`}
                        >
                          {day.claimed ? 'Coletado' : day.available ? 'Coletar' : 'Bloqueado'}
                        </Button>
                      </div>

                      {/* Special day highlights */}
                      {[7, 14, 21, 30].includes(day.day) && (
                        <div className="absolute inset-0 rounded-lg border-2 border-pgbet-gold/30 pointer-events-none" />
                      )}
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Calendar legend */}
          <div className="bg-card/30 rounded-lg p-4 mt-6">
            <div className="text-sm font-medium mb-3">Dias Especiais:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-pgbet-crimson" />
                <span>Dia 7: Bônus Semanal</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-pgbet-emerald" />
                <span>Dia 14: Tema Temporário</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-pgbet-purple" />
                <span>Dia 21: Multiplicador 2x</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-pgbet-gold" />
                <span>Dia 30: Skin Exclusiva</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground p-4 border-t">
            <p>O calendário reseta automaticamente a cada mês. Mantenha sua sequência!</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reward Animation */}
      <CalendarRewardAnimation
        reward={animatingReward?.reward || { type: 'coins', coins: 0, description: '', icon: '🪙', rarity: 'common' }}
        isVisible={!!animatingReward}
        onComplete={() => setAnimatingReward(null)}
      />
    </>
  );
};