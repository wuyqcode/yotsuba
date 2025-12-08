import { Box, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { LyricLine } from '../types';

interface LyricsProps {
  lyrics: LyricLine[];
  activeLyricIndex: number;
  lyricsContainerRef: React.RefObject<HTMLDivElement | null>;
  onLyricClick: (time: number) => void;
}

export function Lyrics({
  lyrics,
  activeLyricIndex,
  lyricsContainerRef,
  onLyricClick,
}: LyricsProps) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
        <MusicNoteIcon />
        歌词
      </Typography>
      <Box
        ref={lyricsContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 3,
          },
        }}
      >
        {lyrics.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 2 }}>
            暂无歌词
          </Typography>
        ) : (
          lyrics.map((lyric, index) => (
            <Typography
              key={index}
              onClick={() => onLyricClick(lyric.time)}
              sx={{
                p: 1,
                mb: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                color: activeLyricIndex === index ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: activeLyricIndex === index ? 600 : 400,
                background: activeLyricIndex === index ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
                borderLeft: activeLyricIndex === index ? '3px solid #ff6b6b' : 'none',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            >
              {lyric.text}
            </Typography>
          ))
        )}
      </Box>
    </Box>
  );
}

