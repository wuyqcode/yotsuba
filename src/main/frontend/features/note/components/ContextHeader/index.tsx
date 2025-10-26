import React from 'react';
import { Stack } from '@mui/material';
import { useSelectedTagsStore } from 'Frontend/features/note/hooks/useSelectedTagsStore';
import { useSelectedCollectionStore } from 'Frontend/features/note/hooks/useSelectedCollectionStore';
import TagList from './TagList';
import SearchBar from './SearchBar';
import CollectionCard from './CollectionCard';

interface ContextHeaderProps {
  searchText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  handleCreatePost: () => void;
}

export default function ContextHeader({
  searchText,
  handleInputChange,
  handleSearch,
  handleCreatePost,
}: ContextHeaderProps) {
  const { selectedTags, removeTag } = useSelectedTagsStore();
  const { selectedCollection } = useSelectedCollectionStore();

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <CollectionCard collection={selectedCollection} />
      <TagList tags={selectedTags} onRemove={removeTag} />
      <SearchBar
        value={searchText}
        onChange={handleInputChange}
        onSearch={handleSearch}
        onAdd={handleCreatePost}
      />
    </Stack>
  );
}