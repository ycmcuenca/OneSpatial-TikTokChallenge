"use client";

import { useState } from "react";
import { useStep } from "@/sim/store";
import { Icon } from "../phone/ui";
import { ChapterTabs, Controls } from "./Controls";
import { TAG_STYLE } from "./MapOverlays";
import { BackButton, NextButton } from "./StepNav";
import { StepDetails } from "./StepDetails";

/**
 * Portrait phones: Back and Next live in a bottom dock within thumb reach. The middle of the
 * dock peeks at the step's figure (or the tap to make) and opens a sheet with everything the
 * desktop map overlays carry. Steps that are pure reading open the sheet on their own.
 */
export function MobileDock() {
  const { chapter, step, position, total, hint } = useStep();
  const key = `${chapter.id}/${step.id}`;
  const [pref, setPref] = useState<{ key: string; open: boolean } | null>(null);
  const open = pref?.key === key ? pref.open : !!step.hud && !step.advanceOn;
  const tag = TAG_STYLE[step.tag];

  const peek = open
    ? "Tap to hide details"
    : hint?.tap
      ? hint.text
      : step.hud
        ? [step.hud.eyebrow, step.hud.value].filter(Boolean).join(" · ")
        : "Tap for details";

  return (
    <div className="relative z-[60] shrink-0 border-t border-white/10 bg-[#0b0d11] pb-[max(env(safe-area-inset-bottom),8px)]">
      {open && (
        <div
          id="dock-sheet"
          className="pop-in absolute inset-x-0 bottom-full max-h-[62dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-x border-t border-white/10 bg-[#0d0f13] p-3.5 shadow-[0_-12px_32px_rgba(0,0,0,0.55)]"
        >
          <StepDetails />
          <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
            <div className="scroll-hide -mx-1 overflow-x-auto px-1">
              <ChapterTabs touch className="w-max" />
            </div>
            <Controls compact touch />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 pt-2">
        <BackButton />
        <button
          onClick={() => setPref({ key, open: !open })}
          aria-expanded={open}
          aria-controls="dock-sheet"
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 text-left active:bg-white/5"
        >
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-label font-semibold ${tag.cls}`}>{tag.label}</span>
              <span className="shrink-0 text-label tabular-nums text-white/65">
                {position}/{total}
              </span>
            </span>
            <span className={`mt-0.5 block truncate text-label ${hint?.tap && !open ? "font-semibold text-cyan" : "text-white/75"}`}>{peek}</span>
          </span>
          <span className={`shrink-0 text-white/65 transition-transform ${open ? "rotate-180" : ""}`}>
            <Icon name="up" size={18} />
          </span>
        </button>
        <NextButton />
      </div>
    </div>
  );
}
