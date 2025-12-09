import { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTagStore } from 'Frontend/features/note/hooks/useTagStore';
import TagChip from './TagChip';
import TagDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/TagDto';

const TagList = () => {
  const tags = useTagStore((s) => s.tags);
  const selectedTags = useTagStore((s) => s.selectedTags);
  const loading = useTagStore((s) => s.loading);
  const error = useTagStore((s) => s.error);
  const [searchText, setSearchText] = useState('');

  // 根据搜索关键字过滤和排序标签
  const filteredAndSortedTags = useMemo(() => {
    if (!searchText.trim()) {
      return tags;
    }

    const searchLower = searchText.toLowerCase().trim();
    const matchingTags: TagDto[] = [];
    const nonMatchingTags: TagDto[] = [];

    tags.forEach((tag) => {
      if (tag.name.toLowerCase().includes(searchLower)) {
        matchingTags.push(tag);
      } else {
        nonMatchingTags.push(tag);
      }
    });

    // 包含关键字的标签在前面，不包含的在后面
    return [...matchingTags, ...nonMatchingTags];
  }, [tags, searchText]);

  return (
    <Box
      p={2}
      sx={{
        flex: 1,
      }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.secondary',
          mb: 1,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>
        标签
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          size="small"
          placeholder="搜索标签..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchText('')}
                    sx={{ p: 0.5 }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            } as any,
          }}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
            },
          }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                py: 2,
              }}>
              <CircularProgress size={20} />
            </Box>
          )}
          {error && !loading && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          {!loading &&
            !error &&
            filteredAndSortedTags.map((tag: TagDto) => {
              const selected = selectedTags.some((t) => t.id === tag.id);
              return <TagChip key={tag.id} tag={tag} selected={selected} />;
            })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default TagList;
