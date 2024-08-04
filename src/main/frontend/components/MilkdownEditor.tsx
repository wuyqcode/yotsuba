import { CmdKey, Editor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { history, redoCommand, undoCommand } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload } from '@milkdown/plugin-upload';
import {
  commonmark,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand
} from '@milkdown/preset-commonmark';
import { gfm, toggleStrikethroughCommand } from '@milkdown/preset-gfm';
import { Milkdown, useEditor } from '@milkdown/react';
import { callCommand } from '@milkdown/utils';
import { Edit, InsertDriveFile, Link, Tag } from '@mui/icons-material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, Button, IconButton, Stack } from '@mui/material';
import { useState } from 'react';

interface EditorWithLimitProps {
  maxHeight?: number;
}

const MilkdownEditor = ({ maxHeight }: EditorWithLimitProps) => {
  const [content, setContent] = useState('');

  const useMilkdownEditor = () =>
    useEditor((root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx
            .get(listenerCtx)
            .mounted((ctx) => {
              const wrapper = ctx.get(rootCtx) as HTMLDivElement;
              const editor = wrapper.querySelector(
                ".editor[role='textbox']"
              ) as HTMLDivElement;
              wrapper.onclick = () => editor?.focus();
            })
            .markdownUpdated((_, markdown) => setContent(markdown));
        })
        .use(commonmark)
        .use(listener)
        .use(clipboard)
        .use(history)
        .use(upload)
        .use(gfm)
    );

  const { get } = useMilkdownEditor();

  function call<T>(command: CmdKey<T>, payload?: T) {
    return get()?.action(callCommand(command, payload));
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => call(undoCommand.key)}>
            <UndoIcon />
          </IconButton>
          <IconButton onClick={() => call(redoCommand.key)}>
            <RedoIcon />
          </IconButton>
          <IconButton onClick={() => call(toggleStrongCommand.key)}>
            <FormatBoldIcon />
          </IconButton>
          <IconButton onClick={() => call(toggleEmphasisCommand.key)}>
            <FormatItalicIcon />
          </IconButton>
          <IconButton onClick={() => call(toggleStrikethroughCommand.key)}>
            <StrikethroughSIcon />
          </IconButton>
          <IconButton onClick={() => call(wrapInBulletListCommand.key)}>
            <FormatListBulletedIcon />
          </IconButton>
          <IconButton onClick={() => call(wrapInOrderedListCommand.key)}>
            <FormatListNumberedIcon />
          </IconButton>
          <IconButton onClick={() => call(wrapInBlockquoteCommand.key)}>
            <FormatQuoteIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'auto',
          overscrollBehavior: 'none',
          maxHeight: maxHeight
        }}
      >
        <Milkdown />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          paddingTop: 1
        }}
      >
        <Box>
          <IconButton>
            <Tag />
          </IconButton>
          <IconButton>
            <Edit />
          </IconButton>
          <IconButton>
            <InsertDriveFile />
          </IconButton>
          <IconButton>
            <Link />
          </IconButton>
        </Box>
        <Box>
          <Button variant="contained" color="primary" sx={{ marginLeft: 1 }}>
            保存
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MilkdownEditor;
