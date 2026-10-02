import { useState, useCallback, useEffect } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Sholo Gutti — simplified checkers-like game on 5x6 grid
// Diagonal movement, capture by jumping

type Cell = 'empty' | 'p1' | 'p2' | 'p1_king' | 'p2_king';

const ROWS = 6;
const COLS = 5;

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: ROWS }, () => Array(COLS).fill('empty'));
  // P1 on top 2 rows, P2 on bottom 2 rows (diagonal squares only)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((r + c) % 2 === 0) board[r][c] = 'p1';
    }
  }
  for (let r = ROWS - 2; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((r + c) % 2 === 0) board[r][c] = 'p2';
    }
  }
  return board;
}

function isKing(cell: Cell): boolean {
  return cell === 'p1_king' || cell === 'p2_king';
}

function getPlayer(cell: Cell): 'p1' | 'p2' | null {
  if (cell === 'p1' || cell === 'p1_king') return 'p1';
  if (cell === 'p2' || cell === 'p2_king') return 'p2';
  return null;
}

function getMoves(board: Cell[][], r: number, c: number): { type: 'move' | 'capture'; to: [number, number]; captured?: [number, number] }[] {
  const cell = board[r][c];
  const player = getPlayer(cell);
  if (!player) return [];
  const king = isKing(cell);
  const dirs = king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : player === 'p1' ? [[1,-1],[1,1]] : [[-1,-1],[-1,1]];
  const moves: { type: 'move' | 'capture'; to: [number, number]; captured?: [number, number] }[] = [];

  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    if (board[nr][nc] === 'empty') {
      moves.push({ type: 'move', to: [nr, nc] });
    } else if (getPlayer(board[nr][nc]) !== player) {
      const jr = r + dr * 2, jc = c + dc * 2;
      if (jr >= 0 && jr < ROWS && jc >= 0 && jc < COLS && board[jr][jc] === 'empty') {
        moves.push({ type: 'capture', to: [jr, jc], captured: [nr, nc] });
      }
    }
  }
  return moves;
}

function getAllMoves(board: Cell[][], player: 'p1' | 'p2'): { from: [number, number]; to: [number, number]; captured?: [number, number] }[] {
  const allMoves: { from: [number, number]; to: [number, number]; captured?: [number, number] }[] = [];
  const captures: { from: [number, number]; to: [number, number]; captured?: [number, number] }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (getPlayer(board[r][c]) === player) {
        const moves = getMoves(board, r, c);
        for (const m of moves) {
          if (m.type === 'capture') captures.push({ from: [r, c], to: m.to, captured: m.captured });
          else allMoves.push({ from: [r, c], to: m.to });
        }
      }
    }
  }
  return captures.length > 0 ? captures : allMoves;
}

