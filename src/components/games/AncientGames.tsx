import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { BookOpen, Lightbulb, Pause, Play, RotateCcw, Undo2, X } from 'lucide-react';
import type { Mesh } from 'three';
import { createPortal } from 'react-dom';
import type { Difficulty } from './useGameState';
import AncientGameCardVisual, { type GameId } from './AncientGameCardVisual';

type GameKind = 'race' | 'mehen' | 'strategy' | 'chaturanga' | 'rota' | 'sow' | 'sport';
type GameMode = 'ai' | 'local' | 'practice';
type Owner = 0 | 1;
type PieceKind = 'man' | 'king' | 'pawn' | 'rook' | 'knight' | 'bishop';

interface AncientGame {
  id: GameId;
  name: string;
  origin: string;
  kind: GameKind;
  size: number;
  ruleset: string;
  rules: string[];
  reconstruction?: string;
}

interface Piece {
  id: number;
  owner: Owner;
  pos: number;
  kind: PieceKind;
}

interface GameState {
  pieces: Piece[];
  currentPlayer: Owner;
  turn: number;
  roll: number | null;
  selected: number | null;
  sow: number[];
  scores: [number, number];
  placed: [number, number];
  winner: Owner | null;
  message: string;
}

interface Move { from: number; to: number; }

export const ANCIENT_GAMES: AncientGame[] = [
  { id: 'royal-ur', name: 'Royal Game of Ur', origin: 'Mesopotamia', kind: 'race', size: 20, ruleset: 'Playable race-game reconstruction', reconstruction: 'Reconstructed from the Royal Game of Ur board and later cuneiform rules; the rules changed over time.', rules: ['Throw four binary tetrahedral dice; the result determines movement.', 'Move one of four pieces along the shared 20-space route.', 'Rosette spaces are safe; landing on an opponent elsewhere sends that piece to start.', 'Bring all four pieces off the route to win.'] },
  { id: 'hnefatafl', name: 'Hnefatafl / Viking Chess', origin: 'Norse world', kind: 'strategy', size: 9, ruleset: 'Tablut, 9x9 (Linnaeus account, 1732)', rules: ['Attackers try to capture the king; defenders escort the king to any board edge.', 'All pieces move any distance orthogonally through empty squares.', 'Capture ordinary pieces by sandwiching them between two enemies.', 'The king is captured when surrounded on all four orthogonal sides.'] },
  { id: 'petteia', name: 'Petteia / Latrunculi', origin: 'Ancient Greece and Rome', kind: 'strategy', size: 8, ruleset: 'Latrunculi sandwich-capture reconstruction', reconstruction: 'Ancient descriptions do not provide one complete universal ruleset; this version uses orthogonal moves and custodial capture.', rules: ['Move one square orthogonally to an empty point.', 'Trap an opposing piece between two of yours to capture it.', 'Win by capturing all opposing pieces or leaving them without a legal move.'] },
  { id: 'mehen', name: 'Mehen', origin: 'Ancient Egypt', kind: 'mehen', size: 20, ruleset: 'HISTORICAL RECONSTRUCTION PLAY MODE', reconstruction: 'Exact ancient rules are uncertain. This playable reconstruction treats the spiral as a shared race track.', rules: ['Roll a die and move one of your pieces along the spiral.', 'Land on an opponent away from a marked sanctuary to return it to start.', 'The first player to bring all pieces to the center wins.', 'Exact ancient rules are uncertain.'] },
  { id: 'patolli', name: 'Patolli', origin: 'Mesoamerica', kind: 'race', size: 20, ruleset: 'Historical reconstruction mode', reconstruction: 'A digital race-game reconstruction based on descriptions of Patolli; regional boards and play details varied.', rules: ['Use marked beans as lots to determine movement.', 'Move a piece around the route; marked safe spaces protect pieces.', 'Landing on a rival sends it back to its start.', 'The first player to bring all four pieces home wins.'] },
  { id: 'chaturanga', name: 'Chaturanga', origin: 'India', kind: 'chaturanga', size: 8, ruleset: 'Four-division, two-player digital reconstruction', reconstruction: 'Historical Chaturanga had regional variants; this accessible two-player ruleset uses recognizable piece movement and capture.', rules: ['Move a piece according to its displayed role: king, rook, bishop, knight, or pawn.', 'Capture by landing on an opposing piece.', 'The game ends when a king is captured.', 'This reconstruction omits check and checkmate.'] },
  { id: 'puluc', name: 'Puluc', origin: 'Maya communities of Guatemala', kind: 'race', size: 20, ruleset: 'K’iche’ race-game reconstruction', reconstruction: 'Rules are based on a documented modern K’iche’ form and are presented as a reconstruction, not a single ancient standard.', rules: ['Throw marked sticks to determine movement.', 'Move pieces along the route and capture opposing pieces by landing on them.', 'Captured pieces travel with the captor until carried off the far end.', 'The player who captures and carries off all opposing pieces wins.'] },
  { id: 'sugoroku', name: 'Sugoroku', origin: 'Japan', kind: 'race', size: 20, ruleset: 'E-sugoroku race-board reconstruction', reconstruction: 'Sugoroku names several Japanese board-game forms; this version uses a simple illustrated race-board format.', rules: ['Roll a die and move one token along the route.', 'Follow the instruction on a special marked space when you land there.', 'Reach the final space with an exact or lower roll to win.'] },
  { id: 'senet', name: 'Senet', origin: 'Ancient Egypt', kind: 'race', size: 30, ruleset: 'Playable 30-square race-game reconstruction', reconstruction: 'Senet boards survive, but the original rules are not fully known. This accessible digital version uses a die and a simplified race-game ruleset.', rules: ['Move pieces along a shared route across a three-row board.', 'In this digital reconstruction, roll the die to determine how far a piece advances.', 'Use the marked final squares strategically as pieces approach the end of the route.', 'The first player to move all their pieces off the board wins.'] },
  { id: 'rota', name: 'Rota', origin: 'Roman world', kind: 'rota', size: 9, ruleset: 'Roman Rota, three-in-a-row reconstruction', reconstruction: 'The surviving board diagram supports a three-in-a-row game; details of play are reconstructed.', rules: ['Place three pieces each, alternating turns.', 'After placement, move one piece to an adjacent empty point.', 'Make a line of three to win.'] },
  { id: 'chowka-bhara', name: 'Chowka Bhara / Ashte Kashte', origin: 'Karnataka, India', kind: 'race', size: 20, ruleset: 'Cowrie-shell race-game reconstruction', reconstruction: 'Regional boards and entry/capture rules vary; this digital version clearly selects one simplified variant.', rules: ['Throw four cowrie shells to determine movement.', 'Bring pieces onto the route, race around, and reach home.', 'Landing on an unprotected opponent returns it to start.', 'The first player to bring all four pieces home wins.'] },
  { id: 'hyena-game', name: 'Game of the Hyena', origin: 'Northeast Africa', kind: 'race', size: 20, ruleset: 'Hyena-game race reconstruction', reconstruction: 'This reconstruction uses the documented race-and-rescue structure; local board and move variants exist.', rules: ['Race a family piece toward the well and back.', 'A hyena piece follows the same route and can capture family pieces.', 'Reach home with your family before the hyena catches them.'] },
  { id: 'tlachtli', name: 'Tlachtli / Mesoamerican Ballgame', origin: 'Mesoamerica', kind: 'sport', size: 7, ruleset: 'Turn-based court-play reconstruction', reconstruction: 'The historical sport had regional forms; this abstract digital mode models court progression, passing, and scoring.', rules: ['Choose Pass, Advance, or Shoot on your turn.', 'Successful advances move the ball toward the scoring end.', 'Shots are more likely to score from the attacking zone.', 'The higher score after 12 turns wins.'] },
  { id: 'episkyros', name: 'Episkyros', origin: 'Ancient Greece', kind: 'sport', size: 7, ruleset: 'Turn-based team-ball reconstruction', reconstruction: 'Ancient descriptions are limited; this simplified mode represents territory gained through passing and movement.', rules: ['Choose Pass, Advance, or Shoot on your turn.', 'Advance moves your side toward its scoring line.', 'A failed action turns possession over.', 'The higher score after 12 turns wins.'] },
  { id: 'harpastum', name: 'Harpastum', origin: 'Roman world', kind: 'sport', size: 7, ruleset: 'Turn-based ball-game reconstruction', reconstruction: 'Descriptions of Harpastum are brief; this simplified digital ruleset is a clearly labeled reconstruction.', rules: ['Choose Pass, Advance, or Shoot on your turn.', 'Advance the ball through the central zones.', 'A successful shot scores; a failed action gives the next player possession.', 'The higher score after 12 turns wins.'] },
];

