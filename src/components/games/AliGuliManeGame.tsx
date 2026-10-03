import { useState, useCallback } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

const PIT_COUNT = 14;
const INITIAL_SEEDS = 5;

function createBoard(): number[] {
  return Array.from({ length: PIT_COUNT }, () => INITIAL_SEEDS);
}

export default function AliGuliManeGame() {
  const [board, setBoard] = useState<number[]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [message, setMessage] = useState('Player 1 — select a pit to begin');
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const isPlayerPit = (pit: number, player: number): boolean => {
    return player === 0 ? pit < 7 : pit >= 7;
  };

  const hasSeeds = (b: number[], player: number): boolean => {
    const range = player === 0 ? [0, 6] : [7, 13];
    return b.slice(range[0], range[1] + 1).some((s) => s > 0);
  };

  const checkGameOver = (b: number[], s: [number, number]): boolean => {
    if (!hasSeeds(b, 0) || !hasSeeds(b, 1)) {
      setGameOver(true);
      if (s[0] > s[1]) setMessage('Player 1 wins!');
      else if (s[1] > s[0]) setMessage('Player 2 wins!');
      else setMessage('It\'s a tie!');
      return true;
    }
    return false;
  };

  const handlePitClick = useCallback(
    (pitIndex: number) => {
      if (gameOver || animating) return;
      if (!isPlayerPit(pitIndex, currentPlayer)) return;
      if (board[pitIndex] === 0) return;

      setAnimating(true);
      let b = [...board];
      let seeds = b[pitIndex];
      b[pitIndex] = 0;
      let pos = pitIndex;
      let newScores: [number, number] = [...scores];

      const sow = () => {
        pos = (pos + 1) % PIT_COUNT;
        b[pos]++;
        seeds--;

        if (seeds === 0) {
          // Continue sowing if the pit we landed in has seeds
          if (b[pos] > 1) {
            seeds = b[pos];
            b[pos] = 0;
            setBoard([...b]);
            setTimeout(sow, 150);
            return;
          }

          // Check capture — last seed in empty pit on own side
          if (isPlayerPit(pos, currentPlayer) && b[pos] === 1) {
            const opposite = (pos + 7) % PIT_COUNT;
            const captured = b[opposite];
            if (captured > 0) {
              newScores[currentPlayer] += captured;
              b[opposite] = 0;
              b[pos] = 0;
              setScores(newScores);
              setMessage(`Player ${currentPlayer + 1} captured ${captured} seeds!`);
            } else {
              setMessage(`Player ${(currentPlayer ^ 1) + 1}'s turn`);
            }
          } else {
            setMessage(`Player ${(currentPlayer ^ 1) + 1}'s turn`);
          }

          setBoard(b);
          setCurrentPlayer((p: number) => p ^ 1);
          setAnimating(false);
          checkGameOver(b, newScores);
          return;
        }

        setBoard([...b]);
        setTimeout(sow, 120);
      };

      sow();
    },
    [board, currentPlayer, scores, gameOver, animating]
  );

  const reset = () => {
    setBoard(createBoard());
    setCurrentPlayer(0);
    setScores([0, 0]);
    setMessage('Player 1 — select a pit to begin');
    setGameOver(false);
    setAnimating(false);
  };

  return (
    <GameShell
      title="Ali Guli Mane"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      score={scores[0]}
      bestScore={Math.max(scores[0], scores[1])}
      message={message}
      gameOver={gameOver}
      onReset={reset}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            currentPlayer === 0 && !gameOver
              ? 'border-amber-400/60 bg-amber-900/30'
              : 'border-stone-700/30 bg-stone-900/20'
          }`}
        >
          <span className="font-display text-sm text-amber-200">P1</span>
          <span className="font-display text-lg font-bold text-amber-300">{scores[0]}</span>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            currentPlayer === 1 && !gameOver
              ? 'border-amber-400/60 bg-amber-900/30'
              : 'border-stone-700/30 bg-stone-900/20'
          }`}
        >
          <span className="font-display text-lg font-bold text-amber-300">{scores[1]}</span>
          <span className="font-display text-sm text-amber-200">P2</span>
        </div>
      </div>

      <div className="game-board rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const pitIndex = 13 - i;
            return <AliPit key={`p2-${pitIndex}`} seeds={board[pitIndex]} active={currentPlayer === 1 && !gameOver && board[pitIndex] > 0} onClick={() => handlePitClick(pitIndex)} />;
          })}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent my-2" />
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const pitIndex = i;
            return <AliPit key={`p1-${pitIndex}`} seeds={board[pitIndex]} active={currentPlayer === 0 && !gameOver && board[pitIndex] > 0} onClick={() => handlePitClick(pitIndex)} />;
          })}
        </div>
      </div>
      <p className="font-body text-xs text-amber-100/40 mt-2">
        Click a pit on your side. Seeds are sown continuously — if the last pit has seeds, keep sowing. Capture from the opposite pit when landing in an empty pit on your side.
      </p>
    </GameShell>
  );
}

function AliPit({ seeds, active, onClick }: { seeds: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!active}
      className={`pit aspect-square rounded-2xl flex flex-col items-center justify-center relative ${!active && 'cursor-default'} ${seeds === 0 ? 'pit-empty' : ''}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {seeds > 0 && (
          <div className="grid grid-cols-3 gap-0.5 p-1">
            {Array.from({ length: Math.min(seeds, 12) }).map((_, i) => (
              <div key={i} className="seed w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ opacity: 1 - i * 0.05 }} />
            ))}
          </div>
        )}
      </div>
      <span className="absolute top-1 right-1.5 font-display text-xs text-amber-300/70">{seeds}</span>
    </button>
  );
}
