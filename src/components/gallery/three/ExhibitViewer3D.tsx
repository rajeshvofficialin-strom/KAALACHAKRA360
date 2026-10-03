import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Html, Lightformer, Sparkles, useGLTF, useProgress } from '@react-three/drei';
import { Pause, Play, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { RECONSTRUCTION_LABEL, type HeritageExhibit } from '@/data/heritageExhibits';
import { FallbackModel, PROCEDURAL_MODELS } from './ExhibitModels';
import MuseumHall from './MuseumHall';

const HOME_POSITION = [0, 2.1, 5.2] as const;
const HOME_TARGET = [0, 1.45, 0] as const;
const PEDESTAL_TOP = 0.9;

class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ExhibitModel({ exhibit }: { exhibit: HeritageExhibit }) {
  const Procedural = PROCEDURAL_MODELS[exhibit.modelKey] ?? FallbackModel;
  const procedural = <Procedural />;
  return (
    <group position={[0, PEDESTAL_TOP, 0]}>
      <ModelErrorBoundary key={exhibit.id} fallback={<FallbackModel />}>
        {exhibit.modelUrl ? (
          <ModelErrorBoundary fallback={procedural}>
            <GLTFModel url={exhibit.modelUrl} />
          </ModelErrorBoundary>
        ) : (
          procedural
        )}
      </ModelErrorBoundary>
    </group>
  );
}

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 whitespace-nowrap">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-amber-950/60">
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-display text-xs tracking-widest text-amber-200/80">LOADING ARTIFACT</span>
      </div>
    </Html>
  );
}

function AutoRotate({ controls, enabled }: { controls: React.RefObject<CameraControls>; enabled: boolean }) {
  useFrame((_, delta) => {
    if (enabled && controls.current && !controls.current.active) {
      controls.current.rotate(delta * 0.35, 0, false);
    }
  });
  return null;
}

function ViewerButton({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: ReactNode; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
        pressed
          ? 'border-amber-300/70 bg-amber-400/25 text-amber-100'
          : 'border-amber-700/40 bg-black/50 text-amber-200/80 hover:border-amber-400/60 hover:text-amber-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function ExhibitViewer3D({ exhibit, onContextLost }: { exhibit: HeritageExhibit; onContextLost?: () => void }) {
  const controls = useRef<CameraControls>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const resetView = () => {
    controls.current?.setLookAt(...HOME_POSITION, ...HOME_TARGET, true);
  };

  useEffect(() => {
    controls.current?.setLookAt(...HOME_POSITION, ...HOME_TARGET, true);
  }, [exhibit.id]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [...HOME_POSITION], fov: 40, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label={`Interactive 3D view of ${exhibit.name}`}
        style={{ touchAction: 'pan-y' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              onContextLost?.();
            },
            { once: true },
          );
        }}
      >
        <color attach="background" args={['#0b0806']} />
        <fog attach="fog" args={['#0b0806', 7, 18]} />

        <ambientLight intensity={0.18} color="#ffd9a8" />
        <spotLight
          position={[2.5, 6, 3]}
          angle={0.45}
          penumbra={0.8}
          intensity={60}
          color="#ffcf8a"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        <spotLight position={[-3, 4, -2]} angle={0.6} penumbra={1} intensity={18} color="#ff9f5a" />
        <pointLight position={[0, 1.2, 2.5]} intensity={2} color={exhibit.accent} distance={5} />

        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2} color="#ffd59a" position={[0, 4, 3]} scale={[6, 2, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#c9873a" position={[-4, 2, -2]} scale={2} />
        </Environment>

        <MuseumHall />

        <Suspense fallback={<CanvasLoader />}>
          <ExhibitModel exhibit={exhibit} />
        </Suspense>

        <ContactShadows position={[0, PEDESTAL_TOP + 0.002, 0]} opacity={0.6} scale={2.4} blur={2.2} far={1.2} resolution={256} />
        <Sparkles count={40} scale={[8, 4, 6]} position={[0, 2.2, 0]} size={1.6} speed={0.25} color="#ffcf8a" opacity={0.5} />

        <CameraControls
          ref={controls}
          makeDefault
          minDistance={2.4}
          maxDistance={8.5}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2 - 0.04}
          smoothTime={0.45}
          dollySpeed={0.6}
          // ROTATE / DOLLY / TRUCK / NONE: wheel stays free so the page keeps scrolling over the canvas.
          mouseButtons={{ left: 1, middle: 16, right: 2, wheel: 0 }}
        />
        <AutoRotate controls={controls} enabled={autoRotate} />
      </Canvas>

      <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-black/60 px-3 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-amber-200/90 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
          {RECONSTRUCTION_LABEL}
        </span>
      </div>

      <div
        role="toolbar"
        aria-label="3D viewer controls"
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-800/30 bg-black/40 p-1.5 backdrop-blur-md sm:bottom-4"
      >
        <ViewerButton label="Rotate 45 degrees" onClick={() => controls.current?.rotate(Math.PI / 4, 0, true)}>
          <RotateCw size={16} />
        </ViewerButton>
        <ViewerButton label={autoRotate ? 'Pause auto rotate' : 'Start auto rotate'} pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
          {autoRotate ? <Pause size={16} /> : <Play size={16} />}
        </ViewerButton>
        <ViewerButton label="Zoom in" onClick={() => controls.current?.dolly(0.8, true)}>
          <ZoomIn size={16} />
        </ViewerButton>
        <ViewerButton label="Zoom out" onClick={() => controls.current?.dolly(-0.8, true)}>
          <ZoomOut size={16} />
        </ViewerButton>
        <ViewerButton label="Reset view" onClick={resetView}>
          <RotateCcw size={16} />
        </ViewerButton>
      </div>

      <p className="pointer-events-none absolute right-3 top-3 hidden font-body text-xs italic text-amber-100/50 sm:right-4 sm:top-4 md:block">
        Drag to rotate · Pinch or use buttons to zoom
      </p>
    </div>
  );
}
