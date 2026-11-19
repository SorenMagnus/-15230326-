/**
 * Unified Cinematic & Interactive Scene State Engine
 * Pure deterministic Catmull-Rom spline kinematics, photorealistic plate choreography,
 * landing-gear retraction schedule, and camera framing for the Scroll-Driven City Flight Pilot.
 * Guarantees reversible forward scroll, reverse scroll, pausing, beat jumps, and Free-Orbit takeover.
 */

export type CinemaBeatId =
  | 'CITY_ESTABLISH'
  | 'VERTICAL_LIFTOFF'
  | 'TRANSITION_CRUISE'
  | 'APPROACH_VERTIPORT';

export type CinemaInteractionMode = 'CINEMA_SCROLL' | 'FREE_ORBIT';

export interface CinemaBeatMeta {
  id: CinemaBeatId;
  index: number;
  code: string;
  startProgress: number;
  endProgress: number;
  jumpProgress: number;
  titleZh: string;
  titleEn: string;
  captionZh: string;
  phaseBadge: string;
}

export interface CinemaPlateWeights {
  vertiport: number;
  climb: number;
  cruise: number;
  approach: number;
}

export interface CinemaSceneState {
  progress: number;
  beat: CinemaBeatMeta;
  interactionMode: CinemaInteractionMode;
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
  cameraFov: number;
  aircraftPos: [number, number, number];
  aircraftRot: [number, number, number]; // pitch, yaw, roll (radians)
  nacelleTiltDeg: number; // 90 = hover, 0 = cruise
  rotorRpm: number;
  airspeedKmh: number;
  altitudeM: number;
  exposure: number;
  gearDeploy: number; // 1 = extended & locked, 0 = retracted flush for cruise
  padShadowOpacity: number; // grounded asphalt contact shadow on vertiport H-pad
  plateOpacity: number; // 1 in CINEMA_SCROLL (photorealistic cinema backdrop), 0 in FREE_ORBIT
  plateWeights: CinemaPlateWeights;
  plateScale: number;
  plateShiftX: number; // percentage parallax shift
  plateShiftY: number; // percentage parallax shift
}

export const CINEMA_BEATS: CinemaBeatMeta[] = [
  {
    id: 'CITY_ESTABLISH',
    index: 0,
    code: 'SCENE 01',
    startProgress: 0.0,
    endProgress: 0.25,
    jumpProgress: 0.08,
    titleZh: '滨海高架起降港与实景揭示',
    titleEn: 'ROOFTOP SKYPORT ESTABLISHING REVEAL',
    captionZh:
      '黄金时刻的滨海都会高架垂直起降港（Skyport），六具五叶倾转旋翼在 H 停机坪上完成起飞前预旋，镜头低角度掠过碳纤维流线机身与海湾大桥。',
    phaseBadge: '停机坪待命 · 倾转角 90°',
  },
  {
    id: 'VERTICAL_LIFTOFF',
    index: 1,
    code: 'SCENE 02',
    startProgress: 0.25,
    endProgress: 0.52,
    jumpProgress: 0.38,
    titleZh: '90° 垂直起飞与楼宇峡谷爬升',
    titleEn: 'VERTICAL LIFTOFF & SKYLINE CLIMB',
    captionZh:
      '6 组电动推进器锁定 90° 垂直向上，平稳脱离楼顶停机坪并沿玻璃幕墙楼宇峡谷攀升。低桨盘载荷将 100 米声压级控制在 65 dBA 以下。',
    phaseBadge: '垂直爬升 · 倾转角 90°',
  },
  {
    id: 'TRANSITION_CRUISE',
    index: 2,
    code: 'SCENE 03',
    startProgress: 0.52,
    endProgress: 0.80,
    jumpProgress: 0.66,
    titleZh: '倾转过渡、收起落架与海湾巡航',
    titleEn: 'TILT TRANSITION & 265 KM/H BAY CRUISE',
    captionZh:
      '空速突破 110 km/h 后，6 具短舱平顺前倾至 0° 水平推进，前三点起落架自动收折入舱，主翼接管 98% 升力以 265 km/h 掠过日落海湾。',
    phaseBadge: '固定翼巡航 · 起落架收起',
  },
  {
    id: 'APPROACH_VERTIPORT',
    index: 3,
    code: 'SCENE 04',
    startProgress: 0.80,
    endProgress: 1.0,
    jumpProgress: 0.92,
    titleZh: '暮色减速进近与 H 坪精准着陆',
    titleEn: 'TWILIGHT FLARE & SKYPORT TOUCHDOWN',
    captionZh:
      '暮色进近对岸起降港，短舱回倾至 86° 气动拉平减速，起落架放下锁定并点亮机鼻着陆灯，轻盈落回 H 停机坪。随时点击下方按钮自由 360° 环绕检视。',
    phaseBadge: '减速着陆 · 起落架锁定',
  },
];

