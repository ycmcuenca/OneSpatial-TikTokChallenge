"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import type { ChapterId } from "@/sim/types";
import { PhoneStage } from "./phone/PhoneStage";
import { About } from "./shell/About";
import { TopBar } from "./shell/Controls";
import { Caption, ClockChip, CliffStage, Hud, LeverTracker, RiderCard } from "./shell/MapOverlays";
import { MobileDock } from "./shell/MobileDock";
import { SidePanel } from "./shell/SidePanel";
import { useSwipe } from "./shell/useSwipe";

const SimMap = dynamic(() => import("./map/SimMap").then((m) => m.SimMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b0c0f]" />,
});

type Layout = "desktop" | "split" | "stack";

/**
 * desktop: phone + map. split: phone + story column (tablets, landscape phones).
 * stack: phone with a bottom dock (portrait phones). Breakpoints follow where the layouts run out of room.
 */
function useLayout(): Layout | null {
  const [layout, setLayout] = useState<Layout | null>(null);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const mid = window.matchMedia("(min-width: 700px)");
    const on = () => setLayout(wide.matches ? "desktop" : mid.matches ? "split" : "stack");
    on();
    wide.addEventListener("change", on);
    mid.addEventListener("change", on);
    return () => {
      wide.removeEventListener("change", on);
      mid.removeEventListener("change", on);
    };
  }, []);
  return layout;
}

/** URL deep links, autoplay timer and keyboard shortcuts */
function useRuntime() {
  const { step } = useStep();
  const chapterId = useSim((s) => s.chapterId);
  const entry = useSim((s) => s.entry);
  const autoplay = useSim((s) => s.autoplay);

  // Deep link in. The ref keeps StrictMode's second effect pass from re-reading a URL we've already rewritten.
  const linked = useRef(false);
  useEffect(() => {
    if (linked.current) return;
    linked.current = true;
    const p = new URLSearchParams(window.location.search);
    const ch = p.get("ch");
    if (ch && CHAPTERS.some((c) => c.id === ch)) useSim.getState().goTo(ch as ChapterId, p.get("step") ?? undefined);
  }, []);

  // Deep link out
  useEffect(() => {
    if (!linked.current) return;
    window.history.replaceState(null, "", `?ch=${chapterId}&step=${step.id}`);
  }, [chapterId, step.id]);

  // Autoplay: wait for the step's animation, then advance
  useEffect(() => {
    if (!autoplay) return;
    const anim = Math.max(0, ...(step.map.actors ?? []).map((a) => a.ms));
    const wait = step.dwell ?? Math.max(6500, anim + 2500);
    const t = setTimeout(() => useSim.getState().next(), wait);
    return () => clearTimeout(t);
  }, [autoplay, entry, step]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useSim.getState();
      if (e.key === "Escape") s.setAbout(false);
      else if (e.key === "?") s.setAbout(true);
      else if (e.key === "ArrowRight") s.next();
      else if (e.key === "ArrowLeft") s.back();
      else if (e.key === " " && el?.tagName !== "BUTTON") {
        e.preventDefault();
        s.toggleAutoplay();
      } else if (/^[1-6]$/.test(e.key)) s.goTo(CHAPTERS[Number(e.key) - 1].id);
      else if (e.key === "r" || e.key === "R") s.restart();
      else if (e.key === "m" || e.key === "M") s.toggleMuted();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** The unframed phone, with horizontal swipes stepping the story. Vertical scroll inside the app is untouched. */
function SwipePhone() {
  const swipe = useSwipe();
  return (
    <div {...swipe} className="min-h-0 min-w-0 flex-1 touch-pan-y">
      <PhoneStage framed={false} />
    </div>
  );
}

export function Simulator() {
  const layout = useLayout();
  const { step } = useStep();
  useRuntime();

  if (layout === null) return <div className="h-dvh w-full bg-bg" />;

  if (layout === "stack") {
    return (
      <main className="flex h-dvh w-full flex-col bg-black">
        <SwipePhone />
        <MobileDock />
        <About />
      </main>
    );
  }

  if (layout === "split") {
    return (
      <main className="flex h-dvh w-full bg-black">
        <div className="flex min-w-0 shrink-0 basis-[min(48%,calc(100dvh*0.61))] flex-col">
          <SwipePhone />
        </div>
        <SidePanel />
        <About />
      </main>
    );
  }

  return (
    <main className="flex h-dvh w-full flex-col bg-bg">
      <TopBar />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_2fr]">
        <section className="relative min-h-0 border-r border-line bg-[radial-gradient(ellipse_at_50%_35%,#10242a_0%,#07080a_70%)]">
          <PhoneStage framed />
        </section>
        <section className="relative min-h-0 overflow-hidden">
          <SimMap />
          <div className="pointer-events-none absolute inset-0 p-4">
            <div className="absolute bottom-4 left-4 flex flex-col gap-3">
              {!step.cliff && <ClockChip />}
              <Caption />
            </div>
            {step.cliff && <CliffStage className="absolute left-4 right-[332px] top-4" />}
            <div className="absolute bottom-8 right-4 top-4 flex w-[300px] flex-col justify-between gap-3">
              <LeverTracker />
              <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                <RiderCard />
                {step.hud && <Hud hud={step.hud} />}
              </div>
            </div>
          </div>
        </section>
      </div>
      <About />
    </main>
  );
}
