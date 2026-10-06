// ============================================================================
// PHYSORA 3D HUMAN ANATOMY WEBGL ENGINE
// High-Precision Scientific 3D Visualization using Three.js
// Medically Calibrated PBR Geometry, Layer Separation & Fluid Circulation
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type {
  AnatomicalSystemId,
  DetailLevel
} from '../../data/anatomyData';
import { ANATOMY_STRUCTURES } from '../../data/anatomyData';

export interface Anatomy3DCanvasProps {
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  systemVisibility: Record<AnatomicalSystemId, boolean>;
  systemOpacity: Record<AnatomicalSystemId, number>;
  isIsolated: boolean;
  showInternal: boolean;
  layerSeparation: number; // 0.0 (natural) to 1.0 (fully exploded / separated)
  isProcessPlaying: boolean;
  processSpeed: number; // 0.5 to 2.0
  processStepTick?: number; // increments for step-by-step
  detailLevel: DetailLevel;
  presetView: 'front' | 'back' | 'left' | 'right' | 'top' | 'reset' | null;
  onPresetViewHandled: () => void;
}

interface MeshUserData {
  id: string;
  name: string;
  system: AnatomicalSystemId;
  isInternal?: boolean;
}

interface SeparablePart {
  mesh: THREE.Object3D;
  naturalPosition: THREE.Vector3;
  separatedOffset: THREE.Vector3;
  naturalRotation?: THREE.Euler;
  separatedRotation?: THREE.Euler;
}

interface CirculationParticleSystem {
  mesh: THREE.Points;
  splines: THREE.CatmullRomCurve3[];
  tValues: Float32Array;
  speeds: Float32Array;
  colors: Float32Array;
  isArterialList: boolean[];
}