export default function SholoGuttiGame() {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState<'p1' | 'p2'>('p1');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState('Player 1: select a piece');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [aiThinking, setAiThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const validMoves = selected ? getMoves(board, selected[0], selected[1]) : [];

  const checkWin = (b: Cell[][]): string | null => {
    const p1Count = b.flat().filter((c) => getPlayer(c) === 'p1').length;
    const p2Count = b.flat().filter((c) => getPlayer(c) === 'p2').length;
    if (p1Count === 0) return 'Player 2 wins!';
    if (p2Count === 0) return 'Player 1 wins!';
    if (getAllMoves(b, currentPlayer).length === 0) return `${currentPlayer === 'p1' ? 'Player 2' : 'Player 1'} wins — no moves!`;
    return null;
  };

  const executeMove = (from: [number, number], to: [number, number], captured?: [number, number]) => {
    const b = board.map((row) => [...row]);
    const cell = b[from[0]][from[1]];
    b[from[0]][from[1]] = 'empty';
    b[to[0]][to[1]] = cell;
    if (captured) {
      b[captured[0]][captured[1]] = 'empty';
      setScores((prev) => {
        const ns: [number, number] = [...prev];
        ns[currentPlayer === 'p1' ? 0 : 1]++;
        return ns;
      });
    }
    // King promotion
    if (cell === 'p1' && to[0] === ROWS - 1) b[to[0]][to[1]] = 'p1_king';
    if (cell === 'p2' && to[0] === 0) b[to[0]][to[1]] = 'p2_king';

    setBoard(b);
    setSelected(null);
    setMoveHistory((prev) => [...prev, `${currentPlayer === 'p1' ? 'P1' : 'P2'}: ${from.join(',')}→${to.join(',')}${captured ? 'x' : ''}`]);

    const win = checkWin(b);
    if (win) { setGameOver(true); setWinner(win); return; }
    setCurrentPlayer((p) => (p === 'p1' ? 'p2' : 'p1'));
    setMessage(currentPlayer === 'p1' ? 'AI thinking...' : 'Player 1: select a piece');
  };

  // AI
  useEffect(() => {
    if (currentPlayer === 'p2' && !gameOver && !aiThinking) {
      setAiThinking(true);
      setTimeout(() => {
        const moves = getAllMoves(board, 'p2');
        if (moves.length === 0) { setGameOver(true); setWinner('Player 1 wins!'); setAiThinking(false); return; }
        // Prefer captures, then smart move based on difficulty
        let best = moves[0];
        if (difficulty === 'easy') {
          best = moves[Math.floor(Math.random() * moves.length)];
        } else {
          // Prefer moves that advance toward king row or captures
          const scored = moves.map((m) => {
            let score = 0;
            if (m.captured) score += 10;
            if (m.to[0] === 0) score += 5; // king promotion
            score += (ROWS - m.to[0]); // advance toward top
            if (difficulty === 'hard') score += Math.random() * 2;
            return { move: m, score };
          });
          scored.sort((a, b) => b.score - a.score);
          best = scored[0].move;
        }
        executeMove(best.from, best.to, best.captured);
        setAiThinking(false);
      }, 600);
    }
  }, [currentPlayer, gameOver, aiThinking]);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || aiThinking || currentPlayer !== 'p1') return;
    if ((r + c) % 2 !== 0) return;

    if (selected) {
      const move = validMoves.find((m) => m.to[0] === r && m.to[1] === c);
      if (move) {
        executeMove(selected, move.to, move.captured);
        return;
      }
      if (getPlayer(board[r][c]) === 'p1') {
        setSelected([r, c]);
        return;
      }
      setSelected(null);
      return;
    }

    if (getPlayer(board[r][c]) === 'p1') {
      setSelected([r, c]);
      setMessage('Select destination');
    }
  };

  const reset = () => {
    setBoard(createBoard());
    setCurrentPlayer('p1');
    setSelected(null);
    setMessage('Player 1: select a piece');
    setGameOver(false);
    setWinner(null);
    setAiThinking(false);
    setMoveHistory([]);
    setScores([0, 0]);
  };

  return (
    <GameShell
      title="Sholo Gutti"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      score={scores[0]}
      bestScore={scores[1]}
      message={aiThinking ? 'AI is thinking...' : message}
      gameOver={gameOver}
      onReset={reset}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 'p1' && !gameOver ? 'border-amber-400/60 bg-amber-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-display text-sm text-amber-200">P1 Captures: {scores[0]}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 'p2' && !gameOver ? 'border-red-400/60 bg-red-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-red-200">P2 Captures: {scores[1]}</span>
          <div className="w-3 h-3 rounded-full bg-red-500" />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Board */}
        <div className="flex-1">
          <div className="game-board rounded-xl p-2 mx-auto" style={{ maxWidth: '300px' }}>
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isDark = (r + c) % 2 === 0;
                  const isSelected = selected && selected[0] === r && selected[1] === c;
                  const isValidMove = validMoves.some((m) => m.to[0] === r && m.to[1] === c);
                  const player = getPlayer(cell);
                  const king = isKing(cell);
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`aspect-square flex items-center justify-center cursor-pointer transition-all ${
                        isDark ? 'bg-amber-950/60' : 'bg-stone-900/40'
                      } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      {player && (
                        <div
                          className={`w-3/4 h-3/4 rounded-full border-2 flex items-center justify-center ${
                            player === 'p1'
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300'
                              : 'bg-gradient-to-br from-red-700 to-red-900 border-red-400'
                          } ${king ? 'ring-2 ring-yellow-300' : ''}`}
                        >
                          {king && <span className="text-[8px] font-bold text-yellow-200">K</span>}
                        </div>
                      )}
                      {isValidMove && (
                        <div className="absolute w-3 h-3 rounded-full bg-green-400/40 border border-green-400/60" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Move history */}
        <div className="w-32 hidden sm:block">
          <p className="font-display text-xs text-amber-300/60 uppercase mb-2">Moves</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {moveHistory.slice(-10).map((m, i) => (
              <div key={i} className="font-body text-xs text-amber-100/40 px-2 py-1 rounded bg-stone-900/30">
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Move diagonally. Jump over opponent to capture. Reach the far end to become a King (moves both directions).
      </p>
    </GameShell>
  );
}
