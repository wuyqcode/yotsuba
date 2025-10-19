import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  CardMedia,
} from "@mui/material";

/**
 * 只包含“上半部分”的布局与背景效果：
 * - 背景图：绝对定位、混合模式、滤镜、mask 渐隐（与你给的 CSS 一致）
 * - Vignette 遮罩：四周压暗，强化可读性
 * - 主体内容：左侧海报 + 右侧标题/简介/按钮
 * - 评分区：位于上半部分底部，居中
 */
export default function HeroWithRatingTop() {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        width: "100vw", // ✅ 全宽
        marginLeft: "calc(50% - 50vw)", // ✅ 防止被 Container 限制
        overflow: "hidden",
        // 提供可调的 CSS 变量（与原 CSS 对齐）
        "--backdrop-filter": "blur(4px) grayscale(80%)",
        "--backdrop-mix-blend-mode": "multiply",
        px: { xs: 2, md: 6 },                    // ✅ 左右稍宽
        pt: { xs: 3, md: 3 },                   // ✅ 顶部内边距更大
        pb: { xs: 4, md: 6 },                   // ✅ 底部平衡视觉
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",                // ✅ 垂直居中内容
      } as React.CSSProperties}
    >

      {/* 背景图层（完全按照你给的写法） */}
      <Box
        component="img"
        alt="backdrop"
        src="https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg"
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: -2,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "var(--backdrop-filter)",
          mixBlendMode: "var(--backdrop-mix-blend-mode)" as any,
          WebkitMaskImage: "linear-gradient(to bottom,#000 80%,#0000)",
          maskImage: "linear-gradient(to bottom,#000 80%,#0000)",
        }}
      />

       {/* 文字区暗幕层（增强对比） */}
       <Box
         sx={{
           position: "absolute",
           inset: 0,
           backgroundColor: "#000000b3", // 半透明黑色
           zIndex: -1,
           WebkitMaskImage:
             "linear-gradient(to bottom, #000 80%, #0000)",
           maskImage: "linear-gradient(to bottom, #000 80%, #0000)",
         }}
       />

      {/* 主体内容（左海报 + 右信息），仅用 flex 实现 */}
      <Box
        sx={{
          position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" }, // ✅ 小屏居中
            flexDirection: { xs: "column", sm: "row" },          // ✅ 小屏上下排列
            textAlign: { xs: "center", sm: "left" },             // ✅ 文字也居中
            gap: { xs: 3, md: 4 },
            color: "white",
             maxWidth: "1100px",
             padding: { xs: "0 40px", md: "0 80px" },   // ✅ 小屏40，大屏80
        }}
      >

        {/* 海报 */}
        <Box sx={{ flex: "0 0 260px" }}>
          <CardMedia
            component="img"
            image="https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg"
            alt="poster"
            sx={{ width: 260, borderRadius: 2, boxShadow: 3 }}
          />
        </Box>

        {/* 右侧信息 */}
        <Box sx={{ flex: "1 1 420px", minWidth: 280 }}>

          <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
            Naruto <Typography component="span">2002</Typography>
          </Typography>

          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            24 min ・ Animation, Action & Adventure, Sci-Fi & Fantasy
          </Typography>

          <Typography sx={{ mt: 2, maxWidth: 680, opacity: 0.95 }}>
            Naruto Uzumaki, a mischievous adolescent ninja, struggles as he
            searches for recognition and dreams of becoming the Hokage, the
            village’s leader and strongest ninja.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              sx={{
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid #000",  // 黑色边框
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #000", // hover 时保持黑框
                  },
              }}
            >
              View Trailer
            </Button>
            <Chip label="⭐ 8.4" color="warning" />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {["Netflix", "Hulu", "Crunchyroll", "Prime Video"].map((s) => (
              <Chip key={s} label={s} variant="outlined" color="default" sx={{color:"white"}} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
