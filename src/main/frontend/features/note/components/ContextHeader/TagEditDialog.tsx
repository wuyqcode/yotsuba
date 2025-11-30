import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTagStore } from '../../hooks/useTagStore';
import { useCollectionStore } from '../../hooks/useCollection';
import { useUpload } from '../../hooks/useUpload';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';
import { TagEndpoint } from 'Frontend/generated/endpoints';

interface TagEditDialogProps {
  open: boolean;
  onClose: () => void;
  tag: TagDto | null;
}

export default function TagEditDialog({ open, onClose, tag }: TagEditDialogProps) {
  const updateTag = useTagStore((s) => s.updateTag);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const { upload, loading: uploading } = useUpload();

  const [tagName, setTagName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCoverUpload = useCallback(async (file: File) => {
    try {
      const url = await upload(file);
      setCoverUrl(url);
    } catch (error) {
      console.error('上传封面失败:', error);
    }
  }, [upload]);

  useEffect(() => {
    if (tag) {
      setTagName(tag.name || '');
      setCoverUrl(tag.cover || '');
    }
  }, [tag, open]);

  // 处理剪贴板粘贴
  useEffect(() => {
    if (!open) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleCoverUpload(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [open, handleCoverUpload]);

  const handleSave = async () => {
    if (!tag || !tagName.trim()) return;

    setSaving(true);
    try {
      // 更新标签名称
      await updateTag(tag.id, tagName.trim());
      
      // 更新封面：从 URL 中提取 resourceId（URL 格式：/api/file-resource/{id}）
      let coverResourceId = '';
      if (coverUrl) {
        const urlParts = coverUrl.split('/');
        coverResourceId = urlParts[urlParts.length - 1] || '';
      }
      await TagEndpoint.updateTagCover(tag.id, coverResourceId);
      
      // 检查修改的 tag 是否在 selectedTags 中
      const selectedTags = useTagStore.getState().selectedTags;
      const isInSelectedTags = selectedTags.some((t: TagDto) => t.id === tag.id);
      
      if (isInSelectedTags) {
        // 如果在 selectedTags 中，需要刷新标签列表以更新 selectedTags
        await fetchTags(selectedCollection?.id);
      } else {
        // 如果不在 selectedTags 中，只更新 tags 数组中的封面信息，不触发 fetchTags（避免页面重新加载）
        const tags = useTagStore.getState().tags;
        const tagToUpdate = tags.find((t: TagDto) => t.id === tag.id);
        // 只有当封面真的改变时才更新，避免不必要的数组引用变化
        if (tagToUpdate && tagToUpdate.cover !== coverUrl) {
          const updatedTags = tags.map((t: TagDto) =>
            t.id === tag.id ? { ...t, cover: coverUrl || undefined } : t
          );
          useTagStore.setState({ tags: updatedTags });
        }
      }
      
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!tag) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">编辑标签</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* 封面预览和上传 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              封面
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}>
              {coverUrl ? (
                <Box
                  component="img"
                  src={coverUrl}
                  alt="封面预览"
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    objectFit: 'cover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}>
                  <Typography variant="caption" color="text.secondary">
                    暂无封面
                  </Typography>
                </Box>
              )}
              <Button variant="outlined" component="label" size="small" disabled={uploading}>
                {uploading ? <CircularProgress size={16} /> : coverUrl ? '更换封面' : '上传封面'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                />
              </Button>
              {coverUrl && (
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  onClick={() => setCoverUrl('')}>
                  删除封面
                </Button>
              )}
            </Box>
          </Box>

          {/* 标签名称 */}
          <TextField
            label="标签名称"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            fullWidth
            variant="outlined"
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !tagName.trim()}
          startIcon={saving ? <CircularProgress size={16} /> : null}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

