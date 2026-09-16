import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, ContactShadows, Bvh } from '@react-three/drei';
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import RoadNetwork from './RoadNetwork';
import PlotsLeft from './PlotsLeft';
import PlotsCenterLeft from './PlotsCenterLeft';
import PlotsBlock5Right from './PlotsBlock5Right';
import PlotsBlock4Left from './PlotsBlock4Left';
import PlotsBlock4Right from './PlotsBlock4Right';
import PlotsBlock3Left from './PlotsBlock3Left';
import PlotsBlock3Right from './PlotsBlock3Right';
import PlotsBlock2Left from './PlotsBlock2Left';
import PlotsBlock2Right from './PlotsBlock2Right';
import PlotsBlock1Left from './PlotsBlock1Left';
import PlotsBlock1Right from './PlotsBlock1Right';
import PlotsRightBlock1Left from './PlotsRightBlock1Left';
import PlotsRightBlock1Right from './PlotsRightBlock1Right';
import PlotsRightBlock2Left from './PlotsRightBlock2Left';
import PlotsRightBlock2Right from './PlotsRightBlock2Right';
import PlotsRightBlock3Left from './PlotsRightBlock3Left';
import PlotsRightBlock3Right from './PlotsRightBlock3Right';
import PlotsRightBlock4Left from './PlotsRightBlock4Left';
import PlotsRightBlock4Right from './PlotsRightBlock4Right';
import Roundabout from './Roundabout';
import ClockTower from './ClockTower';
import ParksAndCASite from './ParksAndCASite';
import EntranceGate from './EntranceGate';
import CornerGardens from './CornerGardens';
import LiveMapGround from './LiveMapGround';
import AdaptiveEnvironment from './AdaptiveEnvironment';
import ProjectHUD from './ProjectHUD';
import { getPlotPosition } from '../data/plotLookup';
import { isSupabaseConfigured, fetchPlotStatuses, subscribeToPlotChanges } from '../services/supabase';
import type { PlotStatusMap } from '../types/plot';

// Module-level reusable vectors — never reallocated
const tmpForward = new THREE.Vector3();

// Perlin smootherstep (6t^5 - 15t^4 + 10t^3) for zero-jerk, buttery-smooth ease-in-out
function smootherstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

interface CameraManagerProps {
  targetPos: [number, number, number] | null;
  resetViewTrigger: number;
  resetHeadingTrigger: number;
  is3D: boolean;
}