interface Keyframe {
  t: number;
  camPos: [number, number, number];
  camLook: [number, number, number];
  fov: number;
  acPos: [number, number, number];
  acRot: [number, number, number]; // pitch, yaw, roll in degrees
  tiltDeg: number;
  rpm: number;
  airspeed: number;
  altitude: number;
  exposure: number;
  gear: number;
  padShadow: number;
  plateScale: number;
  plateShiftX: number;
  plateShiftY: number;
}

const KEYFRAMES: Keyframe[] = [
  // t = 0.00: Parked firmly on rooftop H-pad matching plate_vertiport_empty ~16deg downward lens angle
  {
    t: 0.0,
    camPos: [4.2, 3.05, 11.4],
    camLook: [-0.25, -0.35, 0.0],
    fov: 38,
    acPos: [-0.52, -1.18, 0.15],
    acRot: [0, 56, 0],
    tiltDeg: 90,
    rpm: 180,
    airspeed: 0,
    altitude: 42,
    exposure: 0.98,
    gear: 1,
    padShadow: 0.92,
    plateScale: 1.02,
    plateShiftX: 0.0,
    plateShiftY: 0.0,
  },
  // t = 0.22: Subtle dolly push-in as rotors spool up to takeoff power on H-pad
  {
    t: 0.22,
    camPos: [3.4, 2.35, 9.8],
    camLook: [-0.25, -0.42, 0.0],
    fov: 35,
    acPos: [-0.45, -1.06, 0.15],
    acRot: [1.5, 52, 0],
    tiltDeg: 90,
    rpm: 680,
    airspeed: 0,
    altitude: 46,
    exposure: 1.0,
    gear: 1,
    padShadow: 0.78,
    plateScale: 1.09,
    plateShiftX: -0.8,
    plateShiftY: -0.6,
  },
  // t = 0.38: Heroic 90° vertical climb framed inside the gleaming glass skyscraper sunset canyon
  {
    t: 0.38,
    camPos: [4.6, -0.45, 9.4],
    camLook: [0.0, 0.35, 0.0],
    fov: 36,
    acPos: [0.05, 0.38, 0.0],
    acRot: [-3.0, 44, -2.5],
    tiltDeg: 90,
    rpm: 840,
    airspeed: 32,
    altitude: 155,
    exposure: 1.02,
    gear: 0.85,
    padShadow: 0.0,
    plateScale: 1.08,
    plateShiftX: -1.4,
    plateShiftY: 1.6,
  },
  // t = 0.54: Mid-air forward tilt transition (90° -> 34°), nose pitching forward, gear retracting flush
  {
    t: 0.54,
    camPos: [5.4, 0.95, 8.6],
    camLook: [0.1, 0.45, 0.0],
    fov: 39,
    acPos: [0.18, 0.58, -0.2],
    acRot: [-4.5, 58, -9.5],
    tiltDeg: 34,
    rpm: 600,
    airspeed: 142,
    altitude: 295,
    exposure: 1.04,
    gear: 0.0,
    padShadow: 0.0,
    plateScale: 1.06,
    plateShiftX: 1.2,
    plateShiftY: -0.5,
  },
  // t = 0.72: Full 0° wing-borne cruise banking gracefully across sparkling sunset bay & bridge
  {
    t: 0.72,
    camPos: [5.8, 1.35, 8.2],
    camLook: [-0.1, 0.52, 0.0],
    fov: 41,
    acPos: [-0.12, 0.62, -0.1],
    acRot: [-1.8, 66, -11.5],
    tiltDeg: 0,
    rpm: 380,
    airspeed: 265,
    altitude: 385,
    exposure: 1.05,
    gear: 0.0,
    padShadow: 0.0,
    plateScale: 1.13,
    plateShiftX: -2.0,
    plateShiftY: -1.2,
  },
  // t = 0.88: Twilight deceleration flare approaching illuminated rooftop Skyport, gear deployed & locked
  {
    t: 0.88,
    camPos: [4.5, 2.25, 10.2],
    camLook: [-0.25, -0.05, 0.0],
    fov: 37,
    acPos: [-0.32, 0.05, 0.1],
    acRot: [6.2, 54, 2.0],
    tiltDeg: 82,
    rpm: 760,
    airspeed: 48,
    altitude: 112,
    exposure: 0.92,
    gear: 1.0,
    padShadow: 0.25,
    plateScale: 1.11,
    plateShiftX: -0.6,
    plateShiftY: -0.8,
  },
  // t = 1.00: Settled smoothly onto illuminated H-pad at dusk with grounded contact shadow
  {
    t: 1.0,
    camPos: [3.9, 2.85, 10.8],
    camLook: [-0.25, -0.38, 0.0],
    fov: 36,
    acPos: [-0.50, -1.16, 0.15],
    acRot: [0, 56, 0],
    tiltDeg: 88,
    rpm: 260,
    airspeed: 0,
    altitude: 38,
    exposure: 0.88,
    gear: 1.0,
    padShadow: 0.95,
    plateScale: 1.05,
    plateShiftX: 0.0,
    plateShiftY: 0.0,
  },
];

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Centripetal-damped Catmull-Rom 1D interpolation for smooth C1/C2 cinema curves with zero corner kinks.
 */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function catmullRom3(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
  t: number
): [number, number, number] {
  return [
    catmullRom(a[0], b[0], c[0], d[0], t),
    catmullRom(a[1], b[1], c[1], d[1], t),
    catmullRom(a[2], b[2], c[2], d[2], t),
  ];
}

