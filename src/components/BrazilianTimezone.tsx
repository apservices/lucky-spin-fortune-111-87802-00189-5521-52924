import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { getBrasiliaTime, formatBrazilianTime, timeUntilMidnightBrasilia } from '@/utils/formatters';

interface BrazilianTimezoneProps {
  showCountdown?: boolean;
  className?: string;
}

export const BrazilianTimezone: React.FC<BrazilianTimezoneProps> = ({ 
  showCountdown = false, 
  className = "" 
}) => {
  const [currentTime, setCurrentTime] = useState(getBrasiliaTime());
  const [timeUntilReset, setTimeUntilReset] = useState(timeUntilMidnightBrasilia());

  useEffect(() => {
    // Update every 30 seconds instead of every second to reduce CPU load
    const interval = setInterval(() => {
      setCurrentTime(getBrasiliaTime());
      setTimeUntilReset(timeUntilMidnightBrasilia());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
        <Clock className="w-3 h-3 mr-1" />
        🇧🇷 {formatBrazilianTime(currentTime)} BRT
      </Badge>
      
      {showCountdown && (
        <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
          Reset em: {String(timeUntilReset.hours).padStart(2, '0')}:
          {String(timeUntilReset.minutes).padStart(2, '0')}:
          {String(timeUntilReset.seconds).padStart(2, '0')}
        </Badge>
      )}
    </div>
  );
};

// Hook for Brazilian timezone events
export const useBrazilianTimezone = () => {
  const [brasiliaTime, setBrasiliaTime] = useState(getBrasiliaTime());
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    let lastDay = brasiliaTime.getDate();
    
    const interval = setInterval(() => {
      const newTime = getBrasiliaTime();
      setBrasiliaTime(newTime);
      
      // Check if it's a new day in Brasília
      if (newTime.getDate() !== lastDay) {
        setIsNewDay(true);
        lastDay = newTime.getDate();
        
        // Reset the flag after 5 seconds
        setTimeout(() => setIsNewDay(false), 5000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [brasiliaTime]);

  const isWeekend = () => {
    const day = brasiliaTime.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isBrazilianHoliday = () => {
    const month = brasiliaTime.getMonth() + 1;
    const day = brasiliaTime.getDate();
    
    // Check for major Brazilian holidays
    const holidays = [
      { month: 1, day: 1 },   // New Year
      { month: 4, day: 21 },  // Tiradentes
      { month: 5, day: 1 },   // Labor Day
      { month: 9, day: 7 },   // Independence Day
      { month: 10, day: 12 }, // Our Lady of Aparecida
      { month: 11, day: 2 },  // All Souls' Day
      { month: 11, day: 15 }, // Proclamation of the Republic
      { month: 12, day: 25 }  // Christmas
    ];

    return holidays.some(holiday => 
      holiday.month === month && holiday.day === day
    );
  };

  return {
    brasiliaTime,
    isNewDay,
    isWeekend: isWeekend(),
    isBrazilianHoliday: isBrazilianHoliday(),
    timeUntilReset: timeUntilMidnightBrasilia()
  };
};