import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Environment, ContactShadows, Bvh, PerformanceMonitor } from '@react-three/drei';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
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
import SatelliteGround from './SatelliteGround';
import ProjectHUD from './ProjectHUD';
import { getPlotPosition } from '../data/plotLookup';
import { isSupabaseConfigured, fetchPlotStatuses, subscribeToPlotChanges } from '../services/supabase';
import type { PlotStatusMap } from '../types/plot';

// Module-level reusable vectors — never reallocated
const tmpForward = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const tmpCamPos = new THREE.Vector3();

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

  const animatingToRef = useRef<[number, number, number] | null>(null);
  const targetCamPosRef = useRef(new THREE.Vector3());
  const resettingViewRef = useRef(false);
  const resettingHeadingRef = useRef(false);
  const togglingModeRef = useRef(false);
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

  // React to targetPos changes — write to ref, no setState
  useEffect(() => {
    if (targetPos && controls) {
      animatingToRef.current = targetPos;
      resettingViewRef.current = false;
      
      // Calculate exact camera destination preserving the current view angle
      const currentDir = new THREE.Vector3().subVectors(camera.position, (controls as any).target).normalize();
      
      // Ensure we don't go strictly underground or purely top-down, but preserve the heading completely
      if (currentDir.y < 0.2) currentDir.y = 0.2;
      if (currentDir.y > 0.8) currentDir.y = 0.8;
      currentDir.normalize();

      const desiredDist = isMobileRef.current ? 110 : 75;
      targetCamPosRef.current.set(targetPos[0], targetPos[1], targetPos[2]).add(currentDir.multiplyScalar(desiredDist));

      invalidate();
    }
  }, [targetPos, camera, controls, invalidate]);

  // React to reset view trigger — write to ref
  useEffect(() => {
    if (resetViewTrigger > 0) {
      resettingViewRef.current = true;
      animatingToRef.current = null;
      invalidate();
    }
  }, [resetViewTrigger, invalidate]);

  // React to reset heading trigger — write to ref
  useEffect(() => {
    if (resetHeadingTrigger > 0) {
      resettingHeadingRef.current = true;
      invalidate();
    }
  }, [resetHeadingTrigger, invalidate]);

  // React to 2D/3D mode toggle — write to ref
  useEffect(() => {
    if (is3DPrevRef.current !== is3D) {
      is3DPrevRef.current = is3D;
      togglingModeRef.current = true;
      invalidate();
    }
  }, [is3D, invalidate]);

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

  useFrame((_state, delta) => {
    if (!controls) return;

    let needsUpdate = false;

    // Fast direct DOM update for compass rotation — zero React churn
    camera.getWorldDirection(tmpForward);
    const heading = Math.atan2(tmpForward.x, tmpForward.z);
    const needle = document.getElementById('compass-needle');
    if (needle) {
      needle.style.transform = `rotate(${-(heading * 180) / Math.PI}deg)`;
    }

    // Reset heading towards North
    if (resettingHeadingRef.current) {
      const currentAzimuth = (controls as any).getAzimuthalAngle?.() || 0;
      if (Math.abs(currentAzimuth) > 0.02) {
        const nextAzimuth = THREE.MathUtils.lerp(currentAzimuth, 0, delta * 8);
        const polar = (controls as any).getPolarAngle?.() || Math.PI / 4;
        const dist = camera.position.distanceTo((controls as any).target);
        camera.position.x = (controls as any).target.x + dist * Math.sin(polar) * Math.sin(nextAzimuth);
        camera.position.z = (controls as any).target.z + dist * Math.sin(polar) * Math.cos(nextAzimuth);
        (controls as any).update();
        needsUpdate = true;
      } else {
        resettingHeadingRef.current = false;
      }
    }

    // Smooth camera reset to overview
    if (resettingViewRef.current) {
      const isMobile = isMobileRef.current;
      tmpTarget.set(0, 0, 0);

      if (is3DRef.current) {
        if (isMobile) tmpCamPos.set(0, 560, 180);
        else tmpCamPos.set(0, 420, 140);
      } else {
        if (isMobile) tmpCamPos.set(0, 680, 0.1);
        else tmpCamPos.set(0, 520, 0.1);
      }

      const targetDist = (controls as any).target.distanceTo(tmpTarget);
      const camDist = camera.position.distanceTo(tmpCamPos);

      (controls as any).enabled = false;
      (controls as any).target.lerp(tmpTarget, delta * 4);
      camera.position.lerp(tmpCamPos, delta * 4);
      (controls as any).update();
      needsUpdate = true;

      if (targetDist < 1.0 && camDist < 2.0) {
        resettingViewRef.current = false;
        (controls as any).enabled = true;
      }
    }

    // Smooth 2D/3D toggle transition
    if (togglingModeRef.current) {
      tmpTarget.copy((controls as any).target);
      const dist = Math.max(80, camera.position.distanceTo(tmpTarget));

      if (is3DRef.current) {
        tmpCamPos.set(tmpTarget.x, tmpTarget.y + dist * 0.6, tmpTarget.z + dist * 0.8);
      } else {
        tmpCamPos.set(tmpTarget.x, tmpTarget.y + dist, tmpTarget.z + 0.1);
      }

      const camDist = camera.position.distanceTo(tmpCamPos);

      (controls as any).enabled = false;
      camera.position.lerp(tmpCamPos, delta * 5);
      (controls as any).update();
      needsUpdate = true;

      if (camDist < 2.0) {
        togglingModeRef.current = false;
        (controls as any).enabled = true;
      }
    }

    // Smooth fly-to selected plot
    if (animatingToRef.current) {
      const anim = animatingToRef.current;
      tmpTarget.set(anim[0], anim[1], anim[2]);
      
      // Use the locked-in camera destination computed when the plot was clicked
      tmpCamPos.copy(targetCamPosRef.current);

      const targetDist = (controls as any).target.distanceTo(tmpTarget);
      const camDist = camera.position.distanceTo(tmpCamPos);

      (controls as any).enabled = false;

      // Allow a tiny bit more tolerance (1.0 instead of 0.5) to avoid micro-jitter at the end
      if (targetDist > 1.0 || camDist > 1.0) {
        // Use smooth damp-like lerp to avoid snapping
        (controls as any).target.lerp(tmpTarget, delta * 6);
        camera.position.lerp(tmpCamPos, delta * 6);
        (controls as any).update();
        needsUpdate = true;
      } else {
        // Snap to exact position at the very end to ensure stability
        (controls as any).target.copy(tmpTarget);
        camera.position.copy(tmpCamPos);
        animatingToRef.current = null;
        (controls as any).enabled = true;
        needsUpdate = true;
      }
    }

    if (needsUpdate) invalidate();
  });

  return null;
}

