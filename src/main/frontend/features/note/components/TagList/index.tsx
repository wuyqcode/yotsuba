import { Box, Stack, Typography } from '@mui/material';
import { useSelectedTagsStore } from 'Frontend/features/note/hooks/useSelectedTagsStore';
import { Tag, useTagStore } from 'Frontend/features/note/hooks/useTagStore';
import TagChip from './TagChip';

const TagList = () => {
  const { tags } = useTagStore();
  const { selectedTags, toggleTag } = useSelectedTagsStore();

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
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {tags.map((tag: Tag) => {
          const selected = selectedTags.some((t) => t.id === tag.id);
          return <TagChip key={tag.id} tag={tag} selected={selected} onClick={() => toggleTag(tag)} />;
        })}
      </Stack>
    </Box>
  );
};

export default TagList;
