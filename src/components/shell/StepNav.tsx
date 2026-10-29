"use client";

import { useSim, useStep } from "@/sim/store";
import { Icon } from "../phone/ui";

export function BackButton() {
  const back = useSim((s) => s.back);
  return (
    <button
      onClick={back}
      aria-label="Previous step"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white active:bg-white/15"
    >
      <Icon name="back" size={20} />
    </button>
  );
}

/** Next on every step but the last, where it becomes Replay. */
export function NextButton({ className = "" }: { className?: string }) {
  const next = useSim((s) => s.next);
  const restart = useSim((s) => s.restart);
  const { chapter, position, total } = useStep();
  const last = chapter.id === "impact" && position === total;
  return (
    <button
      onClick={last ? restart : next}
      className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cyan px-5 text-body font-bold text-black active:brightness-90 ${className}`}
    >
      {last ? "Replay" : "Next"}
      {!last && (
        <span className="rotate-180">
          <Icon name="back" size={18} />
        </span>
      )}
    </button>
  );
}
