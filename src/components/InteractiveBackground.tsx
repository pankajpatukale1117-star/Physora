import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isMobile = width < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect theme
    let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Smooth Mouse / Touch tracking with spring physics
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      prevX: width / 2,
      prevY: height / 2,
      speed: 0
    };

    // Gravitational ripple shockwaves
    const ripples: Ripple[] = [];

    const handlePointerMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      const dist = Math.hypot(e.clientX - mouse.prevX, e.clientY - mouse.prevY);
      mouse.speed = dist;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;

      // Spawn subtle gravitational wave ripple on distinct mouse movements
      if (dist > 18 && ripples.length < 5 && !prefersReducedMotion) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: isMobile ? 80 : 140,
          alpha: 0.35
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobile = width < 768;
    };
    window.addEventListener('resize', handleResize);

    // -----------------------------------------------------------------
    // 1. Quantum Constellation Star-Nodes
    // -----------------------------------------------------------------
    const particleCount = isMobile ? 38 : 82;
    const colorsDark = ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7', '#C084FC'];
    const colorsLight = ['#0062FF', '#0091FF', '#6366F1', '#7C3AED', '#0284C7'];

    const particles: Particle[] = Array.from({ length: particleCount }).map(() => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.45),
        vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.45),
        radius: Math.random() * 1.8 + 1.0,
        color: colorsDark[Math.floor(Math.random() * colorsDark.length)],
        alpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2
      };
    });

    let t = 0;

    // -----------------------------------------------------------------
    // 2. Main High-Precision Render Loop
    // -----------------------------------------------------------------
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += prefersReducedMotion ? 0.004 : 0.012;

      // Spring follow for mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // --- A. Living Aurora Nebula Plasma Gradients (Atmospheric Depth) ---
      if (isDark) {
        // Deep Cosmos Void Base
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#02050E');
        bgGrad.addColorStop(0.5, '#04091A');
        bgGrad.addColorStop(1, '#02040C');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Nebula Plasma 1: Cyan-Azure Vortex (top right)
        const n1X = width * 0.65 + Math.sin(t * 0.5) * 120;
        const n1Y = height * 0.25 + Math.cos(t * 0.4) * 80;
        const n1Radius = Math.min(width, height) * 0.55;
        const n1Grad = ctx.createRadialGradient(n1X, n1Y, 0, n1X, n1Y, n1Radius);
        n1Grad.addColorStop(0, 'rgba(0, 240, 255, 0.09)');
        n1Grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.035)');
        n1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = n1Grad;
        ctx.fillRect(0, 0, width, height);

        // Nebula Plasma 2: Celestial Ultraviolet Nebula (center left)
        const n2X = width * 0.25 + Math.cos(t * 0.4) * 100;
        const n2Y = height * 0.65 + Math.sin(t * 0.6) * 90;
        const n2Radius = Math.min(width, height) * 0.52;
        const n2Grad = ctx.createRadialGradient(n2X, n2Y, 0, n2X, n2Y, n2Radius);
        n2Grad.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
        n2Grad.addColorStop(0.5, 'rgba(129, 140, 248, 0.03)');
        n2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = n2Grad;
        ctx.fillRect(0, 0, width, height);

        // Nebula Plasma 3: Deep Indigo Core
        const n3X = width * 0.5 + Math.sin(t * 0.3) * 70;
        const n3Y = height * 0.85;
        const n3Radius = Math.min(width, height) * 0.48;
        const n3Grad = ctx.createRadialGradient(n3X, n3Y, 0, n3X, n3Y, n3Radius);
        n3Grad.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
        n3Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = n3Grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Light Theme Laboratory Clean Ambient
        const bgGradLight = ctx.createLinearGradient(0, 0, 0, height);
        bgGradLight.addColorStop(0, '#F8FAFC');
        bgGradLight.addColorStop(1, '#EEF4FF');
        ctx.fillStyle = bgGradLight;
        ctx.fillRect(0, 0, width, height);

        const nLight = ctx.createRadialGradient(width * 0.5, height * 0.2, 0, width * 0.5, height * 0.2, width * 0.6);
        nLight.addColorStop(0, 'rgba(0, 98, 255, 0.06)');
        nLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = nLight;
        ctx.fillRect(0, 0, width, height);
      }

      // --- B. Scientific Coordinate Grid & Micro Cross Ticks ---
      ctx.save();
      const gridSpacing = isMobile ? 65 : 80;
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.022)' : 'rgba(0, 98, 255, 0.035)';
      ctx.lineWidth = 1;

      // Draw faint lines
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Intersection Cross Ticks (+)
      ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 98, 255, 0.15)';
      ctx.lineWidth = 1;
      const crossSize = 3;
      for (let x = gridSpacing; x < width; x += gridSpacing * 2) {
        for (let y = gridSpacing; y < height; y += gridSpacing * 2) {
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }
      ctx.restore();

      // --- C. Gravitational Wave Ripples (Spawned by Pointer) ---
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rip = ripples[rIdx];
        rip.radius += 2.2;
        rip.alpha *= 0.95;

        if (rip.alpha < 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(rIdx, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(0, 240, 255, ${rip.alpha * 0.4})`
          : `rgba(0, 98, 255, ${rip.alpha * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // --- D. Harmonic Wave Packet (Smooth Quantum Interference across lower third) ---
      ctx.save();
      const waveCenterY = height * 0.78 + Math.sin(t * 0.4) * 8;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const k1 = 0.008;
        const k2 = 0.024;
        const envelope = Math.sin(x * k1 + t * 0.6) * 18;
        const carrier = Math.cos(x * k2 - t * 1.2) * 8;
        const y = waveCenterY + envelope + carrier;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 98, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // --- E. Interactive Quantum Constellation & Gravitational Singularity ---
      const proximityDist = isMobile ? 65 : 100;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural Brownian Drift
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently off boundaries
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Gravitational Warp towards cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        const gravityRadius = isMobile ? 120 : 200;

        if (dist < gravityRadius && dist > 5) {
          const force = (1 - dist / gravityRadius) * 0.06;
          p.x += dx * force;
          p.y += dy * force;
        }

        // Particle Twinkle
        p.phase += p.twinkleSpeed;
        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));

        // Draw Star Node
        const particleColor = isDark ? p.color : colorsLight[i % colorsLight.length];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Node Glow Halo
        if (!isMobile && p.radius > 1.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.globalAlpha = currentAlpha * 0.15;
          ctx.fill();
        }

        // Connect nearby nodes with delicate filament synapses
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pDist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (pDist < proximityDist) {
            const lineAlpha = (1 - pDist / proximityDist) * (isDark ? 0.22 : 0.18);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark ? '#00F0FF' : '#0062FF';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
      }

      // --- F. Subtle Rotating Astrolabe / Orbital Ring (Desktop Corner Accents) ---
      if (!isMobile) {
        const astrolabeX = width * 0.88;
        const astrolabeY = height * 0.22;
        const ringRadius = 55;
        const spin = t * 0.2;

        ctx.save();
        ctx.translate(astrolabeX, astrolabeY);
        ctx.rotate(spin);

        // Dashed Celestial Orbit Ring
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(124, 58, 237, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // 3 Orbiting Celestial Electrons
        for (let o = 0; o < 3; o++) {
          const angle = (o * Math.PI * 2) / 3 + t * 0.8;
          const ox = Math.cos(angle) * ringRadius;
          const oy = Math.sin(angle) * ringRadius;
          ctx.beginPath();
          ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#00F0FF' : '#0062FF';
          ctx.fill();
        }

        ctx.restore();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};
