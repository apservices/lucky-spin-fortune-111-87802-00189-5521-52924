import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CalendarNotificationConfig } from '@/types/calendar';

const NOTIFICATION_STORAGE_KEY = 'calendar_notifications';

export const useNotificationSystem = () => {
  const [config, setConfig] = useState<CalendarNotificationConfig>({
    enabled: false,
    reminderTime: '10:00',
    lastNotificationDate: null
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load notification config from localStorage
    const savedConfig = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse notification config:', error);
      }
    }

    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notificações habilitadas! Você receberá lembretes diários.');
        return true;
      } else {
        toast.error('Permissão de notificação negada');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao solicitar permissão de notificação');
      return false;
    }
  }, []);

  const enableNotifications = useCallback(async (reminderTime: string = '10:00') => {
    const hasPermission = permission === 'granted' || await requestPermission();
    
    if (hasPermission) {
      const newConfig = {
        ...config,
        enabled: true,
        reminderTime
      };
      setConfig(newConfig);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newConfig));
      
      // Schedule daily notifications
      scheduleNotification(reminderTime);
      return true;
    }
    
    return false;
  }, [config, permission, requestPermission]);

  const disableNotifications = useCallback(() => {
    const newConfig = {
      ...config,
      enabled: false
    };
    setConfig(newConfig);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newConfig));
    
    toast.info('Notificações desabilitadas');
  }, [config]);

  const scheduleNotification = useCallback((reminderTime: string) => {
    if (!config.enabled || permission !== 'granted') return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      showNotification();
      // Schedule next notification for tomorrow
      setTimeout(() => scheduleNotification(reminderTime), 24 * 60 * 60 * 1000);
    }, timeUntilNotification);
  }, [config.enabled, permission]);

  const showNotification = useCallback(() => {
    if (permission !== 'granted') return;

    const today = new Date().toDateString();
    
    // Don't show multiple notifications on the same day
    if (config.lastNotificationDate === today) return;

    new Notification('🎁 Fortune Tiger - Recompensa Diária!', {
      body: 'Não esqueça de coletar sua recompensa diária de login!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-reward',
      requireInteraction: false,
      silent: false
    });

    // Update last notification date
    const newConfig = {
      ...config,
      lastNotificationDate: today
    };
    setConfig(newConfig);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newConfig));
  }, [config, permission]);

  const testNotification = useCallback(() => {
    if (permission !== 'granted') {
      toast.error('Permissão de notificação necessária');
      return;
    }

    new Notification('🧪 Teste de Notificação', {
      body: 'Esta é uma notificação de teste! O sistema está funcionando.',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });
    
    toast.success('Notificação de teste enviada!');
  }, [permission]);

  // Setup notification scheduling when config changes
  useEffect(() => {
    if (config.enabled && permission === 'granted') {
      scheduleNotification(config.reminderTime);
    }
  }, [config.enabled, config.reminderTime, permission, scheduleNotification]);

  return {
    config,
    permission,
    enableNotifications,
    disableNotifications,
    testNotification,
    requestPermission,
    isSupported: 'Notification' in window
  };
};

export const NotificationSystem = () => {
  return null; // This is a hook-only component
};