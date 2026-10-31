import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Layers,
  Heart,
  Activity,
  Bone,
  Dna,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Focus,
  Eye,
  EyeOff,
  Pause,
  RotateCw,
  Info,
  MapPin,
  Play,
  BookOpen,
  Navigation
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
import {
  KEY_3D_ORGANS,
  ANATOMICAL_REGIONS,
  GUIDED_TOURS,
  resolveOrganParts,
  getRegionParts,
  type AnatomicalRegionKey
} from './atlas/guidedTours';
import { RealAnatomyScene } from './atlas/RealAnatomyScene';
import { MultiLevelScaleModal } from './MultiLevelScaleModal';
import { AnatomyQuizEngine } from './AnatomyQuizEngine';
import { FemaleAnatomyStudio } from '../FemaleAnatomyStudio';
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

  // Astra AI Inspired Feature States
  const [selectedOrganKey, setSelectedOrganKey] = useState<string | null>(null);
  const [isSmartLabelsOn, setIsSmartLabelsOn] = useState<boolean>(false);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);
  const [learnSubTab, setLearnSubTab] = useState<'guided' | 'quiz'>('guided');
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [activeTourStepIndex, setActiveTourStepIndex] = useState<number>(0);

  // UI Panels & Modals
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('regions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [isFemaleStudioOpen, setIsFemaleStudioOpen] = useState<boolean>(false);
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

    if (clickedPart.system === 'reproductive') {
      if (skinOpacity > 0.3) {
        setSkinOpacity(0.15);
      }
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
      setSkinOpacity(0.35);
      setActiveView('front');
      setVisibleSystems(defaultVisible(sex));
    } else if (preset === 'skeleton') {
      setActiveView('front');
      setVisibleSystems(['skeletal', 'borrowed' as SystemId]);
    } else if (preset === 'muscles') {
      setActiveView('front');
      setVisibleSystems(['muscular', 'donor-muscle' as SystemId]);
    } else if (preset === 'reproductive') {
      setSkinOpacity(0.15);
      setActiveView('anterior-pelvis');
      setVisibleSystems([
        'reproductive',
        'pregnancy' as SystemId,
        'urinary',
        'skeletal',
        'borrowed' as SystemId,
        'integumentary'
      ]);
    } else if (preset === 'surface') {
      setSkinOpacity(1.0);
      setActiveView('front');
      setVisibleSystems(['integumentary', ...defaultVisible(sex)]);
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
    setSelectedOrganKey(null);
    setActiveLayerIndex(null);
    setSkinOpacity(0.85);
    setExplode(0);
    setIsIsolated(false);
    setSelectedPartIds([]);
    setActiveView('front');
    setIsAutoRotating(false);
    setCameraResetCounter((c) => c + 1);
  };

  // Region structure counts calculated from 3D anatomical bounds
  const regionCounts = useMemo(() => {
    const counts: Record<AnatomicalRegionKey, number> = { head: 0, chest: 0, abdomen: 0, arms: 0, legs: 0 };
    if (!atlas) return counts;
    atlas.parts.forEach((p) => {
      const minY = p.bounds[0][1];
      const maxY = p.bounds[1][1];
      const avgY = (minY + maxY) / 2;
      const minX = Math.abs(p.bounds[0][0]);
      const maxX = Math.abs(p.bounds[1][0]);
      const avgX = (minX + maxX) / 2;

      if (avgY >= 1.36) {
        counts.head++;
      } else if (avgX > 0.18 && avgY >= 0.70 && avgY <= 1.40) {
        counts.arms++;
      } else if (avgY >= 1.10 && avgY < 1.36 && avgX <= 0.18) {
        counts.chest++;
      } else if (avgY >= 0.75 && avgY < 1.10 && avgX <= 0.18) {
        counts.abdomen++;
      } else {
        counts.legs++;
      }
    });
    return counts;
  }, [atlas]);

  // Astra AI Inspired: Direct Selection of Any of the 10 Key 3D Organs
  const handleSelectOrgan = (organKey: string) => {
    if (!atlas) return;
    setSelectedOrganKey(organKey);
    const partIds = resolveOrganParts(organKey, atlas);
    if (partIds.length > 0) {
      setSelectedPartIds(partIds);
      setIsIsolated(false);
      const organDef = KEY_3D_ORGANS.find((o) => o.id === organKey);
      if (organDef) {
        if (organKey !== 'skin' && skinOpacity > 0.3) {
          setSkinOpacity(0.15); // Auto-reveal internal visceral structure
        } else if (organKey === 'skin') {
          setSkinOpacity(0.95);
        }
        if (!visibleSystems.includes(organDef.systemId)) {
          setVisibleSystems((prev) => [...prev, organDef.systemId]);
        }
        setActiveView(organDef.view);
        setCameraResetCounter((c) => c + 1);
      }
    }
  };

  // Astra AI Inspired: Focus Camera to Anatomical Region
  const handleFocusRegion = (regionKey: AnatomicalRegionKey) => {
    const reg = ANATOMICAL_REGIONS.find((r) => r.key === regionKey);
    if (reg) {
      setActiveView(reg.view);
      setCameraResetCounter((c) => c + 1);
    }
  };

  // Astra AI Inspired: Isolate Anatomical Region
  const handleIsolateRegion = (regionKey: AnatomicalRegionKey) => {
    if (!atlas) return;
    const partIds = getRegionParts(regionKey, atlas);
    if (partIds.length > 0) {
      setSelectedPartIds(partIds);
      setIsIsolated(true);
      handleFocusRegion(regionKey);
    }
  };

  // Astra AI Inspired: Sequential Anatomical Depth Slicing (Layers)
  const handleSelectLayer = (layerIdx: number) => {
    setActiveLayerIndex(layerIdx);
    setIsIsolated(false);
    setSelectedPartIds([]);
    switch (layerIdx) {
      case 1: // Skin & Surface
        setSkinOpacity(1.0);
        setVisibleSystems(['integumentary', ...defaultVisible(sex)]);
        setActivePreset('surface');
        break;
      case 2: // Superficial Musculature
        setSkinOpacity(0.0);
        setVisibleSystems(['muscular', 'donor-muscle' as SystemId]);
        setActivePreset('muscles');
        break;
      case 3: // Deep Muscles & Vasculature
        setSkinOpacity(0.0);
        setVisibleSystems(['muscular', 'donor-muscle' as SystemId, 'arterial', 'venous']);
        setActivePreset(null);
        break;
      case 4: // Skeletal Framework
        setSkinOpacity(0.0);
        setVisibleSystems(['skeletal', 'borrowed' as SystemId]);
        setActivePreset('skeleton');
        break;
      case 5: // Visceral Organs
        setSkinOpacity(0.0);
        setVisibleSystems(['cardiac', 'respiratory', 'digestive', 'urinary', 'endocrine', 'reproductive', 'sensory', 'brain']);
        setActivePreset('organs');
        break;
    }
    setCameraResetCounter((c) => c + 1);
  };

  // Guided Tour Navigation Helpers
  const currentTour = useMemo(() => {
    return GUIDED_TOURS.find((t) => t.id === activeTourId) || null;
  }, [activeTourId]);

  const currentTourStep = useMemo(() => {
    if (!currentTour) return null;
    return currentTour.steps[activeTourStepIndex] || null;
  }, [currentTour, activeTourStepIndex]);

  const handleStartTour = (tourId: string) => {
    setActiveTourId(tourId);
    setActiveTourStepIndex(0);
    const tour = GUIDED_TOURS.find((t) => t.id === tourId);
    if (tour && tour.steps.length > 0) {
      const firstStep = tour.steps[0];
      handleSelectOrgan(firstStep.organKey);
      setActiveView(firstStep.view);
    }
  };

  const handleNextTourStep = () => {
    if (!currentTour) return;
    const nextIdx = (activeTourStepIndex + 1) % currentTour.steps.length;
    setActiveTourStepIndex(nextIdx);
    const nextStep = currentTour.steps[nextIdx];
    handleSelectOrgan(nextStep.organKey);
    setActiveView(nextStep.view);
  };

  const handlePrevTourStep = () => {
    if (!currentTour) return;
    const prevIdx = (activeTourStepIndex - 1 + currentTour.steps.length) % currentTour.steps.length;
    setActiveTourStepIndex(prevIdx);
    const prevStep = currentTour.steps[prevIdx];
    handleSelectOrgan(prevStep.organKey);
    setActiveView(prevStep.view);
  };

  const handleExitTour = () => {
    setActiveTourId(null);
    setActiveTourStepIndex(0);
    handleReset();
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
                  {sex === 'male' ? 'BodyParts3D • 2,234 Meshes' : 'HRA v1.10 • 1,223 Meshes'}
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

          {/* Astra AI Style High-Detail 3D Female Anatomy Studio Button */}
          <button
            type="button"
            onClick={() => setIsFemaleStudioOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22), rgba(190, 24, 93, 0.22))',
              border: '1px solid rgba(236, 72, 153, 0.45)',
              color: '#F472B6',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(236, 72, 153, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="Open Astra AI High-Detail 3D Female Anatomy Studio (Sketchfab Medical Scans)"
          >
            <Sparkles size={14} color="#F472B6" />
            <span>3D Female Organs Studio</span>
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
      {/* 1.5. ASTRA AI STYLE: "ORGANS IN 3D" QUICK BAR (10 Key Organs) */}
      {/* -------------------------------------------------------------------- */}
      <div
        style={{
          height: 48,
          background: 'rgba(8, 13, 26, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px',
          zIndex: 28,
          overflowX: 'auto',
          flexShrink: 0
        }}
        className="anatomy-scroll"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ORGANS IN 3D
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}
          >
            10
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {KEY_3D_ORGANS.map((organ) => {
            const isSelected = selectedOrganKey === organ.id;
            return (
              <button
                key={organ.id}
                type="button"
                onClick={() => handleSelectOrgan(organ.id)}
                title={`${organ.label} • ${organ.subtitle}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: isSelected ? `${organ.color}25` : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? `1px solid ${organ.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#FFFFFF' : '#CBD5E1',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? `0 0 12px ${organ.color}35` : 'none'
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: organ.color, boxShadow: `0 0 6px ${organ.color}` }} />
                <span>{organ.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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

          <div style={{ width: 36, height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '2px 0' }} />

          {/* Smart Labels Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSmartLabelsOn(!isSmartLabelsOn)}
            title={isSmartLabelsOn ? 'Hide Smart Labels' : 'Show Smart Labels'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isSmartLabelsOn ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: isSmartLabelsOn ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isSmartLabelsOn ? '#34D399' : '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <MapPin size={16} />
          </button>

          <div style={{ width: 36, height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '2px 0' }} />

          {/* Astra AI Style Cardinal Orientation Compass Grid (A, P, L, R, S, I) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              width: 36
            }}
          >
            {[
              { id: 'front', label: 'A', title: 'Anterior (Front view)' },
              { id: 'back', label: 'P', title: 'Posterior (Back view)' },
              { id: 'left', label: 'L', title: 'Left Lateral view' },
              { id: 'side', label: 'R', title: 'Right Lateral view' },
              { id: 'superior', label: 'S', title: 'Superior (Cranial view)' },
              { id: 'inferior', label: 'I', title: 'Inferior (Caudal view)' }
            ].map((cardinal) => {
              const isCardActive = activeView === cardinal.id;
              return (
                <button
                  key={cardinal.id}
                  type="button"
                  onClick={() => {
                    setActiveView(cardinal.id as View);
                    setCameraResetCounter((c) => c + 1);
                  }}
                  title={cardinal.title}
                  style={{
                    width: 16,
                    height: 18,
                    borderRadius: 4,
                    background: isCardActive ? '#10B981' : 'rgba(15, 23, 42, 0.85)',
                    border: isCardActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isCardActive ? '#000000' : '#CBD5E1',
                    fontSize: '0.60rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cardinal.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Labels 3D Floating Landmark Overlay Badges */}
        {isSmartLabelsOn && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
            {[
              { id: 'brain', label: 'Brain', top: '15%', left: '50%', color: '#A855F7' },
              { id: 'heart', label: 'Heart', top: '34%', left: '52%', color: '#EF4444' },
              { id: 'lungs', label: 'Lungs', top: '32%', left: '44%', color: '#06B6D4' },
              { id: 'liver', label: 'Liver', top: '43%', left: '54%', color: '#F97316' },
              { id: 'kidneys', label: 'Kidneys', top: '48%', left: '46%', color: '#3B82F6' },
              { id: 'small-intestine', label: 'Small Intestine', top: '55%', left: '51%', color: '#EAB308' },
              { id: 'large-intestine', label: 'Large Intestine', top: '59%', left: '48%', color: '#D97706' }
            ].map((landmark) => (
              <button
                key={landmark.id}
                type="button"
                onClick={() => handleSelectOrgan(landmark.id)}
                style={{
                  position: 'absolute',
                  top: landmark.top,
                  left: landmark.left,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${landmark.color}`,
                  color: '#F8FAFC',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 10px ${landmark.color}40`,
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: landmark.color }} />
                <span>{landmark.label}</span>
              </button>
            ))}
          </div>
        )}

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
                { id: 'skeleton', label: 'Skeleton', icon: <Bone size={14} color="#E2D9BA" /> },
                { id: 'muscles', label: 'Muscles', icon: <Activity size={14} color="#F59E0B" /> },
                { id: 'reproductive', label: 'Reproductive', icon: <Dna size={14} color="#EC4899" /> },
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

          {/* Segmented Triple-Tab: [ Regions | Systems | Layers ] */}
          <div style={{ padding: '0 14px 10px 14px' }}>
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 10,
                padding: 2
              }}
            >
              {(['regions', 'systems', 'layers'] as const).map((tab) => {
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
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Scroll Area */}
          <div
            className="anatomy-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 14px 14px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {/* 1. REGIONS TAB */}
            {activeDockTab === 'regions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.68rem', color: '#94A3B8' }}>
                  Choose a body region to explore its anatomical structures.
                </p>
                {ANATOMICAL_REGIONS.map((region) => {
                  const count = regionCounts[region.key] || 0;
                  const isRegionViewActive = activeView === region.view;
                  return (
                    <div
                      key={region.key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: isRegionViewActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isRegionViewActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: region.color }} />
                          <strong style={{ fontSize: '0.76rem', color: '#F8FAFC' }}>{region.label}</strong>
                        </div>
                        <span style={{ fontSize: '0.66rem', color: '#94A3B8', fontWeight: 700 }}>
                          {count} structures
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.64rem', color: '#94A3B8', lineHeight: 1.4 }}>
                        {region.subtitle}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleFocusRegion(region.key)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 6,
                            background: isRegionViewActive ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                            color: isRegionViewActive ? '#000000' : '#E2E8F0',
                            border: 'none',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Focus Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIsolateRegion(region.key)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#CBD5E1',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Isolate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. SYSTEMS TAB */}
            {activeDockTab === 'systems' && (
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
            )}

            {/* 3. LAYERS TAB */}
            {activeDockTab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '0.68rem', color: '#94A3B8' }}>
                  Sequential anatomical depth slicing from outer body surface to deep viscera.
                </p>
                {[
                  { index: 1, label: 'Skin & Surface', desc: 'Integumentary barrier & outer anatomical contours', color: '#BA9B7D' },
                  { index: 2, label: 'Superficial Muscles', desc: 'Major skeletal muscles & facial expression', color: '#A85B50' },
                  { index: 3, label: 'Deep Muscles & Vessels', desc: 'Arterial tree, venous drainage & deep fascia', color: '#C05245' },
                  { index: 4, label: 'Skeletal Framework', desc: 'Axial and appendicular bony skeleton', color: '#E2D9BA' },
                  { index: 5, label: 'Visceral Organs', desc: 'Cardiovascular, respiratory, digestive & urinary organs', color: '#B96760' }
                ].map((layer) => {
                  const isActive = activeLayerIndex === layer.index;
                  return (
                    <button
                      key={layer.index}
                      type="button"
                      onClick={() => handleSelectLayer(layer.index)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color }} />
                          <strong style={{ fontSize: '0.76rem', color: '#F8FAFC' }}>{layer.label}</strong>
                        </div>
                        <span style={{ fontSize: '0.64rem', color: isActive ? '#34D399' : '#64748B', fontWeight: 800 }}>
                          Layer {layer.index}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.64rem', color: '#94A3B8' }}>
                        {layer.desc}
                      </p>
                    </button>
                  );
                })}

                <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                {/* Exploded View Sub-Control */}
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 2 }}>
                    Continuous Exploded Anatomy
                  </div>
                  <p style={{ fontSize: '0.64rem', color: '#94A3B8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    Spatially distributes all visible structures along anatomical expansion vectors.
                  </p>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700 }}>Explosion Amount</span>
                      <strong style={{ fontSize: '0.70rem', color: '#34D399' }}>
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
                  </div>
                </div>
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

          {/* Female Reproductive System View Presets */}
          {(activePreset === 'reproductive' || (sex === 'female' && visibleSystems.includes('reproductive'))) && (
            <>
              <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.12)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[
                  { id: 'anterior-pelvis', label: 'Anterior Pelvis' },
                  { id: 'sagittal', label: 'Sagittal' },
                  { id: 'lithotomy', label: 'Perineal (Lithotomy)' },
                  { id: 'internal-isolation', label: 'Internal Organs' }
                ].map((vp) => {
                  const isActive = activeView === vp.id;
                  return (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => {
                        setActiveView(vp.id as View);
                        if (vp.id === 'internal-isolation') {
                          setVisibleSystems(['reproductive', 'pregnancy' as SystemId]);
                          setSkinOpacity(0.0);
                        } else {
                          if (skinOpacity > 0.3) setSkinOpacity(0.15);
                          setVisibleSystems([
                            'reproductive',
                            'pregnancy' as SystemId,
                            'urinary',
                            'skeletal',
                            'borrowed' as SystemId,
                            'integumentary'
                          ]);
                        }
                        setCameraResetCounter((c) => c + 1);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isActive ? '#EC4899' : 'rgba(236, 72, 153, 0.15)',
                        color: isActive ? '#FFFFFF' : '#F472B6',
                        border: '1px solid rgba(236, 72, 153, 0.35)',
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={vp.label}
                    >
                      {vp.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 45,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16
          }}
        >
          {/* Top Sub-Tab Switcher: [ Guided Explorations | Interactive Quiz ] */}
          <div
            style={{
              pointerEvents: 'auto',
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(20px)',
              borderRadius: 14,
              padding: 4,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              gap: 4
            }}
          >
            <button
              type="button"
              onClick={() => setLearnSubTab('guided')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 10,
                background: learnSubTab === 'guided' ? '#10B981' : 'transparent',
                color: learnSubTab === 'guided' ? '#000000' : '#CBD5E1',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Navigation size={14} />
              <span>Guided Explorations</span>
            </button>
            <button
              type="button"
              onClick={() => setLearnSubTab('quiz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 10,
                background: learnSubTab === 'quiz' ? '#10B981' : 'transparent',
                color: learnSubTab === 'quiz' ? '#000000' : '#CBD5E1',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpen size={14} />
              <span>Interactive Quiz</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('explore')}
              title="Close Learn Mode"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94A3B8',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 4
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Guided Explorations View */}
          {learnSubTab === 'guided' && (
            <div style={{ pointerEvents: 'auto', alignSelf: 'flex-start', maxWidth: 420, marginTop: 12 }}>
              {!currentTour ? (
                /* Tour Selection Menu */
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.94)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 20,
                    padding: '18px 20px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    maxHeight: '75vh',
                    overflowY: 'auto'
                  }}
                  className="anatomy-scroll"
                >
                  <div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      CURATED 3D TOURS
                    </span>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.1rem', color: '#F8FAFC' }}>
                      Guided Explorations
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.4 }}>
                      Step through multi-station anatomical journeys with automated camera flight and clinical pearls.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {GUIDED_TOURS.map((tour) => (
                      <div
                        key={tour.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: `${tour.color}20`, color: tour.color, border: `1px solid ${tour.color}40` }}>
                            {tour.badge}
                          </span>
                          <span style={{ fontSize: '0.64rem', color: '#94A3B8', fontWeight: 700 }}>
                            {tour.steps.length} Stations
                          </span>
                        </div>
                        <strong style={{ fontSize: '0.86rem', color: '#F8FAFC' }}>{tour.title}</strong>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', lineHeight: 1.4 }}>
                          {tour.subtitle}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleStartTour(tour.id)}
                          style={{
                            marginTop: 4,
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: '#10B981',
                            color: '#000000',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          <Play size={12} fill="#000000" />
                          <span>Start Guided Tour</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Active Tour Player Card */
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.94)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: 20,
                    padding: '18px 20px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: `${currentTour.color}25`, color: currentTour.color, border: `1px solid ${currentTour.color}50` }}>
                        {currentTour.badge}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>
                        Step {activeTourStepIndex + 1} of {currentTour.steps.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExitTour}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#F8FAFC', fontWeight: 800 }}>
                      {currentTourStep?.title}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>
                      {currentTourStep?.subtitle}
                    </div>
                  </div>

                  {/* Step Focus Explanation */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.72rem',
                      color: '#CBD5E1',
                      lineHeight: 1.45
                    }}
                  >
                    {currentTourStep?.focusExplanation}
                  </div>

                  {/* Clinical Fact Pearl */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.70rem',
                      color: '#A7F3D0',
                      lineHeight: 1.45
                    }}
                  >
                    <strong style={{ color: '#34D399', display: 'block', marginBottom: 2 }}>
                      Clinical Significance:
                    </strong>
                    {currentTourStep?.clinicalFact}
                  </div>

                  {/* Tour Navigation Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={handlePrevTourStep}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#CBD5E1',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNextTourStep}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: 8,
                        background: '#10B981',
                        border: 'none',
                        color: '#000000',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {activeTourStepIndex === currentTour.steps.length - 1 ? 'Finish Tour' : 'Next Step →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Quiz Engine Sub-Tab */}
          {learnSubTab === 'quiz' && (
            <div style={{ pointerEvents: 'auto', width: '100%' }}>
              <AnatomyQuizEngine
                isMobile={typeof window !== 'undefined' ? window.innerWidth < 768 : false}
                onSelectStructure={(id) => {
                  if (id) handleSelectPart(id);
                }}
                onExitQuiz={() => setMode('explore')}
                activeAnswerId={selectedPartIds[0] || null}
                onResetAnswer={() => setSelectedPartIds([])}
              />
            </div>
          )}
        </div>
      )}

      {/* Astra AI Style High-Detail 3D Female Anatomy Studio (Sketchfab Medical API) */}
      {isFemaleStudioOpen && (
        <FemaleAnatomyStudio onClose={() => setIsFemaleStudioOpen(false)} />
      )}
    </div>
  );
};