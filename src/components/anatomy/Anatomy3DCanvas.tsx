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
  skinOpacity?: number;
  skinMode?: 'natural' | 'translucent' | 'xray';
  skinVisible?: boolean;
  biologicalSex?: 'female' | 'male';
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
  onPresetViewHandled,
  skinOpacity = 0.45,
  skinMode = 'natural',
  skinVisible = true,
  biologicalSex = 'female'
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
    // 1. Clean neutral medical ambient illumination
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.80);
    scene.add(ambientLight);

    // 2. Key Directional Surgical Daylight Light (True warm white sunlight)
    const keyLight = new THREE.DirectionalLight(0xFFFDF5, 1.8);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    // 3. Soft Front-Left Fill Light (Eliminates harsh shadows on bones and muscles)
    const fillLight = new THREE.DirectionalLight(0xF1F5F9, 0.75);
    fillLight.position.set(-6, 3, 6);
    scene.add(fillLight);

    // 4. Subtle Contour Rim Light (Crisp neutral anatomical edge definition)
    const rimLight = new THREE.DirectionalLight(0xCBD5E1, 0.6);
    rimLight.position.set(-6, 7, -6);
    scene.add(rimLight);

    // 5. Warm Underfill Bounce Light (Organic tissue translucency)
    const underfillLight = new THREE.DirectionalLight(0xFEE2E2, 0.35);
    underfillLight.position.set(0, -6, 3);
    scene.add(underfillLight);

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

    // When exploded, dynamically fade skin to reveal deep anatomy
    const skinMeshes = meshMapRef.current.get('skin');
    if (skinMeshes) {
      const skinAlpha = Math.max(0.0, skinOpacity * (1.0 - factor));
      skinMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (skinAlpha >= 0.95 && skinMode === 'natural') {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          } else {
            mat.transparent = true;
            mat.opacity = skinAlpha;
            mat.depthWrite = false;
          }
          mesh.visible = skinVisible && skinAlpha > 0.01 && !isIsolated;
        }
      });
    }
  }, [layerSeparation, skinOpacity, skinMode, skinVisible, isIsolated]);

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

      // Skin has dedicated medical PBR controls (natural human skin tone, controllable opacity, glass, or off)
      if (id === 'skin') {
        const effectiveOpacity = layerSeparation > 0
          ? Math.max(0.0, skinOpacity * (1.0 - layerSeparation))
          : skinOpacity;

        const isVisible = skinVisible && effectiveOpacity > 0.01 && !isIsolated;

        meshes.forEach((mesh) => {
          mesh.visible = isVisible;
          if (!isVisible) return;

          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat) return;

          if (isSelected) {
            mat.emissive.set(new THREE.Color(0xF97316));
            mat.emissiveIntensity = 0.55;
            mat.opacity = Math.max(0.7, effectiveOpacity);
            mat.transparent = true;
            mat.depthWrite = false;
          } else if (skinMode === 'natural') {
            mat.color.setHex(0xDE9F7E); // Warm natural human skin tone
            mat.roughness = 0.52;
            mat.metalness = 0.02;
            mat.emissive.setHex(0x1F0B05); // Subsurface scattering warmth
            mat.emissiveIntensity = 0.06;
            if ('clearcoat' in mat) (mat as THREE.MeshPhysicalMaterial).clearcoat = 0.1;
            if (effectiveOpacity >= 0.95) {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.depthWrite = true;
            } else {
              mat.transparent = true;
              mat.opacity = effectiveOpacity;
              mat.depthWrite = false;
            }
          } else if (skinMode === 'translucent') {
            mat.color.setHex(0x38BDF8); // Medical cyan frosted glass
            mat.roughness = 0.22;
            mat.metalness = 0.05;
            mat.emissive.setHex(0x0284C7);
            mat.emissiveIntensity = 0.15;
            if ('clearcoat' in mat) (mat as THREE.MeshPhysicalMaterial).clearcoat = 1.0;
            mat.transparent = true;
            mat.opacity = effectiveOpacity;
            mat.depthWrite = false;
          } else if (skinMode === 'xray') {
            mat.color.setHex(0x818CF8); // Bioluminescent electric scan
            mat.roughness = 0.35;
            mat.emissive.setHex(0x3730A3);
            mat.emissiveIntensity = 0.45;
            mat.transparent = true;
            mat.opacity = effectiveOpacity * 0.85;
            mat.depthWrite = false;
          }
        });
        return;
      }

      // Reproductive system & Biological Sex handling
      const isFemaleReproductive = id === 'mammary_glands' || id === 'uterus_and_ovaries' || id === 'female_genitalia_external';
      if (isFemaleReproductive && biologicalSex !== 'female') {
        meshes.forEach((mesh) => {
          mesh.visible = false;
        });
        return;
      }

      // If female reproductive, synchronize external skin components with skinOpacity & skinMode
      if (isFemaleReproductive && biologicalSex === 'female') {
        const effectiveOpacity = layerSeparation > 0
          ? Math.max(0.0, skinOpacity * (1.0 - layerSeparation))
          : skinOpacity;

        meshes.forEach((mesh) => {
          const isAreolaNipple = mesh.name.includes('Areola') || mesh.name.includes('Nipple');
          const isOuterSkinPart = mesh.name.includes('Breast (Mammary Gland & Skin)') || mesh.name.includes('Mons Pubis') || mesh.name.includes('Labium') || isAreolaNipple;
          const isGlandularPart = mesh.name.includes('Glandular Lobule') || mesh.name.includes('Uterus') || mesh.name.includes('Ovary') || mesh.name.includes('Tube');

          let meshVisible = isSystemVisible && !isIsolated;
          if (isIsolated) {
            meshVisible = isSelected;
          }

          if (isOuterSkinPart) {
            meshVisible = meshVisible && skinVisible && effectiveOpacity > 0.01;
          }

          mesh.visible = meshVisible;
          if (!meshVisible) return;

          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat) return;

          if (isSelected) {
            mat.emissive.set(new THREE.Color(0xF43F5E));
            mat.emissiveIntensity = 0.55;
          } else if (isOuterSkinPart) {
            if (skinMode === 'natural') {
              mat.color.setHex(isAreolaNipple ? 0xC27A68 : 0xDE9F7E);
              mat.roughness = isAreolaNipple ? 0.58 : 0.52;
              mat.emissive.setHex(isAreolaNipple ? 0x2A0D07 : 0x1F0B05);
              mat.emissiveIntensity = 0.06;
              if (effectiveOpacity >= 0.95) {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.depthWrite = true;
              } else {
                mat.transparent = true;
                mat.opacity = effectiveOpacity;
                mat.depthWrite = false;
              }
            } else if (skinMode === 'translucent') {
              mat.color.setHex(0x38BDF8);
              mat.transparent = true;
              mat.opacity = effectiveOpacity;
              mat.depthWrite = false;
            } else if (skinMode === 'xray') {
              mat.color.setHex(0x818CF8);
              mat.transparent = true;
              mat.opacity = effectiveOpacity * 0.85;
              mat.depthWrite = false;
            }
          } else if (isGlandularPart) {
            mat.opacity = systemAlpha;
            mat.transparent = systemAlpha < 0.95;
          }
        });
        return;
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
  }, [selectedStructureId, systemVisibility, systemOpacity, isIsolated, layerSeparation, skinOpacity, skinMode, skinVisible, biologicalSex]);

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
        // Find closest hit that is visible (or skin if opaque)
        if (hit.object.visible && hit.object.userData?.id) {
          const ud = hit.object.userData as MeshUserData;
          if (ud.id !== 'skin' || skinOpacity >= 0.85) {
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
        if (hit.object.visible && hit.object.userData?.id) {
          const ud = hit.object.userData as MeshUserData;
          if (ud.id !== 'skin' || skinOpacity >= 0.85) {
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
// ANATOMICALLY CALIBRATED PROCEDURAL MUSCULAR SYSTEM GENERATOR
// ============================================================================

function buildDetailedMuscularSystem(
  masterGroup: THREE.Group,
  registerMesh: (id: string, mesh: THREE.Mesh, system: AnatomicalSystemId, name: string) => void
) {
  const muscleGroup = new THREE.Group();
  muscleGroup.name = 'MuscularSystemGroup';

  const muscleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xB91C1C, // Deep anatomical muscle ruby-crimson
    roughness: 0.38,
    metalness: 0.03,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25
  });

  interface MuscleDef {
    name: string;
    geom: THREE.BufferGeometry;
    pos: [number, number, number];
    rot?: [number, number, number];
    scale?: [number, number, number];
  }

  const muscles: MuscleDef[] = [];

  // 1. CHEST: Pectoralis Major (Left & Right fan-shaped plates)
  muscles.push(
    {
      name: 'Right Pectoralis Major',
      geom: new THREE.CapsuleGeometry(0.24, 0.42, 8, 16),
      pos: [-0.44, 2.05, 0.38],
      rot: [0.15, 0.35, -0.45],
      scale: [1.1, 1.0, 0.65]
    },
    {
      name: 'Left Pectoralis Major',
      geom: new THREE.CapsuleGeometry(0.24, 0.42, 8, 16),
      pos: [0.44, 2.05, 0.38],
      rot: [0.15, -0.35, 0.45],
      scale: [1.1, 1.0, 0.65]
    }
  );

  // 2. ABDOMEN: Rectus Abdominis (6-Pack segments with linea alba)
  const absLevels = [
    { y: 1.48, len: 0.20, name: 'Upper' },
    { y: 1.15, len: 0.20, name: 'Middle' },
    { y: 0.80, len: 0.22, name: 'Lower' }
  ];
  absLevels.forEach((lvl) => {
    muscles.push(
      {
        name: `Right Rectus Abdominis (${lvl.name})`,
        geom: new THREE.CapsuleGeometry(0.13, lvl.len, 6, 14),
        pos: [-0.18, lvl.y, 0.38],
        rot: [0.05, 0, 0],
        scale: [1.0, 1.0, 0.6]
      },
      {
        name: `Left Rectus Abdominis (${lvl.name})`,
        geom: new THREE.CapsuleGeometry(0.13, lvl.len, 6, 14),
        pos: [0.18, lvl.y, 0.38],
        rot: [0.05, 0, 0],
        scale: [1.0, 1.0, 0.6]
      }
    );
  });

  // 3. FLANKS: External Obliques (Left & Right flank musculature)
  muscles.push(
    {
      name: 'Right External Oblique',
      geom: new THREE.CapsuleGeometry(0.18, 0.68, 8, 16),
      pos: [-0.62, 1.10, 0.16],
      rot: [0, 0.2, 0.2],
      scale: [1.1, 1.0, 0.7]
    },
    {
      name: 'Left External Oblique',
      geom: new THREE.CapsuleGeometry(0.18, 0.68, 8, 16),
      pos: [0.62, 1.10, 0.16],
      rot: [0, -0.2, -0.2],
      scale: [1.1, 1.0, 0.7]
    }
  );

  // 4. SHOULDERS: Deltoids (Left & Right 3-part shoulder caps)
  muscles.push(
    {
      name: 'Right Deltoid (Shoulder Cap)',
      geom: new THREE.SphereGeometry(0.32, 16, 16),
      pos: [-1.15, 2.30, 0.04],
      scale: [0.9, 1.3, 0.95]
    },
    {
      name: 'Left Deltoid (Shoulder Cap)',
      geom: new THREE.SphereGeometry(0.32, 16, 16),
      pos: [1.15, 2.30, 0.04],
      scale: [0.9, 1.3, 0.95]
    }
  );

  // 5. UPPER ARMS: Biceps Brachii & Triceps Brachii
  muscles.push(
    {
      name: 'Right Biceps Brachii',
      geom: new THREE.CapsuleGeometry(0.15, 0.48, 8, 16),
      pos: [-1.22, 1.62, 0.14],
      rot: [0.1, 0, 0.1],
      scale: [1.0, 1.0, 0.85]
    },
    {
      name: 'Left Biceps Brachii',
      geom: new THREE.CapsuleGeometry(0.15, 0.48, 8, 16),
      pos: [1.22, 1.62, 0.14],
      rot: [0.1, 0, -0.1],
      scale: [1.0, 1.0, 0.85]
    },
    {
      name: 'Right Triceps Brachii',
      geom: new THREE.CapsuleGeometry(0.16, 0.52, 8, 16),
      pos: [-1.22, 1.62, -0.14],
      rot: [-0.1, 0, 0.1],
      scale: [1.0, 1.0, 0.9]
    },
    {
      name: 'Left Triceps Brachii',
      geom: new THREE.CapsuleGeometry(0.16, 0.52, 8, 16),
      pos: [1.22, 1.62, -0.14],
      rot: [-0.1, 0, -0.1],
      scale: [1.0, 1.0, 0.9]
    }
  );

  // 6. FOREARMS: Brachioradialis & Forearm Flexors
  muscles.push(
    {
      name: 'Right Forearm Flexors',
      geom: new THREE.CylinderGeometry(0.16, 0.11, 0.80, 16),
      pos: [-1.42, 0.65, 0.05],
      rot: [0, 0, 0.12],
      scale: [1.0, 1.0, 0.85]
    },
    {
      name: 'Left Forearm Flexors',
      geom: new THREE.CylinderGeometry(0.16, 0.11, 0.80, 16),
      pos: [1.42, 0.65, 0.05],
      rot: [0, 0, -0.12],
      scale: [1.0, 1.0, 0.85]
    }
  );

  // 7. BACK: Trapezius & Latissimus Dorsi
  muscles.push(
    {
      name: 'Trapezius (Upper Back)',
      geom: new THREE.CapsuleGeometry(0.24, 0.55, 8, 16),
      pos: [0, 2.62, -0.22],
      rot: [0, 0, Math.PI / 2],
      scale: [0.75, 1.1, 0.75]
    },
    {
      name: 'Right Latissimus Dorsi',
      geom: new THREE.CapsuleGeometry(0.22, 0.72, 8, 16),
      pos: [-0.52, 1.45, -0.26],
      rot: [0, 0.25, -0.2],
      scale: [1.1, 1.0, 0.7]
    },
    {
      name: 'Left Latissimus Dorsi',
      geom: new THREE.CapsuleGeometry(0.22, 0.72, 8, 16),
      pos: [0.52, 1.45, -0.26],
      rot: [0, -0.25, 0.2],
      scale: [1.1, 1.0, 0.7]
    }
  );

  // 8. HIPS & GLUTEALS: Gluteus Maximus
  muscles.push(
    {
      name: 'Right Gluteus Maximus',
      geom: new THREE.SphereGeometry(0.36, 16, 16),
      pos: [-0.38, -0.25, -0.32],
      scale: [1.1, 1.0, 1.15]
    },
    {
      name: 'Left Gluteus Maximus',
      geom: new THREE.SphereGeometry(0.36, 16, 16),
      pos: [0.38, -0.25, -0.32],
      scale: [1.1, 1.0, 1.15]
    }
  );

  // 9. THIGHS: Quadriceps Femoris & Hamstrings
  muscles.push(
    {
      name: 'Right Quadriceps Femoris',
      geom: new THREE.CapsuleGeometry(0.22, 0.88, 8, 16),
      pos: [-0.42, -1.25, 0.20],
      rot: [-0.08, 0, 0.05],
      scale: [1.1, 1.0, 0.85]
    },
    {
      name: 'Left Quadriceps Femoris',
      geom: new THREE.CapsuleGeometry(0.22, 0.88, 8, 16),
      pos: [0.42, -1.25, 0.20],
      rot: [-0.08, 0, -0.05],
      scale: [1.1, 1.0, 0.85]
    },
    {
      name: 'Right Hamstrings',
      geom: new THREE.CapsuleGeometry(0.22, 0.88, 8, 16),
      pos: [-0.42, -1.25, -0.18],
      rot: [0.08, 0, 0.05],
      scale: [1.1, 1.0, 0.9]
    },
    {
      name: 'Left Hamstrings',
      geom: new THREE.CapsuleGeometry(0.22, 0.88, 8, 16),
      pos: [0.42, -1.25, -0.18],
      rot: [0.08, 0, -0.05],
      scale: [1.1, 1.0, 0.9]
    }
  );

  // 10. LOWER LEGS: Gastrocnemius (Calf) & Tibialis Anterior (Shin)
  muscles.push(
    {
      name: 'Right Gastrocnemius (Calf)',
      geom: new THREE.CapsuleGeometry(0.20, 0.65, 8, 16),
      pos: [-0.38, -2.75, -0.15],
      rot: [0.05, 0, 0.04],
      scale: [1.05, 1.0, 0.8]
    },
    {
      name: 'Left Gastrocnemius (Calf)',
      geom: new THREE.CapsuleGeometry(0.20, 0.65, 8, 16),
      pos: [0.38, -2.75, -0.15],
      rot: [0.05, 0, -0.04],
      scale: [1.05, 1.0, 0.8]
    },
    {
      name: 'Right Tibialis Anterior (Shin)',
      geom: new THREE.CapsuleGeometry(0.12, 0.70, 8, 16),
      pos: [-0.38, -2.75, 0.14],
      rot: [-0.05, 0, 0.04],
      scale: [1.0, 1.0, 0.75]
    },
    {
      name: 'Left Tibialis Anterior (Shin)',
      geom: new THREE.CapsuleGeometry(0.12, 0.70, 8, 16),
      pos: [0.38, -2.75, 0.14],
      rot: [-0.05, 0, -0.04],
      scale: [1.0, 1.0, 0.75]
    }
  );

  // 11. NECK: Sternocleidomastoid
  muscles.push(
    {
      name: 'Right Sternocleidomastoid',
      geom: new THREE.CapsuleGeometry(0.10, 0.42, 8, 16),
      pos: [-0.22, 2.95, 0.12],
      rot: [0.3, 0.25, -0.35],
      scale: [0.9, 1.0, 0.7]
    },
    {
      name: 'Left Sternocleidomastoid',
      geom: new THREE.CapsuleGeometry(0.10, 0.42, 8, 16),
      pos: [0.22, 2.95, 0.12],
      rot: [0.3, -0.25, 0.35],
      scale: [0.9, 1.0, 0.7]
    }
  );

  // Instantiate and register each muscle mesh
  muscles.forEach((m) => {
    const mesh = new THREE.Mesh(m.geom, muscleMaterial.clone());
    mesh.position.set(...m.pos);
    if (m.rot) mesh.rotation.set(...m.rot);
    if (m.scale) mesh.scale.set(...m.scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    muscleGroup.add(mesh);
    registerMesh('muscles_core', mesh, 'muscular', m.name);
  });

  masterGroup.add(muscleGroup);
}

// ============================================================================
// ANATOMICALLY CALIBRATED FEMALE REPRODUCTIVE & BREAST ANATOMY GENERATOR
// ============================================================================

function buildDetailedFemaleAnatomy(
  masterGroup: THREE.Group,
  registerMesh: (id: string, mesh: THREE.Mesh, system: AnatomicalSystemId, name: string) => void
) {
  const femaleGroup = new THREE.Group();
  femaleGroup.name = 'FemaleReproductiveGroup';

  // Materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xDE9F7E, // Natural skin tone
    roughness: 0.52,
    metalness: 0.02,
    emissive: new THREE.Color(0x1F0B05),
    emissiveIntensity: 0.06
  });

  const areolaMaterial = new THREE.MeshStandardMaterial({
    color: 0xC27A68, // Pigmented areola rose-umber
    roughness: 0.58,
    metalness: 0.01
  });

  const glandularMaterial = new THREE.MeshStandardMaterial({
    color: 0xFB7185, // Secretory glandular lobules
    roughness: 0.40,
    metalness: 0.02
  });

  const uterineMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xF43F5E, // Uterine myometrium crimson-pink
    roughness: 0.35,
    metalness: 0.03,
    clearcoat: 0.35
  });

  const ovarianMaterial = new THREE.MeshStandardMaterial({
    color: 0xFECDD3, // Ovarian pearl pink
    roughness: 0.32,
    metalness: 0.02
  });

  const mucosalMaterial = new THREE.MeshStandardMaterial({
    color: 0xE8798A, // Vestibular mucosal pink
    roughness: 0.36,
    metalness: 0.02
  });

  // A. BILATERAL MAMMARY GLANDS (BREASTS) Over Anterior Pectoralis Major
  const breastOffsets: { side: 'Right' | 'Left'; x: number }[] = [
    { side: 'Right', x: -0.44 },
    { side: 'Left', x: 0.44 }
  ];

  breastOffsets.forEach(({ side, x }) => {
    // 1. External Breast Surface & Adipose Body (Smooth anatomical hemisphere)
    const breastGeom = new THREE.SphereGeometry(0.36, 24, 24);
    const breastMesh = new THREE.Mesh(breastGeom, skinMaterial.clone());
    breastMesh.position.set(x, 2.05, 0.46);
    breastMesh.scale.set(1.08, 0.96, 1.25);
    breastMesh.rotation.set(0.08, x > 0 ? -0.12 : 0.12, 0);
    breastMesh.castShadow = true;
    breastMesh.receiveShadow = true;
    femaleGroup.add(breastMesh);
    registerMesh('mammary_glands', breastMesh, 'reproductive', `${side} Breast (Mammary Gland & Skin)`);

    // 2. Pigmented Areola Circle Disc
    const areolaGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.015, 24);
    const areolaMesh = new THREE.Mesh(areolaGeom, areolaMaterial.clone());
    areolaMesh.position.set(x, 2.05, 0.88);
    areolaMesh.rotation.set(Math.PI / 2 + 0.08, 0, x > 0 ? -0.12 : 0.12);
    femaleGroup.add(areolaMesh);
    registerMesh('mammary_glands', areolaMesh, 'reproductive', `${side} Areola`);

    // 3. Central Nipple Papilla
    const nippleGeom = new THREE.CylinderGeometry(0.04, 0.045, 0.04, 16);
    const nippleMesh = new THREE.Mesh(nippleGeom, areolaMaterial.clone());
    nippleMesh.position.set(x, 2.05, 0.90);
    nippleMesh.rotation.set(Math.PI / 2 + 0.08, 0, x > 0 ? -0.12 : 0.12);
    femaleGroup.add(nippleMesh);
    registerMesh('mammary_glands', nippleMesh, 'reproductive', `${side} Nipple (Papilla)`);

    // 4. Internal Glandular Lobules (Radiating milk-secreting alveoli)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const lobuleGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const lobuleMesh = new THREE.Mesh(lobuleGeom, glandularMaterial.clone());
      const r = 0.16;
      lobuleMesh.position.set(
        x + Math.cos(angle) * r,
        2.05 + Math.sin(angle) * r,
        0.58
      );
      lobuleMesh.scale.set(1.2, 0.8, 0.8);
      femaleGroup.add(lobuleMesh);
      registerMesh('mammary_glands', lobuleMesh, 'reproductive', `${side} Glandular Lobule`);
    }
  });

  // B. INTERNAL FEMALE PELVIC ORGANS: UTERUS, FALLOPIAN TUBES & OVARIES
  // 1. Uterus (Pear-shaped muscular corpus and fundus)
  const uterusGeom = new THREE.CylinderGeometry(0.14, 0.09, 0.28, 16);
  const uterusMesh = new THREE.Mesh(uterusGeom, uterineMaterial.clone());
  uterusMesh.position.set(0, 0.28, 0.06);
  uterusMesh.rotation.set(0.15, 0, 0); // slight anatomical anteversion
  uterusMesh.castShadow = true;
  femaleGroup.add(uterusMesh);
  registerMesh('uterus_and_ovaries', uterusMesh, 'reproductive', 'Uterus (Corpus & Cervix)');

  // Uterine Fundus (Dome cap)
  const fundusGeom = new THREE.SphereGeometry(0.14, 16, 12);
  const fundusMesh = new THREE.Mesh(fundusGeom, uterineMaterial.clone());
  fundusMesh.position.set(0, 0.42, 0.08);
  fundusMesh.scale.set(1.0, 0.6, 0.9);
  femaleGroup.add(fundusMesh);
  registerMesh('uterus_and_ovaries', fundusMesh, 'reproductive', 'Uterine Fundus');

  // 2. Bilateral Fallopian Tubes & Ovaries
  [-1, 1].forEach((sgn) => {
    const side = sgn > 0 ? 'Left' : 'Right';
    // Fallopian Tube arch
    const tubeGeom = new THREE.CapsuleGeometry(0.025, 0.32, 6, 12);
    const tubeMesh = new THREE.Mesh(tubeGeom, uterineMaterial.clone());
    tubeMesh.position.set(sgn * 0.26, 0.38, 0.05);
    tubeMesh.rotation.set(0, 0, sgn * (Math.PI / 2.6));
    femaleGroup.add(tubeMesh);
    registerMesh('uterus_and_ovaries', tubeMesh, 'reproductive', `${side} Fallopian Tube (Oviduct)`);

    // Ovary
    const ovaryGeom = new THREE.SphereGeometry(0.08, 14, 14);
    const ovaryMesh = new THREE.Mesh(ovaryGeom, ovarianMaterial.clone());
    ovaryMesh.position.set(sgn * 0.42, 0.30, 0.02);
    ovaryMesh.scale.set(1.3, 0.9, 0.8);
    femaleGroup.add(ovaryMesh);
    registerMesh('uterus_and_ovaries', ovaryMesh, 'reproductive', `${side} Ovary`);
  });

  // C. EXTERNAL FEMALE GENITALIA (VULVA & PUDENDUM)
  // 1. Mons Pubis (Adipose cushion overlying pubic symphysis)
  const monsGeom = new THREE.SphereGeometry(0.24, 16, 16);
  const monsMesh = new THREE.Mesh(monsGeom, skinMaterial.clone());
  monsMesh.position.set(0, -0.44, 0.26);
  monsMesh.scale.set(1.05, 0.72, 0.85);
  femaleGroup.add(monsMesh);
  registerMesh('female_genitalia_external', monsMesh, 'reproductive', 'Mons Pubis (Adipose Cushion)');

  // 2. Labia Majora (Bilateral longitudinal protective folds)
  [-1, 1].forEach((sgn) => {
    const side = sgn > 0 ? 'Left' : 'Right';
    const foldGeom = new THREE.CapsuleGeometry(0.055, 0.24, 8, 16);
    const foldMesh = new THREE.Mesh(foldGeom, skinMaterial.clone());
    foldMesh.position.set(sgn * 0.065, -0.62, 0.16);
    foldMesh.rotation.set(0.2, 0, sgn * 0.06);
    femaleGroup.add(foldMesh);
    registerMesh('female_genitalia_external', foldMesh, 'reproductive', `${side} Labium Majus`);

    // Labia Minora (Inner mucosal folds)
    const minoraGeom = new THREE.CapsuleGeometry(0.028, 0.20, 6, 12);
    const minoraMesh = new THREE.Mesh(minoraGeom, mucosalMaterial.clone());
    minoraMesh.position.set(sgn * 0.026, -0.62, 0.15);
    minoraMesh.rotation.set(0.2, 0, sgn * 0.04);
    femaleGroup.add(minoraMesh);
    registerMesh('female_genitalia_external', minoraMesh, 'reproductive', `${side} Labium Minus`);
  });

  // 3. Clitoral Glans & Prepuce (Anterior commissure)
  const clitorisGeom = new THREE.SphereGeometry(0.03, 10, 10);
  const clitorisMesh = new THREE.Mesh(clitorisGeom, uterineMaterial.clone());
  clitorisMesh.position.set(0, -0.52, 0.21);
  clitorisMesh.scale.set(1.0, 1.2, 1.0);
  femaleGroup.add(clitorisMesh);
  registerMesh('female_genitalia_external', clitorisMesh, 'reproductive', 'Clitoris (Glans & Prepuce)');

  // 4. Vaginal Vestibule & Introitus (Central urogenital cleft)
  const vestibuleGeom = new THREE.CapsuleGeometry(0.022, 0.16, 6, 12);
  const vestibuleMesh = new THREE.Mesh(vestibuleGeom, mucosalMaterial.clone());
  vestibuleMesh.position.set(0, -0.64, 0.14);
  vestibuleMesh.rotation.set(0.25, 0, 0);
  femaleGroup.add(vestibuleMesh);
  registerMesh('female_genitalia_external', vestibuleMesh, 'reproductive', 'Vaginal Vestibule & Introitus');

  masterGroup.add(femaleGroup);
}

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

  // 1. Build Anatomically Calibrated Muscular System
  buildDetailedMuscularSystem(masterGroup, registerMesh);

  // 2. Build Anatomically Calibrated Female Reproductive & Breast Anatomy
  buildDetailedFemaleAnatomy(masterGroup, registerMesh);

  // 2. High-Resolution Visible Human & Z-Anatomy Models
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
      name: 'Human Body Surface (Skin & Involucre)',
      system: 'muscular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDE9F7E, // Realistic natural skin tone
      roughness: 0.52,
      clearcoat: 0.1,
      opacity: 0.45
    },
    {
      file: 'skeleton.glb',
      id: 'skeleton',
      name: 'Human Skeletal System',
      system: 'skeletal',
      scale: 0.045, // 175cm -> meters * 4.5
      position: [0, -3.80, 0],
      materialColor: 0xFBF8F0, // Warm natural ivory bone
      roughness: 0.38,
      metalness: 0.02
    },
    {
      file: 'heart.glb',
      id: 'heart',
      name: 'Heart (Myocardium & Chambers)',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xBE123C, // Myocardium crimson
      roughness: 0.30,
      clearcoat: 0.5,
      separatedOffset: [-0.4, 0, 1.5]
    },
    {
      file: 'lung.glb',
      id: 'lungs',
      name: 'Lungs & Bronchial Tree',
      system: 'respiratory',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDC828F, // Pulmonary rose-pink
      roughness: 0.44,
      separatedOffset: [0.8, 0, 0.6]
    },
    {
      file: 'brain.glb',
      id: 'brain',
      name: 'Brain (Cerebral Cortex & Stem)',
      system: 'nervous',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xE2C7B8, // Cerebral ivory-pink
      roughness: 0.40,
      separatedOffset: [0, 0.4, 0.6]
    },
    {
      file: 'liver.glb',
      id: 'liver',
      name: 'Liver',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x881337, // Hepatic burgundy
      roughness: 0.35,
      clearcoat: 0.3,
      separatedOffset: [-0.8, 0, 1.2]
    },
    {
      file: 'kidney-l.glb',
      id: 'kidneys',
      name: 'Left Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x831843, // Renal mahogany
      roughness: 0.36,
      clearcoat: 0.3,
      separatedOffset: [0.6, 0, 0.9]
    },
    {
      file: 'kidney-r.glb',
      id: 'kidneys',
      name: 'Right Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x831843,
      roughness: 0.36,
      clearcoat: 0.3,
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
      roughness: 0.44,
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
      roughness: 0.44,
      separatedOffset: [0, -0.2, 1.2]
    },
    {
      file: 'vasculature.glb',
      id: 'aorta',
      name: 'Circulatory Vascular Network',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xEF4444, // Arterial ruby
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
