"use client";

import { useStep } from "@/sim/store";
import { ChapterTabs, Controls } from "./Controls";
import { BackButton, NextButton } from "./StepNav";
import { StepDetails } from "./StepDetails";

/** Tablets and landscape phones: the phone keeps its height and the story moves to a column beside it. */
export function SidePanel() {
  const { chapter, position, total } = useStep();
  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-line bg-bg">
      <div className="relative shrink-0 border-b border-line px-3 pb-2 pt-2">
        <div className="scroll-hide overflow-x-auto">
          <ChapterTabs touch className="w-max" />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-label text-white/65">
          <span>{chapter.label}</span>
          <span className="tabular-nums">
            Step {position} / {total}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
          <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${(position / total) * 100}%` }} />
        </div>
      </div>
      <div className="scroll-hide min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3">
        <StepDetails />
        <div className="border-t border-white/10 pt-3">
          <Controls compact touch />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <BackButton />
        <NextButton className="flex-1" />
      </div>
    </aside>
  );
}
