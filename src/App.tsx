import { useEffect, useState } from 'react';
import { FlightModeId, SignatureViewId } from './data/researchData';
import { VisualRenderMode } from './three/jobyS4Model';
import { CameraPresetId } from './components/AircraftShowcase3D';
import { Navbar } from './components/Navbar';
import { CHAPTERS, ChapterSidebar } from './components/ChapterSidebar';
import { HeroChapter } from './components/chapters/HeroChapter';
import { CityFlightCinemaSection } from './components/CityFlightCinemaSection';
import { AircraftOverviewChapter } from './components/chapters/AircraftOverviewChapter';
import { EngineeringDeepDiveChapter } from './components/chapters/EngineeringDeepDiveChapter';
import { PhysicsLabChapter } from './components/chapters/PhysicsLabChapter';
import { SafetyAutonomyChapter } from './components/chapters/SafetyAutonomyChapter';
import { UrbanMobilityChapter } from './components/chapters/UrbanMobilityChapter';
import { BusinessRealityChapter } from './components/chapters/BusinessRealityChapter';
import { CompetitiveLandscapeChapter } from './components/chapters/CompetitiveLandscapeChapter';
import { VerdictAndReferencesChapter } from './components/chapters/VerdictAndReferencesChapter';

interface DemoStep {
  targetId: string;
  caption: string;
  flightMode?: FlightModeId;
  visualMode?: VisualRenderMode;
  explode?: number;
  subsystem?: string | null;
  camera?: CameraPresetId;
}

const DEMO_STEPS: DemoStep[] = [
  {
    targetId: 'chapter-01',
    caption: '01/05 · 电影级三维机库展示：Joby S4 处于垂直起降（90° 倾转）状态，大直径五叶非对称旋翼提供低盘载升力。',
    flightMode: 'VERTICAL_TAKEOFF',
    visualMode: 'CINEMATIC',
    explode: 0,
    subsystem: null,
    camera: 'default',
  },
  {
    targetId: 'chapter-01',
    caption: '02/05 · 机械结构 CAD 蓝图拆解：展示 6 具倾转电推进单元、4 组交叉冗余电池包与碳纤维单体壳座舱装配拓扑。',
    flightMode: 'TRANSITION',
    visualMode: 'ENGINEERING_CAD',
    explode: 0.85,
    subsystem: null,
    camera: 'default',
  },
  {
    targetId: 'chapter-01',
    caption: '03/05 · 空气动力学流场与固定翼巡航模式：短舱倾转至 0° 水平前飞，高展弦比主翼承担 98% 升力，巡航功率骤降至 172 kW。',
    flightMode: 'FORWARD_FLIGHT',
    visualMode: 'AERO_CFD',
    explode: 0,
    subsystem: null,
    camera: 'default',
  },
  {
    targetId: 'chapter-03',
    caption: '04/05 · 飞行物理实验室：基于动量理论与电动布雷盖方程，定量分析起飞总重、预留电量与最大航程的物理约束。',
  },
  {
    targetId: 'chapter-05',
    caption: '05/05 · 三维城市空中交通走廊：实证评估机场接驳门到门总耗时、地面快充周期与基础设施真实瓶颈。',
  },
];

export default function App() {
  const [flightMode, setFlightMode] = useState<FlightModeId>('VERTICAL_TAKEOFF');
  const [visualMode, setVisualMode] = useState<VisualRenderMode>('CINEMATIC');
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('default');
  const [activeChapterId, setActiveChapterId] = useState('chapter-00');

  const [isAutoDemoRunning, setIsAutoDemoRunning] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  // Track active section in viewport for left mission rail
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapterId(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -50% 0px' }
    );

    CHAPTERS.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const applyDemoStep = (idx: number) => {
    const step = DEMO_STEPS[idx];
    if (!step) return;
    if (step.flightMode) setFlightMode(step.flightMode);
    if (step.visualMode) setVisualMode(step.visualMode);
    if (step.explode !== undefined) setExplodeFactor(step.explode);
    if (step.subsystem !== undefined) setSelectedSubsystemId(step.subsystem);
    if (step.camera) setCameraPreset(step.camera);

    const el = document.getElementById(step.targetId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!isAutoDemoRunning) return;
    applyDemoStep(demoStepIndex);
    const timer = window.setInterval(() => {
      setDemoStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [isAutoDemoRunning, demoStepIndex]);

  const handleSelectSignatureScene = (view: SignatureViewId) => {
    setIsAutoDemoRunning(false);
    if (view === 'CINEMATIC_HANGAR') {
      setVisualMode('CINEMATIC');
      setExplodeFactor(0);
      setFlightMode('VERTICAL_TAKEOFF');
      setSelectedSubsystemId(null);
      setCameraPreset('default');
      document.getElementById('chapter-01')?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'EXPLODED_CAD') {
      setVisualMode('ENGINEERING_CAD');
      setExplodeFactor(0.85);
      setFlightMode('TRANSITION');
      setSelectedSubsystemId(null);
      setCameraPreset('default');
      document.getElementById('chapter-01')?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'AERODYNAMICS_LAB') {
      setVisualMode('AERO_CFD');
      setExplodeFactor(0);
      setFlightMode('FORWARD_FLIGHT');
      setSelectedSubsystemId(null);
      setCameraPreset('default');
      document.getElementById('chapter-01')?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'UAM_CITY_CORRIDOR') {
      document.getElementById('chapter-05')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030508] text-slate-100">
      <Navbar
        isAutoDemoRunning={isAutoDemoRunning}
        onToggleAutoDemo={() => {
          if (isAutoDemoRunning) {
            setIsAutoDemoRunning(false);
          } else {
            setDemoStepIndex(0);
            setIsAutoDemoRunning(true);
          }
        }}
      />

      <ChapterSidebar
        activeChapterId={activeChapterId}
        isAutoDemoRunning={isAutoDemoRunning}
        autoDemoStepIndex={demoStepIndex}
        autoDemoCaption={DEMO_STEPS[demoStepIndex]?.caption ?? ''}
        onNextDemoStep={() => setDemoStepIndex((prev) => (prev + 1) % DEMO_STEPS.length)}
        onStopDemo={() => setIsAutoDemoRunning(false)}
      />

      <main>
        <HeroChapter onJumpToSignatureScene={handleSelectSignatureScene} />

        <CityFlightCinemaSection />

        <AircraftOverviewChapter
          flightMode={flightMode}
          onChangeFlightMode={setFlightMode}
          visualMode={visualMode}
          onChangeVisualMode={setVisualMode}
          explodeFactor={explodeFactor}
          onChangeExplodeFactor={setExplodeFactor}
          selectedSubsystemId={selectedSubsystemId}
          onSelectSubsystem={setSelectedSubsystemId}
          cameraPreset={cameraPreset}
          onChangeCameraPreset={setCameraPreset}
          onSelectSignaturePreset={handleSelectSignatureScene}
        />

        <EngineeringDeepDiveChapter />

        <PhysicsLabChapter />

        <SafetyAutonomyChapter />

        <UrbanMobilityChapter />

        <BusinessRealityChapter />

        <CompetitiveLandscapeChapter />

        <VerdictAndReferencesChapter />
      </main>
    </div>
  );
}
