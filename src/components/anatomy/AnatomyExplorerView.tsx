// ============================================================================
// PHYSORA 3D HUMAN ANATOMY EXPLORER VIEW
// Interactive 3D Anatomy Laboratory Theater
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Layers,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  ZoomIn,
  Play,
  Pause,
  Info,
  Sparkles,
  ArrowLeft,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import type {
  AnatomicalSystemId,
  DetailLevel
} from '../../data/anatomyData';
import {
  ANATOMICAL_SYSTEMS,
  ANATOMY_STRUCTURES,
  ANATOMICAL_LAYER_STACK
} from '../../data/anatomyData';
import { Anatomy3DCanvas } from './Anatomy3DCanvas';
import { MultiLevelScaleModal } from './MultiLevelScaleModal';
import { AnatomySearchModal } from './AnatomySearchModal';

interface AnatomyExplorerViewProps {
  onClose: () => void;
  initialStructureId?: string | null;
}

export const AnatomyExplorerView: React.FC<AnatomyExplorerViewProps> = ({
  onClose,
  initialStructureId = null
}) => {
  // Selected Structure & Isolation
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(() => {
    if (initialStructureId && ANATOMY_STRUCTURES[initialStructureId]) {
      return initialStructureId;
    }
    return null;
  });
  const [isIsolated, setIsIsolated] = useState(false);
  const [showInternal, setShowInternal] = useState(false);

  useEffect(() => {
    if (initialStructureId && ANATOMY_STRUCTURES[initialStructureId]) {
      setSelectedStructureId(initialStructureId);
    } else {
      setSelectedStructureId(null);
    }
  }, [initialStructureId]);

  // System Visibilities & Opacities
  const [systemVisibility, setSystemVisibility] = useState<Record<AnatomicalSystemId, boolean>>({
    skeletal: true,
    muscular: true,
    cardiovascular: true,
    respiratory: true,
    digestive: true,
    nervous: true,
    urinary: true,
    endocrine: true,
    lymphatic: true
  });

  const [systemOpacity, setSystemOpacity] = useState<Record<AnatomicalSystemId, number>>({
    skeletal: 1.0,
    muscular: 0.65, // Slightly translucent by default so internal organs are visible!
    cardiovascular: 1.0,
    respiratory: 0.9,
    digestive: 0.95,
    nervous: 1.0,
    urinary: 1.0,
    endocrine: 1.0,
    lymphatic: 1.0
  });

  // Camera & View Settings
  const [presetView, setPresetView] = useState<'front' | 'back' | 'left' | 'right' | 'top' | 'reset' | null>(null);
  const [detailLevel] = useState<DetailLevel>('overview');

  // Layer Separation / Exploded View
  const [layerSeparation, setLayerSeparation] = useState(0.0);

  // Anatomical Body Morphology (Neutral Clinical Model)
  const biologicalSex: 'female' | 'male' = 'female';

  // 7-Step Interactive Anatomical Layer Stack State
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [isLayerStackExpanded, setIsLayerStackExpanded] = useState<boolean>(true);

  // Outer Anatomical Mannequin Boundary
  const [skinOpacity, setSkinOpacity] = useState(0.85); // Neutral matte alabaster mannequin by default
  const [skinMode] = useState<'natural' | 'translucent' | 'xray'>('natural');
  const [skinVisible, setSkinVisible] = useState(true);

  // First-use interaction hint state (auto-fades after interaction or 8s)
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasInteracted(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Biological Process Animation
  const [isProcessPlaying, setIsProcessPlaying] = useState(false);
  const [processSpeed, setProcessSpeed] = useState(1.0);
  const [currentProcessStageIndex, setCurrentProcessStageIndex] = useState(0);
  const [processStepTick, setProcessStepTick] = useState(0);

  // UI Panels
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // Active structure object
  const selectedStructure = selectedStructureId ? ANATOMY_STRUCTURES[selectedStructureId] : null;

  // Process stage ticker
  useEffect(() => {
    if (!isProcessPlaying || !selectedStructure?.processConfig) return;
    const interval = setInterval(() => {
      setCurrentProcessStageIndex((prev) => {
        const total = selectedStructure.processConfig?.stages.length || 1;
        return (prev + 1) % total;
      });
    }, 2800 / processSpeed);
    return () => clearInterval(interval);
  }, [isProcessPlaying, processSpeed, selectedStructure]);

  // Step biological process forward
  const handleStepForward = () => {
    setProcessStepTick((prev) => prev + 1);
    if (selectedStructure?.processConfig) {
      setCurrentProcessStageIndex((prev) => (prev + 1) % (selectedStructure.processConfig?.stages.length || 1));
    }
  };

  // Step biological process backward
  const handleStepBackward = () => {
    setProcessStepTick((prev) => prev - 1);
    if (selectedStructure?.processConfig) {
      const len = selectedStructure.processConfig?.stages.length || 1;
      setCurrentProcessStageIndex((prev) => (prev - 1 + len) % len);
    }
  };

  // Reset biological process
  const handleResetProcess = () => {
    setIsProcessPlaying(false);
    setCurrentProcessStageIndex(0);
    setProcessStepTick(0);
  };

  // Handle Isolation mode toggle
  const toggleIsolate = () => {
    setIsIsolated((prev) => !prev);
  };

  // Step through 10-layer clinical anatomical stack
  const handleSelectLayer = (index: number) => {
    const clamped = Math.max(0, Math.min(ANATOMICAL_LAYER_STACK.length - 1, index));
    setActiveLayerIndex(clamped);
    const layer = ANATOMICAL_LAYER_STACK[clamped];
    if (!layer) return;

    setSkinOpacity(layer.skinOpacity);
    setSkinVisible(layer.skinVisible);
    setLayerSeparation(layer.layerSeparation);
    setShowInternal(layer.showInternal);
    setSystemVisibility({ ...layer.systemVisibility });

    // When reaching Layer 10 (Microscopic scale), open deep-scale explorer if an organ is selected
    if (clamped === 9 && selectedStructure) {
      setIsScaleModalOpen(true);
    }
  };

  const handleNextLayer = () => {
    handleSelectLayer(activeLayerIndex + 1);
  };

  const handlePrevLayer = () => {
    handleSelectLayer(activeLayerIndex - 1);
  };

  const handleReturnToBody = () => {
    setIsIsolated(false);
    setShowInternal(false);
    setIsProcessPlaying(false);
    setSelectedStructureId(null);
    setPresetView('reset');
  };

  // Solo System helper
  const handleSoloSystem = (sysId: AnatomicalSystemId) => {
    const next: Record<AnatomicalSystemId, boolean> = {
      skeletal: false,
      muscular: false,
      cardiovascular: false,
      respiratory: false,
      digestive: false,
      nervous: false,
      urinary: false,
      endocrine: false,
      lymphatic: false
    };
    next[sysId] = true;
    setSystemVisibility(next);
  };

  const handleShowAllSystems = () => {
    setSystemVisibility({
      skeletal: true,
      muscular: true,
      cardiovascular: true,
      respiratory: true,
      digestive: true,
      nervous: true,
      urinary: true,
      endocrine: true,
      lymphatic: true
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#070B14',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* 1. TOP FLOATING CONTROL BAR */}
      <header
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          gap: 12
        }}
      >
        {/* Left: Brand, Breadcrumb & Back */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.80rem',
              fontWeight: 600,
              padding: 0
            }}
            title="Exit 3D Anatomy Lab"
          >
            <ArrowLeft size={16} />
            <span className="hide-mobile">Exit Lab</span>
          </button>

          <span style={{ opacity: 0.3 }}>|</span>

          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
            <span
              onClick={handleReturnToBody}
              style={{
                color: isIsolated ? '#94A3B8' : '#FFFFFF',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Human Body
            </span>

            {selectedStructure && (
              <>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>
                  {selectedStructure.system}
                </span>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>
                  {selectedStructure.name}
                </span>
                <button
                  type="button"
                  onClick={handleReturnToBody}
                  style={{
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38BDF8',
                    borderRadius: 12,
                    padding: '2px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: 6,
                    transition: 'all 0.15s ease'
                  }}
                  title="Return camera to full human body overview"
                >
                  Return to Body
                </button>
              </>
            )}

            {isIsolated && (
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  fontWeight: 800,
                  marginLeft: 4
                }}
              >
                ISOLATED
              </span>
            )}
          </div>
        </div>

        {/* Center: Minimal View Navigation or Contextual Structure Controls */}
        <div
          className="hide-mobile"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '4px 8px',
            borderRadius: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          {selectedStructure ? (
            /* Contextual Controls for Selected Organ */
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: selectedStructure.accentColor || '#10B981'
                }}
              >
                <span>{selectedStructure.name}</span>
              </div>

              {/* In-Place Isolate Toggle */}
              <button
                type="button"
                onClick={toggleIsolate}
                style={{
                  background: isIsolated ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                  color: isIsolated ? '#000000' : '#CBD5E1',
                  border: isIsolated ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: isIsolated ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
                title={isIsolated ? 'Show full body context' : 'Isolate organ in place'}
              >
                <Eye size={12} />
                <span>{isIsolated ? 'Isolated' : 'Isolate'}</span>
              </button>

              {/* Internal Cavity Inspection */}
              <button
                type="button"
                onClick={() => setShowInternal((prev) => !prev)}
                style={{
                  background: showInternal ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: showInternal ? '#38BDF8' : '#CBD5E1',
                  border: showInternal ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: showInternal ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
                title="Inspect internal cavities & chambers"
              >
                <span>Cavity</span>
              </button>

              {/* Microscopic Scale Detail View */}
              <button
                type="button"
                onClick={() => setIsScaleModalOpen(true)}
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
                title="Explore deeper microscopic cellular anatomy"
              >
                <Sparkles size={12} />
                <span>Deep View →</span>
              </button>

              {/* Reset to Full Body */}
              <button
                type="button"
                onClick={handleReturnToBody}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  padding: '3px 6px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
                title="Return to full body view"
              >
                <RotateCcw size={11} />
                <span>Overview</span>
              </button>
            </div>
          ) : (
            /* Clean Camera Presets in Full Body Overview */
            <>
              {(['front', 'back', 'left', 'right'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setPresetView(view)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#CBD5E1',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#CBD5E1';
                  }}
                >
                  {view}
                </button>
              ))}
              <button
                onClick={() => setPresetView('reset')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#38BDF8',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Reset Camera Orientation"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Tools & Layers Toggle */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {/* Anatomical Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: 30,
              cursor: 'pointer',
              fontSize: '0.80rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}
          >
            <Search size={15} color="#10B981" />
            <span className="hide-mobile">Search Organ</span>
            <kbd
              className="hide-mobile"
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontFamily: 'monospace'
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Layers Toggle Button */}
          <button
            onClick={() => setIsLayersPanelOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isLayersPanelOpen ? '#10B981' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: isLayersPanelOpen ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.18)',
              color: isLayersPanelOpen ? '#000000' : '#FFFFFF',
              padding: '6px 14px',
              borderRadius: 30,
              cursor: 'pointer',
              fontSize: '0.80rem',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={15} />
            <span>Systems ({Object.values(systemVisibility).filter(Boolean).length}/{Object.keys(ANATOMICAL_SYSTEMS).length})</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3D WEBGL STAGE CANVAS */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Anatomy3DCanvas
          selectedStructureId={selectedStructureId}
          onSelectStructure={(id) => {
            setSelectedStructureId(id);
            if (!id) {
              setIsIsolated(false);
              setShowInternal(false);
              setIsProcessPlaying(false);
            }
          }}
          systemVisibility={systemVisibility}
          systemOpacity={systemOpacity}
          isIsolated={isIsolated}
          showInternal={showInternal}
          layerSeparation={layerSeparation}
          isProcessPlaying={isProcessPlaying}
          processSpeed={processSpeed}
          processStepTick={processStepTick}
          detailLevel={detailLevel}
          presetView={presetView}
          onPresetViewHandled={() => setPresetView(null)}
          skinOpacity={skinOpacity}
          skinMode={skinMode}
          skinVisible={skinVisible}
          biologicalSex={biologicalSex}
        />

        {/* Dynamic Process Player Bar (Floating Bottom-Center) */}
        {selectedStructure?.hasProcessAnimation && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              padding: '8px 18px',
              borderRadius: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
              maxWidth: '92vw'
            }}
          >
            {/* Step Backward */}
            <button
              onClick={handleStepBackward}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Previous Step / Stage"
            >
              <SkipBack size={15} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsProcessPlaying((prev) => !prev)}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isProcessPlaying ? '#EF4444' : '#10B981',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={isProcessPlaying ? 'Pause Animation' : 'Start Process Animation'}
            >
              {isProcessPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </button>

            {/* Step Forward */}
            <button
              onClick={handleStepForward}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Next Step / Stage"
            >
              <SkipForward size={15} />
            </button>

            {/* Reset */}
            <button
              onClick={handleResetProcess}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Reset Animation"
            >
              <RotateCcw size={14} />
            </button>

            <div style={{ marginLeft: 4 }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{selectedStructure.processConfig?.name}</span>
                <span style={{ fontSize: '0.68rem', color: '#10B981', fontFamily: 'monospace' }}>
                  ({selectedStructure.processConfig?.defaultRate} {selectedStructure.processConfig?.rateUnit})
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>
                {selectedStructure.processConfig?.stages[currentProcessStageIndex]?.name}:{' '}
                <span style={{ color: '#CBD5E1' }}>
                  {selectedStructure.processConfig?.stages[currentProcessStageIndex]?.description}
                </span>
              </div>
            </div>

            {/* Speed pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
              {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setProcessSpeed(spd)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: processSpeed === spd ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    border: processSpeed === spd ? '1px solid #10B981' : '1px solid transparent',
                    color: processSpeed === spd ? '#34D399' : '#94A3B8',
                    fontSize: '0.68rem',
                    cursor: 'pointer'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 10-STEP CLINICAL ANATOMICAL LAYER STACK NAVIGATOR */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            zIndex: 45,
            background: 'rgba(11, 17, 32, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 16,
            padding: isLayerStackExpanded ? '12px 16px' : '8px 14px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
            maxWidth: 'calc(100vw - 40px)',
            width: isLayerStackExpanded ? 540 : 'auto',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Header & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Layers size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                    {ANATOMICAL_LAYER_STACK[activeLayerIndex]?.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                    ({ANATOMICAL_LAYER_STACK[activeLayerIndex]?.latinName})
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: 1 }}>
                  Layer {activeLayerIndex + 1} of {ANATOMICAL_LAYER_STACK.length}
                </div>
              </div>
            </div>

            {/* Stepper Buttons (Prev / Next / Expand) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <button
                type="button"
                onClick={handlePrevLayer}
                disabled={activeLayerIndex === 0}
                title="Previous Anatomical Layer"
                style={{
                  background: activeLayerIndex === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                  color: activeLayerIndex === 0 ? '#475569' : '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: activeLayerIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNextLayer}
                disabled={activeLayerIndex === ANATOMICAL_LAYER_STACK.length - 1}
                title="Next Anatomical Layer"
                style={{
                  background: activeLayerIndex === ANATOMICAL_LAYER_STACK.length - 1 ? 'rgba(255, 255, 255, 0.04)' : '#10B981',
                  color: activeLayerIndex === ANATOMICAL_LAYER_STACK.length - 1 ? '#475569' : '#000000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  cursor: activeLayerIndex === ANATOMICAL_LAYER_STACK.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsLayerStackExpanded(!isLayerStackExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isLayerStackExpanded ? 'Collapse Layer Navigator' : 'Expand Layer Navigator'}
              >
                {isLayerStackExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Expanded 10-Layer Pill Strip & Description */}
          {isLayerStackExpanded && (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.73rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                {ANATOMICAL_LAYER_STACK[activeLayerIndex]?.description}
              </p>

              {/* 10 Layer Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  overflowX: 'auto',
                  paddingBottom: 2,
                  scrollbarWidth: 'none'
                }}
              >
                {ANATOMICAL_LAYER_STACK.map((layer, idx) => {
                  const isActive = activeLayerIndex === idx;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => handleSelectLayer(idx)}
                      style={{
                        flexShrink: 0,
                        padding: '4px 8px',
                        borderRadius: 8,
                        background: isActive ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#000000' : '#CBD5E1',
                        border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.67rem',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`${layer.name} (${layer.latinName})`}
                    >
                      {idx + 1}. {layer.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ANATOMICAL LAYERS & TRANSPARENCY DRAWER (Docked Left) */}
      {isLayersPanelOpen && (
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 16,
            bottom: 24,
            width: 320,
            zIndex: 70,
            background: 'rgba(11, 17, 32, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#10B981" />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Anatomical Systems</span>
            </div>
            <button
              onClick={() => setIsLayersPanelOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              padding: '10px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              gap: 8,
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            <button
              onClick={handleShowAllSystems}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              Show All
            </button>
            <button
              onClick={() => {
                setSystemOpacity({
                  skeletal: 1.0,
                  muscular: 0.65,
                  cardiovascular: 1.0,
                  respiratory: 0.9,
                  digestive: 0.95,
                  nervous: 1.0,
                  urinary: 1.0,
                  endocrine: 1.0,
                  lymphatic: 1.0
                });
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              Reset Opacities
            </button>
          </div>

          {/* Systems List with Toggles and Opacity Sliders */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {Object.values(ANATOMICAL_SYSTEMS).map((sys) => {
              const isVisible = systemVisibility[sys.id] ?? true;
              const opacity = systemOpacity[sys.id] ?? 1.0;

              return (
                <div
                  key={sys.id}
                  style={{
                    marginBottom: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isVisible ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => {
                          setSystemVisibility((prev) => ({ ...prev, [sys.id]: !prev[sys.id] }));
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isVisible ? sys.color : '#64748B',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex'
                        }}
                      >
                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: sys.color
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: isVisible ? '#FFFFFF' : '#64748B'
                        }}
                      >
                        {sys.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSoloSystem(sys.id)}
                      style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94A3B8',
                        cursor: 'pointer'
                      }}
                    >
                      Solo
                    </button>
                  </div>

                  {/* Opacity Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', width: 44 }}>
                      Opacity:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSystemOpacity((prev) => ({ ...prev, [sys.id]: val }));
                      }}
                      style={{ flex: 1, accentColor: sys.color, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', width: 28, textAlign: 'right' }}>
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FLOATING ORGAN INFORMATION CARD / DOSSIER (Docked Right) */}
      {selectedStructure ? (
        <aside
          style={{
            position: 'absolute',
            top: 72,
            right: 16,
            bottom: 24,
            width: isInfoExpanded ? 380 : 64,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 65,
            background: 'rgba(11, 17, 32, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 16,
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: selectedStructure.accentColor || '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Info size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    margin: 0,
                    color: '#FFFFFF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {selectedStructure.name}
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  {selectedStructure.latinName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setIsInfoExpanded((prev) => !prev)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                title={isInfoExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                {isInfoExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setSelectedStructureId(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                title="Deselect organ"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
            {/* System Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  textTransform: 'uppercase'
                }}
              >
                {selectedStructure.system} system
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                {selectedStructure.category}
              </span>
            </div>

            {/* Core Action Buttons (Isolate, Internal, Animate, Multi-Level) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {/* ISOLATE MODE ACTION */}
              <button
                onClick={toggleIsolate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: isIsolated ? '#EF4444' : '#10B981',
                  color: isIsolated ? '#FFFFFF' : '#000000',
                  border: 'none',
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {isIsolated ? (
                  <>
                    <Minimize2 size={16} />
                    <span>Return to Full Body</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={16} />
                    <span>Isolate {selectedStructure.name}</span>
                  </>
                )}
              </button>

              {/* INTERNAL VIEW (When Available) */}
              {selectedStructure.hasInternalView && (
                <button
                  onClick={() => setShowInternal((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: showInternal ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: showInternal ? '#38BDF8' : '#E2E8F0',
                    border: showInternal ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: 650,
                    fontSize: '0.80rem',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={15} />
                  <span>{showInternal ? 'Hide Internal Cavities' : 'Show Internal Structures'}</span>
                </button>
              )}


              {/* BIOLOGICAL PROCESS ANIMATION TOGGLE */}
              {selectedStructure.hasProcessAnimation && (
                <button
                  onClick={() => setIsProcessPlaying((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: isProcessPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isProcessPlaying ? '#F87171' : '#E2E8F0',
                    border: isProcessPlaying ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: 650,
                    fontSize: '0.80rem',
                    cursor: 'pointer'
                  }}
                >
                  {isProcessPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isProcessPlaying ? 'Pause Biological Process' : 'Simulate Biological Process'}</span>
                </button>
              )}

              {/* MULTI-LEVEL SCALE EXPLORER */}
              <button
                onClick={() => setIsScaleModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'rgba(139, 92, 246, 0.18)',
                  color: '#C4B5FD',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  fontWeight: 650,
                  fontSize: '0.80rem',
                  cursor: 'pointer'
                }}
              >
                <ZoomIn size={15} />
                <span>Explore Deeper (Tissue → Molecule)</span>
              </button>
            </div>

            {/* Primary Function */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Primary Function
              </div>
              <p style={{ fontSize: '0.84rem', color: '#E2E8F0', lineHeight: 1.55, margin: 0 }}>
                {selectedStructure.primaryFunction}
              </p>
            </div>

            {/* Anatomical Location */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Anatomical Location
              </div>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                {selectedStructure.anatomicalLocation}
              </p>
            </div>

            {/* Educational Summary */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Educational Overview
              </div>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.55, margin: 0 }}>
                {selectedStructure.educationalSummary}
              </p>
            </div>

            {/* Sub-structures List */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Major Anatomical Structures
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedStructure.subStructures.map((sub, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '0.76rem',
                      color: '#E2E8F0',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '5px 8px',
                      borderRadius: 6,
                      borderLeft: '2px solid #10B981'
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Cavities & Cross-Sections (When available) */}
            {selectedStructure.internalStructures && selectedStructure.internalStructures.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Internal Cavities &amp; Chambers {showInternal && <span style={{ color: '#10B981', fontSize: '0.68rem', fontWeight: 600 }}>• Active Cutaway</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedStructure.internalStructures.map((intern) => {
                    const isSelectableChamber = !!ANATOMY_STRUCTURES[intern.id];
                    return (
                      <div
                        key={intern.id}
                        onClick={() => {
                          if (isSelectableChamber) {
                            setSelectedStructureId(intern.id);
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.22)',
                          cursor: isSelectableChamber ? 'pointer' : 'default',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: intern.color || '#38BDF8',
                              boxShadow: `0 0 6px ${intern.color || '#38BDF8'}`
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {intern.name}
                          </span>
                          {isSelectableChamber && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.64rem', color: '#38BDF8', textTransform: 'uppercase' }}>
                              Focus →
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                          {intern.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spatial Anatomical Relationships (Surrounding Structures) */}
            {selectedStructure.spatialRelationships && selectedStructure.spatialRelationships.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Compass size={15} color="#38BDF8" />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Spatial Anatomical Relationships
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedStructure.spatialRelationships.map((rel, idx) => {
                    const isFocusable = rel.neighborStructureId && !!ANATOMY_STRUCTURES[rel.neighborStructureId];
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'rgba(56, 189, 248, 0.06)',
                          border: '1px solid rgba(56, 189, 248, 0.20)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'rgba(56, 189, 248, 0.22)',
                                color: '#7DD3FC',
                                textTransform: 'uppercase'
                              }}
                            >
                              {rel.direction}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {rel.neighborName}
                            </span>
                          </div>
                          {isFocusable && (
                            <button
                              type="button"
                              onClick={() => {
                                if (rel.neighborStructureId) setSelectedStructureId(rel.neighborStructureId);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#38BDF8',
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: '2px 4px'
                              }}
                            >
                              Focus →
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                          {rel.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Scientific Facts */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Key Scientific Facts
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                {selectedStructure.keyFacts.map((fact, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{fact}</li>
                ))}
              </ul>
            </div>

            {/* Clinical Relevance */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', marginBottom: 4 }}>
                Clinical &amp; Medical Relevance
              </div>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
                {selectedStructure.clinicalRelevance}
              </p>
            </div>
          </div>
        </aside>
      ) : (
        /* Subtle First-Use Interaction Hint (auto-fades, non-intrusive) */
        !hasInteracted ? (
          <div
            className="hide-mobile"
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              zIndex: 50,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 30,
              padding: '8px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.76rem',
              color: '#CBD5E1',
              pointerEvents: 'auto',
              transition: 'opacity 0.4s ease'
            }}
          >
            <span>Drag to rotate · Scroll to zoom · Click any structure to inspect</span>
            <button
              onClick={() => setHasInteracted(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Dismiss hint"
            >
              <X size={13} />
            </button>
          </div>
        ) : null
      )}

      {/* 5. MULTI-LEVEL SCALE MODAL */}
      {isScaleModalOpen && selectedStructure && (
        <MultiLevelScaleModal
          structure={selectedStructure}
          onClose={() => setIsScaleModalOpen(false)}
        />
      )}

      {/* 6. ANATOMICAL SEARCH MODAL */}
      <AnatomySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStructure={(id) => {
          setSelectedStructureId(id);
          setIsIsolated(false);
        }}
      />
    </div>
  );
};
