/**
 * EntrancePark.tsx — Children's Park (Entrance-Side)
 * TASK 4: Finalization — Compound Wall, Dedicated Entrance Gate, Internal Pathways
 *
 * Mobile-first rules preserved:
 *  - All materials at module level (allocated ONCE)
 *  - All geometries at module level (allocated ONCE, shared via prop)
 *  - No animations, no particles, no per-frame calculations
 *  - castShadow limited to tall/prominent structures
 *  - Target: <90 draw calls total
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { BoxPath } from './Geometry';

// ── Park dimensions ───────────────────────────────────────────────────────────
const W = 27.0;
const D = 37.65;

// ── Refined Color Palette — Professional Residential Park ─────────────────────
const C_GRASS        = '#4f7a38';   // natural turf green
const C_GRASS_DARK   = '#3d6028';   // slightly deeper (used for shrubs)
const C_PATH         = '#c4c4b8';   // warm concrete grey
const C_RUBBER       = '#b55625';   // terracotta orange — professional, not cartoon
const C_SOIL         = '#6b4b3a';   // natural dark brown earth/soil tone
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
const C_METAL        = '#3a3a3a';   // dark steel (chains, ladder, gate)
const C_LAMP_POST    = '#2a2a2a';   // matte dark iron
const C_LAMP_GLOW    = '#f5e8c0';   // warm cream lantern cap
const C_SLAB         = '#8a9090';   // cool grey for fulcrum/supports
const C_WALL         = '#d0d0cc';   // light concrete/stone for compound wall
const C_WALL_CAP     = '#a0a09c';   // slightly darker cap for the wall

// ── Module-level Materials (allocated ONCE) ───────────────────────────────────
const MAT_GRASS    = new THREE.MeshStandardMaterial({ color: C_GRASS,        roughness: 0.92, metalness: 0 });
const MAT_PATH     = new THREE.MeshStandardMaterial({ color: C_PATH,         roughness: 0.88 });
const MAT_RUBBER   = new THREE.MeshStandardMaterial({ color: C_RUBBER,       roughness: 0.9  });
const MAT_SOIL     = new THREE.MeshStandardMaterial({ color: C_SOIL,         roughness: 0.96 });
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
const MAT_WALL     = new THREE.MeshStandardMaterial({ color: C_WALL,         roughness: 0.95 });
const MAT_WALL_CAP = new THREE.MeshStandardMaterial({ color: C_WALL_CAP,     roughness: 0.9  });

// ── Module-level Geometries (allocated ONCE) ──────────────────────────────────
// Tree
const GEO_TRUNK      = new THREE.CylinderGeometry(0.14, 0.22, 1.4, 5, 1);
const GEO_BRANCH     = new THREE.CylinderGeometry(0.04, 0.08, 0.8, 4, 1);
const GEO_LEAF_1     = new THREE.IcosahedronGeometry(1.2, 1);
const GEO_LEAF_2     = new THREE.IcosahedronGeometry(1.0, 1);
const GEO_LEAF_3     = new THREE.IcosahedronGeometry(1.1, 1);
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
const GEO_LAMP_DOME  = new THREE.SphereGeometry(0.18, 5, 4);
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
const GEO_SB_EDGE_W  = new THREE.BoxGeometry(7.0, 0.3, 0.25);
const GEO_SB_EDGE_D  = new THREE.BoxGeometry(0.25, 0.3, 4.0);

// Lawn Pads (Octagons)
const GEO_PAD        = new THREE.CylinderGeometry(1.5, 1.5, 0.05, 8);

// Tent / Merry-go-round structure
const GEO_TENT_BASE  = new THREE.CylinderGeometry(4.0, 4.0, 0.2, 16);
const GEO_TENT_CONE  = new THREE.ConeGeometry(4.0, 2.5, 12);
const GEO_TENT_POLE  = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5, 1);

// Compound Wall & Gate
const WALL_THICK     = 0.4;
const WALL_HEIGHT    = 1.1;
const GEO_WALL_LONG  = new THREE.BoxGeometry(W, WALL_HEIGHT, WALL_THICK);
const GEO_WALL_SHORT = new THREE.BoxGeometry(WALL_THICK, WALL_HEIGHT, D);
const GEO_WALL_CAP_L = new THREE.BoxGeometry(W + 0.08, 0.1, WALL_THICK + 0.08);
const GEO_WALL_CAP_S = new THREE.BoxGeometry(WALL_THICK + 0.08, 0.1, D + 0.08);

const GEO_GATE_PILLAR    = new THREE.BoxGeometry(0.7, 1.6, 0.7);
const GEO_GATE_PILLAR_C  = new THREE.BoxGeometry(0.8, 0.15, 0.8);
const GEO_GATE_BAR_V     = new THREE.BoxGeometry(0.04, 1.2, 0.04);
const GEO_GATE_BAR_H     = new THREE.BoxGeometry(2.4, 0.06, 0.05);

const GEO_HEDGE_LONG = new THREE.BoxGeometry(W, 0.4, 0.4);
const GEO_HEDGE_SHORT = new THREE.BoxGeometry(0.4, 0.4, D);


// ── Sub-components ────────────────────────────────────────────────────────────

function Tree({ x, z, s = 1.0, alt = false }: { x: number; z: number; s?: number; alt?: boolean }) {
  const mat = alt ? MAT_FOLIAGE2 : MAT_FOLIAGE;
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.7, 0]}  castShadow geometry={GEO_TRUNK}  material={MAT_TRUNK} />
      {/* Branches for realism */}
      <mesh position={[-0.2, 1.3, -0.1]} rotation={[0, 0, 0.6]} geometry={GEO_BRANCH} material={MAT_TRUNK} />
      <mesh position={[0.2, 1.4, 0.1]} rotation={[0, 0, -0.5]} geometry={GEO_BRANCH} material={MAT_TRUNK} />
      
      <group position={[0, 2.3, 0]}>
        <mesh position={[0, 0.5, 0]}       castShadow geometry={GEO_LEAF_1} material={mat} />
        <mesh position={[-0.6, 0.0, -0.4]} castShadow geometry={GEO_LEAF_2} material={mat} />
        <mesh position={[0.6, -0.2, 0.4]}  castShadow geometry={GEO_LEAF_3} material={mat} />
        <mesh position={[-0.1, -0.4, 0.5]} castShadow geometry={GEO_LEAF_2} material={mat} scale={0.7} />
      </group>
    </group>
  );
}

