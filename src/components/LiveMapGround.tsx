import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

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

function getTileGrid(centerLat: number, centerLon: number, zoom: number, gridRadius: number) {
  const n = Math.pow(2, zoom);
  const centerTx = (centerLon + 180) / 360 * n;
  const latRad = centerLat * Math.PI / 180;
  const centerTy = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  
  const cx = Math.floor(centerTx);
  const cy = Math.floor(centerTy);
  
  const centerMerc = latLonToMercator(centerLat, centerLon);
  const scale = Math.cos(centerLat * Math.PI / 180);
  
  const tiles: TileData[] = [];
  for (let x = cx - gridRadius; x <= cx + gridRadius; x++) {
    for (let y = cy - gridRadius; y <= cy + gridRadius; y++) {
      const bounds = tileToMercatorBounds(x, y, zoom);
      
      const pLeft = (bounds.left - centerMerc.x) * scale;
      const pRight = (bounds.right - centerMerc.x) * scale;
      const pTop = -(bounds.top - centerMerc.y) * scale;
      const pBottom = -(bounds.bottom - centerMerc.y) * scale;
      
      const width = Math.abs(pRight - pLeft);
      const height = Math.abs(pBottom - pTop);
      const posX = (pLeft + pRight) / 2;
      const posZ = (pTop + pBottom) / 2;
      
      tiles.push({
        url: `/api/tile?x=${x}&y=${y}&z=${zoom}`,
        width,
        height,
        posX,
        posZ,
        key: `${zoom}-${x}-${y}`
      });
    }
  }
  return tiles;
}

interface TileData {
  url: string;
  width: number;
  height: number;
  posX: number;
  posZ: number;
  key: string;
}

// Reusable texture loader cache to avoid duplicate loads
const textureCache = new Map<string, THREE.Texture>();
const silentManager = new THREE.LoadingManager();
silentManager.onError = () => {};

// Individual Tile Component that loads its texture asynchronously
function MapTile({ tile, yOffset }: { tile: TileData, yOffset: number }) {
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
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        textureCache.set(tile.url, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback silently if tile fails to load
      }
    );
    return () => {
      active = false;
    };
  }, [tile.url]);

  return (
    <mesh position={[tile.posX, yOffset, tile.posZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[tile.width, tile.height]} />
      {texture ? (
        <meshBasicMaterial map={texture} depthWrite={true} />
      ) : (
        <meshBasicMaterial color="#2d3035" depthWrite={true} />
      )}
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
  positionOffset: initialPos = [-115.5, 0, 28.0],
}: LiveMapGroundProps) {
  const [pos, setPos] = useState(initialPos);
  const [rot, setRot] = useState(initialRot);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press Shift + M to toggle alignment debug tool
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40000, 40000]} />
          <meshStandardMaterial color="#1a1c1e" roughness={1.0} metalness={0.0} />
        </mesh>
      </group>
    );
  }

  // Generate Tile Grids with optimized radii for fast load times
  const z19Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 19, 3), []);
  const z17Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 17, 3), []);
  const z15Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 15, 3), []);

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
            <b>Map Alignment Tool (Debug)</b><br/>
            X: {pos[0].toFixed(1)} | Z: {pos[2].toFixed(1)}<br/>
            Rot: {rot.toFixed(4)}<br/>
            <small style={{ color: '#aaa' }}>I/J/K/L: Move | U/O: Rotate | Shift+M: Close</small>
          </div>
        </Html>
      )}

      {/* Ground Base Color Plane (Immediate visibility before tiles finish loading) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[30000, 30000]} />
        <meshBasicMaterial color="#2d3035" depthWrite={false} />
      </mesh>

      {/* Zoom 15 Background layer */}
      <group>
        {z15Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={-2.0} />)}
      </group>
      
      {/* Zoom 17 Midground layer */}
      <group>
        {z17Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={-1.0} />)}
      </group>

      {/* Zoom 19 Foreground layer (Right under the plots) */}
      <group>
        {z19Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={0} />)}
      </group>
    </group>
  );
}
