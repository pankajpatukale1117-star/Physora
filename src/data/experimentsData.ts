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

export type LabDomain =
  | 'Mechanics & Dynamics'
  | 'Optics & Refraction'
  | 'Energy & Work'
  | 'Elasticity & Springs'
  | 'Wave Physics'
  | 'Vectors & Equilibrium'
  | 'Gravity & Free Fall';

export interface ExperimentItem {
  id: 'motion_exp' | 'force_exp' | 'gravity_exp' | 'spring_exp' | 'wave_exp' | 'vector_exp' | 'optics_exp' | 'energy_exp';
  title: string;
  shortDesc: string;
  domain: LabDomain;
  objective: string;
  hypothesis: string;
  apparatus: string[];
  variables: {
    independent: string;
    dependent: string;
    controlled: string;
  };
  question: string;
  accentColor: string;
  controls: ExperimentControl[];
  telemetryFields: { key: string; label: string; unit?: string }[];
  getDiscovery: (values: Record<string, number>) => ExperimentDiscovery;
  getTrialData: (
    params: Record<string, number>,
    telemetry: Record<string, string>
  ) => {
    independentVal: string;
    dependentMeasured: string;
    theoreticalVal: string;
    variance: string;
  };
}

export const EXPERIMENTS_DATA: ExperimentItem[] = [
  // 1. MOTION EXPERIMENT
  {
    id: 'motion_exp',
    title: 'Uniform Rectilinear Motion & Velocity',
    shortDesc: 'Quantitatively measure elapsed time and cumulative displacement to plot the 1D position-time trajectory and verify constant velocity.',
    domain: 'Mechanics & Dynamics',
    objective: 'Empirically verify the rectilinear kinematic relation s = v · t under uniform velocity and determine the velocity from the slope of the position-time curve.',
    hypothesis: 'Displacement s increases strictly linearly with time t when acceleration is zero, with the constant gradient Δs/Δt corresponding precisely to instantaneous velocity v.',
    apparatus: [
      'Low-Friction Linear Precision Air Track',
      'Continuous Optical Infrared Position Encoder',
      'Dual Photogate Timing Gates with Microsecond Clocks',
      'Motorized Linear Cart Carriage with Constant Velocity Drive'
    ],
    variables: {
      independent: 'Velocity v (m/s) & Elapsed Time t (s)',
      dependent: 'Cumulative Displacement s (m)',
      controlled: 'System Net Acceleration a = 0.0 m/s², Track Friction μ = 0'
    },
    question: 'How does altering velocity change the rate of distance accumulation on a position-time graph?',
    accentColor: '#00F0FF',
    controls: [
      {
        id: 'velocity',
        label: 'Uniform Velocity (v)',
        min: 0,
        max: 30,
        step: 1,
        defaultValue: 12,
        unit: 'm/s',
        presets: [
          { label: 'Walking (2 m/s)', value: 2 },
          { label: 'Cycling (8 m/s)', value: 8 },
          { label: 'City Vehicle (15 m/s)', value: 15 },
          { label: 'Express Highway (25 m/s)', value: 25 }
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
          { label: 'Short Run (3s)', value: 3 },
          { label: 'Standard Run (6s)', value: 6 },
          { label: 'Extended Run (10s)', value: 10 }
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
        headline: 'Linear Distance Accumulation: s = v · t',
        relationship: 'Displacement is strictly proportional to elapsed time at constant velocity.',
        detail: `At ${v} m/s across an interval of ${t} seconds, the measured distance is ${dist} meters. The gradient of the distance-time graph directly yields velocity (${v} m/s). Doubling velocity doubles distance in the identical duration.`,
        formula: 's = v \\cdot t \\implies v = \\frac{\\Delta s}{\\Delta t}'
      };
    },
    getTrialData: (vals) => {
      const v = vals.velocity ?? 12;
      const t = vals.time ?? 6;
      const s = (v * t).toFixed(1);
      return {
        independentVal: `v = ${v} m/s, t = ${t} s`,
        dependentMeasured: `s = ${s} m`,
        theoreticalVal: `${s} m`,
        variance: '0.0%'
      };
    }
  },

  // 2. FORCE EXPERIMENT
  {
    id: 'force_exp',
    title: "Newton's Second Law: Force & Acceleration",
    shortDesc: 'Apply calibrated horizontal forces to variable inertial masses to uncover the foundational dynamic law F = m · a.',
    domain: 'Mechanics & Dynamics',
    objective: "Verify Newton's Second Law of Motion (F = ma) by manipulating net applied horizontal force on a frictionless track and measuring the resulting acceleration.",
    hypothesis: 'Acceleration a is directly proportional to net applied force F (a ∝ F) and inversely proportional to carriage mass m (a ∝ 1/m).',
    apparatus: [
      'Precision Aluminum Dynamic Track with Leveling Feet',
      'Dual-Axis Digital Force Sensor (±0.05 N Precision)',
      'Slotted Laboratory Inertial Masses (1.0 kg to 10.0 kg)',
      'Ultrasonic Motion Detector with 100 Hz Position Logging'
    ],
    variables: {
      independent: 'Applied Horizontal Force F (N)',
      dependent: 'System Acceleration a (m/s²)',
      controlled: 'Cart Inertial Mass m (kg), Air Resistance Fair = 0'
    },
    question: 'How do applied force and system mass interact to govern the acceleration of a body?',
    accentColor: '#10B981',
    controls: [
      {
        id: 'force',
        label: 'Applied Force (F)',
        min: 2,
        max: 50,
        step: 1,
        defaultValue: 20,
        unit: 'N',
        presets: [
          { label: 'Gentle (5 N)', value: 5 },
          { label: 'Standard (20 N)', value: 20 },
          { label: 'Maximum (40 N)', value: 40 }
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
          { label: 'Light Cart (1 kg)', value: 1 },
          { label: 'Standard Cart (2 kg)', value: 2 },
          { label: 'Loaded Cart (5 kg)', value: 5 },
          { label: 'Heavy Block (10 kg)', value: 10 }
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
        headline: "Newton's Second Law Verified: F = m · a",
        relationship: 'Acceleration scales directly with applied force and inversely with mass.',
        detail: `Imparting ${f} N onto a mass of ${m} kg produces an observed acceleration of ${a} m/s². Doubling the net force precisely doubles acceleration, whereas doubling inertial mass reduces acceleration by exactly 50%.`,
        formula: 'F = m \\cdot a \\implies a = \\frac{F}{m}'
      };
    },
    getTrialData: (vals) => {
      const f = vals.force ?? 20;
      const m = vals.mass ?? 2;
      const a = (f / m).toFixed(2);
      return {
        independentVal: `F = ${f} N (m = ${m} kg)`,
        dependentMeasured: `a = ${a} m/s²`,
        theoreticalVal: `${a} m/s²`,
        variance: '0.0%'
      };
    }
  },

  // 3. GRAVITY EXPERIMENT
  {
    id: 'gravity_exp',
    title: 'Gravitational Acceleration & Free Fall',
    shortDesc: 'Drop objects of varying masses across planetary gravitational fields in an evacuated chamber to measure fall times and impact velocities.',
    domain: 'Gravity & Free Fall',
    objective: 'Demonstrate that gravitational acceleration is independent of object mass in a vacuum, verifying Galileo’s equivalence principle and the kinematic relation v = √(2gh).',
    hypothesis: 'In the absence of aerodynamic drag, all objects experience identical acceleration g, with transit time t = √(2h/g) and terminal speed v = √(2gh) unaffected by object mass m.',
    apparatus: [
      'Vertical Transparent Vacuum Column (100 m calibrated)',
      'High-Speed Electromagnetic Drop Solenoid',
      'Dual Laser Transit Gates with Microsecond Clock',
      'Piezoelectric Impact Velocity Transducer'
    ],
    variables: {
      independent: 'Drop Height h (m) & Planetary Gravity g (m/s²)',
      dependent: 'Transit Fall Time t (s) & Impact Velocity v (m/s)',
      controlled: 'Vacuum Chamber Pressure P = 0 Pa (No Drag)'
    },
    question: 'Does the mass of a body influence its rate of gravitational fall in a vacuum?',
    accentColor: '#F59E0B',
    controls: [
      {
        id: 'gravity',
        label: 'Planetary Gravity (g)',
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
          { label: 'Low Elevation (10 m)', value: 10 },
          { label: 'Pisa Elevation (45 m)', value: 45 },
          { label: 'High Tower (100 m)', value: 100 }
        ]
      },
      {
        id: 'mass',
        label: 'Test Mass (m)',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
        unit: 'kg',
        presets: [
          { label: 'Light Ball (1 kg)', value: 1 },
          { label: 'Medium Sphere (5 kg)', value: 5 },
          { label: 'Heavy Anvil (20 kg)', value: 20 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'gravity', label: 'Local Field (g)', unit: 'm/s²' },
      { key: 'height', label: 'Drop Height (h)', unit: 'm' },
      { key: 'fallTime', label: 'Fall Duration (t)', unit: 's' },
      { key: 'impactVel', label: 'Impact Velocity (v)', unit: 'm/s' }
    ],
    getDiscovery: (vals) => {
      const g = vals.gravity ?? 9.8;
      const h = vals.height ?? 45;
      const m = vals.mass ?? 5;
      const t = Math.sqrt((2 * h) / g).toFixed(2);
      const v = Math.sqrt(2 * g * h).toFixed(1);
      const kmh = (parseFloat(v) * 3.6).toFixed(0);
      return {
        headline: 'Equivalence Principle: Mass Invariance in Free Fall',
        relationship: 'Transit time and impact velocity depend strictly on height and field gravity, not mass.',
        detail: `Released from ${h} m in a field of ${g} m/s², the ${m} kg object reaches ground impact in ${t} seconds at ${v} m/s (${kmh} km/h). Notice that altering mass (1 kg vs 20 kg) produces zero change in transit time or velocity.`,
        formula: 'v = \\sqrt{2gh}, \\quad t = \\sqrt{\\frac{2h}{g}}'
      };
    },
    getTrialData: (vals) => {
      const g = vals.gravity ?? 9.8;
      const h = vals.height ?? 45;
      const t = Math.sqrt((2 * h) / g).toFixed(2);
      const v = Math.sqrt(2 * g * h).toFixed(1);
      return {
        independentVal: `h = ${h} m (g = ${g} m/s²)`,
        dependentMeasured: `v = ${v} m/s, t = ${t} s`,
        theoreticalVal: `${v} m/s`,
        variance: '0.0%'
      };
    }
  },

  // 4. SPRING EXPERIMENT
  {
    id: 'spring_exp',
    title: "Hooke's Law & Elastic Restoring Force",
    shortDesc: 'Apply calibrated tensile forces to an elastic helical steel coil spring to determine the stiffness constant k and stored elastic potential energy.',
    domain: 'Elasticity & Springs',
    objective: "Investigate Hooke's Law (F = k · x) for an ideal helical spring within its proportional elastic limit and calculate the spring constant k from experimental extension data.",
    hypothesis: 'Elongation x of the spring varies in direct linear proportion to tensile deforming load F, with restorative elastic potential energy scaling quadratically as PE = ½kx².',
    apparatus: [
      'Rigid Laboratory Retort Stand with Metric Graduation Bar',
      'High-Tensile Helical Spring Coil with Known Elastic Limit',
      'Calibrated Precision Slotted Force Loading System',
      'Non-Contact Vernier Optical Displacement Sensor'
    ],
    variables: {
      independent: 'Tensile Deforming Force F (N)',
      dependent: 'Linear Elongation x (m / cm)',
      controlled: 'Spring Material Stiffness k = 100 N/m, Elastic Limit Not Exceeded'
    },
    question: 'How does applied tensile force govern the elongation and stored elastic energy of a helical spring?',
    accentColor: '#8B5CF6',
    controls: [
      {
        id: 'force',
        label: 'Applied Load (F)',
        min: 5,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: 'N',
        presets: [
          { label: 'Light Load (10 N)', value: 10 },
          { label: 'Medium Load (40 N)', value: 40 },
          { label: 'High Load (80 N)', value: 80 }
        ]
      },
      {
        id: 'stiffness',
        label: 'Spring Constant (k)',
        min: 25,
        max: 200,
        step: 5,
        defaultValue: 100,
        unit: 'N/m',
        presets: [
          { label: 'Soft Coil (50 N/m)', value: 50 },
          { label: 'Standard Coil (100 N/m)', value: 100 },
          { label: 'Rigid Coil (180 N/m)', value: 180 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'force', label: 'Tension Force (F)', unit: 'N' },
      { key: 'stiffness', label: 'Stiffness (k)', unit: 'N/m' },
      { key: 'extension', label: 'Extension (x = F/k)', unit: 'm' },
      { key: 'storedPE', label: 'Stored PE (½kx²)', unit: 'J' }
    ],
    getDiscovery: (vals) => {
      const f = vals.force ?? 40;
      const k = vals.stiffness ?? 100;
      const x = f / k;
      const cm = (x * 100).toFixed(1);
      const pe = (0.5 * k * x * x).toFixed(2);
      return {
        headline: "Hooke's Law Confirmed: F = k · x",
        relationship: 'Spring extension is directly proportional to applied force; energy grows quadratically.',
        detail: `Subjecting a spring with stiffness ${k} N/m to a load of ${f} N produces an elongation of ${x.toFixed(2)} m (${cm} cm) and stores ${pe} J of elastic energy. The slope of the F-x characteristic directly equals spring constant k.`,
        formula: 'F = k \\cdot x \\implies x = \\frac{F}{k}, \\quad PE = \\frac{1}{2} k x^2'
      };
    },
    getTrialData: (vals) => {
      const f = vals.force ?? 40;
      const k = vals.stiffness ?? 100;
      const x = (f / k).toFixed(3);
      const pe = (0.5 * k * (f / k) * (f / k)).toFixed(2);
      return {
        independentVal: `F = ${f} N (k = ${k} N/m)`,
        dependentMeasured: `x = ${x} m, PE = ${pe} J`,
        theoreticalVal: `${x} m`,
        variance: '0.0%'
      };
    }
  },

  // 5. WAVE EXPERIMENT
  {
    id: 'wave_exp',
    title: 'Harmonic Wave Velocity & Dispersion',
    shortDesc: 'Drive an elastic wave medium at variable frequencies to observe spatial wavelength compression and verify the universal wave equation v = f · λ.',
    domain: 'Wave Physics',
    objective: 'Demonstrate the universal wave equation v = f · λ and analyze the inverse frequency-wavelength dispersion relationship under constant phase propagation velocity.',
    hypothesis: 'Because phase velocity v is fundamentally determined by the physical properties of the medium, increasing excitation frequency f must cause an exact inversely proportional reduction in spatial wavelength λ.',
    apparatus: [
      'Electromechanical Harmonic Wave Driver Unit',
      'Tension-Regulated Wave Propagation Medium',
      'Digital Frequency Generator (0.5 Hz to 5.0 Hz)',
      'Synchronized Stroboscopic High-Precision Scale Calipers'
    ],
    variables: {
      independent: 'Oscillator Frequency f (Hz)',
      dependent: 'Spatial Crest-to-Crest Wavelength λ (px / m)',
      controlled: 'Medium Propagation Velocity v = 160 px/s, Wave Amplitude A'
    },
    question: 'How does excitation frequency dictate the spatial wavelength of a wave traversing a constant medium?',
    accentColor: '#38BDF8',
    controls: [
      {
        id: 'frequency',
        label: 'Oscillation Frequency (f)',
        min: 0.5,
        max: 3.5,
        step: 0.25,
        defaultValue: 1.5,
        unit: 'Hz',
        presets: [
          { label: 'Low Frequency (0.8 Hz)', value: 0.8 },
          { label: 'Medium Frequency (1.5 Hz)', value: 1.5 },
          { label: 'High Frequency (3.0 Hz)', value: 3.0 }
        ]
      },
      {
        id: 'amplitude',
        label: 'Peak Amplitude (A)',
        min: 15,
        max: 60,
        step: 5,
        defaultValue: 35,
        unit: 'px',
        presets: [
          { label: 'Small Pulse (20 px)', value: 20 },
          { label: 'Medium Wave (35 px)', value: 35 },
          { label: 'High Surge (55 px)', value: 55 }
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
      const v = 160;
      const lambda = (v / f).toFixed(0);
      const t = (1 / f).toFixed(2);
      return {
        headline: 'Universal Wave Relation: v = f · λ',
        relationship: 'Increasing frequency packs wave crests closer together, compressing wavelength inversely.',
        detail: `Driving the medium at ${f} Hz with an amplitude of ${a} px yields a spatial wavelength of ${lambda} px and period of ${t} s. At constant phase velocity, doubling frequency exactly halves the spatial wavelength.`,
        formula: 'v = f \\cdot \\lambda \\implies \\lambda = \\frac{v}{f}'
      };
    },
    getTrialData: (vals) => {
      const f = vals.frequency ?? 1.5;
      const v = 160;
      const lambda = (v / f).toFixed(1);
      return {
        independentVal: `f = ${f} Hz`,
        dependentMeasured: `λ = ${lambda} px`,
        theoreticalVal: `${lambda} px`,
        variance: '0.0%'
      };
    }
  },

  // 6. VECTOR EXPERIMENT
  {
    id: 'vector_exp',
    title: '2D Vector Resolution & Orthogonal Projections',
    shortDesc: 'Orient and stretch a planar force vector on a Cartesian plane to verify orthogonal trigonometric decomposition into Rx and Ry components.',
    domain: 'Vectors & Equilibrium',
    objective: 'Demonstrate vector resolution into mutually perpendicular Cartesian components and verify the Pythagorean relation R = √(Rx² + Ry²) and directional angle tan θ = Ry/Rx.',
    hypothesis: 'Any 2D vector in a Cartesian coordinate system is uniquely and completely described by its scalar projections along the orthogonal principal axes: Rx = R·cos θ and Ry = R·sin θ.',
    apparatus: [
      'Circular Force Table with 360° Laser-Etched Polar Grid',
      'Dual-Axis Precision Radial Dynamometer Load Cell',
      'Orthogonal Coordinate Projection Unit',
      'Electronic Digital Angle Indicator (0.1° Resolution)'
    ],
    variables: {
      independent: 'Vector Magnitude R (N) & Direction Angle θ (°)',
      dependent: 'Horizontal Component Rx (N) & Vertical Component Ry (N)',
      controlled: 'Coordinate Center at Origin (0, 0)'
    },
    question: 'How do orientation angle and magnitude govern the orthogonal components of a planar vector?',
    accentColor: '#EC4899',
    controls: [
      {
        id: 'magnitude',
        label: 'Resultant Magnitude (R)',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 50,
        unit: 'N',
        presets: [
          { label: 'Light Force (20 N)', value: 20 },
          { label: 'Medium Force (50 N)', value: 50 },
          { label: 'Heavy Force (75 N)', value: 75 }
        ]
      },
      {
        id: 'angle',
        label: 'Inclination Angle (θ)',
        min: 0,
        max: 90,
        step: 1,
        defaultValue: 35,
        unit: '°',
        presets: [
          { label: 'Pure X (0°)', value: 0 },
          { label: 'Standard (30°)', value: 30 },
          { label: 'Symmetric (45°)', value: 45 },
          { label: 'Pure Y (90°)', value: 90 }
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
        headline: 'Orthogonal Vector Decomposition',
        relationship: 'Increasing angle shifts weight from the horizontal axis to the vertical axis.',
        detail: `A vector of ${r} N inclined at ${deg}° projects into ${rx} N along X and ${ry} N along Y. Recombining by Pythagorean theorem √((${rx})² + (${ry})²) reconstructs the resultant of ${r} N with zero vector variance.`,
        formula: 'R_x = R \\cos\\theta, \\quad R_y = R \\sin\\theta, \\quad R = \\sqrt{R_x^2 + R_y^2}'
      };
    },
    getTrialData: (vals) => {
      const r = vals.magnitude ?? 50;
      const deg = vals.angle ?? 35;
      const rad = (deg * Math.PI) / 180;
      const rx = (r * Math.cos(rad)).toFixed(1);
      const ry = (r * Math.sin(rad)).toFixed(1);
      return {
        independentVal: `R = ${r} N, θ = ${deg}°`,
        dependentMeasured: `Rx = ${rx} N, Ry = ${ry} N`,
        theoreticalVal: `Rx = ${rx} N, Ry = ${ry} N`,
        variance: '0.0%'
      };
    }
  },

  // 7. OPTICS & REFRACTION EXPERIMENT
  {
    id: 'optics_exp',
    title: "Snell's Law & Total Internal Reflection",
    shortDesc: 'Propagate a laser ray across an optical interface between differing optical media to observe refraction and empirically verify the critical angle θc.',
    domain: 'Optics & Refraction',
    objective: "Verify Snell's Law of Refraction (n₁ sin θ₁ = n₂ sin θ₂) and determine the conditions and threshold critical angle θc required for Total Internal Reflection (TIR).",
    hypothesis: 'When light passes from medium n₁ to medium n₂, the ratio of sines of the angles equals the inverse ratio of refractive indices. If n₁ > n₂ and θ₁ > arcsin(n₂/n₁), transmission ceases and 100% of light undergoes total internal reflection.',
    apparatus: [
      'Monochromatic Precision Laser Diode Source (λ = 632.8 nm)',
      'Precision Graduated 360° Circular Optical Table',
      'Optical D-Block Interface Substrates (Air, Water, Glass, Diamond)',
      'Digital Photometric Refractometer Angle Sensor'
    ],
    variables: {
      independent: 'Angle of Incidence θ₁ (°) & Media Refractive Indices (n₁, n₂)',
      dependent: 'Angle of Refraction θ₂ (°) & Critical Angle θc (°)',
      controlled: 'Laser Emission Wavelength λ = 632.8 nm, Boundary Planarity'
    },
    question: 'How do relative optical densities dictate refraction, and at what threshold angle does light become internally trapped?',
    accentColor: '#00F0FF',
    controls: [
      {
        id: 'angle',
        label: 'Angle of Incidence (θ₁)',
        min: 0,
        max: 85,
        step: 1,
        defaultValue: 35,
        unit: '°',
        presets: [
          { label: 'Normal Ray (0°)', value: 0 },
          { label: 'Moderate Angle (30°)', value: 30 },
          { label: 'Intermediate (45°)', value: 45 },
          { label: 'Glancing Ray (60°)', value: 60 }
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
          { label: 'Crown Glass (1.50)', value: 1.5 }
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
          { label: 'Crown Glass (1.50)', value: 1.5 },
          { label: 'Dense Diamond (2.42)', value: 2.42 }
        ]
      }
    ],
    telemetryFields: [
      { key: 'theta1', label: 'Incident Angle (θ₁)', unit: '°' },
      { key: 'theta2', label: 'Refracted Angle (θ₂)' },
      { key: 'critAngle', label: 'Critical Angle (θ_c)' },
      { key: 'status', label: 'Propagation Regime' }
    ],
    getDiscovery: (vals) => {
      const t1 = vals.angle ?? 35;
      const n1 = vals.n1 ?? 1.0;
      const n2 = vals.n2 ?? 1.5;
      const sinT1 = Math.sin((t1 * Math.PI) / 180);
      const sinT2 = (n1 / n2) * sinT1;
      const isTIR = sinT2 > 1.0;
      const t2 = isTIR ? 'TIR (Reflected)' : ((Math.asin(sinT2) * 180) / Math.PI).toFixed(1) + '°';
      const crit = n1 > n2 ? ((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1) + '°' : 'None (n₁ ≤ n₂)';

      if (isTIR) {
        return {
          headline: 'Total Internal Reflection Regime Active',
          relationship: `Incident angle (${t1}°) exceeds the critical angle (${crit}). 100% of light is internally reflected!`,
          detail: `Because n₁ (${n1}) > n₂ (${n2}) and sin(θ₁) > n₂/n₁, refraction into the second medium is mathematically and physically impossible. 100% of the beam power is reflected back into Medium 1, demonstrating the foundational mechanism of fiber-optic waveguides.`,
          formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\implies \\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right)'
        };
      }

      const bends = Number(parseFloat(t2)) < t1 ? 'toward the normal (optically denser medium)' : 'away from the normal (optically rarer medium)';
      return {
        headline: "Snell's Law Verified: n₁ sin θ₁ = n₂ sin θ₂",
        relationship: `Ray bends ${bends} as it traverses from n₁ = ${n1} to n₂ = ${n2}.`,
        detail: `At an incident angle of ${t1}°, the refracted angle is measured at ${t2}. The index quotient (n₁/n₂ = ${(n1 / n2).toFixed(2)}) dictates Phase velocity deceleration and spatial wavefront refraction across the optical boundary.`,
        formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\implies \\theta_2 = \\arcsin\\left(\\frac{n_1}{n_2}\\sin\\theta_1\\right)'
      };
    },
    getTrialData: (vals) => {
      const t1 = vals.angle ?? 35;
      const n1 = vals.n1 ?? 1.0;
      const n2 = vals.n2 ?? 1.5;
      const sinT1 = Math.sin((t1 * Math.PI) / 180);
      const sinT2 = (n1 / n2) * sinT1;
      const isTIR = sinT2 > 1.0;
      const t2 = isTIR ? 'TIR' : ((Math.asin(sinT2) * 180) / Math.PI).toFixed(1) + '°';
      return {
        independentVal: `θ₁ = ${t1}° (n₁=${n1}, n₂=${n2})`,
        dependentMeasured: `θ₂ = ${t2}`,
        theoreticalVal: isTIR ? 'TIR' : t2,
        variance: '0.0%'
      };
    }
  },

  // 8. ENERGY CONSERVATION EXPERIMENT
  {
    id: 'energy_exp',
    title: 'Conservation of Mechanical Energy',
    shortDesc: 'Observe the continuous conservative exchange between Potential Energy (mgh) and Kinetic Energy (½mv²) on a low-friction parabolic track to verify E_total = constant.',
    domain: 'Energy & Work',
    objective: 'Empirically verify the Law of Conservation of Mechanical Energy (E = KE + PE) in a conservative gravitational field without dissipative frictional drag.',
    hypothesis: 'In the absence of non-conservative forces, gravitational potential energy is converted completely and reversibly into kinetic energy, maintaining total mechanical energy invariant across all coordinates.',
    apparatus: [
      'Precision Parabolic Half-Pipe Track with Frictionless Fluoropolymer Finish',
      'Rolling Spherical Inertial Mass Carriage (1.0 kg to 10.0 kg)',
      'Digital Infrared Height Profiler (0 to 25 m)',
      'Real-Time High-Frequency Doppler Velocimeter'
    ],
    variables: {
      independent: 'Initial Release Height h₀ (m) & Mass m (kg)',
      dependent: 'Trough Velocity vmax (m/s) & Peak Potential Energy PE (J)',
      controlled: 'Local Gravitational Field g = 9.8 m/s², Zero Friction Track'
    },
    question: 'How do potential energy and kinetic energy interchange during oscillatory motion while total energy remains constant?',
    accentColor: '#10B981',
    controls: [
      {
        id: 'height',
        label: 'Release Elevation (h₀)',
        min: 2,
        max: 20,
        step: 1,
        defaultValue: 10,
        unit: 'm',
        presets: [
          { label: 'Low Rise (4 m)', value: 4 },
          { label: 'Standard Rise (10 m)', value: 10 },
          { label: 'High Rise (18 m)', value: 18 }
        ]
      },
      {
        id: 'mass',
        label: 'Sphere Mass (m)',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 2,
        unit: 'kg',
        presets: [
          { label: 'Light Bob (1 kg)', value: 1 },
          { label: 'Standard Bob (2 kg)', value: 2 },
          { label: 'Heavy Sphere (5 kg)', value: 5 }
        ]
      },
      {
        id: 'gravity',
        label: 'Gravitational Field (g)',
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
      { key: 'maxVel', label: 'Max Velocity (v_max)', unit: 'm/s' },
      { key: 'peFrac', label: 'Peak Potential Energy', unit: 'J' },
      { key: 'conservation', label: 'Conservation Status' }
    ],
    getDiscovery: (vals) => {
      const h0 = vals.height ?? 10;
      const m = vals.mass ?? 2;
      const g = vals.gravity ?? 9.8;
      const totalE = (m * g * h0).toFixed(1);
      const vMax = Math.sqrt(2 * g * h0).toFixed(2);
      return {
        headline: 'Mechanical Energy Conservation: E = KE + PE',
        relationship: 'At crest: PE is maximum, KE is zero. At trough: KE is maximum, PE is zero. Sum is invariant.',
        detail: `For a ${m} kg mass released from ${h0} m in a field of ${g} m/s², total mechanical energy is conserved precisely at ${totalE} Joules. As elevation drops, gravitational potential energy transforms into kinetic energy, reaching peak velocity of ${vMax} m/s at the lowest coordinate with zero net energy drift.`,
        formula: 'E_{\\text{total}} = KE + PE = \\frac{1}{2}mv^2 + mgh = \\text{constant}'
      };
    },
    getTrialData: (vals) => {
      const h0 = vals.height ?? 10;
      const m = vals.mass ?? 2;
      const g = vals.gravity ?? 9.8;
      const totalE = (m * g * h0).toFixed(1);
      const vMax = Math.sqrt(2 * g * h0).toFixed(2);
      return {
        independentVal: `h₀ = ${h0} m (m = ${m} kg)`,
        dependentMeasured: `v_max = ${vMax} m/s, E = ${totalE} J`,
        theoreticalVal: `v = ${vMax} m/s, E = ${totalE} J`,
        variance: '0.0%'
      };
    }
  }
];
