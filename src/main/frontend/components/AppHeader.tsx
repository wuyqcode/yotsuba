import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import { useNavigate } from 'react-router';
import HeaderNavBar from 'Frontend/components/HeaderNavBar';
import { useMusicPlayerStore } from 'Frontend/features/music/hooks/useMusicPlayerStore';
import { useMusicPlayer } from 'Frontend/features/music/hooks/useMusicPlayer';
import { IconButton, Typography, useMediaQuery } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import HeaderUserMenu from './HeaderUserMenu';

const HEIGHT = 50;

export default function AppHeader() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');

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
        padding: isMobile ? '0 8px' : '0 16px',
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
      {!isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardMedia
            component="img"
            src="images/icon.png"
            sx={{ width: 40, height: 40, cursor: 'pointer' }}
            onClick={() => navigate('/note')}
          />

          <HeaderNavBar />
        </Box>
      )}
      
      {isMobile && (
        <CardMedia
          component="img"
          src="images/icon.png"
          sx={{ width: 32, height: 32, cursor: 'pointer' }}
          onClick={() => navigate('/note')}
        />
      )}

      {/* center: 音乐播放器（如果有正在播放的音乐） */}
      {currentSong && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 0.5 : 1,
            flex: 1,
            justifyContent: 'center',
            maxWidth: isMobile ? 'none' : 400,
            mx: isMobile ? 0 : 2,
            ...(isMobile && {
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'auto',
              maxWidth: 'calc(100% - 90px)',
            }),
          }}
          onClick={() => navigate('/music')}
        >
          <CardMedia
            component="img"
            src={
              currentCover ||
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo='
            }
            sx={{
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              borderRadius: 1,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              minWidth: 0,
              overflow: 'hidden',
              maxWidth: isMobile ? '120px' : 'none',
              flex: isMobile ? 0 : 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                display: 'block',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                ...(isMobile
                  ? {
                      animation: currentSong.name.length > 8 ? 'marquee 8s linear infinite' : 'none',
                      '@keyframes marquee': {
                        '0%': { transform: 'translateX(0%)' },
                        '100%': { transform: 'translateX(-50%)' },
                      },
                    }
                  : {
                      textOverflow: 'ellipsis',
                    }),
              }}
            >
              {isMobile && currentSong.name.length > 8
                ? `${currentSong.name} • ${currentSong.name}`
                : currentSong.name}
            </Typography>
            {!isMobile && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {Array.isArray(currentSong.artist) ? currentSong.artist.join(' / ') : currentSong.artist}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: isMobile ? 0.25 : 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                previousSong();
              }}
              disabled={currentIndex <= 0}
              sx={{
                padding: isMobile ? '2px' : '4px',
                width: isMobile ? 24 : 28,
                height: isMobile ? 24 : 28,
              }}
            >
              <SkipPreviousIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayFromHook();
              }}
              sx={{
                padding: isMobile ? '2px' : '4px',
                width: isMobile ? 24 : 28,
                height: isMobile ? 24 : 28,
              }}
            >
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                nextSong();
              }}
              disabled={currentIndex >= currentPlaylist.length - 1}
              sx={{
                padding: isMobile ? '2px' : '4px',
                width: isMobile ? 24 : 28,
                height: isMobile ? 24 : 28,
              }}
            >
              <SkipNextIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* right: avatar */}
      <Box sx={{ ...(isMobile && { position: 'relative', zIndex: 1 }) }}>
        <HeaderUserMenu />
      </Box>
    </Box>
  );
}