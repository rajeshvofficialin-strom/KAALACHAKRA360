import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import { CanvasTexture, CatmullRomCurve3, RepeatWrapping, SRGBColorSpace, Vector3 } from 'three';

type GameId = 'royal-ur' | 'hnefatafl' | 'petteia' | 'mehen' | 'patolli' | 'chaturanga' | 'puluc' | 'sugoroku' | 'pallankuzhi' | 'rota' | 'chowka-bhara' | 'hyena-game' | 'tlachtli' | 'episkyros' | 'harpastum';
type Point = [number, number, number];

const clayGames = new Set<GameId>(['mehen', 'patolli', 'tlachtli']);
const bronze = '#bc9252';
const ivory = '#ead8b4';

export default function AncientGameCardVisual({ gameId, name }: { gameId: GameId; name: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '320px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} role="img" aria-label={`${name}, 3D digital reconstruction`} className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg border border-amber-700/25 bg-[radial-gradient(ellipse_at_50%_25%,#55402b_0%,#201b16_45%,#0d0d0c_100%)]">
      {visible ? (
        <Canvas frameloop="demand" dpr={1} shadows camera={{ position: [3.7, 3.9, 4.8], fov: 38 }} gl={{ antialias: true, alpha: true }}>
          <color attach="background" args={['#171410']} />
          <ambientLight intensity={0.48} />
            <directionalLight castShadow position={[3.5, 6, 4]} intensity={2.7} color="#ffe4b5" shadow-mapSize-width={768} shadow-mapSize-height={768} />
            <spotLight position={[-3, 4, -3]} intensity={2} angle={0.7} penumbra={0.9} color="#d9a75f" />
            <spotLight position={[3, 3, -3]} intensity={1.05} angle={0.75} penumbra={1} color="#c5d0d2" />
          <pointLight position={[0, 1.7, 3]} intensity={0.35} color="#a9c6d0" />
          <Scene gameId={gameId} />
          <ContactShadows position={[0, -0.04, 0]} opacity={0.62} scale={5.5} blur={2.4} far={3} resolution={256} />
          <ThumbCamera />
        </Canvas>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgba(198,144,70,0.13),transparent_48%)]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080b12]/65 via-transparent to-[#090a0b]/10" />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-amber-200/15 bg-black/45 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.12em] text-amber-100/65 backdrop-blur-sm">Digital reconstruction</div>
    </div>
  );
}

function ThumbCamera() {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0.18, 0);
    camera.updateProjectionMatrix();
    invalidate();
    const frame = requestAnimationFrame(invalidate);
    return () => cancelAnimationFrame(frame);
  }, [camera, invalidate]);
  return null;
}

function Scene({ gameId }: { gameId: GameId }) {
  const surfaceType = clayGames.has(gameId) ? 'clay' : 'wood';
  const surface = useMemo(() => makeGrain(surfaceType, gameId), [gameId, surfaceType]);
  useEffect(() => () => surface.dispose(), [surface]);

  return <group position={[0, -0.08, 0]}>
    <mesh receiveShadow position={[0, -0.17, 0]}><cylinderGeometry args={[1.9, 2, 0.2, 48]} /><meshStandardMaterial color="#211c16" roughness={0.58} metalness={0.12} /></mesh>
    <mesh position={[0, -0.06, 0]}><torusGeometry args={[1.82, 0.013, 8, 64]} /><meshStandardMaterial color={bronze} metalness={0.62} roughness={0.34} /></mesh>
    {gameId === 'royal-ur' && <UrBoard texture={surface} />}
    {gameId === 'hnefatafl' && <GridGame texture={surface} variant="hnefatafl" />}
    {gameId === 'petteia' && <GridGame texture={surface} variant="petteia" />}
    {gameId === 'mehen' && <MehenBoard texture={surface} />}
    {gameId === 'patolli' && <PatolliBoard texture={surface} />}
    {gameId === 'chaturanga' && <GridGame texture={surface} variant="chaturanga" />}
    {gameId === 'puluc' && <PulucBoard texture={surface} />}
    {gameId === 'sugoroku' && <SugorokuBoard texture={surface} />}
    {gameId === 'pallankuzhi' && <PallankuzhiBoard texture={surface} />}
    {gameId === 'rota' && <RotaBoard texture={surface} />}
    {gameId === 'chowka-bhara' && <ChowkaBoard texture={surface} />}
    {gameId === 'hyena-game' && <HyenaBoard texture={surface} />}
    {gameId === 'tlachtli' && <Ballcourt />}
    {gameId === 'episkyros' && <EpiskyrosField />}
    {gameId === 'harpastum' && <HarpastumCourt />}
  </group>;
}

