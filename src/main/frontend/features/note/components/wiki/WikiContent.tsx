import { Box, Typography } from '@mui/material';
import RichTextEditor from 'reactjs-tiptap-editor';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { useWikiEditor } from 'Frontend/features/note/hooks/useWikiEditor';
import WikiHeader from 'Frontend/features/note/components/wiki/WikiHeader';
import { useWikiNoteStore } from '../../hooks/useWikiNoteStore';
import NoteComment from './NoteComment';
import NoteFileList from './NoteFileList';

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

export interface WikiContentProps {
  isMobile?: boolean;
  onOpenToc?: () => void;
}

export default function WikiContent({ isMobile, onOpenToc }: WikiContentProps) {
  const { setEditor, extensions } = useWikiEditor();
  const wiki = useWikiNoteStore((s) => s.wiki);
  const loading = useWikiNoteStore((s) => s.loading);
  const error = useWikiNoteStore((s) => s.error);
  const mode = useWikiNoteStore((state) => state.mode);
  const updateWiki = useWikiNoteStore((s) => s.updateWiki);
  const isReadOnly = useWikiNoteStore((s) => s.isReadOnly);
  const editor = useWikiNoteStore((s) => s.editor);

  if (loading || error || !wiki) {
    return <WikiEditorPlaceholder loading={loading} error={error} />;
  }

  console.log('WikiContent render');

  return (
    <Box
      sx={{
        flex: '1',
        height: `calc(100dvh - 50px)`,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <WikiHeader isMobile={isMobile} onOpenToc={onOpenToc}/>
      {mode === 'comment' ? (
        <NoteComment />
      ) : mode === 'file' ? (
        <NoteFileList />
      ) : (
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
          <RichTextEditor
            ref={(instance) => {
              if (instance?.editor && editor !== instance.editor) {
                setEditor(instance.editor);
                console.log('[WikiContent] Editor instance set to store');
              }
            }}
            output="html"
            content={wiki.content}
            onChangeContent={(content) => {
              console.log('[WikiContent] onChangeContent called with:', typeof content, content?.substring?.(0, 50));
              updateWiki({ content });
            }}
            extensions={extensions}
            dark={false}
            contentClass="wiki-editor-content"
            useEditorOptions={{ autofocus: false }}
            disabled={isReadOnly()}
          />
        </Box>
      )}
    </Box>
  );
}
