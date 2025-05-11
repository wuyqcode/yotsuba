import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export function useTableOfContents(editor?: Editor | null) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  const updateHeadings = useCallback(() => {
    if (!editor) return;

    const items: HeadingItem[] = [];
    const transaction = editor.state.tr;
    let needsUpdate = false;

    // 遍历文档，收集标题信息
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        // 如果节点没有 id 或 id 不符合预期，生成新 id
        const id = node.attrs.id || `heading-${Date.now()}-${items.length}`;
        if (node.attrs.id !== id) {
          transaction.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            id,
          });
          needsUpdate = true;
        }
        items.push({
          id,
          level: node.attrs.level,
          text: node.textContent || 'Untitled',
          pos,
        });
      }
    });

    // 仅在需要时 dispatch transaction
    if (needsUpdate) {
      transaction.setMeta('addToHistory', false);
      transaction.setMeta('preventUpdate', true);
      editor.view.dispatch(transaction);
    }

    // 仅在 headings 变化时更新状态
    setHeadings((prev) => {
      const newItems = JSON.stringify(items);
      const prevItems = JSON.stringify(prev);
      return newItems !== prevItems ? items : prev;
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // 初始加载和文档更新时触发
    updateHeadings();
    editor.on('update', updateHeadings);

    return () => {
      editor.off('update', updateHeadings);
    };
  }, [editor, updateHeadings]);

  return headings;
}
