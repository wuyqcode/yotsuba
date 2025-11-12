import React from 'react';
import { Box, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { useCollection } from '../../hooks/useCollection';

export default function CollectionCard() {
  const { selectedCollection } = useCollection();

  return (
    <Box
      sx={{
        display: 'flex',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: 120,
      }}>
      <Box
        sx={{
          width: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: 'background.default',
        }}>
        {/* {selectedCollection?.cover ? (
          <Box
            component="img"
            src={selectedCollection.cover}
            alt={name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <FolderIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
        )} */}
        <FolderIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
      </Box>

      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" noWrap fontWeight={600}>
            {selectedCollection?.name}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            {1} 条笔记 · 更新于 {'updated'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
