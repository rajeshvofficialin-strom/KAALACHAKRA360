import { useState, useCallback } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';

type Player = 'tiger' | 'goat';
type Phase = 'place' | 'move';
type Position = Player | null;

// Triangular grid: 23 points
// Layout: 3 triangles nested, with lines connecting them
const POINTS: { x: number; y: number }[] = [
  // Outer triangle (0-2)
  { x: 50, y: 5 },
  { x: 95, y: 85 },
  { x: 5, y: 85 },
  // Mid triangle (3-5)
  { x: 50, y: 30 },
  { x: 75, y: 75 },
  { x: 25, y: 75 },
  // Inner triangle (6-8)
  { x: 50, y: 50 },
  { x: 65, y: 65 },
  { x: 35, y: 65 },
  // Outer-to-mid connections (9-14)
  { x: 50, y: 17 },  // 9: between 0 and 3
  { x: 85, y: 80 },  // 10: between 1 and 4
  { x: 15, y: 80 },  // 11: between 2 and 5
  { x: 62, y: 52 },  // 12: between 3 and 7
  { x: 72, y: 70 },  // 13: between 4 and 8
  { x: 38, y: 52 },  // 14: between 3 and 8
  // Mid-to-inner connections (15-20)
  { x: 50, y: 40 },  // 15: between 3 and 6
  { x: 70, y: 70 },  // 16: between 4 and 7
  { x: 30, y: 70 },  // 17: between 5 and 8
  { x: 57, y: 57 },  // 18: between 6 and 7
  { x: 43, y: 57 },  // 19: between 6 and 8
  { x: 30, y: 70 },  // 20: between 5 and 8 (same as 17, adjust)
  // Extra points (21-22)
  { x: 80, y: 82 },  // 21
  { x: 20, y: 82 },  // 22
];

// Adjacency list - which points connect to which
const ADJACENCY: number[][] = [
  [9, 1, 2],        // 0
  [9, 10, 21],      // 1
  [11, 22, 0],      // 2
  [9, 12, 14, 15],  // 3
  [10, 13, 16],     // 4
  [11, 17, 20],     // 5
  [15, 18, 19],     // 6
  [16, 18, 12],     // 7
  [17, 19, 14],     // 8
  [0, 1, 3],        // 9
  [1, 4],           // 10
  [2, 5],           // 11
  [3, 7],           // 12
  [4, 16],          // 13
  [3, 8],           // 14
  [3, 6],           // 15
  [4, 7],           // 16
  [5, 8],           // 17
  [6, 7],           // 18
  [6, 8],           // 19
  [5, 8],           // 20
  [1],              // 21
  [2],              // 22
];

// Tigers start at the three apex points
const TIGER_STARTS = [0, 1, 2];
const TOTAL_GOATS = 15;

function createBoard(): Position[] {
  const board: Position[] = Array(23).fill(null);
  TIGER_STARTS.forEach((i) => (board[i] = 'tiger'));
  return board;
}

