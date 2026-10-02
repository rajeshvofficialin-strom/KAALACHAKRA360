import { useState, useCallback, useEffect, useRef } from 'react';
import GameShell from './GameShell';
import type { Difficulty } from './useGameState';

// Gutte / Gutti — Five Stones juggling game
// Toss a stone, pick up others, catch the tossed stone. Increasing stages.

const STAGES = [
  { name: 'Stage 1', pickUp: 1, description: 'Toss 1 stone, pick up 1, catch' },
  { name: 'Stage 2', pickUp: 2, description: 'Toss 1 stone, pick up 2, catch' },
  { name: 'Stage 3', pickUp: 3, description: 'Toss 1 stone, pick up 3, catch' },
  { name: 'Stage 4', pickUp: 4, description: 'Toss 1 stone, pick up 4, catch' },
];

type Phase = 'ready' | 'tossing' | 'falling' | 'picking' | 'caught' | 'failed' | 'complete';

export default function GutteGuttiGame() {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [tossedStone, setTossedStone] = useState<{ y: number; vy: number } | null>(null);
  const [groundStones, setGroundStones] = useState<number>(5);
  const [pickedStones, setPickedStones] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState('Click to toss the golden stone into the air!');
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'play' | 'practice' | 'learn'>('play');
  const [timeWindow, setTimeWindow] = useState(0);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const phaseRef = useRef<Phase>('ready');
  const tossRef = useRef<{ y: number; vy: number } | null>(null);
  const catchWindowRef = useRef<number>(0);

  const tossHeight = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2.2 : 1.8;
  const catchThreshold = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.2 : 0.12;

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { tossRef.current = tossedStone; }, [tossedStone]);

  const startStage = useCallback(() => {
    setGroundStones(5);
    setPickedStones(0);
    setPhase('ready');
    setMessage(`${STAGES[stage].name}: ${STAGES[stage].description}. Click to toss!`);
  }, [stage]);

  const toss = useCallback(() => {
    if (phaseRef.current !== 'ready') return;
    setPhase('tossing');
    setMessage('Stone tossed! Pick up stones, then catch!');
    setTossedStone({ y: 0, vy: tossHeight });
    setPhase('falling');
    setTimeWindow(0);
  }, [tossHeight]);

  // Physics loop
  useEffect(() => {
    if (phase !== 'falling' && phase !== 'picking') return;
    const interval = setInterval(() => {
      setTossedStone((prev) => {
        if (!prev) return null;
        const newVy = prev.vy - 0.08;
        const newY = prev.y + newVy;
        setTimeWindow((t) => t + 0.05);
        if (newY <= 0) {
          // Stone landed — check if caught
          if (phaseRef.current === 'picking' || phaseRef.current === 'falling') {
            // Failed to catch
            setPhase('failed');
            setCombo(0);
            setMessage('Missed the catch! Stage failed. Click to retry.');
            return null;
          }
          return null;
        }
        return { y: newY, vy: newVy };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  // Catch check
  useEffect(() => {
    if (phase !== 'falling' && phase !== 'picking') return;
    if (!tossedStone) return;
    // If stone is low enough and in catch zone
    if (tossedStone.y < 0.5 && tossedStone.vy < 0) {
      catchWindowRef.current = timeWindow;
    }
  }, [tossedStone, phase, timeWindow]);

  const handlePickup = () => {
    if (phase !== 'falling') return;
    if (groundStones <= 0) return;
    setGroundStones((g) => g - 1);
    setPickedStones((p) => p + 1);
    setPhase('picking');
    const needed = STAGES[stage].pickUp;
    if (pickedStones + 1 >= needed) {
      // Ready to catch
      setMessage('Quick! Click to catch the falling stone!');
    } else {
      setMessage(`Pick up ${needed - (pickedStones + 1)} more!`);
    }
  };

  const handleCatch = () => {
    if (phase !== 'picking' && phase !== 'falling') return;
    if (!tossedStone) return;
    // Check if stone is in catch zone (low enough)
    if (tossedStone.y < 1.0) {
      const needed = STAGES[stage].pickUp;
      if (pickedStones >= needed) {
        // Success!
        const points = 20 * (stage + 1) + combo * 10;
        setScore((s) => s + points);
        setCombo((c) => c + 1);
        setPhase('caught');
        setMessage(`Caught! +${points} points! Combo: ${combo + 1}x`);
        setTossedStone(null);
        if (stage + 1 >= STAGES.length) {
          setPhase('complete');
          setGameOver(true);
          setBestScore((prev) => Math.max(prev, score + points));
          setMessage(`All stages complete! Final score: ${score + points}`);
        } else {
          setTimeout(() => {
            setStage((s) => s + 1);
          }, 1500);
        }
      } else {
        setMessage(`Need to pick up ${needed - pickedStones} more first!`);
      }
    } else {
      setMessage('Too high to catch! Wait for it to come down.');
    }
  };

  const handleMainClick = () => {
    if (gameOver) return;
    if (phase === 'ready') {
      toss();
    } else if (phase === 'failed') {
      startStage();
    } else if (phase === 'falling') {
      handlePickup();
    } else if (phase === 'picking') {
      if (groundStones > 0 && pickedStones < STAGES[stage].pickUp) {
        handlePickup();
      } else {
        handleCatch();
      }
    }
  };

  // Update stage
  useEffect(() => {
    if (phase === 'caught' && stage < STAGES.length) {
      const timeout = setTimeout(() => {
        startStage();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase, stage, startStage]);

  const reset = () => {
    setStage(0);
    setPhase('ready');
    setTossedStone(null);
    setGroundStones(5);
    setPickedStones(0);
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setMessage('Click to toss the golden stone into the air!');
    setBestScore((prev) => Math.max(prev, score));
  };

  if (mode === 'learn') {
    return (
      <GameShell title="Gutte / Gutti" difficulty={difficulty} onDifficultyChange={setDifficulty} mode={mode} onModeChange={setMode} showModeToggle onReset={reset}>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/20 space-y-3">
          <h4 className="font-display text-lg text-amber-200">Cultural Background</h4>
          <p className="font-body text-sm text-amber-100/70 leading-relaxed">
            Gutte (also called Gutti or Anchankal or Five Stones) is a traditional Indian skill game played with five small stones. Players toss one stone into the air, pick up others from the ground, and catch the tossed stone before it falls. Each stage increases in difficulty. The game develops hand-eye coordination, timing, and dexterity. It has been played by children across India for generations.
          </p>
          <h4 className="font-display text-sm text-amber-300 mt-3">How to Play (Digital Version)</h4>
          <ul className="space-y-1.5 text-sm text-amber-100/60 font-body">
            <li>• Click to toss the golden stone into the air</li>
            <li>• While it's airborne, click to pick up ground stones</li>
            <li>• Each stage requires picking up more stones: 1, 2, 3, 4</li>
            <li>• After picking up enough, click to catch the falling stone</li>
            <li>• Catch it before it lands — timing is critical!</li>
            <li>• Build combos for bonus points. Complete all 4 stages!</li>
          </ul>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Gutte / Gutti" difficulty={difficulty} onDifficultyChange={setDifficulty} score={score} bestScore={bestScore} message={message} gameOver={gameOver} onReset={reset} mode={mode} onModeChange={setMode} showModeToggle>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm text-amber-200">Stage: {Math.min(stage + 1, 4)}/4</span>
        <span className="font-display text-sm text-green-400">Combo: {combo}x</span>
      </div>

      {/* Game area */}
      <div
        className="relative w-full rounded-xl overflow-hidden border-2 border-amber-700/30 bg-gradient-to-b from-amber-950/20 to-stone-900/40 cursor-pointer mx-auto select-none"
        style={{ maxWidth: '350px', height: '280px' }}
        onClick={handleMainClick}
      >
        {/* Tossed stone */}
        {tossedStone && (
          <div
            className="absolute left-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-amber-200 shadow-lg transition-none"
            style={{ top: `${60 - tossedStone.y * 30}%`, transform: 'translateX(-50%)' }}
          />
        )}

        {/* Ground stones */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 flex-wrap px-4">
          {Array.from({ length: groundStones }).map((_, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 border border-stone-300 shadow" />
          ))}
          {groundStones === 0 && <span className="font-display text-xs text-amber-400/40">All stones picked up!</span>}
        </div>

        {/* Picked stones counter */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="font-display text-xs text-amber-300/60">Picked:</span>
          <span className="font-display text-sm font-bold text-amber-300">{pickedStones}</span>
          <span className="font-display text-xs text-amber-400/40">/ {STAGES[stage].pickUp}</span>
        </div>

        {/* Action hint */}
        {phase === 'falling' && (
          <div className="absolute top-3 left-3 font-display text-xs text-amber-400/60 animate-pulse">
            {groundStones > 0 && pickedStones < STAGES[stage].pickUp ? '← Click to pick up!' : '← Click to catch!'}
          </div>
        )}
      </div>

      {gameOver && (
        <button onClick={reset} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-3">Play Again</button>
      )}
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Click to toss, pick up stones while airborne, then click to catch. Complete all 4 stages!
      </p>
    </GameShell>
  );
}
