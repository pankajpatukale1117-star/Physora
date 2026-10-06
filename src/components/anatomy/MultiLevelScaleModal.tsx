// ============================================================================
// PHYSORA MULTI-LEVEL SCALE EXPLORER & CELLULAR MICRO-SIMULATOR
// Progressive Navigation: BODY → SYSTEM → ORGAN → STRUCTURE → TISSUE → CELL → MOLECULE
// Interactive 60fps Cellular & Molecular Simulation Engine
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Layers,
  HelpCircle,
  Play,
  Pause,
  Activity,
  Dna,
  Split,
  Shield
} from 'lucide-react';
import type { AnatomicalStructure, MultiLevelScaleStep } from '../../data/anatomyData';

interface MultiLevelScaleModalProps {
  structure: AnatomicalStructure;
  onClose: () => void;
}

type MicroSimMode = 'membrane' | 'diffusion' | 'mitosis' | 'dna_protein';

export const MultiLevelScaleModal: React.FC<MultiLevelScaleModalProps> = ({ structure, onClose }) => {
  const steps: MultiLevelScaleStep[] = structure.multiLevelPathway || [
    {
      level: 'Body',
      title: 'Whole Human Organism',
      scientificName: 'Homo sapiens',
      description: `The whole organism coordinates systemic cellular homeostasis involving the ${structure.name} through endocrine and autonomic neural reflexes.`,
      microscopicScale: '1.75 m',
      keyMoleculesOrStructures: ['Whole Body Perfusion', 'Homeostatic Reflexes'],
      inquiryPrompt: `How does the ${structure.name} dynamically communicate with remote organ systems?`
    },
    {
      level: 'System',
      title: `${structure.category}`,
      scientificName: `Systema ${structure.system}`,
      description: structure.primaryFunction,
      microscopicScale: '50 cm',
      keyMoleculesOrStructures: structure.subStructures.slice(0, 3),
      inquiryPrompt: 'What happens to the entire system if this individual organ fails?'
    },
    {
      level: 'Organ',
      title: structure.name,
      scientificName: structure.latinName,
      description: structure.educationalSummary,
      microscopicScale: '10 cm',
      keyMoleculesOrStructures: structure.subStructures,
      inquiryPrompt: 'How does the gross macroscopic architecture facilitate its primary mechanical or chemical role?'
    },
    {
      level: 'Tissue',
      title: 'Specialized Parenchymal Tissue',
      scientificName: 'Textus functionalis',
      description: 'Densely packed, specialized functional cells connected via extracellular matrix scaffolds and capillary beds.',
      microscopicScale: '100 μm',
      keyMoleculesOrStructures: ['Extracellular Matrix', 'Microvascular Capillaries', 'Cell-Cell Junctions'],
      inquiryPrompt: 'How do structural tissue fibers provide elasticity while withstanding high shear stress?'
    },
    {
      level: 'Cell',
      title: 'Differentiated Functional Cells',
      scientificName: 'Cytus functionalis',
      description: 'Metabolically active cells featuring specialized membrane transport channels, mitochondria, and receptor complexes.',
      microscopicScale: '15 μm',
      keyMoleculesOrStructures: ['Mitochondria', 'Plasma Membrane Ion Channels', 'Endoplasmic Reticulum'],
      inquiryPrompt: 'What unique cellular organelles are enriched in this tissue to power its continuous metabolic work?'
    },
    {
      level: 'Molecule',
      title: 'Macromolecular Reaction Machinery',
      scientificName: 'Machina molecularis',
      description: 'ATP hydrolysis, protein conformational cycles, and enzyme-substrate kinetics catalyzing life-sustaining biochemical work.',
      microscopicScale: '2 nm',
      keyMoleculesOrStructures: ['ATP Hydrolysis', 'Protein Receptors', 'Covalent Bonds'],
      inquiryPrompt: 'How does atomic-level chemical binding produce macroscopic physiological movement or transport?'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const currentStep = steps[activeIndex];

  // Micro-Simulator Active State
  const [simMode, setSimMode] = useState<MicroSimMode>('membrane');
  const [isSimPlaying, setIsSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [gateOpen, setGateOpen] = useState(true);
  const [mitosisStage, setMitosisStage] = useState<'prophase' | 'metaphase' | 'anaphase' | 'telophase'>('metaphase');

  // Automatically adapt simulator mode based on scale step if user navigates
  useEffect(() => {
    if (activeIndex >= 4) {
      // Cell or Molecule
      if (simMode === 'membrane' && activeIndex === 5) {
        setSimMode('dna_protein');
      }
    }
  }, [activeIndex]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        backgroundColor: 'rgba(7, 11, 20, 0.88)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          background: '#0B1120',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.18)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ZoomIn size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>
                Multi-Level Scale &amp; Cellular Dynamics
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                From macroscopic organism down to 60fps sub-nanometer molecular engines
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scale Stepper Breadcrumb Track */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          {steps.map((s, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;

            return (
              <React.Fragment key={s.level}>
                <button
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: isActive
                      ? '1px solid #10B981'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isActive
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isCompleted
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#E2E8F0' : '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: isActive ? '#10B981' : 'rgba(255, 255, 255, 0.15)',
                      color: isActive ? '#000000' : '#CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 800
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span>{s.level}</span>
                  <span style={{ opacity: 0.6, fontSize: '0.68rem', fontFamily: 'monospace' }}>
                    ({s.microscopicScale})
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight size={14} style={{ color: 'rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Active Scale Level Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Level {activeIndex + 1} • {currentStep.level}
              </span>
              <span style={{ fontSize: '0.80rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                Spatial Scale: {currentStep.microscopicScale}
              </span>
            </div>
            <span style={{ fontSize: '0.80rem', color: '#CBD5E1', fontStyle: 'italic' }}>
              {currentStep.scientificName}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0' }}>
            {currentStep.title}
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.6, marginBottom: 16 }}>
            {currentStep.description}
          </p>

          {/* ================================================================ */}
          {/* INTERACTIVE CELLULAR & MOLECULAR MICRO-SIMULATOR CANVAS */}
          {/* ================================================================ */}
          <div
            style={{
              background: '#070B14',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '14px',
              marginBottom: 18,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Simulator Mode Tabs & Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[
                  { id: 'membrane', label: 'Cell Membrane', icon: Shield },
                  { id: 'diffusion', label: 'Diffusion & Osmosis', icon: Activity },
                  { id: 'mitosis', label: 'Mitosis Stages', icon: Split },
                  { id: 'dna_protein', label: 'DNA & Protein Synthesis', icon: Dna }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = simMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSimMode(tab.id as MicroSimMode)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 9px',
                        borderRadius: 16,
                        border: isSelected ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#34D399' : '#94A3B8',
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={12} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Play/Pause & Speed Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setIsSimPlaying((prev) => !prev)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isSimPlaying ? '#EF4444' : '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title={isSimPlaying ? 'Pause Simulation' : 'Start Simulation'}
                >
                  {isSimPlaying ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 1 }} />}
                </button>

                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: simSpeed === spd ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      border: simSpeed === spd ? '1px solid #10B981' : '1px solid transparent',
                      color: simSpeed === spd ? '#34D399' : '#94A3B8',
                      fontSize: '0.68rem',
                      cursor: 'pointer'
                    }}
                  >
                    {spd}x
                  </button>
                ))}

                {simMode === 'membrane' && (
                  <button
                    onClick={() => setGateOpen((prev) => !prev)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: gateOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: gateOpen ? '1px solid #38BDF8' : '1px solid #EF4444',
                      color: gateOpen ? '#38BDF8' : '#F87171',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Gate: {gateOpen ? 'OPEN' : 'CLOSED'}
                  </button>
                )}

                {simMode === 'mitosis' && (
                  <select
                    value={mitosisStage}
                    onChange={(e) => setMitosisStage(e.target.value as any)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#E2E8F0',
                      fontSize: '0.70rem',
                      borderRadius: 6,
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="prophase">Prophase</option>
                    <option value="metaphase">Metaphase</option>
                    <option value="anaphase">Anaphase</option>
                    <option value="telophase">Telophase</option>
                  </select>
                )}
              </div>
            </div>

            {/* Live 60fps Canvas Simulator */}
            <div style={{ position: 'relative', width: '100%', height: 210, borderRadius: 8, overflow: 'hidden' }}>
              <MicroSimulatorCanvas
                mode={simMode}
                isPlaying={isSimPlaying}
                speed={simSpeed}
                gateOpen={gateOpen}
                mitosisStage={mitosisStage}
              />
            </div>

            {/* Scientific Explanation Footer */}
            <div
              style={{
                marginTop: 10,
                fontSize: '0.74rem',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>
                {simMode === 'membrane' &&
                  'Fluid Mosaic Model: Phospholipid bilayer oscillating with thermal kinetic energy. Integral aquaporin channel selectively gating ion and water flux.'}
                {simMode === 'diffusion' &&
                  "Fick's Law of Diffusion: Semi-permeable barrier. Water molecules exhibit net osmotic flow down water potential gradient toward high solute compartment."}
                {simMode === 'mitosis' &&
                  'Mitotic Spindle Dynamics: Microtubules originating from centrosomes attach to kinetochores, physically segregating replicated sister chromatids.'}
                {simMode === 'dna_protein' &&
                  'Central Dogma: DNA Helicase unwinding template strands → RNA Polymerase transcription → Ribosomal translation of codons into polypeptide chains.'}
              </span>
            </div>
          </div>

          {/* Key Molecular & Structural Components */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Layers size={14} color="#10B981" />
              <span>Key Molecular &amp; Structural Components</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {currentStep.keyMoleculesOrStructures.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Pedagogical Scientific Inquiry Prompt */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}
          >
            <HelpCircle size={18} color="#38BDF8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.80rem', color: '#38BDF8', marginBottom: 2 }}>
                Scientific Inquiry &amp; First Principles
              </div>
              <div style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                {currentStep.inquiryPrompt}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <button
            onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
            disabled={activeIndex === 0}
            className="btn btn-secondary btn-sm"
            style={{ opacity: activeIndex === 0 ? 0.4 : 1, gap: 6 }}
          >
            <ChevronLeft size={16} />
            <span>Zoom Out (Larger Scale)</span>
          </button>

          <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
            Scale Step {activeIndex + 1} of {steps.length}
          </span>

          <button
            onClick={() => setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1))}
            disabled={activeIndex === steps.length - 1}
            className="btn btn-primary btn-sm"
            style={{
              opacity: activeIndex === steps.length - 1 ? 0.4 : 1,
              background: '#10B981',
              borderColor: '#10B981',
              color: '#000000',
              fontWeight: 700,
              gap: 6
            }}
          >
            <span>Zoom In (Micro Scale)</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MICRO-SIMULATOR HTML5 60FPS CANVAS ENGINE
// ============================================================================
interface MicroSimulatorCanvasProps {
  mode: MicroSimMode;
  isPlaying: boolean;
  speed: number;
  gateOpen: boolean;
  mitosisStage: 'prophase' | 'metaphase' | 'anaphase' | 'telophase';
}

interface SimParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  type: 'ion' | 'water' | 'solute';
}

const MicroSimulatorCanvas: React.FC<MicroSimulatorCanvasProps> = ({
  mode,
  isPlaying,
  speed,
  gateOpen,
  mitosisStage
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SimParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize particles when mode changes
  useEffect(() => {
    const particles: SimParticle[] = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      if (mode === 'membrane') {
        // Ions on extracellular (top) and intracellular (bottom)
        const isTop = Math.random() > 0.4;
        particles.push({
          x: Math.random() * 600,
          y: isTop ? 20 + Math.random() * 60 : 130 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: isTop ? '#38BDF8' : '#10B981',
          radius: 3.5,
          type: 'ion'
        });
      } else if (mode === 'diffusion') {
        // High solute on left, water on right
        const isSolute = Math.random() > 0.65;
        particles.push({
          x: isSolute ? Math.random() * 260 : Math.random() * 580,
          y: 20 + Math.random() * 160,
          vx: (Math.random() - 0.5) * (isSolute ? 0.8 : 2.0),
          vy: (Math.random() - 0.5) * (isSolute ? 0.8 : 2.0),
          color: isSolute ? '#F59E0B' : '#06B6D4',
          radius: isSolute ? 6.0 : 2.8,
          type: isSolute ? 'solute' : 'water'
        });
      }
    }
    particlesRef.current = particles;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      if (isPlaying) {
        time += 0.025 * speed;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#050811');
      bgGrad.addColorStop(1, '#0A101D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (mode === 'membrane') {
        renderMembraneMode(ctx, w, h, time, particlesRef.current, isPlaying, speed, gateOpen);
      } else if (mode === 'diffusion') {
        renderDiffusionMode(ctx, w, h, time, particlesRef.current, isPlaying, speed);
      } else if (mode === 'mitosis') {
        renderMitosisMode(ctx, w, h, time, mitosisStage);
      } else if (mode === 'dna_protein') {
        renderDnaProteinMode(ctx, w, h, time);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, isPlaying, speed, gateOpen, mitosisStage]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={210}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

// ----------------------------------------------------------------------------
// 1. FLUID MOSAIC MEMBRANE RENDERER
// ----------------------------------------------------------------------------
function renderMembraneMode(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  particles: SimParticle[],
  isPlaying: boolean,
  speed: number,
  gateOpen: boolean
) {
  const membraneY = h * 0.5;
  const channelX = w * 0.5;
  const channelWidth = 44;

  // Render Extracellular & Intracellular Labels
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.fillText('EXTRACELLULAR FLUID [Na+ / Ca2+ High]', 16, 22);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
  ctx.fillText('INTRACELLULAR CYTOSOL [K+ High]', 16, h - 14);

  // Phospholipid Monolayer 1 (Top Heads)
  const lipidCount = Math.floor(w / 14);
  for (let i = 0; i < lipidCount; i++) {
    const x = i * 14 + 7;
    // Skip channel area
    if (Math.abs(x - channelX) < channelWidth * 0.6) continue;

    const wave = Math.sin(time * 2 + i * 0.4) * 2.5;

    // Top Monolayer Head
    ctx.beginPath();
    ctx.arc(x, membraneY - 24 + wave, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();

    // Hydrophobic Tails
    ctx.beginPath();
    ctx.moveTo(x - 2, membraneY - 19 + wave);
    ctx.quadraticCurveTo(x - 4, membraneY - 8 + wave, x - 1, membraneY - 2 + wave);
    ctx.moveTo(x + 2, membraneY - 19 + wave);
    ctx.quadraticCurveTo(x + 4, membraneY - 8 + wave, x + 1, membraneY - 2 + wave);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bottom Monolayer Head
    ctx.beginPath();
    ctx.arc(x, membraneY + 24 - wave, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#EC4899';
    ctx.fill();

    // Bottom Hydrophobic Tails
    ctx.beginPath();
    ctx.moveTo(x - 2, membraneY + 19 - wave);
    ctx.quadraticCurveTo(x - 4, membraneY + 8 - wave, x - 1, membraneY + 2 - wave);
    ctx.moveTo(x + 2, membraneY + 19 - wave);
    ctx.quadraticCurveTo(x + 4, membraneY + 8 - wave, x + 1, membraneY + 2 - wave);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Integral Transmembrane Protein Channel
  ctx.save();
  ctx.fillStyle = gateOpen ? 'rgba(139, 92, 246, 0.85)' : 'rgba(239, 68, 68, 0.85)';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;

  // Left protein subunit
  ctx.beginPath();
  ctx.roundRect(channelX - channelWidth * 0.5, membraneY - 34, 14, 68, 6);
  ctx.fill();
  ctx.stroke();

  // Right protein subunit
  ctx.beginPath();
  ctx.roundRect(channelX + channelWidth * 0.5 - 14, membraneY - 34, 14, 68, 6);
  ctx.fill();
  ctx.stroke();

  // Gate valve
  if (!gateOpen) {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(channelX - channelWidth * 0.5 + 10, membraneY - 6, channelWidth - 20, 12);
  } else {
    // Channel opening glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(channelX - channelWidth * 0.5 + 14, membraneY - 30, channelWidth - 28, 60);
  }
  ctx.restore();

  // Update & Draw Ion Particles
  particles.forEach((p) => {
    if (isPlaying) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      // Bounce horizontally
      if (p.x < 10 || p.x > w - 10) p.vx *= -1;

      // Membrane collision logic
      const inChannelX = Math.abs(p.x - channelX) < channelWidth * 0.4;
      if (inChannelX && gateOpen) {
        // Channel conduction: allows passing through
      } else {
        // Repelled by hydrophobic core
        if (p.y > membraneY - 26 && p.y < membraneY + 26) {
          p.vy *= -1;
          p.y += p.vy * 2;
        }
      }

      // Top / bottom window bounds
      if (p.y < 12) { p.y = 12; p.vy = Math.abs(p.vy); }
      if (p.y > h - 12) { p.y = h - 12; p.vy = -Math.abs(p.vy); }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

// ----------------------------------------------------------------------------
// 2. DIFFUSION & OSMOSIS RENDERER
// ----------------------------------------------------------------------------
function renderDiffusionMode(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  _time: number,
  particles: SimParticle[],
  isPlaying: boolean,
  speed: number
) {
  const barrierX = w * 0.5;

  // Semi-permeable membrane in center with pores
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]); // Pores!
  ctx.beginPath();
  ctx.moveTo(barrierX, 10);
  ctx.lineTo(barrierX, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  ctx.font = '10px monospace';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('HYPERTONIC (High Solute)', 20, 24);
  ctx.fillStyle = '#06B6D4';
  ctx.fillText('HYPOTONIC (Pure Water)', barrierX + 20, 24);

  // Particles
  particles.forEach((p) => {
    if (isPlaying) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx); }
      if (p.x > w - 10) { p.x = w - 10; p.vx = -Math.abs(p.vx); }
      if (p.y < 28) { p.y = 28; p.vy = Math.abs(p.vy); }
      if (p.y > h - 10) { p.y = h - 10; p.vy = -Math.abs(p.vy); }

      // Solute particles are too large to pass through membrane pores!
      if (p.type === 'solute') {
        if (p.x > barrierX - 8) {
          p.x = barrierX - 8;
          p.vx = -Math.abs(p.vx);
        }
      } else {
        // Water passes through pores! Slight net bias towards solute side (osmosis)
        p.vx -= 0.015 * speed; // Osmotic pressure drift
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.type === 'solute' ? 8 : 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

// ----------------------------------------------------------------------------
// 3. MITOSIS CHROMOSOME SEGREGATION RENDERER
// ----------------------------------------------------------------------------
function renderMitosisMode(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  stage: 'prophase' | 'metaphase' | 'anaphase' | 'telophase'
) {
  const cx = w * 0.5;
  const cy = h * 0.5;

  ctx.font = '11px monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText(`MITOSIS PHASE: ${stage.toUpperCase()}`, 20, 22);

  // Cell Envelope
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2.5;

  if (stage === 'telophase') {
    // Cleavage Furrow pinching into 2 daughter cells
    ctx.beginPath();
    ctx.ellipse(cx - 100, cy, 90, 80, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 100, cy, 90, 80, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 220, 85, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Centrosomes at opposite poles
  const leftPole = { x: cx - 180, y: cy };
  const rightPole = { x: cx + 180, y: cy };

  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(leftPole.x, leftPole.y, 6, 0, Math.PI * 2);
  ctx.arc(rightPole.x, rightPole.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Spindle Microtubule Fibers
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
  ctx.lineWidth = 1;

  const chromosomeOffsets = [-40, -15, 15, 40];

  chromosomeOffsets.forEach((yOff) => {
    let chromoLeftX = cx;
    let chromoRightX = cx;

    if (stage === 'prophase') {
      chromoLeftX = cx + Math.sin(time + yOff) * 20;
      chromoRightX = chromoLeftX;
    } else if (stage === 'metaphase') {
      chromoLeftX = cx;
      chromoRightX = cx;
    } else if (stage === 'anaphase' || stage === 'telophase') {
      const sep = stage === 'anaphase' ? 75 : 120;
      chromoLeftX = cx - sep;
      chromoRightX = cx + sep;
    }

    // Spindle lines from poles to chromosomes
    ctx.beginPath();
    ctx.moveTo(leftPole.x, leftPole.y);
    ctx.lineTo(chromoLeftX, cy + yOff);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightPole.x, rightPole.y);
    ctx.lineTo(chromoRightX, cy + yOff);
    ctx.stroke();

    // Draw Chromosomes (Sister Chromatids)
    ctx.fillStyle = '#EC4899';
    ctx.shadowColor = '#EC4899';
    ctx.shadowBlur = 6;

    if (stage === 'anaphase' || stage === 'telophase') {
      // V-shaped chromatids migrating toward poles
      ctx.fillRect(chromoLeftX - 4, cy + yOff - 6, 8, 12);
      ctx.fillRect(chromoRightX - 4, cy + yOff - 6, 8, 12);
    } else {
      // X-shaped sister chromatids aligned at metaphase plate
      ctx.fillRect(chromoLeftX - 6, cy + yOff - 6, 12, 12);
    }
    ctx.shadowBlur = 0;
  });

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 4. DNA REPLICATION & PROTEIN SYNTHESIS RENDERER
// ----------------------------------------------------------------------------
function renderDnaProteinMode(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const cy = h * 0.45;

  ctx.font = '11px monospace';
  ctx.fillStyle = '#C4B5FD';
  ctx.fillText('CENTRAL DOGMA: DNA UNWINDING → mRNA TRANSCRIPTION → RIBOSOME TRANSLATION', 20, 22);

  // Unwinding DNA Double Helix & Fork
  const baseCount = 28;
  const bases = ['A', 'T', 'C', 'G'];
  const baseColors: Record<string, string> = {
    A: '#EF4444',
    T: '#3B82F6',
    C: '#10B981',
    G: '#F59E0B'
  };

  for (let i = 0; i < baseCount; i++) {
    const x = 40 + i * 22;
    const isUnwound = x > w * 0.45;

    const angle = time * 2 + i * 0.45;
    const yTop = cy - Math.cos(angle) * (isUnwound ? 40 : 22);
    const yBot = cy + Math.cos(angle) * (isUnwound ? 40 : 22);

    // Hydrogen bonding rungs
    if (!isUnwound) {
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yBot);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Top Strand Base
    const topBase = bases[i % 4];
    ctx.beginPath();
    ctx.arc(x, yTop, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = baseColors[topBase];
    ctx.fill();

    // Bottom Complementary Base
    const botBase = topBase === 'A' ? 'T' : topBase === 'T' ? 'A' : topBase === 'C' ? 'G' : 'C';
    ctx.beginPath();
    ctx.arc(x, yBot, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = baseColors[botBase];
    ctx.fill();
  }

  // RNA Polymerase synthesizing single-stranded mRNA (Red/Yellow transcript)
  const polyX = w * 0.52;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(polyX - 25, cy - 20, 50, 40, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('RNA Pol II', polyX - 22, cy + 4);

  // mRNA Transcript emerging
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(polyX, cy + 18);
  ctx.quadraticCurveTo(polyX + 40, cy + 60, polyX + 90, cy + 50);
  ctx.stroke();

  // Ribosome Unit (Translation into polypeptide chain)
  const riboX = polyX + 95;
  const riboY = cy + 48;

  // Large & small ribosomal subunits
  ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
  ctx.beginPath();
  ctx.arc(riboX, riboY - 8, 16, 0, Math.PI * 2);
  ctx.arc(riboX, riboY + 10, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '8px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Ribosome', riboX - 18, riboY);

  // Growing Peptide Chain of Amino Acids
  const peptideCount = 5;
  for (let p = 0; p < peptideCount; p++) {
    const px = riboX + 22 + p * 12;
    const py = riboY - 14 - p * 4;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = ['#EC4899', '#38BDF8', '#10B981', '#F59E0B', '#8B5CF6'][p % 5];
    ctx.fill();
  }
}
