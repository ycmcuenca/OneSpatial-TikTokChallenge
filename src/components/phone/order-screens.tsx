"use client";

import { INSTRUCTIONS, WINDOW_LABEL, WINDOW_TIMES } from "@/sim/chapters";
import { useSim } from "@/sim/store";
import type { Choices } from "@/sim/types";
import { Brand, Hot, Icon, TabBar } from "./ui";

type Tone = "normal" | "fail" | "ok" | "warn";

interface OrderView {
  relay?: boolean;
  stage: number;
  tone: Tone;
  headline: string;
  sub: string;
  item?: "earbuds" | "sneakers";
  badges?: { text: string; tone: "cyan" | "ok" | "red" }[];
  actions?: boolean;
}

const STEPS = ["Order placed", "Dispatched", "In transit", "Delivery"];

function viewFor(mode: string | undefined, c: Choices): OrderView {
  switch (mode) {
    case "plain-placed":
      return { stage: 0, tone: "normal", headline: "Order placed", sub: "XYZ Express · Estimated delivery in 4–6 days" };
    case "plain-transit":
      return { stage: 2, tone: "normal", headline: "In transit", sub: "On its way to Cebu · Estimated delivery in 4–6 days" };
    case "plain-out":
      return { stage: 3, tone: "normal", headline: "Out for delivery", sub: "Your rider is on the way today" };
    case "plain-failed":
      return { stage: 3, tone: "fail", headline: "Delivery attempt failed", sub: "Customer not available · Returning to sender" };
    case "plain-returned":
      return { stage: 3, tone: "fail", headline: "Returned to sender", sub: "Order cancelled · Nothing delivered" };
    case "relay-transit":
      return {
        relay: true,
        stage: 2,
        tone: "normal",
        headline: "In transit · arriving in Cebu tonight",
        sub: "We'll ask you to confirm availability on delivery morning.",
        badges: [{ text: "INTENT-LOCK READY", tone: "cyan" }],
      };
    case "relay-delivered":
      return {
        relay: true,
        stage: 3,
        tone: "ok",
        headline: "Delivered ✓",
        sub: `Received in your ${WINDOW_LABEL[c.window]} window · ${c.pay === "gcash" ? "Paid via GCash QR" : "Paid in cash"}`,
        badges: [{ text: "INTENT-LOCKED", tone: "cyan" }],
      };
    case "opt-transit":
      return c.payment === "gcash"
        ? {
            relay: true,
            stage: 2,
            tone: "normal",
            headline: "In transit · A&B Express Priority",
            sub: "Prepaid · Estimated delivery in 24–48 hours",
            badges: [{ text: "PRIORITY DISPATCH", tone: "cyan" }],
          }
        : {
            relay: true,
            stage: 2,
            tone: "normal",
            headline: "In transit · XYZ Express",
            sub: "Cash on Delivery · Estimated delivery in 4–6 days",
          };
    case "opt-delivered-ab":
      return {
        relay: true,
        stage: 3,
        tone: "ok",
        headline: "Delivered in 2 days ✓",
        sub: "A&B Express Priority · 10% coin rebate +₱150 credited",
        badges: [{ text: "+₱150 COINS", tone: "ok" }, { text: "0% HANDLING FEE", tone: "cyan" }],
      };
    case "opt-cod-transit":
      return {
        relay: true,
        stage: 2,
        tone: "warn",
        headline: "Still in transit · Day 6",
        sub: "XYZ Express economy · Cash on Delivery",
      };
    case "prot-placed":
      return {
        relay: true,
        item: "sneakers",
        stage: 0,
        tone: "normal",
        headline: "Order placed",
        sub: c.livePay === "cod" ? "Cash on Delivery · 30-minute cooling window active" : "Prepaid · Funds held in escrow",
        badges: [{ text: "SIZE-EXCHANGE GUARANTEE", tone: "cyan" }],
      };
    case "prot-transit":
      return {
        relay: true,
        item: "sneakers",
        stage: 2,
        tone: "normal",
        headline: "In transit",
        sub: c.livePay === "prepaid" ? "A&B Express Priority · 24–48 hours" : "XYZ Express · Standard 4–6 days",
        badges: [{ text: "ADDRESS VERIFIED", tone: "ok" }],
      };
    case "prot-inspect":
      return {
        relay: true,
        item: "sneakers",
        stage: 3,
        tone: "warn",
        headline: "Delivered · inspect your order",
        sub: "Your ₱599 stays in escrow until you confirm.",
        actions: true,
      };
    case "prot-outcome":
      return c.inspect === "release"
        ? {
            relay: true,
            item: "sneakers",
            stage: 3,
            tone: "ok",
            headline: "Escrow released ✓",
            sub: "You confirmed the fit. Funds sent to the seller.",
            badges: [{ text: "ESCROW SHIELD", tone: "cyan" }],
          }
        : {
            relay: true,
            item: "sneakers",
            stage: 3,
            tone: "ok",
            headline: "Size exchange approved ✓",
            sub: "Free exchange label sent. Funds stay protected.",
            badges: [{ text: "SIZE-EXCHANGE GUARANTEE", tone: "cyan" }],
          };
    case "prot-delivered-cod":
      return {
        relay: true,
        item: "sneakers",
        stage: 3,
        tone: "ok",
        headline: "Delivered ✓",
        sub: "₱599 paid at the door · OTP verified",
        badges: [{ text: "OTP HANDOFF", tone: "cyan" }],
      };
    default:
      return { stage: 0, tone: "normal", headline: "Order placed", sub: "" };
  }
}

