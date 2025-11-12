import React from 'react';
import { Box, Typography, Button, Chip, Stack, IconButton, CardMedia } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router';
import { useMediaNote } from '../../hooks/useMediaNote';

export default function MediaHeader() {
  const navigate = useNavigate();
  const media = useMediaNote((s) => s.media);

  if (!media) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
        '--backdrop-filter': 'blur(4px) grayscale(80%)',
        '--backdrop-mix-blend-mode': 'multiply',
        px: { xs: 2, md: 6 },
        pt: { xs: 3, md: 3 },
        pb: { xs: 4, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      {/* ✏️ 编辑按钮 */}
      <IconButton
        onClick={() => navigate(`/note/media/${media.id}/edit`)}
        sx={{
          position: 'absolute',
          top: 16,
          right: 24,
          zIndex: 2,
          bgcolor: 'rgba(255,255,255,0.15)',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
            transform: 'translateY(-2px)',
          },
        }}>
        <EditIcon />
      </IconButton>

      {/* 🎞️ 背景图 */}
      <Box
        component="img"
        alt="backdrop"
        src={media.cover || 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg'}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: -2,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'var(--backdrop-filter)',
          mixBlendMode: 'var(--backdrop-mix-blend-mode)' as any,
          WebkitMaskImage: 'linear-gradient(to bottom,#000 80%,#0000)',
          maskImage: 'linear-gradient(to bottom,#000 80%,#0000)',
        }}
      />

      {/* 背景遮罩 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000b3',
          zIndex: -1,
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0) 100%)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* 主要内容 */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' },
          gap: { xs: 3, md: 4 },
          color: 'white',
          maxWidth: '1100px',
          padding: { xs: '0 40px', md: '0 80px' },
        }}>
        {/* 封面图 */}
        <Box sx={{ flex: '0 0 260px' }}>
          <CardMedia
            component="img"
            image={media.cover || 'https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg'}
            alt={media.title}
            sx={{ width: 260, borderRadius: 2, boxShadow: 3 }}
          />
        </Box>

        {/* 文本信息 */}
        <Box sx={{ flex: '1 1 420px', minWidth: 280 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
            {media.title}{' '}
            <Typography component="span" variant="h4" sx={{ opacity: 0.8 }}>
              {media.year}
            </Typography>
          </Typography>

          {media.content && (
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              {media.content}
            </Typography>
          )}

          <Typography sx={{ mt: 2, maxWidth: 680, opacity: 0.95 }}>{media.overview || '暂无简介。'}</Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #000',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #000',
                },
              }}>
              View Trailer
            </Button>
            {media.rating && <Chip label={`⭐ ${media.rating}`} color="warning" />}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
