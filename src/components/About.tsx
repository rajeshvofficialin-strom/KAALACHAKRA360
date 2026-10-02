import { Shield, BookOpen, Castle, Gamepad2, Compass, Heart } from 'lucide-react';

const PILLARS = [
  {
    icon: Compass,
    title: 'Open-World Exploration',
    description: 'Traverse seven time worlds spanning from 7000 BCE to the present day, each with unique environments, architecture, and challenges.',
  },
  {
    icon: Castle,
    title: 'Fort Heritage',
    description: 'Explore ten iconic Indian forts inspired by real structures, each with architecture puzzles, secret passages, and restoration missions.',
  },
  {
    icon: BookOpen,
    title: 'Historical Discovery',
    description: 'Learn about India\'s dynasties, knowledge systems, and cultural achievements through interactive educational missions.',
  },
  {
    icon: Gamepad2,
    title: 'Traditional Games',
    description: 'Play and preserve ancient Indian games like Pallanguzhi and Aadu Puli Aattam that carry centuries of strategic wisdom.',
  },
  {
    icon: Shield,
    title: 'Heritage Preservation',
    description: 'Participate in restoration mini-games that teach the principles of heritage conservation and architectural preservation.',
  },
  {
    icon: Heart,
    title: 'Cultural Respect',
    description: 'Mythological content is clearly presented as cultural interpretation, not verified historical fact. Fictional elements are labeled.',
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#1A1A2E] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 fade-in-up">
          <p className="font-sanskrit text-amber-300/60 text-lg mb-2">परिचय</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
            About KAALACHAKRA360
          </h2>
          <p className="font-body text-lg text-amber-100/60 max-w-3xl mx-auto">
            An interactive heritage adventure that brings India's civilization to life through
            exploration, puzzles, strategy, and play — preserving the past for the future.
          </p>
        </div>

        <div className="section-divider mb-16" />

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="heritage-card rounded-xl p-6 slide-in-right"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-700/30 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-amber-400/80" />
                </div>
                <h3 className="font-display text-lg font-semibold text-amber-200 mb-2">
                  {pillar.title}
                </h3>
                <p className="font-body text-sm text-amber-100/60 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="heritage-card rounded-2xl p-6 sm:p-8 mb-8">
          <h3 className="font-display text-xl font-semibold text-amber-200 mb-4">
            Historical & Cultural Note
          </h3>
          <div className="space-y-3 text-amber-100/60 font-body text-sm leading-relaxed">
            <p>
              KAALACHAKRA360 is an interactive cultural and educational experience inspired by
              India's rich heritage. The game combines:
            </p>
            <ul className="list-none space-y-2 pl-0">
              <li className="flex items-start gap-2">
                <span className="text-amber-400/60 flex-shrink-0 mt-1">•</span>
                <span>
                  <strong className="text-amber-200">Historical content</strong> based on
                  documented archaeological sites, dynasties, and architectural traditions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400/60 flex-shrink-0 mt-1">•</span>
                <span>
                  <strong className="text-amber-200">Mythological content</strong> from the
                  Ramayana and Mahabharata, clearly presented as cultural interpretation and
                  fictional storytelling, not verified historical events.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400/60 flex-shrink-0 mt-1">•</span>
                <span>
                  <strong className="text-amber-200">Fictional gameplay elements</strong> that
                  are clearly labeled as such, designed for interactive engagement without
                  altering historical understanding.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400/60 flex-shrink-0 mt-1">•</span>
                <span>
                  <strong className="text-amber-200">Non-graphic, non-violent</strong> strategy
                  gameplay that focuses on resource management, planning, and cultural learning.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-amber-200/50 italic">
              This experience is designed to inspire curiosity about India's heritage and
              encourage further learning. For verified historical information, please consult
              academic sources and heritage institutions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 flex items-center justify-center kaalachakra-wheel">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-700" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-gold-gradient mb-2">KAALACHAKRA360</p>
          <p className="font-sanskrit text-amber-300/50 text-sm mb-4">कालचक्र ३६०</p>
          <p className="font-body text-sm text-amber-100/40">
            An interactive heritage adventure through India's civilization
          </p>
        </div>
      </div>
    </section>
  );
}
