import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { UamRouteScenario } from '../data/researchData';
import { buildJobyS4Rig } from '../three/jobyS4Model';
import cityHorizonPanorama from '../assets/images/panorama_city_horizon_1795084858220.jpg';

interface Props {
  route: UamRouteScenario;
}

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
 * Generates an illuminated architectural glass-curtain skyscraper facade texture.
 */
function createSkyscraperFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm golden-tinted twilight reflective glass curtain base
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, 256, 512);

    // Subtle vertical architectural mullions
    for (let x = 0; x < 256; x += 16) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(x, 0, 3, 512);
    }

    // Horizontal floor spandrels & warm sunset window reflections
    for (let y = 0; y < 512; y += 14) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(0, y, 256, 4);

      for (let x = 4; x < 252; x += 16) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const r = hash - Math.floor(hash);
        if (r > 0.62) {
          ctx.fillStyle = r > 0.85 ? 'rgba(255, 224, 155, 0.92)' : 'rgba(253, 186, 116, 0.58)';
        } else {
          ctx.fillStyle = 'rgba(100, 130, 165, 0.25)';
        }
        ctx.fillRect(x, y + 4, 10, 9);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Golden-Hour Sunset 3D Coastal Metropolis Air Corridor (Signature Visual #4).
 */
export const CityCorridor3D: React.FC<Props> = ({ route }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [flightProgressPct, setFlightProgressPct] = useState(0);
  const [webglError, setWebglError] = useState(false);

  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd99b66);
    scene.fog = new THREE.FogExp2(0xd89c68, 0.0115);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 260);
    // Hero coastal golden-hour camera framing aircraft, bay & towers against sunset sun disc
    camera.position.set(17.5, 13.0, 29.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.target.set(0, 4.4, -1.5);

    // Custom GLSL Golden-Hour Sunset Sky Dome (Ref #4)
    const skyGeo = new THREE.SphereGeometry(140, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: new THREE.Vector3(-0.32, 0.16, -0.93).normalize() },
      },
      vertexShader: `
        varying vec3 vWorldDir;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldDir = normalize(wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vWorldDir;
        void main() {
          float h = clamp(vWorldDir.y, 0.0, 1.0);
          vec3 horizonCol = vec3(0.98, 0.66, 0.34); // warm golden amber
          vec3 midCol = vec3(0.74, 0.52, 0.44);     // warm apricot haze
          vec3 zenithCol = vec3(0.14, 0.22, 0.38);  // twilight coastal blue

          vec3 sky = mix(horizonCol, midCol, smoothstep(0.0, 0.28, h));
          sky = mix(sky, zenithCol, smoothstep(0.22, 0.85, h));

          float sunDot = max(0.0, dot(normalize(vWorldDir), uSunDir));
          float sunDisc = smoothstep(0.9965, 0.9992, sunDot);
          float sunHalo = pow(sunDot, 14.0) * 0.62;

          sky += vec3(1.0, 0.92, 0.72) * sunHalo + vec3(1.0, 0.98, 0.9) * sunDisc * 1.6;
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Photorealistic golden-hour coastal horizon panorama ring (mirrored + seamless sky fade)
    const horizonTex = new THREE.TextureLoader().load(cityHorizonPanorama);
    horizonTex.colorSpace = THREE.SRGBColorSpace;
    horizonTex.wrapS = THREE.MirroredRepeatWrapping;
    horizonTex.wrapT = THREE.ClampToEdgeWrapping;
    horizonTex.repeat.set(2, 1);
    const horizonGeo = new THREE.CylinderGeometry(118, 118, 42, 48, 1, true);
    const horizonMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: horizonTex },
        uMistColor: { value: new THREE.Color(0xc98b5b) },
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
          float topFade = smoothstep(0.95, 0.56, vUv.y);
          float bottomFade = smoothstep(0.0, 0.14, vUv.y);
          vec3 col = mix(uMistColor, tex.rgb, 0.78);
          gl_FragColor = vec4(col, topFade * bottomFade * 0.90);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const horizonRing = new THREE.Mesh(horizonGeo, horizonMat);
    horizonRing.position.y = 14;
    scene.add(horizonRing);

    // Warm golden sunset lighting rig
    const hemi = new THREE.HemisphereLight(0xfde68a, 0x1e293b, 0.92);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xffb454, 2.4);
    sunLight.position.set(-22, 16, -45);
    scene.add(sunLight);

    const frontFill = new THREE.DirectionalLight(0xbae6fd, 0.78);
    frontFill.position.set(18, 12, 24);
    scene.add(frontFill);

    // Shimmering coastal bay water with golden sunset sheen
    const waterGeo = new THREE.PlaneGeometry(240, 240);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1e3148,
      metalness: 0.86,
      roughness: 0.16,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -0.02;
    scene.add(waterMesh);

    // Coastal waterfront promenades & illuminated quay edges
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x222e40,
      roughness: 0.85,
      metalness: 0.15,
    });
    const quayLightMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const leftDistrict = new THREE.Mesh(new THREE.BoxGeometry(24, 0.45, 58), deckMat);
    leftDistrict.position.set(-18.5, 0.22, 0);
    scene.add(leftDistrict);

    const leftQuayTrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 58), quayLightMat);
    leftQuayTrim.position.set(-6.52, 0.46, 0);
    scene.add(leftQuayTrim);

    const rightDistrict = new THREE.Mesh(new THREE.BoxGeometry(24, 0.45, 58), deckMat);
    rightDistrict.position.set(18.5, 0.22, 0);
    scene.add(rightDistrict);

    const rightQuayTrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 58), quayLightMat);
    rightQuayTrim.position.set(6.52, 0.46, 0);
    scene.add(rightQuayTrim);

    // Architectural high-rise glass towers with illuminated curtain-wall facades & dark slate roofs
    const facadeTex = createSkyscraperFacadeTexture();
    const towerCount = 96;
    const towerGeo = new THREE.BoxGeometry(1, 1, 1);
    const towerSideMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: facadeTex,
      metalness: 0.52,
      roughness: 0.3,
    });
    const towerRoofMat = new THREE.MeshStandardMaterial({
      color: 0x1b2636,
      metalness: 0.35,
      roughness: 0.72,
    });
    const towerMat = [
      towerSideMat,
      towerSideMat,
      towerRoofMat,
      towerRoofMat,
      towerSideMat,
      towerSideMat,
    ];
    const towerInstanced = new THREE.InstancedMesh(towerGeo, towerMat, towerCount);

    // Dark architectural rooftop mechanical penthouses (no glaring white slabs)
    const crownGeo = new THREE.BoxGeometry(0.68, 0.12, 0.68);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x243347,
      metalness: 0.55,
      roughness: 0.48,
    });
    const crownInstanced = new THREE.InstancedMesh(crownGeo, crownMat, towerCount);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    const populateSkyline = (seed: number) => {
      for (let i = 0; i < towerCount; i++) {
        const s = Math.sin(seed * 13.7 + i * 7.31) * 43758.5453;
        const r1 = s - Math.floor(s);
        const s2 = Math.sin(seed * 3.1 + i * 19.17) * 23421.631;
        const r2 = s2 - Math.floor(s2);

        const isLeft = i % 2 === 0;
        const x = (isLeft ? -1 : 1) * (9.2 + r1 * 17.5);
        const z = (r2 - 0.5) * 48;
        const w = 1.6 + r1 * 2.1;
        const d = 1.6 + r2 * 2.1;
        const h = 2.6 + Math.pow(r1 * 0.58 + r2 * 0.42, 1.55) * 15.8;

        dummy.position.set(x, h / 2 + 0.42, z);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        towerInstanced.setMatrixAt(i, dummy.matrix);

        dummy.position.set(x, h + 0.42 + h * 0.035, z);
        dummy.scale.set(w, Math.max(0.7, h * 0.52), d);
        dummy.updateMatrix();
        crownInstanced.setMatrixAt(i, dummy.matrix);

        const warmTint = 0.85 + r2 * 0.25;
        color.setRGB(warmTint, warmTint * 0.94, warmTint * 0.88);
        towerInstanced.setColorAt(i, color);
      }
      towerInstanced.instanceMatrix.needsUpdate = true;
      crownInstanced.instanceMatrix.needsUpdate = true;
      if (towerInstanced.instanceColor) towerInstanced.instanceColor.needsUpdate = true;
      towerInstanced.computeBoundingSphere();
      crownInstanced.computeBoundingSphere();
    };
    populateSkyline(route.cityBuildingsSeed);
    scene.add(towerInstanced);
    scene.add(crownInstanced);

    // Coastal Marina Yachts moored in the central harbor channel
    const yachtGeo = new THREE.CapsuleGeometry(0.18, 0.85, 6, 12);
    yachtGeo.rotateX(Math.PI / 2);
    const yachtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 });
    const yachtPositions: [number, number][] = [
      [-4.2, 6.5],
      [-3.5, 2.2],
      [3.8, 5.4],
      [4.5, -3.5],
      [-4.0, -7.8],
      [3.2, -11.0],
    ];
    yachtPositions.forEach(([yx, yz]) => {
      const yMesh = new THREE.Mesh(yachtGeo, yachtMat);
      yMesh.position.set(yx, 0.12, yz);
      yMesh.rotation.y = yx < 0 ? 0.35 : -0.35;
      scene.add(yMesh);
    });

    // Origin & Destination Elevated Skyports / Vertiports
    const padPosA = new THREE.Vector3(-11.5, 4.2, 10.5);
    const padPosB = new THREE.Vector3(11.5, 3.8, -10.5);

    const createVertiportPad = (pos: THREE.Vector3, accentHex: number) => {
      const grp = new THREE.Group();
      const deck = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.75, 0.42, 32),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
      );
      grp.add(deck);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.55, 1.88, 36),
        new THREE.MeshBasicMaterial({ color: accentHex, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.23;
      grp.add(ring);

      const towerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.7, pos.y, 20),
        towerMat
      );
      towerBase.position.y = -pos.y / 2;
      grp.add(towerBase);

      grp.position.copy(pos);
      return grp;
    };

    scene.add(createVertiportPad(padPosA, 0x38bdf8));
    scene.add(createVertiportPad(padPosB, 0xfbbf24));

    // Luminous 3D Urban Air Corridor Flight Path
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(padPosA.x, padPosA.y + 0.75, padPosA.z),
      new THREE.Vector3(padPosA.x + 1.8, padPosA.y + 6.4, padPosA.z - 2.2),
      new THREE.Vector3(0, 11.4, 0),
      new THREE.Vector3(padPosB.x - 1.8, padPosB.y + 6.0, padPosB.z + 2.2),
      new THREE.Vector3(padPosB.x, padPosB.y + 0.75, padPosB.z),
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 72, 0.085, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.78,
    });
    scene.add(new THREE.Mesh(tubeGeo, tubeMat));

    // Scaled Sculpted Joby S4 flying gracefully through golden sunset sky
    const flyer = buildJobyS4Rig(isSoftwareGl);
    flyer.root.scale.setScalar(0.56);
    scene.add(flyer.root);

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.04 }
    );
    io.observe(container);

    const _pt = new THREE.Vector3();
    const _nextPt = new THREE.Vector3();
    let frameId = 0;
    let disposed = false;
    let prevTime = performance.now();
    let elapsed = 4.8; // Start aircraft mid-corridor above golden skyline so initial frame is dramatic!
    let lastUiUpdate = 0;
    let lastSeed = route.cityBuildingsSeed;

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

      if (routeRef.current.cityBuildingsSeed !== lastSeed) {
        lastSeed = routeRef.current.cityBuildingsSeed;
        populateSkyline(lastSeed);
      }

      const cycleT = (elapsed % 18) / 18;
      curve.getPointAt(cycleT, _pt);
      curve.getPointAt(Math.min(0.999, cycleT + 0.01), _nextPt);

      flyer.root.position.copy(_pt);
      flyer.root.lookAt(_nextPt);

      let tiltDeg = 0;
      let rpm = 380;
      if (cycleT < 0.16) {
        tiltDeg = 90 - (cycleT / 0.16) * 90;
        rpm = 760;
      } else if (cycleT > 0.84) {
        tiltDeg = ((cycleT - 0.84) / 0.16) * 85;
        rpm = 720;
      }

      flyer.updateKinematics({
        elapsedSec: elapsed,
        dt,
        tiltDeg,
        rotorRpm: rpm,
        explodeFactor: 0,
        visualMode: 'CINEMATIC',
        selectedSubsystem: null,
        airspeedKmh: tiltDeg > 30 ? 45 : 265,
      });

      if (elapsed - lastUiUpdate > 0.25) {
        lastUiUpdate = elapsed;
        setFlightProgressPct(Math.round(cycleT * 100));
      }

      controls.update();
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
      controls.dispose();
      flyer.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      horizonTex.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      towerGeo.dispose();
      towerSideMat.dispose();
      towerRoofMat.dispose();
      deckMat.dispose();
      quayLightMat.dispose();
      crownGeo.dispose();
      crownMat.dispose();
      facadeTex.dispose();
      yachtGeo.dispose();
      yachtMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1B1924]">
      <div ref={mountRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
      {webglError && (
        <div className="flex h-full items-center justify-center p-6 text-sm text-slate-400">
          3D 城市航线仿真需要 WebGL 支持。
        </div>
      )}
      <div className="pointer-events-none absolute top-3.5 left-3.5 z-10 rounded-lg border border-white/15 bg-[#080C15]/88 px-3.5 py-2 text-xs">
        <div className="font-display font-semibold text-white">{route.cityZh}</div>
        <div className="mt-0.5 font-mono text-[11px] text-amber-300">
          {route.originName} → {route.destinationName}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/15 bg-[#080C15]/88 px-4 py-2 text-xs font-mono">
        <span className="text-slate-200">
          空中直线 {route.airDistanceKm} km · 巡航高度 {route.cruiseAltitudeM} m
        </span>
        <span className="text-sky-300">
          航段进度 {flightProgressPct}% ·{' '}
          {flightProgressPct < 16
            ? '垂直离场爬升 (90°→0°)'
            : flightProgressPct > 84
            ? '减速倾转进近 (0°→85°)'
            : '高速固定翼巡航 (265 km/h)'}
        </span>
      </div>
    </div>
  );
};
