/**
 * EntrancePark.tsx — Children's Park (Entrance-Side)
 * TASK 3: Visual Refinement — premium residential park palette,
 *         park lamp posts, shrubs, clean refined materials.
 *
 * Mobile-first rules preserved:
 *  - All materials at module level (allocated ONCE)
 *  - All geometries at module level (allocated ONCE, shared via prop)
 *  - No animations, no particles, no per-frame calculations
 *  - castShadow limited to tall/prominent structures
 *  - Target: <70 draw calls total
 */

import { useMemo } from 'react';
import * as THREE from 'three';

// ── Park dimensions ───────────────────────────────────────────────────────────
const W = 27.0;
const D = 37.65;

// ── Refined Color Palette — Professional Residential Park ─────────────────────
const C_GRASS        = '#4f7a38';   // natural turf green
const C_GRASS_DARK   = '#3d6028';   // slightly deeper (used for shrubs)
const C_PATH         = '#c4c4b8';   // warm concrete grey
const C_RUBBER       = '#b55625';   // terracotta orange — professional, not cartoon
const C_SAND         = '#c8a458';   // natural sandy beige
const C_EQUIP_BLUE   = '#2b5f8e';   // steel blue — modern play equipment
const C_EQUIP_RED    = '#9e3020';   // brick red — restrained, professional
const C_EQUIP_YELLOW = '#c88c18';   // warm amber — not neon
const C_EQUIP_TEAL   = '#1e7070';   // accent teal for variety
const C_WOOD         = '#6a4020';   // natural dark timber
const C_WOOD_LIGHT   = '#8a5c30';   // lighter timber for bench seats
const C_TRUNK        = '#5c3818';   // dark natural bark
const C_FOLIAGE      = '#3c7030';   // balanced forest green
const C_FOLIAGE_DARK = '#2e5a24';   // deeper accent foliage
const C_PERGOLA      = '#4a3018';   // dark cedar timber
const C_PERGOLA_BEAM = '#5e3e22';   // slightly lighter cedar beam
const C_PERGOLA_ROOF = '#7a5830';   // warm cedar roof slat
const C_METAL        = '#5a5a5a';   // dark steel (chains, ladder)
const C_LAMP_POST    = '#383838';   // matte dark iron
const C_LAMP_GLOW    = '#f5e8c0';   // warm cream lantern cap
const C_SLAB         = '#8a9090';   // cool grey for fulcrum/supports

// ── Module-level Materials (allocated ONCE) ───────────────────────────────────
const MAT_GRASS    = new THREE.MeshStandardMaterial({ color: C_GRASS,        roughness: 0.92, metalness: 0 });
const MAT_PATH     = new THREE.MeshStandardMaterial({ color: C_PATH,         roughness: 0.88 });

const MAT_RUBBER   = new THREE.MeshStandardMaterial({ color: C_RUBBER,       roughness: 0.9  });
const MAT_SAND     = new THREE.MeshStandardMaterial({ color: C_SAND,         roughness: 0.96 });
const MAT_BLUE     = new THREE.MeshStandardMaterial({ color: C_EQUIP_BLUE,   roughness: 0.6, metalness: 0.15 });
const MAT_RED      = new THREE.MeshStandardMaterial({ color: C_EQUIP_RED,    roughness: 0.62 });
const MAT_YELLOW   = new THREE.MeshStandardMaterial({ color: C_EQUIP_YELLOW, roughness: 0.6  });
const MAT_TEAL     = new THREE.MeshStandardMaterial({ color: C_EQUIP_TEAL,   roughness: 0.6  });
const MAT_WOOD     = new THREE.MeshStandardMaterial({ color: C_WOOD,         roughness: 0.92 });
const MAT_WOOD_LT  = new THREE.MeshStandardMaterial({ color: C_WOOD_LIGHT,   roughness: 0.9  });
const MAT_TRUNK    = new THREE.MeshStandardMaterial({ color: C_TRUNK,        roughness: 0.95 });
const MAT_FOLIAGE  = new THREE.MeshStandardMaterial({ color: C_FOLIAGE,      roughness: 0.92 });
const MAT_FOLIAGE2 = new THREE.MeshStandardMaterial({ color: C_FOLIAGE_DARK, roughness: 0.92 });
const MAT_PERGOLA  = new THREE.MeshStandardMaterial({ color: C_PERGOLA,      roughness: 0.88 });
const MAT_PERG_BM  = new THREE.MeshStandardMaterial({ color: C_PERGOLA_BEAM, roughness: 0.86 });
const MAT_PERG_RF  = new THREE.MeshStandardMaterial({ color: C_PERGOLA_ROOF, roughness: 0.84 });
const MAT_METAL    = new THREE.MeshStandardMaterial({ color: C_METAL,        roughness: 0.5, metalness: 0.7 });
const MAT_LAMP     = new THREE.MeshStandardMaterial({ color: C_LAMP_POST,    roughness: 0.5, metalness: 0.8 });
const MAT_LAMP_CAP = new THREE.MeshStandardMaterial({ color: C_LAMP_GLOW,    roughness: 0.7  });
const MAT_SLAB     = new THREE.MeshStandardMaterial({ color: C_SLAB,         roughness: 0.8  });
const MAT_SHRUB    = new THREE.MeshStandardMaterial({ color: C_GRASS_DARK,   roughness: 0.92 });

