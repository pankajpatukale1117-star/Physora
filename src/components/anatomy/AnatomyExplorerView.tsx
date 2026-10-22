// ============================================================================
// PHYSORA 3D HUMAN ANATOMY STUDIO — REFERENCE-ACCURATE CLINICAL INSTRUMENT
// Inspired by Astra AI 3D Human Body Lab · Full-Bleed PBR WebGL Viewport
// Studio Left Dock · Dynamic Viewport Controls · Contextual Right Dossier
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Search,
  Eye,
  EyeOff,
  Play,
  Pause,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Pin,
  GraduationCap,
  Activity,
  Layers,
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus,
  Info,
  Heart,
  Zap,
  Compass
} from 'lucide-react';
import type {
  AnatomicalSystemId,
  AnatomicalStructure
} from '../../data/anatomyData';
import {
  ANATOMICAL_SYSTEMS,
  ANATOMY_STRUCTURES
} from '../../data/anatomyData';
import { Anatomy3DCanvas } from './Anatomy3DCanvas';
import { MultiLevelScaleModal } from './MultiLevelScaleModal';
import { AnatomyQuizEngine } from './AnatomyQuizEngine';

// ----------------------------------------------------------------------------
// INTERFACES & REGIONS
// ----------------------------------------------------------------------------
export interface AnatomyExplorerViewProps {
  onClose: () => void;
  initialStructureId?: string | null;
}

type MainMode = 'explore' | 'learn';
type DockTab = 'regions' | 'systems' | 'layers';
type QuickViewPreset = 'organs' | 'skeleton' | 'muscles' | 'all' | 'custom';

interface BodyRegionDef {
  id: 'all' | 'head' | 'chest' | 'abdomen' | 'arms' | 'legs';
  name: string;
  subtitle: string;
}

const BODY_REGIONS: BodyRegionDef[] = [
  { id: 'all', name: 'Full body', subtitle: 'Global anatomical overview' },
  { id: 'head', name: 'Head & neck', subtitle: 'Neurocranium, facial bones & cervical spine' },
  { id: 'chest', name: 'Chest', subtitle: 'Cardiovascular heart, lungs, ribs & great vessels' },
  { id: 'abdomen', name: 'Abdomen & pelvis', subtitle: 'Digestive viscera, liver, kidneys & pelvic bowl' },
  { id: 'arms', name: 'Upper limbs', subtitle: 'Shoulders, arms, elbows & manual digits' },
  { id: 'legs', name: 'Lower limbs', subtitle: 'Hips, femoral biomechanics, knees & feet' }
];

// 10 Key 3D Organs for the Horizontal Scroll Shelf
const ORGANS_IN_3D_LIST = [
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'brain', label: 'Brain', icon: '🧠' },
  { id: 'lungs', label: 'Lungs', icon: '🫁' },
  { id: 'liver', label: 'Liver', icon: '🟤' },
  { id: 'kidneys', label: 'Kidneys', icon: '🫘' },
  { id: 'stomach', label: 'Stomach', icon: '🥣' },
  { id: 'intestines', label: 'Intestines', icon: '🧬' },
  { id: 'skeleton', label: 'Skeleton', icon: '🦴' },
  { id: 'muscles', label: 'Muscles', icon: '💪' },
  { id: 'aorta', label: 'Vessels', icon: '🩸' }
];

