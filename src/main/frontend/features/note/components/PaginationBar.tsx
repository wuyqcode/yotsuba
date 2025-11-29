import PaginationBar from 'Frontend/components/PaginationBar';
import { useNoteStore } from '../hooks/useNotes';

export default function NotePaginationBar() {
  const page = useNoteStore((s) => s.page);
  const totalPages = useNoteStore((s) => s.totalPages);
  const totalElements = useNoteStore((s) => s.totalElements);
  const pageSize = useNoteStore((s) => s.pageSize);

  const setPage = useNoteStore((s) => s.setPage);
  const setPageSize = useNoteStore((s) => s.setPageSize);

  return (
    <PaginationBar
        page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
        />
  );
}
