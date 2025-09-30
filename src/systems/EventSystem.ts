/**
 * Custom Event System for Game Events
 * Centralized event management for loose coupling between components
 */

// Event Types
export enum GameEventType {
  // Game Events
  SPIN_START = 'spin:start',
  SPIN_COMPLETE = 'spin:complete',
  WIN = 'game:win',
  BIG_WIN = 'game:bigWin',
  JACKPOT = 'game:jackpot',
  LEVEL_UP = 'player:levelUp',
  ENERGY_DEPLETED = 'player:energyDepleted',
  COINS_SPENT = 'player:coinsSpent',
  
  // UI Events
  THEME_CHANGED = 'ui:themeChanged',
  SETTINGS_UPDATED = 'ui:settingsUpdated',
  TAB_CHANGED = 'ui:tabChanged',
  MODAL_OPENED = 'ui:modalOpened',
  MODAL_CLOSED = 'ui:modalClosed',
  
  // Audio Events
  SOUND_PLAY = 'audio:play',
  SOUND_STOP = 'audio:stop',
  VOLUME_CHANGED = 'audio:volumeChanged',
  
  // Social Events
  REFERRAL_ADDED = 'social:referralAdded',
  ACHIEVEMENT_UNLOCKED = 'social:achievementUnlocked',
  VICTORY_SHARED = 'social:victoryShared',
  
  // System Events
  PERFORMANCE_WARNING = 'system:performanceWarning',
  ERROR_OCCURRED = 'system:error',
  DEBUG_LOG = 'system:debug'
}

// Event Data Interfaces
export interface GameEventData {
  [GameEventType.SPIN_START]: { gameId: string; betAmount: number; timestamp: number };
  [GameEventType.SPIN_COMPLETE]: { gameId: string; result: any; timestamp: number };
  [GameEventType.WIN]: { amount: number; multiplier: number; symbols: string[]; gameId: string };
  [GameEventType.BIG_WIN]: { amount: number; multiplier: number; symbols: string[]; gameId: string };
  [GameEventType.JACKPOT]: { amount: number; symbols: string[]; gameId: string };
  [GameEventType.LEVEL_UP]: { oldLevel: number; newLevel: number; bonus: number };
  [GameEventType.ENERGY_DEPLETED]: { timestamp: number };
  [GameEventType.COINS_SPENT]: { amount: number; reason: string };
  
  [GameEventType.THEME_CHANGED]: { oldTheme: string | null; newTheme: string | null };
  [GameEventType.SETTINGS_UPDATED]: { section: string; changes: Record<string, any> };
  [GameEventType.TAB_CHANGED]: { oldTab: string; newTab: string };
  [GameEventType.MODAL_OPENED]: { modalType: string; data?: any };
  [GameEventType.MODAL_CLOSED]: { modalType: string };
  
  [GameEventType.SOUND_PLAY]: { soundId: string; volume?: number; loop?: boolean };
  [GameEventType.SOUND_STOP]: { soundId: string };
  [GameEventType.VOLUME_CHANGED]: { oldVolume: number; newVolume: number };
  
  [GameEventType.REFERRAL_ADDED]: { referralId: string; referralCode: string };
  [GameEventType.ACHIEVEMENT_UNLOCKED]: { achievementId: string; title: string; reward: number };
  [GameEventType.VICTORY_SHARED]: { platform: string; amount: number; gameId: string };
  
  [GameEventType.PERFORMANCE_WARNING]: { metric: string; value: number; threshold: number };
  [GameEventType.ERROR_OCCURRED]: { error: Error; context: string };
  [GameEventType.DEBUG_LOG]: { message: string; data?: any };
}

// Event Listener Type
type EventListener<T = any> = (data: T) => void;

// Event Emitter Class
class GameEventEmitter {
  private listeners: Map<GameEventType, Set<EventListener>> = new Map();
  private onceListeners: Map<GameEventType, Set<EventListener>> = new Map();
  private debugMode: boolean = false;

  /**
   * Enable or disable debug logging
   */
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  /**
   * Add an event listener
   */
  on<T extends GameEventType>(eventType: T, listener: EventListener<GameEventData[T]>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    if (this.debugMode) {
      console.log(`🎮 Event listener added for ${eventType}`);
    }
    
    // Return unsubscribe function
    return () => this.off(eventType, listener);
  }

