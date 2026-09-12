/**
 * EntrancePark.tsx — Children's Park (Entrance-Side)
 *
 * Mobile-first design:
 *  - All materials declared ONCE at module level (shared across all instances)
 *  - All repeated geometries declared ONCE at module level (shared via geometry prop)
 *  - Components use <mesh geometry={...} material={...}> for zero-duplicate GPU allocations
 *  - Low-poly counts on all curved shapes (5–6 segments max)
 *  - No animations, no particles, no transparency, no heavy shaders
 *  - castShadow limited to tall/visible structures only
 *  - Total target: <60 draw calls for the entire park
 */

import { useMemo } from 'react';
import * as THREE from 'three';

// ── Park dimensions (module-level, used by geometry constants below) ──────────
const W = 27.0;   // park width  (X)
const D = 37.65;  // park depth  (Y in 2D / -Z in 3D equipment group)

// ── Module-level materials (allocated ONCE) ───────────────────────────────────
const MAT_GRASS   = new THREE.MeshStandardMaterial({ color: '#4a8c3f', roughness: 0.9, metalness: 0 });
const MAT_PATH    = new THREE.MeshStandardMaterial({ color: '#bdbdbd', roughness: 0.9 });
const MAT_RUBBER  = new THREE.MeshStandardMaterial({ color: '#c8622e', roughness: 0.9 });
const MAT_SAND    = new THREE.MeshStandardMaterial({ color: '#d4b483', roughness: 0.95 });
const MAT_BLUE    = new THREE.MeshStandardMaterial({ color: '#1f5db5', roughness: 0.65 });
const MAT_RED     = new THREE.MeshStandardMaterial({ color: '#b52424', roughness: 0.65 });
const MAT_YELLOW  = new THREE.MeshStandardMaterial({ color: '#d4aa1a', roughness: 0.6 });
const MAT_WOOD    = new THREE.MeshStandardMaterial({ color: '#7a4f28', roughness: 0.9 });
const MAT_LEAVES  = new THREE.MeshStandardMaterial({ color: '#2a6e28', roughness: 0.9 });
const MAT_METAL   = new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.5, metalness: 0.7 });
const MAT_PERGOLA = new THREE.MeshStandardMaterial({ color: '#5a3a18', roughness: 0.85 });
const MAT_ROOF    = new THREE.MeshStandardMaterial({ color: '#8b6347', roughness: 0.85 });
const MAT_SLAB    = new THREE.MeshStandardMaterial({ color: '#a0a0a0', roughness: 0.8 });

// ── Module-level geometries (allocated ONCE, reused via prop) ─────────────────
// Tree
const GEO_TRUNK     = new THREE.CylinderGeometry(0.15, 0.22, 1.4, 5, 1);
const GEO_LEAVES    = new THREE.SphereGeometry(1.3, 6, 5);
// Bench
const GEO_BENCH_SEAT = new THREE.BoxGeometry(1.6, 0.1, 0.45);
const GEO_BENCH_BACK = new THREE.BoxGeometry(1.6, 0.5, 0.08);
const GEO_BENCH_LEG  = new THREE.BoxGeometry(0.09, 0.38, 0.38);
// Pergola
const GEO_PERG_POST  = new THREE.CylinderGeometry(0.15, 0.15, 2.8, 5, 1);
const GEO_PERG_BEAM  = new THREE.BoxGeometry(7.0, 0.15, 0.2);
const GEO_PERG_RAFTER = new THREE.BoxGeometry(0.12, 0.12, 6.0);
const GEO_PERG_ROOF  = new THREE.BoxGeometry(7.0, 0.08, 6.0);
// Play structure
const GEO_LEG        = new THREE.CylinderGeometry(0.09, 0.1, 2.4, 5, 1);
const GEO_PLATFORM   = new THREE.BoxGeometry(1.8, 0.14, 1.8);
const GEO_RAIL_LONG  = new THREE.BoxGeometry(1.8, 0.8, 0.09);
const GEO_RAIL_SHORT = new THREE.BoxGeometry(0.09, 0.8, 1.8);
const GEO_ROOF_CONE  = new THREE.ConeGeometry(1.5, 1.0, 4);
const GEO_SLIDE      = new THREE.BoxGeometry(3.0, 0.12, 0.75);
const GEO_SLIDE_RAIL = new THREE.BoxGeometry(3.0, 0.35, 0.07);
const GEO_LRAIL      = new THREE.BoxGeometry(0.07, 2.8, 0.07);
const GEO_LRUNG      = new THREE.BoxGeometry(0.48, 0.05, 0.05);
// Swing set
const GEO_SF_POST    = new THREE.CylinderGeometry(0.08, 0.09, 3.4, 5, 1);
const GEO_SF_TOP     = new THREE.BoxGeometry(5.0, 0.15, 0.15);
const GEO_SF_CHAIN   = new THREE.CylinderGeometry(0.025, 0.025, 2.6, 4, 1);
const GEO_SF_SEAT    = new THREE.BoxGeometry(0.44, 0.08, 0.55);
// See-saw
const GEO_SS_BASE    = new THREE.CylinderGeometry(0.13, 0.18, 0.75, 5, 1);
const GEO_SS_PLANK   = new THREE.BoxGeometry(3.4, 0.1, 0.32);
const GEO_SS_HANDLE  = new THREE.CylinderGeometry(0.045, 0.045, 0.35, 5, 1);
// Sandbox border
const GEO_SB_EDGE    = new THREE.BoxGeometry(5.0, 0.3, 0.25);
const GEO_SB_EDGE_S  = new THREE.BoxGeometry(0.25, 0.3, 5.0);


