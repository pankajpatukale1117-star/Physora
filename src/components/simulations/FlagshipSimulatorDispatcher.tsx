import React from 'react';
import { CanvasSimulator, type SimControlDef } from './CanvasSimulators';
import { ProjectileMotionLab } from '../../engine/simulations/physics/ProjectileMotionLab';
import { WaveSuperpositionLab } from '../../engine/simulations/physics/WaveSuperpositionLab';
import { MolecularVSEPRLab } from '../../engine/simulations/chemistry/MolecularVSEPRLab';
import { ReactionKineticsLab } from '../../engine/simulations/chemistry/ReactionKineticsLab';
import { CardiacHemodynamicsLab } from '../../engine/simulations/biology/CardiacHemodynamicsLab';
import { OsmosisMembraneLab } from '../../engine/simulations/biology/OsmosisMembraneLab';
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
}

export const FlagshipSimulatorDispatcher: React.FC<FlagshipSimulatorDispatcherProps> = (props) => {
  const { simId } = props;

  // 1. Physics Flagships
  if (simId === 'physics_projectile_lab') {
    return <ProjectileMotionLab />;
  }
  if (simId === 'physics_wave_lab') {
    return <WaveSuperpositionLab />;
  }

  // 2. Chemistry Flagships
  if (simId === 'chem_vsepr_lab') {
    return <MolecularVSEPRLab />;
  }
  if (simId === 'chem_kinetics_lab') {
    return <ReactionKineticsLab />;
  }

  // 3. Biology Process Flagships
  if (simId === 'bio_cardiac_lab') {
    return <CardiacHemodynamicsLab />;
  }
  if (simId === 'bio_osmosis_lab') {
    return <OsmosisMembraneLab />;
  }

  // 4. Mathematics Flagships
  if (simId === 'math_vector3d_lab') {
    return <VectorPlane3DLab />;
  }
  if (simId === 'math_calculus_lab') {
    return <CalculusRiemannLab />;
  }

  // Fallback to existing CanvasSimulators
  return <CanvasSimulator {...props} />;
};
