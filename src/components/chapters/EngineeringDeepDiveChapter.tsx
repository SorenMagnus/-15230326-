import React, { useState } from 'react';
import { Cpu, BatteryCharging, Gauge, Layers } from 'lucide-react';

type EngineeringTab = 'aerodynamics' | 'propulsion' | 'battery' | 'constraints';

export const EngineeringDeepDiveChapter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EngineeringTab>('aerodynamics');

  return (
    <section
      id="chapter-02"
      className="border-b border-slate-800/80 bg-[#090C14] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="font-mono text-xs tracking-wider text-cyan-400">
          CHAPTER 02 · ENGINEERING THE IMPOSSIBLE · 航空工程核心架构剖析
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          从垂直悬停到高速固定翼巡航的物理与工程解构
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          eVTOL 设计的核心矛盾在于：垂直起降要求极高的静态推重比与大桨盘面积以抑制诱导功耗，而城市间高效巡航则要求极低的迎风寄生阻力与高升阻比。以下从四大工程子系统剖析 Joby S4 的技术取舍。
        </p>

        {/* Tab Navigation */}
        <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          {[
            { id: 'aerodynamics', label: '01. 总体气动与倾转过渡', icon: Layers },
            { id: 'propulsion', label: '02. 分布式电推进 (DEP) 与降噪', icon: Cpu },
            { id: 'battery', label: '03. 航空电池包与热失控防护', icon: BatteryCharging },
            { id: 'constraints', label: '04. 重量-航程电动飞行约束', icon: Gauge },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as EngineeringTab)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                    : 'border-slate-800 bg-[#0D121E] text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {activeTab === 'aerodynamics' && (
            <>
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  全倾转构型 vs 复合翼（Lift+Cruise）的气动代偿分析
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  eVTOL 行业存在两条主流固定翼垂直起降路径：一种是“升力+巡航复合翼”（如峰飞盛世龙、Wisk Gen 6），在支撑臂上安装专门用于悬停的固定升力桨，前飞时将其停转锁死；另一种是 Joby S4 采用的
                  <strong className="text-cyan-300">全倾转矢量推力（All-Tilting Vectored Thrust）</strong>。
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-[#070A12] p-4">
                    <div className="font-mono text-xs text-cyan-400">悬停动量理论优势</div>
                    <div className="mt-1.5 font-mono text-sm font-semibold text-white">
                      P_hover = W^(3/2) / (FM · √(2ρA))
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      Joby S4 拥有 6 具直径 2.9 m 的大旋翼，总桨盘面积 A = 39.63 m²，桨盘载荷仅 ~55–60 kg/m²（约为小涵道风扇构型的 1/5），诱导悬停速度降至 ~16.8 m/s。
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#070A12] p-4">
                    <div className="font-mono text-xs text-emerald-400">巡航零死重与升阻比</div>
                    <div className="mt-1.5 font-mono text-sm font-semibold text-white">
                      (L / D)_cruise ≈ 12.5 – 13.2
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      前飞阶段无停转升力桨与支撑吊杆（Zero Dead-Weight Rotors），配合高展弦比机翼与翼尖反旋涡消减效应，巡航需用功率（~172 kW）比悬停下降近 68%。
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                  <strong className="text-slate-200">工程代价：</strong>
                  全倾转构型必须在短舱转轴处承受气动俯仰力矩与陀螺进动载荷（Gyroscopic Precession），且需在 85–140 km/h 过渡走廊内实时调控桨距防止机翼失速或螺旋桨进入涡环状态。
                </p>
              </div>

              {/* Precision Engineering SVG Diagram: Transition Corridor */}
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <div className="font-mono text-xs text-slate-400">
                  ENGINEERING SCHEMATIC · 倾转过渡功率-空速包线示意
                </div>
                <svg
                  viewBox="0 0 420 260"
                  className="mt-4 w-full rounded-lg border border-slate-800/80 bg-[#060911]"
                  role="img"
                  aria-label="Joby S4 功率随空速与倾转角变化曲线"
                >
                  {/* Grid lines */}
                  {[50, 100, 150, 200].map((y) => (
                    <line key={y} x1="45" y1={y} x2="395" y2={y} stroke="#1E293B" strokeWidth="1" />
                  ))}
                  {[110, 180, 250, 320].map((x) => (
                    <line key={x} x1={x} y1="25" x2={x} y2="220" stroke="#1E293B" strokeWidth="1" />
                  ))}
                  {/* Axes */}
                  <line x1="45" y1="220" x2="395" y2="220" stroke="#64748B" strokeWidth="1.5" />
                  <line x1="45" y1="25" x2="45" y2="220" stroke="#64748B" strokeWidth="1.5" />

                  {/* Transition Corridor Shaded Band */}
                  <rect x="125" y="25" width="95" height="195" fill="rgba(56,189,248,0.08)" />
                  <text x="172" y="42" fill="#38BDF8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    过渡走廊 (90°→0°)
                  </text>

                  {/* Bucket Power Curve */}
                  <path
                    d="M 55 58 C 95 66, 130 112, 175 148 C 225 182, 275 184, 320 172 C 350 164, 375 145, 390 124"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="3"
                  />
                  {/* Helicopter Comparison Dashed Curve */}
                  <path
                    d="M 55 62 C 110 85, 170 115, 225 128 C 280 140, 330 105, 385 70"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />

                  {/* Key Points */}
                  <circle cx="55" cy="58" r="4.5" fill="#22D3EE" />
                  <text x="64" y="54" fill="#E2E8F0" fontSize="10" fontFamily="monospace">悬停 ~545 kW</text>
                  <circle cx="290" cy="180" r="4.5" fill="#10B981" />
                  <text x="242" y="202" fill="#34D399" fontSize="10" fontFamily="monospace">最佳巡航 ~172 kW (265 km/h)</text>

                  <text x="385" y="240" fill="#94A3B8" fontSize="10" textAnchor="end" fontFamily="monospace">
                    空速 V (km/h) → 0 ~ 322
                  </text>
                  <text x="16" y="130" fill="#94A3B8" fontSize="10" transform="rotate(-90 16 130)" textAnchor="middle" fontFamily="monospace">
                    需用功率 P (kW)
                  </text>
                </svg>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-cyan-300">━━ Joby S4 倾转曲线</span>
                  <span className="text-amber-400">┄┄ 传统直升机参考曲线</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'propulsion' && (
            <>
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  双绕组直驱永磁电机与 45.2 dBA 声学控制机理
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  城市空中交通能否被公众接受，声学（Acoustics）是生死红线。传统直升机（如 Bell 407 / Airbus H135）在 150–500 m 高度产生 68–82 dBA 的强脉冲拍击声（Blade-Vortex Interaction, BVI），人耳主观感受极为烦躁。
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <strong className="text-cyan-300">1. 低叶尖马赫数设计：</strong>
                    S4 直径 2.9 m 旋翼在悬停与巡航时叶尖线速度控制在约 115–155 m/s（远低于传统直升机的 210–225 m/s），从物理源头将四极子气动噪声降低 15 dB 以上（噪声功率与叶尖速度的 5–6 次方成正比）。
                  </li>
                  <li className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <strong className="text-cyan-300">2. 非对称五叶桨距与反涡流调相：</strong>
                    5 片碳纤维桨叶采用不等角周向排布并配合后掠桨尖，打破固定频率谐波共振；NASA Armstrong 飞行中心实测其在 500 m 高度巡航飞越声压级仅为 <strong className="text-white">45.2 dBA</strong>（相当于安静的住宅室内谈话声）。
                  </li>
                  <li className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <strong className="text-cyan-300">3. 236 kW 双三相冗余直驱拓扑：</strong>
                    单电机仅重 28 kg（比功率 ~8.4 kW/kg），无行星减速箱；每具电机由两套独立碳化硅逆变器分别馈电至两套隔离定子绕组，实现局部失效容错。
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <div className="font-mono text-xs text-slate-400">
                  NASA ACOUSTIC BENCHMARK · 城市环境等效声压级对比 (dBA)
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { label: '传统中型直升机起飞 (100m)', db: 88, color: 'bg-rose-500', note: '显著社区噪声投诉风险' },
                    { label: '城市主干道车流背景声 (15m)', db: 72, color: 'bg-amber-400', note: '日常都市底噪参考线' },
                    { label: 'Joby S4 起降悬停 (100m, NASA)', db: 65, color: 'bg-sky-400', note: '融入都市交通声景 [REF-04]' },
                    { label: 'Joby S4 水平巡航 (500m, NASA)', db: 45.2, color: 'bg-emerald-400', note: '约比直升机安静 100 倍 [REF-04]' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200">{bar.label}</span>
                        <span className="font-mono font-semibold text-white">{bar.db} dBA</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded bg-slate-800">
                        <div className={`h-full ${bar.color}`} style={{ width: `${(bar.db / 100) * 100}%` }} />
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">{bar.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'battery' && (
            <>
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  288 Wh/kg 电芯体系、四分组高压拓扑与热失控抑制
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  航空动力电池不同于电动汽车电池，必须同时满足三项极端指标：高持续比功率（起降 3.5C–4C）、高循环寿命（&gt;10,000 次短途循环以摊薄折旧）以及 FAA 对单电芯热失控（Thermal Runaway）绝不蔓延至相邻电池包的强制适航要求。
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <div className="font-mono text-[11px] text-slate-400">电芯比能量 (Cell)</div>
                    <div className="mt-1 font-mono text-2xl font-bold text-cyan-300">288 Wh/kg</div>
                    <div className="mt-1 text-[11px] text-slate-400">NMC 811 + 硅碳软包</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <div className="font-mono text-[11px] text-slate-400">系统成组效率 (Pack)</div>
                    <div className="mt-1 font-mono text-2xl font-bold text-white">235 Wh/kg</div>
                    <div className="mt-1 text-[11px] text-slate-400">成组率 ~81.6% [REF-05]</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5">
                    <div className="font-mono text-[11px] text-slate-400">快充周转接口</div>
                    <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">7–10 min</div>
                    <div className="mt-1 text-[11px] text-slate-400">GEACS 地面液冷直充</div>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                  <strong className="text-amber-300">安全设计要点：</strong>
                  S4 将 150 kWh 储能物理拆分为 4 个独立电池舱段，电芯间嵌入防爆气凝胶隔层并设置定向泄压通道；同时将电池组布置于主翼盒段内部，尽量贴近翼根与质心（CG），降低横滚转动惯量。
                </p>
              </div>
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <div className="font-mono text-xs text-slate-400">
                  CROSS-TIED HVDC BUS · 四重交叉母线供电拓扑
                </div>
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="rounded border border-cyan-500/40 bg-cyan-950/30 p-3">
                    <div className="text-cyan-300 font-semibold">Pack #1 (左内翼) ──▶ 跨接</div>
                    <div className="mt-1 text-slate-300">左翼尖半绕组 + 右中翼半绕组 + 左尾半绕组</div>
                  </div>
                  <div className="rounded border border-cyan-500/40 bg-cyan-950/30 p-3">
                    <div className="text-cyan-300 font-semibold">Pack #2 (右内翼) ──▶ 跨接</div>
                    <div className="mt-1 text-slate-300">右翼尖半绕组 + 左中翼半绕组 + 右尾半绕组</div>
                  </div>
                  <div className="rounded border border-sky-500/40 bg-sky-950/30 p-3">
                    <div className="text-sky-300 font-semibold">Pack #3 &amp; #4 (机腹双舱) ──▶ 互补冗余</div>
                    <div className="mt-1 text-slate-300">任一电池包故障隔离，全机 6 具旋翼依然保持 75% 对称推力</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'constraints' && (
            <>
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  电动航空器的“重量-能量”死循环与航程边界
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  燃油飞机随着燃料消耗重量不断减轻；而纯电 eVTOL 电池消耗后质量不变（Zero Mass Loss），且电池能量密度（~0.235 kWh/kg）仅为航空煤油（~12.0 kWh/kg）的 1/50。因此电动布雷盖航程方程（Electric Breguet Range Equation）呈现严格线性约束：
                </p>
                <div className="mt-4 rounded-lg border border-slate-800 bg-[#070A12] p-4 font-mono text-xs text-cyan-200">
                  R_cruise = (E_batt · f_usable · η_total · (L/D)) / (m_total · g) - R_hover_penalty
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                  其中 E_batt 为电池包总能，η_total 为电推进系统总效率（~0.76–0.80），L/D 为巡航升阻比（~12.8），m_total 为最大起飞质量（2,400 kg）。
                  <strong className="text-amber-300"> 关键限制：</strong>
                  在扣除 20–30 分钟 FAA 备降余量（约 30–35 kWh）与电池 80% 寿命末期衰减（End-of-Life SOH）后，商业全载安全可用航程通常稳定在 50–110 km 之间，而非盲目拉满至 240 km 极值。
                </p>
              </div>
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
                <div className="font-mono text-xs text-slate-400">
                  MASS BUDGET BREAKDOWN · Joby S4 估算质量分配 (MTOW 2,400 kg)
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { name: '碳纤维空机结构与座舱', kg: 685, pct: 28.5, color: 'bg-slate-400' },
                    { name: '4 组冗余电池系统 (含防爆温控)', kg: 640, pct: 26.7, color: 'bg-cyan-400' },
                    { name: '6× 电推进单元 / 倾转机构 / 线缆', kg: 432, pct: 18.0, color: 'bg-sky-500' },
                    { name: '有效商载 (1 飞行员 + 4 乘客及行李)', kg: 453, pct: 18.9, color: 'bg-emerald-400' },
                    { name: '航电飞控与起落架子系统', kg: 190, pct: 7.9, color: 'bg-amber-400' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200">{item.name}</span>
                        <span className="font-mono text-slate-300">
                          {item.kg} kg ({item.pct}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-slate-800">
                        <div className={`h-full rounded ${item.color}`} style={{ width: `${item.pct * 2.5}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-amber-300">
                  注：MTOW 2,400 kg 与商载 453 kg 为公开数据；各分系统质量为工程质量分数反演估算 (Estimates)。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
