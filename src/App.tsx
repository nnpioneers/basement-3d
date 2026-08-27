import { useState, useEffect } from 'react';
import Scene from './components/Scene';
import AdminDashboardPage from './components/AdminDashboardPage';
import './index.css';

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
      {isAdminRoute ? (
        <AdminDashboardPage />
      ) : (
        <Scene />
      )}
    </div>
  );
}

export default App;


