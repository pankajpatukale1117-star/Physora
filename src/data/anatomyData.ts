// ============================================================================
// PHYSORA 3D HUMAN ANATOMY DATABASE
// Medically Calibrated Anatomical Systems, Structures, and Multi-Scale Data
// ============================================================================

export type AnatomicalSystemId =
  | 'skeletal'
  | 'muscular'
  | 'cardiovascular'
  | 'respiratory'
  | 'digestive'
  | 'nervous'
  | 'urinary'
  | 'endocrine'
  | 'lymphatic';

export type DetailLevel = 'overview' | 'detailed' | 'advanced';

export interface MultiLevelScaleStep {
  level: 'Body' | 'System' | 'Organ' | 'Structure' | 'Tissue' | 'Cell' | 'Molecule';
  title: string;
  scientificName: string;
  description: string;
  microscopicScale: string; // e.g. "1.75 m", "12 cm", "25 mm", "50 μm", "2 nm"
  keyMoleculesOrStructures: string[];
  inquiryPrompt: string;
}

export interface InternalStructureDetail {
  id: string;
  name: string;
  description: string;
  color?: string;
}

export interface SpatialRelationship {
  direction: 'Anterior' | 'Posterior' | 'Superior' | 'Inferior' | 'Lateral' | 'Medial' | 'Surrounding';
  neighborName: string;
  neighborStructureId?: string;
  description: string;
}

export interface BiologicalProcessConfig {
  id: string;
  name: string;
  description: string;
  defaultSpeed: number; // 1.0
  rateUnit: string; // e.g. "BPM", "Breaths/min", "Hz", "mL/min"
  defaultRate: number; // e.g. 72, 16, 25, 125
  minRate: number;
  maxRate: number;
  stages: {
    name: string;
    description: string;
    color: string;
  }[];
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  latinName: string;
  system: AnatomicalSystemId;
  complexity: DetailLevel;
  color: string;
  accentColor?: string;
  defaultOpacity?: number;
  
  // 3D Spatial coordinates in standardized anatomical coordinate frame
  // Y = vertical (feet ~ -10, head ~ +9)
  // X = lateral (-left, +right)
  // Z = anterior/posterior (+front, -back)
  center: [number, number, number];
  boundsSize: [number, number, number];
  cameraFocus: {
    target: [number, number, number];
    distance: number;
    elevation?: number;
  };

  // Educational Dossier
  category: string;
  primaryFunction: string;
  anatomicalLocation: string;
  educationalSummary: string;
  keyFacts: string[];
  subStructures: string[];
  relatedSystems: AnatomicalSystemId[];
  clinicalRelevance: string;

  // Spatial Anatomical Relationships
  spatialRelationships?: SpatialRelationship[];

  // Advanced Interactive Capabilities
  hasInternalView?: boolean;
  internalStructures?: InternalStructureDetail[];
  hasProcessAnimation?: boolean;
  processConfig?: BiologicalProcessConfig;
  multiLevelPathway?: MultiLevelScaleStep[];
}

// ----------------------------------------------------------------------------
// 10-STEP CLINICAL ANATOMICAL LAYER STACK
// ----------------------------------------------------------------------------
export interface AnatomicalLayerStackItem {
  id: string;
  level: number;
  name: string;
  shortName: string;
  latinName: string;
  description: string;
  icon: string;
  skinOpacity: number;
  skinVisible: boolean;
  layerSeparation: number;
  showInternal: boolean;
  highlightedSystems: AnatomicalSystemId[];
  systemVisibility: Record<AnatomicalSystemId, boolean>;
}

