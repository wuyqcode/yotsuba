import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from 'react-router';
import { createMenuItems } from '@vaadin/hilla-file-router/runtime.js';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { ClickAwayListener } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface MyMenuDetail {
  detail?: string;
}

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'HomeIcon':
      return <HomeIcon fontSize="small" />;
    case 'DescriptionIcon':
      return <DescriptionIcon fontSize="small" />;
    default:
      return <HelpOutlineIcon fontSize="small" />;
  }
};

const Navigation = styled('nav')(({ theme }) => ({
  '& ul': {
    padding: 0,
    margin: 0,
    listStyle: 'none',
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  '& li': {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
  '& li > button': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'inherit',
    font: 'inherit',
    textDecoration: 'none',
    padding: theme.spacing(0.75, 1.5),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid transparent',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.grey[50],
      borderColor: theme.palette.grey[100],
    },
    '&:focus-visible': {
      outline: '3px solid rgba(25, 118, 210, 0.5)',
    },
  },
}));

export default function HeaderNavBar() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      console.log('[MenuToggle] open ->', next);
      return next;
    });
  };
  const handleClose = () => setOpen(false);

  return (
    <Navigation>
      <ul>
        <li>
          <ButtonBase
            ref={anchorRef}
            aria-haspopup
            aria-expanded={open ? 'true' : undefined}
            aria-controls={open ? 'menu-popper' : undefined}
            onClick={handleToggle}>
            Menu
            <KeyboardArrowDownRounded
              sx={{
                ml: 0.5,
                fontSize: 18,
                transition: 'transform .2s ease',
                transform: open ? 'rotate(-180deg)' : 'rotate(0)',
              }}
            />
          </ButtonBase>

          <Popper
            id="menu-popper"
            open={open}
            anchorEl={anchorRef.current}
            transition
            placement="bottom-start"
            style={{ zIndex: 1200, pointerEvents: open ? 'auto' : 'none' }}>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 1,
                    minWidth: 300,
                    borderColor: 'grey.200',
                    bgcolor: 'background.paper',
                    boxShadow: '0px 16px 20px rgba(170,180,190,0.3)',
                    p: 2,
                  }}>
                  <ClickAwayListener
                    onClickAway={(event) => {
                      if (!anchorRef.current?.contains(event.target as Node)) {
                        handleClose();
                      }
                    }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}>
                      {createMenuItems().map((item) => (
                        <Box
                          key={item.title}
                          component="button"
                          onClick={() => {
                            navigate(item.to);
                            handleClose();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            textAlign: 'left',
                            gap: '8px',
                            background: location.pathname === item.to ? 'hsl(210, 100%, 90%)' : 'transparent',
                            border: location.pathname === item.to ? '1px solid #90caf9' : '1px solid transparent',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              location.pathname === item.to ? 'hsl(210, 100%, 90%)' : '#f9f9f9';
                            (e.currentTarget as HTMLElement).style.borderColor =
                              location.pathname === item.to ? '#90caf9' : '#eee';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              location.pathname === item.to ? 'hsl(210, 100%, 90%)' : 'transparent';
                            (e.currentTarget as HTMLElement).style.borderColor =
                              location.pathname === item.to ? '#90caf9' : 'transparent';
                          }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {renderIcon(item.icon)}
                            </Typography>
                          </Box>
                          {item.title}
                        </Box>
                      ))}
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Fade>
            )}
          </Popper>
        </li>
      </ul>
    </Navigation>
  );
}