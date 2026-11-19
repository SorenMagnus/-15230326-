import React from 'react';
import { Play, Pause } from 'lucide-react';

interface NavbarProps {
  isAutoDemoRunning: boolean;
  onToggleAutoDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAutoDemoRunning,
  onToggleAutoDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030508]/95">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#chapter-00"
          className="font-display text-sm font-semibold tracking-[0.22em] text-white whitespace-nowrap shrink-0"
        >
          BEYOND THE GROUND
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="主章节导航"
          className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide text-slate-300"
        >
          <a
            href="#city-flight-pilot"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
          >
            城市飞行
          </a>
          <a
            href="#chapter-01"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
          >
            3D 机库
          </a>
          <a
            href="#chapter-02"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
          >
            工程架构
          </a>
          <a
            href="#chapter-03"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
          >
            物理仿真
          </a>
          <a
            href="#chapter-08"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
          >
            结论与文献
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleAutoDemo}
            className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              isAutoDemoRunning
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-white text-slate-950 hover:bg-cyan-200'
            }`}
          >
            {isAutoDemoRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                暂停演示
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                自动课堂演示
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
