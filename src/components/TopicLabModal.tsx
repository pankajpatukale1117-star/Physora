import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Award,
  Maximize2,
  Minimize2,
  Sliders,
  Activity,
  Layers,
  ArrowDown,
  ArrowUp,
  Minus,
  Plus,
  StepForward,
  Gauge,
  Sparkles,
  Ghost,
  FileText,
  Radio
} from 'lucide-react';
import { TOPICS_DATA, isSimulationAnimated, type EditorialTeaching } from '../data/topicsData';
import { QUIZ_DATA } from '../data/quizData';
import { FlagshipSimulatorDispatcher } from './simulations/FlagshipSimulatorDispatcher';
import { MathView } from './MathView';
import { ChallengeModalWidget } from './challenges/ChallengeModalWidget';
import { getTopicChallenges } from '../data/challengesData';
import { LabReportModal } from './reports/LabReportModal';
import { PresenterModeOverlay } from './classroom/PresenterModeOverlay';
import { AiMentorDrawer } from './ai/AiMentorDrawer';
import { PricingModal } from './pricing/PricingModal';
import { useSubscription } from '../context/SubscriptionContext';

interface TopicLabModalProps {
  topicId: string | null;
  initialSimId?: string | null;
  onClose: () => void;
  onSelectTopic: (topicId: string, simId?: string) => void;
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
  isHighlighted?: boolean;
  highlightLabel?: string;
}

