import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kaalachakra360_toy_collection';

interface ToyCollectionState {
  discovered: string[];
  played: string[];
  restored: string[];
  crafted: string[];
  xp: number;
  badges: string[];
}

function loadState(): ToyCollectionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        discovered: parsed.discovered ?? [],
        played: parsed.played ?? [],
        restored: parsed.restored ?? [],
        crafted: parsed.crafted ?? [],
        xp: parsed.xp ?? 0,
        badges: parsed.badges ?? [],
      };
    }
  } catch {
    // ignore
  }
  return { discovered: [], played: [], restored: [], crafted: [], xp: 0, badges: [] };
}

export function useToyCollection() {
  const [state, setState] = useState<ToyCollectionState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const discover = useCallback((toyId: string) => {
    setState((prev) => {
      if (prev.discovered.includes(toyId)) return prev;
      return { ...prev, discovered: [...prev.discovered, toyId], xp: prev.xp + 10 };
    });
  }, []);

  const markPlayed = useCallback((toyId: string, xp: number) => {
    setState((prev) => ({
      ...prev,
      played: prev.played.includes(toyId) ? prev.played : [...prev.played, toyId],
      xp: prev.xp + (prev.played.includes(toyId) ? Math.floor(xp / 2) : xp),
    }));
  }, []);

  const markRestored = useCallback((toyId: string, xp: number) => {
    setState((prev) => ({
      ...prev,
      restored: prev.restored.includes(toyId) ? prev.restored : [...prev.restored, toyId],
      xp: prev.xp + xp,
    }));
  }, []);

  const markCrafted = useCallback((toyId: string, xp: number) => {
    setState((prev) => ({
      ...prev,
      crafted: prev.crafted.includes(toyId) ? prev.crafted : [...prev.crafted, toyId],
      xp: prev.xp + xp,
    }));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setState((prev) => {
      if (prev.badges.includes(badge)) return prev;
      return { ...prev, badges: [...prev.badges, badge] };
    });
  }, []);

  const getLevel = useCallback(() => Math.floor(state.xp / 100) + 1, [state.xp]);
  const getProgress = useCallback(() => (state.discovered.length / 10) * 100, [state.discovered.length]);
  const isComplete = useCallback(() => state.discovered.length >= 10, [state.discovered.length]);

  return {
    state,
    discover,
    markPlayed,
    markRestored,
    markCrafted,
    addBadge,
    getLevel,
    getProgress,
    isComplete,
  };
}
