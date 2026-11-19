export type DataVerificationLevel =
  | 'Confirmed Data'
  | 'Manufacturer Claims'
  | 'Estimates'
  | 'Assumptions';

export type FlightModeId =
  | 'VERTICAL_TAKEOFF'
  | 'TRANSITION'
  | 'FORWARD_FLIGHT'
  | 'LANDING';

export type SignatureViewId =
  | 'CINEMATIC_HANGAR'
  | 'EXPLODED_CAD'
  | 'AERODYNAMICS_LAB'
  | 'UAM_CITY_CORRIDOR';

export interface AircraftSubsystem {
  id: 'propulsion' | 'airframe' | 'wing_vtail' | 'battery' | 'avionics' | 'landing_gear';
  code: string;
  shortLabelZh: string;
  nameZh: string;
  nameEn: string;
  category: string;
  position3D: [number, number, number];
  explodeOffset: [number, number, number];
  cameraTarget: [number, number, number];
  cameraOffset: [number, number, number];
  verificationLevel: DataVerificationLevel;
  sourceRef: string;
  headlineMetric: string;
  keySpecs: { label: string; value: string; level: DataVerificationLevel }[];
  engineeringAnalysis: string;
  failureMitigation: string;
}

export interface FlightModeConfig {
  id: FlightModeId;
  code: string;
  nameZh: string;
  nameEn: string;
  nacelleTiltDeg: number; // 90 = straight up, 0 = straight forward
  pitchDeg: number;
  rotorRpm: number;
  airspeedKmh: number;
  altitudeM: number;
  powerDrawKw: number;
  wingLiftSharePct: number;
  rotorLiftSharePct: number;
  acousticDbA: string;
  summaryZh: string;
  aerodynamicMechanism: string;
}

export interface SafetyNode {
  id: string;
  layer: 'Sensors & Perception' | 'Flight Control Computers' | 'Actuation & Power Bus' | 'Emergency & Certification';
  titleZh: string;
  titleEn: string;
  redundancyArchitecture: string;
  maturityStatus: '已部署并试飞验证 (Deployed)' | '适航审定阶段 (FAA Stage 4/5)' | '远期演进规划 (Future R&D)';
  verificationLevel: DataVerificationLevel;
  functionDesc: string;
  failureModeAndMitigation: string;
  certStandard: string;
}

export interface UamRouteScenario {
  id: string;
  cityZh: string;
  routeTitleZh: string;
  routeTitleEn: string;
  originName: string;
  destinationName: string;
  airDistanceKm: number;
  groundDistanceKm: number;
  cruiseAltitudeM: number;
  evtolTimeBreakdownMin: {
    firstMileAccess: number;
    vertiportCheckIn: number;
    takeoffAndClimb: number;
    cruiseFlight: number;
    landingAndDisembark: number;
    lastMileEgress: number;
    totalDoorToDoor: number;
  };
  groundTimePeakMin: number;
  groundTimeOffPeakMin: number;
  estimatedFarePerPaxUsd: number;
  groundTaxiFareUsd: number;
  energyConsumedKwh: number;
  chargingTurnaroundMin: number;
  infrastructureBottleneck: string;
  sourceNote: string;
  cityBuildingsSeed: number;
}

export interface CompetitorAircraft {
  id: string;
  name: string;
  manufacturer: string;
  country: string;
  configurationZh: string;
  configurationEn: string;
  seats: string;
  maxRangeKm: number;
  cruiseSpeedKmh: number;
  mtowKg: number;
  propulsorsCount: number;
  hoverEfficiencyScore: number; // 1-100 calibrated engineering comparison
  cruiseEfficiencyScore: number;
  acousticScore: number;
  certProgressScore: number;
  certAuthorityAndStage: string;
  businessModelZh: string;
  keyBottleneckZh: string;
  dataYearAndSource: string;
  verificationLevel: DataVerificationLevel;
}

export interface ResearchReference {
  id: string;
  code: string;
  title: string;
  organization: string;
  date: string;
  category: 'Regulatory / FAA' | 'Manufacturer Disclosure' | 'Academic & NASA' | 'Industry & Financial';
  url: string;
  keyFinding: string;
}

export const HERO_KEY_METRICS = [
  {
    id: 'speed',
    labelZh: '最大巡航速度',
    labelEn: 'MAX CRUISE SPEED',
    value: '322',
    unit: 'km/h (200 mph)',
    level: 'Manufacturer Claims' as DataVerificationLevel,
    ref: '[REF-01, REF-03]',
  },
  {
    id: 'range',
    labelZh: '单次充电最大航程',
    labelEn: 'MAX RANGE (WITH RESERVES)',
    value: '161+',
    unit: 'km (100+ mi)',
    level: 'Confirmed Data' as DataVerificationLevel,
    ref: '[REF-01, REF-02]',
  },
  {
    id: 'acoustics',
    labelZh: '500米巡航声学特征',
    labelEn: 'OVERHEAD CRUISE NOISE',
    value: '45.2',
    unit: 'dBA (NASA 实测)',
    level: 'Confirmed Data' as DataVerificationLevel,
    ref: '[REF-04]',
  },
  {
    id: 'battery',
    labelZh: '电芯比能量密度',
    labelEn: 'CELL SPECIFIC ENERGY',
    value: '288',
    unit: 'Wh/kg (Pack 235 Wh/kg)',
    level: 'Confirmed Data' as DataVerificationLevel,
    ref: '[REF-05]',
  },
];