export const ANATOMICAL_LAYER_STACK: AnatomicalLayerStackItem[] = [
  {
    id: 'surface',
    level: 1,
    name: '1. Surface & Form',
    shortName: 'Surface',
    latinName: 'Integumentum commune',
    description: 'Neutral scientific anatomical mannequin showing outer human body contours and spatial boundaries.',
    icon: 'User',
    skinOpacity: 1.0,
    skinVisible: true,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: [],
    systemVisibility: {
      skeletal: false,
      muscular: false,
      cardiovascular: false,
      respiratory: false,
      digestive: false,
      nervous: false,
      urinary: false,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'muscles',
    level: 2,
    name: '2. Muscular System',
    shortName: 'Muscles',
    latinName: 'Systema musculare',
    description: 'Somatic muscle groups and superficial musculature wrapping the skeletal framework.',
    icon: 'Activity',
    skinOpacity: 1.0,
    skinVisible: true,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: ['muscular'],
    systemVisibility: {
      skeletal: false,
      muscular: true,
      cardiovascular: false,
      respiratory: false,
      digestive: false,
      nervous: false,
      urinary: false,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'skeleton',
    level: 3,
    name: '3. Skeletal System',
    shortName: 'Skeleton',
    latinName: 'Systema skeletale',
    description: 'Complete axial and appendicular skeleton: cranium, vertebral column, rib cage, and limbs.',
    icon: 'Bone',
    skinOpacity: 0.0,
    skinVisible: false,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: ['skeletal'],
    systemVisibility: {
      skeletal: true,
      muscular: false,
      cardiovascular: false,
      respiratory: false,
      digestive: false,
      nervous: false,
      urinary: false,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'organs',
    level: 4,
    name: '4. Major Visceral Organs',
    shortName: 'Major Organs',
    latinName: 'Organa visceralia',
    description: 'Internal viscera nested within thoracic, abdominal, and cranial cavities: heart, lungs, liver, intestines, and brain.',
    icon: 'Heart',
    skinOpacity: 0.0,
    skinVisible: false,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: ['cardiovascular', 'respiratory', 'digestive', 'urinary'],
    systemVisibility: {
      skeletal: true,
      muscular: false,
      cardiovascular: true,
      respiratory: true,
      digestive: true,
      nervous: true,
      urinary: true,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'vessels',
    level: 5,
    name: '5. Blood Vessels & Circulation',
    shortName: 'Blood Vessels',
    latinName: 'Systema cardiovasculare',
    description: 'Systemic oxygenated arterial tree, deoxygenated venous return, myocardium, and dual-circuit hemodynamics.',
    icon: 'GitBranch',
    skinOpacity: 0.0,
    skinVisible: false,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: ['cardiovascular'],
    systemVisibility: {
      skeletal: true,
      muscular: false,
      cardiovascular: true,
      respiratory: false,
      digestive: false,
      nervous: false,
      urinary: false,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'nerves',
    level: 6,
    name: '6. Nervous System',
    shortName: 'Nervous System',
    latinName: 'Systema nervosum',
    description: 'Central nervous system: cerebrum, cerebellum, brainstem, spinal cord axis, and neural pathways.',
    icon: 'Zap',
    skinOpacity: 0.0,
    skinVisible: false,
    layerSeparation: 0.0,
    showInternal: false,
    highlightedSystems: ['nervous'],
    systemVisibility: {
      skeletal: true,
      muscular: false,
      cardiovascular: false,
      respiratory: false,
      digestive: false,
      nervous: true,
      urinary: false,
      endocrine: false,
      lymphatic: false
    }
  },
  {
    id: 'deep_anatomy',
    level: 7,
    name: '7. Deep Integrated Anatomy',
    shortName: 'Deep Anatomy',
    latinName: 'Anatomia profunda',
    description: 'Comprehensive integrated view demonstrating multi-system spatial relationships across skeleton, viscera, and vasculature.',
    icon: 'Layers',
    skinOpacity: 0.12,
    skinVisible: true,
    layerSeparation: 0.0,
    showInternal: true,
    highlightedSystems: ['skeletal', 'cardiovascular', 'respiratory', 'digestive', 'nervous', 'urinary'],
    systemVisibility: {
      skeletal: true,
      muscular: false,
      cardiovascular: true,
      respiratory: true,
      digestive: true,
      nervous: true,
      urinary: true,
      endocrine: false,
      lymphatic: false
    }
  }
];

// ----------------------------------------------------------------------------
// SYSTEM METADATA & PALETTE
// ----------------------------------------------------------------------------
export interface SystemMetadata {
  id: AnatomicalSystemId;
  name: string;
  latinName: string;
  description: string;
  color: string;
  softColor: string;
  iconName: string;
  organCount: number;
}

export const ANATOMICAL_SYSTEMS: Record<AnatomicalSystemId, SystemMetadata> = {
  skeletal: {
    id: 'skeletal',
    name: 'Skeletal System',
    latinName: 'Systema skeletale',
    description: 'Framework of 206 articulated bones providing mechanical structural support, visceral protection, calcium homeostasis, and hematopoiesis.',
    color: '#E2E8F0',
    softColor: 'rgba(226, 232, 240, 0.16)',
    iconName: 'Bone',
    organCount: 16
  },
  muscular: {
    id: 'muscular',
    name: 'Muscular System',
    latinName: 'Systema musculare',
    description: 'Over 600 skeletal muscles converting biochemical ATP hydrolysis into mechanical tension, locomotion, and thermogenesis.',
    color: '#E11D48',
    softColor: 'rgba(225, 29, 72, 0.16)',
    iconName: 'Activity',
    organCount: 10
  },
  cardiovascular: {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    latinName: 'Systema cardiovasculare',
    description: 'High-pressure closed hemodynamic circuit driven by the four-chambered heart delivering oxygen, nutrients, and endocrine hormones.',
    color: '#EF4444',
    softColor: 'rgba(239, 68, 68, 0.16)',
    iconName: 'Heart',
    organCount: 8
  },
  respiratory: {
    id: 'respiratory',
    name: 'Respiratory System',
    latinName: 'Systema respiratorium',
    description: 'Ventilatory pulmonary tree facilitating alveolar diffusion of oxygen into erythrocytes and exhalation of metabolic carbon dioxide.',
    color: '#06B6D4',
    softColor: 'rgba(6, 182, 212, 0.16)',
    iconName: 'Wind',
    organCount: 6
  },
  digestive: {
    id: 'digestive',
    name: 'Digestive System',
    latinName: 'Systema digestorium',
    description: 'Continuous nine-meter gastrointestinal tract and accessory glandular viscera processing nutrient hydrolysis, hepatic metabolism, and absorption.',
    color: '#F59E0B',
    softColor: 'rgba(245, 158, 11, 0.16)',
    iconName: 'Utensils',
    organCount: 9
  },
  nervous: {
    id: 'nervous',
    name: 'Nervous System',
    latinName: 'Systema nervosum',
    description: 'Central and peripheral neural bio-electrical network processing sensory afferents, synaptic cognition, and motor efferent impulses.',
    color: '#8B5CF6',
    softColor: 'rgba(139, 92, 246, 0.16)',
    iconName: 'Zap',
    organCount: 5
  },
  urinary: {
    id: 'urinary',
    name: 'Urinary System',
    latinName: 'Systema urinarium',
    description: 'Bilateral nephron renal filtration controlling plasma osmolality, electrolyte balance, blood pressure, and nitrogenous waste excretion.',
    color: '#10B981',
    softColor: 'rgba(16, 185, 129, 0.16)',
    iconName: 'Droplet',
    organCount: 4
  },
  endocrine: {
    id: 'endocrine',
    name: 'Endocrine System',
    latinName: 'Systema endocrinum',
    description: 'Ductless glandular organ network secreting specialized hormones directly into circulatory capillaries to regulate systemic homeostasis.',
    color: '#EC4899',
    softColor: 'rgba(236, 72, 153, 0.16)',
    iconName: 'Sparkles',
    organCount: 5
  },
  lymphatic: {
    id: 'lymphatic',
    name: 'Lymphatic & Immune System',
    latinName: 'Systema lymphaticum',
    description: 'Specialized vascular network and lymphoid organs maintaining interstitial fluid balance, lipid absorption, and immune surveillance against pathogens.',
    color: '#10B981',
    softColor: 'rgba(16, 185, 129, 0.16)',
    iconName: 'Shield',
    organCount: 4
  }
};

// ----------------------------------------------------------------------------
// ALL ANATOMICAL STRUCTURES
// ----------------------------------------------------------------------------
export const ANATOMY_STRUCTURES: Record<string, AnatomicalStructure> = {
  // ==========================================================================
  // CARDIOVASCULAR
  // ==========================================================================
  heart: {
    id: 'heart',
    name: 'Heart',
    latinName: 'Cor',
    system: 'cardiovascular',
    complexity: 'overview',
    color: '#EF4444',
    accentColor: '#B91C1C',
    center: [0.08, 2.02, 0.15],
    boundsSize: [0.55, 0.50, 0.45],
    cameraFocus: {
      target: [0.08, 2.02, 0.15],
      distance: 1.6,
      elevation: 0.1
    },
    category: 'Muscular Pump / Thoracic Viscera',
    primaryFunction: 'Pumps oxygenated and deoxygenated blood through the systemic and pulmonary circuits via rhythmic electro-mechanical contractions.',
    anatomicalLocation: 'Middle mediastinum of the thorax, between the lungs, tilted slightly anteriorly and to the left (cardiac notch).',
    educationalSummary: 'The human heart beats ~100,000 times each day, propelling over 7,000 liters of blood through thousands of kilometers of blood vessels. It operates as a coordinated dual pump: the right side feeds low-pressure pulmonary circulation for gas exchange, while the thick muscular left ventricle drives high-pressure systemic perfusion.',
    keyFacts: [
      'Generates its own electrical rhythm via intrinsic pacemaker cells in the Sinoatrial (SA) node.',
      'The left ventricular wall is ~3× thicker than the right due to the high resistance of systemic circulation (120 mmHg vs 25 mmHg).',
      'Coronary arteries branch directly from the root of the ascending aorta to supply oxygen to the myocardium.',
      'Cardiac output at rest is ~5 L/min, but can exceed 25 L/min during peak athletic exertion.'
    ],
    subStructures: [
      'Right Atrium (receives deoxygenated venous blood from vena cavae)',
      'Tricuspid Valve (atrioventricular valve with 3 fibrous cusps)',
      'Right Ventricle (pumps blood into the pulmonary artery)',
      'Pulmonary Semilunar Valve (prevents backflow into right ventricle)',
      'Left Atrium (receives oxygenated blood from 4 pulmonary veins)',
      'Mitral / Bicuspid Valve (dual-cusp atrioventricular valve)',
      'Left Ventricle (thick-walled high-pressure systemic pump)',
      'Aortic Valve (tri-leaflet semilunar valve guarding the aorta)',
      'Interventricular Septum (thick muscular partition separating ventricles)',
      'Coronary Arteries & Cardiac Veins (myocardial micro-vasculature)'
    ],
    relatedSystems: ['respiratory', 'muscular', 'nervous', 'endocrine'],
    clinicalRelevance: 'Coronary artery disease, myocardial infarction, arrhythmias, valvular stenosis, and heart failure are major targets of modern cardiology and electrophysiology.',
    spatialRelationships: [
      { direction: 'Anterior', neighborName: 'Sternum & Costal Cartilages (Ribs 2–6)', neighborStructureId: 'ribcage', description: 'Sternocostal surface separated by pericardium and thin anterior lung margins.' },
      { direction: 'Posterior', neighborName: 'Esophagus & Descending Thoracic Aorta', neighborStructureId: 'aorta', description: 'Directly abuts anterior esophageal wall; left atrial dilation can cause dysphagia.' },
      { direction: 'Inferior', neighborName: 'Diaphragmatic Central Tendon', neighborStructureId: 'diaphragm', description: 'Fibrous pericardium fuses solidly to the central tendon of the respiratory diaphragm.' },
      { direction: 'Lateral', neighborName: 'Bilateral Lungs & Phrenic Nerves', neighborStructureId: 'lungs', description: 'Flanked by mediastinal pleura with phrenic nerves descending along pericardium.' }
    ],
    hasInternalView: true,
    internalStructures: [
      { id: 'right_atrium', name: 'Right Atrium', description: 'Thin-walled chamber collecting systemic venous blood via SVC and IVC.', color: '#3B82F6' },
      { id: 'tricuspid_valve', name: 'Tricuspid Valve', description: 'Fibrous atrioventricular valve anchored by chordae tendineae to papillary muscles.', color: '#E2E8F0' },
      { id: 'right_ventricle', name: 'Right Ventricle', description: 'Crescent-shaped chamber ejecting blood through the pulmonary trunk.', color: '#2563EB' },
      { id: 'left_atrium', name: 'Left Atrium', description: 'Posterior chamber receiving oxygen-rich pulmonary venous return.', color: '#F87171' },
      { id: 'mitral_valve', name: 'Mitral (Bicuspid) Valve', description: 'Highest-stress valve in the body, withstanding 120 mmHg systolic pressure.', color: '#F1F5F9' },
      { id: 'left_ventricle', name: 'Left Ventricle', description: 'Massive conical myocardium producing systemic arterial pulse waves.', color: '#DC2626' },
      { id: 'interventricular_septum', name: 'Interventricular Septum', description: 'Muscular wall housing the Bundle of His conduction system.', color: '#991B1B' },
      { id: 'aortic_valve', name: 'Aortic Valve', description: 'Semilunar valve preventing aortic diastolic regurgitation.', color: '#FEF08A' }
    ],
    hasProcessAnimation: true,
    processConfig: {
      id: 'cardiac_cycle',
      name: 'Cardiac Cycle & Hemodynamic Flow',
      description: 'Follow the synchronous electrical excitation, valve motions, and directional blood flow across systolic and diastolic phases.',
      defaultSpeed: 1.0,
      rateUnit: 'BPM',
      defaultRate: 72,
      minRate: 40,
      maxRate: 160,
      stages: [
        { name: 'Late Diastole', description: 'Atria and ventricles are relaxed; passive AV valve filling occurs (70% of ventricular volume).', color: '#60A5FA' },
        { name: 'Atrial Systole', description: 'SA node fires; atria contract to squeeze the remaining 30% into ventricles (the "atrial kick").', color: '#3B82F6' },
        { name: 'Isovolumetric Contraction', description: 'Ventricles depolarize; AV valves snap shut (producing the S1 "lub" sound); pressure rises rapidly without volume change.', color: '#EF4444' },
        { name: 'Ventricular Ejection', description: 'Intraventricular pressure exceeds aortic/pulmonary pressure; semilunar valves open, ejecting stroke volume.', color: '#DC2626' },
        { name: 'Isovolumetric Relaxation', description: 'Ventricles repolarize; semilunar valves slam shut (S2 "dub" sound); cycle prepares to repeat.', color: '#F87171' }
      ]
    },
    multiLevelPathway: [
      {
        level: 'Body',
        title: 'Whole Human Organism',
        scientificName: 'Homo sapiens',
        description: 'The body coordinates systemic cellular perfusion via autoregulated baroreceptors in the carotid sinus and aortic arch.',
        microscopicScale: '1.75 m',
        keyMoleculesOrStructures: ['Total Blood Volume (~5 L)', 'Mean Arterial Pressure (93 mmHg)', 'Cardiac Output'],
        inquiryPrompt: 'Why does orthostatic posture change require millisecond baroreflex adjustments?'
      },
      {
        level: 'System',
        title: 'Cardiovascular Circulatory Network',
        scientificName: 'Systema cardiovasculare',
        description: 'Over 100,000 kilometers of compliant arteries, resistance arterioles, capillaries, and capacitance veins arranged in series and parallel.',
        microscopicScale: '1.2 m',
        keyMoleculesOrStructures: ['Systemic Circuit', 'Pulmonary Circuit', 'Arteriolar Resistance Beds'],
        inquiryPrompt: 'How does parallel arrangement allow the body to redirect blood to muscles during exercise without starving the brain?'
      },
      {
        level: 'Organ',
        title: 'The Heart',
        scientificName: 'Cor humanum',
        description: 'Four-chambered muscular organ encased in the fibroserous pericardial sac with coronary circulation.',
        microscopicScale: '12 cm',
        keyMoleculesOrStructures: ['Myocardium', 'Epicardium', 'Endocardium', 'Cardiac Fibrous Skeleton'],
        inquiryPrompt: 'How does the fibrous skeleton electrically isolate the atria from the ventricles?'
      },
      {
        level: 'Structure',
        title: 'Left Ventricular Myocardium',
        scientificName: 'Myocardium ventriculi sinistri',
        description: 'Spiraling helical bands of myocardial fibers that contract with a wringing "towel-twist" motion during systole to maximize ejection fraction.',
        microscopicScale: '15 mm',
        keyMoleculesOrStructures: ['Subendocardial Fibers', 'Mid-myocardial Layer', 'Subepicardial Fibers'],
        inquiryPrompt: 'Why is torsional wringing mechanically more energy-efficient than simple radial constriction?'
      },
      {
        level: 'Tissue',
        title: 'Striated Cardiac Muscle & Intercalated Discs',
        scientificName: 'Textus muscularis striatus cardiacus',
        description: 'Branching, uninucleated cardiomyocytes interconnected by intercalated discs containing mechanical desmosomes and electrical gap junctions (connexin-43).',
        microscopicScale: '100 μm',
        keyMoleculesOrStructures: ['Intercalated Discs', 'Gap Junctions (Connexon)', 'Fascia Adhaerens', 'Desmosomes'],
        inquiryPrompt: 'How do gap junctions allow cardiomyocytes to function as a functional electrical syncytium?'
      },
      {
        level: 'Cell',
        title: 'Cardiomyocyte & Sarcoplasmic Reticulum',
        scientificName: 'Cardiomyocytus',
        description: 'High-density mitochondrial cell (>40% cell volume) featuring deep transverse T-tubules and specialized L-type calcium channels (Cav1.2).',
        microscopicScale: '20 μm',
        keyMoleculesOrStructures: ['T-Tubules', 'Ryanodine Receptors (RyR2)', 'SERCA2a Ca²⁺-ATPase', 'Dense Mitochondria'],
        inquiryPrompt: 'What is Calcium-Induced Calcium Release (CICR) and why is it essential for excitation-contraction coupling?'
      },
      {
        level: 'Molecule',
        title: 'Actin-Myosin Crossbridge & ATP Hydrolysis',
        scientificName: 'Sarcomere Molecular Motor',
        description: 'Myosin heavy-chain heads bind filamentous actin, executing a 70° power stroke powered by ATP hydrolysis, regulated by troponin C and tropomyosin.',
        microscopicScale: '2 nm',
        keyMoleculesOrStructures: ['Cardiac Myosin Heavy Chain (MYH7)', 'Alpha-Actin', 'Troponin Complex (TnC, TnI, TnT)', 'ATP / ADP + Pi'],
        inquiryPrompt: 'How does serum cardiac Troponin-I release serve as the definitive gold-standard biomarker for acute myocardial infarction?'
      }
    ]
  },

  heart_left_ventricle: {
    id: 'heart_left_ventricle',
    name: 'Left Ventricle (Systemic Pump)',
    latinName: 'Ventriculus sinister cordis',
    system: 'cardiovascular',
    complexity: 'detailed',
    color: '#DC2626',
    accentColor: '#B91C1C',
    center: [0.10, 1.95, 0.18],
    boundsSize: [0.35, 0.45, 0.35],
    cameraFocus: { target: [0.10, 1.95, 0.18], distance: 1.4 },
    category: 'Thick-Walled High-Pressure Myocardial Chamber',
    primaryFunction: 'Pumps oxygenated blood through the aortic valve into the systemic arterial tree against 120 mmHg afterload resistance.',
    anatomicalLocation: 'Forms the apex and left border of the heart, posteroinferior within the pericardial sac.',
    educationalSummary: 'The left ventricle has a conical shape with a muscular wall three times thicker than the right ventricle (8–12 mm vs 3–5 mm). It features prominent trabeculae carneae and two large papillary muscles (anterior and posterior) tethering the mitral valve leaflets via chordae tendineae.',
    keyFacts: [
      'Generates normal peak systolic pressures of 100–140 mmHg.',
      'Ejection fraction (EF) normally ranges from 55% to 70%.',
      'Hypertrophy occurs compensatorily in systemic hypertension or aortic valve stenosis.'
    ],
    subStructures: ['Interventricular Septum', 'Anterior Papillary Muscle', 'Posterior Papillary Muscle', 'Trabeculae Carneae', 'Aortic Vestibule'],
    relatedSystems: ['cardiovascular', 'respiratory'],
    clinicalRelevance: 'Left ventricular hypertrophy (LVH), congestive heart failure, anterior wall myocardial infarction, and dilated cardiomyopathy.'
  },

  heart_right_ventricle: {
    id: 'heart_right_ventricle',
    name: 'Right Ventricle (Pulmonary Pump)',
    latinName: 'Ventriculus dexter cordis',
    system: 'cardiovascular',
    complexity: 'detailed',
    color: '#2563EB',
    accentColor: '#1D4ED8',
    center: [0.02, 1.98, 0.20],
    boundsSize: [0.35, 0.45, 0.35],
    cameraFocus: { target: [0.02, 1.98, 0.20], distance: 1.4 },
    category: 'Low-Pressure Pulmonary Myocardial Chamber',
    primaryFunction: 'Ejects deoxygenated blood through the pulmonary valve into the pulmonary arterial trunk for alveolar oxygenation.',
    anatomicalLocation: 'Forms the anterior sternocostal surface of the heart, directly behind the lower sternum.',
    educationalSummary: 'The right ventricle is crescent-shaped in cross section, wrapping around the convex interventricular septum. It generates lower pressures (20–25 mmHg) adequate for low-resistance pulmonary capillary perfusion without causing alveolar pulmonary edema.',
    keyFacts: [
      'Contains the moderator band (septomarginal trabecula) conducting electrical purkinje fibers to the anterior papillary muscle.',
      'Thin wall (~3–5 mm) suited for high-capacitance volume ejection rather than high pressure.',
      'Tricuspid valve anchors via chordae tendineae to anterior, posterior, and septal papillary muscles.'
    ],
    subStructures: ['Infundibulum / Conus Arteriosus', 'Moderator Band', 'Tricuspid Papillary Muscles', 'Trabeculae Carneae'],
    relatedSystems: ['respiratory', 'cardiovascular'],
    clinicalRelevance: 'Right heart failure (cor pulmonale), arrhythmogenic right ventricular cardiomyopathy (ARVC), and pulmonary hypertension.'
  },

  heart_valves: {
    id: 'heart_valves',
    name: 'Cardiac Heart Valves (Mitral, Tricuspid, Aortic, Pulmonary)',
    latinName: 'Valvae cordis',
    system: 'cardiovascular',
    complexity: 'detailed',
    color: '#FEF08A',
    accentColor: '#FACC15',
    center: [0.06, 2.10, 0.16],
    boundsSize: [0.35, 0.35, 0.35],
    cameraFocus: { target: [0.06, 2.10, 0.16], distance: 1.3 },
    category: 'Unidirectional Fibrous Hemodynamic Gates',
    primaryFunction: 'Ensures strictly unidirectional, non-regurgitant blood flow through the cardiac chambers and into the great outflow arteries.',
    anatomicalLocation: 'Embedded in the fibrous cardiac skeleton (annuli fibrosi) at the atrioventricular junction and arterial roots.',
    educationalSummary: 'The four cardiac valves operate entirely passively via hydrostatic pressure differentials across leaflets: two atrioventricular (AV) valves (Tricuspid on the right, Mitral/Bicuspid on the left) prevent systolic backflow into atria, and two semilunar valves (Aortic and Pulmonary) prevent diastolic backflow into ventricles.',
    keyFacts: [
      'Heart sounds S1 ("lub") and S2 ("dub") are caused by turbulent vibrations upon valve leaflet closure.',
      'The mitral valve endures the highest mechanical pressure gradient in the body (~120 mmHg during systole).',
      'Aortic semilunar leaflets feature the Nodules of Arantius ensuring complete central closure.'
    ],
    subStructures: ['Mitral (Bicuspid) Valve', 'Tricuspid Valve', 'Aortic Semilunar Valve', 'Pulmonary Semilunar Valve', 'Chordae Tendineae', 'Fibrous Annuli'],
    relatedSystems: ['cardiovascular'],
    clinicalRelevance: 'Mitral valve prolapse (MVP), aortic stenosis, rheumatic heart disease, infective endocarditis, and prosthetic valve replacement.'
  },

  aorta: {
    id: 'aorta',
    name: 'Aorta & Major Arteries',
    latinName: 'Aorta',
    system: 'cardiovascular',
    complexity: 'overview',
    color: '#DC2626',
    accentColor: '#EF4444',
    center: [0.03, 2.05, 0.05],
    boundsSize: [0.6, 2.8, 0.4],
    cameraFocus: { target: [0.03, 2.05, 0.05], distance: 2.6 },
    category: 'Elastic High-Pressure Conduit',
    primaryFunction: 'Transports oxygen-saturated systemic arterial blood under high pulsatile pressure from the left ventricle to the systemic capillary beds.',
    anatomicalLocation: 'Originates at the aortic root, arches posteriorly and leftward, descends through the posterior mediastinum and retroperitoneum.',
    educationalSummary: 'The aorta is the largest artery in the human body, measuring ~2.5 cm in diameter. Its rich elastic lamellae in the tunica media stretch during ventricular systole and recoil during diastole (the Windkessel effect), maintaining continuous arterial blood flow even between heartbeats.',
    keyFacts: [
      'The Windkessel effect dampens peak systolic pressure and sustains diastolic pressure at ~80 mmHg.',
      'Branches from the aortic arch supply the head, neck, and upper limbs (brachiocephalic trunk, left common carotid, left subclavian).',
      'Bifurcates at vertebral level L4 into the left and right common iliac arteries.',
      'Experiences shear stress of over 1.5 Pa, demanding strong endothelial barrier function.'
    ],
    subStructures: [
      'Aortic Root & Sinuses of Valsalva',
      'Ascending Aorta',
      'Aortic Arch (gives off 3 great supra-aortic branches)',
      'Descending Thoracic Aorta',
      'Abdominal Aorta (celiac trunk, SMA, renal arteries, IMA)',
      'Common Iliac Bifurcation'
    ],
    relatedSystems: ['respiratory', 'nervous', 'urinary'],
    clinicalRelevance: 'Aortic aneurysms, aortic dissection, coarctation, and atherosclerotic plaque formation represent life-threatening vascular emergencies.'
  },

  vena_cava: {
    id: 'vena_cava',
    name: 'Vena Cava & Major Veins',
    latinName: 'Vena cava',
    system: 'cardiovascular',
    complexity: 'overview',
    color: '#2563EB',
    accentColor: '#3B82F6',
    center: [0.06, 2.00, 0.08],
    boundsSize: [0.55, 3.2, 0.35],
    cameraFocus: { target: [0.06, 2.00, 0.08], distance: 2.6 },
    category: 'Low-Pressure Venous Return',
    primaryFunction: 'Collects deoxygenated systemic venous return from the upper body (SVC) and lower body (IVC) and returns it to the right atrium.',
    anatomicalLocation: 'Ascends through the abdominal retroperitoneum on the right side of the abdominal aorta and traverses the vena caval foramen of the diaphragm.',
    educationalSummary: 'The Superior Vena Cava (SVC) drains the head, neck, and upper extremities, while the Inferior Vena Cava (IVC) is the largest vein in the body, draining the abdomen, pelvis, and lower limbs. Operating at low pressures (2–6 mmHg), venous return is driven by skeletal muscle pumps and intrathoracic respiratory vacuum.',
    keyFacts: [
      'The IVC has no valves; blood flow relies on the thoracoabdominal pump and downstream pressure gradients.',
      'Receives massive hepatic venous return directly from the liver before entering the right atrium.',
      'Thin tunica media with high venous capacitance allows veins to act as the primary blood reservoir (holding ~65% of total blood volume).'
    ],
    subStructures: ['Superior Vena Cava (SVC)', 'Inferior Vena Cava (IVC)', 'Jugular Veins', 'Subclavian Veins', 'Common Iliac Veins'],
    relatedSystems: ['respiratory', 'digestive', 'urinary'],
    clinicalRelevance: 'Superior vena cava syndrome, deep vein thrombosis (DVT), and IVC filters are pivotal topics in vascular medicine.'
  },

  // ==========================================================================
  // RESPIRATORY
  // ==========================================================================
  lungs: {
    id: 'lungs',
    name: 'Lungs & Bronchial Tree',
    latinName: 'Pulmones',
    system: 'respiratory',
    complexity: 'overview',
    color: '#06B6D4',
    accentColor: '#0891B2',
    center: [0.02, 1.77, 0.01],
    boundsSize: [1.25, 1.65, 0.95],
    cameraFocus: { target: [0.02, 1.77, 0.01], distance: 2.6 },
    category: 'Respiratory Gas Exchange Viscera',
    primaryFunction: 'Exchanges oxygen and carbon dioxide between ambient inspired air and pulmonary capillary blood via alveolar micro-diffusion.',
    anatomicalLocation: 'Bilateral pleural cavities within the thoracic cage, flanking the mediastinum and resting inferiorly upon the diaphragm.',
    educationalSummary: 'The human lungs contain approximately 300 to 500 million microscopic alveoli, creating an enormous internal gas-exchange surface area of ~70 to 100 square meters—roughly equivalent to half a tennis court. The right lung has three lobes (superior, middle, inferior), while the left lung has two lobes with a cardiac notch accommodating the heart.',
    keyFacts: [
      'Air traverses through 23 branching generations of airways from the trachea down to terminal alveoli.',
      'The alveolar-capillary membrane is extraordinarily thin—only 0.2 to 0.5 micrometers—enabling passive diffusion within 0.25 seconds.',
      'Type II pneumocytes synthesize pulmonary surfactant, lowering surface tension to prevent end-expiratory alveolar collapse (atelectasis).',
      'Resting tidal volume is ~500 mL per breath, delivering ~6 liters of minute ventilation at 12–16 breaths/min.'
    ],
    subStructures: [
      'Right Superior, Middle, and Inferior Lobes',
      'Left Superior and Inferior Lobes (with Cardiac Notch)',
      'Visceral and Parietal Pleural Membranes',
      'Primary, Secondary (Lobar), and Tertiary (Segmental) Bronchi',
      'Conducting and Respiratory Bronchioles',
      'Alveolar Sacs & Capillary Plexus'
    ],
    relatedSystems: ['cardiovascular', 'muscular', 'nervous'],
    clinicalRelevance: 'Asthma, Chronic Obstructive Pulmonary Disease (COPD), pneumonia, pulmonary embolism, and Acute Respiratory Distress Syndrome (ARDS).',
    hasInternalView: true,
    internalStructures: [
      { id: 'trachea_carina', name: 'Trachea & Carina', description: 'Cartilaginous airway bifurcating at the carina into left and right main bronchi.', color: '#E2E8F0' },
      { id: 'bronchial_tree', name: 'Secondary & Tertiary Bronchial Tree', description: 'Extensive tree of conducting conduits lined with ciliated pseudostratified epithelium.', color: '#38BDF8' },
      { id: 'bronchioles', name: 'Terminal & Respiratory Bronchioles', description: 'Smooth muscle-encircled airways lacking cartilage, susceptible to bronchospasm.', color: '#0EA5E9' },
      { id: 'alveolar_clusters', name: 'Alveoli & Alveolar Sacs', description: 'Microscopic spherical clusters where Fick\'s law gas diffusion occurs.', color: '#F472B6' },
      { id: 'pulmonary_arterioles', name: 'Pulmonary Capillary Mesh', description: 'Dense microvascular network encasing every individual alveolus.', color: '#EF4444' }
    ],
    hasProcessAnimation: true,
    processConfig: {
      id: 'respiratory_cycle',
      name: 'Ventilatory Breathing Cycle & Alveolar Exchange',
      description: 'Observe active diaphragm depression, negative intrathoracic pressure generation, and alveolar O₂/CO₂ partial pressure shifts.',
      defaultSpeed: 1.0,
      rateUnit: 'Breaths/min',
      defaultRate: 14,
      minRate: 8,
      maxRate: 36,
      stages: [
        { name: 'Inspiration (Diaphragm Contraction)', description: 'Diaphragm flattens downward; external intercostals elevate ribs; thoracic volume expands, dropping intrapleural pressure to -8 cmH₂O.', color: '#06B6D4' },
        { name: 'Alveolar Inflow', description: 'Ambient air rushes down pressure gradient into alveolar ducts; alveolar PO₂ rises to ~104 mmHg.', color: '#38BDF8' },
        { name: 'Capillary Gas Diffusion', description: 'Oxygen diffuses down partial pressure gradient into erythrocytes; CO₂ diffuses from plasma into alveoli.', color: '#EC4899' },
        { name: 'Passive Expiration', description: 'Diaphragm and thoracic wall elastically recoil; intra-alveolar pressure rises above atmospheric; gas is expelled.', color: '#64748B' }
      ]
    },
    multiLevelPathway: [
      {
        level: 'Body',
        title: 'Whole Organism Ventilation',
        scientificName: 'Systema respiratorium',
        description: 'Chemoreceptors in the brainstem medulla and carotid body monitor arterial PCO₂ and pH to drive ventilatory drive.',
        microscopicScale: '1.75 m',
        keyMoleculesOrStructures: ['Minute Ventilation', 'Arterial Blood Gas (ABG)', 'PaO₂ (~95 mmHg)', 'PaCO₂ (~40 mmHg)'],
        inquiryPrompt: 'Why is arterial CO₂ rather than O₂ the primary trigger driving involuntary ventilation in healthy humans?'
      },
      {
        level: 'Organ',
        title: 'Lungs & Pleural Cavity',
        scientificName: 'Pulmo dexter et sinister',
        description: 'Dual viscoelastic organs suspended within sealed sub-atmospheric pleural fluid spaces.',
        microscopicScale: '25 cm',
        keyMoleculesOrStructures: ['Pleural Fluid', 'Hilar Neurovascular Bundle', 'Elastic Parenchyma'],
        inquiryPrompt: 'What happens to pulmonary mechanics when pleural seal integrity is broken (pneumothorax)?'
      },
      {
        level: 'Structure',
        title: 'Alveolus & Alveolar Sac',
        scientificName: 'Sacculus alveolaris',
        description: 'Thin-walled terminal air sac (diameter ~200 μm) surrounded by a continuous capillary meshwork.',
        microscopicScale: '200 μm',
        keyMoleculesOrStructures: ['Alveolar Pore of Kohn', 'Basement Membrane', 'Pulmonary Capillaries'],
        inquiryPrompt: 'How do Pores of Kohn provide collateral ventilation if a terminal bronchiole becomes obstructed?'
      },
      {
        level: 'Cell',
        title: 'Type I & Type II Pneumocytes',
        scientificName: 'Pneumocytus typus I et II',
        description: 'Squamous Type I cells cover 95% of alveolar surface for gas diffusion; cuboidal Type II cells synthesize pulmonary surfactant from lamellar bodies.',
        microscopicScale: '15 μm',
        keyMoleculesOrStructures: ['Dipalmitoylphosphatidylcholine (DPPC)', 'Lamellar Bodies', 'Surfactant Proteins (SP-A, B, C, D)'],
        inquiryPrompt: 'Why does premature birth before surfactant synthesis lead to Infant Respiratory Distress Syndrome?'
      },
      {
        level: 'Molecule',
        title: 'Alveolar-Capillary Diffusion & Hemoglobin Binding',
        scientificName: 'Hemoglobin Oxygenation Mechanism',
        description: 'O₂ traverses the 0.3 μm membrane, dissolves in plasma, and cooperatively binds four heme iron centers in erythrocyte hemoglobin (Hb(O₂)₄).',
        microscopicScale: '1.5 nm',
        keyMoleculesOrStructures: ['Tetrameric Hemoglobin', 'Heme Porphyrin Ring (Fe²⁺)', '2,3-Bisphosphoglycerate', 'Carbonic Anhydrase'],
        inquiryPrompt: 'How does the sigmoidal oxygen-hemoglobin dissociation curve ensure rapid unloading at tissues with low PO₂?'
      }
    ]
  },

  trachea: {
    id: 'trachea',
    name: 'Trachea & Upper Airway',
    latinName: 'Trachea',
    system: 'respiratory',
    complexity: 'overview',
    color: '#0891B2',
    accentColor: '#06B6D4',
    center: [0.0, 2.35, 0.05],
    boundsSize: [0.35, 1.0, 0.35],
    cameraFocus: { target: [0.0, 2.35, 0.05], distance: 1.8 },
    category: 'Cartilaginous Conducting Conduit',
    primaryFunction: 'Provides an unobstructed, patent airway for laminar airflow while humidifying, warming, and filtering inhaled particulates.',
    anatomicalLocation: 'Anterior neck and superior mediastinum, extending from the cricoid cartilage (C6) to the tracheal bifurcation / carina (T4/T5).',
    educationalSummary: 'The trachea is reinforced by 16 to 20 C-shaped hyaline cartilage rings that prevent collapse during negative intrathoracic inspiratory pressure. Its posterior trachealis muscle borders the esophagus, allowing the esophagus to expand anteriorly during deglutition.',
    keyFacts: [
      'Lined with pseudostratified ciliated columnar epithelium with mucus-secreting goblet cells.',
      'The mucociliary escalator beats upward at ~1,000 strokes/min to expel trapped microbes and pollutants toward the pharynx.',
      'The cough reflex initiates with a deep inspiration, vocal fold closure, and explosive release at up to 800 km/h air velocity.'
    ],
    subStructures: ['C-shaped Cartilage Rings', 'Trachealis Muscle', 'Carina Tracheae', 'Mucociliary Escalator'],
    relatedSystems: ['digestive', 'nervous'],
    clinicalRelevance: 'Endotracheal intubation, tracheostomy, tracheomalacia, and foreign body aspiration (most commonly lodging in the wider, steeper right main bronchus).'
  },

  diaphragm: {
    id: 'diaphragm',
    name: 'Diaphragm Muscle',
    latinName: 'Diaphragma',
    system: 'respiratory',
    complexity: 'detailed',
    color: '#BE123C',
    accentColor: '#E11D48',
    center: [0.0, 1.60, 0.02],
    boundsSize: [1.6, 0.5, 1.0],
    cameraFocus: { target: [0.0, 1.60, 0.02], distance: 2.2 },
    category: 'Primary Inspiratory Musculotendinous Septum',
    primaryFunction: 'Main muscle of respiration; contracts and flattens downward to increase thoracic volume during inspiration, and separates the thoracic and abdominal cavities.',
    anatomicalLocation: 'Floors the thoracic cavity and roofs the abdominal cavity, inserting into the central tendon (centrum tendineum).',
    educationalSummary: 'The diaphragm accounts for 75% of resting inspiratory tidal volume. It is pierced by three major apertures: the caval opening (T8) for the IVC, the esophageal hiatus (T10) for the esophagus and vagus nerves, and the aortic hiatus (T12) for the descending aorta and thoracic duct.',
    keyFacts: [
      'Innervated exclusively by the bilateral phrenic nerves arising from cervical spinal nerve roots C3, C4, C5 ("C3, 4, 5 keep the diaphragm alive").',
      'Contracts voluntarily during singing or breath-holding, and involuntarily via autonomic brainstem respiratory pacemakers.',
      'Hiccups (singultus) result from involuntary spasmodic diaphragmatic contractions followed by sudden glottic closure.'
    ],
    subStructures: ['Central Tendon', 'Right and Left Crura', 'Caval Aperture (T8)', 'Esophageal Hiatus (T10)', 'Aortic Hiatus (T12)'],
    relatedSystems: ['muscular', 'nervous', 'digestive'],
    clinicalRelevance: 'Hiatal hernia, diaphragmatic eventration, phrenic nerve palsy, and ventilator-induced diaphragmatic dysfunction.'
  },

  // ==========================================================================
  // DIGESTIVE
  // ==========================================================================
  stomach: {
    id: 'stomach',
    name: 'Stomach',
    latinName: 'Gaster / Ventriculus',
    system: 'digestive',
    complexity: 'overview',
    color: '#F59E0B',
    accentColor: '#D97706',
    center: [-0.18, 1.55, 0.12],
    boundsSize: [0.65, 0.70, 0.55],
    cameraFocus: { target: [-0.18, 1.55, 0.12], distance: 1.8 },
    category: 'Gastrointestinal Chemical & Mechanical Reservoir',
    primaryFunction: 'Mixes ingested food with acidic gastric juice (pH 1.5–2.0) and pepsin to form chyme, and regulates delivery to the duodenum.',
    anatomicalLocation: 'Left upper quadrant (epigastric, umbilical, and left hypochondriac regions) beneath the left lobe of the liver and diaphragm.',
    educationalSummary: 'The stomach features a unique three-layer muscularis externa (inner oblique, middle circular, outer longitudinal) enabling vigorous churning peristalsis. Its thick mucosal lining contains deep gastric pits housing parietal cells (secreting HCl and intrinsic factor) and chief cells (secreting pepsinogen).',
    keyFacts: [
      'Secretes intrinsic factor, essential for terminal ileal absorption of Vitamin B12 and normal erythropoiesis.',
      'Surface mucus cells secrete a thick alkaline mucus bicarbonate barrier protecting the gastric wall from autodigestion.',
      'Resting volume is ~50 mL, but rugae folds allow expansion to over 1.5 to 2.0 liters after a meal.',
      'The pyloric sphincter meticulously meters chyme into the duodenum at ~2–3 mL per peristaltic wave.'
    ],
    subStructures: ['Cardia', 'Fundus', 'Body (Corpus)', 'Pyloric Antrum & Canal', 'Pyloric Sphincter', 'Greater and Lesser Curvatures', 'Rugae Mucosal Folds'],
    relatedSystems: ['nervous', 'endocrine', 'cardiovascular'],
    clinicalRelevance: 'Peptic ulcer disease (Helicobacter pylori), gastroesophageal reflux (GERD), gastroparesis, and gastric adenocarcinoma.',
    hasInternalView: true,
    internalStructures: [
      { id: 'gastric_fundus', name: 'Gastric Fundus', description: 'Dome-shaped upper reservoir accommodating swallowed air and ingested boluses.', color: '#F59E0B' },
      { id: 'gastric_corpus', name: 'Gastric Corpus (Body)', description: 'Central chamber featuring rugae folds and parietal cells secreting hydrochloric acid.', color: '#D97706' },
      { id: 'gastric_antrum', name: 'Pyloric Antrum & Canal', description: 'Muscular churning chamber grinding food into fine liquid chyme.', color: '#B45309' },
      { id: 'pyloric_sphincter', name: 'Pyloric Sphincter Valve', description: 'Powerful smooth muscle ring metering chyme into the duodenal bulb.', color: '#92400E' }
    ]
  },

  liver: {
    id: 'liver',
    name: 'Liver',
    latinName: 'Hepar',
    system: 'digestive',
    complexity: 'overview',
    color: '#991B1B',
    accentColor: '#7F1D1D',
    center: [-0.15, 1.40, 0.04],
    boundsSize: [0.80, 0.80, 0.80],
    cameraFocus: { target: [-0.15, 1.40, 0.04], distance: 2.0 },
    category: 'Metabolic & Exocrine Glandular Powerhouse',
    primaryFunction: 'Metabolizes macronutrients, synthesizes plasma albumin and clotting factors, detoxifies endogenous/exogenous compounds, and produces bile.',
    anatomicalLocation: 'Right upper quadrant of the abdominal cavity, protected under the right lower ribs (ribs 7–11) directly beneath the diaphragm.',
    educationalSummary: 'The liver is the heaviest internal organ (~1.5 kg) and the primary biochemical processing plant of the body. It receives a unique dual blood supply: 75% enters via the hepatic portal vein carrying absorbed nutrients from intestines, and 25% enters via the hepatic artery delivering oxygen.',
    keyFacts: [
      'Composed of hexagonal hepatic lobules centered around a central vein with portal triads at the periphery.',
      'Produces ~800 to 1,000 mL of alkaline bile daily to emulsify dietary lipids.',
      'Possesses astonishing regenerative capacity—can regenerate to full functional volume even after 70% surgical resection.',
      'Kupffer cells resident in hepatic sinusoids represent the largest population of tissue macrophages in the body.'
    ],
    subStructures: ['Right Lobe', 'Left Lobe', 'Caudate Lobe', 'Quadrate Lobe', 'Falciform Ligament', 'Porta Hepatis', 'Bile Ducts'],
    relatedSystems: ['cardiovascular', 'endocrine', 'urinary'],
    clinicalRelevance: 'Cirrhosis, viral hepatitis (A, B, C), non-alcoholic fatty liver disease (NAFLD/MASH), portal hypertension, and acute liver failure.',
    hasInternalView: true,
    internalStructures: [
      { id: 'liver_right_lobe', name: 'Right Hepatic Lobe', description: 'Largest liver lobe comprising Couinaud segments V, VI, VII, and VIII.', color: '#991B1B' },
      { id: 'liver_left_lobe', name: 'Left Hepatic Lobe', description: 'Flatter lobe comprising Couinaud segments II, III, and IV.', color: '#B91C1C' },
      { id: 'caudate_lobe', name: 'Caudate Lobe', description: 'Autonomous posterior segment draining directly into the Inferior Vena Cava.', color: '#7F1D1D' },
      { id: 'porta_hepatis', name: 'Porta Hepatis (Portal Triad)', description: 'Deep fissure transmitting the hepatic portal vein, hepatic artery proper, and common hepatic bile duct.', color: '#3B82F6' }
    ]
  },

  pancreas: {
    id: 'pancreas',
    name: 'Pancreas',
    latinName: 'Pancreas',
    system: 'digestive',
    complexity: 'detailed',
    color: '#FBBF24',
    accentColor: '#F59E0B',
    center: [-0.05, 1.35, 0.02],
    boundsSize: [0.65, 0.30, 0.25],
    cameraFocus: { target: [-0.05, 1.35, 0.02], distance: 1.6 },
    category: 'Dual Exocrine & Endocrine Gland',
    primaryFunction: 'Exocrine acinar cells secrete digestive enzymes and bicarbonate into the duodenum; endocrine Islets of Langerhans secrete insulin and glucagon.',
    anatomicalLocation: 'Retroperitoneal organ tucked horizontally across the posterior abdominal wall within the C-shaped duodenal loop.',
    educationalSummary: 'The pancreas is essential for both digestion and glycemic regulation. Its exocrine portion secretes trypsinogen, chymotrypsinogen, pancreatic lipase, and amylase. Its endocrine Islets of Langerhans contain beta cells (insulin) and alpha cells (glucagon) that dynamically govern glucose homeostasis.',
    keyFacts: [
      'Secretes digestive enzymes as inactive zymogens to prevent fatal pancreatic autodigestion.',
      'Pancreatic bicarbonate neutralizes acidic gastric chyme in the duodenum from pH 2 to pH 7–8.',
      'Endocrine tissue accounts for only ~1–2% of pancreatic mass, yet regulates global cellular energy metabolism.'
    ],
    subStructures: ['Head (in duodenal loop)', 'Uncinate Process', 'Neck', 'Body', 'Tail (extending toward spleen)', 'Main Pancreatic Duct (Wirsung)'],
    relatedSystems: ['endocrine', 'cardiovascular'],
    clinicalRelevance: 'Type 1 and Type 2 Diabetes Mellitus, acute/chronic pancreatitis, cystic fibrosis, and pancreatic ductal adenocarcinoma.'
  },

  intestines: {
    id: 'intestines',
    name: 'Intestines (Small & Large)',
    latinName: 'Intestina',
    system: 'digestive',
    complexity: 'overview',
    color: '#D97706',
    accentColor: '#B45309',
    center: [0.08, 0.49, 0.15],
    boundsSize: [0.85, 1.65, 0.75],
    cameraFocus: { target: [0.08, 0.49, 0.15], distance: 2.5 },
    category: 'Digestive Absorption & Elimination Tract',
    primaryFunction: 'Small intestine completes enzymatic digestion and absorbs 90% of nutrients; large intestine absorbs water and electrolytes, and forms feces.',
    anatomicalLocation: 'Occupies the middle and lower abdominal cavity, framed peripherally by the colon.',
    educationalSummary: 'The small intestine spans ~6 meters, amplified 600-fold by plicae circulares, intestinal villi, and microvilli to yield a 30-square-meter absorptive brush border. The large intestine (~1.5 m) houses trillions of symbiotic gut microbiome bacteria producing vitamin K and short-chain fatty acids.',
    keyFacts: [
      'Small intestine segments: Duodenum (25 cm), Jejunum (2.5 m), Ileum (3.5 m).',
      'Large intestine segments: Cecum, Ascending Colon, Transverse Colon, Descending Colon, Sigmoid Colon, Rectum.',
      'Enterocytes turnover every 3 to 5 days, making intestinal mucosa one of the fastest regenerating tissues in biology.',
      'The gut-associated lymphoid tissue (GALT) houses over 70% of the entire human immune system.'
    ],
    subStructures: ['Duodenum', 'Jejunum', 'Ileum', 'Cecum & Vermiform Appendix', 'Ascending, Transverse, Descending, and Sigmoid Colon', 'Rectum'],
    relatedSystems: ['cardiovascular', 'nervous', 'endocrine'],
    clinicalRelevance: 'Inflammatory bowel disease (Crohn\'s and Ulcerative Colitis), celiac disease, appendicitis, colorectal cancer, and bowel obstruction.'
  },

  // ==========================================================================
  // NERVOUS
  // ==========================================================================
  brain: {
    id: 'brain',
    name: 'Brain',
    latinName: 'Encephalon / Cerebrum',
    system: 'nervous',
    complexity: 'overview',
    color: '#8B5CF6',
    accentColor: '#7C3AED',
    center: [0.0, 3.73, -0.01],
    boundsSize: [0.65, 0.70, 0.75],
    cameraFocus: { target: [0.0, 3.73, -0.01], distance: 1.8 },
    category: 'Central Nervous System Control Center',
    primaryFunction: 'Processes sensory input, executes motor commands, coordinates autonomic homeostasis, and produces consciousness, cognition, and memory.',
    anatomicalLocation: 'Cranial cavity within the skull, protected by the three meningeal layers (dura, arachnoid, pia) and buoyant cerebrospinal fluid (CSF).',
    educationalSummary: 'The adult human brain weighs ~1.4 kg and contains approximately 86 billion neurons interconnected by over 100 trillion synaptic junctions. Consuming 20% of total bodily resting glucose and oxygen despite representing only 2% of body mass, it is the most metabolically dense organ in biology.',
    keyFacts: [
      'The cerebral cortex is heavily folded into gyri (ridges) and sulci (grooves) to pack 2,200 cm² of neocortex inside the cranium.',
      'Four main cerebral lobes: Frontal (executive/motor), Parietal (somatosensory), Temporal (auditory/language/memory), Occipital (vision).',
      'The Cerebellum ("little brain") contains over 50 billion neurons dedicated to motor coordination, timing, and balance.',
      'Blood-Brain Barrier (BBB) tight junctions restrict macromolecular diffusion into neural parenchyma.'
    ],
    subStructures: [
      'Frontal, Parietal, Temporal, and Occipital Lobes',
      'Corpus Callosum (interhemispheric commissure)',
      'Thalamus & Hypothalamus (sensory relay & endocrine driver)',
      'Limbic System (Hippocampus & Amygdala)',
      'Cerebellum (motor fine-tuning)',
      'Brainstem (Midbrain, Pons, Medulla Oblongata)'
    ],
    relatedSystems: ['endocrine', 'cardiovascular', 'muscular'],
    clinicalRelevance: 'Stroke (ischemic/hemorrhagic), traumatic brain injury (TBI), neurodegenerative diseases (Alzheimer\'s, Parkinson\'s), epilepsy, and psychiatric conditions.',
    hasInternalView: true,
    internalStructures: [
      { id: 'cerebral_cortex', name: 'Cerebral Cortex (Neocortex)', description: '6-layered sheet of gray matter containing pyramidal neurons responsible for higher cognitive processing.', color: '#A78BFA' },
      { id: 'corpus_callosum', name: 'Corpus Callosum', description: 'Massive white matter tract containing 200 million axonal fibers connecting left and right cerebral hemispheres.', color: '#EDE9FE' },
      { id: 'thalamus', name: 'Thalamus', description: 'Bilateral egg-shaped gateway routing all sensory modalities (except olfaction) to corresponding cortical areas.', color: '#C4B5FD' },
      { id: 'ventricles', name: 'Cerebral Ventricular System', description: 'Fluid chambers where choroid plexus produces 500 mL of sterile cerebrospinal fluid daily.', color: '#38BDF8' },
      { id: 'cerebellum', name: 'Cerebellum (Arbor Vitae)', description: 'Features branched tree-like white matter tracts and Purkinje cell layers coordinating smooth movement.', color: '#8B5CF6' },
      { id: 'brainstem', name: 'Brainstem & Medulla Oblongata', description: 'Houses vital autonomous centers controlling involuntary cardiac rate, blood pressure, and respiration.', color: '#7C3AED' }
    ],
    hasProcessAnimation: true,
    processConfig: {
      id: 'neural_signaling',
      name: 'Cortical Synaptic Action Potential Cascades',
      description: 'Trace electro-chemical propagation from cortical dendritic integration down myelinated axons to chemical synapse release.',
      defaultSpeed: 1.0,
      rateUnit: 'Hz (Firing Rate)',
      defaultRate: 25,
      minRate: 5,
      maxRate: 100,
      stages: [
        { name: 'Synaptic Summation', description: 'Dendritic spines summate excitatory (EPSP) and inhibitory (IPSP) inputs toward axon hillock.', color: '#A78BFA' },
        { name: 'Axon Hillock Threshold', description: 'Membrane potential reaches -55 mV; voltage-gated Na⁺ channels snap open, sparking the action potential.', color: '#C084FC' },
        { name: 'Saltatory Conduction', description: 'Action potential jumps rapidly between Nodes of Ranvier along the myelin sheath at up to 120 m/s.', color: '#F43F5E' },
        { name: 'Neurotransmitter Release', description: 'Depolarization opens presynaptic Cav2 channels; Ca²⁺ triggers SNARE-mediated vesicle exocytosis into the 20 nm synaptic cleft.', color: '#06B6D4' }
      ]
    },
    multiLevelPathway: [
      {
        level: 'Body',
        title: 'Central Neurological Integration',
        scientificName: 'Systema nervosum centrale',
        description: 'The brain receives afferent sensory inputs from across the body, computes adaptive decisions, and fires somatic motor commands.',
        microscopicScale: '1.75 m',
        keyMoleculesOrStructures: ['Electroencephalogram (EEG)', 'Sensory Afferents', 'Somatic Efferents'],
        inquiryPrompt: 'How does the central nervous system prioritize reflex arcs at the spinal cord before conscious awareness in the brain?'
      },
      {
        level: 'Organ',
        title: 'Human Brain',
        scientificName: 'Encephalon',
        description: 'Bilateral cerebral hemispheres, diencephalon, cerebellum, and brainstem floating in CSF.',
        microscopicScale: '15 cm',
        keyMoleculesOrStructures: ['Cerebral Lobes', 'Grey Matter', 'White Matter Tracts', 'Meninges'],
        inquiryPrompt: 'Why is white matter white? (High lipid composition of insulating myelin sheaths).'
      },
      {
        level: 'Structure',
        title: 'Cerebral Cortical Column',
        scientificName: 'Columna corticalis',
        description: 'Vertical mini-column containing ~80 to 100 interconnected neurons functioning as the fundamental computational unit of neocortex.',
        microscopicScale: '300 μm',
        keyMoleculesOrStructures: ['Layer I-VI Architecture', 'Pyramidal Neurons', 'Inhibitory Interneurons'],
        inquiryPrompt: 'How does Layer IV receive thalamic sensory inputs while Layer V projects motor outputs to spinal cord?'
      },
      {
        level: 'Cell',
        title: 'Pyramidal Neuron & Myelinated Axon',
        scientificName: 'Neuron pyramidale',
        description: 'Polarized excitable cell featuring extensive apical and basal dendritic trees, axon hillock, and oligodendrocyte myelin sheaths.',
        microscopicScale: '30 μm',
        keyMoleculesOrStructures: ['Axon Hillock', 'Nodes of Ranvier', 'Microtubule Transport (Kinesin/Dynein)'],
        inquiryPrompt: 'How does myelin insulation increase action potential conduction velocity 10-fold via saltatory conduction?'
      },
      {
        level: 'Molecule',
        title: 'Synaptic Vesicle Exocytosis & Neurotransmitter Receptors',
        scientificName: 'SNARE Complex & Ionotropic Receptors',
        description: 'Synaptotagmin senses micro-molar Ca²⁺, triggering SNARE-zippering (Syntaxin, SNAP-25, Synaptobrevin) and opening postsynaptic AMPA/NMDA channels.',
        microscopicScale: '4 nm',
        keyMoleculesOrStructures: ['Glutamate / GABA', 'Synaptotagmin-1', 'SNARE Complex', 'AMPA / NMDA Receptors'],
        inquiryPrompt: 'How does Long-Term Potentiation (LTP) at NMDA receptors serve as the cellular substrate of learning and memory?'
      }
    ]
  },

  spinal_cord: {
    id: 'spinal_cord',
    name: 'Spinal Cord & Major Nerves',
    latinName: 'Medulla spinalis',
    system: 'nervous',
    complexity: 'overview',
    color: '#A78BFA',
    accentColor: '#8B5CF6',
    center: [0.0, 1.85, -0.06],
    boundsSize: [0.35, 2.7, 0.3],
    cameraFocus: { target: [0.0, 1.85, -0.06], distance: 2.8 },
    category: 'Neural High-Speed Transmission Trunk',
    primaryFunction: 'Conducts bidirectional signals between brain and periphery, and hosts independent spinal reflex circuits.',
    anatomicalLocation: 'Runs through the vertebral canal of the spine from the foramen magnum to the conus medullaris (L1/L2 vertebrae).',
    educationalSummary: 'The spinal cord gives rise to 31 pairs of spinal nerves (8 cervical, 12 thoracic, 5 lumbar, 5 sacral, 1 coccygeal). In cross-section, butterfly-shaped central gray matter (dorsal sensory horn, ventral motor horn) is surrounded by ascending and descending white matter tracts (corticospinal, spinothalamic).',
    keyFacts: [
      'Terminates around L1/L2 in adults as the conus medullaris, continuing inferiorly as the cauda equina ("horse\'s tail").',
      'The monosynaptic stretch reflex (patellar tendon tap) executes in under 30 milliseconds without brain input.',
      'Dorsal roots carry purely sensory (afferent) fibers; ventral roots carry purely motor (efferent) fibers (Bell-Magendie Law).'
    ],
    subStructures: ['Cervical and Lumbar Enlargements', 'Conus Medullaris', 'Cauda Equina', 'Dorsal and Ventral Nerve Roots', 'Sciatic & Brachial Plexus Nerves'],
    relatedSystems: ['skeletal', 'muscular'],
    clinicalRelevance: 'Spinal cord injury (paraplegia/tetraplegia), herniated discs causing sciatica, epidural anesthesia, and spinal tap (lumbar puncture at L3/L4 or L4/L5).'
  },

  peripheral_nerves: {
    id: 'peripheral_nerves',
    name: 'Peripheral Nervous System & Nerve Trunks',
    latinName: 'Systema nervosum periphericum',
    system: 'nervous',
    complexity: 'detailed',
    color: '#FEF08A',
    accentColor: '#FACC15',
    center: [0.0, 1.0, 0.0],
    boundsSize: [2.2, 5.0, 0.6],
    cameraFocus: { target: [0.0, 1.0, 0.0], distance: 3.5 },
    category: 'Peripheral Somatosensory & Motor Conduction Network',
    primaryFunction: 'Carries bidirectional electrical nerve impulses between the central nervous system (brain/spinal cord) and all peripheral muscles, skin, and viscera.',
    anatomicalLocation: 'Branching plexuses radiating from the spinal cord through the neck, upper extremities, trunk, and lower extremities to the fingertips and toes.',
    educationalSummary: 'The peripheral nervous system consists of 12 pairs of cranial nerves and 31 pairs of spinal nerves organized into somatic nerve plexuses: the Brachial Plexus (giving rise to the Musculocutaneous, Median, Ulnar, and Radial nerves of the arm) and the Lumbar/Sacral Plexus (giving rise to the Femoral nerve and the massive Sciatic nerve, which divides into the Tibial and Common Fibular nerves of the leg).',
    keyFacts: [
      'The sciatic nerve is the thickest and longest nerve in the human body, measuring ~2 cm in diameter at its pelvic origin.',
      'Schwann cells wrap around peripheral axons to form the insulating myelin sheath, enabling rapid saltatory conduction at up to 120 m/s.',
      'Unlike central CNS neurons, peripheral axons can regenerate after injury if their Schwann cell endoneurial tubes remain intact.'
    ],
    subStructures: ['Brachial Plexus (C5-T1)', 'Median & Ulnar Nerves', 'Radial Nerve', 'Lumbosacral Plexus', 'Sciatic Nerve (L4-S3)', 'Femoral & Tibial Nerves'],
    relatedSystems: ['muscular', 'skeletal', 'cardiovascular'],
    clinicalRelevance: 'Sciatica (compression from herniated lumbar disc), carpal tunnel syndrome (median nerve compression), peripheral neuropathy (diabetic), and Bell\'s palsy.'
  },

  // ==========================================================================
  // URINARY
  // ==========================================================================
  kidneys: {
    id: 'kidneys',
    name: 'Kidneys',
    latinName: 'Renes',
    system: 'urinary',
    complexity: 'overview',
    color: '#10B981',
    accentColor: '#059669',
    center: [0.02, 1.11, -0.08],
    boundsSize: [0.80, 0.55, 0.35],
    cameraFocus: { target: [0.02, 1.11, -0.08], distance: 1.8 },
    category: 'Retroperitoneal Hemofiltration & Homeostatic Organs',
    primaryFunction: 'Filters ~180 liters of blood daily to excrete urea, creatinine, and toxins while precisely regulating blood volume, pH, and electrolyte osmolarity.',
    anatomicalLocation: 'Retroperitoneal on posterior abdominal wall, spanning T12 to L3 vertebrae. The right kidney sits slightly lower due to the liver.',
    educationalSummary: 'Each kidney contains ~1 million microscopic nephrons—the functional filtration units. They receive ~20–25% of total cardiac output via the renal arteries. Through glomerular ultrafiltration, tubular reabsorption, and secretion, they concentrate 180 L of filtrate down to ~1.5 L of sterile urine daily.',
    keyFacts: [
      'Secretes erythropoietin (EPO), the hormone stimulating red blood cell production in bone marrow.',
      'Releases renin via juxtaglomerular cells to trigger the Renin-Angiotensin-Aldosterone System (RAAS) and regulate systemic blood pressure.',
      'Converts 25-hydroxyvitamin D into active 1,25-dihydroxyvitamin D (calcitriol).',
      'Reabsorbs 99% of filtered water, 99.5% of filtered sodium, and 100% of filtered glucose in healthy individuals.'
    ],
    subStructures: [
      'Renal Fibrous Capsule',
      'Renal Cortex (houses glomeruli and convoluted tubules)',
      'Renal Medulla (renal pyramids containing loops of Henle)',
      'Renal Columns of Bertin',
      'Minor and Major Calyces',
      'Renal Pelvis (funnel leading to ureter)',
      'Renal Artery & Renal Vein'
    ],
    relatedSystems: ['cardiovascular', 'endocrine'],
    clinicalRelevance: 'Chronic kidney disease (CKD), acute kidney injury (AKI), nephrolithiasis (kidney stones), glomerulonephritis, and renal dialysis/transplantation.',
    hasInternalView: true,
    internalStructures: [
      { id: 'renal_cortex', name: 'Renal Cortex', description: 'Outer granular zone housing over 1 million Bowman\'s capsules and glomeruli.', color: '#34D399' },
      { id: 'renal_pyramids', name: 'Medullary Pyramids', description: 'Striated triangular cones housing loops of Henle and collecting ducts.', color: '#059669' },
      { id: 'renal_calyces', name: 'Minor & Major Calyces', description: 'Funnel-shaped cups that collect formed urine dripping from papillary ducts.', color: '#A7F3D0' },
      { id: 'renal_pelvis', name: 'Renal Pelvis', description: 'Central collecting basin funneling urine into the ureter.', color: '#6EE7B7' }
    ],
    hasProcessAnimation: true,
    processConfig: {
      id: 'nephron_filtration',
      name: 'Nephron Glomerular Ultrafiltration & Countercurrent Exchange',
      description: 'Trace blood entering afferent arterioles, high-pressure fenestrated filtration, and loop of Henle medullary countercurrent concentration.',
      defaultSpeed: 1.0,
      rateUnit: 'mL/min (GFR)',
      defaultRate: 125,
      minRate: 30,
      maxRate: 160,
      stages: [
        { name: 'Glomerular Ultrafiltration', description: 'High capillary hydrostatic pressure (55 mmHg) forces plasma through podocyte slit diaphragms into Bowman\'s space.', color: '#10B981' },
        { name: 'Proximal Tubular Reabsorption', description: 'Active Na⁺/K⁺ ATPase drives obligate reabsorption of 65% of water, electrolytes, and 100% of glucose and amino acids.', color: '#34D399' },
        { name: 'Loop of Henle Countercurrent Multiplier', description: 'Descending limb loses water; ascending limb actively pumps NaCl, establishing a hypertonic medullary gradient up to 1200 mOsm/L.', color: '#059669' },
        { name: 'Distal Tubule & Collecting Duct Fine-Tuning', description: 'Aldosterone promotes Na⁺ reabsorption; Antidiuretic Hormone (ADH) inserts aquaporin-2 water channels to concentrate urine.', color: '#047857' }
      ]
    }
  },

  bladder: {
    id: 'bladder',
    name: 'Urinary Bladder & Ureters',
    latinName: 'Vesica urinaria',
    system: 'urinary',
    complexity: 'overview',
    color: '#059669',
    accentColor: '#10B981',
    center: [0.0, -0.15, 0.12],
    boundsSize: [0.5, 0.5, 0.45],
    cameraFocus: { target: [0.0, -0.15, 0.12], distance: 1.6 },
    category: 'Reservoir & Urinary Excretory Tract',
    primaryFunction: 'Ureters transport urine from renal pelvis via smooth muscle peristalsis; bladder expands to store urine prior to voluntary micturition.',
    anatomicalLocation: 'Lesser pelvis, resting on pelvic floor behind pubic symphysis; expands superiorly into abdominal cavity when distended.',
    educationalSummary: 'The urinary bladder wall is composed of the powerful interlaced detrusor smooth muscle. The internal trigone region—delineated by two ureteral orifices and the internal urethral orifice—remains smooth and stable. Capacity ranges from 400 to 600 mL, with stretch receptor urges triggering around 200–300 mL.',
    keyFacts: [
      'Lined with transitional epithelium (urothelium) with umbrella cells that stretch flat as volume increases.',
      'Ureterovesical junctions act as physiological one-way flap valves, preventing vesicoureteral reflux during bladder filling.',
      'Micturition reflex is coordinated by the Pontine Micturition Center (Barrington\'s nucleus) in the brainstem.'
    ],
    subStructures: ['Bilateral Ureters', 'Detrusor Muscle', 'Trigone', 'Internal Urethral Sphincter (Involuntary)', 'External Urethral Sphincter (Voluntary)'],
    relatedSystems: ['nervous', 'muscular'],
    clinicalRelevance: 'Urinary tract infections (UTIs), kidney stones causing ureteral colic, urinary incontinence, benign prostatic hyperplasia (BPH), and bladder cancer.',
    spatialRelationships: [
      { direction: 'Anterior', neighborName: 'Pubic Symphysis (Space of Retzius)', neighborStructureId: 'pelvis', description: 'Cushioned by the retropubic prevesical fat pad behind the pubic bones.' },
      { direction: 'Posterior', neighborName: 'Rectum & Pelvic Viscera', neighborStructureId: 'intestines', description: 'Bordered by peritoneal reflection and pelvic retroperitoneal fascia.' },
      { direction: 'Inferior', neighborName: 'Pelvic Diaphragm (Levator Ani)', description: 'Bladder neck rests directly upon the muscular pelvic floor.' },
      { direction: 'Superior', neighborName: 'Peritoneal Cavity & Loops of Small Intestine', neighborStructureId: 'intestines', description: 'Covered by parietal peritoneum reflecting off anterior abdominal wall.' }
    ]
  },

  // ==========================================================================
  // SKELETAL
  // ==========================================================================
  skull: {
    id: 'skull',
    name: 'Skull & Mandible',
    latinName: 'Cranium',
    system: 'skeletal',
    complexity: 'overview',
    color: '#E2E8F0',
    accentColor: '#CBD5E1',
    center: [0.0, 3.73, -0.01],
    boundsSize: [0.65, 0.75, 0.80],
    cameraFocus: { target: [0.0, 3.73, -0.01], distance: 2.0 },
    category: 'Axial Skeletal Protection',
    primaryFunction: 'Protects the encephalon, houses specialized sensory organs (vision, hearing, olfaction, taste), and anchors facial expression and mastication muscles.',
    anatomicalLocation: 'Superior terminus of the axial skeleton, articulating with the atlas (C1) vertebra at the atlanto-occipital joints.',
    educationalSummary: 'Composed of 22 articulated bones: 8 cranial bones forming the neurocranium and 14 facial bones forming the viscerocranium. Bones meet at immovable fibrous joints called sutures (coronal, sagittal, lambdoid, squamous), while the mandible articulates via the dynamic temporomandibular joint (TMJ).',
    keyFacts: [
      'The mandible (lower jaw) is the only movable bone of the skull and the strongest facial bone.',
      'The base of the skull features the foramen magnum, where the brainstem transitions into the spinal cord.',
      'Paranasal air sinuses (frontal, maxillary, ethmoid, sphenoid) reduce skull weight and provide acoustic vocal resonance.'
    ],
    subStructures: ['Frontal Bone', 'Parietal Bones', 'Occipital Bone & Foramen Magnum', 'Temporal Bones', 'Sphenoid & Ethmoid Bones', 'Mandible & TMJ', 'Maxillae & Zygomatic Arches'],
    relatedSystems: ['nervous', 'muscular'],
    clinicalRelevance: 'Skull fractures, TMJ dysfunction, craniosynostosis in infants, sinus infections, and surgical craniotomy.'
  },

  spine: {
    id: 'spine',
    name: 'Vertebral Column (Spine)',
    latinName: 'Columna vertebralis',
    system: 'skeletal',
    complexity: 'overview',
    color: '#E2E8F0',
    accentColor: '#94A3B8',
    center: [0.0, 1.50, -0.10],
    boundsSize: [0.45, 2.6, 0.40],
    cameraFocus: { target: [0.0, 1.50, -0.10], distance: 2.8 },
    category: 'Axial Load-Bearing Column',
    primaryFunction: 'Supports head and trunk weight, enables multiaxial flexibility, and shields the spinal cord inside the vertebral canal.',
    anatomicalLocation: 'Mid-sagittal dorsal axis of the body from the skull base to the tailbone coccyx.',
    educationalSummary: 'Consists of 33 vertebrae: 7 Cervical (lordotic curve), 12 Thoracic (kyphotic curve), 5 Lumbar (lordotic curve), 5 fused Sacral (kyphotic), and 4 fused Coccygeal. The double S-shaped curvature acts as an anatomical spring, absorbing mechanical shock during bipedal walking and jumping.',
    keyFacts: [
      'Intervertebral discs contain a tough fibrous outer anulus fibrosus and a gelatinous shock-absorbing nucleus pulposus.',
      'Atlas (C1) has no vertebral body and allows nodding ("yes"); Axis (C2) features the odontoid process (dens) allowing rotation ("no").',
      'Lumbar vertebrae (L1-L5) possess massive bodies to bear the cumulative weight of the upper body.'
    ],
    subStructures: ['Cervical Vertebrae C1-C7', 'Thoracic Vertebrae T1-T12', 'Lumbar Vertebrae L1-L5', 'Sacrum & Coccyx', 'Intervertebral Discs'],
    relatedSystems: ['nervous', 'muscular'],
    clinicalRelevance: 'Scoliosis, disc herniation, spinal stenosis, spondylolisthesis, and osteoporosis vertebral compression fractures.'
  },

  ribcage: {
    id: 'ribcage',
    name: 'Ribcage & Sternum',
    latinName: 'Thorax / Costae',
    system: 'skeletal',
    complexity: 'overview',
    color: '#E2E8F0',
    accentColor: '#CBD5E1',
    center: [0.0, 1.95, 0.02],
    boundsSize: [1.25, 1.35, 0.85],
    cameraFocus: { target: [0.0, 1.95, 0.02], distance: 2.6 },
    category: 'Visceral Shield & Ventilatory Bellows',
    primaryFunction: 'Protects thoracic heart and lungs, and moves dynamically during inspiration and expiration (bucket-handle and pump-handle mechanics).',
    anatomicalLocation: 'Thoracic region, articulating posteriorly with thoracic vertebrae T1-T12 and anteriorly with the sternum via costal cartilages.',
    educationalSummary: 'Consists of 12 pairs of ribs: Ribs 1–7 are "true ribs" (attaching directly to sternum via individual costal cartilages); Ribs 8–10 are "false ribs" (sharing cartilaginous connections); Ribs 11–12 are "floating ribs" (unattached anteriorly). The sternum comprises the manubrium, body, and xiphoid process.',
    keyFacts: [
      'Pump-handle movement increases anterior-posterior thoracic diameter; bucket-handle movement increases transverse diameter.',
      'Sternal angle of Louis marks the T4/T5 vertebral plane, tracheal carina, and aortic arch level.',
      'Costal cartilage elasticity allows passive elastic recoil during expiration.'
    ],
    subStructures: ['Sternum (Manubrium, Body, Xiphoid)', 'True Ribs (1-7)', 'False Ribs (8-10)', 'Floating Ribs (11-12)', 'Costal Cartilage'],
    relatedSystems: ['respiratory', 'muscular', 'cardiovascular'],
    clinicalRelevance: 'Rib fractures, flail chest, costochondritis, CPR chest compressions (avoiding xiphoid fracture), and median sternotomy.'
  },

  pelvis: {
    id: 'pelvis',
    name: 'Pelvis (Pelvic Girdle)',
    latinName: 'Pelvis',
    system: 'skeletal',
    complexity: 'overview',
    color: '#E2E8F0',
    accentColor: '#94A3B8',
    center: [0.0, -0.02, -0.02],
    boundsSize: [1.2, 0.75, 0.80],
    cameraFocus: { target: [0.0, -0.02, -0.02], distance: 2.0 },
    category: 'Locomotor Hub & Visceral Cradle',
    primaryFunction: 'Transfers trunk weight to lower limbs, provides deep socket acetabula for hip joints, and cradles pelvic viscera.',
    anatomicalLocation: 'Base of trunk, connecting the vertebral sacrum to bilateral femoral heads.',
    educationalSummary: 'The pelvic girdle is formed by the sacrum, coccyx, and bilateral hip bones (os coxae). Each hip bone fuses three embryological bones: the ilium (flaring crest), ischium (sit bones), and pubis (articulating at the anterior pubic symphysis).',
    keyFacts: [
      'The acetabulum is a deep ball-and-socket socket providing remarkable joint stability at the expense of shoulder-like mobility.',
      'Sexual dimorphism: the female pelvis is broader, with a wider subpubic angle (>80° vs <70°) and larger pelvic inlet for childbirth.',
      'The sacroiliac (SI) joints are strong synovial joints reinforced by massive ligaments capable of supporting tons of force.'
    ],
    subStructures: ['Ilium & Iliac Crest', 'Ischium & Ischial Tuberosity', 'Pubis & Pubic Symphysis', 'Acetabulum', 'Sacrum & Sacroiliac Joint'],
    relatedSystems: ['muscular', 'urinary'],
    clinicalRelevance: 'Pelvic ring fractures (high hemorrhage risk), hip osteoarthritis, sacroiliitis, and obstetrical pelvic dimensions.'
  },

  limbs_upper: {
    id: 'limbs_upper',
    name: 'Upper Limbs (Arms & Hands)',
    latinName: 'Membrum superius',
    system: 'skeletal',
    complexity: 'detailed',
    color: '#E2E8F0',
    accentColor: '#CBD5E1',
    center: [0.0, 1.60, 0.0],
    boundsSize: [2.8, 2.0, 0.5],
    cameraFocus: { target: [0.0, 1.60, 0.0], distance: 3.0 },
    category: 'Appendicular Manipulation Skeletal Chains',
    primaryFunction: 'Enables high-precision prehension, tool manipulation, spatial reaching, and load bearing across multi-joint kinetic chains.',
    anatomicalLocation: 'Suspended from the pectoral girdle (clavicle and scapula) along lateral thoracic axes.',
    educationalSummary: 'Each upper limb contains 30 bones: Humerus (arm), Radius and Ulna (forearm), 8 Carpal bones (wrist: scaphoid, lunate, triquetrum, pisiform, trapezium, trapezoid, capitate, hamate), 5 Metacarpals, and 14 Phalanges. The opposable thumb gives humans unmatched manipulative dexterity.',
    keyFacts: [
      'The glenohumeral (shoulder) joint is the most mobile and least stable joint in the human body.',
      'The radius pivots over the stationary ulna at proximal and distal radioulnar joints to achieve pronation and supination.',
      'Scaphoid bone fractures have notorious risk of avascular necrosis due to retrograde blood supply.'
    ],
    subStructures: ['Clavicles & Scapulae', 'Humerus', 'Radius & Ulna', 'Carpal Bones (Wrist)', 'Metacarpals & Phalanges (Hand)'],
    relatedSystems: ['muscular', 'nervous'],
    clinicalRelevance: 'Rotator cuff tears, Colles\' distal radius fractures, carpal tunnel syndrome, and shoulder anterior dislocations.'
  },

  limbs_lower: {
    id: 'limbs_lower',
    name: 'Lower Limbs (Legs & Feet)',
    latinName: 'Membrum inferius',
    system: 'skeletal',
    complexity: 'detailed',
    color: '#E2E8F0',
    accentColor: '#CBD5E1',
    center: [0.0, -2.10, 0.0],
    boundsSize: [1.2, 4.0, 0.7],
    cameraFocus: { target: [0.0, -2.10, 0.0], distance: 3.5 },
    category: 'Appendicular Weight-Bearing & Locomotion',
    primaryFunction: 'Carries total body mass, provides propulsive bipedal gait forces, and absorbs ground reaction impact shocks.',
    anatomicalLocation: 'Articulates with pelvic acetabula and extends inferiorly to plantar foot surfaces.',
    educationalSummary: 'Each lower limb contains 30 bones: Femur (longest, heaviest, strongest bone in body), Patella (largest sesamoid bone), Tibia (weight-bearing shin bone), Fibula (lateral stabilizer and muscle anchor), 7 Tarsals (calcaneus heel, talus, navicular, cuboid, 3 cuneiforms), 5 Metatarsals, and 14 Phalanges.',
    keyFacts: [
      'The femur can withstand compressive loads of up to 30× body weight during jumping landings.',
      'The knee joint is a modified hinge joint reinforced by cruciate ligaments (ACL, PCL), collateral ligaments, and fibrocartilaginous menisci.',
      'The medial longitudinal arch of the foot acts as a compliant mechanical spring during the toe-off gait phase.'
    ],
    subStructures: ['Femur (Thigh)', 'Patella (Kneecap)', 'Tibia & Fibula (Leg)', 'Tarsal Bones (Calcaneus, Talus)', 'Metatarsals & Phalanges (Foot)'],
    relatedSystems: ['muscular', 'cardiovascular'],
    clinicalRelevance: 'Femoral neck fractures, ACL/meniscus knee tears, ankle sprains, tibial stress fractures, and flat feet (pes planus).'
  },

  // ==========================================================================
  // MUSCULAR
  // ==========================================================================
  muscles_core: {
    id: 'muscles_core',
    name: 'Major Skeletal Muscles (Torso & Limbs)',
    latinName: 'Musculi sceleti',
    system: 'muscular',
    complexity: 'overview',
    color: '#E11D48',
    accentColor: '#BE123C',
    center: [0, 1.2, 0.15],
    boundsSize: [2.2, 7.5, 1.1],
    cameraFocus: { target: [0, 1.2, 0.15], distance: 5.0 },
    category: 'Contractile Somatic Locomotor System',
    primaryFunction: 'Converts chemical ATP into mechanical force, driving joint movement, upright posture stabilization, and non-shivering thermogenesis.',
    anatomicalLocation: 'Envelops the skeletal frame, bridging joints via strong collagenous tendons.',
    educationalSummary: 'Skeletal muscle fibers are voluntary multinucleated cells packed with parallel myofibrils organized into repeating sarcomeres. Major muscle groups include: Pectoralis major (chest adduction), Deltoids (shoulder abduction), Rectus abdominis and Obliques (trunk flexion/rotation), Latissimus dorsi and Trapezius (back posture), Quadriceps femoris (knee extension), Gastrocnemius (ankle plantarflexion), and Gluteus maximus (hip extension).',
    keyFacts: [
      'The gluteus maximus is the largest muscle in the human body, essential for upright posture and climbing.',
      'The masseter (jaw muscle) is the strongest muscle based on weight, capable of generating 90 kg of biting force.',
      'Muscles only pull, never push; movements require coordinated agonist and antagonist muscle pairs (e.g., biceps and triceps).',
      'Muscle contraction generates up to 85% of body heat during shivering thermogenesis.'
    ],
    subStructures: [
      'Pectoralis Major & Minor',
      'Deltoids & Rotator Cuff',
      'Biceps Brachii & Triceps Brachii',
      'Rectus Abdominis & Transversus Abdominis',
      'Trapezius & Latissimus Dorsi',
      'Gluteal Muscles (Maximus, Medius)',
      'Quadriceps Femoris & Hamstrings',
      'Gastrocnemius & Soleus (Calf)'
    ],
    relatedSystems: ['skeletal', 'nervous', 'cardiovascular'],
    clinicalRelevance: 'Muscular dystrophies, compartment syndrome, rhabdomyolysis, tendon ruptures (Achilles tendon), and sarcopenia in aging.'
  },

  deltoids: {
    id: 'deltoids',
    name: 'Deltoid Muscles (Shoulders)',
    latinName: 'Musculus deltoideus',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, 2.30, 0.04],
    boundsSize: [2.5, 0.6, 0.6],
    cameraFocus: { target: [1.15, 2.30, 0.04], distance: 1.8 },
    category: 'Appendicular Pectoral Girdle Muscle',
    primaryFunction: 'Principal abductor of the arm (15° to 90°); anterior fibers flex and medially rotate; posterior fibers extend and laterally rotate the humerus.',
    anatomicalLocation: 'Caps the glenohumeral shoulder joint, originating on the lateral clavicle, acromion, and spine of the scapula.',
    educationalSummary: 'The deltoid is an inverted triangle (delta-shaped) multipennate muscle capable of generating powerful multi-axial torque on the humerus. Innervated by the axillary nerve (C5, C6).',
    keyFacts: [
      'Supraspinatus initiates the first 15° of arm abduction; deltoid takes over from 15° to 90°.',
      'Multipennate middle fibers generate high contractile power for heavy overhead lifting.',
      'Common site for intramuscular (IM) clinical vaccinations.'
    ],
    subStructures: ['Anterior (Clavicular) Head', 'Middle (Acromial) Head', 'Posterior (Spinal) Head', 'Deltoid Tuberosity Insertion'],
    relatedSystems: ['skeletal', 'nervous'],
    clinicalRelevance: 'Axillary nerve injury (anterior shoulder dislocation / humeral neck fracture), deltoid strain, and rotator cuff impingement.'
  },

  biceps_brachii: {
    id: 'biceps_brachii',
    name: 'Biceps Brachii (Arm Flexor)',
    latinName: 'Musculus biceps brachii',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, 1.62, 0.14],
    boundsSize: [2.6, 0.6, 0.5],
    cameraFocus: { target: [1.22, 1.62, 0.14], distance: 1.8 },
    category: 'Anterior Brachial Compartment',
    primaryFunction: 'Powerful supinator of the forearm and flexor of the elbow joint; assists in shoulder flexion.',
    anatomicalLocation: 'Anterior arm, originating via short head on the coracoid process and long head on the supraglenoid tubercle, inserting into the radial tuberosity.',
    educationalSummary: 'The biceps brachii spans both the shoulder and elbow joints. It acts as the primary forearm supinator when the elbow is flexed (as in turning a screwdriver). Innervated by the musculocutaneous nerve (C5, C6).',
    keyFacts: [
      'The long head tendon courses through the bicipital groove of the humerus inside the shoulder capsule.',
      'The bicipital aponeurosis radiates into deep forearm fascia, protecting the underlying brachial artery and median nerve.',
      'Biceps tendon reflex tests C5/C6 spinal nerve root integrity.'
    ],
    subStructures: ['Short Head (Coracoid)', 'Long Head (Supraglenoid)', 'Bicipital Aponeurosis', 'Radial Tuberosity Tendon'],
    relatedSystems: ['skeletal', 'nervous'],
    clinicalRelevance: 'Proximal biceps tendon rupture ("Popeye deformity"), biceps tendinitis, and SLAP labral tears.'
  },

  pectoralis_major: {
    id: 'pectoralis_major',
    name: 'Pectoralis Major (Chest Muscle)',
    latinName: 'Musculus pectoralis major',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, 2.15, 0.22],
    boundsSize: [1.4, 0.6, 0.5],
    cameraFocus: { target: [0, 2.15, 0.22], distance: 2.0 },
    category: 'Anterior Thoracic Somatic Muscle',
    primaryFunction: 'Adducts and medially rotates the humerus at the shoulder joint; clavicular head assists in shoulder flexion.',
    anatomicalLocation: 'Covers the anterior thoracic cage overlying ribs 2–6 and deep pectoralis minor.',
    educationalSummary: 'A thick, fan-shaped muscle featuring two heads: a clavicular head originating from the medial clavicle and a larger sternocostal head originating from the sternum and costal cartilages 1–6. Both converge into a flat tendon inserting into the lateral lip of the bicipital groove of the humerus.',
    keyFacts: [
      'Innervated by both lateral and medial pectoral nerves (C5–T1).',
      'Primary engine in pushing movements, bench press, and swimming crawl strokes.',
      'Deep to pectoralis major lies the clavipectoral fascia and pectoralis minor.'
    ],
    subStructures: ['Clavicular Head', 'Sternocostal Head', 'Pectoralis Fascia', 'Humeral Insertion Tendon'],
    relatedSystems: ['skeletal', 'respiratory'],
    clinicalRelevance: 'Pectoralis major tendon rupture (heavy bench press injuries), Poland syndrome (congenital absence), and mastectomy reconstructive flap surgery.'
  },

  rectus_abdominis: {
    id: 'rectus_abdominis',
    name: 'Rectus Abdominis & Core Musculature',
    latinName: 'Musculus rectus abdominis',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, 1.35, 0.20],
    boundsSize: [0.8, 1.1, 0.4],
    cameraFocus: { target: [0, 1.35, 0.20], distance: 2.0 },
    category: 'Anterior Abdominal Wall Core Flexor',
    primaryFunction: 'Flexes the lumbar spine, compresses abdominal viscera for intra-abdominal pressure generation, and stabilizes the pelvis during gait.',
    anatomicalLocation: 'Midline anterior abdomen inside the rectus sheath, between the pubic crest and costal cartilages 5–7 and xiphoid process.',
    educationalSummary: 'Paired vertical strap muscles separated down the midline by the fibrous Linea Alba. Interspersed with 3–4 horizontal tendinous intersections (inscriptionestendineae), creating the anatomical "six-pack" appearance in lean individuals. Flanked laterally by external obliques, internal obliques, and transversus abdominis.',
    keyFacts: [
      'Maintains core intra-abdominal pressure crucial for lifting mechanics (Valsalva maneuver) and forced expiration.',
      'Enclosed within the fibrous rectus sheath formed by the aponeuroses of the three lateral flat abdominal muscles.',
      'Innervated by thoracoabdominal nerves (T7–T11) and the subcostal nerve (T12).'
    ],
    subStructures: ['Linea Alba', 'Tendinous Intersections', 'Rectus Sheath', 'Pyramidalis Muscle', 'Umbilical Ring'],
    relatedSystems: ['skeletal', 'digestive'],
    clinicalRelevance: 'Diastasis recti (separation after pregnancy), abdominal wall incisional hernias, and rectus sheath hematoma.'
  },

  quadriceps_femoris: {
    id: 'quadriceps_femoris',
    name: 'Quadriceps Femoris (Thigh Extensor)',
    latinName: 'Musculus quadriceps femoris',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, -1.25, 0.22],
    boundsSize: [1.3, 1.4, 0.6],
    cameraFocus: { target: [0.42, -1.25, 0.22], distance: 2.2 },
    category: 'Anterior Thigh Locomotor Group',
    primaryFunction: 'Principal extensor of the knee joint; rectus femoris also assists in hip flexion.',
    anatomicalLocation: 'Anterior compartment of the thigh, inserting into the patella and via the patellar ligament into the tibial tuberosity.',
    educationalSummary: 'The quadriceps is the largest and most powerful somatic muscle mass in the human body, composed of four distinct muscles: Rectus femoris (superficial biarticular muscle), Vastus lateralis (massive lateral bulk), Vastus medialis (teardrop stabilizer of patella), and Vastus intermedius (deep central muscle). All four share the patellar tendon.',
    keyFacts: [
      'Innervated by the femoral nerve (L2, L3, L4).',
      'The patella acts as a physiological anatomical pulley, increasing quadriceps mechanical extensor leverage by ~30%.',
      'Essential for walking, running, stair climbing, and rising from a seated position.'
    ],
    subStructures: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius', 'Patellar Tendon / Ligament'],
    relatedSystems: ['skeletal', 'nervous'],
    clinicalRelevance: 'Patellar tendinitis ("jumper\'s knee"), quadriceps tendon rupture, patellofemoral pain syndrome, and quadriceps contusions.'
  },

  gluteus_maximus: {
    id: 'gluteus_maximus',
    name: 'Gluteus Maximus (Hip Extensor)',
    latinName: 'Musculus gluteus maximus',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, -0.25, -0.32],
    boundsSize: [1.2, 0.7, 0.6],
    cameraFocus: { target: [0, -0.25, -0.32], distance: 2.0 },
    category: 'Posterior Pelvic Locomotor Muscle',
    primaryFunction: 'Most powerful extensor and lateral rotator of the hip joint; crucial for ascending stairs, running, and rising from sitting.',
    anatomicalLocation: 'Covers the posterior buttocks, originating from ilium and sacrum, inserting into gluteal tuberosity and iliotibial tract.',
    educationalSummary: 'The gluteus maximus is the heaviest and coarsest-fibered muscle in the human body. As humans evolved upright bipedal posture, this muscle expanded to stabilize the pelvis on the femoral heads and prevent the trunk from pitching forward.',
    keyFacts: [
      'Innervated by the inferior gluteal nerve (L5, S1, S2).',
      'Inactive during ordinary flat-ground standing or slow walking; powerfully recruited during running and stair climbing.',
      'Inserts partly into the iliotibial tract (IT band) stabilizing the lateral knee.'
    ],
    subStructures: ['Superior Fibers', 'Inferior Fibers', 'Iliotibial Band Insertion', 'Gluteal Tuberosity Tendon'],
    relatedSystems: ['skeletal', 'nervous'],
    clinicalRelevance: 'Gluteal tendinopathy, trochanteric bursitis, piriformis syndrome entrapment, and intramuscular injection complications.'
  },

  gastrocnemius: {
    id: 'gastrocnemius',
    name: 'Gastrocnemius & Soleus (Calf Muscles)',
    latinName: 'Musculus gastrocnemius et soleus',
    system: 'muscular',
    complexity: 'detailed',
    color: '#B91C1C',
    accentColor: '#DC2626',
    center: [0, -2.75, -0.15],
    boundsSize: [1.1, 0.9, 0.5],
    cameraFocus: { target: [0.38, -2.75, -0.15], distance: 1.9 },
    category: 'Posterior Crural Triceps Surae',
    primaryFunction: 'Powerful plantarflexors of the ankle joint via the calcaneal (Achilles) tendon; propels body forward during gait, sprinting, and jumping.',
    anatomicalLocation: 'Posterior compartment of the leg, originating from femoral condyles and tibia/fibula, inserting into the calcaneus heel bone.',
    educationalSummary: 'Forming the two-headed superficial muscular prominence of the calf (medial and lateral heads), gastrocnemius combines with the deep soleus to form the Triceps Surae. Together they insert into the thickest and strongest tendon in the human body—the Achilles tendon.',
    keyFacts: [
      'Innervated by the tibial nerve (S1, S2).',
      'The Achilles tendon withstands tensile forces up to 10 times body weight during explosive sprinting.',
      'Soleus contains a high proportion of slow-twitch fibers that act as a "peripheral heart" pumping venous blood back to the vena cava.'
    ],
    subStructures: ['Medial Gastrocnemius Head', 'Lateral Gastrocnemius Head', 'Soleus Muscle', 'Achilles (Calcaneal) Tendon', 'Plantaris Muscle'],
    relatedSystems: ['skeletal', 'cardiovascular'],
    clinicalRelevance: 'Achilles tendon rupture, calf muscle strains ("tennis leg"), Achilles tendinopathy, and deep vein thrombosis (DVT) in soleal veins.'
  },

  // ==========================================================================
  // ENDOCRINE
  // ==========================================================================
  endocrine_glands: {
    id: 'endocrine_glands',
    name: 'Endocrine Glands (Pituitary, Thyroid, Adrenals)',
    latinName: 'Glandulae endocrinae',
    system: 'endocrine',
    complexity: 'overview',
    color: '#EC4899',
    accentColor: '#DB2777',
    center: [0, 3.5, 0.1],
    boundsSize: [0.8, 4.5, 0.6],
    cameraFocus: { target: [0, 3.5, 0.1], distance: 3.5 },
    category: 'Systemic Chemical Signaling Hubs',
    primaryFunction: 'Secretes circulating hormones that control metabolism, growth, stress response, and electrolyte balance.',
    anatomicalLocation: 'Distributed anatomically: Pituitary (sella turcica of skull), Thyroid (anterior trachea), Adrenal glands (superior poles of kidneys), Endocrine Pancreas (abdomen).',
    educationalSummary: 'The endocrine system operates through classic negative feedback loops along hypothalamic-pituitary target axes. The pituitary gland is the "master gland" directing thyroid (T3/T4 for metabolic rate), adrenal cortex (cortisol for stress and aldosterone for blood pressure), and somatic tissues.',
    keyFacts: [
      'The adrenal medulla secretes epinephrine (adrenaline) and norepinephrine for the rapid "fight-or-flight" sympathetic response.',
      'The thyroid gland requires dietary iodine to synthesize thyroid hormones thyroxine (T4) and triiodothyronine (T3).',
      'The pineal gland secretes melatonin according to suprachiasmatic nucleus circadian light cues.',
      'Parathyroid glands (4 tiny pea-sized glands behind the thyroid) meticulously maintain serum calcium levels.'
    ],
    subStructures: [
      'Hypothalamus & Pituitary Gland (Hypophysis)',
      'Thyroid & Parathyroid Glands',
      'Adrenal Glands (Cortex and Medulla)',
      'Endocrine Islets of the Pancreas',
      'Pineal Gland'
    ],
    relatedSystems: ['nervous', 'cardiovascular', 'urinary'],
    clinicalRelevance: 'Hypo/hyperthyroidism, Cushing\'s syndrome, Addison\'s disease, acromegaly, and diabetes insipidus.'
  },

  // ==========================================================================
  // INTEGUMENTARY SYSTEM (SKIN & SURFACE)
  // ==========================================================================
  skin: {
    id: 'skin',
    name: 'Skin & Integumentary System',
    latinName: 'Systema integumentarium',
    system: 'muscular',
    complexity: 'overview',
    color: '#DE9F7E',
    accentColor: '#F97316',
    center: [0.0, 0.0, -0.05],
    boundsSize: [2.5, 8.23, 1.3],
    cameraFocus: { target: [0.0, 0.0, 0.0], distance: 10.5 },
    category: 'Integumentary Organ / Cutaneous Protective Barrier',
    primaryFunction: 'Forms the outer protective envelope of the human body, provides tactile sensation, prevents fluid loss, synthesizes Vitamin D3, and maintains thermoregulation via sweat evaporation and cutaneous vasodilation.',
    anatomicalLocation: 'Envelopes the entire external human body (~1.8 m² surface area in adults).',
    educationalSummary: 'The human skin is the body\'s largest organ, comprising three distinct layers: the stratified squamous Epidermis (with keratinocytes, melanocytes, and Langerhans immune cells), the dense fibrous Dermis (with collagen, elastin, hair follicles, sebaceous glands, and sensory Pacinian/Meissner corpuscles), and the adipose Hypodermis (subcutaneous fat for thermal insulation and mechanical cushioning).',
    keyFacts: [
      'The skin accounts for roughly 16% of total adult body mass and continuously sheds ~40,000 dead keratinocytes per minute.',
      'Melanocytes in the stratum basale produce melanin pigment to protect cell nuclei from ultraviolet DNA mutagenic damage.',
      'Thermoregulation: Dermal capillaries dilate to shed heat in hot environments and constrict to conserve core body warmth.',
      'Sensory receptors detect touch (Meissner corpuscles), deep pressure (Pacinian corpuscles), temperature (Krause/Ruffini), and pain (nociceptors).'
    ],
    subStructures: [
      'Epidermis (Stratum Corneum, Lucidum, Granulosum, Spinosum, Basale)',
      'Dermis (Papillary and Reticular Layers)',
      'Hypodermis (Subcutaneous Adipose Tissue)',
      'Hair Follicles & Sebaceous Glands',
      'Eccrine & Apocrine Sweat Glands',
      'Cutaneous Sensory Mechanoreceptors'
    ],
    relatedSystems: ['nervous', 'cardiovascular', 'muscular'],
    clinicalRelevance: 'Burns (Rule of Nines), melanoma and basal cell carcinomas, dermatitis/eczema, psoriasis, and transdermal medication delivery.'
  },

  lymphatic_system: {
    id: 'lymphatic_system',
    name: 'Lymphatic System (Spleen, Thymus & Lymph Nodes)',
    latinName: 'Systema lymphaticum',
    system: 'lymphatic',
    complexity: 'detailed',
    color: '#10B981',
    accentColor: '#059669',
    center: [-0.35, 1.6, 0.05],
    boundsSize: [1.4, 3.2, 0.8],
    cameraFocus: { target: [-0.2, 1.8, 0.1], distance: 3.2 },
    category: 'Vascular Fluid Homeostasis & Immune Surveillance',
    primaryFunction: 'Returns 3–4 liters of filtered interstitial fluid to circulation daily, absorbs dietary chylomicrons from lacteals, and mounts adaptive immune responses.',
    anatomicalLocation: 'Pervades all vascularized tissues throughout the body, concentrating lymphoid organs in the left hypochondrium (spleen), mediastinum (thymus), and regional nodal basins.',
    educationalSummary: 'The lymphatic system is a specialized one-way open drainage tree consisting of blind-ended lymphatic capillaries, collecting lymphatics with valves, regional lymph nodes, and lymphatic trunks that coalesce into the Thoracic Duct and Right Lymphatic Duct. The Spleen is the largest lymphoid organ (~150 g), filtering blood via red pulp (macrophage erythrocyte clearance) and white pulp (splenic B/T lymphocyte immunity). The Thymus in the superior mediastinum oversees T-lymphocyte maturation and central self-tolerance selection.',
    keyFacts: [
      'The Thoracic Duct drains 75% of body lymph (all except right upper quadrant), terminating at the left venous angle (subclavian-internal jugular junction).',
      'Lymph nodes contain B-cell follicles with germinal centers, T-cell paracortex, and medullary cords filtering foreign antigens.',
      'Lymphatic vessels lack a central pump; lymph propulsion relies on skeletal muscle pumps, respiratory thoracic vacuum, and intrinsic smooth muscle peristalsis.',
      'The spleen clears approximately 200 billion senescent erythrocytes daily through the splenic cords of Billroth.'
    ],
    subStructures: [
      'Spleen (Red Pulp & White Pulp)',
      'Thymus Gland (Cortex & Medulla)',
      'Thoracic Duct & Cisterna Chyli',
      'Cervical Lymph Node Chain',
      'Axillary Lymph Node Basin',
      'Inguinal Lymph Node Basin',
      'Mesenteric Lymph Nodes & Peyer\'s Patches'
    ],
    relatedSystems: ['cardiovascular', 'digestive'],
    clinicalRelevance: 'Lymphedema, Hodgkin and non-Hodgkin lymphomas, splenomegaly/splenic rupture (mononucleosis), lymphadenitis, and tumor sentinel node metastasis.'
  },

  connective_tissue: {
    id: 'connective_tissue',
    name: 'Tendons, Ligaments & Deep Fasciae',
    latinName: 'Tendines, Ligamenta et Fasciae',
    system: 'muscular',
    complexity: 'detailed',
    color: '#CBD5E1',
    accentColor: '#94A3B8',
    center: [0, 0.2, 0.08],
    boundsSize: [1.6, 5.8, 0.8],
    cameraFocus: { target: [0, 0.2, 0.08], distance: 4.2 },
    category: 'Dense Fibrous Mechanical Connective Network',
    primaryFunction: 'Transmits muscular contractile forces to bones across joints, stabilizes articular capsules, and stores elastic strain energy during movement.',
    anatomicalLocation: 'Invests somatic musculature throughout the axial and appendicular body, bridging myotendinous junctions to osseous periosteum.',
    educationalSummary: 'Dense regular connective tissue forms high-tensile tendons (parallel Type I collagen bundles) and joint-stabilizing ligaments. Crucial anatomical landmarks include the Linea Alba (midline fibrous decussation between bilateral rectus sheaths), the Patellar Ligament (transmitting quadriceps force to the tibial tuberosity), the Calcaneal (Achilles) Tendon (strongest tendon in the human body), the Inguinal Ligaments (defining the pelvic brim border), and broad aponeuroses.',
    keyFacts: [
      'Type I collagen fibers in tendons withstand tensile stresses exceeding 50–100 MPa.',
      'Tendons possess low metabolic vascularity, explaining prolonged healing times compared to vascular bone or muscle.',
      'The Linea Alba is avascular, making it a classic surgical midline laparotomy incision site.',
      'Ligaments contain slightly higher elastin fractions than tendons, granting joint capsules controlled flexibility.'
    ],
    subStructures: [
      'Achilles (Calcaneal) Tendon',
      'Patellar Ligament / Tendon',
      'Linea Alba & Rectus Sheath Aponeuroses',
      'Inguinal Ligament (Poupart\'s Ligament)',
      'Thoracolumbar Fascia Plate',
      'Iliotibial Tract (IT Band)',
      'Plantar Fascia (Aponeurosis)'
    ],
    relatedSystems: ['skeletal', 'muscular'],
    clinicalRelevance: 'Achilles tendon rupture, patellar tendinitis, anterior cruciate ligament (ACL) tears, plantar fasciitis, and linea alba diastasis recti.'
  }
};


