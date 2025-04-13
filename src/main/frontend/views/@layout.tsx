import { useState, useEffect, Suspense } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  CardMedia,
  ListItemButton,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import { useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import { createMenuItems } from '@vaadin/hilla-file-router/runtime.js';
import { Icon } from '@vaadin/react-components';
import { useAuth } from 'Frontend/util/auth.js';
import { Outlet, useLocation, useNavigate } from 'react-router';

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
      state.user.profilePicture.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), '')
    )}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        gap: '3px',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.41), rgba(0, 0, 0, 0.41)), url("/images/homepage.jpeg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        },
      }}>
      {/* header */}
      <Box
        component="header"
        sx={{
          height: '50px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          borderRadius: '10px',
          zIndex: 1300,
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'black',
        }}>
        {/* leat LOGO + menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleNav}
            sx={{ '&:focus': { outline: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <CardMedia
            component="img"
            src="images/icon.png"
            sx={{ width: 40, height: 40, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
        </Box>

        {/* right Avatar or Icon */}
        {state.user ? (
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={handleClick}>
              <img src={profilePictureUrl} alt="profile" style={{ width: 24, height: 24 }} />
            </Avatar>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem
                onClick={async () => {
                  await logout();
                  document.location.reload();
                }}>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Avatar sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={() => navigate('/login')}>
            <Icon icon="vaadin:user" />
          </Avatar>
        )}
      </Box>

      {/* navbar mask */}
      {navOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: '0',
            zIndex: 1100,
          }}
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* navbar */}
      <Box
        sx={{
          position: 'fixed',
          top: '50px',
          left: 0,
          width: 200,
          height: 'calc(100% - 50px)',
          background: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxSizing: 'border-box',
          marginTop: '5px',
          transition: 'transform 0.3s ease-in-out',
          transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
          zIndex: 1201,
        }}>
        <List>
          {createMenuItems().map(({ to, title, icon }) => (
            <ListItemButton
              key={title}
              onClick={() => {
                navigate(to);
                setNavOpen(false);
              }}>
              <ListItemIcon>{renderIcon(icon)}</ListItemIcon>
              <ListItemText primary={title} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
        }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
