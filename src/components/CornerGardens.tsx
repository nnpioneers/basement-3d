import { useMemo } from 'react';
import * as THREE from 'three';

const extrudeSettings = {
  steps: 1,
  depth: 0.15, // slightly above the base road, but below plots
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelSegments: 2,
};

function createGardenShape(x: number, y: number, w: number, h: number, chamferCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', radius: number = 6.0) {
  const shape = new THREE.Shape();
  if (chamferCorner === 'bottom-right') {
    shape.moveTo(x, y + h);
    shape.lineTo(x + w, y + h);
    shape.lineTo(x + w, y + radius);
    shape.quadraticCurveTo(x + w, y, x + w - radius, y);
    shape.lineTo(x, y);
    shape.lineTo(x, y + h);
  } else if (chamferCorner === 'bottom-left') {
    shape.moveTo(x + w, y + h);
    shape.lineTo(x + w, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);
    shape.lineTo(x, y + h);
    shape.lineTo(x + w, y + h);
  } else if (chamferCorner === 'top-right') {
    shape.moveTo(x, y);
    shape.lineTo(x + w, y);
    shape.lineTo(x + w, y + h - radius);
    shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    shape.lineTo(x, y + h);
    shape.lineTo(x, y);
  } else if (chamferCorner === 'top-left') {
    shape.moveTo(x + w, y);
    shape.lineTo(x, y);
    shape.lineTo(x, y + h - radius);
    shape.quadraticCurveTo(x, y + h, x + radius, y + h);
    shape.lineTo(x + w, y + h);
    shape.lineTo(x + w, y);
  }
  return shape;
}

function Shrub({ position }: { position: [number, number, number] }) {
  // Use a deterministic pseudo-random scale/color based on position to avoid hydration mismatches
  const seed = Math.abs(position[0] * position[1]);
  const scale = 0.5 + (seed % 0.4);
  const isDark = (seed % 2) > 1;

  return (
    <group position={position}>
      <mesh receiveShadow castShadow position={[0, 0, scale]}>
        <sphereGeometry args={[scale, 16, 16]} />
        <meshStandardMaterial color={isDark ? "#2d4a22" : "#3d5e2e"} roughness={0.9} metalness={0.0} />
      </mesh>
    </group>
  );
}

export default function CornerGardens() {
  const gardens = useMemo(() => {
    return [
      { shape: createGardenShape(-22.5, 27.65, 16.5, 9.0, 'bottom-right') }, // Top-Left
      { shape: createGardenShape(6.0, 27.65, 16.5, 9.0, 'bottom-left') },    // Top-Right
      { shape: createGardenShape(-22.5, 5.95, 16.5, 9.7, 'top-right') },     // Bottom-Left
      { shape: createGardenShape(6.0, 5.95, 16.5, 9.7, 'top-left') },        // Bottom-Right
    ].map(({ shape }) => new THREE.ExtrudeGeometry(shape, extrudeSettings));
  }, []);

  const shrubPositions: [number, number, number][] = [
    // Top-Left Garden
    [-18, 30, 0.15], [-11, 34, 0.15], [-16, 34, 0.15], [-20, 33, 0.15],
    // Top-Right Garden
    [18, 30, 0.15], [11, 34, 0.15], [16, 34, 0.15], [20, 33, 0.15],
    // Bottom-Left Garden
    [-18, 12, 0.15], [-11, 8, 0.15], [-16, 8, 0.15], [-20, 9, 0.15],
    // Bottom-Right Garden
    [18, 12, 0.15], [11, 8, 0.15], [16, 8, 0.15], [20, 9, 0.15],
  ];

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
      {gardens.map((geom, index) => (
        <group key={index}>
          <mesh geometry={geom} receiveShadow castShadow>
            <meshStandardMaterial color="#4a7337" roughness={0.9} metalness={0.0} />
          </mesh>
        </group>
      ))}
      
      {shrubPositions.map((pos, index) => (
        <Shrub key={index} position={pos} />
      ))}
    </group>
  );
}
