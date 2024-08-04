import { MilkdownProvider } from '@milkdown/react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, Paper, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { NavLink } from 'react-router-dom';
export const config: ViewConfig = {
  menu: { order: 5, icon: 'vaadin:phone' },
  title: 'note'
};

export default function AdminView() {
  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <NavLink to="/notes/123">notes</NavLink>

        <Paper sx={{ p: 2, mb: 2 }}>
          <MilkdownProvider>
            <MilkdownEditor maxHeight={400} />
          </MilkdownProvider>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>7分钟前</Typography>
          <Typography color="primary">
            <a href="https://facebook.com/">https://facebook.com/</a>
          </Typography>
          <Typography>#facebook</Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>8分钟前</Typography>
          <Typography color="primary">
            <a href="https://news.ycombinator.com/item?id=38335229">
              https://news.ycombinator.com/item?id=38335229
            </a>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>1小时前</Typography>
          <Typography>'''python Hello '''</Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>1小时前</Typography>
          <Typography>pic s</Typography>
        </Paper>
      </Box>
      <Box sx={{ width: 300, ml: 3 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="搜索 Memos"
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">2024年8月</Typography>
          <CalendarTodayIcon />
          <Typography>75 memos in 7 days</Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">标签</Typography>
          <Typography>#features (6)</Typography>
          <Typography>#todo (5)</Typography>
          <Typography>#test (3)</Typography>
          <Typography>#france (2)</Typography>
          <Typography>#hello (2)</Typography>
          <Typography>#facebook #work #world</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
