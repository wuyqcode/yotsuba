import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Bookmarks } from '@mui/icons-material';
import { Box, Paper, Typography, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import { HeadingItem, useTableOfContents } from 'Frontend/features/note/hooks/useToc';

interface TableOfContentsProps {
  className?: string;
  editor?: Editor | null;
}

export function Toc({ editor, className }: TableOfContentsProps) {
  const items = useTableOfContents(editor);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (item: HeadingItem) => {
    if (!editor) {
      console.error('Editor is not initialized');
      return;
    }

    setActiveId(item.id);

    // 动态查找标题的最新位置
    let targetPos = item.pos;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.id === item.id) {
        targetPos = pos;
        return false; // 找到后停止遍历
      }
      return true;
    });

    try {
      // 设置选择并滚动
      editor.chain().setTextSelection(targetPos).scrollIntoView().run();

      // 手动滚动（备用方案）
      const node = editor.view.nodeDOM(targetPos);
      if (node instanceof HTMLElement) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Error during TOC jump:', error);
    }
  };

  const getPadding = (level: number) => {
    return 2 + (level - 1) * 2; // 缩进根据层级递增
  };

  const renderHeadingItem = (item: HeadingItem, index: number) => {
    const isActive = item.id === activeId;
    return (
      <ListItemButton
        key={item.id} // 使用 id 作为 key，确保唯一性
        selected={isActive}
        onClick={() => handleClick(item)}
        sx={{
          pl: getPadding(item.level),
          bgcolor: isActive ? 'action.selected' : undefined,
        }}>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            sx: {
              fontWeight: item.level === 1 ? 'bold' : 'normal',
              color: isActive ? 'primary.main' : 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <Paper elevation={3} sx={{ width: '250px', p: 2, flexShrink: 0 }} className={className}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Bookmarks fontSize="small" />
          <Typography variant="subtitle2">目次</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No headings found
          </Typography>
        ) : (
          items.map((item, index) => renderHeadingItem(item, index))
        )}
      </List>
    </Paper>
  );
}
