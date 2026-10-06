import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

interface AtomDef {
  element: string;
  name: string;
  color: number;
  radius: number; // for ball & stick
  vdwRadius: number; // for space-filling
  en: number; // Pauling electronegativity
  pos: [number, number, number];
}

interface BondDef {
  atom1: number;
  atom2: number;
  order: 1 | 2 | 3;
}

interface MoleculeData {
  id: string;
  formula: string;
  name: string;
  vseprType: string;
  geometryName: string;
  idealAngle: string;
  isPolar: boolean;
  centralAtomIndex: number;
  atoms: AtomDef[];
  bonds: BondDef[];
  lonePairs?: [number, number, number][]; // 3D direction vectors for lone pair lobes
  description: string;
}

const MOLECULES: MoleculeData[] = [
  {
    id: 'h2o',
    formula: 'H₂O',
    name: 'Water',
    vseprType: 'AX₂E₂ (4 domains: 2 bonds, 2 lone pairs)',
    geometryName: 'Bent / Angular',
    idealAngle: '104.5° (repulsion from 2 lone pairs compresses from 109.5°)',
    isPolar: true,
    centralAtomIndex: 0,
    description: 'The two lone pairs on Oxygen exert strong electron-electron repulsion, squeezing the H-O-H bond angle down to 104.5° and creating a strong net molecular dipole moment.',
    atoms: [
      { element: 'O', name: 'Oxygen', color: 0xef4444, radius: 0.55, vdwRadius: 1.52, en: 3.44, pos: [0, 0.2, 0] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [-0.96, -0.55, 0] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [0.96, -0.55, 0] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 }
    ],
    lonePairs: [
      [0, 0.8, 0.7],
      [0, 0.8, -0.7]
    ]
  },
  {
    id: 'co2',
    formula: 'CO₂',
    name: 'Carbon Dioxide',
    vseprType: 'AX₂ (2 domains: 2 double bonds, 0 lone pairs)',
    geometryName: 'Linear',
    idealAngle: '180.0°',
    isPolar: false,
    centralAtomIndex: 0,
    description: 'The two double bonds repel equally into opposite directions. Although individual C=O bonds are polar (ΔEN = 0.89), their dipoles oppose symmetrically, yielding zero net molecular dipole.',
    atoms: [
      { element: 'C', name: 'Carbon', color: 0x334155, radius: 0.52, vdwRadius: 1.70, en: 2.55, pos: [0, 0, 0] },
      { element: 'O', name: 'Oxygen', color: 0xef4444, radius: 0.52, vdwRadius: 1.52, en: 3.44, pos: [-1.45, 0, 0] },
      { element: 'O', name: 'Oxygen', color: 0xef4444, radius: 0.52, vdwRadius: 1.52, en: 3.44, pos: [1.45, 0, 0] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 2 },
      { atom1: 0, atom2: 2, order: 2 }
    ]
  },
  {
    id: 'nh3',
    formula: 'NH₃',
    name: 'Ammonia',
    vseprType: 'AX₃E (4 domains: 3 bonds, 1 lone pair)',
    geometryName: 'Trigonal Pyramidal',
    idealAngle: '107.8°',
    isPolar: true,
    centralAtomIndex: 0,
    description: 'One lone pair sits at the apex of the pyramid, compressing the three N-H bond angles to 107.8°. Nitrogen pulls electron density upward, resulting in a strong net dipole vector.',
    atoms: [
      { element: 'N', name: 'Nitrogen', color: 0x3b82f6, radius: 0.54, vdwRadius: 1.55, en: 3.04, pos: [0, 0.35, 0] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [-0.94, -0.3, 0.54] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [0.94, -0.3, 0.54] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [0, -0.3, -1.08] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 }
    ],
    lonePairs: [
      [0, 1.0, 0]
    ]
  },
  {
    id: 'ch4',
    formula: 'CH₄',
    name: 'Methane',
    vseprType: 'AX₄ (4 domains: 4 bonds, 0 lone pairs)',
    geometryName: 'Tetrahedral',
    idealAngle: '109.5°',
    isPolar: false,
    centralAtomIndex: 0,
    description: 'Four identical C-H bonds orient symmetrically in 3D space toward the vertices of a regular tetrahedron with 109.5° bond angles, completely canceling all dipole components.',
    atoms: [
      { element: 'C', name: 'Carbon', color: 0x334155, radius: 0.54, vdwRadius: 1.70, en: 2.55, pos: [0, 0, 0] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [0.75, 0.75, 0.75] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [-0.75, -0.75, 0.75] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [-0.75, 0.75, -0.75] },
      { element: 'H', name: 'Hydrogen', color: 0xf8fafc, radius: 0.32, vdwRadius: 1.20, en: 2.20, pos: [0.75, -0.75, -0.75] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
      { atom1: 0, atom2: 4, order: 1 }
    ]
  },
  {
    id: 'bf3',
    formula: 'BF₃',
    name: 'Boron Trifluoride',
    vseprType: 'AX₃ (3 domains: 3 single bonds)',
    geometryName: 'Trigonal Planar',
    idealAngle: '120.0°',
    isPolar: false,
    centralAtomIndex: 0,
    description: 'Three B-F bonds lie flat in a single plane separated by 120°. Symmetrical cancellation produces a nonpolar molecule despite strongly polar B-F bonds.',
    atoms: [
      { element: 'B', name: 'Boron', color: 0xd97706, radius: 0.52, vdwRadius: 1.65, en: 2.04, pos: [0, 0, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.48, vdwRadius: 1.47, en: 3.98, pos: [0, 1.4, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.48, vdwRadius: 1.47, en: 3.98, pos: [1.21, -0.7, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.48, vdwRadius: 1.47, en: 3.98, pos: [-1.21, -0.7, 0] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 }
    ]
  },
  {
    id: 'sf6',
    formula: 'SF₆',
    name: 'Sulfur Hexafluoride',
    vseprType: 'AX₆ (6 domains: 6 bonds, 0 lone pairs)',
    geometryName: 'Octahedral',
    idealAngle: '90.0° (all adjacent bonds)',
    isPolar: false,
    centralAtomIndex: 0,
    description: 'Expanded octet on Sulfur with 6 electron pairs forming an octahedral geometry. Perfect cubic symmetry cancels all dipole moments completely.',
    atoms: [
      { element: 'S', name: 'Sulfur', color: 0xeab308, radius: 0.58, vdwRadius: 1.80, en: 2.58, pos: [0, 0, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [1.4, 0, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [-1.4, 0, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [0, 1.4, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [0, -1.4, 0] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [0, 0, 1.4] },
      { element: 'F', name: 'Fluorine', color: 0x22c55e, radius: 0.46, vdwRadius: 1.47, en: 3.98, pos: [0, 0, -1.4] }
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
      { atom1: 0, atom2: 4, order: 1 },
      { atom1: 0, atom2: 5, order: 1 },
      { atom1: 0, atom2: 6, order: 1 }
    ]
  }
];

export const MolecularVSEPRLab: React.FC = () => {
  const [selectedMoleculeId, setSelectedMoleculeId] = useState('h2o');
  const [renderMode, setRenderMode] = useState<'ball_stick' | 'space_fill'>('ball_stick');
  const [showLonePairs, setShowLonePairs] = useState(true);
  const [showDipole, setShowDipole] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);

  const mol = MOLECULES.find(m => m.id === selectedMoleculeId) || MOLECULES[0];

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Interactive Drag to Rotate
    let isPointerDown = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown || !moleculeGroupRef.current) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      moleculeGroupRef.current.rotation.y += dx * 0.01;
      moleculeGroupRef.current.rotation.x += dy * 0.01;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerUp = () => { isPointerDown = false; };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      if (moleculeGroupRef.current && isRotating && !isPointerDown) {
        moleculeGroupRef.current.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  // Re-build 3D molecule geometry whenever selection or render mode changes
  useEffect(() => {
    const group = moleculeGroupRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    // 1. Add Atoms
    mol.atoms.forEach((atom) => {
      const radius = renderMode === 'space_fill' ? atom.vdwRadius * 0.6 : atom.radius;
      const mat = new THREE.MeshPhysicalMaterial({
        color: atom.color,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(...atom.pos);
      group.add(mesh);
    });

    // 2. Add Bonds (Cylinders) if in Ball & Stick mode
    if (renderMode === 'ball_stick') {
      const cylGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);

      mol.bonds.forEach((bond) => {
        const a1 = mol.atoms[bond.atom1];
        const a2 = mol.atoms[bond.atom2];
        const p1 = new THREE.Vector3(...a1.pos);
        const p2 = new THREE.Vector3(...a2.pos);
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4
        });

        const cylinder = new THREE.Mesh(cylGeo, bondMat);
        cylinder.scale.set(1, len, 1);
        cylinder.position.copy(mid);

        // Orient cylinder along dir vector
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        group.add(cylinder);
      });
    }

    // 3. Add Lone Pairs (Translucent electron clouds)
    if (showLonePairs && mol.lonePairs && renderMode === 'ball_stick') {
      const centralAtom = mol.atoms[mol.centralAtomIndex];
      const cPos = new THREE.Vector3(...centralAtom.pos);

      mol.lonePairs.forEach((lpDir) => {
        const lobeGeo = new THREE.SphereGeometry(0.35, 20, 20);
        lobeGeo.scale(0.8, 1.4, 0.8);
        const lobeMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          transmission: 0.6
        });
        const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
        const dir = new THREE.Vector3(...lpDir).normalize();
        const lobePos = cPos.clone().add(dir.clone().multiplyScalar(0.8));
        lobeMesh.position.copy(lobePos);
        lobeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        group.add(lobeMesh);
      });
    }

    // 4. Net Dipole Moment Vector (Yellow 3D arrow)
    if (showDipole && mol.isPolar) {
      // Calculate net dipole based on sum of bond vectors * delta EN
      const central = mol.atoms[mol.centralAtomIndex];
      const netDipole = new THREE.Vector3(0, 0, 0);

      mol.bonds.forEach((bond) => {
        const otherIdx = bond.atom1 === mol.centralAtomIndex ? bond.atom2 : bond.atom1;
        const other = mol.atoms[otherIdx];
        const pC = new THREE.Vector3(...central.pos);
        const pO = new THREE.Vector3(...other.pos);
        // Vector pointing from positive to negative
        const deltaEN = other.en - central.en;
        const bondVec = new THREE.Vector3().subVectors(pO, pC).normalize();
        netDipole.add(bondVec.multiplyScalar(deltaEN));
      });

      if (netDipole.length() > 0.05) {
        const dir = netDipole.clone().normalize();
        const arrowHelper = new THREE.ArrowHelper(
          dir,
          new THREE.Vector3(0, 0, 0),
          1.8,
          0xfacc15,
          0.35,
          0.2
        );
        group.add(arrowHelper);
      }
    }
  }, [mol, renderMode, showLonePairs, showDipole]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#090d16',
        color: '#f8fafc',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Sparkles size={13} />
            <span>FLAGSHIP CHEMISTRY LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            3D Molecular Geometry, VSEPR &amp; Dipole Moments
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setRenderMode(m => m === 'ball_stick' ? 'space_fill' : 'ball_stick')}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e2e8f0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mode: {renderMode === 'ball_stick' ? 'Ball & Stick' : 'Space Filling'}
          </button>

          <button
            type="button"
            onClick={() => setShowLonePairs(!showLonePairs)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showLonePairs ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showLonePairs ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              color: showLonePairs ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Lone Pairs {showLonePairs ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowDipole(!showDipole)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showDipole ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showDipole ? '#facc15' : 'rgba(255,255,255,0.1)'}`,
              color: showDipole ? '#facc15' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Net Dipole {showDipole ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: isRotating ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isRotating ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
              color: isRotating ? '#22c55e' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Auto-Rotate {isRotating ? 'ON' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Molecules Selection Panel */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 280,
            maxHeight: 'calc(100% - 28px)',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            backdropFilter: 'blur(8px)',
            padding: '12px 14px',
            zIndex: 30,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#93c5fd' }}>
            SELECT MOLECULE:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {MOLECULES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMoleculeId(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: selectedMoleculeId === m.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedMoleculeId === m.id ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedMoleculeId === m.id ? '#38bdf8' : '#cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{m.name} ({m.formula})</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{m.geometryName}</span>
              </button>
            ))}
          </div>

          {/* VSEPR Geometry Information Box */}
          <div
            style={{
              marginTop: 6,
              padding: '10px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>VSEPR TYPE:</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{mol.vseprType}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>MOLECULAR SHAPE:</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4ade80' }}>{mol.geometryName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BOND ANGLE:</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                {mol.idealAngle}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>POLARITY:</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: mol.isPolar ? '#f87171' : '#94a3b8' }}>
                {mol.isPolar ? '⚡ Polar (Net Dipole Vector ≠ 0)' : '⚖ Nonpolar (Symmetric Cancellation)'}
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 }}>
              {mol.description}
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', cursor: 'grab' }}
          title="Drag to rotate molecule in 3D"
        />

        {/* 3D Interaction Tip HUD */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            padding: '6px 12px',
            borderRadius: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.7rem',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}
        >
          🖱 Drag to rotate in 3D • Scroll to zoom
        </div>
      </div>
    </div>
  );
};
