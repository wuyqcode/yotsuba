import { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TableChartIcon from '@mui/icons-material/TableChart';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import ReferenceCategory from 'Frontend/generated/io/github/dutianze/yotsuba/shared/common/ReferenceCategory';
import { getFileType, type FileType } from './utils/fileTypeUtils';

interface FileCardProps {
  file: FileResourceDto;
  fileUrl: string | null;
  handlePreview: (file: FileResourceDto) => void;
  handleDelete: (file: FileResourceDto) => void;
  formatFileSize: (bytes: number | undefined) => string;
  formatDate: (dateString: string | undefined) => string;
}

// 文件类型配置
const fileTypeConfig: Record<
  FileType,
  {
    icon: React.ReactNode;
    hoverIcon?: React.ReactNode;
    background: string;
    showThumbnail?: boolean;
  }
> = {
  image: {
    icon: <ImageIcon sx={{ fontSize: '3rem', color: 'white' }} />,
    background: 'linear-gradient(135deg, #6B6B6B, #434343)',
    showThumbnail: true,
  },
  video: {
    icon: <VideoFileIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    hoverIcon: <PlayCircleIcon sx={{ fontSize: '4rem', color: 'white' }} />,
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  audio: {
    icon: <AudioFileIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    hoverIcon: <MusicNoteIcon sx={{ fontSize: '4rem', color: 'white' }} />,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  ppt: {
    icon: <SlideshowIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    showThumbnail: true,
  },
  excel: {
    icon: <TableChartIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    showThumbnail: true,
  },
  pdf: {
    icon: <PictureAsPdfIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  },
  text: {
    icon: <TextSnippetIcon sx={{ fontSize: '4rem', color: 'rgba(0,0,0,0.5)' }} />,
    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  },
  other: {
    icon: <InsertDriveFileIcon sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.7)' }} />,
    background: 'linear-gradient(135deg, #6B6B6B, #434343)',
  },
};

export default function FileCard({
  file,
  fileUrl,
  handlePreview,
  handleDelete,
  formatFileSize,
  formatDate,
}: FileCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileType = getFileType(file);
  const config = fileTypeConfig[fileType];

  // 检查是否有缩略图（图片、PPT、Excel）
  const hasThumbnail = config.showThumbnail && file.thumbnailIndexList && file.thumbnailIndexList.length > 0;
  const thumbnailUrl =
    hasThumbnail && file.id?.id
      ? `/api/file-resource/${file.id.id}/thumbnail/${file.thumbnailIndexList[0]}`
      : null;

  // 确定显示的图片 URL
  const displayImageUrl = fileType === 'image' ? fileUrl : thumbnailUrl;
  const shouldShowImage = displayImageUrl && !imageError && (fileType === 'image' || hasThumbnail);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDelete(file);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePreview(file);
  };

  return (
    <Box
      sx={{ width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => handlePreview(file)}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          aspectRatio: '16 / 10',
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
        {/* 引用标识 - 右上角 */}
        {file.reference?.referenceId?.id && (
          <Box
            component="a"
            href={
              file.reference.referenceCategory === ReferenceCategory.TAG_COVER
                ? `/note?tagId=${file.reference.referenceId.id}`
                : `/note/WIKI/${file.reference.referenceId.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: 'primary.dark',
              },
            }}>
            <LinkIcon sx={{ fontSize: '0.875rem', color: 'white' }} />
          </Box>
        )}

        {/* 内容区域 */}
        {shouldShowImage ? (
          <Box
            component="img"
            src={displayImageUrl}
            alt={file.filename || ''}
            className="cover"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onError={() => setImageError(true)}
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
              background: config.background,
              transition: 'transform 0.4s ease',
              position: 'relative',
            }}>
            {config.icon}
            {config.hoverIcon && hovered && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}>
                {config.hoverIcon}
              </Box>
            )}
          </Box>
        )}

        {/* 底部信息栏 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
          }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                display: 'block',
                maxWidth: 150,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}>
              {file.filename}
            </Typography>
          </Box>

          <Box
            sx={{
              display: hovered ? 'flex' : 'none',
              gap: 0.5,
              alignItems: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}>
            <Tooltip title="预览">
              <IconButton
                size="small"
                onClick={handlePreviewClick}
                sx={{
                  color: 'white',
                  width: 24,
                  height: 24,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}>
                <VisibilityIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  color: 'white',
                  width: 24,
                  height: 24,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}>
                <DeleteIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* 文件大小和日期 */}
      <Box sx={{ mt: 1, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {formatFileSize(file.size)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(file.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}

