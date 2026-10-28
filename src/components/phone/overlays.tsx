"use client";

import { useEffect, useState } from "react";
import type { OverlayId } from "@/sim/types";
import { Hot, Icon, Qr, Sheet } from "./ui";

function Countdown() {
  const [sec, setSec] = useState(30 * 60);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 7)), 100);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const pct = (sec / 1800) * 100;
  return (
    <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(#25f4ee ${pct}%, rgba(255,255,255,0.1) 0)` }}>
      <div className="grid h-[112px] w-[112px] place-items-center rounded-full bg-[#14161b]">
        <div className="text-center">
          <div className="text-[26px] font-black tabular-nums">
            {mm}:{ss}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">left to cancel free</div>
        </div>
      </div>
    </div>
  );
}

export function Overlay({ id }: { id: OverlayId }) {
  switch (id) {
    case "notif":
      return (
        <div className="absolute inset-x-3 top-[54px] z-50">
          <Hot id="notif" className="pop-in flex w-full items-start gap-3 rounded-3xl text-left border border-white/15 bg-[#1b1e25]/95 p-3.5 shadow-2xl backdrop-blur">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-cyan">
              <Icon name="up" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-[11px] text-white/50">
                <span className="font-bold uppercase tracking-wide">TikTok Relay</span>
                <span>now</span>
              </span>
              <span className="block text-[14px] font-bold">Delivery morning confirmation</span>
              <span className="block text-[12.5px] leading-snug text-white/75">Your earbuds arrive today! Tap to confirm you&apos;ll be there. 📦</span>
            </span>
          </Hot>
        </div>
      );
    case "missed-call":
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 px-8 text-center backdrop-blur-sm">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-red/20 text-4xl">📵</span>
          <div className="text-[20px] font-extrabold">Missed call</div>
          <div className="text-[14px] text-white/70">Kuya Jun · XYZ Express rider</div>
          <div className="rounded-2xl border border-red/50 bg-red/10 px-4 py-3 text-[13px] text-red">
            Delivery attempt failed.
            <br />
            Customer not available at 11:20 AM.
          </div>
        </div>
      );
    case "qr":
      return (
        <Sheet>
          <div className="text-center">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-cyan">Remote doorstep payment</div>
            <div className="mt-1 text-[18px] font-extrabold">Pay the rider ₱1,499 by QR</div>
            <div className="mt-4 flex justify-center">
              <Qr size={150} />
            </div>
            <div className="mt-2 text-[11px] text-white/50">Scan with GCash or Maya · Kuya Jun is at your gate</div>
            <Hot id="pay-now" className="mt-4 w-full rounded-full bg-gradient-to-r from-[#007cff] to-[#25f4ee] py-3.5 text-center text-[14px] font-extrabold text-white">
              Pay with GCash
            </Hot>
            <Hot id="pay-cash" className="mt-2 w-full rounded-full bg-white/10 py-3 text-center text-[13px] font-bold">
              Pay cash to rider instead
            </Hot>
          </div>
        </Sheet>
      );
    case "cooling":
      return (
        <Sheet>
          <div className="text-center">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-cyan">Cooling window · 30 minutes</div>
            <div className="mb-4 mt-1 text-[18px] font-extrabold">Still want these sneakers?</div>
            <Countdown />
            <div className="mt-3 text-[12px] text-white/60">Livestream deals move fast. Cancel for free anytime in the next 30 minutes. Nothing ships until it ends.</div>
            <Hot id="keep" className="mt-4 w-full rounded-full bg-cyan py-3.5 text-center text-[14px] font-extrabold text-black">
              Keep my order
            </Hot>
            <Hot id="cancel" className="mt-2 w-full rounded-full bg-white/10 py-3 text-center text-[13px] font-bold">
              Cancel for free
            </Hot>
          </div>
        </Sheet>
      );
    case "escrow":
      return (
        <Sheet>
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyan/15 text-cyan">
              <Icon name="shield" size={32} />
            </span>
            <div className="mt-3 text-[18px] font-extrabold">Escrow Shield is on</div>
            <div className="mt-1 text-[13px] text-white/65">Your ₱599 is held by TikTok until you inspect the parcel and confirm. Wrong size? Exchange it free.</div>
            <div className="mt-4 flex justify-center gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-cyan">FUNDS HELD</span>
              <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-cyan">SIZE-EXCHANGE GUARANTEE</span>
            </div>
            <Hot id="ack" className="mt-5 w-full rounded-full bg-cyan py-3.5 text-center text-[14px] font-extrabold text-black">
              Got it
            </Hot>
          </div>
        </Sheet>
      );
    case "otp":
      return (
        <Sheet>
          <div className="text-center">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-cyan">Secure handoff</div>
            <div className="mt-1 text-[16px] font-extrabold">Share this code with the rider</div>
            <div className="my-4 flex justify-center gap-2">
              {["4", "8", "2", "9"].map((d, i) => (
                <span key={i} className="grid h-14 w-12 place-items-center rounded-xl border border-cyan/60 bg-cyan/10 text-[28px] font-black text-cyan">
                  {d}
                </span>
              ))}
            </div>
            <div className="text-[12px] text-white/60">Only the person with Earl&apos;s code gets the parcel.</div>
            <Hot id="share-otp" className="mt-4 w-full rounded-full bg-cyan py-3.5 text-center text-[14px] font-extrabold text-black">
              Share code with rider
            </Hot>
          </div>
        </Sheet>
      );
    case "cancelled":
      return (
        <Sheet>
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok/15 text-ok">
              <Icon name="check" size={32} />
            </span>
            <div className="mt-3 text-[18px] font-extrabold">Order cancelled</div>
            <div className="mt-1 text-[13px] text-white/65">No fees and nothing was shipped. Thanks for taking a moment, Earl.</div>
            <Hot id="done" className="mt-5 w-full rounded-full bg-white/10 py-3.5 text-center text-[14px] font-extrabold">
              Done
            </Hot>
          </div>
        </Sheet>
      );
  }
}
