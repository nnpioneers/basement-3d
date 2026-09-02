import { parkConfig as C } from '../config';
import { Column } from './Geometry';

const STONE      = '#c8b89a';
const STONE_DARK = '#a09070';

function Obelisk() {
  const { monumentPlatformH: pH } = C;
  return (
    <group>
      {/* Square base */}
      <mesh position={[0, pH + 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.2, 1.8]} />
        <meshStandardMaterial color={STONE} roughness={0.7} />
      </mesh>
      {/* Tapered shaft */}
      <mesh position={[0, pH + 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.55, 7, 4]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Pyramid cap */}
      <mesh position={[0, pH + 8.3, 0]} castShadow>
        <coneGeometry args={[0.35, 1.0, 4]} />
        <meshStandardMaterial color="#e8d490" roughness={0.45} metalness={0.25} />
      </mesh>
    </group>
  );
}

export default function MonumentArea() {
  const {
    monumentCX: cx, monumentCZ: cz,
    monumentPlazaR: pR, monumentRingR: rR,
    monumentPlatformH: pH, monumentSteps: steps,
  } = C;

  return (
    <group position={[cx, 0, cz]}>
      {/* Steps approaching the plaza */}
      {Array.from({ length: steps }, (_, i) => {
        const rStep = pR + (steps - i) * 0.7 + 0.5;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}
            position={[0, (i * pH) / steps, 0]} receiveShadow>
            <ringGeometry args={[rStep - 0.6, rStep, 48]} />
            <meshStandardMaterial color="#d4c49c" roughness={0.85} />
          </mesh>
        );
      })}

      {/* Raised platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, pH, 0]} receiveShadow castShadow>
        <circleGeometry args={[pR, 48]} />
        <meshStandardMaterial color={STONE} roughness={0.82} />
      </mesh>

      {/* Low decorative border ring */}
      <mesh position={[0, pH + 0.15, 0]} castShadow>
        <torusGeometry args={[pR, 0.2, 8, 48]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.8} />
      </mesh>

      {/* Obelisk */}
      <Obelisk />

      {/* 4 corner bollards */}
      {[0,1,2,3].map(i => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return <Column key={i} x={Math.cos(a)*2.8} y={pH} z={Math.sin(a)*2.8}
          r={0.18} h={0.9} color={STONE_DARK} />;
      })}

      {/* Flower beds between plaza and circulation ring */}
      {[0,1,2,3,4,5,6,7].map(i => {
        const a = (i / 8) * Math.PI * 2;
        const rMid = (pR + rR - 2.5) * 0.5 + pR;
        return (
          <mesh key={`fb${i}`} position={[Math.cos(a)*rMid, 0.1, Math.sin(a)*rMid]}
            castShadow receiveShadow>
            <sphereGeometry args={[0.7, 7, 5]} />
            <meshStandardMaterial color={i%2===0 ? '#e06060' : '#e0c040'} roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}
