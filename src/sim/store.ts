"use client";

import { create } from "zustand";
import { CHAPTERS, DEFAULT_CHOICES, chapterById, isVisible } from "./chapters";
import { play } from "./sound";
import type { ChapterId, Choices, Lever, Step } from "./types";

interface SimState {
  chapterId: ChapterId;
  stepIdx: number;
  choices: Choices;
  unlocked: Record<Lever, boolean>;
  autoplay: boolean;
  muted: boolean;
  aboutOpen: boolean;
  /** Bumps on every step entry so animations restart, even when re-entering the same step */
  entry: number;
  /** Set when a tap hits a control the story doesn't expect */
  nudge: number;

  goTo: (chapterId: ChapterId, stepRef?: string | number) => void;
  next: () => void;
  back: () => void;
  tap: (id: string) => void;
  restart: () => void;
  toggleAutoplay: () => void;
  setAutoplay: (on: boolean) => void;
  toggleMuted: () => void;
  setAbout: (open: boolean) => void;
}

const NONE: Record<Lever, boolean> = { prevent: false, optimize: false, protect: false };

const stepAt = (chapterId: ChapterId, idx: number): Step => chapterById(chapterId).steps[idx];

/** Apply the side effects of arriving on a step */
const arrive = (s: SimState, chapterId: ChapterId, idx: number): Partial<SimState> => {
  const step = stepAt(chapterId, idx);
  let unlocked = s.unlocked;
  if (step.unlock) unlocked = { ...unlocked, [step.unlock]: true };
  if (chapterId === "impact") unlocked = { prevent: true, optimize: true, protect: true };
  if (step.sfx) play(step.sfx, s.muted);
  return { chapterId, stepIdx: idx, unlocked, entry: s.entry + 1 };
};

const firstVisible = (chapterId: ChapterId, choices: Choices) =>
  Math.max(0, chapterById(chapterId).steps.findIndex((st) => isVisible(st, choices)));

export const useSim = create<SimState>((set, get) => ({
  chapterId: "intro",
  stepIdx: 0,
  choices: DEFAULT_CHOICES,
  unlocked: NONE,
  autoplay: false,
  muted: true,
  aboutOpen: false,
  entry: 0,
  nudge: 0,

  goTo: (chapterId, stepRef) =>
    set((s) => {
      const chapter = chapterById(chapterId);
      const choices = chapterId === s.chapterId ? s.choices : DEFAULT_CHOICES;
      let idx = firstVisible(chapterId, choices);
      if (typeof stepRef === "string") {
        const byId = chapter.steps.findIndex((st) => st.id === stepRef);
        if (byId >= 0) idx = byId;
        else if (/^\d+$/.test(stepRef)) idx = Math.min(chapter.steps.length - 1, Math.max(0, Number(stepRef) - 1));
      } else if (typeof stepRef === "number") {
        idx = Math.min(chapter.steps.length - 1, Math.max(0, stepRef));
      }
      return { choices, ...arrive(s, chapterId, idx) };
    }),

  next: () => {
    const s = get();
    const chapter = chapterById(s.chapterId);
    for (let i = s.stepIdx + 1; i < chapter.steps.length; i++) {
      if (isVisible(chapter.steps[i], s.choices)) {
        set((st) => arrive(st, s.chapterId, i));
        return;
      }
    }
    const ci = CHAPTERS.findIndex((c) => c.id === s.chapterId);
    const nextChapter = CHAPTERS[ci + 1];
    if (nextChapter) {
      set((st) => ({ choices: DEFAULT_CHOICES, ...arrive(st, nextChapter.id, firstVisible(nextChapter.id, DEFAULT_CHOICES)) }));
    } else {
      set({ autoplay: false });
    }
  },

  back: () => {
    const s = get();
    const chapter = chapterById(s.chapterId);
    for (let i = s.stepIdx - 1; i >= 0; i--) {
      if (isVisible(chapter.steps[i], s.choices)) {
        set((st) => arrive(st, s.chapterId, i));
        return;
      }
    }
    const ci = CHAPTERS.findIndex((c) => c.id === s.chapterId);
    const prev = CHAPTERS[ci - 1];
    if (prev) {
      for (let i = prev.steps.length - 1; i >= 0; i--) {
        if (isVisible(prev.steps[i], s.choices)) {
          set((st) => arrive(st, prev.id, i));
          return;
        }
      }
    }
  },

  tap: (id) => {
    const s = get();
    const step = stepAt(s.chapterId, s.stepIdx);
    let handled = false;
    // Instruction chips toggle; everything else is a plain choice from the step's tap table
    if (id.startsWith("ins:")) {
      const key = id.slice(4);
      const has = s.choices.instr.includes(key);
      set({ choices: { ...s.choices, instr: has ? s.choices.instr.filter((k) => k !== key) : [...s.choices.instr, key] } });
      handled = true;
    } else if (step.taps?.[id]) {
      set({ choices: { ...s.choices, ...step.taps[id] } });
      handled = true;
    }
    if (step.advanceOn?.includes(id)) {
      play("tick", s.muted);
      get().next();
      return;
    }
    if (handled) play("tick", s.muted);
    else set({ nudge: s.nudge + 1 });
  },

  restart: () => set((s) => ({ choices: DEFAULT_CHOICES, unlocked: NONE, autoplay: false, ...arrive({ ...s, unlocked: NONE }, "intro", 0) })),
  toggleAutoplay: () => set((s) => ({ autoplay: !s.autoplay })),
  setAutoplay: (autoplay) => set({ autoplay }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setAbout: (aboutOpen) => set({ aboutOpen }),
}));

export const useStep = () => {
  const chapterId = useSim((s) => s.chapterId);
  const stepIdx = useSim((s) => s.stepIdx);
  const choices = useSim((s) => s.choices);
  const chapter = chapterById(chapterId);
  const step = chapter.steps[stepIdx];
  const visible = chapter.steps.filter((st) => isVisible(st, choices));
  const position = Math.max(0, visible.findIndex((st) => st.id === step.id)) + 1;
  return { chapter, step, position, total: visible.length };
};
