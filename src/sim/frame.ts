import { CITIES, PINS, ROUTES, type LngLat } from "./geo";
import type { CameraId, MapState } from "./types";

/** Pixel rectangle in the map panel's own coordinates */
export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A map feature that must stay on screen and clear of the overlay cards: a point plus the pixels its marker or label spans (left, top, right, bottom). */
interface Anchor {
  at: LngLat;
  pad: [number, number, number, number];
}

export interface Frame {
  center: LngLat;
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * What each named camera means: the viewing angle, how far in or out it may go, and how much
 * zoom a tilted view gives back (tilt compresses what is far from the centre).
 */
const LENS: Record<CameraId, { pitch: number; bearing: number; minZoom: number; maxZoom: number; tilt: number }> = {
  national: { pitch: 0, bearing: 0, minZoom: 3, maxZoom: 9, tilt: 0 },
  cebu: { pitch: 0, bearing: 0, minZoom: 9, maxZoom: 14.6, tilt: 0 },
  street: { pitch: 40, bearing: -12, minZoom: 11, maxZoom: 15.2, tilt: 0.3 },
  dorm: { pitch: 52, bearing: -18, minZoom: 12, maxZoom: 16.2, tilt: 0.55 },
};

/** Outline of the Visayas–Mindanao region, so the red/green tint is framed as a whole rather than clipped by a card. */
const VISMIN_OUTLINE: LngLat[] = [
  [121.95, 6.95],
  [122.1, 10.95],
  [122.6, 11.9],
  [124.2, 12.6],
  [125.6, 12.6],
  [126.4, 10.0],
  [126.55, 7.4],
  [125.5, 5.9],
  [124.0, 6.4],
];

const merc = ([lng, lat]: LngLat) => ({
  x: (lng + 180) / 360,
  y: 0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI),
});

const unmerc = (x: number, y: number): LngLat => [x * 360 - 180, ((2 * Math.atan(Math.exp(Math.PI * (1 - 2 * y))) - Math.PI / 2) * 180) / Math.PI];

/** A route as a handful of anchors, enough to keep its whole shape in view */
const routeAnchors = (id: keyof typeof ROUTES, count = 28): Anchor[] => {
  const { pts } = ROUTES[id];
  const stride = Math.max(1, Math.floor(pts.length / count));
  const out: Anchor[] = [];
  for (let i = 0; i < pts.length; i += stride) out.push({ at: pts[i], pad: [10, 10, 10, 10] });
  out.push({ at: pts[pts.length - 1], pad: [10, 10, 10, 10] });
  return out;
};

/** Everything the step puts on the map, as things the camera must keep visible */
export function anchorsFor(m: MapState): Anchor[] {
  const out: Anchor[] = [];
  const compact = m.camera === "national";
  for (const id of m.pins ?? []) {
    const p = PINS[id];
    out.push({ at: p.at, pad: compact ? (p.iconOnly ? [18, 18, 18, 4] : [64, 56, 64, 4]) : [72, 84, 72, 4] });
  }
  const routes = new Set([...(m.routes ?? []).map((r) => r.id), ...(m.actors ?? []).map((a) => a.route)]);
  for (const id of routes) out.push(...routeAnchors(id));
  if (m.cities) {
    for (const c of CITIES) out.push({ at: c.at, pad: c.side === "left" ? [134, 24, 10, 24] : [10, 24, 134, 24] });
  }
  if (m.region || m.cities) for (const at of VISMIN_OUTLINE) out.push({ at, pad: [6, 6, 6, 6] });
  if (m.failPulse || m.winPulse) out.push({ at: PINS.dorm.at, pad: [46, 46, 46, 46] });
  if (!out.length) for (const at of VISMIN_OUTLINE) out.push({ at, pad: [6, 6, 6, 6] });
  return out;
}

const MARGIN = { l: 24, t: 24, r: 24, b: 36 };
const STEP = 10;

/**
 * The largest zoom at which every anchor sits inside the panel and clear of every card, and where
 * to centre the view for it. Searches zoom by bisection; at each zoom the view slides across every
 * position that keeps the anchors in bounds and takes the free one nearest the middle.
 */
export function solveFrame(m: MapState, view: { w: number; h: number }, obstacles: Rect[]): Frame {
  const lens = LENS[m.camera];
  const anchors = anchorsFor(m);
  const pts = anchors.map((a) => ({ ...merc(a.at), pad: a.pad }));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const rad = (lens.bearing * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const { w, h } = view;

  /** Where the anchors' centre lands on screen at this zoom, or null when they cannot all fit */
  const place = (zoom: number) => {
    const ws = 512 * 2 ** zoom;
    const rel = pts.map((p) => {
      const dx = (p.x - cx) * ws;
      const dy = (p.y - cy) * ws;
      return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos, pad: p.pad };
    });
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const r of rel) {
      minX = Math.min(minX, r.x - r.pad[0]);
      maxX = Math.max(maxX, r.x + r.pad[2]);
      minY = Math.min(minY, r.y - r.pad[1]);
      maxY = Math.max(maxY, r.y + r.pad[3]);
    }
    const loX = MARGIN.l - minX;
    const hiX = w - MARGIN.r - maxX;
    const loY = MARGIN.t - minY;
    const hiY = h - MARGIN.b - maxY;
    if (loX > hiX || loY > hiY) return null;

    const clear = (tx: number, ty: number) => {
      for (const r of rel) {
        const x0 = tx + r.x - r.pad[0];
        const x1 = tx + r.x + r.pad[2];
        const y0 = ty + r.y - r.pad[1];
        const y1 = ty + r.y + r.pad[3];
        for (const o of obstacles) if (x0 < o.x1 && x1 > o.x0 && y0 < o.y1 && y1 > o.y0) return false;
      }
      return true;
    };

    let best: { tx: number; ty: number; cost: number } | null = null;
    for (let tx = loX; tx <= hiX + 0.01; tx += STEP) {
      for (let ty = loY; ty <= hiY + 0.01; ty += STEP) {
        const cost = (tx - w / 2) ** 2 + (ty - h / 2) ** 2;
        if (best && cost >= best.cost) continue;
        if (clear(tx, ty)) best = { tx, ty, cost };
      }
    }
    return best;
  };

  const frame = (zoom: number, tx: number, ty: number): Frame => {
    const ws = 512 * 2 ** zoom;
    const vx = w / 2 - tx;
    const vy = h / 2 - ty;
    const center = unmerc(cx + (vx * cos - vy * sin) / ws, cy + (vx * sin + vy * cos) / ws);
    return { center, zoom: zoom - lens.tilt, pitch: lens.pitch, bearing: lens.bearing };
  };

  const top = place(lens.maxZoom);
  if (top) return frame(lens.maxZoom, top.tx, top.ty);
  let lo = lens.minZoom;
  let hi = lens.maxZoom;
  let found = place(lo);
  if (!found) return frame(lo, w / 2, h / 2);
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const at = place(mid);
    if (at) {
      lo = mid;
      found = at;
    } else hi = mid;
  }
  return frame(lo, found.tx, found.ty);
}

/** True when two frames differ too little to be worth flying between (keeps neighbouring steps from jittering) */
export function sameFrame(a: Frame, b: Frame): boolean {
  if (a.pitch !== b.pitch || a.bearing !== b.bearing || Math.abs(a.zoom - b.zoom) > 0.12) return false;
  const [pa, pb] = [merc(a.center), merc(b.center)];
  const ws = 512 * 2 ** a.zoom;
  return Math.hypot((pa.x - pb.x) * ws, (pa.y - pb.y) * ws) < 24;
}
