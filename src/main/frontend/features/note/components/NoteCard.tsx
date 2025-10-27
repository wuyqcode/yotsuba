import { Box, Typography, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router';
import NoteDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteDto';

interface NoteCardProps {
  note: NoteDto;
}

export default function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/note/${note.noteType}/${note.id}`);
  }

  return (
    <Box
      onClick={handleNavigate}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '2 / 3',
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
        },
        '&:hover .overlay': { opacity: 1 },
        '&:hover img': {
          transform: 'scale(1.05)',
          filter: 'brightness(60%)',
        },
      }}>
      {/* 封面 */}
      <Box
        component="img"
        src={'https://image.tmdb.org/t/p/w500/vDkct38sSFSWJIATlfJw0l3QOIR.jpg'}
        alt={note.title}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'all 0.4s ease',
        }}
      />

      {/* 标题 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          color: 'white',
          p: 1.2,
        }}>
        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ lineHeight: 1.2 }}>
          {note.title || '未命名笔记'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {note?.author || '未知作者'}
        </Typography>
      </Box>

      {/* 悬浮层 */}
      <Box
        className="overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          p: 2,
        }}>
        <Typography
          variant="body2"
          color="white"
          sx={{
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
          {note.summary || '暂无简介'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.4)' },
            }}>
            <FavoriteBorderIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}