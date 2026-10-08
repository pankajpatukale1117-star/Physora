// ============================================================================
// PHYSORA STEM MISSIONS & CHALLENGES REGISTRY
// Interactive goal-oriented scientific puzzles with real-time target detection
// ============================================================================

export interface TopicChallenge {
  id: string;
  topicId: string;
  title: string;
  description: string;
  targetParamId: string;
  targetValue: number;
  tolerance: number; // ± allowed deviation
  unit?: string;
  hint: string;
  successMessage: string;
  badgeName: string;
  badgeIcon: string;
  initialParams?: Record<string, number>;
}

export const TOPIC_CHALLENGES: Record<string, TopicChallenge[]> = {
  // 1. 3D Orbital Mechanics
  orbital_mechanics_3d: [
    {
      id: 'orb_chal_1',
      topicId: 'orbital_mechanics_3d',
      title: 'Comet Halley High-Eccentricity Orbit',
      description: 'Recreate a high-eccentricity elliptical orbit (e ≈ 0.72) to witness Kepler\'s second law at work as the probe whips around perihelion.',
      targetParamId: 'eccentricity',
      targetValue: 0.72,
      tolerance: 0.04,
      hint: 'Adjust the Eccentricity (e) slider toward 0.72 without exceeding parabolic escape velocity (e = 1.0).',
      successMessage: 'Orbit configured! Observe the dramatic acceleration at perihelion and deceleration at aphelion.',
      badgeName: 'Keplerian Navigator',
      badgeIcon: '🚀',
      initialParams: { eccentricity: 0.1, semiMajorAxis: 8.0, timeWarp: 1.0 }
    },
    {
      id: 'orb_chal_2',
      topicId: 'orbital_mechanics_3d',
      title: 'Outer Jovian Circular Orbit',
      description: 'Stabilize an interplanetary probe into an outer circular orbit with a semi-major axis of 11.0 AU and minimal eccentricity (e ≤ 0.04).',
      targetParamId: 'semiMajorAxis',
      targetValue: 11.0,
      tolerance: 0.5,
      unit: 'AU',
      hint: 'Slide the Semi-Major Axis (a) to 11.0 AU and reduce Eccentricity to zero.',
      successMessage: 'Jovian parking orbit achieved! The orbital period extends significantly as T² ∝ a³.',
      badgeName: 'Deep Space Cartographer',
      badgeIcon: '🪐',
      initialParams: { eccentricity: 0.4, semiMajorAxis: 6.0, timeWarp: 1.0 }
    }
  ],

  // 2. 3D Quantum Atomic Orbitals
  atomic_orbitals_3d: [
    {
      id: 'atom_chal_1',
      topicId: 'atomic_orbitals_3d',
      title: 'Excited 2p Polar Nodal Lobe',
      description: 'Select quantum numbers for the 2p orbital (n=2, l=1, m=0) to expose the dumbbell-shaped probability lobes and xy-nodal plane.',
      targetParamId: 'angularL',
      targetValue: 1,
      tolerance: 0.1,
      hint: 'Keep Principal quantum number n=2 and set Azimuthal quantum number l=1.',
      successMessage: '2p orbital locked! Notice the planar node at z=0 where ψ vanishes completely.',
      badgeName: 'Quantum Physicist',
      badgeIcon: '⚛️',
      initialParams: { principalN: 1, angularL: 0, magneticM: 0 }
    },
    {
      id: 'atom_chal_2',
      topicId: 'atomic_orbitals_3d',
      title: 'Diffuse d-Orbital Excitation (3d)',
      description: 'Excite the hydrogen electron into shell n=3 with angular momentum l=2 to reveal the complex 4-lobed d-orbital cloverleaf geometry.',
      targetParamId: 'principalN',
      targetValue: 3,
      tolerance: 0.1,
      hint: 'Raise Principal n to 3 and select Azimuthal l=2.',
      successMessage: '3d state materialized! Higher angular momentum produces 2 conical/planar angular nodes.',
      badgeName: 'Schrödinger Master',
      badgeIcon: '🔮',
      initialParams: { principalN: 2, angularL: 1, magneticM: 0 }
    }
  ],

  // 3. 3D Electromagnetic Waves & Polarization
  em_wave_3d: [
    {
      id: 'em_chal_1',
      topicId: 'em_wave_3d',
      title: 'Malus\'s Law Total Extinction',
      description: 'With the input polarizer fixed at 45°, rotate the analyzer to 135° (Δθ = 90°) to completely extinguish the transmitted electromagnetic wave (I = 0%).',
      targetParamId: 'analyzerAngle',
      targetValue: 135,
      tolerance: 3,
      unit: '°',
      hint: 'Rotate the Analyzer Angle (θ₂) to 135° so the relative angle Δθ = |135° - 45°| = 90°.',
      successMessage: 'Complete Optical Extinction! Cos²(90°) = 0, proving the transverse nature of electromagnetic waves.',
      badgeName: 'Photonic Engineer',
      badgeIcon: '🔦',
      initialParams: { polarizerAngle: 45, analyzerAngle: 45, wavelength: 550 }
    },
    {
      id: 'em_chal_2',
      topicId: 'em_wave_3d',
      title: 'Violet High-Frequency Radiation',
      description: 'Shift the optical wavelength to the high-energy violet spectrum (λ = 400 nm) to observe the compressed spatial wave oscillations.',
      targetParamId: 'wavelength',
      targetValue: 400,
      tolerance: 20,
      unit: 'nm',
      hint: 'Drag the Wavelength (λ) slider down to 400 nm near the edge of visible ultraviolet.',
      successMessage: 'Violet spectrum reached! High optical frequency f = c/λ yields higher photon energy E = hf.',
      badgeName: 'Spectral Analyst',
      badgeIcon: '🌈',
      initialParams: { polarizerAngle: 45, analyzerAngle: 90, wavelength: 650 }
    }
  ],

  // 4. 3D DNA Double Helix
  dna_helix_3d: [
    {
      id: 'dna_chal_1',
      topicId: 'dna_helix_3d',
      title: 'PCR Thermal Denaturation',
      description: 'Simulate the denaturation step of a PCR reaction by heating the helix to 92°C to break the inter-strand hydrogen bonds.',
      targetParamId: 'temperature',
      targetValue: 92,
      tolerance: 3,
      unit: '°C',
      hint: 'Increase the Temperature slider toward 92°C to surpass the melting point Tm.',
      successMessage: 'Strands denatured! Thermal kinetic energy overcomes the Guanine-Cytosine and Adenine-Thymine hydrogen bonds.',
      badgeName: 'Genomic Bioengineer',
      badgeIcon: '🧬',
      initialParams: { unzip: 0.0, temperature: 37, speed: 1.0 }
    },
    {
      id: 'dna_chal_2',
      topicId: 'dna_helix_3d',
      title: 'Active Helicase Replication Fork',
      description: 'Open the replication fork by advancing Helicase unzipping to 75% (unzip = 0.75) for DNA Polymerase binding.',
      targetParamId: 'unzip',
      targetValue: 0.75,
      tolerance: 0.05,
      hint: 'Slide Helicase Unzipping to 0.75.',
      successMessage: 'Replication fork fully engaged! Antiparallel single strands exposed for complementary transcription.',
      badgeName: 'Molecular Biologist',
      badgeIcon: '🔬',
      initialParams: { unzip: 0.0, temperature: 37, speed: 1.0 }
    }
  ],

  // 5. 3D Molecular Geometry & VSEPR
  chem_vsepr_lab: [
    {
      id: 'vsepr_chal_1',
      topicId: 'chem_vsepr_lab',
      title: 'Synthesize Sulfur Hexafluoride (SF₆)',
      description: 'Configure the octahedral expanded octet structure of SF₆ (Molecule index 5) and view its perfect 90° bond angles.',
      targetParamId: 'molecule',
      targetValue: 5,
      tolerance: 0.4,
      hint: 'Set Molecule Preset to 5 (SF₆).',
      successMessage: 'Octahedral geometry assembled! Symmetrical cancellation of 6 polar S-F bonds yields zero net dipole.',
      badgeName: 'VSEPR Architect',
      badgeIcon: '🧪',
      initialParams: { molecule: 0, mode: 0, speed: 1.0 }
    },
    {
      id: 'vsepr_chal_2',
      topicId: 'chem_vsepr_lab',
      title: 'Space-Filling Van der Waals View',
      description: 'Switch the molecular rendering mode to Space-Filling (mode = 1) to inspect the true electron density envelopes.',
      targetParamId: 'mode',
      targetValue: 1,
      tolerance: 0.1,
      hint: 'Toggle View Mode to Space-Filling (mode = 1).',
      successMessage: 'Van der Waals surfaces visualized! Real molecules occupy continuous electron cloud space.',
      badgeName: 'Quantum Chemist',
      badgeIcon: '🌐',
      initialParams: { molecule: 0, mode: 0, speed: 1.0 }
    }
  ],

  // 6. 3D Vector & Plane Geometry
  math_vector3d_lab: [
    {
      id: 'vec_chal_1',
      topicId: 'math_vector3d_lab',
      title: 'Construct Orthogonal Vectors (u · v = 0)',
      description: 'With Vector u at (3, 2, 1), adjust Vector v components to find an orthogonal vector where the dot product is exactly 0.',
      targetParamId: 'vy',
      targetValue: -3,
      tolerance: 0.5,
      hint: 'Set vx = 2 and vy = -3. Since 3(2) + 2(-3) + 1(0) = 6 - 6 + 0 = 0, u and v become perpendicular!',
      successMessage: 'Orthogonality Verified! When u · v = 0, the angle between the vectors is exactly 90°.',
      badgeName: 'Vector Alchemist',
      badgeIcon: '📐',
      initialParams: { ux: 3, uy: 2, uz: 1, vx: 1, vy: 3, vz: -2 }
    },
    {
      id: 'vec_chal_2',
      topicId: 'math_vector3d_lab',
      title: 'High-Elevation Normal Vector',
      description: 'Extend the vertical Z-component of vector u to maximum (+5) to pitch the spanned 3D plane steep relative to the horizon.',
      targetParamId: 'uz',
      targetValue: 5,
      tolerance: 0.5,
      hint: 'Set Vector u (Z) to 5.',
      successMessage: 'Steep plane generated! The cross product normal vector u × v tilts horizontally to maintain perpendicularity.',
      badgeName: 'Linear Algebra Master',
      badgeIcon: '📊',
      initialParams: { ux: 3, uy: 2, uz: 1, vx: 1, vy: 3, vz: -2 }
    }
  ],

  // 7. Projectile Motion Lab
  physics_projectile_lab: [
    {
      id: 'proj_chal_1',
      topicId: 'physics_projectile_lab',
      title: 'Maximum Range 45° Trajectory',
      description: 'Set launch angle to the theoretical maximum distance angle θ = 45° in vacuum conditions.',
      targetParamId: 'angleDeg',
      targetValue: 45,
      tolerance: 1.0,
      unit: '°',
      hint: 'Adjust the launch angle to exactly 45°.',
      successMessage: 'Optimal trajectory locked! Sin(2θ) reaches its absolute maximum of 1.0 at θ = 45°.',
      badgeName: 'Ballistic Expert',
      badgeIcon: '🎯'
    }
  ],

  // 8. 3D Black Hole & General Relativity
  black_hole_relativity_3d: [
    {
      id: 'bh_chal_1',
      topicId: 'black_hole_relativity_3d',
      title: 'Near-Extremal Kerr Frame Dragging',
      description: 'Spin up the rotating black hole to a = 0.95 to drag spacetime and pull the ISCO orbit down toward the event horizon.',
      targetParamId: 'spin',
      targetValue: 0.95,
      tolerance: 0.03,
      hint: 'Slide the Kerr Spin Parameter (a) slider to 0.95.',
      successMessage: 'Near-extremal spin locked! Extreme frame dragging enables up to 42% accretion mass-energy conversion.',
      badgeName: 'Spacetime Curvature Pioneer',
      badgeIcon: '🕳️',
      initialParams: { mass: 10, spin: 0.2, accretion: 1.2, jetPower: 0.8 }
    },
    {
      id: 'bh_chal_2',
      topicId: 'black_hole_relativity_3d',
      title: 'Intermediate-Mass Black Hole Expansion',
      description: 'Increase the black hole mass to 35 M☉ to expand the Schwarzschild horizon radius Rs past 100 km.',
      targetParamId: 'mass',
      targetValue: 35,
      tolerance: 2.0,
      unit: 'M☉',
      hint: 'Raise the Black Hole Mass slider to 35 M☉.',
      successMessage: 'Horizon expanded! Rs scales linearly with mass: Rs = 2GM/c² ≈ 103 km.',
      badgeName: 'Gravitational Singularity Master',
      badgeIcon: '🌌',
      initialParams: { mass: 10, spin: 0.65, accretion: 1.2, jetPower: 0.8 }
    }
  ],

  // 9. 3D Crystallography & Miller Indices
  crystallography_3d: [
    {
      id: 'cryst_chal_1',
      topicId: 'crystallography_3d',
      title: 'Dense Close-Packed (111) Plane Cut',
      description: 'Slice the FCC unit cell along the close-packed (111) octahedral plane (h=1, k=1, l=1) where atomic density is maximized.',
      targetParamId: 'lIndex',
      targetValue: 1,
      tolerance: 0.2,
      hint: 'Ensure Miller indices h=1, k=1, and l=1 in the FCC lattice.',
      successMessage: 'Octahedral (111) plane isolated! In FCC, {111} planes have the highest planar packing density.',
      badgeName: 'Solid State Metallurgist',
      badgeIcon: '💎',
      initialParams: { latticeType: 2, hIndex: 1, kIndex: 1, lIndex: 0, atomicRadius: 0.65 }
    },
    {
      id: 'cryst_chal_2',
      topicId: 'crystallography_3d',
      title: 'Hard-Sphere Touching Radius',
      description: 'Expand the atomic sphere packing ratio to 1.0 to view atoms touching along close-packed directions.',
      targetParamId: 'atomicRadius',
      targetValue: 1.0,
      tolerance: 0.05,
      hint: 'Move the Sphere Packing Ratio slider to 1.0.',
      successMessage: 'Hard-sphere model achieved! Atoms touch along face diagonals in FCC (4r = a√2).',
      badgeName: 'Crystallographic Architect',
      badgeIcon: '🔷',
      initialParams: { latticeType: 2, hIndex: 1, kIndex: 1, lIndex: 1, atomicRadius: 0.4 }
    }
  ],

  // 10. 3D Neuron Action Potential & Synapse
  neuron_synapse_3d: [
    {
      id: 'neuron_chal_1',
      topicId: 'neuron_synapse_3d',
      title: 'Suprathreshold Action Potential Burst',
      description: 'Inject current stimulus past the 15 µA/cm² excitation threshold to 28 µA/cm² to fire a high-frequency action potential spike train.',
      targetParamId: 'stimulus',
      targetValue: 28,
      tolerance: 2.0,
      unit: 'µA/cm²',
      hint: 'Raise Stimulus Current to 28 µA/cm².',
      successMessage: 'Action potentials firing rapidly! Voltage-gated Na+ influx drives depolarization up to +40 mV.',
      badgeName: 'Neurophysiology Specialist',
      badgeIcon: '⚡',
      initialParams: { stimulus: 10, calcium: 2.0, myelin: 0.85, vesicles: 30 }
    },
    {
      id: 'neuron_chal_2',
      topicId: 'neuron_synapse_3d',
      title: 'Maximum Saltatory Conduction Velocity',
      description: 'Thicken myelin insulation to 1.0 to maximize conduction velocity (v ≈ 120 m/s) across Nodes of Ranvier.',
      targetParamId: 'myelin',
      targetValue: 1.0,
      tolerance: 0.05,
      hint: 'Slide Myelination Factor to maximum (1.0).',
      successMessage: 'Peak saltatory conduction unlocked! Saltation leaps between unmyelinated Nodes of Ranvier.',
      badgeName: 'Myelin Bioengineer',
      badgeIcon: '🧠',
      initialParams: { stimulus: 22, calcium: 2.0, myelin: 0.3, vesicles: 30 }
    }
  ],

  // 11. 3D Quantum Double-Slit & Wave Duality
  quantum_double_slit_3d: [
    {
      id: 'quant_chal_1',
      topicId: 'quantum_double_slit_3d',
      title: 'Pure Quantum Coherent Superposition',
      description: 'Turn off the Which-Way Observer completely (0%) to maintain pure quantum coherence and construct crisp wave interference fringes.',
      targetParamId: 'observerIntensity',
      targetValue: 0.0,
      tolerance: 0.05,
      hint: 'Move the Which-Way Detector slider to 0.0 (unobserved).',
      successMessage: '100% Coherence established! Each particle passes through both slits simultaneously as a wavefunction.',
      badgeName: 'Quantum Coherence Pioneer',
      badgeIcon: '🌊',
      initialParams: { wavelength: 500, slitDistance: 4.0, slitWidth: 0.8, observerIntensity: 0.8 }
    },
    {
      id: 'quant_chal_2',
      topicId: 'quantum_double_slit_3d',
      title: 'Wavefunction Collapse via Measurement',
      description: 'Engage the Which-Way Observer to 100% to measure particle trajectories at the slits and induce complete classical collapse.',
      targetParamId: 'observerIntensity',
      targetValue: 1.0,
      tolerance: 0.05,
      hint: 'Raise the Which-Way Detector slider to 1.0.',
      successMessage: 'Decoherence achieved! The quantum interference cross-term vanishes, leaving two classical particle mounds.',
      badgeName: 'Copenhagen Quantum Observer',
      badgeIcon: '👁️',
      initialParams: { wavelength: 500, slitDistance: 4.0, slitWidth: 0.8, observerIntensity: 0.0 }
    }
  ]
};

