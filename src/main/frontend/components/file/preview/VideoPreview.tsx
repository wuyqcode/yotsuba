interface VideoPreviewProps {
  previewUrl: string;
}

export default function VideoPreview({ previewUrl }: VideoPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <video
        src={previewUrl}
        controls
        className="max-h-full max-w-full rounded-xl shadow-lg">
        您的浏览器不支持视频播放
      </video>
    </div>
  );
}
