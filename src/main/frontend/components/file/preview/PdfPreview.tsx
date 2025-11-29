import { Box, Typography, Button, Paper } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface PdfPreviewProps {
  previewUrl: string;
  filename?: string;
}

export default function PdfPreview({ previewUrl, filename }: PdfPreviewProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
        }}>
        <PictureAsPdfIcon sx={{ fontSize: 80, color: 'error.main', opacity: 0.8 }} />
        <Typography variant="h6" sx={{ fontWeight: 500, mt: 1 }}>
          PDF 文件
        </Typography>
        {filename && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
            {filename}
          </Typography>
        )}
        <Button
          component="a"
          href={previewUrl}
          target="_blank"
          variant="contained"
          startIcon={<OpenInNewIcon />}
          sx={{
            mt: 2,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
          }}>
          在新窗口打开
        </Button>
      </Paper>
    </Box>
  );
}

