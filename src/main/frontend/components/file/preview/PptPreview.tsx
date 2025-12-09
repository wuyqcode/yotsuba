import { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface PptPreviewProps {
  fileId?: string;
  thumbnails: Array<number | undefined>;
}

function arrowBtn(side: 'left' | 'right') {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 20,
    transform: 'translateY(-50%)',
    bgcolor: 'rgba(255,255,255,0.6)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
  };
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
        overflow: 'hidden',
      }}>
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}>
        <img
          src={url}
          alt="slide"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />

        {thumbnails.length > 1 && (
          <>
            <IconButton onClick={prev} sx={arrowBtn('left')}>
              <ChevronLeftIcon sx={{ fontSize: 48 }} />
            </IconButton>

            <IconButton onClick={next} sx={arrowBtn('right')}>
              <ChevronRightIcon sx={{ fontSize: 48 }} />
            </IconButton>
          </>
        )}
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
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: i === index ? '#2196f3' : '#999',
                },
              }}>
              <img
                src={`/api/file-resource/${fileId}/thumbnail/${t}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

