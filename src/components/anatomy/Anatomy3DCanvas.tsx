// ============================================================================
// PHYSORA 3D HUMAN ANATOMY WEBGL ENGINE
// High-Precision Scientific 3D Visualization using Three.js
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
  isProcessPlaying: boolean;
  processSpeed: number; // 0.5 to 2.0
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

export const Anatomy3DCanvas: React.FC<AnatomicalStructurePropsWrapper<Anatomy3DCanvasProps>> = ({
  selectedStructureId,
  onSelectStructure,
  systemVisibility,
  systemOpacity,
  isIsolated,
  showInternal,
  isProcessPlaying,
  processSpeed,
  detailLevel: _detailLevel,
  presetView,
  onPresetViewHandled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStructure, setHoveredStructure] = useState<{ id: string; name: string; system: string; x: number; y: number } | null>(null);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const structuresGroupRef = useRef<THREE.Group | null>(null);
  const internalGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);

  // Camera Target & Orbit State
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const cameraSphericalRef = useRef({ radius: 12.0, theta: 0, phi: Math.PI / 2 });
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Animation frame loop refs
  const animationFrameIdRef = useRef<number | null>(null);
  const bloodParticlesRef = useRef<{ mesh: THREE.Points; speeds: Float32Array; originalPositions: Float32Array } | null>(null);

  // Mesh Registry for direct highlighting and opacity manipulation
  const meshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());

  // --------------------------------------------------------------------------
  // 1. INITIALIZE THREE.JS SCENE, LIGHTS & CONTROLS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070B14);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 12.0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Professional Medical Scientific Lighting
    // Ambient soft fill
    const ambientLight = new THREE.AmbientLight(0x94A3B8, 0.75);
    scene.add(ambientLight);

    // Key Light (upper right front)
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    // Rim / Contour Light (cool cyan/blue rim from back-left for organic separation)
    const rimLight = new THREE.DirectionalLight(0x38BDF8, 0.95);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // Under-Fill Light (warm medical bounce from below)
    const fillLight = new THREE.DirectionalLight(0xF87171, 0.35);
    fillLight.position.set(0, -8, 4);
    scene.add(fillLight);

    // Clean Ground Grid Plane (faded medical pedestal)
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

    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    // ------------------------------------------------------------------------
    // BUILD ALL 3D ANATOMICAL STRUCTURES
    // ------------------------------------------------------------------------
    buildAnatomyScene(structuresGroup, internalGroup, meshMapRef.current);

    // Setup animated process particles (Blood flow, etc.)
    setupBloodFlowParticles(particlesGroup, bloodParticlesRef);

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

    // Animation Loop
    let previousTime = 0;
    const animate = (time: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (time - previousTime) * 0.001;
      previousTime = time;

      // Update camera position smoothly from spherical coordinates
      const cam = cameraRef.current;
      const target = cameraTargetRef.current;
      if (cam) {
        const { radius, theta, phi } = cameraSphericalRef.current;
        const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
        const y = target.y + radius * Math.cos(phi);
        const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

        // Smooth damping
        cam.position.lerp(new THREE.Vector3(x, y, z), 0.1);
        cam.lookAt(target);
      }

      // Animated Biological Processes (if active)
      renderDynamicProcesses(delta, isProcessPlaying, processSpeed, bloodParticlesRef.current, structuresGroupRef.current);

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
  // 2. HANDLE PRESET CAMERA VIEWS (Front, Back, Left, Right, Top, Reset)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!presetView) return;

    if (presetView === 'reset') {
      cameraSphericalRef.current = { radius: 12.0, theta: 0, phi: Math.PI / 2 };
      cameraTargetRef.current.set(0, 1.2, 0);
    } else if (presetView === 'front') {
      cameraSphericalRef.current.theta = 0;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'back') {
      cameraSphericalRef.current.theta = Math.PI;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'left') {
      cameraSphericalRef.current.theta = Math.PI / 2;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'right') {
      cameraSphericalRef.current.theta = -Math.PI / 2;
      cameraSphericalRef.current.phi = Math.PI / 2;
    } else if (presetView === 'top') {
      cameraSphericalRef.current.phi = 0.08;
    }

    onPresetViewHandled();
  }, [presetView, onPresetViewHandled]);

  // --------------------------------------------------------------------------
  // 3. HANDLE CAMERA FOCUS ON SELECTED ORGAN & ISOLATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedStructureId) {
      if (!isIsolated) {
        cameraTargetRef.current.set(0, 1.2, 0);
        cameraSphericalRef.current.radius = 12.0;
      }
      return;
    }

    const structure = ANATOMY_STRUCTURES[selectedStructureId];
    if (!structure) return;

    if (isIsolated) {
      // Focus intimately on isolated organ centered at origin
      cameraTargetRef.current.set(structure.center[0], structure.center[1], structure.center[2]);
      cameraSphericalRef.current.radius = Math.max(structure.cameraFocus.distance * 0.9, 1.8);
    } else {
      // Smoothly track organ in full body context
      cameraTargetRef.current.set(
        structure.cameraFocus.target[0],
        structure.cameraFocus.target[1],
        structure.cameraFocus.target[2]
      );
      cameraSphericalRef.current.radius = Math.max(structure.cameraFocus.distance, 2.0);
    }
  }, [selectedStructureId, isIsolated]);

  // --------------------------------------------------------------------------
  // 4. UPDATE VISIBILITY, HIGHLIGHTS, TRANSPARENCY & ISOLATION IN 3D
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
          // Prominent scientific selection highlight
          mat.emissive.set(struct.accentColor || 0x10B981);
          mat.emissiveIntensity = 0.55;
          mat.opacity = 1.0;
          mat.transparent = false;
        } else if (selectedStructureId && !isIsolated) {
          // Dim non-selected structures into gentle translucent silhouette
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
      internalGroupRef.current.visible = showInternal && !!selectedStructureId;
    }
  }, [selectedStructureId, systemVisibility, systemOpacity, isIsolated, showInternal]);

  // --------------------------------------------------------------------------
  // 5. MOUSE & TOUCH ORBIT / ZOOM / PAN INTERACTIONS
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
      cameraSphericalRef.current.theta -= deltaX * 0.0075;
      cameraSphericalRef.current.phi = THREE.MathUtils.clamp(
        cameraSphericalRef.current.phi - deltaY * 0.0075,
        0.05,
        Math.PI - 0.05
      );
    } else if (isPanningRef.current) {
      // Pan camera target
      const factor = cameraSphericalRef.current.radius * 0.0018;
      cameraTargetRef.current.y += deltaY * factor;
      cameraTargetRef.current.x -= deltaX * factor * Math.cos(cameraSphericalRef.current.theta);
      cameraTargetRef.current.z += deltaX * factor * Math.sin(cameraSphericalRef.current.theta);
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
    cameraSphericalRef.current.radius = THREE.MathUtils.clamp(
      cameraSphericalRef.current.radius + zoomDelta,
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
      cameraSphericalRef.current.radius = THREE.MathUtils.clamp(
        cameraSphericalRef.current.radius + diff * 0.02,
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
      // Find first visible mesh with valid userData
      for (const hit of intersects) {
        if (hit.object.visible && hit.object.userData && (hit.object.userData as MeshUserData).id) {
          const structId = (hit.object.userData as MeshUserData).id;
          onSelectStructure(structId);
          return;
        }
      }
    } else {
      // Clicked on empty space: clear selection
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
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '5px 10px',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            fontSize: '0.78rem',
            color: '#FFFFFF',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ fontWeight: 700 }}>{hoveredStructure.name}</div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'capitalize' }}>
            {hoveredStructure.system} system
          </div>
        </div>
      )}
    </div>
  );
};

