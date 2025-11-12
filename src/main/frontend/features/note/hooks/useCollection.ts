import { create } from 'zustand';
import { useEffect } from 'react';
import { CollectionService } from 'Frontend/generated/endpoints';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CollectionDto';
import { useLock } from 'Frontend/features/note/hooks/useLock';

interface CollectionState {
  collections: CollectionDto[];
  selectedCollection: CollectionDto | null;
  loading: boolean;
  error: string | null;

  fetchCollections: () => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  updateCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  setSelectedCollection: (collection: CollectionDto) => void;
  clearSelectedCollection: () => void;
  reset: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  selectedCollection: null,
  loading: false,
  error: null,

  async fetchCollections() {
    set({ loading: true, error: null });
    try {
      const res = await CollectionService.findAllCollections();
      set({ collections: res, loading: false });
    } catch (err: any) {
      console.error('[useCollectionStore] 拉取集合失败：', err);
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async addCollection(name: string) {
    if (!name.trim()) return;
    try {
      const created = await CollectionService.createCollection(name);
      set((state) => ({
        collections: [...state.collections, created],
      }));
    } catch (err: any) {
      console.error('[useCollectionStore] 创建集合失败：', err);
      set({ error: err.message || '创建失败' });
    }
  },

  async updateCollection(id: string, name: string) {
    try {
      await CollectionService.updateCollection(id, name);
      set((state) => ({
        collections: state.collections.map((c) => (c.id === id ? { ...c, name } : c)),
      }));
    } catch (err: any) {
      console.error('[useCollectionStore] 更新集合失败：', err);
      set({ error: err.message || '更新失败' });
    }
  },

  async deleteCollection(id: string) {
    try {
      await CollectionService.deleteCollection(id);
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
      }));
    } catch (err: any) {
      console.error('[useCollectionStore] 删除集合失败：', err);
      set({ error: err.message || '删除失败' });
    }
  },

  setSelectedCollection: (collection: CollectionDto) => set({ selectedCollection: collection }),

  clearSelectedCollection: () => set({ selectedCollection: null }),

  reset: () => set({ collections: [], selectedCollection: null, loading: false, error: null }),
}));

export function useCollection() {
  const {
    collections,
    selectedCollection,
    loading,
    error,
    fetchCollections,
    addCollection,
    updateCollection,
    deleteCollection,
    setSelectedCollection,
    clearSelectedCollection,
    reset,
  } = useCollectionStore();

  const { run } = useLock('collections:global');

  useEffect(() => {
    run(async () => {
      await fetchCollections();
    }).catch((err) => console.error('[useCollection] 加载集合失败:', err));

    return () => {
      reset();
    };
  }, []);

  return {
    collections,
    selectedCollection,
    loading,
    error,
    addCollection,
    updateCollection,
    deleteCollection,
    setSelectedCollection,
    clearSelectedCollection,
  };
}
