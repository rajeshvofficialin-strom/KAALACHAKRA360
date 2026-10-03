import { useCallback, useEffect, useState } from 'react';
import { TOTAL_EXHIBITS } from '@/data/heritageExhibits';

const STORAGE_KEY = 'kaalachakra.heritageGallery.v1';
const MAX_COMPARE = 2;

interface GalleryProgress {
  explored: string[];
  collected: string[];
}

function loadProgress(): GalleryProgress {
  if (typeof window === 'undefined') return { explored: [], collected: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<GalleryProgress>;
    return {
      explored: Array.isArray(parsed.explored) ? parsed.explored : [],
      collected: Array.isArray(parsed.collected) ? parsed.collected : [],
    };
  } catch {
    return { explored: [], collected: [] };
  }
}

export function useHeritageGallery() {
  const [progress, setProgress] = useState<GalleryProgress>(loadProgress);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage can be unavailable (private mode); progress then lasts for the session only.
    }
  }, [progress]);

  const markExplored = useCallback((id: string) => {
    setProgress((prev) => (prev.explored.includes(id) ? prev : { ...prev, explored: [...prev.explored, id] }));
  }, []);

  const toggleCollected = useCallback((id: string) => {
    setProgress((prev) => ({
      explored: prev.explored.includes(id) ? prev.explored : [...prev.explored, id],
      collected: prev.collected.includes(id) ? prev.collected.filter((c) => c !== id) : [...prev.collected, id],
    }));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      return [...prev, id].slice(-MAX_COMPARE);
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);
  const resetProgress = useCallback(() => setProgress({ explored: [], collected: [] }), []);

  return {
    explored: progress.explored,
    collected: progress.collected,
    compareIds,
    collectedPercent: Math.round((progress.collected.length / TOTAL_EXHIBITS) * 100),
    isComplete: progress.collected.length >= TOTAL_EXHIBITS,
    markExplored,
    toggleCollected,
    toggleCompare,
    clearCompare,
    resetProgress,
  };
}
