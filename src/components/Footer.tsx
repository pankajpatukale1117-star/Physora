import React from 'react';
import { Atom } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 5,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '54px 24px 32px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 36,
            marginBottom: 40
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
                  background: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <Atom size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Phys<span style={{ color: 'var(--brand-primary)' }}>ora</span>
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              A distraction-free, light-first interactive laboratory designed for Class 9–11 students to explore fundamental mathematics and physics concepts through inquiry.
            </p>
          </div>

          {/* Mathematics Links */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Mathematics Curriculum
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Algebra &amp; Equations</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Trigonometry &amp; Unit Circle</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Coordinate Geometry</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Functions &amp; Graphs</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Sequences &amp; Progressions</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Calculus &amp; Slopes</span></li>
            </ul>
          </div>

          {/* Physics Links */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Physics Curriculum
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Units &amp; Dimensions</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Kinematics &amp; Velocity</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Newton's Laws of Motion</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Work, Energy &amp; Power</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Gravitation &amp; Orbits</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Waves &amp; Sound</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Geometric &amp; Wave Optics</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Thermodynamics &amp; Heat</span></li>
            </ul>
          </div>

          {/* Creator & Platform Info */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              About Physora
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
              Crafted by <strong style={{ color: 'var(--text-primary)' }}>Pankaj</strong> to give every student free access to intuitive, rigorous visual models and scientific inquiry tools.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                className="badge badge-primary font-mono"
                style={{ fontSize: '0.72rem' }}
              >
                42 Active Simulations
              </span>
              <span
                className="badge font-mono"
                style={{
                  fontSize: '0.72rem',
                  background: 'var(--accent-teal-soft)',
                  color: 'var(--accent-teal)',
                  borderColor: 'rgba(13, 148, 136, 0.25)'
                }}
              >
                8 Inquiry Labs
              </span>
              <span
                className="badge font-mono"
                style={{ fontSize: '0.72rem' }}
              >
                Crafted by Pankaj
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
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)'
          }}
        >
          <p>© 2026 Physora by Pankaj. Science &amp; Mathematics Visual Laboratory.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>PhET Educational Principles Benchmark</span>
            <span>Open Access STEM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
