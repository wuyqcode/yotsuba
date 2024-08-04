import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { PostService } from 'Frontend/generated/endpoints';
import { SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const config: ViewConfig = {
  menu: {
    order: 5,
    icon: 'DescriptionIcon'
  },
  title: '文章'
};

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function AdminView() {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event: any, newValue: SetStateAction<number>) => {
    setTabValue(newValue);
  };

  const createPost = async () => {
    const newPostId = await PostService.createPost();
    console.log(newPostId);

    navigate(`/post/${newPostId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
      <Box
        sx={{
          flexGrow: 1,
          height: '100%'
        }}
      >
        <Container>
          <Button variant="contained" color="primary" onClick={createPost}>
            新建文章
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            style={{ marginLeft: '8px' }}
          >
            导入
          </Button>
          <Box sx={{ width: '100%', typography: 'body1', marginTop: '16px' }}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="所有文章" />
              <Tab label="已发布" />
              <Tab label="草稿" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              list
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              已发布的文章
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              草稿文章
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              定时发布的文章
            </TabPanel>
          </Box>
        </Container>
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
