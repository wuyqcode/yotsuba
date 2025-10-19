import React from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { useNavigate } from 'react-router';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const movies = Array.from({ length: 10 }, (_, i) => ({
  title: `Naruto Shippuden Movie #${i + 1}`,
  year: 2007 + i,
  img: 'https://image.tmdb.org/t/p/w500/vDkct38sSFSWJIATlfJw0l3QOIR.jpg',
  desc: `Demons that once almost destroyed the world are revived by someone. Naruto must protect Shion, the only one who can seal them.`,
}));

export default function MovieListPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Similar Movies
      </Typography>

      <Grid container spacing={2}>
        {movies.map((m, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2, xl:1.5 }}>
            <Box
              onClick={() => navigate(`/detail`)}
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '2 / 3',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
                },
                '&:hover .overlay': { opacity: 1 },
                '&:hover img': {
                  transform: 'scale(1.05)',
                  filter: 'brightness(60%)',
                },
              }}>
              {/* 封面 */}
              <Box
                component="img"
                src={m.img}
                alt={m.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'all 0.4s ease',
                }}
              />

              {/* 标题 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  color: 'white',
                  p: 1.2,
                }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ lineHeight: 1.2 }}>
                  {m.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {m.year}
                </Typography>
              </Box>

              {/* 悬浮层 */}
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                  p: 2,
                }}>
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    mb: 2,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                  {m.desc}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.4)' },
                    }}>
                    <FavoriteBorderIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}