import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useIndexedDBStorage } from './useIndexedDBStorage';

export interface Tag {
  id: number;
  title: string;
  image: string;
  content: string;
}

interface SelectedTagsState {
  selectedTags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (tag: Tag) => void;
  clearTags: () => void;
}

export const useSelectedTagsStore = create<SelectedTagsState>()(
  persist(
    (set, get) => ({
      selectedTags: [],
      addTag: (addTag: Tag) => {
        const tags = get().selectedTags;
        if (tags.find((t) => t.id === addTag.id)) {
          return;
        }
        set({ selectedTags: [...tags, addTag] });
      },
      removeTag: (deleteTag: Tag) => {
        set({
          selectedTags: get().selectedTags.filter((tag) => tag.id !== deleteTag.id),
        });
      },
      clearTags: () => set({ selectedTags: [] }),
    }),
    {
      name: 'selected-tags',
      storage: createJSONStorage(useIndexedDBStorage),
    }
  )
);
