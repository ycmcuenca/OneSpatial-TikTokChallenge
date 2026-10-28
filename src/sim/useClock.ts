"use client";

import { useEffect, useState } from "react";
import { WINDOW_TIMES } from "./chapters";
import { useSim, useStep } from "./store";
import type { Clock } from "./types";

const parse = (c: Clock) => {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(c.time);
  let h = m ? Number(m[1]) % 12 : 9;
  const min = m ? Number(m[2]) : 41;
  if (m && m[3].toUpperCase() === "PM") h += 12;
  return (c.day - 1) * 1440 + h * 60 + min;
};

export const formatTime = (totalMin: number) => {
  const day = Math.floor(totalMin / 1440) + 1;
  const inDay = Math.round(totalMin) % 1440;
  const h24 = Math.floor(inDay / 60);
  const mm = String(inDay % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { day, time: `${h12}:${mm} ${h24 >= 12 ? "PM" : "AM"}` };
};

/** Simulated clock: eases from `step.clock` to `step.clockTo` while the map actors move */
export function useSimClock(): Clock {
  const { step } = useStep();
  const entry = useSim((s) => s.entry);
  const window = useSim((s) => s.choices.window);
  let start = step.clock;
  let end = step.clockTo;
  if (step.windowClock) {
    const w = WINDOW_TIMES[window];
    const at = { enroute: w.start, arrive: w.arrive, done: w.done }[step.windowClock];
    start = { day: step.clock.day, time: at };
    end = step.windowClock === "enroute" ? { day: step.clock.day, time: w.arrive } : undefined;
  }
  const from = parse(start);
  const to = end ? parse(end) : from;
  const ms = Math.max(1500, ...(step.map.actors ?? []).map((a) => a.ms));
  const [anim, setAnim] = useState({ entry: -1, v: 0 });

  useEffect(() => {
    if (from === to) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setAnim({ entry, v: from + (to - from) * e });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entry, from, to, ms]);

  // Until this entry's first frame lands, show the starting time
  return formatTime(from === to || anim.entry !== entry ? from : anim.v);
}
