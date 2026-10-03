import KaalachakraWheel from './KaalachakraWheel';

interface HeroProps {
  onActivateWheel: () => void;
  onExplore: () => void;
}

export default function Hero({ onActivateWheel, onExplore }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden day-night-bg"
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/28428787/pexels-photo-28428787.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Indian heritage fort at sunset"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27]/60 via-[#0A0E27]/70 to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-30" />
      </div>

      {/* Volumetric fog effect */}
      <div className="absolute inset-0 volumetric-fog z-0" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left: Title and description */}
        <div className="flex-1 text-center lg:text-left fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-amber-950/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-display text-xs tracking-widest text-amber-300/90 uppercase">
              Interactive Heritage Adventure
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider mb-4">
            <span className="text-gold-gradient text-glow-gold">KAALA</span>
            <span className="text-saffron-gradient text-glow-gold">CHAKRA</span>
            <span className="text-gold-gradient text-glow-gold">360</span>
          </h1>

          <p className="font-sanskrit text-xl sm:text-2xl text-amber-200/80 mb-6 tracking-wide">
            कालचक्र ३६० — The Wheel of Time
          </p>

          <p className="font-body text-lg sm:text-xl text-amber-100/70 max-w-2xl mb-8 leading-relaxed">
            Journey through India's civilization across seven time worlds. Rotate the
            Kaalachakra to traverse millennia — from ancient civilizations to mythological
            epics, historic forts, and living traditions. Explore, solve, restore, and play.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={onActivateWheel}
              className="btn-kaalachakra px-8 py-4 rounded-lg text-base flex items-center justify-center gap-3"
            >
              <span>Activate Kaalachakra</span>
            </button>
            <button
              onClick={onExplore}
              className="px-8 py-4 rounded-lg text-base font-display font-semibold tracking-wide border-2 border-amber-600/40 text-amber-200 hover:text-amber-100 hover:border-amber-500 hover:bg-amber-900/20 transition-all duration-400"
            >
              Begin Exploration
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
            {[
              { value: '7', label: 'Time Worlds' },
              { value: '10', label: 'Historic Forts' },
              { value: '30', label: 'Traditional Games' },
              { value: '10', label: 'Ancient Toys' },
              { value: '40+', label: 'Missions' },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="font-display text-3xl font-bold text-gold-gradient">{stat.value}</div>
                <div className="font-body text-sm text-amber-200/50 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Kaalachakra Wheel */}
        <div className="flex-shrink-0 relative float">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-radial from-amber-500/10 to-transparent blur-3xl" />
          </div>
          <div className="relative">
            <KaalachakraWheel size={340} />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center">
            <p className="font-sanskrit text-amber-300/60 text-sm tracking-widest">कालचक्र</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-amber-300/50">
          <span className="font-display text-xs tracking-widest uppercase">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-amber-400/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
