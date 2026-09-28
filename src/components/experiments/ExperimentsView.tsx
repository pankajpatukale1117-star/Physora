import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { EXPERIMENTS_DATA, type ExperimentItem } from '../../data/experimentsData';
import { ExperimentCanvas } from './ExperimentCanvas';

interface ExperimentsViewProps {
  initialExperimentId?: string | null;
  onBackToSimulations: () => void;
}

interface ExperimentStudioViewProps {
  experiment: ExperimentItem;
  onBack: () => void;
  onSelectExperiment: (id: string) => void;
}

const ExperimentStudioView: React.FC<ExperimentStudioViewProps> = ({
  experiment,
  onBack,
  onSelectExperiment
}) => {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    experiment.controls.forEach(c => {
      initial[c.id] = c.defaultValue;
    });
    return initial;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<Record<string, string>>({});

  const handleParamChange = (id: string, value: number) => {
    setParams(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    const initial: Record<string, number> = {};
    experiment.controls.forEach(c => {
      initial[c.id] = c.defaultValue;
    });
    setParams(initial);
  };

  const discovery = experiment.getDiscovery(params);

  return (
    <div
      className="experiment-studio-container"
      style={{
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '80px',
        background: 'var(--bg-primary)'
      }}
    >
      <div className="section-container" style={{ padding: '0 20px' }}>
        
        {/* Top Bar: Back Button, Tab Selector & Level Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={onBack}
              className="lab-back-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-glass-card)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowLeft size={15} />
              <span>All Experiments</span>
            </button>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(0, 240, 255, 0.12)',
                color: 'var(--electric-blue)',
                border: '1px solid rgba(0, 240, 255, 0.25)'
              }}
            >
              {experiment.level} • {experiment.category}
            </span>
          </div>

          {/* Quick Switch Strip between 6 Experiments */}
          <div
            className="experiment-switcher-strip"
            style={{
              display: 'flex',
              gap: 6,
              padding: '4px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              width: '100%'
            }}
          >
            {EXPERIMENTS_DATA.map(exp => {
              const isCurrent = exp.id === experiment.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => onSelectExperiment(exp.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: isCurrent ? experiment.accentColor : 'transparent',
                    color: isCurrent ? '#FFFFFF' : 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {exp.title.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title & Core Question */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 'clamp(1.05rem, 4.5vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 6,
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {experiment.title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.82rem, 3.2vw, 1.02rem)',
              color: 'var(--electric-blue)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            <Lightbulb size={18} color="var(--electric-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Challenge: {experiment.question}</span>
          </p>
        </div>

        {/* Main Laboratory Layout */}
        <div
          className="experiment-studio-grid"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {/* 1. LARGE DEDICATED SIMULATION CANVAS */}
          <div
            className="experiment-canvas-container"
            style={{
              width: '100%',
              height: 'clamp(360px, 58vh, 520px)',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden'
            }}
          >
            <ExperimentCanvas
              experimentId={experiment.id}
              params={params}
              isPlaying={isPlaying}
              onParamChange={handleParamChange}
              onTelemetryUpdate={setTelemetry}
              controls={experiment.controls}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={handleReset}
              accentColor={experiment.accentColor}
            />
          </div>

          {/* 2. VARIABLES & CONTROLS DOCK (Below the simulation) */}
          <div
            className="experiment-controls-dock"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} color={experiment.accentColor} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Variables &amp; Lab Controls
                </h3>
              </div>

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }} className="hide-mobile">
                Touch or drag sliders to observe live physical changes
              </span>
            </div>

            {/* Sliders Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 16
              }}
            >
              {experiment.controls.map(ctrl => {
                const val = params[ctrl.id] ?? ctrl.defaultValue;
                return (
                  <div
                    key={ctrl.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {ctrl.label}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(0, 240, 255, 0.1)',
                          color: experiment.accentColor
                        }}
                      >
                        {val} {ctrl.unit || ''}
                      </span>
                    </div>

                    {/* Slider Input */}
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={val}
                      onChange={(e) => handleParamChange(ctrl.id, parseFloat(e.target.value))}
                      className="thumb-friendly-slider"
                      style={{
                        width: '100%',
                        height: '8px',
                        cursor: 'pointer',
                        accentColor: experiment.accentColor
                      }}
                    />

                    {/* Presets Chips (if provided) */}
                    {ctrl.presets && ctrl.presets.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {ctrl.presets.map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleParamChange(ctrl.id, preset.value)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-pill)',
                              border: '1px solid var(--border-subtle)',
                              background: val === preset.value ? experiment.accentColor : 'transparent',
                              color: val === preset.value ? '#FFFFFF' : 'var(--text-secondary)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. LIVE RESULTS & TELEMETRY ROW */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 12
            }}
          >
            {experiment.telemetryFields.map(f => (
              <div
                key={f.key}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {f.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: experiment.accentColor
                  }}
                >
                  {telemetry[f.key] || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* 4. "WHAT DID YOU DISCOVER?" DYNAMIC TAKEAWAY CARD */}
          <div
            className="experiment-discovery-card"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0, 240, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--electric-blue)'
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--electric-blue)',
                    letterSpacing: '0.08em'
                  }}
                >
                  LAB OBSERVATION TAKEAWAY
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  What did you discover?
                </h4>
              </div>
            </div>

            {/* Relationship highlight */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.25)',
                borderLeft: `4px solid ${experiment.accentColor}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#FFFFFF'
              }}
            >
              👉 {discovery.relationship}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {discovery.detail}
            </p>

            {discovery.formula && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  alignSelf: 'flex-start',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-glass-card)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  color: experiment.accentColor,
                  fontWeight: 700
                }}
              >
                <span>Governing Formula:</span>
                <strong>{discovery.formula}</strong>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 10
            }}
          >
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-glass-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              <span>Return to Laboratory Cards</span>
            </button>

            <button
              onClick={() => {
                const currentIndex = EXPERIMENTS_DATA.findIndex(e => e.id === experiment.id);
                const nextIndex = (currentIndex + 1) % EXPERIMENTS_DATA.length;
                onSelectExperiment(EXPERIMENTS_DATA[nextIndex].id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: 'linear-gradient(135deg, #0062FF 0%, #00F0FF 100%)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Next Experiment</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  initialExperimentId = null,
  onBackToSimulations
}) => {
  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(initialExperimentId);
  const [filterLevel, setFilterLevel] = useState<'All' | 'Class 9' | 'Class 10' | 'Class 11'>('All');

  // Active experiment item
  const activeExperiment: ExperimentItem | undefined = EXPERIMENTS_DATA.find(
    e => e.id === activeExperimentId
  );

  const filteredExperiments = EXPERIMENTS_DATA.filter(exp => {
    if (filterLevel === 'All') return true;
    return exp.level === filterLevel;
  });

  // =========================================================================
  // VIEW A: DIGITAL EXPERIMENT STUDIO (Active Experiment View)
  // =========================================================================
  if (activeExperiment) {
    return (
      <ExperimentStudioView
        key={activeExperiment.id}
        experiment={activeExperiment}
        onBack={() => setActiveExperimentId(null)}
        onSelectExperiment={setActiveExperimentId}
      />
    );
  }

  // =========================================================================
  // VIEW B: DIGITAL LABORATORY OVERVIEW (Experiment Cards)
  // =========================================================================
  return (
    <div
      className="experiments-page-wrapper"
      style={{
        minHeight: '100vh',
        paddingTop: '90px',
        paddingBottom: '100px',
        background: 'var(--bg-primary)'
      }}
    >
      <div className="section-container" style={{ padding: '0 24px' }}>

        {/* Hero Banner */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 40px' }}>
          
          <div
            className="lab-pill-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: 'var(--electric-blue)',
              fontSize: 'clamp(0.66rem, 2.6vw, 0.78rem)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: 16,
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <FlaskConical size={15} style={{ flexShrink: 0 }} />
            <span>DISCOVERY LABORATORY</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 7vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 14,
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            Experiment. Change. <span className="gradient-text">Discover.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 640,
              margin: '0 auto 24px'
            }}
          >
            Play with variables and see mathematics and physics come to life.
            Change values, observe dynamic effects, and discover the fundamental laws of nature.
          </p>

          {/* Level Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: 6,
              padding: '4px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(['All', 'Class 9', 'Class 10', 'Class 11'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: filterLevel === lvl ? 'var(--electric-blue)' : 'transparent',
                  color: filterLevel === lvl ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {lvl === 'All' ? 'All Experiments' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Experiment Cards Grid */}
        <div
          className="experiments-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 24,
            marginBottom: 60
          }}
        >
          {filteredExperiments.map(exp => (
            <div
              key={exp.id}
              className="experiment-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-glass-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Visual Preview Header */}
              <div
                style={{
                  height: 140,
                  position: 'relative',
                  background: 'radial-gradient(ellipse at 50% 30%, #0F172A 0%, #030712 100%)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative Laboratory Elements based on experiment */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    backgroundImage: 'radial-gradient(#00F0FF 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-lg)',
                    background: `linear-gradient(135deg, ${exp.accentColor}25 0%, ${exp.accentColor}08 100%)`,
                    border: `1px solid ${exp.accentColor}60`,
                    boxShadow: `0 0 24px ${exp.accentColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: exp.accentColor
                  }}
                >
                  <FlaskConical size={32} />
                </div>

                {/* Level Badge in top corner */}
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: exp.accentColor,
                    border: `1px solid ${exp.accentColor}50`
                  }}
                >
                  {exp.level}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 14,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.06em'
                  }}
                >
                  {exp.category.toUpperCase()}
                </span>
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: 12
                }}
              >
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.25
                  }}
                >
                  {exp.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    flex: 1
                  }}
                >
                  {exp.shortDesc}
                </p>

                {/* Variables List */}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Variables: </span>
                  <strong style={{ color: exp.accentColor }}>
                    {exp.controls.map(c => c.label.split(' ')[0]).join(', ')}
                  </strong>
                </div>

                {/* Start Experiment Button */}
                <button
                  onClick={() => setActiveExperimentId(exp.id)}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '11px 18px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: `linear-gradient(135deg, ${exp.accentColor} 0%, #0050D8 100%)`,
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: `0 4px 16px ${exp.accentColor}30`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>Start Experiment</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Switch to Conceptual Curriculum */}
        <div
          style={{
            textAlign: 'center',
            padding: '30px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-subtle)',
            maxWidth: 680,
            margin: '0 auto'
          }}
        >
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Want to learn the core theory step-by-step?
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Visit our 14 comprehensive curriculum topics covering Class 11 and foundational Physics &amp; Mathematics.
          </p>
          <button
            onClick={onBackToSimulations}
            style={{
              padding: '9px 22px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ← View Conceptual Simulations &amp; Curriculum
          </button>
        </div>

      </div>
    </div>
  );
};
