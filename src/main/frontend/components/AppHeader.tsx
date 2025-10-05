import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import { Icon } from '@vaadin/react-components';
import { useNavigate } from 'react-router';
import { useAuth } from 'Frontend/util/auth.js';
import HeaderNavBar from './HeaderNavBar';

const HEIGHT = 50;

export default function AppHeader() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const profilePictureUrl =
    state.user &&
    `data:image;base64,${btoa(
      state.user.profilePicture.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), '')
    )}`;

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        padding: '0 16px',
        width: '100%',
        height: HEIGHT,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1300,
        background: 'rgba(255, 255, 255, 0.87)',
        boxShadow: '1',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
      {/* left: menu + logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CardMedia
          component="img"
          src="images/icon.png"
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => navigate('/post')}
        />

        <HeaderNavBar />
      </Box>

      {/* right: avatar */}
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
  );
}
