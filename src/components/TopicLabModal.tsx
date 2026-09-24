import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Lightbulb, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { CanvasSimulator } from './simulations/CanvasSimulators';

interface TopicLabModalProps {
  topicId: string | null;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const TopicLabModal: React.FC<TopicLabModalProps> = ({
  topicId,
  onClose,
  onSelectTopic
}) => {
  const [activeSimIndex, setActiveSimIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [params, setParams] = useState<Record<string, number>>({});
  const [telemetry, setTelemetry] = useState<Record<string, string>>({});

  const topic = topicId ? TOPICS_DATA[topicId] : null;
  const currentSim = topic ? topic.simulations[activeSimIndex] || topic.simulations[0] : null;

  // Initialize parameters when simulation changes
  useEffect(() => {
    if (currentSim) {
      const initialParams: Record<string, number> = {};
      currentSim.controls.forEach(ctrl => {
        initialParams[ctrl.id] = ctrl.defaultValue;
      });
      setParams(initialParams);
      setIsPlaying(true);
    }
  }, [currentSim]);

  // Reset active simulation index when topic changes
  useEffect(() => {
    setActiveSimIndex(0);
  }, [topicId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!topic || !currentSim) return null;

  const handleControlChange = (id: string, val: number) => {
    setParams(prev => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    const initialParams: Record<string, number> = {};
    currentSim.controls.forEach(ctrl => {
      initialParams[ctrl.id] = ctrl.defaultValue;
    });
    setParams(initialParams);
  };

  const isMath = topic.subject === 'maths';
  const accentColor = isMath ? 'var(--electric-violet)' : 'var(--electric-blue)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 1140,
          maxHeight: '92vh',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: '0 25px 60px -10px rgba(0, 98, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'rgba(248, 250, 252, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="font-mono"
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: accentColor,
                background: `${accentColor}15`,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.06em'
              }}
            >
              {topic.category}
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {topic.title}
            </h2>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              &bull; Class 11 &amp; Below
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick Topic Switcher Dropdown */}
            <select
              value={topic.id}
              onChange={(e) => onSelectTopic(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                background: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <optgroup label="Mathematics">
                <option value="algebra">Algebra</option>
                <option value="trigonometry">Trigonometry</option>
                <option value="coordinate_geometry">Coordinate Geometry</option>
                <option value="functions">Functions</option>
                <option value="sequences">Sequences</option>
                <option value="basic_calculus">Basic Calculus</option>
              </optgroup>
              <optgroup label="Physics">
                <option value="units_dimensions">Units &amp; Dimensions</option>
                <option value="motion">Motion</option>
                <option value="newtons_laws">Newton's Laws</option>
                <option value="work_energy_power">Work, Energy &amp; Power</option>
                <option value="gravitation">Gravitation</option>
                <option value="waves">Waves</option>
              </optgroup>
            </select>

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: '#FFFFFF',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body (2 Columns: Simulation Workbench on Left, Concept Guide on Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.45fr 1fr',
            flex: 1,
            overflowY: 'auto'
          }}
          className="modal-content-grid"
        >
          {/* LEFT: Simulation Workbench */}
          <div
            style={{
              padding: '24px',
              borderRight: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              background: '#FAFCFF'
            }}
          >
            {/* Simulation Tabs (2 to 3 distinct simulations per topic) */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: 4,
                  background: 'rgba(241, 245, 249, 0.8)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)',
                  overflowX: 'auto'
                }}
              >
                {topic.simulations.map((sim, idx) => {
                  const isActive = idx === activeSimIndex;
                  return (
                    <button
                      key={sim.id}
                      onClick={() => setActiveSimIndex(idx)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        background: isActive ? '#FFFFFF' : 'transparent',
                        color: isActive ? accentColor : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Sim {idx + 1}: {sim.name}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 10 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {currentSim.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {currentSim.tagline}
                </p>
              </div>
            </div>

            {/* Interactive Simulation Canvas Box */}
            <div
              style={{
                width: '100%',
                height: 330,
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                marginBottom: 16
              }}
            >
              <CanvasSimulator
                simId={currentSim.id}
                params={params}
                isPlaying={isPlaying}
                onTelemetryUpdate={setTelemetry}
              />
            </div>

            {/* Live Telemetry Chips */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 16
              }}
            >
              {currentSim.telemetryLabels.map(tLabel => (
                <div
                  key={tLabel.key}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span style={{ color: 'var(--text-tertiary)', marginRight: 6 }}>{tLabel.label}:</span>
                  <strong style={{ color: accentColor }}>{telemetry[tLabel.key] || '—'}</strong>
                </div>
              ))}
            </div>

            {/* Interactive Sliders & Play/Reset Dock */}
            <div
              style={{
                padding: '16px',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginTop: 'auto'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: currentSim.controls.length > 2 ? '1fr 1fr' : '1fr',
                  gap: 12,
                  marginBottom: 14
                }}
              >
                {currentSim.controls.map(ctrl => (
                  <div key={ctrl.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{ctrl.label}</span>
                      <strong className="font-mono" style={{ color: accentColor }}>
                        {params[ctrl.id] ?? ctrl.defaultValue} {ctrl.unit || ''}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={params[ctrl.id] ?? ctrl.defaultValue}
                      onChange={(e) => handleControlChange(ctrl.id, Number(e.target.value))}
                      className="card-range-slider"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>

              {/* Simulation Controls Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: accentColor,
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: '#FFFFFF',
                      color: 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Drag sliders to update live simulation
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Clear Topic Explanation Guide */}
          <div
            style={{
              padding: '26px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              overflowY: 'auto'
            }}
          >
            {/* 1. Core Intuition */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Lightbulb size={18} color="#F59E0B" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  THE CORE INTUITION
                </h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {topic.conceptIntro}
              </p>
            </div>

            {/* 2. Real-World Analogy */}
            <div
              style={{
                background: 'rgba(248, 250, 252, 0.9)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                borderLeft: `3px solid ${accentColor}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <BookOpen size={15} color={accentColor} />
                <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>
                  EVERYDAY EXAMPLE
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {topic.realWorldExample}
              </p>
            </div>

            {/* 3. Essential Formulas */}
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                KEY FORMULAS &amp; DEFINITIONS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topic.keyFormulas.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div
                      className="font-math"
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}
                    >
                      {f.formula}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      {f.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Student Takeaways */}
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                QUICK SUMMARY FOR CLASS 11
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topic.keyTakeaways.map((point, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem' }}>
                    <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Simulation prompt */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {topic.simulations.length} Different Simulations for {topic.title}
              </span>
              <button
                onClick={() => setActiveSimIndex((activeSimIndex + 1) % topic.simulations.length)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  color: accentColor,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Next Sim</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
