import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTagStore } from '../../hooks/useTagStore';
import TagEditDialog from './TagEditDialog';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';

interface TagCardProps {
  tag: TagDto;
}

export default function TagCard({ tag }: TagCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteTag = useTagStore((s) => s.deleteTag);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tag?.id) return;
    setDeleting(true);
    try {
      await deleteTag(tag.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          width: 120,
          flexShrink: 0,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        }}>
      {/* 封面图片区域 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        {tag?.cover ? (
          <Box
            component="img"
            src={tag?.cover}
            alt={tag?.name || '标签封面'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <LocalOfferIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
        )}

        {/* 编辑和删除按钮 - 悬停时显示在封面上 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: hovered ? 'rgba(0,0,0,0.4)' : 'transparent',
            opacity: hovered ? 1 : 0,
            transition: 'all 0.3s ease',
            pointerEvents: hovered ? 'auto' : 'none',
          }}>
          <Tooltip title="编辑标签">
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}>
              <EditIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除标签">
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(255, 0, 0, 0.5)',
                },
              }}>
              <DeleteIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 标签信息 - 下方文字 */}
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'center' }}>
        <Typography
          variant="subtitle2"
          noWrap
          fontWeight={600}
          sx={{
            color: 'text.primary',
            fontSize: '0.85rem',
            lineHeight: 1.2,
            width: '100%',
            textAlign: 'center',
          }}>
          {tag?.name || '未选择标签'}
        </Typography>
      </Box>
    </Box>

    {/* 编辑对话框 */}
    {tag && (
      <TagEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        tag={tag}
      />
    )}

    {/* 删除确认对话框 */}
    {tag && (
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除标签「{tag.name}」吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            取消
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    )}
    </>
  );
}

