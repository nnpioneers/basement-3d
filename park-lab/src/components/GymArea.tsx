import { parkConfig as C } from '../config';

const RUBBER = '#2a2b2c';
const BORDER = '#707070';
const BLACK  = '#1a1a1a';
const YELLOW = '#f0c010';

function MonkeyBars({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const w = 1.6;
  const d = 1.0;
  const h = 2.4;
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* 4 Posts */}
      {[[-w/2, -d/2], [w/2, -d/2], [-w/2, d/2], [w/2, d/2]].map(([px, pz], i) => (
        <mesh key={i} position={[px, h/2, pz]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, h, 8]} />
          <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
        </mesh>
      ))}
      {/* Top frame beams (black) */}
      <mesh position={[0, h, -d/2]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, w+0.12, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, h, d/2]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, w+0.12, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-w/2, h, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, d+0.12, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[w/2, h, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, d+0.12, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* Monkey bars (Yellow) */}
      {[...Array(6)].map((_, i) => {
        const bx = -w/2 + 0.15 + (i * (w - 0.3) / 5);
        return (
          <mesh key={`mb-${i}`} position={[bx, h, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, d, 8]} />
            <meshStandardMaterial color={YELLOW} roughness={0.4} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Ladder on one side (Yellow) */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`lad-${i}`} position={[-w/2, 0.5 + i * 0.4, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, d, 8]} />
          <meshStandardMaterial color={YELLOW} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function AirWalker({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Central Post */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Top joint housing */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.2]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} />
      </mesh>
      
      {/* Left/Right Swinging Arms */}
      {[-0.25, 0.25].map((ox, i) => (
        <group key={`aw-${i}`} position={[ox, 1.2, 0]} rotation={[i === 0 ? 0.2 : -0.2, 0, 0]}>
          {/* Arm going down */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 8]} />
            <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Foot pedal */}
          <mesh position={[0, -1.2, 0.15]} castShadow>
            <boxGeometry args={[0.15, 0.04, 0.4]} />
            <meshStandardMaterial color={YELLOW} roughness={0.5} />
          </mesh>
          {/* Handle going up */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
            <meshStandardMaterial color={YELLOW} roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ChestPress({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Base frame */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.8]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Vertical spine */}
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[0.1, 1.4, 0.1]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.45, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.9, -0.1]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.06]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} />
      </mesh>
      
      {/* Press arms */}
      {[-0.35, 0.35].map((ox, i) => (
        <group key={`cp-${i}`} position={[0, 1.1, -0.15]}>
          <mesh position={[ox, 0, 0.3]} rotation={[0.2, 0, 0]} castShadow>
             <boxGeometry args={[0.04, 0.5, 0.04]} />
             <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[ox, 0.25, 0.4]} rotation={[Math.PI/2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
             <meshStandardMaterial color={YELLOW} roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SitUpBench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Main curved board */}
      <mesh position={[0, 0.4, 0]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.45, 0.08, 1.4]} />
        <meshStandardMaterial color={BLACK} roughness={0.8} />
      </mesh>
      {/* Bottom support */}
      <mesh position={[0, 0.15, 0.5]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Top support */}
      <mesh position={[0, 0.3, -0.5]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Foam rollers */}
      {[-0.6, -0.4].map((oz, i) => (
        <mesh key={`roller-${i}`} position={[0, 0.65 - i*0.15, oz]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
          <meshStandardMaterial color={YELLOW} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function InstructionBoard({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Posts */}
      {[-0.4, 0.4].map((ox, i) => (
        <mesh key={`post-${i}`} position={[ox, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
          <meshStandardMaterial color={BLACK} roughness={0.7} metalness={0.2} />
        </mesh>
      ))}
      {/* Main board */}
      <mesh position={[0, 1.0, 0.01]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.04]} />
        <meshStandardMaterial color={BLACK} roughness={0.8} />
      </mesh>
      {/* Yellow header strip */}
      <mesh position={[0, 1.25, 0.02]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.02]} />
        <meshStandardMaterial color={YELLOW} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function GymArea() {
  const { gymCX: cx, gymCZ: cz, gymRadius: r } = C;
  return (
    <group position={[cx, 0, cz]}>
      {/* Rubber flooring (flush with ground paths y=0.07) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.07, 0]} receiveShadow>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color={RUBBER} roughness={0.92} />
      </mesh>
      {/* Border trim */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <ringGeometry args={[r, r + 0.15, 48]} />
        <meshStandardMaterial color={BORDER} roughness={0.8} />
      </mesh>

      {/* Equipment Layout */}
      <MonkeyBars x={-0.5} z={-1.2} />
      <AirWalker x={-2.0} z={1.0} ry={Math.PI / 6} />
      <ChestPress x={1.8} z={0.5} ry={-Math.PI / 4} />
      <SitUpBench x={0.5} z={1.8} ry={-Math.PI / 8} />
      
      {/* Instruction Sign */}
      <InstructionBoard x={3.2} z={2.8} ry={-Math.PI / 4} />
    </group>
  );
}