// ----------------------------------------------------------------------------
// STRUCTURE LOOKUP HELPERS & SEARCH INDEX
// ----------------------------------------------------------------------------
export const ALL_STRUCTURE_IDS = Object.keys(ANATOMY_STRUCTURES);

export interface SearchableAnatomicalItem {
  id: string;
  name: string;
  latinName: string;
  system: AnatomicalSystemId;
  systemName: string;
  category: string;
  targetStructureId: string;
  isSubstructure: boolean;
  keywords: string[];
}

export function buildAnatomySearchIndex(): SearchableAnatomicalItem[] {
  const items: SearchableAnatomicalItem[] = [];

  Object.values(ANATOMY_STRUCTURES).forEach((struct) => {
    // 1. Main structure
    items.push({
      id: struct.id,
      name: struct.name,
      latinName: struct.latinName,
      system: struct.system,
      systemName: ANATOMICAL_SYSTEMS[struct.system].name,
      category: struct.category,
      targetStructureId: struct.id,
      isSubstructure: false,
      keywords: [
        struct.name.toLowerCase(),
        struct.latinName.toLowerCase(),
        struct.system.toLowerCase(),
        ANATOMICAL_SYSTEMS[struct.system].name.toLowerCase(),
        struct.primaryFunction.toLowerCase(),
        ...struct.keyFacts.map(k => k.toLowerCase()),
        ...struct.subStructures.map(s => s.toLowerCase())
      ]
    });

    // 2. Sub-structures & Internal structures
    if (struct.internalStructures) {
      struct.internalStructures.forEach((sub) => {
        items.push({
          id: `${struct.id}_internal_${sub.id}`,
          name: sub.name,
          latinName: `${struct.name} Internal`,
          system: struct.system,
          systemName: ANATOMICAL_SYSTEMS[struct.system].name,
          category: `Internal Structure of ${struct.name}`,
          targetStructureId: struct.id,
          isSubstructure: true,
          keywords: [
            sub.name.toLowerCase(),
            sub.description.toLowerCase(),
            struct.name.toLowerCase()
          ]
        });
      });
    }

    struct.subStructures.forEach((subName, idx) => {
      items.push({
        id: `${struct.id}_sub_${idx}`,
        name: subName,
        latinName: `${struct.name} Component`,
        system: struct.system,
        systemName: ANATOMICAL_SYSTEMS[struct.system].name,
        category: `Part of ${struct.name}`,
        targetStructureId: struct.id,
        isSubstructure: true,
        keywords: [
          subName.toLowerCase(),
          struct.name.toLowerCase()
        ]
      });
    });
  });

  return items;
}
