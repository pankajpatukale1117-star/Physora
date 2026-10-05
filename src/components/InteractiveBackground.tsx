import React from 'react';

/**
 * Clean scientific background.
 * Provides a quiet, distraction-free laboratory background with a subtle technical grid.
 * Zero CPU overhead, preserving 100% of performance for physics and math simulations.
 */
export const InteractiveBackground: React.FC = () => {
  return (
    <div
      className="scientific-bg-grid"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5,
        backgroundColor: 'var(--bg-primary)'
      }}
    />
  );
};
