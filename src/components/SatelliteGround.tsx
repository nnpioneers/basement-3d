import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface SatelliteGroundProps {
  mapType?: 'satellite' | 'dark';
  rotationOffset?: number;
  scaleX?: number;
  scaleY?: number;
  positionOffset?: [number, number, number];
}

export default function SatelliteGround({
  mapType = 'satellite',
  rotationOffset = 0.06150,
  scaleX = 1.040,
  scaleY = 1.040,
  positionOffset = [-115.5, 0, 28.0],
}: SatelliteGroundProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (mapType === 'dark') {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load('/satellite_map.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      setTexture(tex);
    });
  }, [mapType]);

  // Real world ground dimensions calibrated to match site boundaries:
  const groundWidth = 1254.2 * scaleX;
  const groundHeight = 1254.2 * scaleY;

  return (
    <group position={[positionOffset[0], -0.65 + positionOffset[1], positionOffset[2]]} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
      {/* Real Ultra-High-Resolution Google Satellite Aerial Terrain */}
      {mapType !== 'dark' && texture ? (
        <mesh
          rotation={[-Math.PI / 2, 0, rotationOffset]}
          receiveShadow
          raycast={() => null}
          matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}
        >
          <planeGeometry args={[groundWidth, groundHeight]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            depthWrite={true}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
      ) : (
        /* Dark Blueprint Ground */
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={() => null} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
          <planeGeometry args={[4000, 4000]} />
          <meshStandardMaterial color="#1a1c1e" roughness={1.0} metalness={0.0} />
        </mesh>
      )}

      {/* Infinite ambient background ground with clear vertical separation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.0, 0]} raycast={() => null} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
        <planeGeometry args={[8000, 8000]} />
        <meshBasicMaterial color="#14181b" depthWrite={false} />
      </mesh>
    </group>
  );
}

