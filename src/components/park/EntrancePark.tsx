import { useMemo } from 'react';
import * as THREE from 'three';

// ── Colors ────────────────────────
const GRASS    = '#4caf50';
const PATH     = '#cfd8dc';
const RUBBER   = '#d07840';
const SAND     = '#e0c890';
const BLUE     = '#2060c8';
const RED      = '#c82828';
const YELLOW   = '#e8c020';
const PLATFORM = '#3070b8';
const RAIL     = '#404040';
const WOOD     = '#8b5a2b';
const LEAVES   = '#2e7d32';

// ── Play Structures (Copied for self-containment) ────────────────────────
function PlayStructure({ x, z }: { x: number; z: number }) {
  const platH = 2.2;
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
      {/* SLIDE */}
      <mesh position={[1.5, platH * 0.45, 0.3]} rotation={[0, 0.15, -Math.PI / 6]} castShadow>
        <boxGeometry args={[2.7, 0.1, 0.7]} />
        <meshStandardMaterial color={YELLOW} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Slide side rails */}
      {[-0.36, 0.36].map((oz, i) => (
        <mesh key={`sr${i}`} position={[1.5, platH * 0.45 + 0.22, 0.3 + oz]} rotation={[0, 0.15, -Math.PI / 6]} castShadow>
          <boxGeometry args={[2.7, 0.35, 0.06]} />
          <meshStandardMaterial color={YELLOW} roughness={0.55} />
        </mesh>
      ))}
      {/* LADDER */}
      {[-0.22, 0.22].map((ox, i) => (
        <mesh key={`lr${i}`} position={[-0.7 + ox, platH / 2, -1.1]} rotation={[-Math.PI / 5.5, 0, 0]} castShadow>
          <boxGeometry args={[0.07, platH * 1.12, 0.07]} />
          <meshStandardMaterial color={RAIL} roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      {[0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8].map((yOff, i) => (
        <mesh key={`rng${i}`} position={[-0.7, yOff, -1.1 - (yOff / platH) * 0.5]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial color={RAIL} roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function SwingSet({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const frameH  = 3.2;
  const frameW  = 3.6;
  const chainH  = 2.5;
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* A-frames */}
      <mesh position={[-frameW/2 - 0.2, frameH/2, -0.35]} rotation={[0, 0,  0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[-frameW/2 - 0.2, frameH/2, 0.35]} rotation={[0, 0,  0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[frameW/2 + 0.2, frameH/2, -0.35]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[frameW/2 + 0.2, frameH/2, 0.35]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, frameH, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Top horizontal bar */}
      <mesh position={[0, frameH, 0]} castShadow>
        <boxGeometry args={[frameW + 0.8, 0.14, 0.14]} />
        <meshStandardMaterial color={RED} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* Swing 1 */}
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-1.1, frameH - chainH - 0.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.55]} />
        <meshStandardMaterial color={BLUE} roughness={0.7} />
      </mesh>
      {/* Swing 2 */}
      <mesh position={[1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, chainH, 6]} />
        <meshStandardMaterial color="#606060" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[1.1, frameH - chainH - 0.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.55]} />
        <meshStandardMaterial color={YELLOW} roughness={0.7} />
      </mesh>
    </group>
  );
}

function SeeSaw({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Fulcrum */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.7, 8]} />
        <meshStandardMaterial color="#888" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Plank */}
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

function ParkTree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  const trunkH = 1.2 * scale;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.2 * scale, trunkH, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, trunkH + 0.8 * scale, 0]} castShadow>
        <sphereGeometry args={[1.2 * scale, 7, 7]} />
        <meshStandardMaterial color={LEAVES} roughness={0.9} />
      </mesh>
    </group>
  );
}

