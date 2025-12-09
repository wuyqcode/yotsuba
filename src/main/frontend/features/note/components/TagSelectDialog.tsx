import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTagStore } from '../hooks/useTagStore';
import { useCollectionStore } from '../hooks/useCollection';
import { NoteEndpoint, TagEndpoint } from 'Frontend/generated/endpoints';
import NoteCardDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/NoteCardDto';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/TagDto';

interface TagSelectDialogProps {
  open: boolean;
  onClose: () => void;
  note: NoteCardDto;
}

export default function TagSelectDialog({ open, onClose, note }: TagSelectDialogProps) {
  const [tags, setTags] = useState<TagDto[]>([]);
  const addTag = useTagStore((s) => s.addTag);
  const loading = useTagStore((s) => s.loading);
  const selectedTag = useTagStore((s) => s.selectedTag);
  const selectedTags = useTagStore((s) => s.selectedTags);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadTags = async () => {
    try {
      const result = await TagEndpoint.findAllTags(selectedCollection?.id, []);
      setTags(result);
    return result;
    } catch (e) {
      console.error('加载所有标签失败:', e);
    return [];
    }
  };

  useEffect(() => {
    if (!open || !note.id) return;

    // 打开对话框时清空输入框
    setSearchText('');

    const loadNoteTags = async () => {
      try {
        const wikiNote = await NoteEndpoint.findWikiNoteById(note.id!);
        if (wikiNote.tags) {
          const tagIds = wikiNote.tags.filter((tag): tag is TagDto => !!tag).map((tag) => tag.id);
          setSelectedTagIds(new Set(tagIds));
        }
      } catch (error) {
        console.error('加载笔记标签失败:', error);
      }
    };

    loadTags();
    loadNoteTags();
  }, [open, selectedCollection?.id, note.id]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!note.id) return;
    setSaving(true);
    try {
      await NoteEndpoint.updateNoteTags(note.id, Array.from(selectedTagIds));
      onClose();
    } catch (error) {
      console.error('保存标签失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 过滤标签并排序：已选中的标签排在前面
  const filteredTags = tags
    .filter((tag) => {
      // 已选中的标签始终显示，即使不匹配搜索文本
      if (selectedTagIds.has(tag.id)) return true;
      // 未选中的标签只显示匹配搜索文本的
      return tag.name.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
      // 计算优先级：数字越小优先级越高
      const getPriority = (tagId: string) => {
        // 优先级 1: 当前笔记已选中的标签
        if (selectedTagIds.has(tagId)) return 1;
        // 优先级 2: store 中的 selectedTag
        if (selectedTag?.id === tagId) return 2;
        // 优先级 3: store 中的 selectedTags
        if (selectedTags.some((t) => t.id === tagId)) return 3;
        // 优先级 4: 其他标签
        return 4;
      };

      const aPriority = getPriority(a.id);
      const bPriority = getPriority(b.id);

      // 按优先级排序
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // 相同优先级下，按创建时间排序（TSID id 是按时间顺序生成的，越新的 id 越大）
      return b.id.localeCompare(a.id);
    });

  // 检查搜索文本是否匹配现有标签
  const searchTextLower = searchText.toLowerCase().trim();
  const hasExactMatch = tags.some((tag) => tag.name.toLowerCase() === searchTextLower);
  const showCreateOption = searchText.trim() && !hasExactMatch;

  const handleCreateTag = async () => {
    if (!searchText.trim() || !selectedCollection?.id || creating) return;

    const tagNameToCreate = searchText.trim();
    try {
      setCreating(true);
      // 先清空输入框
      setSearchText('');
      await addTag(selectedCollection.id, tagNameToCreate);
      // 刷新标签列表并获取更新后的标签
      const updatedTags = await loadTags();
      // 找到新创建的标签并选中
      const newTag = updatedTags.find((tag) => tag.name.toLowerCase() === tagNameToCreate.toLowerCase());
      if (newTag) {
        setSelectedTagIds((prev) => new Set([...prev, newTag.id]));
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      // 创建失败时，恢复输入框内容
      setSearchText(tagNameToCreate);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onClick={(e) => e.stopPropagation()}>
      <DialogTitle>为记事添加标签</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="输入标签名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          sx={{
            maxHeight: 400,
            overflowY: 'auto',
            minHeight: 200,
          }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              {/* 显示创建新标签选项 */}
              {showCreateOption && (
                <Box
                  onClick={handleCreateTag}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}>
                  <AddIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="primary">
                    创建新标签: "{searchText}"
                  </Typography>
                  {creating && <CircularProgress size={16} sx={{ ml: 'auto' }} />}
                </Box>
              )}

              {/* 显示匹配的标签列表 */}
              {filteredTags.length > 0 && (
                <>
                  {filteredTags.map((tag: TagDto) => (
                    <FormControlLabel
                      key={tag.id}
                      control={
                        <Checkbox
                          checked={selectedTagIds.has(tag.id)}
                          onChange={() => handleToggleTag(tag.id)}
                          size="small"
                        />
                      }
                      label={tag.name}
                      sx={{
                        display: 'flex',
                        width: '100%',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        ...(selectedTagIds.has(tag.id) && {
                          backgroundColor: 'action.selected',
                        }),
                      }}
                    />
                  ))}
                </>
              )}

              {/* 没有搜索文本且没有标签时显示提示 */}
              {!searchText && filteredTags.length === 0 && !showCreateOption && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  暂无标签
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
