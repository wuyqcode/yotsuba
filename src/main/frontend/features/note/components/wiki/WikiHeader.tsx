import { Typography, Button, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ForumIcon from '@mui/icons-material/Forum';
import SaveIcon from '@mui/icons-material/Save';
import { useWikiNoteStore } from '../../hooks/useWikiNoteStore';

export default function WikiHeader(): JSX.Element {
  const { mode, setMode } = useWikiNoteStore();
  const wiki = useWikiNoteStore((s) => s.wiki);
  const isDirty = useWikiNoteStore((s) => s.isDirty);

  const updateWiki = useWikiNoteStore((s) => s.updateWiki);
  const setTitle = (title: string) => updateWiki({ title });

  const saveWiki = useWikiNoteStore((s) => s.saveWiki);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2,
          py: 1.5,
          mb: 1,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 1,
          zIndex: 20,
        }}>
        {/* 标题输入框 */}
        <Typography variant="h5" fontWeight={600} flex={1}>
          <input
            value={wiki?.title ?? ''}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontFamily: 'sans-serif',
            }}
            readOnly={mode === 'read' || mode === 'comment'}
          />
        </Typography>

        {/* 模式切换 + 保存按钮 */}
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<VisibilityIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: mode === 'read' ? 'primary.main' : 'text.secondary',
              bgcolor: mode === 'read' ? 'action.selected' : 'transparent',
            }}
            onClick={() => setMode('read')}>
            阅读
          </Button>

          <Button
            startIcon={<EditIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: mode === 'edit' ? 'primary.main' : 'text.secondary',
              bgcolor: mode === 'edit' ? 'action.selected' : 'transparent',
            }}
            onClick={() => setMode('edit')}>
            编辑
          </Button>

          <Button
            startIcon={<ForumIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: mode === 'comment' ? 'primary.main' : 'text.secondary',
              bgcolor: mode === 'comment' ? 'action.selected' : 'transparent',
            }}
            onClick={() => setMode('comment')}>
            评论
          </Button>

          <Button
            startIcon={<SaveIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: mode === 'edit' && isDirty ? 'primary.main' : 'text.secondary',
              bgcolor: mode === 'edit' && isDirty ? 'rgba(25,118,210,0.1)' : 'transparent',
              border: mode === 'edit' && isDirty ? '1px solid rgba(25,118,210,0.3)' : '1px solid transparent',
            }}
            disabled={mode !== 'edit' || !isDirty}
            onClick={async () => {
              await saveWiki();
            }}>
            {isDirty ? '保存 *' : '保存'}
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
