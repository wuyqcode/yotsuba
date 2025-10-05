import React from 'react';
import { Stack } from '@mui/material';
import TagChip from './TagChip';
import { useSelectedTagsStore } from './hook/useSelectedTagsStore';
import { Tag, useTagStore } from './hook/useTagStore';

const TagList = () => {
  const { tags } = useTagStore();
  const { selectedTags, toggleTag } = useSelectedTagsStore();

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {tags.map((tag: Tag) => {
        const selected = selectedTags.some((t) => t.id === tag.id);
        return <TagChip key={tag.id} tag={tag} selected={selected} onClick={() => toggleTag(tag)} />;
      })}
    </Stack>
  );
};

export default TagList;
