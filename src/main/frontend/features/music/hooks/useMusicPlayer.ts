import { useRef, useEffect, useCallback } from 'react';
import { Song, LyricLine, API_BASE } from '../types';
import { useMusicStore } from './useMusicStore';
import { useMusicPlayerStore } from './useMusicPlayerStore';

export function useMusicPlayer() {
  // 使用全局 store
  const songs = useMusicPlayerStore((s) => s.songs);
  const currentIndex = useMusicPlayerStore((s) => s.currentIndex);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const currentTime = useMusicPlayerStore((s) => s.currentTime);
  const duration = useMusicPlayerStore((s) => s.duration);
  const volume = useMusicPlayerStore((s) => s.volume);
  const quality = useMusicPlayerStore((s) => s.quality);
  const lyrics = useMusicPlayerStore((s) => s.lyrics);
  const activeLyricIndex = useMusicPlayerStore((s) => s.activeLyricIndex);
  const currentCover = useMusicPlayerStore((s) => s.currentCover);
  const currentSong = useMusicPlayerStore((s) => s.currentSong);
  
  const setSongs = useMusicPlayerStore((s) => s.setSongs);
  const setCurrentIndex = useMusicPlayerStore((s) => s.setCurrentIndex);
  const setCurrentPlaylist = useMusicPlayerStore((s) => s.setCurrentPlaylist);
  const setIsPlaying = useMusicPlayerStore((s) => s.setIsPlaying);
  const setCurrentTime = useMusicPlayerStore((s) => s.setCurrentTime);
  const setDuration = useMusicPlayerStore((s) => s.setDuration);
  const setVolume = useMusicPlayerStore((s) => s.setVolume);
  const setQuality = useMusicPlayerStore((s) => s.setQuality);
  const setLyrics = useMusicPlayerStore((s) => s.setLyrics);
  const setActiveLyricIndex = useMusicPlayerStore((s) => s.setActiveLyricIndex);
  const setCurrentCover = useMusicPlayerStore((s) => s.setCurrentCover);

  // 使用 useMusicStore 管理收藏
  const favorites = useMusicStore((s) => s.favorites);
  const favoriteIds = useMusicStore((s) => s.favoriteIds);
  const fetchFavorites = useMusicStore((s) => s.fetchFavorites);
  const isFavoriteFromStore = useMusicStore((s) => s.isFavorite);
  const toggleFavoriteFromStore = useMusicStore((s) => s.toggleFavorite);

  // 从全局获取 audio ref（通过 window 对象）
  const getAudioRef = () => {
    const ref = (window as any).__musicAudioRef;
    return ref?.current || null;
  };

  const audioRef = {
    get current() {
      return getAudioRef();
    }
  } as React.RefObject<HTMLAudioElement>;
  
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化时加载收藏列表（只在首次挂载时执行，避免页面切换时重复加载）
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchFavorites();
    }
  }, [fetchFavorites]);

  // 检查是否已收藏
  const isFavorite = useCallback((song: Song): boolean => {
    return isFavoriteFromStore(song.id, song.source);
  }, [isFavoriteFromStore]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (song: Song) => {
    try {
      await toggleFavoriteFromStore(song);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [toggleFavoriteFromStore]);

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
    setLyrics(parsed); // 使用全局 store
  };

  // 加载歌词
  const loadLyrics = async (song: Song) => {
    try {
      const response = await fetch(`${API_BASE}?types=lyric&source=${song.source}&id=${song.lyric_id || song.id}`);
      const data = await response.json();

      if (data?.lyric) {
        parseLyrics(data.lyric);
      } else {
        setLyrics([]); // 使用全局 store
      }
    } catch (err) {
      console.error('Failed to load lyrics:', err);
      setLyrics([]); // 使用全局 store
    }
  };

  // 播放歌曲 - 修复播放问题
  const playSong = useCallback(async (index: number, playlist: Song[], autoPlay: boolean = true) => {
    if (index < 0 || index >= playlist.length) return;

    const song = playlist[index];
    
    // 如果指定了 autoPlay，则应该播放；否则保持之前的播放状态
    const shouldPlay = autoPlay ? true : isPlaying;
    
    // 先更新状态（使用全局 store）
    setCurrentIndex(index);
    setCurrentPlaylist(playlist);

    // 先暂停并清理当前音频
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        // 移除所有事件监听器，避免内存泄漏
        audio.src = '';
        audio.load();
        // 等待一下确保清理完成
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn('Error cleaning up audio:', err);
      }
    }

    // 更新封面（使用全局 store）
    const coverUrl = await getAlbumCoverUrl(song, 500);
    setCurrentCover(coverUrl);

    try {
      const urlResponse = await fetch(`${API_BASE}?types=url&source=${song.source}&id=${song.id}&br=${quality}`);
      const urlData = await urlResponse.json();

      if (!urlData?.url) {
        throw new Error('无法获取音乐链接');
      }

      const audioElement = audioRef.current;
      if (!audioElement) {
        throw new Error('Audio element not available');
      }

      // 设置新的音频源
      audioElement.src = urlData.url;
      audioElement.load();
      
      // 等待音频加载完成并自动播放
      await new Promise<void>((resolve, reject) => {
        const audio = audioRef.current;
        if (!audio) {
          reject(new Error('Audio element not available'));
          return;
        }
        let resolved = false;

        const cleanup = () => {
          if (!resolved) {
            audioElement.removeEventListener('canplay', handleCanPlay);
            audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
            audioElement.removeEventListener('error', handleError);
            audioElement.removeEventListener('loadeddata', handleLoadedData);
          }
        };

        const handleCanPlay = async () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            // 如果需要播放，则自动播放新歌曲
            if (shouldPlay) {
              try {
                await audioElement.play();
              } catch (err) {
                console.warn('Auto-play failed, user interaction may be required:', err);
              }
            }
            resolve();
          }
        };

        const handleCanPlayThrough = async () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            // 如果需要播放，则自动播放新歌曲
            if (shouldPlay) {
              try {
                await audioElement.play();
              } catch (err) {
                console.warn('Auto-play failed, user interaction may be required:', err);
              }
            }
            resolve();
          }
        };

        const handleLoadedData = async () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            // 如果需要播放，则自动播放新歌曲
            if (shouldPlay) {
              try {
                await audioElement.play();
              } catch (err) {
                console.warn('Auto-play failed, user interaction may be required:', err);
              }
            }
            resolve();
          }
        };

        const handleError = (e: Event) => {
          if (!resolved) {
            resolved = true;
            cleanup();
            reject(new Error('Failed to load audio'));
          }
        };

        // 尝试多个事件以确保加载完成
        audioElement.addEventListener('canplay', handleCanPlay);
        audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
        audioElement.addEventListener('loadeddata', handleLoadedData);
        audioElement.addEventListener('error', handleError);

        // 设置超时
        setTimeout(async () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            // 即使超时也尝试继续，因为有些音频可能已经可以播放
            if (shouldPlay) {
              try {
                const audio = audioRef.current;
                if (audio) {
                  await audio.play();
                }
              } catch (err) {
                console.warn('Auto-play failed after timeout:', err);
              }
            }
            resolve();
          }
        }, 15000);
      });

      await loadLyrics(song);
    } catch (err) {
      console.error('Play failed:', err);
      throw err;
    }
  }, [quality, isPlaying]);

  // 更新歌词高亮
  const updateLyricHighlight = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTime = audio.currentTime;
    let activeIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        activeIndex = i;
      } else {
        break;
      }
    }

    setActiveLyricIndex(activeIndex); // 使用全局 store

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
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(err => {
          console.error('Play failed:', err);
        });
      }
    }
  }, [isPlaying]);

  const previousSong = useCallback(() => {
    if (currentIndex > 0) {
      playSong(currentIndex - 1, currentPlaylist, true);
    }
  }, [currentIndex, currentPlaylist, playSong]);

  const nextSong = useCallback(() => {
    if (currentIndex < currentPlaylist.length - 1) {
      playSong(currentIndex + 1, currentPlaylist, true);
    }
  }, [currentIndex, currentPlaylist, playSong]);

  // 进度控制
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      audio.currentTime = percent * duration;
    }
  };

  // 下载歌曲
  const downloadSong = async (song: Song) => {
    try {
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
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // 下载歌词
  const downloadLyric = async (song: Song) => {
    try {
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
      }
    } catch (err) {
      console.error('Download lyric failed:', err);
    }
  };

  // 从收藏播放
  const playFromFavorites = async (index: number) => {
    const favSongs: Song[] = favorites
      .filter(fav => fav.songId && fav.source && fav.name)
      .map(fav => ({
        id: fav.songId!,
        source: fav.source!,
        name: fav.name!,
        artist: typeof fav.artist === 'string' ? fav.artist : (Array.isArray(fav.artist) ? fav.artist : ''),
        album: fav.album || '',
        pic_id: fav.picId || '',
        lyric_id: fav.lyricId || '',
    }));
    setCurrentPlaylist(favSongs);
    await playSong(index, favSongs, true);
  };

  // 音频事件处理（这些事件在 GlobalAudioPlayer 中处理）
  // 但需要处理 ended 事件来播放下一首
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentIndex < currentPlaylist.length - 1) {
        playSong(currentIndex + 1, currentPlaylist, true);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, currentPlaylist, playSong]);

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

  // 音质改变时重新加载（只在 quality 变化时触发，避免页面切换时重新加载）
  const prevQualityRef = useRef(quality);
  useEffect(() => {
    // 只在 quality 真正改变时才重新加载
    if (prevQualityRef.current !== quality && currentIndex !== -1 && currentPlaylist.length > 0) {
      prevQualityRef.current = quality;
      const audio = audioRef.current;
      const currentTime = audio?.currentTime || 0;
      const wasPlaying = isPlaying;
      playSong(currentIndex, currentPlaylist).then(() => {
        const audioAfter = audioRef.current;
        if (audioAfter) {
          audioAfter.currentTime = currentTime;
          if (!wasPlaying) {
            audioAfter.pause();
          }
        }
      }).catch(err => {
        console.error('Failed to reload song:', err);
      });
    } else if (prevQualityRef.current !== quality) {
      prevQualityRef.current = quality;
    }
  }, [quality, currentIndex, currentPlaylist, isPlaying, playSong]);

  // 音量控制
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  return {
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
  };
}