export default function AaduPuliGame() {
  const [board, setBoard] = useState<Position[]>(createBoard);
  const [turn, setTurn] = useState<Player>('goat');
  const [phase, setPhase] = useState<Phase>('place');
  const [goatsPlaced, setGoatsPlaced] = useState(0);
  const [goatsCaptured, setGoatsCaptured] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('Goat player: place a goat on an empty point');
  const [gameOver, setGameOver] = useState(false);

  const getGoatCount = (b: Position[]) => b.filter((p) => p === 'goat').length;

  const canTigerMove = (b: Position[], pos: number): boolean => {
    if (b[pos] !== 'tiger') return false;
    return ADJACENCY[pos].some((adj) => b[adj] === null || canCapture(b, pos, adj) !== null);
  };

  const canCapture = (b: Position[], tigerPos: number, goatPos: number): number | null => {
    if (b[goatPos] !== 'goat') return null;
    if (!ADJACENCY[tigerPos].includes(goatPos)) return null;
    const dx = POINTS[goatPos].x - POINTS[tigerPos].x;
    const dy = POINTS[goatPos].y - POINTS[tigerPos].y;
    const landingX = POINTS[goatPos].x + dx;
    const landingY = POINTS[goatPos].y + dy;
    const landing = POINTS.findIndex(
      (p) => Math.abs(p.x - landingX) < 3 && Math.abs(p.y - landingY) < 3
    );
    if (landing === -1 || b[landing] !== null) return null;
    if (!ADJACENCY[goatPos].includes(landing)) return null;
    return landing;
  };

  const checkWin = (b: Position[]): string | null => {
    const goatCount = getGoatCount(b);
    if (goatCount < 5) return 'Tigers win! Too few goats remain to trap them.';
    const tigersCanMove = b
      .map((p, i) => (p === 'tiger' ? canTigerMove(b, i) : false))
      .some((v) => v);
    if (!tigersCanMove) return 'Goats win! All tigers are trapped.';
    return null;
  };

  const handlePointClick = useCallback(
    (pointIndex: number) => {
      if (gameOver) return;

      // Goat placing phase
      if (turn === 'goat' && phase === 'place') {
        if (board[pointIndex] !== null) return;
        const newBoard = [...board];
        newBoard[pointIndex] = 'goat';
        setBoard(newBoard);
        const newPlaced = goatsPlaced + 1;
        setGoatsPlaced(newPlaced);

        const win = checkWin(newBoard);
        if (win) {
          setGameOver(true);
          setMessage(win);
          return;
        }
        setTurn('tiger');
        setMessage('Tiger: move or capture a goat');
        return;
      }

      // Tiger move phase
      if (turn === 'tiger' && phase === 'move') {
        if (selected === null) {
          if (board[pointIndex] !== 'tiger') return;
          setSelected(pointIndex);
          setMessage('Tiger: select a destination');
          return;
        }

        // Try capture
        const landing = canCapture(board, selected, pointIndex);
        if (landing !== null) {
          const newBoard = [...board];
          newBoard[landing] = 'tiger';
          newBoard[selected] = null;
          newBoard[pointIndex] = null;
          setBoard(newBoard);
          setSelected(null);
          const newCaptured = goatsCaptured + 1;
          setGoatsCaptured(newCaptured);

          const win = checkWin(newBoard);
          if (win) {
            setGameOver(true);
            setMessage(win);
            return;
          }
          setTurn('goat');
          setMessage('Goat: move a goat to an adjacent empty point');
          return;
        }

        // Try move
        if (board[pointIndex] === null && ADJACENCY[selected].includes(pointIndex)) {
          const newBoard = [...board];
          newBoard[pointIndex] = 'tiger';
          newBoard[selected] = null;
          setBoard(newBoard);
          setSelected(null);

          const win = checkWin(newBoard);
          if (win) {
            setGameOver(true);
            setMessage(win);
            return;
          }
          setTurn('goat');
          setMessage('Goat: move a goat to an adjacent empty point');
          return;
        }

        // Re-select
        if (board[pointIndex] === 'tiger') {
          setSelected(pointIndex);
          return;
        }
        setSelected(null);
        return;
      }

      // Goat move phase
      if (turn === 'goat' && phase === 'move') {
        if (selected === null) {
          if (board[pointIndex] !== 'goat') return;
          setSelected(pointIndex);
          setMessage('Goat: select an adjacent empty point');
          return;
        }

        if (board[pointIndex] === null && ADJACENCY[selected].includes(pointIndex)) {
          const newBoard = [...board];
          newBoard[pointIndex] = 'goat';
          newBoard[selected] = null;
          setBoard(newBoard);
          setSelected(null);

          const win = checkWin(newBoard);
          if (win) {
            setGameOver(true);
            setMessage(win);
            return;
          }
          setTurn('tiger');
          setMessage('Tiger: move or capture a goat');
          return;
        }

        if (board[pointIndex] === 'goat') {
          setSelected(pointIndex);
          return;
        }
        setSelected(null);
        return;
      }
    },
    [board, turn, phase, selected, goatsPlaced, goatsCaptured, gameOver]
  );

  // Transition from place to move phase
  if (goatsPlaced >= TOTAL_GOATS && phase === 'place') {
    setPhase('move');
  }

  const reset = () => {
    setBoard(createBoard());
    setTurn('goat');
    setPhase('place');
    setGoatsPlaced(0);
    setGoatsCaptured(0);
    setSelected(null);
    setMessage('Goat player: place a goat on an empty point');
    setGameOver(false);
  };

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              turn === 'goat' && !gameOver
                ? 'border-green-500/50 bg-green-950/30'
                : 'border-stone-700/30 bg-stone-900/20'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="font-display text-sm text-amber-200">Goats</span>
            <span className="font-display text-sm text-amber-300">
              {getGoatCount(board)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-400/60">
            <span className="font-display text-xs">Captured:</span>
            <span className="font-display text-sm text-red-400">{goatsCaptured}</span>
          </div>
        </div>
        <div className="text-center flex-1 min-w-[200px]">
          <p className="font-body text-sm text-amber-100/70">{message}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            turn === 'tiger' && !gameOver
              ? 'border-amber-500/50 bg-amber-950/30'
              : 'border-stone-700/30 bg-stone-900/20'
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-display text-sm text-amber-200">Tigers</span>
          <span className="font-display text-sm text-amber-3">3</span>
        </div>
      </div>

      {/* Game board */}
      <div className="relative w-full max-w-md mx-auto aspect-square game-board rounded-2xl p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Draw lines */}
          {POINTS.map((p, i) =>
            ADJACENCY[i].map((j) => {
              if (j <= i) return null;
              const p2 = POINTS[j];
              return (
                <line
                  key={`line-${i}-${j}`}
                  x1={p.x}
                  y1={p.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#8B6914"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              );
            })
          )}

          {/* Draw points */}
          {POINTS.map((p, i) => {
            const piece = board[i];
            const isSelected = selected === i;
            const isEmpty = piece === null;
            const isCurrentTurn =
              (turn === 'goat' && (piece === 'goat' || (isEmpty && phase === 'place'))) ||
              (turn === 'tiger' && piece === 'tiger');

            return (
              <g key={`point-${i}`} onClick={() => handlePointClick(i)} className="cursor-pointer">
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="none"
                    stroke="#F4C430"
                    strokeWidth="0.8"
                    className="pulse-glow"
                  />
                )}
                {/* Point base */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill={isEmpty ? '#2C1810' : 'transparent'}
                  stroke={isCurrentTurn ? '#F4C430' : '#8B6914'}
                  strokeWidth="0.5"
                  opacity={isEmpty ? 0.6 : 1}
                />
                {/* Tiger piece */}
                {piece === 'tiger' && (
                  <>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#FF6B35" stroke="#FF9933" strokeWidth="0.5" />
                    <text
                      x={p.x}
                      y={p.y + 1.2}
                      textAnchor="middle"
                      fontSize="3"
                      fill="#0A0E27"
                      fontWeight="bold"
                    >
                      T
                    </text>
                  </>
                )}
                {/* Goat piece */}
                {piece === 'goat' && (
                  <>
                    <circle cx={p.x} cy={p.y} r="3" fill="#2D8B2D" stroke="#4ADE80" strokeWidth="0.5" />
                    <text
                      x={p.x}
                      y={p.y + 1}
                      textAnchor="middle"
                      fontSize="2.5"
                      fill="#0A0E27"
                      fontWeight="bold"
                    >
                      G
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-body text-xs text-amber-100/40">
          {phase === 'place'
            ? `Goats to place: ${TOTAL_GOATS - goatsPlaced}. Click an empty point to place a goat.`
            : 'Move phase: click your piece, then click an adjacent empty point. Tigers can jump over goats to capture.'}
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
