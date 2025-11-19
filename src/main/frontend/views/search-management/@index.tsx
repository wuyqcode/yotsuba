import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useState } from 'react';
import { GlassBox } from 'Frontend/components/GlassBox';
import { SearchManagementService } from 'Frontend/generated/endpoints';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

export const config: ViewConfig = {
  menu: { order: 5, icon: 'SearchIcon' },
  title: '搜索管理',
};

export default function SearchManagementView() {
  const [isLoading, setIsLoading] = useState(false);
  const [async, setAsync] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReindexAll = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const message = await SearchManagementService.reindexAll(async);
      setResult(message ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重建索引失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassBox height={'100%'}>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Hibernate Search 管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理 Lucene 全文搜索索引
          </Typography>
        </Box>

        {/* 错误信息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 成功信息 */}
        {result && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setResult(null)}>
            {result}
          </Alert>
        )}

        {/* 重建索引卡片 */}
        <Stack spacing={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RefreshIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">重建所有索引</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                重建所有实体的 Lucene 全文搜索索引。这将清空现有索引并重新扫描数据库中的所有数据。
              </Typography>

              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>异步模式：</strong>索引重建在后台执行，立即返回。
                  <br />
                  <strong>同步模式：</strong>等待索引重建完成后返回，可能需要较长时间。
                </Typography>
              </Alert>

              <FormControlLabel
                control={
                  <Switch
                    checked={async}
                    onChange={(e) => setAsync(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label={async ? '异步执行（推荐）' : '同步执行'}
              />
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleReindexAll}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}>
                {isLoading ? '重建中...' : '开始重建索引'}
              </Button>
            </CardActions>
          </Card>

          {/* 说明卡片 */}
          <Card elevation={1} sx={{ bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                使用说明
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>在以下情况需要重建索引：
                    <ul style={{ marginTop: '0.5rem' }}>
                      <li>首次启用全文搜索功能</li>
                      <li>搜索结果不准确或缺失</li>
                      <li>修改了索引配置或分析器</li>
                      <li>数据库直接修改后需要同步索引</li>
                    </ul>
                  </li>
                  <li style={{ marginTop: '0.5rem' }}>
                    重建索引期间，搜索功能可能受到影响
                  </li>
                  <li style={{ marginTop: '0.5rem' }}>
                    建议在低峰期执行索引重建操作
                  </li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </GlassBox>
  );
}