// Rich Clinical Dossier Specs Metadata (Parity with Astra AI)
const CLINICAL_SPECS: Record<string, {
  function?: string;
  location?: string;
  size?: string;
  weight?: string;
  bloodSupply?: string;
  tissue?: string;
  note?: string;
}> = {
  heart: {
    function: 'Pumps oxygenated and deoxygenated blood through systemic and pulmonary circulation.',
    location: 'Middle mediastinum, between the lungs, behind the sternum.',
    size: 'Approx. 12 × 8.5 × 6 cm (fist-sized)',
    weight: '250–350 g (adult)',
    bloodSupply: 'Left anterior descending (LAD), circumflex, and right coronary arteries',
    tissue: 'Cardiac striated muscle (myocardium), endocardium, fibroserous pericardium',
    note: 'The heart beats about 100,000 times per day, pumping roughly 2,000 gallons of blood.'
  },
  brain: {
    function: 'Central processing unit regulating consciousness, cognition, memory, and autonomic homeostasis.',
    location: 'Cranial cavity within the neurocranium, resting in cranial fossae.',
    size: 'Approx. 15 × 14 × 11 cm',
    weight: '1,300–1,400 g (~2% of body mass)',
    bloodSupply: 'Internal carotid arteries & vertebral-basilar arterial system (Circle of Willis)',
    tissue: 'Gray matter (neuronal somas), white matter (myelinated axon tracts), neuroglia',
    note: 'Consumes ~20% of the body’s total glucose and oxygen despite accounting for only 2% of body mass.'
  },
  lungs: {
    function: 'Facilitates alveolar gas exchange (oxygen uptake and carbon dioxide clearance).',
    location: 'Pleural cavities of the thoracic cage flanking the central mediastinum.',
    size: '20–25 cm craniocaudal height',
    weight: 'Right lung ~600 g, Left lung ~500 g',
    bloodSupply: 'Pulmonary trunk (pulmonary circulation) and bronchial arteries (nutritive supply)',
    tissue: 'Type I and Type II alveolar pneumocytes, surfactant layer, pulmonary capillaries',
    note: 'The total alveolar surface area for gas exchange is approximately 70–100 m² — roughly the size of a tennis court.'
  },
  liver: {
    function: 'Metabolic detoxification, glycogen storage, plasma protein synthesis, and bile secretion.',
    location: 'Right upper quadrant (RUQ) of the abdomen beneath the right hemidiaphragm.',
    size: 'Approx. 21–23 cm transverse, 10–12 cm anteroposterior',
    weight: '1,400–1,600 g (largest internal visceral organ)',
    bloodSupply: 'Hepatic portal vein (75% nutrient-rich) & hepatic artery (25% oxygen-rich)',
    tissue: 'Hexagonal hepatic lobules, hepatocyte cords, sinusoidal Kupffer macrophages',
    note: 'Performs over 500 vital biochemical functions and can regenerate from as little as 25% remaining tissue.'
  },
  kidneys: {
    function: 'Plasma ultrafiltration, nitrogenous waste excretion, osmolality, and blood pressure regulation.',
    location: 'Retroperitoneal space at T12–L3 vertebral levels, flanked by quadratus lumborum.',
    size: 'Approx. 11 × 6 × 3 cm each',
    weight: '120–150 g each',
    bloodSupply: 'Renal arteries arising directly from the abdominal aorta at L1–L2',
    tissue: 'Renal cortex and medullary pyramids containing ~1 million nephrons per kidney',
    note: 'Filters approximately 180 liters of blood plasma daily, excreting 1.5–2 liters as concentrated urine.'
  },
  stomach: {
    function: 'Mechanical food maceration, hydrochloric acid sterilization, and pepsinogen enzymatic digestion.',
    location: 'Left hypochondriac and epigastric regions of the abdominal cavity.',
    size: 'Approx. 25 cm length (distensible up to 2–4 liters)',
    weight: '150–200 g empty',
    bloodSupply: 'Left gastric, right gastric, and right/left gastroepiploic arteries (celiac trunk)',
    tissue: 'Simple columnar epithelium with gastric pits (parietal cells producing HCl, chief cells producing pepsinogen)',
    note: 'The stomach lining completely regenerates its mucosal surface every 3 to 5 days to resist acidic self-digestion.'
  },
  intestines: {
    function: 'Enzymatic nutrient absorption, electrolyte transport, water reabsorption, and immunological surveillance.',
    location: 'Umbilical, lumbar, and hypogastric quadrants framed by the peritoneal cavity.',
    size: 'Small intestine: 6–7 m; Large intestine: 1.5 m',
    weight: 'Combined ~2,000 g',
    bloodSupply: 'Superior and inferior mesenteric arterial arcades',
    tissue: 'Enterocytes with brush border microvilli, crypts of Lieberkühn, Peyer’s patches',
    note: 'Houses over 100 trillion symbiotic microorganisms forming the gut microbiome.'
  },
  skeleton: {
    function: 'Structural rigidity, visceral organ protection, biomechanical lever arms, and hematopoietic marrow reservoir.',
    location: 'Axial cranium/spine/thorax and appendicular limbs/girdles.',
    size: 'Full adult human height (~175 cm)',
    weight: '10–12 kg (~14% of total adult body mass)',
    bloodSupply: 'Periosteal and nutrient arteries entering via cortical diaphyseal foramina',
    tissue: 'Dense cortical compact bone and trabecular spongy bone containing osteocytes',
    note: 'Continuous osteoblast and osteoclast remodeling replaces ~10% of the entire adult skeleton every year.'
  },
  muscles: {
    function: 'Contractile voluntary locomotion, posture stabilization, venous pump return, and metabolic heat generation.',
    location: 'Full body somatic écorché layer enveloping the axial and appendicular skeleton.',
    size: 'Over 600 distinct anatomical muscles',
    weight: '25–35 kg (35–45% of total body mass)',
    bloodSupply: 'Extensive intramuscular microvascular anastomoses',
    tissue: 'Striated skeletal muscle fascicles with actin-myosin crossbridges and sarcolemma',
    note: 'Skeletal muscles generate ~85% of total body warmth through active physical contraction and shivering thermogenesis.'
  },
  aorta: {
    function: 'High-pressure distribution of oxygenated arterial blood to systemic peripheral capillary beds.',
    location: 'Ascends from left ventricle, arches over pulmonary hilum, and descends retroperitoneally through the abdomen.',
    size: 'Aorta root ~2.5–3.0 cm diameter; vascular network spans >100,000 km',
    weight: 'Whole cardiovascular system perfuses ~5.0 L of total blood',
    bloodSupply: 'Self-perfusing vasa vasorum in the adventitial layer of large elastic vessels',
    tissue: 'Endothelial intima, elastic/muscular tunica media, fibrous collagenous tunica adventitia',
    note: 'The aorta undergoes elastic Windkessel expansion during systole, recoiling during diastole to maintain continuous forward perfusion.'
  }
};

