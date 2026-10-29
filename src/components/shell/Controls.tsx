"use client";

import { CHAPTERS } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import { Icon } from "../phone/ui";

const btn =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-2 text-data font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-30";

/** `touch` swaps the 36px desktop targets for 44px ones. */
const size = (touch: boolean) => (touch ? "h-11 min-w-11" : "h-9 min-w-9");

export function Controls({ compact = false, touch = false }: { compact?: boolean; touch?: boolean }) {
  const { next, back, autoplay, toggleAutoplay, muted, toggleMuted, restart, setAbout } = useSim();
  const b = `${btn} ${size(touch)}`;
  return (
    <div className={`flex items-center ${touch ? "justify-between gap-1" : "gap-1.5"}`}>
      <button className={b} onClick={back} aria-label="Previous step" title="Previous (←)">
        <Icon name="back" size={16} />
      </button>
      <button className={`${b} ${autoplay ? "!border-cyan/60 !bg-cyan/15 !text-cyan" : ""}`} onClick={toggleAutoplay} aria-label={autoplay ? "Pause autoplay" : "Start autoplay"} title={autoplay ? "Pause autoplay (Space)" : "Play the story automatically (Space)"}>
        {autoplay ? "❚❚" : "▶"}
        {!compact && <span className="ml-1.5 hidden xl:inline">{autoplay ? "Pause" : "Autoplay"}</span>}
      </button>
      <button className={`${b} !border-cyan/40 !bg-cyan/10 !text-cyan`} onClick={next} aria-label="Next step" title="Next (→)">
        {!compact && <span className="mr-1 hidden xl:inline">Next</span>}
        <span className="rotate-180">
          <Icon name="back" size={16} />
        </span>
      </button>
      <button className={b} onClick={toggleMuted} aria-label={muted ? "Turn sound on" : "Turn sound off"} title={muted ? "Sound is off. Turn on (M)" : "Sound is on. Turn off (M)"}>
        {muted ? "🔇" : "🔊"}
      </button>
      <button className={b} onClick={restart} aria-label="Restart from the beginning" title="Restart from the beginning (R)">
        ↺
      </button>
      <button className={b} onClick={() => setAbout(true)} aria-label="Help and about" title="Help, shortcuts and team (?)">
        ⓘ
      </button>
    </div>
  );
}

export function ChapterTabs({ className = "", touch = false }: { className?: string; touch?: boolean }) {
  const chapterId = useSim((s) => s.chapterId);
  const goTo = useSim((s) => s.goTo);
  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {CHAPTERS.map((c, i) => {
        const on = c.id === chapterId;
        return (
          <button
            key={c.id}
            onClick={() => goTo(c.id)}
            title={`Jump to ${c.label} (${i + 1})`}
            aria-current={on ? "step" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 text-label font-semibold transition ${touch ? "h-11 px-3.5" : "py-1.5"} ${
              on ? "bg-white text-black" : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c.short}
          </button>
        );
      })}
    </nav>
  );
}

export function TopBar() {
  const { position, total, chapter } = useStep();
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-bg px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-cyan drop-shadow-[2px_0_0_#fe2c55] text-xl font-extrabold">♪</span>
        <div className="whitespace-nowrap">
          <div className="text-body font-extrabold leading-tight">TikTok Relay Simulator</div>
          <div className="hidden text-label text-white/65 xl:block">One Spatial · TikTok Global E-Commerce</div>
        </div>
      </div>
      <ChapterTabs />
      <div className="flex items-center gap-4">
        <div className="hidden text-right xl:block">
          <div className="text-label font-semibold text-white/65">{chapter.label}</div>
          <div className="text-data font-bold tabular-nums">
            Step {position} / {total}
          </div>
        </div>
        <Controls />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
        <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${(position / total) * 100}%` }} />
      </div>
    </header>
  );
}
