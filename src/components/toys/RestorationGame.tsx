import { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Play, Check, X, Eye, Wrench, Info, ArrowRight } from 'lucide-react';
import { RESTORATION_TOYS } from '@/data/toyData';
import { useToyCollection } from './useToyCollection';

interface Fragment {
  id: number;
  x: number;
  y: number;
  rotation: number;
  placed: boolean;
  correctX: number;
  correctY: number;
  correctRotation: number;
}

function generateFragments(count: number): Fragment[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return {
      id: i,
      x: 10 + Math.random() * 25,
      y: 60 + Math.random() * 30,
      rotation: Math.floor(Math.random() * 360),
      placed: false,
      correctX: 50 + Math.cos(angle) * 15,
      correctY: 35 + Math.sin(angle) * 15,
      correctRotation: 0,
    };
  });
}

export default function RestorationGame() {
  const [restorationToy, setRestorationToy] = useState<typeof RESTORATION_TOYS[0] | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Select a broken toy to restore.');
  const [gameOver, setGameOver] = useState(false);
  const [stage, setStage] = useState<'select' | 'inspect' | 'assemble' | 'complete'>('select');
  const collection = useToyCollection();

  const startRestoration = (toy: typeof RESTORATION_TOYS[0]) => {
    setRestorationToy(toy);
    setFragments(generateFragments(toy.pieces));
    setScore(0);
    setSelected(null);
    setGameOver(false);
    setStage('inspect');
    setMessage(`Inspecting ${toy.name}. Examine the ${toy.pieces} fragments.`);
  };

  const handleFragmentClick = (id: number) => {
    if (stage !== 'assemble') return;
    setSelected(id);
  };

  const handleTargetClick = () => {
    if (selected === null || stage !== 'assemble') return;
    const frag = fragments[selected];
    // Check if close enough to correct position
    const dist = Math.hypot(frag.x - frag.correctX, frag.y - frag.correctY);
    const rotDiff = Math.abs(((frag.rotation % 360) + 360) % 360);

    if (dist < 12) {
      // Place the fragment
      setFragments((prev) => prev.map((f) => f.id === selected ? { ...f, placed: true, x: f.correctX, y: f.correctY, rotation: 0 } : f));
      setScore((s) => s + 20);
      setMessage(`Fragment ${selected + 1} placed correctly! +20 points`);
      setSelected(null);

      // Check if all placed
      const allPlaced = fragments.every((f) => f.placed || f.id === selected);
      if (allPlaced) {
        setStage('complete');
        setGameOver(true);
        setMessage(`Restoration complete! ${restorationToy?.name} restored. Score: ${score + 20}`);
        if (restorationToy) {
          collection.markRestored(restorationToy.id, 100);
          collection.addBadge('Restoration Expert');
        }
      }
    } else {
      setMessage(`Fragment ${selected + 1} not in the right position. Try again.`);
    }
  };

  const rotateSelected = () => {
    if (selected === null) return;
    setFragments((prev) => prev.map((f) => f.id === selected ? { ...f, rotation: (f.rotation + 45) % 360 } : f));
  };

  const moveSelected = (dx: number, dy: number) => {
    if (selected === null) return;
    setFragments((prev) => prev.map((f) => f.id === selected ? { ...f, x: Math.max(2, Math.min(48, f.x + dx)), y: Math.max(2, Math.min(88, f.y + dy)) } : f));
  };

  const reset = () => {
    setRestorationToy(null);
    setFragments([]);
    setSelected(null);
    setScore(0);
    setGameOver(false);
    setStage('select');
    setMessage('Select a broken toy to restore.');
  };

  const placedCount = fragments.filter((f) => f.placed).length;

  return (
    <section id="toy-restoration" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#0D0F1A] to-[#0A0E27]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">खिलौना पुनर्स्थापन</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Toy Restoration Lab
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Receive a broken archaeological-style toy and restore it. Inspect fragments, identify
            matching pieces, rotate and assemble them, then compare with the original appearance.
          </p>
        </div>

        <div className="section-divider mb-12" />

        {/* Restoration stages */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {[
            { id: 'select', name: 'Select Toy' },
            { id: 'inspect', name: 'Inspect Fragments' },
            { id: 'assemble', name: 'Assemble' },
            { id: 'complete', name: 'Compare & Preserve' },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg font-display text-xs tracking-wide border ${stage === s.id ? 'bg-amber-900/40 border-amber-500/50 text-amber-300' : 'bg-stone-900/20 border-stone-700/20 text-stone-500/40'}`}>{s.name}</span>
              {i < 3 && <ArrowRight size={14} className="text-amber-700/30" />}
            </div>
          ))}
        </div>

        {/* Stage: Select toy */}
        {stage === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESTORATION_TOYS.map((toy) => (
              <div key={toy.id} className="heritage-card rounded-xl p-5 cursor-pointer hover:glow-gold transition-all" onClick={() => startRestoration(toy)}>
                <div className="flex items-start justify-between mb-3">
                  <Wrench size={20} className="text-amber-400/60" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-display border ${toy.difficulty === 'Explorer' ? 'text-green-400 border-green-700/40' : toy.difficulty === 'Adventurer' ? 'text-amber-400 border-amber-700/40' : 'text-red-400 border-red-700/40'}`}>{toy.difficulty}</span>
                </div>
                <h4 className="font-display text-base text-amber-200 mb-1">{toy.name}</h4>
                <p className="font-body text-sm text-amber-100/40 mb-3">{toy.pieces} fragments to reassemble</p>
                <button className="flex items-center gap-1 font-display text-xs tracking-wide uppercase text-amber-400/70">
                  <Play size={12} /> Start Restoration
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stage: Inspect / Assemble */}
        {(stage === 'inspect' || stage === 'assemble') && restorationToy && (
          <div className="heritage-card rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg text-amber-200">{restorationToy.name}</h3>
                <p className="font-body text-sm text-amber-100/40">{placedCount}/{fragments.length} fragments placed</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-amber-300">Score: {score}</span>
                <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-300 hover:bg-amber-900/20 font-display text-xs"><RotateCcw size={12} /> Reset</button>
              </div>
            </div>

            {/* Message */}
            <div className="text-center py-2 px-4 rounded-lg bg-stone-900/20 font-body text-sm text-amber-100/70 mb-4">{message}</div>

            {/* Assembly area */}
            <div className="relative w-full rounded-xl overflow-hidden border-2 border-amber-700/30 bg-gradient-to-b from-stone-900/40 to-[#0A0E27]" style={{ height: '350px' }} onClick={stage === 'assemble' ? handleTargetClick : undefined}>
              {/* Target outline (where fragments should go) */}
              {stage === 'assemble' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-dashed border-amber-600/30 flex items-center justify-center">
                  <span className="font-display text-xs text-amber-600/30">Assembly Target</span>
                </div>
              )}

              {/* Fragments */}
              {fragments.map((frag) => (
                <div
                  key={frag.id}
                  onClick={(e) => { e.stopPropagation(); if (stage === 'assemble') handleFragmentClick(frag.id); }}
                  className={`absolute w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                    frag.placed
                      ? 'bg-green-700/40 border-green-500/50'
                      : selected === frag.id
                      ? 'bg-amber-600/40 border-amber-400 glow-gold'
                      : 'bg-amber-900/40 border-amber-700/40'
                  }`}
                  style={{ left: `${frag.x}%`, top: `${frag.y}%`, transform: `rotate(${frag.rotation}deg)` }}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xs text-amber-200/60">{frag.id + 1}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            {stage === 'inspect' && (
              <button onClick={() => setStage('assemble')} className="btn-kaalachakra w-full py-3 rounded-lg font-display text-sm mt-4">
                Begin Assembly →
              </button>
            )}

            {stage === 'assemble' && selected !== null && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={rotateSelected} className="px-4 py-2 rounded-lg border border-amber-700/30 text-amber-300 hover:bg-amber-900/20 font-display text-sm">Rotate 45°</button>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveSelected(0, -3)} className="px-3 py-1 rounded-lg border border-amber-700/30 text-amber-300 text-xs">↑</button>
                  <div className="flex gap-1">
                    <button onClick={() => moveSelected(-3, 0)} className="px-3 py-1 rounded-lg border border-amber-700/30 text-amber-300 text-xs">←</button>
                    <button onClick={() => moveSelected(0, 3)} className="px-3 py-1 rounded-lg border border-amber-700/30 text-amber-300 text-xs">↓</button>
                    <button onClick={() => moveSelected(3, 0)} className="px-3 py-1 rounded-lg border border-amber-700/30 text-amber-300 text-xs">→</button>
                  </div>
                </div>
                <button onClick={handleTargetClick} className="btn-kaalachakra px-4 py-2 rounded-lg font-display text-sm">Place Fragment</button>
              </div>
            )}

            {stage === 'assemble' && selected === null && !gameOver && (
              <p className="font-body text-xs text-amber-100/40 text-center mt-4">
                Click a fragment to select it. Use controls to rotate and position, then click "Place Fragment" or the target area.
              </p>
            )}
          </div>
        )}

        {/* Stage: Complete */}
        {stage === 'complete' && restorationToy && (
          <div className="heritage-card rounded-2xl p-8 text-center">
            <Trophy size={48} className="text-amber-400 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-gold-gradient mb-2">Restoration Complete!</h3>
            <p className="font-body text-sm text-amber-100/60 mb-4">
              {restorationToy.name} has been digitally restored and added to the museum collection.
            </p>

            {/* Before / After comparison */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div>
                <h5 className="font-display text-xs text-amber-400/60 uppercase mb-2">Before (Fragments)</h5>
                <div className="aspect-square rounded-xl bg-stone-900/40 border border-amber-700/20 flex items-center justify-center">
                  <Wrench size={32} className="text-amber-700/30" />
                </div>
              </div>
              <div>
                <h5 className="font-display text-xs text-green-400/60 uppercase mb-2">After (Restored)</h5>
                <div className="aspect-square rounded-xl bg-green-950/20 border border-green-700/30 flex items-center justify-center">
                  <Check size={32} className="text-green-400/60" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="font-display text-sm text-amber-300">+100 Heritage XP</span>
              <span className="font-display text-sm text-amber-300">Restoration Expert Badge</span>
            </div>

            {/* Important disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/20 border border-amber-800/20 mb-6 text-left">
              <Info size={16} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs text-amber-200/50 italic leading-relaxed">
                This digital reconstruction is based on fragment assembly. When archaeological evidence
                is incomplete, the restored appearance should not be considered the exact original.
                Interpretation uncertain where noted.
              </p>
            </div>

            <button onClick={reset} className="btn-kaalachakra px-6 py-3 rounded-lg font-display text-sm">
              Restore Another Toy
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
