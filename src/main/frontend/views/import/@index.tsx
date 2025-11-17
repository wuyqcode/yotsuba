import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Stack,
  Divider,
} from '@mui/material';
import { useState, ChangeEvent } from 'react';
import { GlassBox } from 'Frontend/components/GlassBox';

export const config: ViewConfig = {
  menu: { order: 4, icon: 'UploadIcon' },
  title: '导入',
};

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

export default function ImportView() {
  const [filePath, setFilePath] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingYotsuba, setIsLoadingYotsuba] = useState(false);
  const [resultFile, setResultFile] = useState<ImportResult | null>(null);
  const [resultYotsuba, setResultYotsuba] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const path = event.target.value;
    setFilePath(path);
    setError(null);
    setResultFile(null);
    setResultYotsuba(null);
  };

  const handleImportFile = async () => {
    if (!filePath || !filePath.trim()) {
      setError('请输入文件路径');
      return;
    }

    if (!filePath.endsWith('.db')) {
      setError('请输入 .db 文件路径');
      return;
    }

    setIsLoadingFile(true);
    setError(null);
    setResultFile(null);

    try {
      const formData = new FormData();
      formData.append('path', filePath.trim());

      const response = await fetch('/api/import/file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '导入失败');
      }

      const importResult: ImportResult = await response.json();
      setResultFile(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleImportYotsuba = async () => {
    if (!filePath || !filePath.trim()) {
      setError('请输入文件路径');
      return;
    }

    if (!filePath.endsWith('.db')) {
      setError('请输入 .db 文件路径');
      return;
    }

    setIsLoadingYotsuba(true);
    setError(null);
    setResultYotsuba(null);

    try {
      const formData = new FormData();
      formData.append('path', filePath.trim());

      const response = await fetch('/api/import/memo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '导入失败');
      }

      const importResult: ImportResult = await response.json();
      setResultYotsuba(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setIsLoadingYotsuba(false);
    }
  };

  return (
    <GlassBox height={'100%'}>
      <Box sx={{ p: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            导入 memo.db
          </Typography>
          <Typography variant="body2" color="text.secondary">
            请输入 memo.db SQLite 文件的完整路径
          </Typography>
        </Box>

        {/* 文件路径输入 */}
        <TextField
          fullWidth
          label="文件路径"
          placeholder="例如: /path/to/memo.db 或 C:\path\to\memo.db"
          value={filePath}
          onChange={handleFilePathChange}
          disabled={isLoadingFile || isLoadingYotsuba}
          sx={{ mb: 3 }}
          helperText="请输入 .db 文件的完整路径"
        />

        {/* 错误信息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 导入选项 */}
        <Stack spacing={3} sx={{ mb: 3 }}>
          {/* 导入到 File */}
          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}>
            <Typography variant="h6" gutterBottom>
              导入到 File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              将 image 表中的图片导入到 FileResource
            </Typography>
            {resultFile && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  已导入: {resultFile.imported} 个文件
                  {resultFile.skipped > 0 && `，跳过: ${resultFile.skipped} 个（已存在）`}
                </Typography>
              </Alert>
            )}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleImportFile}
                disabled={!filePath || !filePath.trim() || isLoadingFile || isLoadingYotsuba}
                startIcon={isLoadingFile ? <CircularProgress size={20} /> : null}>
                {isLoadingFile ? '导入中...' : '导入到 File'}
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* 导入到 Yotsuba */}
          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}>
            <Typography variant="h6" gutterBottom>
              导入到 Yotsuba
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              将 memo 表中的笔记、标签等数据导入到 Yotsuba 系统
            </Typography>
            {resultYotsuba && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  已导入: {resultYotsuba.imported} 条笔记
                  {resultYotsuba.skipped > 0 &&
                    `，跳过: ${resultYotsuba.skipped} 条（已存在）`}
                </Typography>
              </Alert>
            )}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleImportYotsuba}
                disabled={!filePath || !filePath.trim() || isLoadingFile || isLoadingYotsuba}
                startIcon={isLoadingYotsuba ? <CircularProgress size={20} /> : null}>
                {isLoadingYotsuba ? '导入中...' : '导入到 Yotsuba'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </GlassBox>
  );
}

