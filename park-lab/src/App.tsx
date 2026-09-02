import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Sky, Grid } from '@react-three/drei';
import { parkConfig as C } from './config';
import { OuterTrack, InnerLawn, MonumentRing, GazeboRing, InternalPaths } from './components/Park';
import RelaxationArea from './components/RelaxationArea';
import Gazebo from './components/Gazebo';
import Pergola from './components/Pergola';
import PlayArea from './components/PlayArea';
import GymArea from './components/GymArea';
import CampfireArea from './components/CampfireArea';
import Landscape from './components/Landscape';

// ── Reference overlay ─────────────────────────────────────
function ReferenceOverlay({ opacity }: { opacity: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'url(/reference/park-reference.png)',
      backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      opacity, mixBlendMode: 'multiply', zIndex: 10,
    }} />
  );
}

// ── Outer ground (grass extending well beyond track) ───────
function Ground() {
  return (
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-0.02,0]}>
      <planeGeometry args={[C.groundWidth, C.groundDepth, 1, 1]} />
      <meshStandardMaterial color="#2e7a3e" roughness={0.88} />
    </mesh>
  );
}

// ── HUD ────────────────────────────────────────────────────
function HUD({ refOpacity, setRefOpacity, topDown, setTopDown }:
  { refOpacity:number; setRefOpacity:(v:number)=>void; topDown:boolean; setTopDown:(v:boolean)=>void }) {
  const base: React.CSSProperties = { border:'none', borderRadius:8, padding:'6px 18px',
    cursor:'pointer', fontWeight:700, fontSize:13, transition:'all 0.18s' };
  const on:  React.CSSProperties = { background:'#4ade80', color:'#111' };
  const off: React.CSSProperties = { background:'#444',   color:'#aaa' };

  return (
    <div style={{
      position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
      display:'flex', gap:10, alignItems:'center', zIndex:20,
      background:'rgba(0,0,0,0.72)', padding:'10px 20px', borderRadius:14,
      backdropFilter:'blur(8px)', color:'#fff', fontFamily:'sans-serif', fontSize:13,
    }}>
      <button style={{...base,...(topDown?on:off)}}  onClick={()=>setTopDown(true)}>🗺 2D Top-down</button>
      <button style={{...base,...(!topDown?on:off)}} onClick={()=>setTopDown(false)}>🏛 3D Orbit</button>
      <div style={{width:1,height:26,background:'#555',margin:'0 4px'}}/>
      <label style={{display:'flex',alignItems:'center',gap:6}}>
        Ref overlay
        <input type="range" min={0} max={1} step={0.05} value={refOpacity}
          onChange={e=>setRefOpacity(Number(e.target.value))} style={{width:90}} />
        <span style={{minWidth:32,textAlign:'right'}}>{Math.round(refOpacity*100)}%</span>
      </label>
    </div>
  );
}

// ── Camera Controller ──────────────────────────────────────
function CameraController({ topDown }: { topDown: boolean }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!controls) return;
    const ctrl = controls as any;
    
    // Configure buttons based on mode
    if (topDown) {
      ctrl.mouseButtons.LEFT = THREE.MOUSE.PAN;
      ctrl.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
      ctrl.touches.ONE = THREE.TOUCH.PAN;
      
      // Maintain zoom level
      const dist = Math.max(60, camera.position.distanceTo(ctrl.target));
      
      // Move camera directly above the target
      camera.position.set(ctrl.target.x, ctrl.target.y + dist, ctrl.target.z + 0.01);
    } else {
      ctrl.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      ctrl.mouseButtons.RIGHT = THREE.MOUSE.PAN;
      ctrl.touches.ONE = THREE.TOUCH.ROTATE;
      
      const dist = Math.max(60, camera.position.distanceTo(ctrl.target));
      
      // Move camera to a 3D angled view
      camera.position.set(ctrl.target.x - dist * 0.2, ctrl.target.y + dist * 0.6, ctrl.target.z + dist * 0.8);
    }
    
    ctrl.update();
  }, [topDown, controls, camera]);

  return null;
}

// ── Main ───────────────────────────────────────────────────
export default function App() {
  const [refOpacity, setRefOpacity] = useState(0);
  const [topDown, setTopDown] = useState(false);

  return (
    <div style={{width:'100vw', height:'100vh', position:'relative', background:'#111'}}>
      <ReferenceOverlay opacity={refOpacity} />

      <Canvas shadows camera={{position:[-15, 65, 100], fov:38, near:0.5, far:3000}}>
        <CameraController topDown={topDown} />
        <Sky sunPosition={[80,35,60]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[70, 100, 50]} intensity={2.2} castShadow
          shadow-mapSize={[4096,4096]}
          shadow-camera-near={1} shadow-camera-far={600}
          shadow-camera-left={-140} shadow-camera-right={140}
          shadow-camera-top={90}  shadow-camera-bottom={-90}
        />
        <directionalLight position={[-50,40,-40]} intensity={0.35} color="#b0d0ff" />

        {/* Ground must be larger than everything — trees go outside track */}
        <Ground />
        <InnerLawn />
        <OuterTrack />

        {/* Path layout */}
        <MonumentRing />
        <GazeboRing />
        <InternalPaths />

        {/* Structures */}
        <RelaxationArea />
        <Gazebo />
        <CampfireArea cx={C.waterCX} cz={C.waterCZ} />
        <Pergola />
        <PlayArea />
        <GymArea />

        {/* Landscape — trees OUTSIDE track, shrubs/flowers inside */}
        <Landscape />

        {/* Reference grid */}
        <Grid args={[250,250]} cellSize={10} cellThickness={0.25} cellColor="#444"
          sectionSize={50} sectionThickness={0.4} sectionColor="#666"
          fadeDistance={350} fadeStrength={1.2} position={[0,0.01,0]} />

        <OrbitControls makeDefault
          maxPolarAngle={topDown ? 0.005 : Math.PI/2 - 0.02}
          enableRotate={!topDown}
          minDistance={8} maxDistance={400}
          screenSpacePanning={true}
        />
      </Canvas>

      <HUD refOpacity={refOpacity} setRefOpacity={setRefOpacity}
           topDown={topDown} setTopDown={setTopDown} />

      <div style={{
        position:'absolute', top:14, left:16, zIndex:20,
        color:'#4ade80', fontFamily:'monospace', fontSize:14, fontWeight:700,
        background:'rgba(0,0,0,0.55)', padding:'5px 12px', borderRadius:8,
      }}>
        🌿 Park Lab — Phase 5+6 Complete
      </div>
    </div>
  );
}
