import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  id?: string;
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accentColor?: string;
  onChange: (value: number) => void;
  isHighlighted?: boolean;
  highlightLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accentColor = '#00F0FF',
  onChange,
  isHighlighted = false,
  highlightLabel,
  disabled = false,
  className = ''
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const [textValue, setTextValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize when value changes externally (unless user is typing)
  if (value !== prevValue) {
    setPrevValue(value);
    if (!isFocused) {
      setTextValue(String(value));
    }
  }

  // Calculate precision for clean floating point additions/subtractions
  const stepStr = step.toString();
  const precision = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;

  const handleStepDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    const nextVal = Math.max(min, parseFloat((value - step).toFixed(precision)));
    setTextValue(String(nextVal));
    onChange(nextVal);
  };

  const handleStepUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    const nextVal = Math.min(max, parseFloat((value + step).toFixed(precision)));
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
      setTextValue(String(min));
      onChange(min);
    } else {
      const clamped = Math.min(max, Math.max(min, parsed));
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
      id={id ? `stepper-${id}` : undefined}
      className={`stepper-component ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        borderRadius: 'var(--radius-md, 12px)',
        background: isHighlighted ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-glass-card, rgba(15, 23, 42, 0.65))',
        border: isHighlighted ? '1.5px solid var(--electric-blue, #00f0ff)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        boxShadow: isHighlighted ? '0 0 16px rgba(0, 240, 255, 0.35)' : 'var(--shadow-xs, 0 1px 3px rgba(0,0,0,0.2))',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Optional Equation / Formula Highlight Header */}
      {isHighlighted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill, 9999px)',
            background: 'rgba(0, 240, 255, 0.18)',
            color: 'var(--electric-blue, #00f0ff)',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}
        >
          <span>✨ {highlightLabel ? `Governs ${highlightLabel}` : 'Governs Equation'}</span>
        </div>
      )}

      {/* Label and Editable Number Badge Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isHighlighted ? 'var(--electric-blue, #00f0ff)' : 'var(--text-primary, #ffffff)'
            }}
          >
            {label}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={textValue}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            title={`Click to type number (${min} to ${max})`}
            className="control-number-badge-input font-mono"
            style={{
              width: '74px',
              padding: '4px 6px',
              textAlign: 'right',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-primary, #ffffff)',
              background: 'var(--bg-subtle, rgba(255, 255, 255, 0.07))',
              border: isFocused ? `1.5px solid ${accentColor}` : '1px solid var(--border-medium, rgba(255, 255, 255, 0.15))',
              borderRadius: 'var(--radius-xs, 6px)',
              outline: 'none',
              boxShadow: isFocused ? `0 0 0 2px ${accentColor}25` : 'none',
              transition: 'all 0.15s ease'
            }}
          />
          {unit && (
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary, #94a3b8)',
                fontWeight: 600,
                minWidth: '22px'
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Touch Ergonomic Stepper Slider Row: 44x44px [-] | Range Slider | 44x44px [+] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={handleStepDown}
          disabled={disabled || value <= min}
          className="phet-stepper-btn stepper-btn"
          title={`Decrease by ${step}`}
          aria-label={`Decrease ${label || 'value'} by ${step}`}
          style={{
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            flexShrink: 0,
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.16))',
            background: 'var(--bg-subtle, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-primary, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
            opacity: disabled || value <= min ? 0.35 : 1,
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <Minus size={16} strokeWidth={2.8} />
        </button>

        <div style={{ flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className="card-range-slider"
            style={{
              width: '100%',
              minHeight: '44px',
              height: '44px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              accentColor
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleStepUp}
          disabled={disabled || value >= max}
          className="phet-stepper-btn stepper-btn"
          title={`Increase by ${step}`}
          aria-label={`Increase ${label || 'value'} by ${step}`}
          style={{
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            flexShrink: 0,
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.16))',
            background: 'var(--bg-subtle, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-primary, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
            opacity: disabled || value >= max ? 0.35 : 1,
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <Plus size={16} strokeWidth={2.8} />
        </button>
      </div>

      {/* Min / Step / Max Helper Line */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary, #64748b)'
        }}
      >
        <span>Min: {min}</span>
        <span>Step: ±{step}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
};
