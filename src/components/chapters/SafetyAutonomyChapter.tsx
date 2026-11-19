import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { SAFETY_ARCHITECTURE_NODES, SafetyNode } from '../../data/researchData';

export const SafetyAutonomyChapter: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(SAFETY_ARCHITECTURE_NODES[0].id);
  const [maturityFilter, setMaturityFilter] = useState<'ALL' | SafetyNode['maturityStatus']>('ALL');

  const filteredNodes = SAFETY_ARCHITECTURE_NODES.filter(
    (n) => maturityFilter === 'ALL' || n.maturityStatus === maturityFilter
  );
  const activeNode =
    SAFETY_ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) ?? SAFETY_ARCHITECTURE_NODES[0];

  return (
    <section
      id="chapter-04"
      className="border-b border-slate-800/80 bg-[#090C14] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider text-cyan-400">
              CHAPTER 04 · AUTONOMY &amp; SAFETY · 飞控架构、多余度容错与 FAA 适航审定
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              交互式航空级安全与失效容错架构图
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              航空审定不允许任何“单点灾难性失效”（Single Point of Failure, &lt;10⁻⁹/飞行小时）。点击架构图中的任意关键层级，审查其硬件冗余逻辑、潜在失效模式及技术成熟度边界。
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-800 bg-[#060911] p-1">
            {(
              [
                { key: 'ALL', label: '全部层级' },
                { key: '已部署并试飞验证 (Deployed)', label: '已试飞部署' },
                { key: '适航审定阶段 (FAA Stage 4/5)', label: 'FAA 审定中' },
                { key: '远期演进规划 (Future R&D)', label: '远期规划' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setMaturityFilter(f.key)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  maturityFilter === f.key
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Interactive 4-Layer Safety Architecture Stack */}
          <div className="lg:col-span-6 space-y-3">
            {filteredNodes.map((node, idx) => {
              const isSelected = activeNode.id === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/35'
                      : 'border-slate-800 bg-[#0C101B] hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-cyan-400">
                      LAYER 0{idx + 1} · {node.layer}
                    </span>
                    <span
                      className={
                        node.maturityStatus.includes('Deployed')
                          ? 'text-emerald-400'
                          : node.maturityStatus.includes('FAA')
                          ? 'text-amber-300'
                          : 'text-slate-400'
                      }
                    >
                      {node.maturityStatus}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-semibold text-white">
                    {node.titleZh}
                  </h3>
                  <div className="mt-1 text-xs text-slate-400">{node.redundancyArchitecture}</div>
                </button>
              );
            })}
          </div>

          {/* Right Failure-Mode & FMEA Detail Inspector */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0C101B] p-6">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="font-mono text-xs text-cyan-400">
                  FMEA 失效模式与适航审定审查 · {activeNode.verificationLevel}
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  {activeNode.titleZh}
                </h3>
                <div className="text-xs text-slate-400">{activeNode.titleEn}</div>
              </div>
              <ShieldCheck className="h-7 w-7 shrink-0 text-cyan-400" />
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <div className="font-mono text-xs text-slate-400">安全冗余架构</div>
                <p className="mt-1 font-medium text-slate-100">
                  {activeNode.redundancyArchitecture}
                </p>
              </div>

              <div>
                <div className="font-mono text-xs text-slate-400">核心功能机制</div>
                <p className="mt-1 leading-relaxed text-slate-300">{activeNode.functionDesc}</p>
              </div>

              <div className="rounded-lg border border-amber-500/35 bg-amber-950/20 p-4">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-300">
                  <ShieldAlert className="h-4 w-4" />
                  失效场景推演与容错缓解 (Failure Mode &amp; Mitigation)
                </div>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-200">
                  {activeNode.failureModeAndMitigation}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 font-mono text-xs">
                <span className="text-slate-400">适用适航法规标准：</span>
                <span className="text-cyan-300">{activeNode.certStandard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