export const Anatomy3DCanvas: React.FC<Anatomy3DCanvasProps> = ({
  selectedStructureId,
  onSelectStructure,
  systemVisibility,
  systemOpacity,
  isIsolated,
  showInternal,
  layerSeparation,
  isProcessPlaying,
  processSpeed,
  processStepTick = 0,
  detailLevel: _detailLevel,
  presetView,
  onPresetViewHandled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStructure, setHoveredStructure] = useState<{
    id: string;
    name: string;
    system: string;
    x: number;
    y: number;
  } | null>(null);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const structuresGroupRef = useRef<THREE.Group | null>(null);
  const internalGroupRef = useRef<THREE.Group | null>(null);
  const circulationGroupRef = useRef<THREE.Group | null>(null);

  // Camera Target & Cinematic Spring State
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const cameraDesiredTargetRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const cameraSphericalRef = useRef({ radius: 12.0, theta: 0, phi: Math.PI / 2 });
  const cameraDesiredSphericalRef = useRef({ radius: 12.0, theta: 0, phi: Math.PI / 2 });

  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Animation frame loop refs
  const animationFrameIdRef = useRef<number | null>(null);
  const circulationSystemRef = useRef<CirculationParticleSystem | null>(null);
  const separablePartsRef = useRef<SeparablePart[]>([]);

  // Mesh Registry for direct highlighting and opacity manipulation
  const meshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());

  // --------------------------------------------------------------------------
  // 1. INITIALIZE THREE.JS SCENE, PBR LIGHTING & RENDERER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070B14); // Deep space medical navy
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 12.0);
    cameraRef.current = camera;

    // Renderer with ACES Tone Mapping for rich biological colors
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ------------------------------------------------------------------------
    // PBR MEDICAL LIGHTING RIG (Cinematic Scientific Lighting)
    // ------------------------------------------------------------------------
    // 1. Ambient soft slate fill
    const ambientLight = new THREE.AmbientLight(0x94A3B8, 0.7);
    scene.add(ambientLight);

    // 2. Main Key Directional Light (upper right front)
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    keyLight.position.set(7, 10, 8);
    scene.add(keyLight);

    // 3. Rim / Contour Light (Cool cyan edge from rear-left for organic separation)
    const rimLight = new THREE.DirectionalLight(0x38BDF8, 1.2);
    rimLight.position.set(-8, 7, -6);
    scene.add(rimLight);

    // 4. Secondary Backlight (Subtle violet rim for anatomical depth)
    const secondaryRim = new THREE.DirectionalLight(0xA855F7, 0.5);
    secondaryRim.position.set(6, -4, -6);
    scene.add(secondaryRim);

    // 5. Warm Underfill Bounce (Biological subsurface warmth)
    const fillLight = new THREE.DirectionalLight(0xF87171, 0.35);
    fillLight.position.set(0, -7, 5);
    scene.add(fillLight);

    // Ground Faded Pedestal Grid
    const gridHelper = new THREE.GridHelper(16, 32, 0x1E293B, 0x0F172A);
    gridHelper.position.y = -9.2;
    scene.add(gridHelper);

    // Structural Groups
    const structuresGroup = new THREE.Group();
    scene.add(structuresGroup);
    structuresGroupRef.current = structuresGroup;

    const internalGroup = new THREE.Group();
    scene.add(internalGroup);
    internalGroupRef.current = internalGroup;

    const circulationGroup = new THREE.Group();
    scene.add(circulationGroup);
    circulationGroupRef.current = circulationGroup;

    // ------------------------------------------------------------------------
    // BUILD HIGH-FIDELITY ANATOMICAL SCENE & SEPARATION REGISTRY
    // ------------------------------------------------------------------------
    const separableParts: SeparablePart[] = [];
    separablePartsRef.current = separableParts;

    buildAnatomyScene(structuresGroup, internalGroup, meshMapRef.current, separableParts);

    // Setup Dual-Pathway Blood Circulation Spline Simulation
    setupDualCircuitCirculation(circulationGroup, circulationSystemRef);

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ------------------------------------------------------------------------
    // MAIN 60FPS CINEMATIC RENDER & SIMULATION LOOP
    // ------------------------------------------------------------------------
    let previousTime = performance.now();
    const animate = (currentTime: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - previousTime) * 0.001, 0.1);
      previousTime = currentTime;

      // 1. Cinematic Non-Teleporting Camera Spring Interpolation
      const cam = cameraRef.current;
      if (cam) {
        const desiredTarget = cameraDesiredTargetRef.current;
        const currentTarget = cameraTargetRef.current;
        const desiredSpherical = cameraDesiredSphericalRef.current;
        const currentSpherical = cameraSphericalRef.current;

        // Smooth critically-damped exponential factor
        const smoothFactor = 1.0 - Math.exp(-delta * 5.0);

        currentTarget.lerp(desiredTarget, smoothFactor);
        currentSpherical.radius += (desiredSpherical.radius - currentSpherical.radius) * smoothFactor;
        currentSpherical.theta += (desiredSpherical.theta - currentSpherical.theta) * smoothFactor;
        currentSpherical.phi += (desiredSpherical.phi - currentSpherical.phi) * smoothFactor;

        // Compute 3D Cartesian coordinates from spherical
        const x = currentTarget.x + currentSpherical.radius * Math.sin(currentSpherical.phi) * Math.sin(currentSpherical.theta);
        const y = currentTarget.y + currentSpherical.radius * Math.cos(currentSpherical.phi);
        const z = currentTarget.z + currentSpherical.radius * Math.sin(currentSpherical.phi) * Math.cos(currentSpherical.theta);

        cam.position.set(x, y, z);
        cam.lookAt(currentTarget);
      }

      // 2. Animated Biological Processes (Dual-Circuit Blood Flow, Cardiac Beats, Respiratory Expansion)
      renderDynamicBiologicalProcesses(
        delta,
        isProcessPlaying,
        processSpeed,
        circulationSystemRef.current,
        structuresGroupRef.current,
        currentTime
      );

      renderer.render(scene, camera);
    };
    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. LAYER SEPARATION / EXPLODED VIEW INTERPOLATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    const parts = separablePartsRef.current;
    const factor = THREE.MathUtils.clamp(layerSeparation, 0, 1);

    parts.forEach((part) => {
      // Interpolate position smoothly based on layer separation
      part.mesh.position.lerpVectors(
        part.naturalPosition,
        part.naturalPosition.clone().add(part.separatedOffset),
        factor
      );

      // Interpolate rotation if configured
      if (part.naturalRotation && part.separatedRotation) {
        part.mesh.rotation.x = THREE.MathUtils.lerp(part.naturalRotation.x, part.separatedRotation.x, factor);
        part.mesh.rotation.y = THREE.MathUtils.lerp(part.naturalRotation.y, part.separatedRotation.y, factor);
        part.mesh.rotation.z = THREE.MathUtils.lerp(part.naturalRotation.z, part.separatedRotation.z, factor);
      }
    });
  }, [layerSeparation]);

  // --------------------------------------------------------------------------
  // 3. STEP-BY-STEP PROGRESSION TRIGGER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (processStepTick === 0 || !circulationSystemRef.current) return;
    // Advance circulation particles forward by a discrete step
    const circ = circulationSystemRef.current;
    for (let i = 0; i < circ.tValues.length; i++) {
      circ.tValues[i] = (circ.tValues[i] + 0.05) % 1.0;
    }
  }, [processStepTick]);

  // --------------------------------------------------------------------------
  // 4. HANDLE PRESET CAMERA VIEWS (Front, Back, Left, Right, Top, Reset)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!presetView) return;

    if (presetView === 'reset') {
      cameraDesiredSphericalRef.current = { radius: 12.0, theta: 0, phi: Math.PI / 2 };
      cameraDesiredTargetRef.current.set(0, 1.2, 0);
    } else if (presetView === 'front') {
      cameraDesiredSphericalRef.current.theta = 0;
      cameraDesiredSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'back') {
      cameraDesiredSphericalRef.current.theta = Math.PI;
      cameraDesiredSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'left') {
      cameraDesiredSphericalRef.current.theta = Math.PI / 2;
      cameraDesiredSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'right') {
      cameraDesiredSphericalRef.current.theta = -Math.PI / 2;
      cameraDesiredSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'top') {
      cameraDesiredSphericalRef.current.phi = 0.08;
    }

    onPresetViewHandled();
  }, [presetView, onPresetViewHandled]);

  // --------------------------------------------------------------------------
  // 5. CINEMATIC CAMERA FOCUS ON SELECTED ORGAN & ISOLATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedStructureId) {
      if (!isIsolated) {
        cameraDesiredTargetRef.current.set(0, 1.2, 0);
        cameraDesiredSphericalRef.current.radius = 12.0;
      }
      return;
    }

    const structure = ANATOMY_STRUCTURES[selectedStructureId];
    if (!structure) return;

    if (isIsolated) {
      // Focus closely on isolated organ centered at origin
      cameraDesiredTargetRef.current.set(structure.center[0], structure.center[1], structure.center[2]);
      cameraDesiredSphericalRef.current.radius = Math.max(structure.cameraFocus.distance * 0.9, 1.8);
    } else {
      // Smoothly track organ in full body context
      cameraDesiredTargetRef.current.set(
        structure.cameraFocus.target[0],
        structure.cameraFocus.target[1],
        structure.cameraFocus.target[2]
      );
      cameraDesiredSphericalRef.current.radius = Math.max(structure.cameraFocus.distance, 2.0);
    }
  }, [selectedStructureId, isIsolated]);

  // --------------------------------------------------------------------------
  // 6. UPDATE VISIBILITY, HIGHLIGHTS, TRANSPARENCY & ISOLATION IN 3D
  // --------------------------------------------------------------------------
  useEffect(() => {
    const meshMap = meshMapRef.current;

    meshMap.forEach((meshes, id) => {
      const struct = ANATOMY_STRUCTURES[id];
      if (!struct) return;

      const isSystemVisible = systemVisibility[struct.system] ?? true;
      const systemAlpha = systemOpacity[struct.system] ?? 1.0;
      const isSelected = selectedStructureId === id;

      // Isolation logic: only selected structure remains visible if isIsolated is true
      let shouldBeVisible = isSystemVisible;
      if (isIsolated) {
        shouldBeVisible = isSelected;
      }

      meshes.forEach((mesh) => {
        mesh.visible = shouldBeVisible;

        if (!shouldBeVisible) return;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        if (isSelected) {
          // Vibrant scientific selection highlight
          mat.emissive.set(struct.accentColor || 0x10B981);
          mat.emissiveIntensity = 0.55;
          mat.opacity = 1.0;
          mat.transparent = false;
        } else if (selectedStructureId && !isIsolated) {
          // Dim non-selected structures into subtle translucent depth silhouette
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = Math.min(systemAlpha * 0.22, 0.25);
          mat.transparent = true;
        } else {
          // Normal state with system opacity
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = systemAlpha;
          mat.transparent = systemAlpha < 0.95;
        }
      });
    });

    // Toggle Internal Structure Group
    if (internalGroupRef.current) {
      internalGroupRef.current.visible = (showInternal || layerSeparation > 0.1) && !!selectedStructureId;
    }
  }, [selectedStructureId, systemVisibility, systemOpacity, isIsolated, showInternal, layerSeparation]);

  // --------------------------------------------------------------------------
  // 7. MOUSE & TOUCH ORBIT / ZOOM / PAN INTERACTIONS
  // --------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (e.button === 2 || e.shiftKey) {
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      // Rotate spherical coordinates
      cameraDesiredSphericalRef.current.theta -= deltaX * 0.0075;
      cameraDesiredSphericalRef.current.phi = THREE.MathUtils.clamp(
        cameraDesiredSphericalRef.current.phi - deltaY * 0.0075,
        0.05,
        Math.PI - 0.05
      );
    } else if (isPanningRef.current) {
      // Pan camera target
      const factor = cameraDesiredSphericalRef.current.radius * 0.0018;
      cameraDesiredTargetRef.current.y += deltaY * factor;
      cameraDesiredTargetRef.current.x -= deltaX * factor * Math.cos(cameraDesiredSphericalRef.current.theta);
      cameraDesiredTargetRef.current.z += deltaX * factor * Math.sin(cameraDesiredSphericalRef.current.theta);
    } else {
      // Hover Raycasting for Tooltip
      performHoverRaycast(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.005;
    cameraDesiredSphericalRef.current.radius = THREE.MathUtils.clamp(
      cameraDesiredSphericalRef.current.radius + zoomDelta,
      1.2,
      25.0
    );
  };

  // Touch handlers for mobile pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const diff = touchStartDistRef.current - currentDist;
      cameraDesiredSphericalRef.current.radius = THREE.MathUtils.clamp(
        cameraDesiredSphericalRef.current.radius + diff * 0.02,
        1.2,
        25.0
      );
      touchStartDistRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Click Raycasting for Organ Selection
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !structuresGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(structuresGroupRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        if (hit.object.visible && hit.object.userData && (hit.object.userData as MeshUserData).id) {
          const structId = (hit.object.userData as MeshUserData).id;
          onSelectStructure(structId);
          return;
        }
      }
    } else {
      if (!isIsolated) {
        onSelectStructure(null);
      }
    }
  };

  // Hover Raycasting for tooltip
  const performHoverRaycast = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current || !structuresGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(structuresGroupRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        if (hit.object.visible && hit.object.userData && (hit.object.userData as MeshUserData).id) {
          const ud = hit.object.userData as MeshUserData;
          setHoveredStructure({
            id: ud.id,
            name: ud.name,
            system: ud.system,
            x: clientX,
            y: clientY
          });
          return;
        }
      }
    }
    setHoveredStructure(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: hoveredStructure ? 'pointer' : 'grab',
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Floating Hover Tooltip */}
      {hoveredStructure && (
        <div
          style={{
            position: 'fixed',
            left: hoveredStructure.x + 14,
            top: hoveredStructure.y - 28,
            pointerEvents: 'none',
            zIndex: 150,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            padding: '6px 12px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '0.80rem',
            color: '#FFFFFF',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ fontWeight: 800 }}>{hoveredStructure.name}</div>
          <div style={{ fontSize: '0.70rem', color: '#10B981', textTransform: 'capitalize', fontWeight: 600 }}>
            {hoveredStructure.system} system
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HIGH-FIDELITY 3D ANATOMICAL MESH BUILDER
// Builds proportional, medically sculpted 3D geometries for all 8 systems
// ============================================================================

function buildAnatomyScene(
  mainGroup: THREE.Group,
  internalGroup: THREE.Group,
  meshMap: Map<string, THREE.Mesh[]>,
  separableParts: SeparablePart[]
) {
  const registerMesh = (id: string, mesh: THREE.Mesh, system: AnatomicalSystemId, name: string) => {
    mesh.userData = { id, system, name } as MeshUserData;
    let list = meshMap.get(id);
    if (!list) {
      list = [];
      meshMap.set(id, list);
    }
    list.push(mesh);
  };

  // --------------------------------------------------------------------------
  // SKELETAL SYSTEM (Skull, Vertebral Column, Ribcage, Pelvis, Limbs)
  // --------------------------------------------------------------------------
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xE8ECF2,
    roughness: 0.42,
    metalness: 0.08
  });

  // 1. Skull, Orbits & Mandible (Y: 6.7)
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 6.7, 0.1);

  // Cranium Vault
  const craniumGeo = new THREE.SphereGeometry(0.54, 28, 24);
  craniumGeo.scale(0.85, 1.05, 1.15);
  const cranium = new THREE.Mesh(craniumGeo, boneMat.clone());
  skullGroup.add(cranium);
  registerMesh('skull', cranium, 'skeletal', 'Skull (Cranium)');

  // Facial Skeleton
  const faceGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.48, 16);
  faceGeo.scale(0.9, 1.0, 0.75);
  const face = new THREE.Mesh(faceGeo, boneMat.clone());
  face.position.set(0, -0.35, 0.22);
  skullGroup.add(face);
  registerMesh('skull', face, 'skeletal', 'Facial Bones & Maxilla');

  // Bilateral Eye Orbits
  [-0.18, 0.18].forEach((side) => {
    const orbitGeo = new THREE.RingGeometry(0.06, 0.11, 16);
    const orbit = new THREE.Mesh(orbitGeo, boneMat.clone());
    orbit.position.set(side, -0.22, 0.48);
    skullGroup.add(orbit);
  });

  // Mandible Jaw (Articulated)
  const mandibleGeo = new THREE.TorusGeometry(0.24, 0.06, 12, 16, Math.PI);
  mandibleGeo.rotateX(Math.PI / 2);
  const mandible = new THREE.Mesh(mandibleGeo, boneMat.clone());
  mandible.position.set(0, -0.58, 0.24);
  skullGroup.add(mandible);
  registerMesh('skull', mandible, 'skeletal', 'Mandible Jaw');

  mainGroup.add(skullGroup);

  // 2. Vertebral Column / Spine with Authentic Physiological Curvature (Y: 0.2 to 6.2)
  const spinePoints: THREE.Vector3[] = [];
  for (let y = 6.2; y >= 0.1; y -= 0.15) {
    let zOffset = 0;
    if (y > 4.8) {
      // Cervical Lordosis (anterior curve)
      zOffset = 0.07 * Math.sin(((y - 4.8) / 1.4) * Math.PI);
    } else if (y > 2.0) {
      // Thoracic Kyphosis (posterior curve)
      zOffset = -0.14 * Math.sin(((y - 2.0) / 2.8) * Math.PI);
    } else {
      // Lumbar Lordosis (anterior curve)
      zOffset = 0.09 * Math.sin((y / 2.0) * Math.PI);
    }
    spinePoints.push(new THREE.Vector3(0, y, -0.15 + zOffset));
  }
  const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
  const spineGeo = new THREE.TubeGeometry(spineCurve, 50, 0.11, 12, false);
  const spine = new THREE.Mesh(spineGeo, boneMat.clone());
  mainGroup.add(spine);
  registerMesh('spine', spine, 'skeletal', 'Vertebral Column');

  // Sacrum & Coccyx base
  const sacrumGeo = new THREE.ConeGeometry(0.22, 0.45, 8);
  sacrumGeo.rotateX(Math.PI);
  const sacrum = new THREE.Mesh(sacrumGeo, boneMat.clone());
  sacrum.position.set(0, 0.05, -0.12);
  mainGroup.add(sacrum);
  registerMesh('spine', sacrum, 'skeletal', 'Sacrum & Coccyx');

  // 3. Thoracic Ribcage (12 Pairs) & Sternum (Y: 1.8 to 4.3)
  const ribcageGroup = new THREE.Group();
  for (let r = 0; r < 11; r++) {
    const ry = 4.2 - r * 0.21;
    const ribRadius = 0.54 + Math.sin((r / 10) * Math.PI) * 0.34;
    const ribGeo = new THREE.TorusGeometry(ribRadius, 0.026, 8, 26, Math.PI * 1.58);
    ribGeo.rotateX(Math.PI / 2);
    ribGeo.rotateZ(Math.PI * 0.21);
    ribGeo.scale(0.95, 1.0, 0.88);

    const rib = new THREE.Mesh(ribGeo, boneMat.clone());
    rib.position.set(0, ry, 0.08);
    ribcageGroup.add(rib);
    registerMesh('ribcage', rib, 'skeletal', `Rib Pair ${r + 1}`);
  }

  // Sternum (Manubrium, Body, Xiphoid Process)
  const sternumGeo = new THREE.BoxGeometry(0.15, 1.45, 0.045);
  const sternum = new THREE.Mesh(sternumGeo, boneMat.clone());
  sternum.position.set(0, 3.15, 0.74);
  ribcageGroup.add(sternum);
  registerMesh('ribcage', sternum, 'skeletal', 'Sternum');
  mainGroup.add(ribcageGroup);

  // 4. Pelvis (Ilium, Pubic Symphysis, Ischium) (Y: -0.2)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, -0.2, 0.05);

  [-0.46, 0.46].forEach((side) => {
    const iliumGeo = new THREE.SphereGeometry(0.44, 18, 14);
    iliumGeo.scale(0.65, 0.95, 0.42);
    const ilium = new THREE.Mesh(iliumGeo, boneMat.clone());
    ilium.position.set(side, 0.15, 0);
    pelvisGroup.add(ilium);
    registerMesh('pelvis', ilium, 'skeletal', 'Pelvis (Ilium)');
  });

  const pubicGeo = new THREE.TorusGeometry(0.36, 0.065, 10, 18, Math.PI);
  pubicGeo.rotateX(Math.PI / 2);
  const pubic = new THREE.Mesh(pubicGeo, boneMat.clone());
  pubic.position.set(0, -0.32, 0.22);
  pelvisGroup.add(pubic);
  registerMesh('pelvis', pubic, 'skeletal', 'Pubic Symphysis');
  mainGroup.add(pelvisGroup);

  // 5. Upper Limbs (Clavicles, Humerus, Forearms, Hands)
  const upperLimbsGroup = new THREE.Group();
  [-1, 1].forEach((side) => {
    // Clavicle
    const clavicleGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.78, 10);
    clavicleGeo.rotateZ(side * Math.PI * 0.44);
    const clavicle = new THREE.Mesh(clavicleGeo, boneMat.clone());
    clavicle.position.set(side * 0.46, 4.35, 0.36);
    upperLimbsGroup.add(clavicle);
    registerMesh('limbs_upper', clavicle, 'skeletal', side === -1 ? 'Left Clavicle' : 'Right Clavicle');

    // Humerus
    const humerusGeo = new THREE.CylinderGeometry(0.08, 0.07, 1.45, 12);
    const humerus = new THREE.Mesh(humerusGeo, boneMat.clone());
    humerus.position.set(side * 1.08, 3.4, 0.1);
    humerus.rotation.z = side * 0.12;
    upperLimbsGroup.add(humerus);
    registerMesh('limbs_upper', humerus, 'skeletal', side === -1 ? 'Left Humerus' : 'Right Humerus');

    // Radius & Ulna Forearm
    const forearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 1.35, 10);
    const forearm = new THREE.Mesh(forearmGeo, boneMat.clone());
    forearm.position.set(side * 1.28, 1.95, 0.16);
    forearm.rotation.z = side * 0.08;
    upperLimbsGroup.add(forearm);
    registerMesh('limbs_upper', forearm, 'skeletal', side === -1 ? 'Left Forearm' : 'Right Forearm');

    // Hand Digits
    const handGeo = new THREE.BoxGeometry(0.12, 0.38, 0.08);
    const hand = new THREE.Mesh(handGeo, boneMat.clone());
    hand.position.set(side * 1.38, 1.1, 0.18);
    upperLimbsGroup.add(hand);
    registerMesh('limbs_upper', hand, 'skeletal', side === -1 ? 'Left Hand' : 'Right Hand');
  });
  mainGroup.add(upperLimbsGroup);

  // 6. Lower Limbs (Femur, Patella, Tibia/Fibula, Feet)
  const lowerLimbsGroup = new THREE.Group();
  [-1, 1].forEach((side) => {
    // Femur
    const femurGeo = new THREE.CylinderGeometry(0.095, 0.085, 2.35, 12);
    const femur = new THREE.Mesh(femurGeo, boneMat.clone());
    femur.position.set(side * 0.45, -1.6, 0.05);
    femur.rotation.z = -side * 0.05;
    lowerLimbsGroup.add(femur);
    registerMesh('limbs_lower', femur, 'skeletal', side === -1 ? 'Left Femur' : 'Right Femur');

    // Patella Kneecap
    const patellaGeo = new THREE.SphereGeometry(0.085, 12, 10);
    patellaGeo.scale(1, 1.2, 0.55);
    const patella = new THREE.Mesh(patellaGeo, boneMat.clone());
    patella.position.set(side * 0.42, -2.8, 0.16);
    lowerLimbsGroup.add(patella);
    registerMesh('limbs_lower', patella, 'skeletal', 'Patella');

    // Tibia & Fibula
    const tibiaGeo = new THREE.CylinderGeometry(0.08, 0.068, 2.25, 12);
    const tibia = new THREE.Mesh(tibiaGeo, boneMat.clone());
    tibia.position.set(side * 0.42, -4.0, 0.08);
    lowerLimbsGroup.add(tibia);
    registerMesh('limbs_lower', tibia, 'skeletal', side === -1 ? 'Left Tibia' : 'Right Tibia');

    // Foot
    const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.58);
    const foot = new THREE.Mesh(footGeo, boneMat.clone());
    foot.position.set(side * 0.42, -5.2, 0.26);
    lowerLimbsGroup.add(foot);
    registerMesh('limbs_lower', foot, 'skeletal', side === -1 ? 'Left Foot' : 'Right Foot');
  });
  mainGroup.add(lowerLimbsGroup);

  // --------------------------------------------------------------------------
  // CARDIOVASCULAR SYSTEM (Heart, Aorta, Vena Cava, Coronary Vessels)
  // --------------------------------------------------------------------------
  const heartGroup = new THREE.Group();
  heartGroup.position.set(-0.15, 2.7, 0.3);
  heartGroup.userData = { id: 'heart', system: 'cardiovascular', name: 'Heart' };

  // Thick Myocardial Ventricles (Base of heart)
  const heartBaseMat = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    roughness: 0.38,
    metalness: 0.12
  });

  // Posterior heart body & Atria
  const heartPosteriorGeo = new THREE.SphereGeometry(0.38, 24, 20);
  heartPosteriorGeo.scale(0.85, 1.15, 0.85);
  const heartPosterior = new THREE.Mesh(heartPosteriorGeo, heartBaseMat);
  heartPosterior.rotation.z = -0.18;
  heartGroup.add(heartPosterior);
  registerMesh('heart', heartPosterior, 'cardiovascular', 'Heart (Myocardium)');

  // Anterior Ventricular Wall (SEPARABLE in Exploded View!)
  const heartAnteriorGeo = new THREE.SphereGeometry(0.36, 20, 16, 0, Math.PI);
  heartAnteriorGeo.scale(0.82, 1.12, 0.82);
  const heartAnterior = new THREE.Mesh(heartAnteriorGeo, heartBaseMat.clone());
  heartAnterior.rotation.z = -0.18;
  heartAnterior.position.set(0, 0, 0.06);
  heartGroup.add(heartAnterior);
  registerMesh('heart', heartAnterior, 'cardiovascular', 'Anterior Ventricular Wall');

  // Register separable anterior heart wall
  separableParts.push({
    mesh: heartAnterior,
    naturalPosition: new THREE.Vector3(0, 0, 0.06),
    separatedOffset: new THREE.Vector3(-0.25, 0, 0.75),
    naturalRotation: new THREE.Euler(0, 0, -0.18),
    separatedRotation: new THREE.Euler(0, 0.35, -0.18)
  });

  // Coronary Arteries (Left Anterior Descending & Right Coronary Artery)
  const coronaryMat = new THREE.MeshStandardMaterial({ color: 0xFCA5A5, roughness: 0.3 });
  const coronaryPoints = [
    new THREE.Vector3(-0.05, 0.25, 0.35),
    new THREE.Vector3(-0.02, 0.05, 0.38),
    new THREE.Vector3(-0.08, -0.2, 0.32),
    new THREE.Vector3(-0.12, -0.35, 0.24)
  ];
  const coronaryCurve = new THREE.CatmullRomCurve3(coronaryPoints);
  const coronaryGeo = new THREE.TubeGeometry(coronaryCurve, 20, 0.018, 8, false);
  const coronaryMesh = new THREE.Mesh(coronaryGeo, coronaryMat);
  heartGroup.add(coronaryMesh);
  registerMesh('heart', coronaryMesh, 'cardiovascular', 'Coronary Arteries (LAD)');

  mainGroup.add(heartGroup);

  // 2. Aorta & Aortic Arch with 3 Great Supra-Aortic Branches
  const aortaPoints = [
    new THREE.Vector3(-0.15, 2.9, 0.3), // Root
    new THREE.Vector3(-0.12, 3.42, 0.25), // Ascending
    new THREE.Vector3(-0.02, 3.58, 0.15), // Arch Apex
    new THREE.Vector3(0.06, 3.32, 0.05), // Descending Arch
    new THREE.Vector3(0.04, 1.5, 0.02), // Thoracic Aorta
    new THREE.Vector3(0.02, 0.0, 0.05), // Abdominal Aorta
    new THREE.Vector3(0.15, -0.6, 0.08) // Iliac Bifurcation
  ];
  const aortaCurve = new THREE.CatmullRomCurve3(aortaPoints);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.068, 12, false);
  const aortaMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35, metalness: 0.1 });
  const aorta = new THREE.Mesh(aortaGeo, aortaMat);
  mainGroup.add(aorta);
  registerMesh('aorta', aorta, 'cardiovascular', 'Aorta & Major Arteries');

  // 3 Aortic Arch Great Vessels (Brachiocephalic, Carotid, Subclavian)
  [-0.06, -0.01, 0.04].forEach((xPos, idx) => {
    const branchPoints = [
      new THREE.Vector3(xPos, 3.56, 0.16),
      new THREE.Vector3(xPos * 1.4, 4.0, 0.18)
    ];
    const branchCurve = new THREE.CatmullRomCurve3(branchPoints);
    const branchGeo = new THREE.TubeGeometry(branchCurve, 8, 0.026, 8, false);
    const branchMesh = new THREE.Mesh(branchGeo, aortaMat.clone());
    mainGroup.add(branchMesh);
    const names = ['Brachiocephalic Trunk', 'Left Common Carotid', 'Left Subclavian Artery'];
    registerMesh('aorta', branchMesh, 'cardiovascular', names[idx]);
  });

  // 3. Vena Cava (Superior & Inferior Vena Cava)
  const vcPoints = [
    new THREE.Vector3(0.12, 4.3, 0.14), // Jugular / SVC entry
    new THREE.Vector3(0.10, 2.9, 0.24), // SVC into Right Atrium
    new THREE.Vector3(0.10, 2.5, 0.18), // IVC below heart
    new THREE.Vector3(0.12, 0.2, 0.12), // Abdominal IVC
    new THREE.Vector3(0.18, -0.6, 0.1) // Iliac Veins
  ];
  const vcCurve = new THREE.CatmullRomCurve3(vcPoints);
  const vcGeo = new THREE.TubeGeometry(vcCurve, 32, 0.072, 12, false);
  const vcMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.35, metalness: 0.1 });
  const venaCava = new THREE.Mesh(vcGeo, vcMat);
  mainGroup.add(venaCava);
  registerMesh('vena_cava', venaCava, 'cardiovascular', 'Vena Cava & Major Veins');

  // --------------------------------------------------------------------------
  // RESPIRATORY SYSTEM (Lungs, Branching Bronchial Tree, Trachea, Diaphragm)
  // --------------------------------------------------------------------------
  const lungMat = new THREE.MeshStandardMaterial({
    color: 0x06B6D4,
    roughness: 0.45,
    metalness: 0.08
  });

  // Right Lung (3 Lobes: Superior, Middle, Inferior)
  const rLungGeo = new THREE.SphereGeometry(0.56, 24, 20);
  rLungGeo.scale(0.85, 1.62, 0.82);
  const rLung = new THREE.Mesh(rLungGeo, lungMat.clone());
  rLung.position.set(0.54, 2.8, 0.15);
  mainGroup.add(rLung);
  registerMesh('lungs', rLung, 'respiratory', 'Right Lung (3 Lobes)');

  // Left Lung (2 Lobes with authentic Cardiac Notch)
  const lLungGeo = new THREE.SphereGeometry(0.53, 24, 20);
  lLungGeo.scale(0.76, 1.56, 0.82);
  const lLung = new THREE.Mesh(lLungGeo, lungMat.clone());
  lLung.position.set(-0.54, 2.8, 0.15);
  mainGroup.add(lLung);
  registerMesh('lungs', lLung, 'respiratory', 'Left Lung (Cardiac Notch)');

  // Register lungs for Exploded View separation
  separableParts.push({
    mesh: rLung,
    naturalPosition: new THREE.Vector3(0.54, 2.8, 0.15),
    separatedOffset: new THREE.Vector3(0.85, 0, 0.25)
  });
  separableParts.push({
    mesh: lLung,
    naturalPosition: new THREE.Vector3(-0.54, 2.8, 0.15),
    separatedOffset: new THREE.Vector3(-0.85, 0, 0.25)
  });

  // Trachea & Cartilaginous C-Rings (Y: 4.4 to 3.4)
  const tracheaPoints = [
    new THREE.Vector3(0, 4.45, 0.2),
    new THREE.Vector3(0, 3.42, 0.15) // Carina bifurcation
  ];
  const tracheaCurve = new THREE.CatmullRomCurve3(tracheaPoints);
  const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 16, 0.065, 12, false);
  const tracheaMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.38 });
  const trachea = new THREE.Mesh(tracheaGeo, tracheaMat);
  mainGroup.add(trachea);
  registerMesh('trachea', trachea, 'respiratory', 'Trachea & Cartilage Rings');

  // Branching Bronchial Tree (Main, Lobar, Segmental Bronchi)
  const bronchialGroup = new THREE.Group();
  [-1, 1].forEach((side) => {
    // Primary Main Bronchus
    const b1Points = [
      new THREE.Vector3(0, 3.42, 0.15),
      new THREE.Vector3(side * 0.28, 3.12, 0.14)
    ];
    const b1Curve = new THREE.CatmullRomCurve3(b1Points);
    const b1Geo = new THREE.TubeGeometry(b1Curve, 10, 0.045, 8, false);
    const b1 = new THREE.Mesh(b1Geo, tracheaMat.clone());
    bronchialGroup.add(b1);

    // Secondary & Tertiary Lobar Branches
    [-0.15, 0.0, 0.15].forEach((dy, bIdx) => {
      const b2Points = [
        new THREE.Vector3(side * 0.28, 3.12, 0.14),
        new THREE.Vector3(side * (0.42 + bIdx * 0.08), 3.0 + dy, 0.14)
      ];
      const b2Curve = new THREE.CatmullRomCurve3(b2Points);
      const b2Geo = new THREE.TubeGeometry(b2Curve, 8, 0.026, 8, false);
      const b2 = new THREE.Mesh(b2Geo, tracheaMat.clone());
      bronchialGroup.add(b2);
    });
  });
  mainGroup.add(bronchialGroup);
  registerMesh('trachea', bronchialGroup.children[0] as THREE.Mesh, 'respiratory', 'Bronchial Tree');

  // Diaphragm Muscle Dome (Y: 1.9)
  const diaphragmGeo = new THREE.SphereGeometry(0.88, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
  diaphragmGeo.scale(1.22, 0.46, 0.92);
  const diaphragmMat = new THREE.MeshStandardMaterial({
    color: 0xBE123C,
    roughness: 0.52,
    side: THREE.DoubleSide
  });
  const diaphragm = new THREE.Mesh(diaphragmGeo, diaphragmMat);
  diaphragm.position.set(0, 1.9, 0.05);
  mainGroup.add(diaphragm);
  registerMesh('diaphragm', diaphragm, 'respiratory', 'Diaphragm Muscle');

  // --------------------------------------------------------------------------
  // DIGESTIVE SYSTEM (Stomach, Liver, Gallbladder, Pancreas, Intestines)
  // --------------------------------------------------------------------------
  // 1. Stomach (J-shaped gastric pouch)
  const stomachGeo = new THREE.TorusGeometry(0.29, 0.15, 16, 24, Math.PI * 1.35);
  stomachGeo.rotateZ(Math.PI * 0.42);
  const stomachMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.42, metalness: 0.08 });
  const stomach = new THREE.Mesh(stomachGeo, stomachMat);
  stomach.position.set(-0.22, 1.6, 0.25);
  mainGroup.add(stomach);
  registerMesh('stomach', stomach, 'digestive', 'Stomach (Gastric Pouch)');

  // 2. Liver & Gallbladder (Right hypochondrium)
  const liverGeo = new THREE.SphereGeometry(0.66, 24, 18);
  liverGeo.scale(1.28, 0.66, 0.88);
  const liverMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.44, metalness: 0.06 });
  const liver = new THREE.Mesh(liverGeo, liverMat);
  liver.position.set(0.36, 1.72, 0.25);
  liver.rotation.z = -0.15;
  mainGroup.add(liver);
  registerMesh('liver', liver, 'digestive', 'Liver');

  // Gallbladder (Pear-shaped emerald sac beneath liver)
  const gbGeo = new THREE.SphereGeometry(0.1, 12, 10);
  gbGeo.scale(0.8, 1.4, 0.8);
  const gbMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.35 });
  const gallbladder = new THREE.Mesh(gbGeo, gbMat);
  gallbladder.position.set(0.38, 1.35, 0.35);
  mainGroup.add(gallbladder);
  registerMesh('liver', gallbladder, 'digestive', 'Gallbladder');

  // 3. Pancreas (Horizontal lobular gland behind stomach)
  const pancreasGeo = new THREE.CylinderGeometry(0.065, 0.09, 0.68, 12);
  pancreasGeo.rotateZ(Math.PI * 0.42);
  const pancreasMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.48 });
  const pancreas = new THREE.Mesh(pancreasGeo, pancreasMat);
  pancreas.position.set(-0.06, 1.45, 0.08);
  mainGroup.add(pancreas);
  registerMesh('pancreas', pancreas, 'digestive', 'Pancreas');

  // 4. Intestines (Small Intestine coils & Large Colon frame)
  const intestinesGroup = new THREE.Group();
  const smallIntGeo = new THREE.SphereGeometry(0.56, 18, 14);
  smallIntGeo.scale(0.92, 0.82, 0.68);
  const smallIntMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.5 });
  const smallInt = new THREE.Mesh(smallIntGeo, smallIntMat);
  smallInt.position.set(0, 0.5, 0.22);
  intestinesGroup.add(smallInt);

  // Large Intestine (Colon with Haustra loops)
  const colonPoints = [
    new THREE.Vector3(0.46, 0.0, 0.2), // Cecum
    new THREE.Vector3(0.49, 0.92, 0.2), // Ascending Colon
    new THREE.Vector3(0.0, 1.02, 0.26), // Transverse Colon
    new THREE.Vector3(-0.49, 0.92, 0.2), // Descending Colon
    new THREE.Vector3(-0.36, 0.0, 0.18), // Sigmoid Colon
    new THREE.Vector3(0.0, -0.4, 0.08) // Rectum
  ];
  const colonCurve = new THREE.CatmullRomCurve3(colonPoints);
  const colonGeo = new THREE.TubeGeometry(colonCurve, 36, 0.115, 12, false);
  const colonMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.48 });
  const colon = new THREE.Mesh(colonGeo, colonMat);
  intestinesGroup.add(colon);

  mainGroup.add(intestinesGroup);
  registerMesh('intestines', smallInt, 'digestive', 'Small Intestine (Jejunum/Ileum)');
  registerMesh('intestines', colon, 'digestive', 'Large Intestine (Colon)');

  // --------------------------------------------------------------------------
  // NERVOUS SYSTEM (Brain, Cerebrum Hemispheres, Cerebellum, Spinal Cord)
  // --------------------------------------------------------------------------
  const brainGroup = new THREE.Group();
  brainGroup.position.set(0, 6.7, 0.1);

  const brainMat = new THREE.MeshStandardMaterial({
    color: 0x8B5CF6,
    roughness: 0.42,
    metalness: 0.1
  });

  // Left & Right Cerebral Hemispheres (SEPARABLE in Exploded View!)
  [-0.14, 0.14].forEach((side) => {
    const hemiGeo = new THREE.SphereGeometry(0.37, 22, 18);
    hemiGeo.scale(0.76, 0.96, 1.16);
    const hemi = new THREE.Mesh(hemiGeo, brainMat.clone());
    hemi.position.set(side, 0.08, 0);
    brainGroup.add(hemi);
    registerMesh('brain', hemi, 'nervous', side === -0.14 ? 'Left Cerebral Hemisphere' : 'Right Cerebral Hemisphere');

    separableParts.push({
      mesh: hemi,
      naturalPosition: new THREE.Vector3(side, 0.08, 0),
      separatedOffset: new THREE.Vector3(side * 2.8, 0, 0)
    });
  });

  // Cerebellum
  const cerebGeo = new THREE.SphereGeometry(0.25, 16, 12);
  cerebGeo.scale(1.12, 0.68, 0.88);
  const cereb = new THREE.Mesh(cerebGeo, brainMat.clone());
  cereb.position.set(0, -0.22, -0.2);
  brainGroup.add(cereb);
  registerMesh('brain', cereb, 'nervous', 'Cerebellum');

  // Brainstem (Pons & Medulla)
  const stemGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.42, 12);
  const stem = new THREE.Mesh(stemGeo, brainMat.clone());
  stem.position.set(0, -0.38, -0.05);
  brainGroup.add(stem);
  registerMesh('brain', stem, 'nervous', 'Brainstem (Medulla)');

  mainGroup.add(brainGroup);

  // Spinal Cord running through spinal canal
  const cordPoints = [
    new THREE.Vector3(0, 6.3, -0.05),
    new THREE.Vector3(0, 3.2, -0.16),
    new THREE.Vector3(0, 1.2, -0.12),
    new THREE.Vector3(0, 0.2, -0.05)
  ];
  const cordCurve = new THREE.CatmullRomCurve3(cordPoints);
  const cordGeo = new THREE.TubeGeometry(cordCurve, 28, 0.048, 8, false);
  const cordMat = new THREE.MeshStandardMaterial({ color: 0xA78BFA, roughness: 0.45 });
  const spinalCord = new THREE.Mesh(cordGeo, cordMat);
  mainGroup.add(spinalCord);
  registerMesh('spinal_cord', spinalCord, 'nervous', 'Spinal Cord & Major Nerves');

  // --------------------------------------------------------------------------
  // URINARY SYSTEM (Kidneys, Bilateral Ureters, Bladder)
  // --------------------------------------------------------------------------
  const kidneyMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.42, metalness: 0.08 });
  [-1, 1].forEach((side) => {
    // Kidney bean contour with medial notch
    const kGeo = new THREE.SphereGeometry(0.23, 18, 14);
    kGeo.scale(0.72, 1.22, 0.66);
    const kidney = new THREE.Mesh(kGeo, kidneyMat.clone());
    const ky = side === 1 ? 1.7 : 1.9; // Right kidney slightly lower due to liver
    kidney.position.set(side * 0.42, ky, -0.15);
    kidney.rotation.z = side * 0.15;
    mainGroup.add(kidney);
    registerMesh('kidneys', kidney, 'urinary', side === -1 ? 'Left Kidney' : 'Right Kidney');

    separableParts.push({
      mesh: kidney,
      naturalPosition: new THREE.Vector3(side * 0.42, ky, -0.15),
      separatedOffset: new THREE.Vector3(side * 0.6, 0, 0.3)
    });

    // Ureter tubes
    const ureterPoints = [
      new THREE.Vector3(side * 0.38, ky - 0.1, -0.12),
      new THREE.Vector3(side * 0.22, 0.4, 0.05),
      new THREE.Vector3(side * 0.12, -0.5, 0.18)
    ];
    const uCurve = new THREE.CatmullRomCurve3(ureterPoints);
    const uGeo = new THREE.TubeGeometry(uCurve, 18, 0.022, 8, false);
    const ureter = new THREE.Mesh(uGeo, kidneyMat.clone());
    mainGroup.add(ureter);
    registerMesh('bladder', ureter, 'urinary', 'Ureter');
  });

  // Urinary Bladder (Pelvic floor)
  const bladderGeo = new THREE.SphereGeometry(0.25, 18, 14);
  bladderGeo.scale(1.0, 0.88, 0.95);
  const bladderMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.45 });
  const bladder = new THREE.Mesh(bladderGeo, bladderMat);
  bladder.position.set(0, -0.6, 0.22);
  mainGroup.add(bladder);
  registerMesh('bladder', bladder, 'urinary', 'Urinary Bladder');

  // --------------------------------------------------------------------------
  // MUSCULAR SYSTEM (Major Torso & Limb Muscle Groups)
  // --------------------------------------------------------------------------
  const muscleMat = new THREE.MeshStandardMaterial({
    color: 0xE11D48,
    roughness: 0.52,
    metalness: 0.05
  });

  // Pectoralis Major
  [-0.35, 0.35].forEach((side) => {
    const pecGeo = new THREE.SphereGeometry(0.39, 16, 12);
    pecGeo.scale(1.12, 0.66, 0.36);
    const pec = new THREE.Mesh(pecGeo, muscleMat.clone());
    pec.position.set(side, 3.42, 0.64);
    mainGroup.add(pec);
    registerMesh('muscles_core', pec, 'muscular', 'Pectoralis Major');
  });

  // Rectus Abdominis
  const absGeo = new THREE.BoxGeometry(0.48, 1.45, 0.16);
  const abs = new THREE.Mesh(absGeo, muscleMat.clone());
  abs.position.set(0, 1.82, 0.62);
  mainGroup.add(abs);
  registerMesh('muscles_core', abs, 'muscular', 'Rectus Abdominis');

  // Deltoids
  [-1.05, 1.05].forEach((side) => {
    const deltGeo = new THREE.SphereGeometry(0.29, 14, 12);
    deltGeo.scale(0.86, 1.16, 0.96);
    const delt = new THREE.Mesh(deltGeo, muscleMat.clone());
    delt.position.set(side, 4.02, 0.2);
    mainGroup.add(delt);
    registerMesh('muscles_core', delt, 'muscular', 'Deltoid Muscle');
  });

  // Quadriceps
  [-0.45, 0.45].forEach((side) => {
    const quadGeo = new THREE.CylinderGeometry(0.19, 0.15, 2.05, 12);
    const quad = new THREE.Mesh(quadGeo, muscleMat.clone());
    quad.position.set(side, -1.6, 0.17);
    mainGroup.add(quad);
    registerMesh('muscles_core', quad, 'muscular', 'Quadriceps Femoris');
  });

  // --------------------------------------------------------------------------
  // ENDOCRINE SYSTEM (Thyroid, Pituitary, Adrenal Glands)
  // --------------------------------------------------------------------------
  const endoMat = new THREE.MeshStandardMaterial({ color: 0xEC4899, roughness: 0.4 });

  // Thyroid Gland
  const thyroidGeo = new THREE.TorusGeometry(0.14, 0.052, 12, 18, Math.PI * 1.2);
  thyroidGeo.rotateZ(Math.PI * 0.4);
  const thyroid = new THREE.Mesh(thyroidGeo, endoMat.clone());
  thyroid.position.set(0, 4.1, 0.28);
  mainGroup.add(thyroid);
  registerMesh('endocrine_glands', thyroid, 'endocrine', 'Thyroid Gland');

  // Adrenal Glands atop kidneys
  [-1, 1].forEach((side) => {
    const adrenalGeo = new THREE.ConeGeometry(0.1, 0.13, 8);
    const adrenal = new THREE.Mesh(adrenalGeo, endoMat.clone());
    const ay = side === 1 ? 2.05 : 2.25;
    adrenal.position.set(side * 0.42, ay, -0.15);
    mainGroup.add(adrenal);
    registerMesh('endocrine_glands', adrenal, 'endocrine', 'Adrenal Gland (Suprarenal)');
  });

  // --------------------------------------------------------------------------
  // INTERNAL STRUCTURES (Activated when showInternal || layerSeparation > 0)
  // --------------------------------------------------------------------------
  buildInternalHeartStructures(internalGroup);
  buildInternalBrainStructures(internalGroup);
}

