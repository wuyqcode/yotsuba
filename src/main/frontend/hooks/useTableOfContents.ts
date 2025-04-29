import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

export interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
}

export function useTableOfContents(editor: Editor | null) {
  const [items, setItems] = useState<TableOfContentsItem[]>([]);

  const getItems = useCallback(() => {
    if (!editor) return [];

    const headings: TableOfContentsItem[] = [];
    console.log(editor);

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs.level,
          text: node.textContent,
          id: node.attrs.id || `heading-${pos}`,
        });
      }
    });
    return headings;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateItems = () => {
      setItems(getItems());
    };

    updateItems();
    editor.on('update', updateItems);

    return () => {
      editor.off('update', updateItems);
    };
  }, [editor, getItems]);

  return items;
}
