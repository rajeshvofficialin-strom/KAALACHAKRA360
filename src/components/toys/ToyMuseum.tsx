import { useState } from 'react';
import { ChevronRight, X, Eye, Play, MapPin, Clock, Layers, CheckCircle2, AlertTriangle, Wrench, Info, FlaskConical, ArrowRight } from 'lucide-react';
import { ANCIENT_TOYS, MUSEUM_ZONES, EVIDENCE_LABELS, type AncientToy } from '@/data/toyData';
import { useToyCollection } from './useToyCollection';
import ToyViewer from './ToyViewer';
import ToyMiniGame from './ToyMiniGame';

const EVIDENCE_ICONS: Record<string, typeof CheckCircle2> = {
  CheckCircle2, AlertTriangle, Wrench, Info,
};

export default function ToyMuseum() {
  const [activeZone, setActiveZone] = useState<number>(1);
  const [viewingToy, setViewingToy] = useState<AncientToy | null>(null);
  const [playingToy, setPlayingToy] = useState<AncientToy | null>(null);
  const collection = useToyCollection();

  const zoneToys = ANCIENT_TOYS.filter((t) => t.zone === activeZone);
  const currentZone = MUSEUM_ZONES.find((z) => z.id === activeZone);

  return (
    <section id="toy-museum" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#151228] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">प्राचीन खिलौना संग्रहालय</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Ancient Toys Museum
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Walk through seven museum zones dedicated to ancient Indian toys. Inspect 3D models,
            read historical context, and play with each exhibit.
          </p>
        </div>

        <div className="section-divider mb-12" />

        {/* Zone navigation — museum floor plan */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
          {MUSEUM_ZONES.map((zone) => {
            const zoneToyCount = ANCIENT_TOYS.filter((t) => t.zone === zone.id).length;
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id)}
                className={`heritage-card rounded-xl p-4 text-center transition-all duration-300 ${isActive ? 'ring-2 ring-amber-400 glow-gold scale-105' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-display text-sm font-bold ${isActive ? 'bg-amber-600 text-amber-950' : 'bg-amber-950/40 text-amber-400/60 border border-amber-700/30'}`}>
                  {zone.id}
                </div>
                <h4 className="font-display text-xs font-semibold text-amber-200 leading-tight">{zone.name}</h4>
                {zone.id === 7 && <FlaskConical size={12} className="text-blue-400/60 mx-auto mt-1" />}
                {zoneToyCount > 0 && <p className="font-body text-xs text-amber-100/40 mt-1">{zoneToyCount} exhibits</p>}
              </button>
            );
          })}
        </div>

        {/* Active zone content */}
        {currentZone && (
          <div className="scale-in">
            {/* Zone banner */}
            <div className="heritage-card rounded-2xl p-6 mb-8">
              <p className="font-sanskrit text-amber-300/50 text-sm mb-1">{currentZone.sanskritName}</p>
              <h3 className="font-display text-2xl font-bold text-amber-100 mb-2">{currentZone.name}</h3>
              <p className="font-body text-sm text-amber-100/60 leading-relaxed">{currentZone.description}</p>
            </div>

            {/* Zone exhibits */}
            {zoneToys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zoneToys.map((toy) => {
                  const evidence = EVIDENCE_LABELS[toy.evidenceLevel];
                  const EvidenceIcon = EVIDENCE_ICONS[evidence.icon];
                  const isDiscovered = collection.state.discovered.includes(toy.id);
                  const hasPlayed = collection.state.played.includes(toy.id);
                  return (
                    <div
                      key={toy.id}
                      className="heritage-card rounded-xl overflow-hidden group cursor-pointer"
                      onClick={() => { collection.discover(toy.id); setViewingToy(toy); }}
                    >
                      {/* Exhibit display area with museum lighting effect */}
                      <div className="relative h-40 overflow-hidden flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center top, rgba(244,196,48,0.08) 0%, transparent 60%), linear-gradient(180deg, #1A1410 0%, #0A0E27 100%)' }}>
                        {/* Spotlight effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-400/5 blur-2xl" />
                        {/* Dust particles */}
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="absolute w-1 h-1 rounded-full bg-amber-400/15" style={{ left: `${25 + i * 20}%`, top: `${20 + (i % 2) * 30}%`, animation: `float ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }} />
                        ))}
                        <div className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                          <ExhibitModel toyId={toy.id} />
                        </div>
                        {/* Evidence badge */}
                        <div className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display border ${evidence.color}`}>
                          <EvidenceIcon size={10} />
                          {evidence.label.split(' ')[0]}
                        </div>
                        {hasPlayed && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-900/60 border border-green-600/40 flex items-center justify-center">
                            <CheckCircle2 size={10} className="text-green-400" />
                          </div>
                        )}
                        {/* Museum pedestal base */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-stone-800/40 to-stone-900/60 border-t border-amber-800/20" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-base font-bold text-amber-100 mb-1">{toy.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-amber-100/40 mb-2">
                          <MapPin size={10} /><span className="font-body">{toy.site}</span>
                          <span className="text-amber-700/50">|</span>
                          <Clock size={10} /><span className="font-body">{toy.period.split('(')[0].trim()}</span>
                        </div>
                        <p className="font-body text-sm text-amber-100/50 line-clamp-2 mb-3">{toy.description}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={(e) => { e.stopPropagation(); collection.discover(toy.id); setViewingToy(toy); }}
                            className="flex items-center gap-1 font-display text-xs tracking-wide uppercase text-amber-400/70 hover:text-amber-300"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); collection.discover(toy.id); setPlayingToy(toy); }}
                            className="flex items-center gap-1 font-display text-xs tracking-wide uppercase text-green-400/70 hover:text-green-300"
                          >
                            <Play size={12} /> Play
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Zone 7 — Digital Reconstruction Lab
              <div className="heritage-card rounded-2xl p-8 text-center">
                <FlaskConical size={48} className="text-blue-400/40 mx-auto mb-4" />
                <h4 className="font-display text-xl text-amber-200 mb-2">Digital Reconstruction Lab</h4>
                <p className="font-body text-sm text-amber-100/60 max-w-2xl mx-auto mb-6">
                  This is where broken fragments are digitally reassembled and uncertain objects are
                  carefully reconstructed. Every reconstruction is clearly labeled as such — we never
                  imply that a digital reconstruction is the exact original appearance when evidence is incomplete.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-950/30 border border-blue-700/30 font-display text-xs text-blue-300/70">Fragment Analysis</span>
                  <ArrowRight size={14} className="text-amber-700/40" />
                  <span className="px-3 py-1.5 rounded-lg bg-blue-950/30 border border-blue-700/30 font-display text-xs text-blue-300/70">Piece Matching</span>
                  <ArrowRight size={14} className="text-amber-700/40" />
                  <span className="px-3 py-1.5 rounded-lg bg-blue-950/30 border border-blue-700/30 font-display text-xs text-blue-300/70">Digital Assembly</span>
                  <ArrowRight size={14} className="text-amber-700/40" />
                  <span className="px-3 py-1.5 rounded-lg bg-green-950/30 border border-green-700/30 font-display text-xs text-green-300/70">Restoration Complete</span>
                </div>
                <p className="font-body text-xs text-amber-200/40 italic mt-4">
                  Visit the Toy Restoration Lab to try restoring broken toys yourself.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingToy && !playingToy && (
        <ToyViewer toy={viewingToy} onClose={() => setViewingToy(null)} onPlay={() => setPlayingToy(viewingToy)} isDiscovered={collection.state.discovered.includes(viewingToy.id)} hasPlayed={collection.state.played.includes(viewingToy.id)} />
      )}
      {playingToy && (
        <ToyMiniGame toy={playingToy} onComplete={(score) => { collection.markPlayed(playingToy.id, playingToy.xpReward); collection.addBadge(playingToy.badge); }} onClose={() => { setPlayingToy(null); setViewingToy(null); }} />
      )}
    </section>
  );
}

function ExhibitModel({ toyId }: { toyId: string }) {
  // Reuse the same SVG models from AncientToys ToyCardModel
  const terracotta = '#B85C38';
  const terracottaLight = '#D4805A';
  const terracottaDark = '#8B4226';
  const models: Record<string, React.ReactElement> = {
    'toy-cart': <svg width="120" height="90" viewBox="0 0 120 90"><rect x="30" y="40" width="60" height="22" rx="3" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><circle cx="40" cy="68" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" /><circle cx="40" cy="68" r="4" fill={terracotta} /><circle cx="80" cy="68" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="1.5" /><circle cx="80" cy="68" r="4" fill={terracotta} /></svg>,
    'movable-head-bull': <svg width="100" height="90" viewBox="0 0 100 90"><ellipse cx="50" cy="55" rx="25" ry="16" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><ellipse cx="72" cy="35" rx="13" ry="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" /><path d="M 66 28 Q 63 20 60 18" fill="none" stroke={terracottaDark} strokeWidth="1.5" /><path d="M 78 28 Q 81 20 84 18" fill="none" stroke={terracottaDark} strokeWidth="1.5" /></svg>,
    'wheeled-animal': <svg width="100" height="80" viewBox="0 0 100 80"><ellipse cx="45" cy="45" rx="25" ry="14" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><ellipse cx="68" cy="35" rx="11" ry="9" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" /><circle cx="30" cy="65" r="8" fill={terracottaDark} /><circle cx="65" cy="65" r="8" fill={terracottaDark} /></svg>,
    'bird-whistle': <svg width="90" height="90" viewBox="0 0 90 90"><ellipse cx="40" cy="45" rx="20" ry="16" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><circle cx="60" cy="33" r="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" /><path d="M 70 31 L 78 30 L 70 34 Z" fill="#D4A017" /></svg>,
    'ancient-rattle': <svg width="70" height="90" viewBox="0 0 70 90"><rect x="32" y="52" width="6" height="28" rx="2" fill={terracottaDark} /><ellipse cx="35" cy="35" rx="18" ry="20" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /></svg>,
    'spinning-top': <svg width="70" height="90" viewBox="0 0 70 90"><path d="M 35 15 L 52 38 Q 55 55 35 75 Q 15 55 18 38 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /></svg>,
    'ancient-marbles': <svg width="90" height="70" viewBox="0 0 90 70"><circle cx="22" cy="50" r="8" fill={terracotta} stroke={terracottaDark} strokeWidth="0.8" /><circle cx="45" cy="52" r="6" fill={terracottaLight} stroke={terracottaDark} strokeWidth="0.8" /><circle cx="65" cy="48" r="10" fill={terracottaDark} stroke="#6B3422" strokeWidth="0.8" /></svg>,
    'wheeled-bird': <svg width="100" height="80" viewBox="0 0 100 80"><ellipse cx="40" cy="40" rx="22" ry="14" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><circle cx="62" cy="30" r="10" fill={terracottaLight} stroke={terracottaDark} strokeWidth="1" /><path d="M 72 28 L 80 27 L 72 31 Z" fill="#D4A017" /><circle cx="30" cy="60" r="8" fill={terracottaDark} /><circle cx="58" cy="60" r="8" fill={terracottaDark} /></svg>,
    'rope-monkey': <svg width="110" height="90" viewBox="0 0 110 90"><path d="M 8 20 Q 55 12 102 20" fill="none" stroke="#D4A017" strokeWidth="1.5" /><ellipse cx="55" cy="38" rx="14" ry="17" fill={terracottaDark} stroke="#6B3422" strokeWidth="1" /><circle cx="55" cy="24" r="10" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /></svg>,
    'toy-boat': <svg width="110" height="75" viewBox="0 0 110 75"><path d="M 0 55 Q 28 50 55 55 Q 82 60 110 55 L 110 75 L 0 75 Z" fill="#1A5276" opacity="0.3" /><path d="M 20 40 L 24 55 Q 55 60 86 55 L 90 40 Z" fill={terracotta} stroke={terracottaDark} strokeWidth="1" /><line x1="55" y1="40" x2="55" y2="10" stroke={terracottaDark} strokeWidth="1.5" /><path d="M 55 12 L 75 30 L 55 33 Z" fill={terracottaLight} stroke={terracottaDark} strokeWidth="0.8" opacity="0.7" /></svg>,
  };
  return models[toyId] ?? <div className="text-amber-400/20 font-display text-xs">3D Model</div>;
}
