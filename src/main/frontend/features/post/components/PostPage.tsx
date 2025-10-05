import { Box, Fab, SwipeableDrawer } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import PostListPage from 'Frontend/features/post/components/PostListPage';
import Sidebar from 'Frontend/features/post/components/Sidebar';

export default function PostPage() {
  const [open, setOpen] = useState(false);

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
          minHeight: '80vh',
          px: 1,
          width: { lg: 'calc(100% - 260px)' },
          ml: { lg: '260px' },
        }}>
        <PostListPage />
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
      <SwipeableDrawer anchor="bottom" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
          <Sidebar />
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
