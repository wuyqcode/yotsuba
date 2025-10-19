import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  List,
  Stack,
  IconButton,
  Rating,
  ListItem,
  Divider,
} from "@mui/material";
import HeroWithRatingTop from "Frontend/components/HeroWithRatingTop";
import ScrollSection from "Frontend/components/ScrollSection";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export default function TvShowPage() {
  const [season, setSeason] = useState(1);

  const cast = Array(10).fill({
   name: "Junko Takeuchi",
   role: "Naruto Uzumaki (voice)",
   img: "https://image.tmdb.org/t/p/w500/3uZUfYhNI3ZPh4cwLNDtDAQbuR.jpg",
  });


  const similar = Array(10).fill({
    title: "ONIMAI!",
    img: "https://image.tmdb.org/t/p/w500/3uZUfYhNI3ZPh4cwLNDtDAQbuR.jpg",
  });


  const seasons = [
    { name: "Specials", year: 2002, episodes: 2 },
    { name: "Season 1", year: 2002, episodes: 52 },
    { name: "Season 2", year: "TBD", episodes: 52 },
    { name: "Season 3", year: "TBD", episodes: 54 },
    { name: "Season 4", year: "TBD", episodes: 62 },
  ];

  const episodes = [
    {
      id: 1,
      title: "Enter: Naruto Uzumaki!",
      runtime: "24 min",
      rating: 7.1,
      desc: "Welcome to the Village Hidden in the Leaves, where deadly serious Ninja roam the landscape and the seriously mischievous Naruto Uzumaki causes trouble everywhere he goes.",
      img: "https://www.themoviedb.org/t/p/w227_and_h127_bestv2/7xOP0rKDniTZKEaRM7seKfY9SG8.jpg",
    },
    {
      id: 2,
      title: "My Name is Konohamaru!",
      runtime: "24 min",
      rating: 6.6,
      desc: "Naruto finally graduates from the Ninja Academy and claims to know it all. He teaches Konohamaru the hormonally lethal 'Sexy Jutsu'!",
      img: "https://www.themoviedb.org/t/p/w227_and_h127_bestv2/rf92mvS6qERp44wplipu4sZUWXZ.jpg",
    },
    {
      id: 3,
      title: "Sasuke and Sakura: Friends or Foes?",
      runtime: "24 min",
      rating: 7.3,
      desc: "On the way to becoming a ninja, Naruto must team up with his classmates, the pretty Sakura and the pretty serious Sasuke.",
      img: "https://www.themoviedb.org/t/p/w227_and_h127_bestv2/q0L7lP9o3Tt9tkP7HxZctkP5XgC.jpg",
    },
  ];

  // ======= 页面布局 =======
  return (
    <Container maxWidth="lg" sx={{ pb: 8 }}>
      <HeroWithRatingTop />

      {/* 评分区（紧贴上半部分底部，置中） */}
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            textAlign: "center",
            mt: 1,
            mb: 1,
          }}
        >
          <Rating
            name="rating"
            max={10}
            size="large"
            sx={{
              mt: 1.5,
              fontSize: "2.4rem",
              "& .MuiRating-iconFilled": {
                color: "#FFD700", // 金色星星
              },
              "& .MuiRating-iconHover": {
                color: "#FFB400",
              },
              "& .MuiRating-iconEmpty": {
                color: "#e0e0e0",
              },
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          {[
            <CalendarTodayIcon />,
            <WatchLaterIcon />,
            <PlaylistAddCheckIcon />,
            <MusicNoteIcon />,
          ].map((icon, i) => (
            <IconButton
              key={i}
              sx={{
                backgroundColor: "#fff",
                color: "black",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#f0f6ff",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                },
                "& svg": {
                  fontSize: 26, // 图标大小
                },
              }}
            >
              {icon}
            </IconButton>
          ))}
        </Stack>
      </Box>

      {/* === Cast === */}
      <ScrollSection
        title="Cast"
        items={cast}
        renderItem={(c) => (
          <Card sx={{ width: 140, borderRadius: 3, boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <CardMedia component="img" image={c.img} alt={c.name} sx={{ height: 200, objectFit: "cover" }} />
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">{c.name}</Typography>
              <Typography variant="caption" color="text.secondary">{c.role}</Typography>
            </CardContent>
          </Card>
        )}
      />


      {/* === Similar === */}
      <ScrollSection
        title="Similar"
        items={similar}
        renderItem={(s) => (
          <Card sx={{ width: 150, borderRadius: 3, boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
            <CardMedia component="img" image={s.img} alt={s.title} />
          </Card>
        )}
      />

      {/* === Seasons & Episodes === */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mt: 5,
        }}
      >
        {/* 左侧 Season 列表 */}
        <Box sx={{ flex: "0 0 220px" }}>
          <List>
            {seasons.map((s, idx) => (
              <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                <Button
                  fullWidth
                  variant={season === idx ? "contained" : "outlined"}
                  onClick={() => setSeason(idx)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid #000",  // 黑色边框
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #000", // hover 时保持黑框
                    },
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold">{s.name}</Typography>
                    <Typography variant="caption">
                      {s.episodes} Episodes ・ {s.year}
                    </Typography>
                  </Box>
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 右侧 Episodes */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Season 1
          </Typography>
          <Divider sx={{ my: 2 }} />
          {episodes.map((e) => (
            <Box
              key={e.id}
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "white",
              }}
            >
              <CardMedia
                component="img"
                image={e.img}
                alt={e.title}
                sx={{ width: 180, height: 100, borderRadius: 2 }}
              />
              <Box>
                <Typography fontWeight="bold">
                  {e.id}. {e.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {e.runtime} ・ ⭐ {e.rating}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {e.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
