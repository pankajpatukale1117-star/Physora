import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Lightbulb,
  ChevronRight,
  ClipboardList,
  PlusCircle,
  Trash2,
  Download,
  CheckCircle2,
  Wrench,
  Variable
} from 'lucide-react';
import {
  EXPERIMENTS_DATA,
  type ExperimentItem,
  type LabDomain
} from '../../data/experimentsData';
import { ExperimentCanvas } from './ExperimentCanvas';
import { MathView } from '../MathView';

interface ExperimentsViewProps {
  initialExperimentId?: string | null;
  onBackToSimulations: () => void;
}

interface ExperimentStudioViewProps {
  experiment: ExperimentItem;
  onBack: () => void;
  onSelectExperiment: (id: string) => void;
}

interface LabTrialRecord {
  id: number;
  timestamp: string;
  independentVal: string;
  dependentMeasured: string;
  theoreticalVal: string;
  variance: string;
}

const NumericControlBadge: React.FC<{
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  accentColor: string;
  onChange: (val: number) => void;
}> = ({ min, max, step, value, unit, accentColor, onChange }) => {
  const [prevVal, setPrevVal] = useState(value);
  const [text, setText] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  if (value !== prevVal) {
    setPrevVal(value);
    if (!isEditing) {
      setText(String(value));
    }
  }

  const commit = () => {
    setIsEditing(false);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setText(String(clamped));
    } else {
      setText(String(value));
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={text}
        onFocus={() => setIsEditing(true)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        onChange={(e) => {
          setText(e.target.value);
          const p = parseFloat(e.target.value);
          if (!isNaN(p)) {
            onChange(p);
          }
        }}
        className="font-mono"
        style={{
          width: '74px',
          padding: '2px 8px',
          textAlign: 'right',
          fontSize: '0.84rem',
          fontWeight: 700,
          color: '#FFFFFF',
          background: 'rgba(0, 0, 0, 0.45)',
          border: isEditing ? `1.5px solid ${accentColor}` : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          boxShadow: isEditing ? `0 0 0 2px ${accentColor}40` : 'none',
          transition: 'all 0.15s ease'
        }}
      />
      {unit && (
        <span
          className="font-mono"
          style={{
            fontSize: '0.78rem',
            color: accentColor,
            fontWeight: 700
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
};

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
  const [trials, setTrials] = useState<LabTrialRecord[]>([]);
  const [showLogFeedback, setShowLogFeedback] = useState<boolean>(false);

  // Scroll to top immediately when an experiment studio loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [experiment.id]);

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

  // Record an observation into the digital lab notebook
  const handleRecordTrial = () => {
    const trialData = experiment.getTrialData(params, telemetry);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newRecord: LabTrialRecord = {
      id: trials.length + 1,
      timestamp: timeStr,
      independentVal: trialData.independentVal,
      dependentMeasured: trialData.dependentMeasured,
      theoreticalVal: trialData.theoreticalVal,
      variance: trialData.variance
    };

    setTrials(prev => [newRecord, ...prev]);
    setShowLogFeedback(true);
    setTimeout(() => setShowLogFeedback(false), 2000);
  };

  const handleClearTrials = () => {
    setTrials([]);
  };

  const handleExportCSV = () => {
    if (trials.length === 0) return;
    const headers = ['Trial #', 'Timestamp', 'Independent Variable', 'Measured Output', 'Theoretical Expectation', 'Variance'];
    const rows = trials.map(t => [
      t.id,
      t.timestamp,
      `"${t.independentVal}"`,
      `"${t.dependentMeasured}"`,
      `"${t.theoreticalVal}"`,
      `"${t.variance}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${experiment.id}_lab_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const discovery = experiment.getDiscovery(params);

  return (
    <div
      className="experiment-studio-container"
      style={{
        minHeight: '100vh',
        paddingTop: '96px',
        paddingBottom: '80px',
        background: 'var(--bg-primary)'
      }}
    >
      <div className="section-container" style={{ padding: '0 20px', maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Top Header Bar: Back Button, Domain Badge & Quick Lab Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20
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
                padding: '8px 16px',
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
              <span>All Laboratory Investigations</span>
            </button>

            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(0, 240, 255, 0.12)',
                color: 'var(--electric-blue)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                letterSpacing: '0.04em'
              }}
            >
              🔬 {experiment.domain.toUpperCase()}
            </span>
          </div>

          {/* Quick Switch Strip between 8 Experiments */}
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
              maxWidth: '100%'
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

        {/* Experiment Title & Challenge */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 'clamp(1.2rem, 4vw, 2.3rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: 8,
              color: 'var(--text-primary)',
              wordBreak: 'break-word'
            }}
          >
            {experiment.title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
              color: 'var(--electric-blue)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              wordBreak: 'break-word'
            }}
          >
            <Lightbulb size={18} color="var(--electric-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Investigation Question: {experiment.question}</span>
          </p>
        </div>

        {/* Laboratory Protocol & Variables Specification Card */}
        <div
          className="lab-protocol-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Col 1: Objective & Hypothesis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--electric-blue)' }}>
              <FlaskConical size={16} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em' }}>RESEARCH OBJECTIVE &amp; HYPOTHESIS</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
              <strong>Objective:</strong> {experiment.objective}
            </p>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              <em>Hypothesis:</em> {experiment.hypothesis}
            </p>
          </div>

          {/* Col 2: Variables Setup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981' }}>
              <Variable size={16} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em' }}>EXPERIMENTAL VARIABLES</span>
            </div>
            <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong style={{ color: '#10B981' }}>Independent (Manipulated):</strong> {experiment.variables.independent}</div>
              <div><strong style={{ color: '#38BDF8' }}>Dependent (Measured):</strong> {experiment.variables.dependent}</div>
              <div><strong style={{ color: '#F59E0B' }}>Controlled:</strong> {experiment.variables.controlled}</div>
            </div>
          </div>

          {/* Col 3: Laboratory Apparatus */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#C084FC' }}>
              <Wrench size={16} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em' }}>LABORATORY APPARATUS</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {experiment.apparatus.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
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
          {/* 1. LARGE DEDICATED EXPERIMENT CANVAS */}
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

          {/* 2. WORKBENCH CONTROLS DOCK (Below simulation canvas) */}
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
                  Experimental Parameters &amp; Controls
                </h3>
              </div>

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }} className="hide-mobile">
                Manipulate independent variables via slider or direct numerical typing
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
                    className="control-card"
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10
                      }}
                    >
                      <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ctrl.label}
                      </label>
                      <NumericControlBadge
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={val}
                        unit={ctrl.unit}
                        accentColor={experiment.accentColor}
                        onChange={(newV) => handleParamChange(ctrl.id, newV)}
                      />
                    </div>

                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={val}
                      onChange={(e) => handleParamChange(ctrl.id, parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        accentColor: experiment.accentColor
                      }}
                    />

                    {/* Preset buttons */}
                    {ctrl.presets && ctrl.presets.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {ctrl.presets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleParamChange(ctrl.id, preset.value)}
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              border: val === preset.value
                                ? `1px solid ${experiment.accentColor}`
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              background: val === preset.value
                                ? `${experiment.accentColor}25`
                                : 'rgba(255, 255, 255, 0.04)',
                              color: val === preset.value ? '#FFFFFF' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: val === preset.value ? 700 : 500,
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

          {/* 3. DIGITAL LABORATORY NOTEBOOK: OBSERVATION TABLE & DATA LOGGER */}
          <div
            className="experiment-notebook-dock"
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
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={18} color="#10B981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Laboratory Notebook &amp; Observation Table
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 700
                  }}
                >
                  {trials.length} {trials.length === 1 ? 'Trial Logged' : 'Trials Logged'}
                </span>
              </div>

              {/* Action Buttons for Lab Notebook */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={handleRecordTrial}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: showLogFeedback
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #0062FF 0%, #00F0FF 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 240, 255, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {showLogFeedback ? <CheckCircle2 size={15} /> : <PlusCircle size={15} />}
                  <span>{showLogFeedback ? 'Observation Logged!' : 'Record Trial Observation'}</span>
                </button>

                {trials.length > 0 && (
                  <>
                    <button
                      onClick={handleExportCSV}
                      title="Export CSV"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-subtle)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} />
                      <span className="hide-mobile">CSV</span>
                    </button>

                    <button
                      onClick={handleClearTrials}
                      title="Clear Table"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      <span className="hide-mobile">Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Observation Table */}
            {trials.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.84rem'
                }}
              >
                No experimental observations recorded yet. Adjust the workbench controls above and click{' '}
                <strong style={{ color: 'var(--electric-blue)' }}>"Record Trial Observation"</strong> to log data points for verification.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.82rem',
                    textAlign: 'left'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <th style={{ padding: '8px 12px' }}>Trial #</th>
                      <th style={{ padding: '8px 12px' }}>Time</th>
                      <th style={{ padding: '8px 12px' }}>Independent Variable</th>
                      <th style={{ padding: '8px 12px' }}>Measured Output</th>
                      <th style={{ padding: '8px 12px' }}>Theoretical Expectation</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trials.map((t) => (
                      <tr
                        key={t.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          #{t.id}
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                          {t.timestamp}
                        </td>
                        <td style={{ padding: '8px 12px', color: experiment.accentColor }}>
                          {t.independentVal}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#FFFFFF' }}>
                          {t.dependentMeasured}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#10B981' }}>
                          {t.theoreticalVal}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.72rem',
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Verified ({t.variance})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. SCIENTIFIC LAW VERIFICATION & MATHEMATICAL DISCOVERY */}
          <div
            className="experiment-discovery-dock"
            style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(0, 98, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: `1px solid ${experiment.accentColor}35`,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color={experiment.accentColor} />
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
                  EMPIRICAL LAW VERIFICATION
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {discovery.headline}
                </h4>
              </div>
            </div>

            {/* Relationship highlight */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.35)',
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
                <span>Governing Law:</span>
                <MathView math={discovery.formula} />
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
              <span>Next Laboratory Investigation</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  initialExperimentId = null
}) => {
  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(initialExperimentId);
  const [selectedDomain, setSelectedDomain] = useState<'All' | LabDomain>('All');

  // Ensure scroll is instantly at top whenever switching views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeExperimentId]);

  // Active experiment item
  const activeExperiment: ExperimentItem | undefined = EXPERIMENTS_DATA.find(
    e => e.id === activeExperimentId
  );

  const filteredExperiments = EXPERIMENTS_DATA.filter(exp => {
    if (selectedDomain === 'All') return true;
    return exp.domain === selectedDomain;
  });

  const availableDomains: ('All' | LabDomain)[] = [
    'All',
    'Mechanics & Dynamics',
    'Optics & Refraction',
    'Energy & Work',
    'Elasticity & Springs',
    'Wave Physics',
    'Vectors & Equilibrium',
    'Gravity & Free Fall'
  ];

  // =========================================================================
  // VIEW A: DIGITAL EXPERIMENT STUDIO (Active Laboratory Investigation)
  // =========================================================================
  if (activeExperiment) {
    return (
      <ExperimentStudioView
        key={activeExperiment.id}
        experiment={activeExperiment}
        onBack={() => {
          setActiveExperimentId(null);
          window.location.hash = '#experiments';
        }}
        onSelectExperiment={(id) => {
          setActiveExperimentId(id);
          window.location.hash = `#experiments/${id}`;
        }}
      />
    );
  }

  // =========================================================================
  // VIEW B: DIGITAL LABORATORY OVERVIEW (Experiment Investigation Cards)
  // =========================================================================
  return (
    <div
      className="experiments-page-wrapper"
      style={{
        minHeight: '100vh',
        paddingTop: '96px',
        paddingBottom: '100px',
        background: 'var(--bg-primary)'
      }}
    >
      <div className="section-container" style={{ padding: '0 24px', maxWidth: 1280, margin: '0 auto' }}>

        {/* Hero Banner */}
        <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 40px' }}>
          
          <div
            className="lab-pill-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: 'var(--electric-blue)',
              fontSize: 'clamp(0.68rem, 2.6vw, 0.80rem)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: 16,
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <FlaskConical size={15} style={{ flexShrink: 0 }} />
            <span>VIRTUAL SCIENCE LABORATORY</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 14,
              color: 'var(--text-primary)',
              wordBreak: 'break-word'
            }}
          >
            Experiment. Manipulate. <span className="gradient-text">Discover.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.92rem, 2vw, 1.12rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 auto 24px'
            }}
          >
            Real interactive science investigations: form a hypothesis, manipulate independent parameters,
            collect quantitative trials in your laboratory notebook, and verify empirical physical laws.
          </p>

          {/* Scientific Domain Filter Tabs (NO Class 9/10/11) */}
          <div
            style={{
              display: 'inline-flex',
              gap: 6,
              padding: '5px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {availableDomains.map(dom => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: selectedDomain === dom ? 'var(--electric-blue)' : 'transparent',
                  color: selectedDomain === dom ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {dom === 'All' ? 'All Laboratories (8)' : dom}
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
            gap: 24
          }}
        >
          {filteredExperiments.map(exp => {
            const previewDiscovery = exp.getDiscovery({});
            return (
              <div
                key={exp.id}
                className="experiment-card"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-glass-card)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '440px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setActiveExperimentId(exp.id);
                  window.location.hash = `#experiments/${exp.id}`;
                }}
              >
                {/* Visual Header / Micro Preview */}
                <div
                  style={{
                    height: '140px',
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${exp.accentColor}18 0%, rgba(0, 0, 0, 0.4) 100%)`,
                    borderBottom: '1px solid var(--border-subtle)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'var(--bg-glass)',
                      border: `1px solid ${exp.accentColor}40`,
                      boxShadow: `0 0 20px ${exp.accentColor}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FlaskConical size={26} color={exp.accentColor} />
                  </div>

                  {/* Domain Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontSize: '0.66rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: exp.accentColor,
                      background: 'rgba(0, 0, 0, 0.65)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: `1px solid ${exp.accentColor}35`
                    }}
                  >
                    {exp.domain}
                  </div>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 0 auto',
                    minHeight: '260px',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: 8,
                        lineHeight: 1.3
                      }}
                    >
                      {exp.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                        marginBottom: 14
                      }}
                    >
                      {exp.shortDesc}
                    </p>

                    {/* Governing Formula */}
                    {previewDiscovery.formula && (
                      <div
                        style={{
                          marginBottom: 12,
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '0.80rem',
                          color: exp.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Law:</span>
                        <MathView math={previewDiscovery.formula} />
                      </div>
                    )}

                    {/* Variables pill list */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {exp.controls.map(c => (
                        <span
                          key={c.id}
                          className="font-mono"
                          style={{
                            fontSize: '0.70rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {c.label.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Launch Investigation Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveExperimentId(exp.id);
                      window.location.hash = `#experiments/${exp.id}`;
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: `linear-gradient(135deg, ${exp.accentColor} 0%, #0062FF 100%)`,
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: `0 4px 14px ${exp.accentColor}25`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>Launch Laboratory Investigation</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
