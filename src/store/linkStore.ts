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
  setLocalLinks: (links: LocalLink[]) => void;
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
    }),
    {
      name: 'link-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
