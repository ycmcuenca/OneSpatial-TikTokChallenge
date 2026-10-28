"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSim } from "@/sim/store";
import { Hot, Icon, TabBar } from "./ui";

function Blobs({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <>
      <div className="blob absolute -left-10 top-10 h-72 w-72 rounded-full opacity-80" style={{ background: a }} />
      <div className="blob absolute -right-16 top-72 h-80 w-80 rounded-full opacity-70" style={{ background: b, animationDelay: "-3s" }} />
      <div className="blob absolute left-10 bottom-20 h-64 w-64 rounded-full opacity-70" style={{ background: c, animationDelay: "-6s" }} />
    </>
  );
}

function RightRail({ likes, comments }: { likes: string; comments: string }) {
  return (
    <div className="absolute bottom-[190px] right-3 z-10 flex flex-col items-center gap-4 text-[11px] font-semibold">
      <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-orange-300 text-lg">👩</div>
      {[
        { icon: "heart", label: likes },
        { icon: "chat", label: comments },
        { icon: "share", label: "Share" },
      ].map((b) => (
        <div key={b.icon} className="flex flex-col items-center gap-1">
          <Icon name={b.icon} size={28} fill={b.icon === "heart"} className={b.icon === "heart" ? "text-red" : "text-white"} />
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export function FeedScreen({ mode }: { mode?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#12041f]">
      <Blobs a="#7c3aed" b="#fe2c55" c="#25f4ee" />
      <div className="absolute inset-0 grid place-items-center pb-24 text-[120px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">🎧</div>
      <div className="absolute inset-x-0 top-[58px] z-10 flex justify-center gap-5 text-[16px] font-bold">
        <span className="text-white/60">Following</span>
        <span className="border-b-2 border-white pb-1">For You</span>
      </div>
      <RightRail likes="48.2K" comments="1,204" />
      <div className="absolute inset-x-0 bottom-[78px] z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-16">
        {mode === "pin" ? (
          <Hot id="pin" className="mb-3 flex w-[84%] items-center gap-3 rounded-2xl bg-white/95 p-2.5 text-left text-black shadow-xl">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-200 to-cyan-200 text-2xl">🎧</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold">Wireless Earbuds · 30h battery</span>
              <span className="block text-[13px] font-extrabold text-red">₱1,499 <span className="font-normal text-black/40 line-through">₱2,499</span></span>
            </span>
            <span className="rounded-full bg-red px-3 py-1.5 text-[12px] font-bold text-white">Shop</span>
          </Hot>
        ) : (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold backdrop-blur">🛒 TikTok Shop · Wireless Earbuds</div>
        )}
        <div className="w-[78%] text-[14px] font-bold">@jhen.finds</div>
        <div className="w-[78%] text-[13px] leading-snug text-white/90">Budget earbuds na sulit talaga 🎧🔥 free shipping pa! #TikTokShopPH #earbuds</div>
      </div>
      <TabBar active="home" />
    </div>
  );
}

const COMMENTS = [
  ["maria.c", "ang ganda ng kulay! 😍"],
  ["jayr_21", "COD po ba pwede?"],
  ["kuyaben", "sold na ako 🔥🔥"],
  ["lyn.manalo", "ilang days shipping to Cebu?"],
  ["tintin", "waiting for the flash sale!!"],
  ["rj.dela", "size 8 pa meron?"],
];

export function LiveScreen() {
  const [left, setLeft] = useState(41);
  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v > 1 ? v - 1 : 59)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1a0420]">
      <Blobs a="#fe2c55" b="#a21caf" c="#f59e0b" />
      <div className="absolute inset-0 grid place-items-center pb-32 text-[110px]">👟</div>
      <div className="absolute left-4 top-[58px] z-10 flex items-center gap-2 text-[12px] font-bold">
        <span className="rounded bg-red px-2 py-0.5">LIVE</span>
        <span className="rounded bg-black/40 px-2 py-0.5">12.4K watching</span>
      </div>
      <div className="absolute right-4 top-[56px] z-10 flex items-center gap-2 rounded-full bg-black/40 py-1 pl-1 pr-3 text-[12px] font-semibold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-red text-xs">🛍</span>
        @sneakerhaus.ph
      </div>
      <div className="absolute inset-x-4 bottom-[256px] z-10 h-[120px] overflow-hidden [mask-image:linear-gradient(transparent,black_30%)]">
        <div className="ticker flex flex-col gap-2 text-[13px]">
          {[...COMMENTS, ...COMMENTS].map(([u, t], i) => (
            <div key={i}>
              <span className="font-semibold text-white/60">{u} </span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-4 z-10 rounded-3xl bg-black/75 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
          <span className="rounded-full bg-red px-2 py-0.5">⚡ FLASH SALE</span>
          <span className="tabular-nums text-yellow-300">Ends in 00:{String(left).padStart(2, "0")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-200 to-pink-300 text-3xl">👟</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold">Court Low Sneakers · Unisex</div>
            <div className="text-[15px] font-extrabold text-red">₱599 <span className="text-[12px] font-normal text-white/40 line-through">₱1,299</span></div>
            <div className="text-[11px] text-white/50">Only 7 pairs left · COD available</div>
          </div>
        </div>
        <Hot id="buy-live" className="mt-3 w-full rounded-full bg-red py-3 text-center text-[15px] font-extrabold">
          Buy now
        </Hot>
      </div>
    </div>
  );
}

export function ProductScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0c0d10] pt-[50px]">
      <div className="flex items-center gap-3 px-4 py-2">
        <Icon name="back" />
        <div className="flex-1 truncate rounded-full bg-white/10 px-3 py-1.5 text-[13px] text-white/60">Wireless Earbuds</div>
        <Icon name="bag" />
      </div>
      <div className="relative grid h-[250px] place-items-center overflow-hidden bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-400/30 text-[100px]">
        🎧
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px]">1/6</span>
      </div>
      <div className="flex-1 overflow-hidden px-4 pt-3">
        <div className="flex items-end gap-2">
          <span className="text-[26px] font-extrabold text-red">₱1,499</span>
          <span className="pb-1 text-[13px] text-white/40 line-through">₱2,499</span>
          <span className="mb-1 rounded bg-red/20 px-1.5 py-0.5 text-[11px] font-bold text-red">-40%</span>
        </div>
        <div className="mt-1 text-[15px] font-semibold leading-snug">Wireless Earbuds · 30h battery · Bluetooth 5.3</div>
        <div className="mt-1 text-[12px] text-white/50">★ 4.7 · 12.8K sold · Shipped from Metro Manila</div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-cyan">🚚 Free shipping voucher</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">💵 Cash on Delivery</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">7-day returns</span>
        </div>
        <div className="mt-4 rounded-2xl bg-white/5 p-3 text-[12px] text-white/70">
          <div className="font-semibold text-white">Deliver to Earl · Cebu City</div>
          Standard shipping · Est. 4–6 days
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 bg-black px-4 pb-8 pt-3">
        <div className="flex w-16 flex-col items-center gap-0.5 text-[10px] text-white/60">
          <Icon name="chat" size={20} />
          Chat
        </div>
        <div className="flex w-16 flex-col items-center gap-0.5 text-[10px] text-white/60">
          <Icon name="bag" size={20} />
          Cart
        </div>
        <Hot id="buy" className="flex-1 rounded-full bg-red py-3 text-center text-[15px] font-extrabold">
          Buy now
        </Hot>
      </div>
    </div>
  );
}

function PayOption({
  id,
  selected,
  icon,
  title,
  sub,
  tags,
  interactive,
}: {
  id: string;
  selected: boolean;
  icon: string;
  title: string;
  sub: string;
  tags?: { text: string; tone: "cyan" | "red" | "muted" }[];
  interactive: boolean;
}) {
  const body = (
    <>
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-cyan bg-cyan text-black" : "border-white/30"}`}>
        {selected && <Icon name="check" size={12} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold">
          {icon} {title}
        </span>
        <span className="block text-[12px] text-white/60">{sub}</span>
        {tags && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t.text}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  t.tone === "cyan" ? "bg-cyan/15 text-cyan" : t.tone === "red" ? "bg-red/15 text-red" : "bg-white/10 text-white/70"
                }`}
              >
                {t.text}
              </span>
            ))}
          </span>
        )}
      </span>
    </>
  );
  const cls = `flex w-full gap-3 rounded-2xl border p-3 text-left ${selected ? "border-cyan/70 bg-cyan/5" : "border-white/10 bg-white/[0.03]"}`;
  return interactive ? (
    <Hot id={id} className={cls}>
      {body}
    </Hot>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl bg-white/[0.04] p-3 text-[13px]">{children}</div>;
}

export function CheckoutScreen({ mode }: { mode?: string }) {
  const payment = useSim((s) => s.choices.payment);
  const livePay = useSim((s) => s.choices.livePay);
  const live = mode === "live";
  const relay = mode === "relay";

  const item = live
    ? { emoji: "👟", name: "Court Low Sneakers · Unisex · Size 8", price: "₱599" }
    : { emoji: "🎧", name: "Wireless Earbuds · 30h battery", price: "₱1,499" };

  const shipping = live
    ? livePay === "prepaid"
      ? "A&B Express · Priority 24–48h"
      : "XYZ Express · Standard 4–6 days"
    : relay
      ? payment === "gcash"
        ? "A&B Express · Priority 24–48h"
        : "XYZ Express · Standard 4–6 days"
      : "XYZ Express · Standard 4–6 days";

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0c0d10] pt-[50px]">
      <div className="flex items-center gap-3 px-4 py-2 text-[16px] font-bold">
        <Icon name="back" /> Checkout
      </div>
      <div className="scroll-hide flex-1 space-y-2.5 overflow-y-auto px-4 pb-3">
        {live && (
          <div className="flex items-center gap-2 rounded-2xl border border-red/40 bg-red/10 px-3 py-2 text-[12px] font-semibold text-red">
            <Icon name="shield" size={16} /> High-risk checkout · Fashion via LIVE
          </div>
        )}
        <Row>
          <div className="flex items-start gap-2">
            <Icon name="pin" size={18} className="mt-0.5 text-cyan" />
            <div>
              <div className="font-bold">Earl D. · (+63) 917 000 0000</div>
              <div className="text-white/60">Unit 4B, Casa Verde Dorm, Cuenco Ave., Talamban, Cebu City 6000</div>
            </div>
          </div>
        </Row>
        <Row>
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-3xl">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{item.name}</div>
              <div className="text-white/50">Qty 1</div>
            </div>
            <div className="font-extrabold">{item.price}</div>
          </div>
        </Row>
        <Row>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Icon name="truck" size={18} className="text-cyan" /> {shipping}
            </span>
            <span className="font-bold text-cyan">FREE</span>
          </div>
        </Row>

        <div className="px-1 pt-1 text-[12px] font-bold uppercase tracking-wide text-white/50">Payment method</div>
        {live ? (
          <>
            <PayOption
              id="lp:cod"
              interactive
              selected={livePay === "cod"}
              icon="💵"
              title="Cash on Delivery"
              sub="Pay when it arrives · XYZ Express"
              tags={[{ text: "30-MIN COOLING WINDOW", tone: "red" }, { text: "ADDRESS CHECK", tone: "muted" }]}
            />
            <PayOption
              id="lp:prepaid"
              interactive
              selected={livePay === "prepaid"}
              icon="🛡️"
              title="GCash / Maya + Escrow Shield"
              sub="Funds held until you inspect · A&B Express"
              tags={[{ text: "SIZE-EXCHANGE GUARANTEE", tone: "cyan" }, { text: "24–48H", tone: "cyan" }]}
            />
          </>
        ) : relay ? (
          <>
            <PayOption
              id="pay:cod"
              interactive
              selected={payment === "cod"}
              icon="💵"
              title="Cash on Delivery"
              sub="XYZ Express · Standard 4–6 days"
              tags={[{ text: "ECONOMY", tone: "red" }]}
            />
            <PayOption
              id="pay:gcash"
              interactive
              selected={payment === "gcash"}
              icon="💙"
              title="GCash / Maya"
              sub="A&B Express · Priority 24–48h dispatch"
              tags={[{ text: "0% CASH-HANDLING FEE", tone: "cyan" }, { text: "+10% COIN REBATE", tone: "cyan" }]}
            />
          </>
        ) : (
          <>
            <PayOption id="x1" interactive={false} selected icon="💵" title="Cash on Delivery" sub="Pay ₱1,499 when your parcel arrives" />
            <PayOption id="x2" interactive={false} selected={false} icon="💙" title="GCash / Maya" sub="Standard shipping" />
          </>
        )}
        {mode === "baseline" && (
          <div className="rounded-2xl bg-cyan/10 px-3 py-2 text-[12px] font-semibold text-cyan">🎟 Free shipping voucher applied</div>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 bg-black px-4 pb-8 pt-3">
        <div className="text-[12px] text-white/60">
          Total
          <div className="text-[18px] font-extrabold text-white">{item.price}</div>
        </div>
        <Hot id="place" className="flex-1 rounded-full bg-red py-3 text-center text-[15px] font-extrabold">
          Place order
        </Hot>
      </div>
    </div>
  );
}
