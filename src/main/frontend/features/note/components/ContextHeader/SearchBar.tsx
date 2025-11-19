import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Button,
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
import { useTagStore } from '../../hooks/useTagStore';

function useDebounce(fn: (...args: any[]) => void, delay: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timerRef = useRef<any>();

  const debouncedFn = useCallback(
    (...args: any[]) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedFn;
}

export default function SearchBar(): JSX.Element {
  const searchText = useNoteStore((s) => s.searchText);
  const setSearchText = useNoteStore((s) => s.setSearchText);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const createNote = useNoteStore((s) => s.createNote);
  const page = useNoteStore((s) => s.page);
  const pageSize = useNoteStore((s) => s.pageSize);
  const selectedTags = useTagStore((s) => s.selectedTags);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const debouncedSearch = useDebounce(() => {
    fetchNotes();
  }, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchText, debouncedSearch, selectedTags, page, pageSize]);

  const handleCreate = async (type: NoteType) => {
    try {
      console.log('[SearchBar] Creating note, type:', type);
      const newNoteId = await createNote(type);
      if (!newNoteId) {
        console.log('[SearchBar] No noteId returned');
        return;
      }
      console.log('[SearchBar] Note created, id:', newNoteId);

      let path = '';
      if (type === NoteType.MEDIA) {
        path = `/note/media/${newNoteId}/edit`;
      } else if (type === NoteType.WIKI) {
        path = `/note/wiki/${newNoteId}`;
      }

      console.log('[SearchBar] Setting mode to edit and navigating to:', path);
      navigate(path);
      setAnchorEl(null);
    } catch (err) {
      console.error('创建笔记失败：', err);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={(e) => e.preventDefault()}
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
