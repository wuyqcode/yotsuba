import { Box, TextField, Select, MenuItem, FormControl, Button, Typography, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface SearchBarProps {
  searchKeyword: string;
  source: string;
  onSearchKeywordChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({
  searchKeyword,
  source,
  onSearchKeywordChange,
  onSourceChange,
  onSearch,
}: SearchBarProps) {
  const isMobile = useMediaQuery('(max-width: 900px)');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 1.5 : 2,
        mb: isMobile ? 1 : 3,
        p: isMobile ? 1.5 : 2,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          ...(isMobile && { justifyContent: 'center' }),
        }}
      >
        <MusicNoteIcon sx={{ fontSize: isMobile ? 28 : 32, color: '#ff6b6b' }} />
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', color: '#fff' }}>
          云音乐
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          mx: isMobile ? 0 : 2,
        }}
      >
        <TextField
          fullWidth
          placeholder={isMobile ? '搜索...' : '搜索音乐、歌手、专辑...'}
          value={searchKeyword}
          onChange={(e) => onSearchKeywordChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              ...(isMobile && { fontSize: '0.9rem' }),
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: '#ff6b6b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6b6b',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            ...(isMobile && { flexDirection: 'row' }),
          }}
        >
          <FormControl sx={{ minWidth: isMobile ? 'auto' : 150, flex: isMobile ? 1 : 'none' }}>
            <Select
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                ...(isMobile && { fontSize: '0.85rem' }),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ff6b6b',
                },
              }}
            >
              <MenuItem value="netease">网易云音乐</MenuItem>
              <MenuItem value="tencent">QQ音乐</MenuItem>
              <MenuItem value="kuwo">酷我音乐</MenuItem>
              <MenuItem value="kugou">酷狗音乐</MenuItem>
              <MenuItem value="migu">咪咕音乐</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={onSearch}
            sx={{
              background: '#ff6b6b',
              '&:hover': { background: '#ff5252' },
              minWidth: isMobile ? 80 : 100,
              ...(isMobile && { fontSize: '0.85rem', px: 2 }),
            }}
            startIcon={<SearchIcon />}
          >
            搜索
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

