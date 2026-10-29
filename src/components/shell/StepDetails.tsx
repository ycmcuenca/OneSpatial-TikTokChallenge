"use client";

import { useStep } from "@/sim/store";
import { CliffStage, ClockChip, Hud, LeverTracker, RiderCard } from "./MapOverlays";

/**
 * Everything the desktop map overlays carry, stacked for a narrow column: the caption,
 * the step's figures, the rider app, the clock and the lever tracker.
 * The keyboard-only "Press Next" hint is left out; only real tap hints show.
 */
export function StepDetails() {
  const { step, hint } = useStep();
  return (
    <div className="space-y-3">
      <div key={step.id} className="pop-in">
        <div className="text-heading text-balance">{step.title}</div>
        <p className="mt-1.5 text-body text-pretty text-white/75">{step.caption}</p>
        {hint?.tap && (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-cyan/10 px-3 py-2.5 text-data font-semibold text-cyan">
            <span className="hot h-2.5 w-2.5 shrink-0 rounded-full bg-cyan" />
            {hint.text}
          </div>
        )}
      </div>
      {step.hud && <Hud hud={step.hud} />}
      <RiderCard />
      {step.cliff ? <CliffStage /> : <ClockChip className="w-full" />}
      <LeverTracker />
    </div>
  );
}
