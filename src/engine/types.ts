/**
 * Physora Universal Simulation Engine Types
 *
 * Designed for scientific rigor, modularity, and real-time responsiveness.
 * Follows the paradigm: INPUT -> MODEL -> REAL-TIME CHANGE -> VISUAL RESPONSE -> MEASUREMENT -> RESULT
 */

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'maths';

export interface UnitDefinition {
  symbol: string;
  name: string;
  dimension?: string;
}

export interface SimVariableDef {
  id: string;
  label: string;
  symbol?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  description?: string;
}

export interface TelemetryField {
  key: string;
  label: string;
  unit?: string;
  symbol?: string;
  decimals?: number;
}

export interface GraphDataPoint {
  t: number;
  [key: string]: number;
}

export interface GraphChannelDef {
  key: string;
  label: string;
  color: string;
  unit?: string;
  min?: number;
  max?: number;
}

export interface SimulationEngineState {
  time: number;
  dt: number;
  isPlaying: boolean;
  speed: number;
  stepTrigger: number;
  params: Record<string, number>;
  telemetry: Record<string, number | string>;
  isRecording?: boolean;
}

export interface ActiveInstruments {
  ruler: boolean;
  protractor: boolean;
  stopwatch: boolean;
  forceMeter: boolean;
  multimeter: boolean;
  phMeter: boolean;
  liveGraph: boolean;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}
