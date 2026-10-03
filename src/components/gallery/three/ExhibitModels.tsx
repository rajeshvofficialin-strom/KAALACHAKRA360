import { useMemo, useRef, type ComponentType } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ModelKey } from '@/data/heritageExhibits';

type MaterialProps = { color: string; roughness?: number; metalness?: number };

const TERRACOTTA: MaterialProps = { color: '#b5562f', roughness: 0.9 };
const LIGHT_TERRACOTTA: MaterialProps = { color: '#c27b4f', roughness: 0.88 };
const WOOD: MaterialProps = { color: '#8a5a2b', roughness: 0.7 };
const GOLD: MaterialProps = { color: '#d4a64a', roughness: 0.3, metalness: 0.85 };
const IVORY: MaterialProps = { color: '#efe0c4', roughness: 0.5 };
const LACQUER = (color: string): MaterialProps => ({ color, roughness: 0.22, metalness: 0.05 });

function Mat({ color, roughness = 0.6, metalness = 0 }: MaterialProps) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

function Part({
  children,
  material,
  ...props
}: Omit<JSX.IntrinsicElements['mesh'], 'material'> & { material: MaterialProps }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      {children}
      <Mat {...material} />
    </mesh>
  );
}

function Bull({ material, position, rotation }: { material: MaterialProps; position?: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <Part material={material} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.17, 0.45, 6, 16]} />
      </Part>
      <Part material={material} position={[0.12, 0.68, 0]}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </Part>
      <Part material={material} position={[0.42, 0.62, 0]} scale={[1.25, 1, 0.9]}>
        <sphereGeometry args={[0.12, 16, 12]} />
      </Part>
      {[-1, 1].map((side) => (
        <Part key={side} material={material} position={[0.42, 0.78, side * 0.07]} rotation={[side * -0.5, 0, -0.2]}>
          <coneGeometry args={[0.025, 0.16, 8]} />
        </Part>
      ))}
      {[
        [0.22, 0.1],
        [0.22, -0.1],
        [-0.22, 0.1],
        [-0.22, -0.1],
      ].map(([x, z]) => (
        <Part key={`${x}${z}`} material={material} position={[x, 0.18, z]}>
          <cylinderGeometry args={[0.045, 0.05, 0.36, 10]} />
        </Part>
      ))}
    </group>
  );
}

function SolidWheel({ position, material }: { position: [number, number, number]; material: MaterialProps }) {
  return (
    <Part material={material} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.07, 24]} />
    </Part>
  );
}

function IndusCartModel() {
  return (
    <group position={[0.15, 0, 0]}>
      <Bull material={TERRACOTTA} position={[-0.55, 0, 0]} rotation={[0, Math.PI, 0]} />
      <group position={[0.55, 0, 0]}>
        <Part material={TERRACOTTA} position={[0, 0.38, 0]}>
          <boxGeometry args={[0.8, 0.12, 0.5]} />
        </Part>
        <Part material={TERRACOTTA} position={[0, 0.5, 0.24]}>
          <boxGeometry args={[0.8, 0.14, 0.04]} />
        </Part>
        <Part material={TERRACOTTA} position={[0, 0.5, -0.24]}>
          <boxGeometry args={[0.8, 0.14, 0.04]} />
        </Part>
        <Part material={TERRACOTTA} position={[-0.55, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
        </Part>
        {[-0.22, 0.22].flatMap((x) =>
          [-0.3, 0.3].map((z) => <SolidWheel key={`${x}${z}`} position={[x, 0.2, z]} material={TERRACOTTA} />),
        )}
      </group>
    </group>
  );
}

function useWobble(speed: number, amount: number) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * speed) * amount;
  });
  return ref;
}

