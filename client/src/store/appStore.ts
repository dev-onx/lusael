import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserBrief, ScoredProperty, ChatMessage } from '@lusael/shared';

type View = 'intake' | 'shortlist' | 'property' | 'compare';

interface AppState {
  view: View;
  brief: UserBrief | null;
  intakeMessages: ChatMessage[];
  shortlist: ScoredProperty[];
  activeProperty: ScoredProperty | null;
  pinnedIds: string[];
  compareResult: { properties: ScoredProperty[]; tradeoff: string } | null;

  setBrief: (brief: UserBrief) => void;
  clearBrief: () => void;
  setView: (view: View) => void;
  setIntakeMessages: (messages: ChatMessage[]) => void;
  setShortlist: (properties: ScoredProperty[]) => void;
  appendShortlist: (properties: ScoredProperty[]) => void;
  setActiveProperty: (property: ScoredProperty | null) => void;
  togglePin: (id: string) => void;
  setCompareResult: (result: { properties: ScoredProperty[]; tradeoff: string } | null) => void;
  restartIntake: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'intake',
      brief: null,
      intakeMessages: [],
      shortlist: [],
      activeProperty: null,
      pinnedIds: [],
      compareResult: null,

      setBrief: (brief) => set({ brief }),
      clearBrief: () => set({ brief: null }),

      setView: (view) => set({ view }),

      setIntakeMessages: (messages) => set({ intakeMessages: messages }),

      setShortlist: (properties) => set({ shortlist: properties }),

      appendShortlist: (properties) =>
        set((state) => ({
          shortlist: [
            ...state.shortlist,
            ...properties.filter((p) => !state.shortlist.find((e) => e.id === p.id)),
          ],
        })),

      setActiveProperty: (property) => set({ activeProperty: property }),

      togglePin: (id) =>
        set((state) => {
          const pinned = state.pinnedIds;
          if (pinned.includes(id)) {
            return { pinnedIds: pinned.filter((p) => p !== id) };
          }
          if (pinned.length >= 3) return state;
          return { pinnedIds: [...pinned, id] };
        }),

      setCompareResult: (result) => set({ compareResult: result }),

      restartIntake: () =>
        set({
          view: 'intake',
          brief: null,
          intakeMessages: [],
          shortlist: [],
          activeProperty: null,
          pinnedIds: [],
          compareResult: null,
        }),
    }),
    {
      name: 'lusael-state',
      partialize: (state) => ({
        brief: state.brief,
        intakeMessages: state.intakeMessages,
        shortlist: state.shortlist,
        pinnedIds: state.pinnedIds,
        view: state.view,
      }),
    }
  )
);
