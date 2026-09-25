import React from 'react';
import { Atom } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 5,
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        padding: '60px 24px 32px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 44
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 98, 255, 0.15)',
                  border: '1px solid rgba(0, 98, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Atom size={20} color="#0062FF" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Phys<span className="gradient-text">ora</span>
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              A friendly visual learning laboratory designed for students in Class 11 and below to explore fundamental Maths and Physics.
            </p>
          </div>

          {/* Mathematics Links */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Mathematics (Basic)
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Algebra &amp; Equations</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Trigonometry &amp; Angles</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Coordinate Geometry</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Functions &amp; Graphs</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Sequences &amp; Series</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Basic Calculus (Slopes)</span></li>
            </ul>
          </div>

          {/* Physics Links */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Physics (Basic)
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Units &amp; Dimensions</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Motion &amp; Velocity</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Newton's Laws of Motion</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Work, Energy &amp; Power</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Gravitation &amp; Orbits</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Waves &amp; Sound</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Optics &amp; Light</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Thermodynamics &amp; Heat</span></li>
            </ul>
          </div>

          {/* Lab Info */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              About the Creator
            </h5>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
              Created by <strong style={{ color: 'var(--text-primary)' }}>Pankaj</strong> to empower students with intuitive visual models for fundamental mathematical principles and real-world physical laws.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--electric-blue)',
                  background: 'rgba(0, 98, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}
              >
                42 Active Simulations
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  color: '#7C3AED',
                  background: 'rgba(124, 58, 237, 0.08)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}
              >
                By Pankaj
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 22,
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <p>© 2026 Physora by Pankaj. Precision visual learning for Class 11 and below.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ color: 'var(--electric-blue)', fontWeight: 600 }}>Physora Laboratory</span>
            <span>Created by Pankaj</span>
            <span>Open Access Education</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
