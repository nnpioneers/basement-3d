import { useState, useEffect, lazy, Suspense } from 'react';
import './index.css';

import Scene from './components/Scene';
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage'));

function LoadingScreen() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #181c24 0%, #0d0f12 100%)',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 44px',
        background: 'rgba(22, 26, 33, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        width: '420px',
        maxWidth: '90vw',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '64px',
          height: '64px',
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f0c010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', marginBottom: '6px' }}>
          3D Real Estate Masterplan
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px' }}>
          Preparing Scene & Interface...
        </p>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #f0c010 0%, #ffd700 50%, #f0c010 100%)',
            borderRadius: '10px',
            animation: 'loadingBar 1.5s ease-in-out infinite',
            transformOrigin: 'left'
          }} />
        </div>
        <style>{`
          @keyframes spinRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes loadingBar { 0% { transform: scaleX(0.1); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(0.95); } }
        `}</style>
      </div>
    </div>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        {isAdminRoute ? (
          <AdminDashboardPage />
        ) : (
          <Scene />
        )}
      </Suspense>
    </div>
  );
}

export default App;
