import { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useNavigate } from 'react-router';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteCardDto';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TagSelectDialog from './TagSelectDialog';

interface NoteCardProps {
  note: NoteCardDto;
}

export default function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  const handleNavigate = () => navigate(`/note/${note.noteType}/${note.id}`);

  const hasCover = !!note.cover && note.cover.trim() !== '';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagDialogOpen(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  return (
    <Box sx={{ width: '100%' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* 卡片图片区域 */}
      <Box
        onClick={handleNavigate}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          aspectRatio: '16 / 9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          },
          '&:hover .cover': {
            transform: 'scale(1.05)',
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
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          <Box
            className="cover"
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
            {note.title && (
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  px: 1,
                  opacity: 0.9,
                }}>
                {note.title.slice(0, 2)}
              </Typography>
            )}
          </Box>
        )}

        {/* 底部统计信息栏 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            zIndex: 1,
          }}>
          {/* 左下角：统计信息 */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'white' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontSize: '0.75rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}>
                {formatNumber(note.likes)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon sx={{ fontSize: '0.875rem', color: 'white' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontSize: '0.75rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}>
                188
              </Typography>
            </Box>
          </Box>

          {/* 右下角：悬停工具栏 */}
          <Box
            sx={{
              display: hovered ? 'flex' : 'none',
              gap: 0.5,
              alignItems: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}>
            <Tooltip title="删除">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  padding: '2px',
                  minWidth: 'auto',
                  width: '20px',
                  height: '20px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '0.875rem',
                  },
                }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="更改标签">
              <IconButton
                size="small"
                onClick={handleTagClick}
                sx={{
                  color: 'white',
                  backgroundColor: 'transparent',
                  padding: '2px',
                  minWidth: 'auto',
                  width: '20px',
                  height: '20px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '0.875rem',
                  },
                }}>
                <LocalOfferIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* 卡片下方标题和作者 */}
      <Box sx={{ mt: 1, px: 0.5 }}>
        {note.title && (
          <Typography
            variant="subtitle2"
            fontWeight={500}
            sx={{
              color: 'text.primary',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={handleNavigate}>
            {note.title}
          </Typography>
        )}
        {note.author && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}>
            {note.author}
          </Typography>
        )}
      </Box>

      {/* 删除确认对话框 */}
      {note.id && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          noteId={note.id}
          noteTitle={note.title || ''}
        />
      )}

      {/* 标签选择对话框 */}
      {note.id && <TagSelectDialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} note={note} />}
    </Box>
  );
}
