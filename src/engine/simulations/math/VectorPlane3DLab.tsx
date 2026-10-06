import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Compass } from 'lucide-react';

export const VectorPlane3DLab: React.FC = () => {
  // Vector u components (Cyan)
  const [ux, setUx] = useState(3);
  const [uy, setUy] = useState(2);
  const [uz, setUz] = useState(1);

  // Vector v components (Orange)
  const [vx, setVx] = useState(1);
  const [vy, setVy] = useState(3);
  const [vz, setVz] = useState(-2);

  // Toggles
  const [showSum, setShowSum] = useState(true);
  const [showCrossProduct, setShowCrossProduct] = useState(true);
  const [showSpannedPlane, setShowSpannedPlane] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Mathematical calculations
  const mathResults = useMemo(() => {
    const magU = Math.hypot(ux, uy, uz);
    const magV = Math.hypot(vx, vy, vz);

    // Dot product
    const dot = ux * vx + uy * vy + uz * vz;

    // Angle theta
    const cosTheta = (magU > 0 && magV > 0) ? Math.max(-1, Math.min(1, dot / (magU * magV))) : 1;
    const thetaRad = Math.acos(cosTheta);
    const thetaDeg = Math.round((thetaRad * 180) / Math.PI * 10) / 10;

    // Cross product n = u x v
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const magN = Math.hypot(nx, ny, nz);

    // Vector addition u + v
    const sumX = ux + vx;
    const sumY = uy + vy;
    const sumZ = uz + vz;

    // Projection of u onto v
    const projScale = magV > 0.001 ? dot / (magV * magV) : 0;
    const projX = vx * projScale;
    const projY = vy * projScale;
    const projZ = vz * projScale;

    return {
      magU: Math.round(magU * 100) / 100,
      magV: Math.round(magV * 100) / 100,
      dot: Math.round(dot * 100) / 100,
      thetaDeg,
      cross: { x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10, z: Math.round(nz * 10) / 10 },
      magN: Math.round(magN * 100) / 100,
      sum: { x: sumX, y: sumY, z: sumZ },
      proj: { x: Math.round(projX * 10) / 10, y: Math.round(projY * 10) / 10, z: Math.round(projZ * 10) / 10 }
    };
  }, [ux, uy, uz, vx, vy, vz]);

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 7, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    // 3D Coordinate Grid & Axes
    const gridXY = new THREE.GridHelper(14, 14, 0x475569, 0x1e293b);
    gridXY.position.y = 0;
    scene.add(gridXY);

    const axesHelper = new THREE.AxesHelper(6);
    scene.add(axesHelper);

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    groupRef.current = dynamicGroup;

    // Interactive Drag to Orbit Camera
    let isPointerDown = false;
    let prevX = 0;
    let prevY = 0;
    let camRadius = 15;
    let camTheta = 0.8;
    let camPhi = 0.7;

    const updateCamPos = () => {
      camera.position.x = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
      camera.position.y = camRadius * Math.cos(camPhi);
      camera.position.z = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
      camera.lookAt(0, 0, 0);
    };
    updateCamPos();

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      camTheta -= dx * 0.008;
      camPhi = Math.max(0.1, Math.min(Math.PI - 0.1, camPhi - dy * 0.008));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamPos();
    };

    const onPointerUp = () => { isPointerDown = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camRadius = Math.max(5, Math.min(30, camRadius + e.deltaY * 0.015));
      updateCamPos();
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animId: number;
    const animate = () => {
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
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Update dynamic 3D vectors and plane geometry whenever components change
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous vector meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const origin = new THREE.Vector3(0, 0, 0);

    // 1. Vector u (Cyan)
    const vecU = new THREE.Vector3(ux, uy, uz);
    const lenU = vecU.length();
    if (lenU > 0.01) {
      const arrowU = new THREE.ArrowHelper(vecU.clone().normalize(), origin, lenU, 0x06b6d4, 0.45, 0.25);
      group.add(arrowU);
    }

    // 2. Vector v (Orange)
    const vecV = new THREE.Vector3(vx, vy, vz);
    const lenV = vecV.length();
    if (lenV > 0.01) {
      const arrowV = new THREE.ArrowHelper(vecV.clone().normalize(), origin, lenV, 0xf97316, 0.45, 0.25);
      group.add(arrowV);
    }

    // 3. Vector Sum u + v (Parallelogram rule in Yellow)
    if (showSum && lenU > 0.01 && lenV > 0.01) {
      const vecSum = new THREE.Vector3(ux + vx, uy + vy, uz + vz);
      const lenSum = vecSum.length();
      if (lenSum > 0.01) {
        const arrowSum = new THREE.ArrowHelper(vecSum.clone().normalize(), origin, lenSum, 0xfacc15, 0.5, 0.3);
        group.add(arrowSum);

        // Dashed lines forming parallelogram
        const dashedMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.3, gapSize: 0.2 });
        const geom1 = new THREE.BufferGeometry().setFromPoints([vecU, vecSum]);
        const line1 = new THREE.Line(geom1, dashedMat);
        line1.computeLineDistances();
        group.add(line1);

        const geom2 = new THREE.BufferGeometry().setFromPoints([vecV, vecSum]);
        const line2 = new THREE.Line(geom2, dashedMat);
        line2.computeLineDistances();
        group.add(line2);
      }
    }

    // 4. Cross Product Vector n = u x v (Orthogonal Normal in Green)
    if (showCrossProduct && lenU > 0.01 && lenV > 0.01) {
      const vecCross = new THREE.Vector3().crossVectors(vecU, vecV);
      const lenCross = vecCross.length();
      if (lenCross > 0.01) {
        // Scaled helper
        const displayLen = Math.min(8, lenCross * 0.7);
        const arrowN = new THREE.ArrowHelper(vecCross.clone().normalize(), origin, displayLen, 0x22c55e, 0.55, 0.3);
        group.add(arrowN);
      }
    }

    // 5. Plane Spanned by u and v (Translucent polygon)
    if (showSpannedPlane && lenU > 0.01 && lenV > 0.01) {
      const planeGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        ux * 1.5, uy * 1.5, uz * 1.5,
        (ux + vx) * 1.5, (uy + vy) * 1.5, (uz + vz) * 1.5,

        0, 0, 0,
        (ux + vx) * 1.5, (uy + vy) * 1.5, (uz + vz) * 1.5,
        vx * 1.5, vy * 1.5, vz * 1.5
      ]);
      planeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      planeGeo.computeVertexNormals();

      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      group.add(planeMesh);
    }
  }, [ux, uy, uz, vx, vy, vz, showSum, showCrossProduct, showSpannedPlane]);

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
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid #a855f7',
              color: '#c084fc',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Compass size={13} />
            <span>FLAGSHIP MATHEMATICS LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            3D Vector Operations, Dot Product, Cross Product &amp; Spanned Planes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowSum(!showSum)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showSum ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showSum ? '#facc15' : 'rgba(255,255,255,0.1)'}`,
              color: showSum ? '#facc15' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sum (u + v) {showSum ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowCrossProduct(!showCrossProduct)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showCrossProduct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showCrossProduct ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
              color: showCrossProduct ? '#22c55e' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Normal (u × v) {showCrossProduct ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowSpannedPlane(!showSpannedPlane)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showSpannedPlane ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showSpannedPlane ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              color: showSpannedPlane ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Plane {showSpannedPlane ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Vector Input Panel */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 290,
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
            gap: 12
          }}
        >
          {/* Vector u Inputs (Cyan) */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#06b6d4', marginBottom: 6 }}>
              VECTOR u = ({ux}, {uy}, {uz}) • |u| = {mathResults.magU}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>X: {ux}</span>
                <input type="range" min={-5} max={5} value={ux} onChange={e => setUx(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Y: {uy}</span>
                <input type="range" min={-5} max={5} value={uy} onChange={e => setUy(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Z: {uz}</span>
                <input type="range" min={-5} max={5} value={uz} onChange={e => setUz(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
            </div>
          </div>

          {/* Vector v Inputs (Orange) */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#f97316', marginBottom: 6 }}>
              VECTOR v = ({vx}, {vy}, {vz}) • |v| = {mathResults.magV}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>X: {vx}</span>
                <input type="range" min={-5} max={5} value={vx} onChange={e => setVx(Number(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Y: {vy}</span>
                <input type="range" min={-5} max={5} value={vy} onChange={e => setVy(Number(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Z: {vz}</span>
                <input type="range" min={-5} max={5} value={vz} onChange={e => setVz(Number(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
              </div>
            </div>
          </div>

          {/* Real-time 3D Math Results */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>DOT PRODUCT u · v:</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                {mathResults.dot} (u · v = |u||v| cos θ)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ANGLE BETWEEN VECTORS θ:</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                {mathResults.thetaDeg}° {mathResults.thetaDeg === 90 ? '⚡ ORTHOGONAL' : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>CROSS PRODUCT u × v:</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#22c55e', fontFamily: 'monospace' }}>
                ({mathResults.cross.x}, {mathResults.cross.y}, {mathResults.cross.z}) • Mag: {mathResults.magN}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PLANE SPANNED EQUATION:</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>
                {mathResults.cross.x}x + {mathResults.cross.y}y + {mathResults.cross.z}z = 0
              </div>
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', cursor: 'grab' }}
          title="Drag to orbit in 3D • Scroll to zoom"
        />

        {/* 3D Navigation Tip */}
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
          🖱 Left Click + Drag to Orbit • Scroll to Zoom
        </div>
      </div>
    </div>
  );
};
