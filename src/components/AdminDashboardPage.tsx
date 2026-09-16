import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, checkIsAdmin, fetchPlotStatuses, updatePlotStatus } from '../services/supabase';
import type { PlotStatusMap, PlotStatus } from '../types/plot';
import type { User } from '@supabase/supabase-js';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Plot management state
  const [plotStatuses, setPlotStatuses] = useState<PlotStatusMap>({});
  const [selectedPlotId, setSelectedPlotId] = useState<number>(15);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold'>('all');

  // Check session and admin status on mount
  useEffect(() => {
    async function initAuth() {
      if (!supabase) {
        setCheckingAuth(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const adminCheck = await checkIsAdmin(currentUser.id);
        setIsAdmin(adminCheck);
      } else {
        setIsAdmin(null);
      }
      setCheckingAuth(false);

      // Listen to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        if (newUser) {
          const adminCheck = await checkIsAdmin(newUser.id);
          setIsAdmin(adminCheck);
        } else {
          setIsAdmin(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();
  }, []);

  // Fetch plot statuses when authorized
  const loadStatuses = async () => {
    const data = await fetchPlotStatuses();
    setPlotStatuses(data);
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadStatuses();
    }
  }, [user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase client is not configured.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    if (data.user) {
      setUser(data.user);
      const adminCheck = await checkIsAdmin(data.user.id);
      setIsAdmin(adminCheck);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(null);
  };

  const handleStatusChange = async (targetId: number, newStatus: PlotStatus) => {
    setUpdateLoading(true);
    setFeedback(null);

    const result = await updatePlotStatus(targetId, newStatus);
    if (result.success) {
      setFeedback({
        type: 'success',
        text: `Plot ${targetId.toString().padStart(3, '0')} successfully updated to ${newStatus.toUpperCase()}.`,
      });
      // Optimistically update state and reload from DB
      setPlotStatuses((prev) => ({ ...prev, [targetId]: newStatus }));
      await loadStatuses();
    } else {
      setFeedback({
        type: 'error',
        text: result.error || 'Failed to update plot status.',
      });
    }
    setUpdateLoading(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 12px 0', color: '#ff4d4f' }}>⚠️ Supabase Not Configured</h2>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
            Please ensure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> are configured in <code>.env.local</code>.
          </p>
          <a href="/" style={buttonLinkStyle}>Return to Public Map</a>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div style={containerStyle}>
        <div style={{ color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="spinner" style={spinnerStyle} /> Checking authentication & authorization...
        </div>
      </div>
    );
  }

  // State 1: Unauthenticated -> Login Screen
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
              🔒 Admin Login
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
              Master Layout Real-Estate Admin Control Panel
            </p>
          </div>

          {authError && (
            <div style={errorBannerStyle}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{ ...primaryButtonStyle, opacity: authLoading ? 0.6 : 1 }}
            >
              {authLoading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <a href="/" style={{ color: '#1890ff', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
              ← Return to Public 3D Map
            </a>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Authenticated but NOT authorized in public.admin_users
  if (isAdmin === false) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, maxWidth: '520px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#ff4d4f', fontSize: '20px', fontWeight: '800' }}>
            ⛔ Access Denied
          </h2>
          <p style={{ color: '#d0d0d0', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            Your account (<strong>{user.email}</strong>) is authenticated, but is not authorized as an admin in the <code>public.admin_users</code> table.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#aaa', margin: '0 0 20px 0' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>To Grant Admin Access:</strong>
            Run this query in Supabase SQL Editor:
            <pre style={{ background: '#111', padding: '8px', borderRadius: '6px', overflowX: 'auto', color: '#52c41a', margin: '8px 0 0 0' }}>
              {`INSERT INTO public.admin_users (user_id)\nVALUES ('${user.id}')\nON CONFLICT DO NOTHING;`}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSignOut} style={secondaryButtonStyle}>
              Sign Out
            </button>
            <a href="/" style={buttonLinkStyle}>
              View Public 3D Map
            </a>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated AND Authorized -> Full Admin Dashboard
  const selectedPlotNumberStr = selectedPlotId.toString().padStart(3, '0');
  const currentStatus = plotStatuses[selectedPlotId] || 'available';

  // Stats
  const totalPlots = 201;
  const soldCount = Object.values(plotStatuses).filter((s) => s === 'sold').length;
  const availableCount = totalPlots - soldCount;

  // Filtered list for quick management
  const filteredPlotIds = Array.from({ length: 201 }, (_, i) => i + 1).filter((id) => {
    const pNum = id.toString().padStart(3, '0');
    const status = plotStatuses[id] || 'available';
    const matchesText = pNum.includes(filterText) || id.toString().includes(filterText);
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesText && matchesStatus;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f1115', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Admin Navbar */}
      <header
        className="admin-header"
        style={{
          background: 'rgba(18, 22, 28, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🏗️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              Master Layout Admin Dashboard
            </h1>
            <span style={{ fontSize: '12px', color: '#888' }}>
              Plot Status Management & Realtime Sync
            </span>
          </div>
        </div>

        <div className="admin-user-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/"
            style={{
              color: '#1890ff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(24, 144, 255, 0.1)',
              border: '1px solid rgba(24, 144, 255, 0.2)',
              minHeight: '38px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            🗺️ View Public 3D Map
          </a>
          <div style={{ fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤 {user.email}</span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                minHeight: '36px',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px' }}>
        {/* Top Summary Cards */}
        <div className="admin-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={summaryCardStyle}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>TOTAL PLOTS</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>201</span>
          </div>
          <div style={summaryCardStyle}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>AVAILABLE PLOTS</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#52c41a', marginTop: '4px' }}>{availableCount}</span>
          </div>
          <div style={summaryCardStyle}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>SOLD PLOTS</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#ff4d4f', marginTop: '4px' }}>{soldCount}</span>
          </div>
        </div>

        {/* Selected Plot Control Panel */}
        <div style={{
          background: 'rgba(18, 22, 28, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📍</span> Plot Status Management Panel
          </h2>

          {feedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              background: feedback.type === 'success' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(255, 77, 79, 0.15)',
              border: `1px solid ${feedback.type === 'success' ? '#52c41a' : '#ff4d4f'}`,
              color: feedback.type === 'success' ? '#52c41a' : '#ff4d4f',
            }}>
              {feedback.text}
            </div>
          )}

          <div className="admin-control-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center' }}>
            {/* Plot Selection Box */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Select Plot Number (001 - 201)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedPlotId}
                  onChange={(e) => {
                    setSelectedPlotId(Number(e.target.value));
                    setFeedback(null);
                  }}
                  style={{
                    ...inputStyle,
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {Array.from({ length: 201 }, (_, i) => i + 1).map((id) => (
                    <option key={id} value={id} style={{ background: '#181b20', color: '#fff' }}>
                      Plot {id.toString().padStart(3, '0')} ({plotStatuses[id] || 'available'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Plot Actions */}
            <div className="admin-action-box" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Target Plot
                </span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '2px 0 4px 0' }}>
                  Plot {selectedPlotNumberStr}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Current Status:</span>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: currentStatus === 'sold' ? 'rgba(255, 77, 79, 0.2)' : 'rgba(82, 196, 26, 0.2)',
                    color: currentStatus === 'sold' ? '#ff4d4f' : '#52c41a',
                    border: `1px solid ${currentStatus === 'sold' ? '#ff4d4f' : '#52c41a'}`,
                  }}>
                    {currentStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-action-buttons" style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleStatusChange(selectedPlotId, 'sold')}
                  disabled={updateLoading || currentStatus === 'sold'}
                  style={{
                    padding: '12px 18px',
                    background: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: updateLoading || currentStatus === 'sold' ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    opacity: updateLoading || currentStatus === 'sold' ? 0.4 : 1,
                    transition: 'all 0.2s',
                    minHeight: '44px',
                    boxShadow: currentStatus !== 'sold' ? '0 4px 12px rgba(255, 77, 79, 0.4)' : 'none',
                  }}
                >
                  Mark as SOLD
                </button>

                <button
                  onClick={() => handleStatusChange(selectedPlotId, 'available')}
                  disabled={updateLoading || currentStatus === 'available'}
                  style={{
                    padding: '12px 18px',
                    background: '#52c41a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: updateLoading || currentStatus === 'available' ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    opacity: updateLoading || currentStatus === 'available' ? 0.4 : 1,
                    transition: 'all 0.2s',
                    minHeight: '44px',
                    boxShadow: currentStatus !== 'available' ? '0 4px 12px rgba(82, 196, 26, 0.4)' : 'none',
                  }}
                >
                  Mark as AVAILABLE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* All Plots Master Table Grid */}
        <div style={{
          background: 'rgba(18, 22, 28, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              Master Plot Availability Directory (201 Plots)
            </h3>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search plot #..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ ...inputStyle, width: '150px', padding: '6px 12px', fontSize: '13px' }}
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={{ ...inputStyle, width: '130px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="all" style={{ background: '#181b20' }}>All Statuses</option>
                <option value="available" style={{ background: '#181b20' }}>Available Only</option>
                <option value="sold" style={{ background: '#181b20' }}>Sold Only</option>
              </select>
            </div>
          </div>

          {/* Grid View */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
            maxHeight: '480px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}>
            {filteredPlotIds.map((id) => {
              const status = plotStatuses[id] || 'available';
              const pNum = id.toString().padStart(3, '0');
              const isSelected = selectedPlotId === id;

              return (
                <div
                  key={id}
                  onClick={() => {
                    setSelectedPlotId(id);
                    setFeedback(null);
                  }}
                  style={{
                    background: isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? '#1890ff' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#1890ff' : '#ffffff' }}>
                    Plot {pNum}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlotId(id);
                      handleStatusChange(id, status === 'available' ? 'sold' : 'available');
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      background: status === 'sold' ? '#ff4d4f' : '#52c41a',
                      color: '#ffffff',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {status}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

// Styling Constants
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  background: '#0c0e12',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '20px',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(18, 22, 28, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  padding: '36px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
  color: '#ffffff',
};

const summaryCardStyle: React.CSSProperties = {
  background: 'rgba(18, 22, 28, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '14px',
  padding: '18px 22px',
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#aaa',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: '#1890ff',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '14px',
  cursor: 'pointer',
  marginTop: '8px',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  borderRadius: '10px',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer',
};

const buttonLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  background: '#1890ff',
  color: '#ffffff',
  borderRadius: '10px',
  fontWeight: '600',
  fontSize: '13px',
  textDecoration: 'none',
  textAlign: 'center',
};

const errorBannerStyle: React.CSSProperties = {
  background: 'rgba(255, 77, 79, 0.15)',
  border: '1px solid #ff4d4f',
  color: '#ff4d4f',
  padding: '10px 14px',
  borderRadius: '10px',
  fontSize: '13px',
  marginBottom: '16px',
  fontWeight: '600',
};

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#1890ff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};
