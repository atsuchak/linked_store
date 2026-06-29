import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LocalLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  createdAt: number;
}

interface LinkState {
  localLinks: LocalLink[];
  addLocalLink: (link: Omit<LocalLink, 'id' | 'createdAt'>) => void;
  removeLocalLink: (id: string) => void;
  updateLocalLink: (id: string, updatedLink: Partial<Omit<LocalLink, 'id' | 'createdAt'>>) => void;
  clearLocalLinks: () => void;
}

export const useLinkStore = create<LinkState>()(
  persist(
    (set) => ({
      localLinks: [],
      addLocalLink: (link) =>
        set((state) => ({
          localLinks: [
            {
              ...link,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
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
    }),
    {
      name: 'link-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
