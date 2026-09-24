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

export interface TopicData {
  id: string;
  subject: 'maths' | 'physics';
  title: string;
  category: string;
  shortDesc: string;
  conceptIntro: string;
  realWorldExample: string;
  keyFormulas: { formula: string; explanation: string }[];
  keyTakeaways: string[];
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
          { id: 'jaw_dist', label: 'Object Thickness (mm)', min: 5, max: 50, step: 0.1, defaultValue: 23.4, unit: 'mm' }
        ],
        telemetryLabels: [
          { key: 'main_reading', label: 'Main Scale Reading' },
          { key: 'vernier_reading', label: 'Vernier Coincidence' },
          { key: 'total_reading', label: 'Total Measured Size' }
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
    simulations: [
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
  }
};
