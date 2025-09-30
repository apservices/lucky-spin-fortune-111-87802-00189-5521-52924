import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame } from 'lucide-react';
import { VisualDailyBonusCalendar } from './VisualDailyBonusCalendar';
import { useCalendarProgress } from '@/hooks/useCalendarProgress';
import { useLocalization } from '@/hooks/useLocalization';
import { BrazilianTimezone } from './BrazilianTimezone';

interface CalendarRewardSystemProps {
  onCoinsChange?: (coins: number) => void;
  onXPChange?: (xp: number) => void;
  onThemeChange?: (themeId: string | null) => void;
  onMultiplierChange?: (multiplier: number) => void;
}

export const CalendarRewardSystem: React.FC<CalendarRewardSystemProps> = ({
  onCoinsChange,
  onXPChange,
  onThemeChange,
  onMultiplierChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, formatNumber, symbols } = useLocalization();
  const { 
    progress, 
    calendarDays, 
    claimReward,
    getActiveMultiplier,
    getActiveTheme
  } = useCalendarProgress();

  const handleClaimReward = (day: number): boolean => {
    const dayData = calendarDays.find(d => d.day === day);
    if (!dayData) return false;

    const success = claimReward(day);
    
    if (success && dayData) {
      // Notify parent components of changes
      onCoinsChange?.(dayData.reward.coins);
      onXPChange?.(dayData.reward.xp || 0);
      
      // Handle special rewards
      if (dayData.reward.type === 'theme') {
        onThemeChange?.(getActiveTheme());
      }
      
      if (dayData.reward.type === 'multiplier') {
        onMultiplierChange?.(getActiveMultiplier());
      }
    }

    return success;
  };

  const handleRewardClaimed = (coins: number, xp: number) => {
    onCoinsChange?.(coins);
    onXPChange?.(xp);
  };

  const today = new Date().getDate();
  const todayReward = calendarDays.find(d => d.day === today);
  const hasAvailableReward = todayReward && todayReward.available && !todayReward.claimed;
  const activeMultiplier = getActiveMultiplier();
  const activeTheme = getActiveTheme();

  return (
    <>
      <div className="space-y-2">
        <BrazilianTimezone showCountdown className="justify-center" />
        
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(true)}
          className={`
            relative bg-gradient-to-r from-primary/10 to-secondary/10 
            hover:from-primary/20 hover:to-secondary/20 transition-all duration-300
            ${hasAvailableReward ? 'animate-pgbet-glow border-pgbet-gold' : ''}
            w-full
          `}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {symbols.brazilian.flag} Calendário Brasileiro {symbols.luck.sparkles}
          
          {/* Current streak indicator */}
          {progress.currentStreak > 0 && (
            <div className="flex items-center ml-2 gap-1">
              <Flame className="w-3 h-3 text-pgbet-red" />
              <span className="text-xs">{progress.currentStreak}</span>
            </div>
          )}
          
          {/* Available reward badge */}
          {hasAvailableReward && (
            <Badge 
              variant="secondary" 
              className="ml-2 animate-bounce-coin bg-pgbet-gold text-pgbet-dark"
            >
              Dia {formatNumber(today)} 🎁
            </Badge>
          )}
          
          {/* Active effects indicators */}
          {activeMultiplier > 1 && (
            <Badge 
              variant="outline" 
              className="ml-1 text-xs bg-pgbet-purple/20 text-pgbet-purple border-pgbet-purple/30"
            >
              {activeMultiplier}x
            </Badge>
          )}
          
          {activeTheme && (
            <Badge 
              variant="outline" 
              className="ml-1 text-xs bg-pgbet-emerald/20 text-pgbet-emerald border-pgbet-emerald/30"
            >
              🎨
            </Badge>
          )}
          
          {/* Pulse effect for available rewards */}
          {hasAvailableReward && (
            <div className="absolute inset-0 rounded-md bg-pgbet-gold/10 animate-pulse pointer-events-none" />
          )}
        </Button>
      </div>

      <VisualDailyBonusCalendar
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        calendarDays={calendarDays}
        progress={progress}
        onClaimReward={handleClaimReward}
        onRewardClaimed={handleRewardClaimed}
      />
    </>
  );
};