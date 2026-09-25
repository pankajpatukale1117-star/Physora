import React, { useEffect, useRef } from 'react';

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

    // Mouse & Touch tracking with smooth spring inertia
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0
    };

    const handlePointerMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };
    const handleScroll = () => {
      if (isMobile) {
        // Subtle scroll-based inertia on mobile
        mouse.targetY = ((window.scrollY * 0.4) % height);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobile = width < 768;
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 1. Floating Mathematical Symbols
    // -------------------------------------------------------------
    const mathSymbols = [
      { text: 'π', x: width * 0.12, y: height * 0.22, size: 28, color: '#0062FF', speed: 0.6 },
      { text: 'θ', x: width * 0.88, y: height * 0.28, size: 24, color: '#7C3AED', speed: 0.8 },
      { text: '√x', x: width * 0.08, y: height * 0.68, size: 22, color: '#00B4D8', speed: 0.5 },
      { text: 'x²', x: width * 0.92, y: height * 0.65, size: 24, color: '#0062FF', speed: 0.7 },
      { text: 'sin θ', x: width * 0.22, y: height * 0.82, size: 20, color: '#7C3AED', speed: 0.55 },
      { text: '∑', x: width * 0.82, y: height * 0.85, size: 28, color: '#0062FF', speed: 0.65 },
      { text: '+', x: width * 0.35, y: height * 0.15, size: 22, color: '#00E5FF', speed: 0.9 },
      { text: '÷', x: width * 0.68, y: height * 0.18, size: 22, color: '#EC4899', speed: 0.75 },
      { text: 'f(x)', x: width * 0.18, y: height * 0.45, size: 20, color: '#6366F1', speed: 0.5 },
      { text: 'Δx', x: width * 0.84, y: height * 0.48, size: 20, color: '#10B981', speed: 0.6 }
    ];

    // -------------------------------------------------------------
    // 2. Small Floating Particles (Anime.js style geometric dots)
    // -------------------------------------------------------------
    const particleCount = isMobile ? 15 : 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.6),
      vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.6),
      radius: isMobile ? (Math.random() * 2 + 1) : (Math.random() * 3 + 1.5),
      color: ['#0062FF', '#00E5FF', '#7C3AED', '#EC4899', '#38BDF8'][Math.floor(Math.random() * 5)],
      baseAlpha: isMobile ? (Math.random() * 0.25 + 0.12) : (Math.random() * 0.4 + 0.25)
    }));

    // -------------------------------------------------------------
    // 3. Orbiting Dots
    // -------------------------------------------------------------
    const orbits = [
      { cx: width * (isMobile ? 0.12 : 0.16), cy: height * 0.32, rx: isMobile ? 36 : 65, ry: isMobile ? 24 : 40, angle: 0, speed: isMobile ? 0.012 : 0.02, color: '#0062FF' },
      { cx: width * (isMobile ? 0.88 : 0.85), cy: height * 0.22, rx: isMobile ? 42 : 75, ry: isMobile ? 28 : 50, angle: Math.PI, speed: isMobile ? -0.01 : -0.018, color: '#7C3AED' }
    ];

    let t = 0;

    // -------------------------------------------------------------
    // Master Animation Loop (60 FPS)
    // -------------------------------------------------------------
    const animate = () => {
      animId = requestAnimationFrame(animate);
      isMobile = width < 768 || window.innerWidth < 768;
      t += prefersReducedMotion ? 0.003 : (isMobile ? 0.012 : 0.02);

      // Smooth mouse / touch follow with spring easing
      mouse.x += (mouse.targetX - mouse.x) * (isMobile ? 0.03 : 0.05);
      mouse.y += (mouse.targetY - mouse.y) * (isMobile ? 0.03 : 0.05);

      const parallaxX = (mouse.x - width / 2) * 0.035;
      const parallaxY = (mouse.y - height / 2) * 0.035;

      ctx.clearRect(0, 0, width, height);

      // --- Background Millimeter Grid ---
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // --- 1. Coordinate Axes Diagram (Left Side - Desktop Only) ---
      if (!isMobile) {
        const axisX = 70 + parallaxX * 0.5;
        const axisY = height * 0.52 + parallaxY * 0.5;
        ctx.save();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.lineWidth = 1.5;
        // Y axis
        ctx.beginPath();
        ctx.moveTo(axisX, axisY + 60);
        ctx.lineTo(axisX, axisY - 70);
        ctx.stroke();
        // Y arrow
        ctx.beginPath();
        ctx.moveTo(axisX - 4, axisY - 65);
        ctx.lineTo(axisX, axisY - 72);
        ctx.lineTo(axisX + 4, axisY - 65);
        ctx.stroke();
        // X axis
        ctx.beginPath();
        ctx.moveTo(axisX - 20, axisY);
        ctx.lineTo(axisX + 85, axisY);
        ctx.stroke();
        // X arrow
        ctx.beginPath();
        ctx.moveTo(axisX + 80, axisY - 4);
        ctx.lineTo(axisX + 87, axisY);
        ctx.lineTo(axisX + 80, axisY + 4);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#0062FF';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText('Y', axisX - 14, axisY - 68);
        ctx.fillText('X', axisX + 92, axisY + 4);
        ctx.fillText('(0,0)', axisX - 22, axisY + 16);

        // Simple Linear Graph y = mx
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(axisX - 15, axisY + 30);
        ctx.lineTo(axisX + 65, axisY - 50);
        ctx.stroke();
        ctx.fillStyle = '#00E5FF';
        ctx.font = '600 10px JetBrains Mono';
        ctx.fillText('y = mx + c', axisX + 20, axisY - 54);
        ctx.restore();
      }

      // --- 2. Simple Wave Motion (Transverse Wave across screen) ---
      ctx.save();
      const waveY = height * 0.38 + Math.sin(t * 0.5) * 8 + parallaxY * 0.8;
      ctx.beginPath();
      ctx.strokeStyle = isMobile ? 'rgba(0, 98, 255, 0.08)' : 'rgba(0, 98, 255, 0.18)';
      ctx.lineWidth = isMobile ? 1.5 : 2.5;
      ctx.setLineDash([5, 4]);

      for (let x = 0; x <= width; x += 10) {
        const y = waveY + Math.sin(x * 0.015 + t) * (isMobile ? 14 : 22);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Wave crest crest markers (Anime.js micro dots)
      if (!isMobile) {
        for (let x = 80; x < width - 80; x += 220) {
          const y = waveY + Math.sin(x * 0.015 + t) * 22;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0062FF';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.restore();

      // --- 3. Basic Physics Diagram: Simple Pendulum ---
      if (!isMobile) {
        const pendPivotX = width * 0.86 + parallaxX * 0.6;
        const pendPivotY = height * 0.42 + parallaxY * 0.6;
        const pendLen = 85;
        const maxAngle = 0.45;
        const pendTheta = Math.sin(t * 1.5) * maxAngle;
        const bobX = pendPivotX + Math.sin(pendTheta) * pendLen;
        const bobY = pendPivotY + Math.cos(pendTheta) * pendLen;

        ctx.save();
        // Ceiling line
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pendPivotX - 25, pendPivotY);
        ctx.lineTo(pendPivotX + 25, pendPivotY);
        ctx.stroke();

        // Cord
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(pendPivotX, pendPivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Angle Arc θ
        ctx.beginPath();
        ctx.arc(pendPivotX, pendPivotY, 26, Math.PI / 2 - Math.abs(pendTheta), Math.PI / 2 + Math.abs(pendTheta));
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#7C3AED';
        ctx.font = 'italic 11px STIX Two Text';
        ctx.fillText('θ', pendPivotX + 6, pendPivotY + 36);

        // Pendulum Bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#7C3AED';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Restoring force vector arrow
        const fvx = -Math.sin(pendTheta) * 28;
        const fvy = 0;
        drawSimpleArrow(ctx, bobX, bobY, bobX + fvx, bobY + fvy, '#0062FF', 'F');
        ctx.restore();
      }

      // --- 4. Basic Physics Diagram: Free-Fall Vector Ball (Desktop Only) ---
      if (!isMobile) {
        const ballX = width * 0.14 + parallaxX;
        const ballY = height * 0.84 + Math.sin(t * 2) * 16 + parallaxY;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0062FF';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Gravity acceleration vector downwards
        drawSimpleArrow(ctx, ballX, ballY + 8, ballX, ballY + 38, '#10B981', 'g = 9.8 m/s²');
        ctx.restore();
      }

      // --- 5. Orbiting Dots (Planetary / Atomic Circles) ---
      orbits.forEach(orb => {
        orb.angle += orb.speed;
        const ox = orb.cx + parallaxX * 0.4;
        const oy = orb.cy + parallaxY * 0.4;

        ctx.save();
        // Dashed elliptical orbit
        ctx.beginPath();
        ctx.ellipse(ox, oy, orb.rx, orb.ry, Math.PI / 6, 0, Math.PI * 2);
        ctx.strokeStyle = isMobile ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Orbiting planet dot
        const rot = Math.PI / 6;
        const rawX = Math.cos(orb.angle) * orb.rx;
        const rawY = Math.sin(orb.angle) * orb.ry;
        const px = ox + (rawX * Math.cos(rot) - rawY * Math.sin(rot));
        const py = oy + (rawX * Math.sin(rot) + rawY * Math.cos(rot));

        ctx.beginPath();
        ctx.arc(px, py, isMobile ? 3.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center hub
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 98, 255, 0.4)';
        ctx.fill();
        ctx.restore();
      });

      // --- 6. Floating Geometric Shapes (Desktop Only) ---
      if (!isMobile) {
        ctx.save();
        // Rotating Wireframe Triangle (Top Right)
        const triX = width * 0.76 + parallaxX * 0.5;
        const triY = height * 0.16 + parallaxY * 0.5;
        const triRot = t * 0.4;
        ctx.translate(triX, triY);
        ctx.rotate(triRot);
        ctx.beginPath();
        const r = 24;
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const tx = Math.cos(a) * r;
          const ty = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Rotating Square (Bottom Left)
        ctx.save();
        const sqX = width * 0.24 + parallaxX * 0.6;
        const sqY = height * 0.72 + parallaxY * 0.6;
        ctx.translate(sqX, sqY);
        ctx.rotate(-t * 0.3);
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-16, -16, 32, 32);
        ctx.restore();
      }

      // --- 7. Floating Mathematical Symbols ---
      ctx.save();
      mathSymbols.forEach((sym, i) => {
        // On mobile, position only along the perimeter so center text is 100% clean
        let symX = sym.x;
        if (isMobile) {
          symX = (i % 2 === 0) ? width * 0.08 : width * 0.92;
        }
        const floatY = sym.y + Math.sin(t * sym.speed + i) * (isMobile ? 5 : 12) + parallaxY * 0.7;
        const floatX = symX + Math.cos(t * sym.speed * 0.8 + i) * (isMobile ? 3 : 8) + parallaxX * 0.7;

        ctx.font = `600 ${isMobile ? Math.round(sym.size * 0.65) : sym.size}px "STIX Two Text", serif`;
        ctx.fillStyle = sym.color;
        ctx.globalAlpha = isMobile ? 0.14 : 0.55;
        ctx.fillText(sym.text, floatX, floatY);
      });
      ctx.restore();

      // --- 8. Small Animated Particles (Subtle Motion & Connections) ---
      ctx.save();
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle reaction to mouse / touch
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();

        // Connect nearby particles with gentle hair lines
        for (let j = idx + 1; j < Math.min(idx + 5, particleCount); j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 65) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(0, 98, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      ctx.restore();
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
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
        pointerEvents: 'none'
      }}
    />
  );
};

function drawSimpleArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label: string
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const headLen = 8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = '600 11px JetBrains Mono';
    ctx.fillText(label, toX + 6, toY + 3);
  }
  ctx.restore();
}
