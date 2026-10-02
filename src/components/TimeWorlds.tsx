import { useState } from 'react';
import { ChevronRight, Info, Sparkles } from 'lucide-react';
import { TIME_WORLDS, type TimeWorld } from '@/data/gameData';
import KaalachakraWheel from './KaalachakraWheel';

interface TimeWorldsProps {
  onWorldSelect: (worldId: string) => void;
}

export default function TimeWorlds({ onWorldSelect }: TimeWorldsProps) {
  const [selectedWorld, setSelectedWorld] = useState<TimeWorld | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleSelect = (world: TimeWorld) => {
    setSelectedWorld(world);
  };

  const handleActivate = () => {
    if (!selectedWorld) return;
    setTransitioning(true);
    setTimeout(() => {
      onWorldSelect(selectedWorld.id);
      setTransitioning(false);
    }, 2500);
  };

  return (
    <section id="time-worlds" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#0D1029] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">कालचक्र लोक</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            The Seven Time Worlds
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Rotate the Kaalachakra to traverse through time. Each world transforms the
            environment — architecture, atmosphere, and challenges shift as you travel
            across millennia of Indian heritage.
          </p>
        </div>

        <div className="section-divider mb-16" />

        {/* World selection grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {TIME_WORLDS.map((world, idx) => (
            <button
              key={world.id}
              onClick={() => handleSelect(world)}
              className={`heritage-card rounded-xl overflow-hidden text-left group cursor-pointer transition-all duration-500 ${
                selectedWorld?.id === world.id
                  ? 'ring-2 ring-amber-400 glow-gold scale-105'
                  : ''
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={world.image}
                  alt={world.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent" />
                <div
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{ background: `linear-gradient(135deg, ${world.color}, transparent)` }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-sanskrit text-amber-200/70 text-sm mb-1">{world.sanskritName}</p>
                  <h3 className="font-display text-lg font-bold text-amber-100 leading-tight">
                    {world.name}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#0A0E27]/80 border border-amber-700/30">
                  <span className="font-display text-xs text-amber-300/80">{world.era}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-body text-sm text-amber-100/60 line-clamp-2">{world.description}</p>
                <div className="mt-3 flex items-center gap-2 text-amber-400/70 group-hover:text-amber-300 transition-colors">
                  <span className="font-display text-xs tracking-wide uppercase">Explore</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected world detail */}
        {selectedWorld && (
          <div className="scale-in heritage-card rounded-2xl overflow-hidden border border-amber-700/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image side */}
              <div className="relative h-64 lg:h-auto min-h-[400px]">
                <img
                  src={selectedWorld.image}
                  alt={selectedWorld.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-transparent to-transparent" />
                <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{ background: `linear-gradient(135deg, ${selectedWorld.color}, transparent)` }}
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-sanskrit text-2xl text-amber-200/80 mb-2">{selectedWorld.sanskritName}</p>
                  <h3 className="font-display text-3xl font-bold text-amber-100 mb-1">{selectedWorld.name}</h3>
                  <p className="font-display text-sm text-amber-400/70 tracking-wide">{selectedWorld.era}</p>
                </div>
              </div>

              {/* Content side */}
              <div className="p-6 sm:p-8 flex flex-col">
                <p className="font-body text-base text-amber-100/70 leading-relaxed mb-6">
                  {selectedWorld.longDescription}
                </p>

                <div className="mb-6">
                  <h4 className="font-display text-sm tracking-widest text-amber-400/60 uppercase mb-3">
                    Key Features
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedWorld.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-800/20"
                      >
                        <Sparkles size={12} className="text-amber-400/60 flex-shrink-0" />
                        <span className="font-body text-sm text-amber-100/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/20 border border-amber-800/20 mb-6">
                  <Info size={16} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-amber-200/50 italic leading-relaxed">
                    {selectedWorld.mythologicalNote}
                  </p>
                </div>

                <button
                  onClick={handleActivate}
                  disabled={transitioning}
                  className="btn-kaalachakra px-8 py-4 rounded-lg flex items-center justify-center gap-3 mt-auto"
                >
                  {transitioning ? (
                    <>
                      <KaalachakraWheel size={24} active />
                      <span>Traversing Time...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate Time Travel</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time transition overlay */}
      {transitioning && (
        <div className="time-transition-overlay flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <KaalachakraWheel size={120} active />
            </div>
            <p className="font-sanskrit text-2xl text-amber-300 mb-2">कालचक्र परिवर्तन</p>
            <p className="font-display text-lg text-amber-200/70 tracking-widest">TIME TRANSITION</p>
          </div>
        </div>
      )}
    </section>
  );
}
