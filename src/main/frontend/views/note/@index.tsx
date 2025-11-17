import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Box, Fab, SwipeableDrawer, Typography, Grid, Divider, Skeleton } from '@mui/material';
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
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
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

          <Box sx={{ position: 'relative', minHeight: isLoading ? '200px' : 0 }}>
            {/* 骨架屏 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: isLoading ? 1 : 0,
                visibility: isLoading ? 'visible' : 'hidden',
                transition: 'opacity 0.3s ease, visibility 0.3s ease',
                pointerEvents: isLoading ? 'auto' : 'none',
              }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {searchText?.trim() ? (
                  // 搜索结果骨架屏
                  Array.from({ length: 3 }).map((_, index) => (
                    <Grid key={`skeleton-search-${index}`} size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'center',
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}>
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            width: { xs: '100%', sm: 140 },
                            height: { xs: 140, sm: 100 },
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, p: 2, width: '100%' }}>
                          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="100%" height={20} />
                          <Skeleton variant="text" width="80%" height={20} />
                        </Box>
                        <Box sx={{ pr: 1, display: 'flex', alignItems: 'center' }}>
                          <Skeleton variant="circular" width={40} height={40} />
                        </Box>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  // 笔记卡片骨架屏
                  Array.from({ length: 12 }).map((_, index) => (
                    <Grid key={`skeleton-note-${index}`} size={{ xs: 6, sm: 3, md: 2.4, lg: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            borderRadius: 2,
                            mb: 1,
                          }}
                        />
                        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </Box>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>

            {/* 实际内容 */}
            <Box
              sx={{
                opacity: isLoading ? 0 : 1,
                visibility: isLoading ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s ease',
              }}>
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
          </Box>
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
