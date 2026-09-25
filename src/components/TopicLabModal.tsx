import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Lightbulb, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Award } from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { QUIZ_DATA } from '../data/quizData';
import { CanvasSimulator } from './simulations/CanvasSimulators';

interface TopicLabModalProps {
  topicId: string | null;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

interface NumericControlItemProps {
  control: {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit?: string;
  };
  value: number;
  onChange: (val: number) => void;
  accentColor: string;
}

const NumericControlItem: React.FC<NumericControlItemProps> = ({
  control,
  value,
  onChange,
  accentColor
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const [textValue, setTextValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    if (!isFocused) {
      setTextValue(String(value));
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(textValue);
    if (isNaN(parsed)) {
      setTextValue(String(control.defaultValue));
      onChange(control.defaultValue);
    } else {
      const clamped = Math.min(control.max, Math.max(control.min, parsed));
      setTextValue(String(clamped));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTextValue(String(val));
    onChange(val);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {control.label}
        </span>

        {/* Interactive Numeric Input Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            min={control.min}
            max={control.max}
            step={control.step}
            value={textValue}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            title={`Click to type number (${control.min} to ${control.max})`}
            className="control-number-badge-input font-mono"
            style={{
              width: '74px',
              padding: '3px 6px',
              textAlign: 'right',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: accentColor,
              background: 'var(--bg-tertiary)',
              border: isFocused ? `1.5px solid ${accentColor}` : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              boxShadow: isFocused ? `0 0 0 3px ${accentColor}25` : 'none',
              transition: 'all 0.15s ease'
            }}
          />
          {control.unit && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                minWidth: '22px'
              }}
            >
              {control.unit}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={handleSliderChange}
        className="card-range-slider"
        style={{ width: '100%', cursor: 'pointer', accentColor }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-tertiary)' }}>
        <span>Min: {control.min}</span>
        <span>Max: {control.max}</span>
      </div>
    </div>
  );
};

export const TopicLabModal: React.FC<TopicLabModalProps> = ({
  topicId,
  onClose,
  onSelectTopic
}) => {
  const [activeSimIndex, setActiveSimIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [params, setParams] = useState<Record<string, number>>({});
  const [telemetry, setTelemetry] = useState<Record<string, string>>({});
  const [sideTab, setSideTab] = useState<'intuition' | 'formulas' | 'quiz'>('intuition');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const [prevTopicId, setPrevTopicId] = useState(topicId);
  const [prevSimId, setPrevSimId] = useState<string | null>(null);

  const topic = topicId ? TOPICS_DATA[topicId] : null;
  const currentSim = topic ? topic.simulations[activeSimIndex] || topic.simulations[0] : null;

  // Reset active simulation index when topic changes
  if (topicId !== prevTopicId) {
    setPrevTopicId(topicId);
    setActiveSimIndex(0);
  }

  // Initialize parameters when simulation changes
  if (currentSim && currentSim.id !== prevSimId) {
    setPrevSimId(currentSim.id);
    const initialParams: Record<string, number> = {};
    currentSim.controls.forEach(ctrl => {
      initialParams[ctrl.id] = ctrl.defaultValue;
    });
    setParams(initialParams);
    setIsPlaying(true);
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!topic || !currentSim) return null;

  const topicQuiz = QUIZ_DATA[topic.id] || [];
  const correctCount = topicQuiz.filter(q => userAnswers[q.id] === q.correctIndex).length;

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
                  <NumericControlItem
                    key={ctrl.id}
                    control={ctrl}
                    value={params[ctrl.id] ?? ctrl.defaultValue}
                    onChange={(val) => handleControlChange(ctrl.id, val)}
                    accentColor={accentColor}
                  />
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

          {/* RIGHT: Clear Topic Explanation & Practice Workbench */}
          <div
            style={{
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              overflowY: 'auto',
              background: 'var(--bg-secondary)'
            }}
          >
            {/* Step Workflow Navigation Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px',
                background: 'var(--bg-glass-card)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                onClick={() => setSideTab('intuition')}
                className={`step-workflow-tab ${sideTab === 'intuition' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Lightbulb size={14} />
                <span>Intuition</span>
              </button>
              <button
                onClick={() => setSideTab('formulas')}
                className={`step-workflow-tab ${sideTab === 'formulas' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <BookOpen size={14} />
                <span>Equations</span>
              </button>
              <button
                onClick={() => setSideTab('quiz')}
                className={`step-workflow-tab ${sideTab === 'quiz' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <HelpCircle size={14} />
                <span>Quiz</span>
                {topicQuiz.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: sideTab === 'quiz' ? 'rgba(255,255,255,0.25)' : 'var(--electric-blue-soft)',
                      color: sideTab === 'quiz' ? '#FFFFFF' : 'var(--electric-blue)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 800
                    }}
                  >
                    {topicQuiz.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: INTUITION */}
            {sideTab === 'intuition' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* 1. Core Intuition */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Lightbulb size={17} color="#F59E0B" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
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
                    background: 'var(--bg-glass-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    border: '1px solid var(--border-subtle)',
                    borderLeftColor: accentColor,
                    borderLeftWidth: '3px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <BookOpen size={14} color={accentColor} />
                    <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>
                      EVERYDAY EXAMPLE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {topic.realWorldExample}
                  </p>
                </div>

                {/* 3. Student Takeaways */}
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                    QUICK SUMMARY FOR CLASS 11
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {topic.keyTakeaways.map((point, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem' }}>
                        <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EQUATIONS */}
            {sideTab === 'formulas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    MATHEMATICAL DERIVATIONS &amp; FORMULAS
                  </h4>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    SI Standard
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topic.keyFormulas.map((f, i) => (
                    <div
                      key={i}
                      className="formula-card"
                      style={{ padding: '12px 16px' }}
                    >
                      <div
                        className="font-math"
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginBottom: 4,
                          textAlign: 'center',
                          padding: '6px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {f.formula}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {f.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: QUIZ (physora.org inspired interactive question bench) */}
            {sideTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={16} color="#F59E0B" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      CONCEPT CHECK
                    </h4>
                  </div>
                  {topicQuiz.length > 0 && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--electric-blue)',
                        background: 'var(--electric-blue-soft)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    >
                      Score: {correctCount}/{topicQuiz.length}
                    </span>
                  )}
                </div>

                {topicQuiz.length === 0 ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Practice questions coming soon for this topic!
                  </p>
                ) : (
                  topicQuiz.map((q, qIndex) => {
                    const selectedOpt = userAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;
                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '14px 16px',
                          background: 'var(--bg-glass-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <span className="font-mono" style={{ color: accentColor, marginRight: 6 }}>
                            Q{qIndex + 1}.
                          </span>
                          {q.question}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {q.options.map((opt, optIdx) => {
                            let btnClass = 'quiz-option-btn';
                            if (isAnswered) {
                              if (optIdx === q.correctIndex) btnClass += ' correct';
                              else if (optIdx === selectedOpt) btnClass += ' wrong';
                            }
                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                className={btnClass}
                              >
                                <span className="font-mono" style={{ width: 22, fontWeight: 700, fontSize: '0.8rem' }}>
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box upon answering */}
                        {isAnswered && (
                          <div
                            style={{
                              marginTop: 4,
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: selectedOpt === q.correctIndex ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              borderLeft: `3px solid ${selectedOpt === q.correctIndex ? '#10B981' : '#EF4444'}`,
                              fontSize: '0.8rem',
                              lineHeight: 1.45,
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <strong style={{ color: selectedOpt === q.correctIndex ? '#10B981' : '#EF4444' }}>
                              {selectedOpt === q.correctIndex ? '✓ Correct! ' : '✗ Incorrect. '}
                            </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

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
                {topic.simulations.length} Simulations available
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
                  background: 'var(--bg-glass-card)',
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
