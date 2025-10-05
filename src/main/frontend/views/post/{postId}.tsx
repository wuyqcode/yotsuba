import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useParams } from 'react-router';
import PostDetailPage from 'Frontend/features/post/components/PostDetailPage';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export default function PostDetail() {
  const { postId } = useParams();
  if (!postId) {
    throw new Error('postId is required but not found');
  }

  return <PostDetailPage postId={postId} />;
}

