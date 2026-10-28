"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import type { ChapterId } from "@/sim/types";
import { PhoneStage } from "./phone/PhoneStage";
import { About } from "./shell/About";
import { TopBar } from "./shell/Controls";
import { Caption, CliffGauge, ClockChip, Hud, LeverTracker, RiderCard } from "./shell/MapOverlays";
import { MiniControls } from "./shell/MiniControls";

const SimMap = dynamic(() => import("./map/SimMap").then((m) => m.SimMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b0c0f]" />,
});

function useDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
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

export function Simulator() {
  const desktop = useDesktop();
  const { step } = useStep();
  useRuntime();

  if (desktop === null) return <div className="h-dvh w-full bg-bg" />;

  if (!desktop) {
    return (
      <main className="relative h-dvh w-full bg-black">
        <PhoneStage framed={false} />
        <MiniControls />
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
              <ClockChip />
              {step.cliff && <CliffGauge />}
              <Caption />
            </div>
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
