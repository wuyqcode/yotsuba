import { create } from 'zustand';
import MusicDto from 'Frontend/generated/io/github/dutianze/yotsuba/music/application/dto/MusicDto';
import { MusicEndpoint } from 'Frontend/generated/endpoints';
import { Song } from '../types';

type MusicState = {
  favorites: MusicDto[];
  favoriteIds: Set<string>;
  deletedIds: Set<string>; // 标记为已删除的收藏ID
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;

  loading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  addFavorite: (song: Song) => Promise<void>;
  removeFavorite: (songId: string, source: string) => Promise<void>;
  isFavorite: (songId: string, source: string) => boolean;
  toggleFavorite: (song: Song) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export const useMusicStore = create<MusicState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  deletedIds: new Set(),
  page: 1,
  pageSize: 20,
  totalPages: 0,
  totalElements: 0,

  loading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  /** 拉取收藏列表 */
  fetchFavorites: async () => {
    const { page, pageSize, deletedIds } = get();
    set({ loading: true, error: null });
    try {
      const res = await MusicEndpoint.findAll(page - 1, pageSize);
      // 过滤掉已删除的项
      const favorites = res.content.filter(
        f => !deletedIds.has(`${f.songId}_${f.source}`)
      );
      const favoriteIds = new Set(favorites.map(f => `${f.songId}_${f.source}`));
      set({
        favorites,
        favoriteIds,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      });
    } catch (e: any) {
      console.error('fetchFavorites failed:', e);
      set({ error: e.message ?? 'Failed to fetch favorites' });
    } finally {
      set({ loading: false });
    }
  },

  /** 添加收藏 */
  addFavorite: async (song: Song) => {
    set({ loading: true, error: null });
    try {
      const artist = Array.isArray(song.artist) ? song.artist.join(' / ') : song.artist;
      await MusicEndpoint.addFavorite(
        song.id,
        song.source,
        song.name,
        artist,
        song.album || '',
        song.pic_id || '',
        song.lyric_id || ''
      );
      // 如果之前标记为删除，现在恢复
      const { deletedIds, favoriteIds } = get();
      const key = `${song.id}_${song.source}`;
      if (deletedIds.has(key)) {
        deletedIds.delete(key);
        set({ deletedIds: new Set(deletedIds) });
      }
      // 立即添加到 favoriteIds，以便 isFavorite 立即返回 true
      favoriteIds.add(key);
      set({ favoriteIds: new Set(favoriteIds) });
      await get().fetchFavorites();
    } catch (e: any) {
      console.error('addFavorite failed:', e);
      set({ error: e.message ?? 'Failed to add favorite' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  /** 移除收藏 */
  removeFavorite: async (songId: string, source: string) => {
    set({ loading: true, error: null });
    try {
      // 调用后端API删除
      await MusicEndpoint.removeFavorite(songId, source);
      // 标记为已删除，但不立即从列表中移除（保留在列表中显示，但显示为空爱心）
      const { deletedIds, favoriteIds } = get();
      const key = `${songId}_${source}`;
      deletedIds.add(key);
      favoriteIds.delete(key);
      set({ 
        deletedIds: new Set(deletedIds),
        favoriteIds: new Set(favoriteIds)
      });
      // 不立即从 favorites 列表中移除，保留在列表中以便显示为空爱心
    } catch (e: any) {
      console.error('removeFavorite failed:', e);
      set({ error: e.message ?? 'Failed to remove favorite' });
    } finally {
      set({ loading: false });
    }
  },

  /** 检查是否已收藏 */
  isFavorite: (songId: string, source: string) => {
    const { favoriteIds, deletedIds } = get();
    const key = `${songId}_${source}`;
    // 如果在 favoriteIds 中且不在 deletedIds 中，则已收藏
    return favoriteIds.has(key) && !deletedIds.has(key);
  },

  /** 切换收藏状态 */
  toggleFavorite: async (song: Song) => {
    const { isFavorite, addFavorite, removeFavorite } = get();
    const isFav = isFavorite(song.id, song.source);
    if (isFav) {
      await removeFavorite(song.id, song.source);
    } else {
      await addFavorite(song);
    }
  },
}));

