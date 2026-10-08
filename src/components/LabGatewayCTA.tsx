import React from 'react';
import { ArrowRight, Atom, CheckCircle2 } from 'lucide-react';

interface LabGatewayCTAProps {
  onEnterLabClick: () => void;
}

export const LabGatewayCTA: React.FC<LabGatewayCTAProps> = ({ onEnterLabClick }) => {
  return (
    <section
      style={{
        padding: '60px 0 80px',
        background: 'transparent'
      }}
    >
      <div className="section-container">
        <div
          className="scientific-card"
          style={{
            padding: '50px 32px',
            textAlign: 'center',
            background: 'var(--brand-primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: 16
              }}
            >
              <Atom size={14} />
              <span>Free, Open &amp; Non-Commercial Educational Platform</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginBottom: 14,
                color: '#FFFFFF'
              }}
            >
              Start Exploring the STEM Virtual Laboratory
            </h2>

            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                marginBottom: 28
              }}
            >
              Step into the interactive simulator. Adjust variables, run dynamic experiments, and
              build genuine intuition across 76 precision simulations and 3D human anatomy.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24
              }}
            >
              <button
                onClick={onEnterLabClick}
                className="btn btn-secondary btn-lg"
                style={{
                  background: '#FFFFFF',
                  color: 'var(--brand-primary)',
                  borderColor: '#FFFFFF',
                  fontWeight: 750,
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>Launch Interactive Laboratory</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.85)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} />
                <span>Zero Account Required</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} />
                <span>Works on All Devices</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} />
                <span>Class 9–11 Aligned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