function CameraManager({
  targetPos,
  resetViewTrigger,
  resetHeadingTrigger,
  is3D,
}: CameraManagerProps) {
  const { camera, controls, invalidate } = useThree();

  const isAnimatingRef = useRef(false);
  const animElapsedRef = useRef(0);
  const animDurationRef = useRef(0.85);

  const startCamPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const destCamPosRef = useRef(new THREE.Vector3());
  const destTargetRef = useRef(new THREE.Vector3());

  const resettingHeadingRef = useRef(false);
  const is3DRef = useRef(is3D);
  const is3DPrevRef = useRef(is3D);

  // Cache mobile check — only recalculated on resize, not every frame
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sync is3D into ref
  useEffect(() => {
    is3DRef.current = is3D;
  }, [is3D]);

  // React to targetPos changes — direct smooth flight to clicked plot
  useEffect(() => {
    if (targetPos && controls) {
      // 1. Immediately disable controls and clear any residual damping momentum
      (controls as any).enabled = false;
      if ((controls as any).sphericalDelta) {
        (controls as any).sphericalDelta.set(0, 0, 0);
      }

      // 2. Capture starting positions directly from current live camera state
      startTargetRef.current.copy((controls as any).target);
      startCamPosRef.current.copy(camera.position);

      // 3. Destination target: exact center of clicked plot
      destTargetRef.current.set(targetPos[0], targetPos[1], targetPos[2]);

      // 4. Compute destination camera position preserving viewing angles
      const isMobile = isMobileRef.current;
      const is3DMode = is3DRef.current;
      const desiredDist = is3DMode ? (isMobile ? 100 : 70) : (isMobile ? 120 : 85);

      if (!is3DMode) {
        // 2D top-down view
        destCamPosRef.current.set(
          destTargetRef.current.x,
          destTargetRef.current.y + desiredDist,
          destTargetRef.current.z + 0.001
        );
      } else {
        // 3D mode: compute based on current viewing direction
        const currentOffset = new THREE.Vector3().subVectors(startCamPosRef.current, startTargetRef.current);
        const horizDist = Math.hypot(currentOffset.x, currentOffset.z);

        let azimuth = 0;
        if (horizDist > 0.01) {
          azimuth = Math.atan2(currentOffset.x, currentOffset.z);
        }

        // Polar elevation angle (0 = top-down, PI/2 = horizontal)
        let polar = Math.PI / 3.8; // ~47.4 deg optimal 3D viewing angle
        if (currentOffset.lengthSq() > 0.1) {
          const currentPolar = Math.atan2(horizDist, Math.max(0.001, currentOffset.y));
          // If already in a comfortable 3D angle range (between ~30° and 80°), preserve the user's angle exactly!
          if (currentPolar >= 0.52 && currentPolar <= 1.40) {
            polar = currentPolar;
          } else if (currentPolar < 0.52) {
            // If coming from steep top-down / world view, smoothly tilt into 3D view
            polar = THREE.MathUtils.lerp(0.83, currentPolar, 0.2);
          }
        }

        const sinPolar = Math.sin(polar);
        const cosPolar = Math.cos(polar);
        const sinAz = Math.sin(azimuth);
        const cosAz = Math.cos(azimuth);

        destCamPosRef.current.set(
          destTargetRef.current.x + desiredDist * sinPolar * sinAz,
          destTargetRef.current.y + desiredDist * cosPolar,
          destTargetRef.current.z + desiredDist * sinPolar * cosAz
        );
      }

      // Dynamic duration based on travel distance for responsive feel
      const travelDist = startCamPosRef.current.distanceTo(destCamPosRef.current);
      animDurationRef.current = THREE.MathUtils.clamp(0.65 + (travelDist / 500) * 0.5, 0.7, 1.2);
      animElapsedRef.current = 0;
      isAnimatingRef.current = true;

      resettingHeadingRef.current = false;
      invalidate();
    }
  }, [targetPos, camera, controls, invalidate]);

  // React to reset view trigger — smooth flight back to overview
  useEffect(() => {
    if (resetViewTrigger > 0 && controls) {
      (controls as any).enabled = false;
      if ((controls as any).sphericalDelta) {
        (controls as any).sphericalDelta.set(0, 0, 0);
      }

      startTargetRef.current.copy((controls as any).target);
      startCamPosRef.current.copy(camera.position);

      const isMobile = isMobileRef.current;
      const is3DMode = is3DRef.current;

      destTargetRef.current.set(0, 0, 0);
      if (is3DMode) {
        if (isMobile) destCamPosRef.current.set(0, 560, 180);
        else destCamPosRef.current.set(0, 420, 140);
      } else {
        if (isMobile) destCamPosRef.current.set(0, 680, 0.1);
        else destCamPosRef.current.set(0, 520, 0.1);
      }

      const travelDist = startCamPosRef.current.distanceTo(destCamPosRef.current);
      animDurationRef.current = THREE.MathUtils.clamp(0.7 + (travelDist / 500) * 0.45, 0.75, 1.25);
      animElapsedRef.current = 0;
      isAnimatingRef.current = true;

      resettingHeadingRef.current = false;
      invalidate();
    }
  }, [resetViewTrigger, camera, controls, invalidate]);

  // React to reset heading trigger
  useEffect(() => {
    if (resetHeadingTrigger > 0) {
      resettingHeadingRef.current = true;
      invalidate();
    }
  }, [resetHeadingTrigger, invalidate]);

  // React to 2D/3D mode toggle
  useEffect(() => {
    if (is3DPrevRef.current !== is3D && controls) {
      is3DPrevRef.current = is3D;

      (controls as any).enabled = false;
      if ((controls as any).sphericalDelta) {
        (controls as any).sphericalDelta.set(0, 0, 0);
      }

      startTargetRef.current.copy((controls as any).target);
      startCamPosRef.current.copy(camera.position);

      destTargetRef.current.copy((controls as any).target);
      const dist = Math.max(70, camera.position.distanceTo(destTargetRef.current));

      if (is3D) {
        destCamPosRef.current.set(
          destTargetRef.current.x,
          destTargetRef.current.y + dist * 0.65,
          destTargetRef.current.z + dist * 0.75
        );
      } else {
        destCamPosRef.current.set(
          destTargetRef.current.x,
          destTargetRef.current.y + dist,
          destTargetRef.current.z + 0.001
        );
      }

      animDurationRef.current = 0.75;
      animElapsedRef.current = 0;
      isAnimatingRef.current = true;

      invalidate();
    }
  }, [is3D, camera, controls, invalidate]);

  // Apply OrbitControls touch/mouse config when mode changes
  useEffect(() => {
    if (controls) {
      if (is3D) {
        (controls as any).touches.ONE = THREE.TOUCH.ROTATE;
        (controls as any).touches.TWO = THREE.TOUCH.DOLLY_PAN;
        (controls as any).mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        (controls as any).mouseButtons.RIGHT = THREE.MOUSE.PAN;
      } else {
        (controls as any).touches.ONE = THREE.TOUCH.PAN;
        (controls as any).touches.TWO = THREE.TOUCH.DOLLY_PAN;
        (controls as any).mouseButtons.LEFT = THREE.MOUSE.PAN;
        (controls as any).mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
      }
    }
  }, [controls, is3D]);

  const needleRef = useRef<HTMLElement | null>(null);

  useFrame((_state, delta) => {
    if (!controls) return;

    let needsUpdate = false;

    // Fast direct DOM update for compass rotation — zero React churn
    camera.getWorldDirection(tmpForward);
    const heading = Math.atan2(tmpForward.x, tmpForward.z);
    if (!needleRef.current) {
      needleRef.current = document.getElementById('compass-needle');
    }
    if (needleRef.current) {
      needleRef.current.style.transform = `rotate(${-(heading * 180) / Math.PI}deg)`;
    }

    // Reset heading towards North
    if (resettingHeadingRef.current) {
      const currentAzimuth = (controls as any).getAzimuthalAngle?.() || 0;
      if (Math.abs(currentAzimuth) > 0.01) {
        const nextAzimuth = THREE.MathUtils.lerp(currentAzimuth, 0, delta * 8);
        const polar = (controls as any).getPolarAngle?.() || Math.PI / 4;
        const dist = camera.position.distanceTo((controls as any).target);
        camera.position.x = (controls as any).target.x + dist * Math.sin(polar) * Math.sin(nextAzimuth);
        camera.position.z = (controls as any).target.z + dist * Math.sin(polar) * Math.cos(nextAzimuth);
        camera.lookAt((controls as any).target);
        (controls as any).update();
        needsUpdate = true;
      } else {
        resettingHeadingRef.current = false;
      }
    }

    // Smooth continuous flight animation (Plot clicks, Reset View, 2D/3D toggle)
    if (isAnimatingRef.current) {
      animElapsedRef.current += delta;
      const progress = THREE.MathUtils.clamp(animElapsedRef.current / animDurationRef.current, 0, 1);
      const ease = smootherstep(progress);

      if (progress < 1.0) {
        camera.position.lerpVectors(startCamPosRef.current, destCamPosRef.current, ease);
        (controls as any).target.lerpVectors(startTargetRef.current, destTargetRef.current, ease);
        camera.lookAt((controls as any).target);
        needsUpdate = true;
      } else {
        // Settle precisely at destination
        camera.position.copy(destCamPosRef.current);
        (controls as any).target.copy(destTargetRef.current);
        camera.lookAt((controls as any).target);

        // Cleanly re-enable controls with the new orientation synced
        (controls as any).update();
        (controls as any).enabled = true;
        isAnimatingRef.current = false;
        needsUpdate = true;
      }
    }

    if (needsUpdate) invalidate();
  });

  return null;
}

