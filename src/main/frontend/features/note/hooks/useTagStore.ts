import { create } from 'zustand';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';
import { useCollectionStore } from './useCollection';
import { TagEndpoint } from 'Frontend/generated/endpoints';

interface TagState {
  tags: TagDto[];
  selectedTag: TagDto | null;
  selectedTags: TagDto[];
  loading: boolean;
  error: string | null;

  fetchTags: (collectionId?: string) => Promise<void>;
  addTag: (collectionId: string, name: string) => Promise<void>;
  updateTag: (id: string, name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  setSelectedTag: (tag: TagDto) => void;
  clearSelectedTag: () => void;

  addSelectedTag: (tag: TagDto) => Promise<void>;
  removeSelectedTag: (id: string) => Promise<void>;
  toggleSelectedTag: (tag: TagDto) => Promise<void>;

  reset: () => void;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  selectedTag: null,
  selectedTags: [],
  loading: false,
  error: null,

  async fetchTags(collectionId?: string) {
    set({ loading: true, error: null });

    try {
      const currentState = get();
      const tagIdList =
        currentState.selectedTags.length > 0 ? currentState.selectedTags.map((tag) => tag.id) : undefined;

      const res = await TagEndpoint.findAllTags(collectionId, tagIdList);

      const updatedSelectedTags = currentState.selectedTags
        .map((selectedTag) => res.find((tag) => tag.id === selectedTag.id))
        .filter((tag): tag is TagDto => tag !== undefined);

      const updatedSelectedTag = currentState.selectedTag
        ? res.find((tag) => tag.id === currentState.selectedTag?.id) || null
        : null;

      set({
        tags: res,
        selectedTags: updatedSelectedTags,
        selectedTag: updatedSelectedTag,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || '加载失败' });
    }
  },

  async addTag(collectionId, name) {
    if (!collectionId || !name.trim()) return;
    try {
      await TagEndpoint.createTag(collectionId, name);
      await get().fetchTags(collectionId);
    } catch (err: any) {
      set({ error: err.message || '创建失败' });
    }
  },

  async updateTag(id, name) {
    try {
      await TagEndpoint.updateTag(id, name);
      const currentState = get();
      
          const updatedTags = currentState.tags.map((tag) =>
            tag.id === id ? { ...tag, name } : tag
          );
      
      const updatedSelectedTags = currentState.selectedTags.map((tag) =>
        tag.id === id ? { ...tag, name } : tag
      );
      
      const updatedSelectedTag = currentState.selectedTag?.id === id
        ? { ...currentState.selectedTag, name }
        : currentState.selectedTag;

      set({
        tags: updatedTags,
        selectedTags: updatedSelectedTags,
        selectedTag: updatedSelectedTag,
      });
    } catch (err: any) {
      set({ error: err.message || '更新失败' });
    }
  },

  async deleteTag(id) {
    try {
      await TagEndpoint.deleteTag(id);
      const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
      
      // 先更新 selectedTags，移除被删除的标签
      set({
        selectedTags: get().selectedTags.filter((t) => t.id !== id),
      });
      
      // 重新获取标签列表
      await get().fetchTags(selectedCollectionId);

      // 如果删除的是当前选中的标签，选择第一个标签
      const currentState = get();
      if (currentState.selectedTag?.id === id) {
        set({ selectedTag: currentState.tags[0] || null });
      }
    } catch (err: any) {
      set({ error: err.message || '删除失败' });
    }
  },

  setSelectedTag: (tag) => set({ selectedTag: tag }),
  clearSelectedTag: () => set({ selectedTag: get().tags[0] || null }),

  addSelectedTag: async (tag) => {
    const currentState = get();
    const exists = currentState.selectedTags.some((t) => t.id === tag.id);
    if (!exists) {
      set({ selectedTags: [...currentState.selectedTags, tag] });
      const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
      await get().fetchTags(selectedCollectionId);
    }
  },

  removeSelectedTag: async (id) => {
    set((state) => ({
      selectedTags: state.selectedTags.filter((t) => t.id !== id),
    }));
    const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
    await get().fetchTags(selectedCollectionId);
  },

  toggleSelectedTag: async (tag) => {
    set((state) => {
      const exists = state.selectedTags.some((t) => t.id === tag.id);
      return exists
        ? { selectedTags: state.selectedTags.filter((t) => t.id !== tag.id) }
        : { selectedTags: [...state.selectedTags, tag] };
    });
    const selectedCollectionId = useCollectionStore.getState().selectedCollection?.id;
    await get().fetchTags(selectedCollectionId);
  },

  reset: () =>
    set({
      tags: [],
      selectedTag: null,
      selectedTags: [],
      loading: false,
      error: null,
    }),
}));
