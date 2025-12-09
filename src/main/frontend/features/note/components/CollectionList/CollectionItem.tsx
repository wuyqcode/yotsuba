import React, { useCallback, useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useCollectionStore } from '../../hooks/useCollection';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/CollectionDto';

interface Props {
  col: CollectionDto;
}

const CollectionItem: React.FC<Props> = ({ col }) => {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(col.name);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const updateCollection = useCollectionStore((s) => s.updateCollection);
  const deleteCollection = useCollectionStore((s) => s.deleteCollection);
  const clearSelectedCollection = useCollectionStore((s) => s.clearSelectedCollection);
  const setSelectedCollection = useCollectionStore((s) => s.setSelectedCollection);

  const isSelected = selectedCollection?.id === col.id;

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempName(col.name);
    setEditing(true);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setTempName(col.name);
  };

  const saveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    if (tempName.trim() !== '' && tempName !== col.name) {
      await updateCollection(col.id, tempName.trim());
    }
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
    <Card
      component="div"
      variant="outlined"
      onClick={() => setSelectedCollection(col)}
      sx={{
        cursor: 'pointer',
        borderRadius: 1.5,
        boxShadow: 'none',
        border: 0,
        bgcolor: isSelected ? '#5E81AC' : 'transparent',
        color: isSelected ? '#ECEFF4' : '#2E3440',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isSelected ? '#81A1C1' : '#D8DEE9',
          color: isSelected ? '#ECEFF4' : '#2E3440',
        },
        mb: 0.5,
      }}>
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5,
          px: 1.5,
          '&:last-child': { pb: 0.5 },
        }}>
        {editing ? (
          <TextField
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            size="small"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            sx={{
              flexGrow: 1,
              input: {
                py: 0.3,
                fontSize: 14,
                color: isSelected ? '#ECEFF4' : '#2E3440',
              },
            }}
            variant="standard"
          />
        ) : (
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontSize: 14,
              fontWeight: 500,
            }}>
            {col.name}
          </Typography>
        )}

        {!col.system && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editing ? (
              <>
                <IconButton size="small" onClick={saveEdit} sx={{ color: isSelected ? '#ECEFF4' : '#4C566A' }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={cancelEdit} sx={{ color: isSelected ? '#ECEFF4' : '#4C566A' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={startEdit}
                  sx={{
                    color: isSelected ? '#ECEFF4' : '#4C566A',
                    '&:hover': { color: '#81A1C1' },
                  }}>
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(col);
                  }}
                  sx={{
                    color: isSelected ? '#ECEFF4' : '#4C566A',
                    '&:hover': { color: '#BF616A' },
                  }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CollectionItem;
