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
import { NoteService, TagService } from 'Frontend/generated/endpoints';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/TagDto';
import { useNoteStore } from '../hooks/useNotes';
import { useCollectionStore } from '../hooks/useCollection';

interface TagSelectDialogProps {
  open: boolean;
  onClose: () => void;
  noteId: string;
}

export default function TagSelectDialog({ open, onClose, noteId }: TagSelectDialogProps) {
  const [tags, setTags] = useState<TagDto[]>([]);
  const addTag = useTagStore((s) => s.addTag);
  const loading = useTagStore((s) => s.loading);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

    const loadTags = async () => {
      try {
        const result = await TagService.findAllTags(selectedCollection?.id, []);
        setTags(result);
      return result;
      } catch (e) {
        console.error('加载所有标签失败:', e);
      return [];
      }
    };

  useEffect(() => {
    if (!open) return;

    const loadNoteTags = async () => {
      try {
        const wikiNote = await NoteService.findWikiNoteById(noteId);
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
  }, [open, selectedCollection?.id, noteId]);

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
    setSaving(true);
    try {
      await NoteService.updateNoteTags(noteId, Array.from(selectedTagIds));
      await fetchNotes();
      onClose();
    } catch (error) {
      console.error('保存标签失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 过滤标签并排序：已选中的标签排在前面
  const filteredTags = tags
    .filter((tag) => tag.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      const aSelected = selectedTagIds.has(a.id);
      const bSelected = selectedTagIds.has(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0; // 保持原有顺序
    });

  // 检查搜索文本是否匹配现有标签
  const searchTextLower = searchText.toLowerCase().trim();
  const hasExactMatch = tags.some((tag) => tag.name.toLowerCase() === searchTextLower);
  const showCreateOption = searchText.trim() && !hasExactMatch && filteredTags.length === 0;

  const handleCreateTag = async () => {
    if (!searchText.trim() || !selectedCollection?.id || creating) return;

    const tagNameToCreate = searchText.trim();
    try {
      setCreating(true);
      await addTag(selectedCollection.id, tagNameToCreate);
      // 刷新标签列表并获取更新后的标签
      const updatedTags = await loadTags();
      // 找到新创建的标签并选中
      const newTag = updatedTags.find((tag) => tag.name.toLowerCase() === tagNameToCreate.toLowerCase());
      if (newTag) {
        setSelectedTagIds((prev) => new Set([...prev, newTag.id]));
      }
      setSearchText('');
    } catch (error) {
      console.error('创建标签失败:', error);
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
