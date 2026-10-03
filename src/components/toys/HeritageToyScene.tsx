import { useEffect, useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace, Vector2 } from 'three';
import type { Group } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';

export type HeritageToyKind = 'cart' | 'channapatna' | 'kondapalli' | 'top' | 'rattle' | 'bobble' | 'buddha' | 'jataka' | 'bullCart' | 'puppet';

export default function HeritageToyScene({ kind }: { kind: HeritageToyKind }) {
  const surfaceType = kind === 'cart' || kind === 'rattle' || kind === 'buddha' || kind === 'jataka' ? 'clay' : 'wood';
  const surface = useMemo(() => createSurfaceTexture(surfaceType), [surfaceType]);
  const roughnessSurface = useMemo(() => createRoughnessTexture(surface, surfaceType), [surface, surfaceType]);
  useEffect(() => () => {
    surface.dispose();
    roughnessSurface.dispose();
  }, [roughnessSurface, surface]);

  return (
    <Canvas className="!h-full !w-full" style={{ display: 'block', width: '100%', height: '100%' }} onCreated={({ gl }) => { gl.domElement.style.width = '100%'; gl.domElement.style.height = '100%'; }} shadows dpr={[1, 1.75]} camera={{ position: [3.9, 3.4, 5.2], fov: 36 }} gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}>
      <color attach="background" args={['#100e0b']} />
      <ambientLight intensity={0.28} />
      <directionalLight castShadow position={[4, 7, 4]} intensity={2.25} color="#fff0d8" shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00012} />
      <spotLight position={[-4, 5, -2]} intensity={1.8} color="#e9b66b" angle={0.55} penumbra={0.8} />
      <spotLight position={[3, 4, -4]} intensity={1.5} color="#a9c1c8" angle={0.62} penumbra={0.85} />
      <pointLight position={[0, 2, 4]} intensity={0.5} color="#d89054" />
      <ExhibitModel kind={kind} surface={surface} roughnessSurface={roughnessSurface} />
      <Environment resolution={128}>
        <Lightformer intensity={2.4} position={[0, 5, -5]} scale={[8, 5, 1]} color="#fff0d4" />
        <Lightformer intensity={1.2} position={[-5, 1, 0]} scale={[5, 3, 1]} color="#cf8752" />
      </Environment>
      <mesh receiveShadow position={[0, -0.14, 0]}>
        <cylinderGeometry args={[1.78, 1.9, 0.16, 96]} />
        <meshPhysicalMaterial color="#29221b" metalness={0.12} roughness={0.68} clearcoat={0.06} />
      </mesh>
      <mesh receiveShadow position={[0, -0.055, 0]}>
        <cylinderGeometry args={[1.68, 1.8, 0.09, 96]} />
        <meshPhysicalMaterial color="#17130f" metalness={0.08} roughness={0.76} clearcoat={0.04} />
      </mesh>
      <mesh position={[0, -0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.72, 0.014, 10, 128]} />
        <meshPhysicalMaterial color="#c19a59" metalness={0.78} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.84, 0.012, 10, 128]} />
        <meshPhysicalMaterial color="#94723e" metalness={0.7} roughness={0.32} />
      </mesh>
      <ContactShadows position={[0, -0.008, 0]} opacity={0.68} scale={4.4} blur={2.8} far={3.4} resolution={1024} />
      <OrbitControls target={[-0.18, 0.72, 0]} enablePan={false} enableDamping dampingFactor={0.075} autoRotate autoRotateSpeed={0.42} minDistance={2.7} maxDistance={7.7} minPolarAngle={0.12} maxPolarAngle={Math.PI - 0.12} />
    </Canvas>
  );
}

