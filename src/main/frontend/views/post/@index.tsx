import { Grid } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { GlassBox } from 'Frontend/components/GlassBox';
import FolderSidebar from 'Frontend/post/FolderSidebar';
import PostSearch from 'Frontend/post/PostSearch';

export const config: ViewConfig = {
  menu: {
    order: 2,
    icon: 'DescriptionIcon',
  },
  title: '文章',
};

export default function AdminView() {
  return (
    <Grid container spacing={1} columns={24}>
      <Grid size={4}>
        <FolderSidebar />
      </Grid>
      <Grid size={17}>
        <GlassBox
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}>
          <PostSearch />
        </GlassBox>
      </Grid>
      <Grid size={3}>
        <GlassBox sx={{ position: 'sticky', top: '50px', minHeight: '100%' }}>tag</GlassBox>
      </Grid>
    </Grid>
  );
}
