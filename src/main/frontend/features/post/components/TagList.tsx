import React from 'react';
import { Stack } from '@mui/material';
import TagChip from 'Frontend/features/post/components/TagChip';
import { useSelectedTagsStore } from 'Frontend/features/post/hooks/useSelectedTagsStore';
import { Tag, useTagStore } from 'Frontend/features/post/hooks/useTagStore';

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
