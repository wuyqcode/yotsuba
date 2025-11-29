import { Box } from '@mui/material';

interface VideoPreviewProps {
  previewUrl: string;
}

export default function VideoPreview({ previewUrl }: VideoPreviewProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}>
      <Box
        component="video"
        src={previewUrl}
        controls
        sx={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}>
        您的浏览器不支持视频播放
      </Box>
    </Box>
  );
}

