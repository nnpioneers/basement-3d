import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

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

      const cdnSub = Math.abs(x + y) % 4;
      // Direct Google Maps Satellite CDN URL (CORS-enabled globally)
      const primaryUrl = `https://mt${cdnSub}.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`;
      const fallbackUrl = `/api/tile?x=${x}&y=${y}&z=${zoom}`;

      tiles.push({
        url: primaryUrl,
        fallbackUrl,
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

// Reusable texture loader cache to avoid duplicate loads
const textureCache = new Map<string, THREE.Texture>();
const silentManager = new THREE.LoadingManager();
silentManager.onError = () => { };

// Individual Tile Component that loads its texture asynchronously with CDN fallback and R3F invalidate()
function MapTile({ tile, yOffset }: { tile: TileData, yOffset: number }) {
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
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
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
              fbTex.minFilter = THREE.LinearFilter;
              fbTex.magFilter = THREE.LinearFilter;
              fbTex.generateMipmaps = false;
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

  // DO NOT RENDER ANYTHING IF TEXTURE IS NOT LOADED YET!
  // This allows baseTexture and extendedTexture to show through cleanly without black rectangular blocks!
  if (!texture) return null;

  return (
    <mesh position={[tile.posX, yOffset, tile.posZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
      <planeGeometry args={[tile.width, tile.height]} />
      <meshBasicMaterial map={texture} depthWrite={true} />
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
  positionOffset: initialPos = [-120.0, 0, 10.0],
}: LiveMapGroundProps) {
  const { invalidate } = useThree();
  const [pos, setPos] = useState(initialPos);
  const [rot, setRot] = useState(initialRot);
  const [showDebug, setShowDebug] = useState(false);
  const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);
  const [extendedTexture, setExtendedTexture] = useState<THREE.Texture | null>(null);

  // Load local high-res satellite webp files as immediate 100% reliable ground layer
  useEffect(() => {
    if (mapType === 'dark') return;

    const loader = new THREE.TextureLoader(silentManager);
    loader.load('/satellite_map.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      setBaseTexture(tex);
      invalidate();
    });

    loader.load('/extended_satellite_map.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      setExtendedTexture(tex);
      invalidate();
    });
  }, [mapType, invalidate]);

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

  // Multi-scale live tile hierarchy
  const z19Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 19, 4), []);
  const z17Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 17, 5), []);
  const z15Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 15, 5), []);
  const z13Tiles = useMemo(() => getTileGrid(CENTER_LAT, CENTER_LON, 13, 5), []);

  // Exact mathematically calibrated ground scaling (1.088 = 1365px / 1254.2m)
  const scaleX = 1.088;
  const scaleY = 1.088;
  const groundWidth = 1254.2 * scaleX;
  const groundHeight = 1254.2 * scaleY;
  const extendedGroundWidth = (153 / 17) * 1254.2 * scaleX;
  const extendedGroundHeight = (153 / 17) * 1254.2 * scaleY;

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

      {/* 1. Ground Base Warm Soil Color Plane (60km radius natural earth color underneath) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[60000, 60000]} />
        <meshBasicMaterial color="#3f4537" depthWrite={false} />
      </mesh>

      {/* 2. Extended ~11.2km Local Satellite Map Plane (Instant guaranteed local imagery) */}
      {extendedTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow raycast={() => null}>
          <planeGeometry args={[extendedGroundWidth, extendedGroundHeight]} />
          <meshBasicMaterial map={extendedTexture} depthWrite={true} />
        </mesh>
      )}

      {/* 3. Site Core High-Resolution Aerial Satellite Map Plane */}
      {baseTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow raycast={() => null}>
          <planeGeometry args={[groundWidth, groundHeight]} />
          <meshBasicMaterial map={baseTexture} depthWrite={true} />
        </mesh>
      )}

      {/* 4. Live Zoom 13 Macro layer (~54km wide coverage) */}
      <group>
        {z13Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={-1.5} />)}
      </group>

      {/* 5. Live Zoom 15 Regional layer (~13.5km wide coverage) */}
      <group>
        {z15Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={-1.0} />)}
      </group>

      {/* 6. Live Zoom 17 Local layer (~3.4km wide coverage) */}
      <group>
        {z17Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={-0.5} />)}
      </group>

      {/* 7. Live Zoom 19 Foreground layer (Right under the masterplan plots) */}
      <group>
        {z19Tiles.map(tile => <MapTile key={tile.key} tile={tile} yOffset={0} />)}
      </group>
    </group>
  );
}
