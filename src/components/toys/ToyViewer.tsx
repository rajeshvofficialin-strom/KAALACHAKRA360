import { useState, useRef, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Eye, Play, X, CheckCircle2, AlertTriangle, Wrench, Info, MapPin, Clock, Layers } from 'lucide-react';
import { EVIDENCE_LABELS, type AncientToy } from '@/data/toyData';

const EVIDENCE_ICONS: Record<string, typeof CheckCircle2> = {
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Info,
};

interface ToyViewerProps {
  toy: AncientToy;
  onClose: () => void;
  onPlay: () => void;
  isDiscovered: boolean;
  hasPlayed: boolean;
}

export default function ToyViewer({ toy, onClose, onPlay, isDiscovered, hasPlayed }: ToyViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const evidence = EVIDENCE_LABELS[toy.evidenceLevel];
  const EvidenceIcon = EVIDENCE_ICONS[evidence.icon];

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotation((r) => r + dx * 0.5);
  };
  const handleMouseUp = () => { dragging.current = false; };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E27]/95 backdrop-blur-md flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="heritage-card rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative h-32 sm:h-40 overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-950/40 to-[#0A0E27]">
          <div className="absolute inset-0 mandala-bg opacity-20" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0A0E27]/80 border border-amber-700/40 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors z-10">
            <X size={20} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-display border ${evidence.color}`}>
                <EvidenceIcon size={12} />
                {evidence.label}
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-amber-100">{toy.name}</h3>
            <p className="font-sanskrit text-amber-300/60 text-sm">{toy.sanskritName}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* 3D Viewer area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Interactive viewer */}
            <div
              className="relative rounded-xl bg-gradient-to-b from-stone-900/60 to-[#0A0E27] border border-amber-800/20 overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ height: '300px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Dust particles */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-400/20"
                    style={{
                      left: `${15 + i * 11}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animation: `float ${4 + i}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              {/* 3D-ish object representation */}
              <div
                className="absolute top-1/2 left-1/2 flex items-center justify-center"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${rotation}deg) scale(${zoom})`,
                  transition: dragging.current ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                <ToyModel toy={toy} />
              </div>

              {/* Controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button onClick={() => setRotation((r) => r - 45)} className="w-8 h-8 rounded-lg bg-[#0A0E27]/80 border border-amber-700/30 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors">
                  <RotateCw size={14} className="-scale-x-100" />
                </button>
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} className="w-8 h-8 rounded-lg bg-[#0A0E27]/80 border border-amber-700/30 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors">
                  <ZoomOut size={14} />
                </button>
                <button onClick={() => setZoom((z) => Math.min(2, z + 0.2))} className="w-8 h-8 rounded-lg bg-[#0A0E27]/80 border border-amber-700/30 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors">
                  <ZoomIn size={14} />
                </button>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                <Eye size={12} className="text-amber-400/40" />
                <span className="font-display text-xs text-amber-400/40">Drag to rotate</span>
              </div>
            </div>

            {/* Info panel */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoTag icon={MapPin} label="Site" value={toy.site} />
                <InfoTag icon={Clock} label="Period" value={toy.period} />
                <InfoTag icon={Layers} label="Material" value={toy.material} />
                <InfoTag icon={MapPin} label="Region" value={toy.region} />
              </div>

              <p className="font-body text-sm text-amber-100/70 leading-relaxed">{toy.description}</p>

              {/* What we know / What is uncertain */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-green-950/20 border border-green-800/20">
                  <h5 className="font-display text-xs text-green-400/70 uppercase tracking-wide mb-1">What We Know</h5>
                  <p className="font-body text-xs text-amber-100/60 leading-relaxed">{toy.whatWeKnow}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/20">
                  <h5 className="font-display text-xs text-amber-400/70 uppercase tracking-wide mb-1">What Is Uncertain</h5>
                  <p className="font-body text-xs text-amber-100/60 leading-relaxed">{toy.whatIsUncertain}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-display text-sm tracking-widest text-amber-400/60 uppercase mb-3">Features</h4>
            <div className="flex flex-wrap gap-2">
              {toy.features.map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/30 font-body text-sm text-amber-100/60">{f}</span>
              ))}
            </div>
          </div>

          {/* Cultural context */}
          <div className="mb-6 p-4 rounded-lg bg-amber-950/20 border border-amber-800/20">
            <h4 className="font-display text-sm text-amber-300 mb-2">Cultural Context</h4>
            <p className="font-body text-sm text-amber-100/60 leading-relaxed">{toy.culturalContext}</p>
          </div>

          {/* Mini-game section */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-950/30 border border-amber-700/30">
            <div>
              <h4 className="font-display text-lg text-amber-200">{toy.miniGame}</h4>
              <p className="font-body text-sm text-amber-100/50 mt-1">{toy.miniGameDescription}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-display text-xs text-amber-400/60">+{toy.xpReward} Heritage XP</span>
                {hasPlayed && (
                  <span className="flex items-center gap-1 font-display text-xs text-green-400">
                    <CheckCircle2 size={12} /> Played
                  </span>
                )}
              </div>
            </div>
            <button onClick={onPlay} className="btn-kaalachakra px-6 py-3 rounded-lg font-display text-sm flex items-center gap-2 flex-shrink-0">
              <Play size={16} /> Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTag({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/20">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="text-amber-400/50" />
        <span className="font-display text-xs text-amber-400/50 uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-body text-xs text-amber-100/70">{value}</p>
    </div>
  );
}

// Simplified 3D-style model representation per toy type
function ToyModel({ toy }: { toy: AncientToy }) {
  const baseColor = toy.iconColor;
  const terracotta = '#B85C38';
  const terracottaLight = '#D4805A';
  const terracottaDark = '#8B4226';

  switch (toy.id) {
    case 'toy-cart':
      return (
        <svg width="160" height="120" viewBox="0 0 160 120">
          <ellipse cx="80" cy="105" rx="50" ry="6" fill="#000" opacity="0.2" />
          {/* Cart body */}
          <rect x="40" y="55" width="80" height="30" rx="3" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          <rect x="45" y="60" width="70" height="5" fill={terracottaLight} opacity="0.5" />
          {/* Wheels */}
          <g>
            <circle cx="55" cy="95" r="14" fill={terracottaDark} stroke="#6B3422" strokeWidth="2" />
            <circle cx="55" cy="95" r="6" fill={terracotta} />
            <line x1="55" y1="83" x2="55" y2="107" stroke="#6B3422" strokeWidth="1.5" />
            <line x1="43" y1="95" x2="67" y2="95" stroke="#6B3422" strokeWidth="1.5" />
          </g>
          <g>
            <circle cx="105" cy="95" r="14" fill={terracottaDark} stroke="#6B3422" strokeWidth="2" />
            <circle cx="105" cy="95" r="6" fill={terracotta} />
            <line x1="105" y1="83" x2="105" y2="107" stroke="#6B3422" strokeWidth="1.5" />
            <line x1="93" y1="95" x2="117" y2="95" stroke="#6B3422" strokeWidth="1.5" />
          </g>
          {/* String */}
          <path d="M 40 65 Q 20 60 10 50" fill="none" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="3,2" />
        </svg>
      );
    case 'movable-head-bull':
      return (
        <svg width="140" height="120" viewBox="0 0 140 120">
          <ellipse cx="70" cy="105" rx="40" ry="5" fill="#000" opacity="0.2" />
          {/* Body */}
          <ellipse cx="65" cy="75" rx="35" ry="22" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Legs */}
          <rect x="40" y="85" width="6" height="18" fill={terracottaDark} />
          <rect x="55" y="85" width="6" height="18" fill={terracottaDark} />
          <rect x="75" y="85" width="6" height="18" fill={terracottaDark} />
          <rect x="90" y="85" width="6" height="18" fill={terracottaDark} />
          {/* Head */}
          <g>
            <ellipse cx="95" cy="50" rx="18" ry="14" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1.5" />
            {/* Horns */}
            <path d="M 88 40 Q 85 30 82 28" fill="none" stroke={terracottaDark} strokeWidth="2" />
            <path d="M 102 40 Q 105 30 108 28" fill="none" stroke={terracottaDark} strokeWidth="2" />
            {/* Eyes */}
            <circle cx="90" cy="48" r="2" fill="#0A0E27" />
            <circle cx="100" cy="48" r="2" fill="#0A0E27" />
          </g>
          {/* String mechanism */}
          <path d="M 95 38 Q 110 25 120 15" fill="none" stroke="#D4A017" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      );
    case 'wheeled-animal':
      return (
        <svg width="140" height="110" viewBox="0 0 140 110">
          <ellipse cx="70" cy="98" rx="45" ry="5" fill="#000" opacity="0.2" />
          <ellipse cx="65" cy="65" rx="35" ry="20" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          <ellipse cx="95" cy="50" rx="15" ry="12" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1.5" />
          <circle cx="92" cy="48" r="2" fill="#0A0E27" />
          <circle cx="100" cy="48" r="2" fill="#0A0E27" />
          <rect x="40" y="75" width="5" height="15" fill={terracottaDark} />
          <rect x="85" y="75" width="5" height="15" fill={terracottaDark} />
          {/* Wheels */}
          <circle cx="42" cy="90" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="88" cy="90" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="42" cy="90" r="3" fill={terracotta} />
          <circle cx="88" cy="90" r="3" fill={terracotta} />
        </svg>
      );
    case 'bird-whistle':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120">
          <ellipse cx="60" cy="105" rx="30" ry="4" fill="#000" opacity="0.2" />
          {/* Body */}
          <ellipse cx="55" cy="60" rx="28" ry="22" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Head */}
          <circle cx="80" cy="45" r="14" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Beak */}
          <path d="M 92 43 L 102 42 L 92 47 Z" fill="#D4A017" />
          {/* Eye */}
          <circle cx="83" cy="42" r="2.5" fill="#0A0E27" />
          {/* Tail */}
          <path d="M 28 55 L 15 48 L 18 62 L 28 65 Z" fill={terracottaDark} />
          {/* Air opening */}
          <circle cx="55" cy="58" r="3" fill="#0A0E27" opacity="0.6" />
          {/* Sound waves */}
          <path d="M 100 38 Q 108 35 110 30" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.4" />
          <path d="M 104 42 Q 114 40 116 35" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.3" />
        </svg>
      );
    case 'ancient-rattle':
      return (
        <svg width="100" height="120" viewBox="0 0 100 120">
          <ellipse cx="50" cy="108" rx="25" ry="4" fill="#000" opacity="0.2" />
          {/* Handle */}
          <rect x="46" y="70" width="8" height="35" rx="3" fill={terracottaDark} />
          {/* Body */}
          <ellipse cx="50" cy="45" rx="25" ry="28" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Decorative lines */}
          <path d="M 30 40 Q 50 35 70 40" fill="none" stroke={terracottaDark} strokeWidth="1" opacity="0.5" />
          <path d="M 28 50 Q 50 45 72 50" fill="none" stroke={terracottaDark} strokeWidth="1" opacity="0.5" />
          {/* Pellets indicator */}
          <circle cx="42" cy="50" r="2" fill={terracottaDark} opacity="0.4" />
          <circle cx="55" cy="48" r="2" fill={terracottaDark} opacity="0.4" />
          <circle cx="48" cy="55" r="2" fill={terracottaDark} opacity="0.4" />
          {/* Sound waves */}
          <path d="M 75 30 Q 82 25 85 20" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.3" />
          <path d="M 80 35 Q 88 30 90 25" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.2" />
        </svg>
      );
    case 'spinning-top':
      return (
        <svg width="100" height="120" viewBox="0 0 100 120">
          <ellipse cx="50" cy="108" rx="20" ry="3" fill="#000" opacity="0.2" />
          {/* Top body */}
          <path d="M 50 20 L 72 50 Q 75 70 50 100 Q 25 70 28 50 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Highlight */}
          <path d="M 45 30 L 50 25 L 55 30" fill="none" stroke={terracottaLight} strokeWidth="2" opacity="0.5" />
          {/* Bands */}
          <ellipse cx="50" cy="55" rx="20" ry="3" fill={terracottaDark} opacity="0.3" />
          <ellipse cx="50" cy="70" rx="15" ry="2" fill={terracottaDark} opacity="0.3" />
          {/* Tip */}
          <path d="M 48 95 L 50 105 L 52 95" fill={terracottaDark} />
          {/* String */}
          <path d="M 50 25 Q 60 15 70 5" fill="none" stroke="#D4A017" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      );
    case 'ancient-marbles':
      return (
        <svg width="120" height="100" viewBox="0 0 120 100">
          <ellipse cx="60" cy="88" rx="45" ry="4" fill="#000" opacity="0.2" />
          {/* Ground */}
          <ellipse cx="60" cy="82" rx="48" ry="6" fill="#3D2817" opacity="0.3" />
          {/* Marbles */}
          <circle cx="30" cy="75" r="10" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="28" cy="73" r="3" fill={terracottaLight} opacity="0.5" />
          <circle cx="55" cy="78" r="8" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="53" cy="76" r="2.5" fill="#F4C430" opacity="0.3" />
          <circle cx="78" cy="73" r="12" fill={terracottaDark} stroke="#6B3422" strokeWidth="1" />
          <circle cx="75" cy="70" r="4" fill={terracotta} opacity="0.5" />
          <circle cx="95" cy="78" r="7" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
        </svg>
      );
    case 'wheeled-bird':
      return (
        <svg width="130" height="110" viewBox="0 0 130 110">
          <ellipse cx="65" cy="100" rx="40" ry="4" fill="#000" opacity="0.2" />
          {/* Body */}
          <ellipse cx="55" cy="55" rx="28" ry="18" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Head */}
          <circle cx="82" cy="42" r="12" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Beak */}
          <path d="M 93 40 L 102 39 L 93 43 Z" fill="#D4A017" />
          <circle cx="85" cy="40" r="2" fill="#0A0E27" />
          {/* Wings */}
          <path d="M 45 50 Q 40 40 35 55" fill={terracottaDark} />
          {/* Tail */}
          <path d="M 28 52 L 15 48 L 18 60 L 28 58 Z" fill={terracottaDark} />
          {/* Wheels */}
          <circle cx="42" cy="85" r="9" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="75" cy="85" r="9" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="42" cy="85" r="3" fill={terracotta} />
          <circle cx="75" cy="85" r="3" fill={terracotta} />
        </svg>
      );
    case 'rope-monkey':
      return (
        <svg width="140" height="120" viewBox="0 0 140 120">
          {/* Rope */}
          <path d="M 10 25 Q 70 15 130 25" fill="none" stroke="#D4A017" strokeWidth="2" />
          {/* Monkey body */}
          <ellipse cx="70" cy="50" rx="18" ry="22" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          {/* Head */}
          <circle cx="70" cy="32" r="13" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Ears */}
          <circle cx="60" cy="25" r="5" fill={terracottaDark} />
          <circle cx="80" cy="25" r="5" fill={terracottaDark} />
          {/* Face */}
          <circle cx="66" cy="33" r="2" fill="#0A0E27" />
          <circle cx="74" cy="33" r="2" fill="#0A0E27" />
          <ellipse cx="70" cy="38" rx="4" ry="2" fill="#D4805A" />
          {/* Arms gripping rope */}
          <path d="M 55 45 Q 50 30 55 25" fill="none" stroke={terracottaDark} strokeWidth="3" />
          <path d="M 85 45 Q 90 30 85 25" fill="none" stroke={terracottaDark} strokeWidth="3" />
          {/* Legs */}
          <rect x="62" y="68" width="5" height="15" fill={terracottaDark} />
          <rect x="73" y="68" width="5" height="15" fill={terracottaDark} />
        </svg>
      );
    case 'toy-boat':
      return (
        <svg width="140" height="100" viewBox="0 0 140 100">
          {/* Water */}
          <path d="M 0 75 Q 35 70 70 75 Q 105 80 140 75 L 140 100 L 0 100 Z" fill="#1A5276" opacity="0.3" />
          <path d="M 0 78 Q 35 73 70 78 Q 105 83 140 78" fill="none" stroke="#5DADE2" strokeWidth="0.5" opacity="0.3" />
          {/* Boat hull */}
          <path d="M 25 55 L 30 75 Q 70 82 110 75 L 115 55 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1.5" />
          {/* Deck */}
          <ellipse cx="70" cy="55" rx="42" ry="5" fill={terracottaLight} />
          {/* Mast */}
          <line x1="70" y1="55" x2="70" y2="15" stroke={terracottaDark} strokeWidth="2" />
          {/* Sail */}
          <path d="M 70 18 L 95 40 L 70 45 Z" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" opacity="0.7" />
          {/* Flag */}
          <path d="M 70 15 L 78 12 L 78 18 Z" fill="#FF9933" />
        </svg>
      );
    default:
      return <div className="text-amber-400/30 font-display text-sm">3D Model</div>;
  }
}
