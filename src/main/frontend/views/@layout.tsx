import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import {
  createMenuItems,
  useViewConfig
} from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import { Icon } from '@vaadin/react-components';
import { useAuth } from 'Frontend/util/auth.js';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const defaultTitle = document.title;
const documentTitleSignal = signal('');
effect(() => {
  document.title = documentTitleSignal.value;
});

// Publish for Vaadin to use
(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

const drawerWidth = 240;

export default function MainLayout() {
  const currentTitle = useViewConfig()?.title ?? defaultTitle;
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  useEffect(() => {
    documentTitleSignal.value = currentTitle;
  }, [currentTitle]);
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
        width: '100%',
        minHeight: '100vh'
      }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List component="nav">
          {createMenuItems().map(({ to, title, icon }) => (
            <ListItemButton key={title} onClick={() => navigate(to)}>
              <ListItemIcon>
                <Icon icon={icon} />
              </ListItemIcon>
              <ListItemText primary={title} />
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1 }} />
          {state.user ? (
            <>
              <ListItemButton onClick={handleClick}>
                <ListItemIcon>
                  <img
                    src={profilePictureUrl}
                    alt="Notification Icon"
                    style={{ width: 24, height: 24 }}
                  />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItemButton>
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
            </>
          ) : (
            <ListItemButton onClick={() => navigate('/login')}>
              <ListItemIcon>
                <Icon icon={'vaadin:user'} />
                {state.user}
              </ListItemIcon>
              <ListItemText primary="Sign in" />
            </ListItemButton>
          )}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'white',
          minHeight: '100%'
        }}
      >
        <Suspense>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