const toneCls: Record<Tone, string> = {
  normal: "border-white/10 bg-white/[0.04]",
  fail: "border-red/50 bg-red/10 text-red-ink",
  ok: "border-ok/50 bg-ok/10",
  warn: "border-yellow-400/40 bg-yellow-400/10",
};

export function OrdersScreen({ mode }: { mode?: string }) {
  const choices = useSim((s) => s.choices);
  const v = viewFor(mode, choices);
  const sneakers = v.item === "sneakers";
  const failed = v.tone === "fail";
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#0d2a30] via-[#0c0d10] to-[#0c0d10] pt-[56px]">
      <div className="mb-3">{v.relay ? <Brand /> : <div className="text-center text-[17px] font-bold">My Orders</div>}</div>
      <div className="scroll-hide h-[calc(100%-56px-78px)] space-y-3 overflow-y-auto px-4 pb-4">
        <div className="flex justify-between px-1">
          {STEPS.map((s, i) => {
            const done = i < v.stage || (i === v.stage && v.tone === "ok");
            const cur = i === v.stage && v.tone !== "ok";
            const bad = failed && i === v.stage;
            return (
              <div key={s} className="flex w-[22%] flex-col items-center gap-1 text-center text-[12px] text-white/60">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                    bad
                      ? "border-red bg-red text-white"
                      : done
                        ? "border-cyan bg-cyan text-black"
                        : cur
                          ? "border-cyan text-cyan shadow-[0_0_14px_rgba(37,244,238,0.5)]"
                          : "border-white/20"
                  }`}
                >
                  <Icon name={bad ? "x" : done ? "check" : i === 2 ? "truck" : "clock"} size={15} />
                </span>
                {s}
              </div>
            );
          })}
        </div>

        <div className={`rounded-2xl border p-3 ${toneCls[v.tone]}`}>
          <div className="text-[15px] font-extrabold">{v.headline}</div>
          <div className={`text-[12px] ${failed ? "text-red-ink/80" : "text-white/65"}`}>{v.sub}</div>
          {v.badges && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.badges.map((b) => (
                <span
                  key={b.text}
                  className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${
                    b.tone === "ok" ? "bg-ok/20 text-ok" : b.tone === "red" ? "bg-red/20 text-red-ink" : "bg-cyan/15 text-cyan"
                  }`}
                >
                  {b.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {v.actions && (
          <div className="flex gap-2">
            <Hot id="release" className="flex-1 rounded-full bg-cyan py-3 text-center text-[13px] font-extrabold text-black">
              Looks good · Release funds
            </Hot>
            <Hot id="exchange" className="flex-1 rounded-full bg-white/10 py-3 text-center text-[13px] font-bold">
              Wrong size · Exchange
            </Hot>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101216] p-3 text-[12px]">
          {[
            ["ORDER ID", sneakers ? "#TTR9F20481" : "#TTR8E34710"],
            ["ITEMS", sneakers ? "1x Court Low Sneakers, Size 8" : "1x Wireless Earbuds 30h"],
            ["AMOUNT", sneakers ? "₱599.00" : "₱1,499.00"],
            [
              "PAYMENT",
              mode?.startsWith("opt") ? (choices.payment === "gcash" ? "GCash / Maya (prepaid)" : "Cash on Delivery (COD)") : mode?.startsWith("prot") && choices.livePay === "prepaid" ? "Prepaid + Escrow" : "Cash on Delivery (COD)",
            ],
          ].map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-white/60">{k}</span>
              <span className="text-right font-semibold">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active={v.relay ? "relay" : "me"} />
    </div>
  );
}

const WINDOWS: Choices["window"][] = ["9-11", "12-2", "3-5"];

export function RelayScreen({ mode }: { mode?: string }) {
  const choices = useSim((s) => s.choices);
  const win = WINDOW_LABEL[choices.window];

  if (mode === "verify") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#0d2a30] via-[#0c0d10] to-[#0c0d10] pt-[56px]">
        <Brand />
        <div className="space-y-3 px-4 pt-5">
          <div className="rounded-2xl border border-cyan/40 bg-cyan/10 p-3">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-cyan">
              <Icon name="shield" size={16} /> CONFIRM BEFORE DISPATCH
            </div>
            <div className="mt-1 text-[12px] text-white/70">High-risk orders are verified automatically before anything ships.</div>
          </div>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101216] p-3 text-[12px]">
            <div className="flex justify-between"><span className="text-white/60">ORDER ID</span><b>#TTR9F20481</b></div>
            <div className="flex justify-between"><span className="text-white/60">ITEM</span><b>Court Low Sneakers · Size 8</b></div>
            <div className="flex justify-between"><span className="text-white/60">ADDRESS</span><b className="text-right">Unit 4B, Casa Verde Dorm, Talamban</b></div>
            <div className="flex justify-between"><span className="text-white/60">AMOUNT</span><b>₱599.00</b></div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-[12px]">
            <Icon name="check" size={16} className="text-ok" /> Size-exchange guarantee included
          </div>
          <Hot id="verify" className="w-full rounded-full bg-cyan py-3.5 text-center text-[14px] font-extrabold text-black">
            Yes, address and order are correct
          </Hot>
        </div>
        <TabBar active="relay" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#0d2a30] via-[#0c0d10] to-[#0c0d10] pt-[56px]">
      <Brand />
      <div className="scroll-hide h-[calc(100%-30px-78px)] space-y-3 overflow-y-auto px-4 pb-4 pt-3">
        {mode === "alert" && (
          <>
            <div className="rounded-2xl border border-red/60 bg-red/10 p-3">
              <div className="text-[13px] font-extrabold text-red-ink">⚠ IMPORTANT: DELIVERY MORNING CONFIRMATION REQUIRED</div>
              <div className="mt-0.5 text-[12px] text-white/70">Today is delivery day. Confirm that someone can receive your parcel.</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101216] p-3 text-[12px]">
              <div className="text-[12px] font-bold text-cyan">Intent-Lock <span className="font-normal text-white/60">· confirm the genuine desire for the order</span></div>
              <div className="flex justify-between"><span className="text-white/60">ORDER ID</span><b>#TTR8E34710</b></div>
              <div className="flex justify-between"><span className="text-white/60">ITEMS</span><b>1x Wireless Earbuds 30h</b></div>
              <div className="flex justify-between"><span className="text-white/60">AMOUNT</span><b>₱1,499.00</b></div>
              <div className="flex justify-between"><span className="text-white/60">PAYMENT</span><b className="text-right">COD / Digital payment available</b></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#101216] p-3">
              <div className="mb-2 text-[13px] font-bold">Locking intent &amp; confirming delivery</div>
              <div className="mb-1.5 text-[12px] text-white/60">When can you receive it today?</div>
              <div className="grid grid-cols-3 gap-2">
                {WINDOWS.map((w) => (
                  <Hot
                    key={w}
                    id={`win:${w}`}
                    className={`rounded-xl border py-2.5 text-center text-[12px] font-bold ${
                      choices.window === w ? "border-cyan bg-cyan/15 text-cyan" : "border-white/15 text-white/70"
                    }`}
                  >
                    {WINDOW_LABEL[w]}
                  </Hot>
                ))}
              </div>
              <Hot id="pay:gcash" className="mt-3 w-full rounded-full bg-gradient-to-r from-[#007cff] to-[#25f4ee] py-3 text-center text-[13px] font-extrabold text-black">
                1-TAP PAY WITH GCash · free delivery bonus
              </Hot>
              <Hot id="lock" className="mt-2 w-full rounded-full bg-white/10 py-3 text-center text-[13px] font-extrabold">
                CONFIRM CASH ON DELIVERY
              </Hot>
              <div className="mt-1.5 text-center text-[12px] text-white/60">Confirm availability for your {win} window</div>
            </div>
          </>
        )}
        {mode === "locked" && (
          <>
            <div className="rounded-2xl border border-ok/50 bg-ok/10 p-3">
              <div className="flex items-center gap-2 text-[14px] font-extrabold text-ok">
                <Icon name="lock" size={16} /> INTENT LOCKED
              </div>
              <div className="mt-0.5 text-[12px] text-white/75">You&apos;re available {win} at Gate B. The rider has been notified.</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101216] p-3 text-[12px]">
              <div className="flex justify-between"><span className="text-white/60">WINDOW</span><b>{win}</b></div>
              <div className="flex justify-between"><span className="text-white/60">COURIER</span><b>XYZ Express · Kuya Jun</b></div>
              <div className="flex justify-between"><span className="text-white/60">PAYMENT</span><b>COD · pay by QR optional</b></div>
            </div>
            <Hot id="open-chat" className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan py-3.5 text-[14px] font-extrabold text-black">
              <Icon name="chat" size={18} /> Message rider
            </Hot>
          </>
        )}
        {mode === "out" && (
          <>
            <div className="rounded-2xl border border-cyan/40 bg-cyan/10 p-3">
              <div className="flex items-center gap-2 text-[14px] font-extrabold text-cyan">
                <Icon name="truck" size={16} /> Out for delivery
              </div>
              <div className="mt-0.5 text-[12px] text-white/75">Kuya Jun is at your gate · {win} window</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101216] p-3 text-[12px]">
              <div className="flex justify-between"><span className="text-white/60">ORDER ID</span><b>#TTR8E34710</b></div>
              <div className="flex justify-between"><span className="text-white/60">AMOUNT DUE</span><b>₱1,499.00</b></div>
            </div>
          </>
        )}
      </div>
      <TabBar active="relay" />
    </div>
  );
}

