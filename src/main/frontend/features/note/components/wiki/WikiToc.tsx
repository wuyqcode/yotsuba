import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  useTheme,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useWikiEditor } from '../../hooks/useWikiEditor';
import type { HeadingItem } from '../../hooks/useWikiEditor';

export function WikiToc() {
  const theme = useTheme();
  const { editor, headings, setMode } = useWikiEditor();
  const [open, setOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // =====================================
  // 监听选中标题变化，更新 activeId
  // =====================================
  useEffect(() => {
    if (!editor) return;

    const updateActive = () => {
      const id = editor.state.selection.$from.node(-1)?.attrs?.id;
      if (id) setActiveId(id);
    };

    editor.on('selectionUpdate', updateActive);
    console.log('[WikiTOC] selectionUpdate listener attached');

    return () => {
      editor.off('selectionUpdate', updateActive);
      console.log('[WikiTOC] selectionUpdate listener removed');
    };
  }, [editor]);

  const handleJump = (item: HeadingItem) => {
    const element = document.getElementById(item.id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderColor: 'divider',
        flex: '0 0 240px',
        height: `calc(100dvh - 50px)`,
        overflowY: 'auto',
      }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
          目录
        </Typography>
        <IconButton size="small" onClick={() => setOpen((o) => !o)}>
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Collapse in={open}>
          {headings.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, fontSize: 12, color: 'text.secondary' }}>
              No headings found
            </Typography>
          ) : (
            <List dense disablePadding sx={{ py: 1 }}>
              {headings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => handleJump(item)}
                    selected={isActive}
                    sx={{
                      pl: 1 + (item.level - 1) * 2,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.action.selected,
                        '& .MuiListItemText-primary': {
                          color: 'primary.main',
                          fontWeight: 600,
                        },
                      },
                    }}>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          noWrap: true,
                          sx: {
                            fontSize: item.level === 1 ? 13 : 12,
                            fontWeight: item.level === 1 ? 600 : 400,
                            lineHeight: 1.4,
                            color: isActive ? 'primary.main' : 'text.secondary',
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
}
