import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildJobyS4Rig } from '../three/jobyS4Model';
import { createAerospaceStudioEnv } from '../three/studioEnv';

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
 * Generates a subtle radial studio floor light reflection map for the dark cinema hangar.
 */
function createStudioFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, 512, 512);
    const grad = ctx.createRadialGradient(256, 256, 12, 256, 256, 240);
    grad.addColorStop(0, 'rgba(130, 165, 205, 0.24)');
    grad.addColorStop(0.42, 'rgba(60, 82, 112, 0.14)');
    grad.addColorStop(0.75, 'rgba(16, 24, 38, 0.05)');
    grad.addColorStop(1, 'rgba(4, 6, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Full-bleed dark studio cinema hero canvas (Signature Visual #1).
 * Features dramatic rim-lit sculpted Joby S4 emerging from darkness on a reflective studio floor
 * with scroll-driven cinematic camera sweep and offscreen pause for 60 FPS performance.
 */
export const HeroStage3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

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
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const envTex = createAerospaceStudioEnv(renderer, 'hangar');
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);
    // Low-angle cinematic 3/4 front-quarter framing (full sculpted wingtip & 6 rotors visible)
    camera.position.set(4.85, 0.96, 8.95);
    camera.lookAt(0.55, 0.16, -0.15);

    // High-contrast studio lighting rig (dramatic overhead strip + icy cyan rim + subtle bounce)
    const hemi = new THREE.HemisphereLight(0xa5d8ff, 0x090d14, 0.42);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.55);
    keyLight.position.set(3.5, 9.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -7;
      keyLight.shadow.camera.right = 7;
      keyLight.shadow.camera.top = 7;
      keyLight.shadow.camera.bottom = -7;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    // Sculpting warm golden-hour rim light harmonizing Joby S4 with coastal skyline backdrop
    const rimLight = new THREE.DirectionalLight(0xffb969, 1.95);
    rimLight.position.set(-7.5, 3.2, -5.5);
    scene.add(rimLight);

    // Subtle cool sky accent sweep light
    const sweepLight = new THREE.PointLight(0xbae6fd, 3.8, 16, 1.5);
    sweepLight.position.set(2.8, 1.4, 4.6);
    scene.add(sweepLight);

    // Subtle translucent twilight tarmac reflection disc beneath aircraft
    const floorTex = createStudioFloorTexture();
    const floorY = -0.92;
    const floorGeo = new THREE.CircleGeometry(18, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTex,
      metalness: 0.72,
      roughness: 0.28,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = floorY;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Soft contact shadow directly under landing gear & fuselage
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const g = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
      g.addColorStop(0, 'rgba(0,0,0,0.92)');
      g.addColorStop(0.5, 'rgba(0,0,0,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = g;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 7.6),
      new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.set(2.25, floorY + 0.015, -0.45);
    scene.add(contactPlane);

    // Restrained atmospheric dust motes floating in studio spotlight
    const dustCount = 90;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 16;
      dustPos[i * 3 + 1] = Math.random() * 5.2 - 0.6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.032,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Mount sculpted Joby S4 right-of-center so editorial hero headline breathes cleanly on the left
    const rig = buildJobyS4Rig(isSoftwareGl);
    rig.root.position.set(2.25, 0.04, -0.45);
    rig.root.rotation.y = THREE.MathUtils.degToRad(-24);
    scene.add(rig.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    let scrollProgress = 0;
    const onScroll = () => {
      const h = Math.max(window.innerHeight, 600);
      scrollProgress = THREE.MathUtils.clamp(window.scrollY / h, 0, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

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
          frameId = window.setTimeout(cb, 90);
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

      // Subtle cinema spotlight sweep across sculpted fuselage
      sweepLight.position.x = Math.cos(elapsed * 0.42) * 4.4 + 1.1;
      sweepLight.position.z = Math.sin(elapsed * 0.42) * 3.8 + 2.2;

      // Scroll-driven camera dolly from low-front nose toward dramatic 3/4 side profile
      const targetCamX = THREE.MathUtils.lerp(4.65, 7.4, scrollProgress) + Math.sin(elapsed * 0.24) * 0.32;
      const targetCamY = THREE.MathUtils.lerp(1.02, 2.05, scrollProgress);
      const targetCamZ = THREE.MathUtils.lerp(9.65, 6.8, scrollProgress);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3.5, dt);
      camera.lookAt(0.15, 0.16, -0.15);

      // Gentle pre-flight ready tilt (slightly angled forward 22 deg -> sporty aggressive look)
      const heroTilt = THREE.MathUtils.lerp(14, 52, scrollProgress);
      rig.updateKinematics({
        elapsedSec: elapsed,
        dt,
        tiltDeg: heroTilt,
        rotorRpm: 165,
        explodeFactor: 0,
        visualMode: 'CINEMATIC',
        selectedSubsystem: null,
        airspeedKmh: 0,
      });

      dustPoints.rotation.y = elapsed * 0.015;

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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      rig.dispose();
      envTex.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();
      contactPlane.geometry.dispose();
      (contactPlane.material as THREE.Material).dispose();
      contactTex.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      data-testid="hero-3d-canvas"
    />
  );
};
