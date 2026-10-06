export interface SimulationConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  controls: {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit?: string;
  }[];
  telemetryLabels: { key: string; label: string; unit?: string }[];
}

export interface EditorialTeaching {
  headline: string;
  story: string;
  controlsGuide: string;
  variablesAndOutputs: string;
  modelAssumptions: string;
  learningObjective: string;
}

export interface TopicData {
  id: string;
  subject: 'maths' | 'physics' | 'biology';
  title: string;
  category: string;
  shortDesc: string;
  conceptIntro: string;
  realWorldExample: string;
  keyFormulas: { formula: string; explanation: string }[];
  keyTakeaways: string[];
  editorialTeaching?: EditorialTeaching;
  simulations: SimulationConfig[];
}

export const TOPICS_DATA: Record<string, TopicData> = {
  // ==========================================
  // MATHEMATICS (CLASS 11 & FOUNDATIONS)
  // ==========================================
  algebra: {
    id: 'algebra',
    subject: 'maths',
    title: 'Algebra',
    category: 'MATHEMATICS',
    shortDesc: 'Linear equations, simple quadratics, and solving for unknowns.',
    conceptIntro:
      'Algebra is the language of mathematics where we use symbols like x and y to represent unknown quantities. Instead of doing arithmetic once with fixed numbers, algebra lets you write one formula that solves infinite problems.',
    realWorldExample:
      'Calculating taxi fares where fare = base_fare + (rate × distance), or budgeting money where spent + saved = total_allowance.',
    keyFormulas: [
      { formula: 'y = mx + c', explanation: 'Linear equation: m is slope (steepness), c is y-intercept.' },
      { formula: 'ax² + bx + c = 0', explanation: 'Quadratic equation in standard form.' },
      { formula: 'D = b² - 4ac', explanation: 'Discriminant: D > 0 (2 roots), D = 0 (1 root), D < 0 (no real roots).' }
    ],
    keyTakeaways: [
      'Slope (m) determines how steep a line is: positive slopes rise, negative slopes fall.',
      'A quadratic graph is a symmetric U-shape curve called a parabola.',
      'The discriminant instantly reveals whether a parabola crosses the x-axis.'
    ],
    simulations: [
      {
        id: 'algebra_linear',
        name: 'Linear Equation Grapher',
        tagline: 'See how slope (m) and y-intercept (c) change the line.',
        description: 'Adjust the slope to tilt the line and move the y-intercept to shift it up or down. Find where the line crosses the axes.',
        controls: [
          { id: 'm', label: 'Slope (m)', min: -5, max: 5, step: 0.5, defaultValue: 1.5 },
          { id: 'c', label: 'Y-Intercept (c)', min: -8, max: 8, step: 1, defaultValue: 2 }
        ],
        telemetryLabels: [
          { key: 'equation', label: 'Equation' },
          { key: 'root', label: 'X-Intercept (Root)' },
          { key: 'steepness', label: 'Steepness Angle' }
        ]
      },
      {
        id: 'algebra_quadratic',
        name: 'Quadratic Parabola & Roots',
        tagline: 'Visualize how a, b, and c morph the parabolic curve.',
        description: 'Watch the parabola open upward or downward and see the roots change as the discriminant D shifts between positive, zero, and negative.',
        controls: [
          { id: 'a', label: 'Curvature (a)', min: -3, max: 3, step: 0.2, defaultValue: 1 },
          { id: 'b', label: 'Linear Shift (b)', min: -6, max: 6, step: 0.5, defaultValue: -2 },
          { id: 'c', label: 'Vertical Offset (c)', min: -5, max: 5, step: 0.5, defaultValue: -3 }
        ],
        telemetryLabels: [
          { key: 'd', label: 'Discriminant (D)' },
          { key: 'roots', label: 'Roots (Solutions)' },
          { key: 'vertex', label: 'Vertex Point' }
        ]
      },
      {
        id: 'algebra_system',
        name: 'System of Two Lines (Intersection)',
        tagline: 'Find the single point (x, y) where two equations meet.',
        description: 'Two linear equations meet at a unique solution point. If they have the same slope, they are parallel with no solution!',
        controls: [
          { id: 'm1', label: 'Line 1 Slope (m₁)', min: -4, max: 4, step: 0.5, defaultValue: 2 },
          { id: 'c1', label: 'Line 1 Intercept (c₁)', min: -5, max: 5, step: 1, defaultValue: -1 },
          { id: 'm2', label: 'Line 2 Slope (m₂)', min: -4, max: 4, step: 0.5, defaultValue: -0.5 },
          { id: 'c2', label: 'Line 2 Intercept (c₂)', min: -5, max: 5, step: 1, defaultValue: 4 }
        ],
        telemetryLabels: [
          { key: 'intersect', label: 'Solution (x, y)' },
          { key: 'status', label: 'System Type' }
        ]
      }
    ]
  },

  trigonometry: {
    id: 'trigonometry',
    subject: 'maths',
    title: 'Trigonometry',
    category: 'MATHEMATICS',
    shortDesc: 'Right-angled triangles, the unit circle, and sine/cosine waves.',
    conceptIntro:
      'Trigonometry connects angles with lengths. On a circle of radius 1 (the Unit Circle), the x-coordinate of any angle is cos(θ) and the y-coordinate is sin(θ). As the circle spins, these coordinates trace repeating waves.',
    realWorldExample:
      'Measuring the height of tall buildings using shadow angles, navigation GPS, and musical sound waveforms.',
    keyFormulas: [
      { formula: 'sin θ = Opp / Hyp', explanation: 'Ratio of opposite side to hypotenuse.' },
      { formula: 'cos θ = Adj / Hyp', explanation: 'Ratio of adjacent side to hypotenuse.' },
      { formula: 'sin²θ + cos²θ = 1', explanation: 'Fundamental Pythagorean identity on the unit circle.' }
    ],
    keyTakeaways: [
      'sin(θ) and cos(θ) always stay between -1 and +1 on the unit circle.',
      'One complete 360° turn corresponds to 2π radians.',
      'Unrolling circular rotation over time naturally produces a sine wave.'
    ],
    simulations: [
      {
        id: 'trig_unit_circle',
        name: 'Interactive Unit Circle',
        tagline: 'Drag angle θ and watch sin(θ), cos(θ), and tan(θ) live.',
        description: 'Rotate the radius arm around the unit circle. See the projection lengths for cosine (horizontal blue) and sine (vertical purple) dynamically update.',
        controls: [
          { id: 'theta', label: 'Angle (θ in Degrees)', min: 0, max: 360, step: 1, defaultValue: 45, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'radians', label: 'Angle (Radians)' },
          { key: 'sin', label: 'sin(θ)' },
          { key: 'cos', label: 'cos(θ)' },
          { key: 'tan', label: 'tan(θ)' }
        ]
      },
      {
        id: 'trig_wave_unroll',
        name: 'Circular Motion to Sine Wave',
        tagline: 'Watch circular rotation unroll into a continuous wave.',
        description: 'See the direct link between rotating dots and vibrating waves. Adjust frequency and amplitude to see the wave stretch.',
        controls: [
          { id: 'amplitude', label: 'Wave Amplitude (A)', min: 20, max: 80, step: 5, defaultValue: 50 },
          { id: 'freq', label: 'Rotation Speed (ω)', min: 0.5, max: 3, step: 0.2, defaultValue: 1.2 }
        ],
        telemetryLabels: [
          { key: 'wavelength', label: 'Period (T)' },
          { key: 'peak', label: 'Peak Value' }
        ]
      },
      {
        id: 'trig_triangle',
        name: 'Right Triangle Solver',
        tagline: 'Drag triangle vertices and verify Pythagoras theorem.',
        description: 'Alter the base and perpendicular lengths. Observe how the hypotenuse and the three trigonometric ratios recalculate.',
        controls: [
          { id: 'base', label: 'Base Length (Adjacent)', min: 2, max: 12, step: 0.5, defaultValue: 6 },
          { id: 'height', label: 'Height (Opposite)', min: 2, max: 10, step: 0.5, defaultValue: 4.5 }
        ],
        telemetryLabels: [
          { key: 'hyp', label: 'Hypotenuse (c)' },
          { key: 'angle', label: 'Angle (θ)' },
          { key: 'pythagoras', label: 'a² + b² = c²' }
        ]
      }
    ]
  },

  coordinate_geometry: {
    id: 'coordinate_geometry',
    subject: 'maths',
    title: 'Coordinate Geometry',
    category: 'MATHEMATICS',
    shortDesc: 'Plotting points (x, y), straight lines, and distance between coordinates.',
    conceptIntro:
      'Coordinate geometry lets us see geometry using numbers. By giving every point a pair of coordinates (x, y), geometric problems like finding distances, midpoints, and circles become simple arithmetic.',
    realWorldExample:
      'Digital screens where every pixel has an (x, y) address, map coordinates (latitude, longitude), and video game character movement.',
    keyFormulas: [
      { formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]', explanation: 'Distance formula based on Pythagoras theorem.' },
      { formula: 'Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)', explanation: 'Exact center point between two coordinates.' },
      { formula: '(x - h)² + (y - k)² = r²', explanation: 'Equation of a circle centered at (h, k) with radius r.' }
    ],
    keyTakeaways: [
      'The distance formula is just the Pythagorean theorem drawn on a coordinate grid.',
      'The midpoint is simply the average of the x-coordinates and average of y-coordinates.',
      'A circle is all points that are the exact same distance r from a center point (h, k).'
    ],
    simulations: [
      {
        id: 'coord_distance',
        name: 'Distance & Midpoint Explorer',
        tagline: 'Drag two points on the grid and watch Δx, Δy, and distance d compute.',
        description: 'See the right-angled triangle formed between any two points A and B on the Cartesian plane.',
        controls: [
          { id: 'x1', label: 'Point A X', min: -8, max: 8, step: 1, defaultValue: -4 },
          { id: 'y1', label: 'Point A Y', min: -6, max: 6, step: 1, defaultValue: -2 },
          { id: 'x2', label: 'Point B X', min: -8, max: 8, step: 1, defaultValue: 5 },
          { id: 'y2', label: 'Point B Y', min: -6, max: 6, step: 1, defaultValue: 4 }
        ],
        telemetryLabels: [
          { key: 'distance', label: 'Distance (d)' },
          { key: 'midpoint', label: 'Midpoint (M)' },
          { key: 'slope', label: 'Slope of AB' }
        ]
      },
      {
        id: 'coord_circle',
        name: 'Circle Center & Radius Simulator',
        tagline: 'Shift the center (h, k) and expand radius r.',
        description: 'Inspect the standard circle equation (x - h)² + (y - k)² = r² and test whether points lie inside, on, or outside the boundary.',
        controls: [
          { id: 'h', label: 'Center X (h)', min: -5, max: 5, step: 0.5, defaultValue: 1 },
          { id: 'k', label: 'Center Y (k)', min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { id: 'r', label: 'Radius (r)', min: 1, max: 7, step: 0.5, defaultValue: 4 }
        ],
        telemetryLabels: [
          { key: 'eq', label: 'Circle Equation' },
          { key: 'area', label: 'Area (πr²)' },
          { key: 'circ', label: 'Circumference (2πr)' }
        ]
      },
      {
        id: 'coord_section',
        name: 'Section Formula (Ratio Divider)',
        tagline: 'See point P divide segment AB in ratio m : n.',
        description: 'Slide the ratio m : n to see point P slide along the line segment between A and B.',
        controls: [
          { id: 'm', label: 'Ratio m', min: 1, max: 5, step: 1, defaultValue: 2 },
          { id: 'n', label: 'Ratio n', min: 1, max: 5, step: 1, defaultValue: 3 }
        ],
        telemetryLabels: [
          { key: 'ratio', label: 'Current Ratio (m:n)' },
          { key: 'px', label: 'Point P Coordinates' }
        ]
      }
    ]
  },

  functions: {
    id: 'functions',
    subject: 'maths',
    title: 'Functions',
    category: 'MATHEMATICS',
    shortDesc: 'Input-output relations, domain, range, and simple curves.',
    conceptIntro:
      'A function is like a rule or a machine: you give it one input (x), it performs a specific operation, and it produces exactly one output f(x). Graphing a function shows how output changes for every input.',
    realWorldExample:
      'Vending machines where pressing button B3 gives you a specific snack, or currency converters where rupees = dollars × exchange_rate.',
    keyFormulas: [
      { formula: 'y = f(x)', explanation: 'Output y is a function of input x.' },
      { formula: 'f(x) → f(x - h) + k', explanation: 'Graph translation: shifts right by h and up by k.' },
      { formula: 'Domain & Range', explanation: 'Domain: valid inputs; Range: possible outputs.' }
    ],
    keyTakeaways: [
      'A valid function can never produce two different outputs for the same input (Vertical Line Test).',
      'Adding a constant outside f(x) + k shifts the graph up/down.',
      'Subtracting a constant inside f(x - h) shifts the graph right/left.'
    ],
    simulations: [
      {
        id: 'func_machine',
        name: 'The Function Machine',
        tagline: 'Feed numbers into f(x) and watch the transformation.',
        description: 'Select a rule like 2x + 1 or x², drop numbers into the machine, and trace the path on the coordinate graph.',
        controls: [
          { id: 'x_in', label: 'Input Value (x)', min: -5, max: 5, step: 0.5, defaultValue: 2 },
          { id: 'multiplier', label: 'Multiplier (a)', min: 1, max: 4, step: 0.5, defaultValue: 2 },
          { id: 'adder', label: 'Constant (b)', min: -5, max: 5, step: 1, defaultValue: 1 }
        ],
        telemetryLabels: [
          { key: 'rule', label: 'Current Function f(x)' },
          { key: 'out', label: 'Output y = f(x)' },
          { key: 'coord', label: 'Plotted Point (x, y)' }
        ]
      },
      {
        id: 'func_transform',
        name: 'Graph Shifting & Scaling',
        tagline: 'Shift and stretch parabolas and absolute value curves.',
        description: 'See how f(x - h) + k shifts the parent graph horizontally and vertically without changing its core shape.',
        controls: [
          { id: 'h', label: 'Horizontal Shift (h)', min: -5, max: 5, step: 0.5, defaultValue: 2 },
          { id: 'k', label: 'Vertical Shift (k)', min: -4, max: 4, step: 0.5, defaultValue: -1 },
          { id: 'scale', label: 'Vertical Stretch (a)', min: 0.2, max: 3, step: 0.2, defaultValue: 1 }
        ],
        telemetryLabels: [
          { key: 'trans_eq', label: 'Transformed Equation' },
          { key: 'vertex_pos', label: 'Vertex Location' }
        ]
      },
      {
        id: 'func_vertical_line',
        name: 'Vertical Line Test',
        tagline: 'Sweep a vertical line across curves to test if they are functions.',
        description: 'If a vertical line ever intersects a curve more than once, it is NOT a valid function.',
        controls: [
          { id: 'sweep_x', label: 'Line Position (x)', min: -6, max: 6, step: 0.2, defaultValue: 0 }
        ],
        telemetryLabels: [
          { key: 'hits', label: 'Intersections' },
          { key: 'valid', label: 'Is Valid Function?' }
        ]
      }
    ]
  },

  sequences: {
    id: 'sequences',
    subject: 'maths',
    title: 'Sequences',
    category: 'MATHEMATICS',
    shortDesc: 'Predictable number patterns, arithmetic steps (AP), and geometric series.',
    conceptIntro:
      'A sequence is an ordered list of numbers following a pattern. In an Arithmetic Progression (AP), you add a fixed difference each step (like climbing equal stairs). In a Geometric Progression (GP), you multiply each step (like cells dividing).',
    realWorldExample:
      'Compound interest growth in bank accounts (GP), and saving ₹100 more every month (AP).',
    keyFormulas: [
      { formula: 'aₙ = a + (n - 1)d', explanation: 'n-th term of an Arithmetic Progression (AP).' },
      { formula: 'Sₙ = (n/2)[2a + (n-1)d]', explanation: 'Sum of first n terms of an AP.' },
      { formula: 'aₙ = a · rⁿ⁻¹', explanation: 'n-th term of a Geometric Progression (GP).' }
    ],
    keyTakeaways: [
      'An AP graph is a straight staircase line with slope equal to common difference d.',
      'A GP graph curves rapidly upward when ratio r > 1 (exponential growth).',
      'If |r| < 1 in a GP, the terms shrink toward zero and have a finite infinite sum!'
    ],
    simulations: [
      {
        id: 'seq_ap_staircase',
        name: 'Arithmetic Progression (AP) Staircase',
        tagline: 'Build step-by-step staircase bars with first term a and difference d.',
        description: 'Watch the bars rise or fall evenly as you change common difference d. Calculate total bricks (Sum Sₙ).',
        controls: [
          { id: 'a', label: 'First Term (a)', min: 1, max: 10, step: 1, defaultValue: 2 },
          { id: 'd', label: 'Common Difference (d)', min: -3, max: 5, step: 1, defaultValue: 3 },
          { id: 'n', label: 'Number of Terms (n)', min: 3, max: 12, step: 1, defaultValue: 6 }
        ],
        telemetryLabels: [
          { key: 'nth', label: 'n-th Term (aₙ)' },
          { key: 'sum', label: 'Total Sum (Sₙ)' },
          { key: 'formula_display', label: 'AP Formula' }
        ]
      },
      {
        id: 'seq_gp_growth',
        name: 'Geometric Progression (GP) Multiplier',
        tagline: 'See exponential multiplication growth vs decay.',
        description: 'Notice how doubling (r = 2) skyrockets numbers quickly, while halving (r = 0.5) smoothly decays toward zero.',
        controls: [
          { id: 'a_gp', label: 'First Term (a)', min: 1, max: 5, step: 1, defaultValue: 2 },
          { id: 'r_gp', label: 'Common Ratio (r)', min: 0.2, max: 2.5, step: 0.1, defaultValue: 1.5 },
          { id: 'n_gp', label: 'Terms (n)', min: 3, max: 8, step: 1, defaultValue: 5 }
        ],
        telemetryLabels: [
          { key: 'last_term', label: 'Last Term Value' },
          { key: 'gp_type', label: 'Behavior' }
        ]
      },
      {
        id: 'seq_golden_spiral',
        name: 'Fibonacci & Visual Golden Spiral',
        tagline: 'Squares of 1, 1, 2, 3, 5, 8 creating nature’s spiral.',
        description: 'Each Fibonacci number is the sum of the previous two. Together they tile squares that trace the golden spiral found in seashells and galaxies.',
        controls: [
          { id: 'steps', label: 'Fibonacci Steps', min: 3, max: 8, step: 1, defaultValue: 6 }
        ],
        telemetryLabels: [
          { key: 'sequence', label: 'Sequence Terms' },
          { key: 'ratio', label: 'Golden Ratio Approx' }
        ]
      }
    ]
  },

  basic_calculus: {
    id: 'basic_calculus',
    subject: 'maths',
    title: 'Basic Calculus',
    category: 'MATHEMATICS',
    shortDesc: 'Understanding rates of change and finding the slope of a curve.',
    conceptIntro:
      'Calculus is the mathematics of change. While algebra handles steady speeds, calculus lets you find the instantaneous speed at an exact fraction of a second by measuring slope as time interval Δt shrinks to zero.',
    realWorldExample:
      'A car speedometer showing your instantaneous speed right now, rather than your average speed over the whole trip.',
    keyFormulas: [
      { formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", explanation: 'Definition of derivative: instantaneous slope of tangent line.' },
      { formula: 'd/dx (xⁿ) = n · xⁿ⁻¹', explanation: 'Power rule: derivative of power functions.' },
      { formula: '∫ f(x) dx', explanation: 'Definite integral: total accumulated area under the curve.' }
    ],
    keyTakeaways: [
      'The derivative is simply the slope of the curve at a single point.',
      'When slope is zero, the curve reaches a peak (maximum) or valley (minimum).',
      'Integration is the reverse of differentiation: adding up infinite tiny slices to find area.'
    ],
    simulations: [
      {
        id: 'calc_secant_tangent',
        name: 'Secant Line Morphing to Tangent',
        tagline: 'Watch the secant line between two points snap into a tangent as Δx → 0.',
        description: 'Drag point Q closer and closer to point P. Notice how the average slope approaches the exact derivative slope!',
        controls: [
          { id: 'px', label: 'Target Point P (x)', min: -2, max: 3, step: 0.5, defaultValue: 1 },
          { id: 'delta_x', label: 'Separation (Δx)', min: 0.05, max: 3, step: 0.05, defaultValue: 1.5 }
        ],
        telemetryLabels: [
          { key: 'secant_slope', label: 'Secant Slope (Average)' },
          { key: 'tangent_slope', label: 'Exact Derivative f’(x)' },
          { key: 'error', label: 'Difference (Error)' }
        ]
      },
      {
        id: 'calc_riemann_area',
        name: 'Area Under Curve (Riemann Sums)',
        tagline: 'Fit rectangles under y = x² and watch them merge into smooth area.',
        description: 'Increase the number of rectangle slices n. See how the choppy bar tops flatten out and match the exact integral area.',
        controls: [
          { id: 'n_slices', label: 'Number of Rectangles (n)', min: 2, max: 30, step: 1, defaultValue: 8 },
          { id: 'upper_bound', label: 'Interval End (b)', min: 2, max: 5, step: 0.5, defaultValue: 3 }
        ],
        telemetryLabels: [
          { key: 'approx_area', label: 'Rectangle Area' },
          { key: 'exact_area', label: 'Exact Integral Area' },
          { key: 'accuracy', label: 'Approximation Accuracy' }
        ]
      },
      {
        id: 'calc_kinematics_deriv',
        name: 'Position, Velocity & Acceleration',
        tagline: 'Link moving car position s(t) to velocity v(t) = s’(t).',
        description: 'Watch a car drive across the screen while its position, velocity (slope of position), and acceleration are graphed together in real time.',
        controls: [
          { id: 'accel_rate', label: 'Acceleration Setting', min: 0.5, max: 3, step: 0.5, defaultValue: 1.5 }
        ],
        telemetryLabels: [
          { key: 'car_pos', label: 'Position s(t)' },
          { key: 'car_vel', label: 'Velocity v(t)' },
          { key: 'car_acc', label: 'Acceleration a(t)' }
        ]
      }
    ]
  },

  // ==========================================
  // PHYSICS (CLASS 11 & FOUNDATIONS)
  // ==========================================
  units_dimensions: {
    id: 'units_dimensions',
    subject: 'physics',
    title: 'Units & Dimensions',
    category: 'PHYSICS',
    shortDesc: 'Measuring meters, seconds, kilograms, and how physical quantities scale.',
    conceptIntro:
      'Physics begins with measurement. All physical quantities can be expressed in terms of fundamental dimensions: Mass [M], Length [L], and Time [T]. If the dimensions on both sides of an equation do not match, the physics is wrong!',
    realWorldExample:
      'Converting speed limits between km/h and m/s, or using millimeter measurements to manufacture smartphone chips.',
    keyFormulas: [
      { formula: '[Velocity] = [L][T]⁻¹', explanation: 'Velocity is distance divided by time.' },
      { formula: '[Force] = [M][L][T]⁻²', explanation: 'Force is mass × acceleration.' },
      { formula: '1 m/s = 3.6 km/h', explanation: 'Standard conversion between metric speed units.' }
    ],
    keyTakeaways: [
      'You can only add or subtract quantities that share the exact same dimensions.',
      'Dimensional analysis lets you test whether a physics formula is possible without doing calculations.',
      'Precision tools like vernier calipers measure fractions of a millimeter accurately.'
    ],
    simulations: [
      {
        id: 'units_scaling',
        name: 'Scale of the Universe Explorer',
        tagline: 'Zoom smoothly from microscopic nanometers to astronomical light-years.',
        description: 'Slide through powers of ten to see how human-scale meters compare to atoms and solar system scales.',
        controls: [
          { id: 'scale_exp', label: 'Power of 10 Scale (10ⁿ)', min: -9, max: 12, step: 1, defaultValue: 0 }
        ],
        telemetryLabels: [
          { key: 'sci_notation', label: 'Value (Scientific)' },
          { key: 'reference_object', label: 'Comparable Object' },
          { key: 'unit_name', label: 'Standard Unit' }
        ]
      },
      {
        id: 'units_checker',
        name: 'Dimensional Homogeneity Checker',
        tagline: 'Test whether equations are dimensionally balanced.',
        description: 'Select physical equations and watch the dimensions decompose into [M], [L], and [T] on both sides to verify correctness.',
        controls: [
          { id: 'eq_choice', label: 'Select Equation', min: 1, max: 3, step: 1, defaultValue: 1 }
        ],
        telemetryLabels: [
          { key: 'left_dim', label: 'Left Side Dimensions' },
          { key: 'right_dim', label: 'Right Side Dimensions' },
          { key: 'is_valid', label: 'Dimensionally Correct?' }
        ]
      },
      {
        id: 'units_vernier',
        name: 'Interactive Vernier Caliper',
        tagline: 'Drag the caliper jaws and read millimeters with 0.1 mm precision.',
        description: 'Align the zero mark of the vernier scale with the main scale to learn how real laboratory tools measure thickness.',
        controls: [
          { id: 'jaw_dist', label: 'Object Thickness (mm)', min: 0, max: 60, step: 0.1, defaultValue: 23.4, unit: 'mm' }
        ],
        telemetryLabels: [
          { key: 'main_reading', label: 'Main Scale (MSR)' },
          { key: 'vernier_reading', label: 'Vernier Coincidence (VSR)' },
          { key: 'least_count', label: 'Least Count (LC)' },
          { key: 'total_reading', label: 'Total Reading (MSR + VSR×LC)' }
        ]
      }
    ]
  },

  motion: {
    id: 'motion',
    subject: 'physics',
    title: 'Motion',
    category: 'PHYSICS',
    shortDesc: 'Speed, velocity, acceleration, and tracking objects moving in straight lines.',
    conceptIntro:
      'Kinematics is the study of how things move without worrying about why. By tracking position, speed (how fast), velocity (how fast and in which direction), and acceleration (rate of speeding up), we can predict where an object will be at any future time.',
    realWorldExample:
      'Calculating stopping distance for a braking car, or calculating how many seconds an airplane needs to take off on a runway.',
    keyFormulas: [
      { formula: 'v = u + at', explanation: 'Velocity after time t with constant acceleration a.' },
      { formula: 's = ut + ½at²', explanation: 'Distance traveled under constant acceleration.' },
      { formula: 'v² = u² + 2as', explanation: 'Relates final velocity directly to distance without time.' }
    ],
    keyTakeaways: [
      'Velocity has a direction; speed is just the number on the speedometer.',
      'A flat line on a position-time graph means the object is stationary; a tilted straight line means constant velocity.',
      'The area under a velocity-time graph equals the total distance traveled!'
    ],
    editorialTeaching: {
      headline: 'Two Motions, One Ball',
      story:
        'When you launch a projectile, it does two things at the same time: it moves forward, and it falls. Neither one gets in the way of the other. Here you launch three balls together. One only moves up and down on a vertical rail. One only rolls forward along a ground rail. The third one is the projectile, doing both. Watch it stay right above the rolling ball and right beside the one going up, the entire way.',
      controlsGuide:
        'Set the launch with the u_x and u_y sliders, or with total speed u and angle θ — all four are linked, so moving one updates the others. Show or hide any of the three balls. Switch gravity between 10 m/s² (classroom round number) and 9.8 m/s² (Earth standard). Press Play to fire, pause at any instant, or drag the time slider to inspect exact moments.',
      variablesAndOutputs:
        'Once launched, dashed orthogonal lines connect the projectile down to the rolling ball and across to the rising ball. Velocity arrows appear on all three. The arrow on the vertical ball shrinks to zero at the maximum height apex and reverses downward. The arrow on the rolling ball never changes at all. The telemetry HUD shows time, projectile speed, horizontal and vertical components, and height.',
      modelAssumptions:
        'Ideal vacuum projectile (no air drag). Flat horizontal ground, launched from ground level.',
      learningObjective:
        'You should be able to hide the projectile, look only at the other two companion balls, and point to where the projectile is at any second.'
    },
    simulations: [
      {
        id: 'motion_two_motions',
        name: 'Two Motions, One Ball (Galileo Decomposition)',
        tagline: 'See how a projectile combines a constant horizontal motion and an accelerating vertical motion.',
        description: 'Galileo’s famous revelation: horizontal and vertical motions are completely independent. Watch the projectile match the rolling floor ball horizontally and the free-fall ball vertically at every microsecond.',
        controls: [
          { id: 'u_x', label: 'Horizontal Velocity (u_x)', min: 0, max: 60, step: 1, defaultValue: 30, unit: 'm/s' },
          { id: 'u_y', label: 'Vertical Velocity (u_y)', min: 0, max: 60, step: 1, defaultValue: 40, unit: 'm/s' },
          { id: 'u', label: 'Total Launch Speed (u)', min: 0, max: 85, step: 1, defaultValue: 50, unit: 'm/s' },
          { id: 'theta', label: 'Launch Angle (θ)', min: 0, max: 90, step: 1, defaultValue: 53, unit: '°' },
          { id: 'gravity', label: 'Gravity (10 vs 9.8)', min: 9.8, max: 10, step: 0.2, defaultValue: 10, unit: 'm/s²' },
          { id: 'show_proj', label: 'Show Projectile Ball', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'show_vert', label: 'Show Vertical Ball', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'show_horiz', label: 'Show Horizontal Ball', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'show_vectors', label: 'Show Velocity Vectors', min: 0, max: 1, step: 1, defaultValue: 1 }
        ],
        telemetryLabels: [
          { key: 't_flight', label: 'Flight Time (T)' },
          { key: 'max_height', label: 'Max Height (H)' },
          { key: 'range_dist', label: 'Range (R)' },
          { key: 'v_proj', label: 'Projectile Speed (v)' },
          { key: 'v_vert', label: 'Vertical Speed (v_y)' },
          { key: 'v_horiz', label: 'Horizontal Speed (v_x)' }
        ]
      },
      {
        id: 'motion_car_track',
        name: 'Kinematic Car Track & Graphs',
        tagline: 'Set initial speed (u) and acceleration (a) and watch the car drive.',
        description: 'Observe the synchronized real-time position-time (x-t) and velocity-time (v-t) graphs drawn as the car rolls.',
        controls: [
          { id: 'u_init', label: 'Initial Velocity (u)', min: 0, max: 15, step: 1, defaultValue: 0, unit: 'm/s' },
          { id: 'a_acc', label: 'Acceleration (a)', min: -3, max: 5, step: 0.5, defaultValue: 2, unit: 'm/s²' }
        ],
        telemetryLabels: [
          { key: 'cur_vel', label: 'Current Velocity (v)' },
          { key: 'cur_pos', label: 'Distance Traveled (s)' },
          { key: 'elapsed_t', label: 'Time Elapsed' }
        ]
      },
      {
        id: 'motion_free_fall',
        name: 'Free Fall Gravity Dropper',
        tagline: 'Drop a ball from different heights under Earth gravity (g = 9.8 m/s²).',
        description: 'See how distance increases with the square of time (t²). Compare air resistance vs vacuum fall.',
        controls: [
          { id: 'drop_height', label: 'Drop Height (h)', min: 10, max: 100, step: 5, defaultValue: 45, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'fall_time', label: 'Time to Ground (t)' },
          { key: 'impact_vel', label: 'Impact Velocity (v)' }
        ]
      },
      {
        id: 'motion_relative',
        name: 'Relative Velocity on Parallel Tracks',
        tagline: 'Two realistic passenger trains: switch between Ground Observer & Train A Passenger views.',
        description: 'See why Train B appears frozen in place when both trains travel at the exact same speed, and watch it overtake or drift backward as relative velocity changes.',
        controls: [
          { id: 'vA', label: 'Train A Speed (vA)', min: 0, max: 80, step: 5, defaultValue: 30, unit: 'km/h' },
          { id: 'vB', label: 'Train B Speed (vB)', min: 0, max: 80, step: 5, defaultValue: 45, unit: 'km/h' },
          { id: 'frame', label: 'Observer (0: Ground, 1: Train A Rider)', min: 0, max: 1, step: 1, defaultValue: 0 }
        ],
        telemetryLabels: [
          { key: 'v_rel', label: 'Relative Velocity (vB - vA)' },
          { key: 'v_ms', label: 'Relative Speed (m/s)' },
          { key: 'view_mode', label: 'Active Reference Frame' },
          { key: 'perception', label: 'Motion Perception' }
        ]
      }
    ]
  },

  newtons_laws: {
    id: 'newtons_laws',
    subject: 'physics',
    title: "Newton's Laws",
    category: 'PHYSICS',
    shortDesc: 'Inertia, force equals mass times acceleration (F = ma), and action-reaction pairs.',
    conceptIntro:
      'Sir Isaac Newton answered WHY things move with three fundamental laws: 1. Objects keep doing what they are doing unless a force acts. 2. Greater force causes greater acceleration, but heavier mass resists it (F = ma). 3. For every push, there is an equal and opposite push.',
    realWorldExample:
      'Wearing seatbelts to prevent flying forward when a car brakes (Inertia), and rocket engines blasting gas downward to lift off into space (Action-Reaction).',
    keyFormulas: [
      { formula: 'F_net = m · a', explanation: 'Net force equals mass times acceleration (Second Law).' },
      { formula: 'f_friction ≤ μ · N', explanation: 'Frictional resistance depends on surface roughness μ and normal contact force N.' },
      { formula: 'F_AB = -F_BA', explanation: 'Action and reaction forces are equal and opposite (Third Law).' }
    ],
    keyTakeaways: [
      'An object does NOT need a force to keep moving; it only needs a force to CHANGE its motion.',
      'Heavier objects require proportionally more force to achieve the same acceleration.',
      'Action and reaction forces act on TWO DIFFERENT bodies, so they never cancel each other out.'
    ],
    simulations: [
      {
        id: 'newton_inertia_friction',
        name: 'Inertia & Friction Air Track',
        tagline: 'Give a puck a push on ice vs gravel.',
        description: 'Set surface friction from 0 (frictionless space/ice) to 0.6 (rough). Observe how inertia keeps the frictionless puck moving forever at constant velocity.',
        controls: [
          { id: 'push_force', label: 'Initial Push Force', min: 5, max: 30, step: 5, defaultValue: 15, unit: 'N' },
          { id: 'friction_coeff', label: 'Friction Coefficient (μ)', min: 0, max: 0.5, step: 0.05, defaultValue: 0.1 }
        ],
        telemetryLabels: [
          { key: 'stop_distance', label: 'Stopping Distance' },
          { key: 'f_fric', label: 'Friction Force' },
          { key: 'state', label: 'Motion Status' }
        ]
      },
      {
        id: 'newton_f_ma',
        name: 'F = ma Accelerator Cart',
        tagline: 'Change pulling force and cart mass to verify a = F / m.',
        description: 'Increase weight hanging over a pulley to increase force F, or add bricks to the cart to increase mass m. Measure the acceleration directly.',
        controls: [
          { id: 'force_val', label: 'Applied Force (F)', min: 2, max: 20, step: 1, defaultValue: 10, unit: 'N' },
          { id: 'cart_mass', label: 'Cart Mass (m)', min: 1, max: 10, step: 1, defaultValue: 2, unit: 'kg' }
        ],
        telemetryLabels: [
          { key: 'calc_accel', label: 'Acceleration (a = F/m)' },
          { key: 'ratio_check', label: 'F / m Ratio' }
        ]
      },
      {
        id: 'newton_action_reaction',
        name: 'Action-Reaction Skater Push',
        tagline: 'Two ice skaters push off each other: see recoil velocities.',
        description: 'A heavy skater and a light skater push each other. The forces are identical, but the lighter skater zooms away much faster!',
        controls: [
          { id: 'mass_skater1', label: 'Skater 1 Mass', min: 30, max: 90, step: 5, defaultValue: 40, unit: 'kg' },
          { id: 'mass_skater2', label: 'Skater 2 Mass', min: 30, max: 90, step: 5, defaultValue: 80, unit: 'kg' }
        ],
        telemetryLabels: [
          { key: 'v1_recoil', label: 'Skater 1 Velocity' },
          { key: 'v2_recoil', label: 'Skater 2 Velocity' },
          { key: 'force_equality', label: 'Force 1 = -Force 2' }
        ]
      }
    ]
  },

  work_energy_power: {
    id: 'work_energy_power',
    subject: 'physics',
    title: 'Work, Energy & Power',
    category: 'PHYSICS',
    shortDesc: 'Kinetic energy, stored potential energy, and energy conservation.',
    conceptIntro:
      'Energy cannot be created or destroyed, only transformed. When you do work against gravity by lifting an object, you store Gravitational Potential Energy (mgh). When it falls, that potential energy converts entirely into speed (Kinetic Energy ½mv²).',
    realWorldExample:
      'Rollercoasters climbing up a steep lift hill to gain potential energy, then converting it into roaring speed at the bottom of the drop.',
    keyFormulas: [
      { formula: 'Work = F · d · cos(θ)', explanation: 'Work done is force in direction of displacement.' },
      { formula: 'KE = ½ m v²', explanation: 'Kinetic energy stored in an object moving at velocity v.' },
      { formula: 'PE = m g h', explanation: 'Gravitational potential energy stored at height h.' }
    ],
    keyTakeaways: [
      'If you push hard on a wall but it does not move, distance is zero so Work is zero!',
      'Total mechanical energy (KE + PE) remains constant in frictionless systems.',
      'Power is simply the rate of doing work: 1 Watt = 1 Joule per second.'
    ],
    simulations: [
      {
        id: 'energy_rollercoaster',
        name: 'Rollercoaster Skate Track',
        tagline: 'Watch Potential Energy swap into Kinetic Energy back and forth.',
        description: 'Drag the skater to the top of the ramp and release. Observe the dynamic live bar chart where Blue (Kinetic) + Purple (Potential) always equals Green (Total).',
        controls: [
          { id: 'skater_mass', label: 'Skater Mass (m)', min: 20, max: 100, step: 10, defaultValue: 50, unit: 'kg' },
          { id: 'release_height', label: 'Release Height (h)', min: 2, max: 10, step: 0.5, defaultValue: 6, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'ke_val', label: 'Kinetic Energy (KE)' },
          { key: 'pe_val', label: 'Potential Energy (PE)' },
          { key: 'tot_e', label: 'Total Energy (Constant)' }
        ]
      },
      {
        id: 'work_angle_pull',
        name: 'Work Done at an Angle (F cos θ)',
        tagline: 'Pull a crate with a rope at different angles θ.',
        description: 'Only the horizontal component of force F cos(θ) does work to move the crate forward. Pulling straight up (90°) does zero forward work!',
        controls: [
          { id: 'pull_force', label: 'Rope Force (F)', min: 10, max: 100, step: 5, defaultValue: 50, unit: 'N' },
          { id: 'rope_angle', label: 'Pull Angle (θ)', min: 0, max: 90, step: 5, defaultValue: 30, unit: '°' },
          { id: 'pull_dist', label: 'Distance (d)', min: 1, max: 10, step: 1, defaultValue: 5, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'eff_force', label: 'Effective Force (F cosθ)' },
          { key: 'work_done', label: 'Work Done (Joules)' }
        ]
      },
      {
        id: 'energy_spring_mass',
        name: 'Spring Potential Energy Oscillator',
        tagline: 'Compress a spring and see elastic potential energy convert to speed.',
        description: 'Hooke’s Law spring with stiffness k: compress it by distance x, release it, and watch energy slosh between spring PE (½kx²) and cart KE.',
        controls: [
          { id: 'spring_k', label: 'Spring Constant (k)', min: 50, max: 300, step: 25, defaultValue: 150, unit: 'N/m' },
          { id: 'compression_x', label: 'Compression (x)', min: 0.1, max: 0.8, step: 0.05, defaultValue: 0.4, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'spring_pe', label: 'Stored Spring Energy' },
          { key: 'max_speed', label: 'Max Release Speed' }
        ]
      }
    ]
  },

  gravitation: {
    id: 'gravitation',
    subject: 'physics',
    title: 'Gravitation',
    category: 'PHYSICS',
    shortDesc: 'Why objects fall toward Earth and how moons orbit around planets.',
    conceptIntro:
      'Every mass in the universe attracts every other mass. The force grows stronger when objects are heavier, but weakens rapidly with the square of distance (1/r²). This same gravitational force that drops an apple keeps the Moon in orbit around Earth.',
    realWorldExample:
      'Ocean tides caused by the gravitational tug of the Moon, and satellites orbiting Earth to provide weather forecasts and GPS.',
    keyFormulas: [
      { formula: 'F = G · (M₁ M₂) / r²', explanation: 'Newton’s universal law of gravitation.' },
      { formula: 'g = G · M / R²', explanation: 'Acceleration due to gravity at planet surface.' },
      { formula: 'v_orbit = √(G M / r)', explanation: 'Orbital velocity required for a stable circular orbit.' }
    ],
    keyTakeaways: [
      'Doubling distance between two bodies reduces gravitational attraction to one-fourth!',
      'An orbit is essentially continuous free-fall: the satellite falls toward Earth, but moves forward fast enough that Earth curves away underneath it.',
      'Gravity inside the Earth decreases linearly toward zero at the center.'
    ],
    simulations: [
      {
        id: 'grav_two_body',
        name: 'Universal Gravitation Force Visualizer',
        tagline: 'Adjust mass M₁, mass M₂, and distance r to see force arrows scale.',
        description: 'Observe Newton’s inverse-square law directly. Notice how doubling distance divides the force by 4.',
        controls: [
          { id: 'm1_grav', label: 'Mass 1 (M₁)', min: 10, max: 100, step: 10, defaultValue: 40, unit: 'kg' },
          { id: 'm2_grav', label: 'Mass 2 (M₂)', min: 10, max: 100, step: 10, defaultValue: 60, unit: 'kg' },
          { id: 'r_dist', label: 'Distance (r)', min: 2, max: 12, step: 0.5, defaultValue: 5, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'grav_force', label: 'Attractive Force (F)' },
          { key: 'inv_sq_factor', label: 'Inverse-Square Factor (1/r²)' }
        ]
      },
      {
        id: 'grav_orbit_satellite',
        name: 'Keplerian Planetary Orbit',
        tagline: 'Launch a satellite: see circular vs elliptical Kepler orbits.',
        description: 'Observe Kepler’s Second Law: the orbiting satellite speeds up when close to the planet (perihelion) and slows down when far away (aphelion).',
        controls: [
          { id: 'v_launch', label: 'Launch Speed', min: 15, max: 35, step: 1, defaultValue: 24, unit: 'km/s' },
          { id: 'planet_mass', label: 'Planet Gravity Mass', min: 50, max: 200, step: 25, defaultValue: 100 }
        ],
        telemetryLabels: [
          { key: 'orbit_shape', label: 'Orbit Geometry' },
          { key: 'period_t', label: 'Orbital Period' }
        ]
      },
      {
        id: 'grav_altitude_g',
        name: 'Gravity vs Altitude & Depth',
        tagline: 'Travel from Earth’s core to outer space and watch g change.',
        description: 'At Earth’s center, g = 0 m/s². At the surface, g = 9.8 m/s². Above Earth, g decays with 1/r².',
        controls: [
          { id: 'altitude_km', label: 'Position Relative to Surface', min: -6400, max: 20000, step: 1000, defaultValue: 0, unit: 'km' }
        ],
        telemetryLabels: [
          { key: 'g_eff', label: 'Effective Gravity (g)' },
          { key: 'weight_scale', label: 'Weight of 60kg Person' }
        ]
      }
    ]
  },

  waves: {
    id: 'waves',
    subject: 'physics',
    title: 'Waves',
    category: 'PHYSICS',
    shortDesc: 'Water ripples, sound vibrations, crests, troughs, and frequency.',
    conceptIntro:
      'A wave is a disturbance that carries energy from one place to another without transporting matter. Water waves and light are transverse waves (vibrating perpendicular to motion), while sound waves are longitudinal (compressing back and forth in air).',
    realWorldExample:
      'Hearing sound from a speaker through air compressions, sea waves lifting boats up and down, and tuning an FM radio.',
    keyFormulas: [
      { formula: 'v = f · λ', explanation: 'Wave speed equals frequency times wavelength.' },
      { formula: 'T = 1 / f', explanation: 'Time period of one full oscillation is reciprocal of frequency.' },
      { formula: 'I ∝ A²', explanation: 'Wave energy and intensity are proportional to square of amplitude.' }
    ],
    keyTakeaways: [
      'In a wave, particles oscillate around their equilibrium position; only energy travels forward.',
      'Higher frequency means shorter wavelength when speed is constant.',
      'When two waves overlap, their heights add together (Principle of Superposition).'
    ],
    simulations: [
      {
        id: 'wave_transverse_string',
        name: 'Transverse Wave on a String',
        tagline: 'Adjust amplitude (A), frequency (f), and string tension.',
        description: 'Watch colored beads along a string oscillate up and down while the continuous wave shape travels smoothly to the right.',
        controls: [
          { id: 'amp_val', label: 'Amplitude (A)', min: 10, max: 60, step: 5, defaultValue: 35, unit: 'px' },
          { id: 'freq_val', label: 'Frequency (f)', min: 0.5, max: 3, step: 0.25, defaultValue: 1.25, unit: 'Hz' },
          { id: 'wave_spd', label: 'Tension / Speed (v)', min: 1, max: 4, step: 0.5, defaultValue: 2.5 }
        ],
        telemetryLabels: [
          { key: 'wavelength_disp', label: 'Wavelength (λ)' },
          { key: 'period_disp', label: 'Period (T = 1/f)' },
          { key: 'speed_disp', label: 'Wave Speed (v = fλ)' }
        ]
      },
      {
        id: 'wave_sound_particles',
        name: 'Sound Wave (Compressions & Rarefactions)',
        tagline: 'See longitudinal air molecules compress and expand.',
        description: 'Observe air particles vibrating back and forth parallel to sound direction. Dense bands are compressions; spaced-out bands are rarefactions.',
        controls: [
          { id: 'sound_freq', label: 'Sound Pitch / Frequency', min: 1, max: 4, step: 0.5, defaultValue: 2, unit: 'Hz' },
          { id: 'sound_amp', label: 'Loudness / Amplitude', min: 10, max: 40, step: 5, defaultValue: 25 }
        ],
        telemetryLabels: [
          { key: 'pressure_state', label: 'Pressure Wave Peaks' },
          { key: 'particle_motion', label: 'Vibration Direction' }
        ]
      },
      {
        id: 'wave_superposition',
        name: 'Superposition & Interference',
        tagline: 'Send two wave pulses toward each other: see them add and cancel.',
        description: 'When two wave crests meet, they add up to make a double crest (Constructive Interference). When a crest meets a trough, they cancel to flat line (Destructive Interference)!',
        controls: [
          { id: 'pulse1_amp', label: 'Pulse 1 Height', min: -40, max: 40, step: 5, defaultValue: 30, unit: 'px' },
          { id: 'pulse2_amp', label: 'Pulse 2 Height', min: -40, max: 40, step: 5, defaultValue: 30, unit: 'px' }
        ],
        telemetryLabels: [
          { key: 'interference_type', label: 'Interference Type' },
          { key: 'combined_amp', label: 'Combined Peak Height' }
        ]
      }
    ]
  },

  // ==========================================
  // PHYSICS: OPTICS & LIGHT
  // ==========================================
  optics: {
    id: 'optics',
    subject: 'physics',
    title: 'Optics & Light',
    category: 'PHYSICS',
    shortDesc: 'Refraction, Snell’s Law, thin lens ray tracing, and prism dispersion.',
    conceptIntro:
      'Optics studies how light propagates, reflects, refracts, and forms images. By modeling light as geometric rays, we can precisely determine how curved glass lenses focus sharp images, how prisms split sunlight into colors, and how total internal reflection powers modern fiber-optic internet.',
    realWorldExample:
      'Eyeglasses and microscope lenses focusing light on the retina or sensors, fiber-optic cables guiding laser pulses across ocean floors, and water droplets dispersing sunlight into vibrant rainbows.',
    keyFormulas: [
      { formula: 'n₁ sin θ₁ = n₂ sin θ₂', explanation: "Snell's Law: ratio of refractive indices determines how light bends across an optical interface." },
      { formula: '1/f = 1/v - 1/u', explanation: 'Thin Lens Equation: connects focal length (f), image distance (v), and object distance (u).' },
      { formula: 'm = v / u = hᵢ / hₒ', explanation: 'Linear Magnification: ratio of image height to object height.' },
      { formula: 'sin θ_c = n₂ / n₁', explanation: 'Critical Angle: threshold incident angle for 100% Total Internal Reflection (when n₁ > n₂).' }
    ],
    keyTakeaways: [
      'Light bends toward the normal when entering an optically denser medium (higher n) and slows down.',
      'Total Internal Reflection occurs when light in a denser medium strikes a boundary beyond the critical angle.',
      'Convex lenses converge light to form real inverted or virtual upright images; concave lenses always diverge light.',
      'Dispersion happens because glass has a slightly higher refractive index for blue/violet light than red light.'
    ],
    simulations: [
      {
        id: 'optics_snells_law',
        name: "Snell's Law & Total Internal Reflection",
        tagline: 'Vary incident angle & refractive indices to see beam refraction or 100% TIR.',
        description: 'Observe light entering from Medium 1 into Medium 2. Adjust incident angle and watch the refracted beam bend according to Snell\'s law, or observe Total Internal Reflection when crossing from glass to air beyond the critical angle.',
        controls: [
          { id: 'theta1', label: 'Incident Angle θ₁', min: 0, max: 80, step: 2, defaultValue: 35, unit: '°' },
          { id: 'n1', label: 'Medium 1 Index (n₁)', min: 1.0, max: 2.2, step: 0.1, defaultValue: 1.5 },
          { id: 'n2', label: 'Medium 2 Index (n₂)', min: 1.0, max: 2.2, step: 0.1, defaultValue: 1.0 }
        ],
        telemetryLabels: [
          { key: 'refracted_angle', label: 'Refracted Angle θ₂' },
          { key: 'critical_angle', label: 'Critical Angle θ_c' },
          { key: 'optical_state', label: 'Beam Behavior' },
          { key: 'speed_ratio', label: 'Speed Ratio (v₁/v₂)' }
        ]
      },
      {
        id: 'optics_thin_lens',
        name: 'Thin Lens Ray Tracer & Image Formation',
        tagline: 'Move object and change focal length to trace principal rays in real-time.',
        description: 'Interactive geometric optics bench tracing the 3 principal rays: parallel ray to focus, focal ray through lens center, and optical center ray. Watch real inverted vs virtual upright images form dynamically.',
        controls: [
          { id: 'focal_len', label: 'Focal Length (f)', min: -80, max: 100, step: 10, defaultValue: 60, unit: 'mm' },
          { id: 'obj_dist', label: 'Object Distance (u)', min: 30, max: 160, step: 5, defaultValue: 100, unit: 'mm' },
          { id: 'obj_height', label: 'Object Height (h)', min: 15, max: 60, step: 5, defaultValue: 35, unit: 'mm' }
        ],
        telemetryLabels: [
          { key: 'image_dist', label: 'Image Distance (v)' },
          { key: 'magnification', label: 'Magnification (m)' },
          { key: 'image_nature', label: 'Image Nature' },
          { key: 'lens_mode', label: 'Lens Type' }
        ]
      },
      {
        id: 'optics_prism_dispersion',
        name: 'Prism Light Dispersion & Minimum Deviation',
        tagline: 'Split collimated white light into rainbow spectral wavelengths.',
        description: 'Direct a beam of white light into an equilateral glass prism. Because refractive index depends slightly on wavelength (Cauchy dispersion), violet light bends more than red, fanning the beam into an exquisite rainbow spectrum.',
        controls: [
          { id: 'incident_angle', label: 'Angle of Incidence (i)', min: 25, max: 75, step: 1, defaultValue: 48, unit: '°' },
          { id: 'prism_apex', label: 'Prism Apex Angle (A)', min: 40, max: 70, step: 5, defaultValue: 60, unit: '°' },
          { id: 'glass_dispersion', label: 'Dispersion Factor (Δn)', min: 0.02, max: 0.08, step: 0.01, defaultValue: 0.04 }
        ],
        telemetryLabels: [
          { key: 'dev_red', label: 'Red Deviation (δ_red)' },
          { key: 'dev_violet', label: 'Violet Deviation (δ_violet)' },
          { key: 'angular_spread', label: 'Spectral Spread (Δδ)' },
          { key: 'deviation_state', label: 'Minimum Deviation Status' }
        ]
      }
    ]
  },

  // ==========================================
  // PHYSICS: THERMODYNAMICS & HEAT
  // ==========================================
  thermodynamics: {
    id: 'thermodynamics',
    subject: 'physics',
    title: 'Thermodynamics',
    category: 'PHYSICS',
    shortDesc: 'Ideal gas law (PV = nRT), kinetic molecular theory, Carnot heat cycle, and thermal conduction.',
    conceptIntro:
      'Thermodynamics explores the transformation of thermal energy into mechanical work and the microscopic kinetics of atoms. Rather than calculating trillions of individual molecular paths, thermodynamics describes macroscopic states through pressure, volume, temperature, and heat flow governed by fundamental conservation laws.',
    realWorldExample:
      'Car combustion engines pushing pistons to drive wheels, household refrigerators pumping heat outward to chill groceries, and heat sinks drawing heat away from computer CPUs.',
    keyFormulas: [
      { formula: 'P · V = n · R · T', explanation: 'Ideal Gas Law: relates pressure, volume, moles, and absolute temperature.' },
      { formula: 'v_rms = √(3RT / M)', explanation: 'Root-Mean-Square Velocity: microscopic average molecular speed as a function of temperature.' },
      { formula: 'ΔU = Q - W', explanation: 'First Law of Thermodynamics: conservation of energy between heat added, work done, and internal energy.' },
      { formula: 'η = 1 - T_C / T_H', explanation: 'Carnot Maximum Efficiency: upper physical limit of thermal efficiency between two heat reservoirs.' }
    ],
    keyTakeaways: [
      'Temperature directly measures the average kinetic energy of molecular motion: higher T means faster particles.',
      'Gas pressure originates from billions of tiny molecular impacts against container walls every millisecond.',
      'Expanding gases do mechanical work on their surroundings; if no heat enters (adiabatic), the gas cools.',
      'No engine can be 100% efficient: the Second Law demands that some heat must always be rejected to a colder sink.'
    ],
    simulations: [
      {
        id: 'thermo_ideal_gas_chamber',
        name: 'Kinetic Gas Chamber & Ideal Gas Law',
        tagline: 'See gas particles collide with piston walls as you change T and V.',
        description: 'Enclosed cylinder packed with energetic gas particles bouncing off walls elastically. Crank up temperature to make particles dart faster and watch the pressure gauge climb; compress volume to see collision frequency spike.',
        controls: [
          { id: 'temperature', label: 'Temperature (T)', min: 150, max: 750, step: 25, defaultValue: 300, unit: 'K' },
          { id: 'volume', label: 'Chamber Volume (V)', min: 10, max: 45, step: 5, defaultValue: 25, unit: 'L' },
          { id: 'particles_count', label: 'Gas Moles (n)', min: 1, max: 5, step: 1, defaultValue: 2, unit: 'mol' }
        ],
        telemetryLabels: [
          { key: 'pressure', label: 'Pressure (P)' },
          { key: 'v_rms', label: 'RMS Speed (v_rms)' },
          { key: 'internal_energy', label: 'Internal Energy (U)' },
          { key: 'collision_freq', label: 'Wall Collision Rate' }
        ]
      },
      {
        id: 'thermo_carnot_cycle',
        name: 'Carnot Cycle & Heat Engine PV Diagram',
        tagline: 'Trace the 4 reversible stages on an indicator P-V curve.',
        description: 'Watch an ideal engine cycle through 4 classical strokes: Isothermal Expansion (T_H), Adiabatic Expansion (T_H→T_C), Isothermal Compression (T_C), and Adiabatic Compression (T_C→T_H). The enclosed loop area represents net mechanical work output.',
        controls: [
          { id: 'thot', label: 'Hot Reservoir (T_H)', min: 450, max: 1200, step: 25, defaultValue: 750, unit: 'K' },
          { id: 'tcold', label: 'Cold Reservoir (T_C)', min: 200, max: 400, step: 20, defaultValue: 300, unit: 'K' },
          { id: 'compression_ratio', label: 'Compression Ratio (r)', min: 2, max: 6, step: 0.5, defaultValue: 3.5 }
        ],
        telemetryLabels: [
          { key: 'carnot_efficiency', label: 'Carnot Efficiency (η)' },
          { key: 'work_per_cycle', label: 'Work per Cycle (W_net)' },
          { key: 'heat_input', label: 'Heat Ingested (Q_H)' },
          { key: 'heat_rejected', label: 'Heat Rejected (Q_C)' }
        ]
      },
      {
        id: 'thermo_heat_conduction',
        name: 'Thermal Gradient & Fourier Heat Conduction',
        tagline: 'Visualize heat flux flowing through conductive bars with glowing thermal gradients.',
        description: 'A solid conducting bar held between a hot heat source and a cold sink. Inspect Fourier\'s law dQ/dt = kA·ΔT/L with an interactive glowing thermal color map and animated heat flux carrier particles.',
        controls: [
          { id: 't_hot_source', label: 'Hot Temperature (T_H)', min: 50, max: 250, step: 10, defaultValue: 160, unit: '°C' },
          { id: 't_cold_sink', label: 'Cold Temperature (T_C)', min: 0, max: 40, step: 5, defaultValue: 20, unit: '°C' },
          { id: 'conductivity_k', label: 'Conductivity (k)', min: 15, max: 400, step: 15, defaultValue: 205, unit: 'W/m·K' },
          { id: 'bar_length', label: 'Bar Length (L)', min: 5, max: 30, step: 2.5, defaultValue: 15, unit: 'cm' }
        ],
        telemetryLabels: [
          { key: 'heat_flux', label: 'Heat Conduction Rate (dQ/dt)' },
          { key: 'temp_gradient', label: 'Temperature Gradient (ΔT/L)' },
          { key: 'material_spec', label: 'Simulated Material' },
          { key: 'midpoint_temp', label: 'Midpoint Temp (T_mid)' }
        ]
      }
    ]
  },

  // ==========================================
  // ELECTROMAGNETISM (PHYSICS)
  // ==========================================
  electromagnetism: {
    id: 'electromagnetism',
    subject: 'physics',
    title: 'Electromagnetism',
    category: 'PHYSICS',
    shortDesc: 'Lorentz force, charged particle cyclotron motion, Coulomb dipole field lines, and Faraday induction.',
    conceptIntro:
      'Electromagnetism unifies the electric force between static charges and the magnetic force produced by moving charges. From electric motors to cyclotrons and transformers, electromagnetic interactions govern how electricity generates magnetism and changing magnetic fields induce electromotive force.',
    realWorldExample:
      'Electric power generators spinning turbines to light up cities, MRI machines using strong magnetic fields, and wireless charging pads transferring energy through induction.',
    keyFormulas: [
      { formula: '\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})', explanation: 'Lorentz Force Law: total electromagnetic force on a charge q moving with velocity v.' },
      { formula: 'r = \\frac{mv_{\\perp}}{qB}', explanation: 'Cyclotron Radius: circular orbit radius for a charged particle in a uniform magnetic field.' },
      { formula: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt}', explanation: 'Faraday’s Law of Induction: rate of change of magnetic flux produces induced electromotive force.' }
    ],
    keyTakeaways: [
      'Magnetic fields exert force ONLY on moving charges, and the force is always perpendicular to both velocity and the B-field.',
      'Electric field lines always originate on positive charges and terminate on negative charges.',
      'A changing magnetic flux through a conducting loop induces an EMF that opposes the change (Lenz’s Law).'
    ],
    simulations: [
      {
        id: 'em_lorentz_cyclotron',
        name: 'Lorentz Force & Helical Cyclotron',
        tagline: 'Watch charged particles curve or spiral in a uniform magnetic field.',
        description: 'Inject a charged particle into a magnetic field B. Adjust charge, velocity, and pitch angle to see circular cyclotron orbits or 3D helical spirals.',
        controls: [
          { id: 'charge', label: 'Charge (q)', min: -2, max: 2, step: 1, defaultValue: 1, unit: 'e' },
          { id: 'velocity', label: 'Speed (v)', min: 10, max: 60, step: 5, defaultValue: 30, unit: 'm/s' },
          { id: 'b_field', label: 'Magnetic Field (B)', min: -4, max: 4, step: 0.5, defaultValue: 2, unit: 'T' },
          { id: 'pitch_angle', label: 'Pitch Angle (α)', min: 0, max: 60, step: 10, defaultValue: 20, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'cyclotron_radius', label: 'Orbit Radius (r)' },
          { key: 'cyclotron_omega', label: 'Cyclotron Frequency (ω)' },
          { key: 'time_period', label: 'Orbital Period (T)' },
          { key: 'lorentz_force', label: 'Lorentz Force' }
        ]
      },
      {
        id: 'em_coulomb_dipole',
        name: 'Electric Dipole & Field Lines',
        tagline: 'Visualize electric vector fields and equipotential curves around point charges.',
        description: 'Position two charges and observe the electric field lines flowing between them. Toggle between opposite dipole charges and like repulsive charges.',
        controls: [
          { id: 'q1', label: 'Charge Q₁', min: -5, max: 5, step: 1, defaultValue: 2, unit: 'μC' },
          { id: 'q2', label: 'Charge Q₂', min: -5, max: 5, step: 1, defaultValue: -2, unit: 'μC' },
          { id: 'separation', label: 'Separation (d)', min: 8, max: 22, step: 2, defaultValue: 14, unit: 'cm' }
        ],
        telemetryLabels: [
          { key: 'coulomb_force', label: 'Coulomb Interaction' },
          { key: 'dipole_moment', label: 'Dipole Moment (p)' },
          { key: 'separation_dist', label: 'Separation' },
          { key: 'config_type', label: 'Configuration' }
        ]
      },
      {
        id: 'em_faraday_induction',
        name: 'Faraday’s Law & AC Generator',
        tagline: 'Spin a coil inside magnetic poles to generate alternating current.',
        description: 'Rotate a conducting armature coil inside permanent magnetic pole shoes. Watch magnetic flux oscillate and power an AC indicator light bulb.',
        controls: [
          { id: 'b_field', label: 'Field Strength (B)', min: 0.5, max: 3.0, step: 0.5, defaultValue: 1.5, unit: 'T' },
          { id: 'rpm', label: 'Rotation Speed', min: 20, max: 120, step: 10, defaultValue: 60, unit: 'RPM' },
          { id: 'num_turns', label: 'Coil Turns (N)', min: 10, max: 100, step: 10, defaultValue: 50 }
        ],
        telemetryLabels: [
          { key: 'instant_emf', label: 'Instantaneous EMF' },
          { key: 'peak_emf', label: 'Peak Voltage (V_peak)' },
          { key: 'magnetic_flux', label: 'Magnetic Flux (Φ)' },
          { key: 'ac_frequency', label: 'AC Frequency (f)' }
        ]
      }
    ]
  },

  // ==========================================
  // VECTORS & 3D GEOMETRY (MATHEMATICS)
  // ==========================================
  vectors_3d: {
    id: 'vectors_3d',
    subject: 'maths',
    title: 'Vectors & 3D Space',
    category: 'MATHEMATICS',
    shortDesc: 'Dot product projection, 3D cross product parallelogram, and 2D relative velocity navigation.',
    conceptIntro:
      'Vectors are mathematical quantities that possess both magnitude and direction. In physics and 3D geometry, vectors represent velocity, force, and spatial displacements. The dot product measures collinear alignment, while the cross product computes rotational torque and perpendicular normal vectors.',
    realWorldExample:
      'Flight navigation computing crosswind drift, 3D game engines calculating lighting surface normals, and torque turning a wrench on a bolt.',
    keyFormulas: [
      { formula: '\\vec{A} \\cdot \\vec{B} = |A||B|\\cos\\theta', explanation: 'Dot Product: scalar projection measuring how much two vectors point along each other.' },
      { formula: '\\vec{A} \\times \\vec{B} = |A||B|\\sin\\theta\\,\\hat{n}', explanation: 'Cross Product: normal vector perpendicular to both, magnitude equals parallelogram area.' },
      { formula: '\\vec{v}_{\\text{rel}} = \\vec{v}_A - \\vec{v}_B', explanation: 'Relative Velocity: motion of body A as observed from the reference frame of body B.' }
    ],
    keyTakeaways: [
      'If two non-zero vectors have a dot product of zero, they are strictly perpendicular (orthogonal).',
      'The cross product is anti-commutative: A × B = -(B × A). Swapping order flips the direction.',
      'To cross a river in the shortest time, always aim the boat straight across perpendicular to the bank.'
    ],
    editorialTeaching: {
      headline: 'Vectors from First Principles',
      story:
        'A vector is direction and magnitude unified. When an airplane flies into a crosswind, or a boat crosses a surging river, the real path over the ground is the geometric vector sum. By decomposing vectors into orthogonal basis directions, complex multi-dimensional physics resolves into elementary one-dimensional arithmetic.',
      controlsGuide:
        'Adjust the lengths of vectors A and B and slide the angle θ between them. Inspect the perpendicular normal vector spawned by the cross product and the scalar shadow projected by the dot product.',
      variablesAndOutputs:
        'The shaded parallelogram represents the magnitude of the cross product |A × B|. The glowing normal arrow shows the right-hand rule direction. The telemetry HUD displays numerical scalar dot products and vector cross magnitudes.',
      modelAssumptions:
        'Cartesian Euclidean 3D space with orthonormal basis î, ĵ, k̂.',
      learningObjective:
        'Understand why 5 + 5 can equal 0 (when vectors point in opposite directions), 10 (when aligned), or any intermediate number.'
    },
    simulations: [
      {
        id: 'vec_cross_dot_product',
        name: '3D Cross & Dot Product Studio',
        tagline: 'See the shaded area of A × B and the projected shadow of A · B.',
        description: 'Adjust vector lengths and the angle between them. Inspect the perpendicular normal vector and the scalar projection in real time.',
        controls: [
          { id: 'mag_a', label: 'Vector A Magnitude', min: 2, max: 10, step: 1, defaultValue: 6 },
          { id: 'mag_b', label: 'Vector B Magnitude', min: 2, max: 10, step: 1, defaultValue: 5 },
          { id: 'theta', label: 'Angle θ between A & B', min: 0, max: 180, step: 5, defaultValue: 50, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'dot_product', label: 'Dot Product (A · B)' },
          { key: 'cross_magnitude', label: 'Cross Product Area' },
          { key: 'direction_rule', label: 'Right Hand Rule' },
          { key: 'orthogonality', label: 'Perpendicular Status' }
        ]
      },
      {
        id: 'vec_river_boat',
        name: 'River-Boat Relative Velocity',
        tagline: 'Steer across a flowing river and solve shortest path vs shortest time.',
        description: 'Classic JEE physics problem: aim your boat upstream against the river current. Calculate drift distance, crossing time, and resultant ground velocity.',
        controls: [
          { id: 'boat_speed', label: 'Boat Speed (v_b)', min: 2, max: 10, step: 0.5, defaultValue: 5, unit: 'm/s' },
          { id: 'river_speed', label: 'River Speed (v_r)', min: 1, max: 8, step: 0.5, defaultValue: 3, unit: 'm/s' },
          { id: 'heading_angle', label: 'Steering Angle (θ)', min: 60, max: 150, step: 5, defaultValue: 120, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'crossing_time', label: 'Crossing Time' },
          { key: 'drift_distance', label: 'Downstream Drift' },
          { key: 'net_velocity', label: 'Ground Velocity' },
          { key: 'shortest_path_condition', label: 'Shortest Path Angle' }
        ]
      },
      {
        id: 'vec_component_decomposition',
        name: '3D Vector Resolution & Projections',
        tagline: 'Break any 3D vector into orthogonal components Vx î + Vy ĵ + Vz k̂.',
        description: 'Observe the 3D projection box and directional cosines as you vary vector magnitude, azimuth, and elevation.',
        controls: [
          { id: 'magnitude', label: 'Vector Magnitude', min: 3, max: 12, step: 1, defaultValue: 8 },
          { id: 'theta', label: 'Azimuth Angle (θ)', min: 0, max: 90, step: 5, defaultValue: 35, unit: '°' },
          { id: 'phi_3d', label: 'Elevation Angle (φ)', min: 0, max: 75, step: 5, defaultValue: 25, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'vector_notation', label: 'Cartesian Form' },
          { key: 'v_magnitude', label: 'Magnitude |V|' },
          { key: 'pythagorean_verify', label: 'Pythagorean Test' },
          { key: 'direction_cosines', label: 'Direction Cosines' }
        ]
      }
    ]
  },

  // ==========================================
  // WAVE OPTICS & INTERFERENCE (PHYSICS)
  // ==========================================
  wave_optics: {
    id: 'wave_optics',
    subject: 'physics',
    title: 'Wave Optics',
    category: 'PHYSICS',
    shortDesc: 'Young’s double slit experiment (YDSE), single slit Fraunhofer diffraction, and thin film iridescence.',
    conceptIntro:
      'Wave Optics treats light as an electromagnetic wave capable of interference and diffraction. When two coherent wave sources overlap, their amplitudes add vectorially, creating striking alternating patterns of bright constructive fringes and dark destructive nodes.',
    realWorldExample:
      'Rainbow shimmer on soap bubbles and peacock feathers, anti-reflective coatings on eyeglasses, and holograms on credit cards.',
    keyFormulas: [
      { formula: '\\beta = \\frac{\\lambda D}{d}', explanation: 'Fringe Width: distance between two consecutive bright or dark fringes in YDSE.' },
      { formula: 'a \\sin\\theta = n\\lambda', explanation: 'Diffraction Minima: angular condition for destructive interference in single slit diffraction.' },
      { formula: '2\\mu t \\cos r = (m + \\tfrac{1}{2})\\lambda', explanation: 'Thin Film Interference: constructive condition for reflected light accounting for π phase flip.' }
    ],
    keyTakeaways: [
      'Decreasing slit separation d in YDSE widens the fringes on the screen (inverse relationship).',
      'The central diffraction maximum in single slit diffraction is twice as wide as all secondary maxima.',
      'Thin film interference colors occur because different wavelengths experience constructive interference at different film thicknesses.'
    ],
    simulations: [
      {
        id: 'optics_ydse',
        name: 'Young’s Double Slit Experiment',
        tagline: 'Watch coherent ripples interfere and create alternating fringe bands.',
        description: 'Adjust wavelength from violet to deep red and change slit separation d. Observe live fringe width changes and the intensity distribution curve.',
        controls: [
          { id: 'wavelength', label: 'Wavelength (λ)', min: 400, max: 700, step: 25, defaultValue: 550, unit: 'nm' },
          { id: 'slit_distance', label: 'Slit Separation (d)', min: 0.2, max: 1.0, step: 0.1, defaultValue: 0.5, unit: 'mm' },
          { id: 'screen_distance', label: 'Screen Distance (D)', min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.2, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'fringe_width', label: 'Fringe Width (β)' },
          { key: 'beam_color', label: 'Wavelength & Color' },
          { key: 'path_diff_first_min', label: 'Path Difference for Min' },
          { key: 'fringe_spacing', label: 'Formula Reference' }
        ]
      },
      {
        id: 'optics_single_slit_diffraction',
        name: 'Single Slit Fraunhofer Diffraction',
        tagline: 'See light bend around narrow edges to form a wide central maximum.',
        description: 'Vary aperture slit width a to observe how wave spreading broadens when the aperture approaches the scale of light wavelengths.',
        controls: [
          { id: 'wavelength', label: 'Wavelength (λ)', min: 400, max: 700, step: 25, defaultValue: 600, unit: 'nm' },
          { id: 'slit_width', label: 'Slit Width (a)', min: 5, max: 30, step: 2.5, defaultValue: 12, unit: 'μm' },
          { id: 'screen_distance', label: 'Screen Distance (D)', min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.0, unit: 'm' }
        ],
        telemetryLabels: [
          { key: 'central_maximum_width', label: 'Central Width (2y₀)' },
          { key: 'angular_half_width', label: 'Angular Half-Width (θ)' },
          { key: 'first_minima_condition', label: 'First Minima Rule' },
          { key: 'diffraction_scale', label: 'Diffraction Regime' }
        ]
      },
      {
        id: 'optics_thin_film_interference',
        name: 'Thin Film Interference & Iridescence',
        tagline: 'Trace phase-shifted ray reflections that give soap bubbles rainbow colors.',
        description: 'Light reflecting off the upper and lower surfaces of a thin soap or oil film. See constructive reinforcement produce vibrant spectral swatches.',
        controls: [
          { id: 'thickness', label: 'Film Thickness (t)', min: 200, max: 800, step: 20, defaultValue: 480, unit: 'nm' },
          { id: 'refractive_index', label: 'Refractive Index (μ)', min: 1.2, max: 1.7, step: 0.05, defaultValue: 1.33 },
          { id: 'incident_angle', label: 'Incident Angle (i)', min: 0, max: 60, step: 5, defaultValue: 30, unit: '°' }
        ],
        telemetryLabels: [
          { key: 'path_difference', label: 'Optical Path Diff' },
          { key: 'refraction_angle', label: 'Angle in Film (r)' },
          { key: 'constructive_colors', label: 'Constructive Bands' },
          { key: 'phase_flip_status', label: 'Boundary Phase Flip' }
        ]
      }
    ]
  },

  // ==========================================
  // BIOLOGY (PhET COLORADO BENCHMARK)
  // ==========================================
  natural_selection: {
    id: 'natural_selection',
    subject: 'biology',
    title: 'Natural Selection',
    category: 'BIOLOGY',
    shortDesc: 'Explore genetic mutations, predator pressures, camouflage, and evolutionary fitness.',
    conceptIntro:
      'Natural selection is the differential survival and reproduction of individuals due to differences in phenotype. Organisms with traits suited to their environment survive longer and pass favorable alleles to offspring.',
    realWorldExample:
      'Peppered moths changing color during the Industrial Revolution, or Arctic hares maintaining white fur in snow versus brown hares in forest tundra.',
    keyFormulas: [
      { formula: 'p^2 + 2pq + q^2 = 1', explanation: 'Hardy-Weinberg equilibrium for allele and genotype frequencies in a population.' },
      { formula: 'w = 1 - s', explanation: 'Relative Darwinian fitness w relates to selection coefficient s against a trait.' },
      { formula: '\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)', explanation: 'Logistic population growth bounded by carrying capacity K.' }
    ],
    keyTakeaways: [
      'Mutations introduce novel genetic variation randomly; natural selection filters traits non-randomly.',
      'Camouflage directly affects predation risk based on the background biome.',
      'Carrying capacity limits total population size when food or resources become scarce.'
    ],
    editorialTeaching: {
      headline: 'Darwinian Survival & Camouflage Equilibrium',
      story: 'Witness how a single genetic mutation (fur color) transforms a bunny population over generations when hunted by wolves across snow and savannah biomes.',
      controlsGuide: 'Toggle the biome (Arctic Snow vs Savannah Grass), adjust predator count, and mutate fur color to observe shifts in trait frequencies.',
      variablesAndOutputs: 'Monitors total living population, white fur percentage, brown fur percentage, and carrying capacity.',
      modelAssumptions: 'Random mating without sexual selection; constant predation efficiency governed by contrast ratio.',
      learningObjective: 'Understand how environmental selection pressure dictates allele frequencies over successive generations.'
    },
    simulations: [
      {
        id: 'bio_natural_selection',
        name: 'Natural Selection: Bunnies & Predators',
        tagline: 'PhET-inspired interactive bunny population with wolves and camouflage',
        description: 'Observe real-time predator-prey dynamics, genetic fur color mutations, and survival shifts between Arctic and Savannah habitats.',
        controls: [
          { id: 'environment', label: 'Habitat Biome (0: Arctic, 1: Savannah)', min: 0, max: 1, step: 1, defaultValue: 0 },
          { id: 'wolves', label: 'Predator Wolves', min: 0, max: 6, step: 1, defaultValue: 2 },
          { id: 'mutation', label: 'Brown Fur Mutation (0: Off, 1: On)', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'food', label: 'Food Abundance (%)', min: 20, max: 100, step: 10, defaultValue: 70, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'total_population', label: 'Total Bunnies' },
          { key: 'white_fur_pct', label: 'White Trait' },
          { key: 'brown_fur_pct', label: 'Brown Trait' },
          { key: 'predator_count', label: 'Wolves' },
          { key: 'carrying_capacity', label: 'Carrying Cap' }
        ]
      },
      {
        id: 'bio_mutation_drift',
        name: 'Genetic Drift & Biome Adaptation',
        tagline: 'Allele frequency trajectories in small versus large isolated populations',
        description: 'Simulate how random chance and environmental contrast alter trait dominance independent of selective advantage.',
        controls: [
          { id: 'environment', label: 'Habitat Biome (0: Arctic, 1: Savannah)', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'wolves', label: 'Predator Wolves', min: 0, max: 6, step: 1, defaultValue: 3 },
          { id: 'mutation', label: 'Brown Fur Mutation', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'food', label: 'Food Abundance (%)', min: 20, max: 100, step: 10, defaultValue: 80, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'total_population', label: 'Population N' },
          { key: 'white_fur_pct', label: 'White Allele' },
          { key: 'brown_fur_pct', label: 'Brown Allele' },
          { key: 'predator_count', label: 'Predator Load' }
        ]
      },
      {
        id: 'bio_hardy_weinberg',
        name: 'Hardy-Weinberg Population Equilibrium',
        tagline: 'Mathematical allele frequency stability: p² + 2pq + q² = 1',
        description: 'Examine population genetics under ideal assumptions with zero selection vs predator-induced pressure.',
        controls: [
          { id: 'environment', label: 'Habitat Biome', min: 0, max: 1, step: 1, defaultValue: 0 },
          { id: 'wolves', label: 'Selection Pressure (Wolves)', min: 0, max: 6, step: 1, defaultValue: 0 },
          { id: 'mutation', label: 'Allele Mutation Rate', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'food', label: 'Carrying Capacity Support', min: 20, max: 100, step: 10, defaultValue: 90, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'total_population', label: 'Equilibrium N' },
          { key: 'white_fur_pct', label: 'Allele p Freq' },
          { key: 'brown_fur_pct', label: 'Allele q Freq' }
        ]
      }
    ]
  },

  gene_expression: {
    id: 'gene_expression',
    subject: 'biology',
    title: 'Gene Expression Essentials',
    category: 'BIOLOGY',
    shortDesc: 'DNA transcription, mRNA synthesis, transcription factor regulation, and ribosome translation.',
    conceptIntro:
      'Gene expression is the molecular pathway by which DNA instructions are transcribed into messenger RNA (mRNA) and translated into functional protein polymers.',
    realWorldExample:
      'Insulin production in human pancreatic beta cells triggered by rising blood glucose, or mRNA vaccines directing ribosomal protein synthesis.',
    keyFormulas: [
      { formula: '\\text{DNA} \\xrightarrow{\\text{RNA Pol}} \\text{mRNA} \\xrightarrow{\\text{Ribosome}} \\text{Protein}', explanation: 'Central Dogma of Molecular Biology.' },
      { formula: '\\frac{d[P]}{dt} = k_{tl}[\\text{mRNA}] - k_{deg}[P]', explanation: 'Differential rate equation for cellular protein synthesis and turnover.' },
      { formula: '\\theta = \\frac{[TF]^n}{K_d + [TF]^n}', explanation: 'Hill equation modeling transcription factor binding occupancy at the promoter.' }
    ],
    keyTakeaways: [
      'Transcription factors bind to promoter sequences to recruit or block RNA Polymerase.',
      'Ribosomes read mRNA codons in 5\' to 3\' direction, stringing amino acids into peptide chains.',
      'Protein degradation by proteases prevents toxic accumulation and enables rapid cellular signaling.'
    ],
    editorialTeaching: {
      headline: 'The Central Dogma: From Double Helix to Active Enzyme',
      story: 'Explore the nanoscale molecular machine inside cells as RNA Polymerase unzips DNA, transcribes mRNA, and ribosomes assemble proteins in real-time.',
      controlsGuide: 'Adjust positive transcription factor concentration, RNA polymerase affinity, and ribosome density to maximize protein yield.',
      variablesAndOutputs: 'Tracks promoter binding state, transcription velocity, mRNA abundance, and active protein output.',
      modelAssumptions: 'Prokaryotic/eukaryotic consensus promoter kinetics with first-order protease degradation.',
      learningObjective: 'Grasp how transcriptional regulation controls cellular phenotype and enzyme concentrations.'
    },
    simulations: [
      {
        id: 'bio_gene_transcription',
        name: 'Transcription & Translation Engine',
        tagline: 'PhET-style molecular transcription bubble with ribosome translation',
        description: 'Manipulate transcription factors, observe RNA Polymerase unzipping DNA, and watch ribosomes translate mRNA codons into proteins.',
        controls: [
          { id: 'tf_conc', label: 'Transcription Factor Conc (%)', min: 0, max: 100, step: 5, defaultValue: 65, unit: '%' },
          { id: 'affinity', label: 'Polymerase Affinity (1: Lo, 3: Hi)', min: 1, max: 3, step: 1, defaultValue: 2 },
          { id: 'ribosomes', label: 'Ribosome Density', min: 1, max: 8, step: 1, defaultValue: 4 },
          { id: 'degradation', label: 'Protease Degradation (%)', min: 0, max: 80, step: 10, defaultValue: 30, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'tf_binding_status', label: 'Promoter State' },
          { key: 'transcription_rate', label: 'Tx Velocity' },
          { key: 'mrna_abundance', label: 'mRNA Level' },
          { key: 'functional_protein_conc', label: 'Protein Output' },
          { key: 'ribosome_activity', label: 'Polysomes' }
        ]
      },
      {
        id: 'bio_lac_operon',
        name: 'Lac Operon Gene Machine',
        tagline: 'Inducible gene switch regulated by lactose repressor and CAP activator',
        description: 'Examine bacterial negative feedback loops where lactose binds to the repressor to permit RNA Polymerase transcription.',
        controls: [
          { id: 'tf_conc', label: 'Inducer (Lactose) Conc', min: 0, max: 100, step: 5, defaultValue: 80, unit: '%' },
          { id: 'affinity', label: 'Operator Affinity', min: 1, max: 3, step: 1, defaultValue: 3 },
          { id: 'ribosomes', label: 'Ribosome Count', min: 1, max: 8, step: 1, defaultValue: 5 },
          { id: 'degradation', label: 'Enzyme Degradation', min: 0, max: 80, step: 10, defaultValue: 25, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'tf_binding_status', label: 'Repressor State' },
          { key: 'transcription_rate', label: 'LacZ Transcripts' },
          { key: 'functional_protein_conc', label: 'Beta-Gal Enzyme' }
        ]
      },
      {
        id: 'bio_protein_folding',
        name: 'Ribosome Translation & Protein Folding',
        tagline: 'Polypeptide chain elongation and tertiary globular folding',
        description: 'Watch nascent amino acid chains exit the ribosomal tunnel and spontaneously fold into bioactive conformations.',
        controls: [
          { id: 'tf_conc', label: 'Gene Activation', min: 10, max: 100, step: 10, defaultValue: 75, unit: '%' },
          { id: 'affinity', label: 'Transcription Speed', min: 1, max: 3, step: 1, defaultValue: 2 },
          { id: 'ribosomes', label: 'Active Ribosomes', min: 2, max: 8, step: 1, defaultValue: 6 },
          { id: 'degradation', label: 'Cellular Turnover', min: 0, max: 70, step: 10, defaultValue: 20, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'transcription_rate', label: 'Translation Rate' },
          { key: 'functional_protein_conc', label: 'Folded Proteins' },
          { key: 'ribosome_activity', label: 'Active Sites' }
        ]
      }
    ]
  },

  membrane_transport: {
    id: 'membrane_transport',
    subject: 'biology',
    title: 'Membrane Transport & Channels',
    category: 'BIOLOGY',
    shortDesc: 'Cellular diffusion, gated ion channels, and ATP-driven active transport pumps across the lipid bilayer.',
    conceptIntro:
      'The plasma membrane is a semi-permeable phospholipid bilayer that separates intracellular cytoplasm from extracellular fluid. Molecules cross via simple diffusion, facilitated channels, or energy-consuming active pumps.',
    realWorldExample:
      'Kidney nephrons filtering water via aquaporins, oral rehydration therapy utilizing sodium-glucose cotransporters, or nerve cells charging membranes via Na+/K+ pumps.',
    keyFormulas: [
      { formula: 'J = -D \\frac{dC}{dx}', explanation: 'Fick\'s First Law of diffusion: flux J is proportional to concentration gradient.' },
      { formula: '\\Pi = iCRT', explanation: 'Van \'t Hoff equation for osmotic pressure across a semipermeable membrane.' },
      { formula: '\\Delta G = RT\\ln\\frac{C_{in}}{C_{out}} + zFV_m', explanation: 'Free energy change for transporting charged ions across membrane voltage Vm.' }
    ],
    keyTakeaways: [
      'Small nonpolar molecules diffuse directly through hydrophobic fatty acid tails.',
      'Facilitated diffusion through channel proteins requires no energy and flows down the concentration gradient.',
      'Active transport pumps (Na+/K+ ATPase) consume cellular ATP to move ions against concentration gradients.'
    ],
    editorialTeaching: {
      headline: 'The Lipid Bilayer: Molecular Gateways of Life',
      story: 'Explore how living cells maintain steep concentration gradients across a 5-nanometer fluid membrane using pore channels and ATP-powered molecular engines.',
      controlsGuide: 'Adjust inside/outside solute concentrations, toggle the passive pore channel gate, and modulate cellular ATP power to drive ion pumps.',
      variablesAndOutputs: 'Monitors concentration gradient delta, net diffusion flux, ATP consumption, and pump operating state.',
      modelAssumptions: 'Fluid mosaic bilayer with thermal Brownian diffusion and Michaelis-Menten pump kinetics.',
      learningObjective: 'Contrast passive diffusion, facilitated transport, and active transport mechanisms in cellular homeostasis.'
    },
    simulations: [
      {
        id: 'bio_membrane_diffusion',
        name: 'Lipid Bilayer & Diffusion Dynamics',
        tagline: 'PhET-calibrated cellular membrane with passive pores and active pumps',
        description: 'Observe molecules moving across a phospholipid bilayer with selectable channel gates and ATP active pumps.',
        controls: [
          { id: 'conc_out', label: 'Extracellular Solute (C_out)', min: 10, max: 100, step: 5, defaultValue: 75, unit: 'mM' },
          { id: 'conc_in', label: 'Intracellular Solute (C_in)', min: 5, max: 100, step: 5, defaultValue: 20, unit: 'mM' },
          { id: 'channels_open', label: 'Channel Pore Gate (0: Gated, 1: Open)', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'atp', label: 'Cellular ATP Energy Supply (%)', min: 0, max: 100, step: 10, defaultValue: 80, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'extracellular_conc', label: 'Outside Conc' },
          { key: 'intracellular_conc', label: 'Inside Conc' },
          { key: 'gradient_delta', label: 'Gradient ΔC' },
          { key: 'diffusion_flux', label: 'Net Flux J' },
          { key: 'pump_state', label: 'Pump Status' }
        ]
      },
      {
        id: 'bio_facilitated_channel',
        name: 'Facilitated Ion Channels & Aquaporins',
        tagline: 'Selective protein pores and carrier-mediated transport kinetics',
        description: 'Investigate how gated transmembrane proteins accelerate solute passage without metabolic ATP expenditure.',
        controls: [
          { id: 'conc_out', label: 'Outside Solute', min: 10, max: 100, step: 5, defaultValue: 85, unit: 'mM' },
          { id: 'conc_in', label: 'Inside Solute', min: 5, max: 80, step: 5, defaultValue: 15, unit: 'mM' },
          { id: 'channels_open', label: 'Channel Gate (0: Closed, 1: Open)', min: 0, max: 1, step: 1, defaultValue: 1 },
          { id: 'atp', label: 'ATP Reserve (Inactive for channels)', min: 0, max: 100, step: 10, defaultValue: 0, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'gradient_delta', label: 'Driving Force ΔC' },
          { key: 'diffusion_flux', label: 'Channel Flux' },
          { key: 'pump_state', label: 'Transport Mode' }
        ]
      },
      {
        id: 'bio_atp_pump',
        name: 'Active Sodium-Potassium ATP Pump',
        tagline: '3 Na⁺ out, 2 K⁺ in: electrogenic pump fueling cellular life',
        description: 'Examine how ATP hydrolysis forces ions against steep thermodynamic gradients to establish membrane voltage.',
        controls: [
          { id: 'conc_out', label: 'Extracellular Na⁺', min: 20, max: 100, step: 5, defaultValue: 90, unit: 'mM' },
          { id: 'conc_in', label: 'Intracellular Na⁺', min: 5, max: 60, step: 5, defaultValue: 10, unit: 'mM' },
          { id: 'channels_open', label: 'Leak Channels (0: Off, 1: On)', min: 0, max: 1, step: 1, defaultValue: 0 },
          { id: 'atp', label: 'ATP Power Level (%)', min: 10, max: 100, step: 10, defaultValue: 90, unit: '%' }
        ],
        telemetryLabels: [
          { key: 'gradient_delta', label: 'Maintained ΔC' },
          { key: 'diffusion_flux', label: 'Active Transport Rate' },
          { key: 'pump_state', label: 'ATPase Hydrolysis' }
        ]
      }
    ]
  },

  neuron: {
    id: 'neuron',
    subject: 'biology',
    title: 'Neuron & Action Potential',
    category: 'BIOLOGY',
    shortDesc: 'Axon electrophysiology, voltage-gated Na+/K+ channels, and Hodgkin-Huxley action potential nerve impulses.',
    conceptIntro:
      'Neurons transmit electrical signals along their axons using voltage-gated ion channels. When a stimulus raises membrane potential past the -55 mV threshold, rapid sodium influx sparks an action potential spike.',
    realWorldExample:
      'Reflex actions when touching a hot stove, cardiac muscle electrical pacing, or local anesthetics like lidocaine blocking sodium channels to stop pain.',
    keyFormulas: [
      { formula: 'E_{ion} = \\frac{RT}{zF}\\ln\\frac{[\\text{Ion}]_{out}}{[\\text{Ion}]_{in}}', explanation: 'Nernst equilibrium potential for a specific ion species across the membrane.' },
      { formula: 'C_m\\frac{dV}{dt} = I_{stim} - I_{Na} - I_K - I_L', explanation: 'Hodgkin-Huxley total ionic membrane current equation.' },
      { formula: 'V_{rest} \\approx -70\\text{ mV}, \\quad V_{peak} \\approx +30\\text{ mV}', explanation: 'Resting polarized state versus depolarized action potential peak.' }
    ],
    keyTakeaways: [
      'Resting potential is maintained at approximately -70 mV by Na+/K+ pumps and potassium leak channels.',
      'Depolarization: Voltage-gated Na+ channels snap open, driving membrane potential up to +30 mV.',
      'Repolarization: Delayed-rectifier K+ channels open, allowing K+ efflux to restore negative polarization.'
    ],
    editorialTeaching: {
      headline: 'The Spark of Thought: Action Potentials in Real Time',
      story: 'Trigger electrical stimuli on an axon cylinder, watch voltage-gated sodium and potassium channels gate ions, and trace the iconic action potential curve on a live oscilloscope.',
      controlsGuide: 'Adjust electrical stimulus current above the 25 µA threshold to fire action potentials, and manipulate sodium/potassium channel conductances.',
      variablesAndOutputs: 'Monitors instantaneous membrane voltage Vm (mV), channel gating activation states, and firing frequency (Hz).',
      modelAssumptions: 'Calibrated Hodgkin-Huxley model at mammalian physiological temperature.',
      learningObjective: 'Master the all-or-none principle of nerve transmission and the ion channel kinetics underlying neurobiology.'
    },
    simulations: [
      {
        id: 'bio_action_potential',
        name: 'Action Potential Oscilloscope',
        tagline: 'PhET-calibrated axon membrane with live voltage oscilloscope trace',
        description: 'Deliver threshold stimulus pulses and visualize the rapid depolarization, repolarization, and refractory period of nerve impulses.',
        controls: [
          { id: 'stimulus', label: 'Stimulus Current (Threshold: 25 µA)', min: 0, max: 80, step: 5, defaultValue: 40, unit: 'µA' },
          { id: 'na_conductance', label: 'Na⁺ Channel Conductance (g_Na)', min: 40, max: 160, step: 10, defaultValue: 120, unit: 'mS/cm²' },
          { id: 'k_conductance', label: 'K⁺ Channel Conductance (g_K)', min: 10, max: 70, step: 5, defaultValue: 36, unit: 'mS/cm²' }
        ],
        telemetryLabels: [
          { key: 'membrane_potential', label: 'Membrane V_m' },
          { key: 'na_state', label: 'Na⁺ Activation' },
          { key: 'k_state', label: 'K⁺ Activation' },
          { key: 'firing_frequency', label: 'Firing Rate' },
          { key: 'conduction_status', label: 'State' }
        ]
      },
      {
        id: 'bio_ion_gating',
        name: 'Voltage-Gated Channel Kinetics',
        tagline: 'Microscopic opening and inactivation gates of Na⁺ and K⁺ channels',
        description: 'Observe individual channel pore conformations during threshold depolarization and refractory states.',
        controls: [
          { id: 'stimulus', label: 'Membrane Depolarization Stimulus', min: 10, max: 80, step: 5, defaultValue: 50, unit: 'µA' },
          { id: 'na_conductance', label: 'Peak Na⁺ Permeability', min: 40, max: 160, step: 10, defaultValue: 130, unit: 'mS/cm²' },
          { id: 'k_conductance', label: 'Delayed Rectifier K⁺ Density', min: 10, max: 70, step: 5, defaultValue: 40, unit: 'mS/cm²' }
        ],
        telemetryLabels: [
          { key: 'membrane_potential', label: 'Axon Voltage' },
          { key: 'na_state', label: 'Sodium Gate' },
          { key: 'k_state', label: 'Potassium Gate' }
        ]
      },
      {
        id: 'bio_synapse_transmission',
        name: 'Myelinated Axon Conduction',
        tagline: 'Saltatory conduction across Nodes of Ranvier and synaptic terminal release',
        description: 'Examine high-speed electrical propagation along myelin-insulated nerve fibers.',
        controls: [
          { id: 'stimulus', label: 'Action Potential Trigger', min: 20, max: 80, step: 5, defaultValue: 45, unit: 'µA' },
          { id: 'na_conductance', label: 'Nodal Na⁺ Channel Cluster', min: 60, max: 160, step: 10, defaultValue: 140, unit: 'mS/cm²' },
          { id: 'k_conductance', label: 'Paranodal K⁺ Channels', min: 15, max: 60, step: 5, defaultValue: 35, unit: 'mS/cm²' }
        ],
        telemetryLabels: [
          { key: 'membrane_potential', label: 'Nodal Potential' },
          { key: 'firing_frequency', label: 'Impulse Speed' },
          { key: 'conduction_status', label: 'Saltatory State' }
        ]
      }
    ]
  }
};

/**
 * Set of simulation IDs that genuinely animate with time (t).
 * Static graphers, formula calculators, and direct geometric/parameter tools do not use time t
 * and must NOT display a Play/Pause button.
 */
export const ANIMATED_SIMULATION_IDS = new Set<string>([
  'motion_two_motions',
  'trig_wave_unroll',
  'coord_circle',
  'func_machine',
  'calc_kinematics_deriv',
  'motion_car_track',
  'motion_free_fall',
  'motion_relative',
  'newton_inertia_friction',
  'newton_f_ma',
  'newton_action_reaction',
  'energy_rollercoaster',
  'energy_spring_mass',
  'grav_orbit_satellite',
  'wave_transverse_string',
  'wave_sound_particles',
  'wave_superposition',
  'thermo_ideal_gas_chamber',
  'thermo_carnot_cycle',
  'thermo_heat_conduction',
  'em_lorentz_cyclotron',
  'em_faraday_induction',
  'vec_river_boat',
  'optics_ydse',
  'bio_natural_selection',
  'bio_mutation_drift',
  'bio_hardy_weinberg',
  'bio_gene_transcription',
  'bio_lac_operon',
  'bio_protein_folding',
  'bio_membrane_diffusion',
  'bio_facilitated_channel',
  'bio_atp_pump',
  'bio_action_potential',
  'bio_ion_gating',
  'bio_synapse_transmission'
]);

export const isSimulationAnimated = (simId?: string): boolean => {
  if (!simId) return false;
  return ANIMATED_SIMULATION_IDS.has(simId);
};
