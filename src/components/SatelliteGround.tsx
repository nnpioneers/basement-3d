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
  const [extendedTexture, setExtendedTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (mapType === 'dark') {
      setTexture(null);
      setExtendedTexture(null);
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

    loader.load('/extended_satellite_map.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      setExtendedTexture(tex);
    });
  }, [mapType]);

  // Inner site ground dimensions calibrated to match site boundaries (100% exact 1-to-1 scale):
  const groundWidth = 1254.2 * scaleX;
  const groundHeight = 1254.2 * scaleY;

  // Extended ~6 km radius satellite map dimensions (153/17 ratio = ~11,287.8 meters coverage):
  const extendedGroundWidth = (153 / 17) * 1254.2 * scaleX;
  const extendedGroundHeight = (153 / 17) * 1254.2 * scaleY;

  return (
    <group position={[positionOffset[0], -0.65 + positionOffset[1], positionOffset[2]]} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
      {/* 1. Surrounding ~6km Radius Satellite Map Coverage */}
      {mapType !== 'dark' && extendedTexture && (
        <mesh
          rotation={[-Math.PI / 2, 0, rotationOffset]}
          receiveShadow
          raycast={() => null}
          position={[0, -0.05, 0]}
          matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}
        >
          <planeGeometry args={[extendedGroundWidth, extendedGroundHeight]} />
          <meshBasicMaterial
            map={extendedTexture}
            toneMapped={false}
            depthWrite={true}
          />
        </mesh>
      )}

      {/* 2. Inner Ultra-High-Resolution Google Satellite Aerial Terrain (Un-stretched 1-to-1 site scale) */}
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
          <planeGeometry args={[40000, 40000]} />
          <meshStandardMaterial color="#1a1c1e" roughness={1.0} metalness={0.0} />
        </mesh>
      )}

      {/* Extended surrounding ground plane matching real satellite terrain tone */}
      {mapType !== 'dark' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} raycast={() => null} matrixAutoUpdate={false} onUpdate={(c) => c.updateMatrix()}>
          <planeGeometry args={[30000, 30000]} />
          <meshBasicMaterial color="#544c3c" depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

