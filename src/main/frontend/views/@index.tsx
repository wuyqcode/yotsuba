import React, { useState } from 'react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Button, TextField, Container, Typography, Box, InputAdornment, Drawer, IconButton, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GlassBox } from 'Frontend/components/GlassBox';

export const config: ViewConfig = {
  menu: { order: 1, icon: 'HomeIcon' },
  title: '主页',
};

interface Shortcut {
  label: string;
  url: string;
  icon: string | React.ReactNode;
  index?: number;
}

interface ShortcutProps {
  shortcut: {
    icon: React.ReactNode;
    label: string;
    url: string;
  };
  index: number;
  isEditMode: boolean;
  onEdit: (shortcut: any, index: number) => void;
  onDelete: (index: number) => void;
}

const ShortcutItem: React.FC<ShortcutProps> = React.memo(({ shortcut, index, isEditMode, onEdit, onDelete }) => {
  const randomDelay = React.useMemo(() => Math.random() * 2, []);

  return (
    <Box
      sx={{
        position: 'relative',
        animation: isEditMode ? `shake 0.82s cubic-bezier(.36,.07,.19,.97) ${randomDelay}s infinite` : 'none',
        '@keyframes shake': {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0)',
          },
          '10%, 90%': {
            transform: 'translate3d(-1px, 0, 0)',
          },
          '20%, 80%': {
            transform: 'translate3d(2px, 0, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(-4px, 0, 0)',
          },
          '40%, 60%': {
            transform: 'translate3d(4px, 0, 0)',
          },
        },
      }}>
      <Button
        onClick={() => {
          if (shortcut.label == '添加') {
            onEdit(shortcut, index);
            return;
          }
          if (isEditMode) {
            onEdit(shortcut, index);
          } else {
            window.open(shortcut.url, '_blank');
          }
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100,
          height: 100,
          m: 1,
          backgroundColor: 'transparent',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            mb: 1,
          }}>
          {React.cloneElement(shortcut.icon as React.ReactElement, {
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover', // 👈 填满裁剪区域
            },
          })}
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontSize: '0.8rem',
            color: 'white',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}>
          {shortcut.label}
        </Typography>
      </Button>

      {isEditMode && (
        <>
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 2,
              width: 40,
              height: 40,
            }}
            size="small"
            onClick={() => onEdit(shortcut, index)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
            }}
            size="small"
            onClick={() => onDelete(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
});

const generateFakeShortcuts = (count: number) => {
  const fakeShortcuts = [];
  for (let i = 1; i <= count; i++) {
    fakeShortcuts.push({
      icon: <img src={`https://picsum.photos/24?random=${i}`} alt={`图标 ${i}`} width="24" />,
      label: `网站 ${i}`,
      url: `https://example.com/${i}`,
    });
  }
  return fakeShortcuts;
};

export default function HomeView() {
  const [shortcuts, setShortcuts] = useState([
    {
      icon: <img src="https://developer.mozilla.org/favicon-48x48.png" alt="MDN" width="24" />,
      label: 'MDN',
      url: 'https://developer.mozilla.org',
    },
    {
      icon: <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" width="24" />,
      label: 'GitHub',
      url: 'https://github.com',
    },
    ...generateFakeShortcuts(20),
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState({
    label: '',
    url: '',
    icon: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

  const handleCloseDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
    setNewShortcut({ label: '', url: '', icon: '' });
    setEditingShortcut(null);
  }, []);

  const handleSubmitShortcut = React.useCallback(() => {
    if (newShortcut.label && newShortcut.url) {
      setShortcuts((prevShortcuts) => [
        ...prevShortcuts,
        {
          ...newShortcut,
          icon: (
            <img
              src={newShortcut.icon || `https://picsum.photos/24?random=${prevShortcuts.length + 1}`}
              alt={newShortcut.label}
              width="24"
            />
          ),
        },
      ]);
      handleCloseDrawer();
    }
  }, [newShortcut, handleCloseDrawer]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditMode(true);
  };

  const handleDeleteShortcut = (index: number) => {
    setShortcuts(shortcuts.filter((_, i) => i !== index));
  };

  const handleEditShortcut = (shortcut: any, index: number) => {
    setEditingShortcut({ ...shortcut, index });
    setIsDrawerOpen(true);
  };

  const handleSubmitEdit = () => {
    if (editingShortcut) {
      const updatedShortcuts = [...shortcuts];
      updatedShortcuts[editingShortcut.index as number] = {
        ...(editingShortcut as Shortcut),
        icon: (
          <img
            src={
              (editingShortcut.icon as string) ||
              `https://picsum.photos/24?random=${(editingShortcut.index as number) + 1}`
            }
            alt={editingShortcut.label}
            width="24"
          />
        ),
      };
      setShortcuts(updatedShortcuts);
      setEditingShortcut(null);
      handleCloseDrawer();
    }
  };

  const handleExitEditMode = React.useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
    }
  }, [isEditMode]);

  const renderShortcuts = () => (
    <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={2} sx={{ maxWidth: 1000, mx: 'auto' }}>
      {shortcuts.map((shortcut, index) => (
        <ShortcutItem
          key={index}
          shortcut={shortcut}
          index={index}
          isEditMode={isEditMode}
          onEdit={handleEditShortcut}
          onDelete={handleDeleteShortcut}
        />
      ))}
      <Box sx={{ width: { xs: '25%', sm: '12.5%', md: '8.33%' } }}>
        <ShortcutItem
          shortcut={{ icon: <AddIcon />, label: '添加', url: '' }}
          index={-1}
          isEditMode={false}
          onEdit={(_, __) => setIsDrawerOpen(true)}
          onDelete={() => {}}
        />
      </Box>
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}
      onContextMenu={handleContextMenu}
      onClick={handleExitEditMode}>
      <Container maxWidth="lg" sx={{ mt: 4, flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <TextField
            placeholder="输入并搜索"
            variant="outlined"
            sx={{
              width: '100%',
              maxWidth: 600,
              '& .MuiOutlinedInput-root': {
                borderRadius: 50,
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: '#dfe1e5',
                },
                '&:hover fieldset': {
                  borderColor: '#dfe1e5',
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="disabled" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        {renderShortcuts()}
      </Container>

      <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 300, p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}>
            <Typography variant="h6">{editingShortcut ? '编辑快捷方式' : '添加新快捷方式'}</Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label="名称"
            value={editingShortcut ? editingShortcut.label : newShortcut.label}
            onChange={(e) =>
              editingShortcut
                ? setEditingShortcut({
                    ...editingShortcut,
                    label: e.target.value,
                  })
                : setNewShortcut({ ...newShortcut, label: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="网址"
            value={editingShortcut ? editingShortcut.url : newShortcut.url}
            onChange={(e) =>
              editingShortcut
                ? setEditingShortcut({
                    ...editingShortcut,
                    url: e.target.value,
                  })
                : setNewShortcut({ ...newShortcut, url: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="图标URL"
            value={editingShortcut ? editingShortcut.icon : newShortcut.icon}
            onChange={(e) =>
              editingShortcut
                ? setEditingShortcut({
                    ...editingShortcut,
                    icon: e.target.value,
                  })
                : setNewShortcut({ ...newShortcut, icon: e.target.value })
            }
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={editingShortcut ? handleSubmitEdit : handleSubmitShortcut}
            sx={{ mt: 2 }}>
            确定
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
