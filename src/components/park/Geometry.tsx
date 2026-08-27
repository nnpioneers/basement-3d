import { useMemo } from 'react';
import * as THREE from 'three';

// ── Shape builders ────────────────────────────────────────────

/** Rounded rectangle Shape centred at origin (XY plane). */
export function roundedRect(w: number, d: number, r: number): THREE.Shape {
  const x = w / 2;
  const y = d / 2;
  r = Math.min(r, x - 0.1, y - 0.1);
  const s = new THREE.Shape();
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

// ── Flat disc ─────────────────────────────────────────────────
export function Disc({
  cx = 0, cz = 0, r, color, y = 0.06, segs = 48,
}: { cx?: number; cz?: number; r: number; color: string; y?: number; segs?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, y, cz]} receiveShadow>
      <circleGeometry args={[r, segs]} />
      <meshStandardMaterial color={color} roughness={0.88} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── Flat ring ─────────────────────────────────────────────────
export function Ring({
  cx = 0, cz = 0, outerR, innerR, color, y = 0.06, segs = 48,
}: { cx?: number; cz?: number; outerR: number; innerR: number; color: string; y?: number; segs?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, y, cz]} receiveShadow>
      <ringGeometry args={[innerR, outerR, segs]} />
      <meshStandardMaterial color={color} roughness={0.88} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── Straight box path ─────────────────────────────────────────
export function BoxPath({
  x0, z0, x1, z1, w = 2.2, color = '#d4b87a', y = 0.08,
}: { x0: number; z0: number; x1: number; z1: number; w?: number; color?: string; y?: number }) {
  const geom = useMemo(() => {
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const g = new THREE.BoxGeometry(len, 0.12, w);
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(-angle));
    g.applyMatrix4(new THREE.Matrix4().makeTranslation((x0 + x1) / 2, 0, (z0 + z1) / 2));
    return g;
  }, [x0, z0, x1, z1, w]);
  return (
    <mesh geometry={geom} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── Tube path (curved) ────────────────────────────────────────
export function TubePath({
  points, w = 1.8, color = '#d4b87a', y = 0.08,
}: { points: [number, number, number][]; w?: number; color?: string; y?: number }) {
  const geom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, _y, z]) => new THREE.Vector3(x, y, z)),
      false, 'centripetal', 0.5
    );
    return new THREE.TubeGeometry(curve, 40, w / 2, 6, false);
  }, [points, w, y]);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} envMapIntensity={0.2} />
    </mesh>
  );
}

// ── Cylinder column ───────────────────────────────────────────
export function Column({
  x, y = 0, z, r = 0.28, h = 4, color = '#c8b89a',
}: { x: number; y?: number; z: number; r?: number; h?: number; color?: string }) {
  return (
    <mesh position={[x, y + h / 2, z]} castShadow receiveShadow>
      <cylinderGeometry args={[r * 0.9, r, h, 10]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
