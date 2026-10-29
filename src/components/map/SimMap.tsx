"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import MapGL, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { CITIES, CORRIDOR_BOUNDS, NATIONAL_BOUNDS, PINS, ROUTES, VISMIN, lineFeature, pointAt, sliceRoute, type CityDef } from "@/sim/geo";
import { useSim, useStep } from "@/sim/store";
import type { Actor, CameraId, Tone } from "@/sim/types";

// maplibre-gl v6 ships its worker as a separate file; Turbopack needs it pointed out explicitly.
maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const TONE: Record<Tone, string> = {
  xyz: "#fe2c55",
  ab: "#25f4ee",
  rider: "#ffd24a",
  fail: "#fe2c55",
  ok: "#58e088",
};

// Space the overlay cards occupy on the map, so the camera centres on what is left.
const PAD = { top: 80, bottom: 210, left: 30, right: 340 };
// Steps that show the remorse-cliff stage give the top of the map to it and frame the Luzon-to-Cebu corridor below.
const CLIFF_PAD = { top: 262, bottom: 200, left: 30, right: 340 };

const CAMS: Record<Exclude<CameraId, "national">, { center: [number, number]; zoom: number; pitch: number; bearing: number }> = {
  cebu: { center: [123.918, 10.34], zoom: 12.4, pitch: 0, bearing: 0 },
  street: { center: [123.918, 10.34], zoom: 13.5, pitch: 40, bearing: -12 },
  dorm: { center: [123.9137, 10.3535], zoom: 15.9, pitch: 52, bearing: -18 },
};

const BASE = {
  "xyz-main": lineFeature(ROUTES["xyz-main"].pts),
  "ab-main": lineFeature(ROUTES["ab-main"].pts),
  "last-mile": lineFeature(ROUTES["last-mile"].pts),
};

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const EMOJI: Record<Actor["kind"], string> = { truck: "🚚", plane: "✈️", rider: "🛵" };

function ActorLayer({ actor, idx }: { actor: Actor; idx: number }) {
  const [t, setT] = useState(actor.from);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / actor.ms);
      setT(actor.from + (actor.to - actor.from) * ease(k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [actor]);

  const trail = useMemo(() => lineFeature(sliceRoute(actor.route, actor.from, t)), [actor.route, actor.from, t]);
  const [lng, lat] = pointAt(actor.route, t);
  const color = TONE[actor.tone];
  return (
    <>
      <Source id={`trail-${idx}`} type="geojson" data={trail}>
        <Layer id={`trail-${idx}-glow`} type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": color, "line-width": 10, "line-opacity": 0.22, "line-blur": 5 }} />
        <Layer id={`trail-${idx}-line`} type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": color, "line-width": 3.5 }} />
      </Source>
      <Marker longitude={lng} latitude={lat} anchor="center">
        <div className="grid h-9 w-9 place-items-center rounded-full border-2 bg-black/85 text-[18px] shadow-lg" style={{ borderColor: color, boxShadow: `0 0 18px ${color}88` }}>
          {actor.tone === "ok" ? "✅" : EMOJI[actor.kind]}
        </div>
      </Marker>
    </>
  );
}

function PinMarker({ id, compact }: { id: keyof typeof PINS; compact: boolean }) {
  const p = PINS[id];
  const ring = p.tone === "cyan" ? "#25f4ee" : p.tone === "red" ? "#fe2c55" : p.tone === "ok" ? "#58e088" : "#ffffff";
  return (
    <Marker longitude={p.at[0]} latitude={p.at[1]} anchor="bottom">
      <div className="pop-in flex flex-col items-center">
        {!(compact && p.iconOnly) && (
          <div className="whitespace-nowrap rounded-lg border bg-black/85 px-2 py-1 text-center shadow-lg" style={{ borderColor: `${ring}66` }}>
            <div className="text-label font-bold leading-tight">{p.label}</div>
            {!compact && p.sub && <div className="text-label leading-tight text-white/70">{p.sub}</div>}
          </div>
        )}
        <div className="relative mt-1 grid h-8 w-8 place-items-center rounded-full border-2 bg-black/85 text-[15px]" style={{ borderColor: ring }}>
          {p.icon}
        </div>
      </div>
    </Marker>
  );
}

