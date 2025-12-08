import { create } from 'zustand';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';
import NoteType from 'Frontend/generated/io/github/dutianze/yotsuba/note/domain/valueobject/NoteType';
import { useCollectionStore } from './useCollection';
import { useTagStore } from './useTagStore';
import { NoteEndpoint } from 'Frontend/generated/endpoints';

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
};


export const useNoteStore = create<NoteState>((set, get) => {

  function markDirtyIfChanged<K extends keyof NoteState>(
    key: K,
    nextValue: NoteState[K],
  ) {
    const prevValue = get()[key];
    if (prevValue !== nextValue) {
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

    setPage: (page) => {
      markDirtyIfChanged('page', page);
    },

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
      set((state) => ({
        viewMode: state.viewMode === 'card' ? 'list' : 'card',
      })),

    /** 拉取笔记列表，只在 isDirty 时真正请求 */
    fetchNotes: async () => {
      const state = get();
      if (!state.isDirty) {
        // 条件没变，直接复用现有 notes
        return;
      }

      const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
      const selectedTagIdList = useTagStore.getState().selectedTags.map((tag) => tag.id);
      const { page, pageSize, searchText } = state;

      if (!selectedCollectionId) {
        return;
      }

      set({ loading: true, error: null });
      try {
        const res = await NoteEndpoint.searchNotes(
          selectedCollectionId,
          searchText,
          selectedTagIdList,
          page - 1,
          pageSize,
        );

        set({
          notes: res.content,
          totalPages: res.totalPages,
          totalElements: res.totalElements,
          isDirty: false, // ✅ 拉完数据后清空脏标记
        });
      } catch (e: any) {
        console.error('fetchNotes failed:', e);
        set({ error: e.message ?? 'Failed to fetch notes' });
      } finally {
        set({ loading: false });
      }
    },

    /** 创建笔记 */
    createNote: async (type: NoteType) => {
      const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
      if (!selectedCollectionId) {
        throw new Error('请先选择一个笔记本');
      }

      set({ loading: true, error: null });
      try {
        const id = await NoteEndpoint.createNote(selectedCollectionId, type);
        // 数据肯定变了
        set({ isDirty: true });
        await get().fetchNotes();
        return id;
      } catch (e: any) {
        console.error('createNote failed:', e);
        set({ error: e.message ?? 'Failed to create note' });
        throw e;
      } finally {
        set({ loading: false });
      }
    },

    /** 删除笔记 */
    removeNote: async (id: string) => {
      set({ loading: true, error: null });
      try {
        await NoteEndpoint.deleteNote(id);
        set({ isDirty: true });
        await get().fetchNotes();
      } catch (e: any) {
        console.error('removeNote failed:', e);
        set({ error: e.message ?? 'Failed to delete note' });
      } finally {
        set({ loading: false });
      }
    },
  };
});
