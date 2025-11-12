import { create } from 'zustand';
import { useStore } from 'zustand';

interface LockState {
  locks: Set<string>;
  acquire: (key: string) => boolean;
  release: (key: string) => void;
  isLocked: (key: string) => boolean;
}

const useLockStoreBase = create<LockState>((set, get) => ({
  locks: new Set(),

  acquire(key) {
    const locks = new Set(get().locks);
    if (locks.has(key)) return false;
    locks.add(key);
    set({ locks });
    return true;
  },

  release(key) {
    const locks = new Set(get().locks);
    locks.delete(key);
    set({ locks });
  },

  isLocked(key) {
    return get().locks.has(key);
  },
}));

export function useLock(key: string) {
  const locked = useStore(useLockStoreBase, (s) => s.locks.has(key));

  const acquire = useLockStoreBase((s) => s.acquire);
  const release = useLockStoreBase((s) => s.release);

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (!acquire(key)) return;
    try {
      return await fn();
    } finally {
      release(key);
    }
  }

  return {
    isLocked: locked,
    run,
    acquire: () => acquire(key),
    release: () => release(key),
  };
}
