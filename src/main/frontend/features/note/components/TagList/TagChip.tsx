import React from 'react';
import { Box, Typography } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // 标签图标
import CloseIcon from '@mui/icons-material/Close';
import { useTagStore } from '../../hooks/useTagStore';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/TagDto';

interface TagChipProps {
  tag: TagDto;
  selected?: boolean;
}

const getTagColor = (selected?: boolean) => {
  if (selected) {
    return {
      bg: '#5E81AC',
      color: '#ffffff',
    };
  }
  return {
    bg: '#f6f8fa', // 浅灰背景
    color: '#24292f',
  };
};

const TagChip = ({ tag, selected = false }: TagChipProps) => {
  const { bg, color } = getTagColor(selected);
  const toggleSelectedTag = useTagStore((s) => s.toggleSelectedTag);

  return (
    <Box
      component="span"
      onClick={() => toggleSelectedTag(tag)}
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
        {tag.name}
      </Typography>
    </Box>
  );
};

export default TagChip;
