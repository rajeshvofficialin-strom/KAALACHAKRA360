import { useState, useCallback, useEffect, useRef } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Atya-Patya: grid court, attacker crosses while defenders tag
// Simplified to a 3-lane grid where you dodge defenders

interface Attacker {
  x: number;
  y: number;
  stamina: number;
  alive: boolean;
  crossed: boolean;
}

interface Defender {
  x: number;
  y: number;
  lane: number;
}

const COURT_W = 100;
const COURT_H = 100;
const LANES = 3;
const MATCH_TIME = 60;

export default function AtyaPatyaGame() {
  const [attackers, setAttackers] = useState<Attacker[]>([
    { x: 5, y: 50, stamina: 100, alive: true, crossed: false },
  ]);
  const [defenders, setDefenders] = useState<Defender[]>([
    { x: 50, y: 20, lane: 0 },
    { x: 50, y: 50, lane: 1 },
    { x: 50, y: 80, lane: 2 },
  ]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(MATCH_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Cross the court! Use arrow keys or tap to dodge.');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'play' | 'practice' | 'learn'>('play');
  const [running, setRunning] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const moveRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const keysRef = useRef<Set<string>>(new Set());

  const speedMul = difficulty === 'easy' ? 0.6 : difficulty === 'medium' ? 0.9 : 1.2;

  // Keyboard input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase();
      keysRef.current[down ? 'add' : 'delete'](key);
      const dx = (keysRef.current.has('arrowright') || keysRef.current.has('d') ? 1 : 0) - (keysRef.current.has('arrowleft') || keysRef.current.has('a') ? 1 : 0);
      const dy = (keysRef.current.has('arrowdown') || keysRef.current.has('s') ? 1 : 0) - (keysRef.current.has('arrowup') || keysRef.current.has('w') ? 1 : 0);
      moveRef.current = { dx, dy };
    };
    const kd = (e: KeyboardEvent) => handleKey(e, true);
    const ku = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  // Game loop
  useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => {
      // Move attacker
      setAttackers((prev) => prev.map((a) => {
        if (!a.alive || a.crossed) return a;
        const nx = Math.max(2, Math.min(98, a.x + moveRef.current.dx * 1.5));
        const ny = Math.max(5, Math.min(95, a.y + moveRef.current.dy * 1.5));
        const newStamina = Math.max(0, a.stamina - (moveRef.current.dx || moveRef.current.dy ? 0.3 : 0));
        const regenStamina = moveRef.current.dx === 0 && moveRef.current.dy === 0 ? Math.min(100, a.stamina + 0.5) : newStamina;
        let crossed = a.crossed;
        if (nx >= 95) { crossed = true; setScore((s) => s + 10); }
        return { ...a, x: nx, y: ny, stamina: regenStamina, crossed };
      }));

      // Move defenders toward nearest alive attacker
      setDefenders((prev) => prev.map((d) => {
        let target: Attacker | null = null;
        let minDist = Infinity;
        attackers.forEach((a) => {
          if (!a.alive || a.crossed) return;
          const dist = Math.hypot(a.x - d.x, a.y - d.y);
          if (dist < minDist) { minDist = dist; target = a; }
        });
        if (!target) return d;
        const dx = target.x - d.x;
        const dy = target.y - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.1) return d;
        const speed = 0.8 * speedMul;
        return { ...d, x: d.x + (dx / dist) * speed, y: d.y + (dy / dist) * speed };
      }));

      // Check collisions
      setAttackers((prev) => prev.map((a) => {
        if (!a.alive || a.crossed) return a;
        for (const d of defenders) {
          if (Math.hypot(a.x - d.x, a.y - d.y) < 5) {
            return { ...a, alive: false };
          }
        }
        return a;
      }));

      // Check if all crossed or dead
      const allDone = attackers.every((a) => a.crossed || !a.alive);
      if (allDone) {
        setRunning(false);
        setGameOver(true);
        setMessage(score > 0 ? `Match over! Score: ${score}` : 'All attackers caught!');
      }
    }, 50);
    return () => clearInterval(interval);
  }, [running, gameOver, attackers, defenders, score, speedMul]);

  // Timer
  useEffect(() => {
    if (!running || gameOver) return;
    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setRunning(false);
          setGameOver(true);
          setMessage(`Time up! Score: ${score}`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, gameOver, score]);

  // Spawn new attacker when one finishes
  useEffect(() => {
    if (!running || gameOver) return;
    const allDone = attackers.every((a) => a.crossed || !a.alive);
    if (allDone && !gameOver) {
      setAttackers([{ x: 5, y: 50, stamina: 100, alive: true, crossed: false }]);
    }
  }, [attackers, running, gameOver]);

  const start = () => {
    setAttackers([{ x: 5, y: 50, stamina: 100, alive: true, crossed: false }]);
    setDefenders([
      { x: 50, y: 20, lane: 0 },
      { x: 50, y: 50, lane: 1 },
      { x: 50, y: 80, lane: 2 },
    ]);
    setScore(0);
    setTime(MATCH_TIME);
    setGameOver(false);
    setRunning(true);
    setMessage('Cross the court! Use arrow keys or WASD to dodge defenders.');
  };

  const reset = () => {
    setRunning(false);
    setGameOver(false);
    setScore(0);
    setTime(MATCH_TIME);
    setAttackers([{ x: 5, y: 50, stamina: 100, alive: true, crossed: false }]);
    setDefenders([{ x: 50, y: 20, lane: 0 }, { x: 50, y: 50, lane: 1 }, { x: 50, y: 80, lane: 2 }]);
    setMessage('Press Start to begin');
    setBestScore((prev) => Math.max(prev, score));
  };

  // Touch/click movement
  const handleCourtClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!running) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tx = ((e.clientX - rect.left) / rect.width) * 100;
    const ty = ((e.clientY - rect.top) / rect.height) * 100;
    setAttackers((prev) => prev.map((a) => {
      if (!a.alive || a.crossed) return a;
      const dx = tx - a.x;
      const dy = ty - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.1) return a;
      const speed = 2;
      return { ...a, x: Math.max(2, Math.min(98, a.x + (dx / dist) * speed)), y: Math.max(5, Math.min(95, a.y + (dy / dist) * speed)) };
    }));
  }, [running]);

  if (mode === 'learn') {
    return (
      <GameShell title="Atya-Patya" difficulty={difficulty} onDifficultyChange={setDifficulty} mode={mode} onModeChange={setMode} showModeToggle onReset={reset}>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/20 space-y-3">
          <h4 className="font-display text-lg text-amber-200">Cultural Background</h4>
          <p className="font-body text-sm text-amber-100/70 leading-relaxed">
            Atya-Patya is a traditional team chase game from Maharashtra and Tamil Nadu. It is played on a rectangular grid court with intersecting lines. The game tests speed, agility, and tactical thinking. It has been played in Indian villages for centuries and is considered an important part of rural sporting culture.
          </p>
          <h4 className="font-display text-sm text-amber-300 mt-3">How to Play (Digital Version)</h4>
          <ul className="space-y-1.5 text-sm text-amber-100/60 font-body">
            <li>• Use arrow keys, WASD, or click/tap to move your attacker</li>
            <li>• Cross from the left side to the right side of the court</li>
            <li>• Avoid the AI defenders who chase you</li>
            <li>• Each crossing earns 10 points</li>
            <li>• Your stamina drains while moving and regenerates when still</li>
            <li>• Score as many crossings as possible before time runs out</li>
          </ul>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Atya-Patya"
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      score={score}
      bestScore={bestScore}
      message={message}
      gameOver={gameOver}
      onReset={reset}
      mode={mode}
      onModeChange={setMode}
      showModeToggle
    >
      {/* Timer and stamina */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-amber-200">Time:</span>
          <span className={`font-display text-lg font-bold ${time <= 10 ? 'text-red-400' : 'text-amber-300'}`}>{time}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-xs text-amber-300/60">Stamina:</span>
          <div className="w-24 h-2 rounded-full bg-stone-800/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-amber-400 transition-all" style={{ width: `${attackers[0]?.stamina ?? 0}%` }} />
          </div>
        </div>
      </div>

      {/* Court */}
      <div
        className="kabaddi-court rounded-2xl relative overflow-hidden cursor-pointer mx-auto"
        style={{ maxWidth: '400px', aspectRatio: '1.5' }}
        onClick={handleCourtClick}
      >
        {/* Grid lines */}
        <svg viewBox="0 0 100 66" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="22" x2="100" y2="22" stroke="#D4A017" strokeWidth="0.3" opacity="0.3" />
          <line x1="0" y1="44" x2="100" y2="44" stroke="#D4A017" strokeWidth="0.3" opacity="0.3" />
          <line x1="33" y1="0" x2="33" y2="66" stroke="#D4A017" strokeWidth="0.3" opacity="0.3" />
          <line x1="66" y1="0" x2="66" y2="66" stroke="#D4A017" strokeWidth="0.3" opacity="0.3" />
          <line x1="0" y1="0" x2="100" y2="0" stroke="#D4A017" strokeWidth="0.5" />
          <line x1="0" y1="66" x2="100" y2="66" stroke="#D4A017" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="0" y2="66" stroke="#D4A017" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="66" stroke="#D4A017" strokeWidth="0.5" />
        </svg>

        {/* Attackers */}
        {attackers.map((a, i) => a.alive && !a.crossed && (
          <div key={i} className="absolute w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-200 shadow-lg" style={{ left: `${a.x * 1.5}%`, top: `${a.y * 0.66}%`, transform: 'translate(-50%, -50%)' }} />
        ))}

        {/* Defenders */}
        {defenders.map((d, i) => (
          <div key={i} className="absolute w-4 h-4 rounded-full bg-red-500 border-2 border-red-300 shadow-lg" style={{ left: `${d.x * 1.5}%`, top: `${d.y * 0.66}%`, transform: 'translate(-50%, -50%)' }} />
        ))}

        {/* Start/Finish labels */}
        <span className="absolute top-1 left-1 font-display text-[10px] text-amber-400/40">START</span>
        <span className="absolute top-1 right-1 font-display text-[10px] text-green-400/40">FINISH</span>
      </div>

      {!running && !gameOver && (
        <button onClick={start} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">
          Start Match
        </button>
      )}
      {gameOver && (
        <button onClick={start} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">
          Play Again
        </button>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Use arrow keys, WASD, or click the court to move. Cross from left to right. Avoid red defenders.
      </p>
    </GameShell>
  );
}
