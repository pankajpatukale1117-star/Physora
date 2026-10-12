import React from 'react';
import { ArrowRight, FlaskConical, Atom, BookOpen, CheckCircle2, Dna, Lock } from 'lucide-react';
import { HeroLiveSandbox } from './HeroLiveSandbox';
import { useSubscription } from '../context/SubscriptionContext';

interface HeroSectionProps {
  onEnterLabClick: () => void;
  onExploreSimulations: () => void;
  onExploreExperiments: () => void;
  onOpenFormulas: () => void;
  onOpenAnatomy?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterLabClick,
  onExploreSimulations,
  onExploreExperiments,
  onOpenFormulas,
  onOpenAnatomy
}) => {
  const { canAccessAnatomy, triggerPaywall } = useSubscription();
  return (
    <section
      className="hero-section"
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
              <span>RESEARCH-BASED STEM EDUCATION<span className="hide-mobile"> • 100% FREE &amp; ACCESSIBLE</span></span>
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-display hero-main-title"
            style={{
              marginBottom: 16,
              color: 'var(--text-primary)',
              fontSize: 'clamp(1.85rem, 4vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.25
            }}
          >
            Interactive <span style={{ color: 'var(--brand-primary)' }}>Physics</span>, <span style={{ color: '#059669' }}>3D Biology</span> &amp; <span style={{ color: '#D97706' }}>Maths</span>
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
            Engage in research-based science with 76 interactive models across 34 curriculum topics and a full-scale 3D Human Anatomy Explorer.
            Manipulate physical variables, explore 8 anatomical systems with 36+ structures, and connect directly to first principles.
          </p>

          {/* Primary Action Buttons */}
          <div
            className="hero-actions-group"
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
              className="btn btn-lg hero-action-btn"
              style={{
                minWidth: 200,
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
              <span>Explore Simulations</span>
              <ArrowRight size={16} />
            </button>

            {onOpenAnatomy && (
              <button
                onClick={() => {
                  if (!canAccessAnatomy()) {
                    triggerPaywall('anatomy_explorer', 'PRO');
                  } else {
                    onOpenAnatomy();
                  }
                }}
                className="btn btn-lg hero-action-btn"
                style={{
                  minWidth: 200,
                  background: !canAccessAnatomy() ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.12))' : 'rgba(16, 185, 129, 0.15)',
                  border: !canAccessAnatomy() ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                  color: !canAccessAnatomy() ? '#2563EB' : '#059669',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {!canAccessAnatomy() ? <Lock size={17} /> : <Dna size={18} />}
                <span>3D Human Anatomy</span>
                {!canAccessAnatomy() && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: '#2563EB',
                      color: '#FFFFFF'
                    }}
                  >
                    PRO
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onExploreExperiments}
              className="btn btn-secondary btn-lg hero-action-btn"
              style={{ minWidth: 190, borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              <FlaskConical size={18} color="var(--accent-teal)" />
              <span>Virtual Experiments</span>
            </button>

            <button
              onClick={onOpenFormulas}
              className="btn btn-tertiary hero-action-btn"
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
              <span style={{ fontWeight: 600 }}>76 Interactive Models</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>34 Curriculum Topics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>8 Inquiry Experiments</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>36+ 3D Organs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--accent-success)" />
              <span style={{ fontWeight: 600 }}>KaTeX Rigorous Formulations</span>
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
