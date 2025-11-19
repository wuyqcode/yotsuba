import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { NoteService } from 'Frontend/generated/endpoints';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';
import NoteType from 'Frontend/generated/io/github/dutianze/yotsuba/note/domain/valueobject/NoteType';
import { useCollectionStore } from './useCollection';
import { useTagStore } from './useTagStore';

type NoteState = {
  notes: NoteCardDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  searchText: string;

  loading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  createNote: (type: NoteType) => Promise<string>;
  removeNote: (id: string) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  page: 1,
  pageSize: 12,
  totalPages: 0,
  totalElements: 0,
  searchText: '',

  loading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  setSearchText: (text) => set({ searchText: text, page: 1 }),
  clearSearch: () => set({ searchText: '', page: 1 }),

  /** 拉取笔记列表 */
  fetchNotes: async () => {
    const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
    const selectedTagIdList = useTagStore.getState().selectedTags.map((tag) => tag.id);
    const { page, pageSize, searchText } = get();

    if (!selectedCollectionId) {
      set({
        notes: [],
        totalPages: 0,
        totalElements: 0,
        error: null,
        loading: false,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await NoteService.searchNotes(
        selectedCollectionId,
        searchText,
        selectedTagIdList,
        page - 1,
        pageSize
      );
      set({
        notes: res.content,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
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
      const id = await NoteService.createNote(selectedCollectionId, type);
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
      await NoteService.deleteNote(id);
      await get().fetchNotes();
    } catch (e: any) {
      console.error('removeNote failed:', e);
      set({ error: e.message ?? 'Failed to delete note' });
    } finally {
      set({ loading: false });
    }
  },
}));
