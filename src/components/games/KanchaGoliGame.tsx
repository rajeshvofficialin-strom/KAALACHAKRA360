import { useState, useCallback, useRef, useEffect } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Kancha / Goli — marble aiming game
// Drag to aim, release to shoot. Hit target marbles for points.

interface Marble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  isPlayer: boolean;
}

const ARENA_W = 100;
const ARENA_H = 100;

export default function KanchaGoliGame() {
  const [marbles, setMarbles] = useState<Marble[]>([]);
  const [aimStart, setAimStart] = useState<{ x: number; y: number } | null>(null);
  const [aimEnd, setAimEnd] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [throws, setThrows] = useState(5);
  const [message, setMessage] = useState('Drag from the golden marble to aim. Release to shoot!');
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'play' | 'practice' | 'learn'>('play');
  const [running, setRunning] = useState(false);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const targetCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  const initGame = useCallback(() => {
    const newMarbles: Marble[] = [];
    // Player marble
    newMarbles.push({ id: 0, x: 50, y: 85, vx: 0, vy: 0, active: true, isPlayer: true });
    // Target marbles in upper area
    for (let i = 0; i < targetCount; i++) {
      newMarbles.push({
        id: i + 1,
        x: 20 + Math.random() * 60,
        y: 15 + Math.random() * 40,
        vx: 0,
        vy: 0,
        active: true,
        isPlayer: false,
      });
    }
    setMarbles(newMarbles);
    setScore(0);
    setThrows(5);
    setGameOver(false);
    setRunning(true);
    setMessage('Drag from the golden marble to aim. Release to shoot!');
  }, [targetCount]);

  const physicsStep = useCallback(() => {
    setMarbles((prev) => {
      let scoredThisStep = false;
      const updated = prev.map((m) => {
        if (!m.active) return m;
        if (m.vx === 0 && m.vy === 0) return m;
        let nx = m.x + m.vx;
        let ny = m.y + m.vy;
        let nvx = m.vx * 0.97;
        let nvy = m.vy * 0.97;
        // Wall bounces
        if (nx < 3) { nx = 3; nvx = -nvx * 0.8; }
        if (nx > ARENA_W - 3) { nx = ARENA_W - 3; nvx = -nvx * 0.8; }
        if (ny < 3) { ny = 3; nvy = -nvy * 0.8; }
        if (ny > ARENA_H - 3) { ny = ARENA_H - 3; nvy = -nvy * 0.8; }
        // Stop if very slow
        if (Math.abs(nvx) < 0.05 && Math.abs(nvy) < 0.05) { nvx = 0; nvy = 0; }
        return { ...m, x: nx, y: ny, vx: nvx, vy: nvy };
      });

      // Collision detection
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const a = updated[i];
          const b = updated[j];
          if (!a.active || !b.active) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 6 && dist > 0.1) {
            // Simple elastic collision
            const nx = dx / dist;
            const ny = dy / dist;
            const p = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (p > 0) {
              updated[i] = { ...a, vx: a.vx - p * nx, vy: a.vy - p * ny };
              updated[j] = { ...b, vx: b.vx + p * nx, vy: b.vy + p * ny };
              // Push apart
              const overlap = 6 - dist;
              updated[i] = { ...updated[i], x: a.x - nx * overlap * 0.5, y: a.y - ny * overlap * 0.5 };
              updated[j] = { ...updated[j], x: b.x + nx * overlap * 0.5, y: b.y + ny * overlap * 0.5 };
              // Score if player marble hits a target
              if (a.isPlayer && !b.isPlayer && !scoredThisStep) {
                scoredThisStep = true;
              } else if (b.isPlayer && !a.isPlayer && !scoredThisStep) {
                scoredThisStep = true;
              }
            }
          }
        }
      }
      if (scoredThisStep) {
        setScore((s) => s + 10);
        setMessage('Hit! +10 points');
      }
      return updated;
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (!running) return;
    const hasMoving = marbles.some((m) => m.active && (m.vx !== 0 || m.vy !== 0));
    if (hasMoving) {
      animRef.current = requestAnimationFrame(() => {
        physicsStep();
      });
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [marbles, running, physicsStep]);

  // Check game over
  useEffect(() => {
    if (!running || gameOver) return;
    const hasMoving = marbles.some((m) => m.active && (m.vx !== 0 || m.vy !== 0));
    if (throws <= 0 && !hasMoving) {
      setRunning(false);
      setGameOver(true);
      setBestScore((prev) => Math.max(prev, score));
      setMessage(`Game over! Score: ${score}`);
    }
  }, [marbles, throws, running, gameOver, score]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!running || throws <= 0) return;
    const player = marbles.find((m) => m.isPlayer && m.active);
    if (!player) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * ARENA_W;
    const y = ((e.clientY - rect.top) / rect.height) * ARENA_H;
    // Only start drag near player marble
    if (Math.hypot(x - player.x, y - player.y) < 15) {
      setAimStart({ x: player.x, y: player.y });
      setAimEnd({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!aimStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAimEnd({ x: ((e.clientX - rect.left) / rect.width) * ARENA_W, y: ((e.clientY - rect.top) / rect.height) * ARENA_H });
  };

  const handleMouseUp = () => {
    if (!aimStart || !aimEnd) return;
    const dx = aimStart.x - aimEnd.x;
    const dy = aimStart.y - aimEnd.y;
    const power = Math.min(Math.hypot(dx, dy) * 0.15, 5);
    const angle = Math.atan2(dy, dx);
    setMarbles((prev) => prev.map((m) => m.isPlayer ? { ...m, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power } : m));
    setThrows((t) => t - 1);
    setAimStart(null);
    setAimEnd(null);
    setMessage('Marble launched!');
  };

  const reset = () => {
    setRunning(false);
    setGameOver(false);
    setScore(0);
    setBestScore((prev) => Math.max(prev, score));
    setMarbles([]);
    setAimStart(null);
    setAimEnd(null);
  };

  if (mode === 'learn') {
    return (
      <GameShell title="Kancha / Goli" difficulty={difficulty} onDifficultyChange={setDifficulty} mode={mode} onModeChange={setMode} showModeToggle onReset={reset}>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/20 space-y-3">
          <h4 className="font-display text-lg text-amber-200">Cultural Background</h4>
          <p className="font-body text-sm text-amber-100/70 leading-relaxed">
            Kancha (also called Goli or Goti) is the traditional Indian marble game, played by children across the country for centuries. Players use a "shooter" marble to knock target marbles out of a circle. The game tests aim, power control, and precision. Small clay and stone balls found at ancient sites may have been used in similar games, though archaeological interpretation is uncertain.
          </p>
          <h4 className="font-display text-sm text-amber-300 mt-3">How to Play (Digital Version)</h4>
          <ul className="space-y-1.5 text-sm text-amber-100/60 font-body">
            <li>• Drag from the golden marble to set aim direction and power</li>
            <li>• Release to launch the marble</li>
            <li>• Hit target marbles to score 10 points each</li>
            <li>• You have 5 throws per game</li>
            <li>• Marbles bounce off walls and each other with realistic physics</li>
            <li>• Difficulty changes the number of target marbles</li>
          </ul>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Kancha / Goli" difficulty={difficulty} onDifficultyChange={setDifficulty} score={score} bestScore={bestScore} message={message} gameOver={gameOver} onReset={reset} mode={mode} onModeChange={setMode} showModeToggle>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm text-amber-200">Throws: {throws}</span>
        <span className="font-display text-sm text-amber-300">Targets: {marbles.filter((m) => !m.isPlayer && m.active).length}</span>
      </div>
      <div
        className="relative w-full rounded-xl overflow-hidden border-2 border-amber-700/30 bg-gradient-to-b from-stone-900/60 to-amber-950/30 cursor-crosshair mx-auto"
        style={{ maxWidth: '400px', aspectRatio: '1' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Arena circle */}
        <div className="absolute inset-2 rounded-full border-2 border-amber-700/20" />
        {/* Marbles */}
        {marbles.filter((m) => m.active).map((m) => (
          <div
            key={m.id}
            className={`absolute rounded-full border-2 ${m.isPlayer ? 'w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-600 border-amber-200 shadow-lg' : 'w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-700 border-blue-200'}`}
            style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))}
        {/* Aim line */}
        {aimStart && aimEnd && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1={`${aimStart.x}%`} y1={`${aimStart.y}%`} x2={`${aimEnd.x}%`} y2={`${aimEnd.y}%`} stroke="#F4C430" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.6" />
            <circle cx={`${aimEnd.x}%`} cy={`${aimEnd.y}%`} r="1.5" fill="none" stroke="#F4C430" strokeWidth="0.3" opacity="0.5" />
          </svg>
        )}
      </div>
      {!running && !gameOver && (
        <button onClick={initGame} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Start Game</button>
      )}
      {gameOver && (
        <button onClick={initGame} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Play Again</button>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Drag from the golden marble to aim. The further you drag, the more power. Release to shoot!
      </p>
    </GameShell>
  );
}
