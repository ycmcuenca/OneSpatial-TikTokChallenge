import routesJson from "@/data/routes.json";
import type { PinId, RouteId } from "./types";

export type LngLat = [number, number];

interface Prepared {
  pts: LngLat[];
  cum: number[];
  total: number;
}

// Planar distance with longitude shrunk by latitude; good enough for animation pacing.
const dist = (a: LngLat, b: LngLat) => {
  const k = Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180);
  return Math.hypot((b[0] - a[0]) * k, b[1] - a[1]);
};

const prepare = (pts: LngLat[]): Prepared => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  return { pts, cum, total: cum[cum.length - 1] };
};

const raw = routesJson as unknown as Record<RouteId, LngLat[]>;

export const ROUTES: Record<RouteId, Prepared> = {
  "xyz-main": prepare(raw["xyz-main"]),
  "ab-main": prepare(raw["ab-main"]),
  "last-mile": prepare(raw["last-mile"]),
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Index of the last vertex at or before distance `d` */
const seek = (r: Prepared, d: number) => {
  let lo = 0;
  let hi = r.cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (r.cum[mid] <= d) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

export const pointAt = (id: RouteId, t: number): LngLat => {
  const r = ROUTES[id];
  const d = clamp01(t) * r.total;
  const i = Math.min(seek(r, d), r.pts.length - 2);
  const seg = r.cum[i + 1] - r.cum[i] || 1;
  const f = (d - r.cum[i]) / seg;
  const [a, b] = [r.pts[i], r.pts[i + 1]];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
};

/** Polyline between two progress values (order independent) */
export const sliceRoute = (id: RouteId, t0: number, t1: number): LngLat[] => {
  const [lo, hi] = t0 <= t1 ? [clamp01(t0), clamp01(t1)] : [clamp01(t1), clamp01(t0)];
  const r = ROUTES[id];
  const dLo = lo * r.total;
  const dHi = hi * r.total;
  const out: LngLat[] = [pointAt(id, lo)];
  for (let i = seek(r, dLo) + 1; i < r.pts.length && r.cum[i] < dHi; i++) out.push(r.pts[i]);
  out.push(pointAt(id, hi));
  return out;
};

export const lineFeature = (coords: LngLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: coords },
});

export interface PinDef {
  at: LngLat;
  label: string;
  sub?: string;
  icon: string;
  tone: "cyan" | "red" | "white" | "ok";
  /** National view: the icon alone, so neighbouring pins do not collide */
  iconOnly?: boolean;
}

const meta = routesJson.meta as { DORM: LngLat; lastMileEnd: LngLat; CEBU_HUB: LngLat; MANILA_HUB: LngLat; NAIA: LngLat; MACTAN: LngLat; BATANGAS: LngLat };

export const DORM_AT = meta.lastMileEnd;

export const PINS: Record<PinId, PinDef> = {
  "manila-hub": { at: meta.MANILA_HUB, label: "XYZ hub · Pasig", sub: "Metro Manila", icon: "🏭", tone: "white" },
  batangas: { at: meta.BATANGAS, label: "Batangas Port", icon: "⚓", tone: "white", iconOnly: true },
  naia: { at: meta.NAIA, label: "A&B hub · NAIA", icon: "✈️", tone: "cyan" },
  mactan: { at: meta.MACTAN, label: "Mactan Airport", icon: "🛬", tone: "cyan" },
  "cebu-hub": { at: meta.CEBU_HUB, label: "Cebu hub · Mandaue", icon: "📦", tone: "white" },
  dorm: { at: DORM_AT, label: "Earl's dorm", sub: "Casa Verde, Talamban", icon: "🏠", tone: "cyan" },
  class: { at: [123.9119, 10.3531], label: "Earl in class", sub: "USC Talamban", icon: "🎓", tone: "red" },
};

export interface CityDef {
  name: string;
  at: LngLat;
  region: "luzon" | "vismin";
  sla: string;
  fail: string;
  side: "left" | "right";
}

export const CITIES: CityDef[] = [
  { name: "Metro Manila", at: [121.0, 14.6], region: "luzon", sla: "1–3 days", fail: "~20% fail", side: "right" },
  { name: "Iloilo", at: [122.56, 10.72], region: "vismin", sla: "4–7 days", fail: "33% fail", side: "left" },
  { name: "Cebu", at: [123.89, 10.31], region: "vismin", sla: "4–7 days", fail: "33% fail", side: "right" },
  { name: "Cagayan de Oro", at: [124.65, 8.48], region: "vismin", sla: "4–7 days", fail: "33% fail", side: "right" },
  { name: "Davao", at: [125.6, 7.07], region: "vismin", sla: "4–7 days", fail: "33% fail", side: "right" },
];

export const NATIONAL_BOUNDS: [[number, number], [number, number]] = [
  [118.8, 6.2],
  [127.2, 15.4],
];