  /**
   * Add a one-time event listener
   */
  once<T extends GameEventType>(eventType: T, listener: EventListener<GameEventData[T]>): () => void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }
    
    this.onceListeners.get(eventType)!.add(listener);
    
    if (this.debugMode) {
      console.log(`🎮 One-time event listener added for ${eventType}`);
    }
    
    // Return unsubscribe function
    return () => this.onceListeners.get(eventType)?.delete(listener);
  }

  /**
   * Remove an event listener
   */
  off<T extends GameEventType>(eventType: T, listener: EventListener<GameEventData[T]>) {
    this.listeners.get(eventType)?.delete(listener);
    this.onceListeners.get(eventType)?.delete(listener);
    
    if (this.debugMode) {
      console.log(`🎮 Event listener removed for ${eventType}`);
    }
  }

  /**
   * Emit an event
   */
  emit<T extends GameEventType>(eventType: T, data: GameEventData[T]) {
    if (this.debugMode) {
      console.log(`🎮 Event emitted: ${eventType}`, data);
    }
    
    // Call regular listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
    
    // Call and remove once listeners
    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners) {
      onceListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in once event listener for ${eventType}:`, error);
        }
      });
      this.onceListeners.delete(eventType);
    }
  }

  /**
   * Remove all listeners for a specific event type
   */
  removeAllListeners(eventType?: GameEventType) {
    if (eventType) {
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
    
    if (this.debugMode) {
      console.log(`🎮 All listeners removed${eventType ? ` for ${eventType}` : ''}`);
    }
  }

  /**
   * Get the number of listeners for an event type
   */
  listenerCount(eventType: GameEventType): number {
    const regular = this.listeners.get(eventType)?.size || 0;
    const once = this.onceListeners.get(eventType)?.size || 0;
    return regular + once;
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): GameEventType[] {
    const allTypes = new Set<GameEventType>();
    
    this.listeners.forEach((_, type) => allTypes.add(type));
    this.onceListeners.forEach((_, type) => allTypes.add(type));
    
    return Array.from(allTypes);
  }
}

// Singleton instance
export const gameEvents = new GameEventEmitter();

// React Hook for using events
import { useEffect, useRef } from 'react';

export const useGameEvent = <T extends GameEventType>(
  eventType: T,
  listener: EventListener<GameEventData[T]>,
  dependencies: any[] = []
) => {
  const listenerRef = useRef(listener);
  
  // Update listener ref when dependencies change
  useEffect(() => {
    listenerRef.current = listener;
  }, [dependencies]);
  
  useEffect(() => {
    const wrappedListener = (data: GameEventData[T]) => {
      listenerRef.current(data);
    };
    
    return gameEvents.on(eventType, wrappedListener);
  }, [eventType]);
};

// Hook for emitting events
export const useGameEventEmitter = () => {
  return {
    emit: gameEvents.emit.bind(gameEvents),
    on: gameEvents.on.bind(gameEvents),
    once: gameEvents.once.bind(gameEvents),
    off: gameEvents.off.bind(gameEvents)
  };
};

// Analytics Integration
class EventAnalytics {
  private events: Array<{ type: GameEventType; data: any; timestamp: number }> = [];
  private maxEvents = 1000; // Keep last 1000 events

  constructor() {
    // Listen to all events for analytics
    Object.values(GameEventType).forEach(eventType => {
      gameEvents.on(eventType as GameEventType, (data) => {
        this.recordEvent(eventType as GameEventType, data);
      });
    });
  }

  private recordEvent(type: GameEventType, data: any) {
    this.events.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(type: GameEventType) {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events within a time range
   */
  getEventsByTimeRange(startTime: number, endTime: number) {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    const stats: Record<string, number> = {};
    
    this.events.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Export events for debugging
   */
  exportEvents() {
    return {
      events: this.events,
      stats: this.getEventStats(),
      exportTime: Date.now()
    };
  }

  /**
   * Clear all recorded events
   */
  clearEvents() {
    this.events = [];
  }
}

export const eventAnalytics = new EventAnalytics();

// Development helpers
if (process.env.NODE_ENV === 'development') {
  gameEvents.setDebugMode(true);
  
  // Expose to window for debugging
  (window as any).gameEvents = gameEvents;
  (window as any).eventAnalytics = eventAnalytics;
}
