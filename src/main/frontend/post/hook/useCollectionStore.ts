import { create } from 'zustand';

export interface Collection {
  id: number;
  name: string;
  count?: number;
  cover?: string;
  lastUpdated?: string;
}

interface CollectionState {
  collections: Collection[];
  addCollection: (name: string) => void;
  updateCollection: (id: number, name: string) => void;
  deleteCollection: (id: number) => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [
    { id: -999, name: '全部笔记', count: 0, cover: '', lastUpdated: '' }, // 系统 collection
    { id: 101, name: '我的收藏夹', count: 12, cover: '', lastUpdated: '2025-05-10' },
    { id: 102, name: '学习资源', count: 8, cover: '', lastUpdated: '2025-05-08' },
    { id: -998, name: '回收站', count: 0, cover: '', lastUpdated: '' }, // 系统 collection
  ],
  addCollection: (name) =>
    set((state) => ({
      collections: [
        ...state.collections,
        {
          id: Date.now(),
          name,
          count: 0,
          lastUpdated: new Date().toISOString(),
        },
      ],
    })),
  updateCollection: (id, name) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, name, lastUpdated: new Date().toISOString() } : c
      ),
    })),
  deleteCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),
}));