type AnatomicalStructurePropsWrapper<T> = T;

// ============================================================================
// 3D PROCEDURAL & ANATOMICAL MESH BUILDER
// Builds accurate, proportional 3D geometries for all anatomical systems
// ============================================================================

function buildAnatomyScene(
  mainGroup: THREE.Group,
  internalGroup: THREE.Group,
  meshMap: Map<string, THREE.Mesh[]>
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
  // SKELETAL SYSTEM (Skull, Spine, Ribcage, Pelvis, Limbs)
  // --------------------------------------------------------------------------
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xE8ECF2,
    roughness: 0.45,
    metalness: 0.08
  });

  // 1. Skull & Mandible (Y: 6.7)
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 6.7, 0.1);

  // Cranium Vault
  const craniumGeo = new THREE.SphereGeometry(0.52, 24, 20);
  craniumGeo.scale(0.85, 1.05, 1.15);
  const cranium = new THREE.Mesh(craniumGeo, boneMat.clone());
  skullGroup.add(cranium);
  registerMesh('skull', cranium, 'skeletal', 'Skull (Cranium)');

  // Facial Skeleton & Orbit Sockets
  const faceGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.45, 16);
  faceGeo.scale(0.9, 1.0, 0.7);
  const face = new THREE.Mesh(faceGeo, boneMat.clone());
  face.position.set(0, -0.35, 0.22);
  skullGroup.add(face);
  registerMesh('skull', face, 'skeletal', 'Facial Bones');

  // Mandible Jaw
  const mandibleGeo = new THREE.TorusGeometry(0.24, 0.06, 12, 16, Math.PI);
  mandibleGeo.rotateX(Math.PI / 2);
  const mandible = new THREE.Mesh(mandibleGeo, boneMat.clone());
  mandible.position.set(0, -0.58, 0.24);
  skullGroup.add(mandible);
  registerMesh('skull', mandible, 'skeletal', 'Mandible Jaw');

  mainGroup.add(skullGroup);

  // 2. Spine / Vertebral Column (Y: 1.0 to 6.2)
  const spinePoints: THREE.Vector3[] = [];
  for (let y = 6.1; y >= 0.2; y -= 0.18) {
    // S-curve: cervical lordosis (+z), thoracic kyphosis (-z), lumbar lordosis (+z)
    let zOffset = 0;
    if (y > 4.8) zOffset = 0.06 * Math.sin(((y - 4.8) / 1.3) * Math.PI); // Cervical
    else if (y > 2.0) zOffset = -0.12 * Math.sin(((y - 2.0) / 2.8) * Math.PI); // Thoracic
    else zOffset = 0.08 * Math.sin((y / 2.0) * Math.PI); // Lumbar

    spinePoints.push(new THREE.Vector3(0, y, -0.15 + zOffset));
  }
  const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
  const spineGeo = new THREE.TubeGeometry(spineCurve, 40, 0.11, 10, false);
  const spine = new THREE.Mesh(spineGeo, boneMat.clone());
  mainGroup.add(spine);
  registerMesh('spine', spine, 'skeletal', 'Vertebral Column');

  // 3. Ribcage & Sternum (Y: 2.0 to 4.2)
  const ribcageGroup = new THREE.Group();
  for (let r = 0; r < 10; r++) {
    const ry = 4.1 - r * 0.21;
    const ribRadius = 0.52 + Math.sin((r / 9) * Math.PI) * 0.32;
    const ribGeo = new THREE.TorusGeometry(ribRadius, 0.026, 8, 24, Math.PI * 1.55);
    ribGeo.rotateX(Math.PI / 2);
    ribGeo.rotateZ(Math.PI * 0.22);
    ribGeo.scale(0.95, 1.0, 0.85);

    const rib = new THREE.Mesh(ribGeo, boneMat.clone());
    rib.position.set(0, ry, 0.08);
    ribcageGroup.add(rib);
    registerMesh('ribcage', rib, 'skeletal', `Rib Pair ${r + 1}`);
  }

  // Sternum
  const sternumGeo = new THREE.BoxGeometry(0.14, 1.4, 0.04);
  const sternum = new THREE.Mesh(sternumGeo, boneMat.clone());
  sternum.position.set(0, 3.1, 0.72);
  ribcageGroup.add(sternum);
  registerMesh('ribcage', sternum, 'skeletal', 'Sternum');
  mainGroup.add(ribcageGroup);

  // 4. Pelvis (Y: -0.2)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, -0.2, 0.05);

  // Left & Right Iliac Wings
  [-0.45, 0.45].forEach((side) => {
    const iliumGeo = new THREE.SphereGeometry(0.42, 16, 12);
    iliumGeo.scale(0.65, 0.95, 0.4);
    const ilium = new THREE.Mesh(iliumGeo, boneMat.clone());
    ilium.position.set(side, 0.15, 0);
    pelvisGroup.add(ilium);
    registerMesh('pelvis', ilium, 'skeletal', 'Pelvis (Ilium)');
  });
  // Pubic Arch
  const pubicGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI);
  pubicGeo.rotateX(Math.PI / 2);
  const pubic = new THREE.Mesh(pubicGeo, boneMat.clone());
  pubic.position.set(0, -0.3, 0.2);
  pelvisGroup.add(pubic);
  registerMesh('pelvis', pubic, 'skeletal', 'Pubic Symphysis');
  mainGroup.add(pelvisGroup);

  // 5. Upper Limbs (Clavicles, Humerus, Radius/Ulna)
  const upperLimbsGroup = new THREE.Group();
  [-1, 1].forEach((side) => {
    // Clavicle
    const clavicleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
    clavicleGeo.rotateZ(side * Math.PI * 0.45);
    const clavicle = new THREE.Mesh(clavicleGeo, boneMat.clone());
    clavicle.position.set(side * 0.45, 4.3, 0.35);
    upperLimbsGroup.add(clavicle);
    registerMesh('limbs_upper', clavicle, 'skeletal', side === -1 ? 'Left Clavicle' : 'Right Clavicle');

    // Humerus (Upper arm)
    const humerusGeo = new THREE.CylinderGeometry(0.075, 0.065, 1.4, 10);
    const humerus = new THREE.Mesh(humerusGeo, boneMat.clone());
    humerus.position.set(side * 1.05, 3.4, 0.1);
    humerus.rotation.z = side * 0.12;
    upperLimbsGroup.add(humerus);
    registerMesh('limbs_upper', humerus, 'skeletal', side === -1 ? 'Left Humerus' : 'Right Humerus');

    // Radius & Ulna (Forearm)
    const forearmGeo = new THREE.CylinderGeometry(0.055, 0.05, 1.3, 8);
    const forearm = new THREE.Mesh(forearmGeo, boneMat.clone());
    forearm.position.set(side * 1.25, 2.0, 0.15);
    forearm.rotation.z = side * 0.08;
    upperLimbsGroup.add(forearm);
    registerMesh('limbs_upper', forearm, 'skeletal', side === -1 ? 'Left Forearm' : 'Right Forearm');

    // Hand digits
    const handGeo = new THREE.BoxGeometry(0.12, 0.35, 0.08);
    const hand = new THREE.Mesh(handGeo, boneMat.clone());
    hand.position.set(side * 1.35, 1.15, 0.18);
    upperLimbsGroup.add(hand);
    registerMesh('limbs_upper', hand, 'skeletal', side === -1 ? 'Left Hand' : 'Right Hand');
  });
  mainGroup.add(upperLimbsGroup);

  // 6. Lower Limbs (Femur, Tibia, Fibula, Feet)
  const lowerLimbsGroup = new THREE.Group();
  [-1, 1].forEach((side) => {
    // Femur (Thigh)
    const femurGeo = new THREE.CylinderGeometry(0.09, 0.08, 2.3, 12);
    const femur = new THREE.Mesh(femurGeo, boneMat.clone());
    femur.position.set(side * 0.45, -1.6, 0.05);
    femur.rotation.z = -side * 0.05;
    lowerLimbsGroup.add(femur);
    registerMesh('limbs_lower', femur, 'skeletal', side === -1 ? 'Left Femur' : 'Right Femur');

    // Patella Kneecap
    const patellaGeo = new THREE.SphereGeometry(0.08, 10, 8);
    patellaGeo.scale(1, 1.2, 0.5);
    const patella = new THREE.Mesh(patellaGeo, boneMat.clone());
    patella.position.set(side * 0.42, -2.8, 0.15);
    lowerLimbsGroup.add(patella);
    registerMesh('limbs_lower', patella, 'skeletal', 'Patella');

    // Tibia & Fibula (Shin & Calf)
    const tibiaGeo = new THREE.CylinderGeometry(0.075, 0.065, 2.2, 10);
    const tibia = new THREE.Mesh(tibiaGeo, boneMat.clone());
    tibia.position.set(side * 0.42, -4.0, 0.08);
    lowerLimbsGroup.add(tibia);
    registerMesh('limbs_lower', tibia, 'skeletal', side === -1 ? 'Left Tibia' : 'Right Tibia');

    // Foot
    const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.55);
    const foot = new THREE.Mesh(footGeo, boneMat.clone());
    foot.position.set(side * 0.42, -5.2, 0.25);
    lowerLimbsGroup.add(foot);
    registerMesh('limbs_lower', foot, 'skeletal', side === -1 ? 'Left Foot' : 'Right Foot');
  });
  mainGroup.add(lowerLimbsGroup);

  // --------------------------------------------------------------------------
  // CARDIOVASCULAR SYSTEM (Heart, Aorta, Vena Cava)
  // --------------------------------------------------------------------------
  // 1. Heart (Conical with Atria and Ventricles)
  const heartMat = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    roughness: 0.38,
    metalness: 0.12
  });
  const heartGeo = new THREE.SphereGeometry(0.38, 20, 16);
  heartGeo.scale(0.85, 1.15, 0.85);
  const heart = new THREE.Mesh(heartGeo, heartMat);
  heart.position.set(-0.15, 2.7, 0.3);
  heart.rotation.z = -0.18; // Apex tilted left
  mainGroup.add(heart);
  registerMesh('heart', heart, 'cardiovascular', 'Heart (Myocardium)');

  // 2. Aorta (Arches up from heart, curves over, descends down spine)
  const aortaPoints = [
    new THREE.Vector3(-0.15, 2.9, 0.3), // Root
    new THREE.Vector3(-0.12, 3.4, 0.25), // Ascending
    new THREE.Vector3(-0.02, 3.55, 0.15), // Arch top
    new THREE.Vector3(0.05, 3.3, 0.05), // Arch descending
    new THREE.Vector3(0.04, 1.5, 0.02), // Thoracic
    new THREE.Vector3(0.02, 0.0, 0.05), // Abdominal
    new THREE.Vector3(0.15, -0.6, 0.08) // Iliac bifurcation
  ];
  const aortaCurve = new THREE.CatmullRomCurve3(aortaPoints);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.065, 10, false);
  const aortaMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35, metalness: 0.1 });
  const aorta = new THREE.Mesh(aortaGeo, aortaMat);
  mainGroup.add(aorta);
  registerMesh('aorta', aorta, 'cardiovascular', 'Aorta & Major Arteries');

  // 3. Vena Cava (SVC & IVC entering right atrium)
  const vcPoints = [
    new THREE.Vector3(0.12, 4.2, 0.12), // Jugular / SVC top
    new THREE.Vector3(0.10, 2.9, 0.22), // SVC entering atrium
    new THREE.Vector3(0.10, 2.5, 0.18), // IVC below heart
    new THREE.Vector3(0.12, 0.2, 0.12), // Abdominal IVC
    new THREE.Vector3(0.18, -0.6, 0.1) // Iliac vein junction
  ];
  const vcCurve = new THREE.CatmullRomCurve3(vcPoints);
  const vcGeo = new THREE.TubeGeometry(vcCurve, 30, 0.07, 10, false);
  const vcMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.35, metalness: 0.1 });
  const venaCava = new THREE.Mesh(vcGeo, vcMat);
  mainGroup.add(venaCava);
  registerMesh('vena_cava', venaCava, 'cardiovascular', 'Vena Cava & Major Veins');

  // --------------------------------------------------------------------------
  // RESPIRATORY SYSTEM (Lungs, Trachea, Diaphragm)
  // --------------------------------------------------------------------------
  const lungMat = new THREE.MeshStandardMaterial({
    color: 0x06B6D4,
    roughness: 0.45,
    metalness: 0.08
  });

  // Right Lung (3 Lobes)
  const rLungGeo = new THREE.SphereGeometry(0.55, 20, 16);
  rLungGeo.scale(0.85, 1.6, 0.8);
  const rLung = new THREE.Mesh(rLungGeo, lungMat.clone());
  rLung.position.set(0.52, 2.8, 0.15);
  mainGroup.add(rLung);
  registerMesh('lungs', rLung, 'respiratory', 'Right Lung (3 Lobes)');

  // Left Lung (2 Lobes with cardiac notch)
  const lLungGeo = new THREE.SphereGeometry(0.52, 20, 16);
  lLungGeo.scale(0.75, 1.55, 0.8);
  const lLung = new THREE.Mesh(lLungGeo, lungMat.clone());
  lLung.position.set(-0.52, 2.8, 0.15);
  mainGroup.add(lLung);
  registerMesh('lungs', lLung, 'respiratory', 'Left Lung (Cardiac Notch)');

  // Trachea & Bronchial Bifurcation
  const tracheaPoints = [
    new THREE.Vector3(0, 4.4, 0.2),
    new THREE.Vector3(0, 3.4, 0.15), // Carina
    new THREE.Vector3(-0.25, 3.1, 0.12) // Left bronchus
  ];
  const tracheaCurve = new THREE.CatmullRomCurve3(tracheaPoints);
  const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 20, 0.06, 10, false);
  const tracheaMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.4 });
  const trachea = new THREE.Mesh(tracheaGeo, tracheaMat);
  mainGroup.add(trachea);
  registerMesh('trachea', trachea, 'respiratory', 'Trachea & Bronchi');

  // Diaphragm Muscle Dome (Y: 1.9)
  const diaphragmGeo = new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
  diaphragmGeo.scale(1.2, 0.45, 0.9);
  const diaphragmMat = new THREE.MeshStandardMaterial({ color: 0xBE123C, roughness: 0.5, side: THREE.DoubleSide });
  const diaphragm = new THREE.Mesh(diaphragmGeo, diaphragmMat);
  diaphragm.position.set(0, 1.9, 0.05);
  mainGroup.add(diaphragm);
  registerMesh('diaphragm', diaphragm, 'respiratory', 'Diaphragm Muscle');

  // --------------------------------------------------------------------------
  // DIGESTIVE SYSTEM (Stomach, Liver, Pancreas, Intestines)
  // --------------------------------------------------------------------------
  // Stomach (J-shaped pouch)
  const stomachGeo = new THREE.TorusGeometry(0.28, 0.15, 14, 20, Math.PI * 1.3);
  stomachGeo.rotateZ(Math.PI * 0.4);
  const stomachMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.42, metalness: 0.08 });
  const stomach = new THREE.Mesh(stomachGeo, stomachMat);
  stomach.position.set(-0.22, 1.6, 0.25);
  mainGroup.add(stomach);
  registerMesh('stomach', stomach, 'digestive', 'Stomach');

  // Liver (Large wedge in right hypochondrium)
  const liverGeo = new THREE.SphereGeometry(0.65, 20, 16);
  liverGeo.scale(1.25, 0.65, 0.85);
  const liverMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.45, metalness: 0.06 });
  const liver = new THREE.Mesh(liverGeo, liverMat);
  liver.position.set(0.35, 1.7, 0.25);
  liver.rotation.z = -0.15;
  mainGroup.add(liver);
  registerMesh('liver', liver, 'digestive', 'Liver');

  // Pancreas (Horizontal lobular gland behind stomach)
  const pancreasGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.65, 10);
  pancreasGeo.rotateZ(Math.PI * 0.42);
  const pancreasMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.5 });
  const pancreas = new THREE.Mesh(pancreasGeo, pancreasMat);
  pancreas.position.set(-0.05, 1.45, 0.08);
  mainGroup.add(pancreas);
  registerMesh('pancreas', pancreas, 'digestive', 'Pancreas');

  // Intestines (Small & Large intestine loops)
  const intestinesGroup = new THREE.Group();
  // Small intestine coils
  const smallIntGeo = new THREE.SphereGeometry(0.55, 16, 12);
  smallIntGeo.scale(0.9, 0.8, 0.65);
  const smallIntMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.5 });
  const smallInt = new THREE.Mesh(smallIntGeo, smallIntMat);
  smallInt.position.set(0, 0.5, 0.22);
  intestinesGroup.add(smallInt);

  // Large intestine colon framing
  const colonPoints = [
    new THREE.Vector3(0.45, 0.0, 0.2), // Cecum
    new THREE.Vector3(0.48, 0.9, 0.2), // Ascending colon
    new THREE.Vector3(0.0, 1.0, 0.25), // Transverse colon
    new THREE.Vector3(-0.48, 0.9, 0.2), // Descending colon
    new THREE.Vector3(-0.35, 0.0, 0.18), // Sigmoid colon
    new THREE.Vector3(0.0, -0.4, 0.08) // Rectum
  ];
  const colonCurve = new THREE.CatmullRomCurve3(colonPoints);
  const colonGeo = new THREE.TubeGeometry(colonCurve, 30, 0.11, 10, false);
  const colonMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.48 });
  const colon = new THREE.Mesh(colonGeo, colonMat);
  intestinesGroup.add(colon);

  mainGroup.add(intestinesGroup);
  registerMesh('intestines', smallInt, 'digestive', 'Small Intestine');
  registerMesh('intestines', colon, 'digestive', 'Large Intestine (Colon)');

  // --------------------------------------------------------------------------
  // NERVOUS SYSTEM (Brain, Spinal Cord)
  // --------------------------------------------------------------------------
  // Brain (Cerebral hemispheres + Cerebellum + Brainstem)
  const brainGroup = new THREE.Group();
  brainGroup.position.set(0, 6.7, 0.1);

  const brainMat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6, roughness: 0.4, metalness: 0.1 });
  // Left and Right Hemispheres
  [-0.14, 0.14].forEach((side) => {
    const hemiGeo = new THREE.SphereGeometry(0.36, 18, 14);
    hemiGeo.scale(0.75, 0.95, 1.15);
    const hemi = new THREE.Mesh(hemiGeo, brainMat.clone());
    hemi.position.set(side, 0.08, 0);
    brainGroup.add(hemi);
    registerMesh('brain', hemi, 'nervous', side === -0.14 ? 'Left Cerebral Hemisphere' : 'Right Cerebral Hemisphere');
  });
  // Cerebellum (Posterior-inferior)
  const cerebGeo = new THREE.SphereGeometry(0.24, 14, 10);
  cerebGeo.scale(1.1, 0.65, 0.85);
  const cereb = new THREE.Mesh(cerebGeo, brainMat.clone());
  cereb.position.set(0, -0.22, -0.2);
  brainGroup.add(cereb);
  registerMesh('brain', cereb, 'nervous', 'Cerebellum');

  // Brainstem
  const stemGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.4, 10);
  const stem = new THREE.Mesh(stemGeo, brainMat.clone());
  stem.position.set(0, -0.38, -0.05);
  brainGroup.add(stem);
  registerMesh('brain', stem, 'nervous', 'Brainstem (Medulla)');

  mainGroup.add(brainGroup);

  // Spinal Cord (Running through vertebral canal)
  const cordPoints = [
    new THREE.Vector3(0, 6.3, -0.05),
    new THREE.Vector3(0, 3.2, -0.16),
    new THREE.Vector3(0, 1.2, -0.12),
    new THREE.Vector3(0, 0.2, -0.05) // Conus medullaris
  ];
  const cordCurve = new THREE.CatmullRomCurve3(cordPoints);
  const cordGeo = new THREE.TubeGeometry(cordCurve, 24, 0.045, 8, false);
  const cordMat = new THREE.MeshStandardMaterial({ color: 0xA78BFA, roughness: 0.45 });
  const spinalCord = new THREE.Mesh(cordGeo, cordMat);
  mainGroup.add(spinalCord);
  registerMesh('spinal_cord', spinalCord, 'nervous', 'Spinal Cord & Major Nerves');

  // --------------------------------------------------------------------------
  // URINARY SYSTEM (Kidneys, Bladder, Ureters)
  // --------------------------------------------------------------------------
  const kidneyMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.42, metalness: 0.08 });
  [-1, 1].forEach((side) => {
    // Bean-shaped kidney
    const kGeo = new THREE.SphereGeometry(0.22, 16, 12);
    kGeo.scale(0.7, 1.2, 0.65);
    const kidney = new THREE.Mesh(kGeo, kidneyMat.clone());
    // Right kidney is slightly lower due to liver
    const ky = side === 1 ? 1.7 : 1.9;
    kidney.position.set(side * 0.42, ky, -0.15);
    kidney.rotation.z = side * 0.15;
    mainGroup.add(kidney);
    registerMesh('kidneys', kidney, 'urinary', side === -1 ? 'Left Kidney' : 'Right Kidney');

    // Ureter tube descending to bladder
    const ureterPoints = [
      new THREE.Vector3(side * 0.38, ky - 0.1, -0.12),
      new THREE.Vector3(side * 0.22, 0.4, 0.05),
      new THREE.Vector3(side * 0.12, -0.5, 0.18)
    ];
    const uCurve = new THREE.CatmullRomCurve3(ureterPoints);
    const uGeo = new THREE.TubeGeometry(uCurve, 16, 0.02, 6, false);
    const ureter = new THREE.Mesh(uGeo, kidneyMat.clone());
    mainGroup.add(ureter);
    registerMesh('bladder', ureter, 'urinary', 'Ureter');
  });

  // Urinary Bladder (Pelvic floor)
  const bladderGeo = new THREE.SphereGeometry(0.24, 16, 12);
  bladderGeo.scale(1.0, 0.85, 0.95);
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

  // Pectoralis Major (Chest fans)
  [-0.35, 0.35].forEach((side) => {
    const pecGeo = new THREE.SphereGeometry(0.38, 14, 10);
    pecGeo.scale(1.1, 0.65, 0.35);
    const pec = new THREE.Mesh(pecGeo, muscleMat.clone());
    pec.position.set(side, 3.4, 0.62);
    mainGroup.add(pec);
    registerMesh('muscles_core', pec, 'muscular', 'Pectoralis Major');
  });

  // Rectus Abdominis (Six-pack core)
  const absGeo = new THREE.BoxGeometry(0.48, 1.4, 0.15);
  const abs = new THREE.Mesh(absGeo, muscleMat.clone());
  abs.position.set(0, 1.8, 0.6);
  mainGroup.add(abs);
  registerMesh('muscles_core', abs, 'muscular', 'Rectus Abdominis');

  // Deltoids (Shoulders)
  [-1.05, 1.05].forEach((side) => {
    const deltGeo = new THREE.SphereGeometry(0.28, 12, 10);
    deltGeo.scale(0.85, 1.15, 0.95);
    const delt = new THREE.Mesh(deltGeo, muscleMat.clone());
    delt.position.set(side, 4.0, 0.2);
    mainGroup.add(delt);
    registerMesh('muscles_core', delt, 'muscular', 'Deltoid Muscle');
  });

  // Quadriceps Femoris (Anterior thighs)
  [-0.45, 0.45].forEach((side) => {
    const quadGeo = new THREE.CylinderGeometry(0.18, 0.14, 2.0, 10);
    const quad = new THREE.Mesh(quadGeo, muscleMat.clone());
    quad.position.set(side, -1.6, 0.16);
    mainGroup.add(quad);
    registerMesh('muscles_core', quad, 'muscular', 'Quadriceps Femoris');
  });

  // --------------------------------------------------------------------------
  // ENDOCRINE SYSTEM (Thyroid, Pituitary, Adrenal Glands)
  // --------------------------------------------------------------------------
  const endoMat = new THREE.MeshStandardMaterial({ color: 0xEC4899, roughness: 0.4 });

  // Thyroid Gland (Butterfly on anterior trachea)
  const thyroidGeo = new THREE.TorusGeometry(0.14, 0.05, 10, 16, Math.PI * 1.2);
  thyroidGeo.rotateZ(Math.PI * 0.4);
  const thyroid = new THREE.Mesh(thyroidGeo, endoMat.clone());
  thyroid.position.set(0, 4.1, 0.28);
  mainGroup.add(thyroid);
  registerMesh('endocrine_glands', thyroid, 'endocrine', 'Thyroid Gland');

  // Adrenal Glands (Triangular caps atop kidneys)
  [-1, 1].forEach((side) => {
    const adrenalGeo = new THREE.ConeGeometry(0.1, 0.12, 6);
    const adrenal = new THREE.Mesh(adrenalGeo, endoMat.clone());
    const ay = side === 1 ? 2.05 : 2.25;
    adrenal.position.set(side * 0.42, ay, -0.15);
    mainGroup.add(adrenal);
    registerMesh('endocrine_glands', adrenal, 'endocrine', 'Adrenal Gland (Suprarenal)');
  });

  // --------------------------------------------------------------------------
  // INTERNAL STRUCTURES (Activated when showInternal is true)
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

  // Left Ventricle Thick Cavity
  const lvCavityGeo = new THREE.SphereGeometry(0.18, 14, 12);
  lvCavityGeo.scale(0.8, 1.2, 0.8);
  const lvMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35 });
  const lv = new THREE.Mesh(lvCavityGeo, lvMat);
  lv.position.set(-0.08, -0.06, 0.05);
  heartIntGroup.add(lv);

  // Right Ventricle Cavity
  const rvCavityGeo = new THREE.SphereGeometry(0.16, 14, 12);
  rvCavityGeo.scale(0.75, 1.0, 0.75);
  const rvMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.35 });
  const rv = new THREE.Mesh(rvCavityGeo, rvMat);
  rv.position.set(0.10, -0.04, 0.08);
  heartIntGroup.add(rv);

  // Interventricular Septum Wall
  const sepGeo = new THREE.BoxGeometry(0.05, 0.45, 0.3);
  const sepMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.4 });
  const sep = new THREE.Mesh(sepGeo, sepMat);
  sep.position.set(0.01, -0.05, 0.06);
  heartIntGroup.add(sep);

  // Mitral & Tricuspid Valves (Ring fibers)
  const valveGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16);
  valveGeo.rotateX(Math.PI / 2);
  const valveMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.2 });

  const mitral = new THREE.Mesh(valveGeo, valveMat);
  mitral.position.set(-0.08, 0.12, 0.04);
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
    new THREE.Vector3(0, 0.18, -0.1),
    new THREE.Vector3(0, 0.18, 0.15),
    new THREE.Vector3(0, -0.05, 0.22)
  );
  const ccGeo = new THREE.TubeGeometry(ccCurve, 20, 0.035, 8, false);
  const ccMat = new THREE.MeshStandardMaterial({ color: 0xEDE9FE, roughness: 0.3 });
  const cc = new THREE.Mesh(ccGeo, ccMat);
  brainIntGroup.add(cc);

  // Thalamus Egg
  const thalGeo = new THREE.SphereGeometry(0.12, 12, 10);
  thalGeo.scale(0.8, 1.1, 1.2);
  const thalMat = new THREE.MeshStandardMaterial({ color: 0xC4B5FD, roughness: 0.35 });
  const thal = new THREE.Mesh(thalGeo, thalMat);
  thal.position.set(0, -0.02, 0.02);
  brainIntGroup.add(thal);

  group.add(brainIntGroup);
}

