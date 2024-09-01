import { gfm } from '@milkdown/preset-gfm';
import { history } from '@milkdown/plugin-history';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';
import { cursor } from '@milkdown/plugin-cursor';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadPlugin, Uploader } from '@milkdown/plugin-upload';
import type { Node } from 'prosemirror-model';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewOptionsCtx
} from '@milkdown/core';
import { ReactEditor, useEditor } from '@milkdown/react';
import { nes } from './nes';

interface MilkdownEditorProps {
  postId: string;
  content: string;
  onChange: (content: string) => void;
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({
  postId,
  content,
  onChange
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const uploader: Uploader = async (files, schema) => {
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

    const nodes: (Node | null)[] = await Promise.all(
      images.map(async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('postId', postId);

        try {
          const response = await fetch(
            'http://localhost:8080/api/file-resource',
            {
              method: 'POST',
              body: formData
            }
          );

          if (!response.ok) {
            throw new Error('Image upload failed');
          }

          const src = await response.text();
          const alt = image.name;

          return schema.nodes.image.createAndFill({
            src,
            alt
          }) as Node;
        } catch (error) {
          console.error('Failed to upload image:', error);
          return null;
        }
      })
    );
    const filteredNodes: Node[] = nodes.filter(
      (node): node is Node => node !== null
    );

    return filteredNodes;
  };

  const editor = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, '#ReactEditor');
        ctx.set(defaultValueCtx, content);
        const listener = ctx.get(listenerCtx);
        listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
          onChange(markdown);
        });
        listener.mounted((ctx) => {
          const wrapper = wrapperRef.current as HTMLDivElement;
          const editor = wrapper.querySelector(
            ".editor[role='textbox']"
          ) as HTMLDivElement;

          if (editor) {
            editor.focus();

            // 将光标移动到内容的末尾
            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(editor);
            range.collapse(false); // 将range折叠到最后一个字符
            selection?.removeAllRanges(); // 清除所有range
            selection?.addRange(range); // 添加新的range
          }
        });

        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          editable: () => true
        }));
      })
      .use(nes)
      .use(
        upload.configure(uploadPlugin, {
          uploader
        })
      )
      .use(listener)
      .use(gfm)
      .use(tooltip)
      .use(slash)
      .use(prism)
      .use(cursor)
      .use(history)
  );

  return (
    <div id="ReactEditor" ref={wrapperRef}>
      <ReactEditor editor={editor} />
    </div>
  );
};

export default MilkdownEditor;