function ExhibitModel({ kind, surface, roughnessSurface }: { kind: HeritageToyKind; surface: CanvasTexture; roughnessSurface: CanvasTexture }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (kind === 'top' && group.current) group.current.rotation.y += delta * 0.48;
  });

  const wood = <meshPhysicalMaterial map={surface} bumpMap={surface} roughnessMap={roughnessSurface} color="#fff1de" roughness={0.78} bumpScale={0.028} metalness={0.025} clearcoat={0.1} clearcoatRoughness={0.62} />;
  const clay = <meshPhysicalMaterial map={surface} bumpMap={surface} roughnessMap={roughnessSurface} color="#f4d8c4" roughness={0.98} bumpScale={0.06} metalness={0.01} clearcoat={0.005} clearcoatRoughness={0.94} />;
  const darkWood = <meshPhysicalMaterial map={surface} bumpMap={surface} roughnessMap={roughnessSurface} color="#704329" roughness={0.78} bumpScale={0.035} metalness={0.015} clearcoat={0.07} />;
  const paintRed = <meshPhysicalMaterial color="#a34332" roughness={0.43} metalness={0.025} clearcoat={0.38} clearcoatRoughness={0.36} />;
  const paintGold = <meshPhysicalMaterial color="#d4ab66" roughness={0.36} metalness={0.3} clearcoat={0.2} />;
  const ivory = <meshPhysicalMaterial color="#dfc89a" roughness={0.58} clearcoat={0.12} />;
  const modelScale = kind === 'cart' || kind === 'bullCart' ? 1.12 : kind === 'top' ? 1.24 : 1.18;

  return (
    <group ref={group} position={[0, -0.015, 0]} scale={modelScale}>
      {kind === 'cart' && <CartAnimal clay={clay} dark={darkWood} />}
      {kind === 'channapatna' && <Channapatna wood={wood} red={paintRed} gold={paintGold} />}
      {kind === 'kondapalli' && <Doll wood={wood} red={paintRed} gold={paintGold} />}
      {kind === 'top' && <SpinningTop wood={wood} red={paintRed} gold={paintGold} />}
      {kind === 'rattle' && <Rattle clay={clay} red={paintRed} gold={paintGold} />}
      {kind === 'bobble' && <BobbleDoll wood={wood} red={paintRed} gold={paintGold} ivory={ivory} />}
      {kind === 'buddha' && <BuddhistFigure clay={clay} gold={paintGold} />}
      {kind === 'jataka' && <JatakaAnimal clay={clay} gold={paintGold} />}
      {kind === 'bullCart' && <BullCart wood={wood} dark={darkWood} red={paintRed} />}
      {kind === 'puppet' && <StringPuppet wood={wood} red={paintRed} gold={paintGold} />}
    </group>
  );
}

function CartAnimal({ clay, dark }: { clay: JSX.Element; dark: JSX.Element }) {
  return <group>
    <mesh castShadow receiveShadow position={[0, 0.63, 0]}><boxGeometry args={[1.45, 0.24, 0.82]} />{clay}</mesh>
    <mesh castShadow position={[0, 0.82, 0]}><boxGeometry args={[1.32, 0.14, 0.7]} />{clay}</mesh>
    <mesh castShadow position={[0.35, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 1.35, 24]} />{dark}</mesh>
    {[-0.53, 0.53].map((z) => <group key={z} position={[0.35, 0.3, z]}>
      <mesh castShadow><torusGeometry args={[0.31, 0.075, 16, 48]} />{clay}</mesh>
      <mesh><cylinderGeometry args={[0.075, 0.075, 0.16, 24]} />{dark}</mesh>
      {[0, 1, 2, 3, 4, 5].map((spoke) => <mesh key={spoke} rotation={[0, 0, spoke * Math.PI / 3]}><boxGeometry args={[0.045, 0.51, 0.045]} />{dark}</mesh>)}
    </group>)}
    <mesh castShadow position={[-0.65, 0.71, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 1.25, 16]} />{clay}</mesh>
    <mesh castShadow position={[-1.03, 0.66, 0]} scale={[0.54, 0.34, 0.35]}><sphereGeometry args={[1, 32, 24]} />{clay}</mesh>
    <mesh castShadow position={[-1.4, 0.8, 0]} scale={[0.29, 0.25, 0.25]}><sphereGeometry args={[1, 32, 24]} />{clay}</mesh>
    {[[-1.53, 1.02, -0.13], [-1.53, 1.02, 0.13]].map((point, index) => <mesh key={index} castShadow position={point as [number, number, number]} rotation={[0, 0, index ? -0.45 : 0.45]}><coneGeometry args={[0.09, 0.38, 20]} />{clay}</mesh>)}
    {[-1.28, -0.83].map((x) => <mesh key={x} castShadow position={[x, 0.25, 0]}><cylinderGeometry args={[0.065, 0.09, 0.42, 20]} />{clay}</mesh>)}
  </group>;
}

