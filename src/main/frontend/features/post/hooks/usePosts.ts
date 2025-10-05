import { usePostStore } from 'Frontend/features/post/stores/postStore';

export function usePosts() {
  const posts = usePostStore((s) => s.posts);
  const page = usePostStore((s) => s.page);
  const totalPages = usePostStore((s) => s.totalPages);
  const totalElements = usePostStore((s) => s.totalElements);
  const pageSize = usePostStore((s) => s.pageSize);
  const searchText = usePostStore((s) => s.searchText);
  const loading = usePostStore((s) => s.loading);
  const error = usePostStore((s) => s.error);

  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const setPage = usePostStore((s) => s.setPage);
  const setPageSize = usePostStore((s) => s.setPageSize);
  const setSearchText = usePostStore((s) => s.setSearchText);
  const clearSearch = usePostStore((s) => s.clearSearch);
  const createPost = usePostStore((s) => s.createPost);
  const removePost = usePostStore((s) => s.removePost);

  const isEmpty = !loading && posts.length === 0;
  const isLoading = loading;
  const isError = Boolean(error);

  const updateSearch = (text: string) => {
    setSearchText(text);
    setPage(1);
    fetchPosts(1);
  };

  const updatePage = (newPage: number) => {
    setPage(newPage);
    fetchPosts(newPage);
  };

  const updatePageSize = (size: number) => {
    setPageSize(size);
    fetchPosts(1);
  };

  const resetSearch = () => {
    clearSearch();
    fetchPosts(1);
  };

  return {
    posts,
    page,
    totalPages,
    pageSize,
    totalElements,
    searchText,
    fetchPosts,
    setPage: updatePage,
    setPageSize: updatePageSize,
    setSearchText: updateSearch,
    clearSearch: resetSearch,
    createPost,
    removePost,
    isEmpty,
    isLoading,
    isError,
  };
}
