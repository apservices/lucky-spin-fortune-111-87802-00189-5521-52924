// Brazilian Portuguese Localization System
export const brazilianTexts = {
  // Currency
  currency: {
    symbol: 'R$',
    virtualSuffix: ' (virtual)',
    coins: 'moedas',
    chips: 'fichas',
    balance: 'saldo'
  },

  // Gameplay expressions
  expressions: {
    luck: [
      'Que sorte!', 'Arrasou!', 'Mandou bem!', 'Incrível!', 
      'Show de bola!', 'Tá pegando fogo!', 'Bingo!', 'Perfeito!'
    ],
    encouragement: [
      'Vai que é tua!', 'Não para não!', 'Continua assim!', 
      'Tá no caminho certo!', 'Vem mais!', 'Bora lá!'
    ],
    celebration: [
      'Parabéns!', 'Fantástico!', 'Sensacional!', 'Épico!',
      'Maravilhoso!', 'Excelente!', 'Demais!'
    ],
    bigWin: [
      'JACKPOT BRASILEIRO!', 'MEGA PRÊMIO!', 'FORTUNA GIGANTE!',
      'ACERTOU NA LOTERIA!', 'CHUVA DE MOEDAS!', 'RIQUEZA TOTAL!'
    ]
  },

  // UI Elements
  ui: {
    // Navigation
    games: 'Jogos',
    missions: 'Missões',
    collectibles: 'Colecionáveis',
    vip: 'VIP',
    rewards: 'Recompensas',
    stats: 'Estatísticas',
    settings: 'Configurações',
    
    // Game actions
    play: 'Jogar',
    spin: 'Girar',
    autoSpin: 'Giro Automático',
    turboMode: 'Modo Turbo',
    maxBet: 'Aposta Máxima',
    
    // Status
    energy: 'Energia',
    level: 'Nível',
    experience: 'Experiência',
    totalSpins: 'Total de Giros',
    dailyStreak: 'Sequência Diária',
    
    // Buttons
    collect: 'Coletar',
    claim: 'Resgatar',
    continue: 'Continuar',
    back: 'Voltar',
    close: 'Fechar',
    confirm: 'Confirmar',
    cancel: 'Cancelar'
  },

  // Game names with Brazilian flair
  games: {
    fortuneTiger: 'Fortune Tiger Brasileiro',
    wheelFortune: 'Roda da Fortuna',
    wildSlots: 'Slots Selvagens',
    dragonTreasure: 'Tesouro do Dragão',
    phoenixFire: 'Fogo da Fênix',
    goldenPalace: 'Palácio Dourado',
    carnivalSlots: 'Slots do Carnaval',
    footballFortune: 'Fortuna do Futebol',
    acaiBerry: 'Açaí da Sorte',
    brigadeiro: 'Doce Fortuna'
  },

  // Notifications and messages
  messages: {
    welcome: 'Bem-vindo ao maior cassino virtual do Brasil!',
    insufficientEnergy: 'Energia insuficiente! Aguarde a recarga.',
    insufficientCoins: 'Moedas insuficientes para esta aposta.',
    levelUp: 'Parabéns! Você subiu para o nível {level}!',
    newGameUnlocked: 'Novo jogo desbloqueado: {gameName}!',
    dailyRewardClaimed: 'Recompensa diária coletada!',
    bigWin: 'Grande vitória! Você ganhou {amount} moedas!',
    jackpot: 'JACKPOT! Prêmio máximo de {amount} moedas!',
    comingSoon: 'Em breve! Este jogo incrível está sendo desenvolvido...'
  },

  // Time and dates
  time: {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    now: 'Agora',
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',
    brasilia: 'Horário de Brasília'
  },

  // Cultural references
  cultural: {
    greetings: [
      'E aí, campeão!', 'Opa, beleza?', 'Tudo certo?', 
      'Como vai, parceiro?', 'Oi, sumido!'
    ],
    goodLuck: [
      'Boa sorte!', 'Que Deus te abençoe!', 'Vai dar tudo certo!',
      'Sucesso aí!', 'Tô torcendo por você!'
    ]
  }
};

export type LocalizationKey = keyof typeof brazilianTexts;

export const getRandomExpression = (category: keyof typeof brazilianTexts.expressions): string => {
  const expressions = brazilianTexts.expressions[category];
  return expressions[Math.floor(Math.random() * expressions.length)];
};

export const getRandomGreeting = (): string => {
  return brazilianTexts.cultural.greetings[
    Math.floor(Math.random() * brazilianTexts.cultural.greetings.length)
  ];
};

export const formatMessage = (messageKey: string, params: Record<string, any> = {}): string => {
  let message = messageKey;
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value.toString());
  });
  return message;
};