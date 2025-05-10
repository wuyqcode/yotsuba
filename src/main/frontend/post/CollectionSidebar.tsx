import React, { useState, useEffect } from 'react';
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  SxProps,
  Theme,
} from '@mui/material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { GlassBox } from 'Frontend/components/GlassBox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collection, trashCollection, useSelectedCollectionStore } from './hook/useSelectedCollectionStore';

const CollectionSidebar = () => {
  const [openCollections, setOpenCollections] = useState<boolean>(true);
  const [openRecycleBin, setOpenRecycleBin] = useState<boolean>(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [deletedCollections, setDeletedCollections] = useState<Collection[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const { selectedCollection, setCollection, clearCollection } = useSelectedCollectionStore();

  useEffect(() => {
    const fetchCollections = async () => {
      const mockCollections = [
        {
          id: 101,
          name: '我的收藏夹',
          count: 12,
          cover: 'https://picsum.photos/seed/collection1/300/200',
          lastUpdated: '2025-05-10',
        },
        {
          id: 102,
          name: '学习资源',
          count: 8,
          cover: 'https://picsum.photos/seed/collection2/300/200',
          lastUpdated: '2025-05-08',
        },
      ];

      setCollections(mockCollections);
    };

    fetchCollections();
  }, []);

  // Handlers for CRUD operations
  const handleAddCollection = async () => {
    if (newCollectionName.trim()) {
      // const newCollection: Collection = await fakeApi.addCollection(newCollectionName.trim());
      // setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setOpenAddDialog(false);
    }
  };

  const handleEditCollection = async () => {
    if (editCollection && newCollectionName.trim()) {
      // await fakeApi.updateCollection(editCollection.id, newCollectionName.trim());
      setCollections(
        collections.map((col) => (col.id === editCollection.id ? { ...col, name: newCollectionName.trim() } : col))
      );
      setNewCollectionName('');
      setEditCollection(null);
      setOpenEditDialog(false);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    // await fakeApi.deleteCollection(id);
    setCollections(collections.filter((col) => col.id !== id));
    // setDeletedCollections([...fakeApi.deletedCollections]);
    // 如果删除的是选中项，重置选中状态
    // if (selectedId === id) {
    //   setSelectedId(null);
    // }
  };

  const handleRestoreCollection = async (id: number) => {
    // await fakeApi.restoreCollection(id);
    // setDeletedCollections(fakeApi.deletedCollections);
    // setCollections([...fakeApi.collections]);
  };

  const handlePermanentlyDeleteCollection = async (id: number) => {
    // await fakeApi.permanentlyDeleteCollection(id);
    // setDeletedCollections(fakeApi.deletedCollections);
  };

  const selectedListItemStyles: SxProps<Theme> = {
    '&.Mui-selected': {
      backgroundColor: 'primary.main', // Stronger background color
      color: 'white', // Contrast text color
      '& .MuiListItemIcon-root': {
        color: 'white', // Icon color matches text
      },
      '&:hover': {
        backgroundColor: 'primary.dark', // Darker on hover
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)', // Subtle hover for non-selected
    },
  };

  return (
    <GlassBox
      sx={{
        position: 'sticky',
        top: '50px',
        height: 'calc(100dvh - 50px)',
        overflow: 'auto',
      }}>
      {/* All */}
      <List component="nav" dense>
        <ListItemButton
          sx={selectedListItemStyles}
          selected={selectedCollection === null}
          onClick={() => clearCollection()}>
          <ListItemIcon>
            <AllInclusiveIcon sx={{ color: 'black', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="ALL" />
        </ListItemButton>
        <Divider />

        {/* Collections List */}
        <ListItemButton onClick={() => setOpenCollections(!openCollections)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <FavoriteIcon sx={{ color: 'black', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Saved" />
          <AddIcon sx={{ color: 'black', fontSize: 18 }} onClick={() => setOpenAddDialog(true)} />

          {openCollections ? (
            <ExpandLess sx={{ fontSize: 18, color: 'black' }} />
          ) : (
            <ExpandMore sx={{ fontSize: 18, color: 'black' }} />
          )}
        </ListItemButton>
        <Collapse in={openCollections} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {collections.map((collection) => (
              <ListItemButton
                disableGutters
                key={collection.id}
                sx={{ pl: 4, ...selectedListItemStyles }}
                selected={collection.id === selectedCollection?.id}
                onClick={() => setCollection(collection)}>
                <ListItemText
                  primary={collection.name}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止冒泡，避免触发 ListItemButton 的 onClick
                    setEditCollection(collection);
                    setNewCollectionName(collection.name);
                    setOpenEditDialog(true);
                  }}
                  size="small">
                  <EditIcon sx={{ color: 'black', fontSize: 14 }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止冒泡
                    handleDeleteCollection(collection.id);
                  }}
                  size="small">
                  <DeleteIcon sx={{ color: 'black', fontSize: 14 }} />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <Divider />

        {/* Trash */}
        <ListItemButton
          sx={selectedListItemStyles}
          selected={trashCollection.id === selectedCollection?.id}
          onClick={() => setCollection(trashCollection)}>
          <ListItemIcon>
            <RestoreFromTrashIcon sx={{ color: 'black', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Trash" />
        </ListItemButton>
      </List>

      {/* Add Collection Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        PaperProps={{
          sx: {
            width: '320px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.91)', // Glassmorphism effect
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          },
        }}
        TransitionProps={{
          timeout: 300, // Smooth transition
        }}>
        <DialogTitle
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'text.primary',
            bgcolor: 'transparent',
            pb: 1,
          }}>
          新規コレクション
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="コレクション名"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
                color: 'text.secondary',
                '&.Mui-focused': {
                  color: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.9rem',
                py: 1.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            sx={{
              fontSize: '0.85rem',
              color: 'text.secondary',
              textTransform: 'none',
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}>
            キャンセル
          </Button>
          <Button
            onClick={handleAddCollection}
            disabled={!newCollectionName.trim()}
            sx={{
              fontSize: '0.85rem',
              color: 'white',
              bgcolor: 'primary.main',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.400',
                color: 'grey.600',
              },
            }}>
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        PaperProps={{
          sx: {
            width: '320px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.91)', // Glassmorphism effect
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          },
        }}
        TransitionProps={{
          timeout: 300, // Smooth transition
        }}>
        <DialogTitle
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'text.primary',
            bgcolor: 'transparent',
            pb: 1,
          }}>
          コレクションを編集
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="コレクション名"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
                color: 'text.secondary',
                '&.Mui-focused': {
                  color: 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.9rem',
                py: 1.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              fontSize: '0.85rem',
              color: 'text.secondary',
              textTransform: 'none',
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}>
            キャンセル
          </Button>
          <Button
            onClick={handleEditCollection}
            disabled={!newCollectionName.trim()}
            sx={{
              fontSize: '0.85rem',
              color: 'white',
              bgcolor: 'primary.main',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.400',
                color: 'grey.600',
              },
            }}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </GlassBox>
  );
};

export default CollectionSidebar;
