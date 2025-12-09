import { create } from 'zustand';
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
export const useMediaNote = create<MediaState>((set) => ({
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
  setMedia: (media) =>
    set(() => ({
      media,
    })),

  updateMedia: (patch) =>
    set((state) => ({
      ...state,
      media: {
        ...state.media,
        ...patch,
      },
    })),

  // ---- Season 操作 ----
  addSeason: () => {
    const id = createSeasonId();
    set((state) => ({
      ...state,
      seasons: {
        ...state.seasons,
        [id]: {
          id,
          name: '新一季',
          year: 'TBD',
          episodeIds: [],
        },
      },
      media: {
        ...state.media,
        seasonIds: [...state.media.seasonIds, id],
      },
    }));
    return id;
  },

  removeSeason: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.seasons;
      return {
        ...state,
        seasons: rest,
        media: {
          ...state.media,
          seasonIds: state.media.seasonIds.filter((sid) => sid !== id),
        },
      };
    }),

  updateSeason: (id, patch) =>
    set((state) => ({
      ...state,
      seasons: {
        ...state.seasons,
        [id]: {
          ...state.seasons[id],
          ...patch,
        },
      },
    })),

  // ---- Episode 操作 ----
  addEpisode: (seasonId) => {
    const epId = createEpisodeId();
    set((state) => ({
      ...state,
      episodes: {
        ...state.episodes,
        [epId]: {
          id: epId,
          title: '新剧集',
          runtime: '24 min',
          rating: 0,
          desc: '',
          img: '',
        },
      },
      seasons: {
        ...state.seasons,
        [seasonId]: {
          ...state.seasons[seasonId],
          episodeIds: [...state.seasons[seasonId].episodeIds, epId],
        },
      },
    }));
    return epId;
  },

  updateEpisode: (id, patch) =>
    set((state) => ({
      ...state,
      episodes: {
        ...state.episodes,
        [id]: {
          ...state.episodes[id],
          ...patch,
        },
      },
    })),

  removeEpisode: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.episodes;
      return {
        ...state,
        episodes: rest,
        seasons: Object.fromEntries(
          Object.entries(state.seasons).map(([sid, season]) => [
            sid,
            {
              ...season,
              episodeIds: season.episodeIds.filter((eid) => eid !== id),
            },
          ]),
        ),
      };
    }),
}));
