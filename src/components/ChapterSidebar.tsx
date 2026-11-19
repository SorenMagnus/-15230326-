import React from 'react';
import { ChevronRight, SkipForward, Square } from 'lucide-react';

export interface ChapterMeta {
  id: string;
  code: string;
  titleZh: string;
  titleEn: string;
}

export const CHAPTERS: ChapterMeta[] = [
  { id: 'chapter-00', code: '00', titleZh: '电影开场', titleEn: 'The Future Is Vertical' },
  { id: 'city-flight-pilot', code: '00B', titleZh: '城市飞行', titleEn: 'City Flight Narrative' },
  { id: 'chapter-01', code: '01', titleZh: '三维机库', titleEn: 'Meet The Aircraft' },
  { id: 'chapter-02', code: '02', titleZh: '工程原理', titleEn: 'Engineering The Impossible' },
  { id: 'chapter-03', code: '03', titleZh: '物理仿真', titleEn: 'Physics Of Flight' },
  { id: 'chapter-04', code: '04', titleZh: '飞控安全', titleEn: 'Autonomy & Safety' },
  { id: 'chapter-05', code: '05', titleZh: '城市航线', titleEn: 'The World From Above' },
  { id: 'chapter-06', code: '06', titleZh: '商业经济', titleEn: 'Business Reality' },
  { id: 'chapter-07', code: '07', titleZh: '竞品对比', titleEn: 'Competitive Landscape' },
  { id: 'chapter-08', code: '08', titleZh: '研究结论', titleEn: 'The Verdict & References' },
];

interface ChapterSidebarProps {
  activeChapterId: string;
  isAutoDemoRunning: boolean;
  autoDemoStepIndex: number;
  autoDemoCaption: string;
  onNextDemoStep: () => void;
  onStopDemo: () => void;
}

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  activeChapterId,
  isAutoDemoRunning,
  autoDemoStepIndex,
  autoDemoCaption,
  onNextDemoStep,
  onStopDemo,
}) => {
  return (
    <>
      {/* Desktop Left-Edge Mission Sequence Rail */}
      <aside
        aria-label="章节任务序列索引"
        className="fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 2xl:flex flex-col gap-1.5 rounded-xl border border-slate-800/80 bg-[#090D16]/90 p-2.5"
      >
        {CHAPTERS.map((ch) => {
          const isActive = activeChapterId === ch.id;
          return (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={`group flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <span className="font-mono">{ch.code}</span>
              <span className="whitespace-nowrap">{ch.titleZh}</span>
            </a>
          );
        })}
      </aside>

      {/* Auto-Demo Classroom Presentation Banner */}
      {isAutoDemoRunning && (
        <div
          role="region"
          aria-label="课堂自动演示控制器"
          className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-amber-500/50 bg-[#0C1220]/96 p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-amber-300">
              演示模式 · 步骤 {autoDemoStepIndex + 1} / 5
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onNextDemoStep}
                className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-100 hover:bg-slate-700"
              >
                下一步 <SkipForward className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={onStopDemo}
                className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-950/60 px-2.5 py-1 text-xs text-rose-200 hover:bg-rose-900/70"
              >
                <Square className="h-3 w-3" /> 退出演示
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-200">{autoDemoCaption}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <ChevronRight className="h-3 w-3 text-cyan-400" />
            <span>您随时可以滚动页面或拖动 3D 模型接管控制权</span>
          </div>
        </div>
      )}
    </>
  );
};
