import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Gauge,
  Ruler,
  Compass,
  Timer,
  LineChart
} from 'lucide-react';
import type { ActiveInstruments } from '../types';

interface UniversalPlaybackBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward?: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  onReset: () => void;
  activeInstruments: ActiveInstruments;
  onToggleInstrument: (instrumentKey: keyof ActiveInstruments) => void;
  availableInstruments?: {
    ruler?: boolean;
    protractor?: boolean;
    stopwatch?: boolean;
    forceMeter?: boolean;
    multimeter?: boolean;
    liveGraph?: boolean;
  };
  className?: string;
}

export const UniversalPlaybackBar: React.FC<UniversalPlaybackBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  speed,
  onChangeSpeed,
  onReset,
  activeInstruments,
  onToggleInstrument,
  availableInstruments = {
    ruler: true,
    protractor: true,
    stopwatch: true,
    liveGraph: true
  },
  className = ''
}) => {
  const speeds = [0.25, 0.5, 1, 2];

  return (
    <div
      className={`universal-playback-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        padding: '6px 14px',
        background: 'rgba(15, 23, 42, 0.92)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 35,
        userSelect: 'none'
      }}
    >
      {/* Primary Playback Cluster: Play/Pause, Step, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={onTogglePlay}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {onStepForward && (
          <button
            type="button"
            onClick={onStepForward}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 9px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Step forward 1 frame"
          >
            <StepForward size={13} />
            <span className="desktop-only-inline">Step</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 9px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Reset Simulation State"
        >
          <RotateCcw size={13} />
          <span className="desktop-only-inline">Reset</span>
        </button>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
          <Gauge size={13} color="#94a3b8" />
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: 5, padding: 2 }}>
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: 'none',
                  background: speed === s ? 'var(--brand-primary, #3b82f6)' : 'transparent',
                  color: speed === s ? '#fff' : '#94a3b8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instruments & Tools Tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginRight: 2 }} className="desktop-only-inline">
          TOOLS:
        </span>

        {availableInstruments.ruler && (
          <button
            type="button"
            onClick={() => onToggleInstrument('ruler')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              background: activeInstruments.ruler ? 'rgba(14, 165, 233, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeInstruments.ruler ? '#0ea5e9' : 'rgba(255, 255, 255, 0.12)'}`,
              color: activeInstruments.ruler ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Toggle Measuring Ruler"
          >
            <Ruler size={13} />
            <span>Ruler</span>
          </button>
        )}

        {availableInstruments.protractor && (
          <button
            type="button"
            onClick={() => onToggleInstrument('protractor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              background: activeInstruments.protractor ? 'rgba(20, 184, 166, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeInstruments.protractor ? '#14b8a6' : 'rgba(255, 255, 255, 0.12)'}`,
              color: activeInstruments.protractor ? '#2dd4bf' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Toggle Protractor"
          >
            <Compass size={13} />
            <span>Protractor</span>
          </button>
        )}

        {availableInstruments.stopwatch && (
          <button
            type="button"
            onClick={() => onToggleInstrument('stopwatch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              background: activeInstruments.stopwatch ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeInstruments.stopwatch ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)'}`,
              color: activeInstruments.stopwatch ? '#60a5fa' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Toggle Stopwatch"
          >
            <Timer size={13} />
            <span>Timer</span>
          </button>
        )}

        {availableInstruments.liveGraph && (
          <button
            type="button"
            onClick={() => onToggleInstrument('liveGraph')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              background: activeInstruments.liveGraph ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeInstruments.liveGraph ? '#a855f7' : 'rgba(255, 255, 255, 0.12)'}`,
              color: activeInstruments.liveGraph ? '#c084fc' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Toggle Real-Time Graph"
          >
            <LineChart size={13} />
            <span>Graph</span>
          </button>
        )}
      </div>
    </div>
  );
};
