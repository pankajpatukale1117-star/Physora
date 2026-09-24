import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Compass } from 'lucide-react';

interface HeroSectionProps {
  onEnterLabClick: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterLabClick,
  onExploreClick
}) => {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 5,
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 70px',
        pointerEvents: 'none'
      }}
    >
      <div
        className="section-container"
        style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto'
        }}
      >
        {/* Top Tag Badge */}
        <div style={{ marginBottom: 24 }}>
          <div className="lab-pill-badge">
            <Sparkles size={14} className="badge-spark" />
            <span>Interactive Learning for Class 11 &amp; Below</span>
            <span className="badge-ver">Basic &amp; Clear</span>
          </div>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)',
            marginBottom: 22
          }}
        >
          See Mathematics.<br />
          <span className="gradient-text">Feel Physics.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1.15rem, 2.2vw, 1.35rem)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            maxWidth: 640,
            marginBottom: 36
          }}
        >
          Learn basic Maths and Physics through simple interactive simulations.
        </p>

        {/* Primary CTA Button: Enter the Lab */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 44
          }}
        >
          <button
            onClick={onEnterLabClick}
            className="btn-primary-lab"
            id="heroEnterLabBtn"
          >
            <span className="btn-shine"></span>
            <span>Enter the Lab</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreClick}
            className="btn-secondary-lab"
            id="heroExploreBtn"
          >
            <BookOpen size={16} color="#0062FF" />
            <span>Preview Topics</span>
          </button>
        </div>

        {/* Simple Educational Value Pillars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            padding: '10px 26px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={14} color="#0062FF" />
            <span>Visual Concept Models</span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
            <span>No Complex University Math</span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#7C3AED', fontWeight: 700 }}>★</span>
            <span>Made for School &amp; Class 11</span>
          </div>
        </div>

      </div>
    </section>
  );
};