function CityMarker({ city, resolved }: { city: CityDef; resolved: boolean }) {
  const vis = city.region === "vismin";
  const color = resolved ? TONE.ok : vis ? "#fe2c55" : "#25f4ee";
  return (
    <Marker longitude={city.at[0]} latitude={city.at[1]} anchor="center">
      <div className="pop-in relative">
        <span className="pin-pulse absolute -inset-3 rounded-full" style={{ background: `${color}55` }} />
        <span className="absolute -inset-1 rounded-full" style={{ background: `${color}33` }} />
        <span className="relative block h-3 w-3 rounded-full border-2 border-white" style={{ background: color }} />
        <div
          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border bg-black/85 px-2 py-1 ${city.side === "left" ? "right-5 text-right" : "left-5"}`}
          style={{ borderColor: `${color}66` }}
        >
          <div className="text-label font-bold leading-tight">{city.name}</div>
          {!resolved && (
            <div className="text-label font-semibold leading-tight tabular-nums" style={{ color }}>
              {city.sla} · {city.fail}
            </div>
          )}
        </div>
      </div>
    </Marker>
  );
}

export function SimMap() {
  const { step } = useStep();
  const entry = useSim((s) => s.entry);
  const mapRef = useRef<MapRef>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const cam = step.map.camera;

  const cliff = !!step.cliff;
  const viewRef = useRef({ cam, cliff });
  useEffect(() => {
    viewRef.current = { cam, cliff };
  }, [cam, cliff]);

  const applyCamera = (duration: number) => {
    const map = mapRef.current;
    if (!map) return;
    const { cam: c, cliff: staged } = viewRef.current;
    const padding = staged ? CLIFF_PAD : PAD;
    if (c === "national") map.fitBounds(staged ? CORRIDOR_BOUNDS : NATIONAL_BOUNDS, { padding, pitch: 0, bearing: 0, duration, essential: true });
    else map.flyTo({ ...CAMS[c], padding, duration, essential: true });
  };

  // Keep the GL canvas in step with its panel (the dynamic import can finish before layout settles),
  // then re-frame the current camera instantly so the view never reflects a stale size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      mapRef.current?.resize();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => applyCamera(0), 120);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    mapRef.current?.resize();
    applyCamera(ready && entry > 0 ? 1700 : 0);
  }, [cam, cliff, ready, entry]);

  const m = step.map;
  const compact = cam === "national";
  return (
    <div ref={wrapRef} className="absolute inset-0">
    <MapGL
      ref={mapRef}
      mapLib={maplibregl}
      mapStyle={STYLE}
      initialViewState={{ bounds: NATIONAL_BOUNDS, fitBoundsOptions: { padding: PAD } }}
      style={{ width: "100%", height: "100%" }}
      onLoad={(e) => {
        // Our own city markers carry the story; hide the basemap's competing city/country labels.
        const map = e.target;
        for (const l of map.getStyle().layers) {
          if (l.type === "symbol" && /^place_(city|state|country|continent|capital)/.test(l.id)) map.setLayoutProperty(l.id, "visibility", "none");
        }
        setReady(true);
      }}
      dragRotate={false}
      attributionControl={{ compact: true }}
      maxPitch={60}
    >
      {/* Always mounted so the tint cross-fades between loss, gain and off instead of popping */}
      <Source id="vismin" type="geojson" data={VISMIN}>
        <Layer
          id="vismin-fill"
          type="fill"
          paint={{
            "fill-color": m.region === "gain" ? TONE.ok : TONE.fail,
            "fill-opacity": m.region === "gain" ? 0.16 : m.region === "loss" ? 0.2 : 0,
            "fill-color-transition": { duration: 900 },
            "fill-opacity-transition": { duration: 900 },
          }}
        />
      </Source>
      {m.routes?.map((r) => (
        <Source key={`base-${r.id}`} id={`base-${r.id}`} type="geojson" data={BASE[r.id]}>
          <Layer
            id={`base-${r.id}-line`}
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{ "line-color": TONE[r.tone], "line-width": 2.5, "line-opacity": 0.5, "line-dasharray": [1.5, 2] }}
          />
        </Source>
      ))}
      {m.actors?.map((a, i) => (
        <ActorLayer key={`${entry}-${i}`} actor={a} idx={i} />
      ))}
      {m.pins?.map((id) => <PinMarker key={id} id={id} compact={compact} />)}
      {m.cities && CITIES.map((c) => <CityMarker key={c.name} city={c} resolved={m.region === "gain"} />)}
      {m.failPulse && (
        <Marker longitude={PINS.dorm.at[0]} latitude={PINS.dorm.at[1]} anchor="center">
          <span className="pin-pulse block h-20 w-20 rounded-full border-2 border-red bg-red/30" />
        </Marker>
      )}
      {m.winPulse && (
        <Marker longitude={PINS.dorm.at[0]} latitude={PINS.dorm.at[1]} anchor="center">
          <span className="pin-pulse block h-20 w-20 rounded-full border-2 border-ok bg-ok/30" />
        </Marker>
      )}
    </MapGL>
    </div>
  );
}
