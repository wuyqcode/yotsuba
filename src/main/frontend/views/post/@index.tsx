import { Grid } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { GlassBox } from 'Frontend/components/GlassBox';
import FolderSidebar from 'Frontend/post/CollectionSidebar';
import PostSearch from 'Frontend/post/PostSearch';
import TagSidebar from 'Frontend/post/TagSidebar';

export const config: ViewConfig = {
  menu: {
    order: 2,
    icon: 'DescriptionIcon',
  },
  title: '文章',
};

function getRandomTags(count: number): string[] {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: count }, () =>
    Array.from({ length: Math.floor(Math.random() * 8) + 3 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('')
  );
}

const tags = getRandomTags(200); // 生成 20 个随机标签

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
        <TagSidebar />
      </Grid>
    </Grid>
  );
}
