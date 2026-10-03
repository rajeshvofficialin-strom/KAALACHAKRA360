import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box } from 'lucide-react';
import type { HeritageExhibit } from '@/data/heritageExhibits';

const ExhibitViewer3D = lazy(() => import('./three/ExhibitViewer3D'));

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

class ViewerErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
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

function StaticFallback({ exhibit, reason }: { exhibit: HeritageExhibit; reason: string }) {
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

  const unavailable = (
    <StaticFallback exhibit={exhibit} reason="The 3D model could not be displayed on this device. All exhibit details remain available below." />
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      {!webgl ? (
        <StaticFallback exhibit={exhibit} reason="Your browser does not support WebGL, so the 3D hall is unavailable. Exhibit details remain fully accessible." />
      ) : inView ? (
        <ViewerErrorBoundary fallback={unavailable}>
          <Suspense fallback={<LoadingScreen />}>
            <ExhibitViewer3D exhibit={exhibit} />
          </Suspense>
        </ViewerErrorBoundary>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
}
