import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../ui/Icons';

interface PptPreviewProps {
  fileId?: string;
  thumbnails: Array<number | undefined>;
}

export default function PptPreview({ fileId, thumbnails }: PptPreviewProps) {
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thumbsRef.current) return;
    const thumb = thumbsRef.current.children[index] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [index]);

  if (!thumbnails || thumbnails.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % thumbnails.length);
  const prev = () => setIndex((i) => (i - 1 + thumbnails.length) % thumbnails.length);
  const url = `/api/file-resource/${fileId}/thumbnail/${thumbnails[index]}`;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden select-none">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
        <img src={url} alt="slide" className="max-h-full max-w-full object-contain" />

        {thumbnails.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="btn btn-circle btn-md absolute left-5 top-1/2 -translate-y-1/2 border-white/30 bg-white/60 hover:bg-white/90">
              <ChevronLeftIcon className="h-7 w-7" />
            </button>

            <button
              type="button"
              onClick={next}
              className="btn btn-circle btn-md absolute right-5 top-1/2 -translate-y-1/2 border-white/30 bg-white/60 hover:bg-white/90">
              <ChevronRightIcon className="h-7 w-7" />
            </button>
          </>
        )}
      </div>

      {thumbnails.length > 1 && (
        <div ref={thumbsRef} className="flex h-20 min-h-20 max-h-20 gap-2 overflow-x-auto border-t border-base-300 bg-base-200 px-4 py-2">
          {thumbnails.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={[
                'h-15 w-15 shrink-0 overflow-hidden rounded-xl border-2 transition',
                i === index ? 'border-primary' : 'border-base-300 hover:border-base-content/30',
              ].join(' ')}>
              <img
                src={`/api/file-resource/${fileId}/thumbnail/${t}`}
                alt={`slide-${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
