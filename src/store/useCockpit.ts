import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Closure, QualityId, Strategy, StrategyVersion } from '../domain/types';
import { emptyStrategy } from '../domain/qualities';
import { SAMPLE_STRATEGY } from '../data/sample';

// Which screen the cockpit is showing.
export type CockpitMode = 'cockpit' | 'author';
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
    }),
    {
      name: 'strategy-cockpit',
      partialize: (s) => ({
        draft: s.draft,
        versions: s.versions,
        closures: s.closures,
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
