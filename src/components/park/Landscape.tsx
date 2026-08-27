import { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
import { parkConfig as C } from './config';

// ── Colors ───────────────────────────────────────────────────
const TRUNK_C   = '#7a5530';
const CANOPY_A  = '#2d8a3e';
const CANOPY_B  = '#1e6e2e';
const PALM_T    = '#8a6a40';
const PALM_F    = '#3aaa50';
const SHRUB_A   = '#3a9a45';
const SHRUB_B   = '#2e7838';
const FLOWER_R  = '#e06060';
const FLOWER_Y  = '#e0c040';
const FLOWER_P  = '#9060c0';
const FLOWER_W  = '#e8e0d0';
const ROCK_C    = '#8a8070';
const BENCH_W   = '#8b5e3c';
const BENCH_M   = '#707070';

// ── seeded PRNG ──────────────────────────────────────────────
function mkRand(seed: number) {
  let s = seed;
  return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; };
}

// ── LampPost Component (kept as standard since they have pointLights) ──
function LampPost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.5, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.2, 8]} />
        <meshStandardMaterial color="#fff0d0" emissive="#ffc060" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.82, 0]} castShadow>
        <coneGeometry args={[0.18, 0.15, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <pointLight position={[0, 2.7, 0]} color="#ffb050" intensity={0.6} distance={15} decay={2} />
    </group>
  );
}

