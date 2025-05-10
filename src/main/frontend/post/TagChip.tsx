import React from 'react';
import { Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Tag, useSelectedTagsStore } from './hook/useSelectedTagsStore';

interface TagChipProps {
  tag: Tag;
  onClick?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
}

const TagChip = ({ tag, onClick, onDelete }: TagChipProps) => {
  return (
    <Chip
      label={tag.title}
      size="small"
      onClick={() => onClick?.(tag)}
      onDelete={() => onDelete?.(tag)}
      deleteIcon={<CloseIcon sx={{ fontSize: 18 }} />}
      sx={{
        fontWeight: 500,
        p: '4px 8px',
        background: '#f4f4f5', // Light neutral gray
        color: '#374151', // Dark gray for text
        border: '1px solid #e5e7eb', // Subtle border
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        '&:hover': {
          animation: 'scale 0.2s ease',
          background: '#e5e7eb', // Slightly darker gray on hover
          borderColor: '#d1d5db',
        },
        '& .MuiChip-label': {
          p: '0 8px',
        },
        '& .MuiChip-deleteIcon': {
          color: '#6b7280', // Medium gray for icon
          transition: 'color 0.2s ease',
          '&:hover': {
            color: '#374151', // Darker gray on hover
          },
        },
        // Keyframes for scale animation
        '@keyframes scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
    />
  );
};

export default TagChip;
