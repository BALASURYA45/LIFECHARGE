import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Flame,
  Zap,
  Box,
  Eye,
  Activity,
  AlertCircle,
  Info,
} from 'lucide-react';

/**
 * 3D Interactive EV Battery Pack Component
 * Renders an EV battery pack enclosure with modules, individual cells,
 * cooling channels, busbars, thermal heatmaps, and exploded view animations.
 */
export default function BatteryPack3DView({
  operatingTemp = 28,
  fastChargingPct = 25,
  hotspotCellIndex = 3,
  cellVoltages = null,
  onSelectHotspot = null,
  selectedBatteryId = 'BT_EV_001',
}) {
  const mountRef = useRef(null);
  const [viewMode, setViewMode] = useState('exploded'); // 'exploded' | 'thermal' | 'voltage' | 'solid'
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // References for animation state across renders
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modulesGroupRef = useRef([]);
  const lidRef = useRef(null);
  const cellsMeshRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  // Mouse drag / camera orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 14 });

  // Generate 48 cell metrics array (4 modules x 12 cells per module)
  const getCellData = useCallback((index) => {
    const isHotspot = index === (hotspotCellIndex % 48);
    const baseTemp = operatingTemp + (isHotspot ? 14.5 : Math.sin(index * 1.5) * 2.2);
    const baseVoltage = cellVoltages && cellVoltages[index]
      ? cellVoltages[index]
      : Number((3.65 + (Math.sin(index * 2.1) * 0.08) - (isHotspot ? 0.12 : 0)).toFixed(3));
    const resistance = Number((22 + (isHotspot ? 9.5 : (index % 5) * 0.8)).toFixed(1));
    const soc = Math.min(100, Math.max(20, Math.round(82 - (index % 4) * 1.5)));

    return {
      index: index + 1,
      rawIndex: index,
      module: Math.floor(index / 12) + 1,
      cellInModule: (index % 12) + 1,
      temp: Number(baseTemp.toFixed(1)),
      voltage: baseVoltage,
      resistance,
      soc,
      isHotspot,
      seiThickness: Number((12 + (index % 7) * 4.2 + (isHotspot ? 18.5 : 0)).toFixed(1)),
      anodePotential: Number((0.08 - (isHotspot ? 0.09 : (index % 4) * 0.015)).toFixed(3)),
      status: isHotspot ? 'HOTSPOT ALERT' : baseVoltage < 3.55 ? 'IMBALANCED' : 'HEALTHY',
    };
  }, [operatingTemp, hotspotCellIndex, cellVoltages]);

  // Color generator based on view mode and cell state
  const getCellColor = useCallback((cellData, mode) => {
    if (mode === 'thermal') {
      const t = cellData.temp;
      if (t >= 42 || cellData.isHotspot) return new THREE.Color(0xef4444); // Hot Red
      if (t >= 36) return new THREE.Color(0xf59e0b); // Warm Amber
      if (t >= 30) return new THREE.Color(0x10b981); // Normal Emerald
      return new THREE.Color(0x06b6d4); // Cool Cyan
    }

    if (mode === 'voltage') {
      const v = cellData.voltage;
      if (v < 3.58 || cellData.isHotspot) return new THREE.Color(0xef4444); // Low / Imbalanced Red
      if (v > 3.70) return new THREE.Color(0x3b82f6); // High Blue
      return new THREE.Color(0x10b981); // Nominal Green
    }

    if (mode === 'sei_growth') {
      const s = cellData.seiThickness;
      if (s >= 28 || cellData.isHotspot) return new THREE.Color(0xd97706); // Burnt Amber
      if (s >= 20) return new THREE.Color(0xeab308); // Yellow
      return new THREE.Color(0x84cc16); // Lime
    }

    if (mode === 'impedance') {
      const r = cellData.resistance;
      if (r >= 28 || cellData.isHotspot) return new THREE.Color(0x9333ea); // Purple
      if (r >= 24) return new THREE.Color(0x3b82f6); // Blue
      return new THREE.Color(0x10b981); // Green
    }

    // Default / Solid mode
    if (cellData.isHotspot) return new THREE.Color(0xff3344);
    return new THREE.Color(0x38bdf8); // Metallic Cyan Lithium Cell
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120); // Dark Slate Blue space
    scene.fog = new THREE.FogExp2(0x0b1120, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    
    // Position camera
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear old elements if re-initializing
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 0.4);
    dirLight2.position.set(-10, -5, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 15);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // 5. Grid Floor & Platform
    const gridHelper = new THREE.GridHelper(24, 24, 0xef4444, 0x1e293b);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    // 6. Build EV Battery Pack Group
    const packGroup = new THREE.Group();
    scene.add(packGroup);

    // A. Base Cooling Plate (Bottom Aluminum Tray)
    const basePlateGeo = new THREE.BoxGeometry(9.2, 0.25, 6.2);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.position.y = -0.7;
    basePlate.receiveShadow = true;
    packGroup.add(basePlate);

    // Liquid Cooling Micro-Channels (Blue Accent Lines on Plate)
    for (let c = -3.8; c <= 3.8; c += 1.2) {
      const channelGeo = new THREE.BoxGeometry(0.12, 0.05, 5.8);
      const channelMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const channel = new THREE.Mesh(channelGeo, channelMat);
      channel.position.set(c, -0.55, 0);
      packGroup.add(channel);
    }

    // B. Top Enclosure Lid (Transparent Glass / Metallic frame)
    const lidGeo = new THREE.BoxGeometry(9.4, 0.15, 6.4);
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.85, // Glass transparency
      thickness: 0.5,
      transparent: true,
      opacity: 0.45,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 1.6;
    packGroup.add(lid);
    lidRef.current = lid;

    // Outer Protective Frame Bezel
    const bezelGeo = new THREE.BoxGeometry(9.5, 2.4, 6.5);
    const bezelEdges = new THREE.EdgesGeometry(bezelGeo);
    const bezelLine = new THREE.LineSegments(
      bezelEdges,
      new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })
    );
    bezelLine.position.y = 0.5;
    packGroup.add(bezelLine);

    // C. Create 4 Battery Modules (2x2 Grid)
    const modules = [];
    const allCells = [];
    
    // Module positions in pack space
    const moduleOffsets = [
      { x: -2.3, z: -1.5, id: 1 },
      { x: 2.3, z: -1.5, id: 2 },
      { x: -2.3, z: 1.5, id: 3 },
      { x: 2.3, z: 1.5, id: 4 },
    ];

    moduleOffsets.forEach((modConfig, modIdx) => {
      const moduleGroup = new THREE.Group();
      moduleGroup.position.set(modConfig.x, 0, modConfig.z);
      packGroup.add(moduleGroup);
      modules.push({ group: moduleGroup, initialPos: { ...modConfig } });

      // Module Aluminum Casing Box
      const modCaseGeo = new THREE.BoxGeometry(4.1, 1.8, 2.6);
      const modCaseMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.35,
      });
      const modCase = new THREE.Mesh(modCaseGeo, modCaseMat);
      modCase.position.y = 0.4;
      moduleGroup.add(modCase);

      // Busbar Connectors (Copper strips across module top)
      const busbarGeo = new THREE.BoxGeometry(3.6, 0.06, 0.15);
      const busbarMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Metallic Copper
        metalness: 0.9,
        roughness: 0.2,
      });
      const busbar1 = new THREE.Mesh(busbarGeo, busbarMat);
      busbar1.position.set(0, 1.25, -0.6);
      const busbar2 = new THREE.Mesh(busbarGeo, busbarMat);
      busbar2.position.set(0, 1.25, 0.6);
      moduleGroup.add(busbar1);
      moduleGroup.add(busbar2);

      // D. Generate 12 Cylindrical Battery Cells per Module (2 rows x 6 cols)
      const cellGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.4, 16);
      const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

      let cellInModCount = 0;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 6; col++) {
          const globalCellIndex = modIdx * 12 + cellInModCount;
          cellInModCount++;

          const cellX = -1.5 + col * 0.6;
          const cellZ = -0.6 + row * 1.2;

          const initialData = getCellData(globalCellIndex);
          const initialColor = getCellColor(initialData, viewMode);

          const cellMat = new THREE.MeshStandardMaterial({
            color: initialColor,
            metalness: 0.4,
            roughness: 0.3,
            emissive: initialData.isHotspot ? new THREE.Color(0xff0000) : new THREE.Color(0x000000),
            emissiveIntensity: initialData.isHotspot ? 0.6 : 0,
          });

          const cellMesh = new THREE.Mesh(cellGeo, cellMat);
          cellMesh.position.set(cellX, 0.4, cellZ);
          cellMesh.castShadow = true;
          cellMesh.receiveShadow = true;

          // Top Anode Cap
          const capMesh = new THREE.Mesh(capGeo, capMat);
          capMesh.position.set(0, 0.72, 0);
          cellMesh.add(capMesh);

          // Store cell metadata on mesh object for raycaster pickup
          cellMesh.userData = {
            globalIndex: globalCellIndex,
            moduleIdx: modIdx,
          };

          moduleGroup.add(cellMesh);
          allCells.push(cellMesh);
        }
      }
    });

    modulesGroupRef.current = modules;
    cellsMeshRef.current = allCells;

    // 7. Animation Loop
    let angle = cameraAngleRef.current.theta;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Auto rotation if enabled
      if (isRotating && !isDraggingRef.current) {
        angle += 0.003;
        cameraAngleRef.current.theta = angle;
        updateCameraPos();
      }

      // Smooth Exploded View Animation (Lerp positioning)
      const isExploded = viewMode === 'exploded';
      
      // Animate top lid elevation
      if (lidRef.current) {
        const targetLidY = isExploded ? 3.8 : 1.6;
        lidRef.current.position.y += (targetLidY - lidRef.current.position.y) * 0.08;
      }

      // Animate module spreading
      modulesGroupRef.current.forEach((mod) => {
        const factor = isExploded ? 1.45 : 1.0;
        const targetX = mod.initialPos.x * factor;
        const targetZ = mod.initialPos.z * factor;
        const targetY = isExploded ? 0.3 : 0;

        mod.group.position.x += (targetX - mod.group.position.x) * 0.08;
        mod.group.position.z += (targetZ - mod.group.position.z) * 0.08;
        mod.group.position.y += (targetY - mod.group.position.y) * 0.08;
      });

      // Pulse hotspot cell emissive light
      const hotspotCellMesh = cellsMeshRef.current[hotspotCellIndex % 48];
      if (hotspotCellMesh && hotspotCellMesh.material) {
        const pulse = (Math.sin(Date.now() * 0.006) + 1) * 0.4 + 0.3;
        hotspotCellMesh.material.emissiveIntensity = pulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []); // Run once on mount

  // Update Cell colors whenever viewMode, operatingTemp, cellVoltages, or hotspotCellIndex change
  useEffect(() => {
    if (!cellsMeshRef.current || cellsMeshRef.current.length === 0) return;

    cellsMeshRef.current.forEach((mesh) => {
      const idx = mesh.userData.globalIndex;
      const data = getCellData(idx);
      const color = getCellColor(data, viewMode);
      mesh.material.color.copy(color);
      
      if (data.isHotspot) {
        mesh.material.emissive = new THREE.Color(0xff0000);
      } else {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
      }
    });
  }, [viewMode, operatingTemp, hotspotCellIndex, cellVoltages, getCellData, getCellColor]);

  // Pointer Drag & Orbit Controls
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Handle Raycaster Hover Detection
    if (raycasterRef.current && cellsMeshRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(cellsMeshRef.current);

      if (intersects.length > 0) {
        const hitCellMesh = intersects[0].object;
        const cellData = getCellData(hitCellMesh.userData.globalIndex);
        setHoveredCell(cellData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredCell(null);
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    }

    // Handle Orbit Drag
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const angleState = cameraAngleRef.current;
      angleState.theta -= deltaX * 0.008;
      angleState.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, angleState.phi - deltaY * 0.008));

      const { theta, phi, radius } = angleState;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.lookAt(0, 0, 0);

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handlePointerClick = () => {
    if (hoveredCell) {
      setSelectedCell(hoveredCell);
      if (onSelectHotspot) {
        onSelectHotspot(hoveredCell.rawIndex);
      }
    }
  };

  // Zoom control via Wheel
  const handleWheel = (e) => {
    if (!cameraRef.current) return;
    const angleState = cameraAngleRef.current;
    angleState.radius = Math.max(6, Math.min(26, angleState.radius + e.deltaY * 0.015));

    const { theta, phi, radius } = angleState;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 14 };
    if (cameraRef.current) {
      cameraRef.current.position.set(7, 7, 7);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className={`relative rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transition-all ${
      fullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full h-[520px]'
    }`}>
      {/* Top Header Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-white shadow-xl pointer-events-auto">
          <Box className="w-5 h-5 text-emerald-500 animate-pulse" />
          <div>
            <div className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
              3D Digital Twin Battery Pack
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                48 CELLS • 4 MODULES
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Pack ID: {selectedBatteryId} • Real-time WebGL Renderer
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md pointer-events-auto shadow-xl">
          {[
            { id: 'exploded', label: 'Exploded Pack', icon: Layers },
            { id: 'thermal', label: 'Thermal Heatmap', icon: Flame },
            { id: 'voltage', label: 'Cell Balance', icon: Zap },
            { id: 'sei_growth', label: 'SEI Layer (nm)', icon: Activity },
            { id: 'impedance', label: 'Impedance (mΩ)', icon: Box },
            { id: 'solid', label: 'Enclosure', icon: Eye },
          ].map((mode) => {
            const Icon = mode.icon;
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handlePointerClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Hovered Cell Live Inspection Overlay */}
      {hoveredCell && !selectedCell && (
        <div className="absolute top-20 left-4 z-20 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-md text-white shadow-2xl w-64 animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" /> Cell #{hoveredCell.index} Metrics
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hoveredCell.isHotspot ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {hoveredCell.status}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Module / Slot:</span>
              <span className="text-white font-bold">M{hoveredCell.module} - C{hoveredCell.cellInModule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className={`font-bold ${hoveredCell.temp >= 38 ? 'text-emerald-400' : 'text-emerald-400'}`}>
                {hoveredCell.temp}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cell Voltage:</span>
              <span className="text-amber-400 font-bold">{hoveredCell.voltage} V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Resistance:</span>
              <span className="text-purple-400 font-bold">{hoveredCell.resistance} mΩ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SEI Layer Thickness:</span>
              <span className="text-amber-300 font-bold">{hoveredCell.seiThickness} nm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State of Charge:</span>
              <span className="text-cyan-400 font-bold">{hoveredCell.soc}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Single Cell Deep Diagnostic Inspection Modal */}
      {selectedCell && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Box className="text-emerald-400" size={20} />
                <h3 className="font-black text-base">3D Telemetry Inspection: Cell #{selectedCell.index}</h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Module Position</span>
                <p className="font-mono text-sm font-black text-white">Module {selectedCell.module}, Cell {selectedCell.cellInModule}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Cell Temperature</span>
                <p className={`font-mono text-sm font-black ${selectedCell.temp >= 38 ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {selectedCell.temp}°C
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Instant Voltage</span>
                <p className="font-mono text-sm font-black text-amber-400">{selectedCell.voltage} V</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Impedance (R_ct)</span>
                <p className="font-mono text-sm font-black text-purple-400">{selectedCell.resistance} mΩ</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">SEI Layer Thickness</span>
                <p className="font-mono text-sm font-black text-amber-300">{selectedCell.seiThickness} nm</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Anode Potential</span>
                <p className={`font-mono text-sm font-black ${selectedCell.anodePotential <= 0 ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {selectedCell.anodePotential} V vs Li/Li⁺
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300">
              <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                <Activity size={13} /> Cell Health Recommendation:
              </span>
              {selectedCell.isHotspot
                ? 'High local impedance detected. Active thermal equalization protocol engaged to balance cell group.'
                : 'Cell operates within optimal electrochemical stability margins.'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {/* Left Legend */}
        <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs text-slate-300 pointer-events-auto shadow-xl">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-cyan-400 shadow-sm" />
            <span>Nominal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-400 shadow-sm" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-amber-400 shadow-sm" />
            <span>Warm (35°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-bold">Hotspot Cell</span>
          </div>
        </div>

        {/* Right Camera & Auto-Rotate Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md pointer-events-auto shadow-xl ml-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isRotating ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCcw size={13} className={isRotating ? 'animate-spin' : ''} />
            <span>{isRotating ? 'Auto Orbiting' : 'Paused Orbit'}</span>
          </button>
          
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset Camera Angle"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Toggle Fullscreen"
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
