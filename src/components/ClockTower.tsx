import { memo } from 'react';
import * as THREE from 'three';

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: '#e5e3db',
  roughness: 0.7,
  metalness: 0.1,
});

const clockFaceMaterial = new THREE.MeshStandardMaterial({
  color: '#2a2a2a',
  roughness: 0.5,
  metalness: 0.3,
});

const clockHandMaterial = new THREE.MeshStandardMaterial({
  color: '#d4af37',
  roughness: 0.3,
  metalness: 0.8,
});

function ClockTower() {
  return (
    <group position={[0, 0, 0]} scale={[2.4, 1.6, 2.4]} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
      {/* Base Pedestal (Tier 1) */}
      <mesh position={[0, 0.4, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[2.5, 0.8, 2.5]} />
      </mesh>
      
      {/* Base Pedestal (Tier 2) */}
      <mesh position={[0, 1.0, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[2.0, 0.4, 2.0]} />
      </mesh>

      {/* Main Shaft */}
      <mesh position={[0, 6.2, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[1.4, 10.0, 1.4]} />
      </mesh>

      {/* Sub-cap (below clocks) */}
      <mesh position={[0, 11.4, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
      </mesh>

      {/* Clock Section */}
      <mesh position={[0, 12.6, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[1.5, 2.0, 1.5]} />
      </mesh>

      {/* Clock Faces (4 sides) */}
      {[
        { pos: [0, 12.6, 0.76], rot: [Math.PI / 2, 0, 0] },
        { pos: [0, 12.6, -0.76], rot: [-Math.PI / 2, 0, 0] },
        { pos: [0.76, 12.6, 0], rot: [0, 0, -Math.PI / 2] },
        { pos: [-0.76, 12.6, 0], rot: [0, 0, Math.PI / 2] },
      ].map((face, index) => (
        <group key={index} position={new THREE.Vector3(...face.pos)} rotation={new THREE.Euler(...face.rot)} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
          {/* Dial */}
          <mesh material={clockFaceMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
            <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
          </mesh>
          {/* Minute Hand */}
          <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI / 4]} material={clockHandMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
            <boxGeometry args={[0.04, 0.02, 0.45]} />
          </mesh>
          {/* Hour Hand */}
          <mesh position={[0, 0.03, 0]} rotation={[0, 0, -Math.PI / 6]} material={clockHandMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
            <boxGeometry args={[0.06, 0.02, 0.3]} />
          </mesh>
        </group>
      ))}

      {/* Top Cap */}
      <mesh position={[0, 13.7, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <boxGeometry args={[1.6, 0.2, 1.6]} />
      </mesh>

      {/* Crown Pyramid */}
      <mesh position={[0, 14.8, 0]} material={stoneMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <cylinderGeometry args={[0, 1.1, 2.0, 4]} />
      </mesh>
      
      {/* Finial/Spire */}
      <mesh position={[0, 16.2, 0]} material={clockHandMaterial} matrixAutoUpdate={false} onUpdate={c => c.updateMatrix()}>
        <cylinderGeometry args={[0.02, 0.05, 0.8, 8]} />
      </mesh>
    </group>
  );
}

export default memo(ClockTower);
