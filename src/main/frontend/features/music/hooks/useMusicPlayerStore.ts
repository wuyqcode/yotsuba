import { create } from 'zustand';
import { Song, LyricLine } from '../types';

type MusicPlayerState = {
  // 播放列表和当前歌曲
  songs: Song[];
  currentIndex: number;
  currentPlaylist: Song[];
  currentSong: Song | null;
  
  // 播放状态
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: string;
  
  // 歌词
  lyrics: LyricLine[];
  activeLyricIndex: number;
  currentCover: string;
  
  // Audio ref（通过 window 对象访问）
  getAudioRef: () => React.RefObject<HTMLAudioElement> | null;
  
  // Actions
  setSongs: (songs: Song[]) => void;
  setCurrentIndex: (index: number) => void;
  setCurrentPlaylist: (playlist: Song[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setQuality: (quality: string) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setActiveLyricIndex: (index: number) => void;
  setCurrentCover: (cover: string) => void;
};

export const useMusicPlayerStore = create<MusicPlayerState>((set) => ({
  songs: [],
  currentIndex: -1,
  currentPlaylist: [],
  currentSong: null,
  
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  quality: '320',
  
  lyrics: [],
  activeLyricIndex: -1,
  currentCover: '',
  
  setSongs: (songs) => set({ songs }),
  setCurrentIndex: (index) => {
    set((state) => {
      const currentSong = index >= 0 && index < state.currentPlaylist.length 
        ? state.currentPlaylist[index] 
        : null;
      return { currentIndex: index, currentSong };
    });
  },
  setCurrentPlaylist: (playlist) => {
    set((state) => {
      const currentSong = state.currentIndex >= 0 && state.currentIndex < playlist.length 
        ? playlist[state.currentIndex] 
        : null;
      return { currentPlaylist: playlist, currentSong };
    });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setQuality: (quality) => set({ quality }),
  setLyrics: (lyrics) => set({ lyrics }),
  setActiveLyricIndex: (index) => set({ activeLyricIndex: index }),
  setCurrentCover: (cover) => set({ currentCover: cover }),
  getAudioRef: () => (window as any).__musicAudioRef?.current || null,
}));

