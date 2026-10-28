"use client";

import { CHAPTERS } from "@/sim/chapters";
import { useSim, useStep } from "@/sim/store";
import { Icon } from "../phone/ui";

const btn =
  "grid h-9 min-w-9 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 text-[13px] font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-30";

export function Controls({ compact = false }: { compact?: boolean }) {
  const { next, back, autoplay, toggleAutoplay, muted, toggleMuted, restart, setAbout } = useSim();
  return (
    <div className="flex items-center gap-1.5">
      <button className={btn} onClick={back} aria-label="Previous step" title="Previous (←)">
        <Icon name="back" size={16} />
      </button>
      <button className={`${btn} ${autoplay ? "!border-cyan/60 !bg-cyan/15 !text-cyan" : ""}`} onClick={toggleAutoplay} aria-label="Toggle autoplay" title="Autoplay (Space)">
        {autoplay ? "❚❚" : "▶"}
        {!compact && <span className="ml-1.5">{autoplay ? "Pause" : "Autoplay"}</span>}
      </button>
      <button className={`${btn} !border-cyan/40 !bg-cyan/10 !text-cyan`} onClick={next} aria-label="Next step" title="Next (→)">
        {!compact && <span className="mr-1">Next</span>}
        <span className="rotate-180">
          <Icon name="back" size={16} />
        </span>
      </button>
      <button className={btn} onClick={toggleMuted} aria-label={muted ? "Unmute" : "Mute"} title="Sound (M)">
        {muted ? "🔇" : "🔊"}
      </button>
      <button className={btn} onClick={restart} aria-label="Restart" title="Restart (R)">
        ↺
      </button>
      <button className={btn} onClick={() => setAbout(true)} aria-label="About the team" title="About">
        ⓘ
      </button>
    </div>
  );
}

export function ChapterTabs({ className = "" }: { className?: string }) {
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
            title={`${c.label} (${i + 1})`}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
              on ? "bg-white text-black" : "text-white/55 hover:bg-white/10 hover:text-white"
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
        <span className="text-cyan drop-shadow-[2px_0_0_#fe2c55] text-xl font-black">♪</span>
        <div className="leading-tight">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">One Spatial / TikTok Global E-Commerce</div>
          <div className="text-[14px] font-extrabold">TikTok Relay Simulator</div>
        </div>
      </div>
      <ChapterTabs />
      <div className="flex items-center gap-4">
        <div className="hidden text-right xl:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{chapter.label}</div>
          <div className="text-[12px] font-bold tabular-nums">
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
