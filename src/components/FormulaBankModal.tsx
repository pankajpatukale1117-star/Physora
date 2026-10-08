import React, { useState } from 'react';
import { X, Search, BookOpen, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { MathView } from './MathView';

export interface FormulaItem {
  id: string;
  name: string;
  category: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
  domain: string;
  latex: string;
  plainEnglish: string;
  description: string;
  variables: { sym: string; name: string; unit: string }[];
  targetTopicId: string;
}

export const FORMULAS_DATA: FormulaItem[] = [
  {
    id: 'f-kinematics-1',
    name: 'First Equation of Motion',
    category: 'Physics',
    domain: 'Kinematics',
    latex: 'v = u + at',
    plainEnglish: 'Final Speed = Start Speed + (Acceleration × Time)',
    description: 'Calculates how fast an object is moving after speeding up or slowing down for a given duration.',
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
    plainEnglish: 'Distance = (Start Speed × Time) + ½ × Acceleration × Time²',
    description: 'Calculates the total distance an object travels while steadily accelerating.',
    variables: [
      { sym: 's', name: 'Distance (Displacement)', unit: 'm' },
      { sym: 'u', name: 'Initial Velocity', unit: 'm/s' },
      { sym: 't', name: 'Elapsed Time', unit: 's' },
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
    plainEnglish: 'Push/Pull Force = Mass × Acceleration',
    description: 'The heavier an object is, the more force you need to push it and change its speed.',
    variables: [
      { sym: 'F_{net}', name: 'Net Force', unit: 'N (Newtons)' },
      { sym: 'm', name: 'Object Mass', unit: 'kg' },
      { sym: 'a', name: 'Acceleration', unit: 'm/s²' },
      { sym: 'dp/dt', name: 'Rate of Momentum Change', unit: 'kg·m/s²' }
    ],
    targetTopicId: 'newtons_laws'
  },
  {
    id: 'f-work-energy',
    name: 'Kinetic Energy & Work-Energy Theorem',
    category: 'Physics',
    domain: 'Energy',
    latex: 'W_{net} = \\Delta K = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2',
    plainEnglish: 'Work Done = Final Kinetic Energy − Starting Kinetic Energy',
    description: 'Any mechanical work you do on an object directly turns into its energy of motion.',
    variables: [
      { sym: 'W_{net}', name: 'Work Done', unit: 'J (Joules)' },
      { sym: '\\Delta K', name: 'Energy Change', unit: 'J (Joules)' },
      { sym: 'm', name: 'Object Mass', unit: 'kg' },
      { sym: 'v', name: 'Final Speed', unit: 'm/s' },
      { sym: 'u', name: 'Starting Speed', unit: 'm/s' }
    ],
    targetTopicId: 'work_energy_power'
  },
  {
    id: 'f-gravitation',
    name: "Newton's Universal Law of Gravitation",
    category: 'Physics',
    domain: 'Gravitation',
    latex: 'F_g = G \\frac{M m}{r^2}',
    plainEnglish: 'Gravity Pull = G × (Mass₁ × Mass₂) ÷ Distance²',
    description: 'Every two masses in the universe pull each other; moving twice as far away makes gravity 4× weaker.',
    variables: [
      { sym: 'F_g', name: 'Gravitational Pull', unit: 'N (Newtons)' },
      { sym: 'G', name: 'Gravity Constant', unit: '6.674×10⁻¹¹ N·m²/kg²' },
      { sym: 'M, m', name: 'Two Masses', unit: 'kg' },
      { sym: 'r', name: 'Distance Between Centers', unit: 'm' }
    ],
    targetTopicId: 'gravitation'
  },
  {
    id: 'f-waves-speed',
    name: 'Universal Wave Speed Equation',
    category: 'Physics',
    domain: 'Waves & Sound',
    latex: 'v = f \\lambda = \\frac{\\lambda}{T}',
    plainEnglish: 'Wave Speed = Frequency (Waves/sec) × Wavelength (Wave Length)',
    description: 'Determines how fast ripples on water, sound waves, or light beams travel through a medium.',
    variables: [
      { sym: 'v', name: 'Wave Travel Speed', unit: 'm/s' },
      { sym: 'f', name: 'Frequency (cycles/sec)', unit: 'Hz' },
      { sym: '\\lambda', name: 'Wavelength', unit: 'm' },
      { sym: 'T', name: 'Oscillation Time Period', unit: 's' }
    ],
    targetTopicId: 'waves'
  },
  {
    id: 'f-pythagorean-trig',
    name: 'Pythagorean Trigonometric Identity',
    category: 'Mathematics',
    domain: 'Trigonometry',
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
    plainEnglish: '(Vertical Height)² + (Horizontal Width)² = (Radius)² = 1',
    description: 'No matter what angle you pick on a unit circle, Pythagoras theorem guarantees the sum of squares is always 1.',
    variables: [
      { sym: '\\theta', name: 'Rotation Angle', unit: 'Degrees / Radians' },
      { sym: '\\sin\\theta', name: 'Vertical Height (y)', unit: 'Ratio (-1 to 1)' },
      { sym: '\\cos\\theta', name: 'Horizontal Width (x)', unit: 'Ratio (-1 to 1)' }
    ],
    targetTopicId: 'trigonometry'
  },
  {
    id: 'f-calculus-power',
    name: 'Power Rule for Instantaneous Derivatives',
    category: 'Mathematics',
    domain: 'Calculus',
    latex: '\\frac{d}{dx}[x^n] = n x^{n-1}',
    plainEnglish: 'Slope of xⁿ = Exponent × x^(Exponent − 1)',
    description: 'Finds the exact speed or steepness of any curve at a single instantaneous point.',
    variables: [
      { sym: 'd/dx', name: 'Rate of Change Operator', unit: 'Slope' },
      { sym: 'x', name: 'Input Variable', unit: 'Dimensionless' },
      { sym: 'n', name: 'Power Exponent', unit: 'Constant' }
    ],
    targetTopicId: 'basic_calculus'
  },
  {
    id: 'f-quadratic-formula',
    name: 'Quadratic Formula & Root Finder',
    category: 'Mathematics',
    domain: 'Algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    plainEnglish: 'Finds where the U-shaped parabola crosses zero',
    description: 'Gives the exact crossing points (roots) for any quadratic equation ax² + bx + c = 0.',
    variables: [
      { sym: 'x', name: 'X-Intercept Roots', unit: 'Values' },
      { sym: 'b^2-4ac', name: 'Discriminant (Root Tester)', unit: '>0 (2 roots), =0 (1 root), <0 (none)' },
      { sym: 'a, b, c', name: 'Shape Coefficients', unit: 'Constants' }
    ],
    targetTopicId: 'algebra'
  },
  {
    id: 'f-circle-geometry',
    name: 'Standard Cartesian Circle Equation',
    category: 'Mathematics',
    domain: 'Coordinate Geometry',
    latex: '(x - h)^2 + (y - k)^2 = r^2',
    plainEnglish: '(x − CenterX)² + (y − CenterY)² = Radius²',
    description: 'Maps all points that sit at the exact distance r from center (h, k).',
    variables: [
      { sym: '(h, k)', name: 'Circle Center', unit: 'Coordinates' },
      { sym: 'r', name: 'Radius of Circle', unit: 'Units' }
    ],
    targetTopicId: 'coordinate_geometry'
  },
  {
    id: 'f-snells-law',
    name: "Snell's Law of Optical Refraction",
    category: 'Physics',
    domain: 'Optics',
    latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
    plainEnglish: 'Medium 1 Index × sin(Angle 1) = Medium 2 Index × sin(Angle 2)',
    description: 'Explains why straws bend in water and how camera lenses and eyeglasses focus light rays.',
    variables: [
      { sym: 'n_1, n_2', name: 'Refractive Indices (Glass/Water)', unit: 'Pure Number (Air=1.0, Glass≈1.5)' },
      { sym: '\\theta_1', name: 'Incoming Light Angle', unit: 'Degrees (°)' },
      { sym: '\\theta_2', name: 'Bent Light Angle', unit: 'Degrees (°)' }
    ],
    targetTopicId: 'optics'
  },
  {
    id: 'f-thin-lens',
    name: 'Thin Lens Gaussian Focus Equation',
    category: 'Physics',
    domain: 'Optics',
    latex: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}',
    plainEnglish: '1 / Focal Length = (1 / Image Distance) − (1 / Object Distance)',
    description: 'Tells you where a sharp image will form when looking through a magnifying glass or camera lens.',
    variables: [
      { sym: 'f', name: 'Lens Focal Length', unit: 'mm / cm' },
      { sym: 'v', name: 'Image Distance from Lens', unit: 'mm / cm' },
      { sym: 'u', name: 'Object Distance from Lens', unit: 'mm / cm' }
    ],
    targetTopicId: 'optics'
  },
  {
    id: 'f-ideal-gas',
    name: 'Ideal Gas Law of State',
    category: 'Physics',
    domain: 'Thermodynamics',
    latex: 'P V = n R T',
    plainEnglish: 'Pressure × Container Volume = Gas Amount × Constant × Temperature',
    description: 'Explains why car tires expand when hot and how bicycle pumps heat up when compressing air.',
    variables: [
      { sym: 'P', name: 'Gas Pressure', unit: 'Pa (Pascals)' },
      { sym: 'V', name: 'Volume of Gas', unit: 'm³ (Liters)' },
      { sym: 'n', name: 'Molar Amount of Gas', unit: 'moles' },
      { sym: 'R', name: 'Gas Constant', unit: '8.314 J/(mol·K)' },
      { sym: 'T', name: 'Temperature in Kelvin', unit: 'K' }
    ],
    targetTopicId: 'thermodynamics'
  },
  {
    id: 'f-carnot-efficiency',
    name: 'Carnot Engine Maximum Efficiency',
    category: 'Physics',
    domain: 'Thermodynamics',
    latex: '\\eta_{Carnot} = 1 - \\frac{T_C}{T_H} = \\frac{W_{net}}{Q_H}',
    plainEnglish: 'Max Efficiency = 1 − (Cold Temperature ÷ Hot Temperature)',
    description: 'The absolute maximum energy any heat engine (like a car engine or power plant) can convert to work.',
    variables: [
      { sym: '\\eta', name: 'Engine Efficiency Ratio', unit: '0 to 1 (0% to 100%)' },
      { sym: 'T_H', name: 'Hot Temperature Source', unit: 'K' },
      { sym: 'T_C', name: 'Cold Temperature Exhaust', unit: 'K' },
      { sym: 'W_{net}', name: 'Work Output', unit: 'Joules' }
    ],
    targetTopicId: 'thermodynamics'
  },
  {
    id: 'f-dimensions-homogeneity',
    name: 'Dimensional Homogeneity Rule',
    category: 'Physics',
    domain: 'Units & Dimensions',
    latex: '[F] = [M][L][T]^{-2} \\quad \\text{and} \\quad [E] = [M][L]^2[T]^{-2}',
    plainEnglish: 'Force Units = Mass × Length ÷ Time² (kg·m/s²)',
    description: 'Verifies that every physics formula makes sense by checking that both sides match fundamental units.',
    variables: [
      { sym: '[M]', name: 'Mass Dimension', unit: 'Kilograms (kg)' },
      { sym: '[L]', name: 'Length Dimension', unit: 'Meters (m)' },
      { sym: '[T]', name: 'Time Dimension', unit: 'Seconds (s)' }
    ],
    targetTopicId: 'units_dimensions'
  },
  {
    id: 'f-function-transform',
    name: 'Function Graph Shift & Scaling',
    category: 'Mathematics',
    domain: 'Functions & Graphs',
    latex: 'g(x) = a \\cdot f(x - h) + k',
    plainEnglish: 'Shift curve Right by h, Up by k, Stretch height by a',
    description: 'Takes any graph curve and lets you move or stretch it anywhere on the coordinate plane.',
    variables: [
      { sym: 'h', name: 'Horizontal Shift', unit: 'Right (+h) / Left (-h)' },
      { sym: 'k', name: 'Vertical Shift', unit: 'Up (+k) / Down (-k)' },
      { sym: 'a', name: 'Vertical Stretch Factor', unit: 'Taller (>1) / Flatter (<1)' }
    ],
    targetTopicId: 'functions'
  },
  {
    id: 'f-arithmetic-progression',
    name: 'Arithmetic Progression Step Rule (AP)',
    category: 'Mathematics',
    domain: 'Sequences & Series',
    latex: 'a_n = a + (n - 1)d, \\quad S_n = \\frac{n}{2}[2a + (n - 1)d]',
    plainEnglish: 'Target Number = Start + (Step − 1) × Step Size',
    description: 'Calculates any step and the total sum in steady staircase sequences like 2, 5, 8, 11...',
    variables: [
      { sym: 'a', name: 'Starting Number', unit: 'First term' },
      { sym: 'd', name: 'Step Difference', unit: 'Added each step' },
      { sym: 'n', name: 'Step Position Number', unit: '1, 2, 3...' },
      { sym: 'S_n', name: 'Sum of All Steps', unit: 'Total' }
    ],
    targetTopicId: 'sequences'
  },
  {
    id: 'f-geometric-progression',
    name: 'Geometric Progression Multiplier Rule (GP)',
    category: 'Mathematics',
    domain: 'Sequences & Series',
    latex: 'a_n = a \\cdot r^{n-1}, \\quad S_n = \\frac{a(1 - r^n)}{1 - r}',
    plainEnglish: 'Target Number = Start × (Multiplier)^(Step − 1)',
    description: 'Models exponential doubling or compound growth sequences like 3, 6, 12, 24, 48...',
    variables: [
      { sym: 'a', name: 'Starting Value', unit: 'First term' },
      { sym: 'r', name: 'Multiplier Ratio', unit: 'Factor per step' },
      { sym: 'n', name: 'Step Number', unit: 'Positive integer' },
      { sym: 'S_n', name: 'Cumulative Total', unit: 'Total sum' }
    ],
    targetTopicId: 'sequences'
  },
  {
    id: 'f-hardy-weinberg',
    name: 'Hardy-Weinberg Equilibrium',
    category: 'Biology',
    domain: 'Genetics & Evolution',
    latex: 'p^2 + 2pq + q^2 = 1 \\quad \\text{and} \\quad p + q = 1',
    plainEnglish: 'Homozygous Dominant + Heterozygous + Homozygous Recessive = 100% of Population',
    description: 'Predicts genotype frequencies in a non-evolving diploid gene pool without natural selection, mutation, or migration.',
    variables: [
      { sym: 'p', name: 'Dominant Allele Frequency (A)', unit: 'ratio (0-1)' },
      { sym: 'q', name: 'Recessive Allele Frequency (a)', unit: 'ratio (0-1)' },
      { sym: '2pq', name: 'Heterozygote Frequency (Aa)', unit: 'ratio (0-1)' }
    ],
    targetTopicId: 'natural_selection'
  },
  {
    id: 'f-gene-expression',
    name: 'Transcription Kinetics & Hill Equation',
    category: 'Biology',
    domain: 'Molecular Genetics',
    latex: '\\frac{d[\\text{mRNA}]}{dt} = V_{max} \\frac{[\\text{TF}]^n}{K_d^n + [\\text{TF}]^n} - k_{deg}[\\text{mRNA}]',
    plainEnglish: 'mRNA Rate = (Max Synthesis × TF Affinity) − Degradation Rate',
    description: 'Quantifies gene expression rate as RNA polymerase and transcription factor complexes bind DNA promoter sites.',
    variables: [
      { sym: '[\\text{mRNA}]', name: 'Messenger RNA Abundance', unit: 'nM' },
      { sym: '[\\text{TF}]', name: 'Transcription Factor Concentration', unit: 'nM' },
      { sym: 'K_d', name: 'Dissociation Constant', unit: 'nM' },
      { sym: 'k_{deg}', name: 'mRNA Half-life Degradation Constant', unit: 's⁻¹' }
    ],
    targetTopicId: 'gene_expression'
  },
  {
    id: 'f-ficks-law',
    name: "Fick's First Law of Membrane Permeability",
    category: 'Biology',
    domain: 'Cell Physiology',
    latex: 'J = -P \\cdot \\Delta C = -\\frac{D}{h}(C_{out} - C_{in})',
    plainEnglish: 'Diffusion Flux = Permeability × Concentration Difference',
    description: 'Determines the net rate of uncharged solute flux diffusing down its chemical gradient across a phospholipid bilayer.',
    variables: [
      { sym: 'J', name: 'Solute Flux Density', unit: 'mol/(m²·s)' },
      { sym: 'P', name: 'Membrane Permeability Coefficient', unit: 'm/s' },
      { sym: '\\Delta C', name: 'Concentration Gradient', unit: 'mol/m³' },
      { sym: 'h', name: 'Membrane Thickness', unit: 'nm' }
    ],
    targetTopicId: 'membrane_transport'
  },
  {
    id: 'f-nernst-equation',
    name: 'Nernst Equilibrium Potential',
    category: 'Biology',
    domain: 'Neurophysiology',
    latex: 'E_{ion} = \\frac{RT}{zF} \\ln \\left( \\frac{[\\text{Ion}]_{out}}{[\\text{Ion}]_{in}} \\right)',
    plainEnglish: 'Equilibrium Voltage = (Gas Constant × Temp ÷ Charge) × ln(Outside ÷ Inside)',
    description: 'Calculates the exact electrical membrane potential that balances the chemical concentration gradient for a specific ion across an axon membrane.',
    variables: [
      { sym: 'E_{ion}', name: 'Reversal Potential', unit: 'mV' },
      { sym: 'z', name: 'Ion Valence Charge (+1 for Na⁺/K⁺, +2 for Ca²⁺)', unit: 'dimensionless' },
      { sym: '[\\text{Ion}]_{out}', name: 'Extracellular Concentration', unit: 'mM' },
      { sym: '[\\text{Ion}]_{in}', name: 'Intracellular Cytoplasm Concentration', unit: 'mM' }
    ],
    targetTopicId: 'neuron'
  },
  {
    id: 'f-arrhenius-1',
    name: 'Arrhenius Chemical Reaction Rate Law',
    category: 'Chemistry',
    domain: 'Kinetics',
    latex: 'k = A \\cdot e^{-\\frac{E_a}{RT}}',
    plainEnglish: 'Rate Constant = Frequency Factor × e^(-Activation Energy / (Gas Constant × Temp))',
    description: 'Relates reaction velocity to temperature and the activation energy barrier for molecular collisions.',
    variables: [
      { sym: 'k', name: 'Reaction Rate Constant', unit: 's⁻¹ / M⁻¹s⁻¹' },
      { sym: 'A', name: 'Pre-exponential Collision Frequency', unit: 's⁻¹' },
      { sym: 'E_a', name: 'Activation Energy Barrier', unit: 'J/mol' },
      { sym: 'T', name: 'Absolute Temperature', unit: 'K' },
      { sym: 'R', name: 'Universal Gas Constant (8.314)', unit: 'J/(mol·K)' }
    ],
    targetTopicId: 'reaction_kinetics'
  },
  {
    id: 'f-vsepr-1',
    name: 'Molecular Dipole Moment Vector',
    category: 'Chemistry',
    domain: 'Molecular Structure',
    latex: '\\vec{\\mu} = \\sum_{i} q_i \\vec{r}_i = \\sum \\Delta EN_i \\cdot \\hat{u}_i',
    plainEnglish: 'Net Dipole = Vector sum of individual bond dipoles in 3D space',
    description: 'Determines whether a 3D molecule is polar or nonpolar based on geometric cancellation of bond moments.',
    variables: [
      { sym: '\\vec{\\mu}', name: 'Net Molecular Dipole Moment', unit: 'Debye (D)' },
      { sym: 'q_i', name: 'Partial Atomic Charge', unit: 'Coulombs (C)' },
      { sym: '\\vec{r}_i', name: '3D Bond Position Vector', unit: 'm' }
    ],
    targetTopicId: 'molecular_geometry'
  },
  {
    id: 'f-osmosis-1',
    name: "Van 't Hoff Law of Osmotic Pressure",
    category: 'Biology',
    domain: 'Cellular Physiology',
    latex: '\\Pi = i \\cdot M \\cdot R \\cdot T',
    plainEnglish: 'Osmotic Pressure = Van ’t Hoff factor × Molar Concentration × R × Temperature',
    description: 'Quantifies the hydrostatic pressure required to prevent net water influx across a semipermeable membrane.',
    variables: [
      { sym: '\\Pi', name: 'Osmotic Pressure', unit: 'atm' },
      { sym: 'i', name: 'Van ’t Hoff Ion Factor', unit: 'dimensionless' },
      { sym: 'M', name: 'Solute Molarity', unit: 'mol/L' },
      { sym: 'T', name: 'Absolute Temperature', unit: 'K' }
    ],
    targetTopicId: 'cellular_osmosis'
  },
  {
    id: 'f-cardiac-1',
    name: 'Cardiac Output & Hemodynamic Stroke Volume',
    category: 'Biology',
    domain: 'Cardiovascular Dynamics',
    latex: 'CO = HR \\times SV = \\frac{\\Delta P}{SVR}',
    plainEnglish: 'Cardiac Output = Heart Rate × Stroke Volume = Mean Arterial Pressure / Resistance',
    description: 'Relates ventricular pump volume to systemic blood flow and peripheral vascular resistance.',
    variables: [
      { sym: 'CO', name: 'Cardiac Output', unit: 'L/min' },
      { sym: 'HR', name: 'Heart Rate', unit: 'BPM' },
      { sym: 'SV', name: 'Ventricular Stroke Volume', unit: 'mL/beat' },
      { sym: 'SVR', name: 'Systemic Vascular Resistance', unit: 'mmHg·min/L' }
    ],
    targetTopicId: 'cardiac_hemodynamics'
  },
  {
    id: 'f-cross-prod-1',
    name: '3D Vector Cross Product & Normal Vector',
    category: 'Mathematics',
    domain: '3D Vector Algebra',
    latex: '\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ u_x & u_y & u_z \\\\ v_x & v_y & v_z \\end{vmatrix}',
    plainEnglish: 'Cross Product produces an orthogonal normal vector perpendicular to both u and v',
    description: 'Defines the normal vector to the 3D plane spanned by two non-parallel vectors.',
    variables: [
      { sym: '\\vec{u} \\times \\vec{v}', name: 'Normal Vector \\vec{n}', unit: 'vector' },
      { sym: '|\\vec{u} \\times \\vec{v}|', name: 'Parallelogram Area', unit: 'scalar' },
      { sym: '\\theta', name: 'Angle between vectors', unit: 'degrees' }
    ],
    targetTopicId: 'vector_3d_lab'
  },
  {
    id: 'f-riemann-1',
    name: 'Fundamental Limit Definition of the Definite Integral',
    category: 'Mathematics',
    domain: 'Calculus',
    latex: '\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*)\\,\\Delta x',
    plainEnglish: 'Integral = Limit of Riemann Sum as width Δx approaches zero',
    description: 'Calculates the continuous area under any curve by summing infinitesimal rectangular partitions.',
    variables: [
      { sym: '\\Delta x', name: 'Partition Width (b - a)/n', unit: 'scalar' },
      { sym: 'x_i^*', name: 'Sample Evaluation Point', unit: 'coordinate' },
      { sym: 'n', name: 'Number of Rectangles', unit: 'integer' }
    ],
    targetTopicId: 'calculus_riemann_lab'
  },
  {
    id: 'f-kepler-3',
    name: "Kepler's Third Law of Planetary Motion",
    category: 'Physics',
    domain: 'Gravitation & Astronomy',
    latex: 'T^2 = \\frac{4\\pi^2}{GM} a^3',
    plainEnglish: 'Orbital Period Squared = Constant × Semi-Major Axis Cubed',
    description: 'Relates the orbital period of any planet or satellite directly to the cube of its mean orbital radius.',
    variables: [
      { sym: 'T', name: 'Orbital Period', unit: 's (or Earth years)' },
      { sym: 'a', name: 'Semi-Major Axis', unit: 'm (or AU)' },
      { sym: 'M', name: 'Central Body Mass (Sun)', unit: 'kg' },
      { sym: 'G', name: 'Gravitational Constant', unit: 'N·m²/kg²' }
    ],
    targetTopicId: 'orbital_mechanics_3d'
  },
  {
    id: 'f-visviva-1',
    name: 'Vis-Viva Orbital Speed Equation',
    category: 'Physics',
    domain: 'Gravitation & Astronomy',
    latex: 'v = \\sqrt{GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)}',
    plainEnglish: 'Instant Speed = Sqrt(GM × (2/Distance - 1/SemiMajorAxis))',
    description: 'Calculates instantaneous velocity anywhere along an eccentric Keplerian elliptical orbit.',
    variables: [
      { sym: 'v', name: 'Orbital Velocity', unit: 'm/s (or km/s)' },
      { sym: 'r', name: 'Current Radial Distance', unit: 'm (or AU)' },
      { sym: 'a', name: 'Semi-Major Axis', unit: 'm (or AU)' }
    ],
    targetTopicId: 'orbital_mechanics_3d'
  },
  {
    id: 'f-bohr-energy',
    name: 'Hydrogenic Quantized Energy Level',
    category: 'Physics',
    domain: 'Quantum & Modern Physics',
    latex: 'E_n = -\\frac{13.6\\text{ eV}}{n^2}',
    plainEnglish: 'Energy of Level n = -13.6 eV divided by n²',
    description: 'Determines the bound electronic energy levels of hydrogen and the frequencies of emitted spectral lines.',
    variables: [
      { sym: 'E_n', name: 'Energy Level', unit: 'eV' },
      { sym: 'n', name: 'Principal Quantum Number', unit: '1, 2, 3, 4...' }
    ],
    targetTopicId: 'atomic_orbitals_3d'
  },
  {
    id: 'f-malus-1',
    name: "Malus's Law of Polarized Light Transmission",
    category: 'Physics',
    domain: 'Wave Optics',
    latex: 'I = I_0 \\cos^2(\\theta_2 - \\theta_1)',
    plainEnglish: 'Transmitted Intensity = Incident Intensity × cos²(Angle Difference)',
    description: 'Calculates light intensity emerging from a linear polarizer and tilted analyzer optical filter.',
    variables: [
      { sym: 'I', name: 'Transmitted Intensity', unit: 'W/m²' },
      { sym: 'I_0', name: 'Incident Polarized Intensity', unit: 'W/m²' },
      { sym: '\\theta_2 - \\theta_1', name: 'Relative Angle Offset', unit: 'degrees / radians' }
    ],
    targetTopicId: 'em_wave_3d'
  },
  {
    id: 'f-poynting-1',
    name: 'Poynting Energy Flux Vector',
    category: 'Physics',
    domain: 'Electrodynamics & Optics',
    latex: '\\vec{S} = \\frac{1}{\\mu_0} (\\vec{E} \\times \\vec{B})',
    plainEnglish: 'Power Flow Vector = (1 / μ₀) × (Electric Field × Magnetic Field)',
    description: 'Represents the directional energy flux density (watts per square meter) of an electromagnetic wave.',
    variables: [
      { sym: '\\vec{S}', name: 'Poynting Vector', unit: 'W/m²' },
      { sym: '\\vec{E}', name: 'Electric Field Vector', unit: 'V/m' },
      { sym: '\\vec{B}', name: 'Magnetic Field Vector', unit: 'Tesla (T)' },
      { sym: '\\mu_0', name: 'Vacuum Permeability', unit: 'H/m' }
    ],
    targetTopicId: 'em_wave_3d'
  },
  {
    id: 'f-dna-tm-1',
    name: 'DNA Thermal Melting Temperature (Marmur-Doty)',
    category: 'Biology',
    domain: 'Molecular Genetics',
    latex: 'T_m = 64.9 + 41 \\times \\frac{G+C - 16.4}{N_{\\text{bp}}}',
    plainEnglish: 'Melting Temp Tm = Base constant + Factor × (GC ratio)',
    description: 'Calculates the thermal denaturation temperature at which 50% of the DNA double helix duplex unwinds into single strands.',
    variables: [
      { sym: 'T_m', name: 'Melting Temperature', unit: '°C' },
      { sym: 'G+C', name: 'Guanine + Cytosine Count', unit: 'integer' },
      { sym: 'N_{\\text{bp}}', name: 'Total Base Pairs', unit: 'integer' }
    ],
    targetTopicId: 'dna_helix_3d'
  },
  {
    id: 'f-schwarzschild',
    name: 'Schwarzschild Radius & Event Horizon',
    category: 'Physics',
    domain: 'General Relativity & Astrophysics',
    latex: 'R_s = \\frac{2GM}{c^2}',
    plainEnglish: 'Horizon Radius = 2 × Gravity Constant × Mass ÷ Light Speed²',
    description: 'Calculates the radius of the sphere from which nothing—not even light—can escape.',
    variables: [
      { sym: 'R_s', name: 'Schwarzschild Horizon Radius', unit: 'm / km' },
      { sym: 'G', name: 'Gravitational Constant', unit: '6.674×10⁻¹¹ N·m²/kg²' },
      { sym: 'M', name: 'Black Hole Mass', unit: 'kg / M☉' },
      { sym: 'c', name: 'Speed of Light', unit: '3.0×10⁸ m/s' }
    ],
    targetTopicId: 'black_hole_relativity_3d'
  },
  {
    id: 'f-bragg-xrd',
    name: "Bragg's Law of X-Ray Diffraction",
    category: 'Chemistry',
    domain: 'Crystallography & Materials Science',
    latex: '\\lambda = 2 d_{hkl} \\sin\\theta',
    plainEnglish: 'X-Ray Wavelength = 2 × Interplanar Distance × sin(Bragg Angle)',
    description: 'Determines the constructive interference condition when incident X-rays scatter from parallel crystal lattice planes (hkl).',
    variables: [
      { sym: '\\lambda', name: 'X-Ray Wavelength', unit: 'Å / nm' },
      { sym: 'd_{hkl}', name: 'Interplanar Lattice Spacing', unit: 'Å' },
      { sym: '\\theta', name: 'Bragg Diffraction Angle', unit: 'Degrees (°)' }
    ],
    targetTopicId: 'crystallography_3d'
  },
  {
    id: 'f-nernst-neuron',
    name: 'Nernst Equation for Membrane Potential',
    category: 'Biology',
    domain: 'Neurobiology & Electrophysiology',
    latex: 'E_{ion} = \\frac{RT}{zF} \\ln \\frac{[\\text{Ion}]_{out}}{[\\text{Ion}]_{in}}',
    plainEnglish: 'Equilibrium Potential = Gas Constant × Temp ÷ (Valence × Faraday) × ln(Concentration Ratio)',
    description: 'Calculates the electrical voltage across a cell membrane that precisely balances the concentration gradient for a specific ion.',
    variables: [
      { sym: 'E_{ion}', name: 'Nernst Equilibrium Potential', unit: 'mV' },
      { sym: 'R, F', name: 'Universal Gas & Faraday Constants', unit: 'J/(mol·K), C/mol' },
      { sym: 'z', name: 'Ion Charge Valence (+1 for Na⁺/K⁺, +2 for Ca²⁺)', unit: 'integer' },
      { sym: '[\\text{Ion}]', name: 'Extracellular vs Intracellular Concentration', unit: 'mM' }
    ],
    targetTopicId: 'neuron_synapse_3d'
  },
  {
    id: 'f-quantum-double-slit',
    name: 'de Broglie Wavelength & Double-Slit Fringe Spacing',
    category: 'Physics',
    domain: 'Quantum Mechanics',
    latex: '\\lambda = \\frac{h}{p} \\quad \\bullet \\quad \\Delta y = \\frac{\\lambda L}{d}',
    plainEnglish: 'Matter Wavelength = Planck Constant ÷ Momentum; Fringe Spacing = Wavelength × Screen Distance ÷ Slit Gap',
    description: 'Connects the matter wave nature of electrons to the observable spacing between quantum interference fringes.',
    variables: [
      { sym: '\\lambda', name: 'de Broglie Matter Wavelength', unit: 'nm' },
      { sym: 'p', name: 'Particle Momentum', unit: 'kg·m/s' },
      { sym: '\\Delta y', name: 'Fringe Spacing on Screen', unit: 'mm' },
      { sym: 'd, L', name: 'Slit Gap & Screen Distance', unit: 'µm, m' }
    ],
    targetTopicId: 'quantum_double_slit_3d'
  }
];

interface FormulaBankModalProps {
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const FormulaBankModal: React.FC<FormulaBankModalProps> = ({ onClose, onSelectTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLatex = (id: string, latex: string) => {
    try {
      navigator.clipboard.writeText(latex);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const filteredFormulas = FORMULAS_DATA.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div
      className="formula-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        className="scientific-card formula-modal-window"
        style={{
          width: '100%',
          maxWidth: 980,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="formula-modal-header"
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Formula Bank &amp; Variable Index
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Rigorous KaTeX mathematical expressions with Plain English definitions, SI units, and direct simulation links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close formula modal"
            className="btn btn-secondary btn-sm"
            style={{
              width: 34,
              height: 34,
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div
          className="formula-filter-bar"
          style={{
            padding: '14px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            background: 'var(--bg-subtle)'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>


          {/* Search Input */}
          <div className="formula-search-box" style={{ position: 'relative', flex: '1', minWidth: 260, maxWidth: 420 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search by name, plain English, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Formulas Grid */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredFormulas.map((item) => {
            const isPhysics = item.category === 'Physics';
            const isBiology = item.category === 'Biology';

            return (
              <div
                key={item.id}
                className="scientific-card formula-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* 1. Header: Domain Badge, Formula Name, Simulate Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className={`badge ${isPhysics ? 'badge-physics' : isBiology ? 'badge-biology' : 'badge-math'}`}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      {item.domain}
                    </span>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {item.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectTopic(item.targetTopicId);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Try in Simulation</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* 2. Crisp KaTeX Formula Display Box with Copy LaTeX Action */}
                <div
                  className="formula-math-display"
                  style={{
                    position: 'relative',
                    padding: '18px 24px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowX: 'auto'
                  }}
                >
                  <MathView math={item.latex} block style={{ fontSize: '1.32rem', width: '100%' }} />


                  {/* Copy LaTeX Action */}
                  <button
                    onClick={() => handleCopyLatex(item.id, item.latex)}
                    title="Copy LaTeX formula code"
                    className="copy-latex-btn"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 9px',
                      borderRadius: 'var(--radius-sm)',
                      border: copiedId === item.id ? '1px solid var(--accent-success)' : '1px solid var(--border-subtle)',
                      background: copiedId === item.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                      color: copiedId === item.id ? 'var(--accent-success)' : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      zIndex: 2
                    }}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={12} color="var(--accent-success)" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>LaTeX</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Plain English Meaning Banner (Instant Understanding) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isPhysics ? 'rgba(0, 240, 255, 0.07)' : 'rgba(168, 85, 247, 0.08)',
                    border: isPhysics ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(168, 85, 247, 0.22)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: isPhysics ? 'var(--electric-blue)' : 'var(--electric-violet)'
                  }}
                >
                  <Sparkles size={15} style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Plain English: </strong>
                    {item.plainEnglish}
                  </span>
                </div>

                {/* 4. Real-World Description */}
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>

                {/* 5. Clear, Always-Visible Variable Legend */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(5, 9, 22, 0.65)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    What the letters mean:
                  </div>
                  <div
                    className="formula-variables-grid"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}
                  >
                    {item.variables.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontWeight: 800,
                            color: isPhysics ? 'var(--electric-blue)' : 'var(--electric-violet)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            minWidth: 26
                          }}
                        >
                          <MathView math={v.sym} />:
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.name}</span>
                        <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                          ({v.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormulaBankModal;
