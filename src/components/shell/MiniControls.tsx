"use client";

import { useState } from "react";
import { useStep } from "@/sim/store";
import { ChapterTabs, Controls } from "./Controls";
import { TAG_STYLE } from "./MapOverlays";

/** Mobile: a collapsible floating pill over the app with chapter picker, caption and controls */
export function MiniControls() {
  const [open, setOpen] = useState(false);
  const { step, position, total } = useStep();
  const t = TAG_STYLE[step.tag];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center px-3 pt-[10px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur"
        aria-expanded={open}
      >
        <span className={`rounded-full px-2 py-0.5 text-[9px] tracking-wider ${t.cls}`}>{t.label}</span>
        <span className="tabular-nums text-white/70">
          {position}/{total}
        </span>
        <span className="text-white/50">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="pop-in pointer-events-auto mt-2 w-full max-w-[380px] space-y-3 rounded-2xl border border-white/10 bg-[#0d0f13]/95 p-3.5 shadow-2xl backdrop-blur-md">
          <div className="scroll-hide -mx-1 overflow-x-auto px-1">
            <ChapterTabs className="w-max" />
          </div>
          <div>
            <div className="text-[14px] font-extrabold leading-snug">{step.title}</div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/70">{step.caption}</p>
            {step.hint && <div className="mt-2 rounded-lg bg-cyan/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan">👆 {step.hint}</div>}
          </div>
          <Controls compact />
        </div>
      )}
      {!open && step.hint && (
        <div className="pointer-events-none mt-2.5 max-w-[240px] rounded-lg bg-cyan px-2.5 py-1 text-[11px] font-bold text-black shadow-lg">👆 {step.hint}</div>
      )}
    </div>
  );
}
