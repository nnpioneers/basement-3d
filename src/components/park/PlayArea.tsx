import { parkConfig as C } from './config';

const RUBBER   = '#d07840';
const SAND     = '#e0c890';
const BLUE     = '#2060c8';
const RED      = '#c82828';
const YELLOW   = '#e8c020';
const PLATFORM = '#3070b8';
const RAIL     = '#404040';

// ── Proper play structure (tower + slide + ladder) ─────────
function PlayStructure({ x, z }: { x: number; z: number }) {
  const platH = 2.2;  // platform height

  return (
    <group position={[x, 0, z]}>
      {/* 4 corner support legs */}
      {[[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].map(([ox,oz],i) => (
        <mesh key={i} position={[ox, platH/2, oz]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, platH, 8]} />
          <meshStandardMaterial color={BLUE} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      {/* Platform deck */}
      <mesh position={[0, platH, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 1.6]} />
        <meshStandardMaterial color={PLATFORM} roughness={0.65} />
      </mesh>

      {/* Platform handrail sides */}
      {[[-0.8, 0], [0.8, 0], [0, -0.8]].map(([rx, rz], i) => (
        <mesh key={`rail${i}`} position={[rx, platH + 0.45, rz]} castShadow>
          <boxGeometry args={[rx === 0 ? 1.6 : 0.08, 0.9, rz === 0 ? 0.08 : 1.6]} />
          <meshStandardMaterial color={RED} roughness={0.6} metalness={0.15} />
        </mesh>
      ))}

      {/* Pyramid roof/canopy */}
      <mesh position={[0, platH + 1.35, 0]} castShadow>
        <coneGeometry args={[1.3, 0.9, 4]} />
        <meshStandardMaterial color={RED} roughness={0.65} />
      </mesh>
      <mesh position={[0, platH + 0.9, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshStandardMaterial color={BLUE} roughness={0.65} />
      </mesh>

      {/* SLIDE — from platform front-right, angled down */}
      <mesh
        position={[1.5, platH * 0.45, 0.3]}
        rotation={[0, 0.15, -Math.PI / 6]}
        castShadow
      >
        <boxGeometry args={[2.7, 0.1, 0.7]} />
        <meshStandardMaterial color={YELLOW} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Slide side rails */}
      {[-0.36, 0.36].map((oz, i) => (
        <mesh key={`sr${i}`} position={[1.5, platH * 0.45 + 0.22, 0.3 + oz]}
          rotation={[0, 0.15, -Math.PI / 6]} castShadow>
          <boxGeometry args={[2.7, 0.35, 0.06]} />
          <meshStandardMaterial color={YELLOW} roughness={0.55} />
        </mesh>
      ))}

      {/* LADDER — left side, ascending */}
      {/* Ladder rails */}
      {[-0.22, 0.22].map((ox, i) => (
        <mesh key={`lr${i}`} position={[-0.7 + ox, platH / 2, -1.1]}
          rotation={[-Math.PI / 5.5, 0, 0]} castShadow>
          <boxGeometry args={[0.07, platH * 1.12, 0.07]} />
          <meshStandardMaterial color={RAIL} roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      {/* Ladder rungs */}
      {[0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8].map((yOff, i) => (
        <mesh key={`rng${i}`} position={[-0.7, yOff, -1.1 - (yOff / platH) * 0.5]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial color={RAIL} roughness={0.7} metalness={0.4} />
        </mesh>
      ))}

      {/* Decorative colour rings on legs */}
      <mesh position={[0, platH * 0.6, 0]} castShadow>
        <torusGeometry args={[1.1, 0.06, 6, 24]} />
        <meshStandardMaterial color={YELLOW} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── Swing set (portal frame + hanging seats) ───────────────
function SwingSet({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const frameH  = 3.2;
  const frameW  = 3.6; // total width
  const chainH  = 2.5; // length of chain

  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Left A-frame — two angled posts */}
      <mesh position={[-frameW/2 - 0.2, frameH/2, -0.35]}
        rotation={[0, 0,  0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[-frameW/2 - 0.2, frameH/2, 0.35]}
        rotation={[0, 0,  0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Right A-frame */}
      <mesh position={[frameW/2 + 0.2, frameH/2, -0.35]}
        rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[frameW/2 + 0.2, frameH/2, 0.35]}
        rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Top horizontal bar */}
      <mesh position={[0, frameH, 0]} castShadow>
        <boxGeometry args={[frameW + 0.8, 0.14, 0.14]} />
        <meshStandardMaterial color={RED} roughness={0.55} metalness={0.25} />
      </mesh>

      {/* Swing 1 — left */}
      {/* Chain (2 thin cylinders per swing) */}
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Seat 1 */}
      <mesh position={[-1.1, frameH - chainH - 0.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.55]} />
        <meshStandardMaterial color={BLUE} roughness={0.7} />
      </mesh>

      {/* Swing 2 — right */}
      <mesh position={[1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Seat 2 */}
      <mesh position={[1.1, frameH - chainH - 0.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.55]} />
        <meshStandardMaterial color={YELLOW} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── See-saw ────────────────────────────────────────────────
function SeeSaw({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Fulcrum */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.7, 8]} />
        <meshStandardMaterial color="#888" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Plank — slightly tilted */}
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[3.0, 0.1, 0.3]} />
        <meshStandardMaterial color={RED} roughness={0.65} />
      </mesh>
      {/* Handles */}
      {[-1.3, 1.3].map((ox, i) => (
        <mesh key={i} position={[ox, 0.88, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
          <meshStandardMaterial color={YELLOW} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main export ────────────────────────────────────────────
export default function PlayArea() {
  const { playCX: cx, playCZ: cz, playRadius: r } = C;

  return (
    <group position={[cx, 0, cz]}>
      {/* Orange rubber flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} receiveShadow>
        <circleGeometry args={[r, 40]} />
        <meshStandardMaterial color={RUBBER} roughness={0.92} />
      </mesh>

      {/* Sand/paving border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <ringGeometry args={[r, r + 1.4, 40]} />
        <meshStandardMaterial color={SAND} roughness={0.95} />
      </mesh>

      {/* Play structure — centre-left */}
      <PlayStructure x={-2.0} z={0} />

      {/* Swing set — right side, perpendicular */}
      <SwingSet x={2.5} z={0.5} ry={Math.PI / 2} />

      {/* See-saw — offset */}
      <SeeSaw x={-1.0} z={-3.2} />
    </group>
  );
}
