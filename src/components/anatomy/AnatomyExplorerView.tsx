import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Layers,
  Heart,
  Activity,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Focus,
  Eye,
  EyeOff,
  Pause,
  RotateCw,
  Info
} from 'lucide-react';
import {
  SYSTEMS,
  EDITIONS,
  edition,
  defaultVisible,
  explanation,
  type Sex,
  type SystemId,
  type Atlas,
  type Concept,
  type Part,
  type View,
  type SceneState
} from './atlas/anatomy';
import { RealAnatomyScene } from './atlas/RealAnatomyScene';
import { MultiLevelScaleModal } from './MultiLevelScaleModal';
import { AnatomyQuizEngine } from './AnatomyQuizEngine';
import { ANATOMY_STRUCTURES } from '../../data/anatomyData';

export interface AnatomyExplorerViewProps {
  onClose: () => void;
  initialStructureId?: string | null;
}

type MainMode = 'explore' | 'learn';
type DockTab = 'regions' | 'systems' | 'layers';

const ATLAS_CACHE: Record<Sex, Atlas | null> = {
  male: null,
  female: null
};

export const AnatomyExplorerView: React.FC<AnatomyExplorerViewProps> = ({
  onClose,
  initialStructureId = null
}) => {
  // Mode & Sex State
  const [mode, setMode] = useState<MainMode>('explore');
  const [sex, setSex] = useState<Sex>('male');
  const [atlas, setAtlas] = useState<Atlas | null>(() => ATLAS_CACHE.male);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Scene State
  const [explode, setExplode] = useState<number>(0.0);
  const [visibleSystems, setVisibleSystems] = useState<SystemId[]>(() => defaultVisible('male'));
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [isIsolated, setIsIsolated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<View>('front');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'all' | 'skeleton' | 'muscles' | 'organs' | 'reproductive' | 'surface' | null>(null);
  const [cameraResetCounter, setCameraResetCounter] = useState<number>(0);
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out' | null>(null);

  // UI Panels & Modals
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('systems');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [skinOpacity, setSkinOpacity] = useState<number>(0.85);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [visiblePiecesCount, setVisiblePiecesCount] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentEdition = useMemo(() => edition(sex), [sex]);

  // Keyboard shortcut '/' for instant search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (selectedPartIds.length > 0) {
          setSelectedPartIds([]);
          setIsIsolated(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, selectedPartIds]);

  // Load Atlas JSON manifest when Sex changes
  useEffect(() => {
    let cancelled = false;
    setErrorMessage(null);

    if (ATLAS_CACHE[sex]) {
      setAtlas(ATLAS_CACHE[sex]);
      setVisibleSystems(defaultVisible(sex));
      setSelectedPartIds([]);
      setIsIsolated(false);
      setExplode(0);
      setLoadingProgress(100);
      return;
    }

    setLoadingProgress(15);
    const targetManifest = currentEdition.manifest;

    fetch(targetManifest)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${currentEdition.label} atlas manifest.`);
        return res.json();
      })
      .then((data: Atlas) => {
        if (cancelled) return;
        ATLAS_CACHE[sex] = data;
        setAtlas(data);
        setVisibleSystems(defaultVisible(sex));
        setSelectedPartIds([]);
        setIsIsolated(false);
        setExplode(0);
        setLoadingProgress(100);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load anatomical model.');
      });

    return () => {
      cancelled = true;
    };
  }, [sex, currentEdition]);

  // Compute piece count per system in the active atlas
  const systemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!atlas) return counts;
    atlas.parts.forEach((p) => {
      counts[p.system] = (counts[p.system] || 0) + 1;
    });
    return counts;
  }, [atlas]);

  // Find the selected concept or part
  const selectedDetails = useMemo(() => {
    if (!atlas || selectedPartIds.length === 0) return null;

    // Check if the selection matches a named Concept
    const matchingConcept = atlas.concepts.find(
      (c) => c.elements.length === selectedPartIds.length && c.elements.every((id) => selectedPartIds.includes(id))
    );

    // Get the representative primary part
    const firstPart = atlas.parts.find((p) => p.id === selectedPartIds[0]);
    if (!firstPart) return null;

    const parts = atlas.parts.filter((p) => selectedPartIds.includes(p.id));
    const titleName = matchingConcept ? matchingConcept.name : firstPart.name;
    const system = SYSTEMS.find((s) => s.id === firstPart.system);
    const clinicalText = explanation(titleName, firstPart.system, sex, 'en');

    return {
      title: titleName,
      latinOrConcept: matchingConcept ? matchingConcept.id : firstPart.conceptId || firstPart.id,
      system,
      clinicalText,
      parts,
      primaryPart: firstPart
    };
  }, [atlas, selectedPartIds, sex]);

  // Initial Structure Selection on Load
  useEffect(() => {
    if (!atlas || !initialStructureId) return;
    const q = initialStructureId.toLowerCase();
    const matchConcept = atlas.concepts.find((c) => c.name.toLowerCase().includes(q));
    if (matchConcept) {
      setSelectedPartIds(matchConcept.elements);
      return;
    }
    const matchPart = atlas.parts.find((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q);
    if (matchPart) {
      setSelectedPartIds([matchPart.id]);
    }
  }, [atlas, initialStructureId]);

  // Search filter across Concepts and Parts
  const searchResults = useMemo(() => {
    if (!atlas || !searchQuery.trim()) return { concepts: [] as Concept[], parts: [] as Part[] };
    const q = searchQuery.toLowerCase().trim();

    const matchedConcepts = atlas.concepts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );

    const matchedParts = atlas.parts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );

    return {
      concepts: matchedConcepts.slice(0, 40),
      parts: matchedParts.slice(0, 40)
    };
  }, [atlas, searchQuery]);

  // Handle direct selection of a concept from search
  const handleSelectConcept = (concept: Concept) => {
    setSelectedPartIds(concept.elements);
    // Ensure the system of these elements is visible
    if (atlas) {
      const relatedPart = atlas.parts.find((p) => concept.elements.includes(p.id));
      if (relatedPart && !visibleSystems.includes(relatedPart.system)) {
        setVisibleSystems((prev) => [...prev, relatedPart.system]);
      }
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle direct selection of a part from canvas or search
  const handleSelectPart = (partId: string) => {
    if (!atlas) return;
    const clickedPart = atlas.parts.find((p) => p.id === partId);
    if (!clickedPart) return;

    // Check if part belongs to a small multi-element concept (e.g. valve, muscle head)
    const parentConcept = atlas.concepts.find(
      (c) => c.id === clickedPart.conceptId && c.elements.length <= 12
    );

    if (parentConcept && parentConcept.elements.length > 1) {
      setSelectedPartIds(parentConcept.elements);
    } else {
      setSelectedPartIds([partId]);
    }

    if (!visibleSystems.includes(clickedPart.system)) {
      setVisibleSystems((prev) => [...prev, clickedPart.system]);
    }
  };

  // Toggle single system visibility with linked donor/borrowed systems
  const toggleSystem = (sysId: SystemId) => {
    setVisibleSystems((prev) => {
      const isCurrentlyVisible = prev.includes(sysId);
      let next = isCurrentlyVisible ? prev.filter((id) => id !== sysId) : [...prev, sysId];
      if (sysId === 'skeletal') {
        next = isCurrentlyVisible ? next.filter((id) => id !== ('borrowed' as SystemId)) : [...next, 'borrowed' as SystemId];
      }
      if (sysId === 'muscular') {
        next = isCurrentlyVisible ? next.filter((id) => id !== ('donor-muscle' as SystemId)) : [...next, 'donor-muscle' as SystemId];
      }
      return Array.from(new Set(next)) as SystemId[];
    });
  };

  // Quick View Presets: Organs, Skeleton, Muscles, Reproductive, Surface, All
  const applyQuickView = (preset: 'all' | 'skeleton' | 'muscles' | 'organs' | 'reproductive' | 'surface') => {
    setIsIsolated(false);
    setSelectedPartIds([]);
    setActivePreset(preset);
    setCameraResetCounter((c) => c + 1);
    if (preset === 'all') {
      setVisibleSystems(defaultVisible(sex));
    } else if (preset === 'skeleton') {
      setVisibleSystems(['skeletal', 'borrowed' as SystemId]);
    } else if (preset === 'muscles') {
      setVisibleSystems(['muscular', 'donor-muscle' as SystemId]);
    } else if (preset === 'reproductive') {
      setVisibleSystems(['reproductive', 'pregnancy' as SystemId, 'urinary']);
    } else if (preset === 'surface') {
      setVisibleSystems(['integumentary']);
    } else if (preset === 'organs') {
      setVisibleSystems([
        'cardiac',
        'respiratory',
        'digestive',
        'urinary',
        'endocrine',
        'brain',
        'sensory',
        'reproductive'
      ]);
    }
  };

  // Assemble / Reset Action
  const handleReset = () => {
    setActivePreset(null);
    setExplode(0);
    setIsIsolated(false);
    setSelectedPartIds([]);
    setActiveView('front');
    setIsAutoRotating(false);
    setCameraResetCounter((c) => c + 1);
  };

  // Construct SceneState object for Three.js engine
  const sceneState: SceneState = useMemo(() => {
    return {
      explode,
      visible: visibleSystems,
      selected: selectedPartIds,
      isolate: isIsolated,
      view: activeView,
      rotate: isAutoRotating,
      reset: cameraResetCounter,
      inspectorOpen: selectedPartIds.length > 0,
      skinOpacity,
      activePreset
    };
  }, [
    explode,
    visibleSystems,
    selectedPartIds,
    isIsolated,
    activeView,
    isAutoRotating,
    cameraResetCounter,
    skinOpacity,
    activePreset
  ]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#080D1A',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP HEADER NAVIGATION BAR */}
      {/* -------------------------------------------------------------------- */}
      <header
        style={{
          height: 60,
          background: 'rgba(8, 13, 26, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 30
        }}
      >
        {/* Left: Close & App Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit 3D Anatomy"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                  Physora 3D Human Anatomy
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {sex === 'male' ? 'BodyParts3D • 2,234 Meshes' : 'HRA v1.10 • 1,225 Meshes'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8' }}>
                {sex === 'male'
                  ? 'Adult male whole-body reference with MRI & anatomical segmentation'
                  : 'Adult female reference assembly with female reproductive anatomy & donor muscles'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real Male / Female Model Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 10,
            padding: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {EDITIONS.map((ed) => {
            const isCurrent = sex === ed.sex;
            return (
              <button
                key={ed.sex}
                type="button"
                onClick={() => setSex(ed.sex)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  background: isCurrent ? '#10B981' : 'transparent',
                  color: isCurrent ? '#000000' : '#CBD5E1',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
                title={ed.summary}
              >
                <span>{ed.label}</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    opacity: isCurrent ? 0.9 : 0.6,
                    fontWeight: 700
                  }}
                >
                  {ed.sex === 'male' ? '2.2k' : '1.2k'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Mode Switcher & Search Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Search size={14} color="#10B981" />
            <span>Search anatomy</span>
            <kbd
              style={{
                fontSize: '0.62rem',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#94A3B8'
              }}
            >
              /
            </kbd>
          </button>

          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
              padding: 2
            }}
          >
            <button
              type="button"
              onClick={() => setMode('explore')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                background: mode === 'explore' ? '#10B981' : 'transparent',
                color: mode === 'explore' ? '#000000' : '#CBD5E1',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => setMode('learn')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                background: mode === 'learn' ? '#10B981' : 'transparent',
                color: mode === 'learn' ? '#000000' : '#CBD5E1',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Learn & Quiz
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. MAIN 3D VIEWPORT WITH REAL GPU-TEXTURE ANATOMY ENGINE */}
      {/* -------------------------------------------------------------------- */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {atlas && (
          <RealAnatomyScene
            atlas={atlas}
            state={sceneState}
            onSelect={handleSelectPart}
            onProgress={setLoadingProgress}
            onError={(err) => setErrorMessage(err)}
            onHover={setHoveredPartName}
            onVisibleCountChange={setVisiblePiecesCount}
            zoomTrigger={zoomTrigger}
            zoomDirection={zoomDirection}
          />
        )}

        {/* Loading Indicator */}
        {loadingProgress < 100 && !errorMessage && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 40,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 14,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Activity size={18} color="#10B981" className="animate-pulse" />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F8FAFC' }}>
                Loading {currentEdition.label} Reference Atlas ({loadingProgress}%)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{currentEdition.dataset}</div>
              <div
                style={{
                  width: 180,
                  height: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  marginTop: 6,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${loadingProgress}%`,
                    height: '100%',
                    background: '#10B981',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {errorMessage && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: 16,
              padding: '20px 28px',
              textAlign: 'center'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#F87171' }}>Anatomy Loading Error</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#FCA5A5' }}>{errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reload Viewer
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* OVERLAYS: Top-Left Visible Pieces Badge */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 336,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.74rem',
            color: '#CBD5E1',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }}
          />
          <span>
            Visible structures:{' '}
            <strong style={{ color: '#F8FAFC' }}>
              {visiblePiecesCount > 0 ? visiblePiecesCount : atlas?.parts.length || 0}
            </strong>
          </span>
          {hoveredPartName && (
            <span style={{ color: '#34D399', marginLeft: 8, fontWeight: 700 }}>
              • {hoveredPartName}
            </span>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* OVERLAYS: Floating Camera Controls (Right Side) */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: selectedPartIds.length > 0 ? 384 : 24,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            transition: 'right 0.25s ease'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setZoomTrigger((z) => z + 1);
              setZoomDirection('in');
            }}
            title="Zoom In"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomTrigger((z) => z + 1);
              setZoomDirection('out');
            }}
            title="Zoom Out"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setCameraResetCounter((c) => c + 1)}
            title="Reset Camera Target"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate Model'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isAutoRotating ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: isAutoRotating ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isAutoRotating ? '#34D399' : '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isAutoRotating ? <Pause size={16} /> : <RotateCw size={16} />}
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* OVERLAYS: LEFT FLOATING STUDIO DOCK (320px) */}
        {/* ------------------------------------------------------------------ */}
        <aside
          style={{
            position: 'absolute',
            top: 16,
            bottom: 16,
            left: 16,
            width: 310,
            zIndex: 25,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
        >
          {/* Quick Views 2x2 Grid */}
          <div style={{ padding: '14px 14px 10px 14px' }}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8
              }}
            >
              Quick Views
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6
              }}
            >
              {[
                { id: 'organs', label: 'Organs', icon: <Heart size={14} color="#EF4444" /> },
                { id: 'skeleton', label: 'Skeleton', icon: <span style={{ fontSize: '0.85rem' }}>??</span> },
                { id: 'muscles', label: 'Muscles', icon: <Activity size={14} color="#F59E0B" /> },
                { id: 'reproductive', label: 'Reproductive', icon: <span style={{ fontSize: '0.85rem' }}>??</span> },
                { id: 'surface', label: 'Body Surface', icon: <Eye size={14} color="#38BDF8" /> },
                { id: 'all', label: 'All systems', icon: <Layers size={14} color="#10B981" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyQuickView(item.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.icon}
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Body Surface / Skin Opacity Slider (When Surface is Active) */}
            {visibleSystems.includes('integumentary') && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.02em' }}>
                    Surface Opacity
                  </span>
                  <strong style={{ fontSize: '0.70rem', color: '#38BDF8' }}>
                    {Math.round(skinOpacity * 100)}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={skinOpacity}
                  onChange={(e) => setSkinOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
                  title="Adjust skin opacity to reveal underlying muscles, skeleton, and organs"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setSkinOpacity(0.25)}
                    style={{ background: 'none', border: 'none', color: skinOpacity <= 0.3 ? '#38BDF8' : '#94A3B8', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Ghost (25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkinOpacity(0.60)}
                    style={{ background: 'none', border: 'none', color: skinOpacity > 0.3 && skinOpacity < 0.8 ? '#38BDF8' : '#94A3B8', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Translucent (60%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkinOpacity(0.95)}
                    style={{ background: 'none', border: 'none', color: skinOpacity >= 0.8 ? '#38BDF8' : '#94A3B8', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Solid (95%)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Segmented Triple-Pill: [ Systems | Regions | Layers ] */}
          <div style={{ padding: '0 14px 10px 14px' }}>
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 10,
                padding: 2
              }}
            >
              {(['systems', 'layers'] as const).map((tab) => {
                const isActive = activeDockTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveDockTab(tab)}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: 8,
                      background: isActive ? '#10B981' : 'transparent',
                      color: isActive ? '#000000' : '#CBD5E1',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'capitalize',
                      cursor: 'pointer'
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Systems Checklist Scroll Area */}
          <div
            className="anatomy-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 14px 14px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            {activeDockTab === 'systems' ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6
                  }}
                >
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.04em' }}>
                    ALL SYSTEMS ({SYSTEMS.length})
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setVisibleSystems(defaultVisible(sex))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#34D399',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Show All
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleSystems([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                {SYSTEMS.map((sys) => {
                  const count = systemCounts[sys.id] || 0;
                  if (count === 0 && sys.id !== 'reproductive') return null; // Only show supported systems
                  const isVisible = visibleSystems.includes(sys.id);

                  return (
                    <div
                      key={sys.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: isVisible ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        border: '1px solid',
                        borderColor: isVisible ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          // Solo this system on click with coordinated donor/borrowed systems
                          const targetSystems: SystemId[] =
                            sys.id === 'skeletal'
                              ? ['skeletal', 'borrowed' as SystemId]
                              : sys.id === 'muscular'
                              ? ['muscular', 'donor-muscle' as SystemId]
                              : sys.id === 'reproductive'
                              ? ['reproductive', 'pregnancy' as SystemId]
                              : [sys.id];
                          setVisibleSystems(targetSystems);
                          setIsIsolated(false);
                          setSelectedPartIds([]);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isVisible ? '#F8FAFC' : '#94A3B8',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          textAlign: 'left',
                          flex: 1
                        }}
                        title={`Isolate ${sys.name}`}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: sys.color,
                            flexShrink: 0
                          }}
                        />
                        <span>{sys.name}</span>
                        {count > 0 && (
                          <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 600 }}>
                            {count}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSystem(sys.id)}
                        aria-label={`Toggle ${sys.name}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isVisible ? '#10B981' : '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 2
                        }}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  );
                })}
              </>
            ) : (
              /* Layers & Peeling Controls */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
                    Anatomical Exploded View
                  </div>
                  <p style={{ fontSize: '0.68rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                    Continuous physical spatial distribution separating all visible structures along calibrated vectors.
                  </p>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Explosion Amount</span>
                    <strong style={{ fontSize: '0.72rem', color: '#34D399' }}>
                      {Math.round(explode * 100)}%
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(explode * 100)}
                    onChange={(e) => setExplode(parseFloat(e.target.value) / 100)}
                    style={{ width: '100%', accentColor: '#10B981', height: 4, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748B', marginTop: 4 }}>
                    <span>0% Assembled</span>
                    <span>100% Spaced Grid</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#CBD5E1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Assemble / Reset Position</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Dock Action: Sources & Credits */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <button
              type="button"
              onClick={() => setIsCreditsModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Info size={12} />
              <span>Dataset & Licenses</span>
            </button>
            <span style={{ fontSize: '0.62rem', color: '#64748B' }}>CC BY 4.0</span>
          </div>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* OVERLAYS: BOTTOM DOCK (Real Exploded View & Perspective Controls) */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 16px',
            borderRadius: 16,
            background: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Camera Perspective Angle Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['three-quarter', 'front', 'side', 'back'] as View[]).map((v) => {
              const isActive = activeView === v;
              const label =
                v === 'three-quarter' ? '3/4' : v.charAt(0).toUpperCase() + v.slice(1);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setActiveView(v);
                    setCameraResetCounter((c) => c + 1);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isActive ? '#10B981' : 'transparent',
                    color: isActive ? '#000000' : '#CBD5E1',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Real 3D Exploded View Continuous Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8' }}>
              Explode
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(explode * 100)}
              onChange={(e) => setExplode(parseFloat(e.target.value) / 100)}
              style={{
                width: 120,
                accentColor: '#10B981',
                height: 4,
                cursor: 'pointer'
              }}
              title="Continuous 3D Exploded Anatomy"
            />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: explode > 0 ? '#34D399' : '#64748B',
                minWidth: 35
              }}
            >
              {Math.round(explode * 100)}%
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Assemble / Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RotateCcw size={13} />
            <span>Assemble</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* OVERLAYS: RIGHT CONTEXTUAL DOSSIER (Selected Structure) */}
        {/* ------------------------------------------------------------------ */}
        {selectedDetails && (
          <aside
            style={{
              position: 'absolute',
              top: 16,
              bottom: 16,
              right: 16,
              width: 350,
              zIndex: 25,
              background: 'rgba(15, 23, 42, 0.90)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Dossier Header */}
            <div style={{ padding: '16px 18px 12px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPartIds([]);
                    setIsIsolated(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0
                  }}
                >
                  ← Back to full body
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPartIds([]);
                    setIsIsolated(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* System Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: selectedDetails.system?.color || '#10B981'
                  }}
                />
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: selectedDetails.system?.color || '#10B981',
                    letterSpacing: '0.04em'
                  }}
                >
                  {selectedDetails.system?.name || 'Anatomy'}
                </span>
                <span style={{ fontSize: '0.62rem', color: '#64748B' }}>•</span>
                <span style={{ fontSize: '0.62rem', color: '#64748B', fontFamily: 'monospace' }}>
                  {selectedDetails.latinOrConcept}
                </span>
                {selectedDetails.primaryPart.id.startsWith('BM') && (
                  <span style={{ fontSize: '0.60rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(226, 217, 186, 0.2)', color: '#E2D9BA', fontWeight: 700 }}>
                    Calibrated Bone
                  </span>
                )}
                {selectedDetails.primaryPart.system === 'donor-muscle' && (
                  <span style={{ fontSize: '0.60rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(248, 113, 113, 0.2)', color: '#F87171', fontWeight: 700 }}>
                    VHF Donor Muscle
                  </span>
                )}
                {selectedDetails.system?.id === 'reproductive' && (
                  <span style={{ fontSize: '0.60rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(253, 164, 175, 0.2)', color: '#FDA4AF', fontWeight: 700 }}>
                    3D Reproductive Organ
                  </span>
                )}
              </div>

              {/* Structure Title */}
              <h2
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#F8FAFC',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                {selectedDetails.title}
              </h2>

              {/* Action Buttons: Isolate & Deep Scale */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsIsolated(!isIsolated)}
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    borderRadius: 8,
                    background: isIsolated ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                    color: isIsolated ? '#000000' : '#F8FAFC',
                    border: isIsolated ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Focus size={14} />
                  <span>{isIsolated ? 'Show Surrounding' : 'Isolate Structure'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScaleModalOpen(true)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38BDF8',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Explore cellular and molecular scale"
                >
                  <Sparkles size={14} />
                  <span>Deep Scale</span>
                </button>
              </div>
            </div>

            {/* Scrollable Information Body */}
            <div
              className="anatomy-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              {/* Clinical Description */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.76rem',
                  lineHeight: 1.5,
                  color: '#CBD5E1'
                }}
              >
                {selectedDetails.clinicalText}
              </div>

              {/* Atlas Metadata & Piece Count */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800 }}>
                    Selected Pieces
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#10B981' }}>
                    {selectedDetails.parts.length}
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800 }}>
                    Atlas Reference
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#F8FAFC', fontFamily: 'monospace' }}>
                    {selectedDetails.latinOrConcept}
                  </strong>
                </div>
              </div>

              {/* Sub-structures Parts List */}
              {selectedDetails.parts.length > 1 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 8
                    }}
                  >
                    Included Sub-structures ({selectedDetails.parts.length})
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      maxHeight: 220,
                      overflowY: 'auto'
                    }}
                  >
                    {selectedDetails.parts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPartIds([p.id])}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          color: '#E2E8F0',
                          fontSize: '0.72rem',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{p.name}</span>
                        <ChevronRight size={12} color="#64748B" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. SEARCH AUTOCOMPLETE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isSearchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh'
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 580,
              background: '#0F172A',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                gap: 12
              }}
            >
              <Search size={18} color="#10B981" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 3,400+ structures (e.g. Heart, Femur, Aorta, Uterus)..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: '#F8FAFC',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Results List */}
            <div
              className="anatomy-scroll"
              style={{
                maxHeight: 380,
                overflowY: 'auto',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {!searchQuery.trim() ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem' }}>
                  Type an organ, bone, muscle, or structure name to locate it in 3D.
                </div>
              ) : (
                <>
                  {/* Concepts */}
                  {searchResults.concepts.map((concept) => (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => handleSelectConcept(concept)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        color: '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{concept.name}</div>
                        <div style={{ fontSize: '0.64rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {concept.id} • {concept.elements.length} piece{concept.elements.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#10B981" />
                    </button>
                  ))}

                  {/* Individual Parts */}
                  {searchResults.parts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => {
                        handleSelectPart(part.id);
                        setIsSearchOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        color: '#CBD5E1',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem' }}>{part.name}</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {part.id} • {part.system}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          color: '#34D399',
                          fontWeight: 700
                        }}
                      >
                        Locate
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. SOURCES & DATASET LICENSES MODAL */}
      {/* -------------------------------------------------------------------- */}
      {isCreditsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setIsCreditsModalOpen(false)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 580,
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#F8FAFC' }}>
                  Anatomical Data Sources & Attribution
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                  {currentEdition.label} Model • {currentEdition.dataset}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreditsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.76rem', lineHeight: 1.55, color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>{currentEdition.summary}</p>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <strong style={{ color: '#F8FAFC' }}>Coverage & Boundary Disclosures:</strong>
                <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '0.72rem' }}>
                  {currentEdition.limits}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{currentEdition.credit}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <a
                  href={currentEdition.licence}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  License Agreement <ArrowUpRight size={12} />
                </a>
                <a
                  href={currentEdition.download}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Original Dataset Source <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 5. INTEGRATED SUB-MODALS (Preserving Physora's Educational Identity) */}
      {/* -------------------------------------------------------------------- */}
      {isScaleModalOpen && (
        <MultiLevelScaleModal
          structure={ANATOMY_STRUCTURES[selectedDetails?.title?.toLowerCase() || 'heart'] || ANATOMY_STRUCTURES['heart']}
          onClose={() => setIsScaleModalOpen(false)}
        />
      )}

      {mode === 'learn' && (
        <AnatomyQuizEngine
          isMobile={typeof window !== 'undefined' ? window.innerWidth < 768 : false}
          onSelectStructure={(id) => {
            if (id) handleSelectPart(id);
          }}
          onExitQuiz={() => setMode('explore')}
          activeAnswerId={selectedPartIds[0] || null}
          onResetAnswer={() => setSelectedPartIds([])}
        />
      )}
    </div>
  );
};