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
  units_dimensions: [
    {
      id: 'q-ud-1',
      question: 'What are the fundamental dimensional formulas for Force in terms of Mass (M), Length (L), and Time (T)?',
      options: ['[M L T⁻¹]', '[M L T⁻²]', '[M L² T⁻²]', '[M⁻¹ L T⁻²]'],
      correctIndex: 1,
      explanation: 'Force F = mass × acceleration. Acceleration has dimensions [L T⁻²], so Force has dimensions [M] · [L T⁻²] = [M L T⁻²].'
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
  functions: [
    {
      id: 'q-fg-1',
      question: 'If f(x) = x², how does the graph of g(x) = (x - 4)² compare to f(x)?',
      options: ['Shifted 4 units to the left', 'Shifted 4 units to the right', 'Shifted 4 units upwards', 'Stretched vertically by 4'],
      correctIndex: 1,
      explanation: 'Replacing x with (x - h) shifts the graph horizontally to the right by h units. For (x - 4)², the vertex moves from (0,0) to (4,0).'
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
  sequences: [
    {
      id: 'q-seq-1',
      question: 'What is the 10th term of an Arithmetic Progression with first term a = 3 and common difference d = 4?',
      options: ['39', '43', '36', '40'],
      correctIndex: 0,
      explanation: 'The n-th term of an AP is given by a_n = a + (n - 1)d. For n = 10: a₁₀ = 3 + (10 - 1) × 4 = 3 + 36 = 39.'
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
  ],
  optics: [
    {
      id: 'q-opt-1',
      question: 'A ray of light traveling in glass (n = 1.5) approaches an air boundary (n = 1.0). If the angle of incidence exceeds the critical angle θ_c ≈ 41.8°, what happens to the light?',
      options: [
        'Light refracts into air at 90°',
        'Light undergoes 100% Total Internal Reflection back into the glass',
        'Light is completely absorbed by the boundary',
        'Light splits into equal reflected and transmitted halves'
      ],
      correctIndex: 1,
      explanation: 'When light travels from an optically denser medium to a rarer medium and exceeds the critical angle, all light reflects internally with zero transmission. This phenomenon makes fiber-optic internet possible.'
    },
    {
      id: 'q-opt-2',
      question: 'An illuminated object is positioned at a distance of 2f in front of a thin convex lens of focal length f. Where does its image form and what is its magnification?',
      options: [
        'At f, upright, magnification m = +0.5',
        'At 2f on the opposite side, real and inverted, magnification m = -1.0',
        'At infinity, virtual',
        'Between f and 2f, inverted and reduced'
      ],
      correctIndex: 1,
      explanation: 'From the lens equation 1/f = 1/v - 1/(-2f), we find v = 2f. The magnification is m = -v/u = -2f/(2f) = -1.0, yielding a real, inverted image of exactly equal size on the opposite side.'
    },
    {
      id: 'q-opt-3',
      question: 'Why does white light disperse into a vibrant spectrum of colors when passing through a triangular glass prism?',
      options: [
        'The prism creates new colors through thermal radiation',
        'Different wavelengths travel at different speeds in glass, so each has a different refractive index',
        'The glass absorbs all colors except primary colors',
        'Diffraction occurs only at the edges'
      ],
      correctIndex: 1,
      explanation: 'Due to chromatic dispersion, glass has a slightly higher refractive index for shorter wavelengths (violet/blue) than longer wavelengths (red). Blue light therefore refracts more sharply than red light, fanning the beam out into a rainbow spectrum.'
    }
  ],
  thermodynamics: [
    {
      id: 'q-th-1',
      question: 'If the absolute temperature of an ideal gas in a rigid container of constant volume is doubled, what happens to the gas pressure?',
      options: ['Pressure is halved', 'Pressure doubles', 'Pressure quadruples', 'Pressure stays constant'],
      correctIndex: 1,
      explanation: "By Gay-Lussac's Law (P/T = constant at constant V and n), pressure is directly proportional to absolute temperature in Kelvin. Doubling T doubles P."
    },
    {
      id: 'q-th-2',
      question: 'A Carnot heat engine operates between a hot thermal reservoir at 600 K and a cold reservoir at 300 K. What is its maximum theoretical thermal efficiency?',
      options: ['100%', '75%', '50%', '25%'],
      correctIndex: 2,
      explanation: 'Carnot efficiency is η = 1 - T_C / T_H = 1 - 300/600 = 1 - 0.5 = 0.50 (50%). The Second Law of Thermodynamics dictates that no heat engine can exceed this theoretical ceiling.'
    },
    {
      id: 'q-th-3',
      question: 'During an adiabatic expansion of an ideal gas (Q = 0), the gas does 500 J of work against a piston. What is the change in the internal energy ΔU of the gas?',
      options: ['+500 J (Gas heats up)', '-500 J (Gas cools down)', '0 J (Internal energy is conserved)', '+1000 J'],
      correctIndex: 1,
      explanation: 'By the First Law of Thermodynamics, ΔU = Q - W. Since the expansion is adiabatic (Q = 0), ΔU = 0 - (+500 J) = -500 J. The work done on the surroundings comes directly at the expense of internal kinetic energy, causing the gas to cool.'
    }
  ],
  electromagnetism: [
    {
      id: 'q-em-1',
      question: 'A proton enters a uniform magnetic field with velocity vector perpendicular to the field lines. What shape does its resulting trajectory follow?',
      options: ['Straight line with increasing speed', 'Uniform circular path', 'Parabolic trajectory', 'Exponential spiral'],
      correctIndex: 1,
      explanation: 'Since the magnetic force F = q(v × B) is always perpendicular to the instantaneous velocity v, it does zero work on the charge and cannot change its kinetic energy or speed. It acts purely as a centripetal force, resulting in uniform circular motion with radius r = mv / (qB).'
    },
    {
      id: 'q-em-2',
      question: 'What is the net electric flux passing through a closed Gaussian surface that encloses an electric dipole consisting of charges +q and -q?',
      options: ['q / ε₀', '2q / ε₀', 'Zero', '-q / ε₀'],
      correctIndex: 2,
      explanation: 'By Gauss’s Law, net electric flux Φ_E = Q_enclosed / ε₀. For a dipole, the enclosed net charge is (+q) + (-q) = 0. Therefore, the net electric flux entering and leaving the closed surface is exactly zero.'
    },
    {
      id: 'q-em-3',
      question: 'According to Faraday’s Law and Lenz’s Law, why is there a negative sign in the induced EMF equation ε = -dΦ/dt?',
      options: [
        'Because energy is lost to thermal radiation',
        'Because the induced current produces a magnetic field that opposes the change in magnetic flux',
        'Because magnetic charge is always negative',
        'It is a mathematical convention with no physical meaning'
      ],
      correctIndex: 1,
      explanation: 'Lenz’s Law is a direct statement of Conservation of Energy: the induced current always flows in such a direction that its own magnetic field opposes the original flux change that produced it, preventing runaway spontaneous energy creation.'
    }
  ],
  vectors_3d: [
    {
      id: 'q-vec-1',
      question: 'Two non-zero vectors A and B satisfy A · B = 0. What is the angle between them?',
      options: ['0° (Parallel)', '45°', '90° (Perpendicular)', '180° (Antiparallel)'],
      correctIndex: 2,
      explanation: 'The scalar dot product is given by A · B = |A||B| cos θ. For non-zero magnitudes, A · B = 0 requires cos θ = 0, which corresponds strictly to θ = 90° (orthogonal vectors).'
    },
    {
      id: 'q-vec-2',
      question: 'If a boat has speed 5 m/s in still water and the river flows downstream at 3 m/s, at what angle to the downstream current should the boat steer to reach the point directly opposite on the other bank (shortest path)?',
      options: ['90°', '120°', '126.9° (or 143.1°)', '150°'],
      correctIndex: 2,
      explanation: 'For zero net downstream drift, the horizontal component of the boat’s velocity must cancel the river flow: v_b · cos α = v_r where α is the upstream angle with the bank. cos α = 3/5 = 0.6 => α = 53.1° upstream, which corresponds to an angle of 180° - 53.1° = 126.9° with the downstream direction.'
    },
    {
      id: 'q-vec-3',
      question: 'What is the geometric meaning of the magnitude of the cross product |A × B|?',
      options: [
        'The length of vector A projected onto vector B',
        'The area of the parallelogram formed by vectors A and B',
        'The volume of the tetrahedron formed by A and B',
        'The sum of the lengths of A and B'
      ],
      correctIndex: 1,
      explanation: 'By definition, |A × B| = |A||B| sin θ. In geometry, base = |A| and height = |B| sin θ, so |A × B| equals the exact geometric area of the parallelogram bounded by vectors A and B.'
    }
  ],
  wave_optics: [
    {
      id: 'q-wo-1',
      question: 'In Young’s Double Slit Experiment (YDSE), if the separation between the two slits d is halved while screen distance D and wavelength λ remain constant, what happens to the fringe width β?',
      options: ['Fringe width is halved', 'Fringe width doubles', 'Fringe width quadruples', 'Fringe width remains unchanged'],
      correctIndex: 1,
      explanation: 'The fringe width formula is β = λD / d. Since fringe width β is inversely proportional to slit separation d, halving d causes the fringe width to double (2× wider).'
    },
    {
      id: 'q-wo-2',
      question: 'In Fraunhofer single-slit diffraction, why is the central maximum twice as wide as the secondary maxima?',
      options: [
        'Because the first minima occur at sin θ = ±λ/a on either side of the center (total width 2λ/a), whereas subsequent minima are spaced by λ/a',
        'Because two light rays interfere at the center',
        'Because wavelength doubles upon entering the slit',
        'Because of total internal reflection inside the slit'
      ],
      correctIndex: 0,
      explanation: 'Minima in single-slit diffraction occur at a sin θ = nλ (for n = ±1, ±2, ...). The central maximum spans from the first negative minimum (-λ/a) to the first positive minimum (+λ/a), giving an angular span of 2λ/a, which is exactly double the distance between consecutive higher-order minima (λ/a).'
    },
    {
      id: 'q-wo-3',
      question: 'Why do soap bubbles and thin oil slicks display bright iridescent rainbow colors under white sunlight?',
      options: [
        'Light gets absorbed by soap molecules and re-emitted as fluorescence',
        'Thin-film interference causes constructive interference for specific wavelengths depending on thickness and angle of view',
        'Light undergoes total internal reflection repeatedly until it polarizes',
        'Prismatic refraction occurs through soap droplets'
      ],
      correctIndex: 1,
      explanation: 'When sunlight reflects off both the front and back surfaces of a thin dielectric film, optical path differences 2μt cos r produce constructive interference for specific visible wavelengths depending on local film thickness t. Different thicknesses reflect different spectral colors, creating shimmering rainbow bands.'
    }
  ],
  natural_selection: [
    {
      id: 'q-ns-1',
      question: 'Under selective predation pressure, why does the allele frequency for camouflage coloration increase across generations in a prey population?',
      options: [
        'Organisms actively mutate their genes during their lifetime to adapt to predators',
        'Camouflaged individuals experience higher differential survival and reproductive fitness, transmitting advantageous alleles to their offspring',
        'Predators intentionally avoid eating darker organisms',
        'Genetic drift always favors darker pigmentation'
      ],
      correctIndex: 1,
      explanation: 'Natural selection acts on phenotypic variation. Individuals possessing advantageous heritable camouflage traits survive predation at higher rates, produce more fertile offspring, and progressively elevate the frequency of adaptive alleles in the gene pool over successive generations.'
    },
    {
      id: 'q-ns-2',
      question: 'Which of the following conditions is strictly required for an ideal biological population to remain in Hardy-Weinberg Equilibrium (p² + 2pq + q² = 1)?',
      options: [
        'Small population size, high mutation rate, non-random sexual selection',
        'Very large (infinite) population size, random mating, no migration (gene flow), no net mutation, and no natural selection',
        'Rapid directional selection favoring homozygous dominant phenotypes',
        'Continuous genetic bottleneck events'
      ],
      correctIndex: 1,
      explanation: 'The Hardy-Weinberg model represents an evolutionary null hypothesis. Allele frequencies remain constant generation-to-generation only when disruptive evolutionary forces (genetic drift, mutation, gene flow, sexual selection, and natural selection) are absent.'
    },
    {
      id: 'q-ns-3',
      question: 'In a Hardy-Weinberg population where a recessive allele frequency is q = 0.20, what percentage of the population will be heterozygous carriers (2pq)?',
      options: ['4%', '16%', '32%', '64%'],
      correctIndex: 2,
      explanation: 'Since p + q = 1, p = 1 - 0.20 = 0.80. The frequency of heterozygotes is given by 2pq = 2 × 0.80 × 0.20 = 0.32, which equals 32% of the population.'
    }
  ],
  gene_expression: [
    {
      id: 'q-ge-1',
      question: 'During cellular transcription, which enzyme reads the DNA template strand in the 3′ → 5′ direction and synthesizes complementary pre-mRNA in the 5′ → 3′ direction?',
      options: ['DNA Polymerase III', 'RNA Polymerase', 'DNA Helicase', 'Reverse Transcriptase'],
      correctIndex: 1,
      explanation: 'RNA Polymerase binds to gene promoter sequences, unzips the DNA double helix, and polymerizes complementary ribonucleotides into messenger RNA (mRNA).'
    },
    {
      id: 'q-ge-2',
      question: 'What is the precise biochemical function of transfer RNA (tRNA) molecules during ribosomal translation?',
      options: [
        'To splice introns out of precursor mRNA molecules',
        'To transport specific amino acids to the ribosome and align them by base-pairing their anticodon with the corresponding mRNA codon',
        'To catalyze the duplication of mitochondrial chromosomes',
        'To add a 5′ 7-methylguanosine cap to transcripts'
      ],
      correctIndex: 1,
      explanation: 'Each tRNA possesses a specific 3-base anticodon at its loop and an attached amino acid at its 3′ CCA terminal. Inside the ribosomal A and P sites, the anticodon recognizes the triplet mRNA codon via complementary Watson-Crick base pairing, ensuring correct polypeptide elongation.'
    },
    {
      id: 'q-ge-3',
      question: 'Given an open reading frame sequence 5′-AUG-GGC-UUA-UAA-3′, how many amino acids will the translated peptide chain contain?',
      options: ['1 amino acid', '2 amino acids', '3 amino acids', '4 amino acids'],
      correctIndex: 2,
      explanation: 'AUG codes for Methionine (start), GGC codes for Glycine, UUA codes for Leucine, and UAA is an ochre stop codon that recruits release factors to terminate translation without adding an amino acid. Thus, the resulting peptide has exactly 3 amino acids.'
    }
  ],
  membrane_transport: [
    {
      id: 'q-mt-1',
      question: 'How does primary active transport differ fundamentally from facilitated diffusion across a biological plasma membrane?',
      options: [
        'Facilitated diffusion requires ATP hydrolysis, whereas primary active transport is passive',
        'Primary active transport hydrolyzes ATP to pump solutes against their electrochemical gradient, whereas facilitated diffusion passively translocates solutes down their gradient without cellular energy',
        'Facilitated diffusion only occurs for nonpolar gases like O₂ and CO₂',
        'Primary active transport does not involve transmembrane protein channels'
      ],
      correctIndex: 1,
      explanation: 'Facilitated diffusion utilizes channel or carrier proteins to allow solutes to move down their thermodynamic chemical potential gradient (ΔG < 0). Primary active transport couples ATP hydrolysis to conformational changes that pump solutes uphill against their electrochemical gradient.'
    },
    {
      id: 'q-mt-2',
      question: 'According to Fick’s First Law of Diffusion, what happens to the steady-state diffusion rate if membrane surface area A is doubled and membrane thickness Δx is doubled simultaneously?',
      options: ['Diffusion rate quadruples (4×)', 'Diffusion rate remains unchanged (1×)', 'Diffusion rate is halved (0.5×)', 'Diffusion rate becomes zero'],
      correctIndex: 1,
      explanation: 'Fick’s First Law states J = -D · A · (ΔC / Δx). Doubling surface area A increases flux by 2×, while doubling membrane thickness Δx decreases flux by 2×. The two effects cancel out: (2 × A) / (2 × Δx) = 1, leaving the diffusion rate unchanged.'
    },
    {
      id: 'q-mt-3',
      question: 'What is the stoichiometric ion exchange ratio of the electrogenic Na⁺/K⁺-ATPase pump in animal cell membranes?',
      options: [
        '2 Na⁺ pumped out for 2 K⁺ pumped in',
        '3 Na⁺ pumped out for 2 K⁺ pumped in per ATP molecule hydrolyzed',
        '2 Na⁺ pumped in for 3 K⁺ pumped out',
        '1 Na⁺ pumped out for 1 K⁺ pumped in'
      ],
      correctIndex: 1,
      explanation: 'The Na⁺/K⁺ pump exports 3 Na⁺ ions from the cytosol to the extracellular fluid and imports 2 K⁺ ions into the cell for each molecule of ATP hydrolyzed. This net export of 1 positive charge contributes to the resting membrane potential.'
    }
  ],
  neuron: [
    {
      id: 'q-neu-1',
      question: 'During the rapid depolarization phase of an axonal action potential, what biophysical event drives the membrane potential from -70 mV toward +30 mV?',
      options: [
        'Massive efflux of potassium (K⁺) ions through leak channels',
        'Rapid opening of voltage-gated sodium (Na⁺) channels causing an explosive inward influx of Na⁺ down its electrochemical gradient',
        'Active extrusion of chloride (Cl⁻) ions',
        'Immediate shutdown of the sodium-potassium pump'
      ],
      correctIndex: 1,
      explanation: 'Depolarization beyond the threshold voltage (~ -55 mV) opens the m-gates of voltage-gated Na⁺ channels. Sodium ions rush intracellularly driven by both electrical attraction and concentration gradient until the membrane potential approaches the sodium equilibrium potential (E_Na ≈ +60 mV).'
    },
    {
      id: 'q-neu-2',
      question: 'Why is an action potential strictly unidirectional, prevented from propagating backwards toward the axon hillock?',
      options: [
        'The axon diameter decreases toward the dendrites',
        'Voltage-gated Na⁺ channels enter a time-dependent refractory inactivation state (h-gate closure) immediately following depolarization',
        'Potassium ions physically block the retrograde current flow',
        'Myelin sheaths only face one direction'
      ],
      correctIndex: 1,
      explanation: 'Immediately after opening, voltage-gated Na⁺ channels close their inactivation gates (absolute refractory period). Upstream membrane patches cannot reopen their Na⁺ channels until they repolarize, ensuring forward-only propagation.'
    },
    {
      id: 'q-neu-3',
      question: 'In myelinated mammalian nerve fibers, why does saltatory conduction drastically increase the propagation speed of electrical impulses?',
      options: [
        'Myelin generates electrical sparks that heat up the axon core',
        'Myelin provides high electrical resistance and low capacitance, allowing action potentials to electrotonically leap between unmyelinated Nodes of Ranvier',
        'Myelin directly produces neurotransmitters along the internode',
        'Myelin eliminates the need for any ion channels'
      ],
      correctIndex: 1,
      explanation: 'The insulating myelin sheath reduces membrane capacitance and increases transmembrane resistance, preventing ion leakage along the internodes. The depolarizing current flows rapidly by passive cable properties to the next Node of Ranvier, where high-density Na⁺ channels regenerate the spike.'
    }
  ],
  molecular_geometry: [
    {
      id: 'q-vsepr-1',
      question: 'According to VSEPR theory, why is the H-O-H bond angle in water (104.5°) noticeably smaller than the ideal tetrahedral angle (109.5°)?',
      options: [
        'Hydrogen atoms attract each other through London dispersion forces',
        'The two non-bonding lone pairs on oxygen exert greater electrostatic repulsion on adjacent bonding pairs, compressing the bond angle',
        'Oxygen undergoes sp² hybridization instead of sp³',
        'Hydrogen bonds inside the molecule pull the atoms together'
      ],
      correctIndex: 1,
      explanation: 'VSEPR repulsive strength follows: Lone Pair - Lone Pair > Lone Pair - Bonding Pair > Bonding Pair - Bonding Pair. The two bulky, unshared lone pairs on the central oxygen atom squeeze the two O-H bonding pairs inward from 109.5° to 104.5°.'
    },
    {
      id: 'q-vsepr-2',
      question: 'What is the molecular geometry and steric number of Sulfur Hexafluoride (SF₆)?',
      options: [
        'Steric number 5, Trigonal Bipyramidal',
        'Steric number 6, Octahedral with 90° bond angles',
        'Steric number 4, Square Planar',
        'Steric number 6, Hexagonal Planar'
      ],
      correctIndex: 1,
      explanation: 'Sulfur in SF₆ has 6 valence electrons shared with 6 fluorine atoms, giving 6 bonding pairs and 0 lone pairs (steric number = 6). The electron-pair geometry and molecular geometry are both Octahedral, with mutual 90° F-S-F bond angles.'
    },
    {
      id: 'q-vsepr-3',
      question: 'What is the molecular geometry of the Xenon Tetrafluoride (XeF₄) molecule, which contains 4 bonding pairs and 2 lone pairs on Xenon?',
      options: ['Tetrahedral', 'Seesaw', 'Square Planar', 'Trigonal Bipyramidal'],
      correctIndex: 2,
      explanation: 'XeF₄ has steric number 6 (4 bonding pairs + 2 lone pairs). To minimize electrostatic repulsions, the two lone pairs occupy opposite axial positions (180° apart), leaving the four equatorial fluorine atoms in a flat Square Planar arrangement.'
    }
  ],
  reaction_kinetics: [
    {
      id: 'q-kin-1',
      question: 'How does a positive catalyst increase the rate of a chemical reaction without being consumed in the process?',
      options: [
        'By increasing the total enthalpy change (ΔH) of the reaction',
        'By providing an alternative reaction mechanism with a lower activation energy (E_a)',
        'By heating up the reacting solution internally',
        'By shifting the chemical equilibrium constant K_eq'
      ],
      correctIndex: 1,
      explanation: 'A catalyst lowers the activation energy barrier E_a. According to the Arrhenius equation k = A · e^(-E_a/RT), a lower E_a exponentially increases the fraction of molecular collisions that possess sufficient kinetic energy to overcome the transition state.'
    },
    {
      id: 'q-kin-2',
      question: 'For a chemical reaction with rate law Rate = k[A]²[B], what happens to the overall reaction rate if the concentration of [A] is doubled while [B] is halved?',
      options: ['Rate remains unchanged', 'Rate doubles (2×)', 'Rate quadruples (4×)', 'Rate is halved (0.5×)'],
      correctIndex: 1,
      explanation: 'Substituting into the rate law: Rate_new = k(2[A])²(0.5[B]) = k · 4[A]² · 0.5[B] = 2 · k[A]²[B] = 2 × Rate_initial. The rate doubles.'
    },
    {
      id: 'q-kin-3',
      question: 'For an exothermic reversible reaction at chemical equilibrium (A + B ⇌ C + heat), how does an increase in temperature affect the equilibrium position and equilibrium constant K_eq?',
      options: [
        'Shifts equilibrium toward products; K_eq increases',
        'Shifts equilibrium toward reactants (left); K_eq decreases according to Le Chatelier’s principle',
        'Has no effect on equilibrium composition',
        'Causes reactants to instantly vaporize'
      ],
      correctIndex: 1,
      explanation: 'By Le Chatelier’s principle, adding thermal energy to an exothermic reaction shifts the equilibrium toward the endothermic backward direction to absorb added heat. Consequently, reactant concentrations increase, product concentrations decrease, and K_eq drops.'
    }
  ],
  cardiac_hemodynamics: [
    {
      id: 'q-card-1',
      question: 'During the cardiac cycle, what mechanical event marks the exact onset of Isovolumetric Ventricular Contraction?',
      options: [
        'Opening of the aortic and pulmonary semilunar valves',
        'Closure of the atrioventricular (mitral and tricuspid) valves producing the first heart sound (S1 "lub")',
        'Rapid ventricular filling during diastole',
        'Atrial contraction (atrial kick)'
      ],
      correctIndex: 1,
      explanation: 'As ventricles begin contracting, intraventricular pressure rises above atrial pressure, snapping the mitral and tricuspid valves shut (producing S1). Because aortic pressure still exceeds ventricular pressure, the aortic valve remains closed, meaning all valves are shut and ventricular volume remains constant.'
    },
    {
      id: 'q-card-2',
      question: 'According to the Frank-Starling Mechanism (heterometric autoregulation), why does increased venous return (higher End-Diastolic Volume) result in a greater Stroke Volume?',
      options: [
        'Higher blood volume directly stimulates sympathetic adrenaline release',
        'Greater ventricular filling stretches myocardial myocytes closer to their optimal sarcomere operating length (L_max), increasing calcium sensitivity and contraction force',
        'The heart wall becomes thinner, lowering resistance to ejection',
        'Vascular resistance in the aorta drops to zero'
      ],
      correctIndex: 1,
      explanation: 'Increased preload stretches cardiac muscle fibers toward optimal actin-myosin overlap (~2.2 μm) and enhances troponin C affinity for Ca²⁺, generating stronger mechanical tension during systole and matching ventricular output to venous inflow.'
    },
    {
      id: 'q-card-3',
      question: 'If a patient has a resting heart rate of 72 beats/min and a stroke volume of 70 mL/beat, what is their resting Cardiac Output?',
      options: ['3.2 L/min', '4.2 L/min', '5.04 L/min', '7.2 L/min'],
      correctIndex: 2,
      explanation: 'Cardiac Output (CO) = Heart Rate (HR) × Stroke Volume (SV). CO = 72 beats/min × 70 mL/beat = 5,040 mL/min = 5.04 L/min, which is standard for a resting human adult.'
    }
  ],
  cellular_osmosis: [
    {
      id: 'q-osm-1',
      question: 'When human red blood cells (erythrocytes, ~300 mOsm/L) are suspended in a hypertonic 3.0% NaCl saline bath, what physiological response occurs?',
      options: [
        'Water enters the cells by osmosis, causing osmotic swelling and hemolysis',
        'Water leaves the cells down its chemical potential gradient, causing cellular crenation (shrinkage)',
        'Sodium ions actively neutralize intracellular hemoglobin',
        'The cells maintain identical biconcave morphology'
      ],
      correctIndex: 1,
      explanation: 'A 3% NaCl solution (~1000 mOsm/L) has a far higher solute osmolarity than normal intracellular cytosol (~300 mOsm/L). Water flows out of erythrocytes across the plasma membrane by osmosis, causing cell collapse and crenation.'
    },
    {
      id: 'q-osm-2',
      question: 'What is the reflection coefficient (σ) of a biological membrane that is completely impermeable to a solute like albumin or sucrose?',
      options: ['σ = 0', 'σ = 0.5', 'σ = 1.0', 'σ = -1.0'],
      correctIndex: 2,
      explanation: 'The Staverman reflection coefficient σ ranges from 0 to 1. When σ = 1.0, the membrane is completely impermeable to the solute, meaning the solute exerts 100% of its theoretical van ’t Hoff osmotic pressure (Δπ).'
    },
    {
      id: 'q-osm-3',
      question: 'In plant cells placed in pure distilled water (hypotonic solution), why do the cells avoid osmotic bursting (lysis)?',
      options: [
        'Plant cell membranes are completely impermeable to water',
        'The rigid cellulose cell wall resists excessive volumetric expansion, generating opposing hydrostatic turgor pressure (Ψ_p) until net water potential reaches equilibrium (Ψ = 0)',
        'Plant cells lack aquaporins',
        'Chloroplasts actively pump water out of the cell'
      ],
      correctIndex: 1,
      explanation: 'Plant cell walls generate wall pressure (turgor pressure Ψ_p). As water enters the central vacuole, the protoplast presses firmly against the rigid cell wall until the positive pressure potential exactly balances the negative solute potential (Ψ_s + Ψ_p = 0), establishing osmotic equilibrium.'
    }
  ],
  vector_3d_lab: [
    {
      id: 'q-v3d-1',
      question: 'Given vectors A = ⟨2, 3, -1⟩ and B = ⟨1, -2, -4⟩ in 3D Euclidean space, what is their scalar dot product A · B?',
      options: ['-4', '0', '8', '12'],
      correctIndex: 1,
      explanation: 'A · B = (A_x · B_x) + (A_y · B_y) + (A_z · B_z) = (2)(1) + (3)(-2) + (-1)(-4) = 2 - 6 + 4 = 0. Because their dot product is zero, vectors A and B are strictly orthogonal (perpendicular, 90°).'
    },
    {
      id: 'q-v3d-2',
      question: 'What does the magnitude of the 3D cross product |A × B| geometrically represent?',
      options: [
        'The length of the projection of vector A onto vector B',
        'The exact geometric area of the parallelogram formed by vectors A and B',
        'The volume of the rectangular parallelepiped formed by A, B, and the Z-axis',
        'The perimeter of the triangle bounded by A and B'
      ],
      correctIndex: 1,
      explanation: 'By definition, |A × B| = |A||B| sin θ. In geometry, with base = |A| and height = |B| sin θ, this formula yields the exact surface area of the parallelogram formed by vectors A and B.'
    },
    {
      id: 'q-v3d-3',
      question: 'What is the scalar triple product A · (B × C) of three coplanar vectors that lie entirely in the same 2D plane in 3D space?',
      options: ['0', '1', 'Equal to |A||B||C|', 'Undefined'],
      correctIndex: 0,
      explanation: 'The scalar triple product A · (B × C) evaluates the volume of the parallelepiped spanned by the three vectors. If all three vectors are coplanar, the parallelepiped has zero height, meaning its volume is identically 0.'
    }
  ],
  calculus_riemann_lab: [
    {
      id: 'q-rie-1',
      question: 'As the number of rectangular partitions n approaches infinity (partition width Δx → 0), what does the Riemann Sum Σ f(xᵢ*) Δx define?',
      options: [
        'The instantaneous derivative f′(x)',
        'The Definite Integral ∫ₐᵇ f(x) dx, representing the exact net signed area between the curve and the x-axis',
        'The curvature of f(x)',
        'The tangent line slope at x = a'
      ],
      correctIndex: 1,
      explanation: 'By the Cauchy-Riemann definition of integration, the limit of a Riemann sum as the mesh norm tends to zero is the definite integral ∫ₐᵇ f(x) dx, which computes continuous accumulated area.'
    },
    {
      id: 'q-rie-2',
      question: 'For a continuous function f(x) that is strictly monotonically increasing on the interval [a, b], how does the Left Riemann Sum compare to the True Integral?',
      options: [
        'The Left Riemann Sum strictly underestimates the true integral value',
        'The Left Riemann Sum strictly overestimates the true integral value',
        'The Left Riemann Sum is always exactly equal to the true integral',
        'The comparison depends on whether the function is concave or convex'
      ],
      correctIndex: 0,
      explanation: 'Because f(x) increases across each subinterval [xᵢ₋₁, xᵢ], evaluating the height at the left endpoint f(xᵢ₋₁) means each rectangle is shorter than the curve throughout the subinterval, causing a systematic underestimation.'
    },
    {
      id: 'q-rie-3',
      question: 'According to the Fundamental Theorem of Calculus Part 2, how is the definite integral ∫₁³ (3x² - 2x) dx evaluated analytically?',
      options: ['16', '18', '24', '26'],
      correctIndex: 1,
      explanation: 'The antiderivative is F(x) = x³ - x². Evaluating from 1 to 3: F(3) = (3³ - 3²) = 27 - 9 = 18. F(1) = (1³ - 1²) = 1 - 1 = 0. Therefore, ∫₁³ (3x² - 2x) dx = 18 - 0 = 18.'
    }
  ],
  projectile_motion_lab: [
    {
      id: 'q-pml-1',
      question: 'How does quadratic aerodynamic drag (F_drag = ½ ρ C_d A v²) fundamentally alter the trajectory of a launched projectile compared to an ideal parabolic trajectory in a vacuum?',
      options: [
        'The trajectory remains symmetric but has a shorter range',
        'The trajectory becomes asymmetric; horizontal velocity decays continuously, causing a steeper descent angle and reducing both maximum height and range',
        'The projectile accelerates horizontally during descent',
        'The peak height occurs later in time than in vacuum'
      ],
      correctIndex: 1,
      explanation: 'In vacuum, horizontal velocity v_x remains constant, giving a symmetric parabola. Under quadratic drag, v_x constantly decreases due to opposing force, causing the projectile to fall at an increasingly steep angle during descent with significant loss of range.'
    },
    {
      id: 'q-pml-2',
      question: 'Why is the 4th-Order Runge-Kutta (RK4) integrator vastly superior to Simple Euler integration for modeling ballistic trajectories with air resistance?',
      options: [
        'RK4 uses less computer memory than Euler',
        'RK4 evaluates derivatives at 4 distinct trial positions per time step (O(Δt⁴) global error), preventing artificial energy accumulation and numerical drift',
        'Euler integration is only applicable to zero-gravity environments',
        'RK4 converts differential equations into algebraic formulas'
      ],
      correctIndex: 1,
      explanation: 'Simple Euler integration uses only the initial derivative per step (O(Δt) error), causing runaway energy error and instability in velocity-dependent drag. RK4 uses weighted slope evaluations (k₁, k₂, k₃, k₄) to provide 4th-order precision.'
    },
    {
      id: 'q-pml-3',
      question: 'At the apex (highest point) of flight for a projectile launched at angle θ > 0 with drag, what is true regarding its instantaneous velocity and acceleration?',
      options: [
        'Both velocity and acceleration are zero',
        'Vertical velocity v_y is zero, but horizontal velocity v_x and downward gravitational acceleration g are non-zero',
        'Acceleration is zero, but velocity is maximum',
        'Horizontal acceleration is zero'
      ],
      correctIndex: 1,
      explanation: 'At the peak, vertical velocity transitions from upward to downward, so v_y = 0. However, horizontal velocity v_x > 0, downward gravity g acts continuously, and aerodynamic drag acts horizontally opposing v_x.'
    }
  ],
  wave_interference_lab: [
    {
      id: 'q-wil-1',
      question: 'When two acoustic tuning forks emitting frequencies f₁ = 440 Hz and f₂ = 444 Hz are struck simultaneously, what beat frequency will an observer perceive?',
      options: ['2 Hz', '4 Hz', '442 Hz', '884 Hz'],
      correctIndex: 1,
      explanation: 'Beat frequency equals the absolute difference between the two interfering wave frequencies: f_beat = |f₁ - f₂| = |440 - 444| = 4 Hz. The observer hears 4 periodic intensity pulsations per second.'
    },
    {
      id: 'q-wil-2',
      question: 'What phase relationship is required between two coherent sinusoidal waves of equal amplitude A to produce complete destructive interference (zero net amplitude)?',
      options: [
        'Phase difference Δφ = 0 radians (in phase)',
        'Phase difference Δφ = π radians (180°, out of phase)',
        'Phase difference Δφ = π/2 radians (90°)',
        'Phase difference Δφ = 2π radians'
      ],
      correctIndex: 1,
      explanation: 'When two waves are out of phase by π radians (180°), the crest of one wave perfectly aligns with the trough of the other: y_net = A sin(ωt) + A sin(ωt + π) = A sin(ωt) - A sin(ωt) = 0.'
    },
    {
      id: 'q-wil-3',
      question: 'When two identical waves traveling in opposite directions interfere, what stationary wave structure is produced?',
      options: [
        'A dispersive solitary soliton wave',
        'A standing wave possessing stationary nodes (zero vibration amplitude) and antinodes (maximum amplitude 2A)',
        'An exponential shock wave',
        'Total cancellation throughout the medium'
      ],
      correctIndex: 1,
      explanation: 'The superposition of two counter-propagating waves produces a standing wave: y(x, t) = 2A sin(kx) cos(ωt). The positions where sin(kx) = 0 are permanently stationary nodes, while positions where |sin(kx)| = 1 oscillate with maximum amplitude 2A (antinodes).'
    }
  ],
  orbital_mechanics_3d: [
    {
      id: 'q-om3d-1',
      question: 'According to Kepler\'s Second Law of Planetary Motion, what quantity remains strictly constant as a planet orbits the Sun in an eccentric ellipse?',
      options: [
        'Linear orbital velocity v',
        'Areal velocity dA/dt (the area swept out per unit time by the radius vector)',
        'Gravitational force magnitude F_g',
        'Radial distance from the Sun r'
      ],
      correctIndex: 1,
      explanation: 'Kepler\'s Second Law states that the line connecting a planet to the Sun sweeps out equal areas in equal intervals of time: dA/dt = L/(2m) = constant. This is a direct consequence of the conservation of orbital angular momentum under a central gravitational force.'
    },
    {
      id: 'q-om3d-2',
      question: 'An asteroid orbits the Sun with a semi-major axis of a = 4.0 AU. According to Kepler\'s Third Law (T² ∝ a³), what is its orbital period T in Earth years?',
      options: ['2.0 Earth years', '4.0 Earth years', '8.0 Earth years', '16.0 Earth years'],
      correctIndex: 2,
      explanation: 'From Kepler\'s Third Law with units in AU and Earth years: T² = a³. Substituting a = 4.0 AU gives T² = 4.0³ = 64. Taking the square root yields T = √64 = 8.0 Earth years.'
    },
    {
      id: 'q-om3d-3',
      question: 'Using the Vis-Viva equation v² = GM(2/r - 1/a), at which point in an elliptical orbit does a spacecraft possess its maximum instantaneous speed and maximum kinetic energy?',
      options: [
        'Aphelion (maximum distance from Sun, r = a(1+e))',
        'Perihelion (minimum distance from Sun, r = a(1-e))',
        'Semi-minor axis vertex (r = b)',
        'Instantaneous speed remains constant throughout the orbit'
      ],
      correctIndex: 1,
      explanation: 'At perihelion, distance r is at its absolute minimum r = a(1-e). In the Vis-Viva relation v² = GM(2/r - 1/a), minimizing r maximizes the term 2/r, yielding the maximum orbital velocity and maximum kinetic energy at the cost of gravitational potential energy.'
    }
  ],
  atomic_orbitals_3d: [
    {
      id: 'q-ao3d-1',
      question: 'For a hydrogen atomic electron in the 3p orbital (n = 3, l = 1), how many spherical radial nodes and how many planar/conical angular nodal surfaces exist?',
      options: [
        '1 radial node and 1 angular nodal plane',
        '0 radial nodes and 2 angular nodal planes',
        '2 radial nodes and 1 angular nodal plane',
        '1 radial node and 2 angular nodal planes'
      ],
      correctIndex: 0,
      explanation: 'For any atomic orbital: Radial nodes = n - l - 1 = 3 - 1 - 1 = 1 spherical node. Angular nodal surfaces = l = 1 planar node. Total nodes = n - 1 = 3 - 1 = 2 nodes total.'
    },
    {
      id: 'q-ao3d-2',
      question: 'What quantum mechanical numbers characterize the unique cloverleaf and doughnut-ring 3d_z² atomic orbital?',
      options: [
        'n = 3, l = 1, m = 0',
        'n = 3, l = 2, m = 0',
        'n = 3, l = 3, m = 2',
        'n = 2, l = 2, m = 1'
      ],
      correctIndex: 1,
      explanation: 'For any 3d orbital, principal quantum number n = 3 and azimuthal quantum number l = 2 (representing d-orbitals). The specific axial orbital 3d_z² corresponds to the magnetic quantum number m_l = 0 with angular harmonic Y_2^0 ∝ (3cos²θ - 1).'
    },
    {
      id: 'q-ao3d-3',
      question: 'When a hydrogen electron transitions from n = 3 down to n = 2 (the Balmer Hα transition), what is the nature of the emitted photon?',
      options: [
        'High-energy Gamma ray photon',
        'Visible red light photon with wavelength λ = 656.3 nm',
        'Ultraviolet Lyman photon with λ = 121.6 nm',
        'Microwave background photon'
      ],
      correctIndex: 1,
      explanation: 'Using the Rydberg formula 1/λ = R_H (1/2² - 1/3²) = R_H (1/4 - 1/9) = R_H (5/36), the emitted photon energy is ΔE = -13.6(1/9 - 1/4) = 1.89 eV, corresponding exactly to λ = hc/ΔE = 656.3 nm in the visible red spectrum.'
    }
  ],
  em_wave_3d: [
    {
      id: 'q-em3d-1',
      question: 'Unpolarized light of intensity I₀ passes through a linear polarizer, and then through a second analyzer rotated at an angle of θ = 60° relative to the first. According to Malus\'s Law, what is the final transmitted intensity?',
      options: ['0.50 I₀', '0.25 I₀', '0.125 I₀ (one-eighth I₀)', '0.00 I₀ (completely extinguished)'],
      correctIndex: 2,
      explanation: 'After passing through the first polarizer, unpolarized light is reduced to I₁ = I₀/2. Upon traversing the second analyzer at θ = 60°, Malus\'s Law dictates I_final = I₁ cos²(60°) = (I₀/2) × (0.5)² = (I₀/2) × 0.25 = 0.125 I₀.'
    },
    {
      id: 'q-em3d-2',
      question: 'In a vacuum transverse electromagnetic plane wave propagating along the +z direction, what is the spatial orientation of the electric field E and magnetic field B vectors?',
      options: [
        'E and B both point parallel to the z propagation axis',
        'E and B oscillate in the xy-plane, perpendicular to each other and perpendicular to the z-axis',
        'E oscillates longitudinally while B oscillates circularly',
        'E and B are antiparallel to each other along the x-axis'
      ],
      correctIndex: 1,
      explanation: 'Maxwell\'s equations in vacuum dictate that electromagnetic waves are strictly transverse: the electric field E and magnetic field B oscillate perpendicular to each other and both are perpendicular to the wave propagation vector k (E ⊥ B ⊥ k).'
    },
    {
      id: 'q-em3d-3',
      question: 'What optical device introduces a 90° (π/2 radians) phase retardance between orthogonal polarization components, converting linearly polarized light into circularly polarized light?',
      options: [
        'Half-wave plate (λ/2 retarder)',
        'Quarter-wave plate (λ/4 retarder)',
        'Diffraction grating',
        'Convex cylindrical lens'
      ],
      correctIndex: 1,
      explanation: 'A quarter-wave plate (λ/4) has fast and slow birefringence axes that induce a path difference of Δx = λ/4, which corresponds to a phase difference of Δφ = (2π/λ)(λ/4) = π/2 radians (90°). When linearly polarized light enters at 45° to the optic axis, the resulting orthogonal components have equal amplitude and a 90° phase shift, creating circular polarization.'
    }
  ],
  dna_helix_3d: [
    {
      id: 'q-dna3d-1',
      question: 'Why does a DNA duplex with 70% GC content have a significantly higher melting temperature (T_m) than an equal-length DNA duplex with 30% GC content?',
      options: [
        'Guanine-Cytosine pairs have 3 hydrogen bonds compared to only 2 in Adenine-Thymine pairs, requiring more thermal energy to break',
        'GC pairs are covalently bonded while AT pairs are ionic',
        'GC pairs do not possess major grooves',
        'Adenine-Thymine pairs repel each other at room temperature'
      ],
      correctIndex: 0,
      explanation: 'Watson-Crick base pairing dictates that Guanine pairs with Cytosine via 3 hydrogen bonds (forming a stronger bonding enthalpy of ~65 kJ/mol), whereas Adenine pairs with Thymine via only 2 hydrogen bonds (~45 kJ/mol). Higher GC content increases the cumulative enthalpy required for thermal denaturation.'
    },
    {
      id: 'q-dna3d-2',
      question: 'What are the characteristic structural parameters of the classical canonical B-DNA right-handed double helix?',
      options: [
        '10.5 base pairs per 360° turn, 3.4 nm helical pitch, and 2.0 nm duplex diameter',
        '4.0 base pairs per turn, 1.2 nm pitch, and left-handed twist',
        '20.0 base pairs per turn with identical major and minor groove widths',
        'Single-stranded parallel ribbons'
      ],
      correctIndex: 0,
      explanation: 'Canonical B-DNA is a right-handed double helix featuring 10.5 base pairs per full 360° turn, a vertical rise of 0.34 nm per base pair (3.4 nm pitch per turn), a diameter of 2.0 nm, and alternating major (2.2 nm) and minor (1.2 nm) grooves.'
    },
    {
      id: 'q-dna3d-3',
      question: 'What enzyme unzips double-stranded DNA in living cells by disrupting hydrogen bonds ahead of the replication fork?',
      options: ['DNA Ligase', 'DNA Helicase', 'RNA Primase', 'Topoisomerase I'],
      correctIndex: 1,
      explanation: 'DNA Helicase is the motor enzyme that hydrolyzes ATP to separate the two complementary strands of double-stranded DNA by breaking the hydrogen bonds between base pairs, generating single-stranded DNA templates for DNA polymerase.'
    }
  ],
  black_hole_relativity_3d: [
    {
      id: 'q-bh3d-1',
      question: 'For a non-rotating Schwarzschild black hole of mass M, at what radial distance from the singularity is the photon sphere located?',
      options: [
        'At the event horizon R_s = 2GM/c²',
        'At 1.5 R_s = 3GM/c²',
        'At 3.0 R_s = 6GM/c²',
        'At infinity'
      ],
      correctIndex: 1,
      explanation: 'In Schwarzschild spacetime, photons can orbit the black hole in an unstable circular trajectory at r = 1.5 R_s = 3GM/c². Any inward perturbation causes the photon to spiral into the event horizon, while outward perturbation allows it to escape.'
    },
    {
      id: 'q-bh3d-2',
      question: 'Why does one side of a relativistic accretion disk appear dramatically brighter and blue-shifted to an observer?',
      options: [
        'The black hole has asymmetric mass distribution',
        'Relativistic Doppler beaming (headlight effect) amplifies radiation emitted by gas moving toward the observer at near-light speeds',
        'Nuclear fusion only occurs on one side of the disk',
        'Solar wind from companion stars blocks the other side'
      ],
      correctIndex: 1,
      explanation: 'Accretion disk plasma orbits at substantial fractions of c. Special relativistic Doppler boosting concentrates and blueshifts photons emitted by material approaching the observer, enhancing apparent flux by factors of (1 / [γ(1 - β cos θ)])⁴.'
    },
    {
      id: 'q-bh3d-3',
      question: 'How does the Kerr spin parameter a affect the Innermost Stable Circular Orbit (ISCO) of matter orbiting a rotating black hole?',
      options: [
        'ISCO radius is invariant regardless of spin',
        'Co-rotating Kerr spin drags spacetime frame, reducing ISCO from 3 R_s down toward 0.5 R_s (r = GM/c²)',
        'Spin pushes ISCO to infinite distance',
        'Spin halts accretion disk rotation completely'
      ],
      correctIndex: 1,
      explanation: 'Frame dragging (the Lense-Thirring effect) in Kerr geometry allows co-rotating particles to maintain stable orbits much closer to the horizon without plunging, decreasing the ISCO from 6M (Schwarzschild) to 1M (extremal Kerr).'
    }
  ],
  crystallography_3d: [
    {
      id: 'q-cryst3d-1',
      question: 'What is the theoretical Atomic Packing Factor (APF) of a Face-Centered Cubic (FCC) unit cell with hard spheres touching along face diagonals?',
      options: ['0.52 (52%)', '0.68 (68%)', '0.74 (74.05%)', '0.34 (34%)'],
      correctIndex: 2,
      explanation: 'In an FCC unit cell, there are 4 net atoms and face-diagonal touching gives 4r = a√2. Calculating APF = (4 × (4/3)πr³) / a³ yields π / (3√2) ≈ 0.7405, achieving the maximum close-packing density possible for identical spheres.'
    },
    {
      id: 'q-cryst3d-2',
      question: 'In a cubic crystal with lattice constant a = 4.00 Å, what is the interplanar spacing d for the family of crystallographic planes with Miller indices (2 2 0)?',
      options: ['4.00 Å', '2.00 Å', '1.414 Å (a / √8)', '0.500 Å'],
      correctIndex: 2,
      explanation: 'For cubic crystals: d_hkl = a / √(h² + k² + l²). Substituting (h,k,l) = (2,2,0) gives d_220 = 4.00 / √(4 + 4 + 0) = 4.00 / √8 = 4.00 / 2.828 ≈ 1.414 Å.'
    },
    {
      id: 'q-cryst3d-3',
      question: 'According to Bragg’s Law (λ = 2d sin θ), what happens to the diffraction peak angle 2θ if the incident X-ray wavelength λ is decreased while d remains constant?',
      options: [
        'The diffraction angle 2θ decreases toward zero',
        'The diffraction angle 2θ increases toward 180°',
        'The diffraction peaks disappear entirely',
        'The interplanar spacing d expands'
      ],
      correctIndex: 0,
      explanation: 'From Bragg\'s Law, sin θ = λ / (2d). If λ decreases, sin θ decreases proportionately, meaning the Bragg diffraction angle θ (and 2θ) decreases, shifting peaks to lower angles.'
    }
  ],
  neuron_synapse_3d: [
    {
      id: 'q-neu3d-1',
      question: 'Why does saltatory conduction along myelinated nerve axons propagate action potentials significantly faster than continuous conduction in unmyelinated axons?',
      options: [
        'Myelin heats the axon to increase ion velocity',
        'Myelin acts as high-resistance, low-capacitance electrical insulation, forcing the action potential to depolarize exclusively at Nodes of Ranvier',
        'Myelin pumps sodium ions into the extracellular fluid continuously',
        'Action potentials travel via light photons in myelinated axons'
      ],
      correctIndex: 1,
      explanation: 'Myelin prevents transmembrane ionic current leak across the internodes. Depolarizing current flows passively with minimal loss inside the axoplasm, electrotonically jumping from one unmyelinated Node of Ranvier to the next.'
    },
    {
      id: 'q-neu3d-2',
      question: 'What is the indispensable ion trigger that causes synaptic vesicles to fuse with the presynaptic active zone and release neurotransmitters into the synaptic cleft?',
      options: ['Chloride (Cl⁻) efflux', 'Calcium (Ca²⁺) influx through voltage-gated Ca²⁺ channels', 'Sodium (Na⁺) pump reversal', 'Potassium (K⁺) crystallization'],
      correctIndex: 1,
      explanation: 'When the action potential depolarizes the presynaptic terminal, voltage-gated Ca²⁺ channels open. Rapid influx of Ca²⁺ binds to synaptotagmin, triggering SNARE-complex mediated exocytosis of vesicle contents into the 20 nm synaptic cleft.'
    },
    {
      id: 'q-neu3d-3',
      question: 'What happens if a graded membrane depolarization reaches -58 mV, just short of the -55 mV firing threshold?',
      options: [
        'A miniature action potential with 50% amplitude is fired',
        'No action potential is triggered (all-or-none law)',
        'The neuron continuously fires indefinitely',
        'The membrane potential jumps directly to +100 mV'
      ],
      correctIndex: 1,
      explanation: 'Action potentials strictly adhere to the all-or-none law: subthreshold depolarizations fail to activate enough regenerative positive-feedback voltage-gated Na⁺ channels to overcome outward K⁺ leak, and the membrane decays passively back to resting -70 mV.'
    }
  ],
  quantum_double_slit_3d: [
    {
      id: 'q-quant3d-1',
      question: 'If electrons are emitted one by one through a double slit onto a phosphorescent screen with no detector at the slits, what pattern builds up over time?',
      options: [
        'Two distinct classical particle bands directly behind the two slits',
        'A quantum wave interference pattern with alternating bright fringes and dark nodes',
        'A single sharp dot in the center',
        'A completely random uniform haze with no structure'
      ],
      correctIndex: 1,
      explanation: 'Even when electrons are sent individually so that no two electrons can interact, an interference pattern accumulates hit by hit. Each individual electron wavepacket travels through both slits simultaneously in quantum superposition and interferes with itself.'
    },
    {
      id: 'q-quant3d-2',
      question: 'What fundamental quantum phenomenon explains why placing a detector at the slits destroys the interference fringes and leaves two classical bands?',
      options: [
        'Friction between the electron and the detector screen',
        'Quantum measurement causes entanglement with the detector and decoherence, collapsing the superposition |Ψ₁ + Ψ₂|² into classical probabilities |Ψ₁|² + |Ψ₂|²',
        'The detector blocks the slits physically like a cork',
        'The magnetic field of the detector destroys the electrons'
      ],
      correctIndex: 1,
      explanation: 'According to quantum measurement theory and complementarity, obtaining "which-way" information destroys phase coherence between the two path amplitudes. The cross-interference term 2Re(Ψ₁*Ψ₂) vanishes, resulting in the classical sum of probabilities.'
    },
    {
      id: 'q-quant3d-3',
      question: 'According to the de Broglie relation (λ = h / p), what happens to the electron fringe spacing Δy = λL / d if the accelerating voltage is increased, doubling electron momentum p?',
      options: [
        'Fringe spacing Δy is halved (fringes become closer together)',
        'Fringe spacing Δy doubles',
        'Fringe spacing remains unchanged',
        'Fringes rotate by 90 degrees'
      ],
      correctIndex: 0,
      explanation: 'Doubling momentum p halves the de Broglie wavelength λ = h/p. Because fringe spacing Δy = λL/d is directly proportional to λ, the fringes compress together and spacing Δy is halved.'
    }
  ]
};


