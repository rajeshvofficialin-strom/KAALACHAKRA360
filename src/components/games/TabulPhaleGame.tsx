import { useState, useCallback, useEffect } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Tabul Phale — Goan race game, 2 players, 4 pieces each
// Circular track with safe zones, stick dice

const TRACK_LENGTH = 16;
const HOME_POS = TRACK_LENGTH;
const SAFE_SQUARES = new Set([3, 7, 11, 15]);

interface Piece {
  id: number;
  pos: number; // -1 = start, TRACK_LENGTH = home
}

function createPieces(): [Piece[], Piece[]] {
  return [
    Array.from({ length: 4 }, (_, i) => ({ id: i, pos: -1 })),
    Array.from({ length: 4 }, (_, i) => ({ id: i, pos: -1 })),
  ];
}

function rollStickDice(difficulty: Difficulty): number {
  // 4 stick dice: each flat/round. Count of flat = move value
  const sticks = Array.from({ length: 4 }).map(() => Math.random() > 0.5 ? 1 : 0);
  let count = sticks.reduce((a, b) => a + b, 0);
  if (count === 0) count = 8;
  if (difficulty === 'easy' && Math.random() < 0.25) count = Math.max(count, 4);
  if (difficulty === 'hard' && Math.random() < 0.25) count = Math.min(count, 3);
  return count;
}