const NumericControlItem: React.FC<NumericControlItemProps> = ({
  control,
  value,
  onChange,
  accentColor,
  isHighlighted = false,
  highlightLabel
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

  const precision = control.step.toString().includes('.')
    ? control.step.toString().split('.')[1].length
    : 0;

  const handleStepDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const nextVal = Math.max(control.min, parseFloat((value - control.step).toFixed(precision)));
    setTextValue(String(nextVal));
    onChange(nextVal);
  };

  const handleStepUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const nextVal = Math.min(control.max, parseFloat((value + control.step).toFixed(precision)));
    setTextValue(String(nextVal));
    onChange(nextVal);
  };

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
        gap: 8,
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: isHighlighted ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-glass-card)',
        border: isHighlighted ? '1.5px solid var(--electric-blue)' : '1px solid var(--border-subtle)',
        boxShadow: isHighlighted ? '0 0 16px rgba(0, 240, 255, 0.35)' : 'var(--shadow-xs)',
        transition: 'all 0.25s ease'
      }}
    >
      {isHighlighted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(0, 240, 255, 0.18)',
            color: 'var(--electric-blue)',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}
        >
          <span>✨ {highlightLabel ? `Governs ${highlightLabel}` : 'Governs Equation'}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: isHighlighted ? 'var(--electric-blue)' : 'var(--text-primary)'
          }}
        >
          {control.label}
        </span>

        {/* Interactive Numeric Input Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
              padding: '4px 6px',
              textAlign: 'right',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              background: 'var(--bg-subtle)',
              border: isFocused ? `1.5px solid ${accentColor}` : '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              outline: 'none',
              boxShadow: isFocused ? `0 0 0 2px ${accentColor}25` : 'none',
              transition: 'all 0.15s ease'
            }}
          />
          {control.unit && (
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                minWidth: '22px'
              }}
            >
              {control.unit}
            </span>
          )}
        </div>
      </div>

      {/* Touch Ergonomic Stepper Slider Row: 44x44px [-] | Slider | 44x44px [+] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={handleStepDown}
          disabled={value <= control.min}
          className="phet-stepper-btn"
          title={`Decrease by ${control.step}`}
          aria-label={`Decrease ${control.label}`}
          style={{
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            flexShrink: 0
          }}
        >
          <Minus size={16} strokeWidth={2.8} />
        </button>

        <div style={{ flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value}
            onChange={handleSliderChange}
            className="card-range-slider"
            style={{
              width: '100%',
              minHeight: '44px',
              cursor: 'pointer',
              accentColor
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleStepUp}
          disabled={value >= control.max}
          className="phet-stepper-btn"
          title={`Increase by ${control.step}`}
          aria-label={`Increase ${control.label}`}
          style={{
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            flexShrink: 0
          }}
        >
          <Plus size={16} strokeWidth={2.8} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
        <span>Min: {control.min}</span>
        <span>Step: ±{control.step}</span>
        <span>Max: {control.max}</span>
      </div>
    </div>
  );
};

export const TopicLabModal: React.FC<TopicLabModalProps> = ({
  topicId,
  initialSimId,
  onClose,
  onSelectTopic
}) => {
  const topic = topicId ? TOPICS_DATA[topicId] : null;

  const getSimIndexFromContext = React.useCallback(() => {
    if (!topic) return 0;
    if (initialSimId) {
      const idx = topic.simulations.findIndex((s) => s.id === initialSimId);
      if (idx !== -1) return idx;
    }
    if (typeof window !== 'undefined') {
      const hashId = window.location.hash.replace(/^#(sim|topic)\//, '');
      const idx = topic.simulations.findIndex((s) => s.id === hashId);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [topic, initialSimId]);

  const [activeSimIndex, setActiveSimIndex] = useState<number>(getSimIndexFromContext);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 1 = Normal, 0.25 = Slow motion
  const [stepTrigger, setStepTrigger] = useState<number>(0);
  const [params, setParams] = useState<Record<string, number>>({});
  const [telemetry, setTelemetry] = useState<Record<string, string>>({});
  const [sideTab, setSideTab] = useState<'intuition' | 'formulas' | 'quiz'>('intuition');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isFullWindow, setIsFullWindow] = useState<boolean>(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState<boolean>(true);
  const [showAllControls, setShowAllControls] = useState<boolean>(false);

  // Upgrade 2: Interactive Formula-to-Simulation Highlighting ("Simulate This Formula")
  const [highlightedParamId, setHighlightedParamId] = useState<string | null>(null);
  const [highlightedFormulaLatex, setHighlightedFormulaLatex] = useState<string | null>(null);

  // Upgrade 3: Split-Screen Dual Compare Mode ("Compare Lab A vs Lab B")
  const [isDualCompare, setIsDualCompare] = useState<boolean>(false);
  const [paramsB, setParamsB] = useState<Record<string, number>>({});
  const [telemetryB, setTelemetryB] = useState<Record<string, string>>({});
  const [activeCompareTab, setActiveCompareTab] = useState<'A' | 'B'>('B');

  // Commercial & Classroom Upgrades & Subscription Paywall
  const { canUsePresenterMode, triggerPaywall } = useSubscription();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPresenterModeActive, setIsPresenterModeActive] = useState(false);
  const [isAiMentorOpen, setIsAiMentorOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Mobile Detection (< 768px Breakpoint)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile Bottom Sheet State: 'peek' | 'half' | 'expanded'
  const [bottomSheetSnap, setBottomSheetSnap] = useState<'peek' | 'half' | 'expanded'>('peek');
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Mobile Dual Compare: Tabbed Stack View ('A' | 'B')
  const [activeMobileCompareView, setActiveMobileCompareView] = useState<'A' | 'B'>('A');

  // Desktop Visual Diffing: Ghost Overlay toggle (Superimpose Reference at 30% opacity onto Hypothesis)
  const [isGhostOverlayEnabled, setIsGhostOverlayEnabled] = useState<boolean>(false);

  const handleOpenPresenter = () => {
    if (!canUsePresenterMode()) {
      triggerPaywall('presenter_mode', 'EDUCATOR');
      setIsPricingModalOpen(true);
      return;
    }
    setIsPresenterModeActive(true);
  };

  const [prevTopicId, setPrevTopicId] = useState(topicId);
  const [prevSimId, setPrevSimId] = useState<string | null>(null);

  const currentSim = topic ? topic.simulations[activeSimIndex] || topic.simulations[0] : null;
  const isAnimated = isSimulationAnimated(currentSim?.id);

  const handleStepForward = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setStepTrigger((prev) => prev + 1);
  };

  // Reset active simulation index when topic changes
  if (topicId !== prevTopicId) {
    setPrevTopicId(topicId);
    setActiveSimIndex(getSimIndexFromContext());
    setShowAllControls(false);
  }

  // Initialize parameters when simulation changes
  if (currentSim && currentSim.id !== prevSimId) {
    setPrevSimId(currentSim.id);
    const initialParams: Record<string, number> = {};
    const initialParamsB: Record<string, number> = {};
    currentSim.controls.forEach(ctrl => {
      initialParams[ctrl.id] = ctrl.defaultValue;
      initialParamsB[ctrl.id] = ctrl.defaultValue;
    });
    setParams(initialParams);
    setParamsB(initialParamsB);
    setIsPlaying(true);
    setShowAllControls(false);
  }

  const handleReset = React.useCallback(() => {
    if (!currentSim) return;
    const initialParams: Record<string, number> = {};
    const initialParamsB: Record<string, number> = {};
    currentSim.controls.forEach(ctrl => {
      initialParams[ctrl.id] = ctrl.defaultValue;
      initialParamsB[ctrl.id] = ctrl.defaultValue;
    });
    setParams(initialParams);
    setParamsB(initialParamsB);
    setSpeed(1);
    setStepTrigger(0);
  }, [currentSim]);

  const handleSimulateFormula = (formulaLatex: string, hintParamKey?: string) => {
    let targetParam = hintParamKey;
    if (!targetParam && currentSim) {
      const lower = formulaLatex.toLowerCase();
      const match = currentSim.controls.find(c =>
        lower.includes(c.id.toLowerCase()) ||
        lower.includes(c.label.toLowerCase().slice(0, 3))
      );
      targetParam = match ? match.id : currentSim.controls[0]?.id;
    }
    setHighlightedParamId(targetParam || null);
    setHighlightedFormulaLatex(formulaLatex);
    setLeftDrawerOpen(true);
    document.getElementById('sim-stage')?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      setHighlightedParamId(null);
      setHighlightedFormulaLatex(null);
    }, 7000);
  };

  const handleControlChangeB = (id: string, val: number) => {
    setParamsB(prev => ({ ...prev, [id]: val }));
  };

  const handleApplyComparePreset = (preset: 'sync' | 'boost' | 'extremes') => {
    if (!currentSim) return;
    if (preset === 'sync') {
      setParamsB({ ...params });
    } else if (preset === 'boost') {
      const primaryCtrl = currentSim.controls[0];
      if (primaryCtrl) {
        const cur = params[primaryCtrl.id] ?? primaryCtrl.defaultValue;
        const boosted = Math.min(primaryCtrl.max, parseFloat((cur * 1.5).toFixed(2)));
        setParamsB({ ...params, [primaryCtrl.id]: boosted });
      }
    } else if (preset === 'extremes') {
      const primaryCtrl = currentSim.controls[0];
      if (primaryCtrl) {
        setParams(prev => ({ ...prev, [primaryCtrl.id]: primaryCtrl.min }));
        setParamsB(prev => ({ ...prev, [primaryCtrl.id]: primaryCtrl.max }));
      }
    }
  };

  // Global laboratory keyboard shortcuts (Space, R, F, Esc, [, ])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      const isInputFocused = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        if (isFullWindow) {
          setIsFullWindow(false);
        } else {
          onClose();
        }
      } else if (!isInputFocused) {
        if (e.code === 'Space') {
          e.preventDefault();
          if (isAnimated) {
            setIsPlaying(prev => !prev);
          }
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleReset();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setIsFullWindow(prev => !prev);
        } else if (e.key === ']' || e.key === '.') {
          e.preventDefault();
          setStepTrigger(prev => prev + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullWindow, isAnimated, onClose, handleReset]);

  const topicChallenges = useMemo(() => {
    return topic ? getTopicChallenges(topic.id, currentSim?.id) : [];
  }, [topic, currentSim]);

  if (!topic || !currentSim) return null;

  const topicQuiz = QUIZ_DATA[topic.id] || [];
  const correctCount = topicQuiz.filter(q => userAnswers[q.id] === q.correctIndex).length;

  const handleControlChange = (id: string, val: number) => {
    setParams(prev => {
      const next = { ...prev, [id]: val };
      // Linked Projectile Controls (Throughline style)
      if (currentSim.id === 'motion_two_motions') {
        if (id === 'u_x' || id === 'u_y') {
          const ux = id === 'u_x' ? val : (prev.u_x ?? 30);
          const uy = id === 'u_y' ? val : (prev.u_y ?? 40);
          next.u = Math.round(Math.hypot(ux, uy) * 10) / 10;
          next.theta = Math.round(Math.atan2(uy, ux) * (180 / Math.PI));
        } else if (id === 'u' || id === 'theta') {
          const u = id === 'u' ? val : (prev.u ?? 50);
          const thetaDeg = id === 'theta' ? val : (prev.theta ?? 53);
          const rad = (thetaDeg * Math.PI) / 180;
          next.u_x = Math.round(u * Math.cos(rad));
          next.u_y = Math.round(u * Math.sin(rad));
        }
      }
      return next;
    });
  };

  const isMath = topic.subject === 'maths';
  const isBiology = topic.subject === 'biology';
  const isChemistry = topic.subject === 'chemistry';
  const accentColor = isChemistry ? '#F97316' : isBiology ? '#10B981' : isMath ? 'var(--electric-violet)' : 'var(--electric-blue)';

  const handleApplyChallengeParams = (initParams: Record<string, number>) => {
    setParams(prev => ({ ...prev, ...initParams }));
  };

  if (isFullWindow) {
    const editorial: EditorialTeaching = topic.editorialTeaching || {
      headline: `Learn to understand ${topic.title}.`,
      story: topic.conceptIntro,
      controlsGuide: `Adjust the active simulation parameters in the left panel to test how dynamic forces and initial conditions govern system trajectories in real time.`,
      variablesAndOutputs: `Key variables include: ${topic.keyFormulas.map(f => f.formula).join(', ')}. Observe the live telemetry values on the right panel as the physical state evolves.`,
      modelAssumptions: `Standard physical idealizations apply: clean coordinate frame, negligible air friction unless configured, and uniform local fields.`,
      learningObjective: `Connect the algebraic symbolism with direct visual and tactile physical intuition.`
    };

    return (
      <div
        className="throughline-stage-viewport"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 250,
          background: '#070B14',
          color: 'var(--text-primary)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth'
        }}
      >
        {/* VIEWPORT 1: Full-Bleed 100dvh Simulation Stage */}
        <div
          id="sim-stage"
          style={{
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#060A12'
          }}
        >
          {/* Top Floating Pill Navigation Bar */}
          {/* Top Stage Studio Navigation Bar (Non-Overlapping Solid Top Bar) */}
          <header
            style={{
              height: 52,
              minHeight: 52,
              flexShrink: 0,
              width: '100%',
              background: '#0B1120',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              gap: 10,
              zIndex: 100,
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Exit Stage & Breadcrumbs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0
              }}
            >
              <button
                onClick={() => setIsFullWindow(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 9px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  whiteSpace: 'nowrap'
                }}
                title="Exit Stage View (Esc)"
              >
                <Minimize2 size={13} />
                <span>Exit Stage</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    opacity: 0.6,
                    padding: '1px 4px',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)'
                  }}
                >
                  Esc
                </span>
              </button>

              <span style={{ opacity: 0.25 }}>|</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <img
                  src="/logo-mark.png"
                  alt="Physora"
                  style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover' }}
                />
                <span style={{ opacity: 0.8, fontWeight: 700 }}>Physora</span>
                <span style={{ opacity: 0.3 }}>/</span>
                <span style={{ color: accentColor, fontWeight: 700 }}>{topic.title}</span>
              </div>
            </div>

            {/* Center: Simulation Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                maxWidth: '34vw',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                flexShrink: 1,
                minWidth: 0
              }}
            >
              {topic.simulations.map((sim, idx) => {
                const isActive = idx === activeSimIndex;
                return (
                  <button
                    key={sim.id}
                    onClick={() => {
                      setActiveSimIndex(idx);
                      window.location.hash = `#sim/${sim.id}`;
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      border: isActive ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
                      background: isActive ? `${accentColor}22` : 'rgba(255,255,255,0.03)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 750 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isActive ? accentColor : 'var(--text-muted)'
                      }}
                    />
                    <span>{sim.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Actions, Commercial Tools & Close */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <ChallengeModalWidget
                challenges={topicChallenges}
                currentParams={params}
                onApplyInitialParams={handleApplyChallengeParams}
                accentColor={accentColor}
              />

              <button
                onClick={() => setIsDualCompare(prev => !prev)}
                className={`btn btn-sm ${isDualCompare ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '4px 9px',
                  fontSize: '0.75rem',
                  gap: 5,
                  background: isDualCompare ? 'rgba(0, 240, 255, 0.22)' : undefined,
                  borderColor: isDualCompare ? 'var(--electric-blue)' : undefined,
                  color: isDualCompare ? '#00f0ff' : undefined,
                  whiteSpace: 'nowrap'
                }}
                title="Toggle Split-Screen Dual Compare Mode (Side-by-Side Reference vs Hypothesis)"
              >
                <Layers size={13} />
                <span>Dual Compare</span>
                {isDualCompare && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f0ff' }} />
                )}
              </button>

              <button
                onClick={() => {
                  document.getElementById('sim-teaching')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '4px 9px',
                  fontSize: '0.75rem',
                  gap: 4,
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Guide</span>
                <ArrowDown size={12} />
              </button>

              {/* Classroom & Commercial Toolbar Tools in Stage Studio */}
              <button
                type="button"
                onClick={() => setIsAiMentorOpen(true)}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(124, 58, 237, 0.25))',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  color: '#C084FC',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  gap: 4,
                  padding: '4px 9px',
                  whiteSpace: 'nowrap'
                }}
                title="Open Context-Aware AI Science Tutor"
              >
                <Sparkles size={12} />
                <span>AI Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="btn btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34D399',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  gap: 4,
                  padding: '4px 9px',
                  whiteSpace: 'nowrap'
                }}
                title="Export Academic Printable Lab Report PDF"
              >
                <FileText size={12} />
                <span>Lab Report</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPresenter}
                className="btn btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#F87171',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  gap: 4,
                  padding: '4px 9px',
                  whiteSpace: 'nowrap'
                }}
                title="Open Classroom Presenter HUD with Laser Pointer & Annotation"
              >
                <Radio size={12} />
                <span>Presenter</span>
              </button>

              <button
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                style={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title="Close (Esc)"
              >
                <X size={14} />
              </button>
            </div>
          </header>

          {/* Wall-to-Wall Simulation Stage Viewport */}
          <div
            id="sim-stage-viewport"
            style={{
              width: '100%',
              height: 'calc(100vh - 52px)',
              flex: 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isDualCompare ? (
              isMobile ? (
                /* Mobile Tabbed Stack Viewport */
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                  <div
                    style={{
                      height: 38,
                      minHeight: 38,
                      flexShrink: 0,
                      background: 'rgba(15, 23, 42, 0.95)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      gap: 8,
                      zIndex: 30
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMobileCompareView('A')}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: activeMobileCompareView === 'A' ? '1.5px solid var(--electric-blue)' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: activeMobileCompareView === 'A' ? 'rgba(0, 240, 255, 0.22)' : 'transparent',
                        color: activeMobileCompareView === 'A' ? '#00f0ff' : 'var(--text-secondary)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      View A (Reference)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMobileCompareView('B')}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: activeMobileCompareView === 'B' ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: activeMobileCompareView === 'B' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                        color: activeMobileCompareView === 'B' ? '#f59e0b' : 'var(--text-secondary)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      View B (Hypothesis)
                    </button>
                  </div>

                  <div style={{ flex: 1, width: '100%', height: 'calc(100% - 38px)', position: 'relative', overflow: 'hidden' }}>
                    {activeMobileCompareView === 'A' ? (
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={params}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetry}
                        controls={currentSim.controls}
                        onParamChange={handleControlChange}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                        isCompact={true}
                      />
                    ) : (
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={paramsB}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetryB}
                        controls={currentSim.controls}
                        onParamChange={handleControlChangeB}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                        isCompact={true}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Desktop Side-by-Side Dual Viewport with Ghost Overlay */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    width: '100%',
                    height: '100%',
                    gap: 2,
                    background: 'rgba(0,0,0,0.7)'
                  }}
                >
                  {/* Viewport A (Reference) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      borderRight: '1px solid rgba(0, 240, 255, 0.3)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        height: 28,
                        minHeight: 28,
                        flexShrink: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: 'var(--electric-blue)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--electric-blue)', boxShadow: '0 0 6px var(--electric-blue)' }} />
                        <span>LAB A (REFERENCE)</span>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>Baseline Model</span>
                    </div>

                    <div style={{ flex: 1, width: '100%', height: 'calc(100% - 28px)', position: 'relative', overflow: 'hidden' }}>
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={params}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetry}
                        controls={currentSim.controls}
                        onParamChange={handleControlChange}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                        isCompact={true}
                      />
                    </div>
                  </div>

                  {/* Viewport B (Hypothesis) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        height: 28,
                        minHeight: 28,
                        flexShrink: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                        <span>LAB B (HYPOTHESIS)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Ghost Overlay Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setIsGhostOverlayEnabled(prev => !prev)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            border: isGhostOverlayEnabled ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.2)',
                            background: isGhostOverlayEnabled ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                            color: isGhostOverlayEnabled ? '#00f0ff' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                          title="Superimpose Reference simulation (Lab A) at 30% opacity onto Hypothesis canvas"
                        >
                          <Ghost size={11} />
                          <span>Ghost Overlay {isGhostOverlayEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>Experimental Variation</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, width: '100%', height: 'calc(100% - 28px)', position: 'relative', overflow: 'hidden' }}>
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={paramsB}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetryB}
                        controls={currentSim.controls}
                        onParamChange={handleControlChangeB}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                        isCompact={true}
                      />

                      {/* Ghost Overlay Layer (Reference at 30% Opacity) */}
                      {isGhostOverlayEnabled && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.30,
                            pointerEvents: 'none',
                            zIndex: 10,
                            mixBlendMode: 'screen'
                          }}
                        >
                          <FlagshipSimulatorDispatcher
                            simId={currentSim.id}
                            params={params}
                            isPlaying={isPlaying}
                            speed={speed}
                            stepTrigger={stepTrigger}
                            onTelemetryUpdate={() => {}}
                            controls={currentSim.controls}
                            isCompact={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <FlagshipSimulatorDispatcher
                simId={currentSim.id}
                params={params}
                isPlaying={isPlaying}
                speed={speed}
                stepTrigger={stepTrigger}
                onTelemetryUpdate={setTelemetry}
                controls={currentSim.controls}
                onParamChange={handleControlChange}
                onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Left Controls: Draggable Bottom Sheet for Mobile, Left Drawer for Desktop */}
          {isMobile ? (
            /* Mobile Bottom Sheet (Google Maps Style) */
            <div
              className="mobile-bottom-sheet"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: bottomSheetSnap === 'peek' ? '58px' : bottomSheetSnap === 'half' ? '46vh' : '82vh',
                zIndex: 65,
                background: 'rgba(15, 23, 42, 0.96)',
                borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Drag Handle & Header */}
              <div
                onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
                onTouchMove={(e) => {
                  if (touchStartY === null) return;
                  const delta = touchStartY - e.touches[0].clientY;
                  if (delta > 40) {
                    setBottomSheetSnap(prev => prev === 'peek' ? 'half' : 'expanded');
                    setTouchStartY(null);
                  } else if (delta < -40) {
                    setBottomSheetSnap(prev => prev === 'expanded' ? 'half' : 'peek');
                    setTouchStartY(null);
                  }
                }}
                onTouchEnd={() => setTouchStartY(null)}
                onClick={() => {
                  setBottomSheetSnap(prev => prev === 'peek' ? 'half' : prev === 'half' ? 'expanded' : 'peek');
                }}
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderBottom: bottomSheetSnap === 'peek' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(255, 255, 255, 0.4)', marginBottom: 6 }} />
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    <Sliders size={14} color={accentColor} />
                    <span>Controls ({currentSim.controls.length})</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      ({bottomSheetSnap.toUpperCase()})
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    {bottomSheetSnap === 'peek' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Bottom Sheet Controls Body */}
              {bottomSheetSnap !== 'peek' && (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px 16px 80px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {isDualCompare && (
                    <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
                      <button
                        onClick={() => setActiveCompareTab('A')}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          background: activeCompareTab === 'A' ? 'var(--electric-blue)' : 'transparent',
                          color: activeCompareTab === 'A' ? '#000000' : 'var(--text-secondary)',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}
                      >
                        Lab A (Ref)
                      </button>
                      <button
                        onClick={() => setActiveCompareTab('B')}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          background: activeCompareTab === 'B' ? '#f59e0b' : 'transparent',
                          color: activeCompareTab === 'B' ? '#000000' : 'var(--text-secondary)',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}
                      >
                        Lab B (Hyp)
                      </button>
                    </div>
                  )}

                  {currentSim.controls.map((ctrl) => {
                    const isTabB = isDualCompare && activeCompareTab === 'B';
                    const val = isTabB ? (paramsB[ctrl.id] ?? ctrl.defaultValue) : (params[ctrl.id] ?? ctrl.defaultValue);
                    const onValChange = isTabB ? (v: number) => handleControlChangeB(ctrl.id, v) : (v: number) => handleControlChange(ctrl.id, v);
                    const activeAccent = isTabB ? '#f59e0b' : accentColor;

                    return (
                      <NumericControlItem
                        key={ctrl.id}
                        control={ctrl}
                        value={val}
                        onChange={onValChange}
                        accentColor={activeAccent}
                        isHighlighted={highlightedParamId === ctrl.id}
                        highlightLabel={highlightedFormulaLatex ? `Governs: ${highlightedFormulaLatex}` : undefined}
                      />
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button
                      onClick={handleReset}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', gap: 6, minHeight: 40 }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset Parameters</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Persistent Left Parameter Drawer */
            leftDrawerOpen ? (
              <div
                className="throughline-hud-panel"
                style={{
                  position: 'absolute',
                  top: isDualCompare ? 88 : 64,
                  left: 20,
                  bottom: 84,
                  width: 320,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Drawer Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={14} color={accentColor} />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Controls ({currentSim.controls.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setLeftDrawerOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    title="Collapse Controls Panel"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                {/* Drawer Sliders List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {isDualCompare && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', padding: 3, borderRadius: 'var(--radius-sm)' }}>
                        <button
                          onClick={() => setActiveCompareTab('A')}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: 'none',
                            background: activeCompareTab === 'A' ? 'var(--electric-blue)' : 'transparent',
                            color: activeCompareTab === 'A' ? '#000000' : 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Lab A (Ref)
                        </button>
                        <button
                          onClick={() => setActiveCompareTab('B')}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: 'none',
                            background: activeCompareTab === 'B' ? '#f59e0b' : 'transparent',
                            color: activeCompareTab === 'B' ? '#000000' : 'var(--text-secondary)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Lab B (Hyp)
                        </button>
                      </div>

                      {/* Presets pill bar */}
                      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
                        <button
                          onClick={() => handleApplyComparePreset('sync')}
                          className="btn btn-secondary btn-xs"
                          style={{ fontSize: '0.68rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                          title="Copy all parameters from Lab A to Lab B"
                        >
                          Sync A → B
                        </button>
                        <button
                          onClick={() => handleApplyComparePreset('boost')}
                          className="btn btn-secondary btn-xs"
                          style={{ fontSize: '0.68rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                          title="Increase primary parameter of Lab B by +50%"
                        >
                          +50% Primary
                        </button>
                        <button
                          onClick={() => handleApplyComparePreset('extremes')}
                          className="btn btn-secondary btn-xs"
                          style={{ fontSize: '0.68rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                          title="Set Lab A to minimum and Lab B to maximum"
                        >
                          Min vs Max
                        </button>
                      </div>
                    </div>
                  )}

                  {currentSim.controls.map((ctrl) => {
                    const isTabB = isDualCompare && activeCompareTab === 'B';
                    const val = isTabB ? (paramsB[ctrl.id] ?? ctrl.defaultValue) : (params[ctrl.id] ?? ctrl.defaultValue);
                    const onValChange = isTabB ? (v: number) => handleControlChangeB(ctrl.id, v) : (v: number) => handleControlChange(ctrl.id, v);
                    const activeAccent = isTabB ? '#f59e0b' : accentColor;

                    return (
                      <NumericControlItem
                        key={ctrl.id}
                        control={ctrl}
                        value={val}
                        onChange={onValChange}
                        accentColor={activeAccent}
                        isHighlighted={highlightedParamId === ctrl.id}
                        highlightLabel={highlightedFormulaLatex ? `Governs: ${highlightedFormulaLatex}` : undefined}
                      />
                    );
                  })}
                </div>

                {/* Drawer Footer Actions */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    onClick={handleReset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '5px 10px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset Controls</span>
                  </button>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Throughline Engine</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setLeftDrawerOpen(true)}
                className="throughline-pill-nav"
                style={{
                  position: 'absolute',
                  top: isDualCompare ? 88 : 64,
                  left: 20,
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
                title="Expand Controls Panel"
              >
                <Sliders size={14} color={accentColor} />
                <span>Controls ({currentSim.controls.length})</span>
                <ChevronRight size={14} />
              </button>
            )
          )}

          {/* Floating Collapsible Right Telemetry Drawer */}
          {rightDrawerOpen ? (
            <div
              className="throughline-hud-panel"
              style={{
                position: 'absolute',
                top: isDualCompare ? 88 : 64,
                right: 20,
                bottom: 84,
                width: 290,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={14} color="#38BDF8" />
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Live Telemetry
                  </span>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#38BDF8',
                      boxShadow: '0 0 8px #38BDF8'
                    }}
                  />
                </div>
                <button
                  onClick={() => setRightDrawerOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                  title="Collapse Telemetry Panel"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Drawer Telemetry Metrics */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                {currentSim.telemetryLabels.map((tLabel) => (
                  <div
                    key={tLabel.key}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {tLabel.label}
                    </div>

                    {isDualCompare ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                        <div>
                          <span style={{ fontSize: '0.62rem', color: 'var(--electric-blue)', display: 'block', fontWeight: 800 }}>LAB A</span>
                          <span style={{ fontWeight: 700, color: '#38BDF8' }}>{telemetry[tLabel.key] || '—'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.62rem', color: '#f59e0b', display: 'block', fontWeight: 800 }}>LAB B</span>
                          <span style={{ fontWeight: 700, color: '#fbbf24' }}>{telemetryB[tLabel.key] || '—'}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#38BDF8'
                        }}
                      >
                        {telemetry[tLabel.key] || '—'}
                      </div>
                    )}
                  </div>
                ))}

                {/* Governing Formula Micro-Card */}
                {topic.keyFormulas.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: 6
                      }}
                    >
                      Governing Relation
                    </div>
                    <MathView math={topic.keyFormulas[0].formula} block={false} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {topic.keyFormulas[0].explanation}
                    </div>
                    <button
                      onClick={() => handleSimulateFormula(topic.keyFormulas[0].formula)}
                      className="btn btn-primary btn-xs"
                      style={{
                        marginTop: 8,
                        width: '100%',
                        fontSize: '0.72rem',
                        gap: 5
                      }}
                    >
                      <Sparkles size={11} />
                      <span>Highlight in Controls</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setRightDrawerOpen(true)}
              className="throughline-pill-nav"
              style={{
                position: 'absolute',
                top: isDualCompare ? 88 : 64,
                right: 20,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
              title="Expand Telemetry Panel"
            >
              <ChevronLeft size={14} />
              <Activity size={14} color="#38BDF8" />
              <span>Metrics ({currentSim.telemetryLabels.length})</span>
            </button>
          )}

          {/* Floating Bottom Timeline / Scrubber Pill */}
          <div
            className="throughline-timeline-bar"
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 70,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), 0 3px 10px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              maxWidth: 'calc(100vw - 32px)',
              flexWrap: 'nowrap'
            }}
          >
            {isAnimated && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isPlaying ? '#DC2626' : '#059669',
                  border: isPlaying ? '1px solid #EF4444' : '1px solid #10B981',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 16px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  boxShadow: isPlaying ? '0 2px 8px rgba(220, 38, 38, 0.45)' : '0 2px 8px rgba(5, 150, 105, 0.45)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isPlaying ? (
                  <Pause size={14} color="#FFFFFF" strokeWidth={2.6} />
                ) : (
                  <Play size={14} color="#FFFFFF" strokeWidth={2.6} fill="#FFFFFF" />
                )}
                <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}

            {isAnimated && (
              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                title="Step forward 1 frame"
                aria-label="Step forward 1 frame"
              >
                <StepForward size={14} color="currentColor" strokeWidth={2.2} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Step</span>
              </button>
            )}

            {isAnimated && (
              <button
                type="button"
                onClick={() => setSpeed((prev) => (prev === 1 ? 0.25 : 1))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: speed === 0.25 ? 'var(--brand-primary-soft)' : 'var(--bg-subtle)',
                  border: speed === 0.25 ? '1px solid var(--brand-primary)' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 12px',
                  color: speed === 0.25 ? 'var(--brand-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                title="Toggle speed (1x Normal vs 0.25x Slow Motion)"
              >
                <Gauge size={14} color="currentColor" strokeWidth={2.2} />
                <span style={{ fontWeight: 800 }}>{speed === 1 ? '1x Normal' : '0.25x Slow'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="phet-reset-btn"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#FF6600',
                border: '2px solid #FFFFFF',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 102, 0, 0.45)',
                flexShrink: 0
              }}
              title="Reset simulation and clock"
              aria-label="Reset simulation"
            >
              <RotateCcw size={15} strokeWidth={2.6} color="#FFFFFF" />
            </button>

            <div style={{ height: 18, width: 1, background: 'var(--border-medium)' }} />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.74rem',
                fontWeight: 800,
                color: isPlaying ? 'var(--accent-success)' : 'var(--accent-amber)',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap'
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isPlaying ? '#10B981' : '#F59E0B',
                  boxShadow: isPlaying ? '0 0 8px #10B981' : '0 0 8px #F59E0B'
                }}
              />
              <span>{isPlaying ? 'LIVE' : 'PAUSED'}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById('sim-teaching')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 650,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontStyle: 'italic' }}>Guide</span>
              <ArrowDown size={12} />
            </button>
          </div>
        </div>

        {/* VIEWPORT 2: Editorial Teaching Deconstruction Section */}
        <section
          id="sim-teaching"
          className="blueprint-grid"
          style={{
            position: 'relative',
            minHeight: '100vh',
            padding: '90px 24px 120px',
            background: '#070B14',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div
            style={{
              maxWidth: 1040,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 36
            }}
          >
            {/* Editorial Headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: accentColor,
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}35`,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  Throughline Pedagogical Breakdown
                </span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.80rem' }}>
                  • First Principles Deconstruction
                </span>
              </div>

              <h1
                className="font-editorial"
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: '#F8FAFC',
                  margin: 0
                }}
              >
                {editorial.headline}
              </h1>

              <p
                style={{
                  fontSize: '1.08rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  maxWidth: 860
                }}
              >
                {editorial.story}
              </p>
            </div>

            {/* 4 Feature Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 20
              }}
            >
              {/* Card 1: Controls & Exploration */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accentColor }}>
                  <Sliders size={18} />
                  <h3
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Controls &amp; Exploration
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                  {editorial.controlsGuide}
                </p>
              </div>

              {/* Card 2: Variables & Telemetry */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8' }}>
                  <Activity size={18} />
                  <h3
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Variables &amp; Telemetry
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                  {editorial.variablesAndOutputs}
                </p>
              </div>

              {/* Card 3: Model Assumptions */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A855F7' }}>
                  <Layers size={18} />
                  <h3
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Model Assumptions
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                  {editorial.modelAssumptions}
                </p>
              </div>

              {/* Card 4: Learning Objective */}
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981' }}>
                  <Award size={18} />
                  <h3
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Learning Objective
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                  {editorial.learningObjective}
                </p>
              </div>
            </div>

            {/* Technical Blueprint Sticky Note */}
            <div
              className="blueprint-sticky-note"
              style={{
                margin: '12px auto 0',
                maxWidth: 780,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                  paddingBottom: 8
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#D97706'
                  }}
                >
                  📌 Mathematical First Principles
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#92400E',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {topic.id.toUpperCase()} • THEOREM NOTE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topic.keyFormulas.map((kf, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        padding: '6px 12px',
                        borderRadius: 6,
                        display: 'inline-block'
                      }}
                    >
                      <MathView math={kf.formula} block={true} />
                    </div>
                    <span style={{ fontSize: '0.84rem', color: '#78350F', lineHeight: 1.5 }}>
                      {kf.explanation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return to Stage Action */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button
                onClick={() => {
                  document.getElementById('sim-stage')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="throughline-pill-nav"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <ArrowUp size={15} />
                <span>Return to Simulation Stage</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="topic-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
        animation: 'modalFadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card topic-modal-window"
        style={{
          width: '100%',
          maxWidth: 1140,
          maxHeight: '92vh',
          background: 'var(--bg-glass-heavy)',
          borderRadius: 'var(--radius-xl)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 25px 70px -10px rgba(0, 0, 0, 0.9), 0 0 35px ${accentColor}30`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="topic-modal-topbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: 'var(--bg-glass-card)',
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {topic.title}
            </h2>
            <span className="hide-mobile" style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
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
                color: 'var(--text-primary)',
                background: 'var(--bg-tertiary)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <optgroup label="Physics">
                <option value="projectile_motion_lab">★ Projectile Motion &amp; Ballistics</option>
                <option value="wave_interference_lab">★ Wave Interference &amp; Superposition</option>
                <option value="motion">Motion &amp; Kinematics</option>
                <option value="newtons_laws">Newton's Laws</option>
                <option value="work_energy_power">Work, Energy &amp; Power</option>
                <option value="gravitation">Gravitation</option>
                <option value="waves">Waves</option>
                <option value="optics">Optics &amp; Light</option>
                <option value="thermodynamics">Thermodynamics</option>
                <option value="units_dimensions">Units &amp; Dimensions</option>
              </optgroup>
              <optgroup label="Chemistry">
                <option value="molecular_geometry">★ 3D Molecular Geometry &amp; VSEPR</option>
                <option value="reaction_kinetics">★ Reaction Kinetics &amp; Equilibrium</option>
              </optgroup>
              <optgroup label="Biology">
                <option value="cardiac_hemodynamics">★ Cardiac Hemodynamics &amp; Circulation</option>
                <option value="cellular_osmosis">★ Cellular Osmosis &amp; Membrane</option>
                <option value="natural_selection">Natural Selection</option>
                <option value="gene_expression">Gene Expression</option>
                <option value="membrane_transport">Membrane Transport</option>
                <option value="neuron">Neuron &amp; Action Potential</option>
              </optgroup>
              <optgroup label="Mathematics">
                <option value="vector_3d_lab">★ 3D Vector &amp; Plane Geometry</option>
                <option value="calculus_riemann_lab">★ Calculus: Tangents &amp; Riemann Integrals</option>
                <option value="algebra">Algebra</option>
                <option value="trigonometry">Trigonometry</option>
                <option value="coordinate_geometry">Coordinate Geometry</option>
                <option value="functions">Functions</option>
                <option value="sequences">Sequences</option>
                <option value="basic_calculus">Basic Calculus</option>
              </optgroup>
            </select>

            {/* Commercial Feature Buttons in Normal View */}
            <button
              type="button"
              onClick={() => setIsAiMentorOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(124, 58, 237, 0.4)',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.15))',
                color: '#7C3AED',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Open Physora AI Science Tutor"
            >
              <Sparkles size={13} />
              <span>AI Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Generate Printable Academic Lab Report"
            >
              <FileText size={13} />
              <span>Lab Report</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPresenter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Open Smartboard Classroom Presenter Mode"
            >
              <Radio size={13} />
              <span>Presenter</span>
            </button>

            <button
              onClick={() => setIsFullWindow(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Launch Throughline Stage View & Narrative"
            >
              <Maximize2 size={13} />
              <span>Stage Studio</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
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

        {/* Modal Main Body: Workbench and Theory */}
        <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
            className="modal-content-grid"
          >
            {/* TOP: Primary Simulation Workbench */}
            <div
              className="modal-workbench"
              style={{
                padding: '24px 28px 20px',
                borderRight: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-secondary)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Simulation Tabs (2 to 3 distinct simulations per topic) */}
              <div style={{ marginBottom: 16 }}>
                <div
                  className="modal-sim-tab-strip"
                  style={{
                    display: 'flex',
                    gap: 8,
                    padding: 4,
                    background: 'var(--bg-tertiary)',
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
                        onClick={() => {
                          setActiveSimIndex(idx);
                          window.location.hash = `#sim/${sim.id}`;
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)',
                          border: 'none',
                          background: isActive ? accentColor : 'transparent',
                          color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {currentSim.name}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {currentSim.tagline}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChallengeModalWidget
                      challenges={topicChallenges}
                      currentParams={params}
                      onApplyInitialParams={handleApplyChallengeParams}
                      accentColor={accentColor}
                    />

                    <button
                      onClick={() => setIsDualCompare(prev => !prev)}
                      className={`btn btn-sm ${isDualCompare ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.76rem',
                        gap: 5,
                        background: isDualCompare ? 'rgba(0, 240, 255, 0.22)' : undefined,
                        borderColor: isDualCompare ? 'var(--electric-blue)' : undefined,
                        color: isDualCompare ? '#00f0ff' : undefined
                      }}
                      title="Toggle Split-Screen Dual Compare Mode"
                    >
                      <Layers size={13} />
                      <span>Dual Compare</span>
                      {isDualCompare && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f0ff' }} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Canvas Box */}
              <div
                className="modal-canvas-box"
                style={{
                  width: '100%',
                  aspectRatio: '16 / 8.5',
                  maxHeight: '440px',
                  minHeight: '320px',
                  position: 'relative',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.7), 0 4px 20px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                  marginBottom: 16
                }}
              >
                {isDualCompare ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      width: '100%',
                      height: '100%',
                      gap: 2,
                      background: 'rgba(0,0,0,0.7)'
                    }}
                  >
                    {/* Viewport A */}
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRight: '1px solid rgba(0, 240, 255, 0.3)' }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 25,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(15, 23, 42, 0.88)',
                          border: '1px solid var(--electric-blue)',
                          color: 'var(--electric-blue)',
                          fontSize: '0.70rem',
                          fontWeight: 800
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--electric-blue)' }} />
                        <span>LAB A (REF)</span>
                      </div>
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={params}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetry}
                        controls={currentSim.controls}
                        onParamChange={handleControlChange}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                      />
                    </div>

                    {/* Viewport B */}
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 25,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(15, 23, 42, 0.88)',
                          border: '1px solid #f59e0b',
                          color: '#f59e0b',
                          fontSize: '0.70rem',
                          fontWeight: 800
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />
                        <span>LAB B (HYP)</span>
                      </div>
                      <FlagshipSimulatorDispatcher
                        simId={currentSim.id}
                        params={paramsB}
                        isPlaying={isPlaying}
                        speed={speed}
                        stepTrigger={stepTrigger}
                        onTelemetryUpdate={setTelemetryB}
                        controls={currentSim.controls}
                        onParamChange={handleControlChangeB}
                        onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                        onReset={handleReset}
                      />
                    </div>
                  </div>
                ) : (
                  <FlagshipSimulatorDispatcher
                    simId={currentSim.id}
                    params={params}
                    isPlaying={isPlaying}
                    speed={speed}
                    stepTrigger={stepTrigger}
                    onTelemetryUpdate={setTelemetry}
                    controls={currentSim.controls}
                    onParamChange={handleControlChange}
                    onTogglePlay={isAnimated ? () => setIsPlaying(!isPlaying) : undefined}
                    onReset={handleReset}
                  />
                )}
              </div>

              {/* Live Telemetry Chips */}
              <div
                className="modal-telemetry-box"
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
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.84rem',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: '0.80rem' }}>{tLabel.label}:</span>
                    <strong style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.88rem' }}>{telemetry[tLabel.key] || '—'}</strong>
                  </div>
                ))}
              </div>

              {/* Interactive Sliders & Play/Reset Dock */}
            <div
              className="modal-controls-dock"
              style={{
                padding: '18px 20px',
                background: 'var(--bg-glass-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginTop: 'auto'
              }}
            >
              {isDualCompare && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
                    <button
                      onClick={() => setActiveCompareTab('A')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        background: activeCompareTab === 'A' ? 'var(--electric-blue)' : 'transparent',
                        color: activeCompareTab === 'A' ? '#000000' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Lab A Controls (Reference)
                    </button>
                    <button
                      onClick={() => setActiveCompareTab('B')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        background: activeCompareTab === 'B' ? '#f59e0b' : 'transparent',
                        color: activeCompareTab === 'B' ? '#000000' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Lab B Controls (Hypothesis)
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    <button
                      onClick={() => handleApplyComparePreset('sync')}
                      className="btn btn-secondary btn-xs"
                      style={{ fontSize: '0.70rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                      title="Copy all parameters from Lab A to Lab B"
                    >
                      Sync A → B
                    </button>
                    <button
                      onClick={() => handleApplyComparePreset('boost')}
                      className="btn btn-secondary btn-xs"
                      style={{ fontSize: '0.70rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                      title="Increase primary parameter of Lab B by +50%"
                    >
                      +50% Primary
                    </button>
                    <button
                      onClick={() => handleApplyComparePreset('extremes')}
                      className="btn btn-secondary btn-xs"
                      style={{ fontSize: '0.70rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                      title="Set Lab A to minimum and Lab B to maximum"
                    >
                      Min vs Max
                    </button>
                  </div>
                </div>
              )}

              <div
                className="modal-controls-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 14,
                  marginBottom: 14
                }}
              >
                {currentSim.controls.map((ctrl, idx) => {
                  const isHiddenOnMobile = !showAllControls && idx >= 2;
                  const isTabB = isDualCompare && activeCompareTab === 'B';
                  const val = isTabB ? (paramsB[ctrl.id] ?? ctrl.defaultValue) : (params[ctrl.id] ?? ctrl.defaultValue);
                  const onValChange = isTabB ? (v: number) => handleControlChangeB(ctrl.id, v) : (v: number) => handleControlChange(ctrl.id, v);
                  const activeAccent = isTabB ? '#f59e0b' : accentColor;

                  return (
                    <div key={ctrl.id} className={isHiddenOnMobile ? 'hide-mobile' : ''}>
                      <NumericControlItem
                        control={ctrl}
                        value={val}
                        onChange={onValChange}
                        accentColor={activeAccent}
                        isHighlighted={highlightedParamId === ctrl.id}
                        highlightLabel={highlightedFormulaLatex ? `Governs: ${highlightedFormulaLatex}` : undefined}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Mobile Progressive Disclosure Toggle for Secondary Controls */}
              {currentSim.controls.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllControls(!showAllControls)}
                  className="show-mobile-only mobile-toggle-more-controls-btn"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--brand-primary)',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: 12
                  }}
                >
                  {showAllControls ? (
                    <>
                      <Minimize2 size={13} />
                      <span>▲ Show Fewer Controls</span>
                    </>
                  ) : (
                    <>
                      <Sliders size={13} />
                      <span>▼ More Controls &amp; Parameters ({currentSim.controls.length - 2})</span>
                    </>
                  )}
                </button>
              )}

              {/* PhET Interactive Simulation Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Play / Pause Button */}
                  {isAnimated && (
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '7px 16px',
                        gap: 6,
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  )}

                  {/* PhET Step Forward [>|] Button (Advances 1 frame) */}
                  {isAnimated && (
                    <button
                      type="button"
                      onClick={handleStepForward}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '7px 12px',
                        gap: 5,
                        fontSize: '0.80rem',
                        fontWeight: 650,
                        color: 'var(--text-secondary)'
                      }}
                      title="Step forward 1 frame (slow-motion analysis)"
                      aria-label="Step forward 1 frame"
                    >
                      <StepForward size={14} />
                      <span className="hide-mobile">Step</span>
                    </button>
                  )}

                  {/* PhET Simulation Speed Toggle (1x / 0.25x Slow Motion) */}
                  {isAnimated && (
                    <button
                      type="button"
                      onClick={() => setSpeed((prev) => (prev === 1 ? 0.25 : 1))}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '7px 12px',
                        gap: 5,
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        color: speed === 0.25 ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        background: speed === 0.25 ? 'var(--brand-primary-soft)' : undefined,
                        borderColor: speed === 0.25 ? 'var(--brand-primary-border)' : undefined
                      }}
                      title="Toggle normal speed vs slow motion"
                      aria-label={`Simulation speed: ${speed === 1 ? 'Normal' : 'Slow motion'}`}
                    >
                      <Gauge size={14} />
                      <span>{speed === 1 ? '1x Normal' : '0.25x Slow'}</span>
                    </button>
                  )}

                  {/* PhET Iconic Circular Orange Reset Button */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="phet-reset-btn"
                    title="Reset all parameters and clock to initial state"
                    aria-label="Reset all parameters to default"
                  >
                    <RotateCcw size={16} strokeWidth={2.5} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsFullWindow(true)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '7px 14px',
                      gap: 6,
                      fontSize: '0.80rem',
                      fontWeight: 650,
                      color: 'var(--brand-primary)',
                      borderColor: 'var(--brand-primary-border)',
                      background: 'var(--brand-primary-soft)'
                    }}
                    title="Open full stage view with editorial theory"
                  >
                    <Maximize2 size={13} />
                    <span>Stage View</span>
                  </button>
                </div>
              </div>

                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span className="hide-mobile">Drag sliders to update live simulation</span>
                  <span className="show-mobile-only">Drag sliders or tap canvas to interact</span>
                </span>
              </div>
            </div>

          {/* BELOW: Complete Topic & Simulation Guide (Theory, Real-world Intuition, Formulas, Quiz) */}
          <div
            className="modal-guide"
            style={{
              padding: '24px 28px 48px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              background: 'var(--bg-secondary)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Guide Header & Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                paddingBottom: 16,
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-md)',
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Simulation Theory &amp; Concept Guide
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Physical intuition, governing equations, and instant concept checks
                  </span>
                </div>
              </div>

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
                  style={{ padding: '6px 16px' }}
                >
                  <Lightbulb size={14} />
                  <span>Intuition</span>
                </button>
                <button
                  onClick={() => setSideTab('formulas')}
                  className={`step-workflow-tab ${sideTab === 'formulas' ? 'active' : ''}`}
                  style={{ padding: '6px 16px' }}
                >
                  <BookOpen size={14} />
                  <span>Equations</span>
                </button>
                <button
                  onClick={() => setSideTab('quiz')}
                  className={`step-workflow-tab ${sideTab === 'quiz' ? 'active' : ''}`}
                  style={{ padding: '6px 16px' }}
                >
                  <HelpCircle size={14} />
                  <span>Practice Quiz</span>
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
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                    KEY TAKEAWAYS (CLASS 9–11)
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 10
                    }}
                  >
                    {topic.keyTakeaways.map((point, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: '0.84rem',
                          padding: '12px 14px',
                          background: 'var(--bg-glass-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
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
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 12
                  }}
                >
                  {topic.keyFormulas.map((f, i) => (
                    <div
                      key={i}
                      className="formula-card"
                      style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}
                    >
                      <div
                        style={{
                          fontSize: '1.08rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginBottom: 4,
                          textAlign: 'center',
                          padding: '10px 14px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          overflowX: 'auto'
                        }}
                      >
                        <MathView math={f.formula} block />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {f.explanation}
                      </div>
                      <button
                        onClick={() => handleSimulateFormula(f.formula)}
                        className="btn btn-primary btn-sm"
                        style={{
                          marginTop: 8,
                          alignSelf: 'flex-start',
                          padding: '5px 12px',
                          fontSize: '0.76rem',
                          gap: 6
                        }}
                      >
                        <Activity size={13} />
                        <span>Simulate This Formula</span>
                      </button>
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

      {/* Commercial & Classroom Modal Mounts */}
      {topic && currentSim && (
        <>
          <LabReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            topic={topic}
            simulation={currentSim}
            params={params}
            telemetry={telemetry}
          />

          <PresenterModeOverlay
            isActive={isPresenterModeActive}
            onClose={() => setIsPresenterModeActive(false)}
            simulationName={currentSim.name}
            topicTitle={topic.title}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={handleReset}
            telemetry={telemetry}
          />

          <AiMentorDrawer
            isOpen={isAiMentorOpen}
            onClose={() => setIsAiMentorOpen(false)}
            topic={topic}
            simulation={currentSim}
            params={params}
            telemetry={telemetry}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />

          <PricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};