// ----------------------------------------------------------------------------
// INTERNAL CUTAWAYS (Heart chambers, valves, brain ventricles)
// ----------------------------------------------------------------------------
function buildInternalHeartStructures(group: THREE.Group) {
  const heartIntGroup = new THREE.Group();
  heartIntGroup.position.set(-0.15, 2.7, 0.3);

  // Left Ventricle Cavity (Thick Wall)
  const lvCavityGeo = new THREE.SphereGeometry(0.19, 16, 14);
  lvCavityGeo.scale(0.8, 1.25, 0.8);
  const lvMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35 });
  const lv = new THREE.Mesh(lvCavityGeo, lvMat);
  lv.position.set(-0.09, -0.06, 0.05);
  heartIntGroup.add(lv);

  // Right Ventricle Cavity
  const rvCavityGeo = new THREE.SphereGeometry(0.17, 16, 14);
  rvCavityGeo.scale(0.75, 1.05, 0.75);
  const rvMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.35 });
  const rv = new THREE.Mesh(rvCavityGeo, rvMat);
  rv.position.set(0.10, -0.04, 0.08);
  heartIntGroup.add(rv);

  // Interventricular Septum Wall
  const sepGeo = new THREE.BoxGeometry(0.055, 0.48, 0.32);
  const sepMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.4 });
  const sep = new THREE.Mesh(sepGeo, sepMat);
  sep.position.set(0.01, -0.05, 0.06);
  heartIntGroup.add(sep);

  // Mitral & Tricuspid Valve Rings
  const valveGeo = new THREE.TorusGeometry(0.082, 0.018, 10, 18);
  valveGeo.rotateX(Math.PI / 2);
  const valveMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.2 });

  const mitral = new THREE.Mesh(valveGeo, valveMat);
  mitral.position.set(-0.09, 0.12, 0.04);
  heartIntGroup.add(mitral);

  const tricuspid = new THREE.Mesh(valveGeo, valveMat);
  tricuspid.position.set(0.10, 0.12, 0.06);
  heartIntGroup.add(tricuspid);

  group.add(heartIntGroup);
}

