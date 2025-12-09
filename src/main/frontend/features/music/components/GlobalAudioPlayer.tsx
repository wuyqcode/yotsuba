import { useEffect, useRef, useCallback } from 'react';
import { useMusicPlayerStore } from '../hooks/useMusicPlayerStore';

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volume = useMusicPlayerStore((s) => s.volume);
  const setCurrentTime = useMusicPlayerStore((s) => s.setCurrentTime);
  const setDuration = useMusicPlayerStore((s) => s.setDuration);
  const setIsPlaying = useMusicPlayerStore((s) => s.setIsPlaying);
  const lyrics = useMusicPlayerStore((s) => s.lyrics);
  const setActiveLyricIndex = useMusicPlayerStore((s) => s.setActiveLyricIndex);

  // 将 audioRef 存储到全局（通过 window 对象）
  useEffect(() => {
    (window as any).__musicAudioRef = audioRef;
  }, []);

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
  }, [lyrics, setActiveLyricIndex]);

  // 音频事件处理（使用 useRef 保存回调，避免重复绑定）
  const updateLyricHighlightRef = useRef(updateLyricHighlight);
  useEffect(() => {
    updateLyricHighlightRef.current = updateLyricHighlight;
  }, [updateLyricHighlight]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateLyricHighlightRef.current();
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

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />;
}