const ownerName = (player: Owner) => `Player ${player + 1}`;
const position = (row: number, col: number, size: number) => row * size + col;

function initialPieces(game: AncientGame): Piece[] {
  let id = 0;
  const add = (owner: Owner, pos: number, kind: PieceKind = 'man') => ({ id: id++, owner, pos, kind });
  if (game.id === 'hnefatafl') {
    const attackers = [[0, 3], [0, 4], [0, 5], [1, 4], [8, 3], [8, 4], [8, 5], [7, 4], [3, 0], [4, 0], [5, 0], [4, 1], [3, 8], [4, 8], [5, 8], [4, 7]];
    const defenders = [[4, 4], [3, 4], [5, 4], [4, 3], [4, 5], [3, 3], [3, 5], [5, 3], [5, 5]];
    return [...attackers.map(([r, c]) => add(0, position(r, c, 9))), ...defenders.map(([r, c], i) => add(1, position(r, c, 9), i === 0 ? 'king' : 'man'))];
  }
  if (game.id === 'petteia') return [...Array.from({ length: 16 }, (_, i) => add(0, i)), ...Array.from({ length: 16 }, (_, i) => add(1, 48 + i))];
  if (game.kind === 'chaturanga') {
    const back: PieceKind[] = ['rook', 'knight', 'bishop', 'king', 'bishop', 'knight', 'rook', 'man'];
    return [...back.map((kind, col) => add(0, position(0, col, 8), kind)), ...Array.from({ length: 8 }, (_, col) => add(0, position(1, col, 8), 'pawn')),
      ...back.map((kind, col) => add(1, position(7, col, 8), kind)), ...Array.from({ length: 8 }, (_, col) => add(1, position(6, col, 8), 'pawn'))];
  }
  if (game.kind === 'race' || game.kind === 'mehen') return [0, 1].flatMap((owner) => Array.from({ length: 4 }, () => add(owner as Owner, -1, 'man')));
  if (game.kind === 'sport') return [add(0, 3, 'man')];
  return [];
}

function newState(game: AncientGame): GameState {
  return { pieces: initialPieces(game), currentPlayer: 0, turn: 1, roll: null, selected: null, sow: game.kind === 'sow' ? Array(14).fill(6) : [], scores: [0, 0], placed: [0, 0], winner: null,
    message: game.kind === 'race' || game.kind === 'mehen' ? 'Roll the dice, select a piece, then choose its destination.' : 'Select one of your pieces to begin.' };
}

