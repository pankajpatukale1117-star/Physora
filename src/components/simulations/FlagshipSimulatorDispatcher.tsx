import React from 'react';
import { CanvasSimulator, type SimControlDef } from './CanvasSimulators';
import { ProjectileMotionLab } from '../../engine/simulations/physics/ProjectileMotionLab';
import { WaveSuperpositionLab } from '../../engine/simulations/physics/WaveSuperpositionLab';
import { OrbitalMechanics3DLab } from '../../engine/simulations/physics/OrbitalMechanics3DLab';
import { AtomicOrbitals3DLab } from '../../engine/simulations/physics/AtomicOrbitals3DLab';
import { ElectromagneticWave3DLab } from '../../engine/simulations/physics/ElectromagneticWave3DLab';
import { BlackHole3DLab } from '../../engine/simulations/physics/BlackHole3DLab';
import { DoubleSlitQuantum3DLab } from '../../engine/simulations/physics/DoubleSlitQuantum3DLab';
import { MolecularVSEPRLab } from '../../engine/simulations/chemistry/MolecularVSEPRLab';
import { ReactionKineticsLab } from '../../engine/simulations/chemistry/ReactionKineticsLab';
import { Crystallography3DLab } from '../../engine/simulations/chemistry/Crystallography3DLab';
import { CardiacHemodynamicsLab } from '../../engine/simulations/biology/CardiacHemodynamicsLab';
import { OsmosisMembraneLab } from '../../engine/simulations/biology/OsmosisMembraneLab';
import { DnaHelix3DLab } from '../../engine/simulations/biology/DnaHelix3DLab';
import { NeuronSynapse3DLab } from '../../engine/simulations/biology/NeuronSynapse3DLab';
import { VectorPlane3DLab } from '../../engine/simulations/math/VectorPlane3DLab';
import { CalculusRiemannLab } from '../../engine/simulations/math/CalculusRiemannLab';

interface FlagshipSimulatorDispatcherProps {
  simId: string;
  params: Record<string, number>;
  isPlaying: boolean;
  speed?: number;
  stepTrigger?: number;
  onTelemetryUpdate: (telemetry: Record<string, string>) => void;
  controls?: SimControlDef[];
  onParamChange?: (id: string, value: number) => void;
  onTogglePlay?: () => void;
  onReset?: () => void;
  isCompact?: boolean;
}

export const FlagshipSimulatorDispatcher: React.FC<FlagshipSimulatorDispatcherProps> = (props) => {
  const { simId } = props;

  // 1. Physics & Astronomy Flagships
  if (simId === 'physics_projectile_lab') {
    return <ProjectileMotionLab {...(props as any)} />;
  }
  if (simId === 'physics_wave_lab') {
    return <WaveSuperpositionLab {...(props as any)} />;
  }
  if (simId === 'physics_orbital_lab' || simId === 'orbital_mechanics_3d') {
    return <OrbitalMechanics3DLab {...props} />;
  }
  if (simId === 'physics_atomic_orbitals_lab' || simId === 'atomic_orbitals_3d') {
    return <AtomicOrbitals3DLab {...props} />;
  }
  if (simId === 'physics_em_wave_lab' || simId === 'em_wave_3d') {
    return <ElectromagneticWave3DLab {...props} />;
  }
  if (simId === 'black_hole_relativity_3d' || simId === 'grav_black_hole') {
    return <BlackHole3DLab {...props} />;
  }
  if (simId === 'quantum_double_slit_3d' || simId === 'physics_quantum_slit') {
    return <DoubleSlitQuantum3DLab {...props} />;
  }

  // 2. Chemistry & Materials Flagships
  if (simId === 'chem_vsepr_lab') {
    return <MolecularVSEPRLab {...props} />;
  }
  if (simId === 'chem_kinetics_lab') {
    return <ReactionKineticsLab {...(props as any)} />;
  }
  if (simId === 'crystallography_3d' || simId === 'chem_crystallography') {
    return <Crystallography3DLab {...props} />;
  }

  // 3. Biology Process Flagships
  if (simId === 'bio_cardiac_lab') {
    return <CardiacHemodynamicsLab {...(props as any)} />;
  }
  if (simId === 'bio_osmosis_lab') {
    return <OsmosisMembraneLab {...(props as any)} />;
  }
  if (simId === 'bio_dna_helix_lab' || simId === 'dna_helix_3d') {
    return <DnaHelix3DLab {...props} />;
  }
  if (simId === 'neuron_synapse_3d' || simId === 'bio_neuron_synapse') {
    return <NeuronSynapse3DLab {...props} />;
  }

  // 4. Mathematics Flagships
  if (simId === 'math_vector3d_lab') {
    return <VectorPlane3DLab {...props} />;
  }
  if (simId === 'math_calculus_lab') {
    return <CalculusRiemannLab {...(props as any)} />;
  }

  // Fallback to existing CanvasSimulators
  return <CanvasSimulator {...props} />;
};
