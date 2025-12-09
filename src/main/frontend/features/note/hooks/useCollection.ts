import { create } from 'zustand';
import { CollectionEndpoint } from 'Frontend/generated/endpoints';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/CollectionDto';
import { useNoteStore } from './useNotes';
import { useTagStore } from './useTagStore';

interface CollectionState {
  collections: CollectionDto[];
  selectedCollection: CollectionDto | null;

  loading: boolean;
  error: string | null;

  isDirty: boolean;

  fetchCollections: () => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  updateCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;

  setSelectedCollection: (collection: CollectionDto) => void;
  clearSelectedCollection: () => void;

  markDirty: () => void;
  resetDirty: () => void;

  reset: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => {
  /** 自动对比并触发 isDirty */
  function markDirtyIfChanged<K extends keyof CollectionState>(
    key: K,
    nextValue: CollectionState[K],
  ) {
    const prevValue = get()[key];
    if (prevValue !== nextValue) {
      set({ [key]: nextValue, isDirty: true });
    }
  }

  return {
    collections: [],
    selectedCollection: null,

    loading: false,
    error: null,

    isDirty: true,

    markDirty: () => set({ isDirty: true }),
    resetDirty: () => set({ isDirty: false }),

    /** 只有 isDirty 才真正 fetch */
    fetchCollections: async () => {
      const { isDirty } = get();
      if (!isDirty) {
        return; // 直接复用缓存
      }

      set({ loading: true, error: null });

      try {
        const res = await CollectionEndpoint.findAllCollections();

        const current = get().selectedCollection;
        const first = res[0];
        const newSelectedCollection = current
          ? res.find((c) => c.id === current.id) || first
          : first;

        // 如果 selectedCollection 的 ID 改变了，标记 notes 和 tags 为 dirty
        if (current?.id !== newSelectedCollection?.id) {
          useNoteStore.getState().markDirty();
          useTagStore.getState().markDirty();
        }

        set({
          collections: res,
          selectedCollection: newSelectedCollection,
          isDirty: false,
        });
      } catch (err: any) {
        set({ error: err.message || '加载失败' });
      } finally {
        set({ loading: false });
      }
    },

    addCollection: async (name: string) => {
      if (!name.trim()) return;

      try {
        await CollectionEndpoint.createCollection(name);
        set({ isDirty: true });
        await get().fetchCollections();
      } catch (err: any) {
        set({ error: err.message || '创建失败' });
      }
    },

    updateCollection: async (id: string, name: string) => {
      try {
        await CollectionEndpoint.updateCollection(id, name);
        set({ isDirty: true });
        await get().fetchCollections();
      } catch (err: any) {
        set({ error: err.message || '更新失败' });
      }
    },

    deleteCollection: async (id: string) => {
      try {
        await CollectionEndpoint.deleteCollection(id);

        set({ isDirty: true });
        await get().fetchCollections();

        const current = get().selectedCollection;
        if (current?.id === id) {
          const first = get().collections[0];
          set({ selectedCollection: first });
        }
      } catch (err: any) {
        set({ error: err.message || '删除失败' });
      }
    },

    setSelectedCollection: (collection) => {
      const prevCollection = get().selectedCollection;
      markDirtyIfChanged('selectedCollection', collection);
      // 当 collection 改变时，标记 notes 和 tags 为 dirty，触发刷新
      if (prevCollection?.id !== collection?.id) {
        useNoteStore.getState().markDirty();
        useTagStore.getState().markDirty();
      }
    },

    clearSelectedCollection: () => {
      const prevCollection = get().selectedCollection;
      const first = get().collections[0] ?? null;
      markDirtyIfChanged('selectedCollection', first);
      // 当 collection 改变时，标记 notes 和 tags 为 dirty，触发刷新
      if (prevCollection?.id !== first?.id) {
        useNoteStore.getState().markDirty();
        useTagStore.getState().markDirty();
      }
    },

    reset: () =>
      set({
        collections: [],
        selectedCollection: null,
        loading: false,
        error: null,
        isDirty: true,
      }),
  };
});
