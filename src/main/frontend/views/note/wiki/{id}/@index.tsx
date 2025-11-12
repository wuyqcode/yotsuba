import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { WikiToc } from 'Frontend/features/note/components/wiki/WikiToc';
import { useWikiNote } from 'Frontend/features/note/hooks/useWikiNote';
import WikiContent from 'Frontend/features/note/components/wiki/WikiContent';

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

export default function WikiEditor() {
  const { id } = useParams<{ id: string }>();
  const { wiki, loading, error } = useWikiNote(id);

  if (loading || error || !wiki) {
    return <WikiEditorPlaceholder loading={loading} error={error} />;
  }

  return (
    <Box
      sx={{
        height: `calc(100dvh - 50px)`,
        display: 'flex',
        flexDirection: 'row',
      }}>
      <WikiToc />
      <WikiContent />
    </Box>
  );
}
