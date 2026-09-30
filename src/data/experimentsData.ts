export interface ExperimentControl {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  presets?: { label: string; value: number }[];
}

export interface ExperimentDiscovery {
  headline: string;
  relationship: string;
  detail: string;
  formula?: string;
}

export interface ExperimentItem {
  id: 'motion_exp' | 'force_exp' | 'gravity_exp' | 'spring_exp' | 'wave_exp' | 'vector_exp' | 'optics_exp' | 'energy_exp';
  title: string;
  shortDesc: string;
  level: 'Class 9' | 'Class 10' | 'Class 11';
  category: 'Kinematics' | 'Dynamics' | 'Gravity' | 'Elasticity' | 'Wave Physics' | 'Vectors' | 'Optics' | 'Energy & Work';
  question: string;
  accentColor: string;
  controls: ExperimentControl[];
  telemetryFields: { key: string; label: string; unit?: string }[];
  getDiscovery: (values: Record<string, number>) => ExperimentDiscovery;
}

export const EXPERIMENTS_DATA: ExperimentItem[] = [
  // 1. MOTION EXPERIMENT (Class 9)
  {
    id: 'motion_exp',
    title: 'Motion & Distance Discovery',
    shortDesc: 'Adjust speed and elapsed time to see how distance accumulates and watch the position-time graph draw live.',
    level: 'Class 9',
    category: 'Kinematics',
    question: 'How does changing velocity change the distance traveled over time?',
    accentColor: '#00F0FF',
    controls: [
      {
        id: 'velocity',
        label: 'Velocity (v)',
        min: 0,
        max: 30,
        step: 1,
        defaultValue: 12,
        unit: 'm/s',
        presets: [
          { label: 'Walking (2 m/s)', value: 2 },
          { label: 'Cycling (8 m/s)', value: 8 },
          { label: 'City Car (15 m/s)', value: 15 },
          { label: 'Highway (25 m/s)', value: 25 }
        ]
      },
      {
        id: 'time',
        label: 'Duration (t)',
        min: 1,
        max: 12,
        step: 0.5,
        defaultValue: 6,
        unit: 's',
        presets: [
          { label: 'Quick (3s)', value: 3 },
          { label: 'Medium (6s)', value: 6 },
          { label: 'Long (10s)', value: 10 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'velocity', label: 'Velocity (v)', unit: 'm/s' },
      { key: 'time', label: 'Elapsed Time (t)', unit: 's' },
      { key: 'distance', label: 'Total Distance (s)', unit: 'm' },
      { key: 'slope', label: 'Graph Slope (Δs/Δt)', unit: 'm/s' }
    ],
    getDiscovery: (vals) => {
      const v = vals.velocity ?? 12;
      const t = vals.time ?? 6;
      const dist = (v * t).toFixed(1);
      return {
        headline: 'Velocity × Time = Total Distance',
        relationship: 'Velocity increased → distance traveled increased proportionally.',
        detail: `At ${v} m/s for ${t} seconds, the object covers ${dist} meters. The slope of the distance-time graph directly equals velocity (${v} m/s). Doubling velocity doubles distance in the same time!`,
        formula: 's = v \\cdot t'
      };
    }
  },

  // 2. FORCE EXPERIMENT (Class 9 & 10)
  {
    id: 'force_exp',
    title: 'Force & Acceleration (F = ma)',
    shortDesc: 'Apply different push forces to different mass blocks and discover Newton’s Second Law.',
    level: 'Class 9',
    category: 'Dynamics',
    question: 'How do applied force and object mass determine acceleration?',
    accentColor: '#10B981',
    controls: [
      {
        id: 'force',
        label: 'Applied Push Force (F)',
        min: 2,
        max: 50,
        step: 1,
        defaultValue: 20,
        unit: 'N',
        presets: [
          { label: 'Gentle Push (5 N)', value: 5 },
          { label: 'Firm Push (20 N)', value: 20 },
          { label: 'Strong Push (40 N)', value: 40 }
        ]
      },
      {
        id: 'mass',
        label: 'Cart Mass (m)',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 2,
        unit: 'kg',
        presets: [
          { label: 'Light (1 kg)', value: 1 },
          { label: 'Medium (2 kg)', value: 2 },
          { label: 'Heavy (5 kg)', value: 5 },
          { label: 'Very Heavy (10 kg)', value: 10 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'force', label: 'Applied Force (F)', unit: 'N' },
      { key: 'mass', label: 'Mass (m)', unit: 'kg' },
      { key: 'accel', label: 'Acceleration (a = F/m)', unit: 'm/s²' },
      { key: 'forceVector', label: 'Force Vector', unit: 'N' }
    ],
    getDiscovery: (vals) => {
      const f = vals.force ?? 20;
      const m = vals.mass ?? 2;
      const a = (f / m).toFixed(2);
      return {
        headline: "Newton's Second Law: a = F / m",
        relationship: 'Force increased → acceleration increased. Mass increased → acceleration decreased.',
        detail: `Pushing a ${m} kg block with ${f} N produces an acceleration of ${a} m/s². Doubling the force doubles the acceleration, while doubling the mass cuts acceleration in half!`,
        formula: 'F = m \\cdot a \\implies a = \\frac{F}{m}'
      };
    }
  },

  // 3. GRAVITY EXPERIMENT (Class 9 & 10)
  {
    id: 'gravity_exp',
    title: 'Gravity & Free Fall Dropper',
    shortDesc: 'Drop objects across Earth, the Moon, Mars, and Jupiter to see how gravity governs fall time and impact speed.',
    level: 'Class 10',
    category: 'Gravity',
    question: 'Do heavier objects fall faster in gravity, and how does planetary gravity change fall time?',
    accentColor: '#F59E0B',
    controls: [
      {
        id: 'gravity',
        label: 'Gravity (g)',
        min: 1.6,
        max: 25,
        step: 0.1,
        defaultValue: 9.8,
        unit: 'm/s²',
        presets: [
          { label: 'Moon (1.6 m/s²)', value: 1.6 },
          { label: 'Mars (3.7 m/s²)', value: 3.7 },
          { label: 'Earth (9.8 m/s²)', value: 9.8 },
          { label: 'Jupiter (24.8 m/s²)', value: 24.8 }
        ]
      },
      {
        id: 'height',
        label: 'Drop Height (h)',
        min: 10,
        max: 100,
        step: 5,
        defaultValue: 45,
        unit: 'm',
        presets: [
          { label: '2-Story House (10 m)', value: 10 },
          { label: 'Pisa Tower (45 m)', value: 45 },
          { label: 'Skyscraper (100 m)', value: 100 }
        ]
      },
      {
        id: 'mass',
        label: 'Object Mass (m)',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
        unit: 'kg',
        presets: [
          { label: 'Tennis Ball (1 kg)', value: 1 },
          { label: 'Bowling Ball (5 kg)', value: 5 },
          { label: 'Iron Anvil (20 kg)', value: 20 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'gravity', label: 'Planet Gravity (g)', unit: 'm/s²' },
      { key: 'height', label: 'Drop Height (h)', unit: 'm' },
      { key: 'fallTime', label: 'Fall Time (t)', unit: 's' },
      { key: 'impactVel', label: 'Impact Speed (v)', unit: 'm/s' }
    ],
    getDiscovery: (vals) => {
      const g = vals.gravity ?? 9.8;
      const h = vals.height ?? 45;
      const m = vals.mass ?? 5;
      const t = Math.sqrt((2 * h) / g).toFixed(2);
      const v = Math.sqrt(2 * g * h).toFixed(1);
      const kmh = (parseFloat(v) * 3.6).toFixed(0);
      return {
        headline: 'Free Fall is Independent of Mass',
        relationship: 'Gravity increased → fall time decreased and impact velocity increased.',
        detail: `From ${h} m with g = ${g} m/s², the ${m} kg object hits the ground in ${t} seconds at ${v} m/s (${kmh} km/h). Notice that changing mass (1 kg vs 20 kg) makes zero difference to fall time—all masses accelerate equally in gravity!`,
        formula: 'v = \\sqrt{2gh}, \\quad t = \\sqrt{\\frac{2h}{g}}'
      };
    }
  },

  // 4. SPRING EXPERIMENT (Class 10 & 11)
  {
    id: 'spring_exp',
    title: "Spring Elasticity (Hooke's Law)",
    shortDesc: 'Stretch a coil spring with weights to uncover the direct linear relationship between pulling force and spring stretch.',
    level: 'Class 10',
    category: 'Elasticity',
    question: 'How does spring stiffness affect how far a spring stretches under load?',
    accentColor: '#8B5CF6',
    controls: [
      {
        id: 'force',
        label: 'Pulling Force / Weight (F)',
        min: 5,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: 'N',
        presets: [
          { label: 'Light Load (10 N)', value: 10 },
          { label: 'Medium Load (40 N)', value: 40 },
          { label: 'Heavy Load (80 N)', value: 80 }
        ]
      },
      {
        id: 'stiffness',
        label: 'Spring Constant / Stiffness (k)',
        min: 25,
        max: 200,
        step: 5,
        defaultValue: 100,
        unit: 'N/m',
        presets: [
          { label: 'Soft Spring (50 N/m)', value: 50 },
          { label: 'Medium Spring (100 N/m)', value: 100 },
          { label: 'Stiff Spring (180 N/m)', value: 180 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'force', label: 'Pulling Force (F)', unit: 'N' },
      { key: 'stiffness', label: 'Stiffness (k)', unit: 'N/m' },
      { key: 'extension', label: 'Extension (x = F/k)', unit: 'm' },
      { key: 'storedPE', label: 'Elastic Energy (PE)', unit: 'J' }
    ],
    getDiscovery: (vals) => {
      const f = vals.force ?? 40;
      const k = vals.stiffness ?? 100;
      const x = f / k;
      const cm = (x * 100).toFixed(1);
      const pe = (0.5 * k * x * x).toFixed(2);
      return {
        headline: "Hooke's Law: F = k · x",
        relationship: 'Force increased → spring extension increased. Stiffer spring → stretched less.',
        detail: `Applying ${f} N to a spring with stiffness ${k} N/m causes an elongation of ${x.toFixed(2)} m (${cm} cm) storing ${pe} J of elastic potential energy. Extension is directly proportional to applied force!`,
        formula: 'F = k \\cdot x \\implies x = \\frac{F}{k}, \\quad PE = \\frac{1}{2} k x^2'
      };
    }
  },

  // 5. WAVE EXPERIMENT (Class 9 & 11)
  {
    id: 'wave_exp',
    title: 'Wave Frequency & Wavelength',
    shortDesc: 'Vibrate a wave medium and observe how frequency changes wavelength while wave speed remains constant.',
    level: 'Class 9',
    category: 'Wave Physics',
    question: 'What happens to wavelength when you increase oscillation frequency?',
    accentColor: '#38BDF8',
    controls: [
      {
        id: 'frequency',
        label: 'Frequency (f)',
        min: 0.5,
        max: 3.5,
        step: 0.25,
        defaultValue: 1.5,
        unit: 'Hz',
        presets: [
          { label: 'Slow (0.8 Hz)', value: 0.8 },
          { label: 'Medium (1.5 Hz)', value: 1.5 },
          { label: 'Fast (3.0 Hz)', value: 3.0 }
        ]
      },
      {
        id: 'amplitude',
        label: 'Wave Amplitude (A)',
        min: 15,
        max: 60,
        step: 5,
        defaultValue: 35,
        unit: 'px',
        presets: [
          { label: 'Small Ripple (20 px)', value: 20 },
          { label: 'Medium Wave (35 px)', value: 35 },
          { label: 'Large Wave (55 px)', value: 55 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'frequency', label: 'Frequency (f)', unit: 'Hz' },
      { key: 'amplitude', label: 'Amplitude (A)', unit: 'px' },
      { key: 'wavelength', label: 'Wavelength (λ)', unit: 'px' },
      { key: 'period', label: 'Period (T = 1/f)', unit: 's' }
    ],
    getDiscovery: (vals) => {
      const f = vals.frequency ?? 1.5;
      const a = vals.amplitude ?? 35;
      const v = 150; // wave speed in virtual px/s
      const lambda = (v / f).toFixed(0);
      const t = (1 / f).toFixed(2);
      return {
        headline: 'Wave Speed Equation: v = f · λ',
        relationship: 'Frequency increased → wavelength decreased (crests bunched closer together).',
        detail: `Oscillating at ${f} Hz with amplitude ${a} px produces a wavelength of ${lambda} px and period of ${t} s. Because speed v is constant in this medium, doubling frequency halves the wavelength!`,
        formula: 'v = f \\cdot \\lambda \\implies \\lambda = \\frac{v}{f}'
      };
    }
  },

  // 6. VECTOR EXPERIMENT (Class 11)
  {
    id: 'vector_exp',
    title: 'Vector Resolution & Components',
    shortDesc: 'Rotate and stretch a force vector arrow to see how it splits into horizontal (X) and vertical (Y) components.',
    level: 'Class 11',
    category: 'Vectors',
    question: 'How do an angle and magnitude determine the X and Y components of a vector?',
    accentColor: '#EC4899',
    controls: [
      {
        id: 'magnitude',
        label: 'Vector Magnitude (R)',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 50,
        unit: 'N',
        presets: [
          { label: 'Small (20 N)', value: 20 },
          { label: 'Medium (50 N)', value: 50 },
          { label: 'Large (75 N)', value: 75 }
        ]
      },
      {
        id: 'angle',
        label: 'Direction Angle (θ)',
        min: 0,
        max: 90,
        step: 1,
        defaultValue: 35,
        unit: '°',
        presets: [
          { label: 'Horizontal (0°)', value: 0 },
          { label: 'Standard (30°)', value: 30 },
          { label: 'Balanced (45°)', value: 45 },
          { label: 'Vertical (90°)', value: 90 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'magnitude', label: 'Magnitude (R)', unit: 'N' },
      { key: 'angle', label: 'Angle (θ)', unit: '°' },
      { key: 'xComp', label: 'X Component (R cosθ)', unit: 'N' },
      { key: 'yComp', label: 'Y Component (R sinθ)', unit: 'N' }
    ],
    getDiscovery: (vals) => {
      const r = vals.magnitude ?? 50;
      const deg = vals.angle ?? 35;
      const rad = (deg * Math.PI) / 180;
      const rx = (r * Math.cos(rad)).toFixed(1);
      const ry = (r * Math.sin(rad)).toFixed(1);
      return {
        headline: 'Vector Decomposition on Orthogonal Axes',
        relationship: 'Angle increased → Y component increased, X component decreased.',
        detail: `A vector of ${r} N at ${deg}° resolves into ${rx} N horizontally and ${ry} N vertically. At 0°, the vector is 100% horizontal; at 90°, it is 100% vertical. Pythagoras verifies: √(${rx}² + ${ry}²) = ${r} N!`,
        formula: 'R_x = R \\cos\\theta, \\quad R_y = R \\sin\\theta'
      };
    }
  },

  // 7. OPTICS & REFRACTION EXPERIMENT (Class 10)
  {
    id: 'optics_exp',
    title: "Snell's Law & Refraction Lab",
    shortDesc: 'Shoot an incident laser across optical interfaces to observe how light bends toward or away from the normal and discover Total Internal Reflection.',
    level: 'Class 10',
    category: 'Optics',
    question: 'How do refractive indices determine light bending, and at what critical angle does light completely reflect?',
    accentColor: '#00F0FF',
    controls: [
      {
        id: 'angle',
        label: 'Incident Angle (θ₁)',
        min: 0,
        max: 85,
        step: 1,
        defaultValue: 35,
        unit: '°',
        presets: [
          { label: 'Normal (0°)', value: 0 },
          { label: 'Moderate (30°)', value: 30 },
          { label: 'Steep (45°)', value: 45 },
          { label: 'Glancing (60°)', value: 60 }
        ]
      },
      {
        id: 'n1',
        label: 'Medium 1 Index (n₁)',
        min: 1.0,
        max: 2.4,
        step: 0.05,
        defaultValue: 1.0,
        unit: '',
        presets: [
          { label: 'Air (1.00)', value: 1.0 },
          { label: 'Water (1.33)', value: 1.33 },
          { label: 'Glass (1.50)', value: 1.5 }
        ]
      },
      {
        id: 'n2',
        label: 'Medium 2 Index (n₂)',
        min: 1.0,
        max: 2.4,
        step: 0.05,
        defaultValue: 1.5,
        unit: '',
        presets: [
          { label: 'Air (1.00)', value: 1.0 },
          { label: 'Water (1.33)', value: 1.33 },
          { label: 'Glass (1.50)', value: 1.5 },
          { label: 'Diamond (2.42)', value: 2.42 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'theta1', label: 'Incident Angle (θ₁)', unit: '°' },
      { key: 'theta2', label: 'Refracted Angle (θ₂)' },
      { key: 'critAngle', label: 'Critical Angle (θ_c)' },
      { key: 'status', label: 'Optical Regime' }
    ],
    getDiscovery: (vals) => {
      const t1 = vals.angle ?? 35;
      const n1 = vals.n1 ?? 1.0;
      const n2 = vals.n2 ?? 1.5;
      const sinT1 = Math.sin((t1 * Math.PI) / 180);
      const sinT2 = (n1 / n2) * sinT1;
      const isTIR = sinT2 > 1.0;
      const t2 = isTIR ? 'TIR' : ((Math.asin(sinT2) * 180) / Math.PI).toFixed(1) + '°';
      const crit = n1 > n2 ? ((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1) + '°' : 'None (n₁ ≤ n₂)';

      if (isTIR) {
        return {
          headline: 'Total Internal Reflection (TIR) Occurs!',
          relationship: `Incident angle (${t1}°) exceeds the critical angle (${crit}). Light cannot escape Medium 1!`,
          detail: `Because n₁ (${n1}) > n₂ (${n2}) and sin(θ₁) > n₂/n₁, 100% of the light reflects back inside Medium 1. This exact optical trap allows modern fiber-optic cables to transmit high-speed data across oceans!`,
          formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\implies \\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right)'
        };
      }

      const bends = Number(parseFloat(t2)) < t1 ? 'toward the normal (denser medium)' : 'away from the normal (rarer medium)';
      return {
        headline: "Snell's Law: n₁ sin θ₁ = n₂ sin θ₂",
        relationship: `Light bends ${bends} as it passes from n₁=${n1} to n₂=${n2}.`,
        detail: `At an incident angle of ${t1}°, light enters Medium 2 at ${t2}. The index ratio (n₁/n₂ = ${(n1 / n2).toFixed(2)}) governs refraction. Light slows down in higher index media, bending closer to the perpendicular normal line.`,
        formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\implies \\theta_2 = \\arcsin\\left(\\frac{n_1}{n_2}\\sin\\theta_1\\right)'
      };
    }
  },

  // 8. ENERGY CONSERVATION EXPERIMENT (Class 9 & 11)
  {
    id: 'energy_exp',
    title: 'Conservation of Mechanical Energy',
    shortDesc: 'Track a mass oscillating in a frictionless parabolic bowl to observe the continuous dynamic exchange between Potential Energy and Kinetic Energy.',
    level: 'Class 9',
    category: 'Energy & Work',
    question: 'How do kinetic energy and potential energy trade off while total mechanical energy stays invariant?',
    accentColor: '#10B981',
    controls: [
      {
        id: 'height',
        label: 'Release Height (h₀)',
        min: 2,
        max: 20,
        step: 1,
        defaultValue: 10,
        unit: 'm',
        presets: [
          { label: 'Low (4 m)', value: 4 },
          { label: 'Medium (10 m)', value: 10 },
          { label: 'High (18 m)', value: 18 }
        ]
      },
      {
        id: 'mass',
        label: 'Bob Mass (m)',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 2,
        unit: 'kg',
        presets: [
          { label: 'Light (1 kg)', value: 1 },
          { label: 'Medium (2 kg)', value: 2 },
          { label: 'Heavy (5 kg)', value: 5 }
        ]
      },
      {
        id: 'gravity',
        label: 'Gravity (g)',
        min: 1.6,
        max: 25,
        step: 0.1,
        defaultValue: 9.8,
        unit: 'm/s²',
        presets: [
          { label: 'Moon (1.6 m/s²)', value: 1.6 },
          { label: 'Earth (9.8 m/s²)', value: 9.8 },
          { label: 'Jupiter (24.8 m/s²)', value: 24.8 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'totalE', label: 'Total Energy (E)', unit: 'J' },
      { key: 'maxVel', label: 'Max Bottom Speed (v_max)', unit: 'm/s' },
      { key: 'peFrac', label: 'Peak Potential Energy', unit: 'J' },
      { key: 'conservation', label: 'Energy Status' }
    ],
    getDiscovery: (vals) => {
      const h0 = vals.height ?? 10;
      const m = vals.mass ?? 2;
      const g = vals.gravity ?? 9.8;
      const totalE = (m * g * h0).toFixed(1);
      const vMax = Math.sqrt(2 * g * h0).toFixed(2);
      return {
        headline: 'Energy Cannot Be Created or Destroyed',
        relationship: 'At top: PE is maximum, KE is zero. At bottom: KE is maximum, PE is zero.',
        detail: `For a ${m} kg mass dropped from ${h0} m under g = ${g} m/s², the total mechanical energy is always exactly ${totalE} Joules. As it descends, all gravitational potential energy converts cleanly into kinetic energy, reaching peak velocity of ${vMax} m/s at the trough!`,
        formula: 'E_{\\text{total}} = KE + PE = \\frac{1}{2}mv^2 + mgh = \\text{constant}'
      };
    }
  }
];