function Shrub({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.55, z]} geometry={GEO_SHRUB} material={MAT_SHRUB} />
  );
}

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
function LampPost({ x, z, py = 0 }: { x: number; z: number; py?: number }) {
  const ph = 3.2;
  return (
    <group position={[x, py, z]}>
      <mesh position={[0, ph / 2, 0]}      geometry={GEO_LAMP_POST} material={MAT_LAMP}    castShadow />
      <mesh position={[0.4, ph - 0.08, 0]} geometry={GEO_LAMP_ARM}  material={MAT_LAMP}               />
      <mesh position={[0.8, ph - 0.05, 0]} geometry={GEO_LAMP_HEAD} material={MAT_LAMP_CAP}           />
      <mesh position={[0.8, ph + 0.07, 0]} geometry={GEO_LAMP_DOME} material={MAT_LAMP}               />
    </group>
  );
}

function Pergola({ x, z }: { x: number; z: number }) {
  const ph  = 2.8, hw = 7.2 / 2 - 0.4, hd = 6.2 / 2 - 0.4;
  const rafterXs = [-2.3, -0.77, 0.77, 2.3];
  return (
    <group position={[x, 0, z]}>
      {([ [-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd] ] as [number,number][]).map(([px,pz], i) => (
        <mesh key={i} position={[px, ph/2, pz]} castShadow geometry={GEO_PERG_POST} material={MAT_PERGOLA} />
      ))}
      <mesh position={[0, ph, -hd]} castShadow geometry={GEO_PERG_BEAM}   material={MAT_PERG_BM} />
      <mesh position={[0, ph,  hd]} castShadow geometry={GEO_PERG_BEAM}   material={MAT_PERG_BM} />
      {rafterXs.map((rx, i) => (
        <mesh key={i} position={[rx, ph + 0.07, 0]} geometry={GEO_PERG_RAFTER} material={MAT_PERG_RF} />
      ))}
      <mesh position={[0, ph + 0.14, 0]} geometry={GEO_PERG_ROOF} material={MAT_PERG_RF} />
    </group>
  );
}

