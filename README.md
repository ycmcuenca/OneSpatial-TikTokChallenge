# TikTok Relay Simulator

Interactive simulator for the One Spatial pitch (ByteDance Business Challenge, TikTok Global E-Commerce).
It follows "Eager Earl", a student in Cebu City, through a COD order and shows how **Prevent**, **Optimize**
and **Protect** change the outcome.

- **Desktop (≥1024px):** left third is the TikTok app in a phone body; right two thirds is a live map with
  the caption, simulated clock, rider app, and impact cards.
- **Mobile:** the app only, full-screen, with a collapsible floating control pill.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Next.js 16 · TypeScript · Tailwind v4 · Zustand · MapLibre GL (react-map-gl) · CARTO Dark Matter basemap (no API key).
The map needs internet for tiles; everything else works offline.

## Using it

Tap the highlighted (pulsing) control on the phone, or use **Next**. Some taps are free choices that branch the
story (delivery window, instructions, COD vs GCash, keep vs cancel in the cooling window, size exchange).

| Key | Action |
| --- | --- |
| `←` / `→` | Previous / next step |
| `Space` | Autoplay |
| `1`–`6` | Jump to chapter (Intro, Baseline, Prevent, Optimize, Protect, Impact) |
| `R` / `M` / `Esc` | Restart / mute / close dialog |

Deep links: `/?ch=prevent&step=confirm` (chapter id plus step id, or a 1-based step number).
Sound is muted by default.

## Where things live

| Path | What |
| --- | --- |
| `src/sim/chapters.ts` | The whole story as data: phone screen, map state, clock, caption, impact card per step |
| `src/sim/store.ts` | Zustand state machine (steps, branching via `when`, choices, unlocked levers) |
| `src/sim/geo.ts`, `src/data/routes.json` | Pre-baked routes, pins, camera bounds |
| `scripts/build-routes.mjs` | One-off generator for `routes.json` (OSRM road legs plus hand-drawn sea/air legs) |
| `src/components/phone/` | Phone frame and app screens |
| `src/components/map/SimMap.tsx` | MapLibre map, actors, pins |
| `src/components/shell/` | Top bar, caption, HUD, rider card, mobile controls, About |

## Content notes

- Figures are shown as each slide states them. The three lever values are **not** summed in the app; the
  ₱1.45B figure is labelled "Total deck claim", as on slide 5.
- Names, the dorm address, rider ("Kuya Jun"), and order IDs are fictional. A&B Express and XYZ Express come from the deck.
- The sea lane is a stylised path, not a real shipping route.