// ── Module-level Geometries (allocated ONCE) ──────────────────────────────────
// Tree
const GEO_TRUNK      = new THREE.CylinderGeometry(0.14, 0.22, 1.4, 5, 1);
const GEO_LEAVES_LG  = new THREE.SphereGeometry(1.35, 6, 5);

// Shrub
const GEO_SHRUB      = new THREE.SphereGeometry(0.65, 5, 4);
// Bench
const GEO_BENCH_SEAT = new THREE.BoxGeometry(1.6, 0.1, 0.45);
const GEO_BENCH_BACK = new THREE.BoxGeometry(1.6, 0.45, 0.09);
const GEO_BENCH_LEG  = new THREE.BoxGeometry(0.09, 0.38, 0.38);
// Lamp post
const GEO_LAMP_POST  = new THREE.CylinderGeometry(0.055, 0.07, 3.2, 5, 1);
const GEO_LAMP_ARM   = new THREE.BoxGeometry(0.8, 0.07, 0.07);
const GEO_LAMP_HEAD  = new THREE.BoxGeometry(0.32, 0.18, 0.32);
// Pergola
const GEO_PERG_POST  = new THREE.CylinderGeometry(0.14, 0.14, 2.8, 5, 1);
const GEO_PERG_BEAM  = new THREE.BoxGeometry(7.2, 0.16, 0.22);
const GEO_PERG_RAFTER= new THREE.BoxGeometry(0.13, 0.11, 6.2);
const GEO_PERG_ROOF  = new THREE.BoxGeometry(7.2, 0.07, 6.2);
// Play structure
const GEO_LEG        = new THREE.CylinderGeometry(0.09, 0.11, 2.4, 5, 1);
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

/** Perimeter tree — alternates foliage color for natural variety */
function Tree({ x, z, s = 1.0, alt = false }: { x: number; z: number; s?: number; alt?: boolean }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.7, 0]}  castShadow geometry={GEO_TRUNK}      material={MAT_TRUNK}             />
      <mesh position={[0, 2.35, 0]} castShadow geometry={GEO_LEAVES_LG}  material={alt ? MAT_FOLIAGE2 : MAT_FOLIAGE} />
    </group>
  );
}

/** Small shrub for landscaping */
function Shrub({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.55, z]} geometry={GEO_SHRUB} material={MAT_SHRUB} />
  );
}

/** Modern outdoor bench */
function Bench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0.38, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, 0]}          geometry={GEO_BENCH_SEAT} material={MAT_WOOD_LT} />
      <mesh position={[0, 0.3, -0.18]} rotation={[0.2, 0, 0]}
                                          geometry={GEO_BENCH_BACK} material={MAT_WOOD_LT} />
      <mesh position={[-0.65, -0.19, 0]}  geometry={GEO_BENCH_LEG}  material={MAT_METAL}   />
      <mesh position={[ 0.65, -0.19, 0]}  geometry={GEO_BENCH_LEG}  material={MAT_METAL}   />
    </group>
  );
}

/** Warm outdoor park lamp post */
function LampPost({ x, z }: { x: number; z: number }) {
  const ph = 3.2;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, ph / 2, 0]}       geometry={GEO_LAMP_POST} material={MAT_LAMP}    castShadow />
      <mesh position={[0.4, ph - 0.08, 0]}  geometry={GEO_LAMP_ARM}  material={MAT_LAMP}               />
      <mesh position={[0.8, ph - 0.05, 0]}  geometry={GEO_LAMP_HEAD} material={MAT_LAMP_CAP}            />
    </group>
  );
}

