import { Box, Card, CardMedia, Typography, Stack, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useNavigate } from 'react-router';
import { LocationState } from './PostSearch';

interface PostCardProps {
  post: PostDto;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const handleCardClick = (event: React.MouseEvent, post: PostDto) => {
    event.preventDefault();
    const scrollPosition = window.scrollY;

    navigate(`/post/${post.id}`, {
      state: { fromSearch: location.search, scrollPosition } as LocationState,
    });
  };
  return (
    <Card
      onClick={(e) => handleCardClick(e, post)}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}>
      {/* 封面图 */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={post.cover}
          alt={post.title}
          height="200"
          sx={{ objectFit: 'cover', width: '100%' }}
        />
        {/* 时长角标 */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            px: 0.6,
            borderRadius: 1,
            fontSize: '0.75rem',
          }}>
          {'duration'}
        </Typography>

        {/* 收藏按钮 */}
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 内容部分 */}
      <Box sx={{ p: 1.5 }}>
        {/* 视频标题 */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}>
          {post.title}
        </Typography>

        {/* 作者行 */}
        <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
          <Typography variant="body2" fontSize="0.8rem">
            {'author'}
          </Typography>
          <CheckCircleIcon sx={{ fontSize: 14, color: '#4ea1ff' }} />
        </Stack>

        {/* 播放量 + 点赞 */}
        <Stack direction="row" spacing={2} mt={0.5}>
          <Typography variant="caption" color="gray">
            {'views'} 次观看
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ThumbUpAltOutlinedIcon sx={{ fontSize: 14, color: 'gray' }} />
            <Typography variant="caption" color="gray">
              {'likes'}%
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