function ProjectLocationDot({ dotRef }: { dotRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();

  const { pinGeometry, pinMaterial, ringGeometry, ringMaterial } = useMemo(() => {
    // 1. Create the Teardrop Shape for the Map Pin
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // Bottom point
    // Right side curve
    shape.bezierCurveTo(0.2, 0.5, 1.0, 1.0, 1.0, 1.5);
    // Top semi-circle
    shape.absarc(0, 1.5, 1.0, 0, Math.PI, false);
    // Left side curve
    shape.bezierCurveTo(-1.0, 1.0, -0.2, 0.5, 0, 0);

    // Note: Hole removed to make it a solid red pin as requested

    // Extrude it into 3D
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      curveSegments: 24,
    });
    
    geom.computeVertexNormals();
    // Center it along the Z axis (thickness) so it stands perfectly upright on the point
    geom.translate(0, 0, -0.2); 
    // Scale it to a normalized 1-unit height approx for easier math
    geom.scale(0.4, 0.4, 0.4); 

    const mat = new THREE.MeshStandardMaterial({ 
      color: '#e53935', 
      roughness: 0.3, 
      metalness: 0.1,
      depthTest: false,
      depthWrite: false
    });

    // 2. Create the Ground Shadow/Spot
    const rGeom = new THREE.CircleGeometry(0.45, 32);
    const rMat = new THREE.MeshBasicMaterial({ 
      color: '#e53935', 
      transparent: true, 
      opacity: 0.5,
      depthTest: false,
      depthWrite: false
    });

    return { pinGeometry: geom, pinMaterial: mat, ringGeometry: rGeom, ringMaterial: rMat };
  }, []);

  useFrame(() => {
    if (!dotRef.current || !dotRef.current.visible) return;
    const dist = camera.position.length();
    // Scale smoothly so it acts like a professional map UI pin
    const targetScale = Math.max(20, dist * 0.012); 
    dotRef.current.scale.setScalar(targetScale);
  });

  return (
    <group ref={dotRef} position={[0, 2.0, -21.65]} visible={false}>
      {/* 3D Standing Pin */}
      <mesh 
        geometry={pinGeometry} 
        material={pinMaterial} 
        renderOrder={102} 
      />
      
      {/* Red Ground Ring beneath the pin */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        geometry={ringGeometry} 
        material={ringMaterial} 
        renderOrder={101}
      />
    </group>
  );
}