function movesFor(game: AncientGame, state: GameState, from: number, owner: Owner): Move[] {
  const size = game.size;
  const row = Math.floor(from / size); const col = from % size;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const piece = state.pieces.find((item) => item.pos === from && item.owner === owner);
  if (!piece) return [];
  const moves: Move[] = [];
  const addRay = (dr: number, dc: number, maxSteps: number, allowCapture: boolean) => {
    for (let step = 1; step <= maxSteps; step++) {
      const r = row + dr * step; const c = col + dc * step;
      if (r < 0 || c < 0 || r >= size || c >= size) break;
      const to = position(r, c, size);
      const occupant = state.pieces.find((item) => item.pos === to);
      if (occupant) {
        if (allowCapture && occupant.owner !== owner && step === 1) moves.push({ from, to });
        break;
      }
      moves.push({ from, to });
    }
  };
  if (game.id === 'hnefatafl') dirs.forEach(([dr, dc]) => addRay(dr, dc, size, false));
  else if (game.id === 'petteia' || game.kind === 'rota') dirs.forEach(([dr, dc]) => addRay(dr, dc, 1, false));
  else if (game.kind === 'chaturanga') {
    if (piece.kind === 'pawn') {
      const direction = owner === 0 ? 1 : -1;
      const forwardRow = row + direction;
      if (forwardRow >= 0 && forwardRow < size) {
        const forward = position(forwardRow, col, size);
        if (!state.pieces.some((item) => item.pos === forward)) moves.push({ from, to: forward });
        for (const targetCol of [col - 1, col + 1]) {
          if (targetCol < 0 || targetCol >= size) continue;
          const target = position(forwardRow, targetCol, size);
          if (state.pieces.some((item) => item.pos === target && item.owner !== owner)) moves.push({ from, to: target });
        }
      }
    } else if (piece.kind === 'knight') {
      for (const [dr, dc] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
        const r = row + dr; const c = col + dc; const to = position(r, c, size);
        if (r >= 0 && c >= 0 && r < size && c < size && !state.pieces.some((item) => item.pos === to && item.owner === owner)) moves.push({ from, to });
      }
    } else {
      const vectors = piece.kind === 'rook' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : piece.kind === 'bishop' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      vectors.forEach(([dr, dc]) => addRay(dr, dc, piece.kind === 'king' ? 1 : size, true));
    }
  }
  return moves;
}

function legalMoves(game: AncientGame, state: GameState, owner: Owner): Move[] {
  return state.pieces.filter((piece) => piece.owner === owner && piece.pos >= 0).flatMap((piece) => movesFor(game, state, piece.pos, owner));
}

function applyGridMove(game: AncientGame, state: GameState, move: Move): GameState {
  const movedPiece = state.pieces.find((piece) => piece.pos === move.from && piece.owner === state.currentPlayer);
  if (!movedPiece) return state;
  let pieces = state.pieces.filter((piece) => piece.pos !== move.to).map((piece) => piece.id === movedPiece.id ? { ...piece, pos: move.to } : piece);
  const size = game.size; let captured = 0;
  if (game.id === 'hnefatafl' || game.id === 'petteia') {
    const row = Math.floor(move.to / size); const col = move.to % size;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ar = row + dr; const ac = col + dc; const br = row + 2 * dr; const bc = col + 2 * dc;
      if (ar < 0 || ac < 0 || br < 0 || bc < 0 || ar >= size || ac >= size || br >= size || bc >= size) continue;
      const adjacent = position(ar, ac, size); const beyond = position(br, bc, size);
      const target = pieces.find((piece) => piece.pos === adjacent && piece.owner !== state.currentPlayer && piece.kind !== 'king');
      const support = pieces.some((piece) => piece.pos === beyond && piece.owner === state.currentPlayer);
      if (target && support) { pieces = pieces.filter((piece) => piece.id !== target.id); captured++; }
    }
    const king = pieces.find((piece) => piece.kind === 'king');
    if (game.id === 'hnefatafl' && king) {
      const kingRow = Math.floor(king.pos / size); const kingCol = king.pos % size;
      if (kingRow === 0 || kingCol === 0 || kingRow === size - 1 || kingCol === size - 1) return { ...state, pieces, currentPlayer: 1, turn: state.turn + 1, selected: null, winner: 1, message: 'The king escaped to the edge. Defenders win.' };
      const surrounded = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dr, dc]) => pieces.some((piece) => piece.owner === 0 && piece.pos === position(kingRow + dr, kingCol + dc, size)));
      if (surrounded) return { ...state, pieces, currentPlayer: 0, turn: state.turn + 1, selected: null, winner: 0, message: 'The king is surrounded. Attackers win.' };
    }
  }
  const nextPlayer = (state.currentPlayer ^ 1) as Owner;
  let winner: Owner | null = null; let message = `${ownerName(nextPlayer)} to move${captured ? `; ${captured} piece captured` : ''}.`;
  if (game.kind === 'chaturanga' && !pieces.some((piece) => piece.kind === 'king' && piece.owner !== state.currentPlayer)) { winner = state.currentPlayer; message = `${ownerName(winner)} captured the king and wins.`; }
  if (game.id === 'petteia' && !pieces.some((piece) => piece.owner === nextPlayer)) { winner = state.currentPlayer; message = `${ownerName(winner)} captured every opposing piece.`; }
  if (game.kind === 'rota') {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    if (lines.some((line) => line.every((pos) => pieces.some((piece) => piece.owner === state.currentPlayer && piece.pos === pos)))) { winner = state.currentPlayer; message = `${ownerName(winner)} made a line of three.`; }
  }
  if (!winner && legalMoves(game, { ...state, pieces, currentPlayer: nextPlayer }, nextPlayer).length === 0 && game.id !== 'rota') { winner = state.currentPlayer; message = `${ownerName(winner)} wins; the opponent has no legal move.`; }
  const placed = game.kind === 'rota' && state.placed[0] + state.placed[1] < 6 ? state.placed.map((count, index) => count + (index === state.currentPlayer ? 1 : 0)) as [number, number] : state.placed;
  return { ...state, pieces, placed, currentPlayer: nextPlayer, turn: state.turn + 1, selected: null, winner, message };
}

