import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Toolbar,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { FileResourceEndpoint } from 'Frontend/generated/endpoints';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from '@mui/material/LinearProgress';
import FileCard from 'Frontend/components/file/FileCard';
import FilePreviewModal from 'Frontend/components/file/FilePreviewModal';
import { isText } from 'Frontend/components/file/utils/fileTypeUtils';
import PaginationBar from 'Frontend/components/PaginationBar';


export const config: ViewConfig = {
  menu: { order: 6, icon: 'FolderIcon' },
  title: '文件列表',
  loginRequired: true,
};


export default function FileListView() {
  const [files, setFiles] = useState<FileResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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
  const [filterOrphan, setFilterOrphan] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
  }, [page, pageSize]);

  // 过滤孤立文件（没有 referenceId 的文件）
  const filteredFiles = useMemo(() => {
    if (!filterOrphan) {
      return files;
    }
    return files.filter((file) => !file.reference?.referenceId?.id);
  }, [files, filterOrphan]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredFiles.map((f) => f.id?.id).filter((id): id is string => !!id));
      setSelectedFiles(allIds);
    } else {
      setSelectedFiles(new Set());
    }
  };

  // 切换单个文件的选择状态
  const handleToggleSelect = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // 批量删除选中的文件
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      return;
    }

    if (!window.confirm(`确定要删除选中的 ${selectedFiles.size} 个文件吗？此操作不可恢复！`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const deletePromises = Array.from(selectedFiles).map((fileId) =>
        FileResourceEndpoint.deleteFile(fileId).catch((err) => {
          console.error(`删除文件 ${fileId} 失败:`, err);
          return false;
        })
      );

      await Promise.all(deletePromises);
      setSelectedFiles(new Set());
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

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

      await FileResourceEndpoint.upload(file, undefined, undefined);
      
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
    if (isText(file)) {
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

  return (
    <Box height={'100%'}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              文件列表
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {totalElements} 个文件
              {filterOrphan && ` (过滤后: ${filteredFiles.length} 个孤立文件)`}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOrphan}
                  onChange={(e) => {
                    setFilterOrphan(e.target.checked);
                    setSelectedFiles(new Set()); // 切换过滤时清空选择
                  }}
                />
              }
              label="仅显示孤立文件"
            />
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

        {/* 多选工具栏 */}
        {filterOrphan && filteredFiles.length > 0 && (
          <Toolbar
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: '48px !important',
            }}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={selectedFiles.size > 0 && selectedFiles.size === filteredFiles.length}
                indeterminate={selectedFiles.size > 0 && selectedFiles.size < filteredFiles.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                已选择 {selectedFiles.size} / {filteredFiles.length} 个文件
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBatchDelete}
                disabled={selectedFiles.size === 0 || deleting}
                size="small">
                {deleting ? '删除中...' : '删除选中'}
              </Button>
            </Box>
          </Toolbar>
        )}

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
            {filteredFiles.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography variant="body2" color="text.secondary">
                  {filterOrphan ? '暂无孤立文件' : '暂无文件'}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}>
                {filteredFiles.map((file) => {
                  const fileUrl = file.id?.id ? `/api/file-resource/${file.id.id}` : null;
                  const fileId = file.id?.id || '';
                  const isSelected = selectedFiles.has(fileId);
                  
                  return (
                    <Box
                      key={fileId}
                      sx={{
                        width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 12px)' },
                        minWidth: 250,
                        position: 'relative',
                      }}>
                      {filterOrphan && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSelect(fileId)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 3,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'background.paper',
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <FileCard
                        file={file}
                        fileUrl={fileUrl}
                        handlePreview={handlePreview}
                        handleDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            {totalPages > 0 && (
              <PaginationBar
                  page={page + 1}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                pageSizeOptions={[12, 20, 48, 96]}
                onPageChange={(newPage) => setPage(newPage - 1)}
                onPageSizeChange={(newPageSize) => {
                  setPage(0);
                  setPageSize(newPageSize);
                }}
              />
            )}
          </>
        )}

        {/* 预览对话框 */}
        <FilePreviewModal
          open={previewOpen}
          file={previewFile}
          previewUrl={previewUrl}
          onClose={handleClosePreview}
          loadingText={loadingText}
          textContent={textContent}
        />
      </Box>
    </Box>
  );
}

