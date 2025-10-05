import React from 'react';
import { Box, Typography, IconButton, InputBase, Paper, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { useSelectedTagsStore } from 'Frontend/features/post/hooks/useSelectedTagsStore';
import { useSelectedCollectionStore } from 'Frontend/features/post/hooks/useSelectedCollectionStore';
import CloseIcon from '@mui/icons-material/Close';
import { Tag } from 'Frontend/features/post/hooks/useTagStore';

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
  const { selectedTags, removeTag } = useSelectedTagsStore();
  const { selectedCollection } = useSelectedCollectionStore();

  const renderCollectionCard = () => (
    <Box
      sx={{
        display: 'flex',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // 阴影轻点，别吓人
        height: 120,
      }}>
      {/* 封面 */}
      <Box
        sx={{
          width: 120,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
        {selectedCollection?.cover ? (
          <Box
            component="img"
            src={selectedCollection.cover}
            alt={selectedCollection.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        ) : (
          <FolderIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
        )}
      </Box>

      {/* 内容 */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        {/* 标题和信息 */}
        <Box>
          <Typography variant="subtitle1" noWrap fontWeight={600} sx={{ color: 'text.primary' }}>
            {selectedCollection?.name || '未命名收藏夹'}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            {selectedCollection?.count || 0} 条笔记 · 更新于 {selectedCollection?.lastUpdated || '未知时间'}
          </Typography>
        </Box>

        {/* 标签 */}
        {selectedTags.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1,
            }}>
            {selectedTags.map((tag: Tag) => (
              <Box
                key={tag.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1,
                  py: 0.2,
                  borderRadius: 20,
                  color: 'text.primary',
                  height: 40,
                  transition: 'all 0.2s',
                }}>
                {/* tag 图片 */}
                <Box
                  component="img"
                  src={tag.image}
                  alt={tag.title}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                {/* 文本 */}
                <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', maxWidth: 90 }}>
                  #{tag.title}
                </Typography>

                {/* 删除按钮 */}
                <IconButton
                  size="small"
                  onClick={() => removeTag(tag.id)}
                  sx={{
                    p: 0.2,
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
                  }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {/* 收藏夹展示 + 标签展示整合 */}
      {selectedCollection && renderCollectionCard()}

      {/* 搜索栏 */}
      <Paper
        component="form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSearch();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '30px',
          px: 1,
          py: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}>
        <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
        <InputBase
          placeholder="検索キーワードを入力..."
          value={searchText}
          onChange={handleInputChange}
          sx={{ ml: 1, flex: 1, fontSize: 14 }}
        />
        <IconButton type="submit" size="small" sx={{ ml: 1 }}>
          <SearchIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="primary" onClick={handleCreatePost}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Stack>
  );
}
