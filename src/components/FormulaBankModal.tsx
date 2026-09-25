import React, { useState } from 'react';
import { X, Search, BookOpen, ArrowRight } from 'lucide-react';

interface FormulaItem {
  id: string;
  name: string;
  category: 'Physics' | 'Mathematics';
  domain: string;
  latex: string;
  description: string;
  variables: { sym: string; name: string; unit: string }[];
  targetTopicId: string;
}

const FORMULAS_DATA: FormulaItem[] = [
  {
    id: 'f-kinematics-1',
    name: 'First Equation of Motion',
    category: 'Physics',
    domain: 'Kinematics',
    latex: 'v = u + at',
    description: 'Relates final velocity to initial velocity and constant acceleration over elapsed time.',
    variables: [
      { sym: 'v', name: 'Final Velocity', unit: 'm/s' },
      { sym: 'u', name: 'Initial Velocity', unit: 'm/s' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' },
      { sym: 't', name: 'Elapsed Time', unit: 's' }
    ],
    targetTopicId: 'motion'
  },
  {
    id: 'f-kinematics-2',
    name: 'Displacement with Constant Acceleration',
    category: 'Physics',
    domain: 'Kinematics',
    latex: 's = ut + \\frac{1}{2}at^2',
    description: 'Calculates position displacement from initial velocity and continuous acceleration.',
    variables: [
      { sym: 's', name: 'Displacement', unit: 'm' },
      { sym: 'u', name: 'Initial Velocity', unit: 'm/s' },
      { sym: 't', name: 'Time', unit: 's' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' }
    ],
    targetTopicId: 'motion'
  },
  {
    id: 'f-newton-2',
    name: "Newton's Second Law of Motion",
    category: 'Physics',
    domain: 'Dynamics',
    latex: 'F_{net} = ma = \\frac{dp}{dt}',
    description: 'Net external force equals rate of change of momentum (or mass times acceleration).',
    variables: [
      { sym: 'F', name: 'Net Force', unit: 'N (kg·m/s²)' },
      { sym: 'm', name: 'Inertial Mass', unit: 'kg' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' }
    ],
    targetTopicId: 'newtons_laws'
  },
  {
    id: 'f-work-energy',
    name: 'Kinetic Energy & Work-Energy Theorem',
    category: 'Physics',
    domain: 'Energy',
    latex: 'W_{net} = \\Delta K = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2',
    description: 'Net mechanical work done on an object equals the net change in its kinetic energy.',
    variables: [
      { sym: 'W', name: 'Work Done', unit: 'J (Joules)' },
      { sym: 'K', name: 'Kinetic Energy', unit: 'J' },
      { sym: 'm', name: 'Mass', unit: 'kg' },
      { sym: 'v', name: 'Velocity', unit: 'm/s' }
    ],
    targetTopicId: 'work_energy_power'
  },
  {
    id: 'f-gravitation',
    name: "Newton's Law of Universal Gravitation",
    category: 'Physics',
    domain: 'Gravitation',
    latex: 'F_g = G \\frac{M m}{r^2}',
    description: 'Every point mass attracts every other point mass with a force inversely proportional to distance squared.',
    variables: [
      { sym: 'F_g', name: 'Gravitational Force', unit: 'N' },
      { sym: 'G', name: 'Universal Constant', unit: '6.674×10⁻¹¹ N·m²/kg²' },
      { sym: 'M, m', name: 'Interacting Masses', unit: 'kg' },
      { sym: 'r', name: 'Orbital Radius / Separation', unit: 'm' }
    ],
    targetTopicId: 'gravitation'
  },
  {
    id: 'f-waves-speed',
    name: 'Universal Wave Equation',
    category: 'Physics',
    domain: 'Waves & Sound',
    latex: 'v = f \\lambda = \\frac{\\lambda}{T}',
    description: 'Propagation speed of any periodic wave equals frequency times wavelength.',
    variables: [
      { sym: 'v', name: 'Wave Propagation Speed', unit: 'm/s' },
      { sym: 'f', name: 'Frequency', unit: 'Hz (s⁻¹)' },
      { sym: 'λ', name: 'Wavelength', unit: 'm' },
      { sym: 'T', name: 'Period', unit: 's' }
    ],
    targetTopicId: 'waves'
  },
  {
    id: 'f-pythagorean-trig',
    name: 'Fundamental Pythagorean Identity',
    category: 'Mathematics',
    domain: 'Trigonometry',
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
    description: 'Geometric conservation of unit circle radius (x² + y² = 1) for any real angle θ.',
    variables: [
      { sym: 'θ', name: 'Angle', unit: 'Radians / Degrees' },
      { sym: 'sin θ', name: 'Vertical Component y', unit: 'Dimensionless' },
      { sym: 'cos θ', name: 'Horizontal Component x', unit: 'Dimensionless' }
    ],
    targetTopicId: 'trigonometry'
  },
  {
    id: 'f-calculus-power',
    name: 'Calculus Power Rule for Derivatives',
    category: 'Mathematics',
    domain: 'Calculus',
    latex: '\\frac{d}{dx}[x^n] = n x^{n-1}',
    description: 'Finds the exact instantaneous slope/gradient of polynomial curves at any point x.',
    variables: [
      { sym: 'd/dx', name: 'Derivative Operator', unit: 'Rate of change' },
      { sym: 'x', name: 'Independent Variable', unit: 'Arbitrary' },
      { sym: 'n', name: 'Power Exponent', unit: 'Real Number' }
    ],
    targetTopicId: 'basic_calculus'
  },
  {
    id: 'f-quadratic-formula',
    name: 'Quadratic Equation Roots & Discriminant',
    category: 'Mathematics',
    domain: 'Algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Finds the exact real or complex x-intercepts of any parabola ax² + bx + c = 0.',
    variables: [
      { sym: 'x', name: 'Parabola Roots', unit: 'Values' },
      { sym: 'b²-4ac', name: 'Discriminant (Δ)', unit: 'Determines real/complex roots' },
      { sym: 'a, b, c', name: 'Polynomial Coefficients', unit: 'Constants' }
    ],
    targetTopicId: 'algebra'
  },
  {
    id: 'f-circle-geometry',
    name: 'Standard Circle in Cartesian Plane',
    category: 'Mathematics',
    domain: 'Coordinate Geometry',
    latex: '(x - h)^2 + (y - k)^2 = r^2',
    description: 'Locus of all points equidistant from fixed center point (h, k).',
    variables: [
      { sym: '(h, k)', name: 'Circle Center', unit: 'Coordinates' },
      { sym: 'r', name: 'Circle Radius', unit: 'Length' }
    ],
    targetTopicId: 'coordinate_geometry'
  },
  {
    id: 'f-snells-law',
    name: "Snell's Law of Refraction",
    category: 'Physics',
    domain: 'Optics',
    latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
    description: 'Relates angle of incidence to angle of refraction across optical media with different refractive indices.',
    variables: [
      { sym: 'n₁, n₂', name: 'Refractive Indices', unit: 'Dimensionless' },
      { sym: 'θ₁', name: 'Angle of Incidence', unit: 'Degrees (°)' },
      { sym: 'θ₂', name: 'Angle of Refraction', unit: 'Degrees (°)' }
    ],
    targetTopicId: 'optics'
  },
  {
    id: 'f-thin-lens',
    name: 'Gaussian Thin Lens Equation',
    category: 'Physics',
    domain: 'Optics',
    latex: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}',
    description: 'Relates focal length f, image distance v, and object distance u for spherical lenses.',
    variables: [
      { sym: 'f', name: 'Focal Length', unit: 'm / mm' },
      { sym: 'v', name: 'Image Distance', unit: 'm / mm' },
      { sym: 'u', name: 'Object Distance', unit: 'm / mm' }
    ],
    targetTopicId: 'optics'
  },
  {
    id: 'f-ideal-gas',
    name: 'Ideal Gas Equation of State',
    category: 'Physics',
    domain: 'Thermodynamics',
    latex: 'P V = n R T',
    description: 'Macroscopic equation of state relating pressure, volume, substance quantity, and absolute temperature.',
    variables: [
      { sym: 'P', name: 'Gas Pressure', unit: 'Pa / kPa' },
      { sym: 'V', name: 'Volume', unit: 'm³ / Liters' },
      { sym: 'n', name: 'Amount of Substance', unit: 'mol' },
      { sym: 'R', name: 'Universal Gas Constant', unit: '8.314 J/(mol·K)' },
      { sym: 'T', name: 'Absolute Temperature', unit: 'K (Kelvin)' }
    ],
    targetTopicId: 'thermodynamics'
  },
  {
    id: 'f-carnot-efficiency',
    name: 'Carnot Heat Engine Maximum Efficiency',
    category: 'Physics',
    domain: 'Thermodynamics',
    latex: '\\eta_{Carnot} = 1 - \\frac{T_C}{T_H} = \\frac{W_{net}}{Q_H}',
    description: 'Upper physical bound on thermal efficiency for any engine operating between hot and cold heat reservoirs.',
    variables: [
      { sym: 'η', name: 'Thermal Efficiency', unit: 'Fraction (0 to 1)' },
      { sym: 'T_H', name: 'Hot Reservoir Temperature', unit: 'K' },
      { sym: 'T_C', name: 'Cold Reservoir Temperature', unit: 'K' },
      { sym: 'W_net', name: 'Net Work Output', unit: 'J' }
    ],
    targetTopicId: 'thermodynamics'
  }
];

interface FormulaBankModalProps {
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const FormulaBankModal: React.FC<FormulaBankModalProps> = ({ onClose, onSelectTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Physics' | 'Mathematics'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFormulas = FORMULAS_DATA.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        backgroundColor: 'rgba(7, 11, 20, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          border: '1px solid var(--border-electric)',
          background: 'var(--bg-glass-heavy)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-glass-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0062FF, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Formulas &amp; Variable Index
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Essential Class 11 formulas with SI units, derivations, and instant simulation links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            background: 'var(--bg-secondary)'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['All', 'Physics', 'Mathematics'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--electric-blue)' : 'var(--border-subtle)',
                  background: activeCategory === cat ? 'var(--electric-blue)' : 'var(--bg-glass-card)',
                  color: activeCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search formulas, variables, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-glass-card)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Formulas Grid */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredFormulas.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="formula-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: item.category === 'Physics' ? 'rgba(0, 98, 255, 0.12)' : 'rgba(124, 58, 237, 0.12)',
                        color: item.category === 'Physics' ? 'var(--electric-blue)' : 'var(--electric-violet)'
                      }}
                    >
                      {item.domain}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {isExpanded ? 'Hide Details' : 'Variable Details'}
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectTopic(item.targetTopicId);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-electric)',
                        background: 'var(--electric-blue-soft)',
                        color: 'var(--electric-blue)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>Simulate</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Equation Display Box */}
                <div
                  className="font-math"
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '1.25rem',
                    letterSpacing: '0.04em',
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                  }}
                >
                  {item.latex}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>

                {/* Expanded Variables Table */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Variables &amp; SI Units
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {item.variables.map((v, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                          <span className="font-mono" style={{ fontWeight: 800, color: 'var(--electric-blue)' }}>
                            {v.sym}:
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>{v.name}</span>
                          <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                            ({v.unit})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
