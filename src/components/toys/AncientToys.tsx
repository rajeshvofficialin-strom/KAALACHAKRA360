import { useState } from 'react';
import { ChevronRight, Play, Eye, Wrench, BookOpen, FlaskConical, MapPin, Clock, Layers, Sparkles, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ANCIENT_TOYS, EVIDENCE_LABELS, type AncientToy } from '@/data/toyData';
import { useToyCollection } from './useToyCollection';
import ToyViewer from './ToyViewer';
import ToyMiniGame from './ToyMiniGame';

export default function AncientToys() {
  const [viewingToy, setViewingToy] = useState<AncientToy | null>(null);
  const [playingToy, setPlayingToy] = useState<AncientToy | null>(null);
  const collection = useToyCollection();

  return (
    <section id="ancient-toys" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#1A1410] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">प्राचीन भारतीय खिलौने</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Ancient Indian Toys
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Digitally preserve and play with ancient Indian toys from the Indus Valley Civilization.
            Each toy includes historical context, interactive 3D viewing, and playable mini-games.
          </p>
        </div>

        {/* Collection progress bar */}
        <div className="heritage-card rounded-xl p-5 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-amber-400" />
              <span className="font-display text-sm text-amber-200">Heritage Collection Progress</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-sm text-amber-300">{collection.state.discovered.length}/10 Discovered</span>
              <span className="font-display text-sm text-amber-400/60">Level {collection.getLevel()}</span>
              <span className="font-display text-sm text-green-400">{collection.state.xp} XP</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-stone-800/40 overflow-hidden">
            <div className="h-full progress-bar-fill rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300" style={{ width: `${collection.getProgress()}%` }} />
          </div>
          {collection.isComplete() && (
            <div className="mt-3 flex items-center gap-2 text-center justify-center">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="font-display text-sm text-green-300">Ancient Toys Heritage Master — All 10 toys discovered!</span>
            </div>
          )}
        </div>

        <div className="section-divider mb-16" />

        {/* Preservation progression guide */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {['Discover', 'Inspect', 'Learn', 'Play', 'Restore', 'Collect', 'Preserve'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/30 font-display text-xs text-amber-300/70 tracking-wide">{step}</span>
              {i < 6 && <ChevronRight size={14} className="text-amber-700/40" />}
            </div>
          ))}
        </div>

        {/* Toy cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ANCIENT_TOYS.map((toy, idx) => {
            const evidence = EVIDENCE_LABELS[toy.evidenceLevel];
            const isDiscovered = collection.state.discovered.includes(toy.id);
            const hasPlayed = collection.state.played.includes(toy.id);
            return (
              <div
                key={toy.id}
                className="heritage-card rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => { collection.discover(toy.id); setViewingToy(toy); }}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Toy preview area */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-b from-stone-900/60 to-[#0A0E27] flex items-center justify-center">
                  <div className="absolute inset-0 mandala-bg opacity-20" />
                  {/* Dust particles */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 rounded-full bg-amber-400/20" style={{ left: `${15 + i * 20}%`, top: `${20 + (i % 3) * 25}%`, animation: `float ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }} />
                  ))}
                  <div className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <ToyCardModel toyId={toy.id} />
                  </div>
                  {/* Evidence badge */}
                  <div className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display border ${evidence.color}`}>
                    {evidence.label.split(' ')[0]}
                  </div>
                  {/* Discovered badge */}
                  {isDiscovered && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-900/60 border border-green-600/40 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-green-400" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-sanskrit text-amber-300/40 text-xs mb-1">{toy.sanskritName}</p>
                  <h3 className="font-display text-base font-bold text-amber-100 leading-tight mb-2">{toy.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-amber-100/40 mb-2">
                    <MapPin size={10} />
                    <span className="font-body">{toy.site}</span>
                  </div>
                  <p className="font-body text-sm text-amber-100/50 line-clamp-2 mb-3">{toy.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs text-amber-400/50">{toy.period}</span>
                    <div className="flex items-center gap-1.5">
                      {hasPlayed && <CheckCircle2 size={12} className="text-green-400" />}
                      <span className="font-display text-xs tracking-wide uppercase text-amber-400/70 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        <Eye size={12} /> Inspect
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toy Viewer Modal */}
      {viewingToy && !playingToy && (
        <ToyViewer
          toy={viewingToy}
          onClose={() => setViewingToy(null)}
          onPlay={() => { setPlayingToy(viewingToy); }}
          isDiscovered={collection.state.discovered.includes(viewingToy.id)}
          hasPlayed={collection.state.played.includes(viewingToy.id)}
        />
      )}

      {/* Toy Mini-Game Modal */}
      {playingToy && (
        <ToyMiniGame
          toy={playingToy}
          onComplete={(score) => {
            collection.markPlayed(playingToy.id, playingToy.xpReward);
            collection.addBadge(playingToy.badge);
          }}
          onClose={() => { setPlayingToy(null); setViewingToy(null); }}
        />
      )}
    </section>
  );
}

// Small model preview for cards
function ToyCardModel({ toyId }: { toyId: string }) {
  const terracotta = '#B85C38';
  const terracottaLight = '#D4805A';
  const terracottaDark = '#8B4226';

  switch (toyId) {
    case 'toy-cart':
      return (
        <svg width="120" height="90" viewBox="0 0 120 90">
          <rect x="30" y="40" width="60" height="22" rx="3" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="40" cy="68" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="40" cy="68" r="4" fill={terracotta} />
          <circle cx="80" cy="68" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" />
          <circle cx="80" cy="68" r="4" fill={terracotta} />
        </svg>
      );
    case 'movable-head-bull':
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          <ellipse cx="50" cy="55" rx="25" ry="16" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <ellipse cx="72" cy="35" rx="13" ry="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" />
          <path d="M 66 28 Q 63 20 60 18" fill="none" stroke={terracottaDark} strokeWidth="1.5" />
          <path d="M 78 28 Q 81 20 84 18" fill="none" stroke={terracottaDark} strokeWidth="1.5" />
        </svg>
      );
    case 'wheeled-animal':
      return (
        <svg width="100" height="80" viewBox="0 0 100 80">
          <ellipse cx="45" cy="45" rx="25" ry="14" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <ellipse cx="68" cy="35" rx="11" ry="9" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="30" cy="65" r="8" fill={terracottaDark} />
          <circle cx="65" cy="65" r="8" fill={terracottaDark} />
        </svg>
      );
    case 'bird-whistle':
      return (
        <svg width="90" height="90" viewBox="0 0 90 90">
          <ellipse cx="40" cy="45" rx="20" ry="16" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="60" cy="33" r="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" />
          <path d="M 70 31 L 78 30 L 70 34 Z" fill="#D4A017" />
        </svg>
      );
    case 'ancient-rattle':
      return (
        <svg width="70" height="90" viewBox="0 0 70 90">
          <rect x="32" y="52" width="6" height="28" rx="2" fill={terracottaDark} />
          <ellipse cx="35" cy="35" rx="18" ry="20" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
        </svg>
      );
    case 'spinning-top':
      return (
        <svg width="70" height="90" viewBox="0 0 70 90">
          <path d="M 35 15 L 52 38 Q 55 55 35 75 Q 15 55 18 38 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
        </svg>
      );
    case 'ancient-marbles':
      return (
        <svg width="90" height="70" viewBox="0 0 90 70">
          <circle cx="22" cy="50" r="8" fill={terracotta} stroke={terracottaDark} strokeWidth="0.8" />
          <circle cx="45" cy="52" r="6" fill={terracottaLight} stroke={terracottaDark} strokeWidth="0.8" />
          <circle cx="65" cy="48" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="0.8" />
        </svg>
      );
    case 'wheeled-bird':
      return (
        <svg width="100" height="80" viewBox="0 0 100 80">
          <ellipse cx="40" cy="40" rx="22" ry="14" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <circle cx="62" cy="30" r="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" />
          <path d="M 72 28 L 80 27 L 72 31 Z" fill="#D4A017" />
          <circle cx="30" cy="60" r="8" fill={terracottaDark} />
          <circle cx="58" cy="60" r="8" fill={terracottaDark} />
        </svg>
      );
    case 'rope-monkey':
      return (
        <svg width="110" height="90" viewBox="0 0 110 90">
          <path d="M 8 20 Q 55 12 102 20" fill="none" stroke="#D4A017" strokeWidth="1.5" />
          <ellipse cx="55" cy="38" rx="14" ry="17" fill={terracottaDark} stroke="#6B3422" strokeWidth="1" />
          <circle cx="55" cy="24" r="10" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
        </svg>
      );
    case 'toy-boat':
      return (
        <svg width="110" height="75" viewBox="0 0 110 75">
          <path d="M 0 55 Q 28 50 55 55 Q 82 60 110 55 L 110 75 L 0 75 Z" fill="#1A5276" opacity="0.3" />
          <path d="M 20 40 L 24 55 Q 55 60 86 55 L 90 40 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1" />
          <line x1="55" y1="40" x2="55" y2="10" stroke={terracottaDark} strokeWidth="1.5" />
          <path d="M 55 12 L 75 30 L 55 33 Z" fill={terracottaLight} stroke={terracottaDark} strokeWidth="0.8" opacity="0.7" />
        </svg>
      );
    default:
      return <div className="text-amber-400/20 font-display text-xs">3D Model</div>;
  }
}