/** Cedar-timber pergola with rafters */
function Pergola({ x, z }: { x: number; z: number }) {
  const ph  = 2.8;
  const hw  = 7.2 / 2 - 0.4;
  const hd  = 6.2 / 2 - 0.4;
  const rafterXs = [-2.3, -0.77, 0.77, 2.3];
  return (
    <group position={[x, 0, z]}>
      {/* Corner posts */}
      {([ [-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd] ] as [number,number][]).map(([px,pz], i) => (
        <mesh key={i} position={[px, ph/2, pz]} castShadow geometry={GEO_PERG_POST} material={MAT_PERGOLA} />
      ))}
      {/* Long top beams */}
      <mesh position={[0, ph, -hd]} castShadow geometry={GEO_PERG_BEAM}   material={MAT_PERG_BM} />
      <mesh position={[0, ph,  hd]} castShadow geometry={GEO_PERG_BEAM}   material={MAT_PERG_BM} />
      {/* Rafters (cedar slats across) */}
      {rafterXs.map((rx, i) => (
        <mesh key={i} position={[rx, ph + 0.07, 0]} geometry={GEO_PERG_RAFTER} material={MAT_PERG_RF} />
      ))}
      {/* Solid roof plane (slightly translucent-looking via warm timber color) */}
      <mesh position={[0, ph + 0.14, 0]} geometry={GEO_PERG_ROOF} material={MAT_PERG_RF} />
    </group>
  );
}

