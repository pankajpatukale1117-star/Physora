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
  showInternal = false,
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
  const [selectedScreenPos, setSelectedScreenPos] = useState<{ x: number; y: number } | null>(null);
  const lastScreenPosRef = useRef<{ x: number; y: number } | null>(null);

  // Synchronized refs to avoid stale closures in Three.js animate() loop
  const selectedStructureIdRef = useRef<string | null>(selectedStructureId);
  useEffect(() => {
    selectedStructureIdRef.current = selectedStructureId;
  }, [selectedStructureId]);

  const isProcessPlayingRef = useRef<boolean>(isProcessPlaying);
  const processSpeedRef = useRef<number>(processSpeed);
  useEffect(() => {
    isProcessPlayingRef.current = isProcessPlaying;
    processSpeedRef.current = processSpeed;
  }, [isProcessPlaying, processSpeed]);

  const showInternalRef = useRef<boolean>(showInternal);
  useEffect(() => {
    showInternalRef.current = showInternal;
  }, [showInternal]);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const anatomyMasterGroupRef = useRef<THREE.Group | null>(null);
  const circulationGroupRef = useRef<THREE.Group | null>(null);

  // Camera Target & Cinematic Spring State
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.0, 0));
  const cameraDesiredTargetRef = useRef(new THREE.Vector3(0, 0.0, 0));
  const cameraSphericalRef = useRef({ radius: 10.5, theta: 0, phi: Math.PI / 2 });
  const cameraDesiredSphericalRef = useRef({ radius: 10.5, theta: 0, phi: Math.PI / 2 });

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
    scene.background = new THREE.Color(0x080D1A); // Clean neutral scientific deep slate
    sceneRef.current = scene;

    // Camera (Telephoto-style 34 deg FOV removes wide-angle game distortion)
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.0, 11.2);
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
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.85);
    scene.add(ambientLight);

    // 2. Key Directional Daylight (Calm scientific neutral white)
    const keyLight = new THREE.DirectionalLight(0xFFFDF8, 1.7);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    // 3. Soft Front-Left Fill Light (Eliminates harsh shadows)
    const fillLight = new THREE.DirectionalLight(0xF1F5F9, 0.75);
    fillLight.position.set(-6, 3, 6);
    scene.add(fillLight);

    // 4. Subtle Contour Rim Light (Crisp neutral anatomical edge definition)
    const rimLight = new THREE.DirectionalLight(0xCBD5E1, 0.55);
    rimLight.position.set(-6, 7, -6);
    scene.add(rimLight);

    // 5. Warm Underfill Bounce Light (Subtle depth)
    const underfillLight = new THREE.DirectionalLight(0xF8FAFC, 0.25);
    underfillLight.position.set(0, -6, 3);
    scene.add(underfillLight);

    // ------------------------------------------------------------------------
    // SUBTLE GROUNDING CONTACT SHADOW (Replaces game pedestal with soft grounding)
    // ------------------------------------------------------------------------
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.38)');
      gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.18)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(3.6, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -4.118, -0.05);
    scene.add(shadowMesh);

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

        // Project current target to 2D screen coordinates for 3D holographic callout
        const currentActiveId = selectedStructureIdRef.current;
        if (currentActiveId && containerRef.current) {
          const p = currentTarget.clone().project(cam);
          if (p.z < 1.0) {
            const rect = containerRef.current.getBoundingClientRect();
            const sx = ((p.x + 1) * 0.5) * rect.width;
            const sy = ((-p.y + 1) * 0.5) * rect.height;
            if (
              !lastScreenPosRef.current ||
              Math.abs(lastScreenPosRef.current.x - sx) > 1.5 ||
              Math.abs(lastScreenPosRef.current.y - sy) > 1.5
            ) {
              lastScreenPosRef.current = { x: sx, y: sy };
              setSelectedScreenPos({ x: sx, y: sy });
            }
          } else {
            if (lastScreenPosRef.current !== null) {
              lastScreenPosRef.current = null;
              setSelectedScreenPos(null);
            }
          }
        } else {
          if (lastScreenPosRef.current !== null) {
            lastScreenPosRef.current = null;
            setSelectedScreenPos(null);
          }
        }
      }

      // 2. Animated Biological Processes (Blood flow, Cardiac pulsation, Respiratory expansion)
      renderDynamicBiologicalProcesses(
        delta,
        isProcessPlayingRef.current,
        processSpeedRef.current,
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
          if (skinAlpha >= 0.95) {
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
      cameraDesiredSphericalRef.current = { radius: 10.5, theta: 0, phi: Math.PI / 2 };
      cameraDesiredTargetRef.current.set(0, 0.0, 0);
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
        cameraDesiredTargetRef.current.set(0, 0.0, 0);
        cameraDesiredSphericalRef.current.radius = 10.5;
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
      // Skin represents outer anatomical boundary (neutral matte scientific mannequin)
      if (id === 'skin') {
        const effectiveOpacity = skinOpacity;
        const isVisible = skinVisible && effectiveOpacity > 0.01 && !isIsolated;

        meshes.forEach((mesh) => {
          mesh.visible = isVisible;
          if (!isVisible) return;

          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          if (!mat) return;

          if (isSelected) {
            mat.emissive.set(new THREE.Color(0x10B981));
            mat.emissiveIntensity = 0.45;
            mat.opacity = Math.max(0.65, effectiveOpacity);
            mat.transparent = true;
            mat.depthWrite = false;
          } else {
            mat.color.setHex(0xDCE1E6); // Neutral scientific matte alabaster mannequin
            mat.roughness = 0.65;
            mat.metalness = 0.0;
            mat.emissive.setHex(0x0A0F1D);
            mat.emissiveIntensity = 0.03;
            if (effectiveOpacity >= 0.95) {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.depthWrite = true;
            } else {
              mat.transparent = true;
              mat.opacity = effectiveOpacity;
              mat.depthWrite = false;
            }
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
          if (showInternal) {
            // Cutaway / translucent internal cavity inspection mode
            mat.opacity = 0.38;
            mat.transparent = true;
            mat.depthWrite = false;
          } else {
            mat.opacity = 1.0;
            mat.transparent = false;
            mat.depthWrite = true;
          }
        } else if (selectedStructureId && ANATOMY_STRUCTURES[selectedStructureId] && !isIsolated) {
          // Keep surrounding anatomy as spatial context: dim into subtle translucent silhouette
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = Math.min(systemAlpha * 0.18, 0.20);
          mat.transparent = true;
          mat.depthWrite = false;
        } else {
          // Normal state with system opacity
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = systemAlpha;
          mat.transparent = systemAlpha < 0.95;
          mat.depthWrite = systemAlpha >= 0.95;
        }
      });
    });
  }, [selectedStructureId, systemVisibility, systemOpacity, isIsolated, showInternal, layerSeparation, skinOpacity, skinMode, skinVisible, biologicalSex]);

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

      {/* 3D Anatomical Pin / Holographic Leader Line Callout */}
      {selectedScreenPos && selectedStructureId && ANATOMY_STRUCTURES[selectedStructureId] && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 60,
            overflow: 'hidden'
          }}
        >
          {/* SVG Leader Line connecting 3D structure center to Floating Callout */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <line
              x1={selectedScreenPos.x}
              y1={selectedScreenPos.y}
              x2={selectedScreenPos.x + 36}
              y2={selectedScreenPos.y - 36}
              stroke={ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || '#10B981'}
              strokeWidth={1.5}
              strokeDasharray="4,2"
            />
            <circle
              cx={selectedScreenPos.x}
              cy={selectedScreenPos.y}
              r={4}
              fill={ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || '#10B981'}
            />
            <circle
              cx={selectedScreenPos.x}
              cy={selectedScreenPos.y}
              r={8}
              fill="none"
              stroke={ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || '#10B981'}
              strokeWidth={1}
              opacity={0.6}
            />
          </svg>

          {/* Floating Organ Callout Badge */}
          <div
            style={{
              position: 'absolute',
              left: selectedScreenPos.x + 40,
              top: selectedScreenPos.y - 62,
              background: 'rgba(11, 17, 32, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || 'rgba(16, 185, 129, 0.5)'}`,
              padding: '4px 10px',
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap'
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || '#10B981',
                boxShadow: `0 0 8px ${ANATOMY_STRUCTURES[selectedStructureId]?.accentColor || '#10B981'}`
              }}
            />
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FFFFFF' }}>
                {ANATOMY_STRUCTURES[selectedStructureId]?.name}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#94A3B8', fontStyle: 'italic' }}>
                {ANATOMY_STRUCTURES[selectedStructureId]?.latinName}
              </div>
            </div>
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
  _separableOrgans: SeparableOrgan[],
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

  // High-Resolution Visible Human & Z-Anatomy Anatomical Models
  // All internal structures calibrated to remain strictly INSIDE the anatomical mannequin envelope
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
  }[] = [
    {
      file: 'skin.glb',
      id: 'skin',
      name: 'Human Anatomical Mannequin (Surface)',
      system: 'muscular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDCE1E6, // Neutral scientific matte alabaster
      roughness: 0.65,
      clearcoat: 0.05,
      opacity: 0.85
    },
    {
      file: 'skeleton.glb',
      id: 'skeleton',
      name: 'Human Skeletal System',
      system: 'skeletal',
      scale: 0.0465, // Calibrated so ribcage, sternum, and skull stay strictly INSIDE the mannequin
      position: [0, -4.08, -0.16], // Calibrated vertically and in depth with thoracic cavity
      materialColor: 0xF5EFEB, // Clean medical ivory bone
      roughness: 0.42,
      metalness: 0.0,
      clearcoat: 0.08
    },
    {
      file: 'heart.glb',
      id: 'heart',
      name: 'Heart (Myocardium & Chambers)',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xB91C1C, // Myocardium ruby crimson
      roughness: 0.28,
      clearcoat: 0.65
    },
    {
      file: 'lung.glb',
      id: 'lungs',
      name: 'Lungs & Tracheobronchial Tree',
      system: 'respiratory',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xE07A8B, // Pulmonary rose blush
      roughness: 0.46,
      clearcoat: 0.25
    },
    {
      file: 'brain.glb',
      id: 'brain',
      name: 'Brain (Cerebral Cortex & Stem)',
      system: 'nervous',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDEC5BA, // Cerebral ivory-pink
      roughness: 0.40,
      clearcoat: 0.35
    },
    {
      file: 'liver.glb',
      id: 'liver',
      name: 'Liver (Hepatic Lobes)',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x7F1D1D, // Hepatic burgundy
      roughness: 0.32,
      clearcoat: 0.55
    },
    {
      file: 'kidney-l.glb',
      id: 'kidneys',
      name: 'Left Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x78350F, // Renal mahogany
      roughness: 0.34,
      clearcoat: 0.50
    },
    {
      file: 'kidney-r.glb',
      id: 'kidneys',
      name: 'Right Kidney',
      system: 'urinary',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0x78350F,
      roughness: 0.34,
      clearcoat: 0.50
    },
    {
      file: 'gut-large.glb',
      id: 'intestines',
      name: 'Large Intestine (Colon)',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xB45309, // Enteric terracotta tan
      roughness: 0.40,
      clearcoat: 0.45
    },
    {
      file: 'gut-small.glb',
      id: 'intestines',
      name: 'Small Intestine',
      system: 'digestive',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xD97706, // Enteric golden amber
      roughness: 0.42,
      clearcoat: 0.50
    },
    {
      file: 'vasculature.glb',
      id: 'aorta',
      name: 'Circulatory Vascular Network',
      system: 'cardiovascular',
      scale: 4.5,
      position: [0, 0, 0],
      materialColor: 0xDC2626, // Arterial ruby
      roughness: 0.32,
      clearcoat: 0.60
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

        // Traverse meshes and assign medical PBR materials
        root.traverse((child) => {

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || spec.name).toLowerCase();

            // 1. Neutral Scientific Anatomical Mannequin Material (Skin boundary)
            if (spec.id === 'skin') {
              mesh.geometry.computeVertexNormals();
              const skinMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xDCE1E6, // Clean matte alabaster scientific mannequin
                roughness: 0.65,
                metalness: 0.0,
                clearcoat: 0.05,
                clearcoatRoughness: 0.5,
                emissive: new THREE.Color(0x0A0F1D),
                emissiveIntensity: 0.03,
                transparent: true,
                opacity: spec.opacity ?? 0.85,
                depthWrite: (spec.opacity ?? 0.85) >= 0.95
              });
              mesh.material = skinMaterial;
              registerMesh('skin', mesh, spec.system, mesh.name || spec.name);
              return;
            }

            // 2. High-precision anatomical structure mappings
            let color = spec.materialColor;

            if (spec.id === 'skeleton') {
              // Map individual bones to their clinical regions
              if (
                name.includes('cranium') ||
                name.includes('parietal') ||
                name.includes('frontal') ||
                name.includes('occipital') ||
                name.includes('sphenoid') ||
                name.includes('temporal') ||
                name.includes('ethmoid') ||
                name.includes('lacrimal') ||
                name.includes('nasal') ||
                name.includes('maxilla') ||
                name.includes('palatine') ||
                name.includes('zygomatic') ||
                name.includes('vomer') ||
                name.includes('mandible') ||
                name.includes('hyoid') ||
                name.includes('head')
              ) {
                registerMesh('skull', mesh, 'skeletal', mesh.name || 'Cranial Bone');
              } else if (
                name.includes('vertebra') ||
                name.includes('vertebral') ||
                name.includes('atlas') ||
                name.includes('axis') ||
                name.includes('cervical') ||
                name.includes('thoracic') ||
                name.includes('lumbar') ||
                name.includes('sacrum') ||
                name.includes('coccyx')
              ) {
                registerMesh('spine', mesh, 'skeletal', mesh.name || 'Vertebra');
              } else if (
                name.includes('rib') ||
                name.includes('costa') ||
                name.includes('sternum') ||
                name.includes('manubrium') ||
                name.includes('xiphoid') ||
                name.includes('levatores')
              ) {
                registerMesh('ribcage', mesh, 'skeletal', mesh.name || 'Thoracic Cage Bone');
              } else if (
                name.includes('hip') ||
                name.includes('pelvi') ||
                name.includes('ilium') ||
                name.includes('ischium') ||
                name.includes('pubis')
              ) {
                registerMesh('pelvis', mesh, 'skeletal', mesh.name || 'Pelvic Bone');
              } else if (
                name.includes('clavicle') ||
                name.includes('scapula') ||
                name.includes('humerus') ||
                name.includes('radius') ||
                name.includes('ulna') ||
                name.includes('hand') ||
                name.includes('finger') ||
                name.includes('carpal') ||
                name.includes('metacarpal') ||
                (name.includes('phalanx') && !name.includes('foot') && !name.includes('toe'))
              ) {
                registerMesh('limbs_upper', mesh, 'skeletal', mesh.name || 'Upper Limb Bone');
              } else if (
                name.includes('femur') ||
                name.includes('patella') ||
                name.includes('tibia') ||
                name.includes('fibula') ||
                name.includes('foot') ||
                name.includes('toe') ||
                name.includes('tarsal') ||
                name.includes('metatarsal') ||
                name.includes('calcaneus') ||
                name.includes('talus')
              ) {
                registerMesh('limbs_lower', mesh, 'skeletal', mesh.name || 'Lower Limb Bone');
              }
              registerMesh('skeleton', mesh, 'skeletal', mesh.name || spec.name);
            } else if (spec.id === 'heart') {
              if (name.includes('valve')) {
                color = 0xF1F5F9; // Fibrous pearlescent valve leaflet
                registerMesh('heart_valves', mesh, 'cardiovascular', mesh.name || 'Heart Valve');
              } else if (name.includes('left_ventricle')) {
                registerMesh('heart_left_ventricle', mesh, 'cardiovascular', 'Left Ventricle');
              } else if (name.includes('right_ventricle')) {
                registerMesh('heart_right_ventricle', mesh, 'cardiovascular', 'Right Ventricle');
              }
              registerMesh('heart', mesh, 'cardiovascular', mesh.name || spec.name);
            } else if (spec.id === 'lungs') {
              if (name.includes('trachea') || name.includes('cartilage') || name.includes('carina')) {
                color = 0xCBD5E1; // Hyaline cartilaginous rings
                registerMesh('trachea', mesh, 'respiratory', mesh.name || 'Tracheobronchial Cartilage');
              }
              registerMesh('lungs', mesh, 'respiratory', mesh.name || spec.name);
            } else if (spec.id === 'aorta') {
              // Specialized vascular differentiation (arteries ruby, veins royal blue)
              if (name.includes('vein') || name.includes('vena') || name.includes('sinus')) {
                color = 0x2563EB; // Deoxygenated venous royal blue
                if (name.includes('vena_cava') || name.includes('jugular')) {
                  registerMesh('vena_cava', mesh, 'cardiovascular', mesh.name || 'Vena Cava System');
                }
              } else {
                color = 0xDC2626; // Oxygenated arterial crimson
                if (name.includes('aorta') || name.includes('aortic')) {
                  registerMesh('aorta', mesh, 'cardiovascular', mesh.name || 'Aortic Arch & Trunk');
                }
              }
              registerMesh('vasculature', mesh, 'cardiovascular', mesh.name || spec.name);
            } else {
              registerMesh(spec.id, mesh, spec.system, mesh.name || spec.name);
            }

            const isTranslucent = spec.opacity !== undefined && spec.opacity < 1.0;
            const pbrMaterial = new THREE.MeshPhysicalMaterial({
              color,
              roughness: spec.roughness ?? 0.35,
              metalness: spec.metalness ?? 0.02,
              clearcoat: spec.clearcoat ?? 0.35,
              clearcoatRoughness: 0.22,
              sheen: spec.id === 'heart' || spec.id === 'lungs' || spec.id === 'liver' ? 0.35 : 0.0,
              sheenRoughness: 0.3,
              sheenColor: spec.id === 'heart' ? new THREE.Color(0xF87171) : new THREE.Color(0xFCA5A5),
              transparent: isTranslucent,
              opacity: spec.opacity ?? 1.0,
              depthWrite: !isTranslucent
            });

            mesh.material = pbrMaterial;
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
