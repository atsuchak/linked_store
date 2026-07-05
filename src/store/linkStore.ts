import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LocalLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  createdAt: number;
  isPinned?: boolean;
}

interface LinkState {
  localLinks: LocalLink[];
  addLocalLink: (link: Omit<LocalLink, 'id' | 'createdAt'>) => void;
  removeLocalLink: (id: string) => void;
  updateLocalLink: (id: string, updatedLink: Partial<Omit<LocalLink, 'id' | 'createdAt'>>) => void;
  clearLocalLinks: () => void;
  setLocalLinks: (links: LocalLink[]) => void;
  historyOrder: string[];
  setHistoryOrder: (order: string[]) => void;
  resetHistoryOrder: () => void;
  togglePinLocalLink: (id: string) => void;
}

export const useLinkStore = create<LinkState>()(
  persist(
    (set) => ({
      localLinks: [],
      historyOrder: [],
      addLocalLink: (link) =>
        set((state) => ({
          localLinks: [
            {
              ...link,
              id: (link as any).id || (link as any)._id || crypto.randomUUID(),
              createdAt: (link as any).createdAt ? new Date((link as any).createdAt).getTime() : Date.now(),
            },
            ...state.localLinks,
          ],
        })),
      removeLocalLink: (id) =>
        set((state) => ({
          localLinks: state.localLinks.filter((link) => link.id !== id),
        })),
      updateLocalLink: (id, updatedLink) =>
        set((state) => ({
          localLinks: state.localLinks.map((link) =>
            link.id === id ? { ...link, ...updatedLink } : link
          ),
        })),
      clearLocalLinks: () => set({ localLinks: [] }),
      setLocalLinks: (links) =>
        set({
          localLinks: links.map(link => ({
            ...link,
            id: (link as any)._id || link.id,
            createdAt: new Date(link.createdAt).getTime()
          }))
        }),
      setHistoryOrder: (order) => set({ historyOrder: order }),
      resetHistoryOrder: () => set({ historyOrder: [] }),
      togglePinLocalLink: (id) => set((state) => {
        const link = state.localLinks.find(l => l.id === id);
        if (!link) return state;
        
        if (!link.isPinned) {
          const pinnedCount = state.localLinks.filter(l => l.isPinned).length;
          if (pinnedCount >= 4) {
            alert("You can only pin up to 4 links.");
            return state;
          }
        }
        
        const updatedLinks = state.localLinks.map(l => l.id === id ? { ...l, isPinned: !l.isPinned } : l);
        return { localLinks: updatedLinks };
      }),
    }),
    {
      name: 'link-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
