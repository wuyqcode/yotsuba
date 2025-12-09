import { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAuth } from 'Frontend/utils/auth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UserSettingsModal from './UserSettingsModal';

export default function HeaderUserMenu() {
  const { state } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const profilePictureUrl = state.user?.profilePicture
    ? `data:image;base64,${btoa(
        state.user.profilePicture.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), '')
      )}`
    : undefined;

  const openProfileModal = () => {
    setModalOpen(true);
  };

  const closeProfileModal = () => setModalOpen(false);

  return (
    <Box sx={{ position: 'relative' }}>
      {state.user ? (
        <>
          <Box
            onClick={openProfileModal}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 3px 12px rgba(0,0,0,0.12)',
              '&:hover': {
                background: 'rgba(255,255,255,0.35)',
                transform: 'scale(1.04)',
              },
            }}>
            <img
              src={profilePictureUrl || ''}
              alt="profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
          <UserSettingsModal open={modalOpen} onClose={closeProfileModal} />
        </>
      ) : (
        <Box
          onClick={() => navigate('/login')}
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.3)',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 3px 12px rgba(0,0,0,0.12)',
            '&:hover': {
              background: 'rgba(255,255,255,0.35)',
              transform: 'scale(1.04)',
            },
          }}>
          <AccountCircleIcon fontSize="large" sx={{ color: 'rgba(0,0,0,0.75)' }} />
        </Box>
      )}
    </Box>
  );
}