// ── Main Landscape Component ─────────────────────────────────
export default function Landscape() {
  const {
    parkWidth: PW, parkDepth: PD,
    monumentCX: mCX, monumentCZ: mCZ, monumentRingR: mR,
    gazeboCX: gCX, gazeboCZ: gCZ, gazeboRingR: gR,
    waterCX: wCX, waterCZ: wCZ, waterR,
    gymCX, gymCZ, gymRadius,
    playCX, playCZ, playRadius,
    pergolaCX, pergolaCZ,
  } = C;

  const trackHalfW = PW / 2;
  const trackHalfD = PD / 2;

  // 1. Generate all positions/props
  const data = useMemo(() => {
    const trees: {x:number, z:number, h:number, cr:number, dark:boolean}[] = [];
    const palms: {x:number, z:number, h:number}[] = [];
    const shrubs: {x:number, z:number, r:number, color:string}[] = [];
    const rocks: {x:number, z:number, s:number, ry:number}[] = [];
    const flowers: {x:number, z:number, color:string, r:number}[] = [];
    const benches: {x:number, z:number, ry:number}[] = [];

    // NORTH outer tree row
    const rand1 = mkRand(101);
    for (let x = -trackHalfW + 2; x <= trackHalfW - 2; x += 5.5 + rand1()*2) {
      const z = -(trackHalfD + 1.8 + rand1()*3);
      if (rand1() < 0.28) {
        palms.push({ x, z, h: 5 + rand1()*2 });
      } else {
        trees.push({ x, z, h: 4 + rand1()*2, cr: 1.8 + rand1()*0.8, dark: rand1()<0.3 });
      }
      trees.push({ x: x + 2.5 + rand1()*1.5, z: -(trackHalfD + 4.5 + rand1()*2.5), h: 4.5 + rand1()*2, cr: 2.0 + rand1()*0.7, dark: rand1()<0.4 });
    }

    // SOUTH outer tree row
    const rand2 = mkRand(202);
    for (let x = -trackHalfW + 2; x <= trackHalfW - 2; x += 5.5 + rand2()*2) {
      const z = trackHalfD + 1.8 + rand2()*3;
      if (rand2() < 0.28) {
        palms.push({ x, z, h: 5 + rand2()*2 });
      } else {
        trees.push({ x, z, h: 4 + rand2()*2, cr: 1.8 + rand2()*0.8, dark: rand2()<0.3 });
      }
      trees.push({ x: x + 2.5 + rand2()*1.5, z: trackHalfD + 4.5 + rand2()*2.5, h: 4.5 + rand2()*2, cr: 2.0 + rand2()*0.7, dark: rand2()<0.4 });
    }

    // WEST corner trees
    const rand3 = mkRand(303);
    for (let z = -trackHalfD + 1; z <= trackHalfD - 1; z += 5 + rand3()*2) {
      trees.push({ x: -(trackHalfW + 2.5 + rand3()*2.5), z, h: 4.5 + rand3()*2, cr: 2.0 + rand3()*0.7, dark: false });
    }

    // EAST corner trees
    const rand4 = mkRand(404);
    for (let z = -trackHalfD + 1; z <= trackHalfD - 1; z += 5 + rand4()*2) {
      trees.push({ x: trackHalfW + 2.5 + rand4()*2, z, h: 4.5 + rand4()*2, cr: 2.0 + rand4()*0.7, dark: false });
    }

    // Monument Decor
    [0,1,2,3,4,5,6,7].forEach(i => {
      const a = (i/8)*Math.PI*2 + 0.2;
      const rd = mR + 2.8;
      shrubs.push({ x: mCX + Math.cos(a)*rd, z: mCZ + Math.sin(a)*rd, r: 0.55, color: i%2===0?SHRUB_A:SHRUB_B });
      flowers.push({ x: mCX + Math.cos(a+0.4)*(rd+1.5), z: mCZ + Math.sin(a+0.4)*(rd+1.5), color: [FLOWER_R,FLOWER_Y,FLOWER_P,FLOWER_W][i%4], r: 0.38 });
    });

    // Water Decor
    [0,60,120,180,240,300].forEach((deg,i) => {
      const a = (deg*Math.PI)/180;
      shrubs.push({ x: wCX + Math.cos(a)*(waterR+2), z: wCZ + Math.sin(a)*(waterR+2), r: 0.5 + (i%3)*0.15, color: i%2===0?SHRUB_A:SHRUB_B });
      rocks.push({ x: wCX + Math.cos(a+0.5)*(waterR+1.2), z: wCZ + Math.sin(a+0.5)*(waterR+1.2), s: 0.32 + (i%3)*0.14, ry: deg*0.4 });
    });

    // Path Flowers
    flowers.push({ x: mCX+5, z: mCZ+4, color: FLOWER_R, r: 0.4 });
    flowers.push({ x: mCX+5, z: mCZ-4, color: FLOWER_Y, r: 0.4 });
    flowers.push({ x: wCX-3, z: wCZ+3, color: FLOWER_P, r: 0.38 });
    flowers.push({ x: wCX+3, z: wCZ-3, color: FLOWER_W, r: 0.38 });
    flowers.push({ x: gCX-5, z: gCZ+4, color: FLOWER_R, r: 0.4 });
    flowers.push({ x: gCX-5, z: gCZ-4, color: FLOWER_Y, r: 0.4 });

    // Pergola Flanks
    shrubs.push({ x: pergolaCX-6, z: pergolaCZ+3.5, r: 0.65, color: SHRUB_A });
    shrubs.push({ x: pergolaCX-6, z: pergolaCZ-3.5, r: 0.65, color: SHRUB_B });
    shrubs.push({ x: pergolaCX+4, z: pergolaCZ+3.5, r: 0.6, color: SHRUB_A });
    shrubs.push({ x: pergolaCX+4, z: pergolaCZ-3.5, r: 0.6, color: SHRUB_B });

    // Benches
    benches.push({ x: mCX+mR+2.8, z: mCZ, ry: Math.PI/2 });
    benches.push({ x: mCX-mR-2.8, z: mCZ, ry: -Math.PI/2 });
    benches.push({ x: mCX, z: mCZ+mR+2.8, ry: 0 });
    benches.push({ x: mCX, z: mCZ-mR-2.8, ry: Math.PI });
    benches.push({ x: gCX+gR+2.8, z: gCZ, ry: Math.PI/2 });
    benches.push({ x: gCX, z: gCZ+gR+2.8, ry: 0 });
    benches.push({ x: gCX, z: gCZ-gR-2.8, ry: Math.PI });
    benches.push({ x: playCX+playRadius+2.2, z: playCZ, ry: Math.PI/2 });
    benches.push({ x: gymCX+gymRadius+2.2, z: gymCZ, ry: Math.PI/2 });

    return { trees, palms, shrubs, rocks, flowers, benches };
  }, [PW, PD, mCX, mCZ, mR, gCX, gCZ, gR, wCX, wCZ, waterR, gymCX, gymCZ, gymRadius, playCX, playCZ, playRadius, pergolaCX, pergolaCZ, trackHalfW, trackHalfD]);

  const lamps = [
    { x: mCX+10, z: 2.5 }, { x: mCX+10, z: -2.5 },
    { x: (mCX+gCX)/2, z: 2.5 }, { x: (mCX+gCX)/2, z: -2.5 },
    { x: gCX-10, z: 2.5 }, { x: gCX-10, z: -2.5 },
    { x: mCX-3, z: 10 }, { x: mCX+3, z: 10 },
    { x: mCX-3, z: -10 }, { x: mCX+3, z: -10 },
    { x: gCX+5, z: 10 }, { x: gCX+5, z: -10 },
    { x: pergolaCX-10, z: 2.5 }, { x: pergolaCX+5, z: 2.5 },
    { x: playCX-6, z: playCZ }, { x: playCX+6, z: playCZ },
    { x: gymCX-6, z: gymCZ }, { x: gymCX+6, z: gymCZ },
    { x: wCX+7, z: wCZ+1.5 }, { x: 10, z: -1 }, { x: 15, z: -3 }
  ];

  return (
    <group>
      {/* ── Instanced Trees ── */}
      <Instances range={data.trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.34, 1, 7]} />
        <meshStandardMaterial color={TRUNK_C} roughness={0.92} />
        {data.trees.map((t, i) => (
          <Instance key={`t_trunk_${i}`} position={[t.x, t.h / 2, t.z]} scale={[1, t.h, 1]} />
        ))}
      </Instances>
      <Instances range={data.trees.length} castShadow receiveShadow>
        <sphereGeometry args={[1, 9, 7]} />
        <meshStandardMaterial roughness={0.88} />
        {data.trees.map((t, i) => (
          <Instance key={`t_canopy_${i}`} position={[t.x, t.h + t.cr * 0.6, t.z]} scale={[t.cr, t.cr, t.cr]} color={t.dark ? CANOPY_B : CANOPY_A} />
        ))}
      </Instances>

      {/* ── Instanced Palms ── */}
      <Instances range={data.palms.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.22, 1, 8]} />
        <meshStandardMaterial color={PALM_T} roughness={0.95} />
        {data.palms.map((p, i) => (
          <Instance key={`p_trunk_${i}`} position={[p.x, p.h / 2, p.z]} scale={[1, p.h, 1]} />
        ))}
      </Instances>
      <Instances range={data.palms.length * 7} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.04, 2.6]} />
        <meshStandardMaterial color={PALM_F} roughness={0.82} />
        {data.palms.flatMap((p, i) => {
          return Array.from({ length: 7 }, (_, j) => {
            const a = (j / 7) * Math.PI * 2;
            const px = p.x + Math.cos(a) * 0.4;
            const pz = p.z + Math.sin(a) * 0.4;
            return <Instance key={`p_leaf_${i}_${j}`} position={[px, p.h + 0.25, pz]} rotation={[Math.PI / 4, 0, a]} />;
          });
        })}
      </Instances>

      {/* ── Instanced Shrubs ── */}
      <Instances range={data.shrubs.length} castShadow receiveShadow>
        <sphereGeometry args={[1, 7, 5]} />
        <meshStandardMaterial roughness={0.9} />
        {data.shrubs.map((s, i) => (
          <Instance key={`shrub_${i}`} position={[s.x, s.r * 0.5, s.z]} scale={[s.r, s.r, s.r]} color={s.color} />
        ))}
      </Instances>

      {/* ── Instanced Flowers ── */}
      <Instances range={data.flowers.length} castShadow receiveShadow>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial roughness={0.85} />
        {data.flowers.map((f, i) => (
          <Instance key={`flower_${i}`} position={[f.x, 0.12, f.z]} scale={[f.r, f.r, f.r]} color={f.color} />
        ))}
      </Instances>

      {/* ── Instanced Rocks ── */}
      <Instances range={data.rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={ROCK_C} roughness={0.95} />
        {data.rocks.map((r, i) => (
          <Instance key={`rock_${i}`} position={[r.x, r.s * 0.28, r.z]} rotation={[0, r.ry, 0]} scale={[r.s, r.s, r.s]} />
        ))}
      </Instances>

      {/* ── Benches ── */}
      {/* Bench Planks (Wood) */}
      <Instances range={data.benches.length * 3} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={BENCH_W} roughness={0.8} />
        {data.benches.flatMap((b, i) => {
          const euler = new THREE.Euler(0, b.ry, 0);
          const p1 = new THREE.Vector3(-0.08, 0.44, 0).applyEuler(euler).add(new THREE.Vector3(b.x, 0, b.z));
          const p2 = new THREE.Vector3(0.07, 0.44, 0).applyEuler(euler).add(new THREE.Vector3(b.x, 0, b.z));
          const p3 = new THREE.Vector3(-0.28, 0.70, 0).applyEuler(euler).add(new THREE.Vector3(b.x, 0, b.z));
          const r3 = new THREE.Euler(0, b.ry, 0.15);

          return [
            <Instance key={`bw1_${i}`} position={p1} rotation={euler} scale={[0.12, 0.05, 1.2]} />,
            <Instance key={`bw2_${i}`} position={p2} rotation={euler} scale={[0.12, 0.05, 1.2]} />,
            <Instance key={`bw3_${i}`} position={p3} rotation={r3} scale={[0.08, 0.26, 1.2]} />
          ];
        })}
      </Instances>

      {/* Bench Metal Legs */}
      <Instances range={data.benches.length * 2} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.44, 0.06]} />
        <meshStandardMaterial color={BENCH_M} roughness={0.6} metalness={0.5} />
        {data.benches.flatMap((b, i) => {
          const euler = new THREE.Euler(0, b.ry, 0);
          const p1 = new THREE.Vector3(0, 0.22, -0.44).applyEuler(euler).add(new THREE.Vector3(b.x, 0, b.z));
          const p2 = new THREE.Vector3(0, 0.22, 0.44).applyEuler(euler).add(new THREE.Vector3(b.x, 0, b.z));
          return [
            <Instance key={`bm1_${i}`} position={p1} rotation={euler} />,
            <Instance key={`bm2_${i}`} position={p2} rotation={euler} />
          ];
        })}
      </Instances>

      {/* ── Lamps ── */}
      {lamps.map((l, i) => (
        <LampPost key={`lp_${i}`} x={l.x} z={l.z} />
      ))}
    </group>
  );
}
