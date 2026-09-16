import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useMemo, useRef } from 'react';

export default function EntranceGate() {
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);

  // Memoized materials — created once, never recreated on re-renders
  const { pillarMaterial, archMaterial, blackTextMaterial, ledLightMaterial, projectorMaterial } = useMemo(() => ({
    pillarMaterial: new THREE.MeshStandardMaterial({
      color: '#1a1b1f',
      roughness: 0.8,
      metalness: 0.2,
    }),
    archMaterial: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.4,
      metalness: 0.1,
    }),
    blackTextMaterial: new THREE.MeshStandardMaterial({
      color: '#111111',
      roughness: 0.5,
      metalness: 0.1,
    }),
    ledLightMaterial: new THREE.MeshStandardMaterial({
      color: '#00ffcc',
      roughness: 0.1,
      metalness: 0.1,
      emissive: '#00ffcc',
      emissiveIntensity: 2.0,
    }),
    projectorMaterial: new THREE.MeshStandardMaterial({
      color: '#333333',
      roughness: 0.3,
      metalness: 0.8,
    }),
  }), []);

  return (
    // Positioned at the bottom entrance of the 12m vertical road next to Plot 16 (x = -187.5, z = 50.0)
    <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[-187.5, 0, 50.0]}>
      


      {/* ================= 2. LIGHT PROJECTORS & VOLUMETRIC BEAMS ================= */}
      
      {/* LEFT PROJECTOR & RAY */}
      <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[-5.4, 6.8, 0]}>
        {/* Projector housing cylinder */}
        <mesh rotation={[0, 0, -0.463]} material={projectorMaterial}>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
        </mesh>
        
        {/* SpotLight source — shadow disabled on mobile (expensive) */}
        <spotLight
          color="#00f0ff"
          intensity={120}
          distance={15}
          angle={Math.PI / 6}
          penumbra={0.8}
          castShadow={!isMobileRef.current}
        />
      </group>

      {/* Volumetric Beam Left */}
      <mesh position={[-3.7, 3.4, 0]} rotation={[0, 0, -0.463]} castShadow={false}>
        <coneGeometry args={[0.2, 2.5, 7.6, 8, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* RIGHT PROJECTOR & RAY */}
      <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[5.4, 6.8, 0]}>
        {/* Projector housing cylinder */}
        <mesh rotation={[0, 0, 0.463]} material={projectorMaterial}>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
        </mesh>
        
        {/* SpotLight source — shadow disabled on mobile (expensive) */}
        <spotLight
          color="#00f0ff"
          intensity={120}
          distance={15}
          angle={Math.PI / 6}
          penumbra={0.8}
          castShadow={!isMobileRef.current}
        />
      </group>

      {/* Volumetric Beam Right */}
      <mesh position={[3.7, 3.4, 0]} rotation={[0, 0, 0.463]} castShadow={false}>
        <coneGeometry args={[0.2, 2.5, 7.6, 8, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 3. GATE ARCH STRUCTURE ================= */}

      {/* LEFT PILLAR */}
      <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[-6.0, 0, 0]}>
        {/* Main Column */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow material={pillarMaterial}>
          <boxGeometry args={[1.2, 7.0, 1.2]} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={pillarMaterial}>
          <boxGeometry args={[1.6, 0.8, 1.6]} />
        </mesh>
        {/* Modern Vertical LED Light Strip */}
        <mesh position={[0.61, 3.5, 0]} material={ledLightMaterial}>
          <boxGeometry args={[0.05, 5.0, 0.2]} />
        </mesh>
      </group>

      {/* RIGHT PILLAR */}
      <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[6.0, 0, 0]}>
        {/* Main Column */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow material={pillarMaterial}>
          <boxGeometry args={[1.2, 7.0, 1.2]} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={pillarMaterial}>
          <boxGeometry args={[1.6, 0.8, 1.6]} />
        </mesh>
        {/* Modern Vertical LED Light Strip */}
        <mesh position={[0, 3.5, 0]} material={pillarMaterial} matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()}>
          <boxGeometry args={[1.2, 7.0, 1.2]} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.4, 0]} material={pillarMaterial} matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()}>
          <boxGeometry args={[1.6, 0.8, 1.6]} />
        </mesh>
        {/* Modern Vertical LED Light Strip */}
        <mesh position={[-0.61, 3.5, 0]} material={ledLightMaterial} matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()}>
          <boxGeometry args={[0.05, 5.0, 0.2]} />
        </mesh>
      </group>

      {/* TOP ARCH CROSSBAR */}
      <group matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()} position={[0, 7.3, 0]}>
        <mesh material={archMaterial} matrixAutoUpdate={false} onUpdate={(c: any) => c.updateMatrix()}>
          <boxGeometry args={[13.2, 0.8, 1.6]} />
        </mesh>

        {/* TOP TEXT FOR 2D VIEW (Flat on the top surface, facing up) */}
        <Text
          position={[0, 0.41, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.8}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material={blackTextMaterial}
        >
          ENTRANCE
        </Text>

        {/* FRONT TEXT: ENTRANCE */}
        <Text
          position={[0, 0, 0.81]}
          fontSize={0.65}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material={blackTextMaterial}
        >
          ENTRANCE
        </Text>

        {/* BACK TEXT: EXIT */}
        <Text
          position={[0, 0, -0.81]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.65}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          material={blackTextMaterial}
        >
          EXIT
        </Text>
      </group>
    </group>
  );
}
