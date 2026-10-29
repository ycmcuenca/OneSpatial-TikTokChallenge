"use client";

import type { CSSProperties, ReactNode } from "react";
import { chapterById } from "@/sim/chapters";
import { useSim } from "@/sim/store";
import { useSimClock } from "@/sim/useClock";

const ICONS: Record<string, string> = {
  home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  bag: "M6 7h12l1 14H5L6 7zM9 7a3 3 0 0 1 6 0",
  chat: "M4 5h16v11H9l-5 4z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  heart: "M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z",
  share: "M4 12l16-8-6 16-3-7z",
  back: "M15 5l-7 7 7 7",
  check: "M5 12l5 5 9-10",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3",
  up: "M12 20V5M6 11l6-6 6 6",
  bell: "M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4",
  pin: "M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  truck: "M2 6h11v9H2zM13 9h5l3 3v3h-8zM6 18.5h.01M17 18.5h.01",
  phone: "M7 3h10v18H7zM11 18h2",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
};

export function Icon({ name, size = 22, className = "", fill = false }: { name: keyof typeof ICONS | string; size?: number; className?: string; fill?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}

/** A tappable phone control. Pulses when it is the one that advances the story. */
export function Hot({
  id,
  children,
  className = "",
  style,
  disabled,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const tap = useSim((s) => s.tap);
  const hot = useSim((s) => chapterById(s.chapterId).steps[s.stepIdx].advanceOn?.[0] === id);
  return (
    <button
      type="button"
      data-hot={id}
      disabled={disabled}
      onClick={() => tap(id)}
      style={style}
      className={`${className} ${hot ? "hot" : ""} active:scale-[0.97] transition-transform`}
    >
      {children}
    </button>
  );
}

export function StatusBar({ framed }: { framed: boolean }) {
  const { time } = useSimClock();
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-[50px] items-end justify-between px-7 pb-1 text-[15px] font-semibold text-white pointer-events-none">
      <span className="tabular-nums">{time.replace(/\s?(AM|PM)/, "")}</span>
      {framed && <span className="absolute left-1/2 top-[11px] h-[32px] w-[110px] -translate-x-1/2 rounded-full bg-black" />}
      <span className="flex items-center gap-1 text-[12px]">
        <span>5G</span>
        <span className="inline-block h-[10px] w-[22px] rounded-[3px] border border-white/80 p-[1px]">
          <span className="block h-full w-[70%] rounded-[1px] bg-white" />
        </span>
      </span>
    </div>
  );
}

export function TabBar({ active }: { active: "home" | "shop" | "relay" | "inbox" | "me" }) {
  const items = [
    { id: "home", label: "Home", icon: "home" },
    { id: "shop", label: "Shop", icon: "bag" },
    { id: "relay", label: "Relay", icon: "up" },
    { id: "inbox", label: "Inbox", icon: "chat" },
    { id: "me", label: "Profile", icon: "user" },
  ] as const;
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-[78px] items-start justify-around border-t border-white/10 bg-black/90 px-2 pt-2 backdrop-blur">
      {items.map((it) => {
        const on = it.id === active;
        return (
          <div key={it.id} className={`flex w-16 flex-col items-center gap-0.5 text-[12px] ${on ? "text-white" : "text-white/60"}`}>
            {it.id === "relay" ? (
              <span className={`grid h-7 w-7 place-items-center rounded-full ${on ? "bg-cyan text-black" : "bg-white/15"}`}>
                <Icon name="up" size={16} />
              </span>
            ) : (
              <Icon name={it.icon} size={22} />
            )}
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export const money = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: n % 1 ? 2 : 0 })}`;

export function Brand() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[19px] font-extrabold">
      <span className="text-cyan drop-shadow-[2px_0_0_#fe2c55]">♪</span> TikTok Relay
    </div>
  );
}

export function Sheet({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "danger" }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/60 backdrop-blur-[2px]">
      <div
        className={`pop-in w-full rounded-t-[28px] border-t px-5 pb-8 pt-5 ${
          tone === "danger" ? "border-red/50 bg-[#1a0b10]" : "border-white/10 bg-[#14161b]"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        {children}
      </div>
    </div>
  );
}

export function Qr({ size = 150 }: { size?: number }) {
  const cells: ReactNode[] = [];
  const n = 17;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 5 && y < 5) || (x > 11 && y < 5) || (x < 5 && y > 11);
      const ring = (cx: number, cy: number) => {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const d = Math.max(dx, dy);
        return d === 2 || d === 0 || d === 1 ? d !== 1 : false;
      };
      const on = finder ? ring(x < 8 ? 2 : 14, y < 8 ? 2 : 14) : Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1 > 0.1;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b0c0f" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="rounded-xl bg-white p-1">
      {cells}
    </svg>
  );
}