export const getTopicChallenges = (topicId: string, simId?: string): TopicChallenge[] => {
  if (TOPIC_CHALLENGES[topicId]) {
    return TOPIC_CHALLENGES[topicId];
  }
  if (simId && TOPIC_CHALLENGES[simId]) {
    return TOPIC_CHALLENGES[simId];
  }
  // Robust bidirectional aliases
  const aliases: Record<string, string> = {
    molecular_geometry: 'chem_vsepr_lab',
    vectors_3d: 'math_vector3d_lab',
    motion: 'physics_projectile_lab',
    physics_orbital_lab: 'orbital_mechanics_3d',
    physics_atomic_orbitals_lab: 'atomic_orbitals_3d',
    physics_em_wave_lab: 'em_wave_3d',
    bio_dna_helix_lab: 'dna_helix_3d',
    grav_black_hole: 'black_hole_relativity_3d',
    chem_crystallography: 'crystallography_3d',
    bio_neuron_synapse: 'neuron_synapse_3d',
    physics_quantum_slit: 'quantum_double_slit_3d'
  };
  const mappedKey = aliases[topicId] || (simId ? aliases[simId] : undefined);
  if (mappedKey && TOPIC_CHALLENGES[mappedKey]) {
    return TOPIC_CHALLENGES[mappedKey];
  }
  return [];
};