export function ChatScreen({ mode }: { mode?: string }) {
  const choices = useSim((s) => s.choices);
  const win = WINDOW_LABEL[choices.window];
  const chosen = INSTRUCTIONS.filter((i) => choices.instr.includes(i.id));
  const sent = mode === "sent";
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0c0d10] pt-[50px]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <Icon name="back" />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-lg">🛵</span>
        <div>
          <div className="text-[14px] font-bold">Kuya Jun</div>
          <div className="text-[12px] text-ok">XYZ Express · online</div>
        </div>
      </div>
      <div className="scroll-hide flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13px]">
        <div className="mx-auto w-fit rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/60">Intent-Lock confirmed · {win}</div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2">Magandang umaga po, Earl! Ako si Jun ng XYZ Express. Ihahatid ko po ang earbuds mo today. 🛵</div>
        {sent && (
          <>
            <div className="pop-in ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan/15 p-3">
              <div className="mb-1 text-[12px] font-bold text-cyan">Delivery instructions</div>
              <div className="font-semibold">Window: {win}</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-white/85">
                {chosen.length ? chosen.map((i) => <li key={i.id}>{i.label}</li>) : <li>No special instructions</li>}
              </ul>
            </div>
            <div className="pop-in max-w-[80%] rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2" style={{ animationDelay: "0.6s" }}>
              Copy po, Earl! ETA {WINDOW_TIMES[choices.window].arrive}. Tatawag lang ako kung kailangan. 🙌
            </div>
          </>
        )}
      </div>
      {!sent && (
        <div className="space-y-2 border-t border-white/10 bg-black px-4 pb-8 pt-3">
          <div className="text-[12px] font-semibold text-white/65">Quick instructions</div>
          <div className="flex flex-wrap gap-2">
            {INSTRUCTIONS.map((i) => {
              const on = choices.instr.includes(i.id);
              return (
                <Hot
                  key={i.id}
                  id={`ins:${i.id}`}
                  className={`rounded-full border px-3 py-2 text-[12px] font-semibold ${on ? "border-cyan bg-cyan/15 text-cyan" : "border-white/20 text-white/70"}`}
                >
                  {on ? "✓ " : "+ "}
                  {i.label}
                </Hot>
              );
            })}
          </div>
          <Hot id="send" className="w-full rounded-full bg-cyan py-3 text-center text-[14px] font-extrabold text-black">
            Send to rider
          </Hot>
        </div>
      )}
    </div>
  );
}

