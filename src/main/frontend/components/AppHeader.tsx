import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import { useNavigate } from 'react-router';
import HeaderNavBar from 'Frontend/components/HeaderNavBar';
import { useMusicPlayerStore } from 'Frontend/features/music/hooks/useMusicPlayerStore';
import { useMusicPlayer } from 'Frontend/features/music/hooks/useMusicPlayer';
import { IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import HeaderUserMenu from './HeaderUserMenu';

const HEIGHT = 50;

export default function AppHeader() {
  const navigate = useNavigate();

  // 音乐播放器状态
  const currentSong = useMusicPlayerStore((s) => s.currentSong);
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const currentIndex = useMusicPlayerStore((s) => s.currentIndex);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const currentCover = useMusicPlayerStore((s) => s.currentCover);

  // 获取播放控制函数
  const { togglePlay: togglePlayFromHook, nextSong, previousSong } = useMusicPlayer();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        padding: '0 16px',
        width: '100%',
        height: HEIGHT,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1300,
        background: 'rgba(255, 255, 255, 0.87)',
        boxShadow: '1',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
      {/* left: menu + logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CardMedia
          component="img"
          src="images/icon.png"
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => navigate('/note')}
        />

        <HeaderNavBar />
      </Box>

      {/* center: 音乐播放器（如果有正在播放的音乐） */}
      {currentSong && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
            justifyContent: 'center',
            maxWidth: 400,
            mx: 2,
          }}
          onClick={() => navigate('/music')}>
          <CardMedia
            component="img"
            src={
              currentCover ||
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo='
            }
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              objectFit: 'cover',
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {currentSong.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}>
              {Array.isArray(currentSong.artist) ? currentSong.artist.join(' / ') : currentSong.artist}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              previousSong();
            }}
            disabled={currentIndex <= 0}
            sx={{ padding: '4px' }}>
            <SkipPreviousIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayFromHook();
            }}
            sx={{ padding: '4px' }}>
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              nextSong();
            }}
            disabled={currentIndex >= currentPlaylist.length - 1}
            sx={{ padding: '4px' }}>
            <SkipNextIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* right: avatar */}
      <HeaderUserMenu />
    </Box>
  );
}