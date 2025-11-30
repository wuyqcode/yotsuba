import { Box, TextField, Select, MenuItem, FormControl, Button, Typography } from '@mui/material';
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
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        p: 2,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <MusicNoteIcon sx={{ fontSize: 32, color: '#ff6b6b' }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
        云音乐
      </Typography>

      <Box sx={{ flex: 1, display: 'flex', gap: 1, mx: 2 }}>
        <TextField
          fullWidth
          placeholder="搜索音乐、歌手、专辑..."
          value={searchKeyword}
          onChange={(e) => onSearchKeywordChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
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
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
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
            minWidth: 100,
          }}
          startIcon={<SearchIcon />}
        >
          搜索
        </Button>
      </Box>
    </Box>
  );
}

