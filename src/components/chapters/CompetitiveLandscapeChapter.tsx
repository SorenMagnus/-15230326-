import React, { useState } from 'react';
import { COMPETITOR_AIRCRAFT } from '../../data/researchData';

export const CompetitiveLandscapeChapter: React.FC = () => {
  const [selectedId, setSelectedId] = useState(COMPETITOR_AIRCRAFT[0].id);
  const selected = COMPETITOR_AIRCRAFT.find((c) => c.id === selectedId) ?? COMPETITOR_AIRCRAFT[0];

  // Radar chart helper coordinates (5 axes: Range, Speed, Hover Eff, Cruise Eff, Cert Progress)
  const axes = [
    { key: 'range', label: '标称航程' },
    { key: 'speed', label: '巡航速度' },
    { key: 'hover', label: '悬停效率' },
    { key: 'cruise', label: '巡航效率' },
    { key: 'cert', label: '适航进度' },
  ];

  const getScores = (c: typeof selected) => [
    Math.min(100, Math.round((c.maxRangeKm / 250) * 100)),
    Math.min(100, Math.round((c.cruiseSpeedKmh / 330) * 100)),
    c.hoverEfficiencyScore,
    c.cruiseEfficiencyScore,
    c.certProgressScore,
  ];

  const radarPolygon = (scores: number[], cx = 160, cy = 145, r = 95) => {
    return scores
      .map((s, idx) => {
        const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
        const dist = (s / 100) * r;
        return `${cx + Math.cos(angle) * dist},${cy + Math.sin(angle) * dist}`;
      })
      .join(' ');
  };

  return (
    <section
      id="chapter-07"
      className="border-b border-slate-800/80 bg-[#07090E] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="font-mono text-xs tracking-wider text-cyan-400">
          CHAPTER 07 · THE COMPETITIVE LANDSCAPE · 全球五大代表性 eVTOL 构型与适航横评
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          技术路线分化：全倾转 vs 复合翼 vs 多旋翼 vs 涵道风扇
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          严格区分不同制造商公开口径、测试工况与年份（2023–2026）。点击任意机型，查看其工程构型权衡、雷达性能图谱及产业化瓶颈。
        </p>

        {/* Interactive Comparison Table */}
        <div className="mt-7 overflow-x-auto rounded-xl border border-slate-800 bg-[#0B101A]">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#070A12] font-mono text-[11px] text-slate-400">
              <tr>
                <th className="px-4 py-3">机型 / 企业</th>
                <th className="px-4 py-3">气动与推进构型</th>
                <th className="px-4 py-3">载客</th>
                <th className="px-4 py-3">标称航程</th>
                <th className="px-4 py-3">极速/巡航</th>
                <th className="px-4 py-3">最大起飞重</th>
                <th className="px-4 py-3">适航阶段 (截至 2025–2026)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {COMPETITOR_AIRCRAFT.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-900/70'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="text-left font-semibold text-white hover:text-cyan-300"
                      >
                        {c.name}
                      </button>
                      <div className="text-[11px] text-slate-400">
                        {c.manufacturer} · {c.country}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-200">{c.configurationZh}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-200">{c.seats}</td>
                    <td className="px-4 py-3.5 font-mono text-cyan-300">{c.maxRangeKm} km</td>
                    <td className="px-4 py-3.5 font-mono text-white">{c.cruiseSpeedKmh} km/h</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{c.mtowKg} kg</td>
                    <td className="px-4 py-3.5 text-slate-300">{c.certAuthorityAndStage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Radar Chart & Selected Competitor Deep Dive */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B101A] p-6">
            <div className="font-mono text-xs text-slate-400">
              MULTI-AXIS ENGINEERING RADAR · {selected.name} vs Joby S4 基准
            </div>
            <svg viewBox="0 0 320 290" className="mx-auto mt-3 w-full max-w-[320px]">
              {[0.25, 0.5, 0.75, 1.0].map((scale) => (
                <polygon
                  key={scale}
                  points={radarPolygon([100 * scale, 100 * scale, 100 * scale, 100 * scale, 100 * scale])}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1"
                />
              ))}
              {axes.map((ax, idx) => {
                const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                const x2 = 160 + Math.cos(angle) * 95;
                const y2 = 145 + Math.sin(angle) * 95;
                const lx = 160 + Math.cos(angle) * 118;
                const ly = 145 + Math.sin(angle) * 118;
                return (
                  <g key={ax.key}>
                    <line x1="160" y1="145" x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />
                    <text
                      x={lx}
                      y={ly}
                      fill="#CBD5E1"
                      fontSize="10.5"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {ax.label}
                    </text>
                  </g>
                );
              })}
              {/* Joby S4 Baseline Polygon */}
              <polygon
                points={radarPolygon(getScores(COMPETITOR_AIRCRAFT[0]))}
                fill="rgba(34,211,238,0.14)"
                stroke="#22D3EE"
                strokeWidth="2"
              />
              {/* Selected Aircraft Polygon */}
              {selected.id !== COMPETITOR_AIRCRAFT[0].id && (
                <polygon
                  points={radarPolygon(getScores(selected))}
                  fill="rgba(245,158,11,0.18)"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
              )}
            </svg>
            <div className="mt-2 flex justify-center gap-6 font-mono text-[11px]">
              <span className="text-cyan-300">━━ Joby S4 (基准)</span>
              {selected.id !== COMPETITOR_AIRCRAFT[0].id && (
                <span className="text-amber-300">━━ {selected.name}</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0B101A] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-xs text-cyan-400">
                  {selected.manufacturer} · {selected.verificationLevel}
                </div>
                <h3 className="mt-1 font-display text-2xl font-bold text-white">{selected.name}</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                推进器数量：{selected.propulsorsCount} 具
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                <div className="font-mono text-xs text-slate-400">商业化路径与产业协同</div>
                <p className="mt-1 text-slate-200">{selected.businessModelZh}</p>
              </div>
              <div className="rounded-lg border border-amber-500/35 bg-amber-950/20 p-3.5">
                <div className="font-mono text-xs text-amber-300">关键技术瓶颈与结构取舍</div>
                <p className="mt-1 text-slate-200">{selected.keyBottleneckZh}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-mono text-[11px] text-slate-400">
                <span>适航认证：{selected.certAuthorityAndStage}</span>
                <span>来源：{selected.dataYearAndSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
