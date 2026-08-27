import { parkConfig as C } from '../config';

const PAVE    = '#d8cfbe'; // Light beige / sandstone
const ARCH    = '#989088'; // Muted concrete / stone
const PLANTER = '#3a3a3a'; // Dark stone edge
const WOOD    = '#8b5a2b'; // Warm natural wood
const METAL   = '#2a2a2a'; // Dark metal frame

function CurvedBench({ angle, dist = 3.8 }: { angle: number, dist?: number }) {
  const arc = 0.9; // ~51 degrees
  return (
    <group rotation={[0, angle, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[dist+0.25, dist-0.25, 0.06, 32, 1, false, Math.PI/2 - arc/2, arc]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[dist+0.35, dist+0.28, 0.25, 32, 1, false, Math.PI/2 - arc/2, arc]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Legs and Supports */}
      {[-0.35, 0.35].map((a, i) => {
        const theta = Math.PI/2 + a;
        return (
          <group key={i} position={[Math.cos(theta)*dist, 0, Math.sin(theta)*dist]} rotation={[0, -a, 0]}>
             <mesh position={[0, 0.22, 0]} castShadow>
               <boxGeometry args={[0.38, 0.44, 0.08]} />
               <meshStandardMaterial color={METAL} roughness={0.8} />
             </mesh>
             <mesh position={[0, 0.65, 0.18]} rotation={[0.2, 0, 0]} castShadow>
               <boxGeometry args={[0.06, 0.5, 0.06]} />
               <meshStandardMaterial color={METAL} roughness={0.8} />
             </mesh>
          </group>
        );
      })}
    </group>
  );
}

function LandmarkArch({ radius = 9.0 }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI/6, 0]} castShadow receiveShadow>
        {/* Torus defaults to XY plane, so Math.PI draws an arch from x=radius to x=-radius */}
        <torusGeometry args={[radius, 0.35, 16, 64, Math.PI]} />
        <meshStandardMaterial color={ARCH} roughness={0.8} />
      </mesh>
      {/* Base footings */}
      {[-1, 1].map((sign, i) => {
        const x = sign * radius * Math.cos(Math.PI/6);
        const z = sign * radius * -Math.sin(Math.PI/6);
        return (
          <mesh key={i} position={[x, 0.2, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color={ARCH} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function CentralPlanter({ r = 1.8 }) {
  return (
    <group>
      {/* Stone edge */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, 0.4, 32]} />
        <meshStandardMaterial color={PLANTER} roughness={0.9} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[r-0.1, r-0.1, 0.02, 32]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.95} />
      </mesh>
      {/* Shrubs inside */}
      {[0, 1.25, 2.5, 3.75, 5.0].map((a, i) => (
        <mesh key={`shrub-${i}`} position={[Math.cos(a)*0.9, 0.6, Math.sin(a)*0.9]} castShadow>
          <sphereGeometry args={[0.45, 8, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#4a8a3a" : "#6a9a3a"} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color="#3a7a2a" roughness={0.9} />
      </mesh>
      {/* Small flowers */}
      {[0.5, 1.8, 3.1, 4.4, 5.7].map((a, i) => (
        <mesh key={`flower-${i}`} position={[Math.cos(a)*1.4, 0.45, Math.sin(a)*1.4]} castShadow>
          <sphereGeometry args={[0.15, 5, 4]} />
          <meshStandardMaterial color="#d87a9a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function BollardLight({ x, z }: { x: number, z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
        <meshStandardMaterial color="#ffeedd" emissive="#ffc080" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.8} />
      </mesh>
      {/* Subtle point light without castShadow to respect WebGL limits */}
      <pointLight position={[0, 0.8, 0]} color="#ffb060" intensity={0.4} distance={6} decay={2} />
    </group>
  );
}

export default function RelaxationArea() {
  const { monumentCX: cx, monumentCZ: cz, monumentPlazaR: r } = C;
  
  return (
    <group position={[cx, 0, cz]}>
      {/* Flat circular paved plaza */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color={PAVE} roughness={0.9} />
      </mesh>

      <LandmarkArch radius={r - 0.5} />
      <CentralPlanter r={1.8} />

      {/* 3 Curved Benches forming a social circle */}
      <CurvedBench angle={0} />
      <CurvedBench angle={2.094} /> {/* 120 degrees */}
      <CurvedBench angle={4.188} /> {/* 240 degrees */}

      {/* Perimeter Bollard Lights */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const a = (i / 8) * Math.PI * 2 + Math.PI/8;
        const lx = Math.cos(a) * (r - 0.8);
        const lz = Math.sin(a) * (r - 0.8);
        return <BollardLight key={`bl-${i}`} x={lx} z={lz} />;
      })}
    </group>
  );
}
