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
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router";

interface HeroWithRatingTopProps {
  id?: string;
}

export default function HeroWithRatingTop({ id }: HeroWithRatingTopProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        overflow: "hidden",
        "--backdrop-filter": "blur(4px) grayscale(80%)",
        "--backdrop-mix-blend-mode": "multiply",
        px: { xs: 2, md: 6 },
        pt: { xs: 3, md: 3 },
        pb: { xs: 4, md: 6 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      } as React.CSSProperties}
    >
      <IconButton
        onClick={() => navigate(`/note/media/${id}/edit`)}
        sx={{
          position: "absolute",
          top: 16,
          right: 24,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.15)",
          color: "#fff",
          backdropFilter: "blur(4px)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.3)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <EditIcon />
      </IconButton>

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

      <Box
        sx={{
          position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
            gap: { xs: 3, md: 4 },
            color: "white",
             maxWidth: "1100px",
             padding: { xs: "0 40px", md: "0 80px" },
        }}
      >

        <Box sx={{ flex: "0 0 260px" }}>
          <CardMedia
            component="img"
            image="https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg"
            alt="poster"
            sx={{ width: 260, borderRadius: 2, boxShadow: 3 }}
          />
        </Box>

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
                  border: "1px solid #000",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #000",
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