function MasterplanVisibilityManager({
  masterplanRef,
  dotRef,
}: {
  masterplanRef: React.RefObject<THREE.Group | null>;
  dotRef: React.RefObject<THREE.Group | null>;
}) {
  const { camera, invalidate } = useThree();
  const visibleRef = useRef(true);

  useFrame(() => {
    if (!masterplanRef.current || !dotRef.current) return;
    const dist = camera.position.length();

    // Threshold Tuning for Proper Geographic LOD:
    // Cull before the plot boundaries compress into a solid black mass
    if (visibleRef.current && dist > 6000) {
      visibleRef.current = false;
      masterplanRef.current.visible = false;
      dotRef.current.visible = true;
      invalidate();
    } else if (!visibleRef.current && dist < 4800) {
      visibleRef.current = true;
      masterplanRef.current.visible = true;
      dotRef.current.visible = false;
      invalidate();
    }
  });

  return null;
}

function SceneReadinessNotifier({ onReady }: { onReady: () => void }) {
  const { invalidate } = useThree();
  const readyFiredRef = useRef(false);

  useFrame(() => {
    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady();
      invalidate();
    }
  });

  return null;
}

function CameraFrustumManager() {
  const { camera } = useThree();
  useFrame(() => {
    const dist = camera.position.length();
    // Dynamically scale frustum to maintain perfect Z-buffer precision at all scales.
    // This entirely solves mobile Z-fighting, geometry popping, and text flashing.
    const newNear = Math.max(1, dist * 0.005);
    const newFar = Math.max(5000, dist * 5);
    
    if (Math.abs(camera.near - newNear) > newNear * 0.1 || Math.abs(camera.far - newFar) > newFar * 0.1) {
      camera.near = newNear;
      camera.far = newFar;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export default function Scene({ onStageChange }: { onStageChange?: (stage: 'data' | 'compile' | 'ready') => void }) {
  const masterplanGroupRef = useRef<THREE.Group>(null);
  const locationDotRef = useRef<THREE.Group>(null);

  useEffect(() => {
    onStageChange?.('data');
  }, [onStageChange]);
  const [is3D, setIs3D] = useState(true);
  const [mapType, setMapType] = useState<'satellite' | 'dark'>('satellite');
  const [selectedPlotPos, setSelectedPlotPos] = useState<[number, number, number] | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [resetViewCount, setResetViewCount] = useState(0);
  const [resetHeadingCount, setResetHeadingCount] = useState(0);
  const [plotStatusMap, setPlotStatusMap] = useState<PlotStatusMap>({});

  // Capability-based device detection
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 800 || window.innerHeight < 600;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return isMobileUA || (isTouchDevice && isSmallScreen);
  }, []);

  // Optimal DPR: 4K crisp on desktop, capped at 1.5 on mobile to save 50% GPU fill-rate
  const dpr = isMobile
    ? Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5)
    : Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);

  useEffect(() => {
    async function loadPlotStatuses() {
      if (isSupabaseConfigured) {
        const statuses = await fetchPlotStatuses();
        setPlotStatusMap(statuses);
      }
    }
    loadPlotStatuses();

    const unsubscribe = subscribeToPlotChanges(() => {
      loadPlotStatuses();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized stable callbacks — prevents all 18 block components from re-rendering
  const handlePlotSelect = useCallback((id: number | null, pos: [number, number, number] | null) => {
    setSelectedPlotId((prevId) => {
      const isDeselecting = prevId === id;
      // We can safely update the pos state synchronously here during the same batch
      setSelectedPlotPos(isDeselecting ? null : pos);
      return isDeselecting ? null : id;
    });
  }, []);

  const handleSearchPlot = useCallback((plotNumber: number) => {
    const pos = getPlotPosition(plotNumber);
    if (pos) {
      setSelectedPlotId(plotNumber);
      setSelectedPlotPos(pos);
    }
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedPlotId(null);
    setSelectedPlotPos(null);
    setResetViewCount((c) => c + 1);
  }, []);

  const handleResetHeading = useCallback(() => {
    setResetHeadingCount((c) => c + 1);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#121418', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        frameloop="demand"
        shadows={!isMobile}
        dpr={dpr}
        onCreated={({ gl, scene, camera }) => {
          gl.compile(scene, camera);
          onStageChange?.('compile');
        }}
        camera={{
          position: isMobile ? [0, 560, 180] : [0, 420, 140],
          fov: 45,
          near: 1,
          far: 100000000
        }}
        gl={{
          logarithmicDepthBuffer: false,
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
      >
        <SceneReadinessNotifier onReady={() => onStageChange?.('ready')} />
        <CameraFrustumManager />
        <Suspense fallback={null}>
        <color attach="background" args={[mapType === 'satellite' ? '#282c23' : '#121418']} />

        {/* Live Satellite Ground (Outside BVH) */}
        <LiveMapGround mapType={mapType} />

        {/* Smart Adaptive Lighting & Non-blocking Environment */}
        <AdaptiveEnvironment mapType={mapType} />

        {/* Directional Sunlight with Soft Shadow Mapping */}
        <directionalLight
          castShadow={!isMobile}
          position={[120, 250, 70]}
          intensity={mapType === 'satellite' ? 1.5 : 1.3}
          shadow-mapSize={isMobile ? [128, 128] : [2048, 2048]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.04}
        >
          <orthographicCamera attach="shadow-camera" args={[-350, 350, 350, -350]} />
        </directionalLight>

        <MasterplanVisibilityManager masterplanRef={masterplanGroupRef} dotRef={locationDotRef} />
        <ProjectLocationDot dotRef={locationDotRef} />

        <Bvh firstHitOnly>
        <group ref={masterplanGroupRef}>
        {/* Road Network */}
        <RoadNetwork />

        {/* Plot Clusters */}
        <PlotsLeft selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsCenterLeft selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock5Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock4Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock4Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock3Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock3Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock2Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock2Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock1Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsBlock1Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock1Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock1Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock2Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock2Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock3Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock3Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock4Left selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />
        <PlotsRightBlock4Right selectedPlotId={selectedPlotId} onPlotSelect={handlePlotSelect} plotStatusMap={plotStatusMap} />

        <ParksAndCASite />
        <CornerGardens />
        <EntranceGate />

        {/* Central Focal Point */}
        <group position={[0, 0, -21.65]}>
          <Roundabout />
          <ClockTower />
        </group>

        {/* Static Ground Contact Shadows (dark mode only) */}
        {mapType === 'dark' && (
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={1200} blur={2} far={15} frames={1} />
        )}
        </group>

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          maxPolarAngle={is3D ? Math.PI / 2 - 0.08 : 0}
          minPolarAngle={0}
          enableRotate={is3D}
          minDistance={15}
          maxDistance={30000000}
          enableDamping={true}
          dampingFactor={0.08}
        />

        {/* Camera Animation & Compass Sync */}
        <CameraManager
          targetPos={selectedPlotPos}
          resetViewTrigger={resetViewCount}
          resetHeadingTrigger={resetHeadingCount}
          is3D={is3D}
        />
        </Bvh>
        </Suspense>
      </Canvas>

      {/* Floating HUD Interface */}
      <ProjectHUD
        is3D={is3D}
        onToggle3D={setIs3D}
        mapType={mapType}
        onToggleMapType={setMapType}
        onResetView={handleResetView}
        onSearchPlot={handleSearchPlot}
        selectedPlotId={selectedPlotId}
        selectedPlotStatus={selectedPlotId ? (plotStatusMap[selectedPlotId] || 'available') : undefined}
        onResetHeading={handleResetHeading}
      />
    </div>
  );
}
