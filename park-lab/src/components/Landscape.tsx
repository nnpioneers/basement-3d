import React from 'react';
import { parkConfig as C } from '../config';

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

// ── Primitives ───────────────────────────────────────────────

function Tree({ x, z, h = 4.5, cr = 2.2, dark = false }:
  { x:number; z:number; h?:number; cr?:number; dark?:boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0,h/2,0]} castShadow>
        <cylinderGeometry args={[0.22,0.34,h,7]} />
        <meshStandardMaterial color={TRUNK_C} roughness={0.92} />
      </mesh>
      <mesh position={[0,h+cr*0.6,0]} castShadow receiveShadow>
        <sphereGeometry args={[cr,9,7]} />
        <meshStandardMaterial color={dark?CANOPY_B:CANOPY_A} roughness={0.88} />
      </mesh>
    </group>
  );
}

function Palm({ x, z, h = 6 }: { x:number; z:number; h?:number }) {
  return (
    <group position={[x,0,z]}>
      <mesh position={[0,h/2,0]} castShadow>
        <cylinderGeometry args={[0.13,0.22,h,8]} />
        <meshStandardMaterial color={PALM_T} roughness={0.95} />
      </mesh>
      {Array.from({length:7},(_,i)=>{
        const a=(i/7)*Math.PI*2;
        return (
          <mesh key={i} position={[Math.cos(a)*0.4,h+0.25,Math.sin(a)*0.4]}
            rotation={[Math.PI/4,0,a]} castShadow>
            <boxGeometry args={[0.1,0.04,2.6]}/>
            <meshStandardMaterial color={PALM_F} roughness={0.82}/>
          </mesh>
        );
      })}
    </group>
  );
}

function Shrub({ x, z, r=0.55, color=SHRUB_A }:
  { x:number; z:number; r?:number; color?:string }) {
  return (
    <mesh position={[x,r*0.5,z]} castShadow receiveShadow>
      <sphereGeometry args={[r,7,5]}/>
      <meshStandardMaterial color={color} roughness={0.9}/>
    </mesh>
  );
}

function Flower({ x, z, color=FLOWER_R, r=0.4 }:
  { x:number; z:number; color?:string; r?:number }) {
  return (
    <mesh position={[x,0.12,z]} castShadow>
      <sphereGeometry args={[r,6,4]}/>
      <meshStandardMaterial color={color} roughness={0.85}/>
    </mesh>
  );
}

function Rock({ x, z, s=0.45, ry=0 }:
  { x:number; z:number; s?:number; ry?:number }) {
  return (
    <mesh position={[x,s*0.28,z]} rotation={[0,ry,0]} castShadow>
      <dodecahedronGeometry args={[s,0]}/>
      <meshStandardMaterial color={ROCK_C} roughness={0.95}/>
    </mesh>
  );
}

function Bench({ x, z, ry=0 }: { x:number; z:number; ry?:number }) {
  return (
    <group position={[x,0,z]} rotation={[0,ry,0]}>
      {[-0.08,0.07].map((ox,i)=>(
        <mesh key={i} position={[ox,0.44,0]} castShadow>
          <boxGeometry args={[0.12,0.05,1.2]}/>
          <meshStandardMaterial color={BENCH_W} roughness={0.8}/>
        </mesh>
      ))}
      <mesh position={[-0.28,0.70,0]} rotation={[0,0,0.15]} castShadow>
        <boxGeometry args={[0.08,0.26,1.2]}/>
        <meshStandardMaterial color={BENCH_W} roughness={0.8}/>
      </mesh>
      {[-0.44,0.44].map((oz,i)=>(
        <mesh key={i} position={[0,0.22,oz]} castShadow>
          <boxGeometry args={[0.06,0.44,0.06]}/>
          <meshStandardMaterial color={BENCH_M} roughness={0.6} metalness={0.5}/>
        </mesh>
      ))}
    </group>
  );
}

function LampPost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.5, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Lamp Head Base */}
      <mesh position={[0, 2.55, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Light Bulb / Glass */}
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.2, 8]} />
        <meshStandardMaterial color="#fff0d0" emissive="#ffc060" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      {/* Lamp Cap */}
      <mesh position={[0, 2.82, 0]} castShadow>
        <coneGeometry args={[0.18, 0.15, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Actual Light Source */}
      <pointLight position={[0, 2.7, 0]} color="#ffb050" intensity={0.6} distance={15} decay={2} />
    </group>
  );
}

