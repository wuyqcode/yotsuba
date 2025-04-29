import {
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  CardMedia,
  Grid,
  Card,
  CardContent,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { PostService } from 'Frontend/generated/endpoints';
import { useNavigate, useSearchParams } from 'react-router';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { Link } from 'react-router';

export default function PostSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchText, setSearchText] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(() => Number(searchParams.get('page') || 1));

  const [posts, setPosts] = useState<PostDto[]>([]);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    fetchPosts(page - 1);
  }, [page, searchText]);

  const fetchPosts = async (pageNum: number) => {
    try {
      const res = await PostService.searchMessages(searchText, pageNum, pageSize);
      setPosts(res?.content);
      setTotalPages(res?.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setSearchParams({ search: searchText, page: String(value) });
  };

  const handleCreatePost = async () => {
    const newPostId = await PostService.createPost();
    console.log(newPostId);

    navigate(`/post/${newPostId}`, {
      state: { fromSearch: location.search },
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  function handleSearch(): void {
    throw new Error('Function not implemented.');
  }

  function handleClear(): void {
    throw new Error('Function not implemented.');
  }

  function handleTagClick(tag: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Box>
      {/* 输入框 + 操作按钮区 */}
      <Box sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 600, mt: 2 }}>
        <TextField
          variant="outlined"
          placeholder="+ を使用して複数のキーワードを組み合わせる"
          value={searchText}
          onChange={handleInputChange}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '50px' },
            '& .MuiOutlinedInput-input': { py: 1, px: 2 },
          }}
        />
        <IconButton color="primary" onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
        <IconButton color="error" onClick={handleClear} disabled={!searchText}>
          <DeleteIcon />
        </IconButton>
        <IconButton color="success" onClick={handleCreatePost}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* 推荐Tag区 */}
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" mt={2}>
        {['java', 'aws', 'python'].map((tag) => (
          <Box
            key={tag}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'warning.main',
              transition: 'all 0.2s',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
            }}>
            {tag}
          </Box>
        ))}
      </Stack>

      {/* 列表区 */}
      <Grid container spacing={2}>
        {posts?.map((post, index) => (
          <Grid key={post?.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              component={Link}
              to={`/post/${post?.id}`}
              state={{ fromSearch: location.search }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6,
                },
              }}>
              <CardMedia
                component="img"
                height="160"
                image={post.cover}
                alt={post?.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, py: 1 }}>
                <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                  {post?.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                    {post?.createdAt}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                    • {100} views
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
