import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  ChangeEvent,
  useEffect,
  useState,
  KeyboardEvent,
  useCallback
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { PostService } from 'Frontend/generated/endpoints';
import PostDto from 'Frontend/generated/io/github/dutianze/cms/application/dto/PostDto';

export const config: ViewConfig = {
  menu: { exclude: true }
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
  const [hovered, setHovered] = useState(false);
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
    setPost((prevPost) =>
      prevPost ? { ...prevPost, content: content } : prevPost
    );
  };

  const handleSave = (closeAfterSave = false) => {
    PostService.updatePost(postId, post?.title, post?.cover, post?.content);
    if (closeAfterSave) {
      closePostEditor();
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
    setPost((prevPost) =>
      prevPost ? { ...prevPost, title: e.target.value } : prevPost
    );
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
    formData.append('postId', postId);
    console.log(formData);

    fetch('http://localhost:8080/api/file-resource', {
      method: 'POST',
      body: formData
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        return response.text();
      })
      .then((imageUrl) => {
        setPost((prevPost) =>
          prevPost ? { ...prevPost, cover: imageUrl } : undefined
        );
      })
      .catch((error) => {
        console.error('Failed to upload image:', error);
      });
  };

  const handleImageClear = () => {
    setPost((prevPost) =>
      prevPost ? { ...prevPost, cover: undefined } : prevPost
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        margin: 'auto',
        fontFamily: 'Press Start 2P'
      }}
    >
      {postId && post && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}>
              <Typography
                variant="body1"
                color="primary"
                fontWeight="bold"
                sx={{ marginRight: 1 }}
                onClick={closePostEditor}
              >
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
              <Button
                variant="contained"
                color="secondary"
                onClick={closePostEditor}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSave(true)}
              >
                Save
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'flex',
              height: '100%',
              fontFamily: 'Press Start 2P',
              '& #ReactEditor': {
                flexGrow: 1,
                width: '100%',
                overflowY: 'auto'
              },
              '& .milkdown': {
                width: '100%',
                height: `${paperHeight}px`,
                maxHeight: `${paperHeight}px`,
                overflowY: 'auto'
              }
            }}
          >
            <MilkdownEditor
              postId={postId}
              content={post?.content ?? ''}
              onChange={onChange}
            />

            <Paper
              elevation={3}
              ref={measuredRef}
              sx={{
                flexGrow: 0,
                width: '260px',
                maxWidth: '260px',
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 2
              }}
            >
              <Box
                component={'label'}
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed grey',
                  cursor: 'pointer'
                }}
                htmlFor="contained-button-file"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {post.cover ? (
                  <Box
                    component="img"
                    src={post.cover}
                    sx={{
                      width: '100%',
                      objectFit: 'cover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 48, color: 'grey' }} />
                )}

                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="contained-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                {post.cover && hovered && (
                  <IconButton
                    onClick={handleImageClear}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      boxShadow: 3
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <TextField
                label="Add a tag"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                margin="normal"
                size="small"
              />
              <Box
                sx={{
                  width: '100%',
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  alignContent: 'flex-start',
                  flex: '1 0 0',
                  gap: '4px'
                }}
              >
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={handleDeleteTag(tag)}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
