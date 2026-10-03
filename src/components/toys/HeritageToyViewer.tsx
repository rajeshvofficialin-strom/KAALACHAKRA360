import { createPortal } from 'react-dom';
import { CheckCircle2, Clock3, Eye, Layers3, MapPin, Play, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import HeritageToyScene from './HeritageToyScene';
import type { HeritageToyExhibit } from './heritageToyExhibits';

interface HeritageToyViewerProps {
  exhibit: HeritageToyExhibit;
  onClose: () => void;
  onPlay: () => void;
  isDiscovered: boolean;
  hasPlayed: boolean;
}

export default function HeritageToyViewer({ exhibit, onClose, onPlay, isDiscovered, hasPlayed }: HeritageToyViewerProps) {
  const [cameraKey, setCameraKey] = useState(0);
  const [showContext, setShowContext] = useState(false);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6" onClick={onClose}>
      <div className="heritage-card max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-amber-500/25 shadow-[0_24px_100px_rgba(0,0,0,0.75)]" onClick={(event) => event.stopPropagation()}>
        <div className="relative flex items-start justify-between gap-4 border-b border-amber-700/20 px-5 py-5 sm:px-8">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-900/20 px-2.5 py-1 font-display text-[10px] uppercase tracking-wide text-amber-200/80">
                <Eye size={12} /> Digital museum exhibit
              </span>
              {exhibit.reconstructionNote && <span className="rounded-full border border-sky-400/30 bg-sky-950/40 px-2.5 py-1 font-display text-[10px] uppercase tracking-wide text-sky-200">Reconstruction</span>}
            </div>
            <h2 className="font-display text-xl font-bold leading-tight text-amber-100 sm:text-3xl">{exhibit.title}</h2>
          </div>
          <button aria-label="Close exhibit" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-700/40 bg-[#0A0E27]/80 text-amber-200 transition-colors hover:bg-amber-900/50">
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="relative h-[360px] overflow-hidden rounded-xl border border-amber-700/25 bg-[#100e0b] sm:h-[560px]">
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,209,132,0.12),transparent_48%),linear-gradient(180deg,transparent_70%,rgba(0,0,0,0.3))]" />
              <HeritageToyScene key={cameraKey} kind={exhibit.kind} />
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                <button aria-label="Reset exhibit camera" title="Reset camera" onClick={() => setCameraKey((key) => key + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-700/35 bg-black/55 text-amber-200 backdrop-blur hover:bg-amber-900/50">
                  <RotateCcw size={15} />
                </button>
                <span className="rounded-md bg-black/45 px-2.5 py-1.5 font-body text-xs text-amber-100/65 backdrop-blur">Drag to rotate · wheel or pinch to zoom</span>
              </div>
              {exhibit.reconstructionNote && <div className="absolute right-3 top-3 z-20 max-w-[min(80%,22rem)] rounded-lg border border-sky-300/20 bg-sky-950/70 px-3 py-2 font-body text-xs leading-relaxed text-sky-100/85 backdrop-blur">{exhibit.reconstructionNote}</div>}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-amber-100/40">
              <span>Procedural digital model · not an original artifact</span>
              {hasPlayed && <span className="inline-flex items-center gap-1 text-green-300"><CheckCircle2 size={13} /> Play recorded</span>}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <p className="font-body text-base leading-relaxed text-amber-100/75">{exhibit.description}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Info icon={MapPin} label="Region" value={exhibit.region} />
              <Info icon={Clock3} label="Period" value={exhibit.period} />
              <Info icon={Layers3} label="Material" value={exhibit.material} />
              <Info icon={Eye} label="Evidence" value={exhibit.reconstructionNote ? 'Digital reconstruction' : 'Craft tradition interpretation'} />
            </div>
            <div className="rounded-xl border border-amber-800/25 bg-amber-950/20 p-4">
              <h3 className="mb-2 font-display text-xs uppercase tracking-widest text-amber-300/75">Historical context</h3>
              <p className="font-body text-sm leading-relaxed text-amber-100/65">{exhibit.context}</p>
            </div>
            <div className="mt-auto rounded-xl border border-amber-700/25 bg-[#100e0b]/70 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm text-amber-200">{exhibit.toy.miniGame}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-amber-100/55">{exhibit.toy.miniGameDescription}</p>
                </div>
                {isDiscovered && <CheckCircle2 className="mt-1 shrink-0 text-green-400" size={17} />}
              </div>
              <button onClick={onPlay} className="btn-kaalachakra flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-sm">
                <Play size={16} /> Play with this exhibit
              </button>
            </div>
            <button onClick={() => setShowContext((shown) => !shown)} className="self-start font-display text-xs uppercase tracking-wide text-amber-400/65 hover:text-amber-300">
              {showContext ? 'Hide craftsmanship notes' : 'View craftsmanship notes'}
            </button>
            {showContext && <div className="rounded-lg border border-amber-800/20 bg-black/20 p-3 font-body text-xs leading-relaxed text-amber-100/55">{exhibit.toy.whatWeKnow} {exhibit.toy.whatIsUncertain}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="min-w-0 rounded-lg border border-amber-800/20 bg-amber-950/15 p-3">
    <div className="mb-1 flex items-center gap-1.5 text-amber-400/55">
      <Icon size={12} />
      <span className="font-display text-[10px] uppercase tracking-wide">{label}</span>
    </div>
    <p className="font-body text-sm leading-snug text-amber-100/75">{value}</p>
  </div>;
}
