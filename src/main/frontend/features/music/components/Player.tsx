import {
  Box,
  Typography,
  IconButton,
  Slider,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import DownloadIcon from '@mui/icons-material/Download';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  currentCover: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: string;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeChange: (value: number) => void;
  onQualityChange: (value: string) => void;
  onDownloadSong: () => void;
  onDownloadLyric: () => void;
}

export function Player({
  currentSong,
  currentCover,
  isPlaying,
  currentTime,
  duration,
  volume,
  quality,
  onTogglePlay,
  onPrevious,
  onNext,
  onProgressClick,
  onVolumeChange,
  onQualityChange,
  onDownloadSong,
  onDownloadLyric,
}: PlayerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* 当前歌曲信息 */}
      <Box textAlign="center" mb={3}>
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            mb: 2,
          }}
        >
          <Box
            component="img"
            src={currentCover}
            alt="专辑封面"
            sx={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              border: '6px solid rgba(255, 255, 255, 0.1)',
              animation: isPlaying ? 'rotate 20s linear infinite' : 'none',
              '@keyframes rotate': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>
          {currentSong?.name || '未选择歌曲'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {currentSong
            ? `${Array.isArray(currentSong.artist) ? currentSong.artist.join(' / ') : currentSong.artist} · ${currentSong.album}`
            : '请搜索并选择要播放的歌曲'}
        </Typography>
      </Box>

      {/* 播放控制 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={onPrevious}
          sx={{
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <SkipPreviousIcon />
        </IconButton>
        <IconButton
          onClick={onTogglePlay}
          sx={{
            width: 65,
            height: 65,
            color: '#fff',
            background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff5252, #ff4444)',
              boxShadow: '0 12px 35px rgba(255, 107, 107, 0.6)',
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          onClick={onNext}
          sx={{
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <SkipNextIcon />
        </IconButton>
      </Box>

      {/* 进度条 */}
      <Box sx={{ mb: 3 }}>
        <Box
          onClick={onProgressClick}
          sx={{
            width: '100%',
            height: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            cursor: 'pointer',
            position: 'relative',
            mb: 1,
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #ff6b6b, #ff8a80)',
              borderRadius: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 12,
                height: 12,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </Box>
      </Box>

      {/* 音质选择 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          p: 1.5,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNoteIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.8)' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            音质
          </Typography>
        </Box>
        <Select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value)}
          size="small"
          sx={{
            color: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff6b6b',
            },
          }}
        >
          <MenuItem value="128">标准 128K</MenuItem>
          <MenuItem value="192">较高 192K</MenuItem>
          <MenuItem value="320">高品质 320K</MenuItem>
          <MenuItem value="740">无损 FLAC</MenuItem>
          <MenuItem value="999">Hi-Res</MenuItem>
        </Select>
      </Box>

      {/* 音量控制 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        {volume === 0 ? (
          <VolumeMuteIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        ) : volume < 50 ? (
          <VolumeDownIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        ) : (
          <VolumeUpIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        )}
        <Slider
          value={volume}
          onChange={(_, value) => onVolumeChange(value as number)}
          sx={{
            color: '#ff6b6b',
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
            },
          }}
        />
      </Box>

      {/* 下载按钮 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onDownloadSong}
          disabled={!currentSong}
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            '&:hover': {
              borderColor: '#ff6b6b',
              color: '#ff6b6b',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          下载音乐
        </Button>
        <Button
          variant="outlined"
          onClick={onDownloadLyric}
          disabled={!currentSong}
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            '&:hover': {
              borderColor: '#ff6b6b',
              color: '#ff6b6b',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          下载歌词
        </Button>
      </Box>
    </Box>
  );
}

