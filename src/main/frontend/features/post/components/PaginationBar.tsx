import { Box, Typography, Pagination, Select, MenuItem, FormControl, TextField, PaginationItem } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useState } from 'react';

export default function SmartPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onPageSizeChange: (value: number) => void;
}) {
  const [jumpPage, setJumpPage] = useState<string>('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpPage);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(null as any, target);
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
        共 {totalItems} 条 · 第 {page} / {totalPages} 页
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={onPageChange}
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

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <Select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[5, 10, 20, 50].map((size) => (
            <MenuItem key={size} value={size}>
              {size}/页
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <form onSubmit={handleJump}>
        <TextField
          size="small"
          placeholder="跳转页"
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          sx={{ width: 80 }}
        />
      </form>
    </Box>
  );
}
