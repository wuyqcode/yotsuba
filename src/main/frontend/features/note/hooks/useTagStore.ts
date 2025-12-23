import { create } from 'zustand';
import { useCollectionStore } from './useCollection';
import { useNoteStore } from './useNotes';
import { TagEndpoint } from 'Frontend/generated/endpoints';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/TagDto';

interface TagState {
  tags: TagDto[];
  selectedTag: TagDto | null;
  selectedTags: TagDto[];

  loading: boolean;
  error: string | null;
  isDirty: boolean;

  fetchTags: (collectionId?: string) => Promise<void>;

  addTag: (collectionId: string, name: string) => Promise<void>;
  updateTag: (id: string, name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  setSelectedTag: (tag: TagDto) => void;
  clearSelectedTag: () => void;

  addSelectedTag: (tag: TagDto) => Promise<void>;
  removeSelectedTag: (id: string) => Promise<void>;
  toggleSelectedTag: (tag: TagDto) => Promise<void>;

  reset: () => void;
}

export const useTagStore = create<TagState>((set, get) => {
  function markDirtyIfChanged<K extends keyof TagState>(
    key: K,
    next: TagState[K]
  ) {
    if (get()[key] !== next) {
      set({ [key]: next, isDirty: true });
    }
  }

  return {
    tags: [],
    selectedTag: null,
    selectedTags: [],
    loading: false,
    error: null,
    isDirty: true,

    fetchTags: async (collectionId) => {
      if (!get().isDirty) return;

      set({ loading: true });
      try {
        const res = await TagEndpoint.findAllTags(collectionId);
        set({ tags: res, isDirty: false });
      } finally {
        set({ loading: false });
      }
    },

    addTag: async (collectionId, name) => {
      await TagEndpoint.createTag(collectionId, name);
      set({ isDirty: true });
      await get().fetchTags(collectionId);
    },

    updateTag: async (id, name) => {
      await TagEndpoint.updateTag(id, name);
      set({
        tags: get().tags.map((t) =>
          t.id === id ? { ...t, name } : t
        ),
      });
    },

    deleteTag: async (id) => {
      await TagEndpoint.deleteTag(id);
      set({
        selectedTags: get().selectedTags.filter((t) => t.id !== id),
        isDirty: true,
      });
    },

    setSelectedTag: (tag) =>
      markDirtyIfChanged('selectedTag', tag),

    clearSelectedTag: () =>
      markDirtyIfChanged('selectedTag', null),

    /** 🔥 以下三处统一逻辑 */

    addSelectedTag: async (tag) => {
      const next = [...get().selectedTags, tag];
      markDirtyIfChanged('selectedTags', next);
      useNoteStore.getState().resetPageAndMarkDirty();
    },

    removeSelectedTag: async (id) => {
      const next = get().selectedTags.filter((t) => t.id !== id);
      markDirtyIfChanged('selectedTags', next);
      useNoteStore.getState().resetPageAndMarkDirty();
    },

    toggleSelectedTag: async (tag) => {
      const exists = get().selectedTags.some((t) => t.id === tag.id);
      const next = exists
        ? get().selectedTags.filter((t) => t.id !== tag.id)
        : [...get().selectedTags, tag];

      markDirtyIfChanged('selectedTags', next);
      useNoteStore.getState().resetPageAndMarkDirty();
    },

    reset: () =>
      set({
        tags: [],
        selectedTag: null,
        selectedTags: [],
        loading: false,
        error: null,
        isDirty: true,
      }),
  };
});
