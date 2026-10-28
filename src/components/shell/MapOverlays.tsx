"use client";

import { INSTRUCTIONS, WINDOW_LABEL, WINDOW_TIMES } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import { useSimClock } from "@/sim/useClock";
import type { HudCard, HudRow, Tag } from "@/sim/types";

export const TAG_STYLE: Record<Tag, { label: string; cls: string }> = {
  intro: { label: "THE LEAK", cls: "bg-white/10 text-white" },
  baseline: { label: "WITHOUT RELAY", cls: "bg-red/15 text-red" },
  prevent: { label: "01 · PREVENT", cls: "bg-cyan/15 text-cyan" },
  optimize: { label: "02 · OPTIMIZE", cls: "bg-cyan/15 text-cyan" },
  protect: { label: "03 · PROTECT", cls: "bg-cyan/15 text-cyan" },
  impact: { label: "IMPACT", cls: "bg-red/15 text-red" },
};

const toneCls = { red: "text-red", cyan: "text-cyan", ok: "text-ok", muted: "text-white/60" } as const;

export function Caption() {
  const { step, position, total } = useStep();
  const t = TAG_STYLE[step.tag];
  return (
    <div key={step.id} className="pop-in w-[360px] max-w-full rounded-2xl border border-white/10 bg-[#0d0f13]/90 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider ${t.cls}`}>{t.label}</span>
        <span className="text-[11px] tabular-nums text-white/40">
          {position} / {total}
        </span>
      </div>
      <div className="text-[16px] font-extrabold leading-snug">{step.title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-white/70">{step.caption}</p>
      {step.hint && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-cyan/10 px-3 py-2 text-[12px] font-semibold text-cyan">
          <span className="hot grid h-5 w-5 place-items-center rounded-full bg-cyan text-[10px] text-black">👆</span>
          {step.hint}
        </div>
      )}
    </div>
  );
}

export function ClockChip() {
  const { day, time } = useSimClock();
  return (
    <div className="inline-flex items-center gap-3 self-start rounded-xl border border-white/10 bg-[#0d0f13]/90 px-3.5 py-2 backdrop-blur-md">
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">Simulated clock</div>
        <div className="text-[18px] font-extrabold tabular-nums leading-tight">
          Day {day} <span className="text-white/50">·</span> {time}
        </div>
      </div>
    </div>
  );
}

export function CliffGauge() {
  const { day } = useSimClock();
  const max = 7;
  const pos = Math.min(Math.max(day, 1), max);
  return (
    <div className="pop-in w-[250px] self-start rounded-xl border border-white/10 bg-[#0d0f13]/90 px-3.5 py-2.5 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-white/50">Transit days</span>
        <span className={day > 4 ? "text-red" : "text-cyan"}>{day > 4 ? "Past the cliff" : "Safe zone"}</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-white/10">
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-cyan/60" style={{ width: `${(3.5 / (max - 0.5)) * 100}%` }} />
        <div className="absolute inset-y-0 right-0 rounded-r-full bg-red/70" style={{ width: `${((max - 4) / (max - 0.5)) * 100}%` }} />
        <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-lg transition-all duration-300" style={{ left: `${((pos - 1) / (max - 1)) * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-white/40">
        {Array.from({ length: max }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-red/90">The 4-day remorse cliff · 33% failure above it</div>
    </div>
  );
}

function Row({ r }: { r: HudRow }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-white/55">{r.label}</span>
      <span className={`text-right font-bold ${r.tone ? toneCls[r.tone] : ""}`}>{r.value}</span>
    </div>
  );
}

export function Hud({ hud }: { hud: HudCard }) {
  return (
    <div key={hud.eyebrow + (hud.value ?? "")} className="pop-in w-full rounded-2xl border border-white/10 bg-[#0d0f13]/92 p-4 shadow-2xl backdrop-blur-md">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">{hud.eyebrow}</div>
      {hud.value && (
        <div className={`mt-1 text-[30px] font-black leading-none ${hud.valueTone === "red" ? "text-red" : hud.valueTone === "ok" ? "text-ok" : "text-cyan"}`}>{hud.value}</div>
      )}
      {hud.title && <div className="mt-1.5 text-[14px] font-bold">{hud.title}</div>}
      {hud.rows && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          {hud.rows.map((r) => (
            <Row key={r.label} r={r} />
          ))}
        </div>
      )}
      {hud.note && <div className="mt-3 text-[11px] leading-snug text-white/45">{hud.note}</div>}
    </div>
  );
}

