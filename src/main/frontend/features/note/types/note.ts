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
