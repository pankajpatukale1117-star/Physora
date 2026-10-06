// ============================================================================
// PHYSORA 3D HUMAN ANATOMY WEBGL ENGINE (MEDICAL-GRADE PBR EDITION)
// High-Resolution Visible Human Project & Z-Anatomy 3D Meshes
// True Anatomical Geometry, Translucent Glass Skin, Exploded Views & Hemodynamics
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
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
  layerSeparation: number; // 0.0 (assembled) to 1.0 (exploded)
  isProcessPlaying: boolean;
  processSpeed: number; // 0.5 to 2.0
  processStepTick?: number; // discrete step
  detailLevel: DetailLevel;
  presetView: 'front' | 'back' | 'left' | 'right' | 'top' | 'reset' | null;
  onPresetViewHandled: () => void;
}

interface MeshUserData {
  id: string;
  name: string;
  system: AnatomicalSystemId;
  baseMaterial?: THREE.Material;
}

interface SeparableOrgan {
  object: THREE.Object3D;
  naturalPosition: THREE.Vector3;
  separatedOffset: THREE.Vector3;
}

interface CirculationParticleSystem {
  mesh: THREE.Points;
  splines: THREE.CatmullRomCurve3[];
  tValues: Float32Array;
  speeds: Float32Array;
  isArterialList: boolean[];
}