// ── Sub-components ────────────────────────────────────────────────────────────

function Tree({ x, z, s = 1.0 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.7, 0]} castShadow geometry={GEO_TRUNK} material={MAT_WOOD} />
      <mesh position={[0, 2.3, 0]} castShadow geometry={GEO_LEAVES} material={MAT_LEAVES} />
    </group>
  );
}

function Bench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0.38, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, 0]} geometry={GEO_BENCH_SEAT} material={MAT_WOOD} />
      <mesh position={[0, 0.3, -0.18]} rotation={[0.2, 0, 0]} geometry={GEO_BENCH_BACK} material={MAT_WOOD} />
      <mesh position={[-0.65, -0.19, 0]} geometry={GEO_BENCH_LEG} material={MAT_METAL} />
      <mesh position={[ 0.65, -0.19, 0]} geometry={GEO_BENCH_LEG} material={MAT_METAL} />
    </group>
  );
}

/** Simple 4-post pergola with lattice-style roof */
function Pergola({ x, z }: { x: number; z: number }) {
  const pw = 7.0;
  const pd = 6.0;
  const ph = 2.8;
  const hx = pw / 2 - 0.4;
  const hz = pd / 2 - 0.4;

  // Rafters (4 evenly spaced slats across depth)
  const rafters = [-2.1, -0.7, 0.7, 2.1];

  return (
    <group position={[x, 0, z]}>
      {/* 4 corner posts */}
      {[[-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]].map(([px, pz], i) => (
        <mesh key={i} position={[px, ph / 2, pz]} castShadow geometry={GEO_PERG_POST} material={MAT_PERGOLA} />
      ))}
      {/* Two long top beams (along X) */}
      <mesh position={[0, ph, -hz]} castShadow geometry={GEO_PERG_BEAM} material={MAT_PERGOLA} />
      <mesh position={[0, ph,  hz]} castShadow geometry={GEO_PERG_BEAM} material={MAT_PERGOLA} />
      {/* Rafters (along Z) */}
      {rafters.map((rx, i) => (
        <mesh key={i} position={[rx, ph + 0.06, 0]} geometry={GEO_PERG_RAFTER} material={MAT_PERGOLA} />
      ))}
      {/* Thin translucent-looking roof slab (solid, low opacity hint via roughness) */}
      <mesh position={[0, ph + 0.12, 0]} geometry={GEO_PERG_ROOF} material={MAT_ROOF} />
    </group>
  );
}

