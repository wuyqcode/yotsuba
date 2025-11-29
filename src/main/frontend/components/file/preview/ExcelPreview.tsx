import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

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

  if (!thumbnails || thumbnails.length === 0) return null;

  useEffect(() => {
    if (!fileId || !thumbnails || thumbnails.length === 0) return;

    const htmlUrl = `/api/file-resource/${fileId}/thumbnail/${thumbnails[index]}`;

    fetch(htmlUrl)
      .then((res) => res.text())
      .then((text) => setHtmlContent(text))
      .catch(() => setHtmlContent('加载失败'));
  }, [index, fileId, thumbnails]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            border: '1px solid #ccc',
            padding: 2,
            boxSizing: 'border-box',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#999',
              borderRadius: '4px',
              '&:hover': {
                background: '#777',
              },
            },
            '& > *': {
              maxWidth: '100%',
              boxSizing: 'border-box',
            },
          }}>
          <Box
            sx={{
              width: '100%',
              overflow: 'auto',
              '& table': {
                maxWidth: '100%',
                tableLayout: 'auto',
              },
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </Box>
      </Box>

      {thumbnails.length > 1 && (
        <Box
          ref={thumbsRef}
          sx={{
            height: '80px',
            minHeight: '80px',
            maxHeight: '80px',
            display: 'flex',
            gap: 1,
            px: 2,
            py: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            borderTop: '1px solid #ccc',
            bgcolor: 'background.default',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#999',
              borderRadius: '3px',
              '&:hover': {
                background: '#777',
              },
            },
          }}>
          {thumbnails.map((t, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)}
              sx={{
                flexShrink: 0,
                width: '60px',
                height: '60px',
                border: i === index ? '3px solid #2196f3' : '2px solid gray',
                borderRadius: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: i === index ? '#2196f3' : '#999',
                },
              }}>
              <Box sx={{ fontSize: '1.2rem', fontWeight: 600, color: 'text.secondary' }}>
                {i + 1}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

