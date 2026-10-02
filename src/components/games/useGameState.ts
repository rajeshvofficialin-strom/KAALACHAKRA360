import { useState, useEffect, useCallback } from 'react';

export interface GameState {
  xp: number;
  achievements: Record<string, string[]>;
  gamesPlayed: Record<string, number>;
  bestScores: Record<string, number>;
}

const STORAGE_KEY = 'kaalachakra360_game_state';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        xp: parsed.xp ?? 0,
        achievements: parsed.achievements ?? {},
        gamesPlayed: parsed.gamesPlayed ?? {},
        bestScores: parsed.bestScores ?? {},
      };
    }
  } catch {
    // ignore
  }
  return { xp: 0, achievements: {}, gamesPlayed: {}, bestScores: {} };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addXp = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const unlockAchievement = useCallback((gameId: string, achievement: string) => {
    setState((prev) => {
      const existing = prev.achievements[gameId] ?? [];
      if (existing.includes(achievement)) return prev;
      return {
        ...prev,
        achievements: { ...prev.achievements, [gameId]: [...existing, achievement] },
      };
    });
  }, []);

  const recordPlay = useCallback((gameId: string) => {
    setState((prev) => ({
      ...prev,
      gamesPlayed: { ...prev.gamesPlayed, [gameId]: (prev.gamesPlayed[gameId] ?? 0) + 1 },
    }));
  }, []);

  const recordScore = useCallback((gameId: string, score: number) => {
    setState((prev) => ({
      ...prev,
      bestScores: {
        ...prev.bestScores,
        [gameId]: Math.max(prev.bestScores[gameId] ?? 0, score),
      },
    }));
  }, []);

  const getLevel = useCallback(() => {
    return Math.floor(state.xp / 100) + 1;
  }, [state.xp]);

  const getXpInLevel = useCallback(() => {
    return state.xp % 100;
  }, [state.xp]);

  return {
    state,
    addXp,
    unlockAchievement,
    recordPlay,
    recordScore,
    getLevel,
    getXpInLevel,
  };
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
