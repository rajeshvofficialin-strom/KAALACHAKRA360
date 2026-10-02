import { useState, useCallback } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';

const PIT_COUNT = 14;
const INITIAL_SEEDS = 6;

function createBoard(): number[] {
  return Array.from({ length: PIT_COUNT }, () => INITIAL_SEEDS);
}

export default function PallanguzhiGame() {
  const [board, setBoard] = useState<number[]>(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [message, setMessage] = useState('Player 1 — select a pit to begin');
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);

  const isPlayerPit = (pit: number, player: number): boolean => {
    return player === 0 ? pit < 7 : pit >= 7;
  };

  const hasSeeds = (player: number): boolean => {
    const range = player === 0 ? [0, 6] : [7, 13];
    return board.slice(range[0], range[1] + 1).some((s) => s > 0);
  };

  const checkGameOver = (b: number[], s: [number, number]): boolean => {
    if (!hasSeeds(0) || !hasSeeds(1)) {
      setGameOver(true);
      const [s0, s1] = s;
      if (s0 > s1) setMessage('Player 1 wins!');
      else if (s1 > s0) setMessage('Player 2 wins!');
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
        if (seeds === 0) {
          // Check capture
          const lastPos = pos === 0 ? PIT_COUNT - 1 : pos - 1;
          if (isPlayerPit(lastPos, currentPlayer) && b[lastPos] === 1) {
            const opposite = (lastPos + 7) % PIT_COUNT;
            const captured = b[lastPos] + b[opposite];
            newScores[currentPlayer] += captured;
            b[lastPos] = 0;
            b[opposite] = 0;
            setScores(newScores);
            setMessage(`Player ${currentPlayer + 1} captured ${captured} seeds!`);
          } else {
            setMessage(`Player ${(currentPlayer ^ 1) + 1}'s turn`);
          }

          setBoard(b);
          setCurrentPlayer((p: number) => p ^ 1);
          setAnimating(false);
          checkGameOver(b, newScores);
          return;
        }

        pos = (pos + 1) % PIT_COUNT;
        b[pos]++;
        seeds--;
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
    <div className="space-y-4">
      {/* Score and status */}
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            currentPlayer === 0 && !gameOver
              ? 'border-amber-400/60 bg-amber-900/30 glow-gold'
              : 'border-stone-700/30 bg-stone-900/20'
          }`}
        >
          <Trophy size={16} className={currentPlayer === 0 && !gameOver ? 'text-amber-400' : 'text-stone-500'} />
          <span className="font-display text-sm text-amber-200">Player 1</span>
          <span className="font-display text-lg font-bold text-amber-300">{scores[0]}</span>
        </div>
        <div className="text-center flex-1">
          <p className="font-body text-sm text-amber-100/70">{message}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            currentPlayer === 1 && !gameOver
              ? 'border-amber-400/60 bg-amber-900/30 glow-gold'
              : 'border-stone-700/30 bg-stone-900/20'
          }`}
        >
          <span className="font-display text-sm text-amber-200">Player 2</span>
          <span className="font-display text-lg font-bold text-amber-300">{scores[1]}</span>
          <Trophy size={16} className={currentPlayer === 1 && !gameOver ? 'text-amber-400' : 'text-stone-500'} />
        </div>
      </div>

      {/* Game board */}
      <div className="game-board rounded-2xl p-4 sm:p-6">
        {/* Player 2 pits (top row, reversed) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const pitIndex = 13 - i;
            return (
              <Pit
                key={`p2-${pitIndex}`}
                seeds={board[pitIndex]}
                active={currentPlayer === 1 && !gameOver && board[pitIndex] > 0}
                onClick={() => handlePitClick(pitIndex)}
                label={`P2`}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent my-2" />

        {/* Player 1 pits (bottom row) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mt-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const pitIndex = i;
            return (
              <Pit
                key={`p1-${pitIndex}`}
                seeds={board[pitIndex]}
                active={currentPlayer === 0 && !gameOver && board[pitIndex] > 0}
                onClick={() => handlePitClick(pitIndex)}
                label={`P1`}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-amber-100/40">
          Click a pit on your side to sow seeds counter-clockwise. Capture when your last seed lands in an empty pit.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-700/30 text-amber-300 hover:bg-amber-900/20 transition-colors font-display text-sm"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {gameOver && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/30 text-center fade-in-up">
          <Trophy size={28} className="text-amber-400 mx-auto mb-2" />
          <p className="font-display text-lg text-amber-200">{message}</p>
        </div>
      )}
    </div>
  );
}

function Pit({
  seeds,
  active,
  onClick,
  label,
}: {
  seeds: number;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!active}
      className={`pit aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${
        !active && 'cursor-default'
      } ${seeds === 0 ? 'pit-empty' : ''}`}
    >
      {/* Seeds visualization */}
      <div className="relative w-full h-full flex items-center justify-center">
        {seeds > 0 && (
          <div className="grid grid-cols-3 gap-0.5 p-1">
            {Array.from({ length: Math.min(seeds, 12) }).map((_, i) => (
              <div
                key={i}
                className="seed w-2 h-2 sm:w-2.5 sm:h-2.5"
                style={{
                  opacity: 1 - i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {/* Seed count */}
      <span className="absolute top-1 right-1.5 font-display text-xs text-amber-300/70">
        {seeds}
      </span>
      {/* Label */}
      <span className="absolute bottom-1 left-1.5 font-display text-[8px] text-amber-500/30 uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}
