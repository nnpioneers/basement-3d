import { useMemo } from 'react';
import * as THREE from 'three';
import { parkConfig as C } from '../config';

const WATER   = '#1a5a8a';
const SAND    = '#c8b898';
const ROCK    = '#8a7f70';
const LILY    = '#c8e060';

function useEllipse(rx: number, rz: number) {
  return useMemo(() => {
    const k = 0.5523;
    const s = new THREE.Shape();
    s.moveTo(0, -rz);
    s.bezierCurveTo(rx*k,-rz, rx,-rz*k, rx, 0);
    s.bezierCurveTo(rx,rz*k, rx*k,rz, 0, rz);
    s.bezierCurveTo(-rx*k,rz, -rx,rz*k, -rx, 0);
    s.bezierCurveTo(-rx,-rz*k, -rx*k,-rz, 0, -rz);
    return new THREE.ShapeGeometry(s, 40);
  }, [rx, rz]);
}

export default function WaterBody() {
  const { waterCX: cx, waterCZ: cz, waterR: r } = C;

  // Slightly organic — not a perfect circle
  const sandGeom   = useEllipse(r + 1.4, r + 1.0);
  const waterGeom  = useEllipse(r, r * 0.88);

  // Seeded rocks
  const rocks = useMemo(() => {
    let s = 99;
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: 16 }, (_, i) => {
      const t  = (i / 16) * Math.PI * 2 + rand() * 0.25;
      const jr = 0.88 + rand() * 0.24;
      return { x: Math.cos(t)*r*jr, z: Math.sin(t)*r*0.88*jr, sz: 0.28+rand()*0.4, ry: rand()*Math.PI*2 };
    });
  }, [r]);

  // Lily pads (small flat discs on water)
  const lilies = useMemo(() => {
    let s = 55;
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: 7 }, (_, _i) => ({
      x: (rand()-0.5)*r*1.2, z: (rand()-0.5)*r*0.8, rs: 0.25+rand()*0.35
    }));
  }, [r]);

  return (
    <group position={[cx, 0, cz]}>
      {/* Sandy/graveled surround */}
      <mesh geometry={sandGeom} rotation={[-Math.PI/2,0,0]} position={[0,-0.04,0]} receiveShadow>
        <meshStandardMaterial color={SAND} roughness={0.95} />
      </mesh>

      {/* Water surface */}
      <mesh geometry={waterGeom} rotation={[-Math.PI/2,0,0]} position={[0,-0.14,0]} receiveShadow>
        <meshStandardMaterial color={WATER} roughness={0.05} metalness={0.35} transparent opacity={0.9} />
      </mesh>

      {/* Rocks on edge */}
      {rocks.map((rk,i) => (
        <mesh key={i} position={[rk.x,-0.04,rk.z]} rotation={[0,rk.ry,0]} castShadow>
          <dodecahedronGeometry args={[rk.sz, 0]} />
          <meshStandardMaterial color={ROCK} roughness={0.95} />
        </mesh>
      ))}

      {/* Lily pads */}
      {lilies.map((l,i) => (
        <mesh key={`lily${i}`} rotation={[-Math.PI/2,0,0]} position={[l.x,-0.12,l.z]}>
          <circleGeometry args={[l.rs, 8]} />
          <meshStandardMaterial color={LILY} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