// ----------------------------------------------------------------------------
// ANIMATED PROCESS PARTICLES (Blood Flow, etc.)
// ----------------------------------------------------------------------------
function setupBloodFlowParticles(
  group: THREE.Group,
  particlesRef: React.MutableRefObject<{ mesh: THREE.Points; speeds: Float32Array; originalPositions: Float32Array } | null>
) {
  const count = 350;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribute particles along cardiovascular pathways
    const isArterial = Math.random() > 0.45;

    let x = (Math.random() - 0.5) * 0.4;
    let y = 1.0 + Math.random() * 3.5;
    let z = (Math.random() - 0.5) * 0.3 + 0.15;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Red for arterial O2 blood, blue for venous deoxygenated return
    if (isArterial) {
      colors[i * 3] = 0.95;
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.2;
    } else {
      colors[i * 3] = 0.2;
      colors[i * 3 + 1] = 0.4;
      colors[i * 3 + 2] = 0.95;
    }

    speeds[i] = 0.8 + Math.random() * 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const pointsMesh = new THREE.Points(geometry, material);
  group.add(pointsMesh);

  particlesRef.current = {
    mesh: pointsMesh,
    speeds,
    originalPositions: new Float32Array(positions)
  };
}

function renderDynamicProcesses(
  delta: number,
  isPlaying: boolean,
  speed: number,
  particles: { mesh: THREE.Points; speeds: Float32Array; originalPositions: Float32Array } | null,
  structuresGroup: THREE.Group | null
) {
  if (!isPlaying || !particles) return;

  // 1. Animate blood particles downward/upward through vessels
  const posAttr = particles.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = posAttr.array as Float32Array;
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const spd = particles.speeds[i] * speed * delta * 2.5;
    positions[i * 3 + 1] -= spd;

    // Reset when exiting vascular bounds
    if (positions[i * 3 + 1] < -0.8) {
      positions[i * 3 + 1] = 4.2;
    }
  }
  posAttr.needsUpdate = true;

  // 2. Subtle rhythmic cardiac pulsation on heart mesh
  if (structuresGroup) {
    const heartMesh = structuresGroup.children.find(c => c.userData?.id === 'heart');
    if (heartMesh) {
      const pulseTime = Date.now() * 0.006 * speed;
      const beat = Math.sin(pulseTime);
      const scale = 1.0 + (beat > 0.6 ? 0.06 * Math.sin((beat - 0.6) * 7.5) : 0);
      heartMesh.scale.set(scale, scale, scale);
    }
  }
}