export const Anatomy3DCanvas: React.FC<Anatomy3DCanvasProps> = ({
  selectedStructureId,
  onSelectStructure,
  systemVisibility,
  systemOpacity,
  isIsolated,
  showInternal: _showInternal,
  layerSeparation,
  isProcessPlaying,
  processSpeed,
  processStepTick = 0,
  detailLevel: _detailLevel,
  presetView,
  onPresetViewHandled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>('Initializing 3D Medical Laboratory...');
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
  const anatomyMasterGroupRef = useRef<THREE.Group | null>(null);
  const circulationGroupRef = useRef<THREE.Group | null>(null);

  // Camera Target & Cinematic Spring State
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const cameraDesiredTargetRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const cameraSphericalRef = useRef({ radius: 11.5, theta: 0, phi: Math.PI / 2 });
  const cameraDesiredSphericalRef = useRef({ radius: 11.5, theta: 0, phi: Math.PI / 2 });

  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Animation frame loop refs
  const animationFrameIdRef = useRef<number | null>(null);
  const circulationSystemRef = useRef<CirculationParticleSystem | null>(null);
  const separableOrgansRef = useRef<SeparableOrgan[]>([]);
  const meshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());

  // Heart mesh ref for cardiac pulsation
  const heartMeshRef = useRef<THREE.Object3D | null>(null);
  const lungMeshesRef = useRef<THREE.Object3D[]>([]);

  // --------------------------------------------------------------------------
  // 1. INITIALIZE THREE.JS SCENE, MEDICAL LIGHTING RIG & GLTF ASSET PIPELINE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep space medical navy
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 11.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ------------------------------------------------------------------------
    // CLINICAL SCIENTIFIC PBR LIGHTING RIG
    // ------------------------------------------------------------------------
    // 1. Ambient soft slate medical illumination
    const ambientLight = new THREE.AmbientLight(0x94A3B8, 0.85);
    scene.add(ambientLight);

    // 2. Key Directional Daylight Light
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    // 3. Rim / Contour Light (Cool cyan contour for anatomical edge clarity)
    const rimLight = new THREE.DirectionalLight(0x38BDF8, 1.4);
    rimLight.position.set(-7, 7, -5);
    scene.add(rimLight);

    // 4. Secondary Violet Backlight (Adds depth and separation)
    const secondaryRim = new THREE.DirectionalLight(0x818CF8, 0.6);
    secondaryRim.position.set(6, -3, -5);
    scene.add(secondaryRim);

    // 5. Warm Underfill Light (Organic subsurface cavity bounce)
    const fillLight = new THREE.DirectionalLight(0xF87171, 0.4);
    fillLight.position.set(0, -6, 4);
    scene.add(fillLight);

    // Faded Circular Floor Pedestal
    const gridHelper = new THREE.GridHelper(16, 32, 0x1E293B, 0x0F172A);
    gridHelper.position.y = -4.3;
    scene.add(gridHelper);

    // Master Group for All Anatomy
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    anatomyMasterGroupRef.current = masterGroup;

    // Circulation Particle Group
    const circulationGroup = new THREE.Group();
    scene.add(circulationGroup);
    circulationGroupRef.current = circulationGroup;

    // Setup Dual-Pathway Blood Circulation Splines
    setupDualCircuitCirculation(circulationGroup, circulationSystemRef);

    // ------------------------------------------------------------------------
    // ASYNC HIGH-RESOLUTION MEDICAL MODEL LOADER PIPELINE
    // ------------------------------------------------------------------------
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    loadAllAnatomicalModels(
      gltfLoader,
      masterGroup,
      meshMapRef.current,
      separableOrgansRef.current,
      heartMeshRef,
      lungMeshesRef,
      (progress, text) => {
        setLoadingProgress(progress);
        setLoadingText(text);
      }
    );

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
    // CINEMATIC RENDER & SIMULATION LOOP
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

        // Critically-damped exponential easing
        const smoothFactor = 1.0 - Math.exp(-delta * 5.0);

        currentTarget.lerp(desiredTarget, smoothFactor);
        currentSpherical.radius += (desiredSpherical.radius - currentSpherical.radius) * smoothFactor;
        currentSpherical.theta += (desiredSpherical.theta - currentSpherical.theta) * smoothFactor;
        currentSpherical.phi += (desiredSpherical.phi - currentSpherical.phi) * smoothFactor;

        const x = currentTarget.x + currentSpherical.radius * Math.sin(currentSpherical.phi) * Math.sin(currentSpherical.theta);
        const y = currentTarget.y + currentSpherical.radius * Math.cos(currentSpherical.phi);
        const z = currentTarget.z + currentSpherical.radius * Math.sin(currentSpherical.phi) * Math.cos(currentSpherical.theta);

        cam.position.set(x, y, z);
        cam.lookAt(currentTarget);
      }

      // 2. Animated Biological Processes (Blood flow, Cardiac pulsation, Respiratory expansion)
      renderDynamicBiologicalProcesses(
        delta,
        isProcessPlaying,
        processSpeed,
        circulationSystemRef.current,
        heartMeshRef.current,
        lungMeshesRef.current,
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
      dracoLoader.dispose();
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. LAYER SEPARATION / EXPLODED VIEW INTERPOLATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    const parts = separableOrgansRef.current;
    const factor = THREE.MathUtils.clamp(layerSeparation, 0, 1);

    parts.forEach((part) => {
      part.object.position.lerpVectors(
        part.naturalPosition,
        part.naturalPosition.clone().add(part.separatedOffset),
        factor
      );
    });

    // When exploded, subtly fade the translucent skin to reveal deep anatomy
    const skinMeshes = meshMapRef.current.get('skin');
    if (skinMeshes) {
      const skinAlpha = Math.max(0.0, 0.22 - factor * 0.22);
      skinMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.opacity = skinAlpha;
          mesh.visible = skinAlpha > 0.01;
        }
      });
    }
  }, [layerSeparation]);

  // --------------------------------------------------------------------------
  // 3. STEP-BY-STEP PROGRESSION TRIGGER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (processStepTick === 0 || !circulationSystemRef.current) return;
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
      cameraDesiredSphericalRef.current = { radius: 11.5, theta: 0, phi: Math.PI / 2 };
      cameraDesiredTargetRef.current.set(0, 0.5, 0);
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
        cameraDesiredTargetRef.current.set(0, 0.5, 0);
        cameraDesiredSphericalRef.current.radius = 11.5;
      }
      return;
    }

    // Try finding mesh bounding box dynamically for exact focus
    const meshes = meshMapRef.current.get(selectedStructureId);
    if (meshes && meshes.length > 0) {
      const box = new THREE.Box3();
      meshes.forEach((m) => box.expandByObject(m));
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);

      cameraDesiredTargetRef.current.copy(center);
      cameraDesiredSphericalRef.current.radius = Math.max(maxDim * 2.2, 1.8);
      return;
    }

    // Fallback to structure config
    const structure = ANATOMY_STRUCTURES[selectedStructureId];
    if (!structure) return;

    if (isIsolated) {
      cameraDesiredTargetRef.current.set(structure.center[0], structure.center[1], structure.center[2]);
      cameraDesiredSphericalRef.current.radius = Math.max(structure.cameraFocus.distance * 0.9, 1.8);
    } else {
      cameraDesiredTargetRef.current.set(
        structure.cameraFocus.target[0],
        structure.cameraFocus.target[1],
        structure.cameraFocus.target[2]
      );
      cameraDesiredSphericalRef.current.radius = Math.max(structure.cameraFocus.distance, 2.0);
    }
  }, [selectedStructureId, isIsolated]);

  // --------------------------------------------------------------------------
  // 6. UPDATE VISIBILITY, HIGHLIGHTS & DIMMING IN 3D
  // --------------------------------------------------------------------------
  useEffect(() => {
    const meshMap = meshMapRef.current;

    meshMap.forEach((meshes, id) => {
      const struct = ANATOMY_STRUCTURES[id];
      const isSelected = selectedStructureId === id;

      // Determine system visibility
      const systemId = struct?.system || 'skeletal';
      const isSystemVisible = systemVisibility[systemId] ?? true;
      const systemAlpha = systemOpacity[systemId] ?? 1.0;

      let shouldBeVisible = isSystemVisible;
      if (isIsolated) {
        shouldBeVisible = isSelected;
      }

      // Skin has special translucent visibility handling
      if (id === 'skin') {
        shouldBeVisible = !isIsolated && systemVisibility.muscular;
      }

      meshes.forEach((mesh) => {
        mesh.visible = shouldBeVisible;
        if (!shouldBeVisible) return;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        if (isSelected) {
          // Vibrant scientific selection highlight
          mat.emissive.set(struct?.accentColor ? new THREE.Color(struct.accentColor) : new THREE.Color(0x10B981));
          mat.emissiveIntensity = 0.55;
          mat.opacity = 1.0;
          mat.transparent = false;
        } else if (selectedStructureId && !isIsolated) {
          // Dim non-selected structures into subtle translucent depth silhouette
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = id === 'skin' ? 0.08 : Math.min(systemAlpha * 0.22, 0.25);
          mat.transparent = true;
        } else {
          // Normal state with system opacity
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          if (id === 'skin') {
            mat.opacity = 0.20;
            mat.transparent = true;
          } else {
            mat.opacity = systemAlpha;
            mat.transparent = systemAlpha < 0.95;
          }
        }
      });
    });
  }, [selectedStructureId, systemVisibility, systemOpacity, isIsolated]);

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
      cameraDesiredSphericalRef.current.theta -= deltaX * 0.0075;
      cameraDesiredSphericalRef.current.phi = THREE.MathUtils.clamp(
        cameraDesiredSphericalRef.current.phi - deltaY * 0.0075,
        0.05,
        Math.PI - 0.05
      );
    } else if (isPanningRef.current) {
      const factor = cameraDesiredSphericalRef.current.radius * 0.0018;
      cameraDesiredTargetRef.current.y += deltaY * factor;
      cameraDesiredTargetRef.current.x -= deltaX * factor * Math.cos(cameraDesiredSphericalRef.current.theta);
      cameraDesiredTargetRef.current.z += deltaX * factor * Math.sin(cameraDesiredSphericalRef.current.theta);
    } else {
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

  // Click Raycasting
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !anatomyMasterGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(anatomyMasterGroupRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        // Find closest hit that is visible and not transparent skin
        if (hit.object.visible && hit.object.userData?.id) {
          const ud = hit.object.userData as MeshUserData;
          if (ud.id !== 'skin') {
            onSelectStructure(ud.id);
            return;
          }
        }
      }
    } else {
      if (!isIsolated) {
        onSelectStructure(null);
      }
    }
  };

  // Hover Tooltip Raycast
  const performHoverRaycast = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current || !anatomyMasterGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(anatomyMasterGroupRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        if (hit.object.visible && hit.object.userData?.id && hit.object.userData.id !== 'skin') {
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
      {/* Medical Loading Overlay */}
      {loadingProgress < 100 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            color: '#FFFFFF'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10B981',
              animation: 'spin 0.8s linear infinite',
              marginBottom: 20
            }}
          />
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em', marginBottom: 8 }}>
            High-Definition 3D Anatomy Loading
          </div>
          <div style={{ fontSize: '0.80rem', color: '#94A3B8', marginBottom: 16 }}>
            {loadingText}
          </div>
          <div
            style={{
              width: 220,
              height: 6,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10B981, #38BDF8)',
                transition: 'width 0.2s ease'
              }}
            />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontFamily: 'monospace', marginTop: 8 }}>
            {Math.round(loadingProgress)}%
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredStructure && (
        <div
          style={{
            position: 'fixed',
            left: hoveredStructure.x + 14,
            top: hoveredStructure.y - 28,
            pointerEvents: 'none',
            zIndex: 150,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '6px 12px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
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
// MODEL LOADER PIPELINE: ASSEMBLES REAL VISIBLE HUMAN & Z-ANATOMY MESHES
// ============================================================================

function loadAllAnatomicalModels(
  loader: GLTFLoader,
  masterGroup: THREE.Group,
  meshMap: Map<string, THREE.Mesh[]>,
  separableOrgans: SeparableOrgan[],
  heartMeshRef: React.MutableRefObject<THREE.Object3D | null>,
  lungMeshesRef: React.MutableRefObject<THREE.Object3D[]>,
  onProgress: (percent: number, message: string) => void
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

  const modelSpecs: {
    file: string;
    id: string;
    name: string;
    system: AnatomicalSystemId;
    scale: number;
    position: [number, number, number];
    materialColor: number;
    roughness: number;
    metalness?: number;
    clearcoat?: number;
    opacity?: number;
    separatedOffset?: [number, number, number];
  }[] = [
    {
      file: 'skin.glb',
      id: 'skin',
      name: 'Human Body Surface (Translucent)',
      system: 'muscular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x38BDF8,
      roughness: 0.25,
      clearcoat: 1.0,
      opacity: 0.20
    },
    {
      file: 'skeleton.glb',
      id: 'skeleton',
      name: 'Human Skeletal System',
      system: 'skeletal',
      scale: 0.045, // 175cm -> meters * 4.5
      position: [0, -3.80, 0],
      materialColor: 0xF1EFE7, // Ivory bone
      roughness: 0.44,
      metalness: 0.05
    },
    {
      file: 'heart.glb',
      id: 'heart',
      name: 'Heart (Myocardium & Chambers)',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xEF4444, // Myocardium crimson
      roughness: 0.35,
      clearcoat: 0.3,
      separatedOffset: [-0.4, 0, 1.5]
    },
    {
      file: 'lung.glb',
      id: 'lungs',
      name: 'Lungs & Bronchial Tree',
      system: 'respiratory',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x0EA5E9, // Pulmonary azure
      roughness: 0.46,
      separatedOffset: [0.8, 0, 0.6]
    },
    {
      file: 'brain.glb',
      id: 'brain',
      name: 'Brain (Cerebral Cortex & Stem)',
      system: 'nervous',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x8B5CF6, // Cerebral purple
      roughness: 0.42,
      separatedOffset: [0, 0.4, 0.6]
    },
    {
      file: 'liver.glb',
      id: 'liver',
      name: 'Liver',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x991B1B, // Hepatic burgundy
      roughness: 0.42,
      separatedOffset: [-0.8, 0, 1.2]
    },
    {
      file: 'kidney-l.glb',
      id: 'kidneys',
      name: 'Left Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x10B981, // Renal emerald
      roughness: 0.38,
      separatedOffset: [0.6, 0, 0.9]
    },
    {
      file: 'kidney-r.glb',
      id: 'kidneys',
      name: 'Right Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x10B981,
      roughness: 0.38,
      separatedOffset: [-0.6, 0, 0.9]
    },
    {
      file: 'gut-large.glb',
      id: 'intestines',
      name: 'Large Intestine (Colon)',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xB45309,
      roughness: 0.48,
      separatedOffset: [0, -0.2, 1.4]
    },
    {
      file: 'gut-small.glb',
      id: 'intestines',
      name: 'Small Intestine',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xD97706,
      roughness: 0.45,
      separatedOffset: [0, -0.2, 1.2]
    },
    {
      file: 'vasculature.glb',
      id: 'aorta',
      name: 'Circulatory Vascular Network',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDC2626,
      roughness: 0.35,
      metalness: 0.1
    }
  ];

  let loadedCount = 0;
  const total = modelSpecs.length;

  modelSpecs.forEach((spec) => {
    loader.load(
      `/models/anatomy/${spec.file}`,
      (gltf) => {
        const root = gltf.scene;
        root.scale.set(spec.scale, spec.scale, spec.scale);
        root.position.set(spec.position[0], spec.position[1], spec.position[2]);

        // Keep refs for biological animations
        if (spec.id === 'heart') {
          heartMeshRef.current = root;
        } else if (spec.id === 'lungs') {
          lungMeshesRef.current.push(root);
        }

        // Register separable organ for exploded view
        if (spec.separatedOffset) {
          separableOrgans.push({
            object: root,
            naturalPosition: root.position.clone(),
            separatedOffset: new THREE.Vector3(...spec.separatedOffset)
          });
        }

        // Traverse meshes and assign medical PBR materials
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || spec.name).toLowerCase();

            // Specialized vascular coloring (arteries crimson, veins blue)
            let color = spec.materialColor;
            if (spec.id === 'aorta') {
              if (name.includes('vein') || name.includes('vena') || name.includes('sinus')) {
                color = 0x2563EB; // Deoxygenated venous royal blue
              } else {
                color = 0xDC2626; // Oxygenated arterial crimson
              }
            }

            const isTranslucent = spec.opacity !== undefined && spec.opacity < 1.0;
            const pbrMaterial = new THREE.MeshStandardMaterial({
              color,
              roughness: spec.roughness,
              metalness: spec.metalness ?? 0.08,
              transparent: isTranslucent,
              opacity: spec.opacity ?? 1.0,
              depthWrite: !isTranslucent
            });

            mesh.material = pbrMaterial;
            registerMesh(spec.id, mesh, spec.system, mesh.name || spec.name);
          }
        });

        masterGroup.add(root);
        loadedCount++;
        const percent = (loadedCount / total) * 100;
        onProgress(percent, `Loaded ${spec.name} (${loadedCount}/${total})`);
      },
      undefined,
      (err) => {
        console.warn(`Could not load ${spec.file}, skipping:`, err);
        loadedCount++;
        onProgress((loadedCount / total) * 100, `Calibrating ${spec.name}...`);
      }
    );
  });
}

