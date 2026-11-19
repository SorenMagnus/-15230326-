import * as THREE from 'three';

export type VisualRenderMode = 'CINEMATIC' | 'ENGINEERING_CAD' | 'AERO_CFD';

export interface JobyS4Rig {
  root: THREE.Group;
  subsystems: {
    airframe: THREE.Group;
    wing_vtail: THREE.Group;
    propulsion: THREE.Group;
    battery: THREE.Group;
    avionics: THREE.Group;
    landing_gear: THREE.Group;
  };
  nacelles: {
    group: THREE.Group;
    rotorSpinner: THREE.Group;
    blurDisc: THREE.Mesh;
    thrustWash: THREE.Mesh;
    spinDirection: 1 | -1;
    basePosition: THREE.Vector3;
  }[];
  streamlinesGroup: THREE.Group;
  explodeConnectors: THREE.LineSegments;
  updateKinematics: (params: {
    elapsedSec: number;
    dt: number;
    tiltDeg: number;
    rotorRpm: number;
    explodeFactor: number;
    visualMode: VisualRenderMode;
    selectedSubsystem: string | null;
    airspeedKmh: number;
    gearDeploy?: number;
  }) => void;
  dispose: () => void;
}

/**
 * Generates a fine woven carbon-fiber procedural albedo texture.
 */
