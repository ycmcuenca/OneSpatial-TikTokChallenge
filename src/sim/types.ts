export type ChapterId = "intro" | "baseline" | "prevent" | "optimize" | "protect" | "impact";
export type Lever = "prevent" | "optimize" | "protect";
export type Tag = "intro" | "baseline" | Lever | "impact";

export interface Choices {
  /** Optimize: payment picked at checkout */
  payment: "cod" | "gcash";
  /** Prevent: delivery window locked by Earl */
  window: "9-11" | "12-2" | "3-5";
  /** Prevent: structured instruction ids sent to the rider */
  instr: string[];
  /** Prevent: how Earl settles at the door */
  pay: "gcash" | "cash";
  /** Protect: payment on the livestream order */
  livePay: "cod" | "prepaid";
  /** Protect: what Earl does in the cooling window */
  cool: "keep" | "cancel";
  /** Protect: outcome of inspection on prepaid orders */
  inspect: "release" | "exchange";
}

export type ScreenId =
  | "feed"
  | "live"
  | "product"
  | "checkout"
  | "orders"
  | "relay"
  | "chat"
  | "recap";

export type OverlayId = "notif" | "missed-call" | "qr" | "cooling" | "escrow" | "otp" | "cancelled";

export interface PhoneState {
  screen: ScreenId;
  overlay?: OverlayId;
  /** Per-screen variant key */
  mode?: string;
}

export type RouteId = "xyz-main" | "ab-main" | "last-mile";
export type Tone = "xyz" | "ab" | "rider" | "fail" | "ok";
export type CameraId = "national" | "cebu" | "street" | "dorm";
export type PinId = "manila-hub" | "batangas" | "naia" | "mactan" | "cebu-hub" | "dorm" | "class";
export type RiderCardMode = "planned" | "instructions" | "enroute" | "qr" | "cash" | "otp" | "failed" | "done";

export interface Actor {
  route: RouteId;
  /** Progress along the route, 0..1. `from > to` plays it in reverse. */
  from: number;
  to: number;
  ms: number;
  kind: "truck" | "plane" | "rider";
  tone: Tone;
}

export interface MapState {
  camera: CameraId;
  /** Faint full-length route lines */
  routes?: { id: RouteId; tone: Tone }[];
  actors?: Actor[];
  pins?: PinId[];
  /** Regional city bubbles with SLA and failure rates */
  cities?: boolean;
  riderCard?: RiderCardMode;
  failPulse?: boolean;
  /** Success pulse on Earl's dorm */
  winPulse?: boolean;
  /** Visayas–Mindanao tint: red while the leak is the story, green once Relay has resolved it */
  region?: "loss" | "gain";
}

export interface Clock {
  day: number;
  time: string;
}

export interface HudRow {
  label: string;
  value: string;
  tone?: "red" | "cyan" | "ok" | "muted";
}

export interface HudCard {
  eyebrow: string;
  value?: string;
  valueTone?: "red" | "cyan" | "ok";
  title?: string;
  rows?: HudRow[];
  note?: string;
}

export type Sfx = "pop" | "tick" | "impact" | "count";

export interface Step {
  id: string;
  tag: Tag;
  title: string;
  caption: string;
  clock: Clock;
  /** If set, the day counter runs from `clock` to this while the map actors move */
  clockTo?: Clock;
  /** Prevent chapter: take the clock from the delivery window Earl chose */
  windowClock?: "enroute" | "arrive" | "done";
  phone: PhoneState;
  map: MapState;
  /** Tap id(s) on the phone that advance the story; the first one is hinted */
  advanceOn?: string[];
  /** Free taps that just change a choice and do not advance */
  taps?: Record<string, Partial<Choices>>;
  hud?: HudCard;
  /** Show the 4-day remorse-cliff gauge */
  cliff?: boolean;
  unlock?: Lever;
  sfx?: Sfx;
  /** Milliseconds autoplay waits on this step */
  dwell?: number;
  when?: (c: Choices) => boolean;
  /** Short nudge shown under the caption when a phone tap is expected */
  hint?: string;
}

export interface Chapter {
  id: ChapterId;
  tag: Tag;
  label: string;
  short: string;
  steps: Step[];
}
