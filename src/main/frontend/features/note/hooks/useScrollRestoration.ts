import { useEffect, RefObject } from 'react';
import { useLocation } from 'react-router';
import { create } from 'zustand';

interface ScrollPositions {
  [key: string]: { x: number; y: number };
}

interface ScrollStore {
  positions: ScrollPositions;
  save: (key: string, x: number, y: number) => void;
  get: (key: string) => { x: number; y: number } | undefined;
}

const useScrollStore = create<ScrollStore>((set, get) => ({
  positions: {},
  save: (key, x, y) =>
    set((state) => ({
      positions: { ...state.positions, [key]: { x, y } },
    })),
  get: (key) => get().positions[key],
}));

export function useScrollRestoration(ref?: RefObject<HTMLElement>, key?: string) {
  const location = useLocation();
  const { save, get } = useScrollStore();
  const storeKey = key ?? location.pathname + location.search;

  useEffect(() => {
    const el = ref?.current ?? window;

    const saveScroll = () => {
      if (el instanceof Window) {
        save(storeKey, el.scrollX, el.scrollY);
      } else if (el) {
        console.log('[ScrollStore] save', storeKey, el.scrollLeft, el.scrollTop);
        save(storeKey, el.scrollLeft, el.scrollTop);
      }
    };

    el.addEventListener('scroll', saveScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', saveScroll);
    };
  }, [storeKey, ref, save]);

  useEffect(() => {
    const pos = get(storeKey);
    const el = ref?.current ?? window;

    setTimeout(() => {
      if (pos) {
        if (el instanceof Window) {
          el.scrollTo(pos.x, pos.y);
        } else if (el) {
          el.scrollLeft = pos.x;
          el.scrollTop = pos.y;
        }
      } else {
        if (el instanceof Window) {
          el.scrollTo(0, 0);
        } else if (el) {
          el.scrollLeft = 0;
          el.scrollTop = 0;
        }
      }
    }, 100);
  }, [storeKey, ref, get]);
}
