import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, Film, Pause, Play, RotateCcw } from 'lucide-react';
import { buildJobyS4Rig } from '../three/jobyS4Model';
import { createAerospaceStudioEnv } from '../three/studioEnv';
import {
  CINEMA_BEATS,
  CinemaInteractionMode,
  evaluateCinemaState,
} from '../utils/cinemaTimeline';
import plateVertiportEmpty from '../assets/images/plate_vertiport_empty_1795100736031.jpg';
import plateSkylineClimb from '../assets/images/plate_skyline_climb_1795100747276.jpg';
import plateBayCruise from '../assets/images/plate_bay_cruise_1795100742538.jpg';
import cityHorizonPanorama from '../assets/images/panorama_city_horizon_1795084858220.jpg';

gsap.registerPlugin(ScrollTrigger);

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

/**
 * Generates a realistic soft elliptical ground contact shadow texture for locking the Joby S4
 * optically onto the asphalt rooftop vertiport H-pad during parking, liftoff, and touchdown.
 */
function createPadContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    // Broad soft fuselage + wingspan shadow
    const outer = ctx.createRadialGradient(128, 128, 14, 128, 128, 122);
    outer.addColorStop(0, 'rgba(3, 6, 12, 0.78)');
    outer.addColorStop(0.38, 'rgba(3, 6, 12, 0.44)');
    outer.addColorStop(0.72, 'rgba(3, 6, 12, 0.14)');
    outer.addColorStop(1, 'rgba(3, 6, 12, 0)');
    ctx.fillStyle = outer;
    ctx.fillRect(0, 0, 256, 256);

    // Deeper core shadow right under cabin belly & tires
    const core = ctx.createRadialGradient(128, 128, 6, 128, 128, 52);
    core.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    core.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
    core.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Phase 3 Centerpiece: Photorealistic Multi-Shot Cinema City Flight Pilot.
 * Composites our HDRI-lit, micro-detailed, gear-retracting real-time 3D Joby S4 seamlessly over
 * 4 art-directed ARRI-grade golden-hour coastal aerial plates with synchronized camera parallax,
 * Catmull-Rom spline motion, aerodynamic turbulence breathing, grounded pad contact shadows,
 * and instant 360° golden-hour sky-dome takeover in Free-Orbit mode.
 */
