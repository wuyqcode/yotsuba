import React from "react";
import { Box, Typography } from "@mui/material";

interface ScrollSectionProps<T> {
  title?: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function ScrollSection<T>({ title, items, renderItem }: ScrollSectionProps<T>) {
  return (
    <>
      {title && (
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 2, mt: 5, letterSpacing: 0.5, ml: 2 }}
        >
          {title}
        </Typography>
      )}

      <Box
        sx={{
          position: "relative",
          display: "flex",
          gap: 2,
          overflowX: "auto", // ✅ 仍然可滚轮、触屏滑动
          pb: 1,
          pl: 2,
          pr: 2,
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "none",
          scrollBehavior: "smooth", // ✅ 平滑滚动
          userSelect: "none",

          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.25)",
            borderRadius: 3,
          },
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 40,
            pointerEvents: "none",
            zIndex: 1,
          },
          "&::before": { left: 0, background: "linear-gradient(to right, white, transparent)" },
          "&::after": { right: 0, background: "linear-gradient(to left, white, transparent)" },
        }}
      >
        {items.map((item, idx) => (
          <Box key={idx} sx={{ flex: "0 0 auto" }}>
            {renderItem(item)}
          </Box>
        ))}
      </Box>
    </>
  );
}

export default ScrollSection;