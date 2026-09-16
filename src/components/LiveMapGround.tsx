import { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

// Exact center coordinates provided by the user
const CENTER_LAT = 15.1574439;
const CENTER_LON = 76.9559703;
const R = 6378137; // Earth's radius in meters

function latLonToMercator(lat: number, lon: number) {
  const x = R * lon * Math.PI / 180;
  const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  return { x, y };
}

function tileToMercatorBounds(tx: number, ty: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const tileSize = (2 * Math.PI * R) / n;

  const left = -Math.PI * R + (tx * tileSize);
  const right = left + tileSize;

  const top = Math.PI * R - (ty * tileSize);
  const bottom = top - tileSize;

  return { left, right, top, bottom, tileSize };
}

interface TileData {
  url: string;
  fallbackUrl: string;
  width: number;
  height: number;
  posX: number;
  posZ: number;
  key: string;
}

function DynamicTileLayer({ 
  zoom, 
  radius, 
  yOffset, 
  renderOrder, 
  groupPos, 
  groupRot, 
  active 
}: { 
  zoom: number, 
  radius: number, 
  yOffset: number, 
  renderOrder: number, 
  groupPos: [number, number, number], 
  groupRot: number, 
  active: boolean 
}) {
  const { camera } = useThree();
  
  // Initialize synchronously to center so first frame renders immediately (no black flash)
  const initialTx = useMemo(() => {
    const centerMerc = latLonToMercator(CENTER_LAT, CENTER_LON);
    const n = Math.pow(2, zoom);
    return Math.floor((centerMerc.x + Math.PI * R) / (2 * Math.PI * R) * n);
  }, [zoom]);

  const initialTy = useMemo(() => {
    const centerMerc = latLonToMercator(CENTER_LAT, CENTER_LON);
    const n = Math.pow(2, zoom);
    return Math.floor((Math.PI * R - centerMerc.y) / (2 * Math.PI * R) * n);
  }, [zoom]);

  const [centerTx, setCenterTx] = useState<number | null>(initialTx);
  const [centerTy, setCenterTy] = useState<number | null>(initialTy);

  useFrame(() => {
    if (!active) return;
    
    // 1. Raycast to find what the camera is looking at on the ground
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const target = new THREE.Vector3();
    
    let intersect = raycaster.ray.intersectPlane(groundPlane, target);
    if (!intersect) {
      // If looking up at the sky, project directly down
      target.copy(camera.position);
      target.y = 0;
    }

    // 2. Convert world target to local group coordinates
    const groupMatrix = new THREE.Matrix4().makeRotationY(groupRot);
    groupMatrix.setPosition(groupPos[0], -0.65 + groupPos[1], groupPos[2]);
    const inverseMatrix = groupMatrix.invert();
    target.applyMatrix4(inverseMatrix);

    // 3. Convert local target to Mercator
    const centerMerc = latLonToMercator(CENTER_LAT, CENTER_LON);
    const scale = Math.cos(CENTER_LAT * Math.PI / 180);
    const mercX = (target.x / scale) + centerMerc.x;
    const mercY = -(target.z / scale) + centerMerc.y;

    // 4. Convert Mercator to tile coordinates
    const n = Math.pow(2, zoom);
    const tx = Math.floor((mercX + Math.PI * R) / (2 * Math.PI * R) * n);
    const ty = Math.floor((Math.PI * R - mercY) / (2 * Math.PI * R) * n);

    if (tx !== centerTx || ty !== centerTy) {
      setCenterTx(tx);
      setCenterTy(ty);
    }
  });

  const tiles = useMemo(() => {
    if (centerTx === null || centerTy === null) return [];
    
    const newTiles: TileData[] = [];
    const centerMerc = latLonToMercator(CENTER_LAT, CENTER_LON);
    const scale = Math.cos(CENTER_LAT * Math.PI / 180);
    const n = Math.pow(2, zoom);

    for (let x = centerTx - radius; x <= centerTx + radius; x++) {
      for (let y = centerTy - radius; y <= centerTy + radius; y++) {
        // Clamp Y to valid tile range (poles)
        if (y < 0 || y >= n) continue;

        // Wrap X for infinite horizontal panning (Globe effect)
        let wrappedX = x % n;
        if (wrappedX < 0) wrappedX += n;

        const bounds = tileToMercatorBounds(x, y, zoom);

        const pLeft = (bounds.left - centerMerc.x) * scale;
        const pRight = (bounds.right - centerMerc.x) * scale;
        const pTop = -(bounds.top - centerMerc.y) * scale;
        const pBottom = -(bounds.bottom - centerMerc.y) * scale;

        const width = Math.abs(pRight - pLeft);
        const height = Math.abs(pBottom - pTop);
        const posX = (pLeft + pRight) / 2;
        const posZ = (pTop + pBottom) / 2;

        const cdnSub = Math.abs(wrappedX + y) % 4;
        const primaryUrl = `https://mt${cdnSub}.google.com/vt/lyrs=y&x=${wrappedX}&y=${y}&z=${zoom}`;
        const fallbackUrl = `/api/tile?x=${wrappedX}&y=${y}&z=${zoom}`;

        newTiles.push({
          url: primaryUrl,
          fallbackUrl,
          width,
          height,
          posX,
          posZ,
          key: `${zoom}-${x}-${y}` // Use unwrapped x to keep distinct physical DOM elements
        });
      }
    }
    return newTiles;
  }, [centerTx, centerTy, zoom, radius]);

  if (!active && tiles.length === 0) return null;

  return (
    <group>
      {tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={yOffset} renderOrder={renderOrder} />)}
    </group>
  );
}

