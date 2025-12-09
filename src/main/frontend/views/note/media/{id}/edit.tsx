import { useEffect, useState } from 'react';
import { Box, TextField, Typography, Button, Stack, Snackbar, Alert, Grid } from '@mui/material';
import { Add, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import { useUpload } from 'Frontend/features/note/hooks/useUpload';
import LightweightEditor from 'Frontend/components/LightweightEditor';
import SeasonEditor from 'Frontend/features/note/components/media/SeasonEditor';
import { useMediaNote } from 'Frontend/features/note/hooks/useMediaNote';

export default function MediaEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upload } = useUpload();

  const media = useMediaNote((s) => s.media);
  const seasons = useMediaNote((s) => s.seasons);
  const setMedia = useMediaNote((s) => s.setMedia);
  const updateMedia = useMediaNote((s) => s.updateMedia);
  const addSeason = useMediaNote((s) => s.addSeason);

  // ✅ 本地 UI 状态
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  if (!media) return null;

  // ✅ 上传封面
  const handleCoverUpload = async (file: File) => {
    const url = await upload(file);
    updateMedia({ cover: url });
  };

  // ✅ 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setMessage({ text: '已保存', severity: 'success' });
    } catch {
      setMessage({ text: '保存失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const panel = {
    borderRadius: 2.5,
    bgcolor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.4)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    p: 3,
  } as const;

  return (
    <Box sx={{ bgcolor: '#f2f2f5', px: 2, py: 1 }}>
      {/* 顶栏 */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 1,
          py: 1,
          mb: 1,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: '50px',
          zIndex: 10,
        }}>
        <Typography variant="h6" fontWeight={700}>
          编辑影视条目
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button startIcon={<Save />} variant="contained" disabled={saving} onClick={handleSave}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* 左侧基本信息 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ ...panel, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <img
              src={media.cover}
              alt="cover"
              style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12 }}
            />

            <Button variant="outlined" component="label" fullWidth sx={{ mt: 1.5 }}>
              上传封面
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              />
            </Button>

            <TextField
              label="标题"
              variant="standard"
              value={media.title}
              onChange={(e) => updateMedia({ title: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              label="年份"
              variant="standard"
              type="number"
              value={media.year}
              onChange={(e) => updateMedia({ year: Number(e.target.value) })}
              sx={{ mt: 1.5 }}
            />
            <TextField
              label="简介"
              variant="outlined"
              multiline
              minRows={3}
              value={media.overview}
              onChange={(e) => updateMedia({ overview: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </Grid>

        {/* 右侧季与剧集 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Box sx={panel}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  季与剧集
                </Typography>
                <Button variant="outlined" startIcon={<Add />} onClick={addSeason}>
                  新增季
                </Button>
              </Stack>

              {media.seasonIds.map((sid) => {
                const season = seasons[sid];
                return season ? <SeasonEditor key={season.id} seasonId={season.id} /> : null;
              })}
            </Box>

            <Box sx={panel}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                剧情详情 / 花絮
              </Typography>
              <LightweightEditor content={media.content} onChange={(html) => updateMedia({ content: html })} />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.severity}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
