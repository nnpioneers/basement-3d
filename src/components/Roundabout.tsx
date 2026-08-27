


export default function Roundabout() {
  const radius = 3.5;
  const grassHeight = 0.3;
  const pathWidth = 1.2;
  const pathHeight = 0.35; // Slightly higher than grass
  
  return (
    <group position={[0, 0, 0]}>
      {/* Base Grass Island */}
      <mesh position={[0, grassHeight / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius, grassHeight, 64]} />
        <meshStandardMaterial color="#4a633d" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Cross Pathway (Horizontal) */}
      <mesh position={[0, pathHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[radius * 2, pathHeight, pathWidth]} />
        <meshStandardMaterial color="#d1d0c8" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Cross Pathway (Vertical) */}
      <mesh position={[0, pathHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[pathWidth, pathHeight, radius * 2]} />
        <meshStandardMaterial color="#d1d0c8" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Decorative Shrubs (4 Quadrants) */}
      {[
        { x: 1.5, z: 1.5 },
        { x: -1.5, z: 1.5 },
        { x: 1.5, z: -1.5 },
        { x: -1.5, z: -1.5 },
      ].map((pos, index) => (
        <group key={index} position={[pos.x, grassHeight + 0.3, pos.z]}>
          <mesh receiveShadow castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#2d4a22" roughness={0.9} metalness={0.0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
