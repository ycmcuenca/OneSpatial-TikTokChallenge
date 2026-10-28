// One-off generator for the pre-baked route geometry in src/data/routes.json.
// Road legs come from the public OSRM demo server; sea and air legs are hand-authored.
// Run: node scripts/build-routes.mjs   (needs network; the app itself never calls OSRM)
import { writeFileSync, mkdirSync } from "node:fs";

const r5 = (n) => Math.round(n * 1e5) / 1e5;

async function road(coords) {
  const q = coords.map((c) => c.join(",")).join(";");
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${q}?overview=full&geometries=geojson`,
  );
  const json = await res.json();
  if (json.code !== "Ok") throw new Error(`OSRM failed for ${q}: ${json.code}`);
  return json.routes[0].geometry.coordinates;
}

// Keep roughly every n-th vertex (always the last) to shrink long legs.
function thin(line, n) {
  return line.filter((_, i) => i % n === 0 || i === line.length - 1);
}

// Chaikin corner cutting for a gentle sea-lane curve.
function chaikin(line, rounds = 3) {
  let pts = line;
  for (let k = 0; k < rounds; k++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      out.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

// Quadratic arc, bulging north-east, for the A&B priority air leg.
function arc(a, b, steps = 48, bulge = 0.18) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const c = [mx - dy * bulge, my + dx * bulge];
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ]);
  }
  return out;
}

const MANILA_HUB = [121.0851, 14.5764]; // XYZ sortation hub, Pasig
const BATANGAS = [121.0449, 13.7547];
const NAIA = [121.0194, 14.5086];
const MACTAN = [123.9794, 10.3075];
const CEBU_HUB = [123.9223, 10.3236]; // Mandaue
const DORM = [123.9138, 10.3556]; // near USC Talamban

const sea = chaikin([
  BATANGAS,
  [121.03, 13.68],
  [121.12, 13.57],
  [121.3, 13.47],
  [121.55, 13.28],
  [121.85, 13.05],
  [122.2, 12.9],
  [122.55, 12.6],
  [122.85, 12.1],
  [123.15, 11.75],
  [123.5, 11.5],
  [123.85, 11.4],
  [124.15, 11.2],
  [124.15, 10.6],
  [124.05, 10.42],
  [123.97, 10.36],
  [123.94, 10.34],
]);

const manilaBatangas = thin(await road([MANILA_HUB, BATANGAS]), 4);
const airportHub = thin(await road([MACTAN, CEBU_HUB]), 2);
const lastMile = await road([CEBU_HUB, DORM]);

const routes = {
  // XYZ Express economy: Pasig hub -> Batangas Port by road, then sea to Cebu.
  "xyz-main": [...manilaBatangas, ...sea.slice(1), CEBU_HUB],
  // A&B Express priority: NAIA -> Mactan by air, then road to the Cebu hub.
  "ab-main": [NAIA, ...arc(NAIA, MACTAN).slice(1), ...airportHub.slice(1)],
  "last-mile": lastMile,
};

const out = Object.fromEntries(
  Object.entries(routes).map(([k, v]) => [k, v.map(([x, y]) => [r5(x), r5(y)])]),
);
out.meta = { MANILA_HUB, BATANGAS, NAIA, MACTAN, CEBU_HUB, DORM, lastMileEnd: lastMile.at(-1) };

mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/data/routes.json", import.meta.url), JSON.stringify(out));
console.log(Object.entries(routes).map(([k, v]) => `${k}: ${v.length} pts`).join("\n"));
console.log("last-mile end (snapped dorm):", lastMile.at(-1));
