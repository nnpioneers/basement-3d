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

// ── Shared Global Materials (Mobile Optimization) ────────────────────────
const matGrass = new THREE.MeshStandardMaterial({ color: GRASS, roughness: 0.85, metalness: 0.05 });
const matPath = new THREE.MeshStandardMaterial({ color: PATH, roughness: 0.9 });
const matRubber = new THREE.MeshStandardMaterial({ color: RUBBER, roughness: 0.9 });
const matSand = new THREE.MeshStandardMaterial({ color: SAND, roughness: 0.95 });
const matBlue = new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.6, metalness: 0.2 });
const matRed = new THREE.MeshStandardMaterial({ color: RED, roughness: 0.6, metalness: 0.15 });
const matYellow = new THREE.MeshStandardMaterial({ color: YELLOW, roughness: 0.55, metalness: 0.1 });
const matPlatform = new THREE.MeshStandardMaterial({ color: PLATFORM, roughness: 0.65 });
const matRail = new THREE.MeshStandardMaterial({ color: RAIL, roughness: 0.7, metalness: 0.4 });
const matWood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.9 });
const matLeaves = new THREE.MeshStandardMaterial({ color: LEAVES, roughness: 0.9 });
const matChain = new THREE.MeshStandardMaterial({ color: "#606060", roughness: 0.5, metalness: 0.7 });
const matFulcrum = new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.7, metalness: 0.3 });
const matBenchLegs = new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.8, metalness: 0.8 });

// ── Shared Global Geometries (Mobile Optimization) ────────────────────────
// Play Structure
const geomLeg = new THREE.CylinderGeometry(0.08, 0.09, 2.2, 5); // reduced segments
const geomPlatform = new THREE.BoxGeometry(1.6, 0.12, 1.6);
const geomRailSide = new THREE.BoxGeometry(0.08, 0.9, 1.6);
const geomRailBack = new THREE.BoxGeometry(1.6, 0.9, 0.08);
const geomRoof = new THREE.ConeGeometry(1.3, 0.9, 4);
const geomRoofBase = new THREE.BoxGeometry(1.8, 0.1, 1.8);
const geomSlide = new THREE.BoxGeometry(2.7, 0.1, 0.7);
const geomSlideRail = new THREE.BoxGeometry(2.7, 0.35, 0.06);
const geomLadderRail = new THREE.BoxGeometry(0.07, 2.2 * 1.12, 0.07);
const geomLadderRung = new THREE.BoxGeometry(0.5, 0.05, 0.05);

// Swings
const geomAFrame = new THREE.CylinderGeometry(0.07, 0.09, 3.2, 5); // reduced
const geomSwingTop = new THREE.BoxGeometry(4.4, 0.14, 0.14);
const geomSwingChain = new THREE.CylinderGeometry(0.025, 0.025, 2.5, 4); // reduced
const geomSwingSeat = new THREE.BoxGeometry(0.42, 0.07, 0.55);

// SeeSaw
const geomFulcrumCyl = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 6);
const geomPlank = new THREE.BoxGeometry(3.0, 0.1, 0.3);
const geomHandle = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 5);

// Tree
const geomTrunk = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 5);
const geomLeaves = new THREE.SphereGeometry(1.2, 6, 5); // significantly reduced for mobile

// Bench
const geomBenchSeat = new THREE.BoxGeometry(1.5, 0.08, 0.4);
const geomBenchBack = new THREE.BoxGeometry(1.5, 0.4, 0.05);
const geomBenchLeg = new THREE.BoxGeometry(0.08, 0.25, 0.3);

// Sandbox block
const geomSandBoxCube = new THREE.BoxGeometry(0.8, 0.4, 0.8);
const geomSandCyl = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 6);


// ── Components using Shared Resources ────────────────────────