function sowTurn(state: GameState, pit: number): GameState {
  if (pit < 0 || pit > 13 || (state.currentPlayer === 0 ? pit > 6 : pit < 7) || state.sow[pit] === 0) return state;
  const seeds = [...state.sow]; let hand = seeds[pit]; seeds[pit] = 0; let index = pit;
  while (hand > 0) { index = (index + 1) % 14; seeds[index]++; hand--; }
  const scores: [number, number] = [...state.scores];
  if ((index < 7) === (state.currentPlayer === 0) && seeds[index] === 1) { const opposite = (index + 7) % 14; scores[state.currentPlayer] += seeds[index] + seeds[opposite]; seeds[index] = 0; seeds[opposite] = 0; }
  const nextPlayer = (state.currentPlayer ^ 1) as Owner;
  const emptySide = (player: Owner) => seeds.slice(player * 7, player * 7 + 7).every((count) => count === 0);
  const over = emptySide(0) || emptySide(1);
  if (over) { scores[0] += seeds.slice(0, 7).reduce((sum, count) => sum + count, 0); scores[1] += seeds.slice(7).reduce((sum, count) => sum + count, 0); }
  const winner = over ? (scores[0] >= scores[1] ? 0 : 1) as Owner : null;
  return { ...state, sow: seeds, scores, currentPlayer: nextPlayer, turn: state.turn + 1, winner, message: over ? `${ownerName(winner!)} wins with the most seeds.` : `${ownerName(nextPlayer)} to sow.` };
}

function actSport(state: GameState, action: 'Pass' | 'Advance' | 'Shoot'): GameState {
  const roll = Math.floor(Math.random() * 6) + 1; const scores: [number, number] = [...state.scores];
  let pieces = [...state.pieces]; let message = '';
  if (action === 'Shoot') {
    const distanceBonus = (state.pieces[0]?.pos ?? 0) >= 5 ? 1 : 0;
    if (roll + distanceBonus >= 4) { scores[state.currentPlayer]++; message = `${ownerName(state.currentPlayer)} scores!`; } else message = `${ownerName(state.currentPlayer)}'s shot misses. Possession changes.`;
  } else if (action === 'Advance') {
    if (roll >= 3) { pieces = pieces.map((piece) => ({ ...piece, pos: Math.min(6, piece.pos + 1) })); message = `${ownerName(state.currentPlayer)} advances the ball.`; } else message = 'The defense wins the ball.';
  } else message = roll >= 2 ? `${ownerName(state.currentPlayer)} completes a pass.` : 'The pass is intercepted.';
  const nextPlayer = (state.currentPlayer ^ 1) as Owner; const winner = state.turn >= 12 ? (scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1) : null;
  return { ...state, pieces, scores, currentPlayer: nextPlayer, turn: state.turn + 1, winner, message: state.turn >= 12 ? winner === null ? 'The match ends level.' : `${ownerName(winner)} wins the match.` : `${message} ${ownerName(nextPlayer)} to act.` };
}

function aiTurn(game: AncientGame, state: GameState, difficulty: Difficulty): GameState {
  if (game.kind === 'race' || game.kind === 'mehen') {
    const roll = 1 + Math.floor(Math.random() * (game.id === 'royal-ur' ? 5 : 6));
    const candidates = state.pieces.filter((piece) => piece.owner === 1 && piece.pos < game.size);
    if (!candidates.length) return { ...state, currentPlayer: 0, turn: state.turn + 1, message: 'AI has no pieces to move. Your turn.' };
    const chosen = candidates.find((piece) => piece.pos + roll >= game.size) ?? candidates[Math.floor(Math.random() * candidates.length)];
    const destination = Math.min(game.size, Math.max(0, chosen.pos + roll));
    let pieces = state.pieces.map((piece) => piece.id === chosen.id ? { ...piece, pos: destination } : piece);
    if (destination < game.size && !new Set([0, 5, 10, 15]).has(destination)) pieces = pieces.map((piece) => piece.owner === 0 && piece.pos === destination ? { ...piece, pos: -1 } : piece);
    const winner = pieces.filter((piece) => piece.owner === 1 && piece.pos >= game.size).length === 4 ? 1 : null;
    return { ...state, pieces, currentPlayer: 0, turn: state.turn + 1, roll: null, selected: null, winner, message: winner === 1 ? 'AI brought every piece home.' : `AI rolled ${roll} and moved. Your turn.` };
  }
  if (game.kind === 'sow') { const pits = state.sow.map((seeds, index) => seeds > 0 && index >= 7 ? index : -1).filter((index) => index >= 0); return pits.length ? sowTurn(state, pits[Math.floor(Math.random() * pits.length)]) : { ...state, currentPlayer: 0, turn: state.turn + 1 }; }
  if (game.kind === 'sport') return actSport(state, difficulty === 'easy' ? 'Advance' : Math.random() > 0.55 ? 'Shoot' : 'Advance');
  const moves = legalMoves(game, state, 1);
  if (!moves.length) return { ...state, winner: 0, message: 'AI has no legal move. You win.' };
  let chosen = moves[Math.floor(Math.random() * moves.length)];
  if (difficulty !== 'easy') chosen = moves.find((move) => state.pieces.some((piece) => piece.owner === 0 && piece.pos === move.to)) ?? chosen;
  return applyGridMove(game, state, chosen);
}

