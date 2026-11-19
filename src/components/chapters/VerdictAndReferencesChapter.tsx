import React, { useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { RESEARCH_REFERENCES, ResearchReference, VERDICT_QUESTIONS } from '../../data/researchData';

export const VerdictAndReferencesChapter: React.FC = () => {
  const [refCategory, setRefCategory] = useState<'ALL' | ResearchReference['category']>('ALL');

  const filteredRefs = RESEARCH_REFERENCES.filter(
    (r) => refCategory === 'ALL' || r.category === refCategory
  );

  return (
    <section id="chapter-08" className="bg-[#07090E] pt-16 pb-20 lg:pt-20 lg:pb-24">
      <div className="mx-auto max-w-[1320px] px-6">
        {/* Part 1: 6-Question Research Verdict */}
        <div className="font-mono text-xs tracking-wider text-cyan-400">
          CHAPTER 08 · THE VERDICT · 课程研究综合研判与证据结论
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          理性审视电动垂直起降飞行器的真实边界
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          基于前八章的工程建模、物理实验室与商业敏感性分析，以下针对课程作业核心评估维度做出客观、有据可查的工程判断：
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {VERDICT_QUESTIONS.map((item) => (
            <article
              key={item.number}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0B101A] p-6"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-cyan-400">JUDGMENT {item.number}</span>
                  <span className="text-emerald-300">{item.verdictBadge}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">
                  {item.questionZh}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{item.answerZh}</p>
              </div>
              <div className="mt-4 border-t border-slate-800/80 pt-3 font-mono text-[11px] text-slate-400">
                支撑证据索引：{item.evidenceRef}
              </div>
            </article>
          ))}
        </div>

        {/* Part 2: Categorized Academic & Regulatory References */}
        <div id="references" className="mt-16 border-t border-slate-800 pt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                <FileText className="h-4 w-4" />
                <span>REFERENCES &amp; PRIMARY SOURCES · 权威文献与适航档案索引</span>
              </div>
              <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
                研究参考文献与数据溯源（共 {RESEARCH_REFERENCES.length} 项）
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-800 bg-[#0B101A] p-1">
              {(
                [
                  { id: 'ALL', label: '全部文献' },
                  { id: 'Regulatory / FAA', label: '适航监管机构' },
                  { id: 'Academic & NASA', label: 'NASA 与学术论文' },
                  { id: 'Manufacturer Disclosure', label: '企业披露/SEC' },
                  { id: 'Industry & Financial', label: '行业与商业合作' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRefCategory(cat.id)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    refCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {filteredRefs.map((refItem) => (
              <div
                key={refItem.id}
                className="rounded-xl border border-slate-800/90 bg-[#0B101A] p-4"
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-cyan-400">
                    [{refItem.code}] · {refItem.category}
                  </span>
                  <span className="text-slate-400">{refItem.date}</span>
                </div>
                <a
                  href={refItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 flex items-start justify-between gap-2 text-sm font-semibold text-white hover:text-cyan-300"
                >
                  <span>{refItem.title}</span>
                  <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
                <div className="mt-1 font-mono text-[11px] text-slate-400">
                  机构：{refItem.organization}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {refItem.keyFinding}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Fidelity & Engineering Transparency Matrix (Brief Sections 02, 03 & 05D) */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-[#070B14] p-6 sm:p-8">
          <div className="font-mono text-xs tracking-wider text-sky-400">
            DIGITAL TWIN TRANSPARENCY · 模型构型保真度与模拟边界声明
          </div>
          <h3 className="mt-1.5 font-display text-xl font-semibold text-white">
            真实公开参数与概念工程示意对照清单
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#04070E] p-4">
              <div className="font-mono text-xs font-semibold text-emerald-400">
                与 Joby S4 公开资料一致
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• 6 组独立可倾转电动推进器（4 主翼 + 2 V 尾）</li>
                <li>• 每组推进器配备 5 片非对称弯刀桨叶</li>
                <li>• 1 名飞行员 + 4 名乘客（5 座）全景座舱布局</li>
                <li>• 碳纤维复合材料主翼、V 型尾翼与流线机身</li>
                <li>• 90° 垂直起降 → 0° 水平巡航倾转运动学逻辑</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#04070E] p-4">
              <div className="font-mono text-xs font-semibold text-amber-300">
                概念工程示意（未公开细节）
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• 三维程序化机身曲面、舱内座椅造型与仪表界面</li>
                <li>• CAD 拆解中的内部翼梁、承力隔框与高压母线走线</li>
                <li>• 4 组电池包与三余度飞控计算机的舱内精确排布</li>
                <li>• CFD 风洞流场线条与驻点热力可视化着色器</li>
                <li>• 高架垂起港建筑与滨海都会空间场景构图</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#04070E] p-4">
              <div className="font-mono text-xs font-semibold text-sky-300">
                教学级模拟边界说明
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• 第三章飞行物理实验室采用一维动量与电动布雷盖方程，属教学演示模型，不可替代 FAA AFM 适航手册</li>
                <li>• 第六章票价与座英里成本为公开资料驱动的参数敏感性估算</li>
                <li>• 远景城市天际线与开场建筑镜头由 Nano Banana 视觉资产提供，所有可旋转/可拆解视角均为实时 WebGL 三维渲染</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cinematic Closing Statement */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0A0F1A] to-[#04060A] px-6 py-16 text-center">
          <div className="font-mono text-xs tracking-widest text-cyan-400">
            BEYOND THE GROUND · JOBY AVIATION S4 INTERACTIVE AEROSPACE EXPERIENCE
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold tracking-wider text-white sm:text-5xl">
            THE SKY IS NOT THE LIMIT.
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
            超越二维地平线只是起点。唯有尊重空气动力学约束、电化学物理边界与航空适航安全敬畏心，电动垂直起降飞行器才能真正成为人类城市交通的第三维度。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
            <a href="#chapter-00" className="hover:text-cyan-300">
              返回顶部 Chapter 00
            </a>
            <span>·</span>
            <a href="#city-flight-pilot" className="hover:text-cyan-300">
              重温城市飞行镜头
            </a>
            <span>·</span>
            <a href="#chapter-01" className="hover:text-cyan-300">
              返回 3D 机库实验室
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
