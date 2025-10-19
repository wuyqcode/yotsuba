import { create } from 'zustand';
import { NoteService } from 'Frontend/generated/endpoints';
import NoteDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteDto';

interface NoteState {
  pageCache: Record<string, NoteDto[]>; // key = `${page}-${pageSize}-${searchText}`
  notes: NoteDto[];
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  searchText: string;
  loading: boolean;
  error: string | null;

  fetchNotes: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
  createNote: () => Promise<string | null>;
  removeNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  pageCache: {},
  notes: [],
  page: 1,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  searchText: '',
  loading: false,
  error: null,

  fetchNotes: async (page = get().page) => {
    const { pageSize, searchText, pageCache } = get();
    const cacheKey = `${page}-${pageSize}-${searchText}`;

    // 先查缓存
    if (pageCache[cacheKey]) {
      set({ page, notes: pageCache[cacheKey] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await NoteService.searchMessages(searchText, page - 1, pageSize);
      const notes = res?.content || [];
      const totalPages = res?.totalPages || 0;
      const totalElements = res.totalElements;

      set((state) => ({
        page,
        notes,
        totalPages,
        totalElements,
        pageCache: { ...state.pageCache, [cacheKey]: notes },
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setPage: (page) => set({ page }),

  setPageSize: (size) =>
    set({
      pageSize: size,
      page: 1, // 改 pageSize 时，重置到第一页
      pageCache: {}, // 清空缓存
    }),

  setSearchText: (text) => set({ searchText: text }),

  clearSearch: () =>
    set({
      searchText: '',
      page: 1,
      notes: [],
      pageCache: {},
    }),

  createNote: async () => {
    try {
      const newId = await NoteService.createNote();
      set({ pageCache: {}, notes: [] });
      await get().fetchNotes(1);
      return newId;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  removeNote: async (id: string) => {
    const { page, notes } = get();
    try {
      // await NoteService.deleteNote(id); // 假设后端有 deleteNote
      set({ pageCache: {}, notes: [] });

      if (notes.length === 1 && page > 1) {
        await get().fetchNotes(page - 1);
      } else {
        await get().fetchNotes(page);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
