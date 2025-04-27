import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { ChangeEvent, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import Editor from 'Frontend/components/Editor';
import { PostService } from 'Frontend/generated/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useNavigate, useParams } from 'react-router';
import { GlassBox } from 'Frontend/components/GlassBox';
import FileExplorer from 'Frontend/components/FileExplorer';

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
    <Box sx={{ display: 'flex', height: '100%', p: 1, gap: 1 }}>
      {/* 左侧 Tree */}
      <GlassBox
        sx={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid rgba(0,0,0,0.08)',
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
        }}>
        <FileExplorer />
      </GlassBox>

      {/* 右侧 编辑区 */}
      <GlassBox
        sx={{
          flexGrow: 1,
          display: 'flex',
          p: 2,
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'white ',
        }}>
        {postId && post && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight="bold"
                  sx={{ cursor: 'pointer' }}
                  onClick={closePostEditor}>
                  post /
                </Typography>
                <TextField
                  label="Title"
                  value={post.title}
                  onChange={handleTitleChange}
                  size="small"
                  sx={{ maxWidth: 300 }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="secondary" onClick={closePostEditor}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleSave(true)}>
                  Save
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                '.reactjs-tiptap-editor': {
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  '& > *': {
                    display: 'contents',
                    '& > *': {
                      display: 'contents',
                    },
                  },
                },
                '.editor': {
                  flex: '1 1 auto',
                  overflow: 'auto',
                  minHeight: 0,
                  '.ProseMirror': {
                    padding: '4px !important',
                  },
                },
              }}>
              {/* 富文本编辑器区域 */}
              <Editor content={post?.content ?? ''} onChange={onChange} />
            </Box>
          </>
        )}
      </GlassBox>
    </Box>
  );
}
