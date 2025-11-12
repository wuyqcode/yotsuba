import { Box, Typography, Pagination, Select, MenuItem, FormControl, TextField, PaginationItem } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useState } from 'react';
import { useNotes } from 'Frontend/features/note/hooks/useNotes';

export default function PaginationBar() {
  const { page, totalPages, totalElements, pageSize, setPage, setPageSize } = useNotes();

  const [jumpPage, setJumpPage] = useState<string>('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpPage);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
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
          setPage(newPage);
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

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <Select
          value={pageSize}
          onChange={(e) => {
            setPage(1);
            setPageSize(Number(e.target.value));
          }}>
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
