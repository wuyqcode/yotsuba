import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Container,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import CategoryIcon from '@mui/icons-material/Category';
import data from './data.json';

interface Item {
  name: string;
  url: string;
  icon: string;
}

interface Category {
  category: string;
  icon: string;
  items: Item[];
}

const UrlCard = ({ item }: { item: Item }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%', xl: '20%' }, p: 1 }}>
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {!imgError && (
            <Box
              component="img"
              src={item.icon}
              alt={item.name}
              onError={() => setImgError(true)}
              sx={{ width: 40, height: 40, borderRadius: 2, objectFit: 'cover', mr: 2 }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap fontWeight="bold" color="text.primary">
              <Link href={item.url} target="_blank" underline="hover" color="inherit">
                {item.name}
              </Link>
            </Typography>
            <Typography variant="caption" noWrap color="text.secondary">
              {item.name}
            </Typography>
          </Box>
        </Box>
        <Typography color="text.disabled" fontSize={20} ml={2}>
          ➔
        </Typography>
      </Card>
    </Box>
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleScrollTo = (category: string) => {
    sectionRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredData = data
    .map((cat: Category) => ({
      ...cat,
      items: cat.items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box
        sx={{
          width: 240,
          bgcolor: '#fff',
          p: 2,
          overflowY: 'auto',
          position: 'fixed',
          top: 50,
          left: 0,
          bottom: 0,
          borderRight: 1,
          borderColor: '#e0e0e0',
        }}>
        <List>
          {filteredData.map((cat, idx) => (
            <ListItemButton key={idx} onClick={() => handleScrollTo(cat.category)} sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <FolderIcon sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography fontSize={14} color="text.primary">
                    {cat.category}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1, p: 4, ml: '240px' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              width: '100%',
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                color: 'text.primary',
                borderRadius: 2,
                '& fieldset': { borderColor: '#ccc' },
                '&:hover fieldset': { borderColor: '#999' },
                '&.Mui-focused fieldset': { borderColor: '#666' },
              },
              '& input': { color: 'text.primary', '::placeholder': { color: '#aaa' } },
            }}
            variant="outlined"
          />
        </Box>

        {filteredData.map((cat, idx) => (
          <Box key={idx} ref={(el: HTMLDivElement | null) => (sectionRefs.current[cat.category] = el)} sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, fontSize: 28, color: 'text.primary' }} />
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {cat.category}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
              {cat.items.map((item, iidx) => (
                <UrlCard key={iidx} item={item} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default App;
