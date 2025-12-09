import { Button, IconButton, styled } from '@mui/material';

export const ModeBtn = styled(IconButton)(({ theme }) => ({
  padding: 6,
  borderRadius: 6,
  color: theme.palette.grey[700],
  transition: '0.15s ease',

  '&.active': {
    backgroundColor: 'rgba(26,115,232,0.12)',
    border: '1px solid rgba(26,115,232,0.3)',
    color: theme.palette.primary.main,
  },

  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
}));

export const SaveBtn = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 60,
  height: 32,
  padding: '2px 10px',
  fontSize: '0.8rem',
  borderRadius: 6,
}));

export const TitleBox = styled('div')<{ focused: boolean; readonly: boolean }>(({ theme, focused, readonly }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 6px',
  borderRadius: 4,
  border: focused ? '2px solid #1a73e8' : '1px solid transparent',
  transition: '0.15s ease',
  overflow: 'hidden',

  ...(readonly && {
    cursor: 'pointer',
    '&:hover': {
      border: '1px solid #dadce0',
    },
  }),
}));

export const TitleInput = styled('input')<{ readonlyMode: boolean }>(({ readonlyMode }) => ({
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: 0,
  margin: 0,
  whiteSpace: 'nowrap',

  ...(readonlyMode && {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  ...(!readonlyMode && {
    overflowX: 'auto',
  }),
}));
