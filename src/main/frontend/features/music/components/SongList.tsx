import { Box, Typography, Chip, IconButton, CircularProgress, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  isFavorite: (song: Song) => boolean;
  onSongClick: (index: number) => void;
  onToggleFavorite: (song: Song) => void;
  onDownload: (song: Song) => void;
}

export function SongList({
  songs,
  currentIndex,
  loading,
  error,
  isFavorite,
  onSongClick,
  onToggleFavorite,
  onDownload,
}: SongListProps) {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress sx={{ color: '#ff6b6b' }} />
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2 }}>
          正在搜索音乐...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (songs.length === 0) {
    return (
      <Box textAlign="center" py={4} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
        <Typography>在上方搜索框输入关键词开始搜索音乐</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {songs.map((song, index) => (
        <Box
          key={`${song.id}_${song.source}`}
          onClick={() => onSongClick(index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1,
            borderRadius: 2,
            cursor: 'pointer',
            background: currentIndex === index ? 'rgba(255, 107, 107, 0.3)' : 'transparent',
            border: currentIndex === index ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid transparent',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Chip
            label={(index + 1).toString().padStart(2, '0')}
            size="small"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: currentIndex === index
                ? 'linear-gradient(135deg, #ff6b6b, #ff5252)'
                : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              mr: 2,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {song.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {Array.isArray(song.artist) ? song.artist.join(' / ') : song.artist} · {song.album}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(song);
            }}
            sx={{ color: isFavorite(song) ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)' }}
          >
            {isFavorite(song) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(song);
            }}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <DownloadIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}

