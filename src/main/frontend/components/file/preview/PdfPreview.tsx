import { ExternalLinkIcon, PdfIcon } from '../../ui/Icons';

interface PdfPreviewProps {
  previewUrl: string;
  filename?: string;
}

export default function PdfPreview({ previewUrl, filename }: PdfPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="card w-full max-w-[400px] border border-base-300 bg-base-100 text-center shadow-xl">
        <div className="card-body items-center gap-4">
          <PdfIcon className="h-20 w-20 text-error/80" />
          <h3 className="text-xl font-medium">PDF 文件</h3>
        {filename && (
          <p className="max-w-full truncate text-sm text-base-content/60">
            {filename}
          </p>
        )}
        <a
          href={previewUrl}
          target="_blank"
          className="btn btn-primary mt-2"
          rel="noreferrer">
          <ExternalLinkIcon className="h-4 w-4" />
          在新窗口打开
        </a>
        </div>
      </div>
    </div>
  );
}