export const AnatomyExplorerView: React.FC<AnatomyExplorerViewProps> = ({
  onClose,
  initialStructureId = null
}) => {
  // Navigation & Primary Modes
  const [mainMode, setMainMode] = useState<MainMode>('explore');
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('systems');
  const [activeQuickView, setActiveQuickView] = useState<QuickViewPreset>('all');
  const [activeRegion, setActiveRegion] = useState<'all' | 'head' | 'chest' | 'abdomen' | 'arms' | 'legs'>('all');

  // 3D Selection & Isolation
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(initialStructureId);
  const [isIsolated, setIsIsolated] = useState(false);
  const [showInternal, setShowInternal] = useState(false);
  const [pinnedStructureIds, setPinnedStructureIds] = useState<string[]>(['heart', 'brain']);
  const [showSmartLabels, setShowSmartLabels] = useState(true);

  // System Visibilities (9 Systems)
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

  const [systemOpacity] = useState<Record<AnatomicalSystemId, number>>({
    skeletal: 1.0,
    muscular: 0.85,
    cardiovascular: 1.0,
    respiratory: 0.95,
    digestive: 0.95,
    nervous: 1.0,
    urinary: 1.0,
    endocrine: 1.0,
    lymphatic: 1.0
  });

  // Layer Depth Peeling & Tissue Sliders
  const [peelDepth, setPeelDepth] = useState<number>(100);
  const [skinOpacity, setSkinOpacity] = useState<number>(0.20);
  const [isXrayActive, setIsXrayActive] = useState<boolean>(false);
  const [layerSeparation, setLayerSeparation] = useState<number>(0.0);

  // Camera & Biological Sex State
  const [presetView, setPresetView] = useState<'front' | 'back' | 'left' | 'right' | 'top' | 'reset' | 'zoom_in' | 'zoom_out' | null>(null);
  const [biologicalSex, setBiologicalSex] = useState<'female' | 'male'>('male');
  const [visibleStructureCount, setVisibleStructureCount] = useState<number>(733);

  // Biological Animation Controls
  const [isProcessPlaying, setIsProcessPlaying] = useState(false);
  const [processSpeed, setProcessSpeed] = useState(1.0);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals & Quiz Engine
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [activeTourKey] = useState<string | null>(null);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (selectedStructureId) {
          setSelectedStructureId(null);
          setIsIsolated(false);
        } else if (searchQuery) {
          setSearchQuery('');
          setIsSearchFocused(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStructureId, searchQuery]);

  // Handle Quick Views (Organs, Skeleton, Muscles, All systems)
  const handleSelectQuickView = (preset: QuickViewPreset) => {
    setActiveQuickView(preset);
    setSelectedStructureId(null);
    setIsIsolated(false);

    if (preset === 'organs') {
      setSystemVisibility({
        skeletal: false,
        muscular: false,
        cardiovascular: true,
        respiratory: true,
        digestive: true,
        nervous: false,
        urinary: true,
        endocrine: true,
        lymphatic: false
      });
      setSkinOpacity(0.0);
      setPeelDepth(35);
    } else if (preset === 'skeleton') {
      setSystemVisibility({
        skeletal: true,
        muscular: false,
        cardiovascular: false,
        respiratory: false,
        digestive: false,
        nervous: false,
        urinary: false,
        endocrine: false,
        lymphatic: false
      });
      setSkinOpacity(0.0);
      setPeelDepth(0);
    } else if (preset === 'muscles') {
      setSystemVisibility({
        skeletal: false,
        muscular: true,
        cardiovascular: false,
        respiratory: false,
        digestive: false,
        nervous: false,
        urinary: false,
        endocrine: false,
        lymphatic: false
      });
      setSkinOpacity(0.0);
      setPeelDepth(75);
    } else if (preset === 'all') {
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
      setSkinOpacity(0.20);
      setPeelDepth(100);
    }
  };

  // Toggle single system visibility
  const handleToggleSystem = (sysId: AnatomicalSystemId) => {
    setActiveQuickView('custom');
    setSystemVisibility((prev) => ({
      ...prev,
      [sysId]: !prev[sysId]
    }));
  };

  // Search Results Filtering
  const filteredStructures = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(ANATOMY_STRUCTURES).filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.latinName.toLowerCase().includes(q) ||
        st.system.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Selected structure details
  const selectedStructure: AnatomicalStructure | null = selectedStructureId
    ? ANATOMY_STRUCTURES[selectedStructureId] || null
    : null;

  // Selected structure clinical specs
  const selectedSpecs = useMemo(() => {
    if (!selectedStructure) return null;
    const custom = CLINICAL_SPECS[selectedStructure.id];
    return {
      function: custom?.function || selectedStructure.primaryFunction,
      location: custom?.location || selectedStructure.anatomicalLocation,
      size: custom?.size || 'Proportional adult human dimensions',
      weight: custom?.weight || 'Proportional anatomical mass',
      bloodSupply: custom?.bloodSupply || 'Systemic circulatory perfusion',
      tissue: custom?.tissue || selectedStructure.category || 'Specialized human histological tissue',
      note: custom?.note || selectedStructure.educationalSummary || selectedStructure.keyFacts?.[0] || 'A fundamental anatomical component of human physiology.'
    };
  }, [selectedStructure]);

  // Handle 3D canvas mesh direct click
  const handle3DStructureClick = (id: string | null) => {
    setSelectedStructureId(id);
    if (id) {
      // Keep isolation false initially so user sees context, or true if in isolated organ mode
      setIsIsolated(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#0B1120',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* ==================================================================== */}
      {/* 1. TOP MINIMAL BAR                                                   */}
      {/* ==================================================================== */}
      <header
        style={{
          height: 52,
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            title="Exit Atlas"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #10B981, #0284C7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Activity size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '0.90rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  Physora 3D Human Anatomy
                </h1>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Medical PBR
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                Interactive 3D reference · High-precision anatomical models
              </div>
            </div>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: 10,
            padding: 3
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMainMode('explore');
              setIsChallengeActive(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 7,
              background: mainMode === 'explore' && !isChallengeActive ? '#10B981' : 'transparent',
              color: mainMode === 'explore' && !isChallengeActive ? '#000000' : '#CBD5E1',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={13} />
            <span>Explore</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainMode('learn');
              setIsChallengeActive(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 7,
              background: isChallengeActive ? '#10B981' : 'transparent',
              color: isChallengeActive ? '#000000' : '#CBD5E1',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={13} />
            <span>Learn &amp; Quiz</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. FULL-BLEED 3D VIEWPORT CANVAS WITH OVERLAYS                       */}
      {/* ==================================================================== */}
      <main style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Anatomy3DCanvas
          selectedStructureId={selectedStructureId}
          onSelectStructure={handle3DStructureClick}
          systemVisibility={systemVisibility}
          systemOpacity={systemOpacity}
          isIsolated={isIsolated}
          showInternal={showInternal}
          layerSeparation={layerSeparation}
          isProcessPlaying={isProcessPlaying}
          processSpeed={processSpeed}
          processStepTick={0}
          detailLevel="overview"
          presetView={presetView}
          onPresetViewHandled={() => setPresetView(null)}
          onVisibleCountChange={(count) => setVisibleStructureCount(count)}
          skinOpacity={isXrayActive ? 0.08 : skinOpacity}
          skinMode={isXrayActive ? 'xray' : 'natural'}
          skinVisible={skinOpacity > 0.02 || isXrayActive}
          biologicalSex={biologicalSex}
          peelDepth={peelDepth}
          isXrayActive={isXrayActive}
          focusedRegion={activeRegion}
          pinnedStructureIds={pinnedStructureIds}
          showSmartLabels={showSmartLabels && !isChallengeActive && !activeTourKey}
          hideInternalCameraWidget={true}
          isChallengeActive={isChallengeActive}
          activeTourKey={activeTourKey}
        />

        {/* ------------------------------------------------------------------ */}
        {/* VIEWPORT OVERLAY: Top-Left Visible Structures Counter Badge        */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 350,
            zIndex: 30,
            padding: '6px 14px',
            borderRadius: 9999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            color: '#94A3B8',
            fontSize: '0.76rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          <span>
            Visible structures:{' '}
            <strong style={{ color: '#FFFFFF', fontWeight: 800 }}>
              {visibleStructureCount || 733}
            </strong>
          </span>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEWPORT OVERLAY: Top-Right Circular Camera Controls               */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: selectedStructure ? 390 : 380,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            transition: 'right 0.2s ease'
          }}
        >
          <button
            type="button"
            onClick={() => setPresetView('zoom_in')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
            title="Zoom In"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={() => setPresetView('zoom_out')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            onClick={() => setPresetView('reset')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
            title="Reset Camera"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEWPORT OVERLAY: Bottom Floating Dock (Views, Sex, Explosion)     */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            borderRadius: 9999,
            padding: '6px 14px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Orientation Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {(['front', 'back', 'left', 'reset'] as const).map((v) => {
              const label = v === 'left' ? 'Side' : v === 'reset' ? 'Perspective' : v.charAt(0).toUpperCase() + v.slice(1);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPresetView(v)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: 'transparent',
                    color: '#CBD5E1',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Biological Sex Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 9999,
              padding: 2
            }}
          >
            <button
              type="button"
              onClick={() => setBiologicalSex('male')}
              style={{
                padding: '3px 8px',
                borderRadius: 9999,
                background: biologicalSex === 'male' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                color: biologicalSex === 'male' ? '#FFFFFF' : '#64748B',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setBiologicalSex('female')}
              style={{
                padding: '3px 8px',
                borderRadius: 9999,
                background: biologicalSex === 'female' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                color: biologicalSex === 'female' ? '#FFFFFF' : '#64748B',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Female
            </button>
          </div>

          <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Spread Structures Apart Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.70rem', color: '#94A3B8', fontWeight: 600 }}>
              Spread structures apart
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={layerSeparation}
              onChange={(e) => setLayerSeparation(parseFloat(e.target.value))}
              style={{ width: 75, accentColor: '#10B981', height: 4 }}
            />
            {layerSeparation > 0.05 && (
              <button
                type="button"
                onClick={() => setLayerSeparation(0.0)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10B981',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
                title="Reset explosion"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. FLOATING STUDIO LEFT DOCK (Width: 320px, Rounded 24px)          */}
        {/* ================================================================== */}
        <aside
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            width: 320,
            maxHeight: 'calc(100vh - 88px)',
            zIndex: 35,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px'
          }}
        >
          {/* Top Search Bar */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: isSearchFocused ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.10)',
                borderRadius: 12,
                padding: '8px 12px',
                transition: 'all 0.15s ease'
              }}
            >
              <Search size={14} color="#94A3B8" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find a structure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.80rem'
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    padding: '1px 5px',
                    fontSize: '0.62rem',
                    color: '#94A3B8'
                  }}
                >
                  /
                </kbd>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {isSearchFocused && filteredStructures.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  maxHeight: 260,
                  overflowY: 'auto',
                  background: 'rgba(15, 23, 42, 0.96)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
                  zIndex: 50,
                  padding: 6
                }}
              >
                {filteredStructures.slice(0, 10).map((st) => (
                  <div
                    key={st.id}
                    onMouseDown={() => {
                      setSelectedStructureId(st.id);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: '#CBD5E1',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{st.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontStyle: 'italic' }}>{st.latinName}</div>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: '#10B981', textTransform: 'uppercase', fontWeight: 800 }}>
                      {st.system}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: ORGANS IN 3D (10) Horizontal Shelf */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>ORGANS IN 3D</span>
              <span style={{ color: '#64748B' }}>(10)</span>
            </div>
            <div
              className="anatomy-shelf-scroll"
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4
              }}
            >
              {ORGANS_IN_3D_LIST.map((org) => {
                const isSelected = selectedStructureId === org.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setSelectedStructureId(org.id);
                      setIsIsolated(true);
                    }}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 10px',
                      borderRadius: 14,
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      minWidth: 64,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#000000' : '#FFFFFF',
                        fontSize: '1rem'
                      }}
                    >
                      {org.icon}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? '#34D399' : '#CBD5E1' }}>
                      {org.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segmented Triple-Pill: [ Regions ] | [ Systems ] | [ Layers ] */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 3,
              marginBottom: 14
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
                    padding: '6px 0',
                    borderRadius: 9,
                    background: isActive ? '#10B981' : 'transparent',
                    color: isActive ? '#000000' : '#CBD5E1',
                    border: 'none',
                    fontSize: '0.74rem',
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

          {/* Tab Content Container */}
          <div
            className="anatomy-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {/* -------------------------------------------------------------- */}
            {/* TAB: SYSTEMS (Matches Astra AI scratch/astra_systems_tab.png)   */}
            {/* -------------------------------------------------------------- */}
            {activeDockTab === 'systems' && (
              <>
                {/* QUICK VIEWS */}
                <div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: 8
                    }}
                  >
                    QUICK VIEWS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { id: 'organs', label: 'Organs', icon: <Heart size={14} color="#EF4444" /> },
                      { id: 'skeleton', label: 'Skeleton', icon: <span style={{ fontSize: '0.9rem' }}>🦴</span> },
                      { id: 'muscles', label: 'Muscles', icon: <Activity size={14} color="#F59E0B" /> },
                      { id: 'all', label: 'All systems', icon: <Layers size={14} color="#10B981" /> }
                    ].map((item) => {
                      const isActive = activeQuickView === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectQuickView(item.id as QuickViewPreset)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: isActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                            border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isActive ? '#FFFFFF' : '#CBD5E1',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {item.icon}
                            <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{item.label}</span>
                          </div>
                          {isActive && <CheckCircle2 size={14} color="#10B981" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ALL SYSTEMS LIST */}
                <div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: 8
                    }}
                  >
                    ALL SYSTEMS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(Object.keys(ANATOMICAL_SYSTEMS) as AnatomicalSystemId[]).map((sysId) => {
                      const sys = ANATOMICAL_SYSTEMS[sysId];
                      const isVis = systemVisibility[sysId];
                      return (
                        <div
                          key={sysId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 10,
                            background: isVis ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sys.color }} />
                            <div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isVis ? '#FFFFFF' : '#64748B' }}>
                                {sys.name}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleSystem(sysId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isVis ? '#10B981' : '#64748B',
                              cursor: 'pointer',
                              padding: 4
                            }}
                            title={isVis ? 'Hide System' : 'Show System'}
                          >
                            {isVis ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB: REGIONS (Frames 3D camera to specific body section)       */}
            {/* -------------------------------------------------------------- */}
            {activeDockTab === 'regions' && (
              <div>
                <div
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8
                  }}
                >
                  BODY REGIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {BODY_REGIONS.map((reg) => {
                    const isActive = activeRegion === reg.id;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => {
                          setActiveRegion(reg.id);
                          setSelectedStructureId(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: isActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                          border: isActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isActive ? '#34D399' : '#FFFFFF' }}>
                            {reg.name}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#94A3B8' }}>{reg.subtitle}</div>
                        </div>
                        {isActive ? <CheckCircle2 size={14} color="#10B981" /> : <ChevronRight size={13} color="#64748B" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB: LAYERS (Matches Astra AI scratch/astra_layers_tab.png)     */}
            {/* -------------------------------------------------------------- */}
            {activeDockTab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPeelDepth((prev) => Math.max(0, prev - 25))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#CBD5E1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Peel back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPeelDepth(100);
                      setSkinOpacity(0.20);
                      setIsXrayActive(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#CBD5E1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Restore layers
                  </button>
                </div>

                {/* Tissue Depth Slider */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Muscle &amp; tissue depth</span>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>{peelDepth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={peelDepth}
                    onChange={(e) => setPeelDepth(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: '#10B981', height: 4 }}
                  />
                </div>

                {/* Surface Skin Opacity Slider */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Skin opacity</span>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>{Math.round(skinOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={skinOpacity}
                    onChange={(e) => setSkinOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#10B981', height: 4 }}
                  />
                </div>

                {/* X-Ray Radiography Mode */}
                <button
                  type="button"
                  onClick={() => setIsXrayActive(!isXrayActive)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: isXrayActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: isXrayActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isXrayActive ? '#38BDF8' : '#CBD5E1',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={14} color={isXrayActive ? '#38BDF8' : '#94A3B8'} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>X-Ray Radiography</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>{isXrayActive ? 'ACTIVE' : 'OFF'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dock Footer Actions */}
          <div
            style={{
              paddingTop: 12,
              marginTop: 10,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMainMode('learn');
                setIsChallengeActive(true);
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '7px 0',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <GraduationCap size={13} color="#10B981" />
              <span>Learn</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSmartLabels(!showSmartLabels)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '7px 0',
                borderRadius: 8,
                background: showSmartLabels ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                border: showSmartLabels ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                color: showSmartLabels ? '#34D399' : '#CBD5E1',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Pin size={13} />
              <span>Smart labels</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreditsOpen(true)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontSize: '0.70rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Sources & Credits"
            >
              <Info size={14} />
            </button>
          </div>
        </aside>

        {/* ================================================================== */}
        {/* 4. CONTEXTUAL RIGHT DOSSIER (Width: 360px, Rounded 24px)           */}
        {/* ================================================================== */}
        {!selectedStructure ? (
          /* DEFAULT STATE: EXPLORE ANATOMY OVERVIEW (Matches Astra AI initial) */
          <aside
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 360,
              maxHeight: 'calc(100vh - 88px)',
              zIndex: 35,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(24px)',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                EXPLORE ANATOMY
              </span>
            </div>
            <h2 style={{ fontSize: '1.40rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              A closer look at you
            </h2>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.80rem', color: '#94A3B8', lineHeight: 1.55 }}>
              Rotate, zoom, and peel away layers to discover the human body.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'heart', name: 'Heart', latin: 'Cor', desc: 'Pumps oxygenated blood through systemic circulation.' },
                { id: 'brain', name: 'Brain', latin: 'Encephalon', desc: 'Command center of the central nervous system.' },
                { id: 'liver', name: 'Liver', latin: 'Hepar', desc: 'Primary metabolic and biochemical laboratory.' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedStructureId(item.id);
                    setIsIsolated(true);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.84rem' }}>{item.name}</span>
                    <span style={{ fontStyle: 'italic', fontSize: '0.72rem', color: '#94A3B8' }}>{item.latin}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setMainMode('learn');
                setIsChallengeActive(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34D399',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 'auto'
              }}
            >
              <GraduationCap size={16} />
              <span>Guided explorations</span>
            </button>
          </aside>
        ) : (
          /* ORGAN SELECTED STATE: CLINICAL DOSSIER (Matches Astra AI astra_heart_selected.png) */
          <aside
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 360,
              maxHeight: 'calc(100vh - 88px)',
              zIndex: 35,
              background: 'rgba(15, 23, 42, 0.90)',
              backdropFilter: 'blur(24px)',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '18px 20px'
            }}
          >
            {/* Top Back Navigation Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedStructureId(null);
                  setIsIsolated(false);
                  setPresetView('reset');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: '#CBD5E1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to the body</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStructureId(null);
                  setIsIsolated(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  padding: 4,
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Breadcrumb & Header */}
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                ORGANS IN 3D &nbsp;•&nbsp; <span style={{ color: selectedStructure.accentColor || '#10B981' }}>{selectedStructure.system}</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>
                {selectedStructure.name}
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#F59E0B', fontStyle: 'italic', marginBottom: 10 }}>
                {selectedStructure.latinName}
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                {selectedStructure.educationalSummary || selectedStructure.primaryFunction}
              </p>
            </div>

            {/* Action Bar (Focus, Isolate, Pin, Scale) */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setIsIsolated(!isIsolated)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 8,
                  background: isIsolated ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                  color: isIsolated ? '#000000' : '#CBD5E1',
                  border: isIsolated ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isIsolated ? 'Show All' : 'Isolate'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (pinnedStructureIds.includes(selectedStructure.id)) {
                    setPinnedStructureIds(pinnedStructureIds.filter((p) => p !== selectedStructure.id));
                  } else {
                    setPinnedStructureIds([...pinnedStructureIds, selectedStructure.id]);
                  }
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: pinnedStructureIds.includes(selectedStructure.id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: pinnedStructureIds.includes(selectedStructure.id) ? '#34D399' : '#CBD5E1',
                  border: pinnedStructureIds.includes(selectedStructure.id) ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Pin size={12} />
                <span>{pinnedStructureIds.includes(selectedStructure.id) ? 'Pinned' : 'Pin'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInternal(!showInternal)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: showInternal ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: showInternal ? '#38BDF8' : '#CBD5E1',
                  border: showInternal ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Toggle Translucent Internal View"
              >
                <Eye size={12} />
                <span>{showInternal ? 'Solid' : 'Internal'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScaleModalOpen(true)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Deep Dive from organ to molecule"
              >
                <Sparkles size={12} />
                <span>Scale</span>
              </button>
            </div>

            {/* Scrollable Clinical Specifications & Sub-structures */}
            <div
              className="anatomy-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingRight: 4
              }}
            >
              {/* Physiological Animation Controls (e.g. Heart Rate) */}
              {selectedStructure.hasProcessAnimation && (
                <div
                  style={{
                    flexShrink: 0,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color="#10B981" />
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34D399' }}>
                      {selectedStructure.processConfig?.name || 'Cardiac Pulsation'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={processSpeed}
                      onChange={(e) => setProcessSpeed(parseFloat(e.target.value))}
                      style={{ width: 45, accentColor: '#10B981', height: 3 }}
                      title={`Speed: ${processSpeed.toFixed(1)}x`}
                    />
                    <button
                      type="button"
                      onClick={() => setIsProcessPlaying(!isProcessPlaying)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: isProcessPlaying ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                        color: isProcessPlaying ? '#000000' : '#CBD5E1',
                        border: 'none',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isProcessPlaying ? <Pause size={10} /> : <Play size={10} />}
                      <span>{isProcessPlaying ? 'Pulsing' : 'Animate'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Structured Clinical Specs Table (FUNCTION, LOCATION, SIZE, WEIGHT, BLOOD SUPPLY, TISSUE) */}
              {selectedSpecs && (
                <div
                  style={{
                    flexShrink: 0,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}
                >
                  {[
                    { label: 'FUNCTION', value: selectedSpecs.function },
                    { label: 'LOCATION', value: selectedSpecs.location },
                    { label: 'SIZE', value: selectedSpecs.size },
                    { label: 'WEIGHT', value: selectedSpecs.weight },
                    { label: 'BLOOD SUPPLY', value: selectedSpecs.bloodSupply },
                    { label: 'TISSUE', value: selectedSpecs.tissue }
                  ].map((row, idx) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '95px 1fr',
                        padding: '7px 10px',
                        borderBottom: idx < 5 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                        fontSize: '0.72rem'
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#94A3B8', letterSpacing: '0.04em' }}>
                        {row.label}
                      </span>
                      <span style={{ color: '#E2E8F0', lineHeight: 1.4 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Clinical Note Callout Card */}
              {selectedSpecs?.note && (
                <div
                  style={{
                    flexShrink: 0,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>💡</span>
                    <div style={{ fontSize: '0.74rem', color: '#FEF3C7', lineHeight: 1.45 }}>
                      <strong style={{ color: '#F59E0B' }}>Note · </strong>
                      {selectedSpecs.note}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-structures Checklist / Parts List */}
              {selectedStructure.subStructures && selectedStructure.subStructures.length > 0 && (
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>STRUCTURES &amp; PARTS</span>
                    <span style={{ color: '#64748B' }}>({selectedStructure.subStructures.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedStructure.subStructures.map((subName, sIdx) => {
                      const cleanName = subName.split('(')[0].trim();
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            const match = Object.keys(ANATOMY_STRUCTURES).find(
                              (k) =>
                                ANATOMY_STRUCTURES[k].name.toLowerCase().includes(cleanName.toLowerCase()) ||
                                cleanName.toLowerCase().includes(ANATOMY_STRUCTURES[k].name.toLowerCase())
                            );
                            if (match) {
                              setSelectedStructureId(match);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 8px',
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#CBD5E1',
                            fontSize: '0.72rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <CheckCircle2 size={12} color="#10B981" />
                          <span style={{ flex: 1 }}>{subName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ================================================================== */}
        {/* 5. INTERACTIVE 3D QUIZ & CHALLENGE OVERLAY                         */}
        {/* ================================================================== */}
        {isChallengeActive && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 360,
              right: 20,
              zIndex: 45
            }}
          >
            <AnatomyQuizEngine
              isMobile={false}
              onSelectStructure={(id: string | null) => {
                setSelectedStructureId(id);
                setIsIsolated(false);
              }}
              onExitQuiz={() => setIsChallengeActive(false)}
              activeAnswerId={selectedStructureId}
              onResetAnswer={() => setSelectedStructureId(null)}
            />
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* 6. MODALS: MULTI-LEVEL SCALE & OPEN ATTRIBUTION CREDITS              */}
      {/* ==================================================================== */}
      {isScaleModalOpen && selectedStructure && (
        <MultiLevelScaleModal
          structure={selectedStructure}
          onClose={() => setIsScaleModalOpen(false)}
        />
      )}

      {isCreditsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setIsCreditsOpen(false)}
        >
          <div
            style={{
              width: 500,
              maxWidth: '90vw',
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                Anatomical Data &amp; Source Credits
              </h3>
              <button
                type="button"
                onClick={() => setIsCreditsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: '0.80rem', color: '#CBD5E1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>
                <strong>BodyParts3D &amp; The Database Center for Life Science (DBCLS)</strong>:
                Anatomical 3D models of human anatomy are based on the BodyParts3D open-access database (CC BY-SA 2.1 Japan / CC BY 4.0).
              </p>
              <p style={{ margin: 0 }}>
                <strong>Visible Human Project &amp; Z-Anatomy</strong>:
                Detailed bone meshes and striations based on public medical scans from the National Library of Medicine (NLM) and the Z-Anatomy community initiative.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Physora Educational Atlas</strong>:
                All interactive clinical annotations, cross-sectional pathways, hemodynamic simulations, and 3D leader line rendering developed for Physora.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};