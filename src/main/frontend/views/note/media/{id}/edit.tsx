import { useEffect, useState } from 'react';
import { Box, TextField, Typography, Button, IconButton, Divider, Stack, Snackbar, Alert, Grid } from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import 'reactjs-tiptap-editor/style.css';
import { useUpload } from 'Frontend/features/note/hooks/useUpload';
import LightweightEditor from 'Frontend/components/LightweightEditor';

interface Episode {
  id: number;
  title: string;
  runtime: string;
  rating: number;
  desc: string;
  img: string;
}

interface Season {
  name: string;
  year: string | number;
  episodes: Episode[];
}

interface TvShow {
  id: string;
  title: string;
  overview: string;
  year: number;
  cover: string;
  content: string;
  seasons: Season[];
}

export default function TvShowEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upload } = useUpload();

  const [show, setShow] = useState<TvShow | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fake: TvShow = {
      id: id ?? '1',
      title: 'Naruto',
      overview: 'A young ninja strives to become the Hokage of his village.',
      year: 2002,
      cover: 'https://image.tmdb.org/t/p/w500/3uZUfYhNI3ZPh4cwLNDtDAQbuR.jpg',
      content: '',
      seasons: [
        {
          name: 'Season 1',
          year: 2002,
          episodes: [
            {
              id: 1,
              title: 'Enter: Naruto Uzumaki!',
              runtime: '24 min',
              rating: 7.1,
              desc: 'Welcome to Konoha...',
              img: 'https://www.themoviedb.org/t/p/w227_and_h127_bestv2/7xOP0rKDniTZKEaRM7seKfY9SG8.jpg',
            },
          ],
        },
      ],
    };
    setShow(fake);
  }, [id]);

  const handleChange = (field: keyof TvShow, value: any) => {
    if (!show) return;
    setShow({ ...show, [field]: value });
  };

  const handleCoverUpload = async (file: File) => {
    const url = await upload(file);
    handleChange('cover', url);
  };

  const handleSave = async () => {
    if (!show) return;
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

  if (!show) return null;

  const panel = {
    borderRadius: 2.5,
    bgcolor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.4)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    p: 3,
  } as const;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f2f2f5',
        px: 2,
        py: 1,
      }}>
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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              px: 2,
              color: '#333',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&:hover': { backgroundColor: '#fff' },
            }}>
            返回
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              px: 2.5,
              background: 'linear-gradient(90deg, #007AFF, #409CFF)',
              boxShadow: '0 2px 10px rgba(10,132,255,0.25)',
              '&:hover': { background: 'linear-gradient(90deg, #0A84FF, #60AFFF)' },
            }}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* 左侧 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              ...panel,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
            <img
              src={show.cover}
              alt="cover"
              style={{
                width: '100%',
                height: 260,
                objectFit: 'cover',
                borderRadius: 12,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                mt: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                color: '#333',
                borderColor: 'rgba(0,0,0,0.1)',
                '&:hover': { borderColor: '#007AFF', color: '#007AFF' },
              }}>
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
              fullWidth
              variant="standard"
              value={show.title}
              onChange={(e) => handleChange('title', e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="年份"
              fullWidth
              variant="standard"
              type="number"
              value={show.year}
              onChange={(e) => handleChange('year', Number(e.target.value))}
              sx={{ mt: 1.5 }}
            />
            <TextField
              label="简介"
              fullWidth
              variant="outlined"
              multiline
              minRows={3}
              value={show.overview}
              onChange={(e) => handleChange('overview', e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Grid>

        {/* 右侧 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Box sx={panel}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  季与剧集
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() =>
                    handleChange('seasons', [...show.seasons, { name: '新一季', year: 'TBD', episodes: [] }])
                  }
                  sx={{
                    borderRadius: '999px',
                    textTransform: 'none',
                    borderColor: 'rgba(0,0,0,0.1)',
                    color: '#333',
                    '&:hover': { borderColor: '#007AFF', color: '#007AFF' },
                  }}>
                  新增季
                </Button>
              </Stack>

              {show.seasons.map((s, sIdx) => (
                <Box key={sIdx} sx={{ mt: 2, borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TextField
                      label="季名"
                      variant="standard"
                      value={s.name}
                      onChange={(e) => {
                        const updated = [...show.seasons];
                        updated[sIdx].name = e.target.value;
                        handleChange('seasons', updated);
                      }}
                    />
                    <TextField
                      label="年份"
                      variant="standard"
                      value={s.year}
                      onChange={(e) => {
                        const updated = [...show.seasons];
                        updated[sIdx].year = e.target.value;
                        handleChange('seasons', updated);
                      }}
                    />
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleChange(
                          'seasons',
                          show.seasons.filter((_, i) => i !== sIdx)
                        )
                      }>
                      <Delete />
                    </IconButton>
                  </Stack>

                  {s.episodes.map((ep, eIdx) => (
                    <Box key={ep.id} sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.05)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {ep.title}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const updated = [...show.seasons];
                            updated[sIdx].episodes = updated[sIdx].episodes.filter((_, i) => i !== eIdx);
                            handleChange('seasons', updated);
                          }}>
                          <Delete />
                        </IconButton>
                      </Stack>
                      <TextField
                        label="标题"
                        variant="standard"
                        fullWidth
                        value={ep.title}
                        onChange={(e) => {
                          const updated = [...show.seasons];
                          updated[sIdx].episodes[eIdx].title = e.target.value;
                          handleChange('seasons', updated);
                        }}
                        sx={{ mt: 1 }}
                      />
                      <TextField
                        label="简介"
                        variant="outlined"
                        fullWidth
                        multiline
                        minRows={2}
                        value={ep.desc}
                        onChange={(e) => {
                          const updated = [...show.seasons];
                          updated[sIdx].episodes[eIdx].desc = e.target.value;
                          handleChange('seasons', updated);
                        }}
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                        }}
                      />
                    </Box>
                  ))}

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      const updated = [...show.seasons];
                      updated[sIdx].episodes.push({
                        id: Date.now(),
                        title: '新剧集',
                        runtime: '24 min',
                        rating: 0,
                        desc: '',
                        img: '',
                      });
                      handleChange('seasons', updated);
                    }}
                    sx={{
                      mt: 1.5,
                      borderRadius: '999px',
                      textTransform: 'none',
                      borderColor: 'rgba(0,0,0,0.1)',
                      color: '#333',
                      '&:hover': { borderColor: '#007AFF', color: '#007AFF' },
                    }}>
                    新增剧集
                  </Button>
                </Box>
              ))}
            </Box>

            <Box sx={panel}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                剧情详情 / 花絮
              </Typography>
              <LightweightEditor content={show.content} onChange={(html) => handleChange('content', html)} />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {message ? (
          <Alert severity={message.severity} sx={{ width: '100%' }}>
            {message.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
