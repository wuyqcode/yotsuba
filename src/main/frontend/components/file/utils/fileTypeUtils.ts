import FileResourceDto from 'Frontend/generated/io/github/dutianze/yotsuba/file/dto/FileResourceDto';

export type FileType = 'image' | 'video' | 'audio' | 'ppt' | 'excel' | 'pdf' | 'text' | 'other';

export function getFileType(file: FileResourceDto): FileType {
  const contentType = file.contentType?.toLowerCase() || '';
  const filename = file.filename?.toLowerCase() || '';

  // 图片
  if (contentType.startsWith('image/')) {
    return 'image';
  }

  // 视频
  if (contentType.startsWith('video/')) {
    return 'video';
  }

  // 音频
  if (contentType.startsWith('audio/')) {
    return 'audio';
  }

  // PPT
  if (
    contentType.includes('presentation') ||
    contentType === 'application/vnd.ms-powerpoint' ||
    filename.endsWith('.ppt') ||
    filename.endsWith('.pptx')
  ) {
    return 'ppt';
  }

  // Excel
  if (
    contentType === 'application/vnd.ms-excel' ||
    contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    filename.endsWith('.xls') ||
    filename.endsWith('.xlsx')
  ) {
    return 'excel';
  }

  // PDF
  if (contentType === 'application/pdf' || filename.endsWith('.pdf')) {
    return 'pdf';
  }

  // 文本
  if (contentType.startsWith('text/')) {
    return 'text';
  }

  return 'other';
}

export function isImage(file: FileResourceDto): boolean {
  return getFileType(file) === 'image';
}

export function isVideo(file: FileResourceDto): boolean {
  return getFileType(file) === 'video';
}

export function isAudio(file: FileResourceDto): boolean {
  return getFileType(file) === 'audio';
}

export function isPpt(file: FileResourceDto): boolean {
  return getFileType(file) === 'ppt';
}

export function isExcel(file: FileResourceDto): boolean {
  return getFileType(file) === 'excel';
}

export function isPdf(file: FileResourceDto): boolean {
  return getFileType(file) === 'pdf';
}

export function isText(file: FileResourceDto): boolean {
  return getFileType(file) === 'text';
}

