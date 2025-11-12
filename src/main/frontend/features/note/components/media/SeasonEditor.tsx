import { Box, TextField, Button, IconButton, Stack } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import EpisodeEditor from './EpisodeEditor';
import { SeasonId, useMediaNote } from '../../hooks/useMediaNote';

export default function SeasonEditor({ seasonId }: { seasonId: string }) {
  const season = useMediaNote((s) => s.seasons[seasonId as SeasonId]);
  const episodes = useMediaNote((s) => s.episodes);
  const updateSeason = useMediaNote((s) => s.updateSeason);
  const removeSeason = useMediaNote((s) => s.removeSeason);
  const addEpisode = useMediaNote((s) => s.addEpisode);
  if (!season) return null;

  return (
    <Box sx={{ mt: 2, borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.6)' }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <TextField
          label="季名"
          variant="standard"
          value={season.name}
          onChange={(e) => updateSeason(season.id, { name: e.target.value })}
        />
        <TextField
          label="年份"
          variant="standard"
          value={season.year}
          onChange={(e) => updateSeason(season.id, { year: e.target.value })}
        />
        <IconButton color="error" onClick={() => removeSeason(season.id)}>
          <Delete />
        </IconButton>
      </Stack>

      {/* 渲染当前季的所有剧集 */}
      {season.episodeIds.map((epId) => (
        <EpisodeEditor key={epId} seasonId={season.id} episodeId={epId} />
      ))}

      <Button
        size="small"
        variant="outlined"
        startIcon={<Add />}
        onClick={() => addEpisode(season.id)}
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
  );
}
