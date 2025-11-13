import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTagStore } from '../../hooks/useTagStore';

export default function TagList() {
  const selectedTags = useTagStore((s) => s.selectedTags);
  const toggleSelectedTag = useTagStore((s) => s.toggleSelectedTag);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {selectedTags.map((tag) => (
        <Box
          key={tag.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1,
            py: 0.3,
            borderRadius: 20,
            height: 36,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Box
            component="img"
            src={'/default-tag.png'}
            alt={tag.name}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', maxWidth: 90 }}>
            #{tag.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => toggleSelectedTag(tag)}
            sx={{
              p: 0.2,
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}