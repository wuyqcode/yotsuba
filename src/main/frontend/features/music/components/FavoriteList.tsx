import { Box, Typography, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Song } from '../types';
import MusicDto from 'Frontend/generated/io/github/dutianze/yotsuba/music/application/dto/MusicDto';

interface FavoriteListProps {
  favorites: MusicDto[];
  currentIndex: number;
  currentPlaylist: Song[];
  isFavorite: (song: Song) => boolean;
  onSongClick: (index: number) => void;
  onToggleFavorite: (song: Song) => void;
}

export function FavoriteList({
  favorites,
  currentIndex,
  currentPlaylist,
  isFavorite,
  onSongClick,
  onToggleFavorite,
}: FavoriteListProps) {
  if (favorites.length === 0) {
    return (
      <Box textAlign="center" py={4} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        <FavoriteBorderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
        <Typography>暂无收藏的音乐</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {favorites
        .filter(fav => fav.songId && fav.source && fav.name)
        .map((fav, index) => {
        const song: Song = {
            id: fav.songId!,
            source: fav.source!,
            name: fav.name!,
            artist: fav.artist || '',
            album: fav.album || '',
            pic_id: fav.picId || '',
            lyric_id: fav.lyricId || '',
        };
        // 检查是否是当前播放的歌曲
        const isCurrentPlaying = currentIndex === index && 
          currentPlaylist.length > 0 && 
            currentPlaylist[currentIndex]?.id === fav.songId && 
          currentPlaylist[currentIndex]?.source === fav.source;

        return (
          <Box
            key={`${fav.songId}_${fav.source}`}
            onClick={() => onSongClick(index)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              mb: 1,
              borderRadius: 2,
              cursor: 'pointer',
              background: isCurrentPlaying ? 'rgba(255, 107, 107, 0.3)' : 'transparent',
              border: isCurrentPlaying ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid transparent',
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
                background: isCurrentPlaying
                  ? 'linear-gradient(135deg, #ff6b6b, #ff5252)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                mr: 2,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                {fav.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {fav.artist} · {fav.album}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(song);
              }}
              sx={{ 
                color: isFavorite(song) ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {isFavorite(song) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
}

