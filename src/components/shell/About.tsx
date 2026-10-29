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
      <div role="dialog" aria-modal aria-label="Help and about" className="pop-in max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-heading !text-[1.375rem] font-extrabold text-balance"><span className="inline-block">TikTok Relay:</span> <span className="inline-block">Prevent · Optimize · Protect</span></h2>
        <p className="mt-2 text-data text-pretty text-white/70">
          A One Spatial entry in the ByteDance Business Challenge for TikTok Global E-Commerce. This simulator is illustrative: names, addresses and rider details are fictional, and monetary figures follow the pitch deck.
        </p>
        <h3 className="mt-5 text-body font-bold">How to use it</h3>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-data text-pretty text-white/75">
          <li>Tap the pulsing control on the phone to move the story forward, or press Next.</li>
          <li>Some taps are choices: delivery window, COD or GCash, keep or cancel. Go back to try another path.</li>
          <li>Autoplay runs the story on its own. Sound is off until you turn it on.</li>
        </ul>
        <div className="mt-3 text-label text-white/70">
          Keys: ← → previous / next · Space autoplay · 1–6 chapters · R restart · M sound · ? this panel · Esc close
        </div>
        <h3 className="mt-5 text-body font-bold">The team</h3>
        <div className="mt-2 space-y-3">
          {TEAM.map((m) => (
            <div key={m.name} className="rounded-2xl bg-white/5 p-3.5">
              <div className="text-body font-bold">{m.name}</div>
              <div className="text-label font-semibold text-cyan">{m.role}</div>
              <div className="mt-0.5 text-label text-pretty text-white/65">{m.note}</div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-full bg-white py-3 text-[14px] font-extrabold text-black" onClick={() => setAbout(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
