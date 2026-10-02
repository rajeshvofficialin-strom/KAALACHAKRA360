import { CheckCircle2, MapPin, Clock, Layers, Award, Sparkles, Lock } from 'lucide-react';
import { ANCIENT_TOYS, EVIDENCE_LABELS } from '@/data/toyData';
import { useToyCollection } from './useToyCollection';

export default function CollectionBook() {
  const collection = useToyCollection();

  return (
    <section id="collection-book" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#101218] to-[#0A0E27]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">संग्रह पुस्तिका</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Heritage Collection Book
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Your digital archive of discovered ancient toys. Track your collection progress,
            view archaeological details, and work toward becoming an Ancient Toys Heritage Master.
          </p>
        </div>

        <div className="section-divider mb-12" />

        {/* Collection summary */}
        <div className="heritage-card rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard icon={Sparkles} label="Discovered" value={`${collection.state.discovered.length}/10`} color="text-amber-300" />
            <StatCard icon={CheckCircle2} label="Played" value={`${collection.state.played.length}`} color="text-green-300" />
            <StatCard icon={Award} label="Badges" value={`${collection.state.badges.length}`} color="text-amber-400" />
            <StatCard icon={Sparkles} label="Heritage XP" value={`${collection.state.xp}`} color="text-amber-300" />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display text-xs text-amber-400/60 uppercase tracking-wide">Collection Progress</span>
            <span className="font-display text-sm text-amber-300">{collection.getProgress().toFixed(0)}%</span>
          </div>
          <div className="h-3 rounded-full bg-stone-800/40 overflow-hidden mb-4">
            <div className="h-full progress-bar-fill rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300" style={{ width: `${collection.getProgress()}%` }} />
          </div>

          {/* Individual progress dots */}
          <div className="flex items-center gap-2 flex-wrap">
            {ANCIENT_TOYS.map((toy) => {
              const isDiscovered = collection.state.discovered.includes(toy.id);
              return (
                <div
                  key={toy.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isDiscovered
                      ? 'bg-amber-700/40 border-amber-400/60 text-amber-200'
                      : 'bg-stone-900/40 border-stone-700/30 text-stone-600'
                  }`}
                  title={isDiscovered ? toy.name : 'Undiscovered'}
                >
                  {isDiscovered ? <CheckCircle2 size={14} /> : <Lock size={12} />}
                </div>
              );
            })}
          </div>

          {/* Master badge */}
          {collection.isComplete() ? (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-600/30 text-center">
              <Award size={32} className="text-amber-400 mx-auto mb-2" />
              <h4 className="font-display text-lg text-amber-200">Ancient Toys Heritage Master</h4>
              <p className="font-body text-sm text-amber-100/60">All 10 ancient toys discovered and collected!</p>
            </div>
          ) : (
            <p className="text-center mt-4 font-body text-sm text-amber-100/40">
              Discover all 10 ancient toys to unlock the "Ancient Toys Heritage Master" achievement.
            </p>
          )}
        </div>

        {/* Badge collection */}
        {collection.state.badges.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display text-lg text-amber-200 mb-4">Earned Badges</h3>
            <div className="flex flex-wrap gap-3">
              {collection.state.badges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/30 border border-amber-700/30">
                  <Award size={16} className="text-amber-400" />
                  <span className="font-display text-sm text-amber-200">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collection entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANCIENT_TOYS.map((toy) => {
            const isDiscovered = collection.state.discovered.includes(toy.id);
            const hasPlayed = collection.state.played.includes(toy.id);
            const evidence = EVIDENCE_LABELS[toy.evidenceLevel];
            return (
              <div
                key={toy.id}
                className={`heritage-card rounded-xl p-5 ${isDiscovered ? '' : 'opacity-50'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDiscovered ? 'bg-amber-900/40 border border-amber-700/30' : 'bg-stone-900/40 border border-stone-700/20'}`}>
                    {isDiscovered ? <CheckCircle2 size={20} className="text-amber-400" /> : <Lock size={18} className="text-stone-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display text-sm font-bold text-amber-100 truncate">{isDiscovered ? toy.name : '???'}</h4>
                      {hasPlayed && <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />}
                    </div>
                    <p className="font-sanskrit text-xs text-amber-300/40 mb-2">{isDiscovered ? toy.sanskritName : '?????'}</p>

                    {isDiscovered ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-100/50">
                          <MapPin size={10} /><span className="font-body">{toy.site}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-100/50">
                          <Clock size={10} /><span className="font-body">{toy.period}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-100/50">
                          <Layers size={10} /><span className="font-body">{toy.material}</span>
                        </div>
                        <div className="pt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-display border ${evidence.color}`}>
                            {evidence.label}
                          </span>
                        </div>
                        <p className="font-body text-xs text-amber-100/40 mt-2">{toy.preservationStatus}</p>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-amber-100/30">Discover this toy by inspecting it in the Ancient Toys section or Museum.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof MapPin; label: string; value: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-amber-950/20 border border-amber-800/20">
      <Icon size={18} className={`mx-auto mb-1 ${color}`} />
      <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
      <div className="font-display text-xs text-amber-100/40 uppercase tracking-wide">{label}</div>
    </div>
  );
}
