import { useMemo, useCallback } from 'react';
import { BaseKit, type Editor } from 'reactjs-tiptap-editor';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { Link } from 'reactjs-tiptap-editor/link';
import { Image } from 'reactjs-tiptap-editor/image';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { History } from 'reactjs-tiptap-editor/history';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';
import { useUpload } from 'Frontend/features/note/hooks/useUpload';
import { HeadingItem, useWikiNoteStore } from './useWikiNoteStore';

export function useWikiEditor() {
  const { upload } = useUpload();
  const currentEditor = useWikiNoteStore((state) => state.editor);
  const setEditor = useWikiNoteStore((state) => state.setEditor);
  const setHeadings = useWikiNoteStore((state) => state.setHeadings);

  const extensions = useMemo(
    () => [
      BaseKit.configure({
        placeholder: { showOnlyCurrent: true, placeholder: '请输入正文内容...' },
      }),
      Heading.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            id: {
              default: null,
              parseHTML: (element) => element.getAttribute('id'),
              renderHTML: (attributes) => {
                if (!attributes.id) return {};
                return { id: attributes.id };
              },
            },
          };
        },
      }),
      Bold,
      Italic,
      TextUnderline,
      Strike,
      BulletList,
      OrderedList,
      Blockquote,
      History,
      Link,
      Image.configure({ upload: (file: File) => upload(file), defaultInline: true }),
      CodeBlock.configure({ defaultTheme: 'dracula' }),
      HorizontalRule,
      SlashCommand,
    ],
    [upload]
  );

  const updateHeadings = useCallback(
    (editor: Editor) => {
      const items: HeadingItem[] = [];
      const tr = editor.state.tr;
      let needsUpdate = false;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const id = node.attrs.id || `heading-${pos}`;
          if (node.attrs.id !== id) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
            needsUpdate = true;
          }
          items.push({ id, level: node.attrs.level, text: node.textContent, pos });
        }
      });

      if (needsUpdate) {
        tr.setMeta('addToHistory', false);
        tr.setMeta('preventUpdate', true);
        editor.view.dispatch(tr);
      }

      setHeadings(items);
    },
    [setHeadings]
  );

  const setEditorWithListener = useCallback(
    (newEditor: Editor | null) => {
      if (currentEditor) {
        console.log('[useWikiEditor] cleanup old listener');
        currentEditor.off('update', () => updateHeadings(currentEditor));
      }

      if (newEditor) {
        console.log('[useWikiEditor] bind new update listener');
        updateHeadings(newEditor);
        newEditor.on('update', () => updateHeadings(newEditor));
      }

      setEditor(newEditor);
    },
    [updateHeadings, setEditor]
  );

  return {
    setEditor: setEditorWithListener,
    extensions,
  };
}
