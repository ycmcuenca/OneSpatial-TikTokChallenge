"use client";

import { useEffect, useState } from "react";
import { INSTRUCTIONS, WINDOW_LABEL, WINDOW_TIMES } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import { useSimClock } from "@/sim/useClock";
import type { HudCard, HudRow, Tag } from "@/sim/types";

export const TAG_STYLE: Record<Tag, { label: string; cls: string }> = {
  intro: { label: "The leak", cls: "bg-white/10 text-white" },
  baseline: { label: "Without Relay", cls: "bg-red/15 text-red-ink" },
  prevent: { label: "Prevent", cls: "bg-cyan/15 text-cyan" },
  optimize: { label: "Optimize", cls: "bg-cyan/15 text-cyan" },
  protect: { label: "Protect", cls: "bg-cyan/15 text-cyan" },
  impact: { label: "Impact", cls: "bg-ok/15 text-ok" },
};

const toneCls = { red: "text-red-ink", cyan: "text-cyan", ok: "text-ok", muted: "text-white/60" } as const;

export function Caption() {
  const { step, hint, last } = useStep();
  const restart = useSim((s) => s.restart);
  return (
    <div key={step.id} className="pop-in w-[380px] max-w-full rounded-2xl border border-white/10 bg-[#0d0f13]/90 p-4 shadow-2xl backdrop-blur-md">
      <div className="text-heading text-balance">{step.title}</div>
      <p className="mt-1.5 text-body text-pretty text-white/75">{step.caption}</p>
      {last && (
        <button
          onClick={restart}
          className="pointer-events-auto mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-cyan px-4 text-data font-bold text-black transition active:brightness-90"
        >
          Replay the story
          <kbd className="rounded bg-black/15 px-1.5 text-label font-semibold">R</kbd>
        </button>
      )}
      {hint && !last && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-cyan/10 px-3 py-2 text-data font-semibold text-cyan">
          <span className={`${hint.tap ? "hot " : ""}grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan text-label text-black`}>{hint.tap ? "👆" : "→"}</span>
          {hint.text}
        </div>
      )}
    </div>
  );
}

export function ClockChip({ className = "w-[280px] self-start" }: { className?: string }) {
  const { day, time } = useSimClock();
  return (
    <div className={`pop-in ${className} rounded-xl border border-white/10 bg-[#0d0f13]/90 px-4 py-3 backdrop-blur-md`}>
      <div className="text-label font-semibold text-white/65">Simulated clock</div>
      <div className="text-readout tabular-nums">
        Day {day} <span className="text-white/60">·</span> {time}
      </div>
    </div>
  );
}

const AXIS_DAYS = 7;
const CLIFF_DAY = 4;
/** A&B Express lands on Day 3, 10:40 AM: the Optimize "fast" step */
const AB_DELIVERED = 2 + (10 * 60 + 40) / 1440;

const along = (days: number) => `${(Math.min(Math.max(days, 0), AXIS_DAYS) / AXIS_DAYS) * 100}%`;

/** One parcel on the timeline: courier name above, a dot riding the track below. */
function Lane({ days, label, tone, done = false }: { days: number; label: string; tone: "white" | "cyan"; done?: boolean }) {
  const x = Math.min(Math.max(days, 0), AXIS_DAYS);
  const past = x >= CLIFF_DAY;
  const base = tone === "cyan" ? "bg-cyan" : "bg-white/80";
  const dot = done ? "bg-ok" : past ? "bg-red-ink" : tone === "cyan" ? "bg-cyan" : "bg-white";
  const flip = x > 4.5;
  return (
    <div className="relative h-9">
      <span
        className={`absolute top-0 whitespace-nowrap text-label font-semibold ${done ? "text-ok" : past ? "text-red-ink" : tone === "cyan" ? "text-cyan" : "text-white"}`}
        style={{ left: along(x), transform: flip ? "translateX(calc(-100% + 7px))" : "translateX(-7px)" }}
      >
        {label}
      </span>
      <div className="absolute inset-x-0 bottom-0 h-4">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        <div className={`absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full ${done ? "bg-ok" : base}`} style={{ width: along(Math.min(x, CLIFF_DAY)) }} />
        {past && (
          <div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-red-ink" style={{ left: along(CLIFF_DAY), width: `calc(${along(x)} - ${along(CLIFF_DAY)})` }} />
        )}
        <span className={`absolute top-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${dot}`} style={{ left: along(x) }} />
      </div>
    </div>
  );
}

/**
 * The remorse cliff, drawn as the thing the parcel travels across: failure risk is low for the first
 * four days, then steps up to 33%. Parcels ride the clock, so they cross the edge in real time.
 */