function ParkBench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0.25, z]} rotation={[0, ry, 0]} castShadow>
      {/* Seat */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.4]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.4, -0.2]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.05]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[-0.6, 0.6].map((ox, i) => (
        <mesh key={i} position={[ox, -0.125, 0]}>
          <boxGeometry args={[0.08, 0.25, 0.3]} />
          <meshStandardMaterial color="#222" roughness={0.8} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main Entrance Park Component ──────────────────────────────────────────────
export default function EntrancePark() {
  const W = 27.0;
  const D = 37.65;
  const extrudeDepth = 0.1;

  // Generate Base Ground Mesh
  const { groundGeom, pathGeom } = useMemo(() => {
    // 1. Base Ground (Grass)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(W, 0);
    shape.lineTo(W, D);
    shape.lineTo(0, D);
    shape.lineTo(0, 0);
    
    const ground = new THREE.ExtrudeGeometry(shape, {
      steps: 1, depth: extrudeDepth, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2
    });

    // 2. Walkway Paths (Concrete/Paved)
    const pathShape = new THREE.Shape();
    // Perimeter path (1.5m wide)
    pathShape.moveTo(1, 1);
    pathShape.lineTo(W - 1, 1);
    pathShape.lineTo(W - 1, D - 1);
    pathShape.lineTo(1, D - 1);
    pathShape.lineTo(1, 1);
    
    // Create hole for the central grass/play areas
    const hole = new THREE.Path();
    hole.moveTo(2.5, 2.5);
    hole.lineTo(2.5, D - 2.5);
    hole.lineTo(W - 2.5, D - 2.5);
    hole.lineTo(W - 2.5, 2.5);
    hole.lineTo(2.5, 2.5);
    pathShape.holes.push(hole);

    // Cross path connecting east-west
    const crossPath = new THREE.Shape();
    crossPath.moveTo(1, D / 2 - 1);
    crossPath.lineTo(W - 1, D / 2 - 1);
    crossPath.lineTo(W - 1, D / 2 + 1);
    crossPath.lineTo(1, D / 2 + 1);
    crossPath.lineTo(1, D / 2 - 1);

    // Combine paths (we can render cross path as a separate mesh for simplicity)
    const pathG = new THREE.ExtrudeGeometry(pathShape, { steps: 1, depth: extrudeDepth + 0.02, bevelEnabled: false });
    const crossPathG = new THREE.ExtrudeGeometry(crossPath, { steps: 1, depth: extrudeDepth + 0.02, bevelEnabled: false });

    return { groundGeom: ground, pathGeom: pathG, crossPathGeom: crossPathG };
  }, [W, D]);

  // Trees array along the perimeter
  const trees = useMemo(() => {
    const t = [];
    for (let x = 1.5; x < W; x += 4) {
      t.push({ x, z: 1.5 });
      t.push({ x, z: D - 1.5 });
    }
    for (let z = 5.5; z < D - 4; z += 5) {
      t.push({ x: 1.5, z });
      t.push({ x: W - 1.5, z });
    }
    return t;
  }, [W, D]);

  return (
    <group>
      {/* Grass Ground */}
      <mesh geometry={groundGeom} receiveShadow>
        <meshStandardMaterial color={GRASS} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Pathways */}
      <mesh geometry={pathGeom} receiveShadow>
        <meshStandardMaterial color={PATH} roughness={0.9} />
      </mesh>
      
      <mesh receiveShadow position={[0,0,0]}>
        <shapeGeometry args={[
          new THREE.Shape([
            new THREE.Vector2(1, D/2 - 1.5), new THREE.Vector2(W-1, D/2 - 1.5),
            new THREE.Vector2(W-1, D/2 + 1.5), new THREE.Vector2(1, D/2 + 1.5)
          ])
        ]} />
        {/* We need to raise this slightly to avoid z-fighting, or better yet, use ExtrudeGeometry */}
      </mesh>

      {/* Since ShapeGeometry lays flat, let's just use simple BoxGeometry for inner paths to avoid complex Shape logic */}
      <mesh position={[W/2, D/2, extrudeDepth + 0.01]} receiveShadow>
         <boxGeometry args={[W - 5, 3, 0.02]} />
         <meshStandardMaterial color={PATH} roughness={0.9} />
      </mesh>

      {/* Rubber Play Area (Top Half) */}
      <mesh position={[W/2, D * 0.75, extrudeDepth + 0.015]} receiveShadow>
        <boxGeometry args={[W - 7, D * 0.4, 0.02]} />
        <meshStandardMaterial color={RUBBER} roughness={0.9} />
      </mesh>

      {/* Sandbox (Bottom Half) */}
      <mesh position={[W/2, D * 0.25, extrudeDepth + 0.015]} receiveShadow>
        <boxGeometry args={[W - 10, D * 0.25, 0.02]} />
        <meshStandardMaterial color={SAND} roughness={0.95} />
      </mesh>

      {/* Play Equipment (Placed on Rubber Area) */}
      {/* We are drawing in X-Y plane (2D) because ParksAndCASite rotates the whole group by -Math.PI/2 to lay it flat on X-Z.
          Wait! ParksAndCASite renders the 2D shapes in X-Y, and rotates the entire `<group rotation={[-Math.PI / 2, 0, 0]}>`.
          Therefore, inside EntrancePark, Z is actually "UP" in 3D world space (height), and Y is "DEPTH" in 2D space.
          Our PlayStructures use Y for height and Z for depth!
          To fix this, we can place PlayEquipment inside a group that undoes the rotation, or we can just rotate the equipment group. */}
      
      <group position={[0, 0, extrudeDepth]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Now Y is UP, Z is DEPTH. 
            The Park goes from X=0 to 27, and Z goes from 0 to -37.65 because the parent group rotated X-Y plane.
            Let's trace it: Parent has rotation={[-Math.PI/2, 0, 0]}. 
            In Parent: X is World X. Y is World -Z. Z is World Y (Up).
            If we apply rotation={[Math.PI/2, 0, 0]} to this child group:
            Child X = Parent X = World X.
            Child Y = Parent Z = World Y.
            Child Z = -Parent Y = World Z.
            This perfectly restores standard 3D coordinates! 
            So: X is 0 to 27. Z is 0 to 37.65 (Wait, Parent Y was 0 to 37.65. So Child Z is -37.65 to 0. Let's use Z = -D to 0)
        */}
        
        {/* Play Structure */}
        <PlayStructure x={W/2 - 4} z={-(D * 0.75)} />
        
        {/* Swing Set */}
        <SwingSet x={W/2 + 5} z={-(D * 0.75)} ry={Math.PI / 4} />
        
        {/* SeeSaw */}
        <SeeSaw x={W/2} z={-(D * 0.65)} />

        {/* Sand Toys / Blocks in Sandbox */}
        <mesh position={[W/2 - 2, 0.2, -(D * 0.25)]} castShadow>
          <boxGeometry args={[0.8, 0.4, 0.8]} />
          <meshStandardMaterial color={RED} roughness={0.8} />
        </mesh>
        <mesh position={[W/2 + 2, 0.15, -(D * 0.25 + 1)]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshStandardMaterial color={YELLOW} roughness={0.8} />
        </mesh>

        {/* Benches */}
        <ParkBench x={3.5} z={-(D * 0.5)} ry={Math.PI / 2} />
        <ParkBench x={W - 3.5} z={-(D * 0.5)} ry={-Math.PI / 2} />
        <ParkBench x={W/2} z={-(D - 3.5)} ry={Math.PI} />
        <ParkBench x={W/2} z={-3.5} ry={0} />

        {/* Trees */}
        {trees.map((t, i) => (
          <ParkTree key={i} x={t.x} z={-t.z} scale={0.8 + Math.random() * 0.4} />
        ))}
      </group>
    </group>
  );
}
