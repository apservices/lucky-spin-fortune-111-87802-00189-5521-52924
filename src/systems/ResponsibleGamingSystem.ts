/**
 * Responsible Gaming System
 * Manages user protection, warnings, and compliance
 */

export interface ResponsibleGamingState {
  sessionStartTime: number;
  totalSessionTime: number;
  dailySpinCount: number;
  dailyCoinsSpent: number;
  continuousPlayTime: number;
  lastSpinTime: number;
  warningLevel: number;
  mandatoryBreak: boolean;
  lastDailyReset: string;
}

export interface GameAlert {
  id: string;
  type: 'warning' | 'mandatory' | 'info';
  title: string;
  message: string;
  duration: number;
  timestamp: number;
  canDismiss: boolean;
}

class ResponsibleGamingManager {
  private state: ResponsibleGamingState;
  private alerts: GameAlert[] = [];
  private listeners: ((alerts: GameAlert[]) => void)[] = [];
  private config: any = {};

  constructor() {
    this.state = this.loadState();
    this.loadConfig();
    this.checkDailyReset();
    this.startMonitoring();
  }

  private loadState(): ResponsibleGamingState {
    const saved = localStorage.getItem('rg-state');
    return saved ? JSON.parse(saved) : {
      sessionStartTime: Date.now(),
      totalSessionTime: 0,
      dailySpinCount: 0,
      dailyCoinsSpent: 0,
      continuousPlayTime: 0,
      lastSpinTime: 0,
      warningLevel: 0,
      mandatoryBreak: false,
      lastDailyReset: new Date().toDateString()
    };
  }

  private async loadConfig() {
    try {
      const response = await fetch('/config/gameParameters.json');
      this.config = await response.json();
    } catch (error) {
      console.warn('Failed to load game config:', error);
      this.config = {
        responsibleGaming: {
          alertIntervals: [30, 60, 90],
          maxContinuousMinutes: 120,
          dailyLimitWarning: 0.80,
          maxSpinsPer30Min: 100
        }
      };
    }
  }

  private saveState() {
    localStorage.setItem('rg-state', JSON.stringify(this.state));
  }

  private checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.lastDailyReset !== today) {
      this.state.dailySpinCount = 0;
      this.state.dailyCoinsSpent = 0;
      this.state.warningLevel = 0;
      this.state.lastDailyReset = today;
      this.saveState();
    }
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateContinuousPlayTime();
      this.checkForAlerts();
    }, 60000); // Check every minute
  }

  private updateContinuousPlayTime() {
    if (this.state.lastSpinTime > 0 && Date.now() - this.state.lastSpinTime < 300000) { // 5 minutes
      this.state.continuousPlayTime += 1;
    } else {
      this.state.continuousPlayTime = 0;
    }
    this.state.totalSessionTime = Math.floor((Date.now() - this.state.sessionStartTime) / 60000);
    this.saveState();
  }

  private checkForAlerts() {
    const { alertIntervals, maxContinuousMinutes, dailyLimitWarning, maxSpinsPer30Min } = this.config.responsibleGaming;
    
    // Continuous play warnings
    if (alertIntervals.includes(this.state.continuousPlayTime)) {
      this.addAlert({
        id: `continuous-${this.state.continuousPlayTime}`,
        type: this.state.continuousPlayTime >= maxContinuousMinutes ? 'mandatory' : 'warning',
        title: 'Lembre-se de fazer pausas!',
        message: this.state.continuousPlayTime >= maxContinuousMinutes 
          ? 'Você jogou por mais de 2 horas. Uma pausa de 15 minutos é obrigatória.'
          : `Você está jogando há ${this.state.continuousPlayTime} minutos. Que tal uma pausa?`,
        duration: this.state.continuousPlayTime >= maxContinuousMinutes ? 0 : 5000,
        timestamp: Date.now(),
        canDismiss: this.state.continuousPlayTime < maxContinuousMinutes
      });
    }

    // Daily limit warning
    const dailyLimitReached = this.state.dailyCoinsSpent >= this.config.bettingLimits?.dailyLimit * dailyLimitWarning;
    if (dailyLimitReached && !this.hasActiveAlert('daily-limit')) {
      this.addAlert({
        id: 'daily-limit',
        type: 'warning',
        title: 'Próximo do limite diário',
        message: 'Você está próximo do seu limite diário de apostas virtuais.',
        duration: 5000,
        timestamp: Date.now(),
        canDismiss: true
      });
    }
  }

  private hasActiveAlert(id: string): boolean {
    return this.alerts.some(alert => alert.id === id);
  }

  private addAlert(alert: GameAlert) {
    // Remove existing alert with same ID
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
    this.alerts.push(alert);
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.alerts));
  }

  // Public methods
  public onSpin(coinsSpent: number): boolean {
    this.checkDailyReset();
    
    // Check mandatory break
    if (this.state.mandatoryBreak) {
      return false;
    }

    // Check daily limits
    if (this.state.dailyCoinsSpent + coinsSpent > this.config.bettingLimits?.dailyLimit) {
      this.addAlert({
        id: 'daily-limit-reached',
        type: 'mandatory',
        title: 'Limite diário atingido',
        message: 'Você atingiu seu limite diário de apostas virtuais. Tente novamente amanhã.',
        duration: 0,
        timestamp: Date.now(),
        canDismiss: false
      });
      return false;
    }

    // Check cooldown
    const timeSinceLastSpin = Date.now() - this.state.lastSpinTime;
    if (timeSinceLastSpin < (this.config.bettingLimits?.cooldownSeconds || 3) * 1000) {
      return false;
    }

    // Update state
    this.state.dailySpinCount++;
    this.state.dailyCoinsSpent += coinsSpent;
    this.state.lastSpinTime = Date.now();
    this.saveState();

    // Show recreational reminder
    if (this.state.dailySpinCount % 50 === 0) {
      this.addAlert({
        id: `recreational-${this.state.dailySpinCount}`,
        type: 'info',
        title: 'Lembrete',
        message: 'Este é um jogo recreativo com moedas virtuais sem valor real!',
        duration: 3000,
        timestamp: Date.now(),
        canDismiss: true
      });
    }

    return true;
  }

  public confirmHighBet(amount: number): boolean {
    if (amount > 500) {
      return confirm(`Confirma aposta de ${amount.toLocaleString('pt-BR')} moedas virtuais?`);
    }
    return true;
  }

  public dismissAlert(alertId: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId || !alert.canDismiss);
    this.notifyListeners();
  }

  public subscribe(listener: (alerts: GameAlert[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): ResponsibleGamingState {
    return { ...this.state };
  }

  public getAlerts(): GameAlert[] {
    return [...this.alerts];
  }

  public takeMandatoryBreak() {
    this.state.mandatoryBreak = true;
    this.state.continuousPlayTime = 0;
    this.saveState();

    // Remove break after 15 minutes
    setTimeout(() => {
      this.state.mandatoryBreak = false;
      this.saveState();
      this.addAlert({
        id: 'break-completed',
        type: 'info',
        title: 'Pausa concluída',
        message: 'Sua pausa obrigatória foi concluída. Você pode voltar a jogar.',
        duration: 3000,
        timestamp: Date.now(),
        canDismiss: true
      });
    }, 15 * 60 * 1000);
  }
}

export const responsibleGaming = new ResponsibleGamingManager();