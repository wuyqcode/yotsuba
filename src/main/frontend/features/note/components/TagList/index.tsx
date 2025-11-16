import { useEffect } from 'react';
import { Box, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { useTagStore } from 'Frontend/features/note/hooks/useTagStore';
import { useCollectionStore } from 'Frontend/features/note/hooks/useCollection';
import TagChip from './TagChip';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';

const TagList = () => {
  const tags = useTagStore((s) => s.tags);
  const selectedTags = useTagStore((s) => s.selectedTags);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const loading = useTagStore((s) => s.loading);
  const error = useTagStore((s) => s.error);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);

  useEffect(() => {
    fetchTags(selectedCollection?.id);
  }, [fetchTags, selectedCollection?.id]);

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
