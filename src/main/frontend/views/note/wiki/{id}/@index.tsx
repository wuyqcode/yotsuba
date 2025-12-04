import { Box, Drawer, Typography, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import { WikiToc } from 'Frontend/features/note/components/wiki/WikiToc';
import WikiContent from 'Frontend/features/note/components/wiki/WikiContent';
import { useEffect, useState } from 'react';
import { useWikiNoteStore } from 'Frontend/features/note/hooks/useWikiNoteStore';

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
  const loading = useWikiNoteStore((s) => s.loading);
  const error = useWikiNoteStore((s) => s.error);
  const loadWiki = useWikiNoteStore((s) => s.loadWiki);
  const [openToc, setOpenToc] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');

  useEffect(() => {
    loadWiki(id);
  }, [id]);

  if (loading || error) {
    return <WikiEditorPlaceholder loading={loading} error={error} />;
  }


  return (
      <Box
        sx={{
          height: `calc(100dvh - 50px)`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {isMobile ? (
          <>
            <Drawer open={openToc} onClose={() => setOpenToc(false)} PaperProps={{ sx: { width: 260 }}}>
              <WikiToc onItemClick={() => setOpenToc(false)} />
            </Drawer>

            <WikiContent  isMobile={isMobile}
  onOpenToc={() => setOpenToc(true)}/>
          </>
        ) : (
          <>
            <WikiToc />
            <WikiContent />
          </>
        )}
      </Box>
  );
}