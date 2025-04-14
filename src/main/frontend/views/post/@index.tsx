import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, CardMedia, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { PostService } from 'Frontend/generated/endpoints';
import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import { GlassBox } from 'Frontend/components/GlassBox';
import React from 'react';

export const config: ViewConfig = {
  menu: {
    order: 2,
    icon: 'DescriptionIcon',
  },
  title: '文章',
};

export default function AdminView() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const {
    data: posts,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => PostService.searchMessages(searchText, 0, 10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const createPost = async () => {
    const newPostId = await PostService.createPost();
    console.log(newPostId);

    navigate(`/post/${newPostId}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      refetch();
    }
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
    <Fragment>
      {/* 搜索区 */}
      <GlassBox
        sx={{
          position: 'sticky',
          top: '0px',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1, // 子元素间距 16px
          m: 1, // 外边距 16px
          p: 1, // 内边距 16px
        }}>
        <Typography variant="h4">
          任意の検索{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            POST
          </Box>
        </Typography>

        {/* 输入框 + 操作区 */}
        <Box sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 600 }}>
          <TextField
            variant="outlined"
            placeholder="+ を使用して複数のキーワードを組み合わせる"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
          <IconButton color="success" onClick={createPost}>
            <AddIcon />
          </IconButton>
        </Box>

        {/* 推荐 tag */}
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
          {['java', 'aws', 'python'].map((tag) => (
            <Box
              key={tag}
              onClick={() => handleTagClick(tag)}
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
      </GlassBox>

      {/* 列表区 */}
      <GlassBox sx={{ p: 1, m: 1 }}>
        <Stack spacing={1}>
          {posts?.map((post, idx) => (
            <Box
              key={post?.id}
              component="a"
              href={`/post/${post?.id}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 1.5,
                borderBottom: idx !== posts.length - 1 ? '1px solid rgba(0, 0, 0, 0.2)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
              }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}>
                  {post?.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                  }}>
                  {post?.createdAt}
                </Typography>
              </Box>

              <CardMedia
                component="img"
                image={post?.cover}
                alt={post?.title}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  objectFit: 'cover',
                  flexShrink: 0,
                  ml: 3,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </GlassBox>
    </Fragment>
  );
}