function Channapatna({ wood, red, gold }: { wood: JSX.Element; red: JSX.Element; gold: JSX.Element }) {
  return <group position={[0, 0.03, 0]}>
    <mesh castShadow position={[0, 0.51, 0]}><latheGeometry args={[[[0, 0], [0.22, 0.05], [0.34, 0.17], [0.28, 0.3], [0.18, 0.39], [0.3, 0.51], [0.34, 0.65], [0.19, 0.79], [0.08, 0.88], [0, 0.9]].map(([x, y]) => new Vector2(x, y)), 48]} />{wood}</mesh>
    <mesh position={[0, 0.48, 0.285]} rotation={[0, 0, 0.15]}><torusGeometry args={[0.24, 0.018, 8, 48]} />{red}</mesh>
    <mesh position={[0, 0.66, 0.28]}><torusGeometry args={[0.29, 0.018, 8, 48]} />{gold}</mesh>
    <mesh position={[0, 0.88, 0]}><sphereGeometry args={[0.09, 24, 20]} />{red}</mesh>
    <mesh position={[0, 0.3, 0.28]}><torusGeometry args={[0.2, 0.014, 8, 48]} />{gold}</mesh>
  </group>;
}

function Doll({ wood, red, gold }: { wood: JSX.Element; red: JSX.Element; gold: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.27, 0.78, 32]} />{wood}</mesh>
    <mesh castShadow position={[0, 1.02, 0]}><sphereGeometry args={[0.25, 32, 28]} />{wood}</mesh>
    <mesh castShadow position={[0, 1.28, 0]}><coneGeometry args={[0.14, 0.28, 32]} />{red}</mesh>
    <mesh castShadow position={[-0.33, 0.64, 0]} rotation={[0, 0, 0.62]}><capsuleGeometry args={[0.075, 0.42, 8, 16]} />{wood}</mesh>
    <mesh castShadow position={[0.33, 0.64, 0]} rotation={[0, 0, -0.62]}><capsuleGeometry args={[0.075, 0.42, 8, 16]} />{wood}</mesh>
    <mesh position={[0, 0.65, 0.24]}><torusGeometry args={[0.17, 0.027, 8, 32]} />{gold}</mesh>
    <mesh position={[0, 0.91, 0.18]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.34, 0.12, 0.025]} />{red}</mesh>
    <mesh position={[-0.09, 1.05, 0.22]}><sphereGeometry args={[0.025, 12, 12]} /><meshStandardMaterial color="#262018" /></mesh>
    <mesh position={[0.09, 1.05, 0.22]}><sphereGeometry args={[0.025, 12, 12]} /><meshStandardMaterial color="#262018" /></mesh>
  </group>;
}

function SpinningTop({ wood, red, gold }: { wood: JSX.Element; red: JSX.Element; gold: JSX.Element }) {
  return <group position={[0, 0.05, 0]}>
    <mesh castShadow position={[0, 0.48, 0]}><latheGeometry args={[[[0, 0], [0.035, 0.04], [0.1, 0.12], [0.32, 0.32], [0.44, 0.49], [0.4, 0.59], [0.19, 0.71], [0.11, 0.82], [0.12, 0.91], [0.1, 0.96], [0, 0.96]].map(([x, y]) => new Vector2(x, y)), 64]} />{wood}</mesh>
    {[0.25, 0.43, 0.62, 0.78].map((y, index) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[index < 2 ? 0.25 + index * 0.13 : 0.27 - (index - 2) * 0.1, 0.022, 10, 48]} />{index % 2 ? red : gold}</mesh>)}
    <mesh castShadow position={[0, 1.02, 0]}><cylinderGeometry args={[0.12, 0.12, 0.13, 32]} />{wood}</mesh>
    <mesh castShadow position={[0, 0.01, 0]}><coneGeometry args={[0.07, 0.19, 24]} />{gold}</mesh>
  </group>;
}

