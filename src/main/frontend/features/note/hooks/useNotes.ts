import { create } from 'zustand';
import NoteType from 'Frontend/generated/io/github/dutianze/yotsuba/note/domain/valueobject/NoteType';
import { useCollectionStore } from './useCollection';
import { useTagStore } from './useTagStore';
import { NoteEndpoint } from 'Frontend/generated/endpoints';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/NoteCardDto';

export type ViewMode = 'card' | 'list';

type NoteState = {
  notes: NoteCardDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  searchText: string;
  viewMode: ViewMode;

  loading: boolean;
  error: string | null;

  isDirty: boolean;

  fetchNotes: () => Promise<void>;
  createNote: (type: NoteType) => Promise<string>;
  removeNote: (id: string) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  /** 🔥 搜索条件变化统一入口 */
  resetPageAndMarkDirty: () => void;
};

export const useNoteStore = create<NoteState>((set, get) => {
  function markDirtyIfChanged<K extends keyof NoteState>(
    key: K,
    nextValue: NoteState[K]
  ) {
    const prev = get()[key];
    if (prev !== nextValue) {
      set({ [key]: nextValue, isDirty: true });
    }
  }

  return {
    notes: [],
    page: 1,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
    searchText: '',
    viewMode: 'card',

    loading: false,
    error: null,

    isDirty: true,

    setPage: (page) => markDirtyIfChanged('page', page),

    setPageSize: (size) => {
      const { pageSize, page } = get();
      if (pageSize !== size || page !== 1) {
        set({ pageSize: size, page: 1, isDirty: true });
      }
    },

    setSearchText: (text) => {
      const { searchText, page } = get();
      if (searchText !== text || page !== 1) {
        set({ searchText: text, page: 1, isDirty: true });
      }
    },

    clearSearch: () => {
      const { searchText, page } = get();
      if (searchText !== '' || page !== 1) {
        set({ searchText: '', page: 1, isDirty: true });
      }
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    toggleViewMode: () =>
      set((s) => ({
        viewMode: s.viewMode === 'card' ? 'list' : 'card',
      })),

    /** ✅ 统一用于 tag / collection / search 条件变化 */
    resetPageAndMarkDirty: () => {
      const { page } = get();
      if (page !== 1) {
        set({ page: 1, isDirty: true });
      } else {
        set({ isDirty: true });
      }
    },

    /** 拉取笔记（仅 isDirty 时） */
    fetchNotes: async () => {
      const state = get();
      if (!state.isDirty) return;

      const collectionId =
        useCollectionStore.getState().selectedCollection?.id;
      const tagIds =
        useTagStore.getState().selectedTags.map((t) => t.id);

      if (!collectionId) return;

      set({ loading: true, error: null });
      try {
        const res = await NoteEndpoint.searchNotes(
          collectionId,
          state.searchText,
          tagIds,
          state.page - 1,
          state.pageSize
        );

        set({
          notes: res.content,
          totalPages: res.totalPages,
          totalElements: res.totalElements,
          isDirty: false,
        });
      } catch (e: any) {
        set({ error: e.message ?? 'Failed to fetch notes' });
      } finally {
        set({ loading: false });
      }
    },

    createNote: async (type) => {
      const collectionId =
        useCollectionStore.getState().selectedCollection?.id;
      if (!collectionId) throw new Error('请先选择一个笔记本');

      set({ loading: true, error: null });
      try {
        const id = await NoteEndpoint.createNote(collectionId, type);
        get().resetPageAndMarkDirty();
        await get().fetchNotes();
        return id;
      } finally {
        set({ loading: false });
      }
    },

    removeNote: async (id) => {
      set({ loading: true, error: null });
      try {
        await NoteEndpoint.deleteNote(id);
        get().resetPageAndMarkDirty();
        await get().fetchNotes();
      } finally {
        set({ loading: false });
      }
    },
  };
});
