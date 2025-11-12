import { Box, TextField, Typography, IconButton, Stack } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useMediaNote } from 'Frontend/features/note/hooks/useMediaNote';

export default function EpisodeEditor({ seasonId, episodeId }: { seasonId: string; episodeId: string }) {
  const { seasons, episodes, updateEpisode, removeEpisode } = useMediaNote();

  const season = seasons[seasonId as keyof typeof seasons];
  const episode = episodes[episodeId as keyof typeof episodes];

  if (!episode || !season) return null;

  return (
    <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.05)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={700}>
          {episode.title}
        </Typography>
        <IconButton color="error" onClick={() => removeEpisode(episode.id)}>
          <Delete />
        </IconButton>
      </Stack>

      <TextField
        label="标题"
        variant="standard"
        fullWidth
        value={episode.title}
        onChange={(e) => updateEpisode(episode.id, { title: e.target.value })}
        sx={{ mt: 1 }}
      />

      <TextField
        label="简介"
        variant="outlined"
        fullWidth
        multiline
        minRows={2}
        value={episode.desc}
        onChange={(e) => updateEpisode(episode.id, { desc: e.target.value })}
        sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
      />
    </Box>
  );
}
