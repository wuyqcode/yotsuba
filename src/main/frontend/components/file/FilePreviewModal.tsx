import { useEffect } from 'react';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import { getFileType } from './utils/fileTypeUtils';
import ImagePreview from './preview/ImagePreview';
import VideoPreview from './preview/VideoPreview';
import AudioPreview from './preview/AudioPreview';
import TextPreview from './preview/TextPreview';
import PdfPreview from './preview/PdfPreview';
import PptPreview from './preview/PptPreview';
import ExcelPreview from './preview/ExcelPreview';
import { CloseIcon, DownloadIcon, LinkIcon } from '../ui/Icons';

export default function FilePreviewModal({
  open,
  file,
  previewUrl,
  onClose,
  loadingText,
  textContent,
}: {
  open: boolean;
  file: FileResourceDto | null;
  previewUrl: string | null;
  onClose: () => void;
  loadingText: boolean;
  textContent: string | null;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open || !file || !previewUrl) return null;

  const fileType = getFileType(file);

  return (
    <div className="fixed inset-0 z-[1400] bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute left-1/2 top-1/2 flex h-[95%] w-[95%] max-h-[90vh] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl md:h-[85%] md:w-[85%] lg:h-[80%] lg:w-[80%]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-3 py-2">
          <div className="mr-3 min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{file.filename || '-'}</div>
            {file.contentType && <div className="mt-0.5 text-[11px] text-base-content/60">{file.contentType}</div>}
          </div>

          <div className="flex items-center gap-1">
            {file.reference?.referenceId?.id && (
              <a
                className="btn btn-ghost btn-sm btn-circle"
                href={`/note/WIKI/${file.reference.referenceId.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}>
                <LinkIcon className="h-4 w-4" />
              </a>
            )}
            <a className="btn btn-ghost btn-sm btn-circle" href={previewUrl} target="_blank" download>
              <DownloadIcon className="h-4 w-4" />
            </a>
            <button type="button" className="btn btn-ghost btn-sm btn-circle hover:bg-error/15 hover:text-error" onClick={onClose}>
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            {fileType === 'image' && <ImagePreview previewUrl={previewUrl} filename={file.filename} />}
            {fileType === 'video' && <VideoPreview previewUrl={previewUrl} />}
            {fileType === 'audio' && <AudioPreview previewUrl={previewUrl} />}
            {fileType === 'text' && <TextPreview loadingText={loadingText} textContent={textContent} />}
            {fileType === 'pdf' && <PdfPreview previewUrl={previewUrl} filename={file.filename} />}
            {fileType === 'ppt' && file.thumbnailIndexList && file.thumbnailIndexList.length > 0 && (
              <PptPreview fileId={file.id?.id} thumbnails={file.thumbnailIndexList} />
            )}
            {fileType === 'excel' && file.thumbnailIndexList && file.thumbnailIndexList.length > 0 && (
              <ExcelPreview fileId={file.id?.id} thumbnails={file.thumbnailIndexList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