function Plank({ texture, size = [3.35, 0.2, 2.35] }: { texture: CanvasTexture; size?: [number, number, number] }) {
  const top = size[1] / 2 + 0.009;
  const railX = size[0] / 2 - 0.1;
  const railZ = size[2] / 2 - 0.1;
  return <group>
    <RoundedBox args={size} radius={0.065} smoothness={3} castShadow receiveShadow>
      <meshPhysicalMaterial map={texture} bumpMap={texture} color="#fff0d6" roughness={0.72} bumpScale={0.025} clearcoat={0.12} />
    </RoundedBox>
    <mesh position={[0, top, -railZ]}><boxGeometry args={[size[0] - 0.16, 0.014, 0.018]} /><meshPhysicalMaterial color="#bd9659" metalness={0.68} roughness={0.37} /></mesh>
    <mesh position={[0, top, railZ]}><boxGeometry args={[size[0] - 0.16, 0.014, 0.018]} /><meshPhysicalMaterial color="#bd9659" metalness={0.68} roughness={0.37} /></mesh>
    <mesh position={[-railX, top, 0]}><boxGeometry args={[0.018, 0.014, size[2] - 0.16]} /><meshPhysicalMaterial color="#bd9659" metalness={0.68} roughness={0.37} /></mesh>
    <mesh position={[railX, top, 0]}><boxGeometry args={[0.018, 0.014, size[2] - 0.16]} /><meshPhysicalMaterial color="#bd9659" metalness={0.68} roughness={0.37} /></mesh>
    {[-1, 1].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}-${z}`} position={[x * railX, top + 0.008, z * railZ]}><sphereGeometry args={[0.025, 12, 10]} /><meshPhysicalMaterial color="#ddbd7c" metalness={0.66} roughness={0.34} /></mesh>))}
  </group>;
}

function Tile({ at, color = '#72533a', width = 0.27, depth = 0.25 }: { at: Point; color?: string; width?: number; depth?: number }) {
  return <RoundedBox args={[width, 0.035, depth]} radius={0.018} smoothness={2} position={at} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
  </RoundedBox>;
}

function Man({ at, color = ivory, height = 0.22, radius = 0.095 }: { at: Point; color?: string; height?: number; radius?: number }) {
  return <group position={at}>
    <mesh castShadow position={[0, height * 0.25, 0]}><cylinderGeometry args={[radius * 1.08, radius * 1.28, height * 0.5, 24]} /><meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.22} /></mesh>
    <mesh castShadow position={[0, height * 0.67, 0]}><sphereGeometry args={[radius * 0.8, 24, 18]} /><meshPhysicalMaterial color={color} roughness={0.34} clearcoat={0.28} /></mesh>
    <mesh position={[0, height * 0.68 + radius * 0.79, 0]}><sphereGeometry args={[radius * 0.12, 12, 10]} /><meshStandardMaterial color={bronze} metalness={0.52} roughness={0.36} /></mesh>
  </group>;
}

function UrBoard({ texture }: { texture: CanvasTexture }) {
  const route: Point[] = [[-1.18, 0.2, -0.66], [-0.82, 0.2, -0.66], [-0.46, 0.2, -0.66], [-0.1, 0.2, -0.66], [0.26, 0.2, -0.66], [0.62, 0.2, -0.66], [0.98, 0.2, -0.66], [-0.1, 0.2, -0.28], [0.26, 0.2, -0.28], [0.62, 0.2, -0.28], [0.98, 0.2, -0.28], [0.98, 0.2, 0.1], [0.62, 0.2, 0.1], [0.26, 0.2, 0.1], [-0.1, 0.2, 0.1], [-0.46, 0.2, 0.1], [-0.82, 0.2, 0.1], [-1.18, 0.2, 0.1], [-0.46, 0.2, 0.48], [-0.1, 0.2, 0.48]];
  return <group rotation={[0, -0.08, 0]}>
    <Plank texture={texture} size={[3.55, 0.23, 1.75]} />
    {route.map((at, index) => <group key={index}>
      <Tile at={at} width={0.31} depth={0.31} color={new Set([3, 7, 13, 18]).has(index) ? '#906d42' : index % 2 ? '#47372b' : '#5e4734'} />
      {new Set([3, 7, 13, 18]).has(index) && <mesh position={[at[0], at[1] + 0.035, at[2]]}><circleGeometry args={[0.07, 28]} /><meshStandardMaterial color={bronze} emissive="#8d5728" emissiveIntensity={0.2} metalness={0.62} roughness={0.32} /></mesh>}
    </group>)}
    {[[-1.15, 0.38, 0.58], [-0.89, 0.38, 0.58], [0.4, 0.38, -0.28], [0.66, 0.38, -0.28]].map((at, index) => <Man key={index} at={at as Point} color={index % 2 ? '#d4b36f' : '#8d3f30'} />)}
    <Dice at={[1.35, 0.35, 0.48]} />
  </group>;
}

function GridGame({ texture, variant }: { texture: CanvasTexture; variant: 'hnefatafl' | 'petteia' | 'chaturanga' }) {
  const n = variant === 'hnefatafl' ? 9 : 8;
  const tileSize = 2.35 / (n - 1);
  const tokens: { row: number; col: number; side: number; king?: boolean; role?: string }[] = [];
  if (variant === 'hnefatafl') {
    [[0, 3], [0, 4], [0, 5], [1, 4], [8, 3], [8, 4], [8, 5], [7, 4], [3, 0], [4, 0], [5, 0], [4, 1], [3, 8], [4, 8], [5, 8], [4, 7]].forEach(([row, col]) => tokens.push({ row, col, side: 0 }));
    [[4, 4], [3, 4], [5, 4], [4, 3], [4, 5], [3, 3], [3, 5], [5, 3], [5, 5]].forEach(([row, col], index) => tokens.push({ row, col, side: 1, king: index === 0 }));
  } else if (variant === 'petteia') {
    for (let i = 0; i < 8; i += 1) { tokens.push({ row: 0, col: i, side: 0 }); tokens.push({ row: 7, col: i, side: 1 }); }
    [1, 3, 4, 6].forEach((col) => { tokens.push({ row: 1, col, side: 0 }); tokens.push({ row: 6, col, side: 1 }); });
  } else {
    for (let col = 0; col < 8; col += 1) {
      const roles = ['rook', 'knight', 'bishop', 'king', 'bishop', 'knight', 'rook', 'pawn'];
      tokens.push({ row: 0, col, side: 0, role: roles[col] }, { row: 1, col, side: 0, role: 'pawn' });
      tokens.push({ row: 7, col, side: 1, role: roles[col] }, { row: 6, col, side: 1, role: 'pawn' });
    }
  }
  return <group>
    <Plank texture={texture} size={[2.95, 0.23, 2.95]} />
    {Array.from({ length: n * n }, (_, index) => {
      const row = Math.floor(index / n); const col = index % n; const isLight = (row + col) % 2 === 0;
      return <Tile key={index} at={[(col - (n - 1) / 2) * tileSize, 0.145, (row - (n - 1) / 2) * tileSize]} width={tileSize * 0.97} depth={tileSize * 0.97} color={variant === 'hnefatafl' ? isLight ? '#886648' : '#533d2e' : variant === 'petteia' ? isLight ? '#806346' : '#46362a' : isLight ? '#c2a779' : '#5b3928'} />;
    })}
    {variant === 'hnefatafl' && <Tile at={[0, 0.185, 0]} width={0.33} depth={0.33} color="#b18a4e" />}
    {tokens.map((token, index) => {
      const at: Point = [(token.col - (n - 1) / 2) * tileSize, 0.19, (token.row - (n - 1) / 2) * tileSize];
      return <ChessPiece key={index} at={at} color={token.side === 0 ? variant === 'hnefatafl' ? '#363531' : '#302b25' : '#e2d0ae'} role={token.role} king={token.king} />;
    })}
    {variant === 'chaturanga' && <mesh position={[0, 0.17, -1.37]}><boxGeometry args={[2.7, 0.025, 0.08]} /><meshStandardMaterial color="#982f25" roughness={0.52} /></mesh>}
  </group>;
}

function ChessPiece({ at, color, role, king = false }: { at: Point; color: string; role?: string; king?: boolean }) {
  const tall = king || role === 'king' || role === 'rook' || role === 'bishop';
  return <group position={[at[0], at[1], at[2]]}>
    <mesh castShadow position={[0, 0.04, 0]}><cylinderGeometry args={[0.09, 0.115, 0.075, 20]} /><meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.28} /></mesh>
    {king ? <>
      <mesh castShadow position={[0, 0.17, 0]}><cylinderGeometry args={[0.075, 0.11, 0.2, 24]} /><meshPhysicalMaterial color={color} roughness={0.37} clearcoat={0.3} /></mesh>
      <mesh castShadow position={[0, 0.32, 0]}><sphereGeometry args={[0.09, 22, 18]} /><meshStandardMaterial color={bronze} metalness={0.48} roughness={0.36} /></mesh>
    </> : role === 'knight' ? <mesh castShadow position={[0, 0.2, 0]} rotation={[0, 0, -0.16]}><capsuleGeometry args={[0.065, 0.2, 6, 12]} /><meshPhysicalMaterial color={color} roughness={0.43} /></mesh> : <>
      <mesh castShadow position={[0, tall ? 0.16 : 0.115, 0]}><cylinderGeometry args={[0.06, 0.085, tall ? 0.21 : 0.13, 20]} /><meshPhysicalMaterial color={color} roughness={0.43} clearcoat={0.2} /></mesh>
      {tall && <mesh castShadow position={[0, 0.31, 0]}><coneGeometry args={[0.082, 0.13, role === 'rook' ? 4 : 20]} /><meshPhysicalMaterial color={bronze} metalness={0.28} roughness={0.42} /></mesh>}
    </>}
  </group>;
}

function MehenBoard({ texture }: { texture: CanvasTexture }) {
  const coil = useMemo(() => new CatmullRomCurve3(Array.from({ length: 130 }, (_, index) => { const t = index / 129; const angle = t * Math.PI * 5.2; const radius = 1.22 * (1 - t * 0.84); return new Vector3(Math.cos(angle) * radius, 0.16, Math.sin(angle) * radius); }), false), []);
  return <group>
    <Plank texture={texture} size={[2.95, 0.22, 2.95]} />
    <mesh castShadow><tubeGeometry args={[coil, 240, 0.105, 12, false]} /><meshPhysicalMaterial color="#b98543" roughness={0.48} metalness={0.19} /></mesh>
    <mesh castShadow position={[0, 0.23, 0]}><sphereGeometry args={[0.16, 32, 24]} /><meshPhysicalMaterial color="#ba4a31" roughness={0.43} clearcoat={0.2} /></mesh>
    {[0.35, 0.7, 1.05, 1.37].map((angle, index) => <Man key={angle} at={[Math.cos(angle * 2) * (0.95 - index * 0.14), 0.23, Math.sin(angle * 2) * (0.95 - index * 0.14)]} color={index % 2 ? ivory : '#b44c31'} radius={0.075} />)}
  </group>;
}

function PatolliBoard({ texture }: { texture: CanvasTexture }) {
  const cells: Point[] = [];
  for (let index = -2; index <= 2; index += 1) {
    cells.push([index * 0.3, 0.2, -0.72], [index * 0.3, 0.2, 0.72], [-0.72, 0.2, index * 0.3], [0.72, 0.2, index * 0.3]);
  }
  return <group rotation={[0, 0, 0.08]}>
    <Plank texture={texture} size={[3, 0.23, 3]} />
    <Tile at={[0, 0.17, 0]} width={0.84} depth={0.84} color="#8a5732" />
    {cells.map((at, index) => <group key={index}><Tile at={at} color={index % 3 === 0 ? '#9b7047' : '#68432f'} width={0.22} depth={0.22} />{index % 4 === 0 && <mesh position={[at[0], 0.23, at[2]]}><circleGeometry args={[0.047, 20]} /><meshStandardMaterial color={bronze} metalness={0.32} roughness={0.42} /></mesh>}</group>)}
    {[-1, 1].map((side) => <group key={side}>{[0, 1, 2].map((index) => <Man key={index} at={[side * (0.15 + index * 0.11), 0.24, side * 0.12]} color={side > 0 ? '#a44835' : '#d1ad66'} radius={0.075} />)}</group>)}
    <Dice at={[1.08, 0.34, -0.95]} />
  </group>;
}

function PulucBoard({ texture }: { texture: CanvasTexture }) {
  return <group>
    <Plank texture={texture} size={[3.5, 0.23, 1.65]} />
    {Array.from({ length: 11 }, (_, index) => <group key={index}>
      <Tile at={[-1.48 + index * 0.296, 0.19, 0]} width={0.255} depth={0.66} color={index % 2 ? '#765338' : '#9a7546'} />
      {index % 2 === 0 && <mesh position={[-1.48 + index * 0.296, 0.225, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.07, 0.012, 6, 20]} /><meshStandardMaterial color={bronze} metalness={0.45} roughness={0.38} /></mesh>}
    </group>)}
    {[-1.15, -0.6, 0.65, 1.2].map((x, index) => <group key={x} position={[x, 0.23, index % 2 ? 0.22 : -0.22]} rotation={[0, 0, 0.14]}><mesh castShadow><capsuleGeometry args={[0.09, 0.2, 8, 16]} /><meshPhysicalMaterial color={index % 2 ? ivory : '#a64d36'} roughness={0.42} /></mesh><mesh position={[0, 0.09, 0.075]}><sphereGeometry args={[0.035, 16, 12]} /><meshStandardMaterial color={bronze} metalness={0.4} /></mesh></group>)}
    <Dice at={[-1.42, 0.37, 0.58]} />
  </group>;
}

function SugorokuBoard({ texture }: { texture: CanvasTexture }) {
  const path = Array.from({ length: 18 }, (_, index): Point => {
    const row = Math.floor(index / 6); const col = index % 6; const actualCol = row % 2 ? 5 - col : col;
    return [-1.2 + actualCol * 0.48, 0.2, -0.78 + row * 0.46];
  });
  return <group rotation={[0.02, -0.12, 0]}>
    <Plank texture={texture} size={[3.45, 0.23, 2.65]} />
    {path.map((at, index) => <group key={index}><Tile at={at} width={0.34} depth={0.3} color={index % 5 === 0 ? '#a27649' : '#604b37'} />{index % 4 === 0 && <mesh position={[at[0], 0.226, at[2]]}><circleGeometry args={[0.045, 18]} /><meshStandardMaterial color={index % 8 === 0 ? '#8f493b' : bronze} /></mesh>}</group>)}
    {[path[2], path[9], path[15]].map((at, index) => <mesh key={index} position={[at[0], 0.25, at[2] - 0.08]}><boxGeometry args={[0.14, 0.018, 0.12]} /><meshStandardMaterial color={index === 1 ? '#a14e3e' : '#d0ae72'} roughness={0.75} /></mesh>)}
    <Man at={[path[4][0], 0.24, path[4][2]]} color="#d2ae67" />
    <Man at={[path[11][0], 0.24, path[11][2]]} color="#a24434" />
    <Dice at={[1.25, 0.34, 0.92]} />
  </group>;
}

function PallankuzhiBoard({ texture }: { texture: CanvasTexture }) {
  return <group>
    <Plank texture={texture} size={[3.55, 0.27, 1.65]} />
    <mesh position={[0, 0.2, 0]}><boxGeometry args={[3.2, 0.045, 1.25]} /><meshStandardMaterial color="#392a20" roughness={0.8} /></mesh>
    {[0, 1].flatMap((row) => Array.from({ length: 7 }, (_, col) => {
      const x = -1.32 + col * 0.44; const z = row === 0 ? -0.33 : 0.33;
      return <group key={`${row}-${col}`}>
        <mesh position={[x, 0.23, z]} rotation={[-Math.PI / 2, 0, 0]}><sphereGeometry args={[0.16, 32, 22, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#a47b4c" roughness={0.72} /></mesh>
        <mesh position={[x, 0.246, z]}><circleGeometry args={[0.105, 26]} /><meshStandardMaterial color="#251d18" roughness={0.92} /></mesh>
        {Array.from({ length: 3 + (col + row) % 3 }, (_, seed) => <mesh key={seed} castShadow position={[x + (seed - 1) * 0.043, 0.265 + (seed % 2) * 0.018, z + (seed % 2 ? 0.026 : -0.026)]}><sphereGeometry args={[0.028, 14, 12]} /><meshPhysicalMaterial color={seed % 2 ? '#c7a363' : '#e0c48b'} roughness={0.31} clearcoat={0.25} /></mesh>)}
      </group>;
    }))}
  </group>;
}

function RotaBoard({ texture }: { texture: CanvasTexture }) {
  const coords: Point[] = [[-1.05, 0.22, -0.75], [0, 0.22, -0.75], [1.05, 0.22, -0.75], [-1.05, 0.22, 0], [0, 0.22, 0], [1.05, 0.22, 0], [-1.05, 0.22, 0.75], [0, 0.22, 0.75], [1.05, 0.22, 0.75]];
  return <group>
    <Plank texture={texture} size={[2.9, 0.23, 2.25]} />
    {[0.55, 1.05].map((size) => <mesh key={size} position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[size, 0.018, 8, 64]} /><meshStandardMaterial color={bronze} metalness={0.55} roughness={0.42} /></mesh>)}
    {[-1, 0, 1].map((offset) => <group key={offset}><mesh position={[0, 0.235, offset * 0.75]}><boxGeometry args={[2.1, 0.025, 0.025]} /><meshStandardMaterial color="#b4925a" metalness={0.32} roughness={0.52} /></mesh><mesh position={[offset * 1.05, 0.235, 0]}><boxGeometry args={[0.025, 0.025, 1.5]} /><meshStandardMaterial color="#b4925a" metalness={0.32} roughness={0.52} /></mesh></group>)}
    {coords.map((at, index) => <group key={index}><mesh position={at}><cylinderGeometry args={[0.065, 0.065, 0.035, 20]} /><meshStandardMaterial color="#322920" /></mesh>{index < 3 && <Man at={[at[0], 0.255, at[2]]} radius={0.07} color={index % 2 ? '#d7bd88' : '#3c3932'} />}</group>)}
  </group>;
}

function ChowkaBoard({ texture }: { texture: CanvasTexture }) {
  const cells: Point[] = [];
  for (let row = 0; row < 5; row += 1) for (let col = 0; col < 5; col += 1) if (row === 2 || col === 2) cells.push([-0.96 + col * 0.48, 0.2, -0.96 + row * 0.48]);
  return <group rotation={[0, -0.1, 0]}>
    <Plank texture={texture} size={[2.75, 0.23, 2.75]} />
    {cells.map((at, index) => <group key={index}><Tile at={at} width={0.43} depth={0.43} color={(index + Math.round(at[0] * 10)) % 2 ? '#8c6846' : '#4c392c'} />{index % 4 === 0 && <mesh position={[at[0], 0.23, at[2]]}><circleGeometry args={[0.06, 20]} /><meshStandardMaterial color={bronze} metalness={0.48} roughness={0.4} /></mesh>}</group>)}
    {[-0.72, -0.24, 0.24, 0.72].map((x, index) => <Man key={x} at={[x, 0.25, 0]} color={index % 2 ? '#9e4435' : '#d7bc84'} radius={0.074} />)}
    <Dice at={[1.16, 0.34, -1.08]} />
  </group>;
}

function HyenaBoard({ texture }: { texture: CanvasTexture }) {
  const track: Point[] = [...Array.from({ length: 7 }, (_, index): Point => [-1.2 + index * 0.4, 0.2, -0.75]), ...Array.from({ length: 5 }, (_, index): Point => [1.2, 0.2, -0.35 + index * 0.35]), ...Array.from({ length: 7 }, (_, index): Point => [1.2 - index * 0.4, 0.2, 1.05]), ...Array.from({ length: 5 }, (_, index): Point => [-1.2, 0.2, 0.7 - index * 0.35])];
  return <group>
    <Plank texture={texture} size={[3.25, 0.23, 2.65]} />
    {track.map((at, index) => <Tile key={index} at={at} width={0.29} depth={0.28} color={index % 5 === 0 ? '#9d7548' : '#544235'} />)}
    <mesh castShadow position={[0, 0.28, 0]}><cylinderGeometry args={[0.36, 0.4, 0.18, 32]} /><meshStandardMaterial color="#3f2a1b" roughness={0.9} /></mesh>
    <mesh position={[0, 0.375, 0]}><cylinderGeometry args={[0.28, 0.28, 0.025, 32]} /><meshStandardMaterial color="#0d0e0d" roughness={0.95} /></mesh>
    <mesh castShadow position={[-0.65, 0.3, 0]} rotation={[0, 0, -0.24]}><capsuleGeometry args={[0.13, 0.2, 8, 16]} /><meshPhysicalMaterial color="#37342d" roughness={0.58} /></mesh>
    {[track[0], track[1], track[2], track[track.length - 2]].map((at, index) => <Man key={index} at={[at[0], 0.24, at[2]]} color={index === 3 ? '#38352e' : '#d3b276'} radius={0.065} />)}
  </group>;
}

function Ballcourt() {
  return <group>
    <Ground color="#706045" />
    <RoundedBox args={[3.25, 0.2, 1.4]} radius={0.035} position={[0, 0.08, 0]} castShadow><meshStandardMaterial color="#74634b" roughness={0.86} /></RoundedBox>
    {[-1.46, 1.46].map((x) => <group key={x} position={[x, 0.44, 0]}><mesh castShadow><boxGeometry args={[0.2, 0.85, 1.65]} /><meshStandardMaterial color="#796a55" roughness={0.82} /></mesh><mesh position={[x > 0 ? -0.11 : 0.11, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.19, 0.055, 12, 36]} /><meshStandardMaterial color="#665b4c" roughness={0.76} /></mesh></group>)}
    {[-1.15, -0.7, 0.7, 1.15].map((x, index) => <PlayerFigure key={x} at={[x, 0.2, index < 2 ? -0.3 : 0.3]} color={index < 2 ? '#a73e2d' : '#d0a34c'} />)}
    <mesh castShadow position={[0, 0.36, 0.02]}><sphereGeometry args={[0.16, 28, 24]} /><meshPhysicalMaterial color="#251e19" roughness={0.5} /></mesh>
    {[-1.3, 1.3].map((x) => <mesh key={x} position={[x, 0.97, 0]}><cylinderGeometry args={[0.045, 0.045, 0.95, 16]} /><meshStandardMaterial color="#a78b5d" roughness={0.72} /></mesh>)}
  </group>;
}

function EpiskyrosField() {
  return <group>
    <Ground color="#384332" />
    <mesh receiveShadow position={[0, 0.025, 0]}><boxGeometry args={[3.8, 0.03, 2.15]} /><meshStandardMaterial color="#746748" roughness={0.95} /></mesh>
    {[-1.75, -0.9, 0, 0.9, 1.75].map((x) => <mesh key={x} position={[x, 0.045, 0]}><boxGeometry args={[0.025, 0.008, 2.08]} /><meshStandardMaterial color="#c7b786" roughness={0.8} /></mesh>)}
    {[-1, -0.55, 0.55, 1].map((x, index) => <PlayerFigure key={x} at={[x, 0.05, index % 2 ? -0.35 : 0.35]} color={index < 2 ? '#b74736' : '#d2b270'} />)}
    <mesh castShadow position={[0, 0.29, 0]} rotation={[0, 0, 0.3]}><sphereGeometry args={[0.15, 26, 20]} /><meshPhysicalMaterial color="#6b452b" roughness={0.7} /></mesh>
    <GroundPillar at={[-1.8, 0, -0.95]} /><GroundPillar at={[1.8, 0, -0.95]} />
  </group>;
}

function HarpastumCourt() {
  return <group>
    <Ground color="#564734" />
    <mesh receiveShadow position={[0, 0.03, 0]}><boxGeometry args={[3.7, 0.03, 2.15]} /><meshStandardMaterial color="#826b49" roughness={0.92} /></mesh>
    {[-1.45, 1.45].map((x) => <group key={x}>{[-0.85, 0.85].map((z) => <GroundPillar key={z} at={[x, 0.05, z]} />)}</group>)}
    {[-1.05, -0.55, 0.55, 1.05].map((x, index) => <PlayerFigure key={x} at={[x, 0.04, index % 2 ? -0.34 : 0.34]} color={index % 2 ? '#b14534' : '#a98b5d'} />)}
    <mesh castShadow position={[0.1, 0.27, -0.03]} rotation={[0.3, 0.1, -0.24]}><dodecahedronGeometry args={[0.16, 1]} /><meshPhysicalMaterial color="#805533" roughness={0.69} bumpScale={0.03} /></mesh>
    <mesh receiveShadow position={[0, 0.05, -1.05]}><boxGeometry args={[3.5, 0.42, 0.08]} /><meshStandardMaterial color="#615342" roughness={0.84} /></mesh>
  </group>;
}

function PlayerFigure({ at, color }: { at: Point; color: string }) {
  return <group position={at}>
    <mesh castShadow position={[0, 0.24, 0]}><capsuleGeometry args={[0.11, 0.25, 8, 14]} /><meshPhysicalMaterial color={color} roughness={0.65} /></mesh>
    <mesh castShadow position={[0, 0.52, 0]}><sphereGeometry args={[0.105, 24, 20]} /><meshPhysicalMaterial color="#b88761" roughness={0.68} /></mesh>
    <mesh castShadow position={[0, 0.62, 0]} scale={[1, 0.42, 1]}><sphereGeometry args={[0.105, 22, 16]} /><meshPhysicalMaterial color="#493329" roughness={0.8} /></mesh>
    <mesh position={[0, 0.3, 0.095]} rotation={[0.08, 0, -0.18]}><boxGeometry args={[0.13, 0.028, 0.018]} /><meshStandardMaterial color="#d9bd7e" metalness={0.22} roughness={0.48} /></mesh>
      {[-1.46, 1.46].map((x) => <group key={x} position={[x, 0.44, 0]}><mesh castShadow><boxGeometry args={[0.2, 0.85, 1.65]} /><meshStandardMaterial color="#796a55" roughness={0.82} /></mesh><mesh position={[x > 0 ? -0.11 : 0.11, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.19, 0.055, 16, 48]} /><meshStandardMaterial color="#665b4c" roughness={0.76} /></mesh><mesh position={[x > 0 ? -0.108 : 0.108, 0.29, 0]}><boxGeometry args={[0.02, 0.11, 0.76]} /><meshStandardMaterial color="#a48a60" roughness={0.76} /></mesh></group>)}
    <mesh castShadow position={[-0.16, 0.22, 0.02]} rotation={[0, 0, 0.3]}><capsuleGeometry args={[0.035, 0.18, 6, 10]} /><meshStandardMaterial color="#b88761" roughness={0.68} /></mesh>
    <mesh castShadow position={[0.16, 0.22, -0.02]} rotation={[0, 0, -0.42]}><capsuleGeometry args={[0.035, 0.18, 6, 10]} /><meshStandardMaterial color="#b88761" roughness={0.68} /></mesh>
    <mesh castShadow position={[-0.075, 0.035, 0]}><cylinderGeometry args={[0.045, 0.055, 0.12, 12]} /><meshStandardMaterial color="#65412d" roughness={0.75} /></mesh>
    <mesh castShadow position={[0.075, 0.035, 0]}><cylinderGeometry args={[0.045, 0.055, 0.12, 12]} /><meshStandardMaterial color="#65412d" roughness={0.75} /></mesh>
  </group>;
}

function Ground({ color }: { color: string }) {
  return <mesh receiveShadow position={[0, -0.015, 0]}><cylinderGeometry args={[2, 2, 0.12, 48]} /><meshStandardMaterial color={color} roughness={0.92} /></mesh>;
}

function GroundPillar({ at }: { at: Point }) {
  return <group position={at}><mesh castShadow position={[0, 0.3, 0]}><cylinderGeometry args={[0.09, 0.13, 0.55, 12]} /><meshStandardMaterial color="#857052" roughness={0.8} /></mesh><mesh castShadow position={[0, 0.59, 0]}><cylinderGeometry args={[0.15, 0.15, 0.08, 12]} /><meshStandardMaterial color="#9b835a" roughness={0.7} /></mesh></group>;
}

function Dice({ at }: { at: Point }) {
  return <group position={at} rotation={[0.35, 0.25, 0.12]}>
    <RoundedBox args={[0.21, 0.21, 0.21]} radius={0.035} smoothness={3} castShadow><meshPhysicalMaterial color="#e4d4b7" roughness={0.34} clearcoat={0.2} /></RoundedBox>
    <mesh position={[0, 0, 0.109]}><circleGeometry args={[0.018, 12]} /><meshStandardMaterial color="#32271d" /></mesh>
    <mesh position={[0.108, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.018, 12]} /><meshStandardMaterial color="#32271d" /></mesh>
  </group>;
}

function makeGrain(type: 'wood' | 'clay', seedText: string) {
  let seed = [...seedText].reduce((sum, character) => sum + character.charCodeAt(0), 13);
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create game card material texture');
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  if (type === 'wood') {
    gradient.addColorStop(0, '#754a2c'); gradient.addColorStop(0.45, '#bb8951'); gradient.addColorStop(1, '#835332');
  } else {
    gradient.addColorStop(0, '#713d2b'); gradient.addColorStop(0.5, '#b46d49'); gradient.addColorStop(1, '#895039');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  for (let index = 0; index < 105; index += 1) {
    const y = random() * 256;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(80, y + random() * 12 - 6, 168, y + random() * 10 - 5, 256, y + random() * 8 - 4);
    ctx.strokeStyle = type === 'wood' ? `rgba(43,25,15,${random() * 0.18})` : `rgba(55,25,17,${random() * 0.14})`;
    ctx.lineWidth = 0.35 + random() * 1.8; ctx.stroke();
  }
  for (let index = 0; index < 220; index += 1) {
    ctx.fillStyle = `rgba(239,207,155,${random() * 0.13})`; ctx.beginPath(); ctx.arc(random() * 256, random() * 256, 0.35 + random() * 1.3, 0, Math.PI * 2); ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping; texture.wrapT = RepeatWrapping; texture.repeat.set(1.25, 1); texture.colorSpace = SRGBColorSpace;
  return texture;
}

