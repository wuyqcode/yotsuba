import { Box, Typography, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';

interface NoteCardProps {
  note: NoteCardDto;
}

export default function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate();
  const handleNavigate = () => navigate(`/note/${note.noteType}/${note.id}`);

  const hasCover = !!note.cover && note.cover.trim() !== '';

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
        '&:hover .cover': {
          transform: 'scale(1.05)',
          filter: 'brightness(60%)',
        },
      }}>
      {/* 封面 / 空白占位 */}
      {hasCover ? (
        <Box
          component="img"
          src={note.cover}
          alt={note.title || ''}
          className="cover"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.4s ease',
          }}
        />
      ) : (
        <Box
          className="cover"
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.4s ease',
          }}>
          {note.title && (
            <Typography
              variant="h4"
              sx={{
                color: '#999',
                fontWeight: 600,
                textAlign: 'center',
                px: 1,
              }}>
              {note.title.slice(0, 2)}
            </Typography>
          )}
        </Box>
      )}

      {/* 底部标题区域 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          color: 'white',
          p: 1.2,
        }}>
        {note.title && (
          <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ lineHeight: 1.2 }}>
            {note.title}
          </Typography>
        )}
        {note.author && (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {note.author}
          </Typography>
        )}
      </Box>

      {/* 悬浮简介层 */}
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
        {note.snippet && (
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
              '& mark': {
                backgroundColor: 'rgba(255, 235, 59, 0.6)',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '2px',
                padding: '0 3px',
              },
            }}
            dangerouslySetInnerHTML={{ __html: note.snippet }}
          />
        )}

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
