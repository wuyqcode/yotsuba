import { MilkdownProvider } from '@milkdown/react';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { PostService } from 'Frontend/generated/endpoints';
import Post from 'Frontend/generated/io/github/dutianze/cms/domain/Post';
import PostId from 'Frontend/generated/io/github/dutianze/cms/domain/PostId';
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

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: 2
      }}
    >
      <Box sx={{ flexGrow: 5, p: 2 }}>
        <MilkdownProvider>
          <MilkdownEditor post={post} setPost={setPost} />
        </MilkdownProvider>
      </Box>

      <Box
        sx={{
          flex: '1 0 200px',
          p: 2,
          borderLeft: 1,
          borderColor: 'grey.300'
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          封面图
        </Typography>
        <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
          点击选择文件
        </Button>

        <Divider sx={{ my: 2 }} />

        <TextField variant="outlined" fullWidth label="标题" sx={{ mb: 2 }} />

        <TextField
          variant="outlined"
          fullWidth
          label="标签"
          defaultValue="test"
          sx={{ mb: 2 }}
          helperText="此文章将可通过以下链接访问 https://example.com/test"
        />

        <TextField
          variant="outlined"
          fullWidth
          label="摘要"
          multiline
          rows={4}
          placeholder="留空则使用自动生成的摘要"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() =>
            PostService.updatePost(post.id, post.title, post.content)
          }
        >
          更新
        </Button>
      </Box>
    </Box>
  );
}
