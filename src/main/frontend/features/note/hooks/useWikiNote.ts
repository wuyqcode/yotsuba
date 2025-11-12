import { create } from 'zustand';
import { useEffect } from 'react';
import { NoteService } from 'Frontend/generated/endpoints';
import WikiNoteDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/WikiNoteDto';
import { useLock } from 'Frontend/features/note/hooks/useLock';

interface WikiState {
  wiki: WikiNoteDto | null;
  originalWiki: WikiNoteDto | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;

  loadWiki: (id: string | undefined) => Promise<void>;
  saveWiki: () => Promise<void>;
  reset: () => void;
  updateWiki: (patch: Partial<WikiNoteDto>) => void;
  resetDirty: () => void;
}

function computeDirty(wiki: WikiNoteDto | null, original: WikiNoteDto | null): boolean {
  if (!wiki || !original) {
    console.log('[computeDirty] wiki or original is null → return false');
    return false;
  }

  const titleChanged = wiki.title !== original.title;
  const contentChanged = wiki.content !== original.content;
  const dirty = titleChanged || contentChanged;

  return dirty;
}

export const useWikiStore = create<WikiState>((set, get) => ({
  wiki: null,
  originalWiki: null,
  loading: false,
  error: null,
  isDirty: false,

  async loadWiki(id: string | undefined) {
    if (!id) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await NoteService.findWikiNoteById(id);
      set({
        wiki: data,
        loading: false,
        isDirty: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async saveWiki() {
    const { wiki } = get();
    if (!wiki) return;

    await NoteService.updateNote(wiki.id, wiki.title, wiki.content);
    set({ originalWiki: { ...wiki }, isDirty: false });
  },

  reset() {
    set({ wiki: null, originalWiki: null, isDirty: false });
  },

  updateWiki(patch) {
    set((state) => {
      if (!state.wiki) {
        return state;
      }

      const newWiki = { ...state.wiki, ...patch };
      if (state.originalWiki == null) {
        state.originalWiki = newWiki;
      }

      return {
        wiki: newWiki,
        isDirty: computeDirty(newWiki, state.originalWiki),
      };
    });
  },

  resetDirty() {
    const { originalWiki } = get();
    set({ isDirty: false, wiki: originalWiki ? { ...originalWiki } : null });
  },
}));

export function useWikiNote(id?: string) {
  const { wiki, loading, error, loadWiki, saveWiki, updateWiki, isDirty, resetDirty, reset } = useWikiStore();
  const { run, isLocked } = useLock(id ? `wiki:${id}` : 'wiki:unknown');

  useEffect(() => {
    if (!id) {
      return;
    }

    run(async () => {
      await loadWiki(id);
    }).catch((err) => console.error('[WikiNote] loadWiki error:', err));

    return () => {
      reset();
    };
  }, [id]);

  return {
    wiki,
    loading,
    error,
    setTitle: (title: string) => updateWiki({ title }),
    setContent: (content: string) => updateWiki({ content }),
    saveWiki,
    isDirty,
    resetDirty,
  };
}
