import { create } from 'zustand';
import { useCollectionStore } from './useCollection';
import { TagEndpoint } from 'Frontend/generated/endpoints';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/TagDto';
import { useNoteStore } from './useNotes';

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

  markDirty: () => void;
  resetDirty: () => void;

  reset: () => void;
}

export const useTagStore = create<TagState>((set, get) => {
  /** 自动判断是否变化 → 标记 dirty */
  function markDirtyIfChanged<K extends keyof TagState>(
    key: K,
    nextValue: TagState[K]
  ) {
    const prev = get()[key];
    if (prev !== nextValue) {
      set({ [key]: nextValue, isDirty: true });
    }
  }

  return {
    tags: [],
    selectedTag: null,
    selectedTags: [],

    loading: false,
    error: null,
    isDirty: true,

    markDirty: () => set({ isDirty: true }),
    resetDirty: () => set({ isDirty: false }),

    /** 只有 isDirty 时才真正请求 */
    fetchTags: async (collectionId?: string) => {
      const { isDirty } = get();
      if (!isDirty) return;

      set({ loading: true, error: null });

      try {
        const state = get();
        const tagIdList =
          state.selectedTags.length > 0
            ? state.selectedTags.map((t) => t.id)
            : undefined;

        const res = await TagEndpoint.findAllTags(
          collectionId,
          tagIdList
        );

        const updatedSelectedTags = state.selectedTags
          .map((t) => res.find((x) => x.id === t.id))
          .filter((x): x is TagDto => x !== undefined);

        const updatedSelectedTag = state.selectedTag
          ? res.find((x) => x.id === state.selectedTag!.id) || null
          : null;

        set({
          tags: res,
          selectedTags: updatedSelectedTags,
          selectedTag: updatedSelectedTag,
          isDirty: false,
        });
      } catch (err: any) {
        set({ error: err.message || '加载失败' });
      } finally {
        set({ loading: false });
      }
    },

    addTag: async (collectionId, name) => {
      if (!collectionId || !name.trim()) return;
      try {
        await TagEndpoint.createTag(collectionId, name);
        set({ isDirty: true });
        await get().fetchTags(collectionId);
      } catch (err: any) {
        set({ error: err.message || '创建失败' });
      }
    },

    updateTag: async (id, name) => {
      try {
        await TagEndpoint.updateTag(id, name);
        const state = get();

        const tags = state.tags.map((t) =>
          t.id === id ? { ...t, name } : t
        );
        const selectedTags = state.selectedTags.map((t) =>
          t.id === id ? { ...t, name } : t
        );
        const selectedTag =
          state.selectedTag?.id === id
            ? { ...state.selectedTag, name }
            : state.selectedTag;

        set({
          tags,
          selectedTags,
          selectedTag,
          isDirty: true,
        });
      } catch (err: any) {
        set({ error: err.message || '更新失败' });
      }
    },

    deleteTag: async (id) => {
      try {
        await TagEndpoint.deleteTag(id);
        const collectionId =
          useCollectionStore.getState().selectedCollection?.id;

        set({
          selectedTags: get().selectedTags.filter((t) => t.id !== id),
          isDirty: true,
        });

        await get().fetchTags(collectionId);

        const state = get();
        if (state.selectedTag?.id === id) {
          set({ selectedTag: state.tags[0] || null });
        }
      } catch (err: any) {
        set({ error: err.message || '删除失败' });
      }
    },

    setSelectedTag: (tag) =>
      markDirtyIfChanged('selectedTag', tag),

    clearSelectedTag: () => {
      const first = get().tags[0] ?? null;
      markDirtyIfChanged('selectedTag', first);
    },

    /** ⬇⬇⬇ 这里只改了 dirty 行 ⬇⬇⬇ */

    addSelectedTag: async (tag) => {
      const state = get();
      markDirtyIfChanged('selectedTags', [...state.selectedTags, tag]);

      // ✅ 原来是 markDirty()
      useNoteStore.getState().resetPageAndMarkDirty();

      const collectionId =
        useCollectionStore.getState().selectedCollection?.id;
      await get().fetchTags(collectionId);
    },

    removeSelectedTag: async (id) => {
      markDirtyIfChanged(
        'selectedTags',
        get().selectedTags.filter((t) => t.id !== id)
      );

      // ✅ 原来是 markDirty()
      useNoteStore.getState().resetPageAndMarkDirty();

      const collectionId =
        useCollectionStore.getState().selectedCollection?.id;
      await get().fetchTags(collectionId);
    },

    toggleSelectedTag: async (tag) => {
      const state = get();
      const exists = state.selectedTags.some((t) => t.id === tag.id);
      const next = exists
        ? state.selectedTags.filter((t) => t.id !== tag.id)
        : [...state.selectedTags, tag];

      markDirtyIfChanged('selectedTags', next);

      // ✅ 原来是 markDirty()
      useNoteStore.getState().resetPageAndMarkDirty();

      const collectionId =
        useCollectionStore.getState().selectedCollection?.id;
      await get().fetchTags(collectionId);
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
