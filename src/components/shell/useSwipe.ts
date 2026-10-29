"use client";

import { useRef, type TouchEvent } from "react";
import { useSim } from "@/sim/store";

const MIN_DX = 56;
const MAX_MS = 700;

/**
 * Horizontal swipe on a surface steps the story: left is next, right is back.
 * Vertical drags and slow drags are ignored so in-app scrolling keeps working.
 */
export function useSwipe() {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const p = e.touches[0];
    start.current = { x: p.clientX, y: p.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - s.x;
    const dy = p.clientY - s.y;
    if (Date.now() - s.t > MAX_MS || Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const sim = useSim.getState();
    if (dx < 0) sim.next();
    else sim.back();
  };

  return { onTouchStart, onTouchEnd };
}
