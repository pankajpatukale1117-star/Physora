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
        background: 'var(--bg-primary)'
      }}
    >
      <div className="section-container">
        {/* Top Educational Positioning Header */}
        <div style={{ maxWidth: 840, margin: '0 auto 36px', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', marginBottom: 16 }}>
            <span
              className="badge badge-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                gap: 6
              }}
            >
              <Atom size={14} />
              <span>Physora Science Laboratory • Class 9–11 Foundations</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-display"
            style={{
              marginBottom: 16,
              color: 'var(--text-primary)'
            }}
          >
            Interactive <span style={{ color: 'var(--brand-primary)' }}>Maths &amp; Physics</span>
          </h1>

          {/* Supporting Educational Message */}
          <p
            className="text-body"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 720,
              margin: '0 auto 28px'
            }}
          >
            Explore concepts by changing variables, running experiments, and seeing the mathematics come alive.
            Built on PhET pedagogical inquiry principles with a distraction-free, light-first laboratory.
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
              className="btn btn-primary btn-lg"
              style={{ minWidth: 200 }}
            >
              <Atom size={18} />
              <span>Explore Simulations</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExploreExperiments}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: 200 }}
            >
              <FlaskConical size={18} color="var(--accent-teal)" />
              <span>Explore Experiments</span>
            </button>

            <button
              onClick={onOpenFormulas}
              className="btn btn-tertiary"
              style={{
                gap: 6,
                fontSize: '0.88rem'
              }}
            >
              <BookOpen size={16} />
              <span>Formula Index</span>
            </button>
          </div>

          {/* Trust & Quality Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
              marginTop: 22,
              fontSize: '0.82rem',
              color: 'var(--text-tertiary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="var(--accent-success)" />
              <span>42 Interactive Simulations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="var(--accent-success)" />
              <span>8 Scientific Inquiry Labs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="var(--accent-success)" />
              <span>Rigorous KaTeX Formulations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="var(--accent-success)" />
              <span>100% Free &amp; Open Learning</span>
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
