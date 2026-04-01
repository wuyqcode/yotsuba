import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from 'Frontend/utils/auth';
import UserSettingsModal from './UserSettingsModal';
import { UserIcon } from './ui/Icons';

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
    <div className="relative">
      {state.user ? (
        <>
          <button
            onClick={openProfileModal}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/35 shadow-lg backdrop-blur transition hover:scale-[1.04] hover:bg-white/50">
            <img
              src={profilePictureUrl || ''}
              alt="profile"
              className="h-full w-full object-cover"
            />
          </button>
          <UserSettingsModal open={modalOpen} onClose={closeProfileModal} />
        </>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/35 text-base-content shadow-lg backdrop-blur transition hover:scale-[1.04] hover:bg-white/50">
          <UserIcon className="h-6 w-6 text-base-content/80" />
        </button>
      )}
    </div>
  );
}