export function getBeatForProgress(progress: number): CinemaBeatMeta {
  const p = clamp01(progress);
  for (let i = CINEMA_BEATS.length - 1; i >= 0; i--) {
    if (p >= CINEMA_BEATS[i].startProgress) {
      return CINEMA_BEATS[i];
    }
  }
  return CINEMA_BEATS[0];
}

/**
 * Computes normalized cross-dissolve blend weights across the 4 photorealistic cinema plates.
 */
function computePlateWeights(p: number, isFreeOrbit: boolean): CinemaPlateWeights {
  if (isFreeOrbit) {
    return { vertiport: 0, climb: 0, cruise: 0, approach: 0 };
  }

  // Smooth overlapping cinema cross-dissolves at beat boundaries (~0.24, ~0.50, ~0.80)
  const wVertiport = 1 - smoothstep(0.20, 0.30, p);
  const wClimb = smoothstep(0.20, 0.30, p) * (1 - smoothstep(0.46, 0.56, p));
  const wCruise = smoothstep(0.46, 0.56, p) * (1 - smoothstep(0.76, 0.85, p));
  const wApproach = smoothstep(0.76, 0.85, p);

  const sum = Math.max(0.0001, wVertiport + wClimb + wCruise + wApproach);
  return {
    vertiport: wVertiport / sum,
    climb: wClimb / sum,
    cruise: wCruise / sum,
    approach: wApproach / sum,
  };
}

