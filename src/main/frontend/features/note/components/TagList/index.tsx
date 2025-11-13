import { useEffect, useState } from 'react';
import { Box, Stack, Typography, TextField, IconButton, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTagStore } from 'Frontend/features/note/hooks/useTagStore';
import TagChip from './TagChip';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';
import { useCollectionStore } from 'Frontend/features/note/hooks/useCollection';

const TagList = () => {
  const tags = useTagStore((s) => s.tags);
  const selectedTags = useTagStore((s) => s.selectedTags);
  const addTag = useTagStore((s) => s.addTag);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const loading = useTagStore((s) => s.loading);
  const error = useTagStore((s) => s.error);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const [tagName, setTagName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = async () => {
    const value = tagName.trim();
    if (!value || adding || !selectedCollection?.id) return;

    try {
      setAdding(true);
      await addTag(selectedCollection.id, value);
      setTagName('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box
      p={2}
      sx={{
        flex: 1,
      }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.secondary',
          mb: 1,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>
        标签
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          size="small"
          value={tagName}
          placeholder="输入标签名称"
          onChange={(e) => setTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={handleAddTag}
                  disabled={adding || !tagName.trim() || !selectedCollection?.id}
                  sx={{
                    color: 'primary.main',
                  }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              ),
            },
          }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                py: 2,
              }}>
              <CircularProgress size={20} />
            </Box>
          )}
          {error && !loading && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          {!loading && !error && tags.map((tag: TagDto) => {
            const selected = selectedTags.some((t) => t.id === tag.id);
            return <TagChip key={tag.id} tag={tag} selected={selected} />;
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default TagList;
