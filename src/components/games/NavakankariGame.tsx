import { useState, useCallback, useEffect } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Navakankari (Nine Men's Morris)
// 24 points on the board, 3 concentric squares connected by lines

type Cell = 'empty' | 'p1' | 'p2';
type Phase = 'place' | 'move' | 'fly' | 'over';

const POINTS: { x: number; y: number }[] = [
  // Outer square
  { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 },
  { x: 90, y: 50 }, { x: 90, y: 90 }, { x: 50, y: 90 },
  { x: 10, y: 90 }, { x: 10, y: 50 },
  // Middle square
  { x: 25, y: 25 }, { x: 50, y: 25 }, { x: 75, y: 25 },
  { x: 75, y: 50 }, { x: 75, y: 75 }, { x: 50, y: 75 },
  { x: 25, y: 75 }, { x: 25, y: 50 },
  // Inner square
  { x: 40, y: 40 }, { x: 50, y: 40 }, { x: 60, y: 40 },
  { x: 60, y: 50 }, { x: 60, y: 60 }, { x: 50, y: 60 },
  { x: 40, y: 60 }, { x: 40, y: 50 },
];

const ADJACENCY: number[][] = [
  [1, 7], [0, 2, 9], [1, 3], [2, 4, 11], [3, 5], [4, 6, 13], [5, 7], [0, 6, 15],
  [9, 15], [1, 8, 10, 17], [9, 11], [3, 10, 12, 19], [11, 13], [5, 12, 14, 21], [13, 15], [7, 8, 14, 23],
  [17, 23], [9, 16, 18], [17, 19], [11, 18, 20], [19, 21], [13, 20, 22], [21, 23], [15, 16, 22],
];

const MILLS: number[][] = [
  // Outer
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Middle
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Connecting lines
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

function checkMill(board: Cell[], pos: number, player: 'p1' | 'p2'): boolean {
  return MILLS.some((mill) =>
    mill.includes(pos) && mill.every((p) => board[p] === player)
  );
}

function getMillPieces(board: Cell[], player: 'p1' | 'p2'): Set<number> {
  const inMills = new Set<number>();
  MILLS.forEach((mill) => {
    if (mill.every((p) => board[p] === player)) {
      mill.forEach((p) => inMills.add(p));
    }
  });
  return inMills;
}

function getRemovable(board: Cell[], player: 'p1' | 'p2'): number[] {
  const opponent = player === 'p1' ? 'p2' : 'p1';
  const inMills = getMillPieces(board, opponent);
  const all = board.map((c, i) => (c === opponent ? i : -1)).filter((i) => i >= 0);
  const notInMills = all.filter((i) => !inMills.has(i));
  return notInMills.length > 0 ? notInMills : all;
}

export default function NavakankariGame() {
  const [board, setBoard] = useState<Cell[]>(Array(24).fill('empty'));
  const [phase, setPhase] = useState<Phase>('place');
  const [currentPlayer, setCurrentPlayer] = useState<'p1' | 'p2'>('p1');
  const [placed, setPlaced] = useState<[number, number]>([0, 0]);
  const [remaining, setRemaining] = useState<[number, number]>([9, 9]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('Player 1: place a piece');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removingMode, setRemovingMode] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [aiThinking, setAiThinking] = useState(false);

  const player = currentPlayer;
  const opponent: 'p1' | 'p2' = player === 'p1' ? 'p2' : 'p1';

  const checkWin = (b: Cell[], rem: [number, number]): string | null => {
    if (phase === 'place') return null;
    if (rem[0] < 3) return 'Player 2 wins! Player 1 has fewer than 3 pieces.';
    if (rem[1] < 3) return 'Player 1 wins! Player 2 has fewer than 3 pieces.';
    // Check if current player can move
    const canMove = b.some((c, i) => c === player && ADJACENCY[i].some((a) => b[a] === 'empty'));
    if (!canMove && phase !== 'fly') return `${player === 'p1' ? 'Player 2' : 'Player 1'} wins! No moves available.`;
    return null;
  };

  // AI move
  const aiMove = useCallback(() => {
    if (gameOver) return;
    setAiThinking(true);
    setTimeout(() => {
      const b = [...board];
      const aiPlayer: 'p1' | 'p2' = 'p2';
      const aiOpp: 'p1' | 'p2' = 'p1';

      if (phase === 'place') {
        // Find a spot that creates a mill, or random
        const empty = b.map((c, i) => (c === 'empty' ? i : -1)).filter((i) => i >= 0);
        // Try to make a mill
        let best = -1;
        for (const pos of empty) {
          const test = [...b];
          test[pos] = aiPlayer;
          if (checkMill(test, pos, aiPlayer)) { best = pos; break; }
        }
        if (best === -1) {
          // Block opponent mill
          for (const pos of empty) {
            const test = [...b];
            test[pos] = aiOpp;
            if (checkMill(test, pos, aiOpp)) { best = pos; break; }
          }
        }
        if (best === -1) {
          best = empty[Math.floor(Math.random() * empty.length)];
        }
        if (best >= 0) {
          b[best] = aiPlayer;
          setBoard(b);
          const newPlaced: [number, number] = [placed[0], placed[1] + 1];
          setPlaced(newPlaced);
          if (checkMill(b, best, aiPlayer)) {
            // AI removes a piece
            const removable = getRemovable(b, aiPlayer);
            if (removable.length > 0) {
              const target = removable[Math.floor(Math.random() * removable.length)];
              b[target] = 'empty';
              setBoard([...b]);
              const newRem: [number, number] = [remaining[0] - 1, remaining[1]];
              setRemaining(newRem);
            }
          }
          if (newPlaced[0] === 9 && newPlaced[1] === 9) {
            setPhase('move');
          }
          setCurrentPlayer('p1');
          setMessage('Player 1: place a piece');
        }
      } else if (phase === 'move' || phase === 'fly') {
        const aiPieces = b.map((c, i) => (c === aiPlayer ? i : -1)).filter((i) => i >= 0);
        const flyMode = remaining[1] <= 3;
        let moved = false;

        // Try to make a mill
        for (const from of aiPieces) {
          const targets = flyMode
            ? b.map((c, i) => (c === 'empty' ? i : -1)).filter((i) => i >= 0)
            : ADJACENCY[from].filter((a) => b[a] === 'empty');
          for (const to of targets) {
            const test = [...b];
            test[from] = 'empty';
            test[to] = aiPlayer;
            if (checkMill(test, to, aiPlayer)) {
              b[from] = 'empty';
              b[to] = aiPlayer;
              setBoard([...b]);
              setSelected(null);
              moved = true;
              // Remove opponent piece
              const removable = getRemovable(b, aiPlayer);
              if (removable.length > 0) {
                const target = removable[Math.floor(Math.random() * removable.length)];
                b[target] = 'empty';
                setBoard([...b]);
                setRemaining((prev) => {
                  const ns: [number, number] = [prev[0] - 1, prev[1]];
                  const win = checkWin(b, ns);
                  if (win) { setGameOver(true); setWinner(win); }
                  return ns;
                });
              }
              break;
            }
          }
          if (moved) break;
        }

        if (!moved) {
          // Random move
          for (const from of aiPieces) {
            const targets = flyMode
              ? b.map((c, i) => (c === 'empty' ? i : -1)).filter((i) => i >= 0)
              : ADJACENCY[from].filter((a) => b[a] === 'empty');
            if (targets.length > 0) {
              const to = targets[Math.floor(Math.random() * targets.length)];
              b[from] = 'empty';
              b[to] = aiPlayer;
              setBoard(b);
              moved = true;
              break;
            }
          }
        }

        if (moved) {
          const win = checkWin(b, remaining);
          if (win) { setGameOver(true); setWinner(win); }
          else {
            setCurrentPlayer('p1');
            setMessage(remaining[0] <= 3 ? 'Player 1: fly a piece to any point' : 'Player 1: move a piece');
          }
        }
      }
      setAiThinking(false);
    }, 800 + (difficulty === 'hard' ? 400 : 0));
  }, [board, phase, placed, remaining, gameOver, difficulty]);

  useEffect(() => {
    if (currentPlayer === 'p2' && !gameOver && !aiThinking) {
      aiMove();
    }
  }, [currentPlayer, gameOver, aiThinking, aiMove]);

  const handlePointClick = (pos: number) => {
    if (gameOver || aiThinking) return;
    if (currentPlayer !== 'p1') return;

    if (removingMode) {
      // Remove opponent piece
      if (board[pos] !== 'p2') return;
      const removable = getRemovable(board, 'p1');
      if (!removable.includes(pos)) {
        setMessage('Cannot remove a piece in a mill. Choose another.');
        return;
      }
      const b = [...board];
      b[pos] = 'empty';
      setBoard(b);
      setRemovingMode(false);
      const newRem: [number, number] = [remaining[0], remaining[1] - 1];
      setRemaining(newRem);
      const win = checkWin(b, newRem);
      if (win) { setGameOver(true); setWinner(win); return; }
      setCurrentPlayer('p2');
      setMessage('AI thinking...');
      return;
    }

    if (phase === 'place') {
      if (board[pos] !== 'empty') return;
      const b = [...board];
      b[pos] = 'p1';
      setBoard(b);
      const newPlaced: [number, number] = [placed[0] + 1, placed[1]];
      setPlaced(newPlaced);
      if (checkMill(b, pos, 'p1')) {
        setRemovingMode(true);
        setMessage('Mill formed! Remove an opponent piece.');
        return;
      }
      if (newPlaced[0] === 9 && newPlaced[1] === 9) {
        setPhase('move');
      }
      setCurrentPlayer('p2');
      setMessage('AI thinking...');
      return;
    }

    // Move/fly phase
    if (selected === null) {
      if (board[pos] !== 'p1') return;
      setSelected(pos);
      return;
    }

    if (pos === selected) { setSelected(null); return; }
    if (board[pos] === 'p1') { setSelected(pos); return; }

    const flyMode = remaining[0] <= 3;
    if (!flyMode && !ADJACENCY[selected].includes(pos)) {
      setMessage('Invalid move — not adjacent. Select another destination.');
      return;
    }
    if (board[pos] !== 'empty') return;

    const b = [...board];
    b[selected] = 'empty';
    b[pos] = 'p1';
    setBoard(b);
    setSelected(null);

    if (checkMill(b, pos, 'p1')) {
      setRemovingMode(true);
      setMessage('Mill formed! Remove an opponent piece.');
      return;
    }

    const win = checkWin(b, remaining);
    if (win) { setGameOver(true); setWinner(win); return; }
    setCurrentPlayer('p2');
    setMessage('AI thinking...');
  };

  const reset = () => {
    setBoard(Array(24).fill('empty'));
    setPhase('place');
    setCurrentPlayer('p1');
    setPlaced([0, 0]);
    setRemaining([9, 9]);
    setSelected(null);
    setMessage('Player 1: place a piece');
    setGameOver(false);
    setWinner(null);
    setRemovingMode(false);
    setAiThinking(false);
  };

  return (
    <GameShell
      title="Navakankari"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      message={aiThinking ? 'AI is thinking...' : message}
      gameOver={gameOver}
      onReset={reset}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 'p1' && !gameOver ? 'border-amber-400/60 bg-amber-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-display text-sm text-amber-200">P1: {remaining[0]} pieces</span>
          <span className="font-display text-xs text-amber-400/60">({9 - placed[0]} to place)</span>
        </div>
        <div className="text-center">
          <span className="font-display text-xs text-amber-300/60 uppercase tracking-wide">
            Phase: {phase === 'place' ? 'Placement' : phase === 'fly' ? 'Flying' : 'Movement'}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 'p2' && !gameOver ? 'border-red-400/60 bg-red-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-red-200">P2: {remaining[1]} pieces</span>
          <div className="w-3 h-3 rounded-full bg-red-500" />
        </div>
      </div>

      <div className="relative w-full max-w-md mx-auto aspect-square game-board rounded-2xl p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Draw board lines */}
          {/* Outer square */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#8B6914" strokeWidth="0.6" />
          {/* Middle square */}
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="#8B6914" strokeWidth="0.6" />
          {/* Inner square */}
          <rect x="40" y="40" width="20" height="20" fill="none" stroke="#8B6914" strokeWidth="0.6" />
          {/* Connecting lines */}
          <line x1="50" y1="10" x2="50" y2="40" stroke="#8B6914" strokeWidth="0.6" />
          <line x1="50" y1="60" x2="50" y2="90" stroke="#8B6914" strokeWidth="0.6" />
          <line x1="10" y1="50" x2="40" y2="50" stroke="#8B6914" strokeWidth="0.6" />
          <line x1="60" y1="50" x2="90" y2="50" stroke="#8B6914" strokeWidth="0.6" />

          {/* Draw points */}
          {POINTS.map((p, i) => {
            const piece = board[i];
            const isSelected = selected === i;
            const isRemovable = removingMode && piece === 'p2';
            const isValidTarget = selected !== null && board[i] === 'empty' && (remaining[0] <= 3 || ADJACENCY[selected].includes(i));
            return (
              <g key={i} onClick={() => handlePointClick(i)} className="cursor-pointer">
                {isSelected && <circle cx={p.x} cy={p.y} r="4.5" fill="none" stroke="#F4C430" strokeWidth="0.8" className="pulse-glow" />}
                {isRemovable && <circle cx={p.x} cy={p.y} r="4.5" fill="none" stroke="#FF4444" strokeWidth="0.8" className="pulse-glow" />}
                <circle cx={p.x} cy={p.y} r="3" fill={piece === 'empty' ? '#2C1810' : 'transparent'} stroke={isValidTarget ? '#F4C430' : '#8B6914'} strokeWidth="0.5" opacity={piece === 'empty' ? 0.5 : 1} />
                {piece === 'p1' && <circle cx={p.x} cy={p.y} r="3" fill="#FF9933" stroke="#F4C430" strokeWidth="0.4" />}
                {piece === 'p2' && <circle cx={p.x} cy={p.y} r="3" fill="#8B0000" stroke="#FF6B6B" strokeWidth="0.4" />}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        {phase === 'place'
          ? 'Click an empty point to place a piece. Form 3-in-a-row (a mill) to capture an opponent piece.'
          : remaining[0] <= 3
          ? 'Flying phase: select your piece, then click any empty point to move.'
          : 'Select your piece, then click an adjacent empty point to move.'}
      </p>
    </GameShell>
  );
}
