import { useEffect, useRef, useState } from 'react';

interface ExcelPreviewProps {
  fileId?: string;
  thumbnails: Array<number | undefined>;
}

export default function ExcelPreview({ fileId, thumbnails }: ExcelPreviewProps) {
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (!thumbsRef.current) return;
    const thumb = thumbsRef.current.children[index] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [index]);

  useEffect(() => {
    if (!fileId || !thumbnails || thumbnails.length === 0) return;

    const htmlUrl = `/api/file-resource/${fileId}/thumbnail/${thumbnails[index]}`;

    fetch(htmlUrl)
      .then((res) => res.text())
      .then((text) => setHtmlContent(text))
      .catch(() => setHtmlContent('加载失败'));
  }, [index, fileId, thumbnails]);

  if (!thumbnails || thumbnails.length === 0) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto border border-base-300 p-4">
          <div
            className="w-full overflow-auto [&>*]:max-w-full [&_table]:max-w-full [&_table]:table-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>

      {thumbnails.length > 1 && (
        <div ref={thumbsRef} className="flex h-20 min-h-20 max-h-20 gap-2 overflow-x-auto border-t border-base-300 bg-base-200 px-4 py-2">
          {thumbnails.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={[
                'flex h-15 w-15 shrink-0 items-center justify-center rounded-xl border-2 bg-base-100 font-semibold text-base-content/60 transition',
                i === index ? 'border-primary' : 'border-base-300 hover:border-base-content/30',
              ].join(' ')}>
              {t ? i + 1 : '-'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