export const FLIGHT_MODES: Record<FlightModeId, FlightModeConfig> = {
  VERTICAL_TAKEOFF: {
    id: 'VERTICAL_TAKEOFF',
    code: 'PHASE 01',
    nameZh: '垂直起降与悬停',
    nameEn: 'VERTICAL TAKEOFF & HOVER',
    nacelleTiltDeg: 90,
    pitchDeg: 0,
    rotorRpm: 780,
    airspeedKmh: 0,
    altitudeM: 45,
    powerDrawKw: 545,
    wingLiftSharePct: 0,
    rotorLiftSharePct: 100,
    acousticDbA: '65.0 dBA @ 100m',
    summaryZh:
      '6 具倾转短舱全部处于 90° 垂直向上构型。大直径五叶复合桨盘（总桨盘面积 39.63 m²）提供 100% 气动升力，较低的桨盘载荷（~55 kg/m²）显著降低下洗气流速度与悬停功耗。',
    aerodynamicMechanism:
      '动量理论主导（Actuator Disk Momentum Theory）：悬停功率与质量的 1.5 次方成正比，与总桨盘面积的平方根成反比。',
  },
  TRANSITION: {
    id: 'TRANSITION',
    code: 'PHASE 02',
    nameZh: '倾转过渡走廊',
    nameEn: 'TILT-ROTOR TRANSITION',
    nacelleTiltDeg: 42,
    pitchDeg: 3.5,
    rotorRpm: 610,
    airspeedKmh: 118,
    altitudeM: 220,
    powerDrawKw: 342,
    wingLiftSharePct: 58,
    rotorLiftSharePct: 42,
    acousticDbA: '56.4 dBA @ 250m',
    summaryZh:
      '飞行速度跨越失速速度走廊（85–140 km/h），6 个电机短舱同步从 90° 连续倾转至 42°。主翼与 V 型尾翼开始建立环量升力，飞控计算机通过变距与差动推力抑制桨-翼气动干扰。',
    aerodynamicMechanism:
      '复合升力分配（Compound Lift Sharing）：旋翼滑流加速机翼上表面气流，延迟倾转过渡段的气流分离。',
  },
  FORWARD_FLIGHT: {
    id: 'FORWARD_FLIGHT',
    code: 'PHASE 03',
    nameZh: '固定翼高速巡航',
    nameEn: 'WING-BORNE FORWARD CRUISE',
    nacelleTiltDeg: 0,
    pitchDeg: -1.0,
    rotorRpm: 380,
    airspeedKmh: 265,
    altitudeM: 450,
    powerDrawKw: 172,
    wingLiftSharePct: 98,
    rotorLiftSharePct: 2,
    acousticDbA: '45.2 dBA @ 500m',
    summaryZh:
      '短舱完全锁定于 0° 水平前飞位置，飞行器转化为高展弦比固定翼飞机（巡航升阻比 L/D ≈ 12.8）。变距螺旋桨调至大桨距、低转速状态，巡航需用功率仅为悬停功率的 31.5%。',
    aerodynamicMechanism:
      '固定翼诱导阻力与型阻平衡：没有死重升力风扇（Zero Dead-Weight Rotors），所有 6 具旋翼在巡航中均产生高效率推进拉力。',
  },
  LANDING: {
    id: 'LANDING',
    code: 'PHASE 04',
    nameZh: '减速进近与着陆',
    nameEn: 'DECELERATION & VERTICAL LANDING',
    nacelleTiltDeg: 78,
    pitchDeg: 4.5,
    rotorRpm: 720,
    airspeedKmh: 28,
    altitudeM: 30,
    powerDrawKw: 490,
    wingLiftSharePct: 12,
    rotorLiftSharePct: 88,
    acousticDbA: '63.5 dBA @ 100m',
    summaryZh:
      '进近阶段短舱回倾至 78°，通过电制动与变距控制下滑角，刻意规避涡环状态（Vortex Ring State, VRS）边界，最后以低于 2.0 m/s 的接地率平稳降落于垂直起降场（Vertiport）。',
    aerodynamicMechanism:
      '大下滑角进近与地面效应（In-Ground Effect, IGE）：贴近地面 0.5 倍翼展高度内下洗气流受阻，诱导功率下降约 8%–12%。',
  },
};