function Rattle({ clay, red, gold }: { clay: JSX.Element; red: JSX.Element; gold: JSX.Element }) {
  return <group rotation={[0, 0, -0.16]}>
    <mesh castShadow position={[0, 0.36, 0]}><cylinderGeometry args={[0.07, 0.095, 0.8, 24]} />{clay}</mesh>
    <mesh castShadow position={[0, 1.02, 0]} scale={[0.47, 0.5, 0.42]}><sphereGeometry args={[1, 40, 32]} />{clay}</mesh>
    <mesh position={[0, 0.94, 0.355]}><torusGeometry args={[0.3, 0.025, 10, 48]} />{red}</mesh>
    <mesh position={[0, 1.1, 0.395]}><torusGeometry args={[0.35, 0.022, 10, 48]} />{gold}</mesh>
    {[[-0.18, 1.08], [0, 1.25], [0.18, 1.08], [0, 0.83]].map(([x, y], index) => <mesh key={index} position={[x, y, 0.39]}><sphereGeometry args={[0.045, 16, 16]} />{index % 2 ? red : gold}</mesh>)}
    <mesh castShadow position={[0, 1.51, 0]}><sphereGeometry args={[0.09, 24, 20]} />{clay}</mesh>
  </group>;
}

function BobbleDoll({ wood, red, gold, ivory }: { wood: JSX.Element; red: JSX.Element; gold: JSX.Element; ivory: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0, 0.22, 0]}><cylinderGeometry args={[0.28, 0.34, 0.4, 40]} />{wood}</mesh>
    <mesh castShadow position={[0, 0.53, 0]}><sphereGeometry args={[0.31, 36, 32]} />{red}</mesh>
    <mesh castShadow position={[0, 0.91, 0]}><sphereGeometry args={[0.19, 32, 28]} />{ivory}</mesh>
    <mesh castShadow position={[0, 1.14, 0]}><sphereGeometry args={[0.26, 36, 32]} />{wood}</mesh>
    <mesh castShadow position={[0, 1.4, 0]}><sphereGeometry args={[0.2, 36, 32]} />{ivory}</mesh>
    <mesh castShadow position={[0, 1.58, 0]}><coneGeometry args={[0.16, 0.2, 32]} />{red}</mesh>
    <mesh position={[0, 0.96, 0.187]}><torusGeometry args={[0.14, 0.018, 8, 32]} />{gold}</mesh>
    {[-0.07, 0.07].map((x) => <mesh key={x} position={[x, 1.43, 0.18]}><sphereGeometry args={[0.018, 12, 12]} /><meshStandardMaterial color="#30231c" /></mesh>)}
  </group>;
}

function BuddhistFigure({ clay, gold }: { clay: JSX.Element; gold: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0, 0.25, 0]} scale={[0.72, 0.13, 0.43]}><sphereGeometry args={[1, 40, 28]} />{gold}</mesh>
    <mesh castShadow position={[0, 0.51, 0]} scale={[0.4, 0.29, 0.32]}><sphereGeometry args={[1, 40, 32]} />{clay}</mesh>
    <mesh castShadow position={[0, 0.87, 0]} scale={[0.32, 0.44, 0.27]}><sphereGeometry args={[1, 40, 32]} />{clay}</mesh>
    <mesh castShadow position={[0, 1.34, 0]}><sphereGeometry args={[0.26, 40, 36]} />{clay}</mesh>
    <mesh castShadow position={[0, 1.62, 0]}><sphereGeometry args={[0.075, 24, 24]} />{gold}</mesh>
    <mesh position={[0, 1.32, 0.25]}><sphereGeometry args={[0.028, 16, 16]} /><meshStandardMaterial color="#2a211a" /></mesh>
    <mesh castShadow position={[-0.44, 0.65, 0.02]} rotation={[0, 0, 1.12]}><capsuleGeometry args={[0.105, 0.42, 8, 20]} />{clay}</mesh>
    <mesh castShadow position={[0.44, 0.65, 0.02]} rotation={[0, 0, -1.12]}><capsuleGeometry args={[0.105, 0.42, 8, 20]} />{clay}</mesh>
    <mesh position={[0, 0.95, 0.23]}><torusGeometry args={[0.25, 0.018, 8, 48]} />{gold}</mesh>
  </group>;
}

