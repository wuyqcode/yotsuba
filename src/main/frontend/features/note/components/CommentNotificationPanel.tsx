import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useEffect, useRef } from 'react';
import { useCommentNotificationStore } from 'Frontend/features/note/hooks/useCommentNotificationStore';
import { useNavigate } from 'react-router';
import { NoteCommentEndpoint } from 'Frontend/generated/endpoints';
import CommentDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/dto/CommentDto';
import { ActionOnLostSubscription } from '@vaadin/hilla-frontend';

interface Props {
  open: boolean;
  onClose: () => void;
}

function CommentItem({ user, content, time, read, onClick }: any) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 1.2,
        mb: 2,
        cursor: 'pointer',
        alignItems: 'flex-start',
        opacity: read ? 0.45 : 1,
        transition: '0.2s',
        '&:hover': { opacity: 0.75 },
      }}>

      {!read && (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#1e88e5',
            mt: '6px',
            flexShrink: 0,
          }}
        />
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {user}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'text.primary',
          }}>
          {content}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 0.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {time}
        </Typography>

        <Divider sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
}

export default function CommentNotificationPanel({ open, onClose }: Props) {
  const comments = useCommentNotificationStore((s) => s.comments);
  const markRead = useCommentNotificationStore((s) => s.markRead);
  const navigate = useNavigate();
  const fetchRecentComments = useCommentNotificationStore((s) => s.fetchRecentComments);

  // 初始化并订阅新评论通知
  useEffect(() => {
    // 首次加载评论列表
    fetchRecentComments();

    // 订阅新评论通知
    const onCommentReceived = (comment: CommentDto) => {
      // 收到新评论时刷新列表
      fetchRecentComments();
    };

    const subscription = NoteCommentEndpoint.subscribeToComments()
      .onNext(onCommentReceived)
      .onSubscriptionLost(() => ActionOnLostSubscription.RESUBSCRIBE);

    return () => subscription.cancel();
  }, [fetchRecentComments]);

  const ref = useRef<HTMLDivElement>(null);

  /* ⭐ 点击面板外关闭 */
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: 50,
        right: 10,
        width: 320,
        maxHeight: 380,
        overflowY: 'auto',
        borderRadius: '22px',
        p: 2,
        zIndex: 3000,

        /* 🍎 iOS 控制中心雾面风格 */
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: `
          0 8px 24px rgba(0,0,0,0.18),
          0 1px 3px rgba(0,0,0,0.12)
        `,
        border: '1px solid rgba(255,255,255,0.40)',

        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '22px',
          background: 'rgba(255,255,255,0.18)',
          pointerEvents: 'none',
        },

        /* ⚡ CSS 动画 */
        opacity: 0,
        transform: 'translateY(-6px)',
        animation: 'iosCardIn 0.28s ease-out forwards',

        '@keyframes iosCardIn': {
          '0%': { opacity: 0, transform: 'translateY(-6px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      }}>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        最新评论
      </Typography>

      <Divider sx={{ mb: 1 }} />

      {comments.map((c) => (
        <CommentItem
          key={c.id}
          user={c.user}
          content={c.content}
          time={c.createdAt}
          read={c.read}
          onClick={() => {
            markRead(c.id!);
            onClose();
            navigate(`/note/WIKI/${c.noteId}?mode=comment`);
          }}
        />
      ))}

      <Box
        onClick={onClose}
        sx={{
          textAlign: 'center',
          py: 1,
          cursor: 'pointer',
          color: 'primary.main',
          fontSize: '0.8rem',
        }}>
        关闭
      </Box>
    </Box>
  );
}
