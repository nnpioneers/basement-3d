import { useMemo } from 'react';

// CampfireArea.tsx — Fire pit gathering area with seating rocks

const STONE_C  = '#8a7a68';
const STONE_D  = '#6a6050';
const LOG_C    = '#5a3a1a';
const FIRE_IN  = '#ff8820';
const FIRE_OUT = '#ff4408';

interface FireAreaProps {
  cx: number;
  cz: number;
}

function StoneRing({ r = 1.1 }: { r?: number }) {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const jitter = 0.85 + (i * 7 % 5) * 0.06;
        return (
          <mesh key={i} position={[Math.cos(a) * r * jitter, 0.18, Math.sin(a) * r * jitter]}
            rotation={[0, a, 0.2 * ((i % 3) - 1)]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.28 + (i % 3) * 0.07, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? STONE_C : STONE_D} roughness={0.95} />
          </mesh>
        );
      })}
    </>
  );
}

function FireFlame() {
  return (
    <group position={[0, 0.28, 0]}>
      {/* Logs cross */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 1.2, 7]} />
        <meshStandardMaterial color={LOG_C} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 1.2, 7]} />
        <meshStandardMaterial color={LOG_C} roughness={0.95} />
      </mesh>

      {/* Outer flame cone */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.45, 1.1, 8]} />
        <meshStandardMaterial color={FIRE_OUT} roughness={0.4} emissive={FIRE_OUT} emissiveIntensity={1.2} transparent opacity={0.85} />
      </mesh>
      {/* Mid flame */}
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.28, 0.9, 7]} />
        <meshStandardMaterial color={FIRE_IN} roughness={0.4} emissive={FIRE_IN} emissiveIntensity={1.5} transparent opacity={0.88} />
      </mesh>
      {/* Core flame */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.14, 0.6, 6]} />
        <meshStandardMaterial color="#ffdd40" roughness={0.3} emissive="#ffee60" emissiveIntensity={2.0} transparent opacity={0.9} />
      </mesh>

      {/* Fire point light (no castShadow to avoid WebGL limit) */}
      <pointLight position={[0, 1.2, 0]} color="#ff8820" intensity={3.5} distance={14} decay={2} />
    </group>
  );
}

export default function CampfireArea({ cx, cz }: FireAreaProps) {
  // Seating rocks (larger rocks in a circle for people to sit on)
  const seatingRocks = useMemo(() => {
    let s = 42;
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const r = 3.8; // Radius of seating circle
    return Array.from({ length: 12 }, (_, i) => {
      const t = (i / 12) * Math.PI * 2 + rand() * 0.15;
      const jr = 0.95 + rand() * 0.1;
      return { 
        x: Math.cos(t) * r * jr, 
        z: Math.sin(t) * r * jr, 
        sz: 0.45 + rand() * 0.15, // Large enough to sit
        ry: rand() * Math.PI * 2,
        color: i % 2 === 0 ? STONE_C : STONE_D
      };
    });
  }, []);

  return (
    <group position={[cx, 0, cz]}>
      {/* Inner sand closer to fire */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <circleGeometry args={[2.0, 24]} />
        <meshStandardMaterial color="#c0a870" roughness={0.96} />
      </mesh>

      {/* Stone ring around fire */}
      <StoneRing r={1.1} />

      {/* Fire */}
      <FireFlame />

      {/* Large Rocks acting as seats */}
      {seatingRocks.map((rk, i) => (
        <mesh key={`seat-${i}`} position={[rk.x, rk.sz * 0.6, rk.z]} rotation={[0, rk.ry, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[rk.sz, 0]} />
          <meshStandardMaterial color={rk.color} roughness={0.95} />
        </mesh>
      ))}

      {/* A few scattered accent rocks around the seating */}
      {[0.8, 2.9, 4.8].map((a, i) => (
        <mesh key={`accent-${i}`} position={[Math.cos(a)*5.2, 0.12, Math.sin(a)*5.2]} castShadow>
          <dodecahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={STONE_D} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
