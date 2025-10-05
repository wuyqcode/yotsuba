import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import PostPage from 'Frontend/features/post/components/PostPage';

export const config: ViewConfig = {
  menu: {
    order: 2,
    icon: 'DescriptionIcon',
  },
  title: '文章',
};

export default function Post() {
  return <PostPage />;
}


