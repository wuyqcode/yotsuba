import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, Divider, Paper, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import { useWikiNoteStore } from '../../hooks/useWikiNoteStore';
import CommentDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CommentDto';
import { NoteCommentEndpoint } from 'Frontend/generated/endpoints';

function timeAgo(input: string | null | undefined) {
  if (!input) return 'just now';
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) return 'just now';
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return 'just now';
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min} minutes ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hours ago`;
    const day = Math.floor(hr / 24);
    return `${day} days ago`;
  } catch {
    return 'just now';
  }
}

export default function NoteComment() {
  const wiki = useWikiNoteStore((s) => s.wiki);
  const noteId = wiki?.id;
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadComments();
    }
  }, [noteId]);

  const loadComments = async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const result = await NoteCommentEndpoint.getComments(noteId);
      setComments(result);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const add = async () => {
    if (!input.trim() || !noteId || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await NoteCommentEndpoint.addComment(noteId, input.trim());
      setComments((prev) => [...prev, newComment]);
      setInput('');
    } catch (error) {
      console.error('添加评论失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        mt: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        comments.map((c) => (
          <Stack key={c.id} direction="row" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ width: 36, height: 36 }}>{c.user?.charAt(0).toUpperCase() || 'U'}</Avatar>

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                background: '#f6f8fa',
                border: '1px solid #d0d7de',
                borderBottom: 'none',
                px: 2,
                py: 1,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0969da' }}>
                {c.user || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                {timeAgo(c.createdAt)}
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: '1px solid #d0d7de',
                borderTop: 'none',
                borderBottomLeftRadius: 6,
                borderBottomRightRadius: 6,
                p: 2,
                background: '#fff',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                },
              }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}>
                {c.content}
              </Typography>
            </Paper>
          </Box>
        </Stack>
        ))
      )}

      <Divider sx={{ my: 2 }} />

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #d0d7de',
          p: 2,
          borderRadius: 2,
          background: '#fff',
          mb: 16,
        }}>
        <TextField
          fullWidth
          placeholder="Leave a comment"
          multiline
          minRows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              background: '#2da44e',
              '&:hover': { background: '#2c974b' },
              borderRadius: 2,
            }}
            onClick={add}
            disabled={submitting || !input.trim()}>
            {submitting ? <CircularProgress size={16} /> : 'Comment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}