import { parkConfig as C } from './config';
import { Column } from './Geometry';

const STONE     = '#c8b89a';
const TILE_DARK = '#7a4f30';
const BEAM      = '#b8a880';

export default function Gazebo() {
  const {
    gazeboCX: cx, gazeboCZ: cz,
    gazeboColumns: nCols, gazeboRadius: colR,
    gazeboRoofH: roofH, gazeboPlatformH: platH,
  } = C;
  const colH = roofH * 0.72;

  return (
    <group position={[cx, 0, cz]}>
      {/* Step ring 1 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, platH/3, 0]} receiveShadow>
        <ringGeometry args={[colR+0.5, colR+1.5, nCols]} />
        <meshStandardMaterial color="#d8c8a0" roughness={0.85} />
      </mesh>
      {/* Step ring 2 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, platH*0.65, 0]} receiveShadow>
        <ringGeometry args={[colR-0.2, colR+0.5, nCols]} />
        <meshStandardMaterial color="#d0c098" roughness={0.85} />
      </mesh>
      {/* Base platform */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, platH, 0]} receiveShadow castShadow>
        <circleGeometry args={[colR+0.2, nCols]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      {/* Floor disc inside columns */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, platH+0.01, 0]}>
        <circleGeometry args={[colR-0.5, 32]} />
        <meshStandardMaterial color="#e0d0b0" roughness={0.88} />
      </mesh>

      {/* Columns */}
      {Array.from({length: nCols}, (_,i) => {
        const a = (i / nCols) * Math.PI * 2;
        return <Column key={i} x={Math.cos(a)*colR} y={platH} z={Math.sin(a)*colR}
          r={0.3} h={colH} color={STONE} />;
      })}

      {/* Ring beam at top of columns */}
      <mesh position={[0, platH+colH, 0]} castShadow>
        <torusGeometry args={[colR, 0.24, 7, nCols]} />
        <meshStandardMaterial color={BEAM} roughness={0.75} />
      </mesh>

      {/* OCTAGONAL ROOF — two-tier */}
      <mesh position={[0, platH+colH, 0]} castShadow>
        <coneGeometry args={[colR+1.0, roofH*0.28, nCols]} />
        <meshStandardMaterial color={TILE_DARK} roughness={0.82} metalness={0.06} />
      </mesh>
      <mesh position={[0, platH+colH+roofH*0.22, 0]} castShadow>
        <coneGeometry args={[colR-0.8, roofH*0.18, nCols]} />
        <meshStandardMaterial color={'#6a3f28'} roughness={0.78} metalness={0.06} />
      </mesh>

      {/* Finial */}
      <mesh position={[0, platH+colH+roofH*0.42, 0]} castShadow>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshStandardMaterial color="#d4a030" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}
