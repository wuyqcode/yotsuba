import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { ChangeEvent, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import Editor from 'Frontend/components/EditorWrapper';
import { PostService } from 'Frontend/generated/endpoints';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useLocation, useNavigate, useParams } from 'react-router';
import { GlassBox } from 'Frontend/components/GlassBox';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export default function PostDetail() {
  const { postId } = useParams();
  if (!postId) {
    throw new Error('postId is required but not found');
  }
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState<PostDto>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [paperHeight, setPaperHeight] = useState<number>(0);
  const fromSearch = (location.state as { fromSearch?: string })?.fromSearch || '';

  const measuredRef = useCallback((node: any) => {
    if (node !== null) {
      setPaperHeight(node.getBoundingClientRect().height);
    }
  }, []);

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
      await PostService.updatePost(postId, post?.title ?? '', post?.cover ?? '', post?.content ?? '');

      if (closeAfterSave) {
        closePostEditor();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const closePostEditor = () => {
    navigate({
      pathname: '/post',
      search: fromSearch,
    });
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
    <GlassBox
      sx={{
        height: 'calc(100dvh - 50px)',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}>
      {postId && post && (
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
    </GlassBox>
  );
}
