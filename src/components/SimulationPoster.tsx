import React from 'react';

interface SimulationPosterProps {
  topicId: string;
  subject: 'maths' | 'physics' | 'biology';
  title: string;
}

export const SimulationPoster: React.FC<SimulationPosterProps> = ({ topicId, subject }) => {
  const isPhysics = subject === 'physics';

  switch (topicId) {
    // 1. Motion (Projectile Cannon & Parabolic Arc)
    case 'motion':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <defs>
            <linearGradient id="skyGrad-motion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#F0F9FF" />
            </linearGradient>
            <linearGradient id="cannonGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="360" height="160" fill="url(#skyGrad-motion)" />
          
          {/* Ground */}
          <rect x="0" y="135" width="360" height="25" fill="#E2E8F0" />
          <line x1="0" y1="135" x2="360" y2="135" stroke="#0284C7" strokeWidth="2.5" />
          
          {/* Distance Ticks */}
          {[60, 120, 180, 240, 300].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="135" x2={x} y2="142" stroke="#64748B" strokeWidth="1.5" />
              <text x={x} y="152" fontSize="9" fill="#64748B" textAnchor="middle" fontFamily="monospace">{(i + 1) * 20}m</text>
            </g>
          ))}

          {/* Dotted Parabolic Trajectory */}
          <path d="M 40 130 Q 150 15 270 135" fill="none" stroke="#0A66C2" strokeWidth="3" strokeDasharray="6 5" />
          
          {/* Peak Height Indicator */}
          <line x1="150" y1="135" x2="150" y2="44" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="150" cy="44" r="4" fill="#D97706" />
          <text x="156" y="52" fontSize="9" fill="#B45309" fontWeight="700" fontFamily="sans-serif">H_max</text>

          {/* Cannon Base & Barrel */}
          <circle cx="36" cy="132" r="14" fill="#64748B" />
          <rect x="30" y="112" width="28" height="12" rx="3" transform="rotate(-40 30 112)" fill="url(#cannonGrad)" stroke="#1E293B" strokeWidth="1.5" />
          
          {/* Flying Projectile Ball */}
          <circle cx="180" cy="62" r="7" fill="#FF6A00" stroke="#FFFFFF" strokeWidth="2" />
          
          {/* Velocity Vector Arrow */}
          <line x1="180" y1="62" x2="204" y2="76" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="208,78 200,74 204,82" fill="#059669" />
          <text x="210" y="74" fontSize="9" fill="#059669" fontWeight="800">v</text>

          {/* Target Flag at 270m */}
          <line x1="270" y1="135" x2="270" y2="105" stroke="#DC2626" strokeWidth="2" />
          <polygon points="270,105 290,113 270,121" fill="#DC2626" />
          <circle cx="270" cy="135" r="3" fill="#DC2626" />
        </svg>
      );

    // 2. Work, Energy & Power (Energy Skate Park with Bar Graph)
    case 'work_energy_power':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F0FDF4" />
          
          {/* U-Shaped Parabolic Skate Track */}
          <path d="M 40 40 Q 140 145 240 40" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
          <path d="M 40 45 Q 140 150 240 45" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />

          {/* Skater / Cart at low point */}
          <circle cx="110" cy="115" r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="102" y1="126" x2="118" y2="126" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="104" cy="128" r="2.5" fill="#64748B" />
          <circle cx="116" cy="128" r="2.5" fill="#64748B" />

          {/* Energy Bar Chart On Right (PhET Style) */}
          <g transform="translate(260, 25)">
            <rect x="0" y="0" width="85" height="110" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="42" y="16" fontSize="9" fontWeight="700" fill="#334155" textAnchor="middle">Energy (J)</text>
            
            {/* Kinetic Bar (Green) */}
            <rect x="15" y="45" width="16" height="55" rx="2" fill="#10B981" />
            <text x="23" y="108" fontSize="8" fontWeight="700" fill="#047857" textAnchor="middle">KE</text>

            {/* Potential Bar (Blue) */}
            <rect x="37" y="65" width="16" height="35" rx="2" fill="#3B82F6" />
            <text x="45" y="108" fontSize="8" fontWeight="700" fill="#1D4ED8" textAnchor="middle">PE</text>

            {/* Total Bar (Amber) */}
            <rect x="59" y="25" width="16" height="75" rx="2" fill="#F59E0B" />
            <text x="67" y="108" fontSize="8" fontWeight="700" fill="#B45309" textAnchor="middle">Tot</text>
          </g>
        </svg>
      );

    // 3. Optics & Light (Snell's Law Laser & Prism)
    case 'optics':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F8FAFC" />
          
          {/* Water/Glass Medium (Bottom Half) */}
          <rect x="0" y="80" width="360" height="80" fill="#E0F2FE" />
          <line x1="0" y1="80" x2="360" y2="80" stroke="#0284C7" strokeWidth="2" />
          <text x="14" y="70" fontSize="10" fill="#64748B" fontWeight="600">Air (n₁ = 1.0)</text>
          <text x="14" y="100" fontSize="10" fill="#0284C7" fontWeight="700">Glass (n₂ = 1.5)</text>

          {/* Normal Dashed Line */}
          <line x1="180" y1="20" x2="180" y2="140" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Incident Laser Beam */}
          <line x1="80" y1="30" x2="180" y2="80" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
          {/* Laser Pointer Housing */}
          <rect x="50" y="15" width="36" height="18" rx="3" transform="rotate(26.5 50 15)" fill="#334155" stroke="#0F172A" />

          {/* Reflected Beam (partial) */}
          <line x1="180" y1="80" x2="280" y2="30" stroke="#F87171" strokeWidth="2" strokeDasharray="2 2" />

          {/* Refracted Bent Beam (Snell's Law) */}
          <line x1="180" y1="80" x2="240" y2="150" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />

          {/* Angle Arcs */}
          <path d="M 180 55 A 25 25 0 0 0 156 68" fill="none" stroke="#D97706" strokeWidth="2" />
          <text x="160" y="58" fontSize="9" fontWeight="700" fill="#B45309">θ₁</text>

          <path d="M 180 110 A 30 30 0 0 0 198 102" fill="none" stroke="#D97706" strokeWidth="2" />
          <text x="186" y="118" fontSize="9" fontWeight="700" fill="#B45309">θ₂</text>
        </svg>
      );

    // 4. Thermodynamics (Piston, Gas Molecules & Carnot Engine)
    case 'thermodynamics':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#FFF7ED" />
          
          {/* Piston Cylinder Chamber */}
          <rect x="50" y="30" width="160" height="100" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="3" />
          
          {/* Piston Plate */}
          <rect x="145" y="32" width="16" height="96" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />
          <rect x="161" y="74" width="70" height="12" rx="2" fill="#94A3B8" />

          {/* Gas Molecules (Bouncing dots with motion lines) */}
          {[
            { x: 75, y: 55, r: 4, c: '#EF4444' },
            { x: 105, y: 70, r: 4.5, c: '#F97316' },
            { x: 80, y: 95, r: 4, c: '#EF4444' },
            { x: 125, y: 50, r: 3.5, c: '#3B82F6' },
            { x: 130, y: 105, r: 4, c: '#EF4444' },
            { x: 65, y: 80, r: 4.5, c: '#F97316' },
            { x: 110, y: 110, r: 3.5, c: '#3B82F6' },
            { x: 95, y: 45, r: 4, c: '#EF4444' }
          ].map((mol, i) => (
            <circle key={i} cx={mol.x} cy={mol.y} r={mol.r} fill={mol.c} />
          ))}

          {/* Heat Source (Flames below) */}
          <path d="M 75 142 Q 85 130 95 142 Q 105 130 115 142 Q 125 130 135 142" fill="none" stroke="#FF6A00" strokeWidth="3" strokeLinecap="round" />
          <text x="105" y="154" fontSize="9" fontWeight="700" fill="#EA580C" textAnchor="middle">Q_in (Heat)</text>

          {/* PV Diagram Card on Right */}
          <g transform="translate(240, 25)">
            <rect x="0" y="0" width="100" height="110" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="50" y="16" fontSize="9" fontWeight="700" fill="#334155" textAnchor="middle">Carnot PV Cycle</text>
            <line x1="20" y1="95" x2="90" y2="95" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="20" y1="95" x2="20" y2="25" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Carnot Cycle Loop */}
            <path d="M 35 45 C 50 48, 65 60, 75 75 C 65 85, 45 88, 30 82 Z" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="92" y="98" fontSize="8" fill="#64748B">V</text>
            <text x="14" y="30" fontSize="8" fill="#64748B">P</text>
          </g>
        </svg>
      );

    // 5. Newton's Laws (Ramp, Forces & Vector Decomposition)
    case 'newtons_laws':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F8FAFC" />
          
          {/* Inclined Wedge / Ramp */}
          <polygon points="40,135 280,135 280,45" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          
          {/* Ramp Angle Arc */}
          <path d="M 80 135 A 40 40 0 0 0 74 120" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <text x="85" y="130" fontSize="9" fontWeight="700" fill="#475569">θ = 30°</text>

          {/* Mass Block on Slope (rotated -20 deg) */}
          <g transform="translate(170, 85) rotate(-20.5)">
            <rect x="-24" y="-20" width="48" height="40" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <text x="0" y="4" fontSize="11" fontWeight="800" fill="#FFFFFF" textAnchor="middle">m</text>
            
            {/* Normal Force N (up perpendicular) */}
            <line x1="0" y1="-20" x2="0" y2="-55" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="0,-58 -4,-50 4,-50" fill="#10B981" />
            <text x="6" y="-45" fontSize="10" fontWeight="800" fill="#059669">N</text>

            {/* Friction Force f (up the ramp) */}
            <line x1="-24" y1="20" x2="-60" y2="20" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="-63,20 -55,16 -55,24" fill="#D97706" />
            <text x="-55" y="14" fontSize="9" fontWeight="800" fill="#B45309">f_k</text>
          </g>

          {/* Gravity Vector mg (straight down) */}
          <g transform="translate(170, 85)">
            <line x1="0" y1="0" x2="0" y2="48" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="0,52 -4,44 4,44" fill="#DC2626" />
            <text x="6" y="42" fontSize="10" fontWeight="800" fill="#DC2626">mg</text>
          </g>
        </svg>
      );

    // 6. Gravitation (Keplerian Orbit & Two-Body System)
    case 'gravitation':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#0B132B" />
          
          {/* Subtle Starfield */}
          {[
            { x: 30, y: 30 }, { x: 75, y: 80 }, { x: 120, y: 20 },
            { x: 260, y: 35 }, { x: 320, y: 85 }, { x: 290, y: 130 },
            { x: 50, y: 140 }, { x: 180, y: 15 }
          ].map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r="1.2" fill="#E2E8F0" opacity="0.6" />
          ))}

          {/* Elliptical Keplerian Orbit Line */}
          <ellipse cx="180" cy="80" rx="130" ry="55" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.7" />

          {/* Central Body (Planet Earth) at Focal Point */}
          <circle cx="150" cy="80" r="26" fill="#0284C7" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="140" cy="74" r="8" fill="#22C55E" opacity="0.7" />
          <circle cx="158" cy="88" r="10" fill="#22C55E" opacity="0.7" />
          <text x="150" y="84" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">M</text>

          {/* Satellite Orbiting Body */}
          <g transform="translate(290, 80)">
            <circle cx="0" cy="0" r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="3" fontSize="7" fontWeight="800" fill="#1E293B" textAnchor="middle">m</text>
            
            {/* Gravitational Force Vector to Center */}
            <line x1="0" y1="0" x2="-35" y2="0" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <polygon points="-38,0 -30,-3 -30,3" fill="#EF4444" />
            <text x="-25" y="-6" fontSize="8" fontWeight="800" fill="#F87171">F_g</text>

            {/* Velocity Tangent Vector */}
            <line x1="0" y1="0" x2="0" y2="-28" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <polygon points="0,-32 -3,-24 3,-24" fill="#10B981" />
            <text x="5" y="-20" fontSize="8" fontWeight="800" fill="#34D399">v</text>
          </g>
        </svg>
      );

    // 7. Waves & Sound (Transverse String & Longitudinal Pulses)
    case 'waves':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#EEF2FF" />
          
          {/* Axis Centerline */}
          <line x1="30" y1="80" x2="330" y2="80" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Harmonic Sine Wave with Beaded Nodes */}
          <path
            d="M 30 80 Q 75 15, 120 80 T 210 80 T 300 80 T 340 80"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Wavelength Indicator λ */}
          <line x1="75" y1="30" x2="255" y2="30" stroke="#0D9488" strokeWidth="1.5" />
          <line x1="75" y1="25" x2="75" y2="35" stroke="#0D9488" strokeWidth="1.5" />
          <line x1="255" y1="25" x2="255" y2="35" stroke="#0D9488" strokeWidth="1.5" />
          <text x="165" y="24" fontSize="10" fontWeight="700" fill="#0D9488" textAnchor="middle">Wavelength λ</text>

          {/* Amplitude Indicator A */}
          <line x1="75" y1="80" x2="75" y2="47" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="75" cy="47" r="4" fill="#EA580C" />
          <text x="82" y="68" fontSize="9" fontWeight="700" fill="#EA580C">Amp A</text>

          {/* Beaded Nodes */}
          {[30, 75, 120, 165, 210, 255, 300].map((nx, i) => (
            <circle key={i} cx={nx} cy={i % 2 === 0 ? 80 : (i === 1 ? 47 : 113)} r="4" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5" />
          ))}
        </svg>
      );

    // 8. Trigonometry (Unit Circle with Sine/Cosine Bars)
    case 'trigonometry':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#FAF5FF" />
          
          {/* Coordinate Axes */}
          <line x1="30" y1="80" x2="210" y2="80" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="120" y1="15" x2="120" y2="145" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Unit Circle (radius = 55) */}
          <circle cx="120" cy="80" r="55" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />

          {/* Angle 45° Point (cos 45, sin 45) -> (120 + 39, 80 - 39) */}
          {/* Radius Vector */}
          <line x1="120" y1="80" x2="159" y2="41" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Cosine Horizontal Bar (Blue) */}
          <line x1="120" y1="80" x2="159" y2="80" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
          <text x="140" y="94" fontSize="9" fontWeight="800" fill="#1D4ED8" textAnchor="middle">cos θ</text>

          {/* Sine Vertical Bar (Red) */}
          <line x1="159" y1="80" x2="159" y2="41" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          <text x="178" y="64" fontSize="9" fontWeight="800" fill="#DC2626">sin θ</text>

          {/* Angle Arc θ */}
          <path d="M 140 80 A 20 20 0 0 0 134 66" fill="none" stroke="#D97706" strokeWidth="2" />
          <text x="144" y="72" fontSize="9" fontWeight="800" fill="#B45309">θ</text>

          {/* P(cos θ, sin θ) Coordinate Dot */}
          <circle cx="159" cy="41" r="5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />

          {/* Unrolled Sine Wave on Right */}
          <g transform="translate(230, 20)">
            <rect x="0" y="0" width="115" height="120" rx="6" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="1" />
            <text x="58" y="16" fontSize="9" fontWeight="700" fill="#5B21B6" textAnchor="middle">y = sin(θ) Wave</text>
            <line x1="10" y1="65" x2="105" y2="65" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M 12 65 Q 35 25, 58 65 T 104 65" fill="none" stroke="#DC2626" strokeWidth="2.5" />
            <circle cx="35" cy="25" r="3" fill="#DC2626" />
          </g>
        </svg>
      );

    // 9. Basic Calculus (Secant to Tangent & Area Under Curve)
    case 'basic_calculus':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F5F3FF" />
          
          {/* Axes */}
          <line x1="40" y1="135" x2="330" y2="135" stroke="#94A3B8" strokeWidth="2" />
          <line x1="50" y1="145" x2="50" y2="20" stroke="#94A3B8" strokeWidth="2" />

          {/* Shaded Riemann Integral Area */}
          <path d="M 80 135 L 80 110 Q 150 70 240 30 L 240 135 Z" fill="#DDD6FE" opacity="0.6" />
          
          {/* Smooth Curve f(x) */}
          <path d="M 50 125 Q 150 70 290 20" fill="none" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Tangent Line at P(x, y) */}
          <line x1="90" y1="110" x2="230" y2="40" stroke="#059669" strokeWidth="2.5" />
          
          {/* Tangent Point P */}
          <circle cx="160" cy="75" r="5" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
          
          {/* Slope Triangle dy/dx */}
          <line x1="160" y1="75" x2="210" y2="75" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="210" y1="75" x2="210" y2="50" stroke="#DC2626" strokeWidth="2" strokeDasharray="3 3" />
          <text x="185" y="87" fontSize="9" fontWeight="700" fill="#2563EB" textAnchor="middle">dx</text>
          <text x="220" y="66" fontSize="9" fontWeight="700" fill="#DC2626">dy</text>
          <text x="145" y="60" fontSize="10" fontWeight="800" fill="#047857">Slope = dy/dx</text>
          <text x="160" y="125" fontSize="9" fontWeight="700" fill="#6D28D9" textAnchor="middle">∫ f(x) dx Area</text>
        </svg>
      );

    // 10. Algebra (Linear Intersections & Quadratic Parabola)
    case 'algebra':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F8FAFC" />
          
          {/* Grid lines */}
          <line x1="30" y1="80" x2="330" y2="80" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="180" y1="15" x2="180" y2="145" stroke="#E2E8F0" strokeWidth="1" />

          {/* Coordinate Axes */}
          <line x1="30" y1="80" x2="330" y2="80" stroke="#94A3B8" strokeWidth="2" />
          <line x1="180" y1="15" x2="180" y2="145" stroke="#94A3B8" strokeWidth="2" />

          {/* Linear Line 1: y = mx + c (Blue) */}
          <line x1="60" y1="130" x2="300" y2="30" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <text x="280" y="24" fontSize="9" fontWeight="700" fill="#0284C7">y = mx + c</text>

          {/* Linear Line 2: Intersecting Line (Purple) */}
          <line x1="80" y1="25" x2="260" y2="135" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />

          {/* Intersection Point (x, y) */}
          <circle cx="170" cy="80" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <text x="178" y="74" fontSize="9" fontWeight="800" fill="#EF4444">Solution (x, y)</text>
        </svg>
      );

    // 11. Coordinate Geometry (Distance formula & Points)
    case 'coordinate_geometry':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F8FAFC" />
          {/* Subtle grid */}
          <line x1="40" y1="130" x2="320" y2="130" stroke="#94A3B8" strokeWidth="2" />
          <line x1="50" y1="140" x2="50" y2="20" stroke="#94A3B8" strokeWidth="2" />
          
          {/* Right triangle connecting A(80, 110) to B(250, 45) */}
          <line x1="80" y1="110" x2="250" y2="110" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="250" y1="110" x2="250" y2="45" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="80" y1="110" x2="250" y2="45" stroke="#7C3AED" strokeWidth="3.5" />
          
          {/* Right angle symbol at (250, 110) */}
          <polyline points="240,110 240,100 250,100" fill="none" stroke="#64748B" strokeWidth="1.5" />

          {/* Points A and B */}
          <circle cx="80" cy="110" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
          <text x="65" y="125" fontSize="10" fontWeight="700" fill="#1D4ED8">A(x₁, y₁)</text>
          
          <circle cx="250" cy="45" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <text x="258" y="42" fontSize="10" fontWeight="700" fill="#EF4444">B(x₂, y₂)</text>

          {/* Distance label */}
          <text x="155" y="70" fontSize="11" fontWeight="800" fill="#7C3AED" transform="rotate(-21 155 70)">d = √[(Δx)² + (Δy)²]</text>
          <text x="165" y="124" fontSize="9" fontWeight="700" fill="#2563EB">Δx = x₂ - x₁</text>
          <text x="256" y="80" fontSize="9" fontWeight="700" fill="#059669">Δy = y₂ - y₁</text>
        </svg>
      );

    // 12. Functions (Mapping & Transformations)
    case 'functions':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#FAF5FF" />
          
          {/* Domain Set Ellipse */}
          <ellipse cx="90" cy="80" rx="50" ry="60" fill="#F3E8FF" stroke="#C084FC" strokeWidth="2" />
          <text x="90" y="32" fontSize="10" fontWeight="800" fill="#7E22CE" textAnchor="middle">Domain (X)</text>
          
          {/* Codomain Set Ellipse */}
          <ellipse cx="270" cy="80" rx="50" ry="60" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
          <text x="270" y="32" fontSize="10" fontWeight="800" fill="#5B21B6" textAnchor="middle">Codomain (Y)</text>

          {/* Domain points */}
          <circle cx="90" cy="55" r="4" fill="#7C3AED" />
          <text x="75" y="58" fontSize="9" fontWeight="700" fill="#7C3AED">1</text>
          
          <circle cx="90" cy="80" r="4" fill="#7C3AED" />
          <text x="75" y="83" fontSize="9" fontWeight="700" fill="#7C3AED">2</text>
          
          <circle cx="90" cy="105" r="4" fill="#7C3AED" />
          <text x="75" y="108" fontSize="9" fontWeight="700" fill="#7C3AED">3</text>

          {/* Codomain points */}
          <circle cx="270" cy="55" r="4" fill="#2563EB" />
          <text x="282" y="58" fontSize="9" fontWeight="700" fill="#2563EB">1</text>
          
          <circle cx="270" cy="80" r="4" fill="#2563EB" />
          <text x="282" y="83" fontSize="9" fontWeight="700" fill="#2563EB">4</text>
          
          <circle cx="270" cy="105" r="4" fill="#2563EB" />
          <text x="282" y="108" fontSize="9" fontWeight="700" fill="#2563EB">9</text>

          {/* Mapping Arrows */}
          <path d="M 94 55 Q 180 40 264 55" fill="none" stroke="#D97706" strokeWidth="2" markerEnd="url(#arrow)" />
          <polygon points="266,55 258,51 260,58" fill="#D97706" />

          <path d="M 94 80 Q 180 80 264 80" fill="none" stroke="#059669" strokeWidth="2" />
          <polygon points="266,80 258,76 260,83" fill="#059669" />

          <path d="M 94 105 Q 180 120 264 105" fill="none" stroke="#2563EB" strokeWidth="2" />
          <polygon points="266,105 260,101 258,108" fill="#2563EB" />

          {/* Function Rule Badge */}
          <rect x="140" y="65" width="80" height="28" rx="6" fill="#FFFFFF" stroke="#9333EA" strokeWidth="1.5" />
          <text x="180" y="83" fontSize="10" fontWeight="800" fill="#6B21A8" textAnchor="middle">f(x) = x²</text>
        </svg>
      );

    // 13. Sequences & Series (AP & GP Staircase)
    case 'sequences_series':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F0FDF4" />
          
          {/* Base ground line */}
          <line x1="30" y1="135" x2="330" y2="135" stroke="#94A3B8" strokeWidth="2" />

          {/* Arithmetic Progression Staircase Bars */}
          {[
            { x: 50, h: 25, label: 'a' },
            { x: 100, h: 45, label: 'a+d' },
            { x: 150, h: 65, label: 'a+2d' },
            { x: 200, h: 85, label: 'a+3d' },
            { x: 250, h: 105, label: 'a+4d' }
          ].map((bar, i) => (
            <g key={i}>
              <rect
                x={bar.x}
                y={135 - bar.h}
                width="34"
                height={bar.h}
                rx="4"
                fill="#10B981"
                stroke="#047857"
                strokeWidth="1.5"
              />
              <text
                x={bar.x + 17}
                y={130 - bar.h}
                fontSize="9"
                fontWeight="700"
                fill="#065F46"
                textAnchor="middle"
              >
                {bar.label}
              </text>
            </g>
          ))}

          {/* Progression Step Arrow */}
          <path d="M 50 100 L 290 20" fill="none" stroke="#D97706" strokeWidth="2.5" strokeDasharray="4 3" />
          <text x="210" y="38" fontSize="10" fontWeight="800" fill="#B45309">Common Diff +d</text>
          <text x="180" y="152" fontSize="9" fontWeight="700" fill="#64748B" textAnchor="middle">
            Arithmetic Series Sum: S_n = n/2 [2a + (n-1)d]
          </text>
        </svg>
      );

    // 14. Units & Measurements (Vernier Caliper & Error)
    case 'units_measurements':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill="#F8FAFC" />
          
          {/* Main Caliper Body Steel Bar */}
          <rect x="30" y="55" width="300" height="30" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
          
          {/* Main Scale Markings */}
          {[...Array(25)].map((_, i) => (
            <line
              key={i}
              x1={45 + i * 11}
              y1={55}
              x2={45 + i * 11}
              y2={i % 5 === 0 ? 70 : 63}
              stroke="#334155"
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
            />
          ))}
          <text x="45" y="79" fontSize="8" fill="#475569" fontFamily="monospace">0</text>
          <text x="100" y="79" fontSize="8" fill="#475569" fontFamily="monospace">1cm</text>
          <text x="155" y="79" fontSize="8" fill="#475569" fontFamily="monospace">2cm</text>
          <text x="210" y="79" fontSize="8" fill="#475569" fontFamily="monospace">3cm</text>

          {/* Jaws Holding a Cylinder / Sphere */}
          <rect x="30" y="85" width="20" height="55" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
          
          {/* Measured Object (Golden Brass Cylinder) */}
          <rect x="52" y="90" width="46" height="48" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <text x="75" y="118" fontSize="9" fontWeight="800" fill="#78350F" textAnchor="middle">Ø 4.2mm</text>

          {/* Movable Vernier Jaw */}
          <rect x="99" y="45" width="60" height="95" rx="3" fill="#94A3B8" opacity="0.3" />
          <rect x="99" y="85" width="20" height="55" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
          
          {/* Precision Badge */}
          <rect x="200" y="105" width="130" height="34" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
          <text x="265" y="120" fontSize="9" fontWeight="800" fill="#1D4ED8" textAnchor="middle">Least Count = 0.01 cm</text>
          <text x="265" y="132" fontSize="8" fontWeight="600" fill="#64748B" textAnchor="middle">Main + (Vernier × LC)</text>
        </svg>
      );

    // ==========================================
    // BIOLOGY POSTERS (PhET COLORADO BENCHMARK)
    // ==========================================
    case 'natural_selection':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <defs>
            <linearGradient id="bio-meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DCFCE7" />
              <stop offset="60%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>
          </defs>
          <rect width="360" height="160" fill="url(#bio-meadow)" />

          {/* Distant Hills */}
          <ellipse cx="90" cy="120" rx="140" ry="45" fill="#86EFAC" />
          <ellipse cx="280" cy="125" rx="160" ry="50" fill="#4ADE80" />

          {/* Wolf Silhouette in Distance */}
          <g transform="translate(260, 80) scale(0.7)">
            <ellipse cx="0" cy="0" rx="14" ry="7" fill="#334155" />
            <polygon points="10,-4 20,-1 12,5" fill="#334155" />
            <polygon points="7,-6 10,-14 13,-5" fill="#334155" />
            <rect x="-8" y="5" width="3" height="8" fill="#334155" />
            <rect x="6" y="5" width="3" height="8" fill="#334155" />
          </g>

          {/* Foreground Grass Clumps */}
          <line x1="40" y1="140" x2="35" y2="128" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="140" x2="42" y2="125" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="140" x2="47" y2="130" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />

          <line x1="200" y1="145" x2="195" y2="132" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          <line x1="200" y1="145" x2="204" y2="130" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />

          {/* White Bunny (Arctic Trait) */}
          <g transform="translate(100, 115)">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="10" cy="-6" r="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <ellipse cx="8" cy="-16" rx="3" ry="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <ellipse cx="8" cy="-16" rx="1.5" ry="5" fill="#FBCFE8" />
            <circle cx="13" cy="-7" r="1.5" fill="#1E293B" />
            <circle cx="-14" cy="-2" r="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="0" y="22" fontSize="9" fontWeight="700" fill="#166534" textAnchor="middle">White Fur</text>
          </g>

          {/* Brown Bunny (Savannah Mutation) */}
          <g transform="translate(180, 115)">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="10" cy="-6" r="8" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
            <ellipse cx="8" cy="-16" rx="3" ry="7" fill="#92400E" stroke="#78350F" strokeWidth="1" />
            <ellipse cx="8" cy="-16" rx="1.5" ry="5" fill="#D97706" />
            <circle cx="13" cy="-7" r="1.5" fill="#1E293B" />
            <circle cx="-14" cy="-2" r="4" fill="#92400E" stroke="#78350F" strokeWidth="1" />
            <text x="0" y="22" fontSize="9" fontWeight="700" fill="#78350F" textAnchor="middle">Brown Mutation</text>
          </g>

          {/* Mathematical Badge */}
          <rect x="18" y="14" width="135" height="30" rx="6" fill="rgba(255, 255, 255, 0.9)" stroke="#16A34A" strokeWidth="1.2" />
          <text x="85" y="28" fontSize="9" fontWeight="800" fill="#15803D" textAnchor="middle">p² + 2pq + q² = 1</text>
          <text x="85" y="39" fontSize="8" fontWeight="600" fill="#64748B" textAnchor="middle">Allele Equilibrium</text>
        </svg>
      );

    case 'gene_expression':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <defs>
            <linearGradient id="cell-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <rect width="360" height="160" fill="url(#cell-bg)" />

          {/* DNA Double Helix Strands */}
          <path d="M 20 60 Q 60 40 100 60 T 180 60 T 260 60 T 340 60" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M 20 60 Q 60 80 100 60 T 180 60 T 260 60 T 340 60" fill="none" stroke="#818CF8" strokeWidth="2.5" />

          {/* Base Pair Rungs */}
          {[40, 70, 100, 130, 230, 260, 290, 320].map((bx, i) => (
            <line key={i} x1={bx} y1={52} x2={bx} y2={68} stroke={['#EF4444', '#10B981', '#3B82F6', '#F59E0B'][i % 4]} strokeWidth="2" />
          ))}

          {/* RNA Polymerase Transcription Bubble */}
          <ellipse cx="180" cy="60" rx="32" ry="24" fill="#2563EB" stroke="#60A5FA" strokeWidth="2" opacity="0.9" />
          <text x="180" y="63" fontSize="9" fontWeight="800" fill="#FFFFFF" textAnchor="middle">RNA POL</text>

          {/* Emerging mRNA Transcript */}
          <path d="M 180 84 Q 160 110 120 115 T 40 120" fill="none" stroke="#F43F5E" strokeWidth="3" />
          <text x="80" y="110" fontSize="8" fontWeight="700" fill="#FECDD3">mRNA (5\'→3\')</text>

          {/* Ribosome Translating */}
          <ellipse cx="230" cy="115" rx="16" ry="12" fill="#059669" stroke="#34D399" strokeWidth="1.5" />
          <ellipse cx="230" cy="132" rx="12" ry="8" fill="#059669" stroke="#34D399" strokeWidth="1.5" />
          <text x="230" y="118" fontSize="7" fontWeight="800" fill="#FFFFFF" textAnchor="middle">RIBO</text>

          {/* Protein Peptide Chain */}
          {[1, 2, 3, 4, 5].map((aa) => (
            <circle key={aa} cx={250 + aa * 8} cy={110 - aa * 5} r="4" fill={['#F59E0B', '#3B82F6', '#EC4899', '#10B981'][aa % 4]} stroke="#FFFFFF" strokeWidth="1" />
          ))}

          {/* Central Dogma Pill */}
          <rect x="20" y="12" width="170" height="26" rx="5" fill="rgba(30, 41, 59, 0.9)" stroke="#38BDF8" strokeWidth="1" />
          <text x="105" y="28" fontSize="9" fontWeight="800" fill="#38BDF8" textAnchor="middle">DNA → mRNA → Protein</text>
        </svg>
      );

    case 'membrane_transport':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          {/* Extracellular Fluid (Top) */}
          <rect x="0" y="0" width="360" height="60" fill="#E0F2FE" />
          <text x="20" y="22" fontSize="9" fontWeight="800" fill="#0369A1">EXTRACELLULAR FLUID [High Solute]</text>

          {/* Intracellular Fluid (Bottom) */}
          <rect x="0" y="100" width="360" height="60" fill="#F0FDF4" />
          <text x="20" y="145" fontSize="9" fontWeight="800" fill="#15803D">CYTOPLASM [Low Solute]</text>

          {/* Phospholipid Bilayer Membrane */}
          <rect x="0" y="60" width="360" height="40" fill="#FEF3C7" />
          
          {/* Lipid Heads Top & Bottom */}
          {[10, 25, 40, 55, 70, 85, 100, 175, 190, 205, 220, 285, 300, 315, 330, 345].map((lx) => (
            <g key={lx}>
              <circle cx={lx} cy="60" r="4.5" fill="#F59E0B" />
              <line x1={lx} y1="64" x2={lx} y2="76" stroke="#D97706" strokeWidth="1.5" />
              <circle cx={lx} cy="100" r="4.5" fill="#F59E0B" />
              <line x1={lx} y1="96" x2={lx} y2="84" stroke="#D97706" strokeWidth="1.5" />
            </g>
          ))}

          {/* Transmembrane Channel Protein (Pore) */}
          <rect x="115" y="52" width="14" height="56" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.2" />
          <rect x="145" y="52" width="14" height="56" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.2" />
          <text x="137" y="44" fontSize="8" fontWeight="800" fill="#1D4ED8" textAnchor="middle">Ion Channel</text>

          {/* Solute moving down channel */}
          <circle cx="137" cy="80" r="4.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
          <path d="M 137 32 L 137 46 M 134 42 L 137 47 L 140 42" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />

          {/* Active ATP Pump */}
          <rect x="235" y="50" width="38" height="60" rx="6" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.5" />
          <text x="254" y="44" fontSize="8" fontWeight="800" fill="#6D28D9" textAnchor="middle">Na⁺/K⁺ Pump</text>
          <circle cx="254" cy="98" r="6" fill="#F59E0B" />
          <text x="254" y="101" fontSize="7" fontWeight="800" fill="#000" textAnchor="middle">ATP</text>

          {/* Floating Ions */}
          <circle cx="50" cy="35" r="4.5" fill="#38BDF8" />
          <circle cx="80" cy="25" r="4.5" fill="#38BDF8" />
          <circle cx="200" cy="30" r="4.5" fill="#38BDF8" />
          <circle cx="310" cy="38" r="4.5" fill="#38BDF8" />
          <circle cx="70" cy="125" r="4.5" fill="#38BDF8" />
        </svg>
      );

    case 'neuron':
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <defs>
            <linearGradient id="neuron-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0B0F19" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          <rect width="360" height="160" fill="url(#neuron-grad)" />

          {/* Neuron Cell Body (Soma) */}
          <circle cx="55" cy="80" r="22" fill="#F59E0B" opacity="0.85" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="55" cy="80" r="8" fill="#D97706" />

          {/* Branching Dendrites */}
          <line x1="40" y1="65" x2="15" y2="45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="95" x2="20" y2="115" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <line x1="33" y1="80" x2="10" y2="80" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

          {/* Axon Cylinder */}
          <rect x="75" y="74" width="270" height="12" rx="3" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />

          {/* Myelin Sheaths */}
          <rect x="90" y="68" width="45" height="24" rx="5" fill="#3B82F6" opacity="0.8" stroke="#93C5FD" strokeWidth="1.2" />
          <rect x="150" y="68" width="45" height="24" rx="5" fill="#3B82F6" opacity="0.8" stroke="#93C5FD" strokeWidth="1.2" />
          <rect x="210" y="68" width="45" height="24" rx="5" fill="#3B82F6" opacity="0.8" stroke="#93C5FD" strokeWidth="1.2" />
          <rect x="270" y="68" width="45" height="24" rx="5" fill="#3B82F6" opacity="0.8" stroke="#93C5FD" strokeWidth="1.2" />

          {/* Nodes of Ranvier Gaps (Action Potential Spark) */}
          <circle cx="142" cy="80" r="5" fill="#FACC15" />
          <line x1="142" y1="70" x2="142" y2="90" stroke="#FEF08A" strokeWidth="2" />

          {/* Oscilloscope Inset Window */}
          <rect x="200" y="102" width="145" height="50" rx="5" fill="#020617" stroke="#38BDF8" strokeWidth="1" />
          <line x1="200" y1="135" x2="345" y2="135" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
          <text x="206" y="112" fontSize="7" fontWeight="700" fill="#38BDF8">V_m (mV) Trace</text>
          
          {/* Action Potential Spike Curve */}
          <path d="M 205 135 L 240 135 Q 260 135 270 110 Q 275 106 280 138 Q 285 142 295 135 L 340 135" fill="none" stroke="#FACC15" strokeWidth="2" />
          <circle cx="273" cy="108" r="2.5" fill="#EF4444" />
          <text x="290" y="114" fontSize="7" fontWeight="800" fill="#EF4444">+30 mV</text>
        </svg>
      );

    // Fallback for any unknown topic
    default:
      return (
        <svg viewBox="0 0 360 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: '12px 12px 0 0' }}>
          <rect width="360" height="160" fill={isPhysics ? '#EFF6FF' : '#F5F3FF'} />
          <circle cx="180" cy="80" r="45" fill={isPhysics ? '#BFDBFE' : '#DDD6FE'} opacity="0.5" />
          <line x1="50" y1="80" x2="310" y2="80" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="140" cy="80" r="16" fill={isPhysics ? '#0A66C2' : '#7C3AED'} />
          <circle cx="220" cy="80" r="10" fill="#FF6A00" />
          <text x="180" y="140" fontSize="10" fontWeight="700" fill="#64748B" textAnchor="middle">
            Interactive Scientific Model
          </text>
        </svg>
      );
  }
};

