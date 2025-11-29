import { Box, CircularProgress } from '@mui/material';
import { useState } from 'react';

interface ImagePreviewProps {
  previewUrl: string;
  filename?: string;
}

export default function ImagePreview({ previewUrl, filename }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        p: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box',
      }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
          <CircularProgress size={40} />
        </Box>
      )}
      {error ? (
        <Box
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            p: 3,
          }}>
          图片加载失败
        </Box>
      ) : (
        <Box
          component="img"
          src={previewUrl}
          alt={filename || ''}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </Box>
  );
}