export const CityFlightCinemaSection: React.FC = () => {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [interactionMode, setInteractionMode] = useState<CinemaInteractionMode>('CINEMA_SCROLL');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const progressRef = useRef(0);
  const modeRef = useRef<CinemaInteractionMode>('CINEMA_SCROLL');
  const autoPlayRef = useRef(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  modeRef.current = interactionMode;
  autoPlayRef.current = isAutoPlaying;

  // Bind GSAP ScrollTrigger for silky bidirectional scroll scrubbing
  useEffect(() => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onUpdate: (self) => {
        if (autoPlayRef.current) return;
        progressRef.current = self.progress;
        setProgress(self.progress);
      },
    });
    scrollTriggerRef.current = st;

    return () => {
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, []);

  // Auto-play cinema flight cruise when user presses Play
  useEffect(() => {
    if (!isAutoPlaying) return;
    setInteractionMode('CINEMA_SCROLL');
    const id = window.setInterval(() => {
      const next = progressRef.current >= 0.995 ? 0 : Math.min(1, progressRef.current + 0.0038);
      progressRef.current = next;
      setProgress(next);
    }, 32);
    return () => window.clearInterval(id);
  }, [isAutoPlaying]);

  const jumpToBeat = (targetProgress: number) => {
    setIsAutoPlaying(false);
    setInteractionMode('CINEMA_SCROLL');
    progressRef.current = targetProgress;
    setProgress(targetProgress);

    const st = scrollTriggerRef.current;
    if (st) {
      const targetScrollY = st.start + (st.end - st.start) * targetProgress;
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  };

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
      setWebglError(true);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();

    // Custom California Golden-Hour Coastal Aerial HDRI PMREM Environment
    // Optically matches the sunset plates: warm golden sky reflections on top, sapphire bay reflections below
    const envTex = createAerospaceStudioEnv(renderer, 'golden_hour');
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.2, 260);
    const initialState = evaluateCinemaState(0, 'CINEMA_SCROLL');
    camera.position.set(...initialState.cameraPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5.5;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(...initialState.cameraLookAt);

    // =========================================================
    // FREE-ORBIT 360° PHOTOREALISTIC AERIAL SKY DOME (Active ONLY in FREE_ORBIT mode)
    // Eliminates any toy-box cityscape when orbiting 360° freely around the aircraft
    // =========================================================
    const orbitBackdropGroup = new THREE.Group();
    orbitBackdropGroup.visible = false;

    const skyGeo = new THREE.SphereGeometry(160, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: new THREE.Vector3(0.55, 0.22, -0.80).normalize() },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 bayDeep = vec3(0.06, 0.12, 0.20);
          vec3 horizonWarm = vec3(0.95, 0.64, 0.36);
          vec3 midApricot = vec3(0.64, 0.48, 0.44);
          vec3 zenithBlue = vec3(0.11, 0.20, 0.36);

          vec3 col = h < 0.0
            ? mix(horizonWarm * 0.52, bayDeep, smoothstep(0.0, -0.32, h))
            : mix(horizonWarm, midApricot, smoothstep(0.0, 0.24, h));
          if (h > 0.16) {
            col = mix(col, zenithBlue, smoothstep(0.16, 0.85, h));
          }
          float sunDot = max(0.0, dot(d, uSunDir));
          col += vec3(1.0, 0.88, 0.64) * pow(sunDot, 16.0) * 0.55;
          col += vec3(1.0, 0.96, 0.86) * smoothstep(0.996, 0.9992, sunDot) * 1.35;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    orbitBackdropGroup.add(new THREE.Mesh(skyGeo, skyMat));

    const horizonTex = new THREE.TextureLoader().load(cityHorizonPanorama);
    horizonTex.colorSpace = THREE.SRGBColorSpace;
    horizonTex.wrapS = THREE.MirroredRepeatWrapping;
    horizonTex.wrapT = THREE.ClampToEdgeWrapping;
    horizonTex.repeat.set(2, 1);

    const cycloramaGeo = new THREE.CylinderGeometry(125, 125, 42, 48, 1, true);
    const cycloramaMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: horizonTex },
        uMistColor: { value: new THREE.Color(0xc88a5a) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uMistColor;
        varying vec2 vUv;
        void main() {
          vec4 tex = texture2D(uMap, vec2(vUv.x * 2.0, vUv.y));
          float topFade = smoothstep(0.95, 0.55, vUv.y);
          float bottomFade = smoothstep(0.0, 0.18, vUv.y);
          vec3 col = mix(uMistColor, tex.rgb, 0.78);
          gl_FragColor = vec4(col, topFade * bottomFade * 0.88);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const cycloramaMesh = new THREE.Mesh(cycloramaGeo, cycloramaMat);
    cycloramaMesh.position.y = 4;
    orbitBackdropGroup.add(cycloramaMesh);
    scene.add(orbitBackdropGroup);

    // =========================================================
    // GOLDEN-HOUR CINEMA LIGHTING RIG (Matched to right-rear upper sun in all aerial plates)
    // =========================================================
    const hemi = new THREE.HemisphereLight(0xffdfb0, 0x1a283e, 0.64);
    scene.add(hemi);

    // Primary golden sunset key light grazing upper-right fuselage curves to match California sunset plates
    const sunKey = new THREE.DirectionalLight(0xffc982, 2.55);
    sunKey.position.set(22, 13, 10);
    sunKey.castShadow = !isSoftwareGl;
    if (sunKey.castShadow) {
      sunKey.shadow.mapSize.set(1024, 1024);
      sunKey.shadow.camera.left = -8;
      sunKey.shadow.camera.right = 8;
      sunKey.shadow.camera.top = 8;
      sunKey.shadow.camera.bottom = -8;
      sunKey.shadow.bias = -0.0005;
    }
    scene.add(sunKey);

    // Subtle cool coastal sky fill from camera-left side (preserves warm-vs-cool sculpted depth)
    const skyFill = new THREE.DirectionalLight(0x8ec2f0, 0.46);
    skyFill.position.set(-18, 10, 18);
    scene.add(skyFill);

    // Warm sunset backlight rim separating wing & rotor silhouettes from bright golden clouds
    const sunsetRim = new THREE.DirectionalLight(0xff9442, 1.35);
    sunsetRim.position.set(14, 5, -24);
    scene.add(sunsetRim);

    // =========================================================
    // GROUNDED ASPHALT CONTACT SHADOW ON VERTIPORT H-PAD
    // =========================================================
    const padShadowTex = createPadContactShadowTexture();
    const padShadowGeo = new THREE.PlaneGeometry(8.8, 5.6);
    padShadowGeo.rotateX(-Math.PI / 2);
    const padShadowMat = new THREE.MeshBasicMaterial({
      map: padShadowTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const padShadowMesh = new THREE.Mesh(padShadowGeo, padShadowMat);
    padShadowMesh.position.set(-0.52, -1.78, 0.15);
    scene.add(padShadowMesh);

    // =========================================================
    // HERO REAL-TIME 3D JOBY S4 DIGITAL TWIN (6×5-Blade Tilt-Propellers, Retractable Gear)
    // =========================================================
    const rig = buildJobyS4Rig(isSoftwareGl);
    rig.root.scale.setScalar(0.62);
    rig.root.position.set(...initialState.aircraftPos);
    scene.add(rig.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    const _targetCamPos = new THREE.Vector3();
    const _targetLook = new THREE.Vector3();
    let lastMode: CinemaInteractionMode = 'CINEMA_SCROLL';

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
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 85);
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
      const curMode = modeRef.current;
      const state = evaluateCinemaState(progressRef.current, curMode);

      // Organic multi-harmonic aerodynamic micro-motion (zero motion when parked firmly on H-pad)
      const airborneFactor = Math.min(1, Math.max(0, 1 - state.padShadowOpacity));
      const aeroBobY =
        airborneFactor *
        (Math.sin(elapsed * 1.45) * 0.065 + Math.cos(elapsed * 2.7) * 0.025);
      const aeroRoll =
        airborneFactor *
        (Math.sin(elapsed * 0.92) * 0.028 + Math.cos(elapsed * 1.85) * 0.012);
      const aeroPitch =
        airborneFactor * Math.sin(elapsed * 1.18 + 0.6) * 0.016;

      rig.root.position.set(
        state.aircraftPos[0],
        state.aircraftPos[1] + aeroBobY,
        state.aircraftPos[2]
      );
      rig.root.rotation.set(
        state.aircraftRot[0] + aeroPitch,
        state.aircraftRot[1],
        state.aircraftRot[2] + aeroRoll
      );

      // Sync grounded pad contact shadow directly below tires during parking / liftoff / touchdown
      padShadowMesh.visible = state.padShadowOpacity > 0.02 && curMode === 'CINEMA_SCROLL';
      if (padShadowMesh.visible) {
        padShadowMat.opacity = state.padShadowOpacity * 0.88;
        padShadowMesh.position.set(state.aircraftPos[0], -1.73, state.aircraftPos[2]);
        padShadowMesh.rotation.y = state.aircraftRot[1];
        const liftSpread = 1 + (1 - state.padShadowOpacity) * 0.35;
        padShadowMesh.scale.set(liftSpread, 1, liftSpread);
      }

      rig.updateKinematics({
        elapsedSec: elapsed,
        dt,
        tiltDeg: state.nacelleTiltDeg,
        rotorRpm: state.rotorRpm,
        explodeFactor: 0,
        visualMode: 'CINEMATIC',
        selectedSubsystem: null,
        airspeedKmh: state.airspeedKmh,
        gearDeploy: state.gearDeploy,
      });

      renderer.toneMappingExposure = state.exposure;

      // Seamless switch between photorealistic aerial plates and 360° Free-Orbit sky dome
      if (curMode !== lastMode) {
        lastMode = curMode;
        controls.enabled = curMode === 'FREE_ORBIT';
        orbitBackdropGroup.visible = curMode === 'FREE_ORBIT';
        if (curMode === 'FREE_ORBIT') {
          controls.target.set(
            state.aircraftPos[0],
            state.aircraftPos[1],
            state.aircraftPos[2]
          );
        }
      }

      if (curMode === 'CINEMA_SCROLL') {
        // Subtle aerial chase-helicopter lens breathing for genuine cinema weight
        const camDriftX = airborneFactor * Math.sin(elapsed * 0.55) * 0.14;
        const camDriftY = airborneFactor * Math.cos(elapsed * 0.72) * 0.08;

        _targetCamPos.set(
          state.cameraPos[0] + camDriftX,
          state.cameraPos[1] + camDriftY,
          state.cameraPos[2]
        );
        _targetLook.set(...state.cameraLookAt);

        const lambda = 6.5;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, lambda, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLook.x, lambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLook.y, lambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLook.z, lambda, dt);

        if (Math.abs(camera.fov - state.cameraFov) > 0.04) {
          camera.fov = THREE.MathUtils.damp(camera.fov, state.cameraFov, lambda, dt);
          camera.updateProjectionMatrix();
        }
        camera.lookAt(controls.target);
      } else {
        controls.target.lerp(
          _targetLook.set(state.aircraftPos[0], state.aircraftPos[1], state.aircraftPos[2]),
          0.12
        );
        controls.update();
      }

      renderer.render(scene, camera);

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
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      rig.dispose();
      envTex.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      cycloramaGeo.dispose();
      cycloramaMat.dispose();
      horizonTex.dispose();
      padShadowGeo.dispose();
      padShadowMat.dispose();
      padShadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentState = evaluateCinemaState(progress, interactionMode);
  const pct = Math.round(currentState.progress * 100);
  const { plateWeights, plateScale, plateShiftX, plateShiftY } = currentState;

  return (
    <section
      id="city-flight-pilot"
      ref={triggerRef}
      data-beat={currentState.beat.id}
      data-mode={interactionMode}
      data-progress={currentState.progress.toFixed(2)}
      aria-label="城市飞行电影叙事试点"
      className="relative h-[280vh] border-b border-white/10 bg-[#04070D]"
    >
      {/* Sticky Full-Viewport Cinema Stage */}
      <div className="sticky top-[56px] flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-[#060911]">
        {/* Layer 1: Photorealistic 4-Shot Cross-Dissolving ARRI Aerial Plates (zero low-poly toy buildings) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-500"
          style={{ opacity: currentState.plateOpacity }}
        >
          {/* Shot 01: Empty Golden-Hour Rooftop Skyport Establishing Plate */}
          {plateWeights.vertiport > 0.005 && (
            <img
              src={plateVertiportEmpty}
              alt="黄金时刻滨海高架垂直起降港实景"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                opacity: plateWeights.vertiport,
                transform: `translate3d(${plateShiftX}%, ${plateShiftY}%, 0) scale(${plateScale})`,
                transformOrigin: '46% 64%',
              }}
            />
          )}

          {/* Shot 02: Gleaming Golden-Hour Glass Skyscraper Canyon Ascent Plate */}
          {plateWeights.climb > 0.005 && (
            <img
              src={plateSkylineClimb}
              alt="黄金时刻玻璃幕墙金融区楼宇峡谷爬升实景"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                opacity: plateWeights.climb,
                transform: `translate3d(${plateShiftX}%, ${plateShiftY}%, 0) scale(${plateScale})`,
                transformOrigin: '50% 42%',
              }}
            />
          )}

          {/* Shot 03: High-Altitude Sunlit Coastal Bay & Suspension Bridge Cruise Plate */}
          {plateWeights.cruise > 0.005 && (
            <img
              src={plateBayCruise}
              alt="高空滨海海湾与跨海斜拉桥黄金时刻巡航实景"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                opacity: plateWeights.cruise,
                transform: `translate3d(${plateShiftX}%, ${plateShiftY}%, 0) scale(${plateScale})`,
                transformOrigin: '54% 38%',
              }}
            />
          )}

          {/* Shot 04: Twilight-Graded Rooftop Skyport Precision Approach & Touchdown Plate */}
          {plateWeights.approach > 0.005 && (
            <img
              src={plateVertiportEmpty}
              alt="暮色滨海垂直起降港精准进近着陆实景"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                opacity: plateWeights.approach,
                filter: 'brightness(0.70) contrast(1.14) saturate(1.16) hue-rotate(-5deg)',
                transform: `translate3d(${plateShiftX}%, ${plateShiftY}%, 0) scale(${plateScale})`,
                transformOrigin: '45% 63%',
              }}
            />
          )}

          {/* Subtle golden-hour atmospheric lens depth & warm solar bloom veil tying 3D + photography */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 68% 52% at 76% 18%, rgba(255, 198, 128, 0.16) 0%, rgba(255, 165, 92, 0.04) 48%, rgba(6, 10, 18, 0.18) 100%)',
            }}
          />
        </div>

        {/* Layer 2: Real-Time Transparent WebGL Joby S4 (or 360° Aerial Sky Dome in FREE_ORBIT) */}
        <div
          ref={mountRef}
          data-testid="city-flight-3d-canvas"
          data-beat={currentState.beat.id}
          data-mode={interactionMode}
          className={`absolute inset-0 z-10 h-full w-full ${
            interactionMode === 'FREE_ORBIT' ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        />

        {/* WebGL Fallback Card */}
        {webglError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060911] p-6 text-center">
            <img
              src={plateVertiportEmpty}
              alt="城市空中交通高架停机平台参考图"
              referrerPolicy="no-referrer"
              className="max-h-[55vh] rounded-xl object-cover opacity-85"
            />
            <p className="mt-4 text-sm text-slate-300">
              当前环境未启用 WebGL，已自动切换至高质量建筑摄影参考静帧。
            </p>
          </div>
        )}

        {/* Measured Top/Bottom Cinema Letterbox Scrims (zero central subject obstruction) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-44 bg-gradient-to-b from-[#030508]/94 via-[#030508]/58 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-[#030508]/94 via-[#030508]/55 to-transparent"
        />

        {/* Top-Left Minimal Aviation Telemetry & Scene Counter */}
        <div className="pointer-events-none relative z-30 flex items-start justify-between gap-4 px-5 pt-4 sm:px-8 sm:pt-5">
          <div>
            <div className="font-mono text-[11px] tracking-[0.22em] text-amber-300">
              {currentState.beat.code} · {currentState.beat.titleEn}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
              {currentState.beat.titleZh}
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-200/92 sm:text-sm">
              {currentState.beat.captionZh}
            </p>
          </div>

          {/* Right Flight State Telemetry Readout (clean tabular figures) */}
          <div className="hidden md:flex items-center gap-6 rounded-xl border border-white/12 bg-[#050810]/86 px-4 py-2.5 font-mono text-xs tabular-nums">
            <div>
              <div className="text-[10px] text-slate-400">短舱倾转</div>
              <div className="text-sm font-semibold text-sky-300">
                {Math.round(currentState.nacelleTiltDeg)}°
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">空速</div>
              <div className="text-sm font-semibold text-white">
                {currentState.airspeedKmh} km/h
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">起落架</div>
              <div className="text-sm font-semibold text-emerald-300">
                {currentState.gearDeploy < 0.25 ? '已收起' : '已锁定'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">镜头状态</div>
              <div className="text-xs font-semibold text-amber-300">
                {interactionMode === 'FREE_ORBIT' ? '自由环绕检查' : '实景电影运镜'}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer keeping central 3D aircraft & photorealistic sky 100% unobstructed */}
        <div className="flex-1" />

        {/* Unified Bottom Cinema Timeline & Free-Orbit Takeover Bar */}
        <div className="relative z-30 mx-auto w-full max-w-[1260px] px-4 pb-4 sm:px-8 sm:pb-5">
          {/* Interactive Progress Scrub Bar */}
          <div className="mb-2.5 flex items-center gap-3">
            <span className="w-10 font-mono text-[11px] tabular-nums text-slate-300">
              {pct}%
            </span>
            <input
              type="range"
              aria-label="城市飞行电影时间轴进度"
              min={0}
              max={1}
              step={0.005}
              value={currentState.progress}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setIsAutoPlaying(false);
                progressRef.current = v;
                setProgress(v);
              }}
              className="h-1.5 flex-1 cursor-pointer"
            />
            <span className="hidden font-mono text-[11px] text-slate-300 sm:inline">
              {currentState.beat.phaseBadge}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-white/15 bg-[#060A13]/94 px-3 py-2">
            {/* 4 Beat Jump Controls (Forward & Reverse Jump) */}
            <div className="flex flex-wrap items-center gap-1">
              {CINEMA_BEATS.map((beat) => {
                const active = currentState.beat.id === beat.id;
                return (
                  <button
                    key={beat.id}
                    type="button"
                    onClick={() => jumpToBeat(beat.jumpProgress)}
                    className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-white font-semibold text-slate-950'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    0{beat.index + 1}{' '}
                    {beat.id === 'CITY_ESTABLISH'
                      ? '城市揭示'
                      : beat.id === 'VERTICAL_LIFTOFF'
                      ? '垂直起飞'
                      : beat.id === 'TRANSITION_CRUISE'
                      ? '倾转巡航'
                      : '进近降落'}
                  </button>
                );
              })}
            </div>

            {/* Playback + Cinema / Free-Orbit Takeover Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((v) => !v)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:bg-white/15"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-300" />
                    暂停运镜
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-sky-300" />
                    自动巡航
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoPlaying(false);
                  setInteractionMode((m) =>
                    m === 'CINEMA_SCROLL' ? 'FREE_ORBIT' : 'CINEMA_SCROLL'
                  );
                }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  interactionMode === 'FREE_ORBIT'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                }`}
              >
                {interactionMode === 'FREE_ORBIT' ? (
                  <>
                    <Film className="h-3.5 w-3.5" />
                    恢复电影运镜
                  </>
                ) : (
                  <>
                    <Compass className="h-3.5 w-3.5" />
                    自由环绕接管
                  </>
                )}
              </button>

              <button
                type="button"
                aria-label="重置城市飞行至起点"
                onClick={() => jumpToBeat(0)}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
