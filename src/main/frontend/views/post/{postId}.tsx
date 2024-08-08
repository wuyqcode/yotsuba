import { PhotoCamera } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  TextField
} from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { PostService } from 'Frontend/generated/endpoints';
import Post from 'Frontend/generated/io/github/dutianze/cms/domain/Post';
import PostId from 'Frontend/generated/io/github/dutianze/cms/domain/PostId';
import PostContent from 'Frontend/generated/io/github/dutianze/cms/domain/valueobject/PostContent';
import {
  ChangeEvent,
  useEffect,
  useState,
  KeyboardEvent,
  useRef,
  useCallback
} from 'react';
import { useParams } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { exclude: true }
};

export default function MilkdownEditorWrapper() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [title, setTitle] = useState<string>('Hello World');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [image, setImage] = useState(null);

  const [paperHeight, setPaperHeight] = useState<number>(0);

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

  if (!post || !setPost) {
    return <div>Post ID is missing</div>;
  }

  const onChange = (content: string) => {
    const contentObject: PostContent = { content: content };
    setPost({ ...post, content: contentObject });
  };

  const handleSave = () => {
    console.log('Title:', title);
    console.log('Tags:', tags);
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
    setTitle(e.target.value);
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
      <MilkdownEditor
        content={post?.content?.content ?? ''}
        onChange={onChange}
      />
      <CssBaseline />

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
          sx={{ alignSelf: 'center' }}
        >
          Save
        </Button>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            width: '100px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
            >
              <input
                type="file"
                accept="image/*"
                hidden
                // onChange={handleImageUpload}
              />
              <PhotoCamera />
            </IconButton>
          )}
        </Box>
        <TextField
          label="Title"
          value={title}
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
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            overflowY: 'auto'
          }}
        >
          {tags.map((tag, index) => (
            <Chip
              key={index}
              sx={{
                height: 'auto'
              }}
              label={tag}
              onDelete={handleDeleteTag(tag)}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
