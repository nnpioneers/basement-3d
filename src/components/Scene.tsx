import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
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
  const { camera, controls } = useThree();
  const [animatingTo, setAnimatingTo] = useState<[number, number, number] | null>(null);
  const [resettingView, setResettingView] = useState(false);
  const [resettingHeading, setResettingHeading] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);
  const is3DPrevRef = useRef(is3D);

  useEffect(() => {
    if (targetPos) {
      setAnimatingTo(targetPos);
      setResettingView(false);
    }
  }, [targetPos]);

  useEffect(() => {
    if (resetViewTrigger > 0) {
      setResettingView(true);
      setAnimatingTo(null);
    }
  }, [resetViewTrigger]);

  useEffect(() => {
    if (resetHeadingTrigger > 0) {
      setResettingHeading(true);
    }
  }, [resetHeadingTrigger]);

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

  useEffect(() => {
    if (is3DPrevRef.current !== is3D) {
      is3DPrevRef.current = is3D;
      setTogglingMode(true);
    }
  }, [is3D]);

  useFrame((_state, delta) => {
    if (!controls) return;

    // Fast direct DOM update for compass rotation (zero React churn)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const heading = Math.atan2(forward.x, forward.z);
    const needle = document.getElementById('compass-needle');
    if (needle) {
      const deg = -(heading * 180) / Math.PI;
      needle.style.transform = `rotate(${deg}deg)`;
    }

    // Reset heading towards North
    if (resettingHeading) {
      const currentAzimuth = (controls as any).getAzimuthalAngle?.() || 0;
      if (Math.abs(currentAzimuth) > 0.02) {
        const nextAzimuth = THREE.MathUtils.lerp(currentAzimuth, 0, delta * 8);
        const polar = (controls as any).getPolarAngle?.() || Math.PI / 4;
        const dist = camera.position.distanceTo((controls as any).target);
        camera.position.x = (controls as any).target.x + dist * Math.sin(polar) * Math.sin(nextAzimuth);
        camera.position.z = (controls as any).target.z + dist * Math.sin(polar) * Math.cos(nextAzimuth);
        (controls as any).update();
      } else {
        setResettingHeading(false);
      }
    }

    // Smooth camera reset to view
    if (resettingView) {
      const isMobile = window.innerWidth < 768;
      const targetVec = new THREE.Vector3(0, 0, 0);
      const defaultCamPos = is3D 
        ? (isMobile ? new THREE.Vector3(0, 560, 180) : new THREE.Vector3(0, 420, 140))
        : (isMobile ? new THREE.Vector3(0, 680, 0.1) : new THREE.Vector3(0, 520, 0.1));
      const targetDist = (controls as any).target.distanceTo(targetVec);
      const camDist = camera.position.distanceTo(defaultCamPos);

      (controls as any).enabled = false;
      (controls as any).target.lerp(targetVec, delta * 4);
      camera.position.lerp(defaultCamPos, delta * 4);
      (controls as any).update();

      if (targetDist < 1.0 && camDist < 2.0) {
        setResettingView(false);
        (controls as any).enabled = true;
      }
      return;
    }

    // Smooth camera transition for 2D/3D toggle (maintains current target)
    if (togglingMode) {
      const targetVec = (controls as any).target.clone();
      const dist = Math.max(80, camera.position.distanceTo(targetVec));
      
      const targetCamPos = is3D 
        ? new THREE.Vector3(targetVec.x, targetVec.y + dist * 0.6, targetVec.z + dist * 0.8) // 3D angled
        : new THREE.Vector3(targetVec.x, targetVec.y + dist, targetVec.z + 0.1); // 2D top-down
        
      const camDist = camera.position.distanceTo(targetCamPos);

      (controls as any).enabled = false;
      camera.position.lerp(targetCamPos, delta * 5);
      (controls as any).update();

      if (camDist < 2.0) {
        setTogglingMode(false);
        (controls as any).enabled = true;
      }
      return;
    }

    // Smooth animation to selected plot
    if (animatingTo) {
      const targetVec = new THREE.Vector3(...animatingTo);
      const targetDist = (controls as any).target.distanceTo(targetVec);

      (controls as any).enabled = false;

      if (targetDist > 0.5) {
        (controls as any).target.lerp(targetVec, delta * 5);
        const isMobile = window.innerWidth < 768;
        const camOffsetY = isMobile ? 85 : 65;
        const camOffsetZ = isMobile ? 45 : 35;
        const camPos = new THREE.Vector3(animatingTo[0], animatingTo[1] + camOffsetY, animatingTo[2] + camOffsetZ);
        camera.position.lerp(camPos, delta * 5);
        (controls as any).update();
      } else {
        setAnimatingTo(null);
        (controls as any).enabled = true;
      }
    }
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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

  const handlePlotSelect = (id: number | null, pos: [number, number, number] | null) => {
    setSelectedPlotId(id);
    setSelectedPlotPos(pos);
  };

  const handleSearchPlot = (plotNumber: number) => {
    const pos = getPlotPosition(plotNumber);
    if (pos) {
      setSelectedPlotId(plotNumber);
      setSelectedPlotPos(pos);
    }
  };

  const handleResetView = () => {
    setSelectedPlotId(null);
    setSelectedPlotPos(null);
    setResetViewCount((c) => c + 1);
  };

  const handleResetHeading = () => {
    setResetHeadingCount((c) => c + 1);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#121418', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
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
        }}
      >
        <color attach="background" args={[mapType === 'satellite' ? '#14181b' : '#121418']} />
        
        {/* Architectural lighting balanced for satellite terrain */}
        <ambientLight intensity={mapType === 'satellite' ? 0.65 : 0.4} />
        <directionalLight 
          castShadow 
          position={[120, 250, 70]} 
          intensity={mapType === 'satellite' ? 1.6 : 1.4} 
          shadow-mapSize={[2048, 2048]}
        >
          <orthographicCamera attach="shadow-camera" args={[-350, 350, 350, -350]} />
        </directionalLight>
        
        <directionalLight position={[-120, 120, -70]} intensity={0.4} color="#90b8ff" />
        
        {/* Soft environment lighting to enhance PBR materials */}
        <Environment preset="city" />

        {/* Real-World Satellite Imagery Ground Plane */}
        <SatelliteGround 
          mapType={mapType} 
        />

        {/* 3D Master Layout Elements */}
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

        {/* Central Focal Point (Roundabout & Clock Tower) */}
        <group position={[0, 0, -21.65]}>
          <Roundabout />
          <ClockTower />
        </group>

        {/* Static Ground Contact Shadows */}
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
        />
        
        {/* Dynamic Camera Animation & Compass Synchronization */}
        <CameraManager 
          targetPos={selectedPlotPos}
          resetViewTrigger={resetViewCount}
          resetHeadingTrigger={resetHeadingCount}
          is3D={is3D}
        />
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