function PlayStructure({ x, z }: { x: number; z: number }) {
  const ph = 2.4;
  return (
    <group position={[x, 0, z]}>
      {([ [-0.75,-0.75],[0.75,-0.75],[-0.75,0.75],[0.75,0.75] ] as [number,number][]).map(([lx,lz], i) => (
        <mesh key={i} position={[lx, ph/2, lz]} castShadow geometry={GEO_LEG} material={MAT_BLUE} />
      ))}
      <mesh position={[0, ph, 0]}          geometry={GEO_PLATFORM}   material={MAT_TEAL} />
      <mesh position={[0, ph+0.5, -0.9]}   geometry={GEO_RAIL_LONG}  material={MAT_RED}  />
      <mesh position={[0, ph+0.5,  0.9]}   geometry={GEO_RAIL_LONG}  material={MAT_RED}  />
      <mesh position={[-0.9, ph+0.5, 0]}   geometry={GEO_RAIL_SHORT} material={MAT_RED}  />
      <mesh position={[0, ph+1.5, 0]} castShadow geometry={GEO_ROOF_CONE} material={MAT_RED}    />
      <mesh position={[2.0, ph*0.45, 0]}     rotation={[0,0.1,-Math.PI/6]} castShadow geometry={GEO_SLIDE} material={MAT_YELLOW} />
      <mesh position={[2.0, ph*0.45+0.22,-0.38]} rotation={[0,0.1,-Math.PI/6]} geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      <mesh position={[2.0, ph*0.45+0.22, 0.38]} rotation={[0,0.1,-Math.PI/6]} geometry={GEO_SLIDE_RAIL} material={MAT_YELLOW} />
      <mesh position={[-0.72, ph/2,-1.2]} rotation={[-0.55,0,0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      <mesh position={[-0.28, ph/2,-1.2]} rotation={[-0.55,0,0]} geometry={GEO_LRAIL} material={MAT_METAL} />
      {[0.45,0.85,1.25,1.65].map((y,i) => (
        <mesh key={i} position={[-0.5, y, -1.2-y*0.18]} geometry={GEO_LRUNG} material={MAT_METAL} />
      ))}
    </group>
  );
}

function SwingSet({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const fh = 3.4, fw = 4.4, ch = 2.6;
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[-fw/2, fh/2,-0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[-fw/2, fh/2, 0.38]} rotation={[0,0, 0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[ fw/2, fh/2,-0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[ fw/2, fh/2, 0.38]} rotation={[0,0,-0.18]} castShadow geometry={GEO_SF_POST} material={MAT_RED}  />
      <mesh position={[0, fh, 0]} geometry={GEO_SF_TOP} material={MAT_RED} />
      <mesh position={[-1.2, fh-ch/2,-0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[-1.2, fh-ch/2, 0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[-1.2, fh-ch-0.1, 0]}  geometry={GEO_SF_SEAT}  material={MAT_BLUE} />
      <mesh position={[ 1.2, fh-ch/2,-0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[ 1.2, fh-ch/2, 0.28]} geometry={GEO_SF_CHAIN} material={MAT_METAL} />
      <mesh position={[ 1.2, fh-ch-0.1, 0]}  geometry={GEO_SF_SEAT}  material={MAT_YELLOW} />
    </group>
  );
}

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

function Sandbox({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0,    0.15,  2.0 ]} geometry={GEO_SB_EDGE_W} material={MAT_WOOD} />
      <mesh position={[0,    0.15, -2.0 ]} geometry={GEO_SB_EDGE_W} material={MAT_WOOD} />
      <mesh position={[-3.5, 0.15,  0   ]} geometry={GEO_SB_EDGE_D} material={MAT_WOOD} />
      <mesh position={[ 3.5, 0.15,  0   ]} geometry={GEO_SB_EDGE_D} material={MAT_WOOD} />
    </group>
  );
}

function Tent({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.1, 0]} geometry={GEO_TENT_BASE} material={MAT_SLAB} />
      <mesh position={[0, 3.45, 0]} castShadow geometry={GEO_TENT_CONE} material={MAT_RED} />
      {/* Decorative white rim */}
      <mesh position={[0, 2.2, 0]} geometry={GEO_TENT_CONE} material={MAT_LAMP_CAP} scale={[1.02, 0.05, 1.02]} />
      {/* 8 Poles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a)*3.7, 1.1, Math.sin(a)*3.7]} geometry={GEO_TENT_POLE} material={MAT_METAL} />
        );
      })}
    </group>
  );
}

/** Complete Compound Wall around the park boundary */
function CompoundWall() {
  const y = WALL_HEIGHT / 2;
  const cy = WALL_HEIGHT + 0.05;
  const hy = 0.2; // Hedge height/2
  
  // The gate is on the back wall (Z = -D, inside the layout), centered at X = W/2.
  const gapW = 3.0;
  const backW = (W - gapW) / 2;

  // Back wall left of gate
  const bwL_geom = new THREE.BoxGeometry(backW, WALL_HEIGHT, WALL_THICK);
  const bwL_cap = new THREE.BoxGeometry(backW + 0.08, 0.1, WALL_THICK + 0.08);
  // Back wall right of gate
  const bwR_geom = new THREE.BoxGeometry(backW, WALL_HEIGHT, WALL_THICK);
  const bwR_cap = new THREE.BoxGeometry(backW + 0.08, 0.1, WALL_THICK + 0.08);

  return (
    <group>
      {/* Front Wall & Hedges (Solid facing 9.0m road) */}
      <mesh position={[W/2, y, 0]} geometry={GEO_WALL_LONG} material={MAT_WALL} />
      <mesh position={[W/2, cy, 0]} geometry={GEO_WALL_CAP_L} material={MAT_WALL_CAP} />
      <mesh position={[W/2, hy, 0.4]} geometry={GEO_HEDGE_LONG} material={MAT_SHRUB} />
      <mesh position={[W/2, hy, -0.4]} geometry={GEO_HEDGE_LONG} material={MAT_SHRUB} />

      {/* Left Wall & Hedges */}
      <mesh position={[0, y, -D/2]} geometry={GEO_WALL_SHORT} material={MAT_WALL} />
      <mesh position={[0, cy, -D/2]} geometry={GEO_WALL_CAP_S} material={MAT_WALL_CAP} />
      <mesh position={[0.4, hy, -D/2]} geometry={GEO_HEDGE_SHORT} material={MAT_SHRUB} />
      <mesh position={[-0.4, hy, -D/2]} geometry={GEO_HEDGE_SHORT} material={MAT_SHRUB} />

      {/* Right Wall & Hedges */}
      <mesh position={[W, y, -D/2]} geometry={GEO_WALL_SHORT} material={MAT_WALL} />
      <mesh position={[W, cy, -D/2]} geometry={GEO_WALL_CAP_S} material={MAT_WALL_CAP} />
      <mesh position={[W - 0.4, hy, -D/2]} geometry={GEO_HEDGE_SHORT} material={MAT_SHRUB} />
      <mesh position={[W + 0.4, hy, -D/2]} geometry={GEO_HEDGE_SHORT} material={MAT_SHRUB} />

      {/* Back Wall (with gate gap) */}
      <mesh position={[backW/2, y, -D]} geometry={bwL_geom} material={MAT_WALL} />
      <mesh position={[backW/2, cy, -D]} geometry={bwL_cap} material={MAT_WALL_CAP} />
      <mesh position={[backW/2, hy, -D + 0.4]} geometry={new THREE.BoxGeometry(backW, 0.4, 0.4)} material={MAT_SHRUB} />
      <mesh position={[backW/2, hy, -D - 0.4]} geometry={new THREE.BoxGeometry(backW, 0.4, 0.4)} material={MAT_SHRUB} />

      <mesh position={[W - backW/2, y, -D]} geometry={bwR_geom} material={MAT_WALL} />
      <mesh position={[W - backW/2, cy, -D]} geometry={bwR_cap} material={MAT_WALL_CAP} />
      <mesh position={[W - backW/2, hy, -D + 0.4]} geometry={new THREE.BoxGeometry(backW, 0.4, 0.4)} material={MAT_SHRUB} />
      <mesh position={[W - backW/2, hy, -D - 0.4]} geometry={new THREE.BoxGeometry(backW, 0.4, 0.4)} material={MAT_SHRUB} />
    </group>
  );
}

/** Dedicated pedestrian entrance gate */
function EntranceGate() {
  const py = 1.6 / 2;
  const cy = 1.6 + 0.07;
  return (
    <group position={[W/2, 0, -D]}>
      {/* Left Pillar (looking from outside back road) */}
      <mesh position={[1.5, py, 0]} geometry={GEO_GATE_PILLAR} material={MAT_WALL} />
      <mesh position={[1.5, cy, 0]} geometry={GEO_GATE_PILLAR_C} material={MAT_WALL_CAP} />
      <LampPost x={1.5} z={0} py={1.67} />
      
      {/* Right Pillar */}
      <mesh position={[-1.5, py, 0]} geometry={GEO_GATE_PILLAR} material={MAT_WALL} />
      <mesh position={[-1.5, cy, 0]} geometry={GEO_GATE_PILLAR_C} material={MAT_WALL_CAP} />
      <LampPost x={-1.5} z={0} py={1.67} />

      {/* Metal Gate (centered between pillars) */}
      <mesh position={[0, 0.5, 0]} geometry={GEO_GATE_BAR_H} material={MAT_METAL} />
      <mesh position={[0, 1.2, 0]} geometry={GEO_GATE_BAR_H} material={MAT_METAL} />
      {[-1.1, -0.85, -0.6, -0.35, -0.1, 0.15, 0.4, 0.65, 0.9, 1.15].map((ox, i) => (
        <mesh key={i} position={[ox - 0.025, 0.85, 0]} geometry={GEO_GATE_BAR_V} material={MAT_METAL} />
      ))}
    </group>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EntrancePark() {

  // ── Flat ground-layer geometry (2D X-Y, parent rotates to world floor) ────
  const groundGeoms = useMemo(() => {
    const ext = (shapes: THREE.Shape | THREE.Shape[], depth = 0.1, bevel = false) =>
      new THREE.ExtrudeGeometry(shapes, {
        steps: 1, depth, bevelEnabled: bevel,
        bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 1,
      });

    const addRect = (arr: THREE.Shape[], x1: number, y1: number, x2: number, y2: number) => {
      const s = new THREE.Shape();
      s.moveTo(x1, y1); s.lineTo(x2, y1); s.lineTo(x2, y2); s.lineTo(x1, y2); s.lineTo(x1, y1);
      arr.push(s);
    };

    // 1. Full grass base
    const grass = new THREE.Shape();
    grass.moveTo(0, 0); grass.lineTo(W, 0);
    grass.lineTo(W, D); grass.lineTo(0, D); grass.lineTo(0, 0);

    // 2. Pathway Network (Perimeter + Central Cross)
    // Replaced with BoxPath in render loop to match the main Park

    // 3. Play Areas & Pads (Rubber)
    const rubberShapes: THREE.Shape[] = [];
    // Q1: Top-Left Playground Rectangle
    addRect(rubberShapes, 4.5, 4.5, 11.5, 16.5);
    // Q2: Top-Right Circular Plaza
    const plaza = new THREE.Shape();
    plaza.absarc(19.0, 10.5, 4.5, 0, Math.PI * 2, false);
    rubberShapes.push(plaza);

    // 4. Sandbox (Sand)
    const sandShapes: THREE.Shape[] = [];
    // Q4: Bottom-Right Sandbox
    addRect(sandShapes, 15.5, 29.0, 22.5, 33.0);

    // 5. Pergola Paved Base
    const pergolaBaseShapes: THREE.Shape[] = [];
    addRect(pergolaBaseShapes, 15.0, 21.0, 23.0, 28.0);

    return {
      grass:      ext(grass,             0.10, true),
      rubber:     ext(rubberShapes,      0.16, true), // beveled for safety mat look
      sand:       ext(sandShapes,        0.18, false),
      pergolaBase:ext(pergolaBaseShapes, 0.12, true),
    };
  }, []);

  const treeData = useMemo<Array<{ x: number; z: number; s: number; alt: boolean }>>(() => {
    const out: Array<{ x: number; z: number; s: number; alt: boolean }> = [];
    const ss = [0.9, 1.0, 0.85, 1.05, 0.95, 0.9, 1.0, 0.85, 1.05, 0.9, 0.85, 1.0, 0.95, 0.88];
    let i = 0;
    // Trees placed strictly in the perimeter buffer (0.8m from wall)
    for (let z = 2.0; z < D - 2.0; z += 5.0) {
      out.push({ x: 0.8, z, s: ss[i++ % ss.length], alt: i % 3 === 0 });
      out.push({ x: W - 0.8, z, s: ss[i++ % ss.length], alt: i % 3 === 1 });
    }
    for (let x = 4.0; x < W - 3.0; x += 5.5) {
      out.push({ x, z: 0.8, s: ss[i++ % ss.length], alt: i % 3 === 2 }); // Top edge
      // Bottom edge (near gate) - skip the center where the gate is
      if (x < 11.0 || x > 16.0) {
        out.push({ x, z: D - 0.8, s: ss[i++ % ss.length], alt: i % 3 === 0 });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {/* ── Flat ground layers ──────────────────────────────────────────── */}
      <mesh geometry={groundGeoms.grass}       material={MAT_GRASS}   receiveShadow />
      <mesh geometry={groundGeoms.rubber}      material={MAT_RUBBER}  receiveShadow />
      <mesh geometry={groundGeoms.sand}        material={MAT_SOIL}    receiveShadow />
      <mesh geometry={groundGeoms.pergolaBase} material={MAT_PATH}    receiveShadow />

      {/* ── 3D equipment group (rotation restores Y-up orientation) ────── */}
      <group position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        
        {/* Pathway Network using BoxPath (Y-up orientation) */}
        {/* Note: BoxPath takes x0, z0, x1, z1 (Z is negative in this Y-up space) */}
        <group position={[0, 0.02, 0]}>
          {/* Perimeter Left & Right (width=2) */}
          <BoxPath x0={2.5} z0={-1.5} x1={2.5} z1={-36.0} w={2.0} color={C_PATH} y={0} />
          <BoxPath x0={24.5} z0={-1.5} x1={24.5} z1={-36.0} w={2.0} color={C_PATH} y={0} />
          {/* Perimeter Top & Bottom (width=2) */}
          <BoxPath x0={3.5} z0={-2.5} x1={23.5} z1={-2.5} w={2.0} color={C_PATH} y={0} />
          <BoxPath x0={3.5} z0={-35.0} x1={23.5} z1={-35.0} w={2.0} color={C_PATH} y={0} />
          {/* Central Vertical (Gate to Center) */}
          <BoxPath x0={13.5} z0={-3.5} x1={13.5} z1={-D} w={2.0} color={C_PATH} y={0} />
          {/* Central Horizontal Left & Right */}
          <BoxPath x0={3.5} z0={-18.5} x1={12.5} z1={-18.5} w={2.0} color={C_PATH} y={0} />
          <BoxPath x0={14.5} z0={-18.5} x1={23.5} z1={-18.5} w={2.0} color={C_PATH} y={0} />
        </group>

        {/* 1 & 2. Boundary Wall & Entrance Gate */}
        <CompoundWall />
        <EntranceGate />

        {/* Trees */}
        {treeData.map((t, i) => (
          <Tree key={i} x={t.x} z={-t.z} s={t.s} alt={t.alt} />
        ))}

        {/* Shrubs — Only intentional boundary/perimeter landscaping */}
        <Shrub x={1.5} z={-1.5} />
        <Shrub x={W-1.5} z={-1.5} />
        <Shrub x={1.5} z={-(D-1.5)} />
        <Shrub x={W-1.5} z={-(D-1.5)} />

        {/* Q3 Bottom-Left: Lawn Pads (Soil color) */}
        <mesh position={[6.5, 0.05, -27.0]} rotation={[0,0,0]} geometry={GEO_PAD} material={MAT_SOIL} />
        <mesh position={[10.5, 0.05, -27.0]} rotation={[0,0,0]} geometry={GEO_PAD} material={MAT_SOIL} />


        {/* Park lamp posts at intersections */}
        <LampPost x={4.0} z={-17.0} />
        <LampPost x={12.0} z={-17.0} />
        <LampPost x={15.0} z={-17.0} />
        <LampPost x={23.0} z={-17.0} />
        <LampPost x={12.0} z={-4.0} />
        <LampPost x={15.0} z={-4.0} />
        <LampPost x={12.0} z={-33.0} />
        <LampPost x={15.0} z={-33.0} />

        {/* Benches */}
        <Bench x={8.0}  z={-3.0} ry={0} />
        <Bench x={19.0} z={-3.0} ry={0} />
        <Bench x={12.0} z={-27.0} ry={Math.PI / 2} />
        <Bench x={15.0} z={-27.0} ry={-Math.PI / 2} />

        {/* Q1 Top-Left: Playground */}
        <PlayStructure x={8.0} z={-8.0} />
        <SwingSet      x={8.0} z={-13.5} ry={Math.PI / 2} />
        <SeeSaw        x={6.0} z={-10.5} />

        {/* Q2 Top-Right: Circular Tent Area */}
        <Tent x={19.0} z={-10.5} />

        {/* Q4 Bottom-Right: Pergola & Sandbox */}
        <Pergola x={19.0} z={-24.5} />
        <Sandbox x={19.0} z={-31.0} />

      </group>
    </group>
  );
}
