import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TimeWorlds from '@/components/TimeWorlds';
import FortHeritage from '@/components/FortHeritage';
import TraditionalGames from '@/components/TraditionalGames';
import About from '@/components/About';
import GoldenParticles from '@/components/GoldenParticles';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [wheelActivated, setWheelActivated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'time-worlds', 'fort-heritage', 'traditional-games', 'about'];
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleActivateWheel = useCallback(() => {
    setWheelActivated(true);
    setTimeout(() => {
      handleNavigate('time-worlds');
      setWheelActivated(false);
    }, 2500);
  }, [handleNavigate]);

  const handleWorldSelect = useCallback((worldId: string) => {
    // After time transition, navigate to the most relevant section
    if (worldId === 'fort-heritage') {
      handleNavigate('fort-heritage');
    } else if (worldId === 'traditional-games') {
      handleNavigate('traditional-games');
    } else {
      handleNavigate('fort-heritage');
    }
  }, [handleNavigate]);

  return (
    <div className="relative min-h-screen bg-[#0A0E27]">
      <GoldenParticles count={25} />
      <Navigation onNavigate={handleNavigate} activeSection={activeSection} />

      <main>
        <Hero onActivateWheel={handleActivateWheel} onExplore={() => handleNavigate('time-worlds')} />
        <TimeWorlds onWorldSelect={handleWorldSelect} />
        <FortHeritage />
        <TraditionalGames />
        <About />
      </main>

      {/* Wheel activation overlay */}
      {wheelActivated && (
        <div className="time-transition-overlay flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-amber-400/60 kaalachakra-wheel-fast flex items-center justify-center pulse-glow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-700" />
              </div>
            </div>
            <p className="font-sanskrit text-2xl text-amber-300 mb-2">कालचक्र सक्रिय</p>
            <p className="font-display text-lg text-amber-200/70 tracking-widest">ACTIVATING TIME WHEEL</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
