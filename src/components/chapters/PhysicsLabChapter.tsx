import React, { useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { calculateFlightPhysics } from '../../utils/flightPhysics';

export const PhysicsLabChapter: React.FC = () => {
  const [massKg, setMassKg] = useState(2177);
  const [batteryKwh, setBatteryKwh] = useState(150);
  const [propulsionEfficiency, setPropulsionEfficiency] = useState(0.78);
  const [missionDistanceKm, setMissionDistanceKm] = useState(65);
  const [reserveFraction, setReserveFraction] = useState(0.2);

  const result = useMemo(
    () =>
      calculateFlightPhysics({
        massKg,
        batteryKwh,
        propulsionEfficiency,
        missionDistanceKm,
        reserveFraction,
      }),
    [massKg, batteryKwh, propulsionEfficiency, missionDistanceKm, reserveFraction]
  );

  // Sensitivity curve across 1800–2500 kg mass
  const sensitivityPoints = useMemo(() => {
    const masses = [1800, 1950, 2100, 2250, 2400, 2550];
    return masses.map((m) => {
      const r = calculateFlightPhysics({
        massKg: m,
        batteryKwh,
        propulsionEfficiency,
        missionDistanceKm,
        reserveFraction,
      });
      return { mass: m, maxRange: r.maxAchievableRangeKm, hoverKw: r.hoverPowerKw };
    });
  }, [batteryKwh, propulsionEfficiency, missionDistanceKm, reserveFraction]);

  const handleReset = () => {
    setMassKg(2177);
    setBatteryKwh(150);
    setPropulsionEfficiency(0.78);
    setMissionDistanceKm(65);
    setReserveFraction(0.2);
  };

  return (
    <section
      id="chapter-03"
      className="border-b border-slate-800/80 bg-[#07090E] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider text-cyan-400">
              CHAPTER 03 · THE PHYSICS OF FLIGHT · 交互式飞行物理与能耗实验室
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              悬停动量理论与电动布雷盖航程实时仿真
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              调节飞行器总重、电池可用能量、推进效率、任务距离与法规预留电量比例，实时观察悬停功率非线性变化、航段能耗构成及任务可行性边界。
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            恢复 Joby S4 基准工况
          </button>
        </div>

        {/* Explicit Model Scope & Limitations Disclaimer */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/25 p-4 text-xs leading-relaxed text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <strong className="text-amber-300">教学物理模型边界说明（Educational Model ≠ Certified FAA Performance）：</strong>
            本实验室基于一维作动盘动量理论（假设标准大气 ρ=1.225 kg/m³、品质因数 FM=0.76、单次任务悬停爬升耗时 180s、巡航升阻比 L/D=12.8、巡航速度 265 km/h）进行瞬态教学估算。实际 FAA 适航飞行手册（AFM）性能还受高空密度高度、侧风修正、电池低温内阻攀升及空管等待航线影响。
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          {/* Left Column: 5 Interactive Engineering Sliders */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B101A] p-6 space-y-5">
            <div className="font-mono text-xs text-slate-400">
              INPUT PARAMETERS · 工程参数调节器
            </div>

            {[
              {
                id: 'slider-mass',
                label: '飞行器总重 Mass (kg)',
                val: massKg,
                min: 1600,
                max: 2600,
                step: 10,
                unit: 'kg',
                hint: 'S4 MTOW = 2,400 kg (半载试飞基准 ~2,177 kg)',
                onChange: setMassKg,
              },
              {
                id: 'slider-battery',
                label: '电池可用能量 Battery (kWh)',
                val: batteryKwh,
                min: 80,
                max: 240,
                step: 5,
                unit: 'kWh',
                hint: 'S4 估算总量 ~150 kWh (含 4 组独立包)',
                onChange: setBatteryKwh,
              },
              {
                id: 'slider-eta',
                label: '电推进综合效率 η_propulsion',
                val: propulsionEfficiency,
                min: 0.6,
                max: 0.88,
                step: 0.01,
                unit: '%',
                displayVal: `${Math.round(propulsionEfficiency * 100)}%`,
                hint: '电机 × SiC逆变器 × 螺旋桨气动效率乘积',
                onChange: setPropulsionEfficiency,
              },
              {
                id: 'slider-dist',
                label: '目标航段距离 Distance (km)',
                val: missionDistanceKm,
                min: 15,
                max: 220,
                step: 5,
                unit: 'km',
                hint: '典型城市机场接驳 25–65 km',
                onChange: setMissionDistanceKm,
              },
              {
                id: 'slider-reserve',
                label: '强制预留电量比例 Reserve (%)',
                val: reserveFraction,
                min: 0.1,
                max: 0.35,
                step: 0.01,
                unit: '%',
                displayVal: `${Math.round(reserveFraction * 100)}%`,
                hint: 'FAA VFR 日间最低 20 分钟备降裕度映射',
                onChange: setReserveFraction,
              },
            ].map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={item.id} className="font-medium text-slate-200">
                    {item.label}
                  </label>
                  <span className="font-mono font-semibold text-cyan-300">
                    {item.displayVal ?? `${item.val} ${item.unit}`}
                  </span>
                </div>
                <input
                  id={item.id}
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.val}
                  onChange={(e) => item.onChange(parseFloat(e.target.value))}
                  className="mt-2 h-1.5 w-full cursor-pointer accent-cyan-400"
                />
                <div className="mt-1 text-[11px] text-slate-500">{item.hint}</div>
              </div>
            ))}

            <div className="rounded-lg border border-slate-800 bg-[#060911] p-3.5 font-mono text-[11px] leading-relaxed text-slate-300">
              <div className="text-cyan-400">核心控制方程：</div>
              <div>1. 悬停诱导速度 v_i = √(W / 2ρA)</div>
              <div>2. 悬停功率 P_hover = (W · v_i) / (FM · η_elec)</div>
              <div>3. 巡航功率 P_cruise = (W / (L/D)) · V / η_p</div>
            </div>
          </div>

          {/* Right Column: Live Calculation Readouts + Charts */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mission Feasibility Status Banner */}
            <div
              data-testid="physics-feasibility-status"
              className={`rounded-xl border p-5 ${
                result.feasibilityStatus === 'NOMINAL'
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : result.feasibilityStatus === 'MARGINAL_RESERVE'
                  ? 'border-amber-500/50 bg-amber-950/25'
                  : 'border-rose-500/50 bg-rose-950/30'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs font-semibold">
                  {result.feasibilityStatus === 'NOMINAL' && (
                    <span className="text-emerald-300">● 任务可行 (NOMINAL · 满足预留能量法规)</span>
                  )}
                  {result.feasibilityStatus === 'MARGINAL_RESERVE' && (
                    <span className="text-amber-300">▲ 警告：侵占法规预留电量 (MARGINAL RESERVE)</span>
                  )}
                  {result.feasibilityStatus === 'INSUFFICIENT_ENERGY' && (
                    <span className="text-rose-300">✖ 不可行：任务能耗超出电池总容量 (INSUFFICIENT ENERGY)</span>
                  )}
                </div>
                <span className="font-mono text-xs text-slate-300">
                  落地剩余电量 SOC：<strong className="text-white">{result.stateOfChargeAtLandingPct}%</strong>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-[11px] text-slate-400">悬停电功率</div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-white">
                    {result.hoverPowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">巡航电功率</div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-cyan-300">
                    {result.cruisePowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">保留备降最大航程</div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-emerald-300">
                    {result.maxAchievableRangeKm} <span className="text-xs font-normal text-slate-400">km</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">每客公里能耗</div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-amber-300">
                    {result.specificEnergyWhPerPaxKm} <span className="text-xs font-normal text-slate-400">Wh/pax·km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Breakdown Stacked Bar */}
            <div className="rounded-xl border border-slate-800 bg-[#0B101A] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-slate-300">
                  TASK ENERGY BUDGET · 本次 {missionDistanceKm} km 航段能耗拆解 (总消耗 {result.totalMissionEnergyKwh} kWh / 可用上限 {result.usableNetEnergyKwh} kWh)
                </span>
                <span className="font-mono text-cyan-300">
                  总飞行耗时 {result.totalBlockTimeMin} min
                </span>
              </div>

              <div className="mt-3 flex h-6 w-full overflow-hidden rounded-lg bg-slate-900">
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(result.hoverEnergyKwh / batteryKwh) * 100}%` }}
                  title={`起降悬停 ${result.hoverEnergyKwh} kWh`}
                />
                <div
                  className="bg-sky-500 transition-all"
                  style={{ width: `${(result.transitionEnergyKwh / batteryKwh) * 100}%` }}
                  title={`倾转过渡 ${result.transitionEnergyKwh} kWh`}
                />
                <div
                  className="bg-cyan-400 transition-all"
                  style={{ width: `${(result.cruiseEnergyKwh / batteryKwh) * 100}%` }}
                  title={`固定翼巡航 ${result.cruiseEnergyKwh} kWh`}
                />
                <div
                  className="bg-emerald-500/45 transition-all"
                  style={{ width: `${(result.reserveEnergyKwh / batteryKwh) * 100}%` }}
                  title={`法规预留 ${result.reserveEnergyKwh} kWh`}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px] sm:grid-cols-4">
                <div className="text-amber-300">■ 起降悬停：{result.hoverEnergyKwh} kWh</div>
                <div className="text-sky-400">■ 倾转过渡：{result.transitionEnergyKwh} kWh</div>
                <div className="text-cyan-300">■ 固定翼巡航：{result.cruiseEnergyKwh} kWh</div>
                <div className="text-emerald-300">■ 法规预留：{result.reserveEnergyKwh} kWh</div>
              </div>
            </div>

            {/* Mass Sensitivity Curve SVG */}
            <div className="rounded-xl border border-slate-800 bg-[#0B101A] p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">
                  SENSITIVITY CURVE · 起飞总重对可用最大航程与悬停功率的敏感性
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  桨盘载荷：{result.diskLoadingKgM2} kg/m²
                </span>
              </div>
              <svg viewBox="0 0 540 165" className="mt-3 w-full rounded bg-[#060911]">
                <line x1="45" y1="135" x2="515" y2="135" stroke="#475569" strokeWidth="1" />
                <line x1="45" y1="18" x2="45" y2="135" stroke="#475569" strokeWidth="1" />
                {(() => {
                  const maxR = Math.max(...sensitivityPoints.map((p) => p.maxRange), 180);
                  const pts = sensitivityPoints.map((p, idx) => {
                    const x = 65 + idx * 86;
                    const y = 130 - (p.maxRange / maxR) * 100;
                    return { x, y, ...p };
                  });
                  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#22D3EE" strokeWidth="2.5" />
                      {pts.map((p) => (
                        <g key={p.mass}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#38BDF8" />
                          <text x={p.x} y={p.y - 8} fill="#E2E8F0" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                            {p.maxRange}km
                          </text>
                          <text x={p.x} y={150} fill="#94A3B8" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                            {p.mass}kg
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
