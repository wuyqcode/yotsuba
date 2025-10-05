import { create } from 'zustand';
import { Tag } from './useTagStore';

interface SelectedTagsState {
  selectedTags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (id: number) => void;
  toggleTag: (tag: Tag) => void;
}

export const useSelectedTagsStore = create<SelectedTagsState>((set) => ({
  selectedTags: [],
  addTag: (tag) =>
    set((state) =>
      state.selectedTags.some((t) => t.id === tag.id) ? state : { selectedTags: [...state.selectedTags, tag] }
    ),
  removeTag: (id) =>
    set((state) => ({
      selectedTags: state.selectedTags.filter((t) => t.id !== id),
    })),
  toggleTag: (tag) =>
    set((state) => {
      const exists = state.selectedTags.some((t) => t.id === tag.id);
      return exists
        ? { selectedTags: state.selectedTags.filter((t) => t.id !== tag.id) }
        : { selectedTags: [...state.selectedTags, tag] };
    }),
}));