function ChannapatnaModel() {
  const ref = useWobble(1.6, 0.08);
  return (
    <group ref={ref}>
      <Part material={LACQUER('#c8372d')} position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.42, 32, 24]} />
      </Part>
      <Part material={LACQUER('#e0b020')} position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.03, 12, 48]} />
      </Part>
      <Part material={LACQUER('#e0b020')} position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.27, 32, 24]} />
      </Part>
      <Part material={LACQUER('#2e7d4f')} position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.025, 12, 48]} />
      </Part>
      <Part material={IVORY} position={[0, 1.33, 0]}>
        <sphereGeometry args={[0.2, 32, 24]} />
      </Part>
      <Part material={LACQUER('#2e7d4f')} position={[0, 1.62, 0]}>
        <coneGeometry args={[0.17, 0.32, 32]} />
      </Part>
      {[-1, 1].map((side) => (
        <Part key={side} material={LACQUER('#1a1a1a')} position={[side * 0.07, 1.36, 0.18]}>
          <sphereGeometry args={[0.025, 8, 8]} />
        </Part>
      ))}
    </group>
  );
}

function KondapalliModel() {
  const saree = LACQUER('#2e8b57');
  const skin: MaterialProps = { color: '#c98a5a', roughness: 0.55 };
  return (
    <group>
      <Part material={saree} position={[0, 0.42, 0]}>
        <coneGeometry args={[0.38, 0.84, 32]} />
      </Part>
      <Part material={LACQUER('#d23b6b')} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.37, 0.03, 10, 40]} />
      </Part>
      <Part material={LACQUER('#d23b6b')} position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.34, 24]} />
      </Part>
      <Part material={skin} position={[0, 1.27, 0]}>
        <sphereGeometry args={[0.13, 24, 16]} />
      </Part>
      <Part material={LACQUER('#111111')} position={[0, 1.3, -0.08]}>
        <sphereGeometry args={[0.1, 16, 12]} />
      </Part>
      <Part material={LACQUER('#c27b30')} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
      </Part>
      {[-1, 1].map((side) => (
        <Part key={side} material={skin} position={[side * 0.2, 1.17, 0]} rotation={[0, 0, side * -2.6]}>
          <cylinderGeometry args={[0.03, 0.035, 0.36, 10]} />
        </Part>
      ))}
    </group>
  );
}

function LattuModel() {
  const ref = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const profile = [
      [0, 0.12],
      [0.06, 0.18],
      [0.24, 0.42],
      [0.34, 0.62],
      [0.33, 0.76],
      [0.16, 0.84],
      [0.06, 0.9],
      [0.06, 1.02],
      [0, 1.04],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(profile, 48);
  }, []);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 9;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#d4a017" roughness={0.3} metalness={0.05} />
      </mesh>
      {[0.5, 0.64].map((y, i) => (
        <Part key={y} material={LACQUER(i === 0 ? '#b22222' : '#1e5aa8')} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i === 0 ? 0.3 : 0.345, 0.018, 8, 48]} />
        </Part>
      ))}
      <Part material={{ color: '#888888', roughness: 0.3, metalness: 0.9 }} position={[0, 0.07, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.03, 0.14, 12]} />
      </Part>
    </group>
  );
}

function RattleModel() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 7) * 0.04 * (Math.sin(clock.elapsedTime * 0.8) > 0.6 ? 1 : 0);
  });
  return (
    <group ref={ref}>
      <Part material={TERRACOTTA} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.12, 24]} />
      </Part>
      <Part material={TERRACOTTA} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.55, 16]} />
      </Part>
      <Part material={TERRACOTTA} position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.36, 32, 24]} />
      </Part>
      <Part material={LIGHT_TERRACOTTA} position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.025, 10, 48]} />
      </Part>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <Part key={i} material={{ color: '#3a2316', roughness: 1 }} position={[Math.cos(angle) * 0.3, 1.14, Math.sin(angle) * 0.3]}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </Part>
        );
      })}
    </group>
  );
}

