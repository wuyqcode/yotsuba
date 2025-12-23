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

  markDirty: () => void;
  reset: () => void;
}

export const useTagStore = create<TagState>((set, get) => {
  /** 字段变化才标 dirty */
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

    /** 只有 dirty 才真正请求 */
    fetchTags: async (collectionId?: string) => {
      if (!get().isDirty) return;

      set({ loading: true, error: null });

      try {
        const state = get();

        // 🔑 后端接口需要第二个参数
        const selectedTagIds =
          state.selectedTags.length > 0
            ? state.selectedTags.map((t) => t.id)
            : undefined;

        const res = await TagEndpoint.findAllTags(
          collectionId,
          selectedTagIds
        );

        // 同步 selectedTags / selectedTag（防止删除或更新后悬空）
        const updatedSelectedTags = state.selectedTags
          .map((t) => res.find((x) => x.id === t.id))
          .filter((x): x is TagDto => x !== undefined);

        const updatedSelectedTag = state.selectedTag
          ? res.find((x) => x.id === state.selectedTag.id) ?? null
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

        set({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
          selectedTags: state.selectedTags.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
          selectedTag:
            state.selectedTag?.id === id
              ? { ...state.selectedTag, name }
              : state.selectedTag,
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
      } catch (err: any) {
        set({ error: err.message || '删除失败' });
      }
    },

    setSelectedTag: (tag) => markDirtyIfChanged('selectedTag', tag),

    clearSelectedTag: () => {
      const first = get().tags[0] ?? null;
      markDirtyIfChanged('selectedTag', first);
    },

    /** 🔥 下面三处：tag 变化 → notes 失效（不主动 fetch） */

    addSelectedTag: async (tag) => {
      const state = get();
      const next = [...state.selectedTags, tag];

      markDirtyIfChanged('selectedTags', next);

      useNoteStore.getState().resetPageAndMarkDirty();
    },

    removeSelectedTag: async (id) => {
      const next = get().selectedTags.filter((t) => t.id !== id);

      markDirtyIfChanged('selectedTags', next);

      useNoteStore.getState().resetPageAndMarkDirty();
    },

    toggleSelectedTag: async (tag) => {
      const state = get();
      const exists = state.selectedTags.some((t) => t.id === tag.id);

      const next = exists
        ? state.selectedTags.filter((t) => t.id !== tag.id)
        : [...state.selectedTags, tag];

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
