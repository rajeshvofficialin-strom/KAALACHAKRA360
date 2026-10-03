import { useState } from 'react';
import { ChevronRight, Users, MapPin, BookOpen, Play, X, Info } from 'lucide-react';
import { FEATURED_GAMES, type TraditionalGame } from '@/data/gameData';
import PallanguzhiGame from './games/PallanguzhiGame';
import AaduPuliGame from './games/AaduPuliGame';
import AncientGames from './games/AncientGames';

export default function TraditionalGames() {
  const [selectedGame, setSelectedGame] = useState<TraditionalGame | null>(null);

  return (
    <section id="traditional-games" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#0D1A0D] to-[#0A0E27]" />
        <img
          src="https://images.pexels.com/photos/17264037/pexels-photo-17264037.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">पारंपरिक क्रीड़ा</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            Traditional Games Heritage
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            Play and preserve India's ancient games — each carrying centuries of cultural
            wisdom, strategy, and mathematical thinking. Two games are fully playable
            right here in your browser.
          </p>
        </div>

        <div className="section-divider mb-16" />

        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_GAMES.map((game, idx) => (
            <div
              key={game.id}
              className="heritage-card rounded-xl overflow-hidden group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent" />
                {game.playable && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-900/60 border border-green-600/40 backdrop-blur-sm">
                    <Play size={10} className="text-green-400" />
                    <span className="font-display text-xs text-green-300 tracking-wide">PLAYABLE</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xl font-bold text-amber-100 leading-tight">
                    {game.name}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-300/60">
                    <MapPin size={12} />
                    <span className="font-body">{game.origin}</span>
                  </div>
                </div>
                <p className="font-body text-sm text-amber-100/60 line-clamp-3 mb-4">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-100/40">
                    <Users size={12} />
                    <span className="font-body text-xs">{game.players}</span>
                  </div>
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="flex items-center gap-1.5 font-display text-xs tracking-wide uppercase text-amber-400/70 hover:text-amber-300 transition-colors"
                  >
                    {game.playable ? 'Play Now' : 'Learn'}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AncientGames />
      </div>

      {/* Game detail / play modal */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0E27]/95 backdrop-blur-md flex items-center justify-center p-4 fade-in"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="heritage-card rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-2xl">
              <img src={selectedGame.image} alt={selectedGame.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/50 to-transparent" />
              <button
                onClick={() => setSelectedGame(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0A0E27]/80 border border-amber-700/40 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1.5 text-amber-300/70">
                    <MapPin size={14} />
                    <span className="font-display text-sm">{selectedGame.origin}</span>
                  </div>
                  <span className="text-amber-700/50">|</span>
                  <div className="flex items-center gap-1.5 text-amber-300/70">
                    <Users size={14} />
                    <span className="font-display text-sm">{selectedGame.players}</span>
                  </div>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-amber-100">
                  {selectedGame.name}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="font-body text-base text-amber-100/70 leading-relaxed mb-6">
                {selectedGame.description}
              </p>

              {/* Playable game */}
              {selectedGame.playable && selectedGame.id === 'pallanguzhi' && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Play size={18} className="text-amber-400" />
                    <h4 className="font-display text-lg font-semibold text-amber-200">
                      Play Pallanguzhi
                    </h4>
                  </div>
                  <PallanguzhiGame />
                </div>
              )}

              {selectedGame.playable && selectedGame.id === 'aadu-puli' && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Play size={18} className="text-amber-400" />
                    <h4 className="font-display text-lg font-semibold text-amber-200">
                      Play Aadu Puli Aattam
                    </h4>
                  </div>
                  <AaduPuliGame />
                </div>
              )}

              {/* Rules */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-amber-400/70" />
                  <h4 className="font-display text-lg font-semibold text-amber-200">
                    How to Play
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedGame.rules.map((rule, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-800/20"
                    >
                      <span className="font-display text-sm text-amber-400/60 flex-shrink-0 w-6">
                        {i + 1}.
                      </span>
                      <span className="font-body text-sm text-amber-100/70 leading-relaxed">
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural note */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/20 border border-amber-800/20">
                <Info size={16} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-amber-200/50 italic leading-relaxed">
                  This game represents a living cultural tradition. The digital version is
                  simplified for browser play. Learning and sharing these games helps preserve
                  India's cultural heritage for future generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
