import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Play } from 'lucide-react';
import type { AncientToy } from '@/data/toyData';

interface ToyMiniGameProps {
  toy: AncientToy;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export default function ToyMiniGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  switch (toy.miniGameType) {
    case 'navigate':
      return <NavigateGame toy={toy} onComplete={onComplete} onClose={onClose} />;
    case 'rhythm':
      return <RhythmGame toy={toy} onComplete={onComplete} onClose={onClose} />;
    case 'timing':
      return <TimingGame toy={toy} onComplete={onComplete} onClose={onClose} />;
    case 'aim':
      return <AimGame toy={toy} onComplete={onComplete} onClose={onClose} />;
    case 'control':
      return <ControlGame toy={toy} onComplete={onComplete} onClose={onClose} />;
    default:
      return <NavigateGame toy={toy} onComplete={onComplete} onClose={onClose} />;
  }
}

// === NAVIGATE GAME (toy cart, wheeled animal, wheeled bird, toy boat) ===
function NavigateGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  const [playerX, setPlayerX] = useState(20);
  const [playerY, setPlayerY] = useState(50);
  const [obstacles, setObstacles] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [tokens, setTokens] = useState<{ x: number; y: number; collected: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Use arrow keys or WASD to move. Collect tokens and reach the finish!');
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Generate obstacles and tokens
    const obs: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 6; i++) {
      obs.push({ x: 30 + Math.random() * 50, y: 15 + Math.random() * 70, w: 8 + Math.random() * 10, h: 6 + Math.random() * 8 });
    }
    setObstacles(obs);
    const tok: { x: number; y: number; collected: boolean }[] = [];
    for (let i = 0; i < 5; i++) {
      tok.push({ x: 25 + Math.random() * 60, y: 15 + Math.random() * 70, collected: false });
    }
    setTokens(tok);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      keysRef.current[down ? 'add' : 'delete'](e.key.toLowerCase());
    };
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));
    return () => {
      window.removeEventListener('keydown', (e) => handleKey(e, true));
      window.removeEventListener('keyup', (e) => handleKey(e, false));
    };
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => {
      const dx = (keysRef.current.has('arrowright') || keysRef.current.has('d') ? 1 : 0) - (keysRef.current.has('arrowleft') || keysRef.current.has('a') ? 1 : 0);
      const dy = (keysRef.current.has('arrowdown') || keysRef.current.has('s') ? 1 : 0) - (keysRef.current.has('arrowup') || keysRef.current.has('w') ? 1 : 0);
      setPlayerPos((prev) => {
        const nx = Math.max(3, Math.min(97, prev.x + dx * 1.2));
        const ny = Math.max(5, Math.min(95, prev.y + dy * 1.2));
        // Check obstacles
        for (const o of obstacles) {
          if (nx > o.x - 3 && nx < o.x + o.w + 3 && ny > o.y - 3 && ny < o.y + o.h + 3) {
            return prev; // blocked
          }
        }
        return { x: nx, y: ny };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [running, gameOver, obstacles]);

  const [playerPos, setPlayerPos] = useState({ x: 20, y: 50 });

  useEffect(() => {
    if (!running || gameOver) return;
    // Check token collection
    setTokens((prev) => prev.map((t) => {
      if (!t.collected && Math.hypot(playerPos.x - t.x, playerPos.y - t.y) < 5) {
        setScore((s) => s + 20);
        return { ...t, collected: true };
      }
      return t;
    }));
    // Check finish
    if (playerPos.x >= 90) {
      setRunning(false);
      setGameOver(true);
      const finalScore = score + 50;
      setScore(finalScore);
      setMessage(`Journey complete! Score: ${finalScore}`);
      onComplete(finalScore);
    }
  }, [playerPos, running, gameOver, score]);

  useEffect(() => {
    if (!running || gameOver) return;
    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setRunning(false);
          setGameOver(true);
          setMessage(`Time up! Score: ${score}`);
          onComplete(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, gameOver, score]);

  const start = () => {
    setScore(0);
    setTime(30);
    setGameOver(false);
    setRunning(true);
    setPlayerPos({ x: 20, y: 50 });
    setTokens((prev) => prev.map((t) => ({ ...t, collected: false })));
    setMessage('Go! Collect tokens and reach the finish line!');
  };

  const isWater = toy.id === 'toy-boat';
  const isBird = toy.id === 'wheeled-bird';

  return (
    <GameContainer title={toy.miniGame} onClose={onClose} score={score} time={time} message={message} gameOver={gameOver} onStart={start}>
      <div className={`relative w-full rounded-xl overflow-hidden border-2 border-amber-700/30 ${isWater ? 'bg-gradient-to-b from-blue-950/40 to-blue-900/20' : 'bg-gradient-to-b from-amber-950/30 to-stone-900/20'}`} style={{ height: '300px' }}>
        {/* Obstacles */}
        {obstacles.map((o, i) => (
          <div key={i} className="absolute rounded-lg bg-stone-700/60 border border-stone-600/40" style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%` }} />
        ))}
        {/* Tokens */}
        {tokens.map((t, i) => !t.collected && (
          <div key={i} className="absolute w-4 h-4 rounded-full bg-amber-400 border border-amber-200 pulse-glow" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }} />
        ))}
        {/* Finish line */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-green-500/60 to-green-700/60" />
        <span className="absolute top-1 right-2 font-display text-[10px] text-green-400/60">FINISH</span>
        {/* Player */}
        {running && (
          <div
            className={`absolute w-5 h-5 rounded-full ${isWater ? 'bg-blue-400 border-blue-200' : isBird ? 'bg-teal-400 border-teal-200' : 'bg-amber-500 border-amber-300'} border-2 shadow-lg`}
            style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
        {/* Start label */}
        <span className="absolute top-1 left-2 font-display text-[10px] text-amber-400/60">START</span>
      </div>
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">
        Use arrow keys or WASD. Collect golden tokens (+20 each) and reach the finish line (+50 bonus).
      </p>
    </GameContainer>
  );
}

// === RHYTHM GAME (bird whistle, rattle) ===
function RhythmGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('Watch the pattern, then repeat it!');
  const [gameOver, setGameOver] = useState(false);
  const notes = 4;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = (freq: number) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = toy.id === 'bird-whistle' ? 'sine' : 'square';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore audio errors
    }
  };

  const noteFreqs = [440, 523, 659, 784];

  const generatePattern = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * notes));
  };

  const showPattern = (pat: number[]) => {
    setShowingPattern(true);
    pat.forEach((note, i) => {
      setTimeout(() => {
        setActiveNote(note);
        playNote(noteFreqs[note]);
        setTimeout(() => setActiveNote(null), 400);
        if (i === pat.length - 1) {
          setTimeout(() => {
            setShowingPattern(false);
            setMessage('Your turn — repeat the pattern!');
          }, 500);
        }
      }, i * 600);
    });
  };

  const startRound = () => {
    const len = 2 + round;
    const pat = generatePattern(len);
    setPattern(pat);
    setPlayerInput([]);
    setMessage('Watch carefully...');
    setTimeout(() => showPattern(pat), 500);
  };

  const handleNoteClick = (note: number) => {
    if (showingPattern || gameOver) return;
    playNote(noteFreqs[note]);
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 200);

    const newInput = [...playerInput, note];
    setPlayerInput(newInput);

    if (pattern[newInput.length - 1] !== note) {
      setCombo(0);
      setMessage('Wrong note! Try again.');
      setGameOver(true);
      onComplete(score);
      return;
    }

    if (newInput.length === pattern.length) {
      const points = 10 * pattern.length + combo * 5;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setRound((r) => r + 1);
      setPlayerInput([]);
      setMessage(`Correct! +${points} points. Next round...`);
      setTimeout(() => startRound(), 1000);
    }
  };

  const start = () => {
    setScore(0);
    setCombo(0);
    setRound(1);
    setGameOver(false);
    startRound();
  };

  return (
    <GameContainer title={toy.miniGame} onClose={onClose} score={score} message={message} gameOver={gameOver} onStart={start} extra={
      <div className="flex items-center gap-3">
        <span className="font-display text-sm text-amber-300">Round: {round}</span>
        <span className="font-display text-sm text-green-400">Combo: {combo}x</span>
      </div>
    }>
      <div className="flex items-center justify-center gap-3 py-8">
        {Array.from({ length: notes }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleNoteClick(i)}
            disabled={showingPattern || gameOver}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-150 ${
              activeNote === i
                ? 'scale-110 bg-amber-500 border-amber-300 glow-gold-strong'
                : 'bg-stone-800/60 border-amber-700/30 hover:bg-stone-700/60'
            } ${showingPattern ? 'cursor-default' : 'cursor-pointer'}`}
            style={{
              background: activeNote === i ? `linear-gradient(135deg, hsl(${i * 60 + 30}, 70%, 50%), hsl(${i * 60 + 50}, 60%, 40%))` : undefined,
            }}
          >
            <span className="font-display text-lg font-bold text-amber-100/70">{i + 1}</span>
          </button>
        ))}
      </div>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {pattern.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < playerInput.length ? 'bg-green-400' : 'bg-amber-900/40'}`} />
        ))}
      </div>
      <p className="font-body text-xs text-amber-100/40 text-center">
        {toy.id === 'bird-whistle' ? 'Listen to the bird call pattern, then tap the matching notes.' : 'Watch the rhythm pattern, then tap to match it.'}
      </p>
    </GameContainer>
  );
}

// === TIMING GAME (spinning top) ===
function TimingGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  const [winding, setWinding] = useState(false);
  const [windProgress, setWindProgress] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinTime, setSpinTime] = useState(0);
  const [score, setScore] = useState(0);
  const [bestSpin, setBestSpin] = useState(0);
  const [message, setMessage] = useState('Hold the button to wind the string, release to spin!');
  const [gameOver, setGameOver] = useState(false);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleWindStart = () => {
    if (spinning || gameOver) return;
    setWinding(true);
    const interval = setInterval(() => {
      setWindProgress((p) => Math.min(100, p + 2));
    }, 30);
    spinIntervalRef.current = interval;
  };

  const handleWindEnd = () => {
    if (!winding) return;
    setWinding(false);
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

    const power = windProgress;
    setSpinning(true);
    setMessage('Top is spinning! Keep it going...');
    let elapsed = 0;
    const spinDuration = (power / 100) * 8; // max 8 seconds
    const spinInterval = setInterval(() => {
      elapsed += 0.1;
      setSpinTime(elapsed);
      if (elapsed >= spinDuration) {
        clearInterval(spinInterval);
        setSpinning(false);
        const points = Math.floor(power * 2 + elapsed * 10);
        setScore((s) => s + points);
        setBestSpin((prev) => Math.max(prev, elapsed));
        setMessage(`Spin ended at ${elapsed.toFixed(1)}s! +${points} points`);
        setWindProgress(0);
        onComplete(score + points);
      }
    }, 100);
  };

  const reset = () => {
    setWinding(false);
    setWindProgress(0);
    setSpinning(false);
    setSpinTime(0);
    setScore(0);
    setBestSpin(0);
    setGameOver(false);
    setMessage('Hold the button to wind the string, release to spin!');
  };

  return (
    <GameContainer title={toy.miniGame} onClose={onClose} score={score} message={message} gameOver={gameOver} onStart={reset}>
      <div className="flex flex-col items-center py-6">
        {/* Top visualization */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-full border-4 ${spinning ? 'border-amber-400' : 'border-stone-600'} ${spinning ? 'kaalachakra-wheel-fast' : ''}`}
            style={{
              background: spinning ? 'conic-gradient(from 0deg, #D4A017, #FF9933, #D4A017, #8B4513, #D4A017)' : '#3D2817',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-8 h-8 rounded-full ${spinning ? 'bg-amber-300' : 'bg-stone-500'}`} />
            </div>
          </div>
        </div>

        {/* Wind progress bar */}
        {winding && (
          <div className="w-48 h-3 rounded-full bg-stone-800/40 overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${windProgress}%` }} />
          </div>
        )}

        {/* Wind button */}
        {!spinning && !gameOver && (
          <button
            onMouseDown={handleWindStart}
            onMouseUp={handleWindEnd}
            onTouchStart={(e) => { e.preventDefault(); handleWindStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleWindEnd(); }}
            className="btn-kaalachakra px-8 py-4 rounded-lg font-display text-sm select-none"
          >
            {winding ? `Winding... ${windProgress}%` : 'Hold to Wind String'}
          </button>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <div className="font-display text-xs text-amber-400/60 uppercase">Spin Time</div>
            <div className="font-display text-lg font-bold text-amber-300">{spinTime.toFixed(1)}s</div>
          </div>
          <div className="text-center">
            <div className="font-display text-xs text-amber-400/60 uppercase">Best Spin</div>
            <div className="font-display text-lg font-bold text-green-400">{bestSpin.toFixed(1)}s</div>
          </div>
        </div>
      </div>
      <p className="font-body text-xs text-amber-100/40 text-center">
        Hold to wind more power. Release to spin. More winding = longer spin = higher score!
      </p>
    </GameContainer>
  );
}

