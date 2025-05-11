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
import { createMenuItems } from '@vaadin/hilla-file-router/runtime.js';
import { Icon } from '@vaadin/react-components';
import { useAuth } from 'Frontend/util/auth.js';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { GlassBox } from 'Frontend/components/GlassBox';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'HomeIcon':
      return <HomeIcon />;
    case 'DescriptionIcon':
      return <DescriptionIcon />;
    default:
      return <HelpOutlineIcon />;
  }
};

export default function MainLayout() {
  const currentTitle = useViewConfig()?.title ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    document.title = currentTitle;
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
    <Box>
      {/* header */}
      <GlassBox
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '50px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1300,
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
            onClick={() => navigate('/post')}
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
      </GlassBox>

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
      <GlassBox
        sx={{
          position: 'fixed',
          top: '50px',
          left: 0,
          width: 200,
          height: 'calc(100% - 50px)',
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
      </GlassBox>

      {/* content */}
      <Box component="main">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
