import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useIndexedDBStorage } from './useIndexedDBStorage';

export interface Collection {
  id: number;
  name: string;
  count: number;
  cover: string;
  lastUpdated: string;
}

interface SelectedCollectionState {
  selectedCollection: Collection | null;
  setCollection: (collection: Collection) => void;
  clearCollection: () => void;
}

export const trashCollection: Collection = {
  id: -1,
  name: 'Trash',
  count: 0,
  cover: 'https://cdn-icons-png.flaticon.com/512/126/126468.png',
  lastUpdated: '',
};

export const useSelectedCollectionStore = create<SelectedCollectionState>()(
  persist(
    (set) => ({
      selectedCollection: null,
      setCollection: (collection: Collection) => set({ selectedCollection: collection }),
      clearCollection: () => set({ selectedCollection: null }),
    }),
    {
      name: 'selected-collection',
      storage: createJSONStorage(useIndexedDBStorage),
    }
  )
);
