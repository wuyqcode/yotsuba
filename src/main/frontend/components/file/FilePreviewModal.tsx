// FilePreviewModal.tsx
import { useEffect } from 'react';
import { Modal, Box, IconButton, Typography, Tooltip, Fade, Backdrop } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import { getFileType } from './utils/fileTypeUtils';
import ImagePreview from './preview/ImagePreview';
import VideoPreview from './preview/VideoPreview';
import AudioPreview from './preview/AudioPreview';
import TextPreview from './preview/TextPreview';
import PdfPreview from './preview/PdfPreview';
import PptPreview from './preview/PptPreview';
import ExcelPreview from './preview/ExcelPreview';

export default function FilePreviewModal({
  open,
  file,
  previewUrl,
  onClose,
  loadingText,
  textContent,
}: {
  open: boolean;
  file: FileResourceDto | null;
  previewUrl: string | null;
  onClose: () => void;
  loadingText: boolean;
  textContent: string | null;
}) {
  // 键盘快捷键支持：ESC 关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!file || !previewUrl) return null;

  const fileType = getFileType(file);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        },
      }}>
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            height: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            maxWidth: '1400px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            outline: 'none',
          }}>
          {/* 现代化标题栏 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'relative',
            }}>
            <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}>
                {file.filename || '-'}
              </Typography>
              {file.contentType && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.6875rem',
                    display: 'block',
                    mt: 0.125,
                    lineHeight: 1.2,
                  }}>
                  {file.contentType}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {file.reference?.referenceId?.id && (
                <IconButton
                  size="small"
                  component="a"
                  href={`/note/WIKI/${file.reference.referenceId.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    },
                  }}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              )}
              <Tooltip title="下载 (Ctrl+S)">
                <IconButton
                  size="small"
                  component="a"
                  href={previewUrl}
                  target="_blank"
                  download
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="关闭 (ESC)">
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.main',
                    },
                  }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* 内容区域 */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {fileType === 'image' && <ImagePreview previewUrl={previewUrl} filename={file.filename} />}
              {fileType === 'video' && <VideoPreview previewUrl={previewUrl} />}
              {fileType === 'audio' && <AudioPreview previewUrl={previewUrl} />}
              {fileType === 'text' && <TextPreview loadingText={loadingText} textContent={textContent} />}
              {fileType === 'pdf' && <PdfPreview previewUrl={previewUrl} filename={file.filename} />}
              {fileType === 'ppt' && file.thumbnailIndexList && file.thumbnailIndexList.length > 0 && (
                <PptPreview fileId={file.id?.id} thumbnails={file.thumbnailIndexList} />
              )}
              {fileType === 'excel' && file.thumbnailIndexList && file.thumbnailIndexList.length > 0 && (
                <ExcelPreview fileId={file.id?.id} thumbnails={file.thumbnailIndexList} />
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