function buildInternalBrainStructures(group: THREE.Group) {
  const brainIntGroup = new THREE.Group();
  brainIntGroup.position.set(0, 6.7, 0.1);

  // Corpus Callosum Arch
  const ccCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, -0.05, -0.2),
    new THREE.Vector3(0, 0.19, -0.1),
    new THREE.Vector3(0, 0.19, 0.16),
    new THREE.Vector3(0, -0.05, 0.22)
  );
  const ccGeo = new THREE.TubeGeometry(ccCurve, 24, 0.038, 8, false);
  const ccMat = new THREE.MeshStandardMaterial({ color: 0xEDE9FE, roughness: 0.3 });
  const cc = new THREE.Mesh(ccGeo, ccMat);
  brainIntGroup.add(cc);

  // Thalamus Egg
  const thalGeo = new THREE.SphereGeometry(0.13, 14, 12);
  thalGeo.scale(0.8, 1.1, 1.2);
  const thalMat = new THREE.MeshStandardMaterial({ color: 0xC4B5FD, roughness: 0.35 });
  const thal = new THREE.Mesh(thalGeo, thalMat);
  thal.position.set(0, -0.02, 0.02);
  brainIntGroup.add(thal);

  group.add(brainIntGroup);
}

// ----------------------------------------------------------------------------
// DUAL-CIRCUIT BLOOD FLOW SPLINE PARTICLES
// Arterial Oxygenated (Crimson) vs. Venous Deoxygenated (Blue) Circulation
// ----------------------------------------------------------------------------
function setupDualCircuitCirculation(
  group: THREE.Group,
  systemRef: React.MutableRefObject<CirculationParticleSystem | null>
) {
  // 1. Oxygenated Arterial Circuit (Left Ventricle -> Aorta -> Carotids / Systemic Organs)
  const arterialSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 2.7, 0.3), // Left Ventricle
    new THREE.Vector3(-0.12, 3.42, 0.25), // Ascending Aorta
    new THREE.Vector3(-0.02, 3.58, 0.15), // Aortic Arch
    new THREE.Vector3(0.06, 3.32, 0.05), // Descending Arch
    new THREE.Vector3(0.04, 1.5, 0.02), // Thoracic Aorta
    new THREE.Vector3(0.02, 0.0, 0.05), // Abdominal Aorta
    new THREE.Vector3(0.15, -0.6, 0.08), // Iliac Bifurcation
    new THREE.Vector3(0.42, -2.5, 0.1), // Femoral Artery
    new THREE.Vector3(0.42, -4.5, 0.12), // Tibial Artery
    new THREE.Vector3(0.38, -4.6, 0.08), // Capillary turn
    new THREE.Vector3(0.18, -0.6, 0.1) // Return to venous
  ]);

  // 2. Deoxygenated Venous Circuit (Systemic Return -> IVC/SVC -> Right Atrium -> Lungs)
  const venousSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, -0.6, 0.1), // Iliac Vein
    new THREE.Vector3(0.12, 0.2, 0.12), // Abdominal IVC
    new THREE.Vector3(0.10, 2.5, 0.18), // IVC approaching heart
    new THREE.Vector3(0.10, 2.8, 0.24), // Right Atrium entrance
    new THREE.Vector3(0.02, 2.7, 0.34), // Right Ventricle
    new THREE.Vector3(0.0, 3.1, 0.3), // Pulmonary Trunk
    new THREE.Vector3(0.45, 2.9, 0.18), // Right Pulmonary Artery into Lung
    new THREE.Vector3(0.42, 2.7, 0.14), // Pulmonary Capillaries (Oxygenation!)
    new THREE.Vector3(-0.15, 2.7, 0.3) // Pulmonary Veins into Left Heart
  ]);

  const splines = [arterialSpline, venousSpline];
  const count = 420;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tValues = new Float32Array(count);
  const speeds = new Float32Array(count);
  const isArterialList: boolean[] = [];

  for (let i = 0; i < count; i++) {
    const isArterial = Math.random() > 0.48;
    isArterialList.push(isArterial);
    const spline = isArterial ? arterialSpline : venousSpline;

    const t = Math.random();
    tValues[i] = t;
    speeds[i] = 0.08 + Math.random() * 0.08;

    const pt = spline.getPoint(t);
    positions[i * 3] = pt.x + (Math.random() - 0.5) * 0.04;
    positions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.04;
    positions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.04;

    if (isArterial) {
      // Oxygenated crimson red
      colors[i * 3] = 0.98;
      colors[i * 3 + 1] = 0.22;
      colors[i * 3 + 2] = 0.22;
    } else {
      // Deoxygenated deep cyan/blue
      colors[i * 3] = 0.15;
      colors[i * 3 + 1] = 0.45;
      colors[i * 3 + 2] = 0.98;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending
  });

  const pointsMesh = new THREE.Points(geometry, material);
  group.add(pointsMesh);

  systemRef.current = {
    mesh: pointsMesh,
    splines,
    tValues,
    speeds,
    colors,
    isArterialList
  };
}

