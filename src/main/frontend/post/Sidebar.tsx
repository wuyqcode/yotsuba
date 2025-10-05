import { useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';

import CollectionList from './CollectionList';
import TagList from './TagList';
import AddCollectionDialog from './components/dialogs/AddCollectionDialog';
import EditCollectionDialog from './components/dialogs/EditCollectionDialog';
import { Collection } from './hook/useCollectionStore';

const Sidebar = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);

  return (
    <>
      {/* 笔记本 Section */}
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

        <CollectionList
          onEdit={(col) => {
            setEditCollection(col);
            setOpenEditDialog(true);
          }}
        />

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
      </Box>

      <Divider sx={{ borderColor: 'divider', opacity: 0.6 }} />

      {/* 标签 Section */}
      <Box
        p={2}
        sx={{
          flex: 1,
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            mb: 1,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}>
          标签
        </Typography>
        <TagList />
      </Box>

      {/* Dialogs */}
      <AddCollectionDialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
      <EditCollectionDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        collection={editCollection}
      />
    </>
  );
};

export default Sidebar;
