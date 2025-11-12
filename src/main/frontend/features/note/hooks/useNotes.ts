import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { NoteService } from 'Frontend/generated/endpoints';
import NoteType from 'Frontend/generated/io/github/dutianze/yotsuba/note/domain/valueobject/NoteType';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';
import { useCollection } from 'Frontend/features/note/hooks/useCollection';

const useNotesStore = create<{
  notes: NoteCardDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  searchText: string;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
  setNotesData: (notes: NoteCardDto[], totalPages: number, totalElements: number) => void;
}>((set) => ({
  notes: [],
  page: 1,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  searchText: '',

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  setSearchText: (text) => set({ searchText: text, page: 1 }),
  clearSearch: () => set({ searchText: '', page: 1 }),
  setNotesData: (notes, totalPages, totalElements) => set({ notes, totalPages, totalElements }),
}));

export function useNotes() {
  const { selectedCollection } = useCollection();
  const notes = useNotesStore((s) => s.notes);
  const page = useNotesStore((s) => s.page);
  const pageSize = useNotesStore((s) => s.pageSize);
  const totalPages = useNotesStore((s) => s.totalPages);
  const totalElements = useNotesStore((s) => s.totalElements);
  const searchText = useNotesStore((s) => s.searchText);
  const setNotesData = useNotesStore((s) => s.setNotesData);
  const setPage = useNotesStore((s) => s.setPage);
  const setPageSize = useNotesStore((s) => s.setPageSize);
  const setSearchText = useNotesStore((s) => s.setSearchText);
  const clearSearch = useNotesStore((s) => s.clearSearch);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    const collectionId = selectedCollection?.id;
    if (!collectionId) {
      setNotesData([], 0, 0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await NoteService.searchNotes(collectionId, searchText, page - 1, pageSize);
      setNotesData(res.content, res.totalPages, res.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch notes:', err);
      setError(err.message ?? 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText, selectedCollection?.id, setNotesData]);

  const createNote = useCallback(
    async (type: NoteType) => {
      setLoading(true);
      try {
        if (!selectedCollection) {
          throw new Error('请选择一个集合后再创建笔记');
        }
        const collectionId = selectedCollection.id;
        if (!collectionId) {
          throw new Error('当前集合缺少ID，无法创建笔记');
        }
        const id = await NoteService.createNote(collectionId, type);
        await fetchNotes();
        return id;
      } catch (err: any) {
        console.error('Failed to create note:', err);
        setError(err.message ?? 'Failed to create note');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchNotes, selectedCollection?.id]
  );

  const removeNote = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await NoteService.deleteNote(id);
        await fetchNotes();
      } catch (err: any) {
        console.error('Failed to delete note:', err);
        setError(err.message ?? 'Failed to delete note');
      } finally {
        setLoading(false);
      }
    },
    [fetchNotes]
  );

  const isEmpty = !loading && notes.length === 0;
  const isLoading = loading;
  const isError = Boolean(error);

  return {
    // 数据状态
    notes,
    page,
    pageSize,
    totalPages,
    totalElements,
    searchText,

    fetchNotes,
    createNote,
    removeNote,
    setPage,
    setPageSize,
    setSearchText,
    clearSearch,

    isEmpty,
    isLoading,
    isError,
  };
}