export function CliffStage({ className = "" }: { className?: string }) {
  const { day, time, elapsed } = useSimClock();
  const { step } = useStep();
  const race = !!step.map.actors?.some((a) => a.route === "ab-main");
  const crossed = elapsed >= CLIFF_DAY;
  const edge = along(CLIFF_DAY);
  return (
    <div className={`pop-in rounded-2xl border border-white/10 bg-[#0d0f13]/92 px-4 pb-3 pt-3 shadow-2xl backdrop-blur-md ${className}`}>
      <div className="text-label font-semibold text-white/65">Simulated clock</div>
      <div className="text-readout tabular-nums">
        Day {day} <span className="text-white/60">·</span> {time}
      </div>
      <p className="sr-only">Failure risk is low for the first four days in transit, then steps up to 33%. This is the remorse cliff.</p>

      <div aria-hidden className="mt-3">
        <div
          className="relative h-[72px]"
          style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "calc(100% / 7) 100%" }}
        >
          <div className="absolute bottom-0 left-0 flex h-[36%] items-center border-t-2 border-cyan/70 bg-cyan/15 px-3 text-label font-semibold text-cyan" style={{ width: edge }}>
            Within 4 days
          </div>
          <div className="absolute inset-y-0 right-0 flex flex-col justify-between overflow-hidden border-t-2 border-red bg-red/20 px-3 py-2" style={{ left: edge }}>
            {crossed && <span key="hit" className="cliff-flash pointer-events-none absolute inset-0 bg-red" />}
            <span className="relative text-label font-semibold text-red-ink">Remorse cliff</span>
            <span className="relative text-figure tabular-nums text-red-ink">
              33%<span className="ml-1.5 text-label font-semibold">fail</span>
            </span>
          </div>
        </div>

        <div className="mt-1 space-y-0.5">
          {race && <Lane days={Math.min(elapsed, AB_DELIVERED)} label={elapsed >= AB_DELIVERED ? "A&B Express · delivered" : "A&B Express"} tone="cyan" done={elapsed >= AB_DELIVERED} />}
          <Lane days={elapsed} label={crossed ? "XYZ Express · past the cliff" : "XYZ Express"} tone="white" />
        </div>

        <div className="grid grid-cols-7 text-center text-label tabular-nums text-white/65">
          {Array.from({ length: AXIS_DAYS }, (_, i) => (
            <span key={i} className={i + 1 === day ? "font-bold text-white" : ""}>
              Day {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** "₱1.45B / mo" counts up from zero; anything that is not a lone money figure stays as written. */
const COUNTABLE = /^([+−-]?₱)(\d[\d,]*(?:\.\d+)?)(.*)$/;

function CountUp({ value }: { value: string }) {
  const m = COUNTABLE.exec(value);
  const [p, setP] = useState(() => (m && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1));
  useEffect(() => {
    if (p >= 1) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      setP(k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!m) return <>{value}</>;
  const decimals = m[2].split(".")[1]?.length ?? 0;
  const shown = new Intl.NumberFormat("en-PH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(m[2].replace(/,/g, "")) * p);
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {m[1]}
        {shown}
        {m[3]}
      </span>
    </>
  );
}

function Row({ r }: { r: HudRow }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-data">
      <span className="text-white/70">{r.label}</span>
      <span className={`text-right font-bold tabular-nums ${r.tone ? toneCls[r.tone] : ""}`}>{r.value}</span>
    </div>
  );
}

/** Card surface follows the headline figure: loss reads red, recovered value green, Relay info cyan. */
const HUD_SURFACE = {
  red: "border-red/40 bg-surface-loss/92",
  ok: "border-ok/35 bg-surface-gain/92",
  cyan: "border-cyan/30 bg-surface-info/92",
  none: "border-white/10 bg-[#0d0f13]/92",
} as const;

export function Hud({ hud }: { hud: HudCard }) {
  const surface = HUD_SURFACE[hud.value ? (hud.valueTone ?? "cyan") : "none"];
  return (
    <div key={hud.eyebrow + (hud.value ?? "")} className={`pop-in w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${surface}`}>
      <div className="text-data font-semibold text-white/75">{hud.eyebrow}</div>
      {hud.value && (
        <div className={`mt-1.5 text-figure tabular-nums ${hud.valueTone === "red" ? "text-red-ink" : hud.valueTone === "ok" ? "text-ok" : "text-cyan"}`}><CountUp value={hud.value} /></div>
      )}
      {hud.title && <div className="mt-2 text-body font-bold text-balance">{hud.title}</div>}
      {hud.rows && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          {hud.rows.map((r) => (
            <Row key={r.label} r={r} />
          ))}
        </div>
      )}
      {hud.note && <div className="mt-3 text-label text-pretty text-white/70">{hud.note}</div>}
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
          <div className="text-label font-semibold text-white/65">Rider app · {courier}</div>
          <div className="text-data font-bold">Kuya Jun · {orderId}</div>
        </div>
      </div>
      <div className="space-y-1.5 text-data">
        {failed && (
          <>
            <div className="font-bold text-red-ink">Attempt 1 failed · customer unavailable</div>
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
                <span key={i} className="grid h-8 w-7 place-items-center rounded border border-cyan/50 bg-cyan/10 font-extrabold tabular-nums text-cyan">
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
    { k: "prevent", n: "01 Prevent", v: ["₱1.171B costs saved", "₱410M commission recovered"] },
    { k: "optimize", n: "02 Optimize", v: ["₱423.7M net benefit"] },
    { k: "protect", n: "03 Protect", v: ["₱625M policy value"] },
  ] as const;
  const all = items.every((i) => unlocked[i.k]);
  if (!items.some((i) => unlocked[i.k])) return null;
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d0f13]/90 p-3.5 backdrop-blur-md">
      <div className="mb-2 text-data font-semibold text-white/75">Monthly value, by lever</div>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.k} className="flex items-start justify-between gap-3 text-data">
            <span className={`whitespace-nowrap ${unlocked[i.k] ? "font-semibold text-cyan" : "text-white/65"}`}>{i.n}</span>
            {unlocked[i.k] ? (
              <span className="text-right font-extrabold tabular-nums text-ok">
                {i.v.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </span>
            ) : (
              <span className="text-white/65">Not reached yet</span>
            )}
          </div>
        ))}
      </div>
      {all && (
        <div className="pop-in mt-3 border-t border-white/10 pt-3 text-label text-pretty text-white/70">
          Each lever is its own estimate, as stated on its slide. They are not added together.
        </div>
      )}
    </div>
  );
}
