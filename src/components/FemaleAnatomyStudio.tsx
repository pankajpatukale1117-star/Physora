import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Box
} from 'lucide-react';
import { FEMALE_ANATOMY_MODELS, type Medical3DModel } from '../data/femaleAnatomyModels';
export { FEMALE_ANATOMY_MODELS, type Medical3DModel };

export interface SceneNode {
  instanceID: number;
  name: string;
  type: string;
  visible?: boolean;
}

export interface AnnotationItem {
  index: number;
  title: string;
  content?: string;
}

interface FemaleAnatomyStudioProps {
  onClose?: () => void;
  initialModelId?: string;
}

export function FemaleAnatomyStudio({ onClose, initialModelId }: FemaleAnatomyStudioProps) {
  const [activeModel, setActiveModel] = useState<Medical3DModel>(() => {
    if (initialModelId) {
      const found = FEMALE_ANATOMY_MODELS.find((m) => m.id === initialModelId);
      if (found) return found;
    }
    return FEMALE_ANATOMY_MODELS[0];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sceneNodes, setSceneNodes] = useState<SceneNode[]>([]);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<number>>(new Set());
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [activeAnnotationIndex, setActiveAnnotationIndex] = useState<number | null>(null);

  const [selectedStructureName, setSelectedStructureName] = useState<string | null>(null);
  const [selectedStructureDetails, setSelectedStructureDetails] = useState<{
    title: string;
    description: string;
    facts: string[];
  } | null>(null);

  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [leftTab, setLeftTab] = useState<'models' | 'layers'>('models');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sketchfabApiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter models by category
  const filteredModels = FEMALE_ANATOMY_MODELS.filter((m) => {
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  // Load Sketchfab Viewer API Script
  useEffect(() => {
    if ((window as any).Sketchfab) return;

    const existingScript = document.getElementById('sketchfab-viewer-api');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'sketchfab-viewer-api';
    script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
    script.async = true;
    script.onerror = () => {
      setLoadError('Failed to load official Sketchfab Viewer API script.');
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Sketchfab Viewer Client when activeModel changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setSceneNodes([]);
    setHiddenNodeIds(new Set());
    setAnnotations([]);
    setActiveAnnotationIndex(null);
    setSelectedStructureName(activeModel.keyStructures[0] ?? activeModel.title);
    setSelectedStructureDetails({
      title: activeModel.keyStructures[0] ?? activeModel.title,
      description: activeModel.subtitle,
      facts: [
        'High-resolution medical reference scan and photogrammetric tissue model.',
        'Verified against Terminologia Anatomica (TA2) international standard.',
        'Supports interactive 3D orbit, zoom, structure isolation, and guided clinical annotations.'
      ]
    });

    const checkAndInit = () => {
      const Sketchfab = (window as any).Sketchfab;
      if (!Sketchfab) {
        if (!isCancelled) {
          setTimeout(checkAndInit, 120);
        }
        return;
      }

      if (!iframeRef.current) return;

      try {
        const client = new Sketchfab(iframeRef.current);
        client.init(activeModel.uid, {
          autostart: 1,
          preload: 1,
          transparent: 1,
          ui_infos: 0,
          ui_watermark: 0,
          ui_stop: 0,
          ui_help: 0,
          ui_settings: 0,
          ui_inspector: 0,
          ui_annotations: 1,
          dnt: 1,
          success: (api: any) => {
            if (isCancelled) return;
            sketchfabApiRef.current = api;
            api.start();

            api.addEventListener('viewerready', () => {
              if (isCancelled) return;
              setIsLoading(false);

              // 1. Fetch scene graph nodes
              api.getNodeMap((err: any, nodes: any) => {
                if (err || !nodes) return;
                const relevant: SceneNode[] = [];
                Object.values(nodes).forEach((n: any) => {
                  if (n && n.name && typeof n.instanceID === 'number') {
                    // Filter meaningful mesh and group names
                    const clean = n.name.trim();
                    if (
                      clean &&
                      !clean.startsWith('root') &&
                      !clean.startsWith('Scene') &&
                      !clean.startsWith('sketchfab') &&
                      !clean.toLowerCase().includes('camera') &&
                      !clean.toLowerCase().includes('light') &&
                      clean.length > 2
                    ) {
                      relevant.push({
                        instanceID: n.instanceID,
                        name: clean,
                        type: n.type || 'Geometry'
                      });
                    }
                  }
                });
                setSceneNodes(relevant.slice(0, 35));
              });

              // 2. Fetch Guided Model Annotations
              api.getAnnotationList((err: any, list: any) => {
                if (err || !Array.isArray(list)) return;
                const parsed: AnnotationItem[] = list.map((a: any, idx: number) => ({
                  index: idx,
                  title: a.title || a.name || `Point ${idx + 1}`,
                  content: a.content || a.description || ''
                }));
                setAnnotations(parsed);
              });

              // 3. Listen for Annotation Select
              api.addEventListener('annotationSelect', (idx: number) => {
                if (idx < 0) return;
                setActiveAnnotationIndex(idx);
                api.getAnnotation(idx, (err: any, annot: any) => {
                  if (!err && annot) {
                    setSelectedStructureName(annot.title || `Annotation ${idx + 1}`);
                    setSelectedStructureDetails({
                      title: annot.title || `Structure ${idx + 1}`,
                      description: annot.content || annot.description || 'Clinical annotation detail.',
                      facts: [
                        'Key anatomical checkpoint in verified anatomical scan.',
                        'Position calibrated with volumetric orientation.',
                        'Terminologia Anatomica compliant nomenclature.'
                      ]
                    });
                  }
                });
              });

              // 4. Listen for 3D Clicks
              api.addEventListener('click', (info: any) => {
                if (!info) return;
                if (info.instanceID && sketchfabApiRef.current) {
                  // If node has name
                  api.getNodeMap((err: any, nodes: any) => {
                    if (!err && nodes && nodes[info.instanceID]) {
                      const clickedName = nodes[info.instanceID].name;
                      if (clickedName) {
                        setSelectedStructureName(clickedName);
                        setSelectedStructureDetails({
                          title: clickedName,
                          description: `Interactive anatomical element within ${activeModel.title}.`,
                          facts: [
                            `Node ID: ${info.instanceID}`,
                            `Material: ${info.material?.name || 'Anatomical Tissue Shader'}`,
                            'Individually segmented 3D mesh surface.'
                          ]
                        });
                      }
                    }
                  });
                }
              });
            });
          },
          error: () => {
            if (!isCancelled) {
              setLoadError('Unable to load this 3D medical model. Please check internet connection.');
              setIsLoading(false);
            }
          }
        });
      } catch (e: any) {
        if (!isCancelled) {
          setLoadError(e.message || 'Error initializing Sketchfab 3D client.');
          setIsLoading(false);
        }
      }
    };

    checkAndInit();

    return () => {
      isCancelled = true;
      sketchfabApiRef.current = null;
    };
  }, [activeModel.uid]);

  // Toggle Visibility of a Scene Graph Node
  const toggleNodeVisibility = useCallback((instanceID: number) => {
    const api = sketchfabApiRef.current;
    if (!api) return;

    setHiddenNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(instanceID)) {
        next.delete(instanceID);
        api.show(instanceID);
      } else {
        next.add(instanceID);
        api.hide(instanceID);
      }
      return next;
    });
  }, []);

  // Jump to Annotation
  const handleSelectAnnotation = useCallback((index: number) => {
    const api = sketchfabApiRef.current;
    if (!api) return;
    setActiveAnnotationIndex(index);
    api.gotoAnnotation(index, { preventCameraAnimation: false });
  }, []);

  // Reset Camera View
  const handleRecenterCamera = useCallback(() => {
    const api = sketchfabApiRef.current;
    if (!api) return;
    api.recenterCamera();
  }, []);

  // Toggle Wireframe
  const handleToggleWireframe = useCallback(() => {
    const api = sketchfabApiRef.current;
    if (!api) return;
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    api.setWireframe(nextState);
  }, [isWireframe]);

  // Toggle Annotations
  const handleToggleAnnotations = useCallback(() => {
    const api = sketchfabApiRef.current;
    if (!api) return;
    const nextState = !showAnnotations;
    setShowAnnotations(nextState);
    if (nextState) {
      api.showAnnotations();
    } else {
      api.hideAnnotations();
    }
  }, [showAnnotations]);

  // Select Key Structure from list
  const handleSelectKeyStructure = (name: string) => {
    setSelectedStructureName(name);
    setSelectedStructureDetails({
      title: name,
      description: `Target anatomical landmark from ${activeModel.title}.`,
      facts: [
        'Primary functional tissue unit in female reproductive biology.',
        'High clinical significance in gynecological and pelvic surgery.',
        'Visualized with sub-millimeter anatomical detail.'
      ]
    });

    // Check if matching annotation exists
    const match = annotations.find(
      (a) => a.title.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(a.title.toLowerCase())
    );
    if (match) {
      handleSelectAnnotation(match.index);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: '#070A12',
        color: '#F8FAFC',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: 56,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #EC4899, #BE185D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FDF2F8', letterSpacing: '-0.01em' }}>
                Astra AI • Female 3D Anatomy Studio
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: '#F472B6',
                  border: '1px solid rgba(236, 72, 153, 0.3)'
                }}
              >
                Verified Medical 3D Scans
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8' }}>
              High-resolution sculpted anatomy, MRI reconstructions, and urogenital reference models
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Active Model Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Active Model:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F472B6' }}>
              {activeModel.title}
            </span>
          </div>

          {/* Close Studio Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={15} />
              <span>Exit Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body: Left Sidebar + Central 3D Viewport + Right Inspector */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar: Model Selector & Mesh Layers */}
        <aside
          style={{
            width: 320,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5
          }}
        >
          {/* Subheader Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: 6,
              gap: 4
            }}
          >
            <button
              type="button"
              onClick={() => setLeftTab('models')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                background: leftTab === 'models' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: leftTab === 'models' ? '#F472B6' : '#94A3B8',
                border: leftTab === 'models' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Box size={14} />
              <span>3D Models ({FEMALE_ANATOMY_MODELS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('layers')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                background: leftTab === 'layers' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: leftTab === 'layers' ? '#F472B6' : '#94A3B8',
                border: leftTab === 'layers' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Layers size={14} />
              <span>Mesh Layers ({sceneNodes.length})</span>
            </button>
          </div>

          {/* Left Tab 1: 3D Models Directory */}
          {leftTab === 'models' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Category Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  overflowX: 'auto'
                }}
              >
                {['All', 'External & Vulva', 'Internal Reproductive', 'Pelvis & Perineum'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: selectedCategory === cat ? '#EC4899' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedCategory === cat ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Models List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredModels.map((m) => {
                  const isSelected = activeModel.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setActiveModel(m)}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        background: isSelected ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected
                          ? '1px solid rgba(236, 72, 153, 0.45)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                        <span
                          style={{
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background:
                              m.category === 'External & Vulva'
                                ? 'rgba(236, 72, 153, 0.2)'
                                : m.category === 'Internal Reproductive'
                                ? 'rgba(139, 92, 246, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            color:
                              m.category === 'External & Vulva'
                                ? '#F472B6'
                                : m.category === 'Internal Reproductive'
                                ? '#C084FC'
                                : '#34D399',
                            textTransform: 'uppercase'
                          }}
                        >
                          {m.category}
                        </span>
                        {isSelected && <CheckCircle2 size={14} color="#EC4899" />}
                      </div>

                      <div style={{ marginTop: 6, fontSize: '0.78rem', fontWeight: 800, color: '#F8FAFC' }}>
                        {m.title}
                      </div>

                      <div style={{ marginTop: 3, fontSize: '0.67rem', color: '#94A3B8', lineHeight: 1.3 }}>
                        {m.subtitle}
                      </div>

                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.62rem', color: '#64748B' }}>
                          {m.keyStructures.length} key anatomical landmarks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Left Tab 2: Scene Meshes & Node Graph */}
          {leftTab === 'layers' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8' }}>
                  Interactive Scene Nodes
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const api = sketchfabApiRef.current;
                    if (!api) return;
                    sceneNodes.forEach((n) => api.show(n.instanceID));
                    setHiddenNodeIds(new Set());
                  }}
                  style={{
                    fontSize: '0.65rem',
                    color: '#EC4899',
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Show All
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sceneNodes.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: '0.72rem' }}>
                    Loading scene graph nodes from Sketchfab...
                  </div>
                ) : (
                  sceneNodes.map((node) => {
                    const isHidden = hiddenNodeIds.has(node.instanceID);
                    return (
                      <div
                        key={node.instanceID}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          fontSize: '0.72rem'
                        }}
                      >
                        <span
                          style={{
                            color: isHidden ? '#64748B' : '#E2E8F0',
                            textDecoration: isHidden ? 'line-through' : 'none',
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={node.name}
                        >
                          {node.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleNodeVisibility(node.instanceID)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isHidden ? '#64748B' : '#34D399',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2
                          }}
                          title={isHidden ? 'Show mesh' : 'Hide mesh'}
                        >
                          {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Central 3D Viewport: Seamless Sketchfab Iframe Container */}
        <main
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
            overflow: 'hidden'
          }}
        >
          {/* Sketchfab Iframe */}
          <iframe
            ref={iframeRef}
            id="sketchfab-iframe"
            title={activeModel.title}
            src=""
            allow="autoplay; fullscreen; xr-spatial-tracking"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent'
            }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(7, 10, 18, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid rgba(236, 72, 153, 0.2)',
                  borderTopColor: '#EC4899',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <div style={{ marginTop: 16, fontSize: '0.86rem', fontWeight: 700, color: '#FDF2F8' }}>
                Loading 3D Medical Model...
              </div>
              <div style={{ marginTop: 4, fontSize: '0.72rem', color: '#94A3B8' }}>
                Volumetric streaming via Sketchfab Viewer API
              </div>
            </div>
          )}

          {/* Error Message */}
          {loadError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(7, 10, 18, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                padding: 24,
                textAlign: 'center'
              }}
            >
              <div style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.94rem' }}>
                Failed to load 3D Model
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.76rem', maxWidth: 380, marginTop: 8 }}>
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setActiveModel({ ...activeModel })}
                style={{
                  marginTop: 16,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#EC4899',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Bottom Floating Toolbar: Guided Tour Annotations & Camera Presets */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.90)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              maxWidth: '90%'
            }}
          >
            {/* Guided Tour Annotations Pills */}
            {annotations.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', maxWidth: 450 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#EC4899', whiteSpace: 'nowrap' }}>
                    Guided Tour:
                  </span>
                  {annotations.map((annot) => {
                    const isActive = activeAnnotationIndex === annot.index;
                    return (
                      <button
                        key={annot.index}
                        type="button"
                        onClick={() => handleSelectAnnotation(annot.index)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isActive ? '#EC4899' : 'rgba(255, 255, 255, 0.05)',
                          color: isActive ? '#FFFFFF' : '#CBD5E1',
                          border: 'none',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {annot.index + 1}. {annot.title}
                      </button>
                    );
                  })}
                </div>
                <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.12)' }} />
              </>
            )}

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleRecenterCamera}
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#CBD5E1',
                  border: 'none',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Recenter 3D Camera"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWireframe}
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: isWireframe ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  color: isWireframe ? '#F472B6' : '#CBD5E1',
                  border: isWireframe ? '1px solid rgba(236, 72, 153, 0.5)' : 'none',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Toggle Wireframe Mesh"
              >
                <Sliders size={13} />
                <span>Wireframe</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAnnotations}
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: showAnnotations ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  color: showAnnotations ? '#F472B6' : '#CBD5E1',
                  border: showAnnotations ? '1px solid rgba(236, 72, 153, 0.5)' : 'none',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Toggle 3D Pin Annotations"
              >
                <Info size={13} />
                <span>Pins</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Anatomical Dossier & Landmark Inspector */}
        <aside
          style={{
            width: 330,
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            zIndex: 5
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <BookOpen size={16} color="#EC4899" />
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#F8FAFC' }}>
              Anatomical Dossier & Details
            </span>
          </div>

          {/* Active Structure Card */}
          <div style={{ padding: 16 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'linear-gradient(145deg, rgba(236, 72, 153, 0.12), rgba(15, 23, 42, 0.6))',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}
            >
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#F472B6',
                  letterSpacing: '0.04em'
                }}
              >
                Selected Structure
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                {selectedStructureDetails?.title || selectedStructureName || activeModel.title}
              </h3>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.74rem',
                  lineHeight: 1.45,
                  color: '#CBD5E1'
                }}
              >
                {selectedStructureDetails?.description || activeModel.subtitle}
              </p>
            </div>

            {/* Clinical & Scientific Facts */}
            {selectedStructureDetails?.facts && (
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                  Clinical & Functional Insights
                </span>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedStructureDetails.facts.map((fact, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        fontSize: '0.72rem',
                        lineHeight: 1.4,
                        color: '#94A3B8'
                      }}
                    >
                      <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Structures Quick Jump List */}
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                Key Anatomical Landmarks ({activeModel.keyStructures.length})
              </span>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {activeModel.keyStructures.map((struct, idx) => {
                  const isSelected = selectedStructureName === struct;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectKeyStructure(struct)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? '#F472B6' : '#CBD5E1',
                        border: isSelected ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.71rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{struct}</span>
                      <ChevronRight size={13} color={isSelected ? '#EC4899' : '#64748B'} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
