import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LabGatewayCTAProps {
  onEnterLabClick: () => void;
}

export const LabGatewayCTA: React.FC<LabGatewayCTAProps> = ({ onEnterLabClick }) => {
  return (
    <section
      className="cta-section"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '70px 24px 90px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        <div
          className="cta-card"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0B1528 0%, #111E38 60%, #1E1B4B 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '70px 32px',
            textAlign: 'center',
            color: '#FFFFFF',
            overflow: 'hidden',
            boxShadow: '0 20px 50px -10px rgba(0, 98, 255, 0.25)'
          }}
        >
          {/* Subtle Ambient Radial Lighting */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 480,
              height: 480,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 229, 255, 0.18) 0%, rgba(124, 58, 237, 0.12) 60%, transparent 80%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto' }}>
            <div
              className="lab-pill-badge"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#E2E8F0',
                marginBottom: 20
              }}
            >
              <Sparkles size={14} color="#00E5FF" />
              <span>FREE FOR ALL STUDENTS • INTERACTIVE SIMULATIONS</span>
            </div>

            <h2
              className="cta-headline"
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: 16
              }}
            >
              Ready to Understand Maths &amp; Physics Clearly?
            </h2>

            <p
              className="cta-subtitle"
              style={{
                fontSize: '1.05rem',
                color: '#94A3B8',
                lineHeight: 1.6,
                marginBottom: 32
              }}
            >
              Step into the lab and start exploring basic concepts through friendly, visual experiments.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28
              }}
            >
              <button
                onClick={onEnterLabClick}
                className="cta-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 38px',
                  background: '#FFFFFF',
                  color: '#0B1528',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.35)',
                  transition: 'all 0.25s ease'
                }}
              >
                <span>Enter the Lab</span>
                <ArrowRight size={18} color="#0062FF" />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 22,
                fontSize: '0.82rem',
                color: '#94A3B8',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Basic &amp; Clear Lessons</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Runs Smoothly in Any Browser</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Class 11 &amp; Below Friendly</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
