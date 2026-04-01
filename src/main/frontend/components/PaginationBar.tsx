import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showJumpToPage?: boolean;
  showPageSizeSelector?: boolean;
}

function getPages(page: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
  if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '…', page - 1, page, page + 1, '…', totalPages];
}

export default function PaginationBar({
  page,
  totalPages,
  totalElements: _totalElements,
  pageSize,
  pageSizeOptions = [12, 24, 48, 96, 192],
  onPageChange,
  onPageSizeChange,
  showJumpToPage: _showJumpToPage = true,
  showPageSizeSelector = true,
}: PaginationBarProps) {
  const pageSizeId = useId();

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mb-8 mt-5 flex justify-center">
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="inline-flex items-center gap-0.5 rounded-full px-1 py-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {getPages(page, totalPages).map((item, index) =>
            item === '…' ? (
              <span key={index} className="inline-flex h-9 min-w-6 items-center justify-center px-1 text-xs text-slate-300">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => changePage(item as number)}
                className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xs font-semibold [font-variant-numeric:tabular-nums] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                  item === page
                    ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}>
                {item}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {showPageSizeSelector && (
          <>
            <div className="mx-1 h-6 w-px bg-slate-200" />
            <label
              htmlFor={pageSizeId}
              className="inline-flex items-center gap-2 pr-2">
              <span className="pl-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Size
              </span>
              <select
                id={pageSizeId}
                aria-label="Page size"
                name="page_size"
                autoComplete="off"
                value={pageSize}
                onChange={(e) => {
                  onPageChange(1);
                  onPageSizeChange(Number(e.target.value));
                  e.currentTarget.blur();
                }}
                className="h-9 cursor-pointer appearance-none rounded-full border-0 bg-white px-3 text-xs text-slate-700 [font-variant-numeric:tabular-nums] transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
    </section>
  );
}
