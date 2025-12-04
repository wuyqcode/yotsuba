import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Box, Fab, SwipeableDrawer, Typography, Grid, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from 'Frontend/features/note/components/Sidebar';
import ContextHeader from 'Frontend/features/note/components/ContextHeader';
import NoteCard from 'Frontend/features/note/components/NoteCard';
import PaginationBar from 'Frontend/features/note/components/PaginationBar';
import SearchResultCard from 'Frontend/features/note/components/SearchResultCard';
import { useNoteStore } from 'Frontend/features/note/hooks/useNotes';
import { useCollectionStore } from 'Frontend/features/note/hooks/useCollection';
import { useTagStore } from 'Frontend/features/note/hooks/useTagStore';
import { useLock } from 'Frontend/features/note/hooks/useLock';
import { TagEndpoint } from 'Frontend/generated/endpoints';

export const config: ViewConfig = {
  menu: { order: 2, icon: 'DescriptionIcon' },
  loginRequired: true,
  title: '笔记',
};

export default function NoteListView() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const isEmpty = useNoteStore((s) => s.notes.length === 0 && !s.loading);
  const isLoading = useNoteStore((s) => s.loading);
  const isError = useNoteStore((s) => !!s.error);
  const viewMode = useNoteStore((s) => s.viewMode);
  const fetchCollections = useCollectionStore((s) => s.fetchCollections);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const addSelectedTag = useTagStore((s) => s.addSelectedTag);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const { run: runFetchTags } = useLock('fetchTags');

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const id = selectedCollection?.id;
    if (!id) return;

    runFetchTags(() => fetchTags(id));
  }, [selectedCollection?.id]);

  // 从 URL 读取 tagId 参数并设置选中的标签
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagId = params.get('tagId');

    if (!selectedCollection?.id) return;

    const loadTagAndSelect = async () => {
      try {
        if (tagId) {
          const tags = await TagEndpoint.findAllTags(selectedCollection.id, [tagId]);
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            await addSelectedTag(tag);
          }
        }
      } catch (error) {
        console.error('加载标签失败:', error);
      } finally {
        // 不管有没有 tag，都触发一次笔记列表加载
        fetchNotes();

        // 清理 URL 参数，避免再次触发
        if (tagId) {
          params.delete('tagId');
          navigate({ search: params.toString() }, { replace: true });
        }
      }
    };

    loadTagAndSelect();
  }, [location.search, selectedCollection?.id, addSelectedTag, fetchNotes, navigate]);


  console.log('NoteListView render');
  return (
    <Box sx={{ display: { xs: 'block', lg: 'flex' } }}>
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
            <Box
              sx={{
                opacity: isLoading ? 0 : 1,
                visibility: isLoading ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s ease',
              }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {notes?.map((note) =>
                  viewMode === 'list' ? (
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
