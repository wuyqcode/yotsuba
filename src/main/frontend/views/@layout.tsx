import React, { useState, useEffect, Suspense } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import { useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import { useLocation, useNavigate } from 'react-router-dom';
import { createMenuItems } from '@vaadin/hilla-file-router/runtime.js';
import { Icon } from '@vaadin/react-components';
import { useAuth } from 'Frontend/util/auth.js';

const defaultTitle = document.title;
const documentTitleSignal = signal('');
effect(() => {
  document.title = documentTitleSignal.value;
});

// Publish for Vaadin to use
(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'HomeIcon':
      return <HomeIcon />;
    case 'DescriptionIcon':
      return <DescriptionIcon />;
    default:
      return null;
  }
};

export default function MainLayout() {
  const currentTitle = useViewConfig()?.title ?? defaultTitle;
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(true);
  const open = Boolean(anchorEl);

  const history = Array.from(
    { length: 50 },
    (_, index) => `History Item ${index + 1}`
  );

  useEffect(() => {
    documentTitleSignal.value = currentTitle;
  }, [currentTitle]);

  const toggleNav = () => {
    setNavOpen((pre) => !pre);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const { state, logout } = useAuth();
  const profilePictureUrl =
    state.user &&
    `data:image;base64,${btoa(
      state.user.profilePicture.reduce(
        (str, n) => str + String.fromCharCode((n + 256) % 256),
        ''
      )
    )}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5'
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'black',
          boxShadow: 'none',
          borderBottom: '1px solid #ddd',
          height: '50px'
        }}
      >
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 2,
              '&:focus': {
                outline: 'none'
              }
            }}
            onClick={toggleNav}
          >
            <MenuIcon />
          </IconButton>
          <EditIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ChatGPT 4.0
          </Typography>
          <Avatar sx={{ ml: 2, width: '32px', height: '32px' }}>
            {state.user ? (
              <Box onClick={handleClick}>
                <img
                  src={profilePictureUrl}
                  alt="Notification Icon"
                  style={{ width: 24, height: 24 }}
                />
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                >
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Button
                      onClick={async () => {
                        await logout();
                        document.location.reload();
                      }}
                    >
                      Sign out
                    </Button>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box onClick={() => navigate('/login')}>
                <Icon icon={'vaadin:user'} />
              </Box>
            )}
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        sx={{ display: 'flex', flexGrow: 1, mt: '50px', overflow: 'hidden' }}
      >
        <List
          sx={{
            flexShrink: 0,
            overflowX: 'hidden',
            backgroundColor: '#f5f5f5',
            transition: 'width 0.1s ease, visibility 0.1s ease',
            width: navOpen ? '200px' : '0',
            visibility: navOpen ? 'visible' : 'hidden',
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          {createMenuItems().map(({ to, title, icon }) => (
            <ListItem key={title} onClick={() => navigate(to)}>
              <ListItemIcon>{renderIcon(icon)}</ListItemIcon>
              <ListItemText primary={title} />
            </ListItem>
          ))}
          {history.map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            margin: '16px',
            padding: '16px',
            overflow: 'auto',
            borderRadius: '8px',
            '&::-webkit-scrollbar': {
              width: '20px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundImage: `url('https://i.ibb.co/1RHr40z/248599.png')`,
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundSize: '20px'
            }
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Paper>
      </Box>
    </Box>
  );
}
