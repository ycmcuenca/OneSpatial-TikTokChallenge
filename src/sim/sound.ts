import type { Sfx } from "./types";

const cache: Partial<Record<Sfx, HTMLAudioElement>> = {};

export const play = (name: Sfx, muted: boolean) => {
  if (muted || typeof window === "undefined") return;
  try {
    const base = (cache[name] ??= new Audio(`/sfx/${name}.wav`));
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = name === "impact" ? 0.35 : 0.5;
    void a.play().catch(() => {});
  } catch {
    /* autoplay policy or missing audio: ignore */
  }
};