/**
 * Deterministically evaluates complete 3D cinema scene state for any scroll progress [0..1].
 * Guarantees reversible, glitch-free forward scroll, reverse scroll, and direct beat jumps.
 */
export function evaluateCinemaState(
  rawProgress: number,
  interactionMode: CinemaInteractionMode = 'CINEMA_SCROLL'
): CinemaSceneState {
  const progress = clamp01(rawProgress);

  let segIdx = KEYFRAMES.length - 2;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (progress >= KEYFRAMES[i].t && progress <= KEYFRAMES[i + 1].t) {
      segIdx = i;
      break;
    }
  }

  const k0 = KEYFRAMES[Math.max(0, segIdx - 1)];
  const k1 = KEYFRAMES[segIdx];
  const k2 = KEYFRAMES[segIdx + 1];
  const k3 = KEYFRAMES[Math.min(KEYFRAMES.length - 1, segIdx + 2)];

  const span = Math.max(0.0001, k2.t - k1.t);
  const localT = clamp01((progress - k1.t) / span);
  const smoothT = smoothstep(0, 1, localT);

  const deg2rad = Math.PI / 180;
  const rotDeg = catmullRom3(k0.acRot, k1.acRot, k2.acRot, k3.acRot, localT);

  const isFreeOrbit = interactionMode === 'FREE_ORBIT';
  const plateWeights = computePlateWeights(progress, isFreeOrbit);
  const plateOpacity = isFreeOrbit ? 0 : 1;

  const nacelleTiltDeg = Math.max(
    0,
    Math.min(90, catmullRom(k0.tiltDeg, k1.tiltDeg, k2.tiltDeg, k3.tiltDeg, localT))
  );
  const gearDeploy = clamp01(k1.gear + (k2.gear - k1.gear) * smoothT);
  const padShadowOpacity = isFreeOrbit
    ? 0
    : clamp01(k1.padShadow + (k2.padShadow - k1.padShadow) * smoothT);

  return {
    progress,
    beat: getBeatForProgress(progress),
    interactionMode,
    cameraPos: catmullRom3(k0.camPos, k1.camPos, k2.camPos, k3.camPos, localT),
    cameraLookAt: catmullRom3(k0.camLook, k1.camLook, k2.camLook, k3.camLook, localT),
    cameraFov: Math.max(30, Math.min(52, catmullRom(k0.fov, k1.fov, k2.fov, k3.fov, localT))),
    aircraftPos: catmullRom3(k0.acPos, k1.acPos, k2.acPos, k3.acPos, localT),
    aircraftRot: [rotDeg[0] * deg2rad, rotDeg[1] * deg2rad, rotDeg[2] * deg2rad],
    nacelleTiltDeg,
    rotorRpm: Math.max(120, catmullRom(k0.rpm, k1.rpm, k2.rpm, k3.rpm, localT)),
    airspeedKmh: Math.max(
      0,
      Math.round(catmullRom(k0.airspeed, k1.airspeed, k2.airspeed, k3.airspeed, localT))
    ),
    altitudeM: Math.max(
      0,
      Math.round(catmullRom(k0.altitude, k1.altitude, k2.altitude, k3.altitude, localT))
    ),
    exposure: Math.max(0.75, Math.min(1.25, k1.exposure + (k2.exposure - k1.exposure) * smoothT)),
    gearDeploy,
    padShadowOpacity,
    plateOpacity,
    plateWeights,
    plateScale: k1.plateScale + (k2.plateScale - k1.plateScale) * smoothT,
    plateShiftX: k1.plateShiftX + (k2.plateShiftX - k1.plateShiftX) * smoothT,
    plateShiftY: k1.plateShiftY + (k2.plateShiftY - k1.plateShiftY) * smoothT,
  };
}