export default function TabulPhaleGame() {
  const [pieces, setPieces] = useState<[Piece[], Piece[]]>(createPieces);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [message, setMessage] = useState('Player 1: roll the stick dice');
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const canMove = (playerPieces: Piece[], roll: number): boolean => {
    return playerPieces.some((p) => {
      if (p.pos === HOME_POS) return false;
      if (p.pos === -1) return roll === 4 || roll === 8;
      return p.pos + roll <= TRACK_LENGTH;
    });
  };

  const movePiece = (player: number, pieceId: number, roll: number) => {
    const newPieces: [Piece[], Piece[]] = [pieces[0].map((p) => ({ ...p })), pieces[1].map((p) => ({ ...p }))];
    const piece = newPieces[player][pieceId];
    if (piece.pos === -1) {
      if (roll !== 4 && roll !== 8) return false;
      piece.pos = 0;
    } else {
      piece.pos += roll;
      if (piece.pos > TRACK_LENGTH) return false;
    }

    // Capture
    if (piece.pos < TRACK_LENGTH && !SAFE_SQUARES.has(piece.pos)) {
      const opp = player ^ 1;
      for (const op of newPieces[opp]) {
        if (op.pos === piece.pos) {
          op.pos = -1;
          setMessage(`Player ${player + 1} captured a piece!`);
        }
      }
    }

    if (piece.pos === TRACK_LENGTH) setMessage(`Player ${player + 1} got a piece home!`);

    setPieces(newPieces);
    setDice(null);

    if (newPieces[player].every((p) => p.pos === HOME_POS)) {
      setGameOver(true);
      setScores((prev) => { const ns: [number, number] = [...prev]; ns[player]++; return ns; });
      setMessage(`Player ${player + 1} wins — all pieces home!`);
      return true;
    }

    setCurrentPlayer((p) => p ^ 1);
    setMessage(`Player ${(player ^ 1) + 1}: roll the stick dice`);
    return true;
  };

  // AI
  useEffect(() => {
    if (currentPlayer === 1 && !gameOver && !rolling && dice === null) {
      setTimeout(() => {
        const roll = rollStickDice(difficulty);
        setDice(roll);
        const playerPieces = pieces[1];
        if (!canMove(playerPieces, roll)) {
          setMessage(`AI rolled ${roll} — no moves. Player 1's turn`);
          setTimeout(() => { setDice(null); setCurrentPlayer(0); setMessage('Player 1: roll the stick dice'); }, 1000);
          return;
        }
        // Pick best piece to move
        const movable = playerPieces
          .map((p, i) => ({ piece: p, index: i }))
          .filter(({ piece }) => {
            if (piece.pos === HOME_POS) return false;
            if (piece.pos === -1) return roll === 4 || roll === 8;
            return piece.pos + roll <= TRACK_LENGTH;
          });
        // Prefer captures, then advancing
        let best = movable[0];
        for (const m of movable) {
          const newPos = m.piece.pos === -1 ? 0 : m.piece.pos + roll;
          if (newPos < TRACK_LENGTH && !SAFE_SQUARES.has(newPos)) {
            const opp = pieces[0].find((op) => op.pos === newPos);
            if (opp) { best = m; break; }
          }
          if (m.piece.pos + roll === TRACK_LENGTH) { best = m; break; }
        }
        if (best) {
          setTimeout(() => movePiece(1, best.index, roll), 800);
        }
      }, 600);
    }
  }, [currentPlayer, gameOver, rolling, dice, pieces, difficulty]);

  const handleRoll = useCallback(() => {
    if (gameOver || rolling || dice !== null || currentPlayer !== 0) return;
    setRolling(true);
    setTimeout(() => {
      const roll = rollStickDice(difficulty);
      setDice(roll);
      setRolling(false);
      if (!canMove(pieces[0], roll)) {
        setMessage(`Rolled ${roll} — no valid moves. AI's turn`);
        setTimeout(() => { setDice(null); setCurrentPlayer(1); }, 1000);
        return;
      }
      setMessage(`Rolled ${roll}. Select a piece to move.`);
    }, 600);
  }, [gameOver, rolling, dice, currentPlayer, pieces, difficulty]);

  const handlePieceClick = (pieceId: number) => {
    if (gameOver || dice === null || currentPlayer !== 0) return;
    const piece = pieces[0][pieceId];
    if (piece.pos === HOME_POS) return;
    if (piece.pos === -1 && dice !== 4 && dice !== 8) { setMessage('Need 4 or 8 to enter. Pick another.'); return; }
    if (piece.pos !== -1 && piece.pos + dice > TRACK_LENGTH) { setMessage('Would overshoot home. Pick another.'); return; }
    movePiece(0, pieceId, dice);
  };

  const reset = () => {
    setPieces(createPieces());
    setCurrentPlayer(0);
    setDice(null);
    setMessage('Player 1: roll the stick dice');
    setGameOver(false);
    setRolling(false);
    setScores([0, 0]);
  };

  return (
    <GameShell
      title="Tabul Phale"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      score={scores[0]}
      bestScore={scores[1]}
      message={message}
      gameOver={gameOver}
      onReset={reset}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 0 && !gameOver ? 'border-amber-400/60 bg-amber-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-amber-200">P1 Home: {pieces[0].filter((p) => p.pos === HOME_POS).length}/4</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentPlayer === 1 && !gameOver ? 'border-red-400/60 bg-red-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-red-200">P2 Home: {pieces[1].filter((p) => p.pos === HOME_POS).length}/4</span>
        </div>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <div className="game-board rounded-2xl p-6 aspect-square flex items-center justify-center">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-amber-950/60 border-2 border-amber-600/40 flex items-center justify-center">
              <span className="font-display text-[10px] text-amber-400/60">HOME</span>
            </div>
            {Array.from({ length: TRACK_LENGTH }, (_, pos) => {
              const angle = (pos / TRACK_LENGTH) * 2 * Math.PI - Math.PI / 2;
              const radius = 38;
              const left = 50 + radius * Math.cos(angle);
              const top = 50 + radius * Math.sin(angle);
              const isSafe = SAFE_SQUARES.has(pos);
              const p1Here = pieces[0].filter((p) => p.pos === pos);
              const p2Here = pieces[1].filter((p) => p.pos === pos);
              return (
                <div key={pos} className={`absolute w-9 h-9 -ml-4.5 -mt-4.5 rounded-lg flex items-center justify-center border-2 ${isSafe ? 'bg-green-950/40 border-green-600/40' : 'bg-stone-900/40 border-amber-800/30'}`} style={{ left: `${left}%`, top: `${top}%` }}>
                  {isSafe && <span className="text-green-400/40 text-xs">★</span>}
                  {p1Here.map((p) => (
                    <div key={`p1-${p.id}`} className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-[7px] font-bold text-amber-950">{p.id + 1}</div>
                  ))}
                  {p2Here.map((p) => (
                    <div key={`p2-${p.id}`} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-red-300 flex items-center justify-center text-[7px] font-bold text-red-950">{p.id + 1}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button onClick={handleRoll} disabled={gameOver || rolling || dice !== null || currentPlayer !== 0} className="btn-kaalachakra px-6 py-3 rounded-lg font-display text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {rolling ? 'Rolling...' : dice !== null ? `Rolled: ${dice}` : 'Roll Sticks'}
        </button>
      </div>

      {dice !== null && !gameOver && currentPlayer === 0 && (
        <div className="mt-4">
          <p className="font-display text-xs text-amber-300/60 text-center mb-2">Your pieces:</p>
          <div className="flex items-center justify-center gap-2">
            {pieces[0].map((piece) => {
              const atHome = piece.pos === HOME_POS;
              const canEnter = piece.pos === -1 && (dice === 4 || dice === 8);
              const canAdvance = piece.pos !== -1 && piece.pos + dice <= TRACK_LENGTH;
              const movable = !atHome && (canEnter || canAdvance);
              return (
                <button key={piece.id} onClick={() => handlePieceClick(piece.id)} disabled={!movable} className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-display text-sm font-bold transition-all ${atHome ? 'bg-green-900/30 border-green-700/30 text-green-400/50' : movable ? 'bg-amber-700/40 border-amber-400 text-amber-100 hover:scale-110 cursor-pointer' : 'bg-stone-800/40 border-stone-700/30 text-stone-500 cursor-not-allowed'}`}>
                  {atHome ? '✓' : piece.pos === -1 ? `S${piece.id + 1}` : piece.pos}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Roll 4 or 8 to enter. Safe squares (★) protect from capture. Get all 4 pieces to HOME.
      </p>
    </GameShell>
  );
}
