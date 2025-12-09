import { Box, Typography, Pagination, Select, MenuItem, FormControl, TextField, PaginationItem } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useState } from 'react';

export interface PaginationBarProps {
  /** 当前页码（1-based） */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 总记录数 */
  totalElements: number;
  /** 每页大小 */
  pageSize: number;
  /** 可选的每页大小选项，默认为 [12, 24, 48, 96, 192] */
  pageSizeOptions?: number[];
  /** 页码变化回调 */
  onPageChange: (page: number) => void;
  /** 每页大小变化回调 */
  onPageSizeChange: (pageSize: number) => void;
  /** 是否显示跳转页输入框，默认为 true */
  showJumpToPage?: boolean;
  /** 是否显示每页大小选择器，默认为 true */
  showPageSizeSelector?: boolean;
}

export default function PaginationBar({
  page,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = [12, 24, 48, 96, 192],
  onPageChange,
  onPageSizeChange,
  showJumpToPage = true,
  showPageSizeSelector = true,
}: PaginationBarProps) {
  const [jumpPage, setJumpPage] = useState<string>('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpPage);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setJumpPage('');
    }
  };

  return (
    <Box
      mt={4}
      p={2}
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}>
      <Typography variant="body2" color="text.secondary">
        共 {totalElements} 条 · 第 {page} / {totalPages} 页
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, newPage) => {
          onPageChange(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        color="primary"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        renderItem={(item) => (
          <PaginationItem
            {...item}
            slots={{
              previous: ArrowBack,
              next: ArrowForward,
            }}
          />
        )}
      />

      {showPageSizeSelector && (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={pageSize}
            onChange={(e) => {
              onPageChange(1);
              onPageSizeChange(Number(e.target.value));
            }}>
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}/页
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showJumpToPage && (
        <form onSubmit={handleJump}>
          <TextField
            size="small"
            placeholder="跳转页"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            sx={{ width: 80 }}
          />
        </form>
      )}
    </Box>
  );
}