/** Compact play tower with slide */
function PlayStructure({ x, z }: { x: number; z: number }) {
  const ph = 2.4; // platform height
  return (
    <group position={[x, 0, z]}>
      {/* 4 support legs */}
      {[[-0.75,-0.75],[0.75,-0.75],[-0.75,0.75],[0.75,0.75]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, ph / 2, lz]} castShadow geometry={GEO_LEG} material={MAT_BLUE} />
      ))}
      {/* Platform */}
      <mesh position={[0, ph, 0]} geometry={GEO_PLATFORM} material={MAT_BLUE} />
      {/* Handrails */}
      <mesh position={[0, ph + 0.5, -0.9]} geometry={GEO_RAIL_LONG}  material={MAT_RED} />
      <mesh position={[0, ph + 0.5,  0.9]} geometry={GEO_RAIL_LONG}  material={MAT_RED} />
      <mesh position={[-0.9, ph + 0.5, 0]} geometry={GEO_RAIL_SHORT} material={MAT_RED} />
      {/* Cone roof */}
      <mesh position={[0, ph + 1.5, 0]} castShadow geometry={GEO_ROOF_CONE} material={MAT_RED} />
      {/* Slide */}
      <mesh position={[2.0, ph * 0.45, 0]} rotation={[0, 0.1, -Math.PI / 6]} castShadow geometry={GEO_SLIDE}      material={MAT_YELLOW} />
      <mesh position={[2.0, ph * 0.45 + 0.22, -0.38]} rotation={[0, 0.1, -Math.PI / 6]} geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      <mesh position={[2.0, ph * 0.45 + 0.22,  0.38]} rotation={[0, 0.1, -Math.PI / 6]} geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      {/* Ladder rails */}
      <mesh position={[-0.72, ph / 2, -1.2]} rotation={[-0.55, 0, 0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      <mesh position={[-0.28, ph / 2, -1.2]} rotation={[-0.55, 0, 0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      {/* Ladder rungs (4 only) */}
      {[0.45, 0.85, 1.25, 1.65].map((y, i) => (
        <mesh key={i} position={[-0.5, y, -1.2 - y * 0.18]} geometry={GEO_LRUNG} material={MAT_METAL} />
      ))}
    </group>
  );
}

/** A-frame swing set with 2 swings */
function SwingSet({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const fh = 3.4;
  const fw = 4.4;
  const ch = 2.6;
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      {/* A-frame posts (4) */}
      <mesh position={[-fw/2, fh/2, -0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED} />
      <mesh position={[-fw/2, fh/2,  0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED} />
      <mesh position={[ fw/2, fh/2, -0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED} />
      <mesh position={[ fw/2, fh/2,  0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED} />
      {/* Top bar */}
      <mesh position={[0, fh, 0]} geometry={GEO_SF_TOP} material={MAT_RED} />
      {/* Swing 1 — chains + seat */}
      <mesh position={[-1.2, fh - ch/2, -0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[-1.2, fh - ch/2,  0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[-1.2, fh - ch - 0.1, 0]} geometry={GEO_SF_SEAT} material={MAT_BLUE} />
      {/* Swing 2 — chains + seat */}
      <mesh position={[ 1.2, fh - ch/2, -0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[ 1.2, fh - ch/2,  0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[ 1.2, fh - ch - 0.1, 0]} geometry={GEO_SF_SEAT} material={MAT_YELLOW} />
    </group>
  );
}

/** Simple teeter-totter */
function SeeSaw({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.38, 0]} geometry={GEO_SS_BASE}  material={MAT_SLAB} />
      <mesh position={[0, 0.76, 0]} rotation={[0, 0, 0.14]} geometry={GEO_SS_PLANK} material={MAT_RED} />
      <mesh position={[-1.55, 0.9, 0]} geometry={GEO_SS_HANDLE} material={MAT_YELLOW} />
      <mesh position={[ 1.55, 0.9, 0]} geometry={GEO_SS_HANDLE} material={MAT_YELLOW} />
    </group>
  );
}

/** Sandbox with raised timber border */
function Sandbox({ x, z }: { x: number; z: number }) {
  const bh = 0.3;
  return (
    <group position={[x, 0, z]}>
      {/* Sand fill — rendered in parent 2D space, so this is handled by ground-layer boxes.
          Here we only render the timber border frame visible in 3D */}
      <mesh position={[0,   bh/2,  2.35]} geometry={GEO_SB_EDGE}   material={MAT_WOOD} />
      <mesh position={[0,   bh/2, -2.35]} geometry={GEO_SB_EDGE}   material={MAT_WOOD} />
      <mesh position={[-2.35, bh/2, 0]}   geometry={GEO_SB_EDGE_S} material={MAT_WOOD} />
      <mesh position={[ 2.35, bh/2, 0]}   geometry={GEO_SB_EDGE_S} material={MAT_WOOD} />
    </group>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function EntrancePark() {

  // ── Flat ground-layer geometry (2D X-Y coordinate space) ──────────────────
  const groundGeoms = useMemo(() => {
    const ext = (shape: THREE.Shape, depth = 0.1, bevel = false) =>
      new THREE.ExtrudeGeometry(shape, { steps: 1, depth, bevelEnabled: bevel, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 1 });

    // 1. Full grass base
    const grassShape = new THREE.Shape();
    grassShape.moveTo(0, 0); grassShape.lineTo(W, 0);
    grassShape.lineTo(W, D); grassShape.lineTo(0, D);
    grassShape.lineTo(0, 0);

    // 2. Perimeter path (annular — 1.5m wide ring), with central hole
    const pathRing = new THREE.Shape();
    pathRing.moveTo(0.5, 0.5); pathRing.lineTo(W-0.5, 0.5);
    pathRing.lineTo(W-0.5, D-0.5); pathRing.lineTo(0.5, D-0.5); pathRing.lineTo(0.5, 0.5);
    const pathHole = new THREE.Path();
    pathHole.moveTo(2.0, 2.0); pathHole.lineTo(W-2.0, 2.0);
    pathHole.lineTo(W-2.0, D-2.0); pathHole.lineTo(2.0, D-2.0); pathHole.lineTo(2.0, 2.0);
    pathRing.holes.push(pathHole);

    // 3. Center spine path (vertical strip)
    const spineX = W / 2;
    const spineShape = new THREE.Shape();
    spineShape.moveTo(spineX-1.0, 2.0); spineShape.lineTo(spineX+1.0, 2.0);
    spineShape.lineTo(spineX+1.0, D-2.0); spineShape.lineTo(spineX-1.0, D-2.0);
    spineShape.lineTo(spineX-1.0, 2.0);

    // 4. Rubber play surface (upper zone)
    const rubberShape = new THREE.Shape();
    rubberShape.moveTo(3.5, D*0.55); rubberShape.lineTo(W-3.5, D*0.55);
    rubberShape.lineTo(W-3.5, D-3.5); rubberShape.lineTo(3.5, D-3.5);
    rubberShape.lineTo(3.5, D*0.55);

    // 5. Sand box fill (lower-mid zone)
    const sandShape = new THREE.Shape();
    sandShape.moveTo(W/2-2.2, D*0.2); sandShape.lineTo(W/2+2.2, D*0.2);
    sandShape.lineTo(W/2+2.2, D*0.2+4.4); sandShape.lineTo(W/2-2.2, D*0.2+4.4);
    sandShape.lineTo(W/2-2.2, D*0.2);

    return {
      grass:  ext(grassShape, 0.1, true),
      path:   ext(pathRing,   0.14, false),
      spine:  ext(spineShape, 0.14, false),
      rubber: ext(rubberShape, 0.16, false),
      sand:   ext(sandShape,  0.18, false),
    };
  }, []);

  // Pre-computed tree positions (stable, no per-render random)
  const treePositions = useMemo<Array<{ x: number; z: number; s: number }>>(() => {
    const trees: Array<{ x: number; z: number; s: number }> = [];
    const scales = [0.9, 1.0, 0.85, 1.05, 0.95, 0.9, 1.0, 0.85, 0.95, 1.05, 0.9, 0.85];
    let si = 0;
    // Bottom edge trees
    for (let x = 2.5; x < W; x += 5.5) { trees.push({ x, z: 1.5, s: scales[si++ % scales.length] }); }
    // Top edge trees
    for (let x = 2.5; x < W; x += 5.5) { trees.push({ x, z: D - 1.5, s: scales[si++ % scales.length] }); }
    // Left edge trees
    for (let z = 7.0; z < D - 6.0; z += 7.0) { trees.push({ x: 1.5, z, s: scales[si++ % scales.length] }); }
    // Right edge trees
    for (let z = 7.0; z < D - 6.0; z += 7.0) { trees.push({ x: W - 1.5, z, s: scales[si++ % scales.length] }); }
    return trees;
  }, []);

  return (
    <group>
      {/* ── Flat ground layers (2D, laid by parent rotation) ─────────────── */}
      <mesh geometry={groundGeoms.grass}  material={MAT_GRASS} receiveShadow />
      <mesh geometry={groundGeoms.path}   material={MAT_PATH}  receiveShadow />
      <mesh geometry={groundGeoms.spine}  material={MAT_PATH}  receiveShadow />
      <mesh geometry={groundGeoms.rubber} material={MAT_RUBBER} receiveShadow />
      <mesh geometry={groundGeoms.sand}   material={MAT_SAND}  receiveShadow />

      {/* ── 3D equipment group (rotation restores standard Y-up orientation) */}
      <group position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        {/*
          Coordinate space:
            X: 0 → W (27m), left → right
            Z: 0 → -D (-37.65m), bottom-entry → top
            Y: up (world height)
        */}

        {/* ── Perimeter trees ─────────────────────────────────────────────── */}
        {treePositions.map((t, i) => (
          <Tree key={i} x={t.x} z={-t.z} s={t.s} />
        ))}

        {/* ── Benches (4 total) ────────────────────────────────────────────── */}
        <Bench x={3.5}     z={-(D * 0.48)} ry={Math.PI / 2} />
        <Bench x={W - 3.5} z={-(D * 0.48)} ry={-Math.PI / 2} />
        <Bench x={W/2 - 4} z={-(D * 0.52)} />
        <Bench x={W/2 + 4} z={-(D * 0.52)} ry={Math.PI} />

        {/* ── Pergola / shade structure (center-low zone) ──────────────────── */}
        <Pergola x={W / 2} z={-(D * 0.35)} />

        {/* ── Play equipment (upper zone on rubber mat) ────────────────────── */}
        <PlayStructure x={W/2 - 5.0} z={-(D * 0.77)} />
        <SwingSet      x={W/2 + 5.5} z={-(D * 0.77)} ry={Math.PI / 2} />
        <SeeSaw        x={W/2 - 1.0} z={-(D * 0.68)} />

        {/* ── Sandbox (lower-mid zone, centered) ──────────────────────────── */}
        <Sandbox x={W / 2} z={-(D * 0.285)} />

      </group>
    </group>
  );
}
