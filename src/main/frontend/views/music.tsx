import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Slider,
  LinearProgress,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { GlassBox } from 'Frontend/components/GlassBox';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { dbManager, FavoriteSong } from 'Frontend/utils/indexedDB';

export const config: ViewConfig = {
  menu: { order: 8, icon: 'MusicNoteIcon' },
  title: '云音乐播放器',
};

const API_BASE = 'https://music-api.gdstudio.xyz/api.php';

interface Song {
  id: string;
  source: string;
  name: string;
  artist: string | string[];
  album: string;
  pic_id?: string;
  lyric_id?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

export default function MusicPlayerView() {
  // 状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [source, setSource] = useState('netease');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistId, setPlaylistId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [quality, setQuality] = useState('320');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [currentCover, setCurrentCover] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化 IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        await dbManager.init();
        await loadFavorites();
      } catch (err) {
        console.error('Failed to initialize IndexedDB:', err);
      }
    };
    initDB();
  }, []);

  // 加载收藏列表
  const loadFavorites = async () => {
    try {
      const favs = await dbManager.getAllFavorites();
      setFavorites(favs);
      const ids = new Set(favs.map(f => `${f.id}_${f.source}`));
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  // 检查是否已收藏
  const isFavorite = (song: Song): boolean => {
    return favoriteIds.has(`${song.id}_${song.source}`);
  };

  // 切换收藏状态
  const toggleFavorite = async (song: Song) => {
    try {
      const isFav = isFavorite(song);
      if (isFav) {
        await dbManager.removeFavorite(song.id, song.source);
        showNotification('已取消收藏', 'info');
      } else {
        await dbManager.addFavorite({
          id: song.id,
          source: song.source,
          name: song.name,
          artist: Array.isArray(song.artist) ? song.artist.join(' / ') : song.artist,
          album: song.album,
          pic_id: song.pic_id,
          lyric_id: song.lyric_id,
        });
        showNotification('已添加到收藏', 'success');
      }
      await loadFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showNotification('操作失败，请重试', 'error');
    }
  };

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  // 搜索音乐
  const searchMusic = async () => {
    if (!searchKeyword.trim()) {
      showNotification('请输入搜索关键词', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}?types=search&source=${source}&name=${encodeURIComponent(searchKeyword)}&count=30`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSongs(data);
        setCurrentPlaylist(data);
      } else {
        setError('未找到相关歌曲，请尝试其他关键词');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('网络连接失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  // 解析网易云歌单
  const parsePlaylist = async () => {
    if (!playlistId.trim()) {
      showNotification('请输入歌单ID', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}?types=playlist&id=${playlistId}&source=netease`);
      const data = await response.json();

      let playlistSongs: Song[] = [];
      if (data?.playlist?.tracks) {
        playlistSongs = data.playlist.tracks.map((track: any) => ({
          name: track.name,
          artist: track.ar.map((a: any) => a.name).join(' / '),
          album: track.al.name,
          id: track.id,
          pic_id: track.al.pic_id_str || track.al.pic_str || track.al.pic,
          lyric_id: track.id,
          source: 'netease',
        }));
      } else if (data?.tracks) {
        playlistSongs = data.tracks.map((track: any) => ({
          name: track.name,
          artist: track.ar.map((a: any) => a.name).join(' / '),
          album: track.al.name,
          id: track.id,
          pic_id: track.al.pic_id_str || track.al.pic_str || track.al.pic,
          lyric_id: track.id,
          source: 'netease',
        }));
      }

      if (playlistSongs.length > 0) {
        setSongs(playlistSongs);
        setCurrentPlaylist(playlistSongs);
        showNotification(`成功加载 ${playlistSongs.length} 首歌曲`, 'success');
      } else {
        setError('解析歌单失败，请检查ID是否正确');
      }
    } catch (err) {
      console.error('Parse playlist failed:', err);
      setError('网络连接失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取专辑封面
  const getAlbumCoverUrl = async (song: Song, size = 300): Promise<string> => {
    if (!song.pic_id) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo=';
    }

    try {
      const response = await fetch(`${API_BASE}?types=pic&source=${song.source}&id=${song.pic_id}&size=${size}`);
      const data = await response.json();
      if (data?.url) {
        return data.url;
      }
    } catch (err) {
      console.error('Failed to get album cover:', err);
    }

    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo=';
  };

  // 播放歌曲
  const playSong = async (index: number, playlist: Song[]) => {
    if (index < 0 || index >= playlist.length) return;

    setCurrentIndex(index);
    setCurrentPlaylist(playlist);
    const song = playlist[index];

    // 更新封面
    const coverUrl = await getAlbumCoverUrl(song, 500);
    setCurrentCover(coverUrl);

    try {
      showNotification('正在加载音乐...', 'info');

      const urlResponse = await fetch(`${API_BASE}?types=url&source=${song.source}&id=${song.id}&br=${quality}`);
      const urlData = await urlResponse.json();

      if (urlData?.url && audioRef.current) {
        audioRef.current.src = urlData.url;
        audioRef.current.load();
        await loadLyrics(song);
        showNotification(`开始播放 (${getQualityText(urlData.br || quality)})`, 'success');
      } else {
        showNotification('无法获取音乐链接，请尝试其他歌曲或更换音质', 'error');
      }
    } catch (err) {
      console.error('Play failed:', err);
      showNotification('播放失败，请检查网络连接', 'error');
    }
  };

  // 加载歌词
  const loadLyrics = async (song: Song) => {
    try {
      const response = await fetch(`${API_BASE}?types=lyric&source=${song.source}&id=${song.lyric_id || song.id}`);
      const data = await response.json();

      if (data?.lyric) {
        parseLyrics(data.lyric);
      } else {
        setLyrics([]);
      }
    } catch (err) {
      console.error('Failed to load lyrics:', err);
      setLyrics([]);
    }
  };

  // 解析歌词
  const parseLyrics = (lrcText: string) => {
    const lines = lrcText.split('\n');
    const parsed: LyricLine[] = [];

    lines.forEach((line) => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, '0'));
        const text = match[4].trim();
        if (text) {
          const time = minutes * 60 + seconds + milliseconds / 1000;
          parsed.push({ time, text });
        }
      }
    });

    parsed.sort((a, b) => a.time - b.time);
    setLyrics(parsed);
  };

  // 更新歌词高亮
  const updateLyricHighlight = useCallback(() => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    let activeIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        activeIndex = i;
      } else {
        break;
      }
    }

    setActiveLyricIndex(activeIndex);

    // 自动滚动
    if (activeIndex >= 0 && !isUserScrollingRef.current && lyricsContainerRef.current) {
      const activeLine = lyricsContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeLine) {
        const container = lyricsContainerRef.current;
        const containerHeight = container.clientHeight;
        const lineHeight = activeLine.offsetHeight;
        const lineOffsetTop = activeLine.offsetTop;
        const idealScrollTop = lineOffsetTop - containerHeight / 2 + lineHeight / 2;

        container.scrollTo({
          top: Math.max(0, idealScrollTop),
          behavior: 'smooth',
        });
      }
    }
  }, [lyrics]);

  // 播放控制
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else {
      showNotification('请先选择要播放的歌曲', 'warning');
    }
  };

  const previousSong = () => {
    if (currentIndex > 0) {
      playSong(currentIndex - 1, currentPlaylist);
    }
  };

  const nextSong = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      playSong(currentIndex + 1, currentPlaylist);
    }
  };

  // 进度控制
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  // 下载歌曲
  const downloadSong = async (song: Song) => {
    try {
      showNotification('正在获取下载链接...', 'info');
      const response = await fetch(`${API_BASE}?types=url&source=${song.source}&id=${song.id}&br=${quality}`);
      const data = await response.json();

      if (data?.url) {
        const link = document.createElement('a');
        link.href = data.url;
        link.download = `${song.name} - ${Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('开始下载音乐文件', 'success');
      } else {
        showNotification('无法获取下载链接', 'error');
      }
    } catch (err) {
      console.error('Download failed:', err);
      showNotification('下载失败，请稍后重试', 'error');
    }
  };

  // 下载歌词
  const downloadLyric = async (song: Song) => {
    try {
      showNotification('正在获取歌词...', 'info');
      const response = await fetch(`${API_BASE}?types=lyric&source=${song.source}&id=${song.lyric_id || song.id}`);
      const data = await response.json();

      if (data?.lyric) {
        let lyricContent = `歌曲：${song.name}\n`;
        lyricContent += `歌手：${Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}\n`;
        lyricContent += `专辑：${song.album}\n`;
        lyricContent += `来源：${song.source}\n\n`;
        lyricContent += data.lyric;

        if (data.tlyric) {
          lyricContent += '\n\n=== 翻译歌词 ===\n';
          lyricContent += data.tlyric;
        }

        const blob = new Blob([lyricContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.name} - ${Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}.lrc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification('歌词下载完成', 'success');
      } else {
        showNotification('该歌曲暂无歌词', 'warning');
      }
    } catch (err) {
      console.error('Download lyric failed:', err);
      showNotification('下载歌词失败，请稍后重试', 'error');
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取音质文本
  const getQualityText = (br: string): string => {
    const qualityMap: Record<string, string> = {
      '128': '标准音质',
      '192': '较高音质',
      '320': '高品质',
      '740': '无损音质',
      '999': 'Hi-Res音质',
    };
    return qualityMap[br] || `${br}K`;
  };

  // 音频事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateLyricHighlight();
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      nextSong();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [updateLyricHighlight]);

  // 歌词滚动处理
  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 2000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        previousSong();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextSong();
      }
    };

    window.addEventListener('keydown', handleKeyDown as any);
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [isPlaying, currentIndex, currentPlaylist]);

  // 音质改变时重新加载
  useEffect(() => {
    if (currentIndex !== -1 && audioRef.current?.src) {
      const currentTime = audioRef.current.currentTime;
      const wasPlaying = isPlaying;
      playSong(currentIndex, currentPlaylist).then(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
          if (!wasPlaying) {
            audioRef.current.pause();
          }
        }
      });
    }
  }, [quality]);

  // 切换到收藏标签页
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 2) {
      // 收藏标签页
      loadFavorites();
    }
  };

  // 从收藏播放
  const playFromFavorites = async (index: number) => {
    const favSongs: Song[] = favorites.map(fav => ({
      id: fav.id,
      source: fav.source,
      name: fav.name,
      artist: fav.artist,
      album: fav.album,
      pic_id: fav.pic_id,
      lyric_id: fav.lyric_id,
    }));
    setCurrentPlaylist(favSongs);
    await playSong(index, favSongs);
  };

  const currentSong = currentIndex >= 0 && currentIndex < currentPlaylist.length 
    ? currentPlaylist[currentIndex] 
    : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        '@keyframes gradientBG': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          zIndex: -1,
        },
      }}
    >
      <GlassBox sx={{ minHeight: '100vh', background: 'rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
          {/* 顶部导航 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              p: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 32, color: '#ff6b6b' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              云音乐
            </Typography>

            <Box sx={{ flex: 1, display: 'flex', gap: 1, mx: 2 }}>
              <TextField
                fullWidth
                placeholder="搜索音乐、歌手、专辑..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff6b6b',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b6b',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff6b6b',
                    },
                  }}
                >
                  <MenuItem value="netease">网易云音乐</MenuItem>
                  <MenuItem value="tencent">QQ音乐</MenuItem>
                  <MenuItem value="kuwo">酷我音乐</MenuItem>
                  <MenuItem value="kugou">酷狗音乐</MenuItem>
                  <MenuItem value="migu">咪咕音乐</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={searchMusic}
                sx={{
                  background: '#ff6b6b',
                  '&:hover': { background: '#ff5252' },
                  minWidth: 100,
                }}
                startIcon={<SearchIcon />}
              >
                搜索
              </Button>
            </Box>
          </Box>

          {/* 主要内容区域 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '600px 450px 350px', gap: 3 }}>
            {/* 搜索结果区域 */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: 'calc(100vh - 240px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      '&.Mui-selected': {
                        color: '#ff6b6b',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#ff6b6b',
                    },
                  }}
                >
                  <Tab label="搜索结果" icon={<SearchIcon />} iconPosition="start" />
                  <Tab label="网易云歌单" icon={<QueueMusicIcon />} iconPosition="start" />
                  <Tab label="我的收藏" icon={<FavoriteIcon />} iconPosition="start" />
                </Tabs>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {tabValue === 0 && (
                    <Box>
                      {loading && (
                        <Box textAlign="center" py={4}>
                          <CircularProgress sx={{ color: '#ff6b6b' }} />
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2 }}>
                            正在搜索音乐...
                          </Typography>
                        </Box>
                      )}
                      {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {error}
                        </Alert>
                      )}
                      {!loading && !error && songs.length === 0 && (
                        <Box textAlign="center" py={4} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                          <Typography>在上方搜索框输入关键词开始搜索音乐</Typography>
                        </Box>
                      )}
                      {songs.map((song, index) => (
                        <Box
                          key={`${song.id}_${song.source}`}
                          onClick={() => playSong(index, currentPlaylist)}
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
                              toggleFavorite(song);
                            }}
                            sx={{ color: isFavorite(song) ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)' }}
                          >
                            {isFavorite(song) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSong(song);
                            }}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="输入网易云歌单ID..."
                          value={playlistId}
                          onChange={(e) => setPlaylistId(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#fff',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={parsePlaylist}
                          sx={{ background: '#ff6b6b', '&:hover': { background: '#ff5252' } }}
                        >
                          解析
                        </Button>
                      </Box>
                      {songs.map((song, index) => (
                        <Box
                          key={`${song.id}_${song.source}`}
                          onClick={() => playSong(index, currentPlaylist)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            background: currentIndex === index ? 'rgba(255, 107, 107, 0.3)' : 'transparent',
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
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#fff',
                              mr: 2,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                              {song.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {Array.isArray(song.artist) ? song.artist.join(' / ') : song.artist}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {tabValue === 2 && (
                    <Box>
                      {favorites.length === 0 ? (
                        <Box textAlign="center" py={4} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <FavoriteBorderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                          <Typography>暂无收藏的音乐</Typography>
                        </Box>
                      ) : (
                        favorites.map((fav, index) => {
                          const song: Song = {
                            id: fav.id,
                            source: fav.source,
                            name: fav.name,
                            artist: fav.artist,
                            album: fav.album,
                            pic_id: fav.pic_id,
                            lyric_id: fav.lyric_id,
                          };
                          return (
                            <Box
                              key={`${fav.id}_${fav.source}`}
                              onClick={() => playFromFavorites(index)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                mb: 1,
                                borderRadius: 2,
                                cursor: 'pointer',
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
                                  background: 'rgba(255, 255, 255, 0.1)',
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
                                  toggleFavorite(song);
                                }}
                                sx={{ color: '#ff6b6b' }}
                              >
                                <FavoriteIcon />
                              </IconButton>
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* 播放器区域 */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: 'calc(100vh - 240px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    onClick={previousSong}
                    sx={{
                      color: '#fff',
                      background: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
                    }}
                  >
                    <SkipPreviousIcon />
                  </IconButton>
                  <IconButton
                    onClick={togglePlay}
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
                    onClick={nextSong}
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
                    onClick={handleProgressClick}
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
                    onChange={(e) => setQuality(e.target.value)}
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
                    onChange={(_, value) => {
                      setVolume(value as number);
                      if (audioRef.current) {
                        audioRef.current.volume = (value as number) / 100;
                      }
                    }}
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
                    onClick={() => currentSong && downloadSong(currentSong)}
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
                    onClick={() => currentSong && downloadLyric(currentSong)}
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
              </CardContent>
            </Card>

            {/* 歌词区域 */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: 'calc(100vh - 240px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
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
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = lyric.time;
                          }
                        }}
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
              </CardContent>
            </Card>
          </Box>
        </Box>
      </GlassBox>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} preload="metadata" />

      {/* 通知 */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

