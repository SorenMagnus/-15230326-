import React from 'react';
import { ArrowDown, ArrowUpRight, Film } from 'lucide-react';
import { HERO_KEY_METRICS, SignatureViewId } from '../../data/researchData';
import { HeroStage3D } from '../HeroStage3D';
import cityEstablishingPlate from '../../assets/images/plate_vertiport_empty_1795100736031.jpg';

interface HeroChapterProps {
  onJumpToSignatureScene: (view: SignatureViewId) => void;
}

export const HeroChapter: React.FC<HeroChapterProps> = ({
  onJumpToSignatureScene,
}) => {
  return (
    <section
      id="chapter-00"
      className="relative flex min-h-[calc(100vh-56px)] flex-col justify-between overflow-hidden border-b border-white/10 bg-[#030508]"
    >
      {/* Clean Aircraft-Free Golden-Hour Coastal Vertiport Underlay (zero AI drone artifacts) */}
      <img
        src={cityEstablishingPlate}
        alt="黄金时刻未来都市空中交通天际线"
        referrerPolicy="no-referrer"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-32"
      />

      {/* Live Full-Bleed Studio 3D Joby S4 Canvas (exact 6×5-blade tilt-rotor industrial digital twin) */}
      <HeroStage3D />

      {/* Measured Cinema Gradient Scrim (ensures WCAG AA legibility on left & bottom without hiding 3D aircraft) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#030508]/96 via-[#030508]/68 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-[#030508]/45"
      />

      {/* Main Editorial Title Lockup (Uncluttered Aviation Documentary Composition) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-6 pt-12 pb-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] text-sky-400">
            CHAPTER 00 · JOBY AVIATION S4 (JAS4-1) · 沉浸式三维航空工程作品
          </p>

          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.03] text-balance">
            BEYOND THE GROUND
          </h1>

          <p className="mt-4 font-display text-lg font-normal text-slate-200 sm:text-[21px]">
            超越地平线：电动垂直起降飞行器的工程突破与商业现实
          </p>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-300/90 sm:text-base">
            遵循真实公开构型：六组五叶可倾转电动推进器、碳纤维复合材料机体与 1+4 全景座舱。下滑进入
            <span className="text-white font-medium"> 滚轴驱动三维城市飞行叙事 </span>
            ，或随时接管视角自由检视机械结构、气动流场与物理边界。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#city-flight-pilot"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-100"
            >
              <Film className="h-4 w-4" />
              开启城市飞行镜头
              <ArrowDown className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onJumpToSignatureScene('CINEMATIC_HANGAR')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-[#070B12]/85 px-5 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-white/50 hover:text-white"
            >
              3D 机库自由检视
              <ArrowUpRight className="h-4 w-4 text-sky-400" />
            </button>
            <button
              type="button"
              onClick={() => onJumpToSignatureScene('EXPLODED_CAD')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-[#070B12]/85 px-5 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-sky-400 hover:text-white"
            >
              CAD 结构拆解
              <ArrowUpRight className="h-4 w-4 text-sky-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hairline Verified Telemetry Bar (Zero boxy cards, pure tabular aviation instrumentation) */}
      <div className="relative z-10 border-t border-white/10 bg-[#030508]/90">
        <div className="mx-auto grid max-w-[1360px] grid-cols-2 divide-y divide-white/10 px-6 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:px-10">
          {HERO_KEY_METRICS.map((kpi) => (
            <div key={kpi.id} className="py-4 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>{kpi.labelZh}</span>
                <span className="text-sky-400/90">{kpi.ref}</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
                <span className="font-mono text-2xl font-semibold text-white sm:text-3xl">
                  {kpi.value}
                </span>
                <span className="font-mono text-xs text-slate-400">{kpi.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
