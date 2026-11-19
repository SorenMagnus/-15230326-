import React from 'react';
import {
  AIRCRAFT_SUBSYSTEMS,
  FLIGHT_MODES,
  FlightModeId,
  JOBY_TIMELINE,
  SignatureViewId,
} from '../../data/researchData';
import { AircraftShowcase3D, CameraPresetId } from '../AircraftShowcase3D';
import { VisualRenderMode } from '../../three/jobyS4Model';

interface AircraftOverviewChapterProps {
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
  onSelectSignaturePreset: (view: SignatureViewId) => void;
}

export const AircraftOverviewChapter: React.FC<AircraftOverviewChapterProps> = ({
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
  onSelectSignaturePreset,
}) => {
  const activeMode = FLIGHT_MODES[flightMode];

  return (
    <section
      id="chapter-01"
      className="border-b border-white/10 bg-[#030508] py-16 lg:py-22"
    >
      <div className="mx-auto max-w-[1340px] px-6">
        {/* Chapter Header + Signature Scene Quick Presets */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-400">
              CHAPTER 01 · MEET THE AIRCRAFT · 产品构型与三维数字孪生
            </div>
            <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Joby S4 (JAS4-1) 交互三维数字孪生实验室
            </h2>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-400">
              自由拖拽旋转观察倾转旋翼机构，切换 4 种核心视觉与工程研究视图。注：本三维模型依据公开 10.7 m 翼展、6.4 m 机长与 6 倾转旋翼构型构建概念工程数字孪生，内部舱室为专利示意结构。
            </p>
          </div>

          {/* 4 Signature View Mode Quick Launchers */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectSignaturePreset('CINEMATIC_HANGAR')}
              className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                visualMode === 'CINEMATIC' && explodeFactor === 0
                  ? 'border-white/50 bg-white text-slate-950'
                  : 'border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-white'
              }`}
            >
              01 机库渲染
            </button>
            <button
              type="button"
              onClick={() => onSelectSignaturePreset('EXPLODED_CAD')}
              className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                visualMode === 'ENGINEERING_CAD' && explodeFactor > 0.3
                  ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                  : 'border-white/15 bg-white/[0.03] text-slate-300 hover:border-sky-400/50 hover:text-white'
              }`}
            >
              02 CAD 拆解蓝图
            </button>
            <button
              type="button"
              onClick={() => onSelectSignaturePreset('AERODYNAMICS_LAB')}
              className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                visualMode === 'AERO_CFD'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/15 bg-white/[0.03] text-slate-300 hover:border-emerald-400/50 hover:text-white'
              }`}
            >
              03 气动流场风洞
            </button>
            <button
              type="button"
              onClick={() => onSelectSignaturePreset('UAM_CITY_CORRIDOR')}
              className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-amber-400/60 hover:text-amber-200"
            >
              04 城市空中走廊
            </button>
          </div>
        </div>

        {/* Core 3D Interactive Viewport */}
        <div className="mt-7">
          <AircraftShowcase3D
            flightMode={flightMode}
            onChangeFlightMode={onChangeFlightMode}
            visualMode={visualMode}
            onChangeVisualMode={onChangeVisualMode}
            explodeFactor={explodeFactor}
            onChangeExplodeFactor={onChangeExplodeFactor}
            selectedSubsystemId={selectedSubsystemId}
            onSelectSubsystem={onSelectSubsystem}
            cameraPreset={cameraPreset}
            onChangeCameraPreset={onChangeCameraPreset}
          />
        </div>

        {/* Active Flight Phase Engineering Narrative Bar */}
        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#070B14] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-cyan-400">
                {activeMode.code} · {activeMode.nameEn}
              </span>
              <span className="font-mono text-xs text-slate-400">
                声学特性：{activeMode.acousticDbA}
              </span>
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold text-white">
              当前飞行阶段：{activeMode.nameZh}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {activeMode.summaryZh}
            </p>
            <p className="mt-4 border-t border-white/10 pt-3 font-mono text-xs text-cyan-200">
              气动机理：{activeMode.aerodynamicMechanism}
            </p>
          </div>

          {/* Interactive Subsystem Quick Selector */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#070B14] p-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              SUBSYSTEM INSPECTOR · 点击子系统聚焦三维部件
            </div>
            <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
              {AIRCRAFT_SUBSYSTEMS.map((sub) => {
                const active = selectedSubsystemId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectSubsystem(active ? null : sub.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'border-cyan-400 bg-cyan-950/60 text-white'
                        : 'border-white/10 bg-[#04070E] text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-cyan-400">{sub.code}</div>
                    <div className="mt-0.5 truncate text-xs font-medium">{sub.shortLabelZh}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Development & FAA Certification Timeline */}
        <div className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-semibold text-white">
              Joby S4 工程演化与 FAA 适航审定里程碑 (2009–2026)
            </h3>
            <span className="font-mono text-xs text-slate-400">
              数据来源：FAA Federal Register / SEC Form 10-K / NASA [REF-01, REF-02, REF-04]
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {JOBY_TIMELINE.map((item) => (
              <div
                key={item.year}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#070B14] p-4"
              >
                <div>
                  <div className="font-mono text-sm font-bold text-cyan-400">
                    {item.year}
                  </div>
                  <h4 className="mt-1.5 text-sm font-semibold text-white">
                    {item.milestoneZh}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {item.detailZh}
                  </p>
                </div>
                <div className="mt-3 border-t border-white/10 pt-2 font-mono text-[10px] text-emerald-400">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