function PlayStructure({ x, z }: { x: number; z: number }) {
  const platH = 2.2;
  return (
    <group position={[x, 0, z]}>
      {/* 4 corner support legs */}
      {[[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]].map(([ox,oz],i) => (
        <mesh key={i} position={[ox, platH/2, oz]} castShadow geometry={geomLeg} material={matBlue} />
      ))}
      {/* Platform deck */}
      <mesh position={[0, platH, 0]} castShadow receiveShadow geometry={geomPlatform} material={matPlatform} />
      {/* Platform handrail sides */}
      {[[-0.8, 0], [0.8, 0], [0, -0.8]].map(([rx, rz], i) => (
        <mesh key={`rail${i}`} position={[rx, platH + 0.45, rz]} castShadow 
          geometry={rx === 0 ? geomRailBack : geomRailSide} material={matRed} />
      ))}
      {/* Pyramid roof/canopy */}
      <mesh position={[0, platH + 1.35, 0]} castShadow geometry={geomRoof} material={matRed} />
      <mesh position={[0, platH + 0.9, 0]} castShadow geometry={geomRoofBase} material={matBlue} />
      {/* SLIDE */}
      <mesh position={[1.5, platH * 0.45, 0.3]} rotation={[0, 0.15, -Math.PI / 6]} castShadow geometry={geomSlide} material={matYellow} />
      {/* Slide side rails */}
      {[-0.36, 0.36].map((oz, i) => (
        <mesh key={`sr${i}`} position={[1.5, platH * 0.45 + 0.22, 0.3 + oz]} rotation={[0, 0.15, -Math.PI / 6]} castShadow geometry={geomSlideRail} material={matYellow} />
      ))}
      {/* LADDER */}
      {[-0.22, 0.22].map((ox, i) => (
        <mesh key={`lr${i}`} position={[-0.7 + ox, platH / 2, -1.1]} rotation={[-Math.PI / 5.5, 0, 0]} castShadow geometry={geomLadderRail} material={matRail} />
      ))}
      {[0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8].map((yOff, i) => (
        <mesh key={`rng${i}`} position={[-0.7, yOff, -1.1 - (yOff / platH) * 0.5]} castShadow geometry={geomLadderRung} material={matRail} />
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
      <mesh position={[-frameW/2 - 0.2, frameH/2, -0.35]} rotation={[0, 0,  0.18]} castShadow geometry={geomAFrame} material={matRed} />
      <mesh position={[-frameW/2 - 0.2, frameH/2, 0.35]} rotation={[0, 0,  0.18]} castShadow geometry={geomAFrame} material={matRed} />
      <mesh position={[frameW/2 + 0.2, frameH/2, -0.35]} rotation={[0, 0, -0.18]} castShadow geometry={geomAFrame} material={matRed} />
      <mesh position={[frameW/2 + 0.2, frameH/2, 0.35]} rotation={[0, 0, -0.18]} castShadow geometry={geomAFrame} material={matRed} />
      {/* Top horizontal bar */}
      <mesh position={[0, frameH, 0]} castShadow geometry={geomSwingTop} material={matRed} />
      {/* Swing 1 */}
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow geometry={geomSwingChain} material={matChain} />
      <mesh position={[-1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow geometry={geomSwingChain} material={matChain} />
      <mesh position={[-1.1, frameH - chainH - 0.1, 0]} castShadow geometry={geomSwingSeat} material={matBlue} />
      {/* Swing 2 */}
      <mesh position={[1.1, frameH - chainH/2 - 0.05, -0.25]} castShadow geometry={geomSwingChain} material={matChain} />
      <mesh position={[1.1, frameH - chainH/2 - 0.05, 0.25]} castShadow geometry={geomSwingChain} material={matChain} />
      <mesh position={[1.1, frameH - chainH - 0.1, 0]} castShadow geometry={geomSwingSeat} material={matYellow} />
    </group>
  );
}

function SeeSaw({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* Fulcrum */}
      <mesh position={[0, 0.35, 0]} castShadow geometry={geomFulcrumCyl} material={matFulcrum} />
      {/* Plank */}
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.15]} castShadow geometry={geomPlank} material={matRed} />
      {/* Handles */}
      {[-1.3, 1.3].map((ox, i) => (
        <mesh key={i} position={[ox, 0.88, 0]} castShadow geometry={geomHandle} material={matYellow} />
      ))}
    </group>
  );
}

// Tree with dynamic scaling but shared geometry
function ParkTree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  const trunkH = 1.2; // base height
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, trunkH / 2, 0]} castShadow geometry={geomTrunk} material={matWood} />
      <mesh position={[0, trunkH + 0.8, 0]} castShadow geometry={geomLeaves} material={matLeaves} />
    </group>
  );
}