function JatakaAnimal({ clay, gold }: { clay: JSX.Element; gold: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0, 0.64, 0]} scale={[0.63, 0.48, 0.42]}><sphereGeometry args={[1, 40, 32]} />{clay}</mesh>
    <mesh castShadow position={[-0.5, 0.74, 0]} scale={[0.31, 0.38, 0.17]} rotation={[0, 0, -0.22]}><sphereGeometry args={[1, 32, 28]} />{clay}</mesh>
    <mesh castShadow position={[-0.72, 0.42, 0]} rotation={[0, 0, 0.12]}><capsuleGeometry args={[0.11, 0.44, 8, 24]} />{clay}</mesh>
    <mesh castShadow position={[0.55, 0.73, 0]} scale={[0.28, 0.22, 0.25]}><sphereGeometry args={[1, 32, 24]} />{clay}</mesh>
    <mesh position={[0.73, 0.72, 0.13]}><sphereGeometry args={[0.035, 16, 16]} /><meshStandardMaterial color="#241914" /></mesh>
    {[-0.38, 0.35].map((x) => <mesh key={x} castShadow position={[x, 0.22, 0]}><cylinderGeometry args={[0.09, 0.1, 0.42, 24]} />{clay}</mesh>)}
    <mesh position={[-0.36, 0.91, 0.3]} rotation={[0, 0, 0.3]}><torusGeometry args={[0.13, 0.018, 8, 32]} />{gold}</mesh>
    <mesh position={[0.25, 0.88, 0.3]} rotation={[0, 0, -0.3]}><torusGeometry args={[0.13, 0.018, 8, 32]} />{gold}</mesh>
  </group>;
}

function BullCart({ wood, dark, red }: { wood: JSX.Element; dark: JSX.Element; red: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0.64, 0.68, 0]}><boxGeometry args={[1.05, 0.22, 0.72]} />{wood}</mesh>
    <mesh castShadow position={[0.64, 0.82, 0]}><boxGeometry args={[0.95, 0.12, 0.66]} />{dark}</mesh>
    {[-0.52, 0.52].map((z) => <group key={z} position={[0.68, 0.31, z]}>
      <mesh castShadow><torusGeometry args={[0.29, 0.07, 14, 40]} />{dark}</mesh>
      <mesh><cylinderGeometry args={[0.07, 0.07, 0.14, 24]} />{red}</mesh>
    </group>)}
    <mesh castShadow position={[-0.62, 0.58, 0]} scale={[0.53, 0.35, 0.34]}><sphereGeometry args={[1, 36, 28]} />{wood}</mesh>
    <mesh castShadow position={[-1.02, 0.77, 0]} scale={[0.27, 0.27, 0.25]}><sphereGeometry args={[1, 32, 28]} />{wood}</mesh>
    {[-1.15, -0.9].map((x, index) => <mesh key={x} castShadow position={[x, 1.04, index ? 0.13 : -0.13]} rotation={[0, 0, index ? -0.55 : 0.55]}><coneGeometry args={[0.075, 0.34, 20]} />{wood}</mesh>)}
    {[-0.85, -0.43].map((x) => <mesh key={x} castShadow position={[x, 0.24, 0]}><cylinderGeometry args={[0.065, 0.09, 0.42, 20]} />{wood}</mesh>)}
  </group>;
}

