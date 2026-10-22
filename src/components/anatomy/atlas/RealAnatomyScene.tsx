import { useEffect, useRef } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createExplosionLayout } from './explosion-layout';
import { decodeModelResponse } from './model-download';
import { PointerTap } from './pointer-tap';
import { SYSTEMS, type Atlas, type SceneState, type View } from './anatomy';

export interface RealAnatomySceneProps {
  atlas: Atlas;
  state: SceneState;
  onSelect: (id: string) => void;
  onProgress: (percent: number) => void;
  onError: (error: string) => void;
  onHover?: (name: string | null) => void;
  onVisibleCountChange?: (count: number) => void;
  zoomTrigger?: number; // increments to trigger zoom in/out
  zoomDirection?: 'in' | 'out' | null;
}

export function RealAnatomyScene({
  atlas,
  state,
  onSelect,
  onProgress,
  onError,
  onHover,
  onVisibleCountChange,
  zoomTrigger = 0,
  zoomDirection = null
}: RealAnatomySceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(state);
  const select = useRef(onSelect);
  const hoverCb = useRef(onHover);
  const visibleCountCb = useRef(onVisibleCountChange);
  const controlsRef = useRef<OrbitControls | null>(null);

  latest.current = state;
  select.current = onSelect;
  hoverCb.current = onHover;
  visibleCountCb.current = onVisibleCountChange;

  // Handle manual zoom triggers (+ / - buttons)
  useEffect(() => {
    if (!controlsRef.current || !zoomDirection || zoomTrigger === 0) return;
    const controls = controlsRef.current;
    const camera = controls.object as T.PerspectiveCamera;
    const offset = camera.position.clone().sub(controls.target);
    const factor = zoomDirection === 'in' ? 0.8 : 1.25;
    offset.multiplyScalar(factor);
    if (offset.length() >= controls.minDistance && offset.length() <= controls.maxDistance) {
      camera.position.copy(controls.target).add(offset);
      controls.update();
    }
  }, [zoomTrigger, zoomDirection]);

  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    let disposed = false;
    let frame = 0;
    let dirty = true;
    let ready = false;
    let lastView = '';
    let lastReset = -1;
    let lastIsolate = '';
    let layoutKey = '';
    let amount = 0;
    let lastState: SceneState | null = null;
    const abort = new AbortController();

    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      onError('This browser could not start the 3D viewer. Please verify WebGL is supported.');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setClearColor('#080D1A'); // Clinical deep slate matching Astra AI
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and click a structure to inspect it.'
    );

    const scene = new T.Scene();
    scene.background = new T.Color(0x080D1A);

    const camera = new T.PerspectiveCamera(34, el.clientWidth / el.clientHeight, 0.005, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    camera.position.set(1.4, 1.05, 3.6);
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.minDistance = 0.07;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.96;
    controls.addEventListener('change', () => {
      dirty = true;
    });

    const pmrem = new T.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();

    // Medical PBR Lighting Rig
    scene.add(new T.HemisphereLight(0xffffff, 0x1e293b, 1.15));
    const keyLight = new T.DirectionalLight(0xfffaf4, 2.5);
    keyLight.position.set(-2, 4, 3);
    scene.add(keyLight);

    const rimLight = new T.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(2, 2, -3);
    scene.add(rimLight);

    // Anatomical studio platform (sleek slate pedestal)
    const ground = new T.Mesh(
      new T.CircleGeometry(30, 96),
      new T.MeshStandardMaterial({ color: 0x070c18, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.019;
    scene.add(ground);

    const platform = new T.Mesh(
      new T.CylinderGeometry(0.68, 0.7, 0.028, 100),
      new T.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.15, roughness: 0.6 })
    );
    platform.position.y = -0.016;
    scene.add(platform);

    const ring = new T.Mesh(
      new T.RingGeometry(0.63, 0.634, 128),
      new T.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45, side: T.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    scene.add(ring);

    const innerRing = new T.Mesh(
      new T.RingGeometry(0.38, 0.383, 96),
      new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, side: T.DoubleSide })
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.001;
    scene.add(innerRing);

    // Model Geometry & Shader Textures
    const width = Math.max(1, atlas.parts.length);
    const data = new Float32Array(width * 4);
    const selectedData = new Uint8Array(width * 4);
    const partTexture = new T.DataTexture(data, width, 1, T.RGBAFormat, T.FloatType);
    const selectionTexture = new T.DataTexture(selectedData, width, 1, T.RGBAFormat, T.UnsignedByteType);
    partTexture.minFilter = selectionTexture.minFilter = T.NearestFilter;
    partTexture.magFilter = selectionTexture.magFilter = T.NearestFilter;

    const bounds = atlas.parts.map(
      (p) => new T.Box3(new T.Vector3(...p.bounds[0]), new T.Vector3(...p.bounds[1]))
    );
    const centers = bounds.map((b) => b.getCenter(new T.Vector3()));
    const offsets = centers.map((c) => c.clone());
    let packingWidth = 1;
    let packingHeight = 1;

    const pickers: (T.Mesh | undefined)[] = [];
    const geometries: T.BufferGeometry[] = [];
    const materials: T.Material[] = [];

    // Exploded View Label Markers
    const markerPositions = new Float32Array(width * 3).fill(10000);
    const markerGeometry = new T.BufferGeometry();
    markerGeometry.setAttribute('position', new T.BufferAttribute(markerPositions, 3));
    const markerMaterial = new T.PointsMaterial({
      color: 0x10b981,
      size: 5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8
    });
    const markers = new T.Points(markerGeometry, markerMaterial);
    markers.frustumCulled = false;
    markers.renderOrder = 10;
    markers.visible = false;
    scene.add(markers);

    // Hover Tooltip Element
    const hover = document.createElement('div');
    hover.className = 'physora-atlas-hover';
    hover.setAttribute('role', 'tooltip');
    hover.style.position = 'absolute';
    hover.style.pointerEvents = 'none';
    hover.style.zIndex = '50';
    hover.style.background = 'rgba(15, 23, 42, 0.94)';
    hover.style.border = '1px solid rgba(16, 185, 129, 0.4)';
    hover.style.color = '#F8FAFC';
    hover.style.padding = '5px 12px';
    hover.style.borderRadius = '8px';
    hover.style.fontSize = '0.78rem';
    hover.style.fontWeight = '700';
    hover.style.backdropFilter = 'blur(10px)';
    hover.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
    hover.style.transition = 'opacity 0.1s ease';
    hover.hidden = true;
    el.appendChild(hover);

    type Target = { index: number; x: number; y: number; left: number; right: number; top: number; bottom: number };
    let targets: Target[] = [];
    const projected = new T.Vector3();

    const findTarget = (x: number, y: number, radius: number) => {
      let best = -1;
      let score = Infinity;
      for (const t of targets) {
        const dx = Math.max(t.left - x, 0, x - t.right);
        const dy = Math.max(t.top - y, 0, y - t.bottom);
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const candidate = distance + Math.hypot(t.x - x, t.y - y) * 0.025;
        if (candidate < score) {
          score = candidate;
          best = t.index;
        }
      }
      return best;
    };

    // PBR Shader Injection per Anatomical System
    const materialFor = (system: string) => {
      const isSkin = system === 'integumentary';
      const m = new T.MeshStandardMaterial({
        color: SYSTEMS.find((s) => s.id === system)?.color ?? '#aebbb8',
        metalness: isSkin ? 0.02 : 0.08,
        roughness: isSkin ? 0.55 : 0.5,
        side: T.DoubleSide,
        transparent: isSkin,
        opacity: isSkin ? 0.12 : 1,
        depthWrite: !isSkin
      });

      m.onBeforeCompile = (shader) => {
        shader.uniforms.partState = { value: partTexture };
        shader.uniforms.selectionState = { value: selectionTexture };
        shader.uniforms.stateWidth = { value: width };

        shader.vertexShader =
          'attribute float partIndex;\n' +
          'uniform sampler2D partState;\n' +
          'uniform sampler2D selectionState;\n' +
          'uniform float stateWidth;\n' +
          'varying float partVisible;\n' +
          'varying float partSelected;\n' +
          shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n' +
            'vec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5);\n' +
            'vec4 state = texture2D(partState, stateUv);\n' +
            'transformed += state.xyz;\n' +
            'partVisible = state.w;\n' +
            'partSelected = texture2D(selectionState, stateUv).r;\n'
        );

        shader.fragmentShader =
          'varying float partVisible;\n' +
          'varying float partSelected;\n' +
          shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <clipping_planes_fragment>',
          '#include <clipping_planes_fragment>\n' +
            'if (partVisible < 0.5) discard;\n'
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n' +
            'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.2, 0.95, 0.75), partSelected * 0.8);\n'
        );
      };

      materials.push(m);
      return m;
    };

    const mats = new Map(SYSTEMS.map((s) => [s.id, materialFor(s.id)]));
    let loaded = 0;

    // Load geometry chunk
    const loadChunk = async (ci: number) => {
      const chunk = atlas.chunks[ci];
      const compressed = !!chunk.gzip && typeof DecompressionStream !== 'undefined';
      const response = await fetch(compressed ? chunk.gzip! : chunk.url, { signal: abort.signal });
      const buffer = await decodeModelResponse(response, chunk.bytes, compressed);
      if (disposed) return;

      const groups = new Map<string, T.BufferGeometry[]>();
      atlas.parts.forEach((p, i) => {
        if (p.chunk !== ci) return;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, p.positions, p.vertexCount * 3), 3));
        g.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, p.normals, p.vertexCount * 3), 3, true));
        g.setIndex(new T.BufferAttribute(new Uint32Array(buffer, p.indices, p.indexCount), 1));
        g.boundingBox = bounds[i].clone();
        g.computeBoundingSphere();

        const pick = new T.Mesh(g);
        pick.matrixAutoUpdate = false;
        pickers[i] = pick;
        geometries.push(g);

        g.setAttribute('partIndex', new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i), 1));
        const list = groups.get(p.system) ?? [];
        list.push(g);
        groups.set(p.system, list);
      });

      groups.forEach((gs, system) => {
        const geometry = mergeGeometries(gs, false);
        if (!geometry) throw new Error('Could not assemble anatomy geometry.');
        geometries.push(geometry);
        const mesh = new T.Mesh(geometry, mats.get(system as never));
        mesh.frustumCulled = false;
        scene.add(mesh);
      });

      lastState = null;
      loaded++;
      onProgress(Math.round((loaded / atlas.chunks.length) * 100));
      dirty = true;
    };

    // Parallel load with concurrency of 3
    (async () => {
      try {
        let cursor = 0;
        await Promise.all(
          Array.from({ length: 3 }, async () => {
            while (cursor < atlas.chunks.length) {
              const i = cursor++;
              await loadChunk(i);
            }
          })
        );
        if (!disposed) {
          ready = true;
          dirty = true;
        }
      } catch (e) {
        if (!disposed) {
          onError(e instanceof Error ? e.message : 'Could not load the anatomy atlas.');
        }
      }
    })();

    // Camera Fitting Logic
    const fit = (view: View | string, extent = 0) => {
      const mobile = el.clientWidth < 768;
      const normalDistance = mobile
        ? Math.max(4.5, (1.8 * el.clientHeight) / Math.max(160, el.clientHeight - 350) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2))))
        : 4.0;
      const reservedHeight = mobile ? 350 : 270;
      const availableAspect = Math.max(0.35, (el.clientWidth - (mobile ? 40 : 340)) / Math.max(160, el.clientHeight - reservedHeight));
      const atlasDistance =
        (Math.max(packingHeight, packingWidth / availableAspect) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
        (el.clientHeight / Math.max(160, el.clientHeight - reservedHeight)) *
        1.08;
      const distance = T.MathUtils.lerp(normalDistance, Math.max(0.2, atlasDistance), extent);
      if (extent > 0.8) view = 'front';

      const direction =
        view === 'front'
          ? new T.Vector3(0, 0.02, 1)
          : view === 'back'
          ? new T.Vector3(0, 0.02, -1)
          : view === 'side'
          ? new T.Vector3(1, 0.02, 0)
          : new T.Vector3(0.35, 0.06, 1).normalize();

      controls.target.set(extent > 0.1 && el.clientWidth > 767 ? -packingWidth * 0.12 : 0, extent > 0.1 || mobile ? 0.85 : 0.68, 0);
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      controls.update();
      dirty = true;
    };

    const resize = () => {
      layoutKey = '';
      lastState = null;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, el.clientWidth < 768 || el.clientHeight < 600 ? 1.5 : 2));
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit(latest.current.view, amount);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);

    // Pointer Interaction (Tap vs Orbit vs Hover)
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    const tap = new PointerTap();
    const worldBox = new T.Box3();
    const hitPoint = new T.Vector3();

    const down = (e: PointerEvent) => {
      hover.hidden = true;
      tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 12 : 5);
    };

    const move = (e: PointerEvent) => {
      tap.move(e.pointerId, e.clientX, e.clientY);
      if (e.buttons || amount < 0.5 || e.pointerType === 'touch') {
        hover.hidden = true;
        if (hoverCb.current) hoverCb.current(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const index = findTarget(x, y, 12);
      hover.hidden = index < 0;
      renderer.domElement.style.cursor = index < 0 ? 'grab' : 'pointer';
      if (index >= 0) {
        const partName = atlas.parts[index].name;
        hover.textContent = partName;
        hover.style.left = `${Math.max(8, Math.min(x + 14, el.clientWidth - 260))}px`;
        hover.style.top = `${Math.max(8, Math.min(y + 18, el.clientHeight - 55))}px`;
        if (hoverCb.current) hoverCb.current(partName);
      } else {
        if (hoverCb.current) hoverCb.current(null);
      }
    };

    const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);

    const up = (e: PointerEvent) => {
      const validTap = tap.up(e.pointerId, e.clientX, e.clientY);
      if (!validTap || !ready) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);

      let nearest = Infinity;
      let found = -1;
      const hasSolid = atlas.parts.some((p, i) => p.system !== 'integumentary' && data[i * 4 + 3] > 0.5);

      pickers.forEach((mesh, i) => {
        if (!mesh || data[i * 4 + 3] < 0.5 || (hasSolid && atlas.parts[i].system === 'integumentary')) return;
        worldBox.copy(bounds[i]).translate(mesh.position);
        if (!raycaster.ray.intersectBox(worldBox, hitPoint)) return;
        const hits = raycaster.intersectObject(mesh, false);
        if (hits[0] && hits[0].distance < nearest) {
          nearest = hits[0].distance;
          found = i;
        }
      });

      if (found < 0 && amount > 0.45) {
        found = findTarget(e.clientX - rect.left, e.clientY - rect.top, e.pointerType === 'touch' ? 24 : 16);
      }

      if (found >= 0) {
        hover.hidden = true;
        select.current(atlas.parts[found].id);
      }
    };

    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);

    const clock = new T.Clock();
    let lastExtent = -1;

    // Render & Animation Loop
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const s = latest.current;

      const changed =
        lastState?.visible !== s.visible ||
        lastState?.selected !== s.selected ||
        lastState?.isolate !== s.isolate;

      const moving = Math.abs(amount - s.explode) > 0.0001;
      if (moving) {
        amount = T.MathUtils.damp(amount, s.explode, 8, dt);
        dirty = true;
      }

      if (changed || moving || lastExtent < 0) {
        const visible = new Set(s.visible);
        const selection = new Set(s.selected);
        const visibleParts = atlas.parts.filter((p) =>
          s.isolate ? selection.has(p.id) : visible.has(p.system) || selection.has(p.id)
        );

        if (visibleCountCb.current) {
          visibleCountCb.current(visibleParts.length);
        }

        const nextLayoutKey = visibleParts.map((p) => p.id).join(',') + ':' + camera.aspect.toFixed(3);
        if (nextLayoutKey !== layoutKey) {
          const layout = createExplosionLayout(visibleParts, camera.aspect);
          packingWidth = layout.width;
          packingHeight = layout.height;
          atlas.parts.forEach((p, i) => {
            const cell = layout.cells.get(p.id);
            offsets[i] = cell ? new T.Vector3(cell.x, cell.y + 0.85, 0) : centers[i].clone();
          });
          layoutKey = nextLayoutKey;
          if (amount > 0.05 && !s.isolate) fit(s.view, Math.max(0, (amount - 0.3) / 0.7));
        }

        // Compute 3D translation for each structure based on explode amount
        atlas.parts.forEach((p, i) => {
          const c = centers[i];
          const destination = offsets[i];
          let dx = 0;
          let dy = 0;
          let dz = 0;

          if (amount <= 0.45) {
            const t = amount / 0.45;
            const group = SYSTEMS.findIndex((sys) => sys.id === p.system);
            const angle = (group / SYSTEMS.length) * Math.PI * 2;
            dx = Math.sin(angle) * t * 0.48;
            dy = (c.y - 0.85) * t * 0.28;
            dz = Math.cos(angle) * t * 0.48;
          } else {
            const t = (amount - 0.45) / 0.55;
            const group = SYSTEMS.findIndex((sys) => sys.id === p.system);
            const angle = (group / SYSTEMS.length) * Math.PI * 2;
            dx = T.MathUtils.lerp(Math.sin(angle) * 0.48, destination.x - c.x, t);
            dy = T.MathUtils.lerp((c.y - 0.85) * 0.28, destination.y - c.y, t);
            dz = T.MathUtils.lerp(Math.cos(angle) * 0.48, -c.z, t);
          }

          const selected = selection.has(p.id);
          const isPartVisible = s.isolate ? selected : visible.has(p.system) || selected;

          data.set([dx, dy, dz, isPartVisible ? 1 : 0], i * 4);
          selectedData[i * 4] = selected ? 255 : 0;

          markerPositions.set(
            data[i * 4 + 3] > 0.5 ? [c.x + dx, c.y + dy, c.z + dz] : [10000, 10000, 10000],
            i * 3
          );

          const mesh = pickers[i];
          if (mesh) {
            mesh.position.set(dx, dy, dz);
            mesh.updateMatrix();
            mesh.updateMatrixWorld(true);
          }
        });

        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;
        markerGeometry.attributes.position.needsUpdate = true;
        lastState = s;
        lastExtent = amount;
        dirty = true;
      }

      if (s.view !== lastView || s.reset !== lastReset) {
        fit(s.view, amount);
        lastView = s.view;
        lastReset = s.reset;
      }

      if (moving && !s.isolate) {
        fit(amount > 0.5 ? 'front' : s.view, Math.max(0, (amount - 0.3) / 0.7));
      }

      // Smooth Camera Focus on Structure Isolation
      const isolateKey = s.isolate ? s.selected.join(',') + ':' + s.reset + ':' + s.inspectorOpen + ':' + camera.aspect : '';
      if (isolateKey !== lastIsolate || (s.isolate && moving)) {
        if (s.isolate) {
          const box = new T.Box3();
          atlas.parts.forEach((p, i) => {
            if (s.selected.includes(p.id)) {
              box.union(bounds[i].clone().translate(new T.Vector3(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])));
            }
          });

          if (!box.isEmpty()) {
            const center = box.getCenter(new T.Vector3());
            const size = box.getSize(new T.Vector3());
            const w = el.clientWidth;
            const h = el.clientHeight;
            const mobile = w < 768;
            const landscape = w > h && h <= 600;

            let left = 20;
            let right = w - 20;
            let top = mobile ? 175 : 110;
            let bottom = h - 170;

            if (s.inspectorOpen) {
              if (landscape) {
                right = w - 335;
                top = 100;
                bottom = h - 125;
              } else if (mobile) {
                top = 110;
                bottom = h * 0.5;
              } else {
                right = w - 370;
                left = w > 1100 ? 340 : 25;
              }
            }

            const availableWidth = Math.max(150, right - left);
            const availableHeight = Math.max(40, bottom - top);
            camera.setViewOffset(w, h, w / 2 - (left + right) / 2, h / 2 - (top + bottom) / 2, w, h);

            const distance = Math.max(
              0.07,
              (Math.max(size.y * (h / availableHeight), (size.x * (w / availableWidth)) / camera.aspect, size.z) /
                (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
                1.35
            );

            controls.maxDistance = Math.max(40, distance * 2);
            controls.target.copy(center);
            camera.position.copy(center).add(new T.Vector3(0.2, 0.1, 1).normalize().multiplyScalar(distance));
            controls.update();
            dirty = true;
          }
        } else if (lastIsolate) {
          camera.clearViewOffset();
          fit(s.view, amount);
        }
        lastIsolate = isolateKey;
      }

      controls.enableRotate = amount < 0.8;
      controls.mouseButtons.LEFT = amount < 0.8 ? T.MOUSE.ROTATE : T.MOUSE.PAN;
      controls.touches.ONE = amount < 0.8 ? T.TOUCH.ROTATE : T.TOUCH.PAN;

      ground.visible = platform.visible = ring.visible = innerRing.visible = amount < 0.5 && !s.isolate;
      markers.visible = amount > 0.75;
      controls.autoRotate = s.rotate && !s.isolate && amount < 0.4;
      controls.autoRotateSpeed = 0.65;
      controls.update();
      if (controls.autoRotate) dirty = true;

      if (dirty) {
        renderer.render(scene, camera);
        targets = [];
        if (amount > 0.45) {
          const hasSolid = atlas.parts.some((p, i) => p.system !== 'integumentary' && data[i * 4 + 3] > 0.5);
          atlas.parts.forEach((p, i) => {
            if (data[i * 4 + 3] < 0.5 || (hasSolid && p.system === 'integumentary')) return;
            let left = Infinity;
            let right = -Infinity;
            let top = Infinity;
            let bottom = -Infinity;

            for (let corner = 0; corner < 8; corner++) {
              projected
                .set(
                  p.bounds[corner & 1 ? 1 : 0][0] + data[i * 4],
                  p.bounds[corner & 2 ? 1 : 0][1] + data[i * 4 + 1],
                  p.bounds[corner & 4 ? 1 : 0][2] + data[i * 4 + 2]
                )
                .project(camera);

              const x = ((projected.x + 1) * el.clientWidth) / 2;
              const y = ((1 - projected.y) * el.clientHeight) / 2;
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }

            projected.copy(centers[i]).add(new T.Vector3(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])).project(camera);
            if (projected.z < -1 || projected.z > 1) return;
            targets.push({
              index: i,
              x: ((projected.x + 1) * el.clientWidth) / 2,
              y: ((1 - projected.y) * el.clientHeight) / 2,
              left,
              right,
              top,
              bottom
            });
          });
        }
        dirty = false;
      }
    };

    animate();

    const contextLost = (e: Event) => {
      e.preventDefault();
      onError('The 3D session was paused by your device. Please reload to continue.');
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      scene.traverse((o) => {
        if (o instanceof T.Mesh && !geometries.includes(o.geometry)) {
          o.geometry.dispose();
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach((m) => m.dispose());
        }
      });
      env.dispose();
      partTexture.dispose();
      selectionTexture.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      hover.remove();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [atlas]);

  return (
    <div
      ref={host}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    />
  );
}
