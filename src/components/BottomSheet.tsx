import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Sliders, Activity } from 'lucide-react';

export interface BottomSheetProps {
  snap: 'peek' | 'half' | 'expanded';
  onSnapChange: (snap: 'peek' | 'half' | 'expanded') => void;
  title?: string;
  badgeCount?: number;
  accentColor?: string;
  telemetrySection?: React.ReactNode;
  peekExtra?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  snap,
  onSnapChange,
  title = 'Controls & Telemetry',
  badgeCount,
  accentColor = '#00F0FF',
  telemetrySection,
  peekExtra,
  children,
  footerActions,
  className = ''
}) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY; // positive = dragging up, negative = dragging down

    if (deltaY > 35) {
      // Dragged up
      if (snap === 'peek') onSnapChange('half');
      else if (snap === 'half') onSnapChange('expanded');
      setTouchStartY(null);
    } else if (deltaY < -35) {
      // Dragged down
      if (snap === 'expanded') onSnapChange('half');
      else if (snap === 'half') onSnapChange('peek');
      setTouchStartY(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const handleHeaderClick = () => {
    if (snap === 'peek') onSnapChange('half');
    else if (snap === 'half') onSnapChange('expanded');
    else onSnapChange('peek');
  };

  const snapHeight = snap === 'peek' ? '56px' : snap === 'half' ? '46vh' : '82vh';

  return (
    <>
      {/* Translucent Backdrop: 1 tap collapses sheet back to peek so user instantly regains full canvas view */}
      {snap !== 'peek' && (
        <div
          onClick={() => onSnapChange('peek')}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 115,
            animation: 'physoraFadeIn 0.2s ease'
          }}
          aria-label="Tap to minimize controls sheet"
        />
      )}

      <div
        className={`mobile-bottom-sheet-container ${className}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: snapHeight,
          zIndex: 120,
          background: 'rgba(11, 17, 32, 0.92)',
          borderTop: '1.5px solid rgba(255, 255, 255, 0.16)',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 240, 255, 0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
      >
        {/* Drag Handle Bar and Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleHeaderClick}
          style={{
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: snap === 'peek' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          {/* Physical Grab Handle Pill */}
          <div
            style={{
              width: 48,
              height: 5,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.45)',
              marginBottom: 7,
              transition: 'background 0.2s ease'
            }}
          />

          {/* Title and Chevron Row */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)' }}>
              <Sliders size={15} color={accentColor} />
              <span>{title}</span>
              {badgeCount !== undefined && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: accentColor,
                    background: 'rgba(0, 240, 255, 0.14)',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-pill, 9999px)'
                  }}
                >
                  {badgeCount}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.66rem',
                  color: 'var(--text-tertiary, #94a3b8)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                • {snap === 'peek' ? 'Tap to open' : snap}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {peekExtra && snap === 'peek' && (
                <div onClick={(e) => e.stopPropagation()}>{peekExtra}</div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary, #cbd5e1)'
                }}
              >
                {snap === 'peek' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
          </div>
        </div>

        {/* Sheet Body: Telemetry and Controls */}
        {snap !== 'peek' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 16px calc(36px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Live Telemetry Section (if provided) */}
            {telemetrySection && (
              <div
                className="bottom-sheet-telemetry-dock"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <Activity size={13} />
                  <span>Live Physical Telemetry</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 6px #38BDF8' }} />
                </div>
                {telemetrySection}
              </div>
            )}

            {/* Stepper Sliders / Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {children}
            </div>

            {/* Footer Actions */}
            {footerActions && (
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {footerActions}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
