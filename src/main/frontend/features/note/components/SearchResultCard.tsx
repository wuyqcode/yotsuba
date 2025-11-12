import { Card, CardMedia, CardContent, Typography, IconButton, Box } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';

interface Props {
  note: NoteCardDto;
}

export default function SearchResultCard({ note }: Props) {
  const navigate = useNavigate();

  const handleNavigate = () => navigate(`/note/${note.noteType}/${note.id}`);
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('TODO: 收藏逻辑');
  };

  return (
    <Card
      onClick={handleNavigate}
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        width: '100%', // 🚀 全宽
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}>
      {/* 左侧封面 */}
      <CardMedia
        component="img"
        src={note.cover}
        alt={note.title}
        loading="lazy"
        sx={{
          width: { xs: '100%', sm: 140 },
          height: { xs: 140, sm: 100 },
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
          flexShrink: 0,
        }}
      />

      {/* 中间文字区 */}
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 1.5,
          px: 2,
          overflow: 'hidden',
        }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ mb: 0.3, color: '#222' }}>
          {note.title}
        </Typography>

        {note.author && (
          <Typography variant="caption" sx={{ color: '#777', mb: 0.4 }}>
            {note.author}
          </Typography>
        )}

        {note.snippet && (
          <Typography
            variant="body2"
            sx={{
              color: '#444',
              lineHeight: 1.4,
              whiteSpace: 'normal',
              overflow: 'visible',
              '& mark': {
                backgroundColor: 'rgba(255, 235, 59, 0.5)',
                color: '#000',
                borderRadius: '2px',
                fontWeight: 600,
              },
            }}
            dangerouslySetInnerHTML={{ __html: note.snippet }}
          />
        )}
      </CardContent>

      {/* 右侧收藏按钮 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pr: 1,
          height: '100%',
        }}>
        <IconButton
          size="small"
          onClick={handleLike}
          sx={{
            color: '#aaa',
            '&:hover': { color: '#e91e63', transform: 'scale(1.1)' },
            transition: 'all 0.2s ease',
          }}>
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}
