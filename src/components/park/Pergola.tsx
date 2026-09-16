import { parkConfig as C } from './config';
import { Column } from './Geometry';

const STONE = '#c8b89a';
const BEAM  = '#b8a880';
const VINE  = '#3a8a3a';

export default function Pergola() {
  const { pergolaCX: cx, pergolaCZ: cz, pergolaLength: len,
    pergolaWidth: w, pergolaColumns: nCols, pergolaH: h } = C;

  const spacing = len / (nCols - 1);

  return (
    <group position={[cx - len/2, 0, cz]}>
      {/* Ground paving */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[len/2, 0.05, 0]} receiveShadow>
        <planeGeometry args={[len+1.5, w+1]} />
        <meshStandardMaterial color="#d0c0a0" roughness={0.92} />
      </mesh>

      {/* Columns — two rows */}
      {Array.from({length: nCols}, (_,i) => (
        <group key={i}>
          <Column x={i*spacing} y={0} z={-w/2} r={0.26} h={h} color={STONE} />
          <Column x={i*spacing} y={0} z={ w/2} r={0.26} h={h} color={STONE} />
        </group>
      ))}

      {/* Longitudinal beams */}
      {[-w/2, w/2].map((oz,i) => (
        <mesh key={i} position={[len/2, h, oz]} castShadow>
          <boxGeometry args={[len+0.6, 0.20, 0.20]} />
          <meshStandardMaterial color={BEAM} roughness={0.75} />
        </mesh>
      ))}

      {/* Cross beams */}
      {Array.from({length: nCols}, (_,i) => (
        <mesh key={i} position={[i*spacing, h+0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, w+1.4]} />
          <meshStandardMaterial color={BEAM} roughness={0.75} />
        </mesh>
      ))}

      {/* Climbing vine patches on beams */}
      {Array.from({length: nCols-1}, (_,i) => (
        <mesh key={`v${i}`} position={[i*spacing + spacing/2, h+0.12, 0]} castShadow>
          <boxGeometry args={[spacing*0.7, 0.18, w*0.6]} />
          <meshStandardMaterial color={VINE} roughness={0.9} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}
