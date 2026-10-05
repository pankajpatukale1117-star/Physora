import React from 'react';
import { ArrowRight, FlaskConical, Atom, BookOpen, CheckCircle2 } from 'lucide-react';
import { HeroLiveSandbox } from './HeroLiveSandbox';

interface HeroSectionProps {
  onEnterLabClick: () => void;
  onExploreSimulations: () => void;
  onExploreExperiments: () => void;
  onOpenFormulas: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterLabClick,
  onExploreSimulations,
  onExploreExperiments,
  onOpenFormulas
}) => {
  return (
    <section
      style={{
        position: 'relative',
        padding: '110px 0 50px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'transparent'
      }}
    >
      <div className="section-container" style={{ position: 'relative' }}>
        {/* Top Educational Positioning Header */}
        <div style={{ maxWidth: 880, margin: '0 auto 36px', textAlign: 'center' }}>
          {/* PhET Institutional Badge */}
          <div style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--phet-blue-soft)',
                color: 'var(--brand-primary)',
                border: '1px solid var(--brand-primary-border)',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}
            >
              <img
                src="/logo-mark.png"
                alt="Physora Emblem"
                style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>RESEARCH-BASED STEM EDUCATION • 100% FREE &amp; ACCESSIBLE</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-display"
            style={{
              marginBottom: 16,
              color: 'var(--text-primary)',
              fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.15
            }}
          >
            Interactive <span style={{ color: 'var(--brand-primary)' }}>Science</span> &amp; <span style={{ color: '#D97706' }}>Maths</span> Simulations
          </h1>

          {/* Supporting Educational Message */}
          <p
            className="text-body"
            style={{
              fontSize: 'clamp(1.02rem, 1.8vw, 1.18rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 740,
              margin: '0 auto 28px'
            }}
          >
            Engage students in physics and mathematics inquiry with 42 interactive, calibrated laboratory models.
            Manipulate physical variables, visualize invisible vectors, and connect directly to formulas.
          </p>

          {/* Primary Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={onExploreSimulations}
              className="btn btn-lg"
              style={{
                minWidth: 210,
                background: '#FF6600',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 4px 14px rgba(255, 102, 0, 0.4)',
                cursor: 'pointer'
              }}
            >
              <Atom size={18} />
              <span>Explore All Simulations</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExploreExperiments}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: 200, borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              <FlaskConical size={18} color="var(--accent-teal)" />
              <span>Virtual Experiments</span>
            </button>

            <button
              onClick={onOpenFormulas}
              className="btn btn-tertiary"
              style={{
                gap: 6,
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              <BookOpen size={16} />
              <span>Formula Bank</span>
            </button>
          </div>

          {/* Trust & Quality Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              flexWrap: 'wrap',
              marginTop: 24,
              fontSize: '0.82rem',
              color: 'var(--text-tertiary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>42 Simulations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>8 Inquiry Experiments</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>KaTeX Rigorous Formulations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>Zero Ads / Open Source</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Physics Laboratory Sandbox */}
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <HeroLiveSandbox onOpenFullLab={onEnterLabClick} />
        </div>
      </div>
    </section>
  );
};
