import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import TagChip from 'Frontend/features/post/components/TagChip';
import { useSelectedTagsStore } from 'Frontend/features/post/hooks/useSelectedTagsStore';
import { Tag, useTagStore } from 'Frontend/features/post/hooks/useTagStore';

const TagSidebar = () => {
  const { tags } = useTagStore();
  const { selectedTags, addTag, removeTag } = useSelectedTagsStore();

  const handleToggle = (tag: Tag) => {
    const exists = selectedTags.some((t) => t.id === tag.id);
    exists ? removeTag(tag.id) : addTag(tag);
  };

  return (
    <Box p={2}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Tags
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {tags.map((tag) => {
          const selected = selectedTags.some((t) => t.id === tag.id);
          return <TagChip key={tag.id} tag={tag} selected={selected} onClick={() => handleToggle(tag)} />;
        })}
      </Stack>
    </Box>
  );
};

export default TagSidebar;