function EarlScreen() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-[#0d2a30] via-[#0c0d10] to-[#0c0d10] pt-[56px]">
      <Brand />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="pop-in grid h-20 w-20 place-items-center rounded-full bg-ok text-black">
          <Icon name="check" size={40} />
        </div>
        <div className="pop-in">
          <div className="text-[24px] font-extrabold leading-tight">Delivered to Earl</div>
          <div className="mt-1 text-[13px] text-white/70">Talamban, Cebu City · Day 3, 10:40 AM</div>
        </div>
        <div className="w-full rounded-2xl border border-ok/40 bg-ok/10 p-4 text-left">
          <div className="text-[12px] font-semibold text-white/70">Order</div>
          <div className="text-[15px] font-bold">Wireless earbuds</div>
          <div className="mt-2 text-[12px] text-white/70">Paid on delivery · not refused, not returned to sender</div>
        </div>
      </div>
      <TabBar active="relay" />
    </div>
  );
}

export function RecapScreen({ mode }: { mode?: string }) {
  if (mode === "earl") return <EarlScreen />;
  const total = mode === "total";
  const cards = [
    { n: "01", t: "PREVENT", s: "Product", d: "Intent-Lock, courier chat, doorstep QR · plus ₱410M commission recovered", v: "₱1.171B costs saved", c: "text-cyan" },
    { n: "02", t: "OPTIMIZE", s: "Operations", d: "A&B 24h express for prepaid, GCash rebate", v: "₱423.7M net benefit", c: "text-cyan" },
    { n: "03", t: "PROTECT", s: "Policy", d: "Cooling window, escrow, category guarantee", v: "₱625M policy value", c: "text-cyan" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#0d2a30] via-[#0c0d10] to-[#0c0d10] pt-[56px]">
      <Brand />
      <div className="space-y-3 px-4 pt-5">
        <div className="text-center text-[12px] font-medium text-white/65">One Spatial · TikTok Global E-Commerce</div>
        {cards.map((c) => (
          <div key={c.n} className="rounded-2xl border border-white/10 bg-[#101216] p-3.5">
            <div className="flex items-baseline justify-between">
              <div className={`text-[13px] font-extrabold ${c.c}`}>
                {c.n} {c.t} <span className="font-medium text-white/60">({c.s})</span>
              </div>
              <div className="text-[13px] font-extrabold text-ok">{c.v}</div>
            </div>
            <div className="mt-1 text-[12px] text-white/65">{c.d}</div>
          </div>
        ))}
        {total && (
          <div className="pop-in rounded-2xl border border-ok/50 bg-ok/10 p-4 text-center">
            <div className="text-[12px] font-semibold text-white/70">Total deck claim</div>
            <div className="text-[30px] font-extrabold tracking-tight tabular-nums text-ok">₱1.45B / month</div>
            <div className="text-[12px] text-white/60">Not the sum of the three levers · pilot cap ~₱1M</div>
          </div>
        )}
      </div>
      <TabBar active="relay" />
    </div>
  );
}
