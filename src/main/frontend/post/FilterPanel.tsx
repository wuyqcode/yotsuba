import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TagChip from './TagChip';
import { Tag, useSelectedTagsStore } from './hook/useSelectedTagsStore';
import { useSelectedCollectionStore } from './hook/useSelectedCollectionStore';

interface FilterPanelProps {
  searchText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  handleCreatePost: () => void;
}

export default function FilterPanel({
  searchText,
  handleInputChange,
  handleSearch,
  handleCreatePost,
}: FilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, removeTag } = useSelectedTagsStore();
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const { selectedCollection, clearCollection } = useSelectedCollectionStore();

  const renderTagDetail = (tag: Tag) => {
    return (
      <Box
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          p: 1,
          bgcolor: 'background.paper',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}>
        <Box
          component="img"
          src={tag.image}
          alt={tag.title}
          sx={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 1 }}
        />
        <Box>
          <Typography variant="h6">{tag.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {tag.content}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* 收藏夹展示 */}
      {selectedCollection && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
          }}>
          <Box
            component="img"
            src={selectedCollection.cover}
            alt={selectedCollection.name}
            sx={{ width: 150, height: 100, objectFit: 'cover', flexShrink: 0 }}
          />

          <Box sx={{ flex: 1, px: 2 }}>
            <Typography variant="h5" noWrap>
              {selectedCollection.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              共 {selectedCollection.count} 条笔记 · 最近更新 {selectedCollection.lastUpdated}
            </Typography>
          </Box>
        </Box>
      )}

      {/* 仅剩一个 tag 时显示详情 */}
      {selectedTags.length === 1 && renderTagDetail(selectedTags[0])}

      {/* 标签展示 */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          justifyContent: 'flex-start',
        }}>
        {selectedTags.map((tag) => (
          <TagChip tag={tag} onDelete={() => removeTag(tag)} />
        ))}
      </Box>

      {/* 搜索栏 */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="+ を使用して複数のキーワードを組み合わせる"
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': { borderRadius: '30px', height: 40 },
            '& .MuiOutlinedInput-input': { py: 0.5, px: 2, fontSize: 14 },
          }}
        />
        <IconButton color="primary" onClick={handleSearch} sx={{ p: 1 }} title="検索">
          <SearchIcon />
        </IconButton>
        <IconButton color="success" onClick={handleCreatePost} sx={{ p: 1 }} title="新規作成">
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
