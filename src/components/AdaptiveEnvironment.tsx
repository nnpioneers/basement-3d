import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function AdaptiveEnvironment({ mapType = 'satellite' }: { mapType?: 'satellite' | 'dark' }) {
  const { scene, gl, invalidate } = useThree();

  useEffect(() => {
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const isSmallScreen = typeof window !== 'undefined' && (window.innerWidth < 800 || window.innerHeight < 600);
    const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    const isMobile = isMobileUA || (isTouchDevice && isSmallScreen);

    // On mobile devices, apply pristine studio environment texture without heavy remote HDR PMREM compute passes
    if (isMobile) {
      const pmremGenerator = new THREE.PMREMGenerator(gl);
      pmremGenerator.compileEquirectangularShader();
      
      const sceneEnv = new THREE.Scene();
      sceneEnv.background = new THREE.Color(mapType === 'satellite' ? 0xdde5ed : 0x181c24);
      const renderTarget = pmremGenerator.fromScene(sceneEnv);
      scene.environment = renderTarget.texture;
      pmremGenerator.dispose();
      invalidate();
      return;
    }

    // High-End / Desktop Devices: Asynchronously load HDR environment map in background without suspending scene
    let isCancelled = false;
    import('three/examples/jsm/loaders/RGBELoader.js').then(({ RGBELoader }) => {
      if (isCancelled) return;
      const loader = new RGBELoader();
      const hdrUrl = 'https://raw.githubusercontent.com/pmndrs/drei-assets/4560657c94f529058b1c53e070d624a9ed55c25a/hdri/city.hdr';
      
      loader.load(
        hdrUrl,
        (hdrTexture) => {
          if (isCancelled) return;
          const pmremGenerator = new THREE.PMREMGenerator(gl);
          pmremGenerator.compileEquirectangularShader();
          const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
          hdrTexture.dispose();
          pmremGenerator.dispose();
          scene.environment = envMap;
          invalidate();
        },
        undefined,
        () => {
          // Silent fallback on network error — keep architectural studio lighting
        }
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [scene, gl, invalidate, mapType]);

  const isSat = mapType === 'satellite';

  return (
    <>
      {/* Pristine 3-Point Architectural Studio Lighting System (Instant 0ms render) */}
      <ambientLight intensity={isSat ? 0.65 : 0.45} />
      <directionalLight
        position={[120, 250, 70]}
        intensity={isSat ? 1.5 : 1.3}
        color="#ffffff"
      />
      {/* Sky fill light from opposite angle */}
      <directionalLight position={[-120, 180, -70]} intensity={isSat ? 0.45 : 0.35} color="#90b8ff" />
      {/* Subtle warm ground bounce */}
      <directionalLight position={[0, -100, 0]} intensity={0.2} color="#d4c5b0" />
    </>
  );
}
