import { memo } from 'react';

const STONE = '#2a1f17';
const BRONZE = '#a8783a';
const COLUMN_COUNT = 7;
const HALL_RADIUS = 6;

function Column({ angle }: { angle: number }) {
  const x = Math.sin(angle) * HALL_RADIUS;
  const z = -Math.cos(angle) * HALL_RADIUS;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.26, 3.8, 16]} />
        <meshStandardMaterial color="#33261b" roughness={0.85} />
      </mesh>
      {[0.6, 3.6].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.27, 0.035, 8, 24]} />
          <meshStandardMaterial color={BRONZE} metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[0.65, 0.25, 0.65]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Arch({ angle, span }: { angle: number; span: number }) {
  const x = Math.sin(angle) * HALL_RADIUS;
  const z = -Math.cos(angle) * HALL_RADIUS;
  return (
    <mesh position={[x, 4.3, z]} rotation={[0, -angle, 0]}>
      <torusGeometry args={[span / 2, 0.08, 8, 32, Math.PI]} />
      <meshStandardMaterial color={BRONZE} metalness={0.7} roughness={0.4} />
    </mesh>
  );
}

function MuseumHall() {
  const spread = Math.PI * 0.9;
  const angles = Array.from({ length: COLUMN_COUNT }, (_, i) => -spread / 2 + (i / (COLUMN_COUNT - 1)) * spread);
  const step = spread / (COLUMN_COUNT - 1);
  const archSpan = 2 * HALL_RADIUS * Math.sin(step / 2);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#120d09" roughness={0.55} metalness={0.15} />
      </mesh>
      {[1.6, 2.6].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[radius, radius + 0.03, 64]} />
          <meshStandardMaterial color={BRONZE} metalness={0.8} roughness={0.4} />
        </mesh>
      ))}

      <group>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 1.05, 0.9, 48]} />
          <meshStandardMaterial color="#1d1510" roughness={0.6} />
        </mesh>
        {[0.06, 0.88].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[y < 0.5 ? 1.05 : 0.96, 0.025, 8, 64]} />
            <meshStandardMaterial color="#d4a64a" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {angles.map((angle) => (
        <Column key={angle} angle={angle} />
      ))}
      {angles.slice(0, -1).map((angle) => (
        <Arch key={angle} angle={angle + step / 2} span={archSpan} />
      ))}

      <mesh position={[0, 3.5, -HALL_RADIUS - 1.2]}>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color="#1a120c" roughness={1} />
      </mesh>
    </group>
  );
}

export default memo(MuseumHall);
