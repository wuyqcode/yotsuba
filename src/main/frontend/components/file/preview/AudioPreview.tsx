import { MusicIcon } from '../../ui/Icons';

interface AudioPreviewProps {
  previewUrl: string;
}

export default function AudioPreview({ previewUrl }: AudioPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="card w-full max-w-[500px] border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body items-center gap-6">
          <MusicIcon className="h-16 w-16 text-primary/70" />
          <audio src={previewUrl} controls className="w-full" />
        </div>
      </div>
    </div>
  );
}
