import React from 'react';
import { Box, Typography } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // 标签图标
import CloseIcon from '@mui/icons-material/Close';
import { Tag } from 'Frontend/features/note/hooks/useTagStore';

interface TagChipProps {
  tag: Tag;
  selected?: boolean;
  onClick?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
}

const getTagColor = (selected?: boolean) => {
  if (selected) {
    return {
      bg: '#5E81AC', // 主题蓝（Nord 深蓝 / GitHub 蓝）
      color: '#ffffff',
    };
  }
  return {
    bg: '#f6f8fa', // 浅灰背景
    color: '#24292f',
  };
};

const TagChip = ({ tag, selected = false, onClick, onDelete }: TagChipProps) => {
  const { bg, color } = getTagColor(selected);

  return (
    <Box
      component="span"
      onClick={() => onClick?.(tag)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.2,
        borderRadius: '2em',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.5,
        backgroundColor: bg,
        color,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          opacity: 0.9,
        },
      }}>
      <LocalOfferIcon sx={{ fontSize: 14 }} />
      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
        {tag.title}
      </Typography>
      {onDelete && (
        <CloseIcon
          sx={{
            fontSize: 14,
            cursor: 'pointer',
            ml: 0.3,
            '&:hover': { opacity: 0.7 },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tag);
          }}
        />
      )}
    </Box>
  );
};

export default TagChip;
