import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { PostService } from 'Frontend/generated/endpoints';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';

export const config: ViewConfig = {
  menu: {
    order: 5,
    icon: 'DescriptionIcon'
  },
  title: '文章'
};

export default function AdminView() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const {
    data: posts,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => PostService.searchMessages(searchText, 0, 10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always'
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

  return (
    <Box
      sx={{
        padding: '20px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '20px'
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: '10px' }}>
          任意の検索 <span style={{ color: '#e91e63' }}>POST</span>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: '600px',
            width: '100%'
          }}
        >
          <TextField
            variant="outlined"
            placeholder="+ を使用して複数のキーワードを組み合わせる"
            sx={{
              borderRadius: '50px',
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px'
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 15px'
              }
            }}
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: (
                <>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
                </>
              )
            }}
          />
          <IconButton
            sx={{ marginLeft: '10px' }} // 设置按钮和输入框之间的间距
            onClick={createPost} // 你可以在这里添加按钮点击事件处理函数
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Typography
          sx={{ marginTop: '10px', color: '#ffb74d', fontSize: '14px' }}
        >
          java, aws, python
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {posts?.map((post, index) => (
          <Grid item xs={12} sm={4} md={2} key={index}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '200px', // 固定卡片高度
                width: '100%',
                '&:hover': {
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-5px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  width: '100%'
                }}
              >
                <CardMedia
                  component="img"
                  image={post?.cover}
                  alt={post?.title}
                  sx={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center'
                  }}
                  onClick={() => navigate(`/post/${post?.id}`)}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '8px'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px',
                      textShadow:
                        '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {post?.title}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
