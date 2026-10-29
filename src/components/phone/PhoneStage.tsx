"use client";

import { useEffect, useRef, useState } from "react";
import { useStep } from "@/sim/store";
import { Overlay } from "./overlays";
import { ChatScreen, OrdersScreen, RecapScreen, RelayScreen } from "./order-screens";
import { CheckoutScreen, FeedScreen, LiveScreen, ProductScreen } from "./shop-screens";
import { StatusBar } from "./ui";

const W = 390;
const H = 844;
const BEZEL = 13;
/** Shortest layout height the screens are drawn for when the app runs unframed */
const MIN_H = 640;

function Screens() {
  const { step } = useStep();
  const { screen, mode, overlay } = step.phone;
  return (
    <>
      <div key={`${screen}-${mode ?? ""}`} className="fade-in absolute inset-0">
        {screen === "feed" && <FeedScreen mode={mode} />}
        {screen === "live" && <LiveScreen />}
        {screen === "product" && <ProductScreen />}
        {screen === "checkout" && <CheckoutScreen mode={mode} />}
        {screen === "orders" && <OrdersScreen mode={mode} />}
        {screen === "relay" && <RelayScreen mode={mode} />}
        {screen === "chat" && <ChatScreen mode={mode} />}
        {screen === "recap" && <RecapScreen mode={mode} />}
      </div>
      {overlay && <Overlay key={overlay} id={overlay} />}
    </>
  );
}

function PhoneApp({ framed, height }: { framed: boolean; height: number }) {
  return (
    <div className="relative overflow-hidden bg-black text-white" style={{ width: W, height }}>
      <Screens />
      <StatusBar framed={framed} />
      {framed && <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/80" />}
    </div>
  );
}

/** Desktop: the app inside an iPhone-style body, scaled to fit. Mobile: the app full-bleed. */
export function PhoneStage({ framed }: { framed: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (framed) {
    const fw = W + BEZEL * 2;
    const fh = H + BEZEL * 2;
    const scale = Math.min((box.w - 24) / fw, (box.h - 24) / fh, 1.1);
    const ready = box.w > 0 && scale > 0;
    return (
      <div ref={ref} className="relative grid h-full w-full place-items-center overflow-hidden">
        {ready && (
          <div style={{ width: fw * scale, height: fh * scale }}>
            <div style={{ width: fw, height: fh, transform: `scale(${scale})`, transformOrigin: "top left" }} className="relative">
              {/* side buttons */}
              <span className="absolute -left-[3px] top-[130px] h-8 w-[4px] rounded-l bg-[#3a3d45]" />
              <span className="absolute -left-[3px] top-[190px] h-14 w-[4px] rounded-l bg-[#3a3d45]" />
              <span className="absolute -left-[3px] top-[262px] h-14 w-[4px] rounded-l bg-[#3a3d45]" />
              <span className="absolute -right-[3px] top-[210px] h-20 w-[4px] rounded-r bg-[#3a3d45]" />
              <div
                className="h-full w-full rounded-[64px] bg-gradient-to-b from-[#3b3e46] via-[#1b1d22] to-[#3b3e46] p-[13px] shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_80px_rgba(37,244,238,0.12)]"
                style={{ boxShadow: "inset 0 0 0 2px #4a4e58, 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(37,244,238,0.12)" }}
              >
                <div className="h-full w-full overflow-hidden rounded-[51px] ring-1 ring-black">
                  <PhoneApp framed height={H} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unframed: fill the width, but never scale past what keeps the app's MIN_H of layout height,
  // so a landscape phone or a tablet gets a smaller centred phone instead of a clipped giant one.
  // Tall boxes (tablets) cap at the design height and centre the phone rather than stretch it.
  const scale = Math.min(box.w / W, box.h / MIN_H);
  const height = Math.min(box.h / scale, H);
  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      {box.w > 0 && (
        <div style={{ width: W * scale, height: height * scale }} className="overflow-hidden">
          <div style={{ width: W, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <PhoneApp framed={false} height={height} />
          </div>
        </div>
      )}
    </div>
  );
}