function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#141820';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) {
      for (let x = 0; x < 128; x += 8) {
        const alt = ((x / 8 + y / 8) % 2) === 0;
        ctx.fillStyle = alt ? '#232a36' : '#0f131a';
        ctx.fillRect(x, y, 7, 7);
        ctx.fillStyle = alt ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y, 7, 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates industrial aerospace white composite paint albedo + roughness/bump maps
 * (panel seams, inspection hatches, subtle pearl micro-variation — eliminates plastic look).
 */
function createAerospacePaintTextures(): {
  albedo: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const size = 512;
  const aCanvas = document.createElement('canvas');
  aCanvas.width = size;
  aCanvas.height = size;
  const aCtx = aCanvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');

  if (aCtx && rCtx) {
    // Base satin aerospace pearl-composite finish (calibrated so sunlit curvature never clips to flat white)
    aCtx.fillStyle = '#dfe6f0';
    aCtx.fillRect(0, 0, size, size);

    // Base roughness (~0.28) with subtle satin composite panel variation
    rCtx.fillStyle = '#4a4a4a';
    rCtx.fillRect(0, 0, size, size);

    // Subtle micro-grain industrial sheen variation (no sterile flat uniform fill)
    for (let i = 0; i < 420; i++) {
      const px = (i * 73) % size;
      const py = (i * 137) % size;
      const w = 18 + (i % 38);
      const h = 12 + (i % 26);
      aCtx.fillStyle = i % 2 === 0 ? 'rgba(226,232,240,0.16)' : 'rgba(255,255,255,0.12)';
      aCtx.fillRect(px, py, w, h);
      rCtx.fillStyle = i % 2 === 0 ? 'rgba(85,85,85,0.18)' : 'rgba(52,52,52,0.18)';
      rCtx.fillRect(px, py, w, h);
    }

    // Precision aerospace composite panel seam lines
    aCtx.strokeStyle = 'rgba(100, 116, 139, 0.26)';
    aCtx.lineWidth = 1.5;
    rCtx.strokeStyle = 'rgba(165, 165, 165, 0.65)';
    rCtx.lineWidth = 2.0;

    [128, 256, 384].forEach((line) => {
      aCtx.beginPath();
      aCtx.moveTo(0, line);
      aCtx.lineTo(size, line);
      aCtx.stroke();

      rCtx.beginPath();
      rCtx.moveTo(0, line);
      rCtx.lineTo(size, line);
      rCtx.stroke();
    });

    [170, 342].forEach((col) => {
      aCtx.beginPath();
      aCtx.moveTo(col, 0);
      aCtx.lineTo(col, size);
      aCtx.stroke();

      rCtx.beginPath();
      rCtx.moveTo(col, 0);
      rCtx.lineTo(col, size);
      rCtx.stroke();
    });

    // Recessed inspection hatches & flush fastener dots
    aCtx.strokeStyle = 'rgba(71, 85, 105, 0.34)';
    aCtx.strokeRect(42, 148, 86, 62);
    aCtx.strokeRect(368, 276, 92, 54);
    rCtx.fillStyle = 'rgba(130, 130, 130, 0.35)';
    rCtx.fillRect(42, 148, 86, 62);
    rCtx.fillRect(368, 276, 92, 54);
  }

  const albedo = new THREE.CanvasTexture(aCanvas);
  albedo.wrapS = THREE.RepeatWrapping;
  albedo.wrapT = THREE.RepeatWrapping;
  albedo.repeat.set(2, 2);
  albedo.colorSpace = THREE.SRGBColorSpace;

  const roughness = new THREE.CanvasTexture(rCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(2, 2);

  return { albedo, roughness };
}

/**
 * Generates a radial motion-blur rotor disc texture for spinning 5-blade propellers.
 */
function createRotorBlurTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    const cx = 128;
    const cy = 128;
    // Soft outer swept blur ring
    const rad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 126);
    rad.addColorStop(0, 'rgba(200, 230, 255, 0.0)');
    rad.addColorStop(0.22, 'rgba(180, 220, 255, 0.08)');
    rad.addColorStop(0.78, 'rgba(190, 230, 255, 0.16)');
    rad.addColorStop(0.94, 'rgba(56, 189, 248, 0.32)');
    rad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(cx, cy, 126, 0, Math.PI * 2);
    ctx.fill();

    // 5 subtle motion-blurred blade streaks
    for (let i = 0; i < 5; i++) {
      const a0 = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 122, a0, a0 + 0.34);
      ctx.closePath();
      ctx.fillStyle = 'rgba(226, 240, 255, 0.14)';
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a sleek multi-station lofted BufferGeometry fuselage (nose at +Z, tailcone at -Z).
 */
function createSculptedFuselageGeometry(): THREE.BufferGeometry {
  // Stations: [z, halfWidth, topY, bottomY, flatness]
  const stations: [number, number, number, number][] = [
    [2.68, 0.001, -0.05, -0.05],
    [2.56, 0.19, 0.08, -0.22],
    [2.28, 0.42, 0.28, -0.38],
    [1.82, 0.62, 0.52, -0.49],
    [1.22, 0.72, 0.66, -0.53],
    [0.52, 0.74, 0.68, -0.52],
    [-0.25, 0.67, 0.62, -0.46],
    [-1.05, 0.46, 0.48, -0.28],
    [-1.85, 0.24, 0.35, -0.08],
    [-2.52, 0.13, 0.28, 0.06],
    [-2.82, 0.001, 0.20, 0.20],
  ];

  const radialSegs = 36;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < stations.length; s++) {
    const [z, rx, topY, botY] = stations[s];
    const cy = (topY + botY) * 0.5;
    const ryTop = Math.max(0.001, topY - cy);
    const ryBot = Math.max(0.001, cy - botY);

    for (let r = 0; r <= radialSegs; r++) {
      const theta = (r / radialSegs) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Slightly fuller shoulder & flatter aerodynamic belly
      const x = cosT * rx * (sinT < 0 ? 0.96 : 1.0);
      const y = cy + (sinT >= 0 ? Math.pow(sinT, 0.92) * ryTop : -Math.pow(-sinT, 0.82) * ryBot);

      positions.push(x, y, z);
      uvs.push(r / radialSegs, s / (stations.length - 1));
    }
  }

  const stride = radialSegs + 1;
  for (let s = 0; s < stations.length - 1; s++) {
    for (let r = 0; r < radialSegs; r++) {
      // Open genuine cockpit window aperture strictly inside the conformal smoked glass canopy overlap
      const isCockpitWindowAperture =
        (s === 3 && r >= 4 && r <= 13) || (s === 4 && r >= 5 && r <= 12);
      if (isCockpitWindowAperture) continue;

      const a = s * stride + r;
      const b = (s + 1) * stride + r;
      const c = (s + 1) * stride + (r + 1);
      const d = s * stride + (r + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a perfectly conformal wrap-around smoked glass panoramic windshield/canopy
 * directly from the fuselage loft station math (+0.015 outward offset), eliminating Z-fighting.
 */
function createConformalCanopyGeometry(): THREE.BufferGeometry {
  // Interpolated stations over the cockpit windshield & panoramic side windows (z: 2.34 -> 0.28)
  // Format: [z, rx, topY, botY, minAngleDeg, maxAngleDeg]
  const stations: [number, number, number, number, number, number][] = [
    [2.26, 0.435, 0.295, -0.37, 68, 112],
    [2.05, 0.535, 0.425, -0.44, 34, 146],
    [1.82, 0.635, 0.538, -0.48, 22, 158],
    [1.48, 0.705, 0.628, -0.51, 18, 162],
    [1.12, 0.742, 0.682, -0.52, 18, 162],
    [0.72, 0.755, 0.696, -0.51, 22, 158],
    [0.36, 0.735, 0.678, -0.49, 44, 136],
  ];

  const arcSegs = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < stations.length; s++) {
    const [z, rx, topY, botY, aMin, aMax] = stations[s];
    const cy = (topY + botY) * 0.5;
    const ryTop = Math.max(0.001, topY - cy);
    const ryBot = Math.max(0.001, cy - botY);
    const startRad = THREE.MathUtils.degToRad(aMin);
    const endRad = THREE.MathUtils.degToRad(aMax);

    for (let r = 0; r <= arcSegs; r++) {
      const t = r / arcSegs;
      const theta = THREE.MathUtils.lerp(startRad, endRad, t);
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const x = cosT * (rx + 0.014);
      const y = cy + (sinT >= 0 ? Math.pow(sinT, 0.92) * (ryTop + 0.014) : -Math.pow(-sinT, 0.82) * ryBot);
      positions.push(x, y, z);
      uvs.push(t, s / (stations.length - 1));
    }
  }

  const stride = arcSegs + 1;
  for (let s = 0; s < stations.length - 1; s++) {
    for (let r = 0; r < arcSegs; r++) {
      const a = s * stride + r;
      const b = (s + 1) * stride + r;
      const c = (s + 1) * stride + (r + 1);
      const d = s * stride + (r + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a genuinely tapered, swept NACA-style cambered airfoil half-wing (left or right).
 */
function createTaperedWingGeometry(side: 1 | -1): THREE.BufferGeometry {
  // Spanwise stations from root x=0.35 to tip x=5.32
  const stations: { x: number; y: number; zLead: number; chord: number; thick: number }[] = [
    { x: 0.34, y: 0.44, zLead: 0.72, chord: 1.46, thick: 0.19 },
    { x: 1.25, y: 0.48, zLead: 0.64, chord: 1.24, thick: 0.16 },
    { x: 2.55, y: 0.53, zLead: 0.52, chord: 1.02, thick: 0.135 },
    { x: 3.95, y: 0.59, zLead: 0.38, chord: 0.82, thick: 0.108 },
    { x: 5.26, y: 0.65, zLead: 0.25, chord: 0.62, thick: 0.082 },
    { x: 5.36, y: 0.67, zLead: 0.18, chord: 0.32, thick: 0.02 }, // blended tip cap
  ];

  // NACA 2412 normalized airfoil contour around closed loop
  const profileSegs = 28;
  const profile: [number, number][] = [];
  for (let i = 0; i <= profileSegs; i++) {
    const t = i / profileSegs; // 0..1 around airfoil: 0=TE, 0.5=LE, 1=TE
    const angle = t * Math.PI * 2;
    const xc = 0.5 * (1 + Math.cos(angle)); // 1 at TE -> 0 at LE -> 1 at TE
    // Classic NACA 4-digit half-thickness distribution
    const yt =
      5 *
      0.14 *
      (0.2969 * Math.sqrt(Math.max(0.0001, xc)) -
        0.126 * xc -
        0.3516 * xc * xc +
        0.2843 * xc * xc * xc -
        0.1015 * xc * xc * xc * xc);
    const camber = 0.025 * Math.sin(Math.PI * xc);
    const yc = t <= 0.5 ? camber + yt : camber - yt;
    profile.push([xc, yc]);
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < stations.length; s++) {
    const st = stations[s];
    for (let p = 0; p <= profileSegs; p++) {
      const [xc, yc] = profile[p];
      const px = st.x * side;
      const py = st.y + yc * (st.thick / 0.14);
      const pz = st.zLead - xc * st.chord;
      positions.push(px, py, pz);
      uvs.push(s / (stations.length - 1), p / profileSegs);
    }
  }

  const stride = profileSegs + 1;
  for (let s = 0; s < stations.length - 1; s++) {
    for (let p = 0; p < profileSegs; p++) {
      const a = s * stride + p;
      const b = (s + 1) * stride + p;
      const c = (s + 1) * stride + (p + 1);
      const d = s * stride + (p + 1);
      if (side === 1) {
        indices.push(a, d, b);
        indices.push(b, d, c);
      } else {
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a tapered airfoil V-tail stabilizer fin (left or right).
 */
function createVTailFinGeometry(side: 1 | -1): THREE.BufferGeometry {
  const stations = [
    { x: 0.08, y: 0.24, zLead: -1.78, chord: 0.92, thick: 0.09 },
    { x: 0.78, y: 0.86, zLead: -2.02, chord: 0.74, thick: 0.075 },
    { x: 1.46, y: 1.46, zLead: -2.26, chord: 0.56, thick: 0.06 },
  ];

  const segs = 20;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < stations.length; s++) {
    const st = stations[s];
    for (let p = 0; p <= segs; p++) {
      const angle = (p / segs) * Math.PI * 2;
      const xc = 0.5 * (1 + Math.cos(angle));
      const yt = Math.sin(angle) * st.thick * 0.5 * Math.pow(1 - xc * 0.65, 0.5);
      // Normal perpendicular to 41 deg V-tail fin plane
      const nx = -0.66 * side;
      const ny = 0.75;
      const px = st.x * side + nx * yt;
      const py = st.y + ny * yt;
      const pz = st.zLead - xc * st.chord;
      positions.push(px, py, pz);
      uvs.push(s / (stations.length - 1), p / segs);
    }
  }

  const stride = segs + 1;
  for (let s = 0; s < stations.length - 1; s++) {
    for (let p = 0; p < segs; p++) {
      const a = s * stride + p;
      const b = (s + 1) * stride + p;
      const c = (s + 1) * stride + (p + 1);
      const d = s * stride + (p + 1);
      if (side === 1) {
        indices.push(a, d, b);
        indices.push(b, d, c);
      } else {
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sleek sculpted 5-blade asymmetric scimitar low-noise rotor assembly.
 */
function createScimitarFiveBladeRotor(
  carbonMat: THREE.Material,
  metalMat: THREE.Material,
  tipMat: THREE.Material,
  radius = 0.92
): THREE.Group {
  const rotorGroup = new THREE.Group();

  // Sleek aerodynamic ogive spinner cone
  const spinnerPts: THREE.Vector2[] = [
    new THREE.Vector2(0.0, 0.24),
    new THREE.Vector2(0.06, 0.16),
    new THREE.Vector2(0.11, 0.04),
    new THREE.Vector2(0.125, -0.05),
  ];
  const spinnerGeo = new THREE.LatheGeometry(spinnerPts, 24);
  spinnerGeo.rotateX(Math.PI / 2);
  const spinner = new THREE.Mesh(spinnerGeo, metalMat);
  rotorGroup.add(spinner);

  // Asymmetric Joby S4 patented angular spacing for acoustic spread
  const bladeAnglesDeg = [0, 68, 142, 214, 289];
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0.08, -0.022);
  bladeShape.bezierCurveTo(radius * 0.35, -0.068, radius * 0.72, -0.052, radius * 0.95, -0.018);
  bladeShape.quadraticCurveTo(radius * 1.02, 0.008, radius * 0.96, 0.026);
  bladeShape.bezierCurveTo(radius * 0.68, 0.036, radius * 0.32, 0.032, 0.08, 0.02);
  bladeShape.closePath();

  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  bladeGeo.translate(0, 0, -0.005);

  bladeAnglesDeg.forEach((deg) => {
    const holder = new THREE.Group();
    holder.rotation.z = THREE.MathUtils.degToRad(deg);

    const blade = new THREE.Mesh(bladeGeo, carbonMat);
    blade.rotation.x = THREE.MathUtils.degToRad(18);
    holder.add(blade);

    const tipAccent = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.032, 0.015), tipMat);
    tipAccent.position.set(radius * 0.94, 0.004, 0);
    tipAccent.rotation.x = THREE.MathUtils.degToRad(18);
    holder.add(tipAccent);

    rotorGroup.add(holder);
  });

  return rotorGroup;
}

/**
 * Builds 56 smooth 3D multi-colored aerodynamic streamline curves wrapping around the aircraft
 * for Signature Visual #3 (Aerodynamics Lab), animated via custom GLSL vertex/fragment shader.
 */
function createAerodynamicStreamlines(): {
  group: THREE.Group;
  shaderMat: THREE.ShaderMaterial;
  updateFlowShape: (hoverRatio: number) => void;
} {
  const group = new THREE.Group();

  const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uOpacity: { value: 0.85 },
    },
    vertexShader: `
      attribute float aProgress;
      attribute vec3 aColor;
      varying float vProgress;
      varying vec3 vColor;
      void main() {
        vProgress = aProgress;
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uOpacity;
      varying float vProgress;
      varying vec3 vColor;
      void main() {
        // Animated luminous aerodynamic flow pulses racing along each streamline
        float wave = fract(vProgress * 3.0 - uTime * uSpeed * 0.65);
        float pulse = smoothstep(0.0, 0.25, wave) * (1.0 - smoothstep(0.65, 1.0, wave));
        float edgeFade = smoothstep(0.0, 0.12, vProgress) * (1.0 - smoothstep(0.86, 1.0, vProgress));
        float intensity = (0.32 + pulse * 0.88) * edgeFade;
        gl_FragColor = vec4(vColor * (0.85 + pulse * 0.55), intensity * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  interface StreamRecord {
    line: THREE.Line;
    cruisePts: THREE.Vector3[];
    hoverPts: THREE.Vector3[];
    samples: number;
  }

  const records: StreamRecord[] = [];
  const samples = 46;

  // Color palette matching high-end CFD visualization (Ref #3): cyan -> emerald -> gold -> coral/magenta near stagnation
  const colCyan = new THREE.Color(0x22d3ee);
  const colEmerald = new THREE.Color(0x34d399);
  const colAmber = new THREE.Color(0xfbbf24);
  const colMagenta = new THREE.Color(0xf43f5e);

  const spanPositions = [
    -5.3, -4.6, -3.8, -3.0, -2.4, -1.8, -1.2, -0.65, -0.25,
    0.25, 0.65, 1.2, 1.8, 2.4, 3.0, 3.8, 4.6, 5.3,
  ];
  const heightLayers = [-0.25, 0.35, 0.92];

  for (const xBase of spanPositions) {
    for (const yLayer of heightLayers) {
      // Skip outer redundant layers far outside wingtips
      if (Math.abs(xBase) > 4.2 && yLayer < 0) continue;

      const isWingtip = Math.abs(xBase) >= 4.5;
      const isFuselage = Math.abs(xBase) < 0.9;
      const isNacelle = Math.abs(Math.abs(xBase) - 2.45) < 0.4;

      // 1) Forward-flight aerodynamic streamline (flows from +Z -> -Z over airfoil & fuselage)
      const cruisePts: THREE.Vector3[] = [];
      for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        const z = 5.4 - t * 11.4; // +5.4 ahead of nose to -6.0 wake

        // Upwash ahead of leading edge, camber hump over wing/fuselage, downwash behind trailing edge
        const bodyGaussian = Math.exp(-Math.pow((z - 0.35) / 1.45, 2));
        const wingGaussian = Math.exp(-Math.pow((z - 0.05) / 0.95, 2));

        let y = yLayer;
        let x = xBase;

        if (isFuselage) {
          y += (yLayer >= 0 ? 0.55 : -0.35) * bodyGaussian;
          x += Math.sign(xBase || 1) * 0.38 * bodyGaussian;
        } else {
          y += (yLayer >= 0.2 ? 0.42 : -0.18) * wingGaussian;
          if (z < -0.5) {
            // Trailing downwash
            y -= Math.min(0.45, (-0.5 - z) * 0.08);
          }
        }

        // Helical wingtip vortex curl behind wingtips
        if (isWingtip && z < 0.1) {
          const vortexT = (0.1 - z) * 1.1;
          const rVort = 0.28 * Math.min(1, vortexT * 0.45);
          x += Math.cos(vortexT * 2.2) * rVort * Math.sign(xBase);
          y += Math.sin(vortexT * 2.2) * rVort;
        }

        cruisePts.push(new THREE.Vector3(x, y, z));
      }

      // 2) Vertical hover rotor downwash fountain streamline (enters from above, accelerates down, flares out)
      const hoverPts: THREE.Vector3[] = [];
      const nearestRotorX =
        Math.abs(xBase) > 3.8 ? Math.sign(xBase) * 5.25 : Math.abs(xBase) > 1.2 ? Math.sign(xBase) * 2.45 : Math.sign(xBase || 1) * 1.38;
      const nearestRotorZ = Math.abs(xBase) <= 1.2 ? -2.2 : Math.abs(xBase) > 3.8 ? 0.35 : 0.72;
      const radialAngle = Math.atan2(yLayer + 0.1, xBase - nearestRotorX + 0.01);

      for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        const y = 3.2 - t * 4.75; // +3.2m down to floor (-1.55m)
        const contract = 0.95 - Math.sin(Math.min(1, t * 1.5) * Math.PI * 0.5) * 0.35;
        const flare = t > 0.75 ? Math.pow((t - 0.75) / 0.25, 1.8) * 1.9 : 0;
        const radius = (0.65 * contract + flare) * (0.6 + (Math.abs(yLayer) + 0.2) * 0.45);
        const swirl = t * 2.4;

        const x = nearestRotorX + Math.cos(radialAngle + swirl) * radius;
        const z = nearestRotorZ + Math.sin(radialAngle + swirl) * radius;
        hoverPts.push(new THREE.Vector3(x, Math.max(-1.55, y), z));
      }

      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(samples * 3);
      const progArr = new Float32Array(samples);
      const colArr = new Float32Array(samples * 3);
      const tmpColor = new THREE.Color();

      for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        progArr[i] = t;
        posArr[i * 3] = cruisePts[i].x;
        posArr[i * 3 + 1] = cruisePts[i].y;
        posArr[i * 3 + 2] = cruisePts[i].z;

        // Color gradient: cyan/emerald freestream -> warm amber/magenta near stagnation zone (t ~ 0.35..0.52)
        const stagnation = Math.exp(-Math.pow((t - 0.44) / 0.14, 2));
        if (isNacelle || isFuselage) {
          tmpColor.copy(colCyan).lerp(colAmber, stagnation * 0.75).lerp(colMagenta, Math.pow(stagnation, 2.2) * 0.85);
        } else if (isWingtip) {
          tmpColor.copy(colEmerald).lerp(colCyan, t);
        } else {
          tmpColor.copy(colCyan).lerp(colEmerald, stagnation * 0.8);
        }
        colArr[i * 3] = tmpColor.r;
        colArr[i * 3 + 1] = tmpColor.g;
        colArr[i * 3 + 2] = tmpColor.b;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('aProgress', new THREE.BufferAttribute(progArr, 1));
      geo.setAttribute('aColor', new THREE.BufferAttribute(colArr, 3));

      const line = new THREE.Line(geo, shaderMat);
      group.add(line);
      records.push({ line, cruisePts, hoverPts, samples });
    }
  }

  let lastHoverRatio = -1;

  const updateFlowShape = (hoverRatio: number) => {
    if (Math.abs(hoverRatio - lastHoverRatio) < 0.004) return;
    lastHoverRatio = hoverRatio;
    for (const rec of records) {
      const attr = rec.line.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < rec.samples; i++) {
        const cp = rec.cruisePts[i];
        const hp = rec.hoverPts[i];
        attr.setXYZ(
          i,
          THREE.MathUtils.lerp(cp.x, hp.x, hoverRatio),
          THREE.MathUtils.lerp(cp.y, hp.y, hoverRatio),
          THREE.MathUtils.lerp(cp.z, hp.z, hoverRatio)
        );
      }
      attr.needsUpdate = true;
    }
  };

  return { group, shaderMat, updateFlowShape };
}

/**
 * Builds the museum-grade Joby Aviation S4 Digital Twin rig.
 */
export function buildJobyS4Rig(isSoftwareGl: boolean): JobyS4Rig {
  const root = new THREE.Group();
  const carbonTex = createCarbonTexture();
  const paintTex = createAerospacePaintTextures();
  const rotorBlurTex = createRotorBlurTexture();

  // Calibrated industrial aerospace composite PBR materials (tuned for Studio / Golden-Hour HDRI)
  const pearlWhiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: paintTex.albedo,
    roughnessMap: paintTex.roughness,
    bumpMap: paintTex.roughness,
    bumpScale: 0.009,
    metalness: 0.16,
    roughness: 0.32,
    clearcoat: 0.96,
    clearcoatRoughness: 0.10,
    envMapIntensity: 1.38,
  });

  const satinSilverMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4dfe9,
    roughnessMap: paintTex.roughness,
    metalness: 0.42,
    roughness: 0.28,
    clearcoat: 0.82,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.48,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: carbonTex,
    metalness: 0.44,
    roughness: 0.34,
    envMapIntensity: 1.25,
  });

  const rubberTireMat = new THREE.MeshStandardMaterial({
    color: 0x11151d,
    metalness: 0.04,
    roughness: 0.88,
  });

  const chromeOleoMat = new THREE.MeshStandardMaterial({
    color: 0xe6edf5,
    metalness: 0.96,
    roughness: 0.08,
    envMapIntensity: 1.65,
  });

  const cabinInteriorMat = new THREE.MeshStandardMaterial({
    color: 0x0b1018,
    metalness: 0.15,
    roughness: 0.85,
  });

  const seatLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x263244,
    metalness: 0.08,
    roughness: 0.62,
  });

  const cockpitScreenMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  const darkGlassCanopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x091320,
    metalness: 0.22,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.85,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xa0b2c6,
    metalness: 0.92,
    roughness: 0.17,
    envMapIntensity: 1.5,
  });

  const strobeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const batteryModuleMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.55,
    metalness: 0.6,
    roughness: 0.28,
  });

  const hvBusOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.3,
  });

  const avionicsMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    metalness: 0.72,
    roughness: 0.24,
  });

  const bladeTipMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.3,
  });

  const rotorBlurMat = new THREE.MeshBasicMaterial({
    map: rotorBlurTex,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const thrustWashMat = new THREE.ShaderMaterial({
    uniforms: {
      uIntensity: { value: 0.14 },
      uColor: { value: new THREE.Color(0x38bdf8) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormalView = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uIntensity;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        // Soft radial edge falloff so cone never looks like a hard geometric triangle
        float ndotv = abs(dot(normalize(vViewPos), normalize(vNormalView)));
        float edgeSoft = pow(ndotv, 1.45);
        // Smooth vertical fade from rotor disc downward
        float vertFade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        float alpha = edgeSoft * vertFade * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // CAD Blueprint Mode Materials (Ref #2: Deep Royal Blue Glass + Razor-sharp Glowing Cyan Edges)
  const cadShellMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a2554,
    emissive: 0x041536,
    emissiveIntensity: 0.65,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });

  const cadEdgeMat = new THREE.LineBasicMaterial({
    color: 0x56c8ff,
    transparent: true,
    opacity: 0.88,
  });

  // Aero CFD Surface Hull Shader (Ref #3: Dark obsidian core with luminous cyan/emerald/magenta pressure glow)
  const cfdHullMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAirspeed: { value: 0.5 },
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        vNormalView = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uAirspeed;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float ndotv = max(0.0, dot(viewDir, vNormalView));
        float fresnel = pow(1.0 - ndotv, 2.1);

        // Leading edge stagnation heat near +Z nose and forward wing edges
        float stagnation = smoothstep(0.15, 2.35, vWorldPos.z) * 0.7 + smoothstep(0.25, 0.72, vLocalPos.z) * 0.35;
        stagnation = clamp(stagnation, 0.0, 1.0);

        vec3 coreDark = vec3(0.02, 0.07, 0.11);
        vec3 aeroCyan = vec3(0.08, 0.84, 0.88);
        vec3 aeroEmerald = vec3(0.18, 0.92, 0.62);
        vec3 stagHot = vec3(0.96, 0.24, 0.48);

        vec3 rimCol = mix(aeroCyan, aeroEmerald, 0.35 + 0.25 * sin(vWorldPos.x * 0.8));
        rimCol = mix(rimCol, stagHot, pow(stagnation, 1.8) * (0.45 + 0.45 * uAirspeed));

        vec3 finalCol = coreDark + rimCol * (fresnel * 1.15 + 0.16);
        gl_FragColor = vec4(finalCol, 0.95);
      }
    `,
  });

  const connectorMat = new THREE.LineDashedMaterial({
    color: 0x60a5fa,
    dashSize: 0.1,
    gapSize: 0.07,
    transparent: true,
    opacity: 0.72,
  });

  const cadEdgeLines: THREE.LineSegments[] = [];
  const baseMaterialMap = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const internalOnlyMeshes: THREE.Mesh[] = [];

  const registerMesh = (mesh: THREE.Mesh, opts?: { addCadEdges?: boolean; internalOnly?: boolean; edgeThreshold?: number }) => {
    const addEdges = opts?.addCadEdges ?? true;
    baseMaterialMap.set(mesh, mesh.material);
    mesh.castShadow = !isSoftwareGl && !opts?.internalOnly;
    mesh.receiveShadow = !isSoftwareGl;

    if (opts?.internalOnly) {
      internalOnlyMeshes.push(mesh);
    }

    if (addEdges) {
      const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, opts?.edgeThreshold ?? 22);
      const line = new THREE.LineSegments(edgesGeo, cadEdgeMat);
      line.visible = false;
      mesh.add(line);
      cadEdgeLines.push(line);
    }
  };

  // =========================================================
  // 1. AIRFRAME & SCULPTED MONOCOQUE FUSELAGE
  // =========================================================
  const airframeGroup = new THREE.Group();
  airframeGroup.name = 'airframe';

  const fuselageGeo = createSculptedFuselageGeometry();
  const fuselageMesh = new THREE.Mesh(fuselageGeo, pearlWhiteMat);
  registerMesh(fuselageMesh, { addCadEdges: true, edgeThreshold: 18 });
  airframeGroup.add(fuselageMesh);

  // Conformal wrap-around smoked glass panoramic windshield & cabin glass (semi-translucent revealing 1+4 cockpit)
  const canopyGeo = createConformalCanopyGeometry();
  const canopyMesh = new THREE.Mesh(canopyGeo, darkGlassCanopyMat);
  canopyMesh.renderOrder = 5;
  registerMesh(canopyMesh, { addCadEdges: true, edgeThreshold: 32 });
  airframeGroup.add(canopyMesh);

  // Dark inner composite cabin shell liner (prevents backface void visibility through smoked glass)
  const innerLinerMat = new THREE.MeshStandardMaterial({
    color: 0x0a1019,
    metalness: 0.12,
    roughness: 0.88,
    side: THREE.BackSide,
  });
  const cabinLinerGeo = new THREE.SphereGeometry(0.64, 24, 16);
  cabinLinerGeo.scale(1.02, 0.84, 1.48);
  const cabinLiner = new THREE.Mesh(cabinLinerGeo, innerLinerMat);
  cabinLiner.position.set(0, 0.04, 1.12);
  airframeGroup.add(cabinLiner);

  // Recessed cabin floor tray strictly inside the lower fuselage envelope (y = -0.22, z = 0.42..1.70)
  const cabinTub = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.07, 1.26),
    cabinInteriorMat
  );
  cabinTub.position.set(0, -0.22, 1.06);
  airframeGroup.add(cabinTub);

  // Dark acoustic rear cabin bulkhead strictly inside station z = 0.48 (radius 0.46 < roof 0.68)
  const rearBulkhead = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 24),
    cabinInteriorMat
  );
  rearBulkhead.position.set(0, 0.08, 0.48);
  airframeGroup.add(rearBulkhead);

  // Sculpted 1+4 seating arrangement strictly recessed inside the aerodynamic cabin envelope
  const createCabinSeat = (sx: number, sy: number, sz: number, isPilot = false) => {
    const seatGrp = new THREE.Group();
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(isPilot ? 0.24 : 0.21, 0.06, 0.22),
      seatLeatherMat
    );
    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(isPilot ? 0.23 : 0.20, 0.24, 0.055),
      seatLeatherMat
    );
    backrest.position.set(0, 0.13, -0.09);
    backrest.rotation.x = -0.18;
    const headrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.075, 0.05),
      satinSilverMat
    );
    headrest.position.set(0, 0.27, -0.115);
    seatGrp.add(cushion, backrest, headrest);
    seatGrp.position.set(sx, sy, sz);
    return seatGrp;
  };

  // Pilot seat (front center) + 4 passenger seats (2×2 cabin rows) cleanly visible through smoked glass
  airframeGroup.add(createCabinSeat(0, -0.10, 1.48, true));
  airframeGroup.add(createCabinSeat(-0.22, -0.08, 1.05, false));
  airframeGroup.add(createCabinSeat(0.22, -0.08, 1.05, false));
  airframeGroup.add(createCabinSeat(-0.20, -0.08, 0.66, false));
  airframeGroup.add(createCabinSeat(0.20, -0.08, 0.66, false));

  // Recessed Garmin G3000 flight deck glare shield & illuminated avionics screens (strictly inside nose cone)
  const dashBody = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.085, 0.20), cabinInteriorMat);
  dashBody.position.set(0, 0.06, 1.82);
  airframeGroup.add(dashBody);

  [-0.105, 0.105].forEach((dx) => {
    const pfdScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.175, 0.085), cockpitScreenMat);
    pfdScreen.position.set(dx, 0.11, 1.715);
    pfdScreen.rotation.y = Math.PI;
    pfdScreen.rotation.x = 0.22;
    airframeGroup.add(pfdScreen);
  });

  // Conformal curved carbon windshield A-pillar mullions hugging the exact canopy loft contour
  [-1, 1].forEach((side) => {
    const mullionCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.28, 0.30, 2.04),
      new THREE.Vector3(side * 0.40, 0.46, 1.76),
      new THREE.Vector3(side * 0.45, 0.57, 1.44),
      new THREE.Vector3(side * 0.44, 0.62, 1.06),
    ]);
    const pillarGeo = new THREE.TubeGeometry(mullionCurve, 12, 0.014, 6, false);
    const pillar = new THREE.Mesh(pillarGeo, carbonMat);
    pillar.renderOrder = 6;
    airframeGroup.add(pillar);
  });

  // Carbon lower aero chin & belly keel fairing
  const chinGeo = new THREE.CapsuleGeometry(0.32, 2.25, 10, 20);
  chinGeo.rotateX(Math.PI / 2);
  chinGeo.scale(1.42, 0.44, 1.0);
  const chinMesh = new THREE.Mesh(chinGeo, carbonMat);
  chinMesh.position.set(0, -0.44, 0.48);
  registerMesh(chinMesh, { addCadEdges: true });
  airframeGroup.add(chinMesh);

  const noseLampMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const noseLamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.032, 0.035),
    noseLampMat
  );
  noseLamp.position.set(0, -0.14, 2.62);
  airframeGroup.add(noseLamp);

  // Dorsal VHF / GPS swept carbon shark-fin antenna on rear fuselage spine
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.28, 0);
  finShape.lineTo(0.06, 0.15);
  finShape.lineTo(-0.04, 0.14);
  finShape.closePath();
  const sharkFinGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.016,
    bevelEnabled: false,
  });
  sharkFinGeo.rotateY(Math.PI / 2);
  const sharkFin = new THREE.Mesh(sharkFinGeo, carbonMat);
  sharkFin.position.set(-0.008, 0.44, -1.18);
  airframeGroup.add(sharkFin);

  // Anodized dark-titanium cabin shoulder trim rails framing panoramic side windows
  [-1, 1].forEach((side) => {
    const sillCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.43, 0.11, 2.02),
      new THREE.Vector3(side * 0.67, 0.15, 1.54),
      new THREE.Vector3(side * 0.72, 0.17, 0.98),
      new THREE.Vector3(side * 0.69, 0.18, 0.46),
    ]);
    const sillGeo = new THREE.TubeGeometry(sillCurve, 14, 0.011, 6, false);
    const sill = new THREE.Mesh(sillGeo, titaniumMat);
    airframeGroup.add(sill);
  });

  // Subtle internal fuselage composite bulkhead frames (revealed cleanly in CAD / Exploded view)
  const ringFrameGeo = new THREE.TorusGeometry(0.52, 0.025, 8, 24);
  [-0.5, 0.25, 1.05].forEach((fz) => {
    const frame = new THREE.Mesh(ringFrameGeo, titaniumMat);
    frame.position.set(0, 0.06, fz);
    frame.scale.set(1.18, 0.96, 1.0);
    registerMesh(frame, { addCadEdges: true, internalOnly: true });
    airframeGroup.add(frame);
  });

  root.add(airframeGroup);

  // =========================================================
  // 2. HIGH-ASPECT-RATIO TAPERED MAIN WING & 110° V-TAIL
  // =========================================================
  const wingVtailGroup = new THREE.Group();
  wingVtailGroup.name = 'wing_vtail';

  const rightWingMesh = new THREE.Mesh(createTaperedWingGeometry(1), pearlWhiteMat);
  registerMesh(rightWingMesh, { addCadEdges: true, edgeThreshold: 20 });
  wingVtailGroup.add(rightWingMesh);

  const leftWingMesh = new THREE.Mesh(createTaperedWingGeometry(-1), pearlWhiteMat);
  registerMesh(leftWingMesh, { addCadEdges: true, edgeThreshold: 20 });
  wingVtailGroup.add(leftWingMesh);

  // Dorsal wing-root aerodynamic fairing fillet blending wing into fuselage
  const filletGeo = new THREE.CapsuleGeometry(0.36, 1.45, 10, 20);
  filletGeo.rotateX(Math.PI / 2);
  filletGeo.scale(1.55, 0.55, 1.0);
  const filletMesh = new THREE.Mesh(filletGeo, satinSilverMat);
  filletMesh.position.set(0, 0.56, 0.02);
  registerMesh(filletMesh, { addCadEdges: true });
  wingVtailGroup.add(filletMesh);

  // Internal carbon wing main I-beam spar (visible in CAD/Exploded mode)
  const mainSpar = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.09, 0.16), carbonMat);
  mainSpar.position.set(0, 0.53, 0.02);
  registerMesh(mainSpar, { addCadEdges: true, internalOnly: true });
  wingVtailGroup.add(mainSpar);

  // Sculpted 110° V-tail stabilizers
  const rightVTail = new THREE.Mesh(createVTailFinGeometry(1), pearlWhiteMat);
  registerMesh(rightVTail, { addCadEdges: true, edgeThreshold: 20 });
  wingVtailGroup.add(rightVTail);

  const leftVTail = new THREE.Mesh(createVTailFinGeometry(-1), pearlWhiteMat);
  registerMesh(leftVTail, { addCadEdges: true, edgeThreshold: 20 });
  wingVtailGroup.add(leftVTail);

  // Streamlined carbon engine pylons/booms seamlessly attaching forward & tip nacelles to main wing
  const pylonGeo = new THREE.CapsuleGeometry(0.095, 1.15, 8, 16);
  pylonGeo.rotateX(Math.PI / 2);
  pylonGeo.scale(0.85, 1.15, 1.0);

  const pylonCoords: [number, number, number][] = [
    [-5.25, 0.65, 0.02],
    [-2.52, 0.54, 0.42],
    [2.52, 0.54, 0.42],
    [5.25, 0.65, 0.02],
  ];
  pylonCoords.forEach(([px, py, pz]) => {
    const pylon = new THREE.Mesh(pylonGeo, carbonMat);
    pylon.position.set(px, py, pz);
    registerMesh(pylon, { addCadEdges: true });
    wingVtailGroup.add(pylon);
  });

  // Wingtip navigation lights (Red Port / Green Starboard) + pulsed white anti-collision strobes
  const portLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  );
  portLight.position.set(-5.36, 0.67, 0.18);
  wingVtailGroup.add(portLight);

  const stbdLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x34d399 })
  );
  stbdLight.position.set(5.36, 0.67, 0.18);
  wingVtailGroup.add(stbdLight);

  const strobeLights: THREE.Mesh[] = [];
  [
    [-5.34, 0.68, 0.08],
    [5.34, 0.68, 0.08],
    [0, 0.30, -2.74],
  ].forEach(([sx, sy, sz]) => {
    const st = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), strobeMat);
    st.position.set(sx, sy, sz);
    wingVtailGroup.add(st);
    strobeLights.push(st);
  });

  // Wing trailing-edge flaperon & aileron dark seam accents (industrial aerodynamic detail)
  [-1, 1].forEach((side) => {
    const seamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 1.15, 0.49, -0.34),
      new THREE.Vector3(side * 3.15, 0.56, -0.30),
      new THREE.Vector3(side * 4.95, 0.64, -0.22),
    ]);
    const seam = new THREE.Mesh(new THREE.TubeGeometry(seamCurve, 12, 0.008, 4, false), carbonMat);
    wingVtailGroup.add(seam);
  });

  root.add(wingVtailGroup);

  // =========================================================
  // 3. 6× DISTRIBUTED TILT-PROPELLER PROPULSION UNITS
  // =========================================================
  const propulsionGroup = new THREE.Group();
  propulsionGroup.name = 'propulsion';

  const nacelleSpecs: { pos: [number, number, number]; dir: 1 | -1 }[] = [
    { pos: [-5.25, 0.65, 0.58], dir: 1 },
    { pos: [-2.52, 0.54, 1.05], dir: -1 },
    { pos: [2.52, 0.54, 1.05], dir: 1 },
    { pos: [5.25, 0.65, 0.58], dir: -1 },
    { pos: [-1.46, 1.48, -2.18], dir: -1 },
    { pos: [1.46, 1.48, -2.18], dir: 1 },
  ];

  const nacelles: JobyS4Rig['nacelles'] = [];
  const nacelleHousingPts = [
    new THREE.Vector2(0.02, -0.45),
    new THREE.Vector2(0.11, -0.32),
    new THREE.Vector2(0.16, -0.05),
    new THREE.Vector2(0.165, 0.22),
    new THREE.Vector2(0.13, 0.34),
  ];
  const nacelleHousingGeo = new THREE.LatheGeometry(nacelleHousingPts, 24);
  nacelleHousingGeo.rotateX(Math.PI / 2);

  nacelleSpecs.forEach((spec) => {
    const mountGroup = new THREE.Group();
    mountGroup.position.set(...spec.pos);

    const tiltPivot = new THREE.Group();

    const housing = new THREE.Mesh(nacelleHousingGeo, carbonMat);
    registerMesh(housing, { addCadEdges: true, edgeThreshold: 24 });
    tiltPivot.add(housing);

    // Titanium actuator gimbal ring
    const gimbalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.172, 0.02, 10, 28),
      titaniumMat
    );
    gimbalRing.position.z = 0.2;
    tiltPivot.add(gimbalRing);

    const rotorSpinner = createScimitarFiveBladeRotor(carbonMat, titaniumMat, bladeTipMat, 0.92);
    rotorSpinner.position.z = 0.38;
    tiltPivot.add(rotorSpinner);

    // Motion-blur swept rotor disc
    const blurDisc = new THREE.Mesh(new THREE.CircleGeometry(0.95, 36), rotorBlurMat);
    blurDisc.position.z = 0.39;
    tiltPivot.add(blurDisc);

    // Subtle volumetric slipstream cone behind rotor
    const washGeo = new THREE.ConeGeometry(0.86, 1.85, 24, 1, true);
    washGeo.rotateX(-Math.PI / 2);
    washGeo.translate(0, 0, -0.95);
    const thrustWash = new THREE.Mesh(washGeo, thrustWashMat);
    thrustWash.position.z = -0.18;
    tiltPivot.add(thrustWash);

    mountGroup.add(tiltPivot);
    propulsionGroup.add(mountGroup);

    nacelles.push({
      group: tiltPivot,
      rotorSpinner,
      blurDisc,
      thrustWash,
      spinDirection: spec.dir,
      basePosition: new THREE.Vector3(...spec.pos),
    });
  });

  root.add(propulsionGroup);

  // =========================================================
  // 4. 4× REDUNDANT AEROSPACE POUCH BATTERY PACKS (Internal Modular Architecture)
  // =========================================================
  const batteryGroup = new THREE.Group();
  batteryGroup.name = 'battery';

  const packGeo = new THREE.BoxGeometry(0.52, 0.14, 1.06);
  const packOffsets: [number, number, number][] = [
    [-1.25, 0.42, 0.04],
    [1.25, 0.42, 0.04],
    [-0.26, -0.26, 0.15],
    [0.26, -0.26, 0.15],
  ];

  packOffsets.forEach(([bx, by, bz]) => {
    const pack = new THREE.Mesh(packGeo, batteryModuleMat);
    pack.position.set(bx, by, bz);
    registerMesh(pack, { addCadEdges: true, internalOnly: true });
    batteryGroup.add(pack);
  });

  const hvBus = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.045, 0.07), hvBusOrangeMat);
  hvBus.position.set(0, 0.18, 0.08);
  registerMesh(hvBus, { addCadEdges: true, internalOnly: true });
  batteryGroup.add(hvBus);

  root.add(batteryGroup);

  // =========================================================
  // 5. TRIPLE-REDUNDANT FLIGHT CONTROL COMPUTERS & AIR-DATA PROBES
  // =========================================================
  const avionicsGroup = new THREE.Group();
  avionicsGroup.name = 'avionics';

  const fccGeo = new THREE.BoxGeometry(0.22, 0.12, 0.34);
  [-0.18, 0, 0.18].forEach((ax) => {
    const fcc = new THREE.Mesh(fccGeo, avionicsMat);
    fcc.position.set(ax, -0.04, 1.82);
    registerMesh(fcc, { addCadEdges: true, internalOnly: true });
    avionicsGroup.add(fcc);
  });

  const probeGeo = new THREE.CylinderGeometry(0.009, 0.015, 0.34, 10);
  probeGeo.rotateX(Math.PI / 2);
  [-0.22, 0.22].forEach((px) => {
    const probe = new THREE.Mesh(probeGeo, titaniumMat);
    probe.position.set(px, -0.06, 2.52);
    avionicsGroup.add(probe);
  });

  root.add(avionicsGroup);

  // =========================================================
  // 6. RETRACTABLE TRICYCLE AIRCRAFT LANDING GEAR (Rubber Tires, Machined Hubs, Chrome Oleo Struts)
  // =========================================================
  const gearGroup = new THREE.Group();
  gearGroup.name = 'landing_gear';

  const upperStrutGeo = new THREE.CylinderGeometry(0.030, 0.034, 0.28, 12);
  const chromeOleoGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.24, 12);
  const dragBraceGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.34, 8);
  const tireGeo = new THREE.TorusGeometry(0.088, 0.038, 12, 24);
  tireGeo.rotateY(Math.PI / 2);
  const rimHubGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.062, 16);
  rimHubGeo.rotateZ(Math.PI / 2);
  const axleCapGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.082, 10);
  axleCapGeo.rotateZ(Math.PI / 2);
  const gearDoorGeo = new THREE.BoxGeometry(0.022, 0.25, 0.17);

  interface GearLegAssembly {
    pivot: THREE.Group;
    retractAxis: 'x' | 'z';
    retractSign: number;
    baseY: number;
  }
  const gearLegs: GearLegAssembly[] = [];

  const gearSpecs: { pos: [number, number, number]; isNose: boolean; side: number }[] = [
    { pos: [0, -0.34, 1.56], isNose: true, side: 0 },
    { pos: [-0.74, -0.34, -0.34], isNose: false, side: -1 },
    { pos: [0.74, -0.34, -0.34], isNose: false, side: 1 },
  ];

  gearSpecs.forEach(({ pos, isNose, side }) => {
    const pivot = new THREE.Group();
    pivot.position.set(...pos);

    // Upper forged titanium shock-strut barrel
    const upperStrut = new THREE.Mesh(upperStrutGeo, titaniumMat);
    upperStrut.position.set(0, -0.15, 0);
    registerMesh(upperStrut, { addCadEdges: true });
    pivot.add(upperStrut);

    // Gleaming chrome hydraulic oleo shock piston
    const oleoPiston = new THREE.Mesh(chromeOleoGeo, chromeOleoMat);
    oleoPiston.position.set(0, -0.34, 0);
    pivot.add(oleoPiston);

    // Angled structural drag brace
    const brace = new THREE.Mesh(dragBraceGeo, carbonMat);
    brace.position.set(0, -0.16, isNose ? -0.11 : 0.11);
    brace.rotation.x = isNose ? 0.56 : -0.56;
    pivot.add(brace);

    // Sculpted vulcanized black rubber aircraft tire + machined aluminum wheel hub
    const wheelY = -0.47;
    const wheelScale = isNose ? 0.88 : 1.06;
    const wheelGrp = new THREE.Group();
    wheelGrp.position.set(0, wheelY, 0);
    wheelGrp.scale.setScalar(wheelScale);

    const tire = new THREE.Mesh(tireGeo, rubberTireMat);
    registerMesh(tire, { addCadEdges: true });
    const hub = new THREE.Mesh(rimHubGeo, satinSilverMat);
    const axle = new THREE.Mesh(axleCapGeo, titaniumMat);
    wheelGrp.add(tire, hub, axle);
    pivot.add(wheelGrp);

    // Slim vertical composite fairing door tucked cleanly along outer shock strut
    const door = new THREE.Mesh(gearDoorGeo, pearlWhiteMat);
    door.position.set(isNose ? 0 : side * 0.056, -0.15, isNose ? 0.052 : 0);
    door.rotation.z = isNose ? 0 : side * 0.06;
    pivot.add(door);

    gearGroup.add(pivot);
    gearLegs.push({
      pivot,
      retractAxis: isNose ? 'x' : 'z',
      retractSign: isNose ? -1 : side,
      baseY: pos[1],
    });
  });

  root.add(gearGroup);

  // =========================================================
  // 7. EXPLODED CAD ALIGNMENT VECTORS & 3D AERODYNAMIC STREAMLINES
  // =========================================================
  const connectorPos = new Float32Array(12 * 3);
  const connectorGeo = new THREE.BufferGeometry();
  connectorGeo.setAttribute('position', new THREE.BufferAttribute(connectorPos, 3));
  const explodeConnectors = new THREE.LineSegments(connectorGeo, connectorMat);
  explodeConnectors.visible = false;
  root.add(explodeConnectors);

  const aeroFlow = createAerodynamicStreamlines();
  aeroFlow.group.visible = false;
  root.add(aeroFlow.group);

  const subsystems = {
    airframe: airframeGroup,
    wing_vtail: wingVtailGroup,
    propulsion: propulsionGroup,
    battery: batteryGroup,
    avionics: avionicsGroup,
    landing_gear: gearGroup,
  };

  const explodeVectors: Record<keyof typeof subsystems, [number, number, number]> = {
    airframe: [0, 0.48, 0.25],
    wing_vtail: [0, 1.32, -0.65],
    propulsion: [0, 1.92, 0.95],
    battery: [0, -1.05, 0],
    avionics: [0, 0.25, 1.45],
    landing_gear: [0, -1.72, 0],
  };

  let currentTiltDeg = 90;
  let currentExplode = 0;
  let currentGearDeploy = 1;

  const updateKinematics: JobyS4Rig['updateKinematics'] = ({
    elapsedSec,
    dt,
    tiltDeg,
    rotorRpm,
    explodeFactor,
    visualMode,
    selectedSubsystem,
    airspeedKmh,
    gearDeploy,
  }) => {
    const dampLambda = 6.0;
    currentTiltDeg = THREE.MathUtils.damp(currentTiltDeg, tiltDeg, dampLambda, dt);
    currentExplode = THREE.MathUtils.damp(currentExplode, explodeFactor, dampLambda, dt);

    // Automatic aerodynamic landing gear retraction during high-speed cruise (always extended in CAD/exploded view)
    const targetGear =
      visualMode !== 'CINEMATIC' || currentExplode > 0.08
        ? 1
        : gearDeploy !== undefined
        ? gearDeploy
        : airspeedKmh > 95
        ? 0
        : 1;
    currentGearDeploy = THREE.MathUtils.damp(currentGearDeploy, targetGear, 4.8, dt);

    gearLegs.forEach((leg) => {
      const retractAngle = (1 - currentGearDeploy) * (Math.PI * 0.52) * leg.retractSign;
      if (leg.retractAxis === 'x') {
        leg.pivot.rotation.x = retractAngle;
      } else {
        leg.pivot.rotation.z = -retractAngle;
      }
      leg.pivot.position.y = leg.baseY + (1 - currentGearDeploy) * 0.24;
      leg.pivot.visible = currentGearDeploy > 0.04;
    });

    // Dual-pulse aviation anti-collision white strobe beacons + nose taxi lamp
    const strobeCycle = elapsedSec % 1.45;
    const strobeOn =
      (strobeCycle > 0.0 && strobeCycle < 0.07) || (strobeCycle > 0.16 && strobeCycle < 0.23);
    strobeLights.forEach((s) => {
      s.visible = strobeOn && visualMode === 'CINEMATIC';
    });
    noseLamp.visible = currentGearDeploy > 0.35 || visualMode !== 'CINEMATIC';

    const tiltRad = THREE.MathUtils.degToRad(currentTiltDeg);
    const omega = (rotorRpm / 60) * Math.PI * 2 * 0.34;
    const hoverRatio = currentTiltDeg / 90;

    // 1. Update 6 tilt-nacelles, spinning rotors, motion blur discs & subtle restrained wash cones
    nacelles.forEach((n) => {
      n.group.rotation.x = -tiltRad;
      n.rotorSpinner.rotation.z += omega * dt * n.spinDirection;

      n.blurDisc.visible = visualMode === 'CINEMATIC' && rotorRpm > 120 && currentExplode < 0.2;
      rotorBlurMat.opacity = Math.min(0.42, (rotorRpm / 800) * 0.40);

      n.thrustWash.visible =
        visualMode === 'CINEMATIC' && currentExplode < 0.15 && hoverRatio > 0.45 && airspeedKmh > 5;
      thrustWashMat.uniforms.uIntensity.value = hoverRatio * 0.026;
    });

    // 2. Smooth CAD Exploded Separation & Visual Mode Material Switch
    const showInternals = visualMode === 'ENGINEERING_CAD' || currentExplode > 0.12;
    internalOnlyMeshes.forEach((m) => {
      m.visible = showInternals;
    });

    (Object.keys(subsystems) as (keyof typeof subsystems)[]).forEach((key) => {
      const grp = subsystems[key];
      const [ox, oy, oz] = explodeVectors[key];
      grp.position.set(ox * currentExplode, oy * currentExplode, oz * currentExplode);

      const isSelected = selectedSubsystem === key;
      grp.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const origMat = baseMaterialMap.get(mesh);
          if (!origMat) return;

          if (visualMode === 'ENGINEERING_CAD') {
            mesh.material = internalOnlyMeshes.includes(mesh) ? origMat : cadShellMat;
          } else if (visualMode === 'AERO_CFD') {
            mesh.material = cfdHullMat;
          } else {
            mesh.material = origMat;
          }

          if (selectedSubsystem && !isSelected && visualMode === 'CINEMATIC') {
            mesh.scale.setScalar(0.992);
          } else {
            mesh.scale.setScalar(1.0);
          }
        }
      });
    });

    // 3. CAD Blueprint vector edge outlines
    const showEdges = visualMode === 'ENGINEERING_CAD' || currentExplode > 0.22;
    cadEdgeLines.forEach((line) => {
      line.visible = showEdges;
    });
    cadEdgeMat.opacity = visualMode === 'ENGINEERING_CAD' ? 0.88 : 0.42;

    // 4. CFD Aero Surface & 3D Flowing Streamlines (Ref #3)
    const isCfd = visualMode === 'AERO_CFD';
    cfdHullMat.uniforms.uTime.value = elapsedSec;
    cfdHullMat.uniforms.uAirspeed.value = airspeedKmh / 322;

    aeroFlow.group.visible = isCfd;
    if (isCfd) {
      aeroFlow.shaderMat.uniforms.uTime.value = elapsedSec;
      aeroFlow.shaderMat.uniforms.uSpeed.value = 0.75 + (airspeedKmh / 322) * 1.4;
      aeroFlow.updateFlowShape(hoverRatio);
    }

    // 5. Exploded assembly dashed reference lines
    if (currentExplode > 0.05) {
      explodeConnectors.visible = true;
      const posAttr = explodeConnectors.geometry.getAttribute('position') as THREE.BufferAttribute;
      const pairs: [keyof typeof subsystems, keyof typeof subsystems][] = [
        ['airframe', 'wing_vtail'],
        ['wing_vtail', 'propulsion'],
        ['airframe', 'battery'],
        ['airframe', 'avionics'],
        ['airframe', 'landing_gear'],
        ['battery', 'propulsion'],
      ];
      pairs.forEach(([a, b], idx) => {
        const ga = subsystems[a].position;
        const gb = subsystems[b].position;
        posAttr.setXYZ(idx * 2, ga.x, ga.y, ga.z);
        posAttr.setXYZ(idx * 2 + 1, gb.x, gb.y, gb.z);
      });
      posAttr.needsUpdate = true;
      explodeConnectors.computeLineDistances();
    } else {
      explodeConnectors.visible = false;
    }
  };

  const dispose = () => {
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine || (obj as THREE.LineSegments).isLineSegments) {
        (obj as THREE.Mesh).geometry?.dispose();
      }
    });
    [
      pearlWhiteMat,
      satinSilverMat,
      carbonMat,
      rubberTireMat,
      chromeOleoMat,
      cabinInteriorMat,
      innerLinerMat,
      seatLeatherMat,
      cockpitScreenMat,
      darkGlassCanopyMat,
      titaniumMat,
      strobeMat,
      noseLampMat,
      batteryModuleMat,
      hvBusOrangeMat,
      avionicsMat,
      bladeTipMat,
      rotorBlurMat,
      thrustWashMat,
      cadShellMat,
      cadEdgeMat,
      cfdHullMat,
      connectorMat,
      aeroFlow.shaderMat,
    ].forEach((m) => m.dispose());
    carbonTex.dispose();
    paintTex.albedo.dispose();
    paintTex.roughness.dispose();
    rotorBlurTex.dispose();
  };

  return {
    root,
    subsystems,
    nacelles,
    streamlinesGroup: aeroFlow.group,
    explodeConnectors,
    updateKinematics,
    dispose,
  };
}