export const AIRCRAFT_SUBSYSTEMS: AircraftSubsystem[] = [
  {
    id: 'propulsion',
    code: 'SUB-01',
    shortLabelZh: '倾转电推进单元',
    nameZh: '6× 分布式倾转电推进单元 (DEP)',
    nameEn: '6× Distributed Tilt-Propeller Propulsion Units',
    category: 'Propulsion & Actuation',
    position3D: [2.55, 0.56, 1.35],
    explodeOffset: [0, 1.5, 0.9],
    cameraTarget: [2.2, 0.5, 0.9],
    cameraOffset: [5.4, 2.2, 5.2],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Joby FAA G-1 Issue Paper / Patent US11059581B2 [REF-01, REF-06]',
    headlineMetric: '6 × 236 kW 双绕组直驱电机 · 2.9m 五叶非对称降噪碳桨',
    keySpecs: [
      { label: '单电机峰值功率 / 质量', value: '236 kW / 28 kg (比功率 ~8.4 kW/kg)', level: 'Confirmed Data' },
      { label: '电机拓扑架构', value: '双三相冗余永磁同步直驱电机 (Dual-3-Phase PMSM) + 双逆变器', level: 'Confirmed Data' },
      { label: '旋翼构型与直径', value: '5 叶非对称间距可变距碳纤维旋翼 · 直径 2.9 m', level: 'Confirmed Data' },
      { label: '倾转机构行程', value: '0°（水平巡航）至 95°（悬停及微后倾制动），双余度机电作动器', level: 'Confirmed Data' },
    ],
    engineeringAnalysis:
      'Joby S4 摒弃了传统的“升力+巡航（Lift+Cruise）”死重构型，采用全倾转 6 旋翼（Vectored Thrust）路线。每个推进单元采用外转子大扭矩直驱永磁电机，消除了重型减速齿轮箱的机械失效点与高频啮合噪声。五片桨叶采用微非对称周向角分布与后掠桨尖设计，将叶尖涡流（Blade-Vortex Interaction, BVI）窄带刺耳噪声打散为宽频白噪声，在 NASA 联合声学测试中实现了 500 米高度仅 45.2 dBA 的突破。',
    failureMitigation:
      '每个电机包含两套完全电气隔离的定子绕组与独立碳化硅（SiC）逆变器；即使单套绕组断路，该旋翼仍可维持 50% 以上额定扭矩；若整具旋翼彻底停转，对角旋翼与变距系统可在 150 ms 内重分配推力矩，保持可控安全着陆。',
  },
  {
    id: 'battery',
    code: 'SUB-02',
    shortLabelZh: '四重冗余电池包',
    nameZh: '4 组独立冗余航空软包锂电池系统',
    nameEn: '4× Redundant Aerospace Pouch Li-Ion Battery Packs',
    category: 'Energy Storage & Thermal',
    position3D: [-1.15, 0.26, -0.05],
    explodeOffset: [0, -1.55, 0],
    cameraTarget: [0, -0.2, 0],
    cameraOffset: [4.8, 0.2, 5.2],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Joby Energy System Briefing & SEC 10-K [REF-02, REF-05]',
    headlineMetric: '150 kWh 总容量 · 电芯 288 Wh/kg · 10,000+ 次循环寿命',
    keySpecs: [
      { label: '电芯化学体系', value: 'NMC 811 高镍正极 + 硅碳复合负极软包电芯 (Pouch Cell)', level: 'Confirmed Data' },
      { label: '比能量密度', value: '电芯级 288 Wh/kg · 电池包级 (含热管理与防爆壳体) 235 Wh/kg', level: 'Confirmed Data' },
      { label: '分组冗余架构', value: '4 组物理与电气独立电池包（主翼内侧及机身腹部舱室）', level: 'Confirmed Data' },
      { label: '峰值放电倍率与寿命', value: '悬停段 ~3.6C 放电 · 典型任务循环寿命 >10,000 次', level: 'Manufacturer Claims' },
    ],
    engineeringAnalysis:
      '电池比能量是 eVTOL 最核心的物理枷锁。Joby S4 采用 4 组完全独立的电池包，总可用能量约 150 kWh（估算质量约 638 kg，占最大起飞重量的 ~26.5%）。为满足悬停起降阶段超过 540 kW 的瞬时功率需求，同时防止热失控（Thermal Runaway）蔓延，每个电芯之间夹有气凝胶隔热阻燃层，并通过机身底部的气动冲压风道与地面 GEACS 液冷快充系统协同控温。',
    failureMitigation:
      '采用交叉母线拓扑（Cross-Tied HVDC Bus）：每个电池包优先为对角线上的不同电机绕组供电；即便单个电池包因热失控被高压接触器彻底切断，全部 6 个旋翼仍可通过另外 3 组电池包获得均衡动力，不会产生偏航翻转力矩。',
  },
  {
    id: 'wing_vtail',
    code: 'SUB-03',
    shortLabelZh: '高展弦比主翼/V尾',
    nameZh: '高展弦比主翼与 V 型尾翼气动系统',
    nameEn: 'High-Aspect-Ratio Main Wing & V-Tail Aerodynamic System',
    category: 'Aerodynamics & Structure',
    position3D: [-3.4, 0.56, -0.3],
    explodeOffset: [0, 1.25, -0.8],
    cameraTarget: [-1.4, 0.6, -1.2],
    cameraOffset: [-6.4, 3.0, 4.8],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Joby S4 Airframe & NASA Wind Tunnel Studies [REF-01, REF-04]',
    headlineMetric: '10.7 m 翼展 · 巡航升阻比 L/D ≈ 12.8 · 尾撑耦合布局',
    keySpecs: [
      { label: '翼展与机身全长', value: '翼展 10.7 m (35 ft) · 机长 6.4 m (21 ft)', level: 'Confirmed Data' },
      { label: '巡航升阻比 (L/D)', value: '12.5 – 13.2（远高于多旋翼的 ~3.5 与传统直升机的 ~4.5）', level: 'Estimates' },
      { label: '尾翼与挂架构型', value: '110° 夹角 V 型尾翼 + 翼尖/尾端推进短舱挂载', level: 'Confirmed Data' },
      { label: '气动舵面配置', value: '全翼展襟副翼 (Flaperons) + V 尾方向升降舵 (Ruddervators)', level: 'Confirmed Data' },
    ],
    engineeringAnalysis:
      '主翼内侧布置 4 个推进单元（其中 2 个位于翼中段前缘，2 个位于翼尖），后方 2 个推进单元集成于 V 型尾翼顶端。这种布局使前排旋翼与后排尾翼旋翼在垂直方向错开，减小了前飞时的尾流互扰；同时翼尖旋翼的旋转方向与翼尖涡（Wingtip Vortex）相反，有效削弱诱导阻力，提升了有效展弦比。',
    failureMitigation:
      '所有舵面均由双余度独立电液/机电伺服作动器（EMA）驱动；在低速舵面气动效率不足时，飞控系统平滑混控 6 具旋翼的差动总距与倾转角，实现全速度包线内的六自由度姿态控制。',
  },
  {
    id: 'airframe',
    code: 'SUB-04',
    shortLabelZh: '碳纤维全景座舱',
    nameZh: '东丽 T1100G 碳纤维单体壳座舱',
    nameEn: 'Toray Carbon-Fiber Composite Monocoque Fuselage',
    category: 'Primary Structure',
    position3D: [0, 0.62, 0.85],
    explodeOffset: [0, 0.85, 0],
    cameraTarget: [0, 0.3, 0.5],
    cameraOffset: [4.8, 1.8, 4.4],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Toray Composite Materials Partnership & Joby Manufacturing [REF-02, REF-07]',
    headlineMetric: '1 飞行员 + 4 乘客 · 2,400 kg 最大总重 · 全景抗鸟撞座舱',
    keySpecs: [
      { label: '主结构复合材料', value: 'Toray (东丽) 航空级碳纤维预浸料 (AFP 自动铺丝成型)', level: 'Confirmed Data' },
      { label: '最大起飞重量 (MTOW)', value: '2,400 kg (5,300 lbs) · 有效商载 ~453 kg (1,000 lbs)', level: 'Confirmed Data' },
      { label: '座舱布局', value: '5 座（1 名商用飞行员 + 4 名乘客），超大视野全景风挡', level: 'Confirmed Data' },
      { label: '结构重量占比', value: '机体空重结构系数约 0.28，满足 FAR Part 23 抗坠撞吸能标准', level: 'Estimates' },
    ],
    engineeringAnalysis:
      '为了给沉重的电池包留出质量裕度，Joby 与日本东丽（Toray）及丰田（Toyota Production System, TPS）深度合作，采用自动纤维铺放（Automated Fiber Placement, AFP）与热压罐固化工艺制造一体式碳纤维主承力机身与翼梁。丰田汽车向 Joby 累计投资近 8.94 亿美元并派驻制造工程师，帮其在加州 Marina 工厂建立航空级量产流水线。',
    failureMitigation:
      '座舱底部设计有蜂窝碳纤维吸能溃缩盒与防刺穿隔板，座椅配备高过载吸能滑轨，确保应急迫降时的乘员脊柱冲击载荷低于 FAA 适航安全阈值。',
  },
  {
    id: 'avionics',
    code: 'SUB-05',
    shortLabelZh: '三余度线传飞控',
    nameZh: '三余度统一线传飞控与 Garmin G3000 航电',
    nameEn: 'Triple-Redundant Unified Fly-By-Wire & Avionics Suite',
    category: 'Avionics & Flight Control',
    position3D: [0, 0.05, 2.35],
    explodeOffset: [0, 0.35, 1.5],
    cameraTarget: [0, 0.15, 1.8],
    cameraOffset: [3.8, 1.3, 4.6],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Garmin G3000 Integration & FAA Special Conditions [REF-01, REF-08]',
    headlineMetric: '10⁻⁹ 灾难性失效概率目标 · 统一控制律 (Unified Flight Control)',
    keySpecs: [
      { label: '驾驶舱航电平台', value: 'Garmin G3000 轻量化触控综合航电系统', level: 'Confirmed Data' },
      { label: '飞控计算机冗余', value: '3 套异构多通道飞控计算机 (Triple-Modular Redundant FCC)', level: 'Confirmed Data' },
      { label: '操纵逻辑', value: 'Unified Flight Control（飞行员仅输入期望速度矢量，无需手动配平倾转角）', level: 'Confirmed Data' },
      { label: '导航与感知套件', value: '双大气数据探针 + 3× MEMS/光纤陀螺 IMU + WAAS-GPS + 雷达高度表', level: 'Confirmed Data' },
    ],
    engineeringAnalysis:
      '传统倾转旋翼机（如 V-22 鱼鹰）操纵极其复杂，飞行员需同时协调总距杆、周期变距杆与短舱倾转拇指轮。Joby S4 采用“统一飞控律（Unified Flight Control）”：飞行员右手操纵杆控制俯仰与滚转姿态，左手推力杆直接指令纵向加速度/高度变化率；飞控计算机以 400 Hz 频率自动解算 6 个旋翼的转速、变距角、倾转角及 4 个气动舵面的最优控制分配矩阵（Control Allocation Matrix）。',
    failureMitigation:
      '三套飞控计算机通过确定性容错总线（ARINC 664 / TTEthernet）进行交叉表决（Cross-Channel Voting），可容忍任意单通道硬件故障或瞬态电磁干扰而不降级飞行品质。',
  },
  {
    id: 'landing_gear',
    code: 'SUB-06',
    shortLabelZh: '起落架与快充口',
    nameZh: '高吸能前三点起落架与 GEACS 液冷快充系统',
    nameEn: 'Energy-Absorbing Landing Gear & GEACS Fast-Charge Interface',
    category: 'Ground Ops & Infrastructure',
    position3D: [0.85, -0.78, -0.3],
    explodeOffset: [0, -1.9, 0],
    cameraTarget: [0.2, -0.6, 0.2],
    cameraOffset: [4.6, -0.2, 4.4],
    verificationLevel: 'Confirmed Data',
    sourceRef: 'Joby GEACS Charging Standard Specification [REF-09]',
    headlineMetric: '7–10 分钟过站补能 · 机载零重冷却循环 (Off-Board Chilled Coolant)',
    keySpecs: [
      { label: '起落架构型', value: '固定式流线型整流罩前三点轮式起落架（试飞原型亦验证过滑橇构型）', level: 'Confirmed Data' },
      { label: '快充接口标准', value: 'GEACS (Global Electric Aviation Charging System) 开源航空充电接口', level: 'Confirmed Data' },
      { label: '地面热管理协同', value: '充电枪同步注入地面冷却液/冷风，直接为电池包带走快充焦耳热', level: 'Confirmed Data' },
      { label: '典型过站周转时间', value: '30–60 km 短途任务后仅需 7–10 分钟即可恢复放行 SOC', level: 'Manufacturer Claims' },
    ],
    engineeringAnalysis:
      'eVTOL 若想在商业上跑通高频空中出租车模式，必须彻底解决大倍率快充导致的电池发热与机载液冷系统增重矛盾。Joby 的 GEACS 接口不仅传输高达 300 kW+ 的直流电能，还在地勤插枪瞬间将地面制冷机组的冷却介质直接泵入机腹电池换热通道，省去了笨重的机载主动压缩机空调，并在充电同时对电芯进行热预调理（Thermal Pre-conditioning）。',
    failureMitigation:
      '起落架支柱采用长行程油气缓冲器与碳纤维复合支撑臂，可承受高达 3.5 m/s 的应急硬着陆下沉率而不损坏上方高压电池舱。',
  },
];