export default function Scene() {
  const [is3D, setIs3D] = useState(true);
  const [mapType, setMapType] = useState<'satellite' | 'dark'>('satellite');
  const [selectedPlotPos, setSelectedPlotPos] = useState<[number, number, number] | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [resetViewCount, setResetViewCount] = useState(0);
  const [resetHeadingCount, setResetHeadingCount] = useState(0);
  const [plotStatusMap, setPlotStatusMap] = useState<PlotStatusMap>({});
  
  // Initialize DPR based on device type. 1.5 gives sharp mobile clarity without the cost of 2.0.
  const initialMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [dpr, setDpr] = useState<[number, number]>(initialMobile ? [1, 1.5] : [1, 2]);

  // Stable mobile ref — not re-derived each render
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  const isMobile = isMobileRef.current;

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
    setSelectedPlotId(id);
    setSelectedPlotPos(pos);
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
        camera={{
          position: isMobile ? [0, 560, 180] : [0, 420, 140],
          fov: 45,
          near: 2,
          far: 4000
        }}
        gl={{
          logarithmicDepthBuffer: true,
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
      >
        <PerformanceMonitor 
          onIncline={() => setDpr(isMobile ? [1, 1.5] : [1, 2])} 
          onDecline={() => setDpr(isMobile ? [0.75, 1] : [1, 1])}
        >
        <Suspense fallback={null}>
        <color attach="background" args={[mapType === 'satellite' ? '#14181b' : '#121418']} />

        <Bvh firstHitOnly>
        {/* Architectural lighting */}
        <ambientLight intensity={mapType === 'satellite' ? 0.65 : 0.4} />
        <directionalLight
          castShadow={!isMobile}
          position={[120, 250, 70]}
          intensity={mapType === 'satellite' ? 1.6 : 1.4}
          shadow-mapSize={isMobile ? [128, 128] : [2048, 2048]}
        >
          <orthographicCamera attach="shadow-camera" args={[-350, 350, 350, -350]} />
        </directionalLight>

        <directionalLight position={[-120, 120, -70]} intensity={0.4} color="#90b8ff" />

        {/* Soft environment lighting */}
        <Environment preset="city" />

        {/* Satellite Ground */}
        <SatelliteGround mapType={mapType} />

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

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          maxPolarAngle={is3D ? Math.PI / 2 - 0.08 : 0}
          minPolarAngle={0}
          enableRotate={is3D}
          minDistance={15}
          maxDistance={750}
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
        </PerformanceMonitor>
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
