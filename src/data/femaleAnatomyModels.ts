export interface Medical3DModel {
  id: string;
  title: string;
  subtitle: string;
  category: 'External & Vulva' | 'Internal Reproductive' | 'Pelvis & Perineum';
  uid: string;
  keyStructures: string[];
}

export const FEMALE_ANATOMY_MODELS: Medical3DModel[] = [
  {
    id: 'external-vulva-clitoris',
    title: 'External Female Genitalia (Vulva & Clitoris)',
    subtitle: 'Mons pubis, labia majora, labia minora, clitoral glans/hood, vestibule & vaginal introitus',
    category: 'External & Vulva',
    uid: 'f550863f4f5049638247c2ac0caf78ec',
    keyStructures: [
      'Mons pubis',
      'Labia majora (Left & Right)',
      'Labia minora (Left & Right)',
      'Prepuce of clitoris (Clitoral hood)',
      'Glans clitoridis',
      'Frenulum of clitoris',
      'Vestibule of vagina',
      'External urethral orifice (Urethral meatus)',
      'Vaginal orifice (Introitus)',
      'Posterior fourchette & Perineal body'
    ]
  },
  {
    id: 'clitoris-bartholin-vestibule',
    title: '3D Clitoral Complex, Vestibular Bulbs & Bartholin Glands',
    subtitle: 'Full internal & external clitoral anatomy (glans, body, crura, bulbs) & greater vestibular glands',
    category: 'External & Vulva',
    uid: 'e04d22d3d3224d5db7af8a50ec808dcc',
    keyStructures: [
      'Glans of clitoris',
      'Body (Corpus) of clitoris',
      'Crura of clitoris (Left & Right)',
      'Bulbs of vestibule (Left & Right)',
      'Greater vestibular (Bartholin) glands',
      'Vaginal vestibule & Introitus',
      'Labia minora & Clitoral prepuce'
    ]
  },
  {
    id: 'stanford-female-reproductive',
    title: 'Complete Female Reproductive Organs (Stanford Medicine)',
    subtitle: 'Interactive 3D model of female reproductive organs, pelvic bones, ligaments & tissues',
    category: 'Internal Reproductive',
    uid: '5e15cc97ef674446bf9f3e527c38d646',
    keyStructures: [
      'Uterus (Fundus, Body, Isthmus, Cervix)',
      'Vagina & Vaginal fornices',
      'Ovaries (Left & Right)',
      'Fallopian / Uterine tubes (Infundibulum, Ampulla, Isthmus, Fimbriae)',
      'Broad ligament, Round ligament & Ovarian ligament',
      'Urinary bladder & Female urethra',
      'Bony pelvis & Pubic symphysis'
    ]
  },
  {
    id: 'vagina-internal-tract',
    title: 'Vagina, Cervix, Uterus & Adnexa (Morphology & Cutaway)',
    subtitle: 'Detailed vaginal canal, rugae, fornices, cervical os, endometrial cavity & ovaries',
    category: 'Internal Reproductive',
    uid: '5e9ed416582142949f84c43327657faa',
    keyStructures: [
      'Vaginal canal & Columns of rugae',
      'Anterior, posterior & lateral vaginal fornices',
      'Cervix uteri (External os, Endocervical canal, Internal os)',
      'Uterine layers (Perimetrium, Myometrium, Endometrium)',
      'Fallopian tubes & Fimbriae',
      'Ovaries & Follicular structures'
    ]
  },
  {
    id: 'uob-female-reproductive',
    title: 'Female Reproductive System (University of Bristol Anatomy)',
    subtitle: 'Medical school reference assembly of the internal & external reproductive tract',
    category: 'Internal Reproductive',
    uid: '92b381e87d714fa4a6c0843b9dd364dc',
    keyStructures: [
      'Uterus & Cervix',
      'Vagina',
      'Ovaries & Uterine tubes',
      'Vesicouterine & Rectouterine (Douglas) pouches',
      'Pelvic support ligaments'
    ]
  },
  {
    id: 'pelvis-organs-mri',
    title: 'Bony Pelvis, Vulva & Pelvic Organs (3D MRI Reconstruction)',
    subtitle: 'Anatomically exact spatial relationship of vulva, vagina, uterus, bladder & pelvis from MRI',
    category: 'Pelvis & Perineum',
    uid: 'ad38f2971a054b4db2cd05e3efce9c59',
    keyStructures: [
      'External genitalia / Vulvar cleft',
      'Vagina & Uterus in situ',
      'Bladder & Urethra',
      'Rectum & Anal canal',
      'Ilium, Ischium, Pubis & Sacrum'
    ]
  },
  {
    id: 'dundee-female-pelvic-floor',
    title: 'Female Pelvis & Perineum (University of Dundee)',
    subtitle: 'Superficial & deep perineal spaces, urogenital triangle & pelvic diaphragm',
    category: 'Pelvis & Perineum',
    uid: '34f74adaf3ec4105b987f6162ed85eef',
    keyStructures: [
      'Urogenital triangle & Perineal membrane',
      'Bulbospongiosus & Ischiocavernosus muscles',
      'Superficial & Deep transverse perineal muscles',
      'Levator ani (Pubococcygeus, Puborectalis, Iliococcygeus)',
      'Vaginal & Urethral openings'
    ]
  },
  {
    id: 'pelvic-floor-muscles-2025',
    title: 'Female Pelvic Floor Musculature (3D Interactive)',
    subtitle: 'Detailed pelvic diaphragm, perineal body & sphincter musculature',
    category: 'Pelvis & Perineum',
    uid: '48aaae55602049f6aea85b233e5c16e9',
    keyStructures: [
      'Levator ani muscle group',
      'Coccygeus (Ischiococcygeus)',
      'External anal sphincter',
      'Urethrovaginal sphincter & Compressor urethrae',
      'Perineal body (Central tendon of perineum)'
    ]
  }
];
