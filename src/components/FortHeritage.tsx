import { useState } from 'react';
import { Building2, KeyRound, Hammer, Crown, ChevronRight, MapPin, Clock, Info, X, Check, Lock } from 'lucide-react';
import { FORTS, MISSION_TYPE_INFO, type Fort, type FortMission } from '@/data/gameData';

const MISSION_ICONS: Record<string, typeof Building2> = {
  'lost-architecture': Building2,
  'secret-passage': KeyRound,
  'fort-restoration': Hammer,
  'royal-strategy': Crown,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Explorer: 'text-green-400 border-green-700/40 bg-green-950/20',
  Adventurer: 'text-amber-400 border-amber-700/40 bg-amber-950/20',
  Master: 'text-red-400 border-red-700/40 bg-red-950/20',
};

export default function FortHeritage() {
  const [selectedFort, setSelectedFort] = useState<Fort | null>(null);
  const [selectedMission, setSelectedMission] = useState<FortMission | null>(null);
  const [missionProgress, setMissionProgress] = useState<Record<string, number>>({});

  const handleMissionStart = (mission: FortMission) => {
    setSelectedMission(mission);
    setMissionProgress((prev) => ({ ...prev, [mission.id]: 0 }));
  };

  const handleObjectiveComplete = (index: number) => {
    if (!selectedMission) return;
    setMissionProgress((prev) => ({
      ...prev,
      [selectedMission.id]: Math.max(prev[selectedMission.id] ?? 0, index + 1),
    }));
  };

  return (
    <section id="fort-heritage" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#1A1510] to-[#0A0E27]" />
        <img
          src="https://images.pexels.com/photos/33797765/pexels-photo-33797765.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">दुर्ग विरासत</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Indian Fort Heritage
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Explore ten of India's most magnificent forts. Each citadel holds secret passages,
            architectural puzzles, restoration challenges, and strategic missions that bring
            centuries of history to life.
          </p>
        </div>

        <div className="section-divider mb-16" />

        {/* Mission type legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Object.entries(MISSION_TYPE_INFO).map(([key, info]) => {
            const Icon = MISSION_ICONS[key];
            return (
              <div
                key={key}
                className="heritage-card rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-amber-400/80" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-amber-200">{info.name}</h4>
                  <p className="font-body text-xs text-amber-100/50">{info.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fort grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORTS.map((fort, idx) => (
            <div
              key={fort.id}
              className="heritage-card rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setSelectedFort(fort)}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={fort.image}
                  alt={fort.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A0E27]/80 border border-amber-700/30">
                  <MapPin size={12} className="text-amber-400/70" />
                  <span className="font-display text-xs text-amber-200/80">{fort.region}</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A0E27]/80 border border-amber-700/30">
                  <Clock size={12} className="text-amber-400/70" />
                  <span className="font-display text-xs text-amber-200/80">{fort.era}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xl font-bold text-amber-100 leading-tight">
                    {fort.name}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="font-body text-sm text-amber-100/60 line-clamp-2 mb-3">{fort.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {fort.missions.map((m) => {
                      const Icon = MISSION_ICONS[m.type];
                      return (
                        <div
                          key={m.id}
                          className="w-7 h-7 rounded-md bg-amber-950/40 border border-amber-800/30 flex items-center justify-center"
                          title={MISSION_TYPE_INFO[m.type].name}
                        >
                          <Icon size={12} className="text-amber-400/60" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400/70 group-hover:text-amber-300 transition-colors">
                    <span className="font-display text-xs tracking-wide uppercase">Enter</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fort detail modal */}
      {selectedFort && !selectedMission && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0E27]/90 backdrop-blur-md flex items-center justify-center p-4 fade-in"
          onClick={() => setSelectedFort(null)}
        >
          <div
            className="heritage-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              <img src={selectedFort.image} alt={selectedFort.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent" />
              <button
                onClick={() => setSelectedFort(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0A0E27]/80 border border-amber-700/40 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={16} className="text-amber-400/70" />
                  <span className="font-display text-sm text-amber-300/80">{selectedFort.region}</span>
                  <span className="text-amber-700/50">|</span>
                  <Clock size={16} className="text-amber-400/70" />
                  <span className="font-display text-sm text-amber-300/80">{selectedFort.era}</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-amber-100">{selectedFort.name}</h3>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="font-body text-base text-amber-100/70 leading-relaxed mb-6">
                {selectedFort.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-display text-sm tracking-widest text-amber-400/60 uppercase mb-3">
                  Fort Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFort.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/30 font-body text-sm text-amber-100/60"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missions */}
              <div className="mb-6">
                <h4 className="font-display text-sm tracking-widest text-amber-400/60 uppercase mb-3">
                  Available Missions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedFort.missions.map((mission) => {
                    const Icon = MISSION_ICONS[mission.type];
                    const progress = missionProgress[mission.id] ?? 0;
                    const completed = progress >= mission.objectives.length;
                    return (
                      <button
                        key={mission.id}
                        onClick={() => handleMissionStart(mission)}
                        className="heritage-card rounded-xl p-4 text-left group cursor-pointer"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
                            <Icon size={18} className="text-amber-400/80" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-display text-base font-semibold text-amber-200 leading-tight mb-1">
                              {mission.title}
                            </h5>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-display border ${DIFFICULTY_COLORS[mission.difficulty]}`}
                            >
                              {mission.difficulty}
                            </span>
                          </div>
                          {completed && (
                            <div className="w-6 h-6 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center">
                              <Check size={12} className="text-green-400" />
                            </div>
                          )}
                        </div>
                        <p className="font-body text-sm text-amber-100/50 line-clamp-2 mb-3">
                          {mission.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {mission.objectives.map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i < progress ? 'bg-amber-400' : 'bg-amber-900/40'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-display text-xs text-amber-400/60 group-hover:text-amber-300 tracking-wide uppercase flex items-center gap-1">
                            {progress > 0 ? 'Continue' : 'Start'}
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Historical note */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/20 border border-amber-800/20">
                <Info size={16} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-amber-200/50 italic leading-relaxed">
                  {selectedFort.historicalNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission detail modal */}
      {selectedMission && selectedFort && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0E27]/95 backdrop-blur-md flex items-center justify-center p-4 fade-in"
          onClick={() => setSelectedMission(null)}
        >
          <div
            className="heritage-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-950/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const Icon = MISSION_ICONS[selectedMission.type];
                      return <Icon size={26} className="text-amber-400/80" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-display text-xs tracking-widest text-amber-400/60 uppercase mb-1">
                      {MISSION_TYPE_INFO[selectedMission.type].name} Mission
                    </p>
                    <h3 className="font-display text-2xl font-bold text-amber-100 mb-2">
                      {selectedMission.title}
                    </h3>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display border ${DIFFICULTY_COLORS[selectedMission.difficulty]}`}
                    >
                      {selectedMission.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="w-10 h-10 rounded-full bg-[#0A0E27]/80 border border-amber-700/40 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="font-body text-base text-amber-100/70 leading-relaxed mb-6">
                {selectedMission.description}
              </p>

              {/* Objectives */}
              <div className="mb-6">
                <h4 className="font-display text-sm tracking-widest text-amber-400/60 uppercase mb-4">
                  Mission Objectives
                </h4>
                <div className="space-y-3">
                  {selectedMission.objectives.map((obj, i) => {
                    const progress = missionProgress[selectedMission.id] ?? 0;
                    const isComplete = i < progress;
                    const isCurrent = i === progress;
                    const isLocked = i > progress;
                    return (
                      <button
                        key={i}
                        onClick={() => !isLocked && handleObjectiveComplete(i)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          isComplete
                            ? 'bg-green-950/20 border-green-700/30'
                            : isCurrent
                            ? 'bg-amber-950/20 border-amber-500/50 glow-gold cursor-pointer hover:bg-amber-900/20'
                            : 'bg-stone-950/40 border-stone-700/20 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isComplete
                              ? 'bg-green-700/30 border border-green-600/40'
                              : isCurrent
                              ? 'bg-amber-700/30 border border-amber-500/50'
                              : 'bg-stone-800/40 border border-stone-700/30'
                          }`}
                        >
                          {isComplete ? (
                            <Check size={16} className="text-green-400" />
                          ) : isLocked ? (
                            <Lock size={14} className="text-stone-500" />
                          ) : (
                            <span className="font-display text-sm text-amber-400">{i + 1}</span>
                          )}
                        </div>
                        <span
                          className={`font-body text-sm ${
                            isComplete
                              ? 'text-green-300/60 line-through'
                              : isCurrent
                              ? 'text-amber-100'
                              : 'text-stone-400/50'
                          }`}
                        >
                          {obj}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-xs tracking-wide text-amber-400/60 uppercase">
                    Mission Progress
                  </span>
                  <span className="font-display text-xs text-amber-300">
                    {missionProgress[selectedMission.id] ?? 0} / {selectedMission.objectives.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-800/40 overflow-hidden">
                  <div
                    className="h-full progress-bar-fill rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    style={{
                      width: `${((missionProgress[selectedMission.id] ?? 0) / selectedMission.objectives.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {(missionProgress[selectedMission.id] ?? 0) >= selectedMission.objectives.length && (
                <div className="mt-6 p-4 rounded-xl bg-green-950/20 border border-green-700/30 text-center fade-in-up">
                  <Check size={32} className="text-green-400 mx-auto mb-2" />
                  <h4 className="font-display text-lg text-green-300 mb-1">Mission Complete!</h4>
                  <p className="font-body text-sm text-amber-100/60">
                    You have successfully completed all objectives. Heritage knowledge unlocked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