function ThalayatiModel() {
  const ref = useWobble(2.2, 0.22);
  const headRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (headRef.current) headRef.current.rotation.z = Math.sin(clock.elapsedTime * 3.4 + 1) * 0.25;
  });
  const silk = LACQUER('#7b1e3a');
  return (
    <group ref={ref}>
      <Part material={LACQUER('#b8862f')} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </Part>
      <Part material={GOLD} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.025, 10, 48]} />
      </Part>
      <Part material={silk} position={[0, 0.62, 0]}>
        <coneGeometry args={[0.3, 0.64, 32]} />
      </Part>
      <group ref={headRef} position={[0, 0.94, 0]}>
        <Part material={{ color: '#d8a47a', roughness: 0.5 }} position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.14, 24, 16]} />
        </Part>
        <Part material={GOLD} position={[0, 0.32, 0]}>
          <coneGeometry args={[0.1, 0.18, 16]} />
        </Part>
      </group>
    </group>
  );
}

function BuddhistFigureModel() {
  const stone: MaterialProps = { color: '#b49470', roughness: 0.92 };
  return (
    <group>
      <Part material={stone} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.14, 40]} />
      </Part>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <Part key={i} material={stone} position={[Math.cos(angle) * 0.5, 0.16, Math.sin(angle) * 0.5]} rotation={[0, -angle, 0]} scale={[0.7, 0.35, 1.4]}>
            <sphereGeometry args={[0.1, 12, 8]} />
          </Part>
        );
      })}
      <Part material={stone} position={[0, 0.3, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.6]}>
        <capsuleGeometry args={[0.15, 0.5, 6, 16]} />
      </Part>
      <Part material={stone} position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.56, 28]} />
      </Part>
      <Part material={stone} position={[0, 0.48, 0.2]} scale={[1.4, 0.5, 1]}>
        <sphereGeometry args={[0.09, 16, 12]} />
      </Part>
      <Part material={stone} position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.16, 28, 20]} />
      </Part>
      <Part material={stone} position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.075, 16, 12]} />
      </Part>
      <Part material={stone} position={[0, 1.08, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.03, 48]} />
      </Part>
    </group>
  );
}

function JatakaElephantModel() {
  const trunk = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.72, 0.85, 0),
      new THREE.Vector3(0.88, 0.62, 0),
      new THREE.Vector3(0.9, 0.35, 0),
      new THREE.Vector3(0.98, 0.18, 0),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.055, 10, false);
  }, []);
  return (
    <group position={[-0.15, 0, 0]}>
      <Part material={LIGHT_TERRACOTTA} position={[0, 0.72, 0]} scale={[1.4, 1, 1]}>
        <sphereGeometry args={[0.38, 32, 24]} />
      </Part>
      <Part material={LIGHT_TERRACOTTA} position={[0.58, 0.88, 0]}>
        <sphereGeometry args={[0.26, 28, 20]} />
      </Part>
      <mesh geometry={trunk} castShadow>
        <Mat {...LIGHT_TERRACOTTA} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Part material={TERRACOTTA} position={[0.5, 0.9, side * 0.24]} rotation={[0, side * 0.3, 0]} scale={[0.9, 1.1, 0.15]}>
            <sphereGeometry args={[0.22, 20, 16]} />
          </Part>
          <Part material={IVORY} position={[0.8, 0.68, side * 0.1]} rotation={[0, 0, -2]}>
            <coneGeometry args={[0.025, 0.24, 10]} />
          </Part>
        </group>
      ))}
      {[
        [0.3, 0.18],
        [0.3, -0.18],
        [-0.3, 0.18],
        [-0.3, -0.18],
      ].map(([x, z]) => (
        <Part key={`${x}${z}`} material={LIGHT_TERRACOTTA} position={[x, 0.22, z]}>
          <cylinderGeometry args={[0.1, 0.11, 0.44, 14]} />
        </Part>
      ))}
      <Part material={LACQUER('#7b1e3a')} position={[0, 1.0, 0]} rotation={[0, 0, 0]} scale={[1.1, 0.25, 0.95]}>
        <sphereGeometry args={[0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
    </group>
  );
}

function SpokedWheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <Part material={WOOD}>
        <torusGeometry args={[0.26, 0.03, 10, 32]} />
      </Part>
      {Array.from({ length: 6 }, (_, i) => (
        <Part key={i} material={WOOD} rotation={[0, 0, (i / 6) * Math.PI]}>
          <boxGeometry args={[0.5, 0.025, 0.025]} />
        </Part>
      ))}
      <Part material={GOLD} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
      </Part>
    </group>
  );
}

