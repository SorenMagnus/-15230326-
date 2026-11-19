import React, { useMemo, useState } from 'react';
import { calculateUamEconomics } from '../../utils/flightPhysics';

export const BusinessRealityChapter: React.FC = () => {
  const [ticketPricePerPaxUsd, setTicketPricePerPaxUsd] = useState(145);
  const [avgPassengersPerFlight, setAvgPassengersPerFlight] = useState(2.8);
  const [dailySorties, setDailySorties] = useState(14);
  const [tripDistanceKm, setTripDistanceKm] = useState(35);
  const [batteryCycleLife, setBatteryCycleLife] = useState(5000);
  const [vertiportFeePerFlightUsd, setVertiportFeePerFlightUsd] = useState(45);

  const econ = useMemo(
    () =>
      calculateUamEconomics({
        ticketPricePerPaxUsd,
        avgPassengersPerFlight,
        dailySorties,
        tripDistanceKm,
        batteryCycleLife,
        vertiportFeePerFlightUsd,
      }),
    [
      ticketPricePerPaxUsd,
      avgPassengersPerFlight,
      dailySorties,
      tripDistanceKm,
      batteryCycleLife,
      vertiportFeePerFlightUsd,
    ]
  );

  return (
    <section
      id="chapter-06"
      className="border-b border-slate-800/80 bg-[#090C14] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="font-mono text-xs tracking-wider text-cyan-400">
          CHAPTER 06 · THE BUSINESS REALITY · 单位经济效益模型与商业化现实风险
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          空中出租车单机盈亏平衡敏感性测算
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          拒绝空洞地引用“万亿美元低空经济 TAM”。eVTOL 能否盈利取决于具体的单架次成本结构（飞行员薪酬、电池循环折旧、起降场费、整机资本摊销）与实际客座率（Load Factor）。调整下方核心经营假设，实时检验单机财务模型。
        </p>

        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          {/* Left: Assumptions Controls */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0C101B] p-6 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">UNIT ECONOMICS ASSUMPTIONS</span>
              <span className="text-amber-300">Assumptions / Estimates</span>
            </div>

            {[
              {
                id: 'econ-price',
                label: '单座客票价格 Ticket Price ($/pax)',
                val: ticketPricePerPaxUsd,
                min: 45,
                max: 300,
                step: 5,
                unit: '$',
                onChange: setTicketPricePerPaxUsd,
              },
              {
                id: 'econ-pax',
                label: '平均每架次载客量 Load Factor (人/4座)',
                val: avgPassengersPerFlight,
                min: 1.0,
                max: 4.0,
                step: 0.1,
                unit: '人',
                onChange: setAvgPassengersPerFlight,
              },
              {
                id: 'econ-sorties',
                label: '单机日均执飞架次 Daily Sorties',
                val: dailySorties,
                min: 4,
                max: 24,
                step: 1,
                unit: '架次/日',
                onChange: setDailySorties,
              },
              {
                id: 'econ-dist',
                label: '平均单程航距 Trip Distance (km)',
                val: tripDistanceKm,
                min: 15,
                max: 90,
                step: 5,
                unit: 'km',
                onChange: setTripDistanceKm,
              },
              {
                id: 'econ-cycles',
                label: '航空电池循环寿命 Battery Life (Cycles)',
                val: batteryCycleLife,
                min: 1500,
                max: 10000,
                step: 500,
                unit: '次',
                onChange: setBatteryCycleLife,
              },
              {
                id: 'econ-fee',
                label: '垂起场起降与地服费 Vertiport Fee ($/架次)',
                val: vertiportFeePerFlightUsd,
                min: 15,
                max: 120,
                step: 5,
                unit: '$',
                onChange: setVertiportFeePerFlightUsd,
              },
            ].map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs">
                  <label htmlFor={s.id} className="text-slate-200">
                    {s.label}
                  </label>
                  <span className="font-mono font-semibold text-cyan-300">
                    {s.unit === '$' ? `$${s.val}` : `${s.val} ${s.unit}`}
                  </span>
                </div>
                <input
                  id={s.id}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.val}
                  onChange={(e) => s.onChange(parseFloat(e.target.value))}
                  className="mt-1.5 h-1.5 w-full cursor-pointer accent-cyan-400"
                />
              </div>
            ))}
          </div>

          {/* Right: Financial Output & Risk Disclosure */}
          <div className="lg:col-span-7 space-y-5">
            <div
              className={`rounded-xl border p-5 ${
                econ.isProfitable
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-rose-500/45 bg-rose-950/25'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className={econ.isProfitable ? 'text-emerald-300' : 'text-rose-300'}>
                  {econ.isProfitable
                    ? '● 单机正向运营现金流 (OPERATING PROFITABLE)'
                    : '✖ 单机亏损：营收无法覆盖运营与折旧成本 (UNPROFITABLE)'}
                </span>
                <span className="text-slate-300">
                  盈亏平衡客座率：<strong className="text-white">{econ.breakEvenLoadFactorPax} 人/架次</strong>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono">
                <div>
                  <div className="text-[11px] text-slate-400">单架次总营收</div>
                  <div className="mt-0.5 text-xl font-bold text-white">${econ.revenuePerFlightUsd}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">单架次总成本</div>
                  <div className="mt-0.5 text-xl font-bold text-amber-300">
                    ${econ.totalOperatingCostPerFlightUsd}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">座英里成本 (CASM)</div>
                  <div className="mt-0.5 text-xl font-bold text-cyan-300">${econ.costPerSeatMileUsd}/mi</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">单机回本周期</div>
                  <div className="mt-0.5 text-xl font-bold text-emerald-300">
                    {econ.paybackPeriodYears >= 99 ? '无法回本' : `${econ.paybackPeriodYears} 年`}
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Flight Cost Structure Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-[#0C101B] p-5">
              <div className="font-mono text-xs text-slate-400">
                PER-FLIGHT OPERATING COST BREAKDOWN · 单架次成本拆解 (USD)
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: '飞行员薪酬与地面调度摊销', val: econ.pilotAndCrewCostPerFlightUsd, color: 'bg-sky-400' },
                  { label: '机体定检维护与备件消耗', val: econ.maintenanceCostPerFlightUsd, color: 'bg-amber-400' },
                  { label: '垂起场起降与充电设施费', val: vertiportFeePerFlightUsd, color: 'bg-cyan-400' },
                  { label: '航空电池包循环折旧摊销 ($63k)', val: econ.batteryAmortizationPerFlightUsd, color: 'bg-emerald-400' },
                  { label: '充电电费 ($0.18/kWh 工业电价)', val: econ.energyCostPerFlightUsd, color: 'bg-slate-400' },
                ].map((row) => {
                  const pct = (row.val / Math.max(1, econ.totalOperatingCostPerFlightUsd)) * 100;
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200">{row.label}</span>
                        <span className="font-mono text-white">
                          ${row.val.toFixed(2)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-slate-800">
                        <div className={`h-full rounded ${row.color}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400">
                <strong className="text-slate-200">商业洞察：</strong>
                电费仅占总运营成本的 ~3%（不到 $10），真正卡住早期空中出租车平民化票价的是
                <strong className="text-cyan-300">飞行员人工、低日利用率下的整机折旧（$1.45M 造价假设）与垂起港场地租金</strong>
                。在 2030 年后实现无飞行员自主运行前，eVTOL 的真实可触达市场（SAM）主要集中于高净值商旅接驳与机场快线。
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
