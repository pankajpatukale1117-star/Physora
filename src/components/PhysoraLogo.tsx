import React from 'react';

interface PhysoraLogoProps {
  variant?: 'mark' | 'full' | 'horizontal';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  showTagline?: boolean;
}

/**
 * Official Physora Brand Logo Component
 * - 'mark': Iconic circular scientific orb emblem (Physics, Chemistry, Maths, Biology)
 * - 'full': Complete official artwork including emblem, geometric PHYSORA typography, and discipline footer
 * - 'horizontal': Emblem paired with stylized PHYSORA brandmark
 */
export const PhysoraLogo: React.FC<PhysoraLogoProps> = ({
  variant = 'horizontal',
  size = 38,
  className = '',
  style = {},
  showTagline = true
}) => {
  if (variant === 'mark') {
    return (
      <div
        className={`physora-logo-mark ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: Math.round(size * 0.22),
          background: '#070B14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0, 119, 200, 0.3)',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          position: 'relative',
          ...style
        }}
      >
        <img
          src="/logo-mark.png"
          alt="Physora Emblem"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="eager"
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`physora-logo-full ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          ...style
        }}
      >
        <img
          src="/logo.png"
          alt="Physora Official Logo — Interactive Science & Mathematics"
          style={{
            maxWidth: '100%',
            width: size * 5.5,
            height: 'auto',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'block'
          }}
          loading="eager"
        />
      </div>
    );
  }

  // 'horizontal' brand lockup
  return (
    <div
      className={`physora-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(size * 0.3),
        ...style
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: Math.round(size * 0.24),
          background: '#070B14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 3px 12px rgba(0, 119, 200, 0.35)',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          flexShrink: 0
        }}
      >
        <img
          src="/logo-mark.png"
          alt="Physora Emblem"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: `${Math.max(1.15, size * 0.038)}rem`,
            fontWeight: 900,
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <span>PHYS</span>
          {/* Stylized O with glowing cyan core dot */}
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>O</span>
            <span
              style={{
                position: 'absolute',
                width: '28%',
                height: '28%',
                borderRadius: '50%',
                background: '#00E5FF',
                boxShadow: '0 0 6px #00E5FF'
              }}
            />
          </span>
          <span>R</span>
          {/* Stylized Caret A */}
          <span style={{ color: '#38BDF8' }}>&#923;</span>
        </div>
        {showTagline && (
          <span
            className="font-mono hide-mobile"
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.07em',
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 2
            }}
          >
            SCIENCE &amp; MATHS LAB
          </span>
        )}
      </div>
    </div>
  );
};
