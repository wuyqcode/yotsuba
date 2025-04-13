import { Box, BoxProps } from '@mui/material';

export const GlassBox = ({ sx, ...props }: BoxProps) => {
  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '10px',
        color: 'black',
        ...sx,
      }}
      {...props}
    />
  );
};
