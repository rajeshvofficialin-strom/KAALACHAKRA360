import { useState, useCallback, useEffect, useRef } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Lagori / Seven Stones
// Phase 1: Aim and throw ball to knock down stone stack
// Phase 2: Rebuild the stack before the AI hits you with the ball

type Phase = 'aim' | 'throw' | 'rebuild' | 'dodge' | 'over';

const STONE_COUNT = 7;

export default function LagoriGame() {
  const [phase, setPhase] = useState<Phase>('aim');
  const [stones, setStones] = useState<boolean[]>(Array(STONE_COUNT).fill(true));
  const [aim, setAim] = useState({ x: 50, y: 80 });
  const [power, setPower] = useState(50);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [message, setMessage] = useState('Aim at the stone stack and throw!');
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'play' | 'practice' | 'learn'>('play');
  const [rebuildProgress, setRebuildProgress] = useState(0);
  const [dodgeTimer, setDodgeTimer] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 90 });
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [round, setRound] = useState(1);
  const aimRef = useRef<{ x: number; y: number }>({ x: 50, y: 80 });
  const keysRef = useRef<Set<string>>(new Set());

  const accuracyThreshold = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 15 : 8;
  const rebuildTime = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 6 : 4;

  // Keyboard for dodge phase
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

  // Dodge phase loop
  useEffect(() => {
    if (phase !== 'dodge') return;
    const interval = setInterval(() => {
      // Move player
      setPlayerPos((prev) => {
        const dx = (keysRef.current.has('arrowright') || keysRef.current.has('d') ? 1 : 0) - (keysRef.current.has('arrowleft') || keysRef.current.has('a') ? 1 : 0);
        const dy = (keysRef.current.has('arrowdown') || keysRef.current.has('s') ? 1 : 0) - (keysRef.current.has('arrowup') || keysRef.current.has('w') ? 1 : 0);
        return { x: Math.max(5, Math.min(95, prev.x + dx * 2)), y: Math.max(20, Math.min(80, prev.y + dy * 2)) };
      });
      // Move ball toward player
      setBallPos((prev) => {
        const dx = playerPos.x - prev.x;
        const dy = playerPos.y - prev.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.1) return prev;
        const speed = 1.5 * (difficulty === 'hard' ? 1.4 : difficulty === 'medium' ? 1.1 : 0.8);
        return { x: prev.x + (dx / dist) * speed, y: prev.y + (dy / dist) * speed };
      });
      // Check hit
      if (Math.hypot(playerPos.x - ballPos.x, playerPos.y - ballPos.y) < 5) {
        setPhase('over');
        setGameOver(true);
        setMessage(`Hit! You rebuilt ${rebuildProgress}/${STONE_COUNT} stones. Score: ${score}`);
        setBestScore((prev) => Math.max(prev, score));
      }
      setDodgeTimer((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [phase, playerPos, ballPos, difficulty, score, rebuildProgress]);

  // Win dodge phase after enough time
  useEffect(() => {
    if (phase === 'dodge' && dodgeTimer >= rebuildTime) {
      // Successfully rebuilt all stones
      setScore((s) => s + 50 + rebuildProgress * 10);
      setPhase('aim');
      setStones(Array(STONE_COUNT).fill(true));
      setRebuildProgress(0);
      setDodgeTimer(0);
      setRound((r) => r + 1);
      setMessage(`Round ${round + 1}: Stack rebuilt! Aim again.`);
    }
  }, [phase, dodgeTimer, rebuildTime, rebuildProgress, round]);

  const handleAimChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'aim') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAim({ x, y });
    aimRef.current = { x, y };
  };

  const handleThrow = () => {
    if (phase !== 'aim') return;
    setPhase('throw');
    setMessage('Ball thrown!');

    // Calculate hit based on accuracy
    const stackX = 50;
    const stackY = 25;
    const dist = Math.hypot(aim.x - stackX, aim.y - stackY);
    const powerBonus = power / 100;

    setTimeout(() => {
      if (dist < accuracyThreshold + powerBonus * 10) {
        // Hit!
        const knockedDown = Math.min(STONE_COUNT, Math.floor((1 - dist / (accuracyThreshold + 10)) * STONE_COUNT) + 1);
        const newStones = Array(STONE_COUNT).fill(false).map((_, i) => i >= knockedDown);
        setStones(newStones);
        setScore((s) => s + knockedDown * 5);
        setMessage(`Knocked down ${knockedDown} stones! Rebuild them now!`);
        setPhase('rebuild');
      } else {
        setMessage('Missed! Try again.');
        setPhase('aim');
      }
    }, 800);
  };

  // Rebuild phase — click stones to rebuild
  const handleStoneClick = (index: number) => {
    if (phase !== 'rebuild') return;
    if (stones[index]) return;
    const newStones = [...stones];
    newStones[index] = true;
    setStones(newStones);
    setRebuildProgress((p) => p + 1);
    setScore((s) => s + 5);

    if (newStones.every((s) => s)) {
      // All rebuilt — now dodge the ball!
      setMessage('Stack rebuilt! Dodge the incoming ball!');
      setPhase('dodge');
      setBallPos({ x: 50, y: 90 });
      setPlayerPos({ x: 50, y: 50 });
      setDodgeTimer(0);
    }
  };

  const reset = () => {
    setPhase('aim');
    setStones(Array(STONE_COUNT).fill(true));
    setScore(0);
    setRebuildProgress(0);
    setDodgeTimer(0);
    setGameOver(false);
    setRound(1);
    setMessage('Aim at the stone stack and throw!');
    setBestScore((prev) => Math.max(prev, score));
  };

  if (mode === 'learn') {
    return (
      <GameShell title="Lagori / Seven Stones" difficulty={difficulty} onDifficultyChange={setDifficulty} mode={mode} onModeChange={setMode} showModeToggle onReset={reset}>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/20 space-y-3">
          <h4 className="font-display text-lg text-amber-200">Cultural Background</h4>
          <p className="font-body text-sm text-amber-100/70 leading-relaxed">
            Lagori, also known as Seven Stones or Pitthu, is a traditional outdoor game from Karnataka and Maharashtra. Seven flat stones are stacked in decreasing size. One team throws a ball to knock them down, then tries to rebuild the stack while the other team retrieves the ball and tries to hit them. It is one of India's most beloved street games.
          </p>
          <h4 className="font-display text-sm text-amber-300 mt-3">How to Play (Digital Version)</h4>
          <ul className="space-y-1.5 text-sm text-amber-100/60 font-body">
            <li>• Click on the court to aim at the stone stack</li>
            <li>• Adjust the power slider, then press Throw</li>
            <li>• If you hit the stack, click each stone to rebuild it</li>
            <li>• After rebuilding, dodge the incoming ball using arrow keys</li>
            <li>• Survive the dodge to complete the round and earn bonus points</li>
            <li>• Each round adds to your score — aim for the highest!</li>
          </ul>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Lagori / Seven Stones" difficulty={difficulty} onDifficultyChange={setDifficulty} score={score} bestScore={bestScore} message={message} gameOver={gameOver} onReset={reset} mode={mode} onModeChange={setMode} showModeToggle>
      {/* Round indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm text-amber-200">Round: {round}</span>
        {phase === 'dodge' && (
          <div className="flex items-center gap-2">
            <span className="font-display text-xs text-amber-300/60">Survive:</span>
            <div className="w-24 h-2 rounded-full bg-stone-800/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all" style={{ width: `${(dodgeTimer / rebuildTime) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Court */}
      <div className="kabaddi-court rounded-2xl relative overflow-hidden mx-auto" style={{ maxWidth: '400px', aspectRatio: '1.2' }} onClick={handleAimChange}>
        <svg viewBox="0 0 100 83" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Stone stack */}
          {phase === 'aim' || phase === 'throw' ? (
            stones.map((standing, i) => (
              <rect
                key={i}
                x={50 - (20 - i * 2.5) / 2}
                y={25 - i * 4}
                width={20 - i * 2.5}
                height={3}
                fill={standing ? '#8B6914' : '#3D2817'}
                stroke="#D4A017"
                strokeWidth="0.3"
                rx="0.5"
              />
            ))
          ) : (
            // Scattered stones
            stones.map((standing, i) => (
              <rect
                key={i}
                x={standing ? 50 - (20 - i * 2.5) / 2 : 10 + i * 12}
                y={standing ? 25 - i * 4 : 50 + (i % 3) * 8}
                width={20 - i * 2.5}
                height={3}
                fill={standing ? '#8B6914' : '#5C3D1A'}
                stroke={standing ? '#D4A017' : '#8B6914'}
                strokeWidth="0.3"
                rx="0.5"
                className={phase === 'rebuild' && !standing ? 'cursor-pointer' : ''}
                onClick={() => handleStoneClick(i)}
              />
            ))
          )}

          {/* Aim indicator */}
          {phase === 'aim' && (
            <>
              <circle cx={aim.x} cy={aim.y * 0.83} r="3" fill="none" stroke="#F4C430" strokeWidth="0.5" className="pulse-glow" />
              <line x1={aim.x} y1={aim.y * 0.83} x2={50} y2={25} stroke="#F4C430" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.5" />
            </>
          )}

          {/* Ball during throw */}
          {phase === 'throw' && (
            <circle cx={50} cy={50} r="2.5" fill="#FF6B35" stroke="#FF9933" strokeWidth="0.3" />
          )}

          {/* Ball during dodge */}
          {phase === 'dodge' && (
            <circle cx={ballPos.x} cy={ballPos.y * 0.83} r="2.5" fill="#FF6B35" stroke="#FF9933" strokeWidth="0.3" />
          )}

          {/* Player during dodge */}
          {phase === 'dodge' && (
            <circle cx={playerPos.x} cy={playerPos.y * 0.83} r="3" fill="#F4C430" stroke="#FF9933" strokeWidth="0.3" />
          )}
        </svg>
      </div>

      {/* Power slider */}
      {phase === 'aim' && (
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-xs text-amber-300/60">Power:</span>
          <input type="range" min={0} max={100} value={power} onChange={(e) => setPower(Number(e.target.value))} className="flex-1 accent-amber-500" />
          <button onClick={handleThrow} className="btn-kaalachakra px-4 py-2 rounded-lg font-display text-xs">Throw</button>
        </div>
      )}

      {/* Rebuild instruction */}
      {phase === 'rebuild' && (
        <p className="font-body text-xs text-amber-100/60 text-center mt-3">
          Click the scattered stones ({rebuildProgress}/{STONE_COUNT} rebuilt) to rebuild the stack!
        </p>
      )}

      {/* Dodge instruction */}
      {phase === 'dodge' && (
        <p className="font-body text-xs text-amber-100/60 text-center mt-3">
          Use arrow keys or WASD to dodge the ball! Survive to complete the round.
        </p>
      )}

      {gameOver && (
        <button onClick={reset} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Play Again</button>
      )}
    </GameShell>
  );
}
