import { useMemo } from 'react';

interface GoldenParticlesProps {
  count?: number;
}

export default function GoldenParticles({ count = 30 }: GoldenParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 8;
      const delay = Math.random() * 10;
      return { id: i, size, left, duration, delay };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="golden-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
