import { useState } from 'react';
import { Hammer, ChevronRight, Check, X, Sparkles, Flame, Package, Award } from 'lucide-react';
import { WORKSHOP_STEPS, ANCIENT_TOYS } from '@/data/toyData';
import { useToyCollection } from './useToyCollection';

const CLAY_TYPES = [
  { id: 'red', name: 'Red Terracotta', color: '#B85C38', desc: 'Classic Harappan clay' },
  { id: 'buff', name: 'Buff Clay', color: '#D4A874', desc: 'Lighter clay variant' },
  { id: 'grey', name: 'Grey Clay', color: '#8C8C8C', desc: 'Fine-grained clay' },
];

const SHAPES = ['Cart', 'Animal', 'Bird', 'Boat', 'Rattle'];
const PATTERNS = ['Plain', 'Lines', 'Dots', 'Waves', 'Crosshatch'];
const KILN_TEMPS = ['Low (600°C)', 'Medium (800°C)', 'High (1000°C)'];

export default function ToyWorkshop() {
  const [step, setStep] = useState(0);
  const [clay, setClay] = useState<string | null>(null);
  const [shape, setShape] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [wheels, setWheels] = useState<boolean>(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [fired, setFired] = useState(false);
  const [kilnTemp, setKilnTemp] = useState<number | null>(null);
  const [tested, setTested] = useState(false);
  const [preserved, setPreserved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const collection = useToyCollection();

  const reset = () => {
    setStep(0); setClay(null); setShape(null); setDetail(null);
    setWheels(false); setPattern(null); setFired(false);
    setKilnTemp(null); setTested(false); setPreserved(false); setShowResult(false);
  };

  const handlePreserve = () => {
    setPreserved(true);
    setShowResult(true);
    collection.addBadge('Toy Master');
    // Award XP for crafting
    collection.markCrafted('workshop-toy', 80);
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return clay !== null;
      case 1: return shape !== null;
      case 2: return detail !== null;
      case 3: return true; // wheels optional
      case 4: return pattern !== null;
      case 5: return kilnTemp !== null;
      case 6: return true; // test
      case 7: return true; // preserve
      default: return false;
    }
  };

  const advance = () => {
    if (step === 5) setFired(true);
    if (step === 6) setTested(true);
    setStep((s) => Math.min(s + 1, WORKSHOP_STEPS.length - 1));
  };

  const selectedClay = CLAY_TYPES.find((c) => c.id === clay);

  return (
    <section id="toy-workshop" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#1A1010] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-10" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">प्राचीन खिलौना कार्यशाला</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Ancient Toy Workshop
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Craft your own ancient-style toy from raw clay to finished product. Follow the
            traditional process: select clay, shape, detail, add wheels, paint, fire, test, and preserve.
          </p>
        </div>

        <div className="section-divider mb-12" />

        {/* Progress steps */}
        <div className="flex items-center justify-center flex-wrap gap-1 mb-10">
          {WORKSHOP_STEPS.map((ws, i) => (
            <div key={ws.id} className="flex items-center gap-1">
              <button
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`px-2.5 py-1.5 rounded-lg font-display text-xs tracking-wide border transition-all ${
                  i === step
                    ? 'bg-amber-900/40 border-amber-500/50 text-amber-300 glow-gold'
                    : i < step
                    ? 'bg-green-950/30 border-green-700/30 text-green-400/60'
                    : 'bg-stone-900/20 border-stone-700/20 text-stone-500/40 cursor-not-allowed'
                }`}
              >
                {i < step && <Check size={10} className="inline mr-1" />}
                {ws.name}
              </button>
              {i < WORKSHOP_STEPS.length - 1 && <ChevronRight size={12} className="text-amber-700/30" />}
            </div>
          ))}
        </div>

        {/* Current step content */}
        <div className="heritage-card rounded-2xl p-6 sm:p-8 mb-6">
          {/* Step 0: Select Clay */}
          {step === 0 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Select Clay</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Choose the right type of terracotta clay for your toy.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CLAY_TYPES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClay(c.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${clay === c.id ? 'border-amber-400 bg-amber-900/20 scale-105' : 'border-amber-800/20 bg-stone-900/20 hover:border-amber-700/40'}`}
                  >
                    <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ background: `radial-gradient(circle, ${c.color} 0%, ${c.color}dd 70%, ${c.color}aa 100%)` }} />
                    <h4 className="font-display text-sm text-amber-200">{c.name}</h4>
                    <p className="font-body text-xs text-amber-100/40 mt-1">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Shape */}
          {step === 1 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Shape the Toy</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Mold the clay into the basic form of your chosen toy.</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SHAPES.map((s) => (
                  <button key={s} onClick={() => setShape(s)} className={`p-3 rounded-xl border-2 transition-all ${shape === s ? 'border-amber-400 bg-amber-900/20' : 'border-amber-800/20 bg-stone-900/20 hover:border-amber-700/40'}`}>
                    <div className="w-12 h-12 rounded-full mx-auto mb-1" style={{ background: selectedClay ? `radial-gradient(circle, ${selectedClay.color} 0%, ${selectedClay.color}aa 100%)` : '#B85C38' }} />
                    <span className="font-display text-xs text-amber-200">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Detail */}
          {step === 2 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Add Details</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Carve fine details and features into the clay form.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Eyes', 'Ears/Horns', 'Wheels Marks', 'Surface Texture'].map((d) => (
                  <button key={d} onClick={() => setDetail(d)} className={`p-3 rounded-xl border-2 transition-all ${detail === d ? 'border-amber-400 bg-amber-900/20' : 'border-amber-800/20 bg-stone-900/20 hover:border-amber-700/40'}`}>
                    <Hammer size={20} className="text-amber-400/60 mx-auto mb-1" />
                    <span className="font-display text-xs text-amber-200">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Wheels */}
          {step === 3 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Add Wheels (Optional)</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Attach wheels or mechanical parts where needed. Skip if not applicable.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setWheels(true)} className={`px-6 py-3 rounded-xl border-2 transition-all ${wheels ? 'border-amber-400 bg-amber-900/20' : 'border-amber-800/20 bg-stone-900/20'}`}>
                  <span className="font-display text-sm text-amber-200">Add Wheels</span>
                </button>
                <button onClick={() => setWheels(false)} className={`px-6 py-3 rounded-xl border-2 transition-all ${!wheels ? 'border-amber-400 bg-amber-900/20' : 'border-amber-800/20 bg-stone-900/20'}`}>
                  <span className="font-display text-sm text-amber-200">No Wheels</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Paint */}
          {step === 4 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Paint Patterns</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Apply traditional decorative patterns with natural pigments.</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PATTERNS.map((p) => (
                  <button key={p} onClick={() => setPattern(p)} className={`p-3 rounded-xl border-2 transition-all ${pattern === p ? 'border-amber-400 bg-amber-900/20' : 'border-amber-800/20 bg-stone-900/20 hover:border-amber-700/40'}`}>
                    <span className="font-display text-xs text-amber-200">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Fire */}
          {step === 5 && (
            <div>
              <h3 className="font-display text-xl text-amber-200 mb-2">Fire in Kiln</h3>
              <p className="font-body text-sm text-amber-100/50 mb-4">Fire the clay in a kiln to harden it permanently.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {KILN_TEMPS.map((t, i) => (
                  <button key={t} onClick={() => setKilnTemp(i)} className={`p-4 rounded-xl border-2 transition-all text-center ${kilnTemp === i ? 'border-orange-400 bg-orange-900/20' : 'border-amber-800/20 bg-stone-900/20 hover:border-amber-700/40'}`}>
                    <Flame size={24} className={`mx-auto mb-2 ${i === 0 ? 'text-orange-600' : i === 1 ? 'text-orange-500' : 'text-orange-400'}`} />
                    <span className="font-display text-sm text-amber-200">{t}</span>
                  </button>
                ))}
              </div>
              {fired && <p className="text-center mt-4 font-display text-sm text-green-400">Clay fired successfully!</p>}
            </div>
          )}

          {/* Step 6: Test */}
          {step === 6 && (
            <div className="text-center">
              <h3 className="font-display text-xl text-amber-200 mb-2">Test the Toy</h3>
              <p className="font-body text-sm text-amber-100/50 mb-6">Test the finished toy to ensure it works properly.</p>
              <div className="inline-block p-8 rounded-2xl bg-gradient-to-b from-stone-900/40 to-amber-950/20 border-2 border-amber-700/30">
                <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: selectedClay ? `radial-gradient(circle, ${selectedClay.color} 0%, ${selectedClay.color}aa 100%)` : '#B85C38' }}>
                  {wheels && <div className="flex gap-1"><div className="w-4 h-4 rounded-full bg-amber-950/60" /><div className="w-4 h-4 rounded-full bg-amber-950/60" /></div>}
                </div>
                <p className="font-display text-sm text-amber-300">{shape} with {pattern} pattern</p>
                {tested && <p className="font-display text-sm text-green-400 mt-2">Test passed! Toy works perfectly.</p>}
              </div>
            </div>
          )}

          {/* Step 7: Preserve */}
          {step === 7 && !showResult && (
            <div className="text-center">
              <h3 className="font-display text-xl text-amber-200 mb-2">Preserve</h3>
              <p className="font-body text-sm text-amber-100/50 mb-6">Add the finished toy to the museum collection.</p>
              <button onClick={handlePreserve} className="btn-kaalachakra px-8 py-4 rounded-lg font-display text-sm flex items-center gap-2 mx-auto">
                <Package size={18} /> Add to Collection
              </button>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="text-center py-4">
              <Award size={48} className="text-amber-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-gold-gradient mb-2">Toy Crafted Successfully!</h3>
              <p className="font-body text-sm text-amber-100/60 mb-4">
                Your {shape} toy has been crafted and added to the museum collection.
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="font-display text-sm text-amber-300">+80 Heritage XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  <span className="font-display text-sm text-amber-300">Toy Master Badge</span>
                </div>
              </div>
              <button onClick={reset} className="btn-kaalachakra px-6 py-3 rounded-lg font-display text-sm">
                Craft Another Toy
              </button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {!showResult && step < 7 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg border border-amber-700/30 text-amber-300 hover:bg-amber-900/20 transition-colors font-display text-sm disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className="btn-kaalachakra px-6 py-2 rounded-lg font-display text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
