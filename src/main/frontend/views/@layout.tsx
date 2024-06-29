import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import {
  createMenuItems,
  useViewConfig
} from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import {
  AppLayout,
  DrawerToggle,
  Icon,
  SideNav,
  SideNavItem
} from '@vaadin/react-components';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DensityMediumTwoToneIcon from '@mui/icons-material/DensityMediumTwoTone';
import FormatAlignJustifyTwoToneIcon from '@mui/icons-material/FormatAlignJustifyTwoTone';
import { Avatar } from '@vaadin/react-components/Avatar.js';
import { Button } from '@vaadin/react-components/Button.js';
import { useAuth } from 'Frontend/util/auth.js';
import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Padding } from '@mui/icons-material';

const defaultTitle = document.title;
const documentTitleSignal = signal('');
effect(() => {
  document.title = documentTitleSignal.value;
});

// Publish for Vaadin to use
(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

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
    <AppLayout primarySection="drawer">
      <Box sx={{ flexGrow: 1 }} slot="drawer">
        <DrawerToggle>
          <DensityMediumTwoToneIcon fontSize="medium" />
        </DrawerToggle>
        <SideNav onNavigate={({ path }) => navigate(path!)} location={location}>
          {createMenuItems().map(({ to, title, icon }) => (
            <SideNavItem path={to} key={to}>
              {icon ? <Icon src={icon} slot="prefix"></Icon> : <></>}
              {title}
            </SideNavItem>
          ))}
        </SideNav>
      </Box>

      <Box sx={{ flexGrow: 1 }} slot="navbar">
        <Toolbar
          disableGutters
          variant="dense"
          sx={{ padding: '0 16px 0 0', minHeight: '0' }}
        >
          <DrawerToggle>
            <DensityMediumTwoToneIcon fontSize="medium" />
          </DrawerToggle>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          {state.user ? (
            <>
              <div className="flex items-center" onClick={handleClick}>
                <AccountCircle />
              </div>
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
            <Link to="/login">Sign in</Link>
          )}
        </Toolbar>
      </Box>
      <Suspense>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}
