import { create } from 'zustand';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';
import { TagService } from 'Frontend/generated/endpoints';

interface TagState {
  tags: TagDto[];
  selectedTag: TagDto | null;
  selectedTags: TagDto[];
  loading: boolean;
  error: string | null;

  fetchTags: () => Promise<void>;
  addTag: (collectionId: string, name: string) => Promise<void>;
  updateTag: (id: string, name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  setSelectedTag: (tag: TagDto) => void;
  clearSelectedTag: () => void;

  addSelectedTag: (tag: TagDto) => void;
  removeSelectedTag: (id: string) => void;
  toggleSelectedTag: (tag: TagDto) => void;

  reset: () => void;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  selectedTag: null,
  selectedTags: [],
  loading: false,
  error: null,

  async fetchTags() {
    set({ loading: true, error: null });

    try {
      const res = await TagService.findAllTags();

      set({
        tags: res,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async addTag(collectionId, name) {
    if (!collectionId || !name.trim()) return;
    try {
      await TagService.createTag(collectionId, name);
      await get().fetchTags();
    } catch (err: any) {
      set({ error: err.message || '创建失败' });
    }
  },

  async updateTag(id, name) {
    try {
      await TagService.updateTag(id, name);
      await get().fetchTags();
    } catch (err: any) {
      set({ error: err.message || '更新失败' });
    }
  },

  async deleteTag(id) {
    try {
      await TagService.deleteTag(id);
      await get().fetchTags();

      const cur = get().selectedTag;
      if (cur?.id === id) {
        set({ selectedTag: get().tags[0] || null });
      }

      // 多选同步
      set({
        selectedTags: get().selectedTags.filter((t) => t.id !== id),
      });
    } catch (err: any) {
      set({ error: err.message || '删除失败' });
    }
  },

  setSelectedTag: (tag) => set({ selectedTag: tag }),
  clearSelectedTag: () => set({ selectedTag: get().tags[0] || null }),

  addSelectedTag: (tag) =>
    set((state) =>
      state.selectedTags.some((t) => t.id === tag.id) ? state : { selectedTags: [...state.selectedTags, tag] }
    ),

  removeSelectedTag: (id) =>
    set((state) => ({
      selectedTags: state.selectedTags.filter((t) => t.id !== id),
    })),

  toggleSelectedTag: (tag) =>
    set((state) => {
      const exists = state.selectedTags.some((t) => t.id === tag.id);
      return exists
        ? { selectedTags: state.selectedTags.filter((t) => t.id !== tag.id) }
        : { selectedTags: [...state.selectedTags, tag] };
    }),

  reset: () =>
    set({
      tags: [],
      selectedTag: null,
      selectedTags: [],
      loading: false,
      error: null,
    }),
}));
