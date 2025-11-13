import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Search, Add, LibraryBooks, Movie } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import NoteType from 'Frontend/generated/io/github/dutianze/yotsuba/note/domain/valueobject/NoteType';
import { useNoteStore } from '../../hooks/useNotes';
import { useWikiEditorStore } from '../../hooks/useWikiEditor';

export default function SearchBar(): JSX.Element {
  const searchText = useNoteStore((s) => s.searchText);
  const setSearchText = useNoteStore((s) => s.setSearchText);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const createNote = useNoteStore((s) => s.createNote);
  const setMode = useWikiEditorStore((s) => s.setMode);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    fetchNotes();
  };

  const handleCreate = async (type: NoteType) => {
    try {
      const newNoteId = await createNote(type);
      if (!newNoteId) return;

      let path = '';
      if (type === NoteType.MEDIA) {
        path = `/note/media/${newNoteId}/edit`;
      } else if (type === NoteType.WIKI) {
        path = `/note/wiki/${newNoteId}`;
      }

      setMode('edit');
      navigate(path);
      setAnchorEl(null);
    } catch (err) {
      console.error('创建笔记失败：', err);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        px: 1.5,
        py: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease',
        '&:focus-within': {
          boxShadow: (theme) => theme.shadows[3],
        },
      }}>
      <Search sx={{ ml: 1, color: 'text.secondary' }} />
      <InputBase
        placeholder="搜索笔记..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{
          ml: 1,
          flex: 1,
          fontSize: 14,
        }}
      />
      <IconButton
        type="submit"
        size="small"
        sx={{
          mr: 0.5,
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}>
        <Search fontSize="small" />
      </IconButton>

      <Button
        variant="contained"
        size="small"
        startIcon={<Add />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          ml: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 13,
          px: 2.5,
          bgcolor: 'primary.main',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'primary.dark',
            boxShadow: (theme) => theme.shadows[2],
          },
        }}>
        新建
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          transition: {
            style: { transformOrigin: 'top right' },
          },
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: (theme) => theme.shadows[6],
            },
          },
        }}>
        <MenuItem onClick={() => handleCreate(NoteType.MEDIA)}>
          <ListItemIcon>
            <Movie fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="媒体笔记" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleCreate(NoteType.WIKI)}>
          <ListItemIcon>
            <LibraryBooks fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Wiki 笔记" />
        </MenuItem>
      </Menu>
    </Paper>
  );
}
