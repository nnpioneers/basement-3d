import React, { useState } from 'react';
import type { PlotStatus } from '../types/plot';

interface ProjectHUDProps {
  is3D: boolean;
  onToggle3D: (val: boolean) => void;
  mapType: 'satellite' | 'dark';
  onToggleMapType: (type: 'satellite' | 'dark') => void;
  onResetView: () => void;
  onSearchPlot?: (plotNumber: number) => void;
  selectedPlotId: number | null;
  selectedPlotStatus?: PlotStatus;
  onResetHeading?: () => void;
}

export default function ProjectHUD({
  is3D,
  onToggle3D,
  mapType,
  onToggleMapType,
  onResetView,
  onSearchPlot,
  selectedPlotId,
  selectedPlotStatus = 'available',
  onResetHeading,
}: ProjectHUDProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchQuery.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0 && num <= 201) {
      onSearchPlot?.(num);
      setSearchQuery('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <>
      {/* Top Left: Live Rotating 3D Compass */}
      <div
        className="hud-top-left"
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 100,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={onResetHeading}
          title="Click to orient North"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(18, 20, 24, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            id="compass-needle"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '24px',
              height: '24px',
              position: 'relative',
            }}
          >
            {/* North Red Needle */}
            <div style={{
              width: '0',
              height: '0',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '12px solid #ff4d4f',
              position: 'absolute',
              top: '0',
            }} />
            {/* South White Needle */}
            <div style={{
              width: '0',
              height: '0',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '12px solid #e0e0e0',
              position: 'absolute',
              bottom: '0',
            }} />
            {/* N Label */}
            <span style={{
              position: 'absolute',
              top: '-8px',
              fontSize: '9px',
              fontWeight: '900',
              color: '#ff4d4f',
            }}>
              N
            </span>
          </div>
        </button>
      </div>

      {/* Top Right: Modern 2D / 3D Segmented Control, Map Switcher & Fullscreen */}
      <div
        className="hud-top-right"
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
        }}
      >
        {/* Modern 2D / 3D Segmented Floating Control */}
        <div
          className="hud-view-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(18, 22, 28, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '4px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <button
            type="button"
            onClick={() => onToggle3D(true)}
            aria-label="Switch to 3D View"
            aria-pressed={is3D}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '48px',
              padding: '0 18px',
              borderRadius: '16px',
              border: 'none',
              background: is3D ? '#2196F3' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: is3D ? 1 : 0.75,
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: is3D ? '0 4px 14px rgba(33, 150, 243, 0.4)' : 'none',
              touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: '16px' }}>🧭</span>
            <span>3D</span>
          </button>

          <button
            type="button"
            onClick={() => onToggle3D(false)}
            aria-label="Switch to 2D View"
            aria-pressed={!is3D}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '48px',
              padding: '0 18px',
              borderRadius: '16px',
              border: 'none',
              background: !is3D ? '#2196F3' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: !is3D ? 1 : 0.75,
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: !is3D ? '0 4px 14px rgba(33, 150, 243, 0.4)' : 'none',
              touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: '16px' }}>🗺️</span>
            <span>2D</span>
          </button>
        </div>

        {/* Satellite / Dark Blueprint Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(18, 20, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        }}>
          <button
            className="hud-mode-btn"
            onClick={() => onToggleMapType('satellite')}
            style={{
              padding: '0 14px',
              background: mapType === 'satellite' ? '#2196F3' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 250ms ease',
              minHeight: '48px',
            }}
          >
            <span>🛰️</span> <span className="mode-label">Satellite</span>
          </button>
          <button
            className="hud-mode-btn"
            onClick={() => onToggleMapType('dark')}
            style={{
              padding: '0 14px',
              background: mapType === 'dark' ? '#2196F3' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 250ms ease',
              minHeight: '48px',
            }}
          >
            <span>🌙</span> <span className="mode-label">Blueprint</span>
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          className="hud-fullscreen-btn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'rgba(18, 20, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          {isFullscreen ? '⤢' : '⤡'}
        </button>
      </div>

      {/* Selected Plot Floating Pill (When a plot is clicked) */}
      {selectedPlotId && (
        <div
          className="hud-selected-pill"
          style={{
            position: 'absolute',
            top: '84px',
            left: '24px',
            background: selectedPlotStatus === 'sold' ? 'rgba(140, 58, 58, 0.92)' : 'rgba(0, 82, 204, 0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>📍 Plot {selectedPlotId.toString().padStart(3, '0')}</span>
          <span style={{
            background: selectedPlotStatus === 'sold' ? '#ff4d4f' : '#52c41a',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {selectedPlotStatus === 'sold' ? 'SOLD' : 'AVAILABLE'}
          </span>
        </div>
      )}

      {/* Bottom Main HUD Bar */}
      <div
        className="hud-bottom-bar"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
          maxWidth: '92vw',
        }}
      >
        <div
          className="hud-controls-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(18, 20, 24, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '8px 14px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Search Plot Form */}
          <form className="hud-search-form" onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className="hud-search-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '44px',
              }}
            >
              <span style={{ fontSize: '14px', marginRight: '6px', color: '#aaa' }}>🔍</span>
              <input
                className="hud-search-input"
                type="text"
                placeholder="Search Plot (e.g. 050)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '130px',
                  fontWeight: '500',
                }}
              />
            </div>
          </form>

          {/* GPS Coordinates Button */}
          <a
            className="hud-btn"
            href="https://maps.app.goo.gl/m21jrhUbL5cu1hhi7"
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{
              padding: '0 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#e0e0e0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'background 0.2s',
              minHeight: '44px',
            }}
          >
            <span>📍</span> GPS
          </a>

          {/* Info Button */}
          <button
            className="hud-btn"
            onClick={() => setShowInfo(!showInfo)}
            style={{
              padding: '0 14px',
              background: showInfo ? '#2196F3' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s',
              minHeight: '44px',
            }}
          >
            <span>ℹ️</span> Info
          </button>

          {/* Locate / Recenter Button */}
          <button
            className="hud-btn"
            onClick={onResetView}
            title="Locate & Recenter Master Layout"
            style={{
              padding: '0 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s',
              minHeight: '44px',
            }}
          >
            <span>🎯</span> Locate
          </button>

          {/* Park Lab Button */}
          <button
            className="hud-btn"
            onClick={() => {
              window.history.pushState({}, '', '/park-lab');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            title="Open Park Lab 3D View"
            style={{
              padding: '0 14px',
              background: 'rgba(52, 199, 89, 0.15)',
              color: '#34c759',
              border: '1px solid rgba(52, 199, 89, 0.35)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              minHeight: '44px',
            }}
          >
            <span>🌳</span> Park Lab
          </button>
        </div>
      </div>

      {/* Info Modal Dialog */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(18, 22, 28, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '24px',
          width: '380px',
          maxWidth: '92vw',
          maxHeight: '85vh',
          overflowY: 'auto',
          color: '#fff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px', color: '#2196F3' }}>📍</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Master Plan Overview</h3>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#d0d0d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#888' }}>Total Plots</span>
              <span style={{ fontWeight: '700', color: '#52c41a' }}>201 Residential Plots</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#888' }}>Coordinates</span>
              <span style={{ fontWeight: '600', color: '#fff' }}>15°09'26.8"N 76°57'21.5"E</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#888' }}>Standard Plot Area</span>
              <span style={{ fontWeight: '600', color: '#fff' }}>180 m² (1,937.5 ft²)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: '#888' }}>Amenities</span>
              <span style={{ fontWeight: '600', color: '#40a9ff' }}>Grand Gate, Clock Tower, Parks, CA Site, STP</span>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/m21jrhUbL5cu1hhi7"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '20px',
              padding: '12px 16px',
              background: '#2196F3',
              color: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '13px',
            }}
          >
            Open Live Location in Google Maps ↗
          </a>
        </div>
      )}
    </>
  );
}
