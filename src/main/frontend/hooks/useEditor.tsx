import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { emoji, emojiAttr } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload } from '@milkdown/plugin-upload';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { useEditor } from '@milkdown/react';
import debounce from 'lodash.debounce';
import { useMemo, useRef, useState } from 'react';

type Json = Record<string, any>;

export const useMilkdownEditor = (defaultValue: string) => {
  const defaultValueRef = useRef(defaultValue);
  const [proseState, setProseState] = useState<Json>({});

  const gfmPlugins: MilkdownPlugin[] = useMemo(() => {
    return [gfm].flat();
  }, []);

  const twemojiPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      emoji,
      (ctx: Ctx) => () => {
        ctx.set(emojiAttr.key, () => ({
          span: {},
          img: {
            class: 'emoji'
          }
        }));
      }
    ].flat();
  }, []);

  const editorInfo = useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, defaultValueRef.current);
        ctx.get(listenerCtx).updated((_, doc) => {
          debounce(setProseState, 500)(doc.toJSON());
        });
        ctx
          .get(listenerCtx)
          .mounted((ctx) => {
            const wrapper = ctx.get(rootCtx) as HTMLDivElement;
            const editor = wrapper.querySelector(
              ".editor[role='textbox']"
            ) as HTMLDivElement;
            wrapper.onclick = () => editor?.focus();
          })
          .markdownUpdated((_, markdown) => {});
      })
      .use(commonmark)
      .use(listener)
      .use(clipboard)
      .use(history)
      .use(upload)
      .use(gfmPlugins)
      .use(twemojiPlugins);

    return editor;
  }, []);

  return editorInfo;
};
