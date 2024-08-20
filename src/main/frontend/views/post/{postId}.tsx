import { Box, Button, Chip, IconButton, Paper, TextField } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  ChangeEvent,
  useEffect,
  useState,
  KeyboardEvent,
  useCallback,
  FormEvent
} from 'react';
import { useParams } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import Post from 'Frontend/generated/io/github/dutianze/cms/domain/Post';
import { PostService } from 'Frontend/generated/endpoints';
import PostId from 'Frontend/generated/io/github/dutianze/cms/domain/PostId';
import PostContent from 'Frontend/generated/io/github/dutianze/cms/domain/valueobject/PostContent';
import PostCover from 'Frontend/generated/io/github/dutianze/cms/domain/valueobject/PostCover';

export const config: ViewConfig = {
  menu: { exclude: true }
};

export default function MilkdownEditorWrapper() {
  const { postId } = useParams();
  if (!postId) {
    throw new Error('postId is required but not found');
  }

  const [post, setPost] = useState<Post>();
  const [title, setTitle] = useState<string>('Hello World');
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

  const onChange = (content: string) => {
    const contentObject: PostContent = { content: content };
    setPost((prevPost) =>
      prevPost ? { ...prevPost, content: contentObject } : prevPost
    );
  };

  const handleSave = () => {
    PostService.updatePost(post);
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
      prevPost ? { ...prevPost, title: { title: e.target.value } } : prevPost
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
        const postCoverObject: PostCover = { cover: imageUrl };
        setPost((prevPost) => {
          if (prevPost) {
            return {
              ...prevPost,
              cover: postCoverObject
            };
          } else {
            return undefined;
          }
        });
      })
      .catch((error) => {
        console.error('Failed to upload image:', error);
      });
  };

  const handleImageClear = () => {
    const postCoverObject: PostCover = { cover: undefined };
    setPost((prevPost) => {
      if (prevPost) {
        return {
          ...prevPost,
          cover: postCoverObject
        };
      } else {
        return undefined;
      }
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        border: '2px solid black',
        margin: 'auto',
        fontFamily: 'Press Start 2P',
        padding: 2,
        background: 'rgba(68, 71, 90, 1)',
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
      {postId && post && (
        <>
          <MilkdownEditor
            postId={postId}
            content={post?.content?.content ?? ''}
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
              alignItems: 'center',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ alignSelf: 'end' }}
            >
              Save
            </Button>
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
              {post.cover.cover ? (
                <Box
                  component="img"
                  src={post.cover.cover}
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
              {post.cover.cover && hovered && (
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
              label="Title"
              value={post.title.title}
              onChange={handleTitleChange}
              margin="normal"
              size="small"
            />
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
                <Chip key={index} label={tag} onDelete={handleDeleteTag(tag)} />
              ))}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
