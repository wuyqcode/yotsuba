import { Height } from '@mui/icons-material';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { PostService } from 'Frontend/generated/endpoints';
import Post from 'Frontend/generated/io/github/dutianze/cms/domain/Post';
import PostId from 'Frontend/generated/io/github/dutianze/cms/domain/PostId';
import PostContent from 'Frontend/generated/io/github/dutianze/cms/domain/valueobject/PostContent';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { exclude: true }
};

export default function MilkdownEditorWrapper() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | undefined>(undefined);

  useEffect(() => {
    if (postId) {
      const postIdObject: PostId = { id: postId };
      PostService.findById(postIdObject)
        .then((data) => {
          if (data) {
            setPost(data);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch post:', error);
        });
    }
  }, [postId]);

  if (!post || !setPost) {
    return <div>Post ID is missing</div>;
  }

  const onChange = (content: string) => {
    const contentObject: PostContent = { content: content };
    setPost({ ...post, content: contentObject });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        border: '2px solid black',
        margin: 'auto',
        fontFamily: 'Press Start 2P',
        '& div': {
          // minHeight: '100%'
        }
      }}
    >
      <MilkdownEditor
        content={post?.content?.content ?? ''}
        onChange={onChange}
      />
    </Box>
  );
}