function BullCartModel() {
  const paintedBull = LACQUER('#efe6d6');
  return (
    <group position={[0.2, 0, 0]} scale={0.88}>
      <Bull material={paintedBull} position={[-0.75, 0, 0.2]} rotation={[0, Math.PI, 0]} />
      <Bull material={paintedBull} position={[-0.75, 0, -0.2]} rotation={[0, Math.PI, 0]} />
      <Part material={LACQUER('#b22222')} position={[-0.75, 0.72, 0]}>
        <boxGeometry args={[0.06, 0.05, 0.62]} />
      </Part>
      <group position={[0.45, 0, 0]}>
        <Part material={WOOD} position={[0, 0.48, 0]}>
          <boxGeometry args={[0.9, 0.08, 0.56]} />
        </Part>
        <Part material={WOOD} position={[-0.75, 0.6, 0]} rotation={[0, 0, Math.PI / 2 - 0.15]}>
          <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        </Part>
        <Part material={LACQUER('#c47a1b')} position={[0.05, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.55, 24, 1, true, -Math.PI / 2, Math.PI]} />
        </Part>
        <SpokedWheel position={[0, 0.28, 0.33]} />
        <SpokedWheel position={[0, 0.28, -0.33]} />
      </group>
    </group>
  );
}

function BommalattamModel() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.06;
  });
  const top = 1.95;
  const strings: [number, number][] = [
    [-0.24, 1.15],
    [0.24, 1.15],
    [0, 1.42],
  ];
  return (
    <group ref={ref} position={[0, top, 0]}>
      <Part material={WOOD} position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.05]} />
      </Part>
      <Part material={WOOD} position={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.4]} />
      </Part>
      {strings.map(([x, y]) => {
        const length = top - y;
        return (
          <mesh key={x} position={[x, -length / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.004, length, 4]} />
            <meshStandardMaterial color="#e8dcc0" roughness={1} />
          </mesh>
        );
      })}
      <group position={[0, -top, 0]}>
        <Part material={LACQUER('#b22222')} position={[0, 0.5, 0]}>
          <coneGeometry args={[0.32, 0.6, 32]} />
        </Part>
        <Part material={GOLD} position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.27, 0.02, 10, 40]} />
        </Part>
        <Part material={LACQUER('#1e4d8a')} position={[0, 0.98, 0]}>
          <boxGeometry args={[0.32, 0.36, 0.18]} />
        </Part>
        <Part material={GOLD} position={[0, 1.12, 0.06]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.13, 0.02, 8, 32]} />
        </Part>
        {[-1, 1].map((side) => (
          <Part key={side} material={{ color: '#3d7a3d', roughness: 0.5 }} position={[side * 0.22, 0.98, 0]} rotation={[0, 0, side * 0.35]}>
            <cylinderGeometry args={[0.035, 0.04, 0.38, 10]} />
          </Part>
        ))}
        <Part material={{ color: '#3d7a3d', roughness: 0.5 }} position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.14, 24, 16]} />
        </Part>
        <Part material={GOLD} position={[0, 1.48, 0]}>
          <coneGeometry args={[0.12, 0.24, 16]} />
        </Part>
      </group>
    </group>
  );
}

export function FallbackModel() {
  return (
    <group>
      <Part material={{ color: '#5b4632', roughness: 0.6 }} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
      </Part>
      <Part material={GOLD} position={[0, 0.5, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 48]} />
      </Part>
    </group>
  );
}

export const PROCEDURAL_MODELS: Record<ModelKey, ComponentType> = {
  'indus-cart': IndusCartModel,
  channapatna: ChannapatnaModel,
  kondapalli: KondapalliModel,
  lattu: LattuModel,
  rattle: RattleModel,
  thalayati: ThalayatiModel,
  'buddhist-figure': BuddhistFigureModel,
  'jataka-elephant': JatakaElephantModel,
  'bull-cart': BullCartModel,
  bommalattam: BommalattamModel,
};
