import React from 'react';
import { Stack } from '@mui/material';
import TagList from './TagList';
import SearchBar from './SearchBar';
import CollectionCard from './CollectionCard';
import { useTagStore } from '../../hooks/useTagStore';

export default function ContextHeader() {

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <CollectionCard />
      <TagList  />
      <SearchBar />
    </Stack>
  );
}
