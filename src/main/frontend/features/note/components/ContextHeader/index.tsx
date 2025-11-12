import React from 'react';
import { Stack } from '@mui/material';
import { useSelectedTagsStore } from 'Frontend/features/note/hooks/useSelectedTagsStore';
import TagList from './TagList';
import SearchBar from './SearchBar';
import CollectionCard from './CollectionCard';
import { useCollection } from '../../hooks/useCollection';

export default function ContextHeader() {
  const { selectedTags, removeTag } = useSelectedTagsStore();

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <CollectionCard />
      <TagList tags={selectedTags} onRemove={removeTag} />
      <SearchBar />
    </Stack>
  );
}
