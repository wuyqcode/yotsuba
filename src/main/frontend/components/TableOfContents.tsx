import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Bookmarks, MenuOpen } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Typography, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import { TableOfContentsItem, useTableOfContents } from 'Frontend/hooks/useTableOfContents';

interface TableOfContentsProps {
  className?: string;
  editor: Editor | null;
}

export function TableOfContents({ className, editor }: TableOfContentsProps) {
  const [expanded, setExpanded] = useState(true);
  const items = useTableOfContents(editor);

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPadding = (level: number) => {
    switch (level) {
      case 1:
        return 0;
      case 2:
        return 2;
      case 3:
        return 4;
      case 4:
        return 6;
      case 5:
        return 8;
      case 6:
        return 10;
      default:
        return 0;
    }
  };

  const renderHeadingItem = (item: TableOfContentsItem, index: number) => {
    return (
      <ListItemButton
        key={index}
        onClick={() => handleItemClick(item.id)}
        sx={{
          pl: 2 + getPadding(item.level),
        }}>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            variant: item.level === 1 ? 'subtitle1' : 'body2',
            fontWeight: item.level === 1 ? 'bold' : 'normal',
            color: 'text.secondary',
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <>
      {expanded ? (
        <Paper
          elevation={3}
          sx={{
            width: 280,
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'fixed',
            top: 80,
            right: 20,
            p: 2,
            borderRadius: 2,
          }}
          className={className} // 正确传递 className
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Bookmarks fontSize="small" />
              <Typography variant="subtitle2">目次</Typography>
            </Box>
            <IconButton size="small" onClick={() => setExpanded(false)}>
              <MenuOpen />
            </IconButton>
          </Box>
          <Divider />
          <List>{items.map((item, index) => renderHeadingItem(item, index))}</List>
        </Paper>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setExpanded(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            borderRadius: '50%',
            minWidth: 56,
            minHeight: 56,
            boxShadow: 4,
          }}>
          <Bookmarks />
        </Button>
      )}
    </>
  );
}
