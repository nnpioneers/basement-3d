import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import MainPark from './park/MainPark';

export default function ParksAndCASite() {
  const { parkGeom, caGeom } = useMemo(() => {
    // 1. Far-Left Bottom Park
    const parkShape = new THREE.Shape();
    parkShape.moveTo(-220.5, -51.26);
    parkShape.lineTo(-193.5, -51.26);
    parkShape.lineTo(-193.5, -13.61);
    parkShape.lineTo(-220.5, -13.61);
    parkShape.lineTo(-220.5, -51.26);

    // 2. Top-Left CA Site
    const caShape = new THREE.Shape();
    caShape.moveTo(-106.5, 63.80);
    caShape.lineTo(-6.0, 63.80);
    caShape.lineTo(-6.0, 89.48); 
    caShape.lineTo(-61.0, 87.28); 
    caShape.lineTo(-61.0, 88.78); 
    caShape.lineTo(-106.5, 87.15); 
    caShape.lineTo(-106.5, 63.80);

    // 3. Top-Right Park (Slopes down from 94.64 on right to 89.86 on left)
    const topParkShape = new THREE.Shape();
    topParkShape.moveTo(3.0, 66.80);
    topParkShape.lineTo(136.5, 66.80);
    topParkShape.lineTo(136.5, 94.64); 
    topParkShape.lineTo(3.0, 89.86);  
    topParkShape.lineTo(3.0, 66.80);

    const extrudeSettings = {
      steps: 1,
      depth: 0.1, // Slight extrusion above ground
      bevelEnabled: true,
      bevelThickness: 0.2, // Bevel thickness 0.2m
      bevelSize: 0.2,
      bevelSegments: 2,
    };

    return {
      parkGeom: new THREE.ExtrudeGeometry(parkShape, extrudeSettings),
      caGeom: new THREE.ExtrudeGeometry(caShape, extrudeSettings),
      topParkGeom: new THREE.ExtrudeGeometry(topParkShape, extrudeSettings),
    };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      
      {/* =========================================================
          1. FAR-LEFT BOTTOM PARK
          ========================================================= */}
      <mesh geometry={parkGeom} receiveShadow castShadow>
        <meshStandardMaterial attach="material-0" color="#2e7d32" roughness={0.85} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#1b5e20" roughness={0.9} />
      </mesh>
      <Text
        position={[-207.0, -32.435, 0.35]}
        rotation={[0, 0, 0]}
        fontSize={6.0}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Park
      </Text>

      {/* =========================================================
          2. TOP-LEFT CA SITE
          ========================================================= */}
      <mesh geometry={caGeom} receiveShadow castShadow>
        <meshStandardMaterial attach="material-0" color="#d2b48c" roughness={0.8} />
        <meshStandardMaterial attach="material-1" color="#8b9dc3" roughness={0.9} />
      </mesh>
      <Text
        position={[-56.25, 75.0, 0.35]}
        rotation={[0, 0, 0]}
        fontSize={7.0}
        color="#111111"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        CA Site
      </Text>

      {/* =========================================================
          3. TOP-RIGHT PARK (NOW DETAILED DESIGN)
          ========================================================= */}
      <group position={[69.75, 80.72, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <MainPark />
      </group>
    </group>
  );
}

