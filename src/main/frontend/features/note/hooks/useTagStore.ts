import { create } from 'zustand';

export interface Tag {
  id: number;
  title: string;
  image: string; // 必须有图
  content?: string;
}

interface TagState {
  tags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (id: number) => void;
  setTags: (tags: Tag[]) => void;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [
    {
      id: 1,
      title: '语言',
      image: 'https://placecats.com/neo/300/200',
      content: '编程相关',
    },
    {
      id: 2,
      title: '设计',
      image: 'https://placecats.com/millie/300/150',
      content: '美学设计',
    },
    {
      id: 3,
      title: 'AI',
      image: 'https://placecats.com/neo_banana/300/200',
      content: '人工智能',
    },
    {
      id: 4,
      title: '产品',
      image: 'https://placecats.com/millie_neo/300/200',
      content: '产品思维',
    },
    {
      id: 5,
      title: '前端',
      image: 'https://placecats.com/neo_2/300/200',
      content: 'Web 前端',
    },
    {
      id: 6,
      title: '后端',
      image: 'https://placecats.com/bella/300/200',
      content: '服务端开发',
    },
  ],
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  removeTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),
  setTags: (tags) => set({ tags }),
}));
