// One-off generator for src/data/vismin.json: the Visayas–Mindanao provinces, simplified.
// Source: Natural Earth 1:10m admin-1 (public domain). Needs the network unless you pass a local copy.
// Run: node scripts/build-region.mjs [path/to/ne_10m_admin_1_states_provinces.geojson]
import { readFileSync, writeFileSync } from "node:fs";

const URL_NE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

// Island-group regions. MIMAROPA and Bicol belong to the Luzon group, so they stay out.
const REGIONS = [
  "Western Visayas",
  "Central Visayas",
  "Eastern Visayas",
  "Zamboanga Peninsula",
  "Northern Mindanao",
  "Dinagat Islands",
  "Davao (Region XI)",
  "SOCCSKSARGEN",
  "Autonomous Region in Muslim Mindanao",
];

const TOLERANCE = 0.02; // degrees, about 2 km: invisible at the national zoom
const MIN_RING = 0.06; // drop rings whose bounding box is smaller than this (islets)

const r3 = (n) => Math.round(n * 1e3) / 1e3;

// Douglas-Peucker, iterative so long coastlines do not blow the stack.
function simplify(pts, tol) {
  if (pts.length < 5) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0;
    let idx = -1;
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy || 1e-12;
    for (let i = a + 1; i < b; i++) {
      const t = Math.max(0, Math.min(1, ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / len));
      const d = Math.hypot(pts[i][0] - (ax + t * dx), pts[i][1] - (ay + t * dy));
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function ring(r) {
  const xs = r.map((p) => p[0]);
  const ys = r.map((p) => p[1]);
  const size = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  if (size < MIN_RING) return null;
  const s = simplify(r, TOLERANCE);
  return s.length >= 4 ? s.map(([x, y]) => [r3(x), r3(y)]) : null;
}

const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : await (await fetch(URL_NE)).text();
const ne = JSON.parse(raw);

const polygons = [];
for (const f of ne.features) {
  if (f.properties.admin !== "Philippines") continue;
  if (!REGIONS.some((r) => (f.properties.region ?? "").startsWith(r))) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    const rings = poly.map(ring).filter(Boolean);
    if (rings.length && poly[0] && ring(poly[0])) polygons.push(rings);
  }
}

const out = { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polygons } };
writeFileSync(new URL("../src/data/vismin.json", import.meta.url), JSON.stringify(out));
const pts = polygons.flat(2).length;
console.log(`${polygons.length} polygons, ${pts} points`);
