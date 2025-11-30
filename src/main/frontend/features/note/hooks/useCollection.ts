import { create } from 'zustand';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CollectionDto';
import { CollectionEndpoint } from 'Frontend/generated/endpoints';

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
      const res = await CollectionEndpoint.findAllCollections();

      const first = res[0];

      const current = get().selectedCollection;

      set({
        collections: res,
        selectedCollection: current ? res.find((c) => c.id === current.id) || first : first,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async addCollection(name: string) {
    if (!name.trim()) return;
    try {
      await CollectionEndpoint.createCollection(name);
      await get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message || '创建失败' });
    }
  },

  async updateCollection(id: string, name: string) {
    try {
      await CollectionEndpoint.updateCollection(id, name);
      await get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message || '更新失败' });
    }
  },

  async deleteCollection(id: string) {
    try {
      await CollectionEndpoint.deleteCollection(id);
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

  setSelectedCollection: (collection) => set({ selectedCollection: collection }),

  clearSelectedCollection: () => set({ selectedCollection: get().collections[0] }),

  reset: () =>
    set({
      collections: [],
      selectedCollection: undefined as any,
      loading: false,
      error: null,
    }),
}));