function ParkBench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0.25, z]} rotation={[0, ry, 0]} castShadow>
      {/* Seat */}
      <mesh position={[0, 0, 0]} geometry={geomBenchSeat} material={matWood} />
      {/* Backrest */}
      <mesh position={[0, 0.4, -0.2]} rotation={[0.2, 0, 0]} geometry={geomBenchBack} material={matWood} />
      {/* Legs */}
      {[-0.6, 0.6].map((ox, i) => (
        <mesh key={i} position={[ox, -0.125, 0]} geometry={geomBenchLeg} material={matBenchLegs} />
      ))}
    </group>
  );
}

// ── Main Entrance Park Component ──────────────────────────────────────────────
export default function EntrancePark() {
  const W = 27.0;
  const D = 37.65;
  const extrudeDepth = 0.1;

  // Shared Base Ground Geometries (Generated once per component lifecycle, could also be global if W and D are fixed)
  const { groundGeom, pathGeom, innerPathGeom, rubberGeom, sandGeom } = useMemo(() => {
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

    const pathG = new THREE.ExtrudeGeometry(pathShape, { steps: 1, depth: extrudeDepth + 0.02, bevelEnabled: false });

    // Inner paths, rubber, sand
    const innerPath = new THREE.BoxGeometry(W - 5, 3, 0.02);
    const rubber = new THREE.BoxGeometry(W - 7, D * 0.4, 0.02);
    const sand = new THREE.BoxGeometry(W - 10, D * 0.25, 0.02);

    return { groundGeom: ground, pathGeom: pathG, innerPathGeom: innerPath, rubberGeom: rubber, sandGeom: sand };
  }, []);

  // Trees array along the perimeter
  const trees = useMemo(() => {
    const t = [];
    for (let x = 1.5; x < W; x += 4) {
      t.push({ x, z: 1.5, scale: 0.8 + Math.random() * 0.4 });
      t.push({ x, z: D - 1.5, scale: 0.8 + Math.random() * 0.4 });
    }
    for (let z = 5.5; z < D - 4; z += 5) {
      t.push({ x: 1.5, z, scale: 0.8 + Math.random() * 0.4 });
      t.push({ x: W - 1.5, z, scale: 0.8 + Math.random() * 0.4 });
    }
    return t;
  }, []);

  return (
    <group>
      {/* Grass Ground */}
      <mesh geometry={groundGeom} receiveShadow material={matGrass} />

      {/* Pathways */}
      <mesh geometry={pathGeom} receiveShadow material={matPath} />
      
      <mesh receiveShadow position={[0,0,0]} material={matGrass}>
        {/* Placeholder ShapeGeometry handled previously - removed in favor of simpler structures */}
      </mesh>

      {/* Cross Path */}
      <mesh position={[W/2, D/2, extrudeDepth + 0.01]} receiveShadow geometry={innerPathGeom} material={matPath} />

      {/* Rubber Play Area (Top Half) */}
      <mesh position={[W/2, D * 0.75, extrudeDepth + 0.015]} receiveShadow geometry={rubberGeom} material={matRubber} />

      {/* Sandbox (Bottom Half) */}
      <mesh position={[W/2, D * 0.25, extrudeDepth + 0.015]} receiveShadow geometry={sandGeom} material={matSand} />

      <group position={[0, 0, extrudeDepth]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Play Structure */}
        <PlayStructure x={W/2 - 4} z={-(D * 0.75)} />
        
        {/* Swing Set */}
        <SwingSet x={W/2 + 5} z={-(D * 0.75)} ry={Math.PI / 4} />
        
        {/* SeeSaw */}
        <SeeSaw x={W/2} z={-(D * 0.65)} />

        {/* Sand Toys / Blocks in Sandbox */}
        <mesh position={[W/2 - 2, 0.2, -(D * 0.25)]} castShadow geometry={geomSandBoxCube} material={matRed} />
        <mesh position={[W/2 + 2, 0.15, -(D * 0.25 + 1)]} castShadow geometry={geomSandCyl} material={matYellow} />

        {/* Benches */}
        <ParkBench x={3.5} z={-(D * 0.5)} ry={Math.PI / 2} />
        <ParkBench x={W - 3.5} z={-(D * 0.5)} ry={-Math.PI / 2} />
        <ParkBench x={W/2} z={-(D - 3.5)} ry={Math.PI} />
        <ParkBench x={W/2} z={-3.5} ry={0} />

        {/* Trees */}
        {trees.map((t, i) => (
          <ParkTree key={i} x={t.x} z={-t.z} scale={t.scale} />
        ))}
      </group>
    </group>
  );
}
