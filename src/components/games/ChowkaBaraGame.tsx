import { useState, useCallback } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Chowka Bara: 5x5 cross-shaped board, 2 players, 4 pieces each
// Track: outer ring of the cross, 4 cells per arm = simplified

const BOARD_SIZE = 5;
const TRACK_LENGTH = 12; // simplified circular track
const HOME_POS = TRACK_LENGTH; // home is beyond the track

interface Piece {
  id: number;
  pos: number; // -1 = start, TRACK_LENGTH = home
}

function rollCowries(difficulty: Difficulty): number {
  // Cowrie shells: 4 shells, each up/down. Count = 1-4, but 4 shells all up = 8 (special)
  const shells = Array.from({ length: 4 }).map(() => Math.random() > 0.5 ? 1 : 0);
  let count = shells.reduce((a, b) => a + b, 0);
  if (count === 0) count = 8; // all down = 8 (special throw)
  // Difficulty affects AI luck slightly
  if (difficulty === 'easy' && Math.random() < 0.3) count = Math.max(count, 4);
  if (difficulty === 'hard' && Math.random() < 0.3) count = Math.min(count, 3);
  return count;
}

function createPieces(): [Piece[], Piece[]] {
  const p1: Piece[] = Array.from({ length: 4 }, (_, i) => ({ id: i, pos: -1 }));
  const p2: Piece[] = Array.from({ length: 4 }, (_, i) => ({ id: i, pos: -1 }));
  return [p1, p2];
}

const SAFE_SQUARES = new Set([2, 5, 8, 11]);

