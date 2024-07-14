import { CmdKey } from '@milkdown/core';
import { redoCommand, undoCommand } from '@milkdown/plugin-history';
import {
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand
} from '@milkdown/preset-commonmark';
import { toggleStrikethroughCommand } from '@milkdown/preset-gfm';
import { Milkdown } from '@milkdown/react';
import { callCommand } from '@milkdown/utils';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, Container, IconButton, Toolbar } from '@mui/material';
import { useMilkdownEditor } from 'Frontend/hooks/useEditor';
import { useState } from 'react';

export default function MilkdownEditor() {
  const [content, setContent] = useState('');

  const { get } = useMilkdownEditor('');

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
      <Container
        sx={{
          width: '100%',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
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
        </Toolbar>
      </Container>
      <Container
        sx={{
          height: '100%',
          overflow: 'auto',
          overscrollBehavior: 'none'
        }}
      >
        <Milkdown />
      </Container>
    </Box>
  );
}
