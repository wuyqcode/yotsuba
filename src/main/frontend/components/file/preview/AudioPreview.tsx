import { Box, Paper } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface AudioPreviewProps {
  previewUrl: string;
}

export default function AudioPreview({ previewUrl }: AudioPreviewProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 500,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          bgcolor: 'background.paper',
        }}>
        <MusicNoteIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.7 }} />
        <Box
          component="audio"
          src={previewUrl}
          controls
          sx={{
            width: '100%',
            '&::-webkit-media-controls-panel': {
              bgcolor: 'background.default',
            },
          }}
        />
      </Paper>
    </Box>
  );
}

