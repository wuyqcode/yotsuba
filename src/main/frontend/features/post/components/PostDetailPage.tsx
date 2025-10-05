import { Box, Button, Stack, TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState, KeyboardEvent } from 'react';
import Editor from 'Frontend/components/EditorWrapper';
import { PostService } from 'Frontend/generated/endpoints';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useNavigate } from 'react-router';

interface PostDetailPageProps {
  postId: string;
}

export default function PostDetailPage({ postId }: PostDetailPageProps) {
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDto>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    PostService.findById(postId)
      .then((data) => {
        if (data) {
          setPost(data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch post:', error);
      });
  }, [postId]);

  const onChange = (content: string) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, content: content } : prevPost));
  };

  const handleSave = async (closeAfterSave = false) => {
    try {
      await PostService.updatePost(postId, post?.title ?? '', post?.cover ?? '', post?.content ?? '');
      if (closeAfterSave) {
        closePostEditor();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const closePostEditor = () => {
    navigate(-1);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, title: e.target.value } : prevPost));
  };

  return (
    <Box sx={{ mx: 2, mt: 2 }}>
      {post && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Title"
              value={post.title}
              onChange={handleTitleChange}
              size="small"
              sx={{ maxWidth: 300 }}
            />

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="secondary" onClick={closePostEditor}>
                close
              </Button>
              <Button variant="contained" color="primary" onClick={() => handleSave(false)}>
                Save
              </Button>
            </Stack>
          </Box>

          <Editor content={post?.content ?? ''} onChange={onChange} />
        </Box>
      )}
    </Box>
  );
}
