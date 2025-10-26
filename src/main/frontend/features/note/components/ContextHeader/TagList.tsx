import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Tag } from 'Frontend/features/note/hooks/useTagStore';

interface TagListProps {
  tags: Tag[];
  onRemove: (id: number) => void;
}

export default function TagList({ tags, onRemove }: TagListProps) {
  if (!tags.length) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags.map((tag) => (
        <Box
          key={tag.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1,
            py: 0.3,
            borderRadius: 20,
            height: 36,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Box
            component="img"
            src={tag.image || '/default-tag.png'}
            alt={tag.title}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', maxWidth: 90 }}>
            #{tag.title}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onRemove(tag.id)}
            sx={{
              p: 0.2,
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}