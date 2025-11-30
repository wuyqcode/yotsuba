import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import { Icon } from '@vaadin/react-components';
import { useNavigate } from 'react-router';
import { useAuth } from 'Frontend/utils/auth';
import HeaderNavBar from 'Frontend/components/HeaderNavBar';
import { useMusicPlayerStore } from 'Frontend/features/music/hooks/useMusicPlayerStore';
import { useMusicPlayer } from 'Frontend/features/music/hooks/useMusicPlayer';
import { IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const HEIGHT = 50;

export default function AppHeader() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 音乐播放器状态
  const currentSong = useMusicPlayerStore((s) => s.currentSong);
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const currentIndex = useMusicPlayerStore((s) => s.currentIndex);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const currentCover = useMusicPlayerStore((s) => s.currentCover);
  
  // 获取播放控制函数
  const { togglePlay: togglePlayFromHook, nextSong, previousSong } = useMusicPlayer();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const profilePictureUrl =
    state.user &&
    `data:image;base64,${btoa(
      state.user.profilePicture.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), '')
    )}`;

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
          onClick={() => navigate('/music')}
        >
          <CardMedia
            component="img"
            src={currentCover || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo='}
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
              }}
            >
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
              }}
            >
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
            sx={{ padding: '4px' }}
          >
            <SkipPreviousIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayFromHook();
            }}
            sx={{ padding: '4px' }}
          >
            {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              nextSong();
            }}
            disabled={currentIndex >= currentPlaylist.length - 1}
            sx={{ padding: '4px' }}
          >
            <SkipNextIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* right: avatar */}
      {state.user ? (
        <Box sx={{ position: 'relative' }}>
          <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={handleClick}>
            <img src={profilePictureUrl} alt="profile" style={{ width: 24, height: 24 }} />
          </Avatar>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem
              onClick={async () => {
                await logout();
                document.location.reload();
              }}>
              Sign out
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={() => navigate('/login')}>
          <Icon icon="vaadin:user" />
        </Avatar>
      )}
    </Box>
  );
}
