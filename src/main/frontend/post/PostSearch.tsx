import { Box, Typography, CardMedia, Grid, Card, CardContent, Pagination, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { PostService } from 'Frontend/generated/endpoints';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import FilterPanel from './FilterPanel';
import PostCard from './PostCard';

export interface LocationState {
  fromSearch?: string;
  scrollPosition?: number;
}

export default function PostSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchText, setSearchText] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(() => Number(searchParams.get('page') || 1));
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [pageSize] = useState(28);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const res = await PostService.searchMessages(searchText, page - 1, pageSize);
      setPosts(res?.content || []);
      setTotalPages(res?.totalPages || 0);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
      setTotalPages(0);
    } finally {
      const scrollPosition = Number((location.state as LocationState)?.scrollPosition);
      if (!isNaN(scrollPosition)) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
        });
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const scrollPosition = 0;
    setPage(value);
    setSearchParams({ search: searchText, page: String(value) }, { state: { scrollPosition } });
  };

  const handleCreatePost = async () => {
    try {
      const newPostId = await PostService.createPost();
      const scrollPosition = window.scrollY;
      navigate(`/post/${newPostId}`, {
        state: { fromSearch: location.search, scrollPosition } as LocationState,
      });
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  function handleSearch(): void {
    setPage(1);
    fetchPosts();
  }

  const handleClear = () => {
    setSearchText('');
    setPage(1);
    fetchPosts();
  };

  const handleTagClick = (tag: string) => {
    setSearchText(tag);
    setPage(1);
    fetchPosts();
  };

  return (
    <Box>
      <FilterPanel
        searchText={searchText}
        handleInputChange={handleInputChange}
        handleSearch={handleSearch}
        handleCreatePost={handleCreatePost}
      />

      <Divider sx={{ m: 1 }} />

      {/* 列表区 */}
      <Grid container spacing={2}>
        {posts?.map((post, index) => (
          <Grid key={post?.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>

      {/* 分页组件 */}
      <Box mt={4} display="flex" justifyContent="center">
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" />
      </Box>
    </Box>
  );
}
