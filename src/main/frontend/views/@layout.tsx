import { useState, useEffect, Suspense } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button,
  CardMedia,
  Card,
  Drawer
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
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
  const [navOpen, setNavOpen] = useState(false);
  const open = Boolean(anchorEl);

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
        <Toolbar
          variant="dense"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                '&:focus': {
                  outline: 'none'
                }
              }}
              onClick={toggleNav}
            >
              <MenuIcon />
            </IconButton>
            <CardMedia
              component="img"
              height="50"
              image={'images/icon.png'}
              sx={{ width: 40, height: 40 }}
              onClick={() => navigate('/')}
            />
          </Box>
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
        <Drawer
          variant="temporary"
          open={navOpen}
          onClose={toggleNav}
          sx={{
            '& .MuiDrawer-paper': {
              width: '200px',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <List>
            {createMenuItems().map(({ to, title, icon }) => (
              <ListItem
                button
                key={title}
                onClick={() => {
                  navigate(to);
                  toggleNav();
                }}
              >
                <ListItemIcon>{renderIcon(icon)}</ListItemIcon>
                <ListItemText primary={title} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          sx={{
            flexGrow: 1,
            padding: '16px',
            overflow: 'auto',
            borderRadius: '8px'
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
