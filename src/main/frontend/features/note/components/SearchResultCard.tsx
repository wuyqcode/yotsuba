import { Card, CardMedia, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useState } from 'react';
import TagSelectDialog from './TagSelectDialog';

interface Props {
  note: NoteCardDto;
}

export default function SearchResultCard({ note }: Props) {
  const navigate = useNavigate();
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const handleNavigate = () => navigate(`/note/${note.noteType}/${note.id}`);
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('TODO: 收藏逻辑');
  };

  const hasCover = !!note.cover && note.cover.trim() !== '';

  return (
    <Card
      onClick={handleNavigate}
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        height: { xs: 140, sm: 120 },
        '&:hover': {
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}>
      {/* 左侧：封面 */}
      {hasCover ? (
        <CardMedia
          component="img"
          src={note.cover}
          alt={note.title}
          loading="lazy"
          sx={{
            width: 120,
            height: '100%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 120,
            height: '100%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, opacity: 0.9 }}>
            {note.title?.slice(0, 2)}
          </Typography>
        </Box>
      )}

      {/* 中间区域：上下结构 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // 上+下两块
          p: 1.2,
          gap: 0.6,
          overflow: 'hidden',
        }}>
        {/* 上：标题 + 两行 snippet */}
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              color: '#111',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {note.title}
          </Typography>

          {note.snippet && (
            <Box sx={{ maxHeight: '2.7em', overflow: 'hidden' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.78rem',
                  color: '#666',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2, // ★ 两行
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  '& mark': {
                    backgroundColor: 'rgba(255, 235, 59, 0.5)',
                    color: '#000',
                    borderRadius: '2px',
                    fontWeight: 600,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: note.snippet }}
              />
            </Box>
          )}
        </Box>

        {/* 下：tags */}
        <Box
          sx={{ display: 'flex', gap: 0.6, flexWrap: 'nowrap', overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}>
          {note.tags
            ?.filter(Boolean)
            .slice(0, 3)
            .map((tag, i) => (
              <Chip
                key={i}
                label={tag}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: '#f7f7f7',
                  color: '#555',
                  borderRadius: '12px',
                  padding: '0 4px',
                  maxWidth: 80,
                }}
              />
            ))}
          {/* 修改标签按钮 */}
          <IconButton
            size="small"
            sx={{
              padding: '2px',
              color: '#888',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              setTagDialogOpen(true);
            }}>
            <LocalOfferIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* 右边：收藏按钮 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end', // 底部对齐
          justifyContent: 'center',
          pb: 1,
          pr: 1,
        }}>
        <IconButton
          size="small"
          onClick={handleLike}
          sx={{
            color: '#aaa',
            '&:hover': { color: '#ff5f8a' },
            transition: 'all 0.2s ease',
          }}>
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>
      </Box>
      {note.id && <TagSelectDialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} noteId={note.id} />}
    </Card>
  );
}
