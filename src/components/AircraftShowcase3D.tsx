import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAerospaceStudioEnv } from '../three/studioEnv';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Wind,
  X,
} from 'lucide-react';
import {
  AIRCRAFT_SUBSYSTEMS,
  AircraftSubsystem,
  FLIGHT_MODES,
  FlightModeId,
} from '../data/researchData';
import { buildJobyS4Rig, VisualRenderMode } from '../three/jobyS4Model';
import hangarStudioBackdrop from '../assets/images/cinema_hangar_studio_1795084857862.jpg';

export type CameraPresetId = 'default' | 'nose' | 'wing' | 'tail' | 'top';

interface CameraPreset {
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  default: { pos: [7.4, 1.48, 7.9], target: [0, 0.12, 0] },
  nose: { pos: [0.55, 0.85, 8.0], target: [0, 0.15, 0.4] },
  wing: { pos: [9.8, 1.95, 1.2], target: [0, 0.25, 0] },
  tail: { pos: [-4.8, 2.05, -8.0], target: [0, 0.28, -0.4] },
  top: { pos: [0.01, 11.4, 0.8], target: [0, 0, 0] },
};

interface Props {
  flightMode: FlightModeId;
  onChangeFlightMode: (mode: FlightModeId) => void;
  visualMode: VisualRenderMode;
  onChangeVisualMode: (mode: VisualRenderMode) => void;
  explodeFactor: number;
  onChangeExplodeFactor: (val: number) => void;
  selectedSubsystemId: string | null;
  onSelectSubsystem: (id: string | null) => void;
  cameraPreset: CameraPresetId;
  onChangeCameraPreset: (preset: CameraPresetId) => void;
  heightClassName?: string;
}

