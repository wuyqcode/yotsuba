import { create } from 'zustand';
import WikiNoteDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/WikiNoteDto';
import { type Editor } from 'reactjs-tiptap-editor';
import { NoteEndpoint } from 'Frontend/generated/endpoints';

export type EditorMode = 'read' | 'edit' | 'comment' | 'file';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface WikiState {
  wiki: WikiNoteDto | null;
  originalWiki: WikiNoteDto | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  editor: Editor | null;
  headings: HeadingItem[];
  mode: EditorMode;

  setEditor: (editor: Editor | null) => void;
  setHeadings: (items: HeadingItem[]) => void;
  setMode: (mode: EditorMode) => void;
  isReadOnly: () => boolean;
  loadWiki: (id: string | undefined) => Promise<void>;
  saveWiki: () => Promise<void>;
  reset: () => void;
  updateWiki: (patch: Partial<WikiNoteDto>) => void;
}

function computeDirty(wiki: WikiNoteDto | null, original: WikiNoteDto | null): boolean {
  if (!wiki || !original) {
    return false;
  }

  const titleChanged = wiki.title !== original.title;
  const contentChanged = wiki.content !== original.content;
  const dirty = titleChanged || contentChanged;

  return dirty;
}

export const useWikiNoteStore = create<WikiState>((set, get) => ({
  wiki: null,
  originalWiki: null,
  loading: false,
  error: null,
  isDirty: false,
  editor: null,
  headings: [],
  mode: 'read',

  setEditor: (editor) => set({ editor }),
  setHeadings: (items) => set({ headings: items }),
  setMode: (mode) => set({ mode }),
  isReadOnly: () => get().mode !== 'edit',

  async loadWiki(id: string | undefined) {
    if (!id) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await NoteEndpoint.findWikiNoteById(id);

      const mode = data.initial ? 'edit' : 'read';

      set({
        wiki: data,
        originalWiki: { ...data },
        loading: false,
        isDirty: false,
        mode,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async saveWiki() {
    const { wiki } = get();
    if (!wiki) {
      return;
    }

    try {
      await NoteEndpoint.updateNote(wiki.id, wiki.title, wiki.content);
      set({ originalWiki: { ...wiki }, isDirty: false });
    } catch (err: any) {
      console.error('[saveWiki] save failed:', err);
      throw err;
    }
  },

  reset() {
    set({ wiki: null, originalWiki: null, isDirty: false, headings: [], mode: 'edit', editor: null });
  },

  updateWiki(patch) {
    set((state) => {
      if (!state.wiki) {
        return state;
      }

      const originalWiki = state.originalWiki || { ...state.wiki };

      const newWiki = { ...state.wiki, ...patch };
      const isDirty = computeDirty(newWiki, originalWiki);

      return {
        wiki: newWiki,
        originalWiki,
        isDirty,
      };
    });
  },
}));
