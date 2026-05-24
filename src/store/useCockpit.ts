import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Closure, QualityId, Strategy, StrategyVersion } from '../domain/types';
import type { CapturedStory } from '../domain/sensors';
import { removeCapturedFrom, updateCapturedIn, type CapturedEdit } from '../mirrors/capturedTriads';
import { emptyStrategy } from '../domain/qualities';
import { SAMPLE_STRATEGY } from '../data/sample';
import type { ScenarioId } from '../data/scenarios';

// Which screen the cockpit is showing.
export type CockpitMode = 'cockpit' | 'author' | 'signify';
// Colour scheme (data-theme on <html>); 'colorsafe' is colour-blind-safe.
export type ThemeId = 'obsidian' | 'slate' | 'colorsafe';
// Which instrument is expanded into a detail overlay (null = none).
export type DetailView =
  | 'mandate'
  | 'triads'
  | 'flow'
  | 'quant'
  | 'system'
  | 'weak'
  | 'radar'
  | 'striads'
  | 'loop'
  | 'outcomes'
  | 'reliability'
  | 'hygiene'
  | 'challenges'
  | null;

// All cockpit state the user can change, plus localStorage persistence.
interface CockpitState {
  draft: Strategy; // working copy being authored
  versions: StrategyVersion[]; // immutable saved snapshots, oldest first
  closures: Record<string, Closure>; // loop edge id -> closure (default open)
  activeQuality: QualityId | null; // section currently focused (for Mirror "one click")
  selectedTeam: string | null; // Mandate team currently drilled into
  mode: CockpitMode; // cockpit instrument cluster vs author editor
  detail: DetailView; // instrument expanded into an overlay
  systemModelIndex: number; // which of the seed CLDs is selected
  seeded: boolean; // has first-visit seeding happened (so we never re-seed)
  scenario: ScenarioId; // demo scenario driving loop-closure / challenge / hygiene
  capturedStories: CapturedStory[]; // stories signified by survey takers (/signify)
  theme: ThemeId; // colour scheme

  updateSection: <K extends keyof Strategy>(k: K, patch: Partial<Strategy[K]>) => void;
  setDraft: (s: Strategy) => void;
  loadSample: () => void;
  saveVersion: () => void;
  setClosure: (edgeId: string, c: Closure) => void;
  focusQuality: (q: QualityId | null) => void;
  selectTeam: (id: string | null) => void;
  setMode: (m: CockpitMode) => void;
  setDetail: (d: DetailView) => void;
  setSystemModelIndex: (i: number) => void;
  setScenario: (s: ScenarioId) => void; // switch the demo scenario
  captureStory: (s: Omit<CapturedStory, 'id' | 'at'>) => void; // a survey taker signifies a story
  updateCaptured: (id: string, patch: CapturedEdit) => void; // edit a captured story in place
  deleteCaptured: (id: string) => void; // remove a single captured story
  clearCaptured: () => void; // wipe captured stories (demo reset)
  setTheme: (t: ThemeId) => void; // switch colour scheme
  seed: () => void; // first-visit: load the example as v0.1 so the cockpit is alive
  reset: () => void; // "start fresh": wipe to a blank strategy and open the editor
}

// Next version label: 0.1, 0.2, ... by count of existing versions.
function nextVersion(count: number): string {
  return `0.${count + 1}`;
}

export const useCockpit = create<CockpitState>()(
  persist(
    (set, get) => ({
      draft: emptyStrategy(),
      versions: [],
      closures: {},
      activeQuality: null,
      selectedTeam: null,
      mode: 'cockpit',
      detail: null,
      systemModelIndex: 0,
      seeded: false,
      scenario: 'baseline',
      capturedStories: [],
      theme: 'obsidian',

      updateSection: (k, patch) =>
        set((s) => ({ draft: { ...s.draft, [k]: { ...s.draft[k], ...patch } } })),

      setDraft: (draft) => set({ draft }),

      loadSample: () => set({ draft: structuredClone(SAMPLE_STRATEGY) }),

      saveVersion: () => {
        const { draft, versions } = get();
        const snapshot: StrategyVersion = {
          version: nextVersion(versions.length),
          savedAt: new Date().toISOString(),
          strategy: structuredClone(draft),
        };
        set({ versions: [...versions, snapshot] });
      },

      setClosure: (edgeId, c) =>
        set((s) => ({ closures: { ...s.closures, [edgeId]: c } })),

      focusQuality: (activeQuality) => set({ activeQuality }),
      selectTeam: (selectedTeam) => set({ selectedTeam }),
      setMode: (mode) => set({ mode }),
      setDetail: (detail) => set({ detail }),
      setSystemModelIndex: (systemModelIndex) => set({ systemModelIndex }),
      setScenario: (scenario) => set({ scenario }),

      captureStory: (s) =>
        set((st) => ({
          capturedStories: [
            ...st.capturedStories,
            { ...s, id: `cap-${Date.now()}-${st.capturedStories.length}`, at: new Date().toISOString() },
          ],
        })),
      updateCaptured: (id, patch) =>
        set((st) => ({ capturedStories: updateCapturedIn(st.capturedStories, id, patch) })),
      deleteCaptured: (id) =>
        set((st) => ({ capturedStories: removeCapturedFrom(st.capturedStories, id) })),
      clearCaptured: () => set({ capturedStories: [] }),

      // Apply the data-theme attribute synchronously (before the re-render) so colour
      // tokens — including the loop arrows that read them — update in the same frame.
      setTheme: (theme) => {
        if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme;
        set({ theme });
      },

      // First visit only: seed the example as v0.1 so the cockpit opens alive, not
      // "offline". A returning visitor (already has versions) is just marked seeded.
      seed: () => {
        if (get().versions.length > 0) {
          set({ seeded: true });
          return;
        }
        set({ draft: structuredClone(SAMPLE_STRATEGY) });
        get().saveVersion();
        set({ seeded: true });
      },

      // "Start fresh": blank strategy, open the editor. Stays seeded so it won't re-seed.
      reset: () =>
        set({
          draft: emptyStrategy(),
          versions: [],
          closures: {},
          activeQuality: null,
          selectedTeam: null,
          detail: null,
          mode: 'author',
          seeded: true,
        }),
    }),
    {
      name: 'strategy-cockpit',
      partialize: (s) => ({
        draft: s.draft,
        versions: s.versions,
        closures: s.closures,
        seeded: s.seeded,
        capturedStories: s.capturedStories,
        theme: s.theme,
      }),
    },
  ),
);

// Dev-only: expose the store for browser-side smoke testing (stripped from prod builds).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { cockpit: typeof useCockpit }).cockpit = useCockpit;
}

// Whether a v0.1 exists across all ten qualities — the gate that unlocks sensors (C1).
export function hasV01(versions: StrategyVersion[]): boolean {
  return versions.length > 0;
}

// The most recent saved snapshot, if any.
export function latestVersion(versions: StrategyVersion[]): StrategyVersion | null {
  return versions.length ? versions[versions.length - 1] : null;
}
