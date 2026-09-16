import { useState, useEffect, useMemo, memo } from 'react';
import * as THREE from 'three';
import { subscribeOutlines, getAllOutlinePositions } from '../data/plotLookup';

const borderMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  polygonOffsetUnits: -4,
});

function MergedPlotOutlines() {
  const [positions, setPositions] = useState<number[]>(() => getAllOutlinePositions());

  useEffect(() => {
    return subscribeOutlines(() => {
      setPositions(getAllOutlinePositions());
    });
  }, []);

  const geometry = useMemo(() => {
    if (positions.length === 0) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  if (!geometry) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
      <lineSegments
        geometry={geometry}
        material={borderMaterial}
        raycast={() => null}
        renderOrder={10}
      />
    </group>
  );
}

export default memo(MergedPlotOutlines);
