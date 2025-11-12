import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

// ------------------- 🧩 类型定义 -------------------

// ✅ 使用 nominal typing（品牌化 ID）
declare const SeasonIdBrand: unique symbol;
declare const EpisodeIdBrand: unique symbol;

export type SeasonId = string & { readonly [SeasonIdBrand]: 'SeasonId' };
export type EpisodeId = string & { readonly [EpisodeIdBrand]: 'EpisodeId' };

// ✅ 工具函数，生成品牌 ID
function createSeasonId(): SeasonId {
  return nanoid() as SeasonId;
}
function createEpisodeId(): EpisodeId {
  return nanoid() as EpisodeId;
}

// ------------------- 实体类型 -------------------
export interface Episode {
  id: EpisodeId;
  title: string;
  runtime: string;
  rating: number;
  desc: string;
  img: string;
}

export interface Season {
  id: SeasonId;
  name: string;
  year: string | number;
  episodeIds: EpisodeId[];
}

export interface Media {
  id: string;
  title: string;
  overview: string;
  year: number;
  cover: string;
  content: string;
  type: 'tv' | 'movie' | 'anime' | 'documentary';
  seasonIds: SeasonId[];
  rating?: number;
}

// ------------------- 🧠 Zustand 状态接口 -------------------
interface MediaState {
  media: Media;
  seasons: Record<SeasonId, Season>;
  episodes: Record<EpisodeId, Episode>;

  setMedia: (media: Media) => void;
  updateMedia: (patch: Partial<Media>) => void;

  addSeason: () => SeasonId;
  removeSeason: (id: SeasonId) => void;
  updateSeason: (id: SeasonId, patch: Partial<Season>) => void;

  addEpisode: (seasonId: SeasonId) => EpisodeId;
  updateEpisode: (id: EpisodeId, patch: Partial<Episode>) => void;
  removeEpisode: (id: EpisodeId) => void;
}

// ------------------- 🧱 类型守卫 -------------------
function assertSeason(state: MediaState, id: SeasonId): asserts id is SeasonId {
  if (!state.seasons[id]) throw new Error(`Season ${String(id)} not found`);
}
function assertEpisode(state: MediaState, id: EpisodeId): asserts id is EpisodeId {
  if (!state.episodes[id]) throw new Error(`Episode ${String(id)} not found`);
}

// ------------------- 🧩 Zustand Store -------------------
export const useMediaNote = create<MediaState>()(
  immer((set) => ({
    media: {
      id: nanoid(),
      title: 'Untitled',
      overview: '',
      year: new Date().getFullYear(),
      cover: '',
      content: '',
      type: 'tv',
      seasonIds: [],
      rating: 0,
    },
    seasons: {},
    episodes: {},

    // ---- 媒体基础信息 ----
    setMedia: (media) => {
      set((state) => {
        state.media = media;
      });
    },

    updateMedia: (patch) => {
      set((state) => {
        Object.assign(state.media, patch);
      });
    },

    // ---- Season 操作 ----
    addSeason: () => {
      const id = createSeasonId();
      set((state) => {
        state.seasons[id] = {
          id,
          name: '新一季',
          year: 'TBD',
          episodeIds: [],
        };
        state.media.seasonIds.push(id);
      });
      return id;
    },

	removeSeason: (id) => {
	  set((state) => {
	    delete state.seasons[id];
	    state.media.seasonIds = state.media.seasonIds.filter((sid: SeasonId) => sid !== id);
	  });
	},

    updateSeason: (id, patch) => {
      set((state) => {
        assertSeason(state, id);
        Object.assign(state.seasons[id], patch);
      });
    },

    // ---- Episode 操作 ----
    addEpisode: (seasonId) => {
      const epId = createEpisodeId();
      set((state) => {
        assertSeason(state, seasonId);
        state.episodes[epId] = {
          id: epId,
          title: '新剧集',
          runtime: '24 min',
          rating: 0,
          desc: '',
          img: '',
        };
        state.seasons[seasonId].episodeIds.push(epId);
      });
      return epId;
    },

    updateEpisode: (id, patch) => {
      set((state) => {
        assertEpisode(state, id);
        Object.assign(state.episodes[id], patch);
      });
    },


	removeEpisode: (id) => {
	  set((state) => {
	    delete state.episodes[id];
	    for (const season of Object.values(state.seasons) as Season[]) {
	      season.episodeIds = season.episodeIds.filter((eid: EpisodeId) => eid !== id);
	    }
	  });
	},
  }))
);
