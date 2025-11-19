import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CollectionItem from './CollectionItem';
import AddCollectionDialog from './AddCollectionDialog';
import { useCollectionStore } from '../../hooks/useCollection';

const CollectionList = () => {
  const collections = useCollectionStore((s) => s.collections);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  return (
    <Box p={2}>
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.secondary',
          mb: 1,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>
        笔记本
      </Typography>
      <Stack spacing={1} mt={1}>
        {collections.map((col) => (
          <CollectionItem key={col.id} col={col} />
        ))}
      </Stack>
      <Box mt={1}>
        <Box
          onClick={() => setOpenAddDialog(true)}
          sx={{
            cursor: 'pointer',
            borderRadius: 1.5,
            py: 0.8,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 500,
            color: '#5E81AC', // Nord 蓝，动作感
            border: '1px dashed #81A1C1', // 虚线边框，弱化存在感
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#E5E9F0',
              borderColor: '#5E81AC',
            },
          }}>
          ＋ 添加笔记本
        </Box>
      </Box>
      {/* Dialogs */}
      <AddCollectionDialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
    </Box>
  );
};

export default CollectionList;
