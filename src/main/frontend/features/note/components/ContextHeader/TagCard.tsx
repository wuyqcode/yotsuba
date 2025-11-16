import { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import { useTagStore } from '../../hooks/useTagStore';
import TagEditDialog from './TagEditDialog';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';

interface TagCardProps {
  tag: TagDto;
}

export default function TagCard({ tag }: TagCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
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

        {/* 编辑按钮 - 悬停时显示在封面上 */}
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
    </>
  );
}