const _projVec = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const AircraftShowcase3D: React.FC<Props> = ({
  flightMode,
  onChangeFlightMode,
  visualMode,
  onChangeVisualMode,
  explodeFactor,
  onChangeExplodeFactor,
  selectedSubsystemId,
  onSelectSubsystem,
  cameraPreset,
  onChangeCameraPreset,
  heightClassName = 'h-[80vh] min-h-[600px]',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hotspotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [webglError, setWebglError] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  // Keep hotspots hidden in default cinematic beauty view for 100% unobstructed aircraft silhouette
  const [showHotspots, setShowHotspots] = useState(false);

  // Auto-show hotspots when entering CAD Exploded mode so user can immediately click parts
  useEffect(() => {
    if (visualMode === 'ENGINEERING_CAD' || explodeFactor > 0.35) {
      setShowHotspots(true);
    } else if (visualMode === 'AERO_CFD') {
      setShowHotspots(false);
    }
  }, [visualMode, explodeFactor]);

  const stateRef = useRef({
    flightMode,
    visualMode,
    explodeFactor,
    selectedSubsystemId,
    showHotspots,
  });
  stateRef.current = {
    flightMode,
    visualMode,
    explodeFactor,
    selectedSubsystemId,
    showHotspots,
  };

  const cameraGoalRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: true,
    pos: new THREE.Vector3(...CAMERA_PRESETS.default.pos),
    target: new THREE.Vector3(...CAMERA_PRESETS.default.target),
  });

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    cameraGoalRef.current.pos.set(...preset.pos);
    cameraGoalRef.current.target.set(...preset.target);
    cameraGoalRef.current.active = true;
  }, [cameraPreset]);

  useEffect(() => {
    if (!selectedSubsystemId) return;
    const sub = AIRCRAFT_SUBSYSTEMS.find((s) => s.id === selectedSubsystemId);
    if (sub) {
      cameraGoalRef.current.pos.set(...sub.cameraOffset);
      cameraGoalRef.current.target.set(...sub.cameraTarget);
      cameraGoalRef.current.active = true;
    }
  }, [selectedSubsystemId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('当前浏览器环境暂不支持 WebGL，已切换至工程图文模式。');
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('WebGL 上下文已暂停，正在尝试恢复...');
    };
    const handleContextRestored = () => setWebglError(null);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const bgCad = new THREE.Color(0x031129);
    const bgCfd = new THREE.Color(0x020408);
    const techFog = new THREE.FogExp2(0x031129, 0.028);
    scene.background = null;
    scene.fog = null;

    const envTex = createAerospaceStudioEnv(renderer, 'hangar');
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    camera.position.set(7.4, 1.48, 7.9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 0.54;
    controls.target.set(0, 0.12, 0);

    controls.addEventListener('start', () => {
      cameraGoalRef.current.active = false;
    });

    // Balanced studio 3-point lighting rig
    const hemiLight = new THREE.HemisphereLight(0xa5d8ff, 0x0b111e, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.45);
    keyLight.position.set(6, 11, 7);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.85);
    rimLight.position.set(-8, 4, -7);
    scene.add(rimLight);

    // Ground plane aligned flush with rubber tires (y = -0.96) + subtle blueprint CAD grid
    const floorY = -0.96;
    const cadGrid = new THREE.GridHelper(32, 32, 0x1d4ed8, 0x0c244a);
    cadGrid.position.y = floorY - 0.18;
    cadGrid.visible = false;
    scene.add(cadGrid);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 122);
      grad.addColorStop(0, 'rgba(2, 4, 8, 0.88)');
      grad.addColorStop(0.46, 'rgba(2, 4, 8, 0.44)');
      grad.addColorStop(0.78, 'rgba(2, 4, 8, 0.12)');
      grad.addColorStop(1, 'rgba(2, 4, 8, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(11.4, 8.2),
      contactShadowMat
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, floorY, -0.15);
    scene.add(contactShadow);

    const rig = buildJobyS4Rig(isSoftwareGl);
    scene.add(rig.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.04 }
    );
    io.observe(container);

    let frameId = 0;
    let disposed = false;
    let prevTime = performance.now();
    let elapsed = 0;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.06);
      prevTime = now;

      if (!isVisible) {
        frameId = window.setTimeout(tick, 220);
        return;
      }

      elapsed += dt;
      const {
        flightMode: curMode,
        visualMode: curVisual,
        explodeFactor: curExplode,
        selectedSubsystemId: curSub,
        showHotspots: curHotspots,
      } = stateRef.current;

      const modeSpec = FLIGHT_MODES[curMode];

      // Scene atmosphere tailored to each of the 3 signature modes:
      // CINEMATIC uses transparent canvas over photorealistic architectural hangar plate
      if (curVisual === 'CINEMATIC') {
        scene.background = null;
        scene.fog = null;
        renderer.setClearColor(0x000000, 0);
      } else {
        const targetBg = curVisual === 'ENGINEERING_CAD' ? bgCad : bgCfd;
        scene.background = targetBg;
        techFog.color.copy(targetBg);
        techFog.density = curVisual === 'AERO_CFD' ? 0.015 : 0.028;
        scene.fog = techFog;
        renderer.setClearColor(targetBg, 1);
      }

      const airborne = modeSpec.airspeedKmh > 25;
      contactShadow.visible = curVisual === 'CINEMATIC' && curExplode < 0.14;
      contactShadowMat.opacity = airborne ? 0.36 : 0.92;
      cadGrid.visible = curVisual === 'ENGINEERING_CAD';

      // Planted tires on concrete hangar floor in ground/VTOL inspection; organic lift in cruise/transition
      const targetElevation =
        curExplode > 0.08
          ? 0.28
          : airborne
          ? 0.34 + Math.sin(elapsed * 1.45) * 0.045 + Math.cos(elapsed * 0.72) * 0.02
          : 0;
      rig.root.position.y = THREE.MathUtils.damp(rig.root.position.y, targetElevation, 4.2, dt);
      const targetPitch = THREE.MathUtils.degToRad(curExplode > 0.08 ? 0 : modeSpec.pitchDeg);
      rig.root.rotation.x = THREE.MathUtils.damp(rig.root.rotation.x, targetPitch, 4.5, dt);

      rig.updateKinematics({
        elapsedSec: elapsed,
        dt,
        tiltDeg: modeSpec.nacelleTiltDeg,
        rotorRpm: modeSpec.rotorRpm,
        explodeFactor: curExplode,
        visualMode: curVisual,
        selectedSubsystem: curSub,
        airspeedKmh: modeSpec.airspeedKmh,
      });

      if (cameraGoalRef.current.active) {
        const lambda = 4.4;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraGoalRef.current.pos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraGoalRef.current.pos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraGoalRef.current.pos.z, lambda, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, cameraGoalRef.current.target.x, lambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, cameraGoalRef.current.target.y, lambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, cameraGoalRef.current.target.z, lambda, dt);

        if (
          camera.position.distanceTo(cameraGoalRef.current.pos) < 0.04 &&
          controls.target.distanceTo(cameraGoalRef.current.target) < 0.03
        ) {
          cameraGoalRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Project 3D subsystem hotspots cleanly
      const rectW = renderer.domElement.clientWidth;
      const rectH = renderer.domElement.clientHeight;
      AIRCRAFT_SUBSYSTEMS.forEach((sub) => {
        const btn = hotspotRefs.current[sub.id];
        if (!btn) return;
        if (!curHotspots) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          return;
        }
        const grpPos = rig.subsystems[sub.id].position;
        _projVec.set(
          sub.position3D[0] + grpPos.x,
          sub.position3D[1] + grpPos.y + rig.root.position.y,
          sub.position3D[2] + grpPos.z
        );
        _projVec.project(camera);
        const visible = _projVec.z < 1 && _projVec.z > -1;
        const sx = (_projVec.x * 0.5 + 0.5) * rectW;
        const sy = (-_projVec.y * 0.5 + 0.5) * rectH;
        const inBounds = sx > 60 && sx < rectW - 60 && sy > 54 && sy < rectH - 108;
        if (visible && inBounds) {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
        } else {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        }
      });

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const nw = Math.max(container.clientWidth, 320);
      const nh = Math.max(container.clientHeight, 320);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      io.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      rig.dispose();
      envTex.dispose();
      contactShadow.geometry.dispose();
      contactShadowMat.dispose();
      contactShadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeModeSpec = FLIGHT_MODES[flightMode];
  const selectedSubsystem: AircraftSubsystem | undefined = AIRCRAFT_SUBSYSTEMS.find(
    (s) => s.id === selectedSubsystemId
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#05070C] ${heightClassName}`}
      data-testid="joby-3d-viewport"
    >
      {/* Photorealistic Architectural Aerospace Hangar Backdrop (active in CINEMATIC mode) */}
      {visualMode === 'CINEMATIC' && !webglError && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <img
            src={hangarStudioBackdrop}
            alt="实景工业航空工程机库背景"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center brightness-[0.86] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060b]/85 via-transparent to-[#04060b]/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,transparent_35%,rgba(3,5,10,0.68)_100%)]" />
        </div>
      )}

      {/* Dedicated WebGL Mount */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />

      {webglError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#05070C]/95 p-8 text-center">
          <img
            src={hangarStudioBackdrop}
            alt="工程机库静态建筑参考图"
            referrerPolicy="no-referrer"
            className="mb-4 max-h-[55%] rounded-xl object-cover opacity-80"
          />
          <p className="text-sm font-medium text-amber-400">{webglError}</p>
        </div>
      )}

      {/* Minimal Top-Left Aviation HUD Readout (unobtrusive, solid rgba, zero backdrop-blur) */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2.5 text-xs">
          <span className="font-display font-semibold tracking-wide text-white">
            JOBY S4 DIGITAL TWIN
          </span>
          <span className="text-slate-500">/</span>
          <span className="font-mono text-sky-400">{activeModeSpec.nameEn}</span>
        </div>

        <div className="hidden sm:flex items-center gap-5 font-mono text-[11px] text-slate-300">
          <span>
            倾转 <strong className="text-white">{activeModeSpec.nacelleTiltDeg}°</strong>
          </span>
          <span>
            空速 <strong className="text-white">{activeModeSpec.airspeedKmh} km/h</strong>
          </span>
          <span>
            功率 <strong className="text-amber-300">{activeModeSpec.powerDrawKw} kW</strong>
          </span>
          <span>
            升力分配{' '}
            <strong className="text-emerald-300">
              翼 {activeModeSpec.wingLiftSharePct}% / 桨 {activeModeSpec.rotorLiftSharePct}%
            </strong>
          </span>
        </div>
      </div>

      {/* Top-Right Compact Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowHotspots((v) => !v)}
          className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            showHotspots
              ? 'border-sky-400/70 bg-sky-950/90 text-sky-200'
              : 'border-white/15 bg-[#080C15]/90 text-slate-200 hover:border-white/35 hover:text-white'
          }`}
          aria-pressed={showHotspots}
        >
          <Eye className="mr-1.5 inline h-3.5 w-3.5" />
          {showHotspots ? '隐藏部件标注' : '显示部件标注'}
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectSubsystem(null);
            onChangeExplodeFactor(0);
            onChangeCameraPreset('default');
          }}
          className="whitespace-nowrap rounded-lg border border-white/15 bg-[#080C15]/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/35 hover:text-white"
        >
          <RotateCcw className="mr-1.5 inline h-3.5 w-3.5" />
          重置视角
        </button>
      </div>

      {/* Clean Projected 3D Subsystem Hotspots */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {AIRCRAFT_SUBSYSTEMS.map((sub, idx) => {
          const isActive = selectedSubsystemId === sub.id;
          return (
            <button
              key={sub.id}
              ref={(el) => {
                hotspotRefs.current[sub.id] = el;
              }}
              type="button"
              onClick={() => onSelectSubsystem(isActive ? null : sub.id)}
              style={{ opacity: 0 }}
              className={`absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'border-sky-400 bg-sky-950/95 text-white shadow-lg'
                  : 'border-sky-400/35 bg-[#060D1D]/92 text-slate-100 hover:border-sky-400 hover:text-white'
              }`}
              aria-label={`查看子系统 ${sub.nameZh}`}
            >
              <span className="font-mono font-semibold text-sky-400">0{idx + 1}</span>
              <span>{sub.shortLabelZh}</span>
            </button>
          );
        })}
      </div>

      {/* Technical Inspector Drawer (only visible on active subsystem selection) */}
      {selectedSubsystem && (
        <aside
          className="absolute top-16 right-4 z-20 max-h-[calc(100%-156px)] w-[min(365px,calc(100%-2rem))] overflow-y-auto rounded-xl border border-sky-400/35 bg-[#070C18]/96 p-5 text-left shadow-2xl"
          aria-label="子系统技术规格详情"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-sky-400">
                {selectedSubsystem.code} · {selectedSubsystem.verificationLevel}
              </div>
              <h4 className="mt-1 font-display text-base font-semibold text-white">
                {selectedSubsystem.nameZh}
              </h4>
              <div className="text-xs text-slate-400">{selectedSubsystem.nameEn}</div>
            </div>
            <button
              type="button"
              onClick={() => onSelectSubsystem(null)}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="关闭子系统详情"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-[#04070F] px-3 py-2 font-mono text-xs text-sky-200">
            {selectedSubsystem.headlineMetric}
          </div>

          <dl className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
            {selectedSubsystem.keySpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col gap-0.5">
                <dt className="text-slate-400">{spec.label}</dt>
                <dd className="font-mono text-slate-100">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-300">
            <p className="font-semibold text-white">工程原理剖析</p>
            <p className="mt-1">{selectedSubsystem.engineeringAnalysis}</p>
            <p className="mt-2.5 font-semibold text-amber-300">冗余与失效缓解</p>
            <p className="mt-1">{selectedSubsystem.failureMitigation}</p>
            <p className="mt-2.5 font-mono text-[10px] text-slate-500">
              来源：{selectedSubsystem.sourceRef}
            </p>
          </div>
        </aside>
      )}

      {/* Sleek Collapsible Unified Bottom Control Dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3.5 z-20 flex flex-col items-center px-4">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#070B14]/95 px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> 展开三维控制栏
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> 收起控制栏
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto flex w-full max-w-[1260px] flex-wrap xl:flex-nowrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#070B14]/95 px-3 py-2 shadow-2xl">
            {/* Flight Mode Switcher */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#03050A] p-1">
              {(Object.keys(FLIGHT_MODES) as FlightModeId[]).map((mKey) => {
                const m = FLIGHT_MODES[mKey];
                const active = flightMode === mKey;
                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => onChangeFlightMode(mKey)}
                    className={`whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? 'bg-sky-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {m.nameZh}
                  </button>
                );
              })}
            </div>

            {/* 3 Signature Visual Modes */}
            <div className="flex items-center gap-1 rounded-lg bg-[#03050A] p-1">
              <button
                type="button"
                onClick={() => onChangeVisualMode('CINEMATIC')}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  visualMode === 'CINEMATIC'
                    ? 'bg-white text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                电影渲染
              </button>
              <button
                type="button"
                onClick={() => onChangeVisualMode('ENGINEERING_CAD')}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  visualMode === 'ENGINEERING_CAD'
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="mr-1 inline h-3 w-3" />
                CAD 蓝图
              </button>
              <button
                type="button"
                onClick={() => onChangeVisualMode('AERO_CFD')}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  visualMode === 'AERO_CFD'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Wind className="mr-1 inline h-3 w-3" />
                CFD 流场
              </button>
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="explode-slider"
                className="flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-slate-300"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
                拆解
              </label>
              <input
                id="explode-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodeFactor}
                onChange={(e) => onChangeExplodeFactor(parseFloat(e.target.value))}
                className="w-20 cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-[11px] text-sky-300">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'default', label: '全机' },
                  { id: 'nose', label: '机头' },
                  { id: 'wing', label: '翼展' },
                  { id: 'tail', label: 'V尾' },
                  { id: 'top', label: '俯视' },
                ] as { id: CameraPresetId; label: string }[]
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => {
                    onSelectSubsystem(null);
                    onChangeCameraPreset(cam.id);
                  }}
                  className={`whitespace-nowrap rounded border px-2 py-1 text-[11px] transition-colors ${
                    cameraPreset === cam.id && !selectedSubsystemId
                      ? 'border-sky-400 bg-sky-950/90 text-sky-200'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
