import { Box, BoxProps } from '@mui/material';

export const GlassBox = ({ sx, ...props }: BoxProps) => {
  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 0.87)',
        boxShadow: '1',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        p: 1,
        ...sx,
      }}
      {...props}
    />
  );
};
