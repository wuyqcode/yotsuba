import { Box, Typography, Grid, Divider, CircularProgress, TablePagination, Pagination } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import FilterPanel from './FilterPanel';
import PostCard from './PostCard';
import { usePosts } from './hook/usePosts';
import PaginationBar from './PaginationBar';

export default function PostListPage() {
  const navigate = useNavigate();
  const {
    posts,
    page,
    totalPages,
    totalElements,
    pageSize,
    searchText,
    fetchPosts,
    setPage,
    setPageSize,
    setSearchText,
    createPost,
    isEmpty,
    isLoading,
    isError,
  } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [page, searchText, pageSize, fetchPosts]);

  const onPageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setPage(1);
  };

  const onCreatePost = async () => {
    const newPostId = await createPost();
    if (newPostId) {
      navigate(`/post/${newPostId}`);
    }
  };

  return (
    <Box>
      <FilterPanel
        searchText={searchText}
        handleInputChange={(e) => setSearchText(e.target.value)}
        handleSearch={() => setSearchText(searchText)}
        handleCreatePost={onCreatePost}
      />

      <Divider sx={{ my: 2 }} />

      {isLoading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Typography color="error" textAlign="center" mt={4}>
          Failed to load posts
        </Typography>
      )}
      {isEmpty && (
        <Typography textAlign="center" mt={4}>
          No posts found
        </Typography>
      )}

      <Grid container spacing={2}>
        {posts?.map((post) => (
          <Grid key={post.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalElements}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Box>
  );
}