// ----------------------------------------------------------------------------
// DUAL-CIRCUIT HEMODYNAMIC BLOOD FLOW SIMULATION
// ----------------------------------------------------------------------------
function setupDualCircuitCirculation(
  group: THREE.Group,
  systemRef: React.MutableRefObject<CirculationParticleSystem | null>
) {
  // Aligned with Visible Human Project coordinates (torso ~ 0.5 to 3.8)
  const arterialSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 2.02, 0.15), // Left Ventricle
    new THREE.Vector3(0.04, 2.50, 0.12), // Ascending Aorta
    new THREE.Vector3(0.0, 2.70, 0.05), // Aortic Arch
    new THREE.Vector3(0.0, 3.70, 0.0), // Carotids to brain
    new THREE.Vector3(0.02, 1.20, -0.02), // Descending thoracic aorta
    new THREE.Vector3(0.02, 0.40, 0.02), // Abdominal aorta
    new THREE.Vector3(0.40, -1.20, 0.05), // Iliac artery
    new THREE.Vector3(0.40, -2.80, 0.05), // Femoral artery
    new THREE.Vector3(0.35, -2.90, 0.02), // Capillary turn
    new THREE.Vector3(0.18, -1.20, 0.04) // Venous return
  ]);

  const venousSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, -1.20, 0.04), // Iliac Vein
    new THREE.Vector3(0.08, 0.40, 0.04), // Abdominal IVC
    new THREE.Vector3(0.12, 1.95, 0.18), // IVC into Right Atrium
    new THREE.Vector3(0.05, 2.05, 0.22), // Right Ventricle
    new THREE.Vector3(0.0, 2.40, 0.15), // Pulmonary Trunk
    new THREE.Vector3(0.35, 1.85, 0.08), // Pulmonary Artery into Lung
    new THREE.Vector3(0.30, 1.75, 0.04), // Pulmonary Capillaries (Oxygenation!)
    new THREE.Vector3(0.08, 2.02, 0.15) // Pulmonary Veins into Left Heart
  ]);

  const splines = [arterialSpline, venousSpline];
  const count = 480;
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
      colors[i * 3] = 0.98;
      colors[i * 3 + 1] = 0.22;
      colors[i * 3 + 2] = 0.22;
    } else {
      colors[i * 3] = 0.15;
      colors[i * 3 + 1] = 0.45;
      colors[i * 3 + 2] = 0.98;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending
  });

  const pointsMesh = new THREE.Points(geometry, material);
  group.add(pointsMesh);

  systemRef.current = {
    mesh: pointsMesh,
    splines,
    tValues,
    speeds,
    isArterialList
  };
}

function renderDynamicBiologicalProcesses(
  delta: number,
  isPlaying: boolean,
  speed: number,
  circ: CirculationParticleSystem | null,
  heartMesh: THREE.Object3D | null,
  lungMeshes: THREE.Object3D[],
  currentTime: number
) {
  if (!isPlaying || !circ) return;

  // 1. Advance Blood Particles along 3D Splines
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

  // 2. Cardiac Pulsation on Real Heart Mesh
  if (heartMesh) {
    const beatFrequency = 0.007 * speed;
    const beatCycle = (currentTime * beatFrequency) % (Math.PI * 2);
    const systole = Math.sin(beatCycle);
    const scale = 4.5 * (1.0 + (systole > 0.5 ? 0.055 * Math.sin((systole - 0.5) * 6.28) : 0));
    heartMesh.scale.set(scale, scale, scale);
  }

  // 3. Respiratory Breathing Expansion on Real Lungs
  if (lungMeshes.length > 0) {
    const breathCycle = Math.sin(currentTime * 0.0025 * speed);
    const expansion = 4.5 * (1.0 + breathCycle * 0.04);
    lungMeshes.forEach((lung) => {
      lung.scale.set(expansion, expansion * 1.02, expansion * 1.04);
    });
  }
}
