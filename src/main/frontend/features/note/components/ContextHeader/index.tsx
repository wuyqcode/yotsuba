import React from 'react';
import { Stack, Box } from '@mui/material';
import SearchBar from './SearchBar';
import TagCard from './TagCard';
import { useTagStore } from '../../hooks/useTagStore';

export default function ContextHeader() {
  const selectedTags = useTagStore((s) => s.selectedTags);
  const hasSelectedTags = selectedTags.length > 0;

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {hasSelectedTags && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1,
            px: 1,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.3)',
              },
            },
          }}>
          {selectedTags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </Box>
      )}
      <SearchBar />
    </Stack>
  );
}
