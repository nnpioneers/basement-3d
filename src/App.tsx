import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import './index.css';

import Scene from './components/Scene';
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage'));

interface LoadingOverlayProps {
  progress: number;
  statusText: string;
  isReady: boolean;
}

function LoadingOverlay({ progress, statusText, isReady }: LoadingOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isReady && progress >= 100) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #181c24 0%, #0d0f12 100%)',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      opacity: isReady && progress >= 100 ? 0 : 1,
      transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: isReady && progress >= 100 ? 'none' : 'auto',
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 44px',
        background: 'rgba(22, 26, 33, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(240, 192, 16, 0.25)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(240, 192, 16, 0.1)',
        width: '400px',
        maxWidth: '85vw',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid rgba(240, 192, 16, 0.15)',
            borderTop: '3px solid #f0c010',
            borderRight: '3px solid #f0c010',
            borderRadius: '50%',
            animation: 'spinRing 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
          }} />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f0c010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>
          3D Real Estate Masterplan
        </h2>

        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '18px', fontWeight: 500 }}>
          {statusText}
        </p>

        {/* Real Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '10px'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f0c010 0%, #ffd700 50%, #f0c010 100%)',
            borderRadius: '10px',
            transition: 'width 0.25s ease-out',
            boxShadow: '0 0 10px rgba(240, 192, 16, 0.5)'
          }} />
        </div>

        <div style={{ fontSize: '11px', fontWeight: 700, color: '#f0c010', letterSpacing: '1px' }}>
          {progress}%
        </div>
        <style>{`
          @keyframes spinRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Masterplan Engine...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleStageChange = useCallback((stage: 'data' | 'compile' | 'ready') => {
    if (stage === 'data') {
      setProgress(45);
      setStatusText('Preparing 201 Plot Geometries & Boundaries...');
    } else if (stage === 'compile') {
      setProgress(80);
      setStatusText('Compiling 3D Materials & WebGL Shaders...');
    } else if (stage === 'ready') {
      setProgress(100);
      setStatusText('Masterplan Ready!');
      setIsReady(true);
    }
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden' }}>
      {!isAdminRoute && (
        <LoadingOverlay progress={progress} statusText={statusText} isReady={isReady} />
      )}
      <Suspense fallback={null}>
        {isAdminRoute ? (
          <AdminDashboardPage />
        ) : (
          <Scene onStageChange={handleStageChange} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
