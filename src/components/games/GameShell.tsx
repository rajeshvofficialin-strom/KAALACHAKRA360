import type { ReactNode } from 'react';
import { RotateCcw, Trophy, Star, Zap, Target } from 'lucide-react';
import type { Difficulty } from './useGameState';
import { DIFFICULTY_LABELS } from './useGameState';

interface GameShellProps {
  title: string;
  children: ReactNode;
  difficulty?: Difficulty | null;
  onDifficultyChange?: (d: Difficulty) => void;
  showDifficulty?: boolean;
  score?: number;
  bestScore?: number;
  message?: string;
  gameOver?: boolean;
  onReset?: () => void;
  xp?: number;
  achievements?: string[];
  mode?: 'play' | 'practice' | 'learn';
  onModeChange?: (m: 'play' | 'practice' | 'learn') => void;
  showModeToggle?: boolean;
}

export default function GameShell({
  title,
  children,
  difficulty,
  onDifficultyChange,
  showDifficulty = true,
  score,
  bestScore,
  message,
  gameOver,
  onReset,
  xp,
  achievements = [],
  mode = 'play',
  onModeChange,
  showModeToggle = false,
}: GameShellProps) {
  return (
    <div className="space-y-4">
      {/* Top bar: difficulty + mode + score */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {showDifficulty && onDifficultyChange && difficulty && (
            <div className="flex items-center gap-1.5">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`px-3 py-1.5 rounded-lg font-display text-xs tracking-wide uppercase transition-all border ${
                    difficulty === d
                      ? 'bg-amber-900/40 border-amber-500/50 text-amber-300'
                      : 'bg-stone-900/20 border-stone-700/30 text-stone-400 hover:text-amber-300 hover:border-amber-700/30'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          )}
          {showModeToggle && onModeChange && (
            <div className="flex items-center gap-1.5">
              {(['play', 'practice', 'learn'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={`px-3 py-1.5 rounded-lg font-display text-xs tracking-wide uppercase transition-all border ${
                    mode === m
                      ? 'bg-green-900/40 border-green-500/50 text-green-300'
                      : 'bg-stone-900/20 border-stone-700/30 text-stone-400 hover:text-green-300 hover:border-green-700/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {score !== undefined && (
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-amber-400/70" />
              <span className="font-display text-sm text-amber-200">Score:</span>
              <span className="font-display text-lg font-bold text-amber-300">{score}</span>
            </div>
          )}
          {bestScore !== undefined && bestScore > 0 && (
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400/50" />
              <span className="font-display text-xs text-amber-300/60">Best: {bestScore}</span>
            </div>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-300 hover:bg-amber-900/20 transition-colors font-display text-xs"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`text-center py-2 px-4 rounded-lg font-body text-sm ${
            gameOver
              ? 'bg-amber-950/30 border border-amber-700/30 text-amber-200'
              : 'bg-stone-900/20 text-amber-100/70'
          }`}
        >
          {gameOver && <Trophy size={16} className="inline mr-2 text-amber-400" />}
          {message}
        </div>
      )}

      {/* Game content */}
      {children}

      {/* XP and achievements */}
      {(xp !== undefined || achievements.length > 0) && (
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-800/20">
          {xp !== undefined && xp > 0 && (
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span className="font-display text-xs text-amber-300">+{xp} XP earned</span>
            </div>
          )}
          {achievements.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Star size={12} className="text-amber-400" />
              {achievements.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-700/30 font-display text-xs text-amber-300/80"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
