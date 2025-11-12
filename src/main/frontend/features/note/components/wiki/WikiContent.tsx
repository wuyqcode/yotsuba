import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router';
import RichTextEditor from 'reactjs-tiptap-editor';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { WikiToc } from 'Frontend/features/note/components/wiki/WikiToc';
import { useWikiEditor } from 'Frontend/features/note/hooks/useWikiEditor';
import { useWikiNote } from 'Frontend/features/note/hooks/useWikiNote';
import WikiHeader from 'Frontend/features/note/components/wiki/WikiHeader';

// ==========================
// 子组件：加载/错误/空状态
// ==========================
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

// ==========================
// 主组件
// ==========================
export default function WikiContent() {
  const { id } = useParams<{ id: string }>();
  const { editor, setEditor, mode, extensions, isReadOnly } = useWikiEditor();
  const { wiki, loading, error, setContent } = useWikiNote(id);

  // 状态分支
  if (loading || error || !wiki) {
    return <WikiEditorPlaceholder loading={loading} error={error} />;
  }

  // ==========================
  // 主渲染
  // ==========================
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