export default function AncientGames() {
  const [selectedGame, setSelectedGame] = useState<AncientGame | null>(null);
  return <>
    <div className="mt-20">
      <div className="text-center mb-10"><p className="font-sanskrit text-amber-300/60 text-lg mb-2">विश्व की प्राचीन क्रीड़ा</p><h3 className="font-display text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">Playable Ancient Games</h3><p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">Explore playable historical games on interactive 3D boards. Reconstructions are identified in each game.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ANCIENT_GAMES.map((game, index) => <article key={game.id} className="heritage-card rounded-xl p-5 flex flex-col min-h-52" style={{ animationDelay: `${index * 0.04}s` }}>
          <AncientGameCardVisual gameId={game.id} name={game.name} />
          <div className="flex items-start justify-between gap-3 mb-3"><div><p className="font-display text-[10px] tracking-[0.16em] uppercase text-amber-400/60">{game.origin}</p><h4 className="font-display text-lg font-semibold text-amber-100 mt-1">{game.name}</h4></div><span className="shrink-0 rounded-full border border-emerald-700/40 bg-emerald-950/30 px-2.5 py-1 font-display text-[10px] uppercase text-emerald-300">Playable</span></div>
          <p className="font-body text-sm text-amber-100/50 mb-3">{game.ruleset}</p>{game.reconstruction && <p className="font-body text-xs text-sky-200/70 mb-4">{game.reconstruction}</p>}
          <button onClick={() => setSelectedGame(game)} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-2 font-display text-xs uppercase tracking-wide text-amber-200 transition-colors hover:bg-amber-800/40"><Play size={14} /> Play Now</button>
        </article>)}
      </div>
    </div>
    {selectedGame && createPortal(<AncientGameModal game={selectedGame} onExit={() => setSelectedGame(null)} />, document.body)}
  </>;
}

