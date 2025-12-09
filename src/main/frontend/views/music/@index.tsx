import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { useState, useEffect, KeyboardEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { SearchBar } from 'Frontend/features/music/components/SearchBar';
import { SongList } from 'Frontend/features/music/components/SongList';
import { FavoriteList } from 'Frontend/features/music/components/FavoriteList';
import { Player } from 'Frontend/features/music/components/Player';
import { Lyrics } from 'Frontend/features/music/components/Lyrics';
import { useMusicPlayer } from 'Frontend/features/music/hooks/useMusicPlayer';
import { Song, API_BASE } from 'Frontend/features/music/types';

export const config: ViewConfig = {
  menu: { order: 8, icon: 'MusicNoteIcon' },
  title: '云音乐播放器',
  loginRequired: true,
};

export default function MusicPlayerView() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [source, setSource] = useState('netease');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const isTablet = useMediaQuery('(max-width: 1200px)');

  const {
    songs,
    setSongs,
    currentIndex,
    currentPlaylist,
    setCurrentPlaylist,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    quality,
    setQuality,
    lyrics,
    activeLyricIndex,
    currentCover,
    favorites,
    audioRef,
    lyricsContainerRef,
    isFavorite,
    toggleFavorite,
    playSong,
    togglePlay,
    previousSong,
    nextSong,
    handleProgressClick,
    downloadSong,
    downloadLyric,
    playFromFavorites,
    currentSong,
  } = useMusicPlayer();

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

    // 如果当前在收藏标签页，切换到搜索结果标签页
    if (tabValue === 1) {
      setTabValue(0);
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

  // 处理歌曲点击
  const handleSongClick = async (index: number) => {
    try {
      await playSong(index, currentPlaylist);
      showNotification('开始播放', 'success');
    } catch (err) {
      console.error('Play failed:', err);
      showNotification('播放失败，请检查网络连接', 'error');
    }
  };

  // 处理收藏切换
  const handleToggleFavorite = async (song: Song) => {
    try {
      const isFav = isFavorite(song);
      await toggleFavorite(song);
      showNotification(isFav ? '已取消收藏' : '已添加到收藏', isFav ? 'info' : 'success');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showNotification('操作失败，请重试', 'error');
    }
  };

  // 处理下载
  const handleDownloadSong = async (song: Song) => {
    try {
      showNotification('正在获取下载链接...', 'info');
      await downloadSong(song);
      showNotification('开始下载音乐文件', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showNotification('下载失败，请稍后重试', 'error');
    }
  };

  // 处理下载歌词
  const handleDownloadLyric = async (song: Song) => {
    try {
      showNotification('正在获取歌词...', 'info');
      await downloadLyric(song);
      showNotification('歌词下载完成', 'success');
    } catch (err) {
      console.error('Download lyric failed:', err);
      showNotification('下载歌词失败，请稍后重试', 'error');
    }
  };

  // 处理从收藏播放
  const handlePlayFromFavorites = async (index: number) => {
    try {
      await playFromFavorites(index);
      showNotification('开始播放', 'success');
    } catch (err) {
      console.error('Play failed:', err);
      showNotification('播放失败，请检查网络连接', 'error');
    }
  };

  // 切换到收藏标签页
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
  }, [togglePlay, previousSong, nextSong]);

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
      <Box sx={{ minHeight: '100vh', background: 'rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ p: isMobile ? 1 : 3, maxWidth: 1600, mx: 'auto' }}>
          {/* 顶部导航 */}
          <SearchBar
            searchKeyword={searchKeyword}
            source={source}
            onSearchKeywordChange={setSearchKeyword}
            onSourceChange={setSource}
            onSearch={searchMusic}
          />

          {/* 主要内容区域 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '600px 450px 350px',
              gap: isMobile ? 1 : 3,
            }}
          >
            {/* 搜索结果区域 */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: isMobile ? 'auto' : 'calc(100vh)',
                minHeight: isMobile ? '400px' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                ...(isMobile && isTablet && { gridColumn: '1 / -1' }),
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
                  <Tab label="我的收藏" icon={<FavoriteIcon />} iconPosition="start" />
                </Tabs>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {tabValue === 0 && (
                    <SongList
                      songs={songs}
                      currentIndex={currentIndex}
                      loading={loading}
                      error={error}
                      isFavorite={isFavorite}
                      onSongClick={handleSongClick}
                      onToggleFavorite={handleToggleFavorite}
                      onDownload={handleDownloadSong}
                    />
                  )}

                  {tabValue === 1 && (
                    <FavoriteList
                      favorites={favorites}
                      currentIndex={currentIndex}
                      currentPlaylist={currentPlaylist}
                      isFavorite={isFavorite}
                      onSongClick={handlePlayFromFavorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
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
                height: isMobile ? 'auto' : 'calc(100vh)',
                minHeight: isMobile ? '400px' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                ...(isMobile && isTablet && { gridColumn: '1 / -1' }),
              }}
            >
              <CardContent>
                <Player
                  currentSong={currentSong}
                  currentCover={currentCover}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  quality={quality}
                  onTogglePlay={togglePlay}
                  onPrevious={previousSong}
                  onNext={nextSong}
                  onProgressClick={handleProgressClick}
                  onVolumeChange={setVolume}
                  onQualityChange={setQuality}
                  onDownloadSong={() => currentSong && handleDownloadSong(currentSong)}
                  onDownloadLyric={() => currentSong && handleDownloadLyric(currentSong)}
                />
              </CardContent>
            </Card>

            {/* 歌词区域 */}
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: isMobile ? 'auto' : 'calc(100vh)',
                minHeight: isMobile ? '300px' : 'auto',
                display: isMobile ? 'none' : 'flex',
                flexDirection: 'column',
                ...(isTablet && !isMobile && { gridColumn: '1 / -1' }),
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 }}>
                <Lyrics
                  lyrics={lyrics}
                  activeLyricIndex={activeLyricIndex}
                  lyricsContainerRef={lyricsContainerRef}
                  onLyricClick={(time) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = time;
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>


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

