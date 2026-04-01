import { useState } from 'react';

interface ImagePreviewProps {
  previewUrl: string;
  filename?: string;
}

export default function ImagePreview({ previewUrl, filename }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center box-border p-2 sm:p-4 md:p-6">
      {loading && (
        <span className="loading loading-spinner loading-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      {error ? (
        <div className="p-3 text-center text-base-content/60">
          图片加载失败
        </div>
      ) : (
        <img
          src={previewUrl}
          alt={filename || ''}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
}
