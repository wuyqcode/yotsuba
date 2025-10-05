import { create } from 'zustand';
import { PostService } from 'Frontend/generated/endpoints';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';

interface PostState {
  pageCache: Record<string, PostDto[]>; // key = `${page}-${pageSize}-${searchText}`
  posts: PostDto[];
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  searchText: string;
  loading: boolean;
  error: string | null;

  fetchPosts: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
  createPost: () => Promise<string | null>;
  removePost: (id: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  pageCache: {},
  posts: [],
  page: 1,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  searchText: '',
  loading: false,
  error: null,

  fetchPosts: async (page = get().page) => {
    const { pageSize, searchText, pageCache } = get();
    const cacheKey = `${page}-${pageSize}-${searchText}`;

    // 先查缓存
    if (pageCache[cacheKey]) {
      set({ page, posts: pageCache[cacheKey] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await PostService.searchMessages(searchText, page - 1, pageSize);
      const posts = res?.content || [];
      const totalPages = res?.totalPages || 0;
      const totalElements = res.totalElements;

      set((state) => ({
        page,
        posts,
        totalPages,
        totalElements,
        pageCache: { ...state.pageCache, [cacheKey]: posts },
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setPage: (page) => set({ page }),

  setPageSize: (size) =>
    set({
      pageSize: size,
      page: 1, // 改 pageSize 时，重置到第一页
      pageCache: {}, // 清空缓存
    }),

  setSearchText: (text) => set({ searchText: text }),

  clearSearch: () =>
    set({
      searchText: '',
      page: 1,
      posts: [],
      pageCache: {},
    }),

  createPost: async () => {
    try {
      const newId = await PostService.createPost();
      set({ pageCache: {}, posts: [] });
      await get().fetchPosts(1);
      return newId;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  removePost: async (id: string) => {
    const { page, posts } = get();
    try {
      // await PostService.deletePost(id); // 假设后端有 deletePost
      set({ pageCache: {}, posts: [] });

      if (posts.length === 1 && page > 1) {
        await get().fetchPosts(page - 1);
      } else {
        await get().fetchPosts(page);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
