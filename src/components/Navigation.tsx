import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'time-worlds', label: 'Time Worlds' },
  { id: 'fort-heritage', label: 'Fort Heritage' },
  { id: 'traditional-games', label: 'Traditional Games' },
  { id: 'ancient-toys', label: 'Ancient Toys' },
  { id: 'about', label: 'About' },
];

export default function Navigation({ onNavigate, activeSection }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0A0E27]/95 backdrop-blur-md border-b border-amber-900/30 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <button
          onClick={() => handleNav('hero')}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/60 flex items-center justify-center kaalachakra-wheel">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-gold-gradient tracking-wider">
            KAALACHAKRA360
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`px-4 py-2 font-display text-sm font-medium tracking-wide transition-all duration-300 rounded-lg ${
                activeSection === item.id
                  ? 'text-amber-300 bg-amber-900/20'
                  : 'text-amber-100/70 hover:text-amber-300 hover:bg-amber-900/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="md:hidden text-amber-300 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0A0E27]/98 backdrop-blur-md border-t border-amber-900/30 mt-3">
          <div className="flex flex-col px-4 py-4 gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-3 font-display text-sm font-medium tracking-wide text-left rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'text-amber-300 bg-amber-900/20'
                    : 'text-amber-100/70 hover:text-amber-300 hover:bg-amber-900/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