// Reusable texture loader cache to avoid duplicate loads
const textureCache = new Map<string, THREE.Texture>();
const silentManager = new THREE.LoadingManager();
silentManager.onError = () => { };

// Individual Tile Component with smooth mipmapping, zero Z-fighting, and renderOrder sorting
function MapTile({ tile, yOffset, renderOrder = 3 }: { tile: TileData, yOffset: number, renderOrder?: number }) {
  const { invalidate } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(() => textureCache.get(tile.url) || null);

  useEffect(() => {
    if (textureCache.has(tile.url)) {
      setTexture(textureCache.get(tile.url)!);
      return;
    }

    let active = true;
    const loader = new THREE.TextureLoader(silentManager);
    loader.setCrossOrigin('anonymous');

    loader.load(
      tile.url,
      (tex) => {
        if (!active) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        textureCache.set(tile.url, tex);
        setTexture(tex);
        invalidate();
      },
      undefined,
      () => {
        if (!active) return;
        if (tile.fallbackUrl) {
          const fbLoader = new THREE.TextureLoader(silentManager);
          fbLoader.setCrossOrigin('anonymous');
          fbLoader.load(
            tile.fallbackUrl,
            (fbTex) => {
              if (!active) return;
              fbTex.colorSpace = THREE.SRGBColorSpace;
              fbTex.minFilter = THREE.LinearMipmapLinearFilter;
              fbTex.magFilter = THREE.LinearFilter;
              fbTex.generateMipmaps = true;
              textureCache.set(tile.url, fbTex);
              setTexture(fbTex);
              invalidate();
            },
            undefined,
            () => { }
          );
        }
      }
    );

    return () => {
      active = false;
    };
  }, [tile.url, tile.fallbackUrl, invalidate]);

  if (!texture) return null;

  return (
    <mesh
      position={[tile.posX, yOffset, tile.posZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      raycast={() => null}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[tile.width, tile.height]} />
      <meshBasicMaterial map={texture} depthWrite={false} transparent={true} depthTest={true} />
    </mesh>
  );
}

interface LiveMapGroundProps {
  mapType?: 'satellite' | 'dark';
  rotationOffset?: number;
  positionOffset?: [number, number, number];
}

export default function LiveMapGround({
  mapType = 'satellite',
  rotationOffset: initialRot = 0.06150,
  positionOffset: initialPos = [-135.0, 0, 8.0],
}: LiveMapGroundProps) {
  const { invalidate } = useThree();
  const [pos, setPos] = useState(initialPos);
  const [rot, setRot] = useState(initialRot);
  const [showDebug, setShowDebug] = useState(false);

  // Expanded dynamic camera distance tile culling to support massive world view
  type TileBand = 'CLOSE' | 'MEDIUM' | 'FAR' | 'VERY_FAR' | 'REGIONAL' | 'CONTINENTAL' | 'HEMISPHERE' | 'WORLD';
  const [tileBand, setTileBand] = useState<TileBand>('CLOSE');
  const currentBandRef = useRef<TileBand>('CLOSE');

  useFrame(({ camera }) => {
    const dist = camera.position.length();
    let newBand = currentBandRef.current;

    if (dist < 1500) newBand = 'CLOSE';
    else if (dist > 2000 && dist < 4000) newBand = 'MEDIUM';
    else if (dist > 5000 && dist < 15000) newBand = 'FAR';
    else if (dist > 20000 && dist < 60000) newBand = 'VERY_FAR';
    else if (dist > 80000 && dist < 250000) newBand = 'REGIONAL';
    else if (dist > 300000 && dist < 1000000) newBand = 'CONTINENTAL';
    else if (dist > 1500000 && dist < 4000000) newBand = 'HEMISPHERE';
    else if (dist > 5000000) newBand = 'WORLD';

    if (newBand !== currentBandRef.current) {
      currentBandRef.current = newBand;
      setTileBand(newBand);
    }
  });

  // Sync initialPos and initialRot whenever code props change
  useEffect(() => {
    setPos(initialPos);
    setRot(initialRot);
    invalidate();
  }, [initialPos[0], initialPos[1], initialPos[2], initialRot, invalidate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        setShowDebug(prev => !prev);
        return;
      }

      if (!showDebug) return;

      const step = e.shiftKey ? 10 : 1;
      const rotStep = e.shiftKey ? 0.05 : 0.005;

      setPos(p => {
        if (e.key === 'i') return [p[0], p[1], p[2] - step];
        if (e.key === 'k') return [p[0], p[1], p[2] + step];
        if (e.key === 'j') return [p[0] - step, p[1], p[2]];
        if (e.key === 'l') return [p[0] + step, p[1], p[2]];
        return p;
      });

      setRot(r => {
        if (e.key === 'u') return r - rotStep;
        if (e.key === 'o') return r + rotStep;
        return r;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebug]);

  if (mapType === 'dark') {
    return (
      <group position={[pos[0], -0.65 + pos[1], pos[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
          <planeGeometry args={[60000, 60000]} />
          <meshStandardMaterial color="#1a1c1e" roughness={1.0} metalness={0.0} />
        </mesh>
      </group>
    );
  }

  return (
    <group
      position={[pos[0], -0.65 + pos[1], pos[2]]}
      rotation={[0, rot, 0]}
    >
      {showDebug && (
        <Html position={[0, 10, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#f0c010',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            marginTop: '-40vh',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(240, 192, 16, 0.4)'
          }}>
            <b>Map Alignment Tool (Debug)</b><br />
            X: {pos[0].toFixed(1)} | Z: {pos[2].toFixed(1)}<br />
            Rot: {rot.toFixed(4)}<br />
            <small style={{ color: '#aaa' }}>I/J/K/L: Move | U/O: Rotate | Shift+M: Close</small>
          </div>
        </Html>
      )}

      {/* 1. Ground Base Warm Soil Color Plane (Massive backstop to prevent void) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow raycast={() => null} renderOrder={-1}>
        <planeGeometry args={[10000000, 10000000]} />
        <meshBasicMaterial color="#3f4537" depthWrite={false} />
      </mesh>

      {/* --- AUTHORITATIVE LIVE TILE LAYERS --- */}
      
      {/* 9. Live Zoom 3 World layer - ALWAYS ON for ultimate backstop and world map */}
      <DynamicTileLayer zoom={3} radius={4} yOffset={-0.9} renderOrder={-1} groupPos={pos} groupRot={rot} active={true} />

      {/* 8. Live Zoom 5 */}
      <DynamicTileLayer zoom={5} radius={3} yOffset={-0.8} renderOrder={0} groupPos={pos} groupRot={rot} active={true} />

      {/* 7. Live Zoom 7 Continental layer */}
      <DynamicTileLayer zoom={7} radius={3} yOffset={-0.7} renderOrder={1} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM' || tileBand === 'FAR' || tileBand === 'VERY_FAR' || tileBand === 'REGIONAL' || tileBand === 'CONTINENTAL' || tileBand === 'HEMISPHERE'
      } />

      {/* 6. Live Zoom 9 Regional layer */}
      <DynamicTileLayer zoom={9} radius={2} yOffset={-0.6} renderOrder={2} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM' || tileBand === 'FAR' || tileBand === 'VERY_FAR' || tileBand === 'REGIONAL' || tileBand === 'CONTINENTAL'
      } />

      {/* 5. Live Zoom 11 Sub-Regional layer */}
      <DynamicTileLayer zoom={11} radius={2} yOffset={-0.5} renderOrder={3} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM' || tileBand === 'FAR' || tileBand === 'VERY_FAR' || tileBand === 'REGIONAL'
      } />

      {/* 4. Live Zoom 13 Macro layer */}
      <DynamicTileLayer zoom={13} radius={2} yOffset={-0.4} renderOrder={4} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM' || tileBand === 'FAR' || tileBand === 'VERY_FAR'
      } />

      {/* 3. Live Zoom 15 Local layer */}
      <DynamicTileLayer zoom={15} radius={3} yOffset={-0.3} renderOrder={5} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM' || tileBand === 'FAR'
      } />

      {/* 2. Live Zoom 17 Detail layer */}
      <DynamicTileLayer zoom={17} radius={3} yOffset={-0.2} renderOrder={6} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE' || tileBand === 'MEDIUM'
      } />

      {/* 1. Live Zoom 19 Foreground layer (Right under the masterplan plots) */}
      <DynamicTileLayer zoom={19} radius={2} yOffset={-0.1} renderOrder={7} groupPos={pos} groupRot={rot} active={
        tileBand === 'CLOSE'
      } />
    </group>
  );
}