function AncientGameModal({ game, onExit }: { game: AncientGame; onExit: () => void }) {
  const [mode, setMode] = useState<GameMode>('ai'); const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [state, setState] = useState(() => newState(game)); const [history, setHistory] = useState<GameState[]>([]);
  const [paused, setPaused] = useState(false); const [cameraReset, setCameraReset] = useState(0);
  const finished = state.winner !== null || (game.kind === 'sport' && state.turn > 12);
  const destinations = useMemo(() => state.selected === null ? [] : game.kind === 'race' || game.kind === 'mehen' ? [Math.min(game.size, state.pieces.find((piece) => piece.id === state.selected)!.pos + (state.roll ?? 0))] : movesFor(game, state, state.selected, state.currentPlayer).map((move) => move.to), [game, state]);
  const commit = (next: GameState) => { setHistory((items) => [...items.slice(-39), state]); setState(next); };

  useEffect(() => {
    if (mode !== 'ai' || state.currentPlayer !== 1 || finished || paused) return;
    const timer = window.setTimeout(() => setState((current) => { setHistory((items) => [...items.slice(-39), current]); return aiTurn(game, current, difficulty); }), 650);
    return () => window.clearTimeout(timer);
  }, [difficulty, finished, game, mode, paused, state.currentPlayer, state.turn]);

  const reset = () => { setState(newState(game)); setHistory([]); setPaused(false); };
  const undo = () => { const previous = history[history.length - 1]; if (previous) { setState(previous); setHistory((items) => items.slice(0, -1)); } };
  const handleCell = (index: number) => {
    if (paused || finished || (mode === 'ai' && state.currentPlayer === 1)) return;
    if (game.kind === 'race' || game.kind === 'mehen') {
      if (state.roll === null) return;
      if (state.selected !== null && destinations.includes(index)) {
        let pieces = state.pieces.map((piece) => piece.id === state.selected ? { ...piece, pos: index } : piece);
        if (!new Set([0, 5, 10, 15]).has(index) && index < game.size) pieces = pieces.map((piece) => piece.owner !== state.currentPlayer && piece.pos === index ? { ...piece, pos: -1 } : piece);
        const homeCount = pieces.filter((piece) => piece.owner === state.currentPlayer && piece.pos >= game.size).length;
        const winner = homeCount >= 4 ? state.currentPlayer : null;
        const next = game.id === 'royal-ur' && new Set([0, 5, 10, 15]).has(index) ? state.currentPlayer : (state.currentPlayer ^ 1) as Owner;
        commit({ ...state, pieces, currentPlayer: next, turn: state.turn + 1, roll: null, selected: null, winner, message: winner !== null ? `${ownerName(winner)} brought every piece home.` : `${ownerName(next)} to move.` }); return;
      }
      const piece = state.pieces.find((item) => item.owner === state.currentPlayer && item.pos === index && item.pos < game.size);
      if (piece) commit({ ...state, selected: piece.id, message: `Select the highlighted destination for the ${ownerName(state.currentPlayer)} piece.` });
      return;
    }
    if (game.kind === 'sow') { commit(sowTurn(state, index)); return; }
    if (game.kind === 'sport') return;
    const selectedPiece = state.selected === null ? null : state.pieces.find((piece) => piece.pos === state.selected && piece.owner === state.currentPlayer);
    if (!selectedPiece) {
      if (state.pieces.some((piece) => piece.pos === index && piece.owner === state.currentPlayer)) commit({ ...state, selected: index, message: `Choose a highlighted destination for ${ownerName(state.currentPlayer)}.` });
      else if (game.kind === 'rota' && state.pieces.length < 6 && !state.pieces.some((piece) => piece.pos === index)) {
        const piece: Piece = { id: Math.max(-1, ...state.pieces.map((item) => item.id)) + 1, owner: state.currentPlayer, pos: index, kind: 'man' };
        const pieces = [...state.pieces, piece]; const placed = state.placed.map((count, player) => count + (player === state.currentPlayer ? 1 : 0)) as [number, number]; const next = (state.currentPlayer ^ 1) as Owner;
        commit({ ...state, pieces, placed, currentPlayer: next, turn: state.turn + 1, message: `${ownerName(next)}: place a piece.` });
      }
      return;
    }
    if (destinations.includes(index)) { commit(applyGridMove(game, state, { from: selectedPiece.pos, to: index })); return; }
    if (state.pieces.some((piece) => piece.pos === index && piece.owner === state.currentPlayer)) commit({ ...state, selected: index });
  };
  const rollDice = () => {
    if ((mode === 'ai' && state.currentPlayer === 1) || finished || paused) return;
    const roll = game.id === 'royal-ur' ? Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 6);
    if (roll === 0) { commit({ ...state, currentPlayer: (state.currentPlayer ^ 1) as Owner, turn: state.turn + 1, message: `${ownerName(state.currentPlayer)} rolled 0. Turn passes.` }); return; }
    const candidates = state.pieces.filter((piece) => piece.owner === state.currentPlayer && piece.pos < game.size && (piece.pos < 0 || piece.pos + roll <= game.size));
    commit({ ...state, roll, selected: null, message: candidates.length ? `${ownerName(state.currentPlayer)} rolled ${roll}. Choose a piece.` : `${ownerName(state.currentPlayer)} rolled ${roll}; no legal move. Turn passes.` });
    if (!candidates.length) window.setTimeout(() => setState((current) => ({ ...current, currentPlayer: (current.currentPlayer ^ 1) as Owner, turn: current.turn + 1, roll: null })), 500);
  };
  const hint = () => {
    if (game.kind === 'race' || game.kind === 'mehen') setState((current) => ({ ...current, message: current.roll === null ? 'Roll first. Prefer pieces that can finish, capture, or leave a safe space.' : 'Choose a piece, then move it to the highlighted rolled destination.' }));
    else if (game.kind === 'sow') setState((current) => ({ ...current, message: `Hint: choose a non-empty pit on your row. ${current.sow.slice(current.currentPlayer * 7, current.currentPlayer * 7 + 7).join(', ')} seeds are on your row.` }));
    else if (game.kind === 'sport') setState((current) => ({ ...current, message: (current.pieces[0]?.pos ?? 0) >= 5 ? 'You are in the scoring zone; shooting is a strong option.' : 'Advance toward the far end before attempting a shot.' }));
    else { const move = legalMoves(game, state, state.currentPlayer)[0]; setState((current) => ({ ...current, message: move ? `Hint: move the piece at ${move.from + 1} to ${move.to + 1}.` : 'No legal moves are available.' })); }
  };
  const actionsAllowed = !paused && !finished && !(mode === 'ai' && state.currentPlayer === 1);

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#080c18]/95 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`${game.name} game`}>
    <div className="mx-auto flex min-h-full max-w-7xl flex-col overflow-hidden rounded-xl border border-amber-600/30 bg-[#10141e] shadow-2xl shadow-black/60">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800/30 px-4 py-4 sm:px-6"><div><p className="font-display text-[10px] uppercase tracking-[0.16em] text-amber-400/60">{game.origin} · {game.ruleset}</p><h2 className="font-display text-xl font-semibold text-amber-100 sm:text-2xl">{game.name}</h2></div><div className="flex items-center gap-2"><button title="Reset camera" onClick={() => setCameraReset((value) => value + 1)} className="rounded-md border border-stone-600/50 p-2 text-stone-300 hover:text-amber-200"><RotateCcw size={17} /></button><button onClick={() => setPaused((value) => !value)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-700/40 px-3 text-xs text-amber-200">{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Resume' : 'Pause'}</button><button onClick={onExit} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-800/50 px-3 text-xs text-red-200"><X size={15} /> Exit Game</button></div></header>
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="relative min-h-[360px] border-b border-amber-900/20 bg-[radial-gradient(ellipse_at_50%_35%,#39404a_0%,#1c232d_45%,#10141e_100%)] lg:min-h-[620px] lg:border-b-0 lg:border-r">
          <Canvas key={cameraReset} shadows camera={{ position: [0, 9, 11], fov: 42 }} dpr={[1, 1.7]}><color attach="background" args={['#151a22']} /><ambientLight intensity={0.7} /><directionalLight position={[-5, 9, 5]} intensity={2.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><pointLight position={[5, 5, -4]} intensity={1.1} color="#eab86d" /><AncientBoard game={game} state={state} destinations={destinations} onCell={handleCell} onPiece={(pieceId) => { const piece = state.pieces.find((item) => item.id === pieceId); if (!piece) return; if (game.kind === 'race' || game.kind === 'mehen') { if (piece.owner === state.currentPlayer && state.roll !== null) commit({ ...state, selected: piece.id }); } else handleCell(piece.pos); }} /><ContactShadows position={[0, -0.08, 0]} opacity={0.42} scale={14} blur={2.5} far={5} /><OrbitControls makeDefault minDistance={7} maxDistance={18} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.08} enableDamping /></Canvas>
          {paused && <div className="absolute inset-0 flex items-center justify-center bg-black/65"><div className="text-center"><Pause className="mx-auto mb-2 text-amber-300" size={34} /><p className="font-display text-xl text-amber-100">Game Paused</p><button onClick={() => setPaused(false)} className="mt-4 rounded-md border border-amber-500/50 px-4 py-2 text-sm text-amber-200">Resume</button></div></div>}
          {finished && <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-amber-400/40 bg-black/70 px-5 py-3 text-center font-display text-amber-100">{state.winner === null ? 'Match drawn' : `${ownerName(state.winner)} wins`}</div>}
          {(game.kind === 'race' || game.kind === 'mehen') && <button disabled={!actionsAllowed || state.roll !== null} onClick={rollDice} className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md border border-amber-300/60 bg-amber-900/80 px-5 py-3 font-display text-sm text-amber-100 disabled:opacity-40">{state.roll === null ? 'Roll Dice' : `Rolled ${state.roll}`}</button>}
          {game.kind === 'sport' && <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">{(['Pass', 'Advance', 'Shoot'] as const).map((action) => <button key={action} disabled={!actionsAllowed} onClick={() => commit(actSport(state, action))} className="min-h-11 rounded-md border border-amber-400/40 bg-[#151a22]/90 px-4 font-display text-xs text-amber-100 disabled:opacity-40">{action}</button>)}</div>}
        </div>
        <aside className="flex flex-col gap-5 p-4 sm:p-6">
          <section><p className="font-display text-[10px] uppercase tracking-widest text-amber-400/60">Play mode</p><div className="mt-2 grid grid-cols-3 gap-1 rounded-md border border-stone-700/50 p-1">{([['ai', 'Player vs AI'], ['local', 'Same Device'], ['practice', 'Practice']] as const).map(([id, label]) => <button key={id} onClick={() => { setMode(id); reset(); }} className={`min-h-10 rounded px-1 text-[10px] ${mode === id ? 'bg-amber-800/40 text-amber-100' : 'text-stone-400 hover:text-amber-200'}`}>{label}</button>)}</div></section>
          {mode === 'ai' && <label className="flex items-center justify-between gap-3 font-display text-xs text-stone-300">AI difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="rounded border border-stone-600 bg-[#171d27] px-2 py-2 text-amber-100"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>}
          <div className="grid grid-cols-2 gap-2"><Status label="Current player" value={state.winner === null ? ownerName(state.currentPlayer) : `${ownerName(state.winner)} won`} /><Status label="Turn number" value={String(state.turn)} /><Status label="Score / pieces" value={game.kind === 'sow' || game.kind === 'sport' ? `${state.scores[0]} : ${state.scores[1]}` : `${state.pieces.filter((piece) => piece.owner === 0 && piece.pos >= 0 && piece.pos < game.size).length} vs ${state.pieces.filter((piece) => piece.owner === 1 && piece.pos >= 0 && piece.pos < game.size).length}`} /><Status label="Die / seeds" value={state.roll === null ? game.kind === 'sow' ? `${state.sow.reduce((sum, count) => sum + count, 0)} seeds` : 'Ready' : String(state.roll)} /></div>
          <p aria-live="polite" className="min-h-12 rounded-md border border-amber-900/30 bg-black/20 p-3 font-body text-sm text-amber-100/80">{state.message}</p>
          <div className="flex flex-wrap gap-2"><button onClick={undo} disabled={history.length === 0} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-stone-600/50 px-3 text-xs text-stone-200 disabled:opacity-30"><Undo2 size={14} /> Undo</button><button onClick={reset} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-stone-600/50 px-3 text-xs text-stone-200"><RotateCcw size={14} /> Restart</button><button onClick={hint} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-amber-700/40 px-3 text-xs text-amber-200"><Lightbulb size={14} /> Hint</button></div>
          <p className="font-body text-[11px] text-amber-200/40">Undo is a digital accessibility feature and does not represent historical play.</p>
          <div className="border-t border-amber-900/30 pt-4"><h3 className="mb-3 flex items-center gap-2 font-display text-sm text-amber-200"><BookOpen size={15} /> Game rules</h3><ol className="space-y-2">{game.rules.map((rule, index) => <li key={rule} className="flex gap-2 font-body text-sm leading-snug text-stone-300/80"><span className="font-display text-amber-500/60">{index + 1}.</span>{rule}</li>)}</ol></div>
          {game.reconstruction && <p className="border-l-2 border-sky-700/50 pl-3 font-body text-xs leading-relaxed text-sky-100/70">{game.reconstruction}</p>}<p className="mt-auto font-body text-[11px] text-stone-500">Drag to orbit · Scroll/pinch to zoom · Tap or click pieces and spaces to move</p>
        </aside>
      </div>
    </div>
  </div>;
}

function Status({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-stone-700/50 bg-black/15 p-2.5"><p className="font-display text-[9px] uppercase tracking-wider text-stone-500">{label}</p><p className="mt-1 font-display text-xs text-amber-100">{value}</p></div>; }

function AncientBoard({ game, state, destinations, onCell, onPiece }: { game: AncientGame; state: GameState; destinations: number[]; onCell: (index: number) => void; onPiece: (id: number) => void }) {
  const boardWidth = game.kind === 'strategy' || game.kind === 'chaturanga' || game.kind === 'rota' ? game.size : 8;
  const offset = (boardWidth - 1) / 2;
  const trackPoint = (index: number) => {
    if (game.kind === 'mehen') { const progress = (index + 1) / game.size; const angle = progress * Math.PI * 6; const radius = 0.32 + progress * 2.5; return [Math.cos(angle) * radius, 0.25, Math.sin(angle) * radius] as const; }
    const angle = (index / game.size) * Math.PI * 2 - Math.PI / 2; return [Math.cos(angle) * 2.7, 0.25, Math.sin(angle) * 2.7] as const;
  };
  const gridPoint = (index: number) => game.kind === 'sow' ? [index % 7 - 3, 0.25, index < 7 ? 0.65 : -0.65] as const : [index % game.size - offset, 0.25, Math.floor(index / game.size) - offset] as const;
  const points = game.kind === 'race' || game.kind === 'mehen' ? Array.from({ length: game.size }, (_, index) => trackPoint(index)) : game.kind === 'sport' ? Array.from({ length: game.size }, (_, index) => [index - offset, 0.18, 0] as const) : Array.from({ length: game.kind === 'sow' ? game.size : game.size * game.size }, (_, index) => gridPoint(index));
  const boardScale = Math.max(5.5, boardWidth * 0.78);
  return <>
    <mesh position={[0, -0.25, 0]} receiveShadow castShadow><cylinderGeometry args={[boardScale / 1.45, boardScale / 1.4, 0.36, 64]} /><meshStandardMaterial color="#403128" roughness={0.34} metalness={0.22} /></mesh>
    <mesh position={[0, -0.04, 0]} receiveShadow><cylinderGeometry args={[boardScale / 1.5, boardScale / 1.48, 0.08, 64]} /><meshStandardMaterial color="#a77a49" roughness={0.55} /></mesh>
    {game.kind === 'sport' && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}><planeGeometry args={[game.size + 0.6, 2.4]} /><meshStandardMaterial color="#28553c" roughness={0.8} /></mesh>}
    {points.map((point, index) => <mesh key={`tile-${index}`} position={point} onClick={(event) => { event.stopPropagation(); onCell(index); }} castShadow receiveShadow><cylinderGeometry args={game.kind === 'sow' ? [0.34, 0.38, 0.2, 32] : game.kind === 'race' || game.kind === 'mehen' ? [0.3, 0.34, 0.16, 32] : game.kind === 'sport' ? [0.46, 0.46, 0.12, 4] : [0.31, 0.31, 0.13, 4]} /><meshStandardMaterial color={destinations.includes(index) ? '#77a86c' : game.kind === 'sport' ? index % 2 ? '#386c4a' : '#315f41' : index % 2 ? '#bb9869' : '#d2b27f'} roughness={0.42} metalness={0.08} emissive={destinations.includes(index) ? '#34502b' : '#000000'} emissiveIntensity={0.45} /></mesh>)}
    {game.kind === 'sow' && state.sow.map((count, index) => { const point = points[index]; return Array.from({ length: Math.min(count, 6) }, (_, seed) => <mesh key={`seed-${index}-${seed}`} position={[point[0] + ((seed % 3) - 1) * 0.13, 0.39 + Math.floor(seed / 3) * 0.09, point[2] + (Math.floor(seed / 3) - 0.5) * 0.12]} castShadow><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#e4c47f" roughness={0.28} metalness={0.2} /></mesh>); })}
    {(game.kind === 'race' || game.kind === 'mehen') && [0, 1].map((owner) => Array.from({ length: 4 }, (_, localIndex) => { const piece = state.pieces.find((item) => item.owner === owner && item.id === owner * 4 + localIndex); if (!piece || piece.pos < 0 || piece.pos >= game.size) return null; const point = trackPoint(piece.pos); return <Token key={piece.id} position={[point[0] + (owner === 0 ? -0.1 : 0.1), 0.43 + localIndex * 0.04, point[2]]} owner={owner as Owner} selected={state.selected === piece.id} onClick={() => onPiece(piece.id)} />; }))}
    {game.kind !== 'race' && game.kind !== 'mehen' && state.pieces.map((piece) => { if (piece.pos < 0) return null; const point = game.kind === 'sport' ? [piece.pos - offset, 0.42, 0] as const : gridPoint(piece.pos); return <Token key={piece.id} position={[point[0], point[1] + 0.2, point[2]]} owner={piece.owner} selected={state.selected === piece.pos} kind={piece.kind} onClick={() => onPiece(piece.id)} />; })}
    {(game.kind === 'race' || game.kind === 'mehen') && state.pieces.filter((piece) => piece.pos < 0 || piece.pos >= game.size).map((piece, index) => <Token key={piece.id} position={[-2.8 + (index % 8) * 0.8, 0.38, 3.8 + Math.floor(index / 8) * 0.55]} owner={piece.owner} selected={state.selected === piece.id} onClick={() => onPiece(piece.id)} />)}
  </>;
}

function Token({ position: target, owner, selected, kind = 'man', onClick }: { position: [number, number, number]; owner: Owner; selected: boolean; kind?: PieceKind; onClick: () => void }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => { if (!mesh.current) return; mesh.current.position.x += (target[0] - mesh.current.position.x) * Math.min(1, delta * 7); mesh.current.position.y += (target[1] + (selected ? 0.1 : 0) - mesh.current.position.y) * Math.min(1, delta * 8); mesh.current.position.z += (target[2] - mesh.current.position.z) * Math.min(1, delta * 7); mesh.current.rotation.y += delta * (selected ? 1.4 : 0.22); });
  const color = owner === 0 ? '#c36f3c' : '#d8d2c3';
  return <mesh ref={mesh} position={target} onClick={(event) => { event.stopPropagation(); onClick(); }} castShadow>{kind === 'king' ? <cylinderGeometry args={[0.22, 0.28, 0.58, 8]} /> : kind === 'knight' ? <dodecahedronGeometry args={[0.3, 0]} /> : kind === 'bishop' ? <coneGeometry args={[0.26, 0.62, 8]} /> : kind === 'rook' ? <cylinderGeometry args={[0.22, 0.3, 0.48, 6]} /> : <sphereGeometry args={[0.25, 24, 24]} />}<meshStandardMaterial color={color} roughness={0.27} metalness={0.38} emissive={selected ? '#8a5719' : '#000000'} emissiveIntensity={selected ? 0.8 : 0} /></mesh>;
}