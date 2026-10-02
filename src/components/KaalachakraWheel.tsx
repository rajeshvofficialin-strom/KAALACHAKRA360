interface KaalachakraWheelProps {
  size?: number;
  active?: boolean;
}

export default function KaalachakraWheel({ size = 300, active = false }: KaalachakraWheelProps) {
  const center = size / 2;
  const outerRadius = center - 10;
  const innerRadius = center * 0.72;
  const hubRadius = center * 0.28;
  const spokeCount = 24;
  const spokeCount2 = 12;

  const spokes = Array.from({ length: spokeCount }).map((_, i) => {
    const angle = (i * 360) / spokeCount;
    const rad = (angle * Math.PI) / 180;
    const x1 = center + hubRadius * Math.cos(rad);
    const y1 = center + hubRadius * Math.sin(rad);
    const x2 = center + outerRadius * Math.cos(rad);
    const y2 = center + outerRadius * Math.sin(rad);
    return { x1, y1, x2, y2, angle };
  });

  const innerSpokes = Array.from({ length: spokeCount2 }).map((_, i) => {
    const angle = (i * 360) / spokeCount2 + 15;
    const rad = (angle * Math.PI) / 180;
    const x1 = center + (hubRadius * 0.4) * Math.cos(rad);
    const y1 = center + (hubRadius * 0.4) * Math.sin(rad);
    const x2 = center + innerRadius * Math.cos(rad);
    const y2 = center + innerRadius * Math.sin(rad);
    return { x1, y1, x2, y2 };
  });

  const petalCount = 8;
  const petals = Array.from({ length: petalCount }).map((_, i) => {
    const angle = (i * 360) / petalCount;
    const rad = (angle * Math.PI) / 180;
    const midRadius = (innerRadius + outerRadius) / 2;
    const cx = center + midRadius * Math.cos(rad);
    const cy = center + midRadius * Math.sin(rad);
    return { cx, cy, angle };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(244,196,48,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Outer rotating ring with spokes */}
      <svg
        className="absolute inset-0 kaalachakra-wheel"
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4C430" stopOpacity="0" />
            <stop offset="85%" stopColor="#D4A017" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A017" />
            <stop offset="50%" stopColor="#F4C430" />
            <stop offset="100%" stopColor="#FF9933" />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="url(#ringGrad)" strokeWidth="3" />
        <circle cx={center} cy={center} r={outerRadius - 5} fill="none" stroke="#D4A017" strokeWidth="1" opacity="0.4" />

        {/* Outer spokes */}
        {spokes.map((s, i) => (
          <line
            key={`outer-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="url(#spokeGrad)"
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}

        {/* Outer decorative dots */}
        {spokes.map((s, i) => {
          const dotRad = ((s.angle + 7.5) * Math.PI) / 180;
          const dr = (outerRadius + innerRadius) / 2;
          return (
            <circle
              key={`dot-${i}`}
              cx={center + dr * Math.cos(dotRad)}
              cy={center + dr * Math.sin(dotRad)}
              r="2"
              fill="#F4C430"
              opacity="0.7"
            />
          );
        })}

        {/* Inner circle */}
        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#D4A017" strokeWidth="1.5" opacity="0.5" />
      </svg>

      {/* Inner counter-rotating ring */}
      <svg
        className="absolute inset-0 kaalachakra-wheel-reverse"
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        {/* Inner spokes */}
        {innerSpokes.map((s, i) => (
          <line
            key={`inner-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="#FF9933"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* Petal shapes */}
        {petals.map((p, i) => (
          <g key={`petal-${i}`} transform={`translate(${p.cx}, ${p.cy}) rotate(${p.angle})`}>
            <path
              d="M 0,-8 Q 6,0 0,8 Q -6,0 0,-8"
              fill="#D4A017"
              opacity="0.3"
            />
          </g>
        ))}
      </svg>

      {/* Center hub */}
      <svg
        className={`absolute inset-0 ${active ? 'kaalachakra-wheel-fast' : ''}`}
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="30%" stopColor="#F4C430" />
            <stop offset="70%" stopColor="#D4A017" />
            <stop offset="100%" stopColor="#8B4513" />
          </radialGradient>
        </defs>

        <circle cx={center} cy={center} r={hubRadius} fill="url(#hubGrad)" opacity="0.9" />
        <circle cx={center} cy={center} r={hubRadius * 0.7} fill="none" stroke="#FF9933" strokeWidth="1" opacity="0.6" />
        <circle cx={center} cy={center} r={hubRadius * 0.5} fill="#0A0E27" opacity="0.3" />

        {/* Center symbol - simplified chakra */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const r1 = hubRadius * 0.2;
          const r2 = hubRadius * 0.6;
          return (
            <line
              key={`hub-spoke-${i}`}
              x1={center + r1 * Math.cos(angle)}
              y1={center + r1 * Math.sin(angle)}
              x2={center + r2 * Math.cos(angle)}
              y2={center + r2 * Math.sin(angle)}
              stroke="#FF9933"
              strokeWidth="1.5"
              opacity="0.7"
            />
          );
        })}
      </svg>
    </div>
  );
}
