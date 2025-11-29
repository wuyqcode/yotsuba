import { Box, Typography, CircularProgress, Paper } from '@mui/material';

interface TextPreviewProps {
  loadingText: boolean;
  textContent: string | null;
}

export default function TextPreview({ loadingText, textContent }: TextPreviewProps) {
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
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          overflow: 'auto',
          p: 3,
          bgcolor: 'background.default',
          borderRadius: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ccc',
            borderRadius: '4px',
            '&:hover': {
              background: '#999',
            },
          },
        }}>
        {loadingText ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Typography
            component="pre"
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              m: 0,
              color: 'text.primary',
            }}>
            {textContent || '无内容'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