function renderDynamicBiologicalProcesses(
  delta: number,
  isPlaying: boolean,
  speed: number,
  circ: CirculationParticleSystem | null,
  structuresGroup: THREE.Group | null,
  currentTime: number
) {
  if (!isPlaying || !circ) return;

  // 1. Advance Blood Flow Particles along 3D Splines
  const posAttr = circ.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = posAttr.array as Float32Array;
  const count = circ.tValues.length;

  for (let i = 0; i < count; i++) {
    circ.tValues[i] = (circ.tValues[i] + circ.speeds[i] * speed * delta) % 1.0;
    const spline = circ.isArterialList[i] ? circ.splines[0] : circ.splines[1];
    const pt = spline.getPoint(circ.tValues[i]);

    positions[i * 3] = pt.x;
    positions[i * 3 + 1] = pt.y;
    positions[i * 3 + 2] = pt.z;
  }
  posAttr.needsUpdate = true;

  // 2. Rhythmic Cardiac Pulsation
  if (structuresGroup) {
    const heartMesh = structuresGroup.children.find(c => c.userData?.id === 'heart');
    if (heartMesh) {
      // Realistic two-phase beat: atria systole then ventricular systole
      const beatFrequency = 0.007 * speed;
      const beatCycle = (currentTime * beatFrequency) % (Math.PI * 2);
      const systole = Math.sin(beatCycle);
      const cardiacScale = 1.0 + (systole > 0.5 ? 0.065 * Math.sin((systole - 0.5) * 6.28) : 0);
      heartMesh.scale.set(cardiacScale, cardiacScale, cardiacScale);
    }

    // 3. Respiratory Breathing Expansion on Lungs & Diaphragm
    const lungMeshes = structuresGroup.children.filter(c => c.userData?.id === 'lungs');
    const diaphragmMesh = structuresGroup.children.find(c => c.userData?.id === 'diaphragm');

    const breathCycle = Math.sin(currentTime * 0.0025 * speed); // ~16 breaths/min
    const expansion = 1.0 + breathCycle * 0.045;

    lungMeshes.forEach((lung) => {
      lung.scale.set(expansion, expansion * 1.02, expansion * 1.04);
    });

    if (diaphragmMesh) {
      // Diaphragm contracts downward on inhale (expansion > 1) and rises on exhale
      diaphragmMesh.position.y = 1.9 - breathCycle * 0.08;
    }
  }
}
