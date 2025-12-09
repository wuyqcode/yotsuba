import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  List,
  Stack,
  IconButton,
  Rating,
  ListItem,
  Divider,
} from '@mui/material';
import ScrollSection from 'Frontend/components/ScrollSection';
import {
  CalendarToday as CalendarTodayIcon,
  WatchLater as WatchLaterIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MusicNote as MusicNoteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import MediaHeader from 'Frontend/features/note/components/media/MediaHeader';
import type { SeasonId, EpisodeId } from 'Frontend/features/note/hooks/useMediaNote';
import { useMediaNote } from 'Frontend/features/note/hooks/useMediaNote';

export default function MediaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Zustand 状态
  const media = useMediaNote((s) => s.media);
  const seasons = useMediaNote((s) => s.seasons);
  const episodes = useMediaNote((s) => s.episodes);
  const setMedia = useMediaNote((s) => s.setMedia);
  const updateMedia = useMediaNote((s) => s.updateMedia);

  const [seasonIdx, setSeasonIdx] = useState(0);

  if (!media) return null;

  // 当前季节ID
  const currentSeasonId = media.seasonIds[seasonIdx] as SeasonId | undefined;
  const currentSeason = currentSeasonId ? seasons[currentSeasonId] : undefined;

  // ======= 页面布局 =======
  return (
    <Container maxWidth="lg" sx={{ pb: 8 }}>
      <MediaHeader />

      {/* ===== 顶部评分区 ===== */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Rating
          name="rating"
          max={10}
          size="large"
          value={media.rating ?? 0}
          onChange={(_, val) => updateMedia({ rating: val ?? 0 })}
          sx={{
            fontSize: '2.4rem',
            '& .MuiRating-iconFilled': { color: '#FFD700' },
            '& .MuiRating-iconHover': { color: '#FFB400' },
            '& .MuiRating-iconEmpty': { color: '#e0e0e0' },
          }}
        />

        {/* 操作区 */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          {[<CalendarTodayIcon />, <WatchLaterIcon />, <PlaylistAddCheckIcon />, <MusicNoteIcon />].map((icon, i) => (
            <IconButton
              key={i}
              sx={{
                backgroundColor: '#fff',
                color: 'black',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f0f6ff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                },
                '& svg': { fontSize: 26 },
              }}>
              {icon}
            </IconButton>
          ))}
          <IconButton
            onClick={() => navigate(`/note/media/${id}/edit`)}
            sx={{
              backgroundColor: '#007AFF',
              color: '#fff',
              '&:hover': { backgroundColor: '#005ecb' },
            }}>
            <EditIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* === Cast === */}
      <ScrollSection
        title="Cast"
        items={Array(10).fill({
          name: 'Junko Takeuchi',
          role: 'Naruto Uzumaki (voice)',
          img: 'https://image.tmdb.org/t/p/w500/3uZUfYhNI3ZPh4cwLNDtDAQbuR.jpg',
        })}
        renderItem={(c) => (
          <Card sx={{ width: 140, borderRadius: 3, boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }}>
            <CardMedia component="img" image={c.img} alt={c.name} sx={{ height: 200, objectFit: 'cover' }} />
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {c.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {c.role}
              </Typography>
            </CardContent>
          </Card>
        )}
      />

      {/* === Similar === */}
      <ScrollSection
        title="Similar"
        items={Array(8).fill({
          title: 'ONIMAI!',
          img: 'https://image.tmdb.org/t/p/w500/3uZUfYhNI3ZPh4cwLNDtDAQbuR.jpg',
        })}
        renderItem={(s) => (
          <Card sx={{ width: 150, borderRadius: 3, boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }}>
            <CardMedia component="img" image={s.img} alt={s.title} />
          </Card>
        )}
      />

      {/* === Seasons & Episodes === */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mt: 5,
        }}>
        {/* 左侧 Season 列表 */}
        <Box sx={{ flex: '0 0 220px' }}>
          <List>
            {media.seasonIds.map((sid, idx) => {
              const s = seasons[sid];
              return (
                <ListItem key={sid} disablePadding sx={{ mb: 1 }}>
                  <Button
                    fullWidth
                    variant={seasonIdx === idx ? 'contained' : 'outlined'}
                    onClick={() => setSeasonIdx(idx)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      backgroundColor: seasonIdx === idx ? '#007AFF' : '#fff',
                      color: seasonIdx === idx ? '#fff' : '#000',
                      border: '1px solid #000',
                      '&:hover': {
                        backgroundColor: seasonIdx === idx ? '#005ecb' : '#f5f5f5',
                        border: '1px solid #000',
                      },
                    }}>
                    <Box>
                      <Typography fontWeight="bold">{s.name}</Typography>
                      <Typography variant="caption">
                        {s.episodeIds.length} Episodes ・ {s.year}
                      </Typography>
                    </Box>
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* 右侧 Episodes */}
        <Box sx={{ flex: 1 }}>
          {currentSeason && (
            <>
              <Typography variant="h5" fontWeight="bold">
                {currentSeason.name}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {currentSeason.episodeIds.map((eid: EpisodeId) => {
                const e = episodes[eid];
                return (
                  <Box
                    key={e.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'white',
                    }}>
                    <CardMedia
                      component="img"
                      image={e.img}
                      alt={e.title}
                      sx={{ width: 180, height: 100, borderRadius: 2 }}
                    />
                    <Box>
                      <Typography fontWeight="bold">{e.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {e.runtime} ・ ⭐ {e.rating}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {e.desc}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}
