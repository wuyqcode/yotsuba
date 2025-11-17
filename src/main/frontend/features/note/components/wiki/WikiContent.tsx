import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router';
import RichTextEditor from 'reactjs-tiptap-editor';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { WikiToc } from 'Frontend/features/note/components/wiki/WikiToc';
import { useWikiEditor } from 'Frontend/features/note/hooks/useWikiEditor';
import WikiHeader from 'Frontend/features/note/components/wiki/WikiHeader';
import { useWikiNoteStore } from '../../hooks/useWikiNote';
import { storage } from 'Frontend/utils/storage';
import { STORAGE_KEYS } from 'Frontend/config/constants';

function WikiEditorPlaceholder({ loading, error }: { loading?: boolean; error?: string | null }) {
  return (
    <Box sx={{ p: 4 }}>
      {loading && (
        <Typography variant="body2" color="text.secondary">
          正在加载中...
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error">
          加载失败：{error}
        </Typography>
      )}
      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          暂无内容
        </Typography>
      )}
    </Box>
  );
}

// ==========================
// 子组件：评论模式视图
// ==========================
function WikiCommentSection() {
  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        评论区
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        （此处可以放评论输入框和评论列表）
      </Typography>
    </Box>
  );
}

export default function WikiContent() {
  const { id } = useParams<{ id: string }>();
  const { editor, setEditor, mode, extensions, isReadOnly, setMode } = useWikiEditor();
  const wiki = useWikiNoteStore((s) => s.wiki);
  const loading = useWikiNoteStore((s) => s.loading);
  const error = useWikiNoteStore((s) => s.error);

  const updateWiki = useWikiNoteStore((s) => s.updateWiki);
  const setContent = (content: string) => updateWiki({ content });

  // 使用 ref 跟踪已处理的 id，避免重复处理
  const processedIdRef = useRef<string | null>(null);

  // 当 id 变化时，重置 processedIdRef
  useEffect(() => {
    if (processedIdRef.current !== id) {
      console.log('[WikiContent] Id changed, resetting processedIdRef', { oldId: processedIdRef.current, newId: id });
      processedIdRef.current = null;
    }
  }, [id]);

  // 检查是否是新创建的笔记，如果是则设置为编辑模式
  // 只在 id 变化且 wiki 加载完成后检查，确保每次切换笔记时都正确设置模式
  useEffect(() => {
    console.log('[WikiContent] useEffect triggered', { id, loading, hasWiki: !!wiki, currentMode: mode, processedId: processedIdRef.current });
    
    if (!id) {
      console.log('[WikiContent] No id, skipping');
      return;
    }
    
    if (loading) {
      console.log('[WikiContent] Still loading, skipping');
      return;
    }
    
    if (!wiki) {
      console.log('[WikiContent] No wiki data, skipping');
      return;
    }

    // 如果已经处理过这个 id，则跳过（避免重复执行）
    if (processedIdRef.current === id) {
      console.log('[WikiContent] Already processed this id, skipping');
      return;
    }

    // 标记为已处理
    processedIdRef.current = id;

    const newNoteIds = storage.get<string[]>(STORAGE_KEYS.NEW_WIKI_NOTE_IDS) || [];
    console.log('[WikiContent] Checking localStorage', {
      newNoteIds,
      currentId: id,
      isNewNote: newNoteIds.includes(id),
    });

    if (newNoteIds.includes(id)) {
      // 设置为编辑模式
      console.log('[WikiContent] New note detected, setting mode to edit');
      setMode('edit');
      // 从 localStorage 中移除该 ID
      const updatedIds = newNoteIds.filter((noteId) => noteId !== id);
      if (updatedIds.length > 0) {
        storage.set(STORAGE_KEYS.NEW_WIKI_NOTE_IDS, updatedIds);
        console.log('[WikiContent] Updated localStorage, remaining IDs:', updatedIds);
      } else {
        storage.remove(STORAGE_KEYS.NEW_WIKI_NOTE_IDS);
        console.log('[WikiContent] Removed localStorage key (no remaining IDs)');
      }
    } else {
      // 默认设置为阅读模式
      console.log('[WikiContent] Not a new note, setting mode to read');
      setMode('read');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading]); // 只在 id 和 loading 变化时执行，通过检查 wiki 是否存在来判断加载完成

  if (loading || error || !wiki) {
    return <WikiEditorPlaceholder loading={loading} error={error} />;
  }

  return (
    <Box
      sx={{
        flex: '1',
        height: `calc(100dvh - 50px)`,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <WikiHeader />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          '.reactjs-tiptap-editor': {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            '& > *': {
              display: 'contents',
              '& > *': {
                display: 'contents',
              },
            },
            '.wiki-editor-content': {
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              paddingBottom: '40vh',
            },
            '.editor': {
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}>
        {mode === 'comment' ? (
          <WikiCommentSection />
        ) : (
          <RichTextEditor
            ref={(instance) => {
              if (instance?.editor && editor !== instance.editor) {
                setEditor(instance.editor);
                console.log('[WikiContent] Editor instance set to store');
              }
            }}
            output="html"
            content={wiki.content}
            onChangeContent={setContent}
            extensions={extensions}
            dark={false}
            contentClass="wiki-editor-content"
            useEditorOptions={{ autofocus: false }}
            disabled={isReadOnly()}
          />
        )}
      </Box>
    </Box>
  );
}
