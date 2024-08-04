import { CmdKey, defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { history, redoCommand, undoCommand } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadConfig } from '@milkdown/plugin-upload';
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
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton, Stack } from '@mui/material';
import Post from 'Frontend/generated/io/github/dutianze/cms/domain/Post';
import PostContent from 'Frontend/generated/io/github/dutianze/cms/domain/valueobject/PostContent';

interface EditorWithLimitProps {
  post: Post;
  setPost: any;
}

const MilkdownEditor = ({ post, setPost }: EditorWithLimitProps) => {
  const uploader: (files: FileList, schema: any) => Promise<any> = async (
    files,
    schema
  ) => {
    const images: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) {
        continue;
      }

      // You can handle whatever the file type you want, we handle image here.
      if (!file.type.includes('image')) {
        continue;
      }

      images.push(file);
    }

    const nodes: Node[] = await Promise.all(
      images.map(async (image) => {
        const formData = new FormData();
        formData.append('postId', post.id.id);
        formData.append('file', image);

        const response = await fetch('/api/file-resource', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const src = await response.text();
        const alt = image.name;

        return schema.nodes.image.createAndFill({
          src,
          alt
        }) as unknown as Node;
      })
    );

    return nodes;
  };

  const useMilkdownEditor = () =>
    useEditor((root) =>
      Editor.make()
        .config((ctx) => {
          ctx.update(uploadConfig.key, (prev) => ({
            ...prev,
            uploader
          }));
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, post?.content?.content ?? '');
          ctx
            .get(listenerCtx)
            .mounted((ctx) => {
              const wrapper = ctx.get(rootCtx) as HTMLDivElement;
              const editor = wrapper.querySelector(
                ".editor[role='textbox']"
              ) as HTMLDivElement;
              wrapper.onclick = () => editor?.focus();
            })
            .markdownUpdated((_, markdown) => {
              const contentObject: PostContent = { content: markdown };
              setPost((prevPost) => ({ ...prevPost, content: contentObject }));
            });
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
        height: '100%',
        width: 'calc(100vw - 500px)'
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
      <Milkdown />
    </Box>
  );
};

export default MilkdownEditor;
