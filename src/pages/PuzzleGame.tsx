import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Zap, Trophy, Star } from 'lucide-react';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';

type TileType = 'tiger' | 'dragon' | 'phoenix' | 'panda' | 'coin' | 'gem';

interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
}

const TILE_ICONS: Record<TileType, string> = {
  tiger: '🐅',
  dragon: '🐉',
  phoenix: '🦅',
  panda: '🐼',
  coin: '💰',
  gem: '💎'
};

const GRID_SIZE = 8;
const MATCH_REQUIRED = 3;

const PuzzleGame: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { setCoins, setEnergy } = useGameActions();
  
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [combo, setCombo] = useState(0);

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const types: TileType[] = ['tiger', 'dragon', 'phoenix', 'panda', 'coin', 'gem'];
    const newGrid: Tile[][] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const type = types[Math.floor(Math.random() * types.length)];
        newGrid[row][col] = {
          id: `${row}-${col}`,
          type,
          row,
          col
        };
      }
    }

    setGrid(newGrid);
    setScore(0);
    setMoves(30);
    setGameState('playing');
    setCombo(0);
  };

  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;

    if (!selectedTile) {
      setSelectedTile({ row, col });
      return;
    }

    // Check if tiles are adjacent
    const isAdjacent = 
      (Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col) ||
      (Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row);

    if (isAdjacent) {
      swapTiles(selectedTile, { row, col });
      setSelectedTile(null);
    } else {
      setSelectedTile({ row, col });
    }
  };

  const swapTiles = (tile1: {row: number, col: number}, tile2: {row: number, col: number}) => {
    const newGrid = grid.map(row => [...row]);
    const temp = newGrid[tile1.row][tile1.col];
    newGrid[tile1.row][tile1.col] = newGrid[tile2.row][tile2.col];
    newGrid[tile2.row][tile2.col] = temp;

    // Update IDs
    newGrid[tile1.row][tile1.col].row = tile1.row;
    newGrid[tile1.row][tile1.col].col = tile1.col;
    newGrid[tile2.row][tile2.col].row = tile2.row;
    newGrid[tile2.row][tile2.col].col = tile2.col;

    setGrid(newGrid);
    setMoves(moves - 1);

    // Check for matches after a short delay
    setTimeout(() => {
      checkMatches(newGrid);
    }, 300);
  };

  const checkMatches = (currentGrid: Tile[][]) => {
    const toRemove: Set<string> = new Set();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col <= GRID_SIZE - MATCH_REQUIRED; col++) {
        const type = currentGrid[row][col].type;
        let matchCount = 1;
        
        for (let i = 1; i < MATCH_REQUIRED; i++) {
          if (currentGrid[row][col + i].type === type) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= MATCH_REQUIRED) {
          for (let i = 0; i < matchCount; i++) {
            toRemove.add(currentGrid[row][col + i].id);
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row <= GRID_SIZE - MATCH_REQUIRED; row++) {
        const type = currentGrid[row][col].type;
        let matchCount = 1;
        
        for (let i = 1; i < MATCH_REQUIRED; i++) {
          if (currentGrid[row + i][col].type === type) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= MATCH_REQUIRED) {
          for (let i = 0; i < matchCount; i++) {
            toRemove.add(currentGrid[row + i][col].id);
          }
        }
      }
    }

    if (toRemove.size > 0) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = toRemove.size * 10 * newCombo;
      setScore(score + points);
      toast.success(`${toRemove.size} matches! +${points} pontos (Combo x${newCombo})`);
      
      removeAndFill(currentGrid, toRemove);
    } else {
      setCombo(0);
      checkGameEnd();
    }
  };

  const removeAndFill = (currentGrid: Tile[][], toRemove: Set<string>) => {
    const newGrid = currentGrid.map(row => [...row]);
    const types: TileType[] = ['tiger', 'dragon', 'phoenix', 'panda', 'coin', 'gem'];

    // Remove matched tiles and shift down
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptyCount = 0;
      
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (toRemove.has(newGrid[row][col].id)) {
          emptyCount++;
        } else if (emptyCount > 0) {
          newGrid[row + emptyCount][col] = newGrid[row][col];
          newGrid[row + emptyCount][col].row = row + emptyCount;
        }
      }

      // Fill top with new tiles
      for (let i = 0; i < emptyCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        newGrid[i][col] = {
          id: `new-${i}-${col}-${Date.now()}`,
          type,
          row: i,
          col
        };
      }
    }

    setGrid(newGrid);

    // Check for new matches
    setTimeout(() => {
      checkMatches(newGrid);
    }, 500);
  };

  const checkGameEnd = () => {
    if (moves <= 0) {
      setGameState('ended');
      const reward = Math.floor(score / 10);
      setCoins(state.coins + reward);
      toast.success(`🎮 Jogo finalizado! Pontuação: ${score} (+${reward} moedas)`);
    }
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
              🎮 Zodiac Match
            </h1>

            <div className="flex gap-2">
              <Badge variant="outline" className="bg-black/50 border-yellow-500/50">
                <Trophy className="w-3 h-3 mr-1 text-yellow-400" />
                <span className="text-white">{score}</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full space-y-4">
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center bg-black/40 backdrop-blur-md border-primary/30">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-xs text-gray-400">Pontos</div>
              </Card>
              <Card className="p-3 text-center bg-black/40 backdrop-blur-md border-primary/30">
                <div className="text-2xl font-bold text-blue-400">{moves}</div>
                <div className="text-xs text-gray-400">Movimentos</div>
              </Card>
              <Card className="p-3 text-center bg-black/40 backdrop-blur-md border-primary/30">
                <div className="text-2xl font-bold text-orange-400">x{combo}</div>
                <div className="text-xs text-gray-400">Combo</div>
              </Card>
            </div>

            {/* Grid */}
            <Card className="p-4 bg-black/40 backdrop-blur-md border-primary/30">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                <AnimatePresence>
                  {grid.map((row, rowIndex) =>
                    row.map((tile, colIndex) => (
                      <motion.button
                        key={tile.id}
                        layoutId={tile.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTileClick(rowIndex, colIndex)}
                        className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all ${
                          selectedTile?.row === rowIndex && selectedTile?.col === colIndex
                            ? 'bg-yellow-500 ring-2 ring-yellow-300'
                            : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                        }`}
                        disabled={gameState !== 'playing'}
                      >
                        {TILE_ICONS[tile.type]}
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Controls */}
            {gameState === 'ended' && (
              <Card className="p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md border-yellow-500/50 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white mb-2">Jogo Finalizado!</h2>
                <p className="text-white/70 mb-4">Pontuação: {score}</p>
                <Button
                  onClick={initializeGrid}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  Jogar Novamente
                </Button>
              </Card>
            )}

            {/* Info */}
            <div className="text-center text-xs text-gray-400">
              <p>Combine 3 ou mais símbolos iguais • Faça combos para mais pontos!</p>
            </div>

          </div>
        </main>
      </div>
    </ParticleBackground>
  );
};

export default PuzzleGame;
