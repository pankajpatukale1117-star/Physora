import React, { useEffect, useRef } from 'react';

/**
 * Professional Scientific Technical Background for Physora
 * 
 * Design philosophy:
 * - Clean, decent, executive-grade academic & laboratory aesthetic.
 * - Zero distracting neon particles, sparks, or gamey shockwaves.
 * - High-precision scientific coordinate grid with subtle reticle crosshairs.
 * - Smooth, calm harmonic wave ribbons (representing Fourier harmonics / gravitational waves).
 * - Gentle, physically damped Gaussian spacetime curvature following pointer interaction.
 * - Seamless automatic adaptation to Light (clean laboratory) and Dark (deep observatory) themes.
 * - High-DPI Retina scaling, buttery 60 FPS, battery & mobile friendly.
 */
export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Detect dark mode from html element attribute
    const checkDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    let isDark = checkDark();

    // Observe theme changes
    const themeObserver = new MutationObserver(() => {
      isDark = checkDark();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Resize & High-DPI scaling
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    handleResize();

    // Pointer state with smooth spring interpolation
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      influence: 0,
      targetInfluence: 0
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.targetInfluence = 1;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.targetInfluence = 0;
      pointer.active = false;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Grid configuration
    const cellSize = 56; // 56px technical grid
    const majorInterval = 4; // Major crosshairs every 4 cells (224px)

    // Harmonic wave ribbons parameters
    const waveCount = 3;
    const waves = [
      {
        baseYRatio: 0.28,
        amplitude: 22,
        wavelength: 0.0035,
        speed: 0.45,
        phase: 0,
        harmonicRatio: 0.35,
        colorLight: 'rgba(0, 119, 200, 0.12)',
        colorDark: 'rgba(56, 189, 248, 0.14)',
        fillLight: 'rgba(0, 119, 200, 0.025)',
        fillDark: 'rgba(56, 189, 248, 0.03)'
      },
      {
        baseYRatio: 0.52,
        amplitude: 28,
        wavelength: 0.0028,
        speed: 0.35,
        phase: 2.1,
        harmonicRatio: 0.4,
        colorLight: 'rgba(79, 70, 229, 0.10)',
        colorDark: 'rgba(129, 140, 248, 0.12)',
        fillLight: 'rgba(79, 70, 229, 0.015)',
        fillDark: 'rgba(129, 140, 248, 0.02)'
      },
      {
        baseYRatio: 0.78,
        amplitude: 20,
        wavelength: 0.0042,
        speed: 0.5,
        phase: 4.3,
        harmonicRatio: 0.3,
        colorLight: 'rgba(13, 148, 136, 0.09)',
        colorDark: 'rgba(45, 212, 191, 0.11)',
        fillLight: 'rgba(13, 148, 136, 0.015)',
        fillDark: 'rgba(45, 212, 191, 0.02)'
      }
    ];

    let lastTime = performance.now();
    let totalTime = 0;

    // Render loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += dt;

      // Smooth pointer interpolation
      pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-dt * 8));
      pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-dt * 8));
      pointer.influence += (pointer.targetInfluence - pointer.influence) * (1 - Math.exp(-dt * 6));

      // Clear viewport
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Laboratory Spotlight / Ambient Radial Vignette
      if (pointer.influence > 0.01 && pointer.x > -500) {
        const auraRadius = 380;
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          auraRadius
        );
        if (isDark) {
          grad.addColorStop(0, `rgba(56, 189, 248, ${0.06 * pointer.influence})`);
          grad.addColorStop(0.5, `rgba(99, 102, 241, ${0.03 * pointer.influence})`);
          grad.addColorStop(1, 'transparent');
        } else {
          grad.addColorStop(0, `rgba(0, 119, 200, ${0.05 * pointer.influence})`);
          grad.addColorStop(0.5, `rgba(14, 165, 233, ${0.02 * pointer.influence})`);
          grad.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. High-Precision Scientific Coordinate Grid
      // Minor grid lines
      const minorLineColor = isDark
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(15, 23, 42, 0.035)';
      const majorCrossColor = isDark
        ? 'rgba(56, 189, 248, 0.18)'
        : 'rgba(0, 119, 200, 0.16)';
      const majorDotColor = isDark
        ? 'rgba(255, 255, 255, 0.10)'
        : 'rgba(15, 23, 42, 0.09)';

      ctx.lineWidth = 1;

      // Draw vertical grid lines
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;

      ctx.strokeStyle = minorLineColor;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = c * cellSize + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // Draw horizontal grid lines
      for (let r = 0; r <= rows; r++) {
        const y = r * cellSize + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw Major Grid Reticle Crosshairs & Coordinate Dots
      const crossSize = 5;
      ctx.strokeStyle = majorCrossColor;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let c = 0; c <= cols; c += majorInterval) {
        const x = c * cellSize;
        for (let r = 0; r <= rows; r += majorInterval) {
          const y = r * cellSize;

          // Crosshair '+'
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
        }
      }
      ctx.stroke();

      // Subtle node dots at intermediate crossings
      ctx.fillStyle = majorDotColor;
      for (let c = majorInterval / 2; c <= cols; c += majorInterval) {
        const x = c * cellSize;
        for (let r = majorInterval / 2; r <= rows; r += majorInterval) {
          const y = r * cellSize;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // 3. Fluid Harmonic Wave Contours (Equipotential Curves / Standing Waves)
      // These represent calm, continuous physical field lines
      const stepX = 14; // Sampling resolution along x axis
      const samplePoints = Math.ceil(width / stepX) + 2;

      for (let wIdx = 0; wIdx < waveCount; wIdx++) {
        const wave = waves[wIdx];
        const baseY = height * wave.baseYRatio;
        const color = isDark ? wave.colorDark : wave.colorLight;
        const fillColor = isDark ? wave.fillDark : wave.fillLight;

        ctx.beginPath();
        for (let i = 0; i <= samplePoints; i++) {
          const px = i * stepX;

          // Primary harmonic + secondary octave
          const theta1 = px * wave.wavelength - totalTime * wave.speed + wave.phase;
          const theta2 = px * wave.wavelength * 2.2 + totalTime * wave.speed * 0.7;

          let py = baseY + Math.sin(theta1) * wave.amplitude + Math.cos(theta2) * (wave.amplitude * wave.harmonicRatio);

          // Gentle Spacetime Curvature (Gaussian well near pointer)
          if (pointer.influence > 0.01) {
            const dx = px - pointer.x;
            const dy = py - pointer.y;
            const distSq = dx * dx + dy * dy;
            const sigmaSq = 180 * 180; // 180px influence radius
            if (distSq < sigmaSq * 3) {
              const gaussian = Math.exp(-distSq / (2 * sigmaSq));
              // Gentle curvature displacement (downward grav well or upward harmonic ripple)
              py += gaussian * 26 * pointer.influence * (wIdx % 2 === 0 ? 1 : -0.8);
            }
          }

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        // Draw the sleek wave contour line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.35;
        ctx.stroke();

        // Subtle gradient fill under the wave line
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, baseY + 180);
        areaGrad.addColorStop(0, fillColor);
        areaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // 4. Elegant Minimal Technical Corner Coordinates (Authentic Scientific Reticle)
      ctx.save();
      ctx.font = '10px "JetBrains Mono", SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.26)';
      
      // Top right coordinate tag
      ctx.textAlign = 'right';
      ctx.fillText(`FIELD_REF // [${width}px × ${height}px]`, width - 24, 28);
      ctx.fillText('STATE: STEADY // HARMONICS: 3.0', width - 24, 42);

      // Bottom left reference tag
      ctx.textAlign = 'left';
      ctx.fillText('PHY_GRID: 56mm • SCALE: 1:1', 24, height - 20);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};
