import { useState } from 'react';
import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';
import ReferenceCategory from 'Frontend/generated/io/github/dutianze/yotsuba/shared/common/ReferenceCategory';
import { AudioIcon, EyeIcon, FileIcon, ImageIcon, LinkIcon, MusicIcon, PdfIcon, SlidesIcon, TableIcon, TextIcon, TrashIcon, VideoIcon } from '../ui/Icons';
import { getFileType, type FileType } from './utils/fileTypeUtils';

interface FileCardProps {
  file: FileResourceDto;
  fileUrl: string | null;
  handlePreview: (file: FileResourceDto) => void;
  handleDelete: (file: FileResourceDto) => void;
  formatFileSize: (bytes: number | undefined) => string;
  formatDate: (dateString: string | undefined) => string;
}

const fileTypeConfig: Record<
  FileType,
  {
    icon: React.ReactNode;
    hoverIcon?: React.ReactNode;
    background: string;
    showThumbnail?: boolean;
  }
> = {
  image: {
    icon: <ImageIcon className="h-12 w-12 text-white" />,
    background: 'linear-gradient(135deg, #6B6B6B, #434343)',
    showThumbnail: true,
  },
  video: {
    icon: <VideoIcon className="h-16 w-16 text-white/70" />,
    hoverIcon: <EyeIcon className="h-14 w-14 text-white" />,
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  audio: {
    icon: <AudioIcon className="h-16 w-16 text-white/70" />,
    hoverIcon: <MusicIcon className="h-14 w-14 text-white" />,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  ppt: {
    icon: <SlidesIcon className="h-16 w-16 text-white/80" />,
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    showThumbnail: true,
  },
  excel: {
    icon: <TableIcon className="h-16 w-16 text-white/80" />,
    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    showThumbnail: true,
  },
  pdf: {
    icon: <PdfIcon className="h-16 w-16 text-white/80" />,
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  },
  text: {
    icon: <TextIcon className="h-16 w-16 text-black/50" />,
    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  },
  other: {
    icon: <FileIcon className="h-16 w-16 text-white/80" />,
    background: 'linear-gradient(135deg, #6B6B6B, #434343)',
  },
};

export default function FileCard({
  file,
  fileUrl,
  handlePreview,
  handleDelete,
  formatFileSize,
  formatDate,
}: FileCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileType = getFileType(file);
  const config = fileTypeConfig[fileType];
  const hasThumbnail = config.showThumbnail && file.thumbnailIndexList && file.thumbnailIndexList.length > 0;
  const thumbnailUrl =
    hasThumbnail && file.id?.id
      ? `/api/file-resource/${file.id.id}/thumbnail/${file.thumbnailIndexList[0]}`
      : null;

  const displayImageUrl = fileType === 'image' ? fileUrl : thumbnailUrl;
  const shouldShowImage = displayImageUrl && !imageError && (fileType === 'image' || hasThumbnail);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => handlePreview(file)}>
      <div className="relative aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
        {file.reference?.referenceId?.id && (
          <a
            href={
              file.reference.referenceCategory === ReferenceCategory.TAG_COVER
                ? `/note?tagId=${file.reference.referenceId.id}`
                : `/note/WIKI/${file.reference.referenceId.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-content shadow">
            <LinkIcon className="h-3.5 w-3.5" />
          </a>
        )}

        {shouldShowImage ? (
          <img
            src={displayImageUrl}
            alt={file.filename || ''}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center transition duration-300 hover:scale-105"
            style={{ background: config.background }}>
            {config.icon}
            {config.hoverIcon && hovered && <div className="absolute inset-0 grid place-items-center">{config.hoverIcon}</div>}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-3">
          <div className="min-w-0">
            <div className="max-w-[150px] truncate text-xs font-semibold text-white drop-shadow">{file.filename}</div>
          </div>

          <div className={`flex items-center gap-1 transition ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              type="button"
              title="预览"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(file);
              }}
              className="btn btn-ghost btn-xs btn-circle text-white hover:bg-white/15">
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="删除"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(file);
              }}
              className="btn btn-ghost btn-xs btn-circle text-white hover:bg-white/15">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5 text-xs text-base-content/60">
        <span className="mr-2">{formatFileSize(file.size)}</span>
        <span>{formatDate(file.createdAt)}</span>
      </div>
    </div>
  );
}
