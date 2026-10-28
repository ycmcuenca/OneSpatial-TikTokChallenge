"use client";

import { useSim } from "@/sim/store";

const TEAM = [
  { name: "Lawrence Boncodin", role: "Team captain · Commercial strategy", note: "Former TikTok Shop PH commercial & category strategist (Mom & Baby, Health)." },
  { name: "Yosef Cuenca", role: "Product Manager", note: "Computer Science, University of the Philippines. Built the product workflow." },
  { name: "Kurt Sumallo", role: "AI Engineer", note: "Computer Science, University of the Philippines. Technical feasibility, data modeling, global benchmarking." },
];

export function About() {
  const open = useSim((s) => s.aboutOpen);
  const setAbout = useSim((s) => s.setAbout);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setAbout(false)}>
      <div role="dialog" aria-modal aria-label="About One Spatial" className="pop-in w-full max-w-md rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-cyan">One Spatial</div>
        <h2 className="mt-1 text-[22px] font-black leading-tight">TikTok Relay: Prevent · Optimize · Protect</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-white/60">
          A ByteDance Business Challenge entry for TikTok Global E-Commerce. This simulator is illustrative: names, addresses and rider details are fictional, and monetary figures follow the pitch deck.
        </p>
        <div className="mt-4 space-y-3">
          {TEAM.map((m) => (
            <div key={m.name} className="rounded-2xl bg-white/5 p-3.5">
              <div className="text-[14px] font-bold">{m.name}</div>
              <div className="text-[12px] font-semibold text-cyan">{m.role}</div>
              <div className="mt-0.5 text-[12px] text-white/55">{m.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] leading-relaxed text-white/40">
          Shortcuts: ← / → step · Space autoplay · 1–6 chapters · R restart · M sound · Esc close
        </div>
        <button className="mt-4 w-full rounded-full bg-white py-3 text-[14px] font-extrabold text-black" onClick={() => setAbout(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
