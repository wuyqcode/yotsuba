import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteDto';

export interface Post extends PostDto {
  // 扩展 PostDto 的类型定义
}

export interface Collection {
  id: string;
  name: string;
  cover?: string;
  count: number;
  lastUpdated: string;
}

export interface Tag {
  id: string;
  title: string;
  image?: string;
}

export interface PostFilter {
  searchText: string;
  tags: Tag[];
  collection?: Collection;
}