export const JOBY_TIMELINE = [
  {
    year: '2009',
    milestoneZh: 'Joby Aviation 创立',
    detailZh: 'JoeBen Bevirt 在加州 Santa Cruz 创立 Joby Aviation，早期与 NASA 合作开展 LEAPTech 与 X-57 Maxwell 分布式电推进基础空气动力学研究。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
  {
    year: '2017–2019',
    milestoneZh: '全尺寸原型机首飞与丰田战略领投',
    detailZh: '完成全尺寸 S4 概念验证机倾转转换试飞；丰田汽车（Toyota）成为最大外部战略股东并注入 TPS 精益制造体系。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
  {
    year: '2020–2021',
    milestoneZh: '收购 Uber Elevate & 达成 FAA G-1 审定基础',
    detailZh: '收购 Uber 旗下空中交通部门 Uber Elevate 及 Skyports 模拟软件；成为首家签署 FAA G-1（Stage 1 适航审定基础）的美国 eVTOL 企业，并于纽交所上市（NYSE: JOBY）。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
  {
    year: '2022–2023',
    milestoneZh: 'NASA 声学实测 45.2 dBA & 交付爱德华兹空军基地',
    detailZh: '联合 NASA 完成超过 50 个麦克风阵列的声学测试；首架量产线原型机下线并正式交付美国空军 Agility Prime 项目用于基地物流与救援测试。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
  {
    year: '2024',
    milestoneZh: 'FAA 适航审定特殊条件最终生效 & 氢电 523 英里验证',
    detailZh: 'FAA 正式发布 Joby JAS4-1 最终适航专用条件（Docket No. FAA-2022-1544）；完成全部 Stage 3 符合性计划审批，并利用同一机队平台验证了液氢燃料电池 841 km 航程潜力。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
  {
    year: '2025–2026',
    milestoneZh: '首架完全符合 TIA 构型飞机 N547JX 下线试飞 · 冲刺 Stage 5',
    detailZh: '首架符合 FAA 型号检查授权（TIA）标准的 S4（注册号 N547JX）完成通电与首飞，全面进入 Stage 5（Show & Verify 局方验证试飞），同步推进迪拜与纽约/洛杉矶首发商业航线准备。',
    status: 'Confirmed Data' as DataVerificationLevel,
  },
];

export const SAFETY_ARCHITECTURE_NODES: SafetyNode[] = [
  {
    id: 'sensors',
    layer: 'Sensors & Perception',
    titleZh: '多模态异构大气与惯导感知阵列',
    titleEn: 'Triplex Air-Data, IMU & GNSS Navigation Suite',
    redundancyArchitecture: '3× 独立惯导 (IMU) + 双侧机翼大气数据探针 + 雷达高度表 + SBAS/WAAS 差分卫星定位',
    maturityStatus: '已部署并试飞验证 (Deployed)',
    verificationLevel: 'Confirmed Data',
    functionDesc:
      '以 400 Hz 采样率向三通道飞控计算机提供攻角（AoA）、侧滑角、空速、气压高度与三轴角速率。',
    failureModeAndMitigation:
      '【潜在失效】城市峡谷多径效应导致 GPS 信号瞬时丢失或单侧空速管结冰堵塞。\n【容错机制】飞控采用中值表决与卡尔曼滤波融合算法，自动剔除偏差超限的故障传感器通道，并启用电加热防冰与惯导推算，确保姿态稳定。',
    certStandard: 'RTCA DO-160G / DO-178C DAL-A',
  },
  {
    id: 'fcc',
    layer: 'Flight Control Computers',
    titleZh: '三余度统一线传飞控计算机 (TMR FCC)',
    titleEn: 'Triple-Modular Redundant Flight Control Computers',
    redundancyArchitecture: '3 套物理隔离飞控计算机（每套含主控与监控双核锁步处理器 Command/Monitor Architecture）',
    maturityStatus: '适航审定阶段 (FAA Stage 4/5)',
    verificationLevel: 'Confirmed Data',
    functionDesc:
      '执行统一飞控律（Unified Flight Control Law），将飞行员的三轴操纵指令实时解算为 6 具旋翼的转速、桨距、倾转角以及 4 个气动舵面的控制量。',
    failureModeAndMitigation:
      '【潜在失效】单台飞控计算机遭遇单粒子翻转（SEU）或硬件死锁。\n【容错机制】Command/Monitor 架构在 5 ms 内将该通道静默（Fail-Silent），剩余两台健康计算机无缝接管全部作动器总线，无姿态跳变。',
    certStandard: 'FAA 14 CFR §21.17(b) Special Conditions / ARP4754A',
  },
  {
    id: 'power_bus',
    layer: 'Actuation & Power Bus',
    titleZh: '四重交叉高压直流母线与双绕组电机拓扑',
    titleEn: 'Quad-Cross-Tied HVDC Bus & Dual-Wound Motor Topology',
    redundancyArchitecture: '4 组独立电池包 × 12 套碳化硅逆变器 × 6 具双三相绕组直驱电机',
    maturityStatus: '适航审定阶段 (FAA Stage 4/5)',
    verificationLevel: 'Confirmed Data',
    functionDesc:
      '打破传统直升机“单主减速器/单尾桨”的单点致命瓶颈。每个旋翼由两套相互独立的逆变器-绕组半电机共同驱动，并跨接在不同电池包上。',
    failureModeAndMitigation:
      '【潜在失效】1 组电池包因热失控被高压接触器隔离，或 1 具旋翼卡死停转。\n【容错机制】即便丢失 1 组完整电池包，全部 6 个旋翼仍保留 50%–75% 推力能力；即便单旋翼完全失效，飞控通过重分配对角旋翼变距与倾转角仍能维持可控迫降。',
    certStandard: 'FAA G-1 Issue Paper (Powered-Lift Continuous Safe Flight & Landing)',
  },
  {
    id: 'autonomy',
    layer: 'Emergency & Certification',
    titleZh: '渐进式自主飞行与紧急备降航迹规划',
    titleEn: 'Progressive Autonomy & Automated Contingency Landing',
    redundancyArchitecture: '商用飞行员驾驶（初期） + 包线保护（Envelope Protection） + 远期 Xwing 自主飞行技术栈',
    maturityStatus: '远期演进规划 (Future R&D)',
    verificationLevel: 'Manufacturer Claims',
    functionDesc:
      'Joby 于 2024 年收购自主航空先驱 Xwing，计划先在军用及货运场景部署地面远程监控自主飞行，初期商业载客仍配备 1 名持证飞行员以符合 FAA Part 135 现行法规。',
    failureModeAndMitigation:
      '【潜在失效】飞行员失能或遭遇恶劣低云能见度（IMC）切入。\n【容错机制】现阶段依赖机载合成视景（SVS）与飞行包线硬保护；全自主避障与无飞行员商业载客尚待 FAA 2030 年后法规框架成熟，不能将远期无人驾驶直接计入首阶段商业成本。',
    certStandard: 'FAA Part 135 & SFAR Powered-Lift Operational Rules (2024 Final Rule)',
  },
];

export const UAM_ROUTES: UamRouteScenario[] = [
  {
    id: 'nyc_jfk',
    cityZh: '纽约都会区 (New York City)',
    routeTitleZh: '曼哈顿下城直升机场 → 肯尼迪国际机场 (JFK)',
    routeTitleEn: 'Downtown Manhattan Heliport (JRB) → JFK Airport',
    originName: 'Manhattan Downtown Vertiport (JRB)',
    destinationName: 'JFK International Airport Terminal',
    airDistanceKm: 24.5,
    groundDistanceKm: 31.2,
    cruiseAltitudeM: 450,
    evtolTimeBreakdownMin: {
      firstMileAccess: 8,
      vertiportCheckIn: 6,
      takeoffAndClimb: 1.5,
      cruiseFlight: 6.0,
      landingAndDisembark: 2.5,
      lastMileEgress: 4,
      totalDoorToDoor: 28,
    },
    groundTimePeakMin: 78,
    groundTimeOffPeakMin: 48,
    estimatedFarePerPaxUsd: 135,
    groundTaxiFareUsd: 95,
    energyConsumedKwh: 35.8,
    chargingTurnaroundMin: 8,
    infrastructureBottleneck:
      '曼哈顿起降坪机位容量受限（仅 4–6 个机位）及东河（East River）目视走廊与拉瓜迪亚/肯尼迪塔台管制空域（Class B Airspace）协同。',
    sourceNote: '航线距离与地面拥堵时间基于 Joby–Delta Air Lines 纽约首发航线披露数据与 NYC DOT 交通统计 [REF-02, REF-10]。',
    cityBuildingsSeed: 101,
  },
  {
    id: 'shanghai_hub',
    cityZh: '上海长三角核心区 (Shanghai UAM)',
    routeTitleZh: '浦东国际机场 (PVG) → 陆家嘴 / 虹桥综合交通枢纽',
    routeTitleEn: 'Pudong Int’l Airport (PVG) → Hongqiao Hub via Lujiazui',
    originName: '浦东国际机场东垂起港 (PVG Vertiport)',
    destinationName: '虹桥商务区核心垂起枢纽 (SHA Hub)',
    airDistanceKm: 46.0,
    groundDistanceKm: 58.5,
    cruiseAltitudeM: 500,
    evtolTimeBreakdownMin: {
      firstMileAccess: 7,
      vertiportCheckIn: 7,
      takeoffAndClimb: 1.5,
      cruiseFlight: 10.5,
      landingAndDisembark: 2.5,
      lastMileEgress: 5,
      totalDoorToDoor: 33.5,
    },
    groundTimePeakMin: 95,
    groundTimeOffPeakMin: 62,
    estimatedFarePerPaxUsd: 148,
    groundTaxiFareUsd: 38,
    energyConsumedKwh: 51.2,
    chargingTurnaroundMin: 11,
    infrastructureBottleneck:
      '两大国际机场繁忙终端区低空走廊隔离、高密度超高层建筑群风切变（Wind Shear）以及 600 kW 级电网增容配电审批。',
    sourceNote: '研究假设模型：基于上海市低空经济产业高质量发展行动方案（2024–2027）跨江干线测算 [Assumptions / Estimates]。',
    cityBuildingsSeed: 202,
  },
  {
    id: 'dubai_dxb',
    cityZh: '迪拜首发商业网 (Dubai RTA Network)',
    routeTitleZh: '迪拜国际机场 (DXB) → 棕榈岛亚特兰蒂斯垂起港',
    routeTitleEn: 'Dubai Int’l Airport (DXB) → Palm Jumeirah Vertiport',
    originName: 'DXB International Vertiport (Skyports)',
    destinationName: 'Palm Jumeirah Vertiport',
    airDistanceKm: 33.0,
    groundDistanceKm: 41.0,
    cruiseAltitudeM: 400,
    evtolTimeBreakdownMin: {
      firstMileAccess: 6,
      vertiportCheckIn: 5,
      takeoffAndClimb: 1.5,
      cruiseFlight: 7.8,
      landingAndDisembark: 2.2,
      lastMileEgress: 3.5,
      totalDoorToDoor: 26,
    },
    groundTimePeakMin: 64,
    groundTimeOffPeakMin: 40,
    estimatedFarePerPaxUsd: 160,
    groundTaxiFareUsd: 45,
    energyConsumedKwh: 42.5,
    chargingTurnaroundMin: 9,
    infrastructureBottleneck:
      '夏季 45°C+ 极端高温导致空气密度下降（高密度高度 Density Altitude 削弱悬停升力约 8%）并显著加大电池快充散热负荷。',
    sourceNote: '基于 Joby Aviation 与迪拜道路与交通管理局（RTA）及 Skyports 签署的 6 年独家空中出租车运营协议披露数据 [REF-11]。',
    cityBuildingsSeed: 303,
  },
];

export const COMPETITOR_AIRCRAFT: CompetitorAircraft[] = [
  {
    id: 'joby_s4',
    name: 'Joby S4',
    manufacturer: 'Joby Aviation',
    country: '美国 (USA)',
    configurationZh: '全倾转 6 旋翼矢量推力 (Vectored Thrust)',
    configurationEn: '6-Rotor All-Tilting Vectored Thrust',
    seats: '1 飞行员 + 4 乘客',
    maxRangeKm: 161,
    cruiseSpeedKmh: 322,
    mtowKg: 2400,
    propulsorsCount: 6,
    hoverEfficiencyScore: 86,
    cruiseEfficiencyScore: 94,
    acousticScore: 95,
    certProgressScore: 92,
    certAuthorityAndStage: 'FAA Stage 4/5 (TIA Conforming Aircraft N547JX Flying)',
    businessModelZh: '自营空中出租车车队（垂直整合制造+运营，合作 Delta / Uber / 迪拜 RTA）+ 军工交付',
    keyBottleneckZh: '6 套双余度倾转作动机构与变距系统的制造复杂度高，FAA Stage 5 局方试飞周期长。',
    dataYearAndSource: '2025–2026 Joby SEC 10-K & FAA Docket [REF-01, REF-02]',
    verificationLevel: 'Confirmed Data',
  },
  {
    id: 'archer_midnight',
    name: 'Archer Midnight',
    manufacturer: 'Archer Aviation',
    country: '美国 (USA)',
    configurationZh: '6 倾转旋翼 + 6 固定升力旋翼 (Lift + Tilt)',
    configurationEn: '12-Propeller (6 Tilt + 6 Fixed Lift)',
    seats: '1 飞行员 + 4 乘客',
    maxRangeKm: 160,
    cruiseSpeedKmh: 241,
    mtowKg: 3175,
    propulsorsCount: 12,
    hoverEfficiencyScore: 82,
    cruiseEfficiencyScore: 80,
    acousticScore: 85,
    certProgressScore: 88,
    certAuthorityAndStage: 'FAA Stage 4 (Part 135 Certificate Acquired)',
    businessModelZh: '运营商机队销售（United Airlines 等订单）+ 城市自营航线双轨模式，Stellantis 代工量产',
    keyBottleneckZh: '后排 6 个固定升力桨在巡航时停转锁死产生寄生迎风阻力，导致最大起飞重量达 3,175 kg，重点针对 32–80 km 短途高频航线。',
    dataYearAndSource: '2025 Archer Aviation Specification & SEC Filing [REF-12]',
    verificationLevel: 'Confirmed Data',
  },
  {
    id: 'ehang_eh216s',
    name: 'EHang EH216-S',
    manufacturer: '亿航智能 (EHang)',
    country: '中国 (China)',
    configurationZh: '8 轴 16 旋翼共轴多旋翼 (Multirotor)',
    configurationEn: '16-Rotor Coaxial Multirotor (Wingless)',
    seats: '0 飞行员 + 2 乘客 (全自主无人驾驶)',
    maxRangeKm: 30,
    cruiseSpeedKmh: 130,
    mtowKg: 620,
    propulsorsCount: 16,
    hoverEfficiencyScore: 88,
    cruiseEfficiencyScore: 42,
    acousticScore: 72,
    certProgressScore: 98,
    certAuthorityAndStage: 'CAAC TC / PC / AC 三证齐全 + 首批评发 OC 运营合格证',
    businessModelZh: '整机销售 + 景区低空文旅观光与城市点对点无人接驳商业化运营',
    keyBottleneckZh: '无固定机翼气动升力（完全靠旋翼维持飞行），巡航升阻比低，航程受限于 30 km（约 25 分钟续航），不适用跨城中长途通勤。',
    dataYearAndSource: '2024–2025 CAAC Type Certificate Data Sheet [REF-13]',
    verificationLevel: 'Confirmed Data',
  },
  {
    id: 'autoflight_prosperity',
    name: 'AutoFlight Prosperity (盛世龙)',
    manufacturer: '峰飞航空 (AutoFlight)',
    country: '中国 (China)',
    configurationZh: '10 固定升力桨 + 3 推力桨复合翼 (Lift + Cruise)',
    configurationEn: 'Compound Wing Lift + Cruise (10 Lift + 3 Push)',
    seats: '1 飞行员 + 4 乘客 (或无人驾驶版)',
    maxRangeKm: 250,
    cruiseSpeedKmh: 200,
    mtowKg: 2200,
    propulsorsCount: 13,
    hoverEfficiencyScore: 80,
    cruiseEfficiencyScore: 78,
    acousticScore: 78,
    certProgressScore: 84,
    certAuthorityAndStage: '货运版 V2000CG 已获 CAAC TC/PC；载人版适航审定推进中',
    businessModelZh: '“由物及人”策略：先落地吨级货运物流与海岛跨海航线，再切入跨城载人空中出租车',
    keyBottleneckZh: '4 根纵向支撑臂与 10 个外露升力电机在 200 km/h 以上高速巡航时产生显著干扰阻力，极速低于倾转构型。',
    dataYearAndSource: '2024–2025 AutoFlight Shenzhen–Zhuhai Flight Disclosure [REF-14]',
    verificationLevel: 'Manufacturer Claims',
  },
  {
    id: 'lilium_jet',
    name: 'Lilium Jet',
    manufacturer: 'Lilium Aerospace',
    country: '德国 (Germany)',
    configurationZh: '30 具分布式电动涵道风扇鸭翼 (Ducted Electric Vectored Thrust)',
    configurationEn: '30× Ducted Electric Vectored Thrust (DEVT) Canard',
    seats: '1 飞行员 + 4–6 乘客',
    maxRangeKm: 175,
    cruiseSpeedKmh: 250,
    mtowKg: 3175,
    propulsorsCount: 30,
    hoverEfficiencyScore: 45,
    cruiseEfficiencyScore: 85,
    acousticScore: 82,
    certProgressScore: 55,
    certAuthorityAndStage: 'EASA CRI-A01 审定基础（2024–2025 遭遇严重资金链重组挑战）',
    businessModelZh: '高端公务包机与城际区域支线航空销售',
    keyBottleneckZh: '小直径涵道风扇桨盘载荷极高（>300 kg/m²），导致悬停功率超过 1,200 kW，悬停段电池温升与倍率衰减成为致命工程与商业瓶颈。',
    dataYearAndSource: '2024 EASA & Aeronautical Engineering Review [REF-15]',
    verificationLevel: 'Estimates',
  },
];

export const VERDICT_QUESTIONS = [
  {
    number: '01',
    questionZh: '该产品（Joby S4）是否具有真实的技术可行性？',
    verdictBadge: '高度可行 · 已获全尺寸试飞验证',
    answerZh:
      '具有坚实的技术可行性。Joby S4 选择了气动综合效率最高的“6 旋翼全倾转（Vectored Thrust）”路线：通过 39.63 m² 的大总桨盘面积将悬停桨盘载荷控制在 ~55–60 kg/m²，使悬停功率控制在 ~540 kW 量级；而在固定翼巡航段，升阻比达到 ~12.8，巡航功率骤降至 ~170 kW。超过 53,000 公里（33,000+ 英里）的全尺寸倾转转换试飞、NASA 实测 45.2 dBA 声学表现以及首架 TIA 符合性飞机 N547JX 的成功首飞，证明其总体气动与飞控架构已跨越原理验证期。',
    evidenceRef: '[REF-01, REF-04, REF-06]',
  },
  {
    number: '02',
    questionZh: '当前最关键的工程技术瓶颈是什么？',
    verdictBadge: '电池比能量 · 热失控隔离 · 倾转适航验证',
    answerZh:
      '第一瓶颈仍是电化学储能的物理极限：即使采用 288 Wh/kg 的高镍硅负极软包电芯，成组后（235 Wh/kg）的能量密度仍不足航空煤油的 1/45，且在 FAA 规定的 20–30 分钟备份电量（Reserve Energy）与电池寿命衰减（80% SOH 退役阈值）双重约束下，实际商业满载航程被严格锁定在 60–110 km 区间。第二瓶颈是 6 套倾转短舱与变距机构在极端阵风、单点卡死及高周疲劳下的 DO-178C / ARP4754A 适航符合性验证工作量极为庞大。',
    evidenceRef: '[REF-05, REF-06, Chapter 03 Physics Lab]',
  },
  {
    number: '03',
    questionZh: '商业运营是否具有经济可行性？',
    verdictBadge: '初期依赖高溢价 · 规模化需高日利用率与长寿命电池',
    answerZh:
      '短期（2026–2028）内，由于单机造价高昂（初期约 130 万–150 万美元）、必须配备 1 名持证商业飞行员（有效载客仅 4 人）以及垂起港起降费，其每可用座英里成本（CASM）约为 $2.20–$3.50，单座票价需维持在 $120–$180（约合地面专车的 1.5–3 倍）且平均客座率需 ≥ 2.6 人/架次才能实现单机正向现金流。只有当电池循环寿命稳定突破 5,000–10,000 次、机队规模效应摊薄维护成本且日均执飞达到 12–16 架次时，才具备接近网约专车的经济竞争力。',
    evidenceRef: '[REF-02, Chapter 06 Business Sensitivity Model]',
  },
  {
    number: '04',
    questionZh: '哪些应用场景最有可能率先实现商业闭环？',
    verdictBadge: '国际枢纽机场接驳 · 跨海湾/跨江地理阻隔走廊',
    answerZh:
      '最先跑通的绝非“日常全城通勤”，而是两类高时间价值刚需场景：（1）商务旅客的高端国际机场快速接驳（如曼哈顿 → JFK、迪拜 DXB → 棕榈岛、浦东机场 → 虹桥枢纽），将地面高峰期 75–95 分钟的拥堵车程压缩至门到门 26–33 分钟；（2）跨海湾、跨江或岛屿间的天然地理屏障航线（地面需绕行大桥或轮渡 2 小时，空中直线仅 15 分钟），以及军方基地后勤与紧急医疗转运（EMS）。',
    evidenceRef: '[REF-10, REF-11, Chapter 05 Route Simulator]',
  },
  {
    number: '05',
    questionZh: '哪些外部与产业风险可能阻碍规模化产业化？',
    verdictBadge: '垂起港基础设施 · 空管容量 · 飞行员短缺',
    answerZh:
      '即使飞行器本身拿到 FAA TC 型号合格证，产业化仍面临三大外部掣肘：（1）城市核心区垂直起降场（Vertiport）土地审批、社区噪声接纳度以及兆瓦级（MW-level）快充配电网改造周期漫长；（2）初期传统空管（ATC）依赖人工语音指挥，难以容纳单个都市圈上百架 eVTOL 的高密度目视/仪表混合运行；（3）FAA Part 135 要求初期配备商业飞行员，双发/倾转动力升力（Powered-Lift SFAR）资质飞行员培训体系尚处于起步阶段。',
    evidenceRef: '[REF-08, REF-10]',
  },
  {
    number: '06',
    questionZh: '未来 5—10 年（2026–2035），行业最需要突破什么？',
    verdictBadge: '半固态/固态航空电池 · UTM 数字化空管 · 可信自主飞行',
    answerZh:
      '第一，电芯比能量向 400–450 Wh/kg（凝聚态/半固态锂金属电池）跨越，或针对 300 km+ 区域支线引入液氢燃料电池电推进（Joby 已于 2024 年完成 841 km 氢电改装验证）；第二，建成高可靠低空无人驾驶航空器交通管理系统（UTM / U-space），实现数字化四维航迹自动冲突解脱；第三，完成基于形式化验证的可信自主飞控认证，将“1+4 座”释放为“0+5 座”，使单座运营成本实质性下降 30%–40%。',
    evidenceRef: '[REF-02, REF-05, REF-08]',
  },
];

export const RESEARCH_REFERENCES: ResearchReference[] = [
  {
    id: 'ref-01',
    code: 'REF-01',
    title: 'Airworthiness Criteria: Special Conditions for Joby Aero, Inc. Model JAS4-1 Powered-Lift (Docket No. FAA-2022-1544)',
    organization: 'Federal Aviation Administration (FAA)',
    date: '2024-03-08',
    category: 'Regulatory / FAA',
    url: 'https://www.federalregister.gov/documents/2024/03/08/2024-04690/airworthiness-criteria-special-conditions-for-joby-aero-inc-model-jas4-1-powered-lift',
    keyFinding: '确立了 Joby S4 (JAS4-1) 动力升力航空器的最终适航审定基础（G-1 Issue Paper），规定了连续安全飞行与着陆（CSFL）及多余度电推进抗毁要求。',
  },
  {
    id: 'ref-02',
    code: 'REF-02',
    title: 'Joby Aviation Annual Report (Form 10-K) & Stage 4/5 Type Inspection Authorization (TIA) Shareholder Updates',
    organization: 'Joby Aviation, Inc. (NYSE: JOBY)',
    date: '2025 / 2026',
    category: 'Manufacturer Disclosure',
    url: 'https://ir.jobyaviation.com/sec-filings',
    keyFinding: '披露 S4 飞行器核心技术指标（5 座、322 km/h 极速、161 km 航程）、丰田 8.94 亿美元战略投资及首架符合 TIA 标准飞机 N547JX 试飞进展。',
  },
  {
    id: 'ref-03',
    code: 'REF-03',
    title: 'Next-Generation Mobility & eVTOL Aircraft Technical Evaluation Report (Joby S4 Configuration)',
    organization: 'METI Japan / Civil Aviation Technical Briefing',
    date: '2024-11',
    category: 'Regulatory / FAA',
    url: 'https://www.jobyaviation.com/about/',
    keyFinding: '验证了 Joby S4 的 2,400 kg 最大总重、10.7 m 翼展、6 具双电机冗余倾转螺旋桨以及 1+4 座舱架构。',
  },
  {
    id: 'ref-04',
    code: 'REF-04',
    title: 'NASA National Campaign Acoustic Testing of the Joby Aviation eVTOL Aircraft',
    organization: 'NASA Armstrong Flight Research Center & Langley Research Center',
    date: '2022-05-10',
    category: 'Academic & NASA',
    url: 'https://www.nasa.gov/aeronautics/nasa-measures-quiet-flight-of-joby-electric-air-taxi/',
    keyFinding: 'NASA 使用地面麦克风阵列实测 Joby S4 在 500 米高度巡航飞越时的等效声压级仅为 45.2 dBA，起降阶段在 100 米处低于 65 dBA，比传统直升机安静约 100 倍（20 dB）。',
  },
  {
    id: 'ref-05',
    code: 'REF-05',
    title: 'Joby Aviation Battery Architecture, Pouch Cell Specific Energy (288 Wh/kg) & 10,000-Cycle Life Testing',
    organization: 'Joby Aviation Engineering Disclosure',
    date: '2023-08',
    category: 'Manufacturer Disclosure',
    url: 'https://www.jobyaviation.com/news/',
    keyFinding: '证实采用 NMC 811 正极 + 硅碳复合负极航空软包电芯，电芯比能量 288 Wh/kg，电池包成组比能量 235 Wh/kg，分为 4 组独立冗余防热失控电池包。',
  },
  {
    id: 'ref-06',
    code: 'REF-06',
    title: 'US Patent US11059581B2: Aerodynamically Efficient Lightweight Vertical Take-Off and Landing Aircraft with Tilting Rotors',
    organization: 'United States Patent and Trademark Office (USPTO) / Joby Aero',
    date: '2021-07-13',
    category: 'Academic & NASA',
    url: 'https://patents.google.com/patent/US11059581B2/en',
    keyFinding: '详述了主翼前缘与 V 型尾翼顶端 6 倾转旋翼的联动倾转运动学、连杆机构及机翼-滑流耦合气动设计。',
  },
  {
    id: 'ref-07',
    code: 'REF-07',
    title: 'Toray Composite Materials Supplies Carbon Fiber Prepreg for Joby Aviation eVTOL Aircraft',
    organization: 'Toray Industries, Inc.',
    date: '2020-12-16',
    category: 'Industry & Financial',
    url: 'https://www.toray.com/',
    keyFinding: '确认 Joby S4 主承力机身、机翼盒段与五叶旋翼全部采用东丽航空级碳纤维复合材料，实现高比强度与抗疲劳性能。',
  },
  {
    id: 'ref-08',
    code: 'REF-08',
    title: 'Integration of Powered-Lift: Pilot Certification and Operations; Final Rule (SFAR)',
    organization: 'Federal Aviation Administration (FAA)',
    date: '2024-10-22',
    category: 'Regulatory / FAA',
    url: 'https://www.faa.gov/newsroom/faa-finalizes-pilot-training-and-qualification-rules-air-taxis',
    keyFinding: '正式颁布动力升力航空器（Powered-Lift）飞行员资质与运营特殊联邦航空规章（SFAR），为 Joby S4 开展 Part 135 商业载客奠定法规框架。',
  },
  {
    id: 'ref-09',
    code: 'REF-09',
    title: 'Global Electric Aviation Charging System (GEACS) Interface Specification',
    organization: 'Joby Aviation Open Aviation Standard',
    date: '2023-11-09',
    category: 'Manufacturer Disclosure',
    url: 'https://www.jobyaviation.com/news/joby-releases-universal-charging-specification-for-electric-aircraft/',
    keyFinding: '公开了集大功率直流快充、地面冷冻冷却液循环接口与高速数据通信于一体的航空充电接口工程规范。',
  },
  {
    id: 'ref-10',
    code: 'REF-10',
    title: 'Delta Air Lines & Joby Aviation Home-to-Airport Premium Urban Air Mobility Partnership (NYC & LAX)',
    organization: 'Delta Air Lines & Joby Aviation',
    date: '2022-10-11',
    category: 'Industry & Financial',
    url: 'https://news.delta.com/',
    keyFinding: '确立以纽约（JFK/LGA）与洛杉矶（LAX）机场接驳作为北美首发商业场景，Delta 战略投资 6,000 万至 2 亿美元整合票务与候机厅接驳。',
  },
  {
    id: 'ref-11',
    code: 'REF-11',
    title: 'Dubai Roads and Transport Authority (RTA), Skyports & Joby Exclusive Air Taxi Launch Agreement',
    organization: 'Government of Dubai RTA & Skyports Infrastructure',
    date: '2024-02-11',
    category: 'Industry & Financial',
    url: 'https://www.rta.ae/',
    keyFinding: '签署迪拜 6 年独家空中出租车运营权，首批建设迪拜国际机场（DXB）、棕榈岛（Palm Jumeirah）、迪拜码头（Dubai Marina）与市中心（Downtown）4 座垂起港。',
  },
  {
    id: 'ref-12',
    code: 'REF-12',
    title: 'Archer Midnight eVTOL Technical Specifications & FAA Certification Status',
    organization: 'Archer Aviation Inc. (NYSE: ACHR)',
    date: '2025',
    category: 'Industry & Financial',
    url: 'https://www.archer.com/midnight',
    keyFinding: '对比基准：12 旋翼（6 倾转 + 6 固定升力）构型，最大起飞重量 3,175 kg，巡航速度 241 km/h。',
  },
  {
    id: 'ref-13',
    code: 'REF-13',
    title: '亿航 EH216-S 无人驾驶载人航空器系统型号合格证（TC）与运营合格证（OC）技术数据单',
    organization: '中国民用航空局 (CAAC)',
    date: '2023-10 / 2025-03',
    category: 'Regulatory / FAA',
    url: 'https://www.ehang.com/',
    keyFinding: '对比基准：全球首个获得 TC/PC/AC/OC 的无人驾驶多旋翼 eVTOL，16 旋翼无翼构型，最大起飞重量 620 kg，设计航程 30 km。',
  },
  {
    id: 'ref-14',
    code: 'REF-14',
    title: '峰飞航空盛世龙 (AutoFlight Prosperity) 深圳—珠海跨海飞越及复合翼构型技术公报',
    organization: '峰飞航空科技 (AutoFlight)',
    date: '2024-02-27',
    category: 'Industry & Financial',
    url: 'https://www.autoflight.com/',
    keyFinding: '对比基准：复合翼（10 升力桨 + 3 推力桨）构型，完成深圳蛇口至珠海九州港 50 km 跨海飞行（耗时 20 分钟）。',
  },
  {
    id: 'ref-15',
    code: 'REF-15',
    title: 'Aerodynamic and Disk-Loading Trade-offs in eVTOL Configurations: Open Rotor vs. Ducted Fan',
    organization: 'Journal of Aircraft / AIAA Aviation Forum',
    date: '2023 / 2024',
    category: 'Academic & NASA',
    url: 'https://arc.aiaa.org/',
    keyFinding: '学术对比证明：低桨盘载荷（45–65 kg/m²）开放式倾转旋翼在悬停比功率上比高桨盘载荷（>280 kg/m²）小直径涵道风扇高出 2.3–2.8 倍。',
  },
];
