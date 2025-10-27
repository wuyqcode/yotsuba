import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Box, Fab, SwipeableDrawer, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from 'Frontend/features/note/components/Sidebar';
import { useNavigate } from 'react-router';
import ContextHeader from 'Frontend/features/note/components/ContextHeader';
import NoteCard from 'Frontend/features/note/components/NoteCard';
import { useNotes } from 'Frontend/features/note/hooks/useNotes';
import PaginationBar from 'Frontend/features/note/components/PaginationBar';

export const config: ViewConfig = {
  menu: {
    order: 2,
    icon: 'DescriptionIcon',
  },
  title: '笔记',
};

export default function NoteListView() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const {
    notes,
    page,
    totalPages,
    totalElements,
    pageSize,
    searchText,
    fetchNotes,
    setPage,
    setPageSize,
    setSearchText,
    createNote,
    isEmpty,
    isLoading,
    isError,
  } = useNotes();

  useEffect(() => {
    fetchNotes();
  }, [page, searchText, pageSize, fetchNotes]);

  const onPageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPageSizeChange = (newSize: number) => {
    setPage(1);
    setPageSize(newSize);
  };

  const onCreateNote = async () => {
    const newNoteId = await createNote();
    if (newNoteId) navigate(`/note/media/${newNoteId}/edit`);
  };

  return (
    <Box sx={{ display: { xs: 'block', lg: 'flex' } }}>
      {/* 大屏 Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          top: '50px',
          left: 0,
          bottom: 0,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          width: '260px',
          height: 'calc(100vh - 50px)',
          overflow: 'auto',
          borderRight: '1px solid #eee',
          bgcolor: '#fff',
        }}>
        <Sidebar />
      </Box>

      {/* 主内容区 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 50px)',
          px: 1,
          width: { lg: 'calc(100% - 260px)' },
          ml: { lg: '260px' },
        }}>
        <ContextHeader
          searchText={searchText}
          handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          handleSearch={() => setSearchText(searchText)}
          handleCreatePost={onCreateNote}
        />

        <Divider sx={{ my: 2 }} />

        {/* 主体内容区 */}
        <Box sx={{ flexGrow: 1 }}>
          {isLoading && (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Typography color="error" textAlign="center" mt={4}>
              Failed to load notes
            </Typography>
          )}

          {isEmpty && !isLoading && (
            <Typography textAlign="center" mt={4}>
              No notes found
            </Typography>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {notes?.map((note) => (
              <Grid key={note.id} size={{ xs: 6, sm: 3, md: 2.4, lg: 2 }}>
                <NoteCard note={note} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 底部的分页条 */}
        <Box sx={{ mt: 'auto', pb: 2 }}>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </Box>
      </Box>

      {/* 小屏悬浮按钮 */}
      <Fab
        color="primary"
        aria-label="open sidebar"
        onClick={() => setOpen(!open)}
        sx={{
          display: { xs: 'flex', lg: 'none' },
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1300,
        }}>
        <MenuIcon />
      </Fab>

      {/* 小屏 Drawer */}
      <SwipeableDrawer anchor="left" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, height: '100%', overflow: 'auto', p: 2 }}>
          <Sidebar />
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