// === AIM GAME (ancient marbles) ===
function AimGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  const [aim, setAim] = useState({ x: 50, y: 90 });
  const [power, setPower] = useState(50);
  const [ballPos, setBallPos] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [targets, setTargets] = useState<{ x: number; y: number; r: number; points: number; hit: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [throws, setThrows] = useState(5);
  const [message, setMessage] = useState('Aim at the target circles. Adjust power and throw!');
  const [gameOver, setGameOver] = useState(false);
  const ballIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Generate targets
    const targs: { x: number; y: number; r: number; points: number; hit: boolean }[] = [
      { x: 50, y: 25, r: 8, points: 50, hit: false },
      { x: 30, y: 35, r: 6, points: 30, hit: false },
      { x: 70, y: 35, r: 6, points: 30, hit: false },
      { x: 50, y: 15, r: 4, points: 100, hit: false },
    ];
    setTargets(targs);
  }, []);

  const handleAim = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ballPos) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAim({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleThrow = () => {
    if (ballPos || gameOver || throws <= 0) return;
    const dx = (aim.x - 50) / 100;
    const dy = (aim.y - 90) / 100;
    const speed = (power / 100) * 4;
    setBallPos({ x: 50, y: 90, vx: dx * speed, vy: -Math.abs(dy * speed) || -speed });

    const interval = setInterval(() => {
      setBallPos((prev) => {
        if (!prev) return null;
        const nx = prev.x + prev.vx;
        const ny = prev.y + prev.vy;
        // Check target hits
        setTargets((prevT) => prevT.map((t) => {
          if (!t.hit && Math.hypot(nx - t.x, ny - t.y) < t.r + 2) {
            setScore((s) => s + t.points);
            setMessage(`Hit! +${t.points} points`);
            return { ...t, hit: true };
          }
          return t;
        }));
        if (ny <= 0 || nx <= 0 || nx >= 100 || ny >= 100) {
          clearInterval(interval);
          setThrows((th) => {
            const newThrows = th - 1;
            if (newThrows <= 0) {
              setGameOver(true);
              setMessage(`Game over! Score: ${score}`);
              onComplete(score);
            }
            return newThrows;
          });
          return null;
        }
        return { x: nx, y: ny, vx: prev.vx * 0.98, vy: prev.vy * 0.98 };
      });
    }, 30);
    ballIntervalRef.current = interval;
  };

  const reset = () => {
    setScore(0);
    setThrows(5);
    setGameOver(false);
    setBallPos(null);
    setMessage('Aim at the target circles. Adjust power and throw!');
    setTargets((prev) => prev.map((t) => ({ ...t, hit: false })));
  };

  return (
    <GameContainer title={toy.miniGame} onClose={onClose} score={score} message={message} gameOver={gameOver} onStart={reset} extra={
      <span className="font-display text-sm text-amber-300">Throws: {throws}</span>
    }>
      <div className="relative w-full rounded-xl overflow-hidden border-2 border-amber-700/30 bg-gradient-to-b from-stone-900/40 to-amber-950/20" style={{ height: '300px' }} onClick={handleAim}>
        {/* Targets */}
        {targets.map((t, i) => (
          <div key={i} className={`absolute rounded-full border-2 ${t.hit ? 'bg-green-500/30 border-green-400' : 'bg-amber-700/20 border-amber-500/50'}`} style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.r * 2}%`, height: `${t.r * 2}%`, transform: 'translate(-50%, -50%)' }}>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xs text-amber-300/60">{t.points}</span>
          </div>
        ))}
        {/* Aim indicator */}
        {!ballPos && !gameOver && (
          <>
            <div className="absolute w-3 h-3 rounded-full border-2 border-amber-400 pulse-glow" style={{ left: `${aim.x}%`, top: `${aim.y}%`, transform: 'translate(-50%, -50%)' }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <line x1="50%" y1="90%" x2={`${aim.x}%`} y2={`${aim.y}%`} stroke="#F4C430" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
            </svg>
          </>
        )}
        {/* Ball */}
        {ballPos && (
          <div className="absolute w-3 h-3 rounded-full bg-amber-500 border border-amber-300" style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }} />
        )}
        {/* Start position */}
        {!ballPos && <div className="absolute w-3 h-3 rounded-full bg-stone-600 border border-stone-400" style={{ left: '50%', top: '90%', transform: 'translate(-50%, -50%)' }} />}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="font-display text-xs text-amber-300/60">Power:</span>
        <input type="range" min={20} max={100} value={power} onChange={(e) => setPower(Number(e.target.value))} className="flex-1 accent-amber-500" />
        <button onClick={handleThrow} disabled={!!ballPos || gameOver || throws <= 0} className="btn-kaalachakra px-4 py-2 rounded-lg font-display text-xs disabled:opacity-50">Throw</button>
      </div>
      <p className="font-body text-xs text-amber-100/40 mt-2 text-center">Click the court to aim. Higher targets = more points. You have 5 throws.</p>
    </GameContainer>
  );
}

// === CONTROL GAME (movable-head bull, rope monkey) ===
function ControlGame({ toy, onComplete, onClose }: ToyMiniGameProps) {
  const [position, setPosition] = useState(50);
  const [target, setTarget] = useState(30);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [time, setTime] = useState(5);
  const [message, setMessage] = useState('Move the slider to match the target position!');
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRound = () => {
    setTarget(Math.floor(Math.random() * 80) + 10);
    setTime(Math.max(2, 6 - Math.floor(round / 3)));
    setRunning(true);
    setMessage('Match the target position quickly!');
  };

  const handleSubmit = () => {
    if (!running) return;
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const accuracy = 100 - Math.abs(position - target) * 2;
    const points = Math.max(0, Math.floor(accuracy));
    setScore((s) => s + points);
    if (round >= 5) {
      setGameOver(true);
      setMessage(`Complete! Final score: ${score + points}`);
      onComplete(score + points);
    } else {
      setRound((r) => r + 1);
      setMessage(`+${points} points! Next round...`);
      setTimeout(() => startRound(), 1000);
    }
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 0.1) {
          handleSubmit();
          return 0;
        }
        return Math.round((t - 0.1) * 10) / 10;
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const start = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    setPosition(50);
    startRound();
  };

  return (
    <GameContainer title={toy.miniGame} onClose={onClose} score={score} message={message} gameOver={gameOver} onStart={start} extra={
      <div className="flex items-center gap-3">
        <span className="font-display text-sm text-amber-300">Round: {round}/5</span>
        <span className="font-display text-sm text-red-400">Time: {time.toFixed(1)}s</span>
      </div>
    }>
      <div className="py-8">
        {/* Target indicator */}
        <div className="relative h-12 mb-4">
          <div className="absolute top-0 bottom-0 w-1 bg-green-400/60 rounded-full" style={{ left: `${target}%`, transform: 'translateX(-50%)' }} />
          <span className="absolute -top-5 font-display text-xs text-green-400/60" style={{ left: `${target}%`, transform: 'translateX(-50%)' }}>Target</span>
          {/* Position indicator */}
          <div className="absolute top-0 bottom-0 w-2 bg-amber-400 rounded-full glow-gold" style={{ left: `${position}%`, transform: 'translateX(-50%)' }} />
          <span className="absolute -top-5 font-display text-xs text-amber-400/60" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>You</span>
          {/* Track */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-900/40 rounded-full" />
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          disabled={!running || gameOver}
          className="w-full accent-amber-500"
        />

        <div className="text-center mt-4">
          <div className="font-display text-sm text-amber-300">Difference: {Math.abs(position - target)}</div>
        </div>

        {running && (
          <button onClick={handleSubmit} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-4">Lock In Position</button>
        )}
      </div>
      <p className="font-body text-xs text-amber-100/40 text-center">
        {toy.id === 'movable-head-bull' ? 'Control the bull\'s head movement. Match the target angle.' : 'Control the rope to position the monkey. Stop at the target.'}
      </p>
    </GameContainer>
  );
}

// === SHARED GAME CONTAINER ===
function GameContainer({ title, onClose, score, time, message, gameOver, onStart, extra, children }: {
  title: string;
  onClose: () => void;
  score: number;
  time?: number;
  message: string;
  gameOver: boolean;
  onStart: () => void;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E27]/95 backdrop-blur-md flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="heritage-card rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold text-amber-200">{title}</h3>
            <button onClick={onClose} className="text-amber-300/60 hover:text-amber-300 font-display text-sm">Close ✕</button>
          </div>

          {/* Score bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm text-amber-200">Score:</span>
              <span className="font-display text-lg font-bold text-amber-300">{score}</span>
            </div>
            {time !== undefined && (
              <span className={`font-display text-lg font-bold ${time <= 5 ? 'text-red-400' : 'text-amber-300'}`}>{time}s</span>
            )}
            {extra}
          </div>

          {/* Message */}
          <div className={`text-center py-2 px-4 rounded-lg font-body text-sm mb-4 ${gameOver ? 'bg-amber-950/30 border border-amber-700/30 text-amber-200' : 'bg-stone-900/20 text-amber-100/70'}`}>
            {gameOver && <Trophy size={14} className="inline mr-2 text-amber-400" />}
            {message}
          </div>

          {/* Game content */}
          {children}

          {/* Start / Play again */}
          {gameOver && (
            <button onClick={onStart} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-4 flex items-center justify-center gap-2">
              <Play size={16} /> Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
