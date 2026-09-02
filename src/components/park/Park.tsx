import { useMemo } from 'react';
import * as THREE from 'three';
import { parkConfig as C } from './config';
import { roundedRect, BoxPath, Disc, Ring } from './Geometry';

const TRACK_COLOR = '#8b2612';
const PATH_COLOR  = '#cdad70';
const PAVE_COLOR  = '#cfbc88';
const GRASS_INNER = '#2e7d32';

// ── Helpers ───────────────────────────────────────────────────

function useShapeGeom(fn: () => THREE.Shape, h = 0.14) {
  return useMemo(() => new THREE.ExtrudeGeometry(fn(), {
    depth: h, bevelEnabled: false, curveSegments: 56,
  }), []);
}

// ── OUTER TRACK (rounded rectangle loop) ─────────────────────
export function OuterTrack() {
  const geom = useShapeGeom(() => {
    const { parkWidth: W, parkDepth: D, trackWidth: TW, trackCornerRadius: R } = C;
    const outer = roundedRect(W, D, R);
    const inner = roundedRect(W - TW * 2, D - TW * 2, Math.max(1, R - TW));
    const holePts = inner.getPoints(80);
    outer.holes = [new THREE.Path(holePts)];
    return outer;
  }, 0.18);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow castShadow>
      <meshStandardMaterial color={TRACK_COLOR} roughness={0.92} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── INNER LAWN ────────────────────────────────────────────────
export function InnerLawn() {
  const { lawnWidth: W, lawnDepth: D, trackCornerRadius: R, trackWidth: TW } = C;
  const w = W;
  const d = D;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
      <shapeGeometry args={[roundedRect(w, d, Math.max(1, R - TW))]} />
      <meshStandardMaterial color={GRASS_INNER} roughness={0.88} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── MONUMENT PLAZA RING ───────────────────────────────────────
export function MonumentRing() {
  const { monumentCX: cx, monumentCZ: cz, monumentPlazaR: pR, monumentRingR: rR, monumentRingW: rW } = C;
  return (
    <group>
      {/* Paved outer circulation ring */}
      <Ring cx={cx} cz={cz} outerR={rR} innerR={rR - rW} color={PAVE_COLOR} y={0.09} />
      {/* Inner green garden zone */}
      <Ring cx={cx} cz={cz} outerR={rR - rW} innerR={pR} color="#3aaa50" y={0.07} />
      {/* Central paved plaza */}
      <Disc cx={cx} cz={cz} r={pR} color={PAVE_COLOR} y={0.10} />
    </group>
  );
}

// ── GAZEBO RING ───────────────────────────────────────────────
export function GazeboRing() {
  const { gazeboCX: cx, gazeboCZ: cz, gazeboRingR: rR, gazeboRingW: rW } = C;
  return (
    <group>
      <Ring cx={cx} cz={cz} outerR={rR} innerR={rR - rW} color={PAVE_COLOR} y={0.09} />
      <Ring cx={cx} cz={cz} outerR={rR - rW} innerR={4.0} color="#3aaa50" y={0.07} />
      <Disc cx={cx} cz={cz} r={4.0} color={PAVE_COLOR} y={0.10} />
    </group>
  );
}

// ── ALL INTERNAL PATHS ────────────────────────────────────────
export function InternalPaths() {
  const {
    monumentCX: mCX, monumentCZ: mCZ, monumentRingR: mR,
    gazeboCX: gCX, gazeboCZ: gCZ, gazeboRingR: gR,
    gymCX, gymCZ,
    playCX, playCZ, playRadius: pR,
    waterCX: wCX, waterCZ: wCZ, waterR,
    pergolaCX, pergolaCZ,
    parkWidth: PW, parkDepth: PD, trackWidth: TW,
    mainPathWidth: mp, secondaryPathWidth: sp, spurPathWidth: spur,
  } = C;

  // Track inner edges
  const innerRight = PW / 2 - TW - 0.5;
  const innerTop   = -(PD / 2 - TW - 0.5);  // negative = north
  const innerBot   =  (PD / 2 - TW - 0.5);  // positive = south

  return (
    <group>
      {/* ── MAIN HORIZONTAL SPINE: monument → gazebo ── */}
      <BoxPath x0={mCX + mR} z0={mCZ} x1={gCX - gR} z1={gCZ} w={mp} color={PATH_COLOR} />

      {/* ── GAZEBO → EAST TRACK ── */}
      <BoxPath x0={gCX + gR} z0={gCZ} x1={innerRight - 1} z1={gCZ} w={mp} color={PATH_COLOR} />

      {/* ── MONUMENT NORTH approach (top track) ── */}
      <BoxPath x0={mCX} z0={innerTop} x1={mCX} z1={mCZ - mR} w={mp} color={PATH_COLOR} />

      {/* ── MONUMENT SOUTH approach (bottom track) ── */}
      <BoxPath x0={mCX} z0={mCZ + mR} x1={mCX} z1={innerBot} w={mp} color={PATH_COLOR} />

      {/* ── MONUMENT RADIAL SPURS (4 diagonal) ── */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz],i) => (
        <BoxPath key={`ms${i}`}
          x0={mCX + sx * mR * 0.72} z0={mCZ + sz * mR * 0.72}
          x1={mCX + sx * (mR + 4)}   z1={mCZ + sz * (mR + 4)}
          w={spur} color={PATH_COLOR} />
      ))}

      {/* ── GYM access path ── */}
      <BoxPath x0={gymCX} z0={gymCZ + C.gymRadius} x1={gymCX} z1={innerTop + 2} w={sp} color={PATH_COLOR} />
      <BoxPath x0={gymCX} z0={gymCZ + C.gymRadius} x1={mCX}   z1={mCZ - mR * 0.6} w={sp} color={PATH_COLOR} />

      {/* ── PLAY AREA access ── */}
      <BoxPath x0={playCX} z0={playCZ - pR} x1={playCX} z1={mCZ + mR * 0.6} w={sp} color={PATH_COLOR} />
      <BoxPath x0={playCX} z0={playCZ + pR} x1={playCX} z1={innerBot - 2} w={sp} color={PATH_COLOR} />

      {/* ── GARDEN PATH: water body → gazebo (3 flat segments, no pipe) ── */}
      <BoxPath x0={wCX + waterR + 1.5} z0={wCZ}  x1={8}           z1={-5}  w={sp} color={PATH_COLOR} />
      <BoxPath x0={8}                   z0={-5}   x1={15}          z1={-1}  w={sp} color={PATH_COLOR} />
      <BoxPath x0={15}                  z0={-1}   x1={gCX - gR}    z1={gCZ} w={sp} color={PATH_COLOR} />

      {/* ── WATER BODY RING PATH ── */}
      <Ring cx={wCX} cz={wCZ} outerR={waterR + 2.5} innerR={waterR + 1.2} color={PATH_COLOR} y={0.07} segs={36} />

      {/* ── PERGOLA access path ── */}
      <BoxPath x0={gCX + gR + 4} z0={gCZ} x1={pergolaCX - C.pergolaLength / 2 - 1} z1={pergolaCZ} w={sp} color={PATH_COLOR} />

      {/* ── GAZEBO DIAGONAL SPURS (NW/NE/SW/SE) ── */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz],i) => (
        <BoxPath key={`gs${i}`}
          x0={gCX + sx * gR * 0.72} z0={gCZ + sz * gR * 0.72}
          x1={gCX + sx * (gR + 4.5)} z1={gCZ + sz * (gR + 4.5)}
          w={spur} color={PATH_COLOR} />
      ))}
    </group>
  );
}
