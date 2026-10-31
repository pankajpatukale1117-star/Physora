import type { Atlas, SystemId, View } from './anatomy';

export interface KeyOrgan {
  id: string;
  label: string;
  subtitle: string;
  systemId: SystemId;
  view: View;
  color: string;
  icon: string;
}

export const KEY_3D_ORGANS: KeyOrgan[] = [
  { id: 'heart', label: 'Heart', subtitle: 'Cardiovascular pump', systemId: 'cardiac', view: 'region-chest', color: '#EF4444', icon: 'Heart' },
  { id: 'brain', label: 'Brain', subtitle: 'Central nervous processor', systemId: 'brain', view: 'region-head', color: '#A855F7', icon: 'Brain' },
  { id: 'lungs', label: 'Lungs', subtitle: 'Pulmonary gas exchange', systemId: 'respiratory', view: 'region-chest', color: '#06B6D4', icon: 'Wind' },
  { id: 'liver', label: 'Liver', subtitle: 'Metabolic & detoxification center', systemId: 'digestive', view: 'region-abdomen', color: '#F97316', icon: 'Flame' },
  { id: 'pancreas', label: 'Pancreas', subtitle: 'Endocrine & exocrine gland', systemId: 'digestive', view: 'region-abdomen', color: '#FBBF24', icon: 'Zap' },
  { id: 'small-intestine', label: 'Small intestine', subtitle: 'Nutrient absorption tract', systemId: 'digestive', view: 'region-abdomen', color: '#EAB308', icon: 'Disc' },
  { id: 'large-intestine', label: 'Large intestine', subtitle: 'Colon, fluid resorption & microbiome', systemId: 'digestive', view: 'region-abdomen', color: '#D97706', icon: 'CircleDot' },
  { id: 'kidneys', label: 'Kidneys', subtitle: 'Renal filtration & fluid balance', systemId: 'urinary', view: 'region-abdomen', color: '#3B82F6', icon: 'Droplets' },
  { id: 'eye', label: 'Eye', subtitle: 'Visual sensory organ', systemId: 'sensory', view: 'region-head', color: '#10B981', icon: 'Eye' },
  { id: 'skin', label: 'Skin', subtitle: 'Protective integumentary barrier', systemId: 'integumentary', view: 'front', color: '#BA9B7D', icon: 'Shield' }
];