/** Compact play tower with slide — modern color palette */
function PlayStructure({ x, z }: { x: number; z: number }) {
  const ph = 2.4;
  return (
    <group position={[x, 0, z]}>
      {/* Support legs — steel blue */}
      {([ [-0.75,-0.75],[0.75,-0.75],[-0.75,0.75],[0.75,0.75] ] as [number,number][]).map(([lx,lz], i) => (
        <mesh key={i} position={[lx, ph/2, lz]} castShadow geometry={GEO_LEG}     material={MAT_BLUE} />
      ))}
      {/* Platform deck — teal accent */}
      <mesh position={[0, ph, 0]}          geometry={GEO_PLATFORM}   material={MAT_TEAL} />
      {/* Handrails — brick red */}
      <mesh position={[0, ph+0.5, -0.9]}   geometry={GEO_RAIL_LONG}  material={MAT_RED}  />
      <mesh position={[0, ph+0.5,  0.9]}   geometry={GEO_RAIL_LONG}  material={MAT_RED}  />
      <mesh position={[-0.9, ph+0.5, 0]}   geometry={GEO_RAIL_SHORT} material={MAT_RED}  />
      {/* Cone roof — deep red */}
      <mesh position={[0, ph+1.5, 0]} castShadow geometry={GEO_ROOF_CONE} material={MAT_RED}    />
      {/* Slide — warm amber */}
      <mesh position={[2.0, ph*0.45, 0]}     rotation={[0,0.1,-Math.PI/6]} castShadow
                                              geometry={GEO_SLIDE}      material={MAT_YELLOW} />
      <mesh position={[2.0, ph*0.45+0.22,-0.38]} rotation={[0,0.1,-Math.PI/6]}
                                              geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      <mesh position={[2.0, ph*0.45+0.22, 0.38]} rotation={[0,0.1,-Math.PI/6]}
                                              geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      {/* Ladder rails — dark metal */}
      <mesh position={[-0.72, ph/2,-1.2]} rotation={[-0.55,0,0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      <mesh position={[-0.28, ph/2,-1.2]} rotation={[-0.55,0,0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      {/* Ladder rungs — 4 only */}
      {[0.45,0.85,1.25,1.65].map((y,i) => (
        <mesh key={i} position={[-0.5, y, -1.2-y*0.18]} geometry={GEO_LRUNG} material={MAT_METAL} />
      ))}
    </group>
  );
}

/** A-frame swing set */
function SwingSet({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const fh = 3.4, fw = 4.4, ch = 2.6;
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[-fw/2, fh/2,-0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[-fw/2, fh/2, 0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[ fw/2, fh/2,-0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[ fw/2, fh/2, 0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[0, fh, 0]}                                             geometry={GEO_SF_TOP}  material={MAT_RED}  />
      {/* Swing 1 */}
      <mesh position={[-1.2, fh-ch/2,-0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL}  />
      <mesh position={[-1.2, fh-ch/2, 0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL}  />
      <mesh position={[-1.2, fh-ch-0.1, 0]}  geometry={GEO_SF_SEAT}  material={MAT_BLUE}   />
      {/* Swing 2 */}
      <mesh position={[ 1.2, fh-ch/2,-0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL}  />
      <mesh position={[ 1.2, fh-ch/2, 0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL}  />
      <mesh position={[ 1.2, fh-ch-0.1, 0]}  geometry={GEO_SF_SEAT}  material={MAT_YELLOW} />
    </group>
  );
}

/** See-saw */
function SeeSaw({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.38, 0]}           geometry={GEO_SS_BASE}   material={MAT_SLAB}   />
      <mesh position={[0, 0.76, 0]} rotation={[0,0,0.14]} geometry={GEO_SS_PLANK}  material={MAT_RED}    />
      <mesh position={[-1.55, 0.9, 0]}        geometry={GEO_SS_HANDLE} material={MAT_YELLOW} />
      <mesh position={[ 1.55, 0.9, 0]}        geometry={GEO_SS_HANDLE} material={MAT_YELLOW} />
    </group>
  );
}

/** Timber sandbox border */
function Sandbox({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0,    0.15,  2.35]} geometry={GEO_SB_EDGE}   material={MAT_WOOD} />
      <mesh position={[0,    0.15, -2.35]} geometry={GEO_SB_EDGE}   material={MAT_WOOD} />
      <mesh position={[-2.35,0.15,  0   ]} geometry={GEO_SB_EDGE_S} material={MAT_WOOD} />
      <mesh position={[ 2.35,0.15,  0   ]} geometry={GEO_SB_EDGE_S} material={MAT_WOOD} />
    </group>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function EntrancePark() {

  // ── Flat ground-layer geometry (2D X-Y, parent rotates to world floor) ────
  const groundGeoms = useMemo(() => {
    const ext = (shape: THREE.Shape, depth = 0.1, bevel = false) =>
      new THREE.ExtrudeGeometry(shape, {
        steps: 1, depth, bevelEnabled: bevel,
        bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 1,
      });

    // 1. Full grass base
    const grass = new THREE.Shape();
    grass.moveTo(0, 0); grass.lineTo(W, 0);
    grass.lineTo(W, D); grass.lineTo(0, D); grass.lineTo(0, 0);

    // 2. Perimeter path ring (1.5m wide, with central hole)
    const pathRing = new THREE.Shape();
    pathRing.moveTo(0.5, 0.5); pathRing.lineTo(W-0.5, 0.5);
    pathRing.lineTo(W-0.5, D-0.5); pathRing.lineTo(0.5, D-0.5); pathRing.lineTo(0.5, 0.5);
    const pathHole = new THREE.Path();
    pathHole.moveTo(2.0, 2.0); pathHole.lineTo(W-2.0, 2.0);
    pathHole.lineTo(W-2.0, D-2.0); pathHole.lineTo(2.0, D-2.0); pathHole.lineTo(2.0, 2.0);
    pathRing.holes.push(pathHole);

    // 3. Center spine path (vertical strip)
    const spine = new THREE.Shape();
    spine.moveTo(W/2-1.0, 2.0); spine.lineTo(W/2+1.0, 2.0);
    spine.lineTo(W/2+1.0, D-2.0); spine.lineTo(W/2-1.0, D-2.0); spine.lineTo(W/2-1.0, 2.0);

    // 4. Rubber play surface (upper zone, U-shaped with path spine cut through)
    const rubber = new THREE.Shape();
    rubber.moveTo(3.5, D*0.55); rubber.lineTo(W-3.5, D*0.55);
    rubber.lineTo(W-3.5, D-3.5); rubber.lineTo(3.5, D-3.5); rubber.lineTo(3.5, D*0.55);

    // 5. Sandbox fill
    const sand = new THREE.Shape();
    sand.moveTo(W/2-2.2, D*0.20); sand.lineTo(W/2+2.2, D*0.20);
    sand.lineTo(W/2+2.2, D*0.20+4.4); sand.lineTo(W/2-2.2, D*0.20+4.4); sand.lineTo(W/2-2.2, D*0.20);

    return {
      grass:  ext(grass,   0.10, true),
      path:   ext(pathRing, 0.14, false),
      spine:  ext(spine,   0.14, false),
      rubber: ext(rubber,  0.16, false),
      sand:   ext(sand,    0.18, false),
    };
  }, []);

  // Pre-computed stable tree positions (no per-render randomness)
  const treeData = useMemo<Array<{ x: number; z: number; s: number; alt: boolean }>>(() => {
    const out: Array<{ x: number; z: number; s: number; alt: boolean }> = [];
    const ss = [0.9, 1.0, 0.85, 1.05, 0.95, 0.9, 1.0, 0.85, 1.05, 0.9, 0.85, 1.0, 0.95, 0.88];
    let i = 0;
    for (let x = 2.5; x < W; x += 5.5) {
      out.push({ x, z: 1.5,     s: ss[i++ % ss.length], alt: i % 3 === 0 });
      out.push({ x, z: D - 1.5, s: ss[i++ % ss.length], alt: i % 3 === 1 });
    }
    for (let z = 7.0; z < D - 6.0; z += 7.0) {
      out.push({ x: 1.5,     z, s: ss[i++ % ss.length], alt: i % 3 === 2 });
      out.push({ x: W - 1.5, z, s: ss[i++ % ss.length], alt: i % 3 === 0 });
    }
    return out;
  }, []);

  return (
    <group>
      {/* ── Flat ground layers ──────────────────────────────────────────── */}
      <mesh geometry={groundGeoms.grass}  material={MAT_GRASS}  receiveShadow />
      <mesh geometry={groundGeoms.path}   material={MAT_PATH}   receiveShadow />
      <mesh geometry={groundGeoms.spine}  material={MAT_PATH}   receiveShadow />
      <mesh geometry={groundGeoms.rubber} material={MAT_RUBBER} receiveShadow />
      <mesh geometry={groundGeoms.sand}   material={MAT_SAND}   receiveShadow />

      {/* ── 3D equipment group (rotation restores Y-up orientation) ────── */}
      <group position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        {/*
          Local space: X: 0→W, Z: 0→-D (negative = toward park top), Y: up
        */}

        {/* Perimeter trees */}
        {treeData.map((t, i) => (
          <Tree key={i} x={t.x} z={-t.z} s={t.s} alt={t.alt} />
        ))}

        {/* Shrubs — around pergola + along spine mid-section */}
        <Shrub x={W/2 - 4.5} z={-(D * 0.33)} />
        <Shrub x={W/2 + 4.5} z={-(D * 0.33)} />
        <Shrub x={W/2 - 4.5} z={-(D * 0.40)} />
        <Shrub x={W/2 + 4.5} z={-(D * 0.40)} />
        <Shrub x={W/2 - 3.5} z={-(D * 0.10)} />
        <Shrub x={W/2 + 3.5} z={-(D * 0.10)} />

        {/* Park lamp posts — along spine, offset left/right alternately */}
        <LampPost x={W/2 - 1.8} z={-(D * 0.18)} />
        <LampPost x={W/2 + 1.8} z={-(D * 0.45)} />
        <LampPost x={W/2 - 1.8} z={-(D * 0.72)} />

        {/* Benches — same positions as before */}
        <Bench x={3.5}     z={-(D * 0.48)} ry={Math.PI / 2}  />
        <Bench x={W - 3.5} z={-(D * 0.48)} ry={-Math.PI / 2} />
        <Bench x={W/2 - 4} z={-(D * 0.52)}                   />
        <Bench x={W/2 + 4} z={-(D * 0.52)} ry={Math.PI}      />

        {/* Pergola — same position */}
        <Pergola x={W / 2} z={-(D * 0.35)} />

        {/* Play equipment — same positions */}
        <PlayStructure x={W/2 - 5.0} z={-(D * 0.77)} />
        <SwingSet      x={W/2 + 5.5} z={-(D * 0.77)} ry={Math.PI / 2} />
        <SeeSaw        x={W/2 - 1.0} z={-(D * 0.68)} />

        {/* Sandbox — same position */}
        <Sandbox x={W / 2} z={-(D * 0.285)} />

      </group>
    </group>
  );
}
