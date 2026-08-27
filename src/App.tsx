import { useState, useEffect, lazy, Suspense } from 'react';
import './index.css';

const Scene = lazy(() => import('./components/Scene'));
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage'));

function LoadingScreen() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121418', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #f0c010', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
        <p>Loading 3D Environment...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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


