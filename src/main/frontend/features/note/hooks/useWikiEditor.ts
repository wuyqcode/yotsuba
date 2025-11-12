import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { create } from 'zustand';
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

export type EditorMode = 'read' | 'edit' | 'comment';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface WikiEditorState {
  editor: Editor | null;
  headings: HeadingItem[];
  mode: EditorMode;
  setEditor: (editor: Editor | null) => void;
  setHeadings: (items: HeadingItem[]) => void;
  setMode: (mode: EditorMode) => void;
  reset: () => void;
  isReadOnly: () => boolean;
}

export const useWikiEditorStore = create<WikiEditorState>((set, get) => ({
  editor: null,
  headings: [],
  mode: 'read',

  setEditor: (editor) => set({ editor }),
  setHeadings: (items) => set({ headings: items }),
  setMode: (mode) => set({ mode }),
  reset: () => set({ headings: [], mode: 'edit', editor: null }),
  isReadOnly: () => get().mode !== 'edit',
}));

export function useWikiEditor() {
  const { upload } = useUpload();
  const { editor: currentEditor, setEditor, headings, setHeadings, mode, setMode, isReadOnly } = useWikiEditorStore();
  const CustomHeading = Heading.extend({
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
  });
  const extensions = useMemo(
    () => [
      BaseKit.configure({
        placeholder: { showOnlyCurrent: true, placeholder: '请输入正文内容...' },
      }),
      CustomHeading,
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
    editor: currentEditor,
    setEditor: setEditorWithListener,
    extensions,
    headings,
    mode,
    setMode,
    isReadOnly,
  };
}
