import { useNoteStore } from 'Frontend/features/note/stores/noteStore';

export function useNotes() {
  const notes = useNoteStore((s) => s.notes);
  const page = useNoteStore((s) => s.page);
  const totalPages = useNoteStore((s) => s.totalPages);
  const totalElements = useNoteStore((s) => s.totalElements);
  const pageSize = useNoteStore((s) => s.pageSize);
  const searchText = useNoteStore((s) => s.searchText);
  const loading = useNoteStore((s) => s.loading);
  const error = useNoteStore((s) => s.error);

  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const setPage = useNoteStore((s) => s.setPage);
  const setPageSize = useNoteStore((s) => s.setPageSize);
  const setSearchText = useNoteStore((s) => s.setSearchText);
  const clearSearch = useNoteStore((s) => s.clearSearch);
  const createNote = useNoteStore((s) => s.createNote);
  const removeNote = useNoteStore((s) => s.removeNote);

  const isEmpty = !loading && notes.length === 0;
  const isLoading = loading;
  const isError = Boolean(error);

  const updateSearch = (text: string) => {
    setSearchText(text);
    setPage(1);
    fetchNotes(1);
  };

  const updatePage = (newPage: number) => {
    setPage(newPage);
    fetchNotes(newPage);
  };

  const updatePageSize = (size: number) => {
    setPageSize(size);
    fetchNotes(1);
  };

  const resetSearch = () => {
    clearSearch();
    fetchNotes(1);
  };

  return {
    notes,
    page,
    totalPages,
    pageSize,
    totalElements,
    searchText,
    fetchNotes,
    setPage: updatePage,
    setPageSize: updatePageSize,
    setSearchText: updateSearch,
    clearSearch: resetSearch,
    createNote,
    removeNote,
    isEmpty,
    isLoading,
    isError,
  };
}
