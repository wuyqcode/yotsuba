import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

export const useIndexedDBStorage = (): StateStorage => ({
  getItem: async (name: string) => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
});