function StringPuppet({ wood, red, gold }: { wood: JSX.Element; red: JSX.Element; gold: JSX.Element }) {
  return <group>
    <mesh castShadow position={[0, 1.35, 0]}><sphereGeometry args={[0.23, 36, 32]} />{wood}</mesh>
    <mesh castShadow position={[0, 1.04, 0]}><coneGeometry args={[0.31, 0.48, 32]} />{red}</mesh>
    <mesh castShadow position={[0, 0.66, 0]}><cylinderGeometry args={[0.09, 0.12, 0.35, 24]} />{wood}</mesh>
    <mesh castShadow position={[-0.39, 0.99, 0]} rotation={[0, 0, 0.48]}><capsuleGeometry args={[0.07, 0.54, 8, 16]} />{wood}</mesh>
    <mesh castShadow position={[0.39, 0.99, 0]} rotation={[0, 0, -0.48]}><capsuleGeometry args={[0.07, 0.54, 8, 16]} />{wood}</mesh>
    <mesh castShadow position={[-0.11, 0.28, 0]}><cylinderGeometry args={[0.065, 0.075, 0.52, 20]} />{wood}</mesh>
    <mesh castShadow position={[0.11, 0.28, 0]}><cylinderGeometry args={[0.065, 0.075, 0.52, 20]} />{wood}</mesh>
    <mesh position={[0, 1.08, 0.27]}><torusGeometry args={[0.16, 0.022, 8, 32]} />{gold}</mesh>
    <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[0.025, 0.025, 1.1, 12]} /><meshStandardMaterial color="#b79b6a" roughness={0.7} /></mesh>
    {[-0.42, 0.42].map((x) => <mesh key={x} position={[x, 0.98, 0]}><cylinderGeometry args={[0.012, 0.012, 0.72, 8]} /><meshStandardMaterial color="#a58d67" roughness={0.8} /></mesh>)}
  </group>;
}

function createRoughnessTexture(surface: CanvasTexture, type: 'wood' | 'clay') {
  const source = surface.image as HTMLCanvasElement;
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas roughness context unavailable');
  context.drawImage(source, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const baseRoughness = type === 'clay' ? 236 : 207;
  for (let index = 0; index < image.data.length; index += 4) {
    const grain = (image.data[index] + image.data[index + 1] + image.data[index + 2]) / 3;
    const value = Math.max(0, Math.min(255, baseRoughness + (grain - 128) * 0.12));
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.copy(surface.repeat);
  texture.colorSpace = NoColorSpace;
  return texture;
}

function createSurfaceTexture(type: 'wood' | 'clay') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas texture context unavailable');

  const gradient = context.createLinearGradient(0, 0, 512, 512);
  if (type === 'wood') {
    gradient.addColorStop(0, '#704326');
    gradient.addColorStop(0.48, '#bd8450');
    gradient.addColorStop(1, '#86502f');
  } else {
    gradient.addColorStop(0, '#793a27');
    gradient.addColorStop(0.52, '#be6843');
    gradient.addColorStop(1, '#914b31');
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  for (let index = 0; index < 180; index += 1) {
    const y = Math.random() * 512;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(150, y + Math.random() * 18 - 9, 340, y + Math.random() * 18 - 9, 512, y + Math.random() * 16 - 8);
    context.strokeStyle = type === 'wood' ? `rgba(49, 26, 15, ${Math.random() * 0.17})` : `rgba(70, 28, 17, ${Math.random() * 0.13})`;
    context.lineWidth = Math.random() * (type === 'wood' ? 2.6 : 1.5) + 0.25;
    context.stroke();
  }
  for (let index = 0; index < 420; index += 1) {
    context.fillStyle = `rgba(${type === 'wood' ? '246, 204, 135' : '232, 160, 111'}, ${Math.random() * 0.15})`;
    context.beginPath();
    context.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.8 + 0.3, 0, Math.PI * 2);
    context.fill();
  }
  if (type === 'clay') {
    for (let index = 0; index < 22; index += 1) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + Math.random() * 8 - 4, y + 6 + Math.random() * 10, x + Math.random() * 15 - 7, y + 12 + Math.random() * 14);
      context.strokeStyle = `rgba(57, 26, 17, ${Math.random() * 0.2 + 0.08})`;
      context.lineWidth = Math.random() * 0.8 + 0.35;
      context.stroke();
    }
  } else {
    for (let index = 0; index < 7; index += 1) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      context.beginPath();
      context.ellipse(x, y, 3 + Math.random() * 5, 1 + Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(60, 32, 18, 0.24)';
      context.lineWidth = 1;
      context.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.5, 1.2);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