export function RiderCard() {
  const { step } = useStep();
  const choices = useSim((s) => s.choices);
  const mode = step.map.riderCard;
  if (!mode) return null;
  const win = WINDOW_LABEL[choices.window];
  const instr = INSTRUCTIONS.filter((i) => choices.instr.includes(i.id));
  const failed = mode === "failed";
  const protect = step.tag === "protect";
  const courier = protect && choices.livePay === "prepaid" ? "A&B Express" : "XYZ Express";
  const orderId = protect ? "#TTR9F20481" : "#TTR8E34710";

  return (
    <div key={mode} className={`pop-in w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${failed ? "border-red/50 bg-[#1a0b10]/95" : "border-white/10 bg-[#0d0f13]/92"}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-sm text-black">🛵</span>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Rider app · {courier}</div>
          <div className="text-[13px] font-bold leading-tight">Kuya Jun · {orderId}</div>
        </div>
      </div>
      <div className="space-y-1.5 text-[12px]">
        {failed && (
          <>
            <div className="font-bold text-red">Attempt 1 failed · customer unavailable</div>
            <div className="text-white/60">No availability window on file. No instructions. Phone unanswered.</div>
            <div className="text-white/60">Parcel marked for return to sender.</div>
          </>
        )}
        {mode === "planned" && (
          <>
            <div className="font-bold text-ok">✓ Customer confirmed · Intent-Locked</div>
            <div className="text-white/70">Drop window: <b className="text-white">{win}</b></div>
            <div className="text-white/60">Stop re-sequenced into the window. Payment: COD, QR optional.</div>
          </>
        )}
        {mode === "instructions" && (
          <>
            <div className="font-bold text-ok">✓ Intent-Locked · {win}</div>
            {instr.length ? (
              instr.map((i) => (
                <div key={i.id} className="text-white/75">
                  • {i.en}
                </div>
              ))
            ) : (
              <div className="text-white/60">No special instructions</div>
            )}
            <div className="text-white/60">ETA {WINDOW_TIMES[choices.window].arrive}</div>
          </>
        )}
        {mode === "qr" && (
          <>
            <div className="font-bold text-cyan">At the gate · awaiting payment</div>
            <div className="text-white/70">Customer is paying ₱1,499 by remote GCash/Maya QR, or cash on handoff.</div>
          </>
        )}
        {mode === "otp" && (
          <>
            <div className="font-bold text-cyan">Enter customer OTP</div>
            <div className="flex gap-1.5">
              {["4", "8", "2", "9"].map((d, i) => (
                <span key={i} className="grid h-8 w-7 place-items-center rounded border border-cyan/50 bg-cyan/10 font-black text-cyan">
                  {d}
                </span>
              ))}
            </div>
            <div className="text-white/60">Parcel is only released to the code holder.</div>
          </>
        )}
        {mode === "done" && (
          <>
            <div className="font-bold text-ok">✓ Handoff complete</div>
            <div className="text-white/70">
              {step.tag === "prevent"
                ? choices.pay === "gcash"
                  ? "Payment received via GCash QR"
                  : "Cash collected: ₱1,499"
                : "OTP 4829 verified"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LeverTracker() {
  const unlocked = useSim((s) => s.unlocked);
  const items = [
    { k: "prevent", n: "01 Prevent", v: "₱1.171B + ₱410M" },
    { k: "optimize", n: "02 Optimize", v: "₱423.7M" },
    { k: "protect", n: "03 Protect", v: "₱625M" },
  ] as const;
  const all = items.every((i) => unlocked[i.k]);
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d0f13]/90 p-3.5 backdrop-blur-md">
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/50">Monthly impact · per slide</div>
      <div className="space-y-1.5">
        {items.map((i) => (
          <div key={i.k} className="flex items-center justify-between text-[12px]">
            <span className={unlocked[i.k] ? "font-semibold" : "text-white/35"}>{i.n}</span>
            <span className={`font-extrabold tabular-nums ${unlocked[i.k] ? "text-cyan" : "text-white/25"}`}>{unlocked[i.k] ? i.v : "🔒 locked"}</span>
          </div>
        ))}
      </div>
      {all && (
        <div className="pop-in mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5 text-[12px]">
          <span className="font-bold">Total deck claim</span>
          <span className="font-black text-red">₱1.45B / mo</span>
        </div>
      )}
    </div>
  );
}
