import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box } from 'lucide-react';
import type { HeritageExhibit } from '@/data/heritageExhibits';

const ExhibitViewer3D = lazy(() => import('./three/ExhibitViewer3D'));

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    // Release the probe context immediately; browsers cap live WebGL contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

class ViewerErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[KAALACHAKRA360] 3D viewer failed to render:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_center,#2a1b10_0%,#0b0806_70%)]" role="status">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-amber-700/30" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-amber-400" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-300/40 to-amber-800/40" />
      </div>
      <div className="text-center">
        <p className="font-display text-sm tracking-[0.25em] text-amber-200">PREPARING EXHIBITION HALL</p>
        <p className="mt-1 font-body text-sm italic text-amber-100/50">Lighting the gallery lamps…</p>
      </div>
    </div>
  );
}

function StaticFallback({ exhibit, reason, onRetry }: { exhibit: HeritageExhibit; reason: string; onRetry?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,#2a1b10_0%,#0b0806_70%)] p-6 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/40"
        style={{ background: `radial-gradient(circle, ${exhibit.accent}55 0%, transparent 70%)` }}
      >
        <Box size={36} className="text-amber-200" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg text-amber-100">{exhibit.name}</p>
        <p className="mt-2 max-w-sm font-body text-sm text-amber-100/60">{reason}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-amber-500/50 px-4 py-2 font-display text-xs uppercase tracking-[0.18em] text-amber-200 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          Retry 3D view
        </button>
      )}
    </div>
  );
}

export default function ViewerStage({ exhibit }: { exhibit: HeritageExhibit }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [webgl] = useState(() => (typeof document === 'undefined' ? true : supportsWebGL()));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [attempt, setAttempt] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const retry = () => {
    setContextLost(false);
    setAttempt((n) => n + 1);
  };

  const unavailable = (
    <StaticFallback
      exhibit={exhibit}
      reason="The 3D model could not be displayed on this device. All exhibit details remain available below."
      onRetry={retry}
    />
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      {!webgl ? (
        <StaticFallback exhibit={exhibit} reason="Your browser does not support WebGL, so the 3D hall is unavailable. Exhibit details remain fully accessible." />
      ) : contextLost ? (
        <StaticFallback
          exhibit={exhibit}
          reason="The graphics context was interrupted by the browser. You can restart the 3D hall; exhibit details remain available below."
          onRetry={retry}
        />
      ) : inView ? (
        <ViewerErrorBoundary key={attempt} fallback={unavailable}>
          <Suspense fallback={<LoadingScreen />}>
            <ExhibitViewer3D exhibit={exhibit} onContextLost={() => setContextLost(true)} />
          </Suspense>
        </ViewerErrorBoundary>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
}
