// ============================================================================
// PHYSORA MULTI-LEVEL SCALE EXPLORER
// Progressive Navigation: BODY → SYSTEM → ORGAN → STRUCTURE → TISSUE → CELL → MOLECULE
// ============================================================================

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, ZoomIn, Layers, HelpCircle } from 'lucide-react';
import type { AnatomicalStructure, MultiLevelScaleStep } from '../../data/anatomyData';

interface MultiLevelScaleModalProps {
  structure: AnatomicalStructure;
  onClose: () => void;
}

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        backgroundColor: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: 820,
          background: '#0B1120',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
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
                Multi-Level Scale Explorer
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                From macroscopic organism down to sub-nanometer molecular engines
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
            padding: '14px 20px',
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
                    padding: '6px 12px',
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

        {/* Active Scale Level Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px 0' }}>
            {currentStep.title}
          </h3>

          <p style={{ fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.65, marginBottom: 20 }}>
            {currentStep.description}
          </p>

          {/* Key Molecular & Structural Components */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {currentStep.keyMoleculesOrStructures.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
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
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}
          >
            <HelpCircle size={18} color="#38BDF8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#38BDF8', marginBottom: 4 }}>
                Scientific Inquiry &amp; First Principles
              </div>
              <div style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                {currentStep.inquiryPrompt}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '14px 24px',
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

          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Step {activeIndex + 1} of {steps.length}
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
