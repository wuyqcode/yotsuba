import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, TextField, InputAdornment, Divider, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

interface NoteFolder {
  id: string;
  name: string;
  cover?: string;
  count: number;
  lastUpdated: string;
}

const noteFolder: NoteFolder = {
  id: 'nf1',
  name: '我的笔记收藏夹',
  cover: 'https://picsum.photos/seed/notes/300/200',
  count: 12,
  lastUpdated: '2025-04-30',
};

// 模拟每个 tag 的详细信息
interface TagDetail {
  title: string;
  image: string;
  content: string;
}

const tagDetails: Record<string, { title: string; image: string; content: string }> = {
  tag1: {
    title: 'Tag1 语言',
    image: 'https://picsum.photos/seed/tag1/100/100',
    content: 'Tag1 是一种流行的开发工具。',
  },
  tag2: {
    title: 'Tag2 编译器',
    image: 'https://picsum.photos/seed/tag2/100/100',
    content: 'Tag2 支持高性能计算与并发。',
  },
  tag3: {
    title: 'Tag3 指令集',
    image: 'https://picsum.photos/seed/tag3/100/100',
    content: 'Tag3 用于编译多个语言的程序。',
  },
  tag4: {
    title: 'Tag4 虚拟机',
    image: 'https://picsum.photos/seed/tag4/100/100',
    content: 'Tag4 具备良好的跨平台能力。',
  },
  tag5: {
    title: 'Tag5 调试工具',
    image: 'https://picsum.photos/seed/tag5/100/100',
    content: 'Tag5 广泛应用于后端系统。',
  },
  tag6: {
    title: 'Tag6 数据库',
    image: 'https://picsum.photos/seed/tag6/100/100',
    content: 'Tag6 是一种流行的开发工具。',
  },
  tag7: {
    title: 'Tag7 操作系统',
    image: 'https://picsum.photos/seed/tag7/100/100',
    content: 'Tag7 支持高性能计算与并发。',
  },
  tag8: {
    title: 'Tag8 框架',
    image: 'https://picsum.photos/seed/tag8/100/100',
    content: 'Tag8 用于编译多个语言的程序。',
  },
  tag9: {
    title: 'Tag9 容器',
    image: 'https://picsum.photos/seed/tag9/100/100',
    content: 'Tag9 具备良好的跨平台能力。',
  },
  tag10: {
    title: 'Tag10 协议',
    image: 'https://picsum.photos/seed/tag10/100/100',
    content: 'Tag10 广泛应用于后端系统。',
  },
  tag11: {
    title: 'Tag11 语言',
    image: 'https://picsum.photos/seed/tag11/100/100',
    content: 'Tag11 是一种流行的开发工具。',
  },
  tag12: {
    title: 'Tag12 编译器',
    image: 'https://picsum.photos/seed/tag12/100/100',
    content: 'Tag12 支持高性能计算与并发。',
  },
  tag13: {
    title: 'Tag13 指令集',
    image: 'https://picsum.photos/seed/tag13/100/100',
    content: 'Tag13 用于编译多个语言的程序。',
  },
  tag14: {
    title: 'Tag14 虚拟机',
    image: 'https://picsum.photos/seed/tag14/100/100',
    content: 'Tag14 具备良好的跨平台能力。',
  },
  tag15: {
    title: 'Tag15 调试工具',
    image: 'https://picsum.photos/seed/tag15/100/100',
    content: 'Tag15 广泛应用于后端系统。',
  },
  tag16: {
    title: 'Tag16 数据库',
    image: 'https://picsum.photos/seed/tag16/100/100',
    content: 'Tag16 是一种流行的开发工具。',
  },
  tag17: {
    title: 'Tag17 操作系统',
    image: 'https://picsum.photos/seed/tag17/100/100',
    content: 'Tag17 支持高性能计算与并发。',
  },
  tag18: {
    title: 'Tag18 框架',
    image: 'https://picsum.photos/seed/tag18/100/100',
    content: 'Tag18 用于编译多个语言的程序。',
  },
  tag19: {
    title: 'Tag19 容器',
    image: 'https://picsum.photos/seed/tag19/100/100',
    content: 'Tag19 具备良好的跨平台能力。',
  },
  tag20: {
    title: 'Tag20 协议',
    image: 'https://picsum.photos/seed/tag20/100/100',
    content: 'Tag20 广泛应用于后端系统。',
  },
};

const keys: string[] = Object.keys(tagDetails);

interface NotesFilterPanelProps {
  searchText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  handleCreatePost: () => void;
}

const NotesFilterPanel: React.FC<NotesFilterPanelProps> = ({
  searchText,
  handleInputChange,
  handleSearch,
  handleCreatePost,
}) => {
  const [folder] = useState<NoteFolder>(noteFolder);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState(keys);

  const handleDelete = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const remainingTag = tags.length === 1 ? tags[0] : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 收藏夹展示 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'hidden',
        }}>
        {folder.cover ? (
          <Box
            component="img"
            src={folder.cover}
            alt={folder.name}
            sx={{ width: 200, height: 140, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <Box
            sx={{
              width: 200,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              flexShrink: 0,
            }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Box>
        )}

        <Box sx={{ flex: 1, px: 2 }}>
          <Typography variant="h5" noWrap>
            {folder.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            共 {folder.count} 条笔记 · 最近更新 {folder.lastUpdated}
          </Typography>
        </Box>
      </Box>

      {/* 搜索栏 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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

      {/* 标签展示 */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'flex-start',
        }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDelete(tag)}
            sx={{
              fontWeight: 'bold',
              height: 28,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        ))}
      </Box>

      {/* 仅剩一个 tag 时显示详情 */}
      {tags.length === 1 &&
        (() => {
          const detail = tagDetails[tags[0]];
          return detail ? (
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
                src={detail.image}
                alt={detail.title}
                sx={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 1 }}
              />
              <Box>
                <Typography variant="h6">{detail.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.content}
                </Typography>
              </Box>
            </Box>
          ) : null;
        })()}
    </Box>
  );
};

export default NotesFilterPanel;