export function resolveOrganParts(organKey: string, atlas: Atlas | null): string[] {
  if (!atlas) return [];
  const isFemale = atlas.sex === 'female' || (atlas.parts[0] && atlas.parts[0].id.startsWith('HRAF'));

  switch (organKey) {
    case 'heart': {
      if (isFemale) {
        return atlas.parts.filter(p => p.system === 'cardiac').map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7088');
      if (c && c.elements.length > 0) return c.elements;
      return atlas.parts.filter(p => p.system === 'cardiac').map(p => p.id);
    }
    case 'brain': {
      if (isFemale) {
        return atlas.parts.filter(p => p.system === 'brain').map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA50801');
      if (c && c.elements.length > 0) return c.elements;
      return atlas.parts.filter(p => p.system === 'nervous' && (p.bounds[0][1] + p.bounds[1][1]) / 2 >= 1.45).map(p => p.id);
    }
    case 'lungs': {
      if (isFemale) {
        return atlas.parts.filter(p => p.system === 'respiratory').map(p => p.id);
      }
      const r = atlas.concepts.find(x => x.id === 'FMA7309');
      const l = atlas.concepts.find(x => x.id === 'FMA7310');
      const ids: string[] = [];
      if (r) ids.push(...r.elements);
      if (l) ids.push(...l.elements);
      return ids.length > 0 ? ids : atlas.parts.filter(p => p.system === 'respiratory').map(p => p.id);
    }
    case 'liver': {
      if (isFemale) {
        return atlas.parts.filter(p => p.name.toLowerCase().includes('liver')).map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7197');
      return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('liver')).map(p => p.id);
    }
    case 'pancreas': {
      if (isFemale) {
        return atlas.parts.filter(p => p.name.toLowerCase().includes('pancreas')).map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7198');
      return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('pancreas')).map(p => p.id);
    }
    case 'small-intestine': {
      if (isFemale) {
        const c = atlas.concepts.find(x => x.id === 'HRA:small_intestine');
        return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('ileum') || p.name.toLowerCase().includes('jejunum') || p.name.toLowerCase().includes('duodenum')).map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7200');
      return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('jejunum') || p.name.toLowerCase().includes('ileum') || p.name.toLowerCase().includes('duodenum')).map(p => p.id);
    }
    case 'large-intestine': {
      if (isFemale) {
        return atlas.parts.filter(p => p.name.toLowerCase().includes('colon') || p.name.toLowerCase().includes('cecum') || p.name.toLowerCase().includes('rectum')).map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7201');
      return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('colon') || p.name.toLowerCase().includes('rectum')).map(p => p.id);
    }
    case 'kidneys': {
      if (isFemale) {
        return atlas.parts.filter(p => p.name.toLowerCase().includes('kidney')).map(p => p.id);
      }
      const c = atlas.concepts.find(x => x.id === 'FMA7203');
      return c ? c.elements : atlas.parts.filter(p => p.name.toLowerCase().includes('kidney')).map(p => p.id);
    }
    case 'eye': {
      if (isFemale) {
        return atlas.parts.filter(p => p.name.toLowerCase().includes('eye') || p.id === 'HRAF1231' || p.id === 'HRAF1232').map(p => p.id);
      }
      const r = atlas.concepts.find(x => x.id === 'FMA54449');
      const l = atlas.concepts.find(x => x.id === 'FMA54450');
      const ids: string[] = [];
      if (r) ids.push(...r.elements);
      if (l) ids.push(...l.elements);
      return ids.length > 0 ? ids : atlas.parts.filter(p => p.system === 'sensory').map(p => p.id);
    }
    case 'skin': {
      return atlas.parts.filter(p => p.system === 'integumentary' || p.id === 'HRAF0003' || p.name.toLowerCase().includes('skin')).map(p => p.id);
    }
    default:
      return [];
  }
}

export type AnatomicalRegionKey = 'head' | 'chest' | 'abdomen' | 'arms' | 'legs';

export interface AnatomicalRegionInfo {
  key: AnatomicalRegionKey;
  label: string;
  subtitle: string;
  view: View;
  color: string;
}

export const ANATOMICAL_REGIONS: AnatomicalRegionInfo[] = [
  {
    key: 'head',
    label: 'Head & neck',
    subtitle: 'Cranial vault, brain, facial bones, cervical spine & sensory organs',
    view: 'region-head',
    color: '#A855F7'
  },
  {
    key: 'chest',
    label: 'Chest',
    subtitle: 'Thoracic cage, heart, lungs, great vessels & mammary glands',
    view: 'region-chest',
    color: '#EF4444'
  },
  {
    key: 'abdomen',
    label: 'Abdomen & pelvis',
    subtitle: 'Digestive viscera, kidneys, pelvic floor & reproductive tract',
    view: 'region-abdomen',
    color: '#F59E0B'
  },
  {
    key: 'arms',
    label: 'Arms & hands',
    subtitle: 'Shoulder girdle, humerus, forearm bones, wrist & hand digits',
    view: 'region-arms',
    color: '#3B82F6'
  },
  {
    key: 'legs',
    label: 'Legs & feet',
    subtitle: 'Pelvic girdle, femur, patella, tibia, fibula & foot digits',
    view: 'region-legs',
    color: '#10B981'
  }
];

export function getRegionParts(regionKey: AnatomicalRegionKey, atlas: Atlas | null): string[] {
  if (!atlas) return [];
  return atlas.parts.filter(p => {
    const minY = p.bounds[0][1];
    const maxY = p.bounds[1][1];
    const avgY = (minY + maxY) / 2;
    const minX = Math.abs(p.bounds[0][0]);
    const maxX = Math.abs(p.bounds[1][0]);
    const avgX = (minX + maxX) / 2;

    switch (regionKey) {
      case 'head':
        return avgY >= 1.36;
      case 'arms':
        return avgX > 0.18 && avgY >= 0.70 && avgY <= 1.40;
      case 'chest':
        return avgY >= 1.10 && avgY < 1.36 && avgX <= 0.18;
      case 'abdomen':
        return avgY >= 0.75 && avgY < 1.10 && avgX <= 0.18;
      case 'legs':
        return avgY < 0.75;
      default:
        return false;
    }
  }).map(p => p.id);
}

export interface GuidedTourStep {
  title: string;
  subtitle: string;
  organKey: string;
  view: View;
  clinicalFact: string;
  focusExplanation: string;
}

export interface GuidedTour {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  steps: GuidedTourStep[];
}

export const GUIDED_TOURS: GuidedTour[] = [
  {
    id: 'circulatory-highway',
    title: 'The Circulatory Highway',
    subtitle: 'Trace the oxygen delivery network from the four-chambered heart to systemic tissue perfusion.',
    badge: 'Cardiovascular Loop',
    color: '#EF4444',
    steps: [
      {
        title: 'The Central Pump: Heart',
        subtitle: 'Myocardial walls, cardiac chambers & valves',
        organKey: 'heart',
        view: 'region-chest',
        clinicalFact: 'Pumps ~7,500 liters of blood daily through 100,000 beats, generating pressures up to 120 mmHg in the left ventricle.',
        focusExplanation: 'The muscular heart is situated in the middle mediastinum between the lungs. Note the thicker left ventricular wall designed to pump against high systemic vascular resistance.'
      },
      {
        title: 'The Great Vessels: Aorta & Arteries',
        subtitle: 'Elastic conduit & systemic arterial branch points',
        organKey: 'heart',
        view: 'region-chest',
        clinicalFact: 'The aortic arch branches into the brachiocephalic trunk, left common carotid, and left subclavian arteries to supply the brain and upper limbs.',
        focusExplanation: 'Elastic recoil (the Windkessel effect) in the aorta transforms pulsatile ventricular ejection into continuous downstream perfusion.'
      },
      {
        title: 'Pulmonary Re-oxygenation: Lungs',
        subtitle: 'Alveolocapillary interface & pulmonary veins',
        organKey: 'lungs',
        view: 'region-chest',
        clinicalFact: 'The lungs offer ~100 square meters of capillary surface area, exchanging oxygen and CO2 across a barrier less than 1 micrometer thick.',
        focusExplanation: 'Deoxygenated blood leaves the right ventricle via the pulmonary trunk, is oxygenated across alveolar capillaries, and returns via four pulmonary veins to the left atrium.'
      },
      {
        title: 'Visceral Perfusion: Liver & Kidneys',
        subtitle: 'Renal filtration & hepatic portal processing',
        organKey: 'kidneys',
        view: 'region-abdomen',
        clinicalFact: 'The renal arteries deliver 20-25% of resting cardiac output (~1.2 L/min) directly to the glomeruli for plasma ultrafiltration.',
        focusExplanation: 'Dual vascular supplies in the liver (hepatic artery + portal vein) and intensive microvascular loops in the renal medulla highlight specialized regional flow control.'
      }
    ]
  },
  {
    id: 'central-nervous-control',
    title: 'Master Control: Central Nervous System',
    subtitle: 'Explore the computational architecture and electrical signaling centers of the human brain.',
    badge: 'Neuroanatomy',
    color: '#A855F7',
    steps: [
      {
        title: 'The Cerebral Cortex',
        subtitle: 'Higher cognition, motor planning & sensory processing',
        organKey: 'brain',
        view: 'region-head',
        clinicalFact: 'Contains approximately 86 billion neurons and 100 trillion synaptic connections, consuming 20% of resting metabolic energy.',
        focusExplanation: 'The convoluted gyri and sulci maximize cortical surface area within the rigid cranial vault, organized into frontal, parietal, temporal, and occipital functional lobes.'
      },
      {
        title: 'Sensory Telemetry: The Visual System',
        subtitle: 'Retina, optic nerves & refractive apparatus',
        organKey: 'eye',
        view: 'region-head',
        clinicalFact: 'Over 50% of the cerebral cortex is directly or indirectly involved in processing visual information gathered through the optic nerves.',
        focusExplanation: 'The globes sit within protective bony orbits, cushioned by retrobulbar adipose tissue and steered by six coordinated extraocular muscles.'
      },
      {
        title: 'Coordination & Equilibrium: Cerebellum',
        subtitle: 'Motor timing, error correction & postural tone',
        organKey: 'brain',
        view: 'region-head',
        clinicalFact: 'Though accounting for only 10% of total brain mass, the cerebellum houses more than 50% of all neurons in the central nervous system.',
        focusExplanation: 'Nestled in the posterior cranial fossa beneath the tentorium cerebelli, it continuously compares intended motor motor commands with real-time proprioceptive feedback.'
      }
    ]
  },
  {
    id: 'digestive-journey',
    title: 'The Digestive Journey',
    subtitle: 'Follow food breakdown, enzymatic digestion, nutrient assimilation, and fluid resorption.',
    badge: 'Gastroenterology',
    color: '#F59E0B',
    steps: [
      {
        title: 'Chemical Factory: Liver & Gallbladder',
        subtitle: 'Bile synthesis, glycogen storage & drug clearance',
        organKey: 'liver',
        view: 'region-abdomen',
        clinicalFact: 'Performs over 500 vital biochemical functions and can fully regenerate from as little as 25% of remaining healthy tissue.',
        focusExplanation: 'Dominating the right upper quadrant beneath the diaphragm, the liver receives nutrient-laden blood directly from the intestinal capillary beds via the hepatic portal vein.'
      },
      {
        title: 'Enzyme & Hormone Engine: Pancreas',
        subtitle: 'Acinar digestive enzymes & Islets of Langerhans',
        organKey: 'pancreas',
        view: 'region-abdomen',
        clinicalFact: 'Produces ~1.5 liters of enzyme-rich alkaline pancreatic juice daily to neutralize gastric hydrochloric acid in the duodenum.',
        focusExplanation: 'Situated retroperitoneally behind the stomach, its endocrine beta-cells release insulin directly into venous channels to regulate systemic glycemic levels.'
      },
      {
        title: 'The Absorptive Surface: Small Intestine',
        subtitle: 'Duodenum, jejunum, ileum & circular folds',
        organKey: 'small-intestine',
        view: 'region-abdomen',
        clinicalFact: 'Intestinal microvilli expand the total mucosal absorptive surface area to roughly 30 square meters—the size of a studio apartment.',
        focusExplanation: 'Suspended by the fan-shaped mesentery, its coiled loops carry out terminal enzymatic digestion and absorb carbohydrates, amino acids, and lipids.'
      },
      {
        title: 'Water Reclamation: Large Intestine',
        subtitle: 'Cecum, colon, rectum & microbiome',
        organKey: 'large-intestine',
        view: 'region-abdomen',
        clinicalFact: 'Reclaims over 1.5 liters of water and essential electrolytes daily while hosting trillions of symbiotic bacteria.',
        focusExplanation: 'Framing the abdominal periphery, the colon exhibits characteristic haustra, taeniae coli, and epiploic appendages as it compacts unabsorbed residue.'
      }
    ]
  },
  {
    id: 'respiratory-engine',
    title: 'The Respiratory Engine',
    subtitle: 'Witness continuous ventilation, thoracic kinematics, and microvascular alveolar exchange.',
    badge: 'Pulmonology',
    color: '#06B6D4',
    steps: [
      {
        title: 'The Conduit: Trachea & Bronchial Tree',
        subtitle: 'Cartilage-supported airways & ciliary escalator',
        organKey: 'lungs',
        view: 'region-chest',
        clinicalFact: 'Bifurcates at the carina (T4/T5 vertebral level) into right and left main bronchi through ~23 generations of branching divisions.',
        focusExplanation: 'C-shaped hyaline cartilage rings maintain open airways during negative thoracic pressure swings while the posterior trachealis muscle allows esophageal expansion.'
      },
      {
        title: 'Gas Exchange Lobes: Bilateral Lungs',
        subtitle: 'Right trilobed and left bilobed parenchymal architecture',
        organKey: 'lungs',
        view: 'region-chest',
        clinicalFact: 'Healthy adult lungs contain ~300-500 million alveoli, providing a massive contact area for rapid oxygen-carbon dioxide diffusion.',
        focusExplanation: 'Notice the cardiac notch on the left lung accommodating the apex of the heart, dividing the lung into superior and inferior lobes.'
      }
    ]
  },
  {
    id: 'musculoskeletal-framework',
    title: 'The Musculoskeletal Framework',
    subtitle: 'Inspect the structural scaffold, joint articulations, and protective cranial/thoracic shielding.',
    badge: 'Orthopedics',
    color: '#10B981',
    steps: [
      {
        title: 'Axial Shield: Skull & Ribcage',
        subtitle: 'Calvaria, facial bones, sternum & costal arches',
        organKey: 'skin',
        view: 'region-chest',
        clinicalFact: '12 pairs of ribs protect vital thoracic viscera while facilitating respiratory expansion through costovertebral joint gliding.',
        focusExplanation: 'The axial skeleton forms the vertical axis of the body, anchoring posture and encasing the fragile neural tissue of the central nervous system.'
      },
      {
        title: 'Locomotion Pillars: Appendicular Skeleton',
        subtitle: 'Pelvic girdle, femur, tibia & synovial joints',
        organKey: 'skin',
        view: 'region-legs',
        clinicalFact: 'The femur is the longest, heaviest, and strongest bone in the human body, capable of supporting up to 30 times an adult’s body weight.',
        focusExplanation: 'Synovial joints provide frictionless articulated mobility, stabilized by dense capsular ligaments and dynamic muscular contractions.'
      }
    ]
  }
];
