import { useState, useCallback, useEffect, useRef } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Maram Pitti — dodgeball-style game
// You control a player, dodge incoming balls, throw back to score

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

const MATCH_TIME = 45;

export default function MaramPittiGame() {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 75 });
  const [balls, setBalls] = useState<Ball[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(MATCH_TIME);
  const [stamina, setStamina] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Dodge the balls! Use arrow keys or WASD. Click to throw back.');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'play' | 'practice' | 'learn'>('play');
  const [running, setRunning] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [canThrow, setCanThrow] = useState(true);
  const keysRef = useRef<Set<string>>(new Set());
  const ballIdRef = useRef(0);
  const throwCooldownRef = useRef(0);

  const ballSpeed = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1.2 : 1.6;
  const spawnRate = difficulty === 'easy' ? 2500 : difficulty === 'medium' ? 1800 : 1200;

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      keysRef.current[down ? 'add' : 'delete'](e.key.toLowerCase());
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
      // Move player
      setPlayerPos((prev) => {
        const dx = (keysRef.current.has('arrowright') || keysRef.current.has('d') ? 1 : 0) - (keysRef.current.has('arrowleft') || keysRef.current.has('a') ? 1 : 0);
        const dy = (keysRef.current.has('arrowdown') || keysRef.current.has('s') ? 1 : 0) - (keysRef.current.has('arrowup') || keysRef.current.has('w') ? 1 : 0);
        const moving = dx || dy;
        setStamina((s) => {
          if (moving) return Math.max(0, s - 0.3);
          return Math.min(100, s + 0.4);
        });
        return { x: Math.max(5, Math.min(95, prev.x + dx * 1.5)), y: Math.max(10, Math.min(90, prev.y + dy * 1.5)) };
      });

      // Move balls
      setBalls((prev) => prev.map((b) => {
        if (!b.active) return b;
        const nx = b.x + b.vx;
        const ny = b.y + b.vy;
        // Bounce off walls
        let nvx = b.vx, nvy = b.vy;
        if (nx < 0 || nx > 100) nvx = -nvx;
        if (ny < 0 || ny > 100) nvy = -nvy;
        return { ...b, x: Math.max(0, Math.min(100, nx)), y: Math.max(0, Math.min(100, ny)), vx: nvx, vy: nvy };
      }));

      // Check hit
      balls.forEach((b) => {
        if (!b.active) return;
        if (Math.hypot(b.x - playerPos.x, b.y - playerPos.y) < 4) {
          setRunning(false);
          setGameOver(true);
          setMessage(`Hit! Final score: ${score}`);
          setBestScore((prev) => Math.max(prev, score));
        }
      });

      // Cooldown
      if (throwCooldownRef.current > 0) {
        throwCooldownRef.current -= 0.05;
        if (throwCooldownRef.current <= 0) setCanThrow(true);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [running, gameOver, balls, playerPos, score]);

  // Spawn balls
  useEffect(() => {
    if (!running || gameOver) return;
    const spawner = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      setBalls((prev) => [...prev, {
        id: ballIdRef.current++,
        x: 50 + Math.cos(angle) * 40,
        y: 10,
        vx: (playerPos.x - 50) * 0.02 * ballSpeed,
        vy: ballSpeed,
        active: true,
      }].slice(-8)); // max 8 balls
    }, spawnRate);
    return () => clearInterval(spawner);
  }, [running, gameOver, spawnRate, ballSpeed, playerPos.x]);

  // Timer
  useEffect(() => {
    if (!running || gameOver) return;
    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setRunning(false);
          setGameOver(true);
          setMessage(`Time up! Score: ${score}`);
          setBestScore((prev) => Math.max(prev, score));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, gameOver, score]);

  // Throw ball
  const handleThrow = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!running || gameOver || !canThrow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tx = ((e.clientX - rect.left) / rect.width) * 100;
    const ty = ((e.clientY - rect.top) / rect.height) * 100;
    const dx = tx - playerPos.x;
    const dy = ty - playerPos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.1) return;
    const speed = 3;
    setBalls((prev) => [...prev, {
      id: ballIdRef.current++,
      x: playerPos.x,
      y: playerPos.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      active: true,
    }].slice(-12));
    setCanThrow(false);
    throwCooldownRef.current = 0.5;

    // Check if thrown ball hits an enemy ball
    setTimeout(() => {
      setBalls((prev) => {
        let hit = false;
        const newBalls = prev.map((b) => {
          if (!b.active) return b;
          const thrown = prev.find((tb) => tb.id !== b.id && Math.hypot(tb.x - b.x, tb.y - b.y) < 5);
          if (thrown && !hit) {
            hit = true;
            return { ...b, active: false };
          }
          return b;
        });
        if (hit) {
          setScore((s) => s + 15);
          setMessage('Hit! +15 points');
        }
        return newBalls.filter((b) => b.active);
      });
    }, 100);
  }, [running, gameOver, canThrow, playerPos]);

  const start = () => {
    setScore(0);
    setTime(MATCH_TIME);
    setStamina(100);
    setGameOver(false);
    setRunning(true);
    setBalls([]);
    setPlayerPos({ x: 50, y: 75 });
    setMessage('Dodge the balls! Click to throw back at them.');
  };

  const reset = () => {
    setRunning(false);
    setGameOver(false);
    setScore(0);
    setTime(MATCH_TIME);
    setStamina(100);
    setBalls([]);
    setBestScore((prev) => Math.max(prev, score));
    setMessage('Press Start to begin');
  };

  if (mode === 'learn') {
    return (
      <GameShell title="Maram Pitti" difficulty={difficulty} onDifficultyChange={setDifficulty} mode={mode} onModeChange={setMode} showModeToggle onReset={reset}>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/20 space-y-3">
          <h4 className="font-display text-lg text-amber-200">Cultural Background</h4>
          <p className="font-body text-sm text-amber-100/70 leading-relaxed">
            Maram Pitti is a fun outdoor team game from Kerala and South India. It combines elements of dodgeball and tag. Players throw a soft ball to tag opponents below the waist. It is popular in schoolyards and villages, especially during festivals and holidays. The game promotes agility, teamwork, and fair play.
          </p>
          <h4 className="font-display text-sm text-amber-300 mt-3">How to Play (Digital Version)</h4>
          <ul className="space-y-1.5 text-sm text-amber-100/60 font-body">
            <li>• Use arrow keys or WASD to move your player</li>
            <li>• Dodge the incoming balls — if one hits you, game over</li>
            <li>• Click on the court to throw a ball toward that point</li>
            <li>• If your ball hits an enemy ball, you score 15 points</li>
            <li>• Survive as long as possible to maximize your score</li>
            <li>• Stamina drains while moving and regenerates when still</li>
          </ul>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Maram Pitti" difficulty={difficulty} onDifficultyChange={setDifficulty} score={score} bestScore={bestScore} message={message} gameOver={gameOver} onReset={reset} mode={mode} onModeChange={setMode} showModeToggle>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-amber-200">Time:</span>
          <span className={`font-display text-lg font-bold ${time <= 10 ? 'text-red-400' : 'text-amber-300'}`}>{time}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-xs text-amber-300/60">Stamina:</span>
          <div className="w-20 h-2 rounded-full bg-stone-800/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-amber-400 transition-all" style={{ width: `${stamina}%` }} />
          </div>
        </div>
      </div>

      <div className="kabaddi-court rounded-2xl relative overflow-hidden cursor-pointer mx-auto" style={{ maxWidth: '400px', aspectRatio: '1.3' }} onClick={handleThrow}>
        <svg viewBox="0 0 100 77" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Player */}
          <circle cx={playerPos.x} cy={playerPos.y * 0.77} r="3" fill="#F4C430" stroke="#FF9933" strokeWidth="0.4" />

          {/* Balls */}
          {balls.filter((b) => b.active).map((b) => (
            <circle key={b.id} cx={b.x} cy={b.y * 0.77} r="2.5" fill="#FF6B35" stroke="#FF9933" strokeWidth="0.3" />
          ))}

          {/* Throw indicator */}
          {!canThrow && (
            <text x="50" y="10" textAnchor="middle" fontSize="4" fill="#F4C430" opacity="0.5">...</text>
          )}
        </svg>
      </div>

      {!running && !gameOver && (
        <button onClick={start} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Start Match</button>
      )}
      {gameOver && (
        <button onClick={start} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Play Again</button>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Move with arrow keys/WASD. Click the court to throw balls at enemy balls. Dodge incoming balls!
      </p>
    </GameShell>
  );
}