// ── seeded PRNG ──────────────────────────────────────────────
function mkRand(seed: number) {
  let s = seed;
  return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; };
}

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

  // ── OUTER TREE BAND ─────────────────────────────────────────
  // Trees are placed OUTSIDE the outer track edge.
  // Track outer edge: |x| ≤ PW/2, |z| ≤ PD/2
  // Trees go from PD/2+1 to PD/2+5 (north/south bands)
  // and PW/2+1 to PW/2+5 (east/west ends)

  const trackHalfW = PW / 2;   // ±68
  const trackHalfD = PD / 2;   // ±17

  // NORTH outer tree row  (z = -trackHalfD - 1.5 to -trackHalfD - 5)
  const northTrees: React.ReactElement[] = [];
  const rand1 = mkRand(101);
  for (let x = -trackHalfW + 2; x <= trackHalfW - 2; x += 5.5 + rand1()*2) {
    const z = -(trackHalfD + 1.8 + rand1()*3);
    const isPalm = rand1() < 0.28;
    northTrees.push(isPalm
      ? <Palm key={`n${x}`} x={x} z={z} h={5+rand1()*2} />
      : <Tree key={`n${x}`} x={x} z={z} h={4+rand1()*2} cr={1.8+rand1()*0.8} dark={rand1()<0.3} />
    );
    // Double row
    const z2 = -(trackHalfD + 4.5 + rand1()*2.5);
    northTrees.push(
      <Tree key={`n2-${x}`} x={x+2.5+rand1()*1.5} z={z2}
        h={4.5+rand1()*2} cr={2.0+rand1()*0.7} dark={rand1()<0.4} />
    );
  }

  // SOUTH outer tree row
  const southTrees: React.ReactElement[] = [];
  const rand2 = mkRand(202);
  for (let x = -trackHalfW + 2; x <= trackHalfW - 2; x += 5.5 + rand2()*2) {
    const z = trackHalfD + 1.8 + rand2()*3;
    const isPalm = rand2() < 0.28;
    southTrees.push(isPalm
      ? <Palm key={`s${x}`} x={x} z={z} h={5+rand2()*2} />
      : <Tree key={`s${x}`} x={x} z={z} h={4+rand2()*2} cr={1.8+rand2()*0.8} dark={rand2()<0.3} />
    );
    const z2 = trackHalfD + 4.5 + rand2()*2.5;
    southTrees.push(
      <Tree key={`s2-${x}`} x={x+2.5+rand2()*1.5} z={z2}
        h={4.5+rand2()*2} cr={2.0+rand2()*0.7} dark={rand2()<0.4} />
    );
  }

  // WEST corner trees
  const westTrees: React.ReactElement[] = [];
  const rand3 = mkRand(303);
  for (let z = -trackHalfD + 1; z <= trackHalfD - 1; z += 5 + rand3()*2) {
    westTrees.push(
      <Tree key={`w${z}`} x={-(trackHalfW + 2.5 + rand3()*2.5)} z={z}
        h={4.5+rand3()*2} cr={2.0+rand3()*0.7} />
    );
  }

  // EAST corner trees (stop before pergola overflow)
  const eastTrees: React.ReactElement[] = [];
  const rand4 = mkRand(404);
  for (let z = -trackHalfD + 1; z <= trackHalfD - 1; z += 5 + rand4()*2) {
    eastTrees.push(
      <Tree key={`e${z}`} x={trackHalfW + 2.5 + rand4()*2} z={z}
        h={4.5+rand4()*2} cr={2.0+rand4()*0.7} />
    );
  }

  // ── INNER SHRUBS & FLOWERS (controlled zones) ─────────────
  // Around monument outer ring
  const monumentDecor: React.ReactElement[] = [];
  [0,1,2,3,4,5,6,7].forEach(i => {
    const a = (i/8)*Math.PI*2 + 0.2;
    const rd = mR + 2.8;
    monumentDecor.push(
      <Shrub key={`msh${i}`} x={mCX+Math.cos(a)*rd} z={mCZ+Math.sin(a)*rd}
        r={0.55} color={i%2===0?SHRUB_A:SHRUB_B} />,
      <Flower key={`mfl${i}`} x={mCX+Math.cos(a+0.4)*(rd+1.5)} z={mCZ+Math.sin(a+0.4)*(rd+1.5)}
        color={[FLOWER_R,FLOWER_Y,FLOWER_P,FLOWER_W][i%4]} r={0.38} />
    );
  });

  // Around water body
  const waterDecor: React.ReactElement[] = [];
  [0,60,120,180,240,300].forEach((deg,i) => {
    const a = (deg*Math.PI)/180;
    waterDecor.push(
      <Shrub key={`wsh${i}`} x={wCX+Math.cos(a)*(waterR+2)} z={wCZ+Math.sin(a)*(waterR+2)}
        r={0.5+i%3*0.15} color={i%2===0?SHRUB_A:SHRUB_B} />,
      <Rock key={`wrk${i}`} x={wCX+Math.cos(a+0.5)*(waterR+1.2)} z={wCZ+Math.sin(a+0.5)*(waterR+1.2)}
        s={0.32+i%3*0.14} ry={deg*0.4} />
    );
  });

  // Flower beds along paths near center
  const pathFlowers: React.ReactElement[] = [
    <Flower key="pf1" x={mCX+5} z={mCZ+4}   color={FLOWER_R} r={0.4} />,
    <Flower key="pf2" x={mCX+5} z={mCZ-4}   color={FLOWER_Y} r={0.4} />,
    <Flower key="pf3" x={wCX-3} z={wCZ+3}   color={FLOWER_P} r={0.38} />,
    <Flower key="pf4" x={wCX+3} z={wCZ-3}   color={FLOWER_W} r={0.38} />,
    <Flower key="pf5" x={gCX-5} z={gCZ+4}   color={FLOWER_R} r={0.4} />,
    <Flower key="pf6" x={gCX-5} z={gCZ-4}   color={FLOWER_Y} r={0.4} />,
    // Pergola flanks
    <Shrub key="pgs1" x={pergolaCX-6} z={pergolaCZ+3.5} r={0.65} color={SHRUB_A} />,
    <Shrub key="pgs2" x={pergolaCX-6} z={pergolaCZ-3.5} r={0.65} color={SHRUB_B} />,
    <Shrub key="pgs3" x={pergolaCX+4} z={pergolaCZ+3.5} r={0.6}  color={SHRUB_A} />,
    <Shrub key="pgs4" x={pergolaCX+4} z={pergolaCZ-3.5} r={0.6}  color={SHRUB_B} />,
  ];

  // ── BENCHES ──────────────────────────────────────────────────
  const benches: React.ReactElement[] = [
    <Bench key="b1" x={mCX+mR+2.8} z={mCZ}      ry={Math.PI/2} />,
    <Bench key="b2" x={mCX-mR-2.8} z={mCZ}      ry={-Math.PI/2} />,
    <Bench key="b3" x={mCX}        z={mCZ+mR+2.8} ry={0} />,
    <Bench key="b4" x={mCX}        z={mCZ-mR-2.8} ry={Math.PI} />,
    <Bench key="b5" x={gCX+gR+2.8} z={gCZ}      ry={Math.PI/2} />,
    <Bench key="b6" x={gCX}        z={gCZ+gR+2.8} ry={0} />,
    <Bench key="b7" x={gCX}        z={gCZ-gR-2.8} ry={Math.PI} />,
    <Bench key="b8" x={playCX+playRadius+2.2} z={playCZ} ry={Math.PI/2} />,
    <Bench key="b9" x={gymCX+gymRadius+2.2}  z={gymCZ}  ry={Math.PI/2} />,
  ];

  // ── LAMPS ──────────────────────────────────────────────────
  const lamps: React.ReactElement[] = [
    // Main horizontal path
    <LampPost key="lp1" x={mCX+10} z={2.5} />,
    <LampPost key="lp2" x={mCX+10} z={-2.5} />,
    <LampPost key="lp3" x={(mCX+gCX)/2} z={2.5} />,
    <LampPost key="lp4" x={(mCX+gCX)/2} z={-2.5} />,
    <LampPost key="lp5" x={gCX-10} z={2.5} />,
    <LampPost key="lp6" x={gCX-10} z={-2.5} />,
    
    // Monument approach
    <LampPost key="lp7" x={mCX-3} z={10} />,
    <LampPost key="lp8" x={mCX+3} z={10} />,
    <LampPost key="lp9" x={mCX-3} z={-10} />,
    <LampPost key="lp10" x={mCX+3} z={-10} />,

    // Gazebo approach
    <LampPost key="lp11" x={gCX+5} z={10} />,
    <LampPost key="lp12" x={gCX+5} z={-10} />,

    // Pergola
    <LampPost key="lp13" x={pergolaCX-10} z={2.5} />,
    <LampPost key="lp14" x={pergolaCX+5} z={2.5} />,

    // Play & Gym
    <LampPost key="lp15" x={playCX-6} z={playCZ} />,
    <LampPost key="lp16" x={playCX+6} z={playCZ} />,
    <LampPost key="lp17" x={gymCX-6} z={gymCZ} />,
    <LampPost key="lp18" x={gymCX+6} z={gymCZ} />,

    // Water Body / Campfire area path
    <LampPost key="lp19" x={wCX+7} z={wCZ+1.5} />,
    <LampPost key="lp20" x={10} z={-1} />,
    <LampPost key="lp21" x={15} z={-3} />,
  ];

  return (
    <group>
      {monumentDecor}
      {waterDecor}
      {pathFlowers}
      {benches}
      {lamps}
    </group>
  );
}
