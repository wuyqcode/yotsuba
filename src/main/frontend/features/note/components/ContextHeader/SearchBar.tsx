import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onAdd: () => void;
}

export default function SearchBar({ value, onChange, onSearch, onAdd }: SearchBarProps) {
  return (
    <Paper
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
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
      }}
    >
      <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
      <InputBase
        placeholder="検索キーワードを入力..."
        value={value}
        onChange={onChange}
        sx={{ ml: 1, flex: 1, fontSize: 14 }}
      />
      <IconButton type="submit" size="small" sx={{ ml: 1 }}>
        <SearchIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" color="primary" onClick={onAdd}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
