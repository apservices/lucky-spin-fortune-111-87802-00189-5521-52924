import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Zap } from 'lucide-react';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';

type Suit = '♠' | '♥' | '♦' | '♣';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCard {
  suit: Suit;
  value: CardValue;
  numericValue: number;
}

const BlackjackGame: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { setCoins, setEnergy } = useGameActions();
  
  const [bet, setBet] = useState(50);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'ended'>('betting');
  const [result, setResult] = useState<string>('');
  const [deck, setDeck] = useState<PlayingCard[]>([]);

  // Initialize deck
  const createDeck = (): PlayingCard[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: PlayingCard[] = [];

    suits.forEach(suit => {
      values.forEach(value => {
        let numericValue = parseInt(value);
        if (value === 'A') numericValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        
        newDeck.push({ suit, value, numericValue });
      });
    });

    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = hand.reduce((sum, card) => sum + card.numericValue, 0);
    let aces = hand.filter(card => card.value === 'A').length;

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const dealCard = (currentDeck: PlayingCard[]): [PlayingCard, PlayingCard[]] => {
    const card = currentDeck[0];
    const remainingDeck = currentDeck.slice(1);
    return [card, remainingDeck];
  };

  const startGame = () => {
    if (state.coins < bet) {
      toast.error('Moedas insuficientes!');
      return;
    }

    if (state.energy < 1) {
      toast.error('Energia insuficiente!');
      return;
    }

    setCoins(state.coins - bet);
    setEnergy(state.energy - 1);

    const newDeck = createDeck();
    const [card1, deck1] = dealCard(newDeck);
    const [card2, deck2] = dealCard(deck1);
    const [card3, deck3] = dealCard(deck2);
    const [card4, deck4] = dealCard(deck3);

    setPlayerHand([card1, card3]);
    setDealerHand([card2, card4]);
    setDeck(deck4);
    setGameState('playing');
    setResult('');
  };

  const hit = () => {
    const [newCard, remainingDeck] = dealCard(deck);
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(remainingDeck);

    const handValue = calculateHandValue(newHand);
    if (handValue > 21) {
      endGame('Você estourou! Dealer vence.', 0);
    }
  };

  const stand = () => {
    setGameState('dealer');
    let currentDeck = [...deck];
    let currentDealerHand = [...dealerHand];

    while (calculateHandValue(currentDealerHand) < 17) {
      const [newCard, remainingDeck] = dealCard(currentDeck);
      currentDealerHand.push(newCard);
      currentDeck = remainingDeck;
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const dealerValue = calculateHandValue(currentDealerHand);
    const playerValue = calculateHandValue(playerHand);

    if (dealerValue > 21) {
      endGame('Dealer estourou! Você venceu!', bet * 2);
    } else if (dealerValue > playerValue) {
      endGame('Dealer vence!', 0);
    } else if (playerValue > dealerValue) {
      endGame('Você venceu!', bet * 2);
    } else {
      endGame('Empate!', bet);
    }
  };

  const endGame = (message: string, winnings: number) => {
    setResult(message);
    setGameState('ended');
    if (winnings > 0) {
      setCoins(state.coins + winnings);
      toast.success(`${message} +${winnings} moedas!`);
    } else {
      toast.error(message);
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setResult('');
    setDeck([]);
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <motion.div
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`w-16 h-24 flex flex-col items-center justify-center ${
          hidden ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-white'
        } border-2 shadow-lg`}>
          {hidden ? (
            <div className="text-white text-2xl">🎴</div>
          ) : (
            <>
              <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
                {card.value}
              </div>
              <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
                {card.suit}
              </div>
            </>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <ParticleBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 bg-black/30 backdrop-blur-sm border-b border-primary/20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lobby')}
              className="text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🃏 Blackjack Social
            </h1>

            <div className="flex gap-2">
              <Badge variant="outline" className="bg-black/50 border-yellow-500/50">
                <Coins className="w-3 h-3 mr-1 text-yellow-400" />
                <span className="text-white">{state.coins}</span>
              </Badge>
              <Badge variant="outline" className="bg-black/50 border-blue-500/50">
                <Zap className="w-3 h-3 mr-1 text-blue-400" />
                <span className="text-white">{state.energy}</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full space-y-8">
            
            {/* Dealer Hand */}
            <div className="text-center">
              <h3 className="text-white text-lg mb-4">
                Dealer {gameState !== 'betting' && `(${gameState === 'playing' ? '?' : calculateHandValue(dealerHand)})`}
              </h3>
              <div className="flex justify-center gap-2">
                <AnimatePresence>
                  {dealerHand.map((card, index) => (
                    <div key={index}>
                      {renderCard(card, gameState === 'playing' && index === 1)}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Card className="p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md border-yellow-500/50">
                  <h2 className="text-2xl font-bold text-white">{result}</h2>
                </Card>
              </motion.div>
            )}

            {/* Player Hand */}
            <div className="text-center">
              <h3 className="text-white text-lg mb-4">
                Você {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}
              </h3>
              <div className="flex justify-center gap-2">
                <AnimatePresence>
                  {playerHand.map((card, index) => (
                    <div key={index}>
                      {renderCard(card)}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <Card className="p-6 bg-black/40 backdrop-blur-md border-primary/30">
              {gameState === 'betting' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Aposta</label>
                    <div className="flex gap-2">
                      {[50, 100, 250, 500].map(amount => (
                        <Button
                          key={amount}
                          variant={bet === amount ? "default" : "outline"}
                          onClick={() => setBet(amount)}
                          className="flex-1"
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    disabled={state.coins < bet || state.energy < 1}
                  >
                    Iniciar Jogo
                  </Button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="flex gap-4">
                  <Button
                    onClick={hit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Mais (Hit)
                  </Button>
                  <Button
                    onClick={stand}
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  >
                    Parar (Stand)
                  </Button>
                </div>
              )}

              {gameState === 'ended' && (
                <Button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  Jogar Novamente
                </Button>
              )}
            </Card>

            {/* Info */}
            <div className="text-center text-xs text-gray-400">
              <p>Use moedas virtuais para jogar • Sem valor real</p>
            </div>

          </div>
        </main>
      </div>
    </ParticleBackground>
  );
};

export default BlackjackGame;
