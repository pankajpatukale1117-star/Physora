import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Award
} from 'lucide-react';
import { type TopicChallenge } from '../../data/challengesData';
import { audioFX } from '../../utils/audioEffects';

interface ChallengeModalWidgetProps {
  challenges: TopicChallenge[];
  currentParams: Record<string, number>;
  onApplyInitialParams: (params: Record<string, number>) => void;
  accentColor: string;
}

export const ChallengeModalWidget: React.FC<ChallengeModalWidgetProps> = ({
  challenges,
  currentParams,
  onApplyInitialParams,
  accentColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('physora_completed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHint, setShowHint] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId);

  // Auto-select first uncompleted challenge or first challenge on mount
  useEffect(() => {
    if (challenges.length > 0 && !activeChallengeId) {
      const firstUncompleted = challenges.find((c) => !completedIds.includes(c.id));
      setActiveChallengeId(firstUncompleted ? firstUncompleted.id : challenges[0].id);
    }
  }, [challenges, completedIds, activeChallengeId]);

  // Track real-time parameter accuracy toward active challenge goal
  const currentValue = activeChallenge ? (currentParams[activeChallenge.targetParamId] ?? 0) : 0;
  const targetValue = activeChallenge ? activeChallenge.targetValue : 0;
  const tolerance = activeChallenge ? activeChallenge.tolerance : 0.05;
  const delta = Math.abs(currentValue - targetValue);
  const isWithinTolerance = delta <= tolerance;

  // Percentage proximity to target (100% when within tolerance)
  const maxSpan = activeChallenge ? Math.max(Math.abs(targetValue) * 1.5, tolerance * 5, 1) : 1;
  const proximityPercent = Math.max(0, Math.min(100, Math.round((1 - delta / maxSpan) * 100)));

  // Hold-to-solve verification logic (must hold within tolerance for 1.0s to confirm deliberate solution)
  useEffect(() => {
    if (!activeChallenge || completedIds.includes(activeChallenge.id)) return;

    if (isWithinTolerance) {
      audioFX.playTargetLockTone();
      holdTimerRef.current = window.setTimeout(() => {
        setCompletedIds((prev) => {
          if (prev.includes(activeChallenge.id)) return prev;
          const next = [...prev, activeChallenge.id];
          try {
            localStorage.setItem('physora_completed_challenges', JSON.stringify(next));
          } catch {}
          return next;
        });
        setJustSolved(true);
        audioFX.playSuccessChime();
        setTimeout(() => setJustSolved(false), 3800);
      }, 1000);
    } else {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }

    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [isWithinTolerance, activeChallenge, completedIds]);

  if (challenges.length === 0) return null;

  const handleStartChallenge = (c: TopicChallenge) => {
    setActiveChallengeId(c.id);
    setShowHint(false);
    setJustSolved(false);
    if (c.initialParams) {
      onApplyInitialParams(c.initialParams);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioFX.setMuted(next);
  };

  return (
    <>
      {/* 1. Header Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          borderRadius: 20,
          background: activeChallengeId && completedIds.includes(activeChallengeId)
            ? 'rgba(34, 197, 94, 0.18)'
            : 'rgba(255, 255, 255, 0.08)',
          border: `1px solid ${
            activeChallengeId && completedIds.includes(activeChallengeId)
              ? 'rgba(34, 197, 94, 0.45)'
              : 'rgba(255, 255, 255, 0.16)'
          }`,
          color: activeChallengeId && completedIds.includes(activeChallengeId) ? '#4ade80' : 'var(--text-primary)',
          fontSize: '0.74rem',
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
        title="Interactive STEM Missions & Challenges"
      >
        <Trophy size={13} color={completedIds.length > 0 ? '#fbbf24' : accentColor} />
        <span>Missions ({completedIds.filter(id => challenges.some(c => c.id === id)).length}/{challenges.length})</span>
      </button>

      {/* 2. Floating Mission Card & Target Progress HUD */}
      {isOpen && (
        <div
          className="throughline-hud-panel"
          style={{
            position: 'absolute',
            top: 76,
            right: 20,
            width: 340,
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 160px)',
            background: 'rgba(10, 15, 28, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Award size={15} color="#fbbf24" />
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                STEM MISSIONS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleToggleMute}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4
                }}
                title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Active Challenge Spotlight */}
            {activeChallenge && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    completedIds.includes(activeChallenge.id) ? 'rgba(34, 197, 94, 0.35)' : 'rgba(56, 189, 248, 0.3)'
                  }`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.25rem' }}>{activeChallenge.badgeIcon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#f1f5f9' }}>
                        {activeChallenge.title}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        Reward: {activeChallenge.badgeName}
                      </span>
                    </div>
                  </div>

                  {completedIds.includes(activeChallenge.id) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 7px',
                        borderRadius: 12,
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid #22c55e',
                        color: '#4ade80',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}
                    >
                      <CheckCircle2 size={12} />
                      COMPLETED
                    </div>
                  )}
                </div>

                <p style={{ margin: '8px 0 10px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {activeChallenge.description}
                </p>

                {/* Live Target Accuracy Gauge */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem' }}>
                    <span style={{ color: '#94a3b8' }}>
                      Target: <strong style={{ color: '#38bdf8' }}>{activeChallenge.targetValue}{activeChallenge.unit ? ` ${activeChallenge.unit}` : ''}</strong> (±{activeChallenge.tolerance})
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: isWithinTolerance ? '#4ade80' : '#fbbf24' }}>
                      Current: {currentValue.toFixed(2)}{activeChallenge.unit ? ` ${activeChallenge.unit}` : ''}
                    </span>
                  </div>

                  {/* Proximity Progress Bar */}
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${isWithinTolerance ? 100 : proximityPercent}%`,
                        background: isWithinTolerance
                          ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                          : 'linear-gradient(90deg, #38bdf8, #818cf8)',
                        transition: 'width 0.2s ease, background 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: '0.66rem', color: isWithinTolerance ? '#4ade80' : '#94a3b8', fontWeight: isWithinTolerance ? 700 : 500 }}>
                      {isWithinTolerance ? '🎯 In Target Window! Hold steady...' : 'Adjust parameter sliders to align'}
                    </span>
                    {activeChallenge.initialParams && (
                      <button
                        type="button"
                        onClick={() => activeChallenge.initialParams && onApplyInitialParams(activeChallenge.initialParams)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={10} /> Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Hint Disclosure */}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fbbf24',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <HelpCircle size={12} />
                    <span>{showHint ? 'Hide Hint' : 'Need a Pedagogical Hint?'}</span>
                  </button>
                  {showHint && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: '6px 9px',
                        borderRadius: 6,
                        background: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        fontSize: '0.70rem',
                        color: '#fef08a',
                        lineHeight: 1.4
                      }}
                    >
                      💡 {activeChallenge.hint}
                    </div>
                  )}
                </div>

                {/* Solved Celebration Alert */}
                {justSolved && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'rgba(34, 197, 94, 0.22)',
                      border: '1px solid #22c55e',
                      color: '#4ade80',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{activeChallenge.successMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* All Topic Challenges Selector List */}
            <div>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                All Missions ({challenges.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                {challenges.map((c) => {
                  const isDone = completedIds.includes(c.id);
                  const isCur = activeChallengeId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleStartChallenge(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: 6,
                        background: isCur ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isCur ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isCur ? '#38bdf8' : '#e2e8f0',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span>{c.badgeIcon}</span>
                        <span>{c.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isDone && <CheckCircle2 size={13} color="#4ade80" />}
                        <ChevronRight size={13} style={{ opacity: 0.5 }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
