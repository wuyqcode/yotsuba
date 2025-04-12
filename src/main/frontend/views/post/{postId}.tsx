import { Box, Button, Chip, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { ChangeEvent, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import Editor from 'Frontend/components/Editor';
import { PostService } from 'Frontend/generated/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useNavigate, useParams } from 'react-router';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export default function MilkdownEditorWrapper() {
  const { postId } = useParams();
  if (!postId) {
    throw new Error('postId is required but not found');
  }
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDto>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [paperHeight, setPaperHeight] = useState<number>(0);
  const measuredRef = useCallback((node: any) => {
    if (node !== null) {
      setPaperHeight(node.getBoundingClientRect().height);
    }
  }, []);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (postId) {
      PostService.findById(postId)
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

  const onChange = (content: string) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, content: content } : prevPost));
  };

  const handleSave = async (closeAfterSave = false) => {
    try {
      await PostService.updatePost(postId, post?.title, post?.cover, post?.content);

      // 使 'posts' 查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      if (closeAfterSave) {
        closePostEditor();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      // 这里可以添加错误处理，比如显示一个错误消息
    }
  };

  const closePostEditor = () => {
    navigate('/post');
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => () => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, title: e.target.value } : prevPost));
  };

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files?.[0]) {
      return;
    }

    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    console.log(formData);

    fetch('http://localhost:8080/api/file-resource', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        return response.text();
      })
      .then((imageUrl) => {
        setPost((prevPost) => (prevPost ? { ...prevPost, cover: imageUrl } : undefined));
      })
      .catch((error) => {
        console.error('Failed to upload image:', error);
      });
  };

  const handleImageClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setPost((prevPost) => (prevPost ? { ...prevPost, cover: undefined } : prevPost));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        margin: 'auto',
        fontFamily: 'Press Start 2P',
        padding: '16px',
      }}>
      {postId && post && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}>
              <Typography
                variant="body1"
                color="primary"
                fontWeight="bold"
                sx={{ marginRight: 1 }}
                onClick={closePostEditor}>
                post /
              </Typography>
              <TextField
                label="Title"
                value={post.title}
                onChange={handleTitleChange}
                size="small"
                sx={{ maxWidth: '300px' }}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="secondary" onClick={closePostEditor}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={() => handleSave(true)}>
                Save
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              overflow: 'auto',
              '& .richtext-overflow-hidden': {
                overflow: 'visible !important',
              },
            }}>
            <Editor content={post?.content ?? ''} onChange={onChange} />
          </Box>
        </>
      )}
    </Box>
  );
}
