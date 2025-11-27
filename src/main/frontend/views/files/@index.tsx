import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  Stack,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { FileResourceEndpoint } from 'Frontend/generated/endpoints';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import PageDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/PageDto';
import { GlassBox } from 'Frontend/components/GlassBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

// 文件卡片组件
function FileCard({
  file,
  fileUrl,
  isImageFile,
  getFileIcon,
  handlePreview,
  handleDelete,
  formatFileSize,
  formatDate,
  isImage,
  isVideo,
  isText,
}: {
  file: FileResourceDto;
  fileUrl: string | null;
  isImageFile: boolean;
  getFileIcon: (contentType: string | undefined) => JSX.Element;
  handlePreview: (file: FileResourceDto) => void;
  handleDelete: (file: FileResourceDto) => void;
  formatFileSize: (bytes: number | undefined) => string;
  formatDate: (dateString: string | undefined) => string;
  isImage: (contentType: string | undefined) => boolean;
  isVideo: (contentType: string | undefined) => boolean;
  isText: (contentType: string | undefined) => boolean;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}>
      {/* 预览图/图标 */}
      <Box
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
        }}>
        {isImageFile && fileUrl && !imageError ? (
          <img
            src={fileUrl}
            alt={file.filename || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => handlePreview(file)}
            onError={() => setImageError(true)}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
            {getFileIcon(file.contentType)}
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {file.filename || '-'}
        </Typography>

        {file.contentType && (
          <Chip
            label={file.contentType}
            size="small"
            sx={{ mb: 1, fontSize: '0.7rem', height: 20 }}
          />
        )}

        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            大小: {formatFileSize(file.size)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            创建: {formatDate(file.createdAt)}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => handlePreview(file)}
          disabled={!isImage(file.contentType) && !isVideo(file.contentType) && !isText(file.contentType)}>
          预览
        </Button>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDelete(file)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export const config: ViewConfig = {
  menu: { order: 6, icon: 'FolderIcon' },
  title: '文件列表',
};


export default function FileListView() {
  const [files, setFiles] = useState<FileResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileResourceDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await FileResourceEndpoint.list(page, pageSize);
      setFiles(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // 重置 input，允许重复选择同一文件
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 模拟上传进度（实际进度需要后端支持）
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await FileResourceEndpoint.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 上传成功后刷新列表
      await fetchFiles();
      
      // 延迟一下再重置状态，让用户看到完成状态
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePreview = async (file: FileResourceDto) => {
    if (!file.id?.id) return;
    
    setPreviewFile(file);
    setPreviewOpen(true);

    // 根据文件类型生成预览 URL
    const fileUrl = `/api/file-resource/${file.id.id}`;
    setPreviewUrl(fileUrl);

    // 如果是文本文件，加载文本内容
    if (isText(file.contentType)) {
      setLoadingText(true);
      setTextContent(null);
      try {
        const response = await fetch(fileUrl);
        const text = await response.text();
        setTextContent(text);
      } catch (err) {
        setTextContent('无法加载文本内容');
      } finally {
        setLoadingText(false);
      }
    } else {
      setTextContent(null);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
    setPreviewUrl(null);
    setTextContent(null);
  };

  const handleDelete = async (file: FileResourceDto) => {
    if (!file.id?.id) return;
    
    if (!window.confirm(`确定要删除文件 "${file.filename || file.id.id}" 吗？`)) {
      return;
    }

    try {
      const success = await FileResourceEndpoint.deleteFile(file.id.id);
      if (success) {
        // 删除成功后刷新列表
        await fetchFiles();
      } else {
        setError('删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请重试');
    }
  };

  const getFileIcon = (contentType: string | undefined) => {
    if (contentType?.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (contentType?.startsWith('video/')) {
      return <VideoFileIcon color="secondary" />;
    } else if (contentType?.startsWith('text/')) {
      return <TextSnippetIcon color="info" />;
    }
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const isImage = (contentType: string | undefined) => contentType?.startsWith('image/') ?? false;
  const isVideo = (contentType: string | undefined) => contentType?.startsWith('video/') ?? false;
  const isText = (contentType: string | undefined) => contentType?.startsWith('text/') ?? false;

  return (
    <GlassBox height={'100%'}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              文件列表
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {totalElements} 个文件
            </Typography>
          </Box>
          <Box>
            <input
              ref={setFileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => {
                if (fileInputRef) {
                  fileInputRef.click();
                }
              }}
              disabled={uploading}>
              {uploading ? '上传中...' : '上传文件'}
            </Button>
          </Box>
        </Box>

        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                上传中...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {files.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography variant="body2" color="text.secondary">
                  暂无文件
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}>
                {files.map((file) => {
                  const fileUrl = file.id?.id ? `/api/file-resource/${file.id.id}` : null;
                  const isImageFile = isImage(file.contentType);
                  
                  return (
                    <Box
                      key={file.id?.id || ''}
                      sx={{
                        width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 12px)' },
                        minWidth: 250,
                      }}>
                      <FileCard
                        file={file}
                        fileUrl={fileUrl}
                        isImageFile={isImageFile}
                        getFileIcon={getFileIcon}
                        handlePreview={handlePreview}
                        handleDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        isImage={isImage}
                        isVideo={isVideo}
                        isText={isText}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, newPage) => setPage(newPage - 1)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* 预览对话框 */}
        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
            },
          }}>
          <DialogTitle>
            {previewFile?.filename || '-'}
            <Button
              size="small"
              href={previewUrl || '#'}
              target="_blank"
              download
              sx={{ ml: 2 }}>
              下载
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            {previewFile && previewUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                {isImage(previewFile.contentType) && (
                  <img
                    src={previewUrl}
                    alt={previewFile.filename || ''}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                    }}
                  />
                )}
                {isVideo(previewFile.contentType) && (
                  <video
                    src={previewUrl}
                    controls
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                    }}>
                    您的浏览器不支持视频播放
                  </video>
                )}
                {isText(previewFile.contentType) && (
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: 400,
                      maxHeight: '70vh',
                      overflow: 'auto',
                      p: 2,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}>
                    {loadingText ? (
                      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Typography
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          margin: 0,
                        }}>
                        {textContent || '无内容'}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>关闭</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GlassBox>
  );
}

