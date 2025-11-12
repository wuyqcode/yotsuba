import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CollectionItem from './CollectionItem';
import EditCollectionDialog from './EditCollectionDialog';
import AddCollectionDialog from './AddCollectionDialog';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CollectionDto';
import { useCollection } from '../../hooks/useCollection';

const CollectionList = () => {
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    clearSelectedCollection,
    addCollection,
    updateCollection,
    deleteCollection,
  } = useCollection();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCollection, setEditCollection] = useState<CollectionDto | null>(null);

  const handleAddCollection = async (name: string) => {
    await addCollection(name);
  };

  const handleEditOpen = (collection: CollectionDto) => {
    setEditCollection(collection);
    setOpenEditDialog(true);
  };

  const handleEditSave = async (id: string, name: string) => {
    await updateCollection(id, name);
  };

  const handleDeleteCollection = async (collection: CollectionDto) => {
    const confirmDelete = window.confirm(`确认删除笔记本「${collection.name}」吗？`);
    if (!confirmDelete) return;
    if (!collection.id) return;
    await deleteCollection(collection.id);
    if (selectedCollection?.id === collection.id) {
      clearSelectedCollection();
    }
  };

  return (
    <Box p={2}>
      {' '}
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
          <CollectionItem
            key={col.id}
            col={col}
            isSelected={selectedCollection?.id === col.id}
            onSelect={setSelectedCollection}
            onEdit={handleEditOpen}
            onDelete={handleDeleteCollection}
          />
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
      <AddCollectionDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddCollection}
      />
      <EditCollectionDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setEditCollection(null);
        }}
        collection={editCollection}
        onSave={handleEditSave}
      />
    </Box>
  );
};

export default CollectionList;
