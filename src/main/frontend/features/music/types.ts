export interface Song {
  id: string;
  source: string;
  name: string;
  artist: string | string[];
  album: string;
  pic_id?: string;
  lyric_id?: string;
}

export interface LyricLine {
  time: number;
  text: string;
}

export const API_BASE = 'https://music-api.gdstudio.xyz/api.php';

