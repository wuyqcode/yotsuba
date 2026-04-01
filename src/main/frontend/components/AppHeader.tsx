import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import HeaderNavBar from 'Frontend/components/HeaderNavBar';
import { useMusicPlayerStore } from 'Frontend/features/music/hooks/useMusicPlayerStore';
import { useMusicPlayer } from 'Frontend/features/music/hooks/useMusicPlayer';
import HeaderUserMenu from './HeaderUserMenu';
import CommentNotificationPanel from '../features/note/components/CommentNotificationPanel';
import { useCommentNotificationStore } from 'Frontend/features/note/hooks/useCommentNotificationStore';
import { BellIcon, PauseIcon, PlayIcon, SkipNextIcon, SkipPreviousIcon } from './ui/Icons';

const HEIGHT = 50;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(max-width: 900px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia('(max-width: 900px)');
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(media.matches);
    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export default function AppHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openNotification, setOpenNotification] = useState(false);
  const unreadCount = useCommentNotificationStore((s) => s.unreadCount);

  const currentSong = useMusicPlayerStore((s) => s.currentSong);
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const currentIndex = useMusicPlayerStore((s) => s.currentIndex);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const currentCover = useMusicPlayerStore((s) => s.currentCover);

  const { togglePlay: togglePlayFromHook, nextSong, previousSong } = useMusicPlayer();

  return (
    <header
      className="sticky top-0 z-[1300] flex w-full items-center justify-between border border-white/50 bg-white/85 shadow-sm backdrop-blur"
      style={{ height: HEIGHT, padding: isMobile ? '0 8px' : '0 16px' }}>
      <div className="flex items-center gap-2">
        <img
          src="images/icon.png"
          alt="Yotsuba"
          className="h-10 w-10 cursor-pointer rounded-2xl object-cover"
          onClick={() => navigate('/note')}
        />
        <HeaderNavBar />
      </div>

      {currentSong && (
        <button
          type="button"
          onClick={() => navigate('/music')}
          className={[
            'flex items-center justify-center gap-2 rounded-full border border-base-200/70 bg-base-100/80 px-2 py-1 text-left shadow-sm',
            isMobile
              ? 'absolute left-1/2 max-w-[calc(100%-90px)] -translate-x-1/2'
              : 'mx-2 max-w-[400px] flex-1',
          ].join(' ')}>
          <img
            src={
              currentCover ||
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAxMTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo='
            }
            alt={currentSong.name}
            className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} shrink-0 rounded-xl object-cover`}
          />
          <div className={`min-w-0 ${isMobile ? 'max-w-[120px]' : 'flex-1'}`}>
            <span
              className={[
                'block overflow-hidden whitespace-nowrap font-semibold text-base-content',
                isMobile ? 'text-[0.7rem]' : 'text-xs',
                !isMobile ? 'text-ellipsis' : '',
                isMobile && currentSong.name.length > 8 ? 'animate-[marquee_8s_linear_infinite]' : '',
              ].join(' ')}>
              {isMobile && currentSong.name.length > 8 ? `${currentSong.name} • ${currentSong.name}` : currentSong.name}
            </span>
            {!isMobile && (
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-base-content/60">
                {Array.isArray(currentSong.artist) ? currentSong.artist.join(' / ') : currentSong.artist}
              </span>
            )}
          </div>
          <div className={`flex shrink-0 items-center ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                previousSong();
              }}
              disabled={currentIndex <= 0}>
              <SkipPreviousIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayFromHook();
              }}>
              {isPlaying ? (
                <PauseIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              ) : (
                <PlayIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                nextSong();
              }}
              disabled={currentIndex >= currentPlaylist.length - 1}>
              <SkipNextIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
          </div>
        </button>
      )}

      <div className={`flex items-center ${isMobile ? 'relative z-[1]' : ''}`}>
        <button
          type="button"
          onClick={() => setOpenNotification((prev) => !prev)}
          className="btn btn-ghost btn-circle btn-sm relative mr-1">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="badge badge-error badge-sm absolute -right-1 -top-1 min-w-5 border-0 px-1 text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <CommentNotificationPanel open={openNotification} onClose={() => setOpenNotification(false)} />
        <HeaderUserMenu />
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  );
}
