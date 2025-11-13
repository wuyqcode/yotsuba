import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Box, Fab, SwipeableDrawer, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from 'Frontend/features/note/components/Sidebar';
import ContextHeader from 'Frontend/features/note/components/ContextHeader';
import NoteCard from 'Frontend/features/note/components/NoteCard';
import PaginationBar from 'Frontend/features/note/components/PaginationBar';
import SearchResultCard from 'Frontend/features/note/components/SearchResultCard';
import { useNoteStore } from 'Frontend/features/note/hooks/useNotes';
import { useCollectionStore } from 'Frontend/features/note/hooks/useCollection';

export const config: ViewConfig = {
  menu: { order: 2, icon: 'DescriptionIcon' },
  title: '笔记',
};

export default function NoteListView() {
  const [open, setOpen] = useState(false);

  const notes = useNoteStore((s) => s.notes);
  const page = useNoteStore((s) => s.page);
  const pageSize = useNoteStore((s) => s.pageSize);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const isEmpty = useNoteStore((s) => s.notes.length === 0 && !s.loading);
  const isLoading = useNoteStore((s) => s.loading);
  const isError = useNoteStore((s) => !!s.error);
  const searchText = useNoteStore((s) => s.searchText);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);

  useEffect(() => {
    fetchNotes();
  }, [page, pageSize, fetchNotes, selectedCollection]);

  return (
    <Box sx={{ display: { xs: 'block', lg: 'flex' } }}>
      {/* Sidebar */}
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
        <ContextHeader />

        <Divider sx={{ my: 2 }} />

        {/* 内容 */}
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
            {notes?.map((note) =>
              searchText?.trim() ? (
                <Grid key={note.id} size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                  <SearchResultCard note={note} />
                </Grid>
              ) : (
                <Grid key={note.id} size={{ xs: 6, sm: 3, md: 2.4, lg: 2 }}>
                  <NoteCard note={note} />
                </Grid>
              )
            )}
          </Grid>
        </Box>

        {/* 分页 */}
        <Box sx={{ mt: 'auto', pb: 2 }}>
          <PaginationBar />
        </Box>
      </Box>

      {/* 小屏 Drawer */}
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

      <SwipeableDrawer anchor="left" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, height: '100%', overflow: 'auto', p: 2 }}>
          <Sidebar />
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
