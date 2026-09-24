export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_DATA: Record<string, QuizQuestion[]> = {
  motion: [
    {
      id: 'q-mot-1',
      question: 'A train accelerates uniformly from rest at 3 m/s² for 4 seconds. What is its final velocity?',
      options: ['7 m/s', '12 m/s', '24 m/s', '48 m/s'],
      correctIndex: 1,
      explanation: 'Using the first equation of motion: v = u + at. With u = 0, a = 3 m/s², and t = 4 s, we get v = 0 + (3 × 4) = 12 m/s.'
    },
    {
      id: 'q-mot-2',
      question: 'Two passenger trains run on parallel tracks in the same direction at 60 km/h each. What is the velocity of Train B relative to an observer seated in Train A?',
      options: ['120 km/h', '60 km/h', '0 km/h', '30 km/h'],
      correctIndex: 2,
      explanation: 'Relative velocity is v_BA = v_B - v_A. Since both travel in the same direction at 60 km/h, v_BA = 60 - 60 = 0 km/h. To a rider in Train A, Train B appears completely stationary outside the window.'
    },
    {
      id: 'q-mot-3',
      question: 'What does the area under a Velocity-Time graph physically represent?',
      options: ['Instantaneous Acceleration', 'Total Displacement', 'Average Speed', 'Total Force'],
      correctIndex: 1,
      explanation: 'In calculus, displacement s = ∫ v dt. On a v-t plot, integrating velocity over time corresponds directly to the geometric area under the velocity curve.'
    }
  ],
  newtons_laws: [
    {
      id: 'q-nl-1',
      question: 'A 4 kg block is accelerated at 3 m/s² across a frictionless floor. What is the net horizontal force applied?',
      options: ['1.33 N', '7 N', '12 N', '36 N'],
      correctIndex: 2,
      explanation: "By Newton's Second Law, F_net = m × a = 4 kg × 3 m/s² = 12 N."
    },
    {
      id: 'q-nl-2',
      question: "According to Newton's Third Law, if Earth pulls down on an apple with gravitational force F, what does the apple do?",
      options: [
        'Exerts no force on Earth because of negligible mass',
        'Pulls up on Earth with the exact same magnitude force F',
        'Exerts a force proportional to Earth’s radius',
        'Pulls down on Earth'
      ],
      correctIndex: 1,
      explanation: "Action-reaction pairs are always equal in magnitude, opposite in direction, and act on different objects. Earth pulls apple down with F, so the apple pulls Earth up with the exact same force F."
    },
    {
      id: 'q-nl-3',
      question: 'When a car suddenly stops, why do passengers lurch forward?',
      options: ['Inertia of motion keeps the body moving forward', 'Centripetal force pulls them forward', 'Friction pushes the body', 'Gravity increases'],
      correctIndex: 0,
      explanation: "Newton's First Law (Law of Inertia) states that a body in motion tends to remain in motion at constant velocity unless acted upon by an external net force (the seatbelt)."
    }
  ],
  gravitation: [
    {
      id: 'q-grav-1',
      question: 'If the distance between two orbiting satellites is doubled, by what factor does the gravitational force between them change?',
      options: ['Halved (1/2)', 'Quartered (1/4)', 'Doubled (2x)', 'Remains identical'],
      correctIndex: 1,
      explanation: "Newton's Law of Universal Gravitation is an inverse-square law: F ∝ 1/r². When distance doubles (r → 2r), force becomes 1/(2)² = 1/4 of its original value."
    },
    {
      id: 'q-grav-2',
      question: "What is Kepler's Second Law of Planetary Motion (Law of Equal Areas) a direct consequence of?",
      options: ['Conservation of Energy', 'Conservation of Angular Momentum', 'Relativistic curvature', 'Centrifugal acceleration'],
      correctIndex: 1,
      explanation: 'Since gravity acts as a central force pointing directly towards the Sun, the net external torque is zero (τ = r × F = 0). Therefore, orbital angular momentum L = m(r × v) is conserved, causing planets to sweep equal areas in equal times.'
    },
    {
      id: 'q-grav-3',
      question: 'What happens to the acceleration due to gravity g as you travel downwards from Earth’s surface towards its center?',
      options: ['Increases exponentially', 'Decreases linearly to zero at the core', 'Stays constant at 9.8 m/s²', 'Becomes infinite'],
      correctIndex: 1,
      explanation: 'By the Shell Theorem, only the sphere of mass inside radius r contributes to gravity. Thus g(r) = (G·M_earth / R³) · r, which decreases linearly to exactly zero at Earth’s center.'
    }
  ],
  work_energy_power: [
    {
      id: 'q-wep-1',
      question: 'A 2 kg cart doubles its speed from 3 m/s to 6 m/s. By what factor does its kinetic energy increase?',
      options: ['Doubles (2x)', 'Triples (3x)', 'Quadruples (4x)', 'Eight times (8x)'],
      correctIndex: 2,
      explanation: 'Kinetic energy K = ½mv². Because velocity is squared, doubling speed (2v) increases kinetic energy by (2)² = 4 times (from 9 J to 36 J).'
    },
    {
      id: 'q-wep-2',
      question: 'A student holds a heavy 20 kg backpack stationary at shoulder height for 10 minutes. How much mechanical work is done on the backpack?',
      options: ['196 Joules', '2000 Joules', '0 Joules', '1960 Joules'],
      correctIndex: 2,
      explanation: 'Mechanical work W = F · d · cos θ. Because the backpack is held stationary, displacement d = 0, so the net physical work performed on the backpack is strictly 0 Joules.'
    }
  ],
  waves: [
    {
      id: 'q-wav-1',
      question: 'A sound wave travels at 340 m/s with a frequency of 170 Hz. What is its wavelength?',
      options: ['0.5 m', '2.0 m', '57800 m', '170 m'],
      correctIndex: 1,
      explanation: 'Using the universal wave equation v = f · λ, we rearrange for wavelength: λ = v / f = 340 m/s / 170 Hz = 2.0 meters.'
    },
    {
      id: 'q-wav-2',
      question: 'Two identical waves meet at the same point exactly 180° (π radians) out of phase. What phenomenon occurs?',
      options: ['Constructive Interference (amplitude doubles)', 'Destructive Interference (amplitude cancels to zero)', 'Frequency doubles', 'Speed drops to zero'],
      correctIndex: 1,
      explanation: 'When crests align with troughs of equal amplitude (phase shift Δφ = π), the superposition y_net = y₁ + y₂ = A + (-A) = 0, producing complete destructive interference.'
    }
  ],
  algebra: [
    {
      id: 'q-alg-1',
      question: 'For the quadratic equation x² - 6x + 9 = 0, what is the value of the discriminant D = b² - 4ac, and what does it indicate?',
      options: [
        'D = 0; indicates exactly one real root (a tangent parabola)',
        'D = 72; indicates two distinct real roots',
        'D = -36; indicates two complex roots',
        'D = 18; indicates no roots'
      ],
      correctIndex: 0,
      explanation: 'D = (-6)² - 4(1)(9) = 36 - 36 = 0. When D = 0, the parabola touches the x-axis at exactly one point (x = 3), called a repeated or double root.'
    },
    {
      id: 'q-alg-2',
      question: 'What is the slope of the line passing through points (2, 3) and (6, 11)?',
      options: ['1', '2', '4', '8'],
      correctIndex: 1,
      explanation: 'Slope m = (y₂ - y₁) / (x₂ - x₁) = (11 - 3) / (6 - 2) = 8 / 4 = 2.'
    }
  ],
  trigonometry: [
    {
      id: 'q-trig-1',
      question: 'On a unit circle of radius 1, what do the x and y coordinates of a point at angle θ represent?',
      options: ['x = tan θ, y = cot θ', 'x = cos θ, y = sin θ', 'x = sin θ, y = cos θ', 'x = sec θ, y = csc θ'],
      correctIndex: 1,
      explanation: 'By definition on the Cartesian unit circle, cos θ is the horizontal projection (x-coordinate) and sin θ is the vertical projection (y-coordinate).'
    },
    {
      id: 'q-trig-2',
      question: 'What is the value of sin²(37°) + cos²(37°)?',
      options: ['0.74', '1.0', '1.37', '0.0'],
      correctIndex: 1,
      explanation: 'By the fundamental Pythagorean trigonometric identity, sin²θ + cos²θ = 1 holds true for any real angle θ without exception.'
    }
  ],
  basic_calculus: [
    {
      id: 'q-calc-1',
      question: 'What is the derivative of f(x) = x³ with respect to x?',
      options: ['3x²', 'x²', '3x', 'x⁴ / 4'],
      correctIndex: 0,
      explanation: 'Using the Power Rule of differential calculus d/dx[x^n] = n·x^(n-1): with n = 3, d/dx[x³] = 3x^(3-1) = 3x².'
    },
    {
      id: 'q-calc-2',
      question: 'Geometrically, what does the definite integral ∫ from a to b of f(x) dx represent?',
      options: ['The slope of the tangent line at x = a', 'The net signed area between the curve f(x) and the x-axis', 'The maximum curvature', 'The average intercept'],
      correctIndex: 1,
      explanation: 'Integration is the infinite summation of infinitesimal rectangles f(x)·dx, which represents the exact signed geometric area between the curve and the x-axis.'
    }
  ],
  coordinate_geometry: [
    {
      id: 'q-cg-1',
      question: 'What is the center and radius of the circle defined by (x - 3)² + (y + 4)² = 25?',
      options: ['Center: (-3, 4), Radius: 25', 'Center: (3, -4), Radius: 5', 'Center: (3, 4), Radius: 5', 'Center: (-3, -4), Radius: 5'],
      correctIndex: 1,
      explanation: 'The standard circle equation is (x - h)² + (y - k)² = r². Here h = 3, k = -4, and r = √25 = 5.'
    }
  ],
  units_and_dimensions: [
    {
      id: 'q-ud-1',
      question: 'What are the fundamental dimensional formulas for Force in terms of Mass (M), Length (L), and Time (T)?',
      options: ['[M L T⁻¹]', '[M L T⁻²]', '[M L² T⁻²]', '[M⁻¹ L T⁻²]'],
      correctIndex: 1,
      explanation: 'Force F = mass × acceleration. Acceleration has dimensions [L T⁻²], so Force has dimensions [M] · [L T⁻²] = [M L T⁻²].'
    }
  ],
  functions_and_graphs: [
    {
      id: 'q-fg-1',
      question: 'If f(x) = x², how does the graph of g(x) = (x - 4)² compare to f(x)?',
      options: ['Shifted 4 units to the left', 'Shifted 4 units to the right', 'Shifted 4 units upwards', 'Stretched vertically by 4'],
      correctIndex: 1,
      explanation: 'Replacing x with (x - h) shifts the graph horizontally to the right by h units. For (x - 4)², the vertex moves from (0,0) to (4,0).'
    }
  ],
  sequences_and_series: [
    {
      id: 'q-seq-1',
      question: 'What is the 10th term of an Arithmetic Progression with first term a = 3 and common difference d = 4?',
      options: ['39', '43', '36', '40'],
      correctIndex: 0,
      explanation: 'The n-th term of an AP is given by a_n = a + (n - 1)d. For n = 10: a₁₀ = 3 + (10 - 1) × 4 = 3 + 36 = 39.'
    }
  ]
};