export default function ChowkaBaraGame() {
  const [pieces, setPieces] = useState<[Piece[], Piece[]]>(createPieces);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [message, setMessage] = useState('Player 1: roll the cowrie shells');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const canMove = (playerPieces: Piece[], roll: number): boolean => {
    return playerPieces.some((p) => {
      if (p.pos === HOME_POS) return false;
      if (p.pos === -1) return roll === 4 || roll === 8; // need 4 or 8 to enter
      return p.pos + roll <= TRACK_LENGTH;
    });
  };

  const movePiece = (player: number, pieceId: number, roll: number) => {
    const newPieces: [Piece[], Piece[]] = [
      [...pieces[0].map((p) => ({ ...p }))],
      [...pieces[1].map((p) => ({ ...p }))],
    ];
    const piece = newPieces[player][pieceId];

    if (piece.pos === -1) {
      if (roll !== 4 && roll !== 8) return false;
      piece.pos = 0;
    } else {
      piece.pos += roll;
      if (piece.pos > TRACK_LENGTH) return false;
    }

    // Check capture
    if (piece.pos < TRACK_LENGTH && !SAFE_SQUARES.has(piece.pos)) {
      const opp = player ^ 1;
      for (const op of newPieces[opp]) {
        if (op.pos === piece.pos) {
          op.pos = -1;
          setMessage(`Player ${player + 1} captured a piece!`);
        }
      }
    }

    if (piece.pos === TRACK_LENGTH) {
      setMessage(`Player ${player + 1} got a piece home!`);
    }

    // Check win
    const allHome = newPieces[player].every((p) => p.pos === HOME_POS);
    setPieces(newPieces);
    setDice(null);
    setSelectedPiece(null);

    if (allHome) {
      setGameOver(true);
      setWinner(player);
      setScores((prev) => {
        const ns: [number, number] = [...prev];
        ns[player]++;
        return ns;
      });
      setMessage(`Player ${player + 1} wins — all pieces home!`);
      return true;
    }

    setCurrentPlayer((p) => p ^ 1);
    setMessage(`Player ${(player ^ 1) + 1}: roll the cowrie shells`);
    return true;
  };

  const handleRoll = useCallback(() => {
    if (gameOver || rolling || dice !== null) return;
    setRolling(true);
    setTimeout(() => {
      const roll = rollCowries(difficulty);
      setDice(roll);
      setRolling(false);

      const playerPieces = pieces[currentPlayer];
      if (!canMove(playerPieces, roll)) {
        setMessage(`Rolled ${roll} — no valid moves. Player ${(currentPlayer ^ 1) + 1}'s turn`);
        setDice(null);
        setCurrentPlayer((p) => p ^ 1);
        return;
      }

      setMessage(`Rolled ${roll}. Select a piece to move.`);
    }, 600);
  }, [gameOver, rolling, dice, pieces, currentPlayer, difficulty]);

  const handlePieceClick = (pieceId: number) => {
    if (gameOver || dice === null) return;
    const piece = pieces[currentPlayer][pieceId];
    if (piece.pos === HOME_POS) return;

    if (piece.pos === -1 && dice !== 4 && dice !== 8) {
      setMessage('Need a 4 or 8 to enter the board. Select another piece or skip.');
      return;
    }
    if (piece.pos !== -1 && piece.pos + dice > TRACK_LENGTH) {
      setMessage('That piece would overshoot home. Select another.');
      return;
    }

    movePiece(currentPlayer, pieceId, dice);
  };

  const reset = () => {
    setPieces(createPieces());
    setCurrentPlayer(0);
    setDice(null);
    setMessage('Player 1: roll the cowrie shells');
    setGameOver(false);
    setWinner(null);
    setSelectedPiece(null);
    setRolling(false);
  };

  const trackPositions = Array.from({ length: TRACK_LENGTH }, (_, i) => i);

  return (
    <GameShell
      title="Chowka Bara"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      score={scores[0]}
      bestScore={scores[1]}
      message={message}
      gameOver={gameOver}
      onReset={reset}
    >
      {/* Player indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${currentPlayer === 0 && !gameOver ? 'border-amber-400/60 bg-amber-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-amber-200">P1 Home: {pieces[0].filter((p) => p.pos === HOME_POS).length}/4</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${currentPlayer === 1 && !gameOver ? 'border-red-400/60 bg-red-900/30' : 'border-stone-700/30 bg-stone-900/20'}`}>
          <span className="font-display text-sm text-red-200">P2 Home: {pieces[1].filter((p) => p.pos === HOME_POS).length}/4</span>
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="game-board rounded-2xl p-6 aspect-square flex items-center justify-center">
          {/* Circular track */}
          <div className="relative w-full h-full">
            {/* Center home */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-950/60 border-2 border-amber-600/40 flex items-center justify-center">
              <span className="font-display text-xs text-amber-400/60">HOME</span>
            </div>

            {/* Track positions in a circle */}
            {trackPositions.map((pos) => {
              const angle = (pos / TRACK_LENGTH) * 2 * Math.PI - Math.PI / 2;
              const radius = 38; // percentage
              const left = 50 + radius * Math.cos(angle);
              const top = 50 + radius * Math.sin(angle);
              const isSafe = SAFE_SQUARES.has(pos);
              const p1Here = pieces[0].filter((p) => p.pos === pos);
              const p2Here = pieces[1].filter((p) => p.pos === pos);

              return (
                <div
                  key={pos}
                  className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-lg flex items-center justify-center border-2 ${
                    isSafe ? 'bg-green-950/40 border-green-600/40' : 'bg-stone-900/40 border-amber-800/30'
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {isSafe && <span className="text-green-400/40 text-xs">X</span>}
                  {p1Here.map((p) => (
                    <div key={`p1-${p.id}`} className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-[8px] font-bold text-amber-950">
                      {p.id + 1}
                    </div>
                  ))}
                  {p2Here.map((p) => (
                    <div key={`p2-${p.id}`} className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border border-red-300 flex items-center justify-center text-[8px] font-bold text-red-950">
                      {p.id + 1}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dice and pieces */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={handleRoll}
          disabled={gameOver || rolling || dice !== null}
          className="btn-kaalachakra px-6 py-3 rounded-lg font-display text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rolling ? 'Rolling...' : dice !== null ? `Rolled: ${dice}` : 'Roll Shells'}
        </button>
      </div>

      {/* Piece selection */}
      {dice !== null && !gameOver && (
        <div className="mt-4">
          <p className="font-display text-xs text-amber-300/60 text-center mb-2">Your pieces — click to move:</p>
          <div className="flex items-center justify-center gap-2">
            {pieces[currentPlayer].map((piece) => {
              const atHome = piece.pos === HOME_POS;
              const canEnter = piece.pos === -1 && (dice === 4 || dice === 8);
              const canAdvance = piece.pos !== -1 && piece.pos + dice <= TRACK_LENGTH;
              const movable = !atHome && (canEnter || canAdvance);
              return (
                <button
                  key={piece.id}
                  onClick={() => handlePieceClick(piece.id)}
                  disabled={!movable}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-display text-sm font-bold transition-all ${
                    atHome
                      ? 'bg-green-900/30 border-green-700/30 text-green-400/50'
                      : movable
                      ? 'bg-amber-700/40 border-amber-400 text-amber-100 hover:scale-110 cursor-pointer'
                      : 'bg-stone-800/40 border-stone-700/30 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {atHome ? '✓' : piece.pos === -1 ? `S${piece.id + 1}` : piece.pos}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Roll 4 or 8 to enter the board. Land on opponents to send them home (unless on a safe X square). Get all 4 pieces to HOME.
      </p>
    </GameShell>
  );
}
