import { useEffect, Suspense } from 'react';
import { useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { Outlet, ScrollRestoration } from 'react-router';
import AppHeader from 'Frontend/components/AppHeader';
import { GlobalAudioPlayer } from 'Frontend/features/music/components/GlobalAudioPlayer';

export default function MainLayout() {
  const currentTitle = useViewConfig()?.title ?? '';

  useEffect(() => {
    document.title = currentTitle;
  }, [currentTitle]);

  return (
    <>
      {/* header */}
      <AppHeader />

      {/* content */}
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>

      {/* 全局音频播放器 */}
      <GlobalAudioPlayer />

      <ScrollRestoration />
    </>
  );
}
