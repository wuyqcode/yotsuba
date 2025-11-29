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
import { Video } from 'reactjs-tiptap-editor/lib/Video.js';
import { Attachment } from 'reactjs-tiptap-editor/lib/Attachment.js';
import TextBubble from 'reactjs-tiptap-editor/lib/TextBubble.cjs';
import { TextAlign } from 'reactjs-tiptap-editor/lib/TextAlign.js';
import { TaskList } from 'reactjs-tiptap-editor/lib/TaskList.js';
import Table from 'reactjs-tiptap-editor/lib/Table.js';
import { SubAndSuperScript } from 'reactjs-tiptap-editor/lib/SubAndSuperScript.cjs';
import { ColumnActionButton } from 'reactjs-tiptap-editor/lib/MultiColumn.js';
import { Indent } from 'reactjs-tiptap-editor/lib/Indent.js';
import { Iframe } from 'reactjs-tiptap-editor/lib/Iframe.js';
import { Color } from 'reactjs-tiptap-editor/lib/Color.js';
import { ExportPdf } from 'reactjs-tiptap-editor/lib/ExportPdf.js';
import { TextDirection } from 'reactjs-tiptap-editor/lib/TextDirection.js';
import { Excalidraw } from 'reactjs-tiptap-editor/lib/Excalidraw.cjs';
import { ExportWord } from 'reactjs-tiptap-editor/lib/ExportWord.js';
import { Emoji } from 'reactjs-tiptap-editor/lib/Emoji.js';
import { SearchAndReplace } from 'reactjs-tiptap-editor/lib/SearchAndReplace.js';
import { LineHeight } from 'reactjs-tiptap-editor/lib/LineHeight.js';
import { FormatPainter } from 'reactjs-tiptap-editor/lib/FormatPainter.js';
import { FontSize } from 'reactjs-tiptap-editor/lib/FontSize.js';
import { Code } from 'reactjs-tiptap-editor/lib/Code.js';
import { Clear } from 'reactjs-tiptap-editor/lib/Clear.js';
import { TrailingNode } from 'reactjs-tiptap-editor/lib/TrailingNode.js';

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
      Video.configure({ upload: (file: File) => upload(file) }),
      Attachment.configure({ upload: (file: File) => upload(file) }),
      CodeBlock.configure({ defaultTheme: 'dracula' }),
      Code,
      Clear,
      TaskList,
      TextBubble,
      ExportPdf,
      ExportWord,
      TextDirection,
      Emoji,
      SearchAndReplace,
      FontSize,
      FormatPainter,
      Color,
      Table,
      Iframe,
      Indent,
      ColumnActionButton,
      TextAlign,
      LineHeight,
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
