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
  id: 'motion_exp' | 'force_exp' | 'gravity_exp' | 'spring_exp' | 'wave_exp' | 'vector_exp';
  title: string;
  shortDesc: string;
  level: 'Class 9' | 'Class 10' | 'Class 11';
  category: 'Kinematics' | 'Dynamics' | 'Gravity' | 'Elasticity' | 'Wave Physics' | 'Vectors';
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
        formula: 's = v · t'
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
        formula: 'F = m · a  ⇒  a = F / m'
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
        formula: 'v = √(2gh),  t = √(2h / g)'
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
        formula: 'F = k · x  ⇒  x = F / k'
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
        formula: 'v = f · λ  ⇒  λ = v / f'
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
        formula: 'R_x = R · cos θ,   R_y = R · sin θ'
      };
    }
  }
];
