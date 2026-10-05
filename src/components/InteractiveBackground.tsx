import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  color: string;
  glowColor: string;
  phase: number;
  phaseSpeed: number;
  energy: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  trail: { x: number; y: number }[];
}

interface StardustSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
  strength: number;
  color: string;
}

/**
 * Hypnotic Interactive Physics Background
 * Features:
 * - Living vector flow field (Curl noise & harmonic stream mechanics)
 * - Autonomous celestial attractor tracing Lissajous curves (Galaxy spiral formation)
 * - Interactive pointer gravitational well & magnetic Lorentz swirl
 * - Propagating quantum wave shockwaves with transverse particle perturbation
 * - Radiant stardust spark emission on pointer gesture
 * - Dynamic constellation interference mesh
 * - Ultra-smooth 60fps canvas, High-DPI Retina scaling, mobile-optimized
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

    // Responsive setup
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    handleResize();

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 48 : 96;
    const connectionMaxDist = isMobile ? 115 : 155;
    const maxTrailLength = isMobile ? 3 : 6;

    // Palette with vibrant science accents
    const palette = [
      { fill: '#0077C8', glow: 'rgba(0, 119, 200, 0.45)', core: '#FFFFFF' }, // PhET Blue
      { fill: '#0284C7', glow: 'rgba(2, 132, 199, 0.45)', core: '#E0F2FE' },  // Electric Cyan
      { fill: '#FFC72C', glow: 'rgba(255, 199, 44, 0.55)', core: '#FFFBEB' }, // Sunflower Gold
      { fill: '#FF6600', glow: 'rgba(255, 102, 0, 0.5)', core: '#FFF7ED' },   // PhET Orange
      { fill: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.45)', core: '#F5F3FF' }, // Cosmic Violet
      { fill: '#059669', glow: 'rgba(5, 150, 105, 0.45)', core: '#ECFDF5' }   // Discovery Emerald
    ];

    // Pointer state
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      radius: isMobile ? 180 : 240,
      lastMoveTime: 0,
      speed: 0
    };

    // Stardust sparks array
    const sparks: StardustSpark[] = [];

    // Shockwaves array
    const shockwaves: Shockwave[] = [];

    // Autonomous wandering celestial attractor
    const celestial = {
      x: width * 0.5,
      y: height * 0.5,
      radius: isMobile ? 180 : 260,
      strength: 0.35
    };

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const pColor = palette[i % palette.length];
      const baseR = Math.random() * 2.0 + 1.8;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        baseRadius: baseR,
        radius: baseR,
        color: pColor.fill,
        glowColor: pColor.glow,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.025 + 0.015,
        energy: 0,
        orbitRadius: Math.random() * 80 + 30,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.03,
        trail: []
      });
    }

    // Ambient floating atmospheric nebulae
    const nebulae = [
      {
        x: width * 0.25,
        y: height * 0.3,
        r: Math.max(width, height) * 0.4,
        vx: 0.15,
        vy: 0.1,
        colorLight: 'rgba(0, 119, 200, 0.06)',
        colorDark: 'rgba(0, 119, 200, 0.14)'
      },
      {
        x: width * 0.75,
        y: height * 0.4,
        r: Math.max(width, height) * 0.45,
        vx: -0.12,
        vy: 0.14,
        colorLight: 'rgba(255, 199, 44, 0.05)',
        colorDark: 'rgba(255, 199, 44, 0.10)'
      },
      {
        x: width * 0.5,
        y: height * 0.8,
        r: Math.max(width, height) * 0.42,
        vx: 0.08,
        vy: -0.16,
        colorLight: 'rgba(139, 92, 246, 0.05)',
        colorDark: 'rgba(139, 92, 246, 0.12)'
      }
    ];

    // Pointer events on window
    let lastPointerX = -1000;
    let lastPointerY = -1000;

    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
      pointer.lastMoveTime = performance.now();

      // Calculate pointer speed
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      pointer.speed = Math.min(Math.hypot(dx, dy), 40);
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      // Spawn stardust sparks on pointer motion
      if (pointer.speed > 3 && sparks.length < 50) {
        const sparkCount = Math.min(Math.floor(pointer.speed / 6) + 1, 3);
        for (let s = 0; s < sparkCount; s++) {
          const sparkColor = palette[Math.floor(Math.random() * palette.length)].fill;
          sparks.push({
            x: e.clientX + (Math.random() - 0.5) * 16,
            y: e.clientY + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 2.2 - (dx * 0.08),
            vy: (Math.random() - 0.5) * 2.2 - (dy * 0.08),
            size: Math.random() * 2.4 + 1.2,
            color: sparkColor,
            life: 0,
            maxLife: Math.random() * 24 + 18
          });
        }
      }
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    };

    const onPointerDown = (e: PointerEvent) => {
      // Create multi-harmonic shockwaves
      const colors = ['#0077C8', '#FF6600', '#8B5CF6', '#FFC72C'];
      const shockColor = colors[Math.floor(Math.random() * colors.length)];

      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.55,
        speed: 360,
        opacity: 0.85,
        strength: 14,
        color: shockColor
      });

      // Energy burst into nearby particles
      for (const p of particles) {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < 260 && dist > 1) {
          const force = (1 - dist / 260) * 8.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.energy = 2.0;
        }
      }

      // Burst of stardust sparks
      for (let s = 0; s < 12; s++) {
        const angle = (Math.PI * 2 * s) / 12 + Math.random() * 0.3;
        const spd = Math.random() * 4.5 + 2.0;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 2.6 + 1.5,
          color: shockColor,
          life: 0,
          maxLife: Math.random() * 32 + 20
        });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    let lastTime = performance.now();

    // Main 60fps render loop
    const render = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;
      const t = now * 0.001;

      // Smooth pointer interpolation
      if (pointer.active) {
        pointer.x += (pointer.targetX - pointer.x) * 0.18;
        pointer.y += (pointer.targetY - pointer.y) * 0.18;
      } else {
        pointer.x = -1000;
        pointer.y = -1000;
      }

      // Check current theme
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Clear canvas with crisp backdrop
      ctx.clearRect(0, 0, width, height);

      // 1. Render atmospheric drifting celestial nebulae
      for (const neb of nebulae) {
        neb.x += neb.vx;
        neb.y += neb.vy;

        if (neb.x < -150 || neb.x > width + 150) neb.vx *= -1;
        if (neb.y < -150 || neb.y > height + 150) neb.vy *= -1;

        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
        grad.addColorStop(0, isDark ? neb.colorDark : neb.colorLight);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update autonomous celestial attractor (Lissajous cosmic orbit)
      celestial.x = width * 0.5 + Math.cos(t * 0.38) * (width * 0.32) + Math.sin(t * 0.72) * (width * 0.08);
      celestial.y = height * 0.5 + Math.sin(t * 0.44) * (height * 0.26) + Math.cos(t * 0.88) * (height * 0.08);

      // 3. Update & render shockwave wavefronts
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed * dt;
        sw.opacity -= dt * 0.55;

        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        // Draw primary ring
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity * (isDark ? 0.85 : 0.6);
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw secondary inner ripple
        if (sw.radius > 30) {
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius * 0.82, 0, Math.PI * 2);
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();

        // Wave perturbation force on particles
        for (const p of particles) {
          const dx = p.x - sw.x;
          const dy = p.y - sw.y;
          const dist = Math.hypot(dx, dy);
          const diff = Math.abs(dist - sw.radius);
          if (diff < 36 && dist > 1) {
            const push = ((36 - diff) / 36) * sw.strength * dt * 4.5;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
            p.energy = Math.min(2.5, p.energy + push * 0.8);
          }
        }
      }

      // 4. Update & render stardust sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spk = sparks[i];
        spk.x += spk.vx;
        spk.y += spk.vy;
        spk.vx *= 0.96;
        spk.vy *= 0.96;
        spk.life++;

        if (spk.life >= spk.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const sparkAlpha = (1 - spk.life / spk.maxLife) * (isDark ? 0.9 : 0.7);
        ctx.save();
        ctx.fillStyle = spk.color;
        ctx.globalAlpha = sparkAlpha;
        ctx.beginPath();
        ctx.arc(spk.x, spk.y, spk.size * (1 - spk.life / spk.maxLife * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Update particle physics & vector fluid flow field
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Harmonic breathing
        p.phase += p.phaseSpeed;
        p.orbitAngle += p.orbitSpeed;

        // Dynamic vector flow field (Curl noise approximation)
        const flowAngle =
          Math.sin(p.x * 0.0016 + t * 0.35) * Math.PI * 1.1 +
          Math.cos(p.y * 0.0016 - t * 0.3) * Math.PI * 1.1 +
          Math.sin((p.x + p.y) * 0.001 + t * 0.18) * 0.6;

        const flowForce = 0.28;
        p.vx += Math.cos(flowAngle) * flowForce * dt;
        p.vy += Math.sin(flowAngle) * flowForce * dt;

        // Autonomous celestial attractor (soft galactic swirling vortex)
        const cdx = celestial.x - p.x;
        const cdy = celestial.y - p.y;
        const cDist = Math.hypot(cdx, cdy);
        if (cDist < celestial.radius && cDist > 2) {
          const factor = (1 - cDist / celestial.radius) * celestial.strength;
          // Gravitational pull
          p.vx += (cdx / cDist) * factor * 0.35;
          p.vy += (cdy / cDist) * factor * 0.35;
          // Tangential orbital spin (galaxy spiral arms)
          p.vx += (-cdy / cDist) * factor * 0.45;
          p.vy += (cdx / cDist) * factor * 0.45;
        }

        // Pointer gravitational well & magnetic Lorentz swirl
        if (pointer.active) {
          const pdx = pointer.x - p.x;
          const pdy = pointer.y - p.y;
          const pDist = Math.hypot(pdx, pdy);

          if (pDist < pointer.radius && pDist > 2) {
            const pFactor = (1 - pDist / pointer.radius);
            // Magnetic radial pull
            p.vx += (pdx / pDist) * pFactor * 0.75;
            p.vy += (pdy / pDist) * pFactor * 0.75;
            // Lorentz orbital swirl (perpendicular torque)
            p.vx += (-pdy / pDist) * pFactor * 0.65;
            p.vy += (pdx / pDist) * pFactor * 0.65;
            p.energy = Math.min(2.5, p.energy + pFactor * 0.6);
          }
        }

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Gentle friction / damping for liquid stability
        p.vx *= 0.982;
        p.vy *= 0.982;
        p.energy *= 0.965;

        // Screen wrapping with smooth buffer
        const pad = 24;
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;

        // Update particle trailing ribbon
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > maxTrailLength) {
          p.trail.pop();
        }

        // Dynamic pulsing radius
        p.radius = p.baseRadius + Math.sin(p.phase) * 0.8 + p.energy * 2.2;
      }

      // 6. Draw particle trailing ribbons (hypnotic fluid traces)
      for (const p of particles) {
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            ctx.lineTo(p.trail[k].x, p.trail[k].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (isDark ? 0.28 : 0.16) * (1 + p.energy);
          ctx.lineWidth = Math.max(1, p.radius * 0.45);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // 7. Draw Connecting Constellation Interference Filaments
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionMaxDist) {
            const proximityRatio = 1 - dist / connectionMaxDist;
            const energyBoost = (p1.energy + p2.energy) * 0.5;
            const alpha = proximityRatio * (isDark ? 0.32 : 0.2) * (1 + energyBoost);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = proximityRatio * 1.6;
            ctx.strokeStyle = isDark
              ? `rgba(125, 211, 252, ${alpha})`
              : `rgba(0, 119, 200, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // 8. Draw Particle Nodes (Halo + Vibrant Body + Pure Center Spark)
      for (const p of particles) {
        // Outer soft glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.0, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.fill();

        // Solid vibrant colored core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // High-contrast white center spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.1, p.radius * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // 9. Draw pointer gravitational lensing aura if active
      if (pointer.active) {
        const pAura = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          pointer.radius * 0.75
        );
        pAura.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(0, 119, 200, 0.12)');
        pAura.addColorStop(0.5, isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 199, 44, 0.06)');
        pAura.addColorStop(1, 'transparent');

        ctx.fillStyle = pAura;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pointer.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Subtle rotating orbital ring around cursor
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(0, 119, 200, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 28, t * 2, t * 2 + Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
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
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block'
      }}
      aria-hidden="true"
    />
  );
};
