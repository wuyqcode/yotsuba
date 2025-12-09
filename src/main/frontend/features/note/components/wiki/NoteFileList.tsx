import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import GifIcon from '@mui/icons-material/Gif';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import ReferenceCategory from 'Frontend/generated/io/github/dutianze/yotsuba/shared/common/ReferenceCategory';
import { useParams } from 'react-router';
import FileCard from 'Frontend/components/file/FileCard';
import FilePreviewModal from 'Frontend/components/file/FilePreviewModal';
import { FileResourceEndpoint, GenerateGifEndpoint } from 'Frontend/generated/endpoints';

export default function NoteFileList() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<FileResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileResourceDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [gifDialogOpen, setGifDialogOpen] = useState(false);
  const [gifInput, setGifInput] = useState('');
  const [generatingGif, setGeneratingGif] = useState(false);

  const fetchFiles = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const fileList = await FileResourceEndpoint.listByNoteId(id, 0, 100);
      setFiles(fileList.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await FileResourceEndpoint.upload(file, id, ReferenceCategory.NOTE_ATTACHMENT);

      clearInterval(progressInterval);
      setUploadProgress(100);

      await fetchFiles();

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

    const fileUrl = `/api/file-resource/${file.id.id}`;
    setPreviewUrl(fileUrl);

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
        await fetchFiles();
      } else {
        setError('删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请重试');
    }
  };

  const handleGenerateGif = async () => {
    if (!id || !gifInput.trim()) {
      setError('请输入参数');
      return;
    }

    // 解析空格分隔的三个值：URL前缀 起始索引 结束索引
    const parts = gifInput.trim().split(/\s+/);
    if (parts.length < 3) {
      setError('请输入三个值（URL前缀、起始索引、结束索引），用空格分隔');
      return;
    }

    const seekPrefix = parts[0];
    const start = parseInt(parts[1]);
    const end = parseInt(parts[2]);

    if (isNaN(start) || isNaN(end)) {
      setError('起始和结束索引必须是数字');
      return;
    }

    if (start < 0 || end < start) {
      setError('起始和结束索引无效');
      return;
    }

    setGeneratingGif(true);
    setError(null);

    try {
      // 调用后端 Endpoint 生成 GIF 并直接保存
      await GenerateGifEndpoint.generateGif(
        seekPrefix,
        start,
        end,
        id
      );

      // 刷新文件列表
      await fetchFiles();

      setGifDialogOpen(false);
      setGifInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成 GIF 失败，请重试');
    } finally {
      setGeneratingGif(false);
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const isText = (contentType: string | undefined) => contentType?.startsWith('text/') ?? false;

  return (
    <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            附件文件
          </Typography>
          <Typography variant="body2" color="text.secondary">
            共 {files.length} 个文件
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <input
            ref={setFileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={uploading || generatingGif}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => {
              if (fileInputRef) {
                fileInputRef.click();
              }
            }}
            disabled={uploading || generatingGif}
            sx={{ textTransform: 'none' }}>
            {uploading ? '上传中...' : '上传文件'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<GifIcon />}
            onClick={() => setGifDialogOpen(true)}
            disabled={uploading || generatingGif}
            sx={{ textTransform: 'none' }}>
            {generatingGif ? '生成中...' : '生成 GIF'}
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
            <Box sx={{ position: 'relative', minHeight: '200px' }}>
              <Box
                sx={{
                  transition: 'opacity 0.3s ease, visibility 0.3s ease',
                }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {files.map((file) => {
                    const fileUrl = (() => {
                      const id = file.id?.id;
                      if (!id) return null;

                      const contentType = file.contentType || '';

                      // PPTX & PPT
                      const isPpt =
                        contentType.includes('presentation') ||
                        file.filename?.toLowerCase().endsWith('.ppt') ||
                        file.filename?.toLowerCase().endsWith('.pptx');

                      if (isPpt && file.thumbnailIndexList && file.thumbnailIndexList.length > 0) {
                        return `/api/file-resource/${id}/thumbnail/${file.thumbnailIndexList[0]}`;
                      }

                      return `/api/file-resource/${id}`;
                    })();

                    return (
                      <Grid
                        key={file.id?.id}
                        size={{
                          xs: 6, // 手机两列
                          sm: 4, // 小屏 3 列
                          md: 3, // 中屏 4 列
                          lg: 2.4, // 大屏 5 列（和 NoteCard 匹配）
                        }}>
                        <FileCard
                          file={file}
                          fileUrl={fileUrl}
                          handlePreview={handlePreview}
                          handleDelete={handleDelete}
                          formatFileSize={formatFileSize}
                          formatDate={formatDate}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          )}
        </>
      )}

      <FilePreviewModal
        open={previewOpen}
        file={previewFile}
        previewUrl={previewUrl}
        onClose={handleClosePreview}
        loadingText={loadingText}
        textContent={textContent}
      />

      {/* GIF 生成对话框 */}
      <Dialog open={gifDialogOpen} onClose={() => !generatingGif && setGifDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>生成 GIF</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="参数"
              placeholder="https://example.com/seek/ 0 100"
              value={gifInput}
              onChange={(e) => setGifInput(e.target.value)}
              fullWidth
              disabled={generatingGif}
              helperText="输入三个值（URL前缀、起始索引、结束索引），用空格分隔，例如：https://example.com/seek/ 0 100"
              multiline
              rows={3}
            />
            {gifInput.trim() && (() => {
              const parts = gifInput.trim().split(/\s+/);
              if (parts.length >= 3) {
                const seekPrefix = parts[0];
                const start = parseInt(parts[1]);
                const end = parseInt(parts[2]);
                if (!isNaN(start) && !isNaN(end)) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      将从 {seekPrefix}_{start}.jpg 到 {seekPrefix}_{end}.jpg 下载图片并生成 GIF
                    </Typography>
                  );
                }
              }
              return null;
            })()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGifDialogOpen(false)} disabled={generatingGif}>
            取消
          </Button>
          <Button
            onClick={handleGenerateGif}
            variant="contained"
            disabled={generatingGif || !gifInput.trim()}
            startIcon={generatingGif ? <CircularProgress size={16} /> : <GifIcon />}>
            {generatingGif ? '生成中...' : '生成并上传'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